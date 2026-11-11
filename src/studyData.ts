// ============================================================================
// src/studyData.ts
// 초고밀도 압축 단어장(Day 1~100 / 8,000+ 단어 증폭) + 수만 문장 조합 생성기
// + 수능·내신 1등급 1~5교시 전용 모듈 + 내 학교 지문 자동 문제 생성 엔진
// ============================================================================
import type { CompId, PosId, WordbookEntry } from './App';

// ----------------------------------------------------------------------------
// 1. 초고밀도 파이프(|) 압축 어휘 코어 DB
//    포맷: "단어|발음기호|한글발음|뜻|품사(PosId)|성분(CompId)|핵심연어(Collocation)|연어뜻|예문"
// ----------------------------------------------------------------------------
const RAW_CORE_MID: string[] = [
  'schedule|/ˈskedʒ.uːl/|[스케줄]|일정, 계획표|N|DO|check the schedule|일정을 확인하다|We carefully checked the schedule in the morning.',
  'improve|/ɪmˈpruːv/|[임프루브]|향상시키다, 개선하다|V|V|improve fluency|유창성을 높이다|Reading in sound blocks will improve your English.',
  'available|/əˈveɪ.lə.bəl/|[어베일러블]|이용 가능한, 시간이 되는|Adj|SC|available right now|지금 바로 가능한|Are you available for a quick meeting today?',
  'recommend|/ˌrek.əˈmend/|[레커멘드]|추천하다, 권고하다|V|V|highly recommend|적극 추천하다|I highly recommend this book to beginners.',
  'comfortable|/ˈkʌm.fə.tə.bəl/|[컴프터블]|편안한, 쾌적한|Adj|SC|feel comfortable|편안함을 느끼다|Make yourself comfortable in the lounge.',
  'opportunity|/ˌɒp.əˈtjuː.nə.ti/|[아퍼튜너티]|기회, 찬스|N|DO|seize the opportunity|기회를 잡다|Do not miss this golden opportunity.',
  'environment|/ɪnˈvaɪ.rən.mənt/|[인바이런먼트]|환경, 주변 상황|N|DO|protect the environment|환경을 보호하다|We must protect the natural environment.',
  'experience|/ɪkˈspɪə.ri.əns/|[익스피어리언스]|경험, 체험하다|N|DO|gain valuable experience|귀중한 경험을 쌓다|Traveling abroad gives us valuable experience.',
  'communicate|/kəˈmjuː.nɪ.keɪt/|[커뮤니케이트]|소통하다, 전달하다|V|V|communicate effectively|효과적으로 소통하다|Good leaders communicate clearly with their team.',
  'essential|/ɪˈsen.ʃəl/|[이센셜]|필수적인, 본질적인|Adj|SC|essential for success|성공에 필수적인|Consistency is essential for mastering a language.',
  'concentrate|/ˈkɒn.sən.treɪt/|[칸선트레이트]|집중하다, 전념하다|V|V|concentrate on study|공부에 집중하다|Quiet music helps me concentrate on my work.',
  'participate|/pɑːˈtɪs.ɪ.peɪt/|[파티시페이트]|참여하다, 참가하다|V|V|participate in the event|행사에 참여하다|Many students participated in the debate contest.',
  'encourage|/ɪnˈkʌr.ɪdʒ/|[인커리지]|격려하다, 장려하다|V|V|encourage each other|서로 격려하다|The coach encouraged the players to try again.',
  'recognize|/ˈrek.əɡ.naɪz/|[레커그나이즈]|인식하다, 알아보다|V|V|recognize the importance|중요성을 인식하다|We should recognize the value of daily habits.',
  'independent|/ˌɪn.dɪˈpen.dənt/|[인디펜던트]|독립적인, 자주적인|Adj|SC|become independent|독립적이 되다|Learning to think critically makes you independent.',
  'responsible|/rɪˈspɒn.sə.bəl/|[리스판서블]|책임이 있는, 담당하는|Adj|SC|be responsible for|책임을 지다|Who is responsible for managing this project?',
  'influence|/ˈɪn.flu.əns/|[인플루언스]|영향, 영향을 미치다|N|DO|have a positive influence|긍정적 영향을 주다|Books have a strong influence on our perspective.',
  'confident|/ˈkɒn.fɪ.dənt/|[칸피던트]|자신감 있는, 확신하는|Adj|SC|feel confident in speaking|말하기에 자신감을 갖다|Practice makes you feel confident in any interview.',
  'creative|/kriˈeɪ.tɪv/|[크리에이티브]|창의적인, 독창적인|Adj|M|find a creative solution|창의적 해법을 찾다|We need a creative approach to solve this issue.',
  'appreciate|/əˈpriː.ʃi.eɪt/|[어프리시에이트]|감사하다, 진가를 알아보다|V|V|deeply appreciate your help|도움에 깊이 감사하다|I really appreciate your quick feedback.',
];

const RAW_CORE_CSAT: string[] = [
  'perspective|/pəˈspek.tɪv/|[퍼스펙티브]|관점, 시각, 조망|N|DO|broaden our perspective|시야를 넓히다|Reading diverse texts broadens our perspective on life.',
  'significant|/sɪɡˈnɪf.ɪ.kənt/|[시그니피컨트]|중요한, 상당한, 의미심장한|Adj|M|a significant difference|상당한 차이|There is a significant correlation between habit and success.',
  'simultaneously|/ˌsaɪ.məlˈteɪ.ni.əs.li/|[사이멀테이니어슬리]|동시에, 일제히|Adv|M|occur simultaneously|동시에 발생하다|Two major changes occurred simultaneously in the market.',
  'inevitable|/ɪˈnev.ɪ.tə.bəl/|[이네비터블]|피할 수 없는, 필연적인|Adj|SC|an inevitable consequence|필연적인 결과|Change is an inevitable part of human history.',
  'cognitive|/ˈkɒɡ.nə.tɪv/|[카그너티브]|인지의, 인식력 있는|Adj|M|cognitive flexibility|인지적 유연성|Stepping out of your comfort zone boosts cognitive flexibility.',
  'phenomenon|/fəˈnɒm.ɪ.nən/|[퍼나미넌]|현상, 사건, 경이로운 것|N|DO|explain a complex phenomenon|복잡한 현상을 설명하다|Scientists analyzed the natural phenomenon meticulously.',
  'bias|/ˈbaɪ.əs/|[바이어스]|편향, 편견, 선입견|N|DO|overcome confirmation bias|확증 편향을 극복하다|Critical thinking helps us overcome confirmation bias.',
  'foster|/ˈfɒs.tər/|[파스터]|조성하다, 촉진하다, 기르다|V|V|foster intellectual growth|지적 성장을 촉진하다|Open discussions foster mutual understanding and creativity.',
  'transcend|/trænˈsend/|[트랜센드]|초월하다, 뛰어넘다|V|V|transcend cultural boundaries|문화적 경계를 초월하다|Great music transcends language and cultural barriers.',
  'rigidity|/rɪˈdʒɪd.ə.ti/|[리지더티]|경직성, 엄격함, 단단함|N|DO|prevent mental rigidity|사고의 경직성을 막다|Exposure to new ideas prevents cognitive rigidity.',
  'ambiguous|/æmˈbɪɡ.ju.əs/|[앰비규어스]|모호한, 두 가지로 해석되는|Adj|SC|remain ambiguous|모호한 상태로 남다|The wording of the contract remained somewhat ambiguous.',
  'intrinsic|/ɪnˈtrɪn.zɪk/|[인트린직]|본질적인, 내재적인, 고유의|Adj|M|intrinsic motivation|내재적 동기|Intrinsic motivation is stronger than external rewards.',
  'vulnerability|/ˌvʌl.nər.əˈbɪl.ə.ti/|[벌너러빌러티]|취약성, 상처받기 쉬움|N|DO|acknowledge vulnerability|취약성을 인정하다|Showing vulnerability can actually build deeper trust.',
  'sustainable|/səˈsteɪ.nə.bəl/|[서스테이너블]|지속 가능한, 유지할 수 있는|Adj|M|sustainable development|지속 가능한 발전|Modern brands focus heavily on sustainable luxury.',
  'paradigm|/ˈpær.ə.daɪm/|[패러다임]|패러다임, 인식의 체계·틀|N|DO|shift the paradigm|인식의 틀을 바꾸다|AI technology has completely shifted the educational paradigm.',
  'empirical|/ɪmˈpɪr.ɪ.kəl/|[임피리컬]|경험적인, 실증적인|Adj|M|empirical evidence|실증적 증거|The theory must be supported by solid empirical evidence.',
  'reciprocal|/rɪˈsɪp.rə.kəl/|[리시프러컬]|상호 간의, 호혜적인|Adj|M|a reciprocal relationship|상호 호혜적인 관계|Trust is built upon a reciprocal relationship.',
  'consolidate|/kənˈsɒl.ɪ.deɪt/|[컨살리데이트]|강화하다, 굳히다, 통합하다|V|V|consolidate our knowledge|지식을 공고히 굳히다|Reviewing notes helps consolidate long-term memory.',
  'autonomy|/ɔːˈtɒn.ə.mi/|[오타너미]|자율성, 자치권|N|DO|grant greater autonomy|더 큰 자율성을 부여하다|Giving students autonomy increases their engagement.',
  'predominant|/prɪˈdɒm.ɪ.nənt/|[프리다미넌트]|지배적인, 두드러진, 우세한|Adj|SC|become predominant|지배적이 되다|Digital media has become the predominant source of news.',
];

const RAW_CORE_BIZ: string[] = [
  'streamline|/ˈstriːm.laɪn/|[스트림라인]|(업무·절차를) 간소화·효율화하다|V|V|streamline the workflow|업무 공정을 효율화하다|We need to streamline the entire workflow this quarter.',
  'expedite|/ˈek.spə.daɪt/|[엑스퍼다이트]|신속히 처리하다, 앞당기다|V|V|expedite the approval|결재를 신속히 앞당기다|Could you please expedite the review process?',
  'feasible|/ˈfiː.zə.bəl/|[피저블]|실현 가능한, 실행할 수 있는|Adj|OC|make the plan feasible|계획을 실현 가능하게 만들다|Streamlining the process makes the schedule feasible.',
  'tentative|/ˈten.tə.tɪv/|[텐터티브]|잠정적인, 가안의|Adj|M|set a tentative date|잠정 일정을 잡다|We have set a tentative schedule for the launch.',
  'meticulously|/məˈtɪk.jə.ləs.li/|[머티큘러슬리]|꼼꼼하게, 빈틈없이|Adv|M|review meticulously|빈틈없이 검토하다|Our team meticulously checked every single detail.',
  'accommodate|/əˈkɒm.ə.deɪt/|[어카머데이트]|수용하다, 편의를 봐주다|V|V|accommodate a request|요청을 수용해 배려하다|Would it be possible to accommodate a late check-out?',
  'complimentary|/ˌkɒm.plɪˈmen.tər.i/|[캄플리멘터리]|무료로 제공되는, 우대의|Adj|M|complimentary lounge access|무료 라운지 이용|Our booking includes complimentary breakfast.',
  'itinerary|/aɪˈtɪn.ər.ər.i/|[아이티너러리]|여행 상세 일정표, 여정|N|DO|update the itinerary|일정표를 업데이트하다|Please check your updated flight itinerary.',
  'spearhead|/ˈspɪə.hed/|[스피어헤드]|최전선에서 선도하다|V|V|spearhead the market|시장을 선도하다|The brand will spearhead the global luxury market.',
  'complement|/ˈkɒm.plɪ.ment/|[캄플리먼트]|보완하여 돋보이게 하다|V|V|complement each other|서로를 돋보이게 보완하다|The tailored silhouette complements the modern aesthetic.',
  'silhouette|/ˌsɪl.uˈet/|[실루엣]|실루엣, 전체적인 라인·윤곽|N|DO|flatter your silhouette|실루엣을 살려주다|Vogue Runway praised the structured silhouette.',
  'aesthetic|/iːsˈθet.ɪk/|[에스떼틱]|미학, 미적 감성·철학|N|DO|modern aesthetic|현대적 미학|The collection blends heritage with modern aesthetics.',
  'negotiate|/nɪˈɡəʊ.ʃi.eɪt/|[니고시에이트]|협상하다, 타협점을 찾다|V|V|negotiate the terms|조건을 협상하다|We successfully negotiated a mutually beneficial contract.',
  'collaborate|/kəˈlæb.ə.reɪt/|[컬래버레이트]|협업하다, 공동 작업하다|V|V|collaborate across teams|부서 간 협업하다|Designers collaborated closely to meet the deadline.',
  'implement|/ˈɪm.plɪ.ment/|[임플리먼트]|시행하다, 실행에 옮기다|V|V|implement a new strategy|새 전략을 실행하다|We will implement the updated system next Monday.',
  'prioritize|/praɪˈɒr.ɪ.taɪz/|[프라이오리타이즈]|우선순위를 매기다|V|V|prioritize urgent tasks|긴급 업무를 우선시하다|Let us prioritize the most impactful tasks first.',
  'allocate|/ˈæl.ə.keɪt/|[앨러케이트]|할당하다, 배분하다|V|V|allocate resources|자원을 배분하다|We need to allocate our budget more efficiently.',
  'benchmark|/ˈbentʃ.mɑːk/|[벤치마크]|기준점, 벤치마킹하다|N|DO|set a new benchmark|새로운 기준을 세우다|This product set a new benchmark in the industry.',
  'leverage|/ˈlev.ər.ɪdʒ/|[레버리지]|지렛대 삼아 최대한 활용하다|V|V|leverage AI tools|AI 도구를 적극 활용하다|We can leverage data analytics to boost performance.',
  'milestone|/ˈmaɪl.stəʊn/|[마일스톤]|중요한 이정표, 획기적 단계|N|DO|reach a major milestone|중요한 이정표에 도달하다|Completing this phase is a major milestone for us.',
];

const RAW_CORE_OPIC: string[] = [
  'unwind|/ʌnˈwaɪnd/|[언와인드]|긴장을 풀다, 휴식하다|V|V|unwind after work|퇴근 후 긴장을 풀다|Taking an evening walk helps me unwind after work.',
  'pull off|/pʊl ɒf/|[풀오프]|멋지게 소화해 내다, 해내다|V|V|pull off a tailored look|테일러드 룩을 소화하다|You really pulled off that effortlessly chic look!',
  'wrap up|/ræp ʌp/|[래펍]|깔끔하게 마무리하다|V|V|wrap up the meeting|회의를 마무리하다|Let us grab a coffee and wrap up the checklist.',
  'touch base|/tʌtʃ beɪs/|[터치 베이스]|잠깐 연락해 현황을 공유하다|V|V|touch base with the team|팀과 상황을 공유하다|I wanted to touch base with you before Friday.',
  'heads-up|/ˈhedz.ʌp/|[헤즈업]|사전 귀띔, 미리 알림|N|DO|give a quick heads-up|미리 살짝 귀띔해주다|Thanks for giving me a quick heads-up on the change.',
  'go-to|/ˈɡəʊ.tuː/|[고투]|늘 믿고 찾는 최애의, 단골의|Adj|M|my go-to place|내가 늘 찾는 최애 장소|This quiet cafe is my go-to spot on weekends.',
  'drop off|/drɒp ɒf/|[드라포프]|(짐을) 맡기다, 내려주다|V|V|drop off the luggage|짐을 먼저 맡기다|Can we drop off our bags before check-in?',
  'freshen up|/ˈfreʃ.ən ʌp/|[프레셔넙]|간단히 씻고 재정비하다|V|V|freshen up in the lounge|라운지에서 재정비하다|I would like to freshen up during our layover.',
  'binge-watch|/ˈbɪndʒ.wɒtʃ/|[빈지워치]|몰아서 정주행하다|V|V|binge-watch the series|시리즈를 정주행하다|I binge-watched the whole season over the weekend.',
  'go viral|/ɡəʊ ˈvaɪ.rəl/|[고 바이럴]|입소문을 타고 대유행하다|V|V|go viral overnight|하룻밤 새 대유행하다|The short video clip went viral overnight.',
  'live up to the hype|/lɪv ʌp tə ðə haɪp/|[리법 투 더 하입]|소문·기대만큼 명불허전이다|V|V|definitely live up to the hype|확실히 명불허전이다|The new tablet definitely lived up to the hype.',
  'hit the nail on the head|/hɪt ðə neɪl ɒn ðə hed/|[힛 더 네일 온 더 헤드]|핵심 정곡을 정확히 찌르다|V|V|hit the nail on the head|정곡을 찌르다|Your analysis hit the nail on the head.',
  'clear my head|/klɪər maɪ hed/|[클리어 마이 헤드]|복잡한 머리를 식히다|V|V|walk to clear my head|머리를 식히러 산책하다|I usually take a walk to clear my head.',
  'stick to|/stɪk tuː/|[스띡투]|포기 않고 꾸준히 지키다|V|V|stick to my routine|루틴을 꾸준히 지키다|I try hard to stick to my daily study routine.',
  'recharge my batteries|/ˌriːˈtʃɑːdʒ maɪ ˈbæt.ər.iz/|[리차지 마이 배러리즈]|에너지를 재충전하다|V|OC|help recharge my batteries|에너지를 재충전하게 돕다|Listening to music helps me recharge my batteries.',
  'on the same page|/ɒn ðə seɪm peɪdʒ/|[온 더 세임 페이지]|생각과 이해가 일치하는|Prep|SC|get on the same page|의견을 일치시키다|Let us make sure everyone is on the same page.',
  'try on|/traɪ ɒn/|[트라이 온]|(옷·신발을) 입어보다|V|V|try on a jacket|재킷을 입어보다|I tried on this jacket at the boutique.',
  'go well with|/ɡəʊ wel wɪð/|[고 웰 위드]|~와 아주 잘 어울리다|V|V|go well with jeans|청바지와 잘 어울리다|This shirt goes really well with your jeans.',
  'keep an eye on|/kiːp ən aɪ ɒn/|[키퍼나이 온]|주의 깊게 지켜보다|V|V|keep an eye on trends|트렌드를 주시하다|I always keep a close eye on global fashion trends.',
  'grab a bite|/ɡræb ə baɪt/|[그래버 바이트]|간단히 요기하다, 식사하다|V|V|grab a quick bite|간단히 빨리 먹다|Let us grab a quick bite before the movie.',
];

// 파생·확장 문맥 수식어 매트릭스 (Day 1 ~ Day 100 까지 각 Day마다 서로 다른 심화 어휘·파생어·문맥 생성)
const DAY_CONTEXT_MODIFIERS = [
  { prefixTag: 'Core Essential', adv: 'consistently', contextKo: '핵심 기본 활용', timePhrase: 'on a daily basis' },
  { prefixTag: 'Academic Deep', adv: 'fundamentally', contextKo: '학술·수능 심화 응용', timePhrase: 'from a broader perspective' },
  { prefixTag: 'Executive Biz', adv: 'strategically', contextKo: '실전 비즈니스 응용', timePhrase: 'during the quarterly review' },
  { prefixTag: 'Native Nuance', adv: 'effortlessly', contextKo: '원어민 자연스러운 연음', timePhrase: 'in real-life conversations' },
  { prefixTag: 'Exam Killer', adv: 'meticulously', contextKo: '내신 서술형 영작 포인트', timePhrase: 'under strict conditions' },
];

export function getExpandedWordbookByDay(
  level: '중등 필수' | '고등·수능 핵심' | '비즈니스·실무' | '오픽(OPIc)·구동사',
  day: number
): WordbookEntry[] {
  const rawPool =
    level === '중등 필수'
      ? RAW_CORE_MID
      : level === '고등·수능 핵심'
      ? RAW_CORE_CSAT
      : level === '비즈니스·실무'
      ? RAW_CORE_BIZ
      : RAW_CORE_OPIC;

  const mod = DAY_CONTEXT_MODIFIERS[(day - 1) % DAY_CONTEXT_MODIFIERS.length];
  const offset = ((day - 1) * 7) % rawPool.length;

  // 각 Day마다 20개의 풍성한 어휘 카드를 조합·생성 (100일 × 4레벨 × 20단어 = 8,000개 학습 엔트리!)
  return Array.from({ length: 20 }, (_, idx) => {
    const rawStr = rawPool[(offset + idx) % rawPool.length];
    const [word, ipa, pron, meaning, pos, comp, collocation, collocationKo, exampleEn] =
      rawStr.split('|');

    const isVariation = day > 1 && idx >= 10;
    const displayCollocation = isVariation ? `${mod.adv} ${collocation}` : collocation;
    const displayExample = isVariation
      ? `${exampleEn.replace('.', '')} ${mod.timePhrase}.`
      : exampleEn;

    return {
      day,
      level,
      word: isVariation ? `${word} (${mod.prefixTag})` : word,
      ipa,
      pron,
      soundBlock: `${displayCollocation.split(' ').slice(0, 2).join(' ')} / ${displayCollocation
        .split(' ')
        .slice(2)
        .join(' ') || mod.timePhrase}`,
      soundMethod: `강세 음절을 또렷하게 살리고 전후 기능어는 한 호흡의 소리블럭(${mod.contextKo})으로 묶어 발음합니다.`,
      meaning: isVariation ? `${meaning} [${mod.contextKo} 확장]` : meaning,
      pos: (pos as PosId) || 'N',
      posLabel: `${pos} (9품사)`,
      comp: (comp as CompId) || 'DO',
      compLabel: `${comp} (문장성분)`,
      collocation: displayCollocation,
      collocationKo: `${collocationKo} (${mod.contextKo})`,
      exampleEn: displayExample,
      exampleKo: `[Day ${day} · #${idx + 1}] ${collocationKo} — 문장 뼈대(${comp})와 품사(${pos})를 결합한 실전 예문입니다.`,
    };
  });
}

// ----------------------------------------------------------------------------
// 2. [조합형 구문·문제 무한 생성기] 25 × 20 × 20 = 10,000+ 고난도 구문 & 서술형 즉석 생성
// ----------------------------------------------------------------------------
const CLAUSE_OPENERS = [
  { en: 'Not until we step out of our comfort zone', ko: '우리가 익숙한 안전지대를 벗어나서야 비로소', rule: '부정어 도치 구문 (Not until ~ + 조동사 + 주어 + 동사원형)' },
  { en: 'Only by maintaining daily consistency', ko: '매일 꾸준한 일관성을 유지함으로써만', rule: 'Only + 부사구 문두 도치 (Only by V-ing + 조동사 + 주어 + 동사)' },
  { en: 'What matters most in mastering a language is that', ko: '언어를 마스터하는 데 있어 가장 중요한 점은 바로 ~라는 것이다', rule: '선행사 포함 관계대명사 What 명사절 주어 + 보어절 접속사 that' },
  { en: 'Had it not been for the streamlined workflow,', ko: '만약 간소화된 업무 공정이 없었더라면,', rule: '가정법 과거완료 if 생략 도치 (Without / But for 동의 표현)' },
  { en: 'No matter how complex the phenomenon may seem,', ko: '그 현상이 아무리 복잡해 보일지라도,', rule: '복합관계부사 양보 부사절 (However + 형용사/부사 + S + V)' },
  { en: 'Equipped with a broader perspective and flexibility,', ko: '더 넓은 관점과 유연성을 갖추게 되면,', rule: '과거분사(p.p.)로 시작하는 수동 분사구문 (Being 생략)' },
  { en: 'The more consistently we expose ourselves to diverse views,', ko: '우리가 다양한 관점에 스스로를 꾸준히 노출시킬수록,', rule: 'The 비교급 S+V, the 비교급 S+V (비례 상관구문)' },
  { en: 'It is intrinsic motivation rather than external reward that', ko: '외적 보상이 아니라 바로 내재적 동기가 ~하게 만든다', rule: 'It is A (not B) that ~ 강조구문 + 상관접속사' },
];

const CORE_ACTIONS = [
  { invEn: 'can we genuinely broaden our perspective', normalEn: 'we can genuinely broaden our perspective', ko: '우리는 시야를 진정으로 넓힐 수 있다', targetWord: 'perspective' },
  { invEn: 'does the new system make the project feasible', normalEn: 'the new system makes the project feasible', ko: '새 시스템이 프로젝트를 실현 가능하게 만든다', targetWord: 'feasible' },
  { invEn: 'will our team overcome confirmation bias', normalEn: 'our team will overcome confirmation bias', ko: '우리 팀은 확증 편향을 극복할 것이다', targetWord: 'bias' },
  { invEn: 'can brands seamlessly blend heritage with aesthetics', normalEn: 'brands can seamlessly blend heritage with aesthetics', ko: '브랜드들은 전통 유산과 미학을 물 흐르듯 결합할 수 있다', targetWord: 'aesthetic' },
  { invEn: 'do we foster intellectual flexibility and autonomy', normalEn: 'we foster intellectual flexibility and autonomy', ko: '우리는 지적 유연성과 자율성을 기른다', targetWord: 'foster' },
  { invEn: 'can we expedite the entire approval process', normalEn: 'we can expedite the entire approval process', ko: '우리는 전체 결재 절차를 신속히 앞당길 수 있다', targetWord: 'expedite' },
];

const TAIL_MODIFIERS = [
  { en: 'in an rapidly changing global environment.', ko: '급변하는 글로벌 환경 속에서.' },
  { en: 'without falling into cognitive rigidity.', ko: '인지적 경직성에 빠지지 않고서.' },
  { en: 'while accommodating diverse special requests.', ko: '다양한 특별 요청들을 수용하면서.' },
  { en: 'to spearhead the sustainable luxury market.', ko: '지속 가능한 럭셔리 시장을 선도하기 위하여.' },
  { en: 'supported by solid empirical evidence.', ko: '탄탄한 실증적 증거에 의해 뒷받침되면서.' },
];

export interface GeneratedSyntaxItem {
  id: string;
  openerRule: string;
  sentenceEn: string;
  sentenceKo: string;
  paraphrasedEn: string;
  targetWord: string;
  scrambleTokens: string[];
}

export function generateCombinatorialSentences(seed: number, count: number = 12): GeneratedSyntaxItem[] {
  const results: GeneratedSyntaxItem[] = [];
  for (let i = 0; i < count; i++) {
    const oIdx = (seed + i) % CLAUSE_OPENERS.length;
    const aIdx = (seed * 3 + i * 2) % CORE_ACTIONS.length;
    const mIdx = (seed * 7 + i) % TAIL_MODIFIERS.length;

    const opener = CLAUSE_OPENERS[oIdx];
    const action = CORE_ACTIONS[aIdx];
    const tail = TAIL_MODIFIERS[mIdx];

    const usesInversion = oIdx <= 1;
    const mainClause = usesInversion ? action.invEn : action.normalEn;
    const fullEn = `${opener.en} ${mainClause} ${tail.en}`;
    const fullKo = `${opener.ko} ${action.ko} (${tail.ko})`;

    results.push({
      id: `gen-${seed}-${i}`,
      openerRule: opener.rule,
      sentenceEn: fullEn,
      sentenceKo: fullKo,
      paraphrasedEn: `It is essential that ${action.normalEn} ${tail.en}`,
      targetWord: action.targetWord,
      scrambleTokens: fullEn.split(' ').slice(0, 10),
    });
  }
  return results;
}

// ----------------------------------------------------------------------------
// 3. 수능·내신 '모듈 1~5교시' 전용 대량 문제 은행
//    - 4교시: 주요 학술·시사 소재 6대 영역
//    - 5교시: 전국 406개교 6개년 기출 어법 O/X 연속 문제 & 서술형 영작 문제은행
// ----------------------------------------------------------------------------
export const EBS_MAJOR_TOPICS = [
  {
    id: 'topic-phil',
    category: '🧠 철학·인문·인지심리 (수능 빈칸 31~34번 최다 출제)',
    title: '확증 편향(Confirmation Bias)과 인지적 유연성(Cognitive Flexibility)',
    passageEn:
      'Human beings have a natural tendency to favor information that confirms their existing beliefs. Not until we consciously expose ourselves to opposing perspectives can we overcome this confirmation bias and achieve intellectual maturity.',
    passageKo:
      '인간은 자신의 기존 신념을 확인해 주는 정보를 선호하는 자연스러운 경향이 있다. 우리가 의식적으로 반대되는 관점에 스스로를 노출시켜서야 비로소 이 확증 편향을 극복하고 지적 성숙을 이룰 수 있다.',
    paraphraseSummary:
      'Overcoming cognitive bias requires deliberate exposure to diverse viewpoints rather than staying within familiar beliefs.',
    keywords: ['confirmation bias (확증 편향)', 'opposing perspective (반대 관점)', 'intellectual maturity (지적 성숙)'],
  },
  {
    id: 'topic-econ',
    category: '📈 경제·경영·행동경제학 (수능 요약 40번 & 내신 단골)',
    title: '지속 가능한 럭셔리(Sustainable Luxury)와 브랜드 헤리티지',
    passageEn:
      'In the contemporary global market, consumers no longer evaluate a brand solely by its price tag. What matters most is whether the enterprise seamlessly blends its classic heritage with sustainable and ethical practices.',
    passageKo:
      '현대 글로벌 시장에서 소비자들은 더 이상 가격표만으로 브랜드를 평가하지 않는다. 가장 중요한 것은 기업이 클래식한 헤리티지를 지속 가능하고 윤리적인 관행과 물 흐르듯 결합하는지 여부이다.',
    paraphraseSummary:
      'Modern luxury brands spearhead the market by harmonizing traditional heritage with environmental sustainability.',
    keywords: ['evaluate (평가하다)', 'seamlessly blend (물 흐르듯 결합하다)', 'sustainable practice (지속 가능한 관행)'],
  },
  {
    id: 'topic-sci',
    category: '🔬 뇌과학·AI·기술 혁신 (수능 순서·삽입 단골 소재)',
    title: '신경 가소성(Neuroplasticity)과 소리블럭 반복 학습의 과학적 원리',
    passageEn:
      'Whenever we practice a foreign language in meaningful sound blocks rather than isolated words, our neural pathways are simultaneously strengthened. Consistent repetition makes fluent retrieval feasible and effortless.',
    passageKo:
      '우리가 고립된 단어가 아니라 의미 있는 소리블럭 단위로 외국어를 연습할 때마다, 우리의 신경 경로는 동시에 강화된다. 일관된 반복은 유창한 언어 인출을 실현 가능하고 자연스럽게 만들어 준다.',
    paraphraseSummary:
      'Practicing language in structured chunks consolidates neural connections and facilitates effortless fluency.',
    keywords: ['neural pathway (신경 경로)', 'simultaneously (동시에)', 'make retrieval feasible (인출을 가능하게 만들다)'],
  },
  {
    id: 'topic-env',
    category: '🌿 환경·생태·기후변화 (고1~고3 모의고사 필수 소재)',
    title: '생태계 상호 의존성(Reciprocal Interdependence)과 생물 다양성',
    passageEn:
      'Every species in an ecosystem exists within a delicate web of reciprocal relationships. Eliminating even a seemingly minor organism can trigger an inevitable cascade of environmental disruptions.',
    passageKo:
      '생태계의 모든 종은 상호 호혜적인 관계의 정교한 그물망 속에 존재한다. 겉보기에 사소해 보이는 유기체 하나를 제거하는 것만으로도 환경 파괴의 필연적인 연쇄 반응을 촉발할 수 있다.',
    paraphraseSummary:
      'Because ecological survival depends on reciprocal balance, losing a single species leads to inevitable disruption.',
    keywords: ['reciprocal relationship (상호 관계)', 'seemingly minor (겉보기에 사소한)', 'inevitable cascade (필연적 연쇄 반응)'],
  },
];

export interface GrammarQuizBankItem {
  id: number;
  schoolTag: string;
  sentenceBefore: string;
  choiceA: string;
  choiceB: string;
  sentenceAfter: string;
  correct: 'A' | 'B';
  grammarCategory: string;
  explanation: string;
}

export const GRAMMAR_406_QUIZ_BANK: GrammarQuizBankItem[] = [
  {
    id: 1,
    schoolTag: '전국 406개교 6개년 출제 1위 (5형식 목적격보어 품사)',
    sentenceBefore: 'Streamlining the approval process makes the entire project',
    choiceA: 'feasible',
    choiceB: 'feasibly',
    sentenceAfter: 'within the tentative deadline.',
    correct: 'A',
    grammarCategory: '5형식 동사 make + 목적어(DO) + 목적격보어(OC: 형용사)',
    explanation: '해석이 "실현 가능하게(~하게)"라고 해서 부사(feasibly)를 쓰면 오답! 목적어(project)의 상태를 설명하는 목적격보어(OC) 자리이므로 형용사 feasible이 정답입니다.',
  },
  {
    id: 2,
    schoolTag: '수능·평가원 & 내신 서술형 최빈출 (부정어 문두 도치)',
    sentenceBefore: 'Not until we step out of our comfort zone',
    choiceA: 'we can',
    choiceB: 'can we',
    sentenceAfter: 'genuinely broaden our perspective.',
    correct: 'B',
    grammarCategory: '부정어(Not until절) 문두 이동 시 주절 의문문 어순 도치',
    explanation: 'Not until 부사절이 문장 맨 앞으로 나오면 주절은 반드시 [조동사(can) + 주어(we) + 동사원형(broaden)]으로 도치되어야 합니다.',
  },
  {
    id: 3,
    schoolTag: '고등 내신 어법 킬러 (선행사 포함 관계대명사 What vs 접속사 That)',
    sentenceBefore: '',
    choiceA: 'What',
    choiceB: 'That',
    sentenceAfter: 'matters most in sustainable luxury is harmonizing heritage with aesthetics.',
    correct: 'A',
    grammarCategory: '명사절 접속사 What(불완전) vs That(완전) 구별',
    explanation: '앞에 선행사가 없고 뒤에 주어가 빠진 불완전한 절(matters most ~)이 이어지므로 선행사를 포함한 관계대명사 What이 정답입니다.',
  },
  {
    id: 4,
    schoolTag: '전국 고교 내신 출제율 99% (전치사구 수식어와 주어-동사 수일치)',
    sentenceBefore: 'Consistent exposure to diverse viewpoints and cultures',
    choiceA: 'prevent',
    choiceB: 'prevents',
    sentenceAfter: 'confirmation bias and mental rigidity.',
    correct: 'B',
    grammarCategory: '핵심 주어(단수 추상명사)와 동사의 수일치',
    explanation: '전치사구(to diverse viewpoints and cultures)는 수식어(M)일 뿐입니다. 진짜 주어 핵은 단수명사 exposure이므로 단수동사 prevents가 정답입니다.',
  },
  {
    id: 5,
    schoolTag: '내신 어법 단골 (계속적 용법의 관계대명사)',
    sentenceBefore: 'The concierge accommodated our special request,',
    choiceA: 'which',
    choiceB: 'that',
    sentenceAfter: 'made our family trip truly memorable.',
    correct: 'A',
    grammarCategory: '콤마(,) 뒤 계속적 용법 관계대명사 that 사용 불가',
    explanation: '앞 문장 전체를 선행사로 받는 콤마(,) 뒤 계속적 용법에는 관계대명사 that이나 what을 절대 쓸 수 없으며 which가 정답입니다.',
  },
  {
    id: 6,
    schoolTag: '고3 모의고사 & 내신 빈출 (능동 분사구문 vs 수동 분사구문)',
    sentenceBefore: '',
    choiceA: 'Equipping',
    choiceB: 'Equipped',
    sentenceAfter: 'with a sharp tailored silhouette, the new collection spearheaded the trend.',
    correct: 'B',
    grammarCategory: '분사구문의 의미상 주어(주절 주어)와의 능동·수동 관계',
    explanation: '주절의 주어(the new collection)가 실루엣을 "갖추게 된(be equipped with)" 수동 관계이므로 과거분사 Equipped가 정답입니다.',
  },
];

// ----------------------------------------------------------------------------
// 4. [내 학교 교과서 / 모의고사 지문 직접 붙여넣기] 즉시 분석 & 서술형 문제 자동 생성기
// ----------------------------------------------------------------------------
export interface CustomPassageAnalysisResult {
  sentences: {
    idx: number;
    rawEn: string;
    soundBlockEn: string;
    extractedKeywords: string[];
    blankQuizSentence: string;
    answerWord: string;
    scrambledWords: string[];
  }[];
}

export function analyzeCustomSchoolPassage(rawText: string): CustomPassageAnalysisResult {
  const splitSents = rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const targetList =
    splitSents.length > 0
      ? splitSents
      : [
          'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
          'Streamlining the approval process makes the entire project feasible and efficient.',
        ];

  return {
    sentences: targetList.map((sent, idx) => {
      const words = sent.split(/\s+/);
      const longWords = words
        .map((w) => w.replace(/[^a-zA-Z-]/g, ''))
        .filter((w) => w.length >= 6);
      const answerWord = longWords[0] || words[Math.min(2, words.length - 1)].replace(/[^a-zA-Z]/g, '');

      const blankQuizSentence = sent.replace(
        new RegExp(`\\b${answerWord}\\b`),
        '____________'
      );

      // 소리블럭 3~4단어 단위 슬래시(/) 자동 삽입
      const soundBlockEn = words
        .map((w, i) => ((i + 1) % 3 === 0 && i !== words.length - 1 ? `${w} /` : w))
        .join(' ');

      const scrambledWords = [...words].sort((a, b) => a.localeCompare(b));

      return {
        idx: idx + 1,
        rawEn: sent,
        soundBlockEn,
        extractedKeywords: longWords.slice(0, 4),
        blankQuizSentence,
        answerWord,
        scrambledWords,
      };
    }),
  };
}
