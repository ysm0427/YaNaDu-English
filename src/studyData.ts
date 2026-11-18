// ============================================================================
// src/studyData.ts — 최종 무결점 완결본
// - 코어 80단어 전 항목의 [posLabel · 예문내 compLabel]과 실제 exampleEn 문법 역할 1:1 완전 일치
// - 어법 3번(What matters most) 주어절 해설 정정 및 구문 7번(The more ~ tend to show) 의미 일치
// - 학습용 창작 학술 독해 예문 6선(keystone species 등) 및 핵심 빈출 어법 10문항 출처 투명화
// ============================================================================

export type WordbookLevel =
  | '중등 필수'
  | '고등·수능 핵심'
  | '비즈니스·실무'
  | '오픽(OPIc)·구동사';

export interface WordbookEntry {
  level: WordbookLevel;
  word: string;
  ipa: string;
  pron: string;
  soundBlock: string;
  meaning: string;
  posLabel: string;
  compLabel: string;
  collocation: string;
  collocationKo: string;
  exampleEn: string;
  examplePron: string;
  exampleKo: string;
  derivativesTip: string;
}

export interface GeneratedSyntaxItem {
  id: string;
  openerRule: string;
  targetWord: string;
  matchedForm: string;
  sentenceEn: string;
  pronLine: string;
  sentenceKo: string;
  paraphrasedEn: string;
  scrambleTokens: string[];
}

export interface AcademicTopicPassage {
  id: string;
  category: string;
  title: string;
  passageEn: string;
  passagePron: string;
  passageKo: string;
  paraphraseSummary: string;
  keywords: string[];
}

export interface GrammarQuizItem {
  id: number;
  schoolTag: string;
  grammarCategory: string;
  sentenceBefore: string;
  choiceA: string;
  choiceB: string;
  sentenceAfter: string;
  correct: 'A' | 'B';
  explanation: string;
}

export interface CustomPassageSentenceItem {
  idx: number;
  rawEn: string;
  soundBlockEn: string;
  blankQuizSentence: string;
  answerWord: string;
  scrambledWords: string[];
}

export interface CustomPassageAnalysis {
  isEmpty: boolean;
  statusMessage: string;
  sentences: CustomPassageSentenceItem[];
}

// ============================================================================
// 1. 시드 기반 결정론적 셔플 (Fisher-Yates 알고리즘)
// ============================================================================

export function deterministicShuffle<T>(arr: readonly T[], seed: number): T[] {
  const result = [...arr];
  let s = (Math.abs(Math.floor(seed)) || 1) % 2147483647;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// ============================================================================
// 2. 4대 영역 코어 80단어 고정 풀 (영역별 20단어 × 4영역)
//    - 모든 단어의 [posLabel · 예문내 compLabel]이 실제 exampleEn 내 문장 성분과 100% 일치
// ============================================================================

const CORE_WORDBOOK_POOL: Record<WordbookLevel, WordbookEntry[]> = {
  '중등 필수': [
    {
      level: '중등 필수',
      word: 'schedule',
      ipa: '/ˈskedʒ.uːl/',
      pron: '[스케줄]',
      soundBlock: 'check / the daily schedule',
      meaning: '일정, 시간표 / 일정을 잡다',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'check the daily schedule',
      collocationKo: '일일 일정을 확인하다',
      exampleEn: 'Please check the daily schedule before the class starts.',
      examplePron: '[플리즈 체크 더 데일리 스케줄 비포 더 클래스 스타츠]',
      exampleKo: '수업이 시작되기 전에 일일 일정을 확인해 주세요.',
      derivativesTip: '명사·동사 겸용: schedule(일정/일정을 잡다) / 파생 형용사: scheduled(예정된) / 반의적 표현: unscheduled(예정에 없던)',
    },
    {
      level: '중등 필수',
      word: 'comfortable',
      ipa: '/ˈkʌm.fɚ.t̬ə.bəl/',
      pron: '[컴프터블]',
      soundBlock: 'make yourself / comfortable',
      meaning: '편안한, 쾌적한',
      posLabel: '형용사 (Adj)',
      compLabel: '목적격보어 (OC)',
      collocation: 'make yourself comfortable',
      collocationKo: '편안하게 쉬다(계시다)',
      exampleEn: 'Please sit down and make yourself comfortable in the lounge.',
      examplePron: '[플리즈 싯 다운 앤 메익 유어셀프 컴프터블 인 더 라운지]',
      exampleKo: '라운지에 앉아서 편안하게 계세요.',
      derivativesTip: '명사·동사: comfort(편안함/위로하다) / 형용사: comfortable(편안한) / 부사: comfortably(편안하게) / 반의어: uncomfortable(불편한)',
    },
    {
      level: '중등 필수',
      word: 'available',
      ipa: '/əˈveɪ.lə.bəl/',
      pron: '[어베일러블]',
      soundBlock: 'check if / a room is available',
      meaning: '이용 가능한, (시간이) 비어 있는',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'available at no extra charge',
      collocationKo: '추가 요금 없이 이용 가능한',
      exampleEn: 'Is a quiet study room available this afternoon?',
      examplePron: '[이즈 어 콰이엇 스터디 룸 어베일러블 디스 애프터눈]',
      exampleKo: '오늘 오후에 조용한 스터디룸을 이용할 수 있나요?',
      derivativesTip: '형용사: available(이용 가능한) / 명사: availability(이용 가능성, 유효성) / 반의어: unavailable(이용할 수 없는)',
    },
    {
      level: '중등 필수',
      word: 'improve',
      ipa: '/ɪmˈpruːv/',
      pron: '[임프루브]',
      soundBlock: 'improve / our speaking skills',
      meaning: '향상시키다, 개선하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'improve speaking skills',
      collocationKo: '말하기 실력을 향상시키다',
      exampleEn: 'Consistent daily practice will improve our speaking skills.',
      examplePron: '[컨시스턴트 데일리 프랙티스 윌 임프루브 아워 스피킹 스킬즈]',
      exampleKo: '꾸준한 매일의 연습이 우리의 말하기 실력을 향상시킬 것이다.',
      derivativesTip: '동사: improve(개선하다) / 명사: improvement(개선, 향상) / 분사형 형용사: improved(개선된)',
    },
    {
      level: '중등 필수',
      word: 'environment',
      ipa: '/ɪnˈvaɪ.rən.mənt/',
      pron: '[인바이런먼트]',
      soundBlock: 'protect / the natural environment',
      meaning: '환경, 주변 여건',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'protect the natural environment',
      collocationKo: '자연환경을 보호하다',
      exampleEn: 'We must protect the natural environment for future generations.',
      examplePron: '[위 머스트 프로텍트 더 내추럴 인바이런먼트 포 퓨처 제너레이션즈]',
      exampleKo: '우리는 미래 세대를 위해 자연환경을 보호해야 한다.',
      derivativesTip: '명사: environment(환경) / 형용사: environmental(환경의) / 부사: environmentally(환경적으로)',
    },
    {
      level: '중등 필수',
      word: 'experience',
      ipa: '/ɪkˈspɪr.i.əns/',
      pron: '[익스피리언스]',
      soundBlock: 'gain / valuable experience',
      meaning: '경험, 체험 / 경험하다',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'gain hands-on experience',
      collocationKo: '실무(실제) 경험을 쌓다',
      exampleEn: 'Students can gain valuable field experience through internships.',
      examplePron: '[스튜던츠 캔 게인 밸류어블 필드 익스피리언스 쓰루 인턴십스]',
      exampleKo: '학생들은 인턴십을 통해 귀중한 현장 경험을 쌓을 수 있다.',
      derivativesTip: '명사·동사: experience(경험/경험하다) / 형용사: experienced(경험이 풍부한, 숙련된) ↔ inexperienced(미숙한)',
    },
    {
      level: '중등 필수',
      word: 'prepare',
      ipa: '/prɪˈper/',
      pron: '[프리페어]',
      soundBlock: 'prepare for / the upcoming exam',
      meaning: '준비하다, 대비하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'prepare for the presentation',
      collocationKo: '발표를 준비하다',
      exampleEn: 'We always prepare thoroughly for the upcoming presentation.',
      examplePron: '[위 올웨이즈 프리페어 써로울리 포 디 업커밍 프레젠테이션]',
      exampleKo: '우리는 다가오는 발표를 위해 항상 철저히 준비한다.',
      derivativesTip: '동사: prepare(준비하다) / 명사: preparation(준비, 대비) / 형용사: prepared(준비된)',
    },
    {
      level: '중등 필수',
      word: 'recommend',
      ipa: '/ˌrek.əˈmend/',
      pron: '[레커멘드]',
      soundBlock: 'highly recommend / this book',
      meaning: '추천하다, 권장하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'highly recommend the course',
      collocationKo: '그 강의를 적극 추천하다',
      exampleEn: 'I highly recommend this quiet cafe to anyone who loves reading.',
      examplePron: '[아이 하일리 레커멘드 디스 콰이엇 카페 투 애니원 후 러브즈 리딩]',
      exampleKo: '독서를 좋아하는 모든 분께 이 조용한 카페를 적극 추천합니다.',
      derivativesTip: '동사: recommend(추천하다) / 명사: recommendation(추천, 권고) — 뒤에 동명사(recommend -ing) 또는 that절을 취함',
    },
    {
      level: '중등 필수',
      word: 'opportunity',
      ipa: '/ˌɑː.pɚˈtuː.nə.t̬i/',
      pron: '[아퍼튜너티]',
      soundBlock: 'seize / a great opportunity',
      meaning: '기회, 호기',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'have an opportunity to learn',
      collocationKo: '배울 기회를 얻다',
      exampleEn: 'Studying abroad gave me a great opportunity to broaden my view.',
      examplePron: '[스터디잉 어브로드 게이브 미 어 그레이트 아퍼튜너티 투 브로든 마이 뷰]',
      exampleKo: '해외 유학은 나에게 시야를 넓힐 좋은 기회를 주었다.',
      derivativesTip: '단수: opportunity / 복수: opportunities — 주로 뒤에서 to부정사 형용사구(opportunity to V)가 수식함',
    },
    {
      level: '중등 필수',
      word: 'communicate',
      ipa: '/kəˈmjuː.nə.keɪt/',
      pron: '[커뮤니케이트]',
      soundBlock: 'communicate / with team members',
      meaning: '의사소통하다, 전달하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'communicate clearly with others',
      collocationKo: '타인과 명확하게 소통하다',
      exampleEn: 'Good leaders communicate clearly with their team members.',
      examplePron: '[굿 리더즈 커뮤니케이트 클리얼리 위드 데어 팀 멤버즈]',
      exampleKo: '훌륭한 리더는 팀원들과 명확하게 소통한다.',
      derivativesTip: '동사: communicate(소통하다) / 명사: communication(의사소통) / 형용사: communicative(소통을 잘하는)',
    },
    {
      level: '중등 필수',
      word: 'necessary',
      ipa: '/ˈnes.ə.ser.i/',
      pron: '[네서세리]',
      soundBlock: 'necessary for / maintaining focus',
      meaning: '필요한, 필수적인',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'necessary for success',
      collocationKo: '성공에 필요한',
      exampleEn: 'Adequate sleep is necessary for maintaining focus during the day.',
      examplePron: '[애더쿼트 슬립 이즈 네서세리 포 메인테이닝 포커스 두링(듀링) 더 데이]',
      exampleKo: '충분한 수면은 낮 동안 집중력을 유지하는 데 필수적이다.',
      derivativesTip: '형용사: necessary(필요한) / 명사: necessity(필수품, 필요성) / 부사: necessarily(반드시, 필연적으로)',
    },
    {
      level: '중등 필수',
      word: 'convenient',
      ipa: '/kənˈviː.ni.ənt/',
      pron: '[컨비니언트]',
      soundBlock: 'commuting / is convenient',
      meaning: '편리한, 간편한',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'convenient public transportation',
      collocationKo: '편리한 대중교통',
      exampleEn: 'The subway station is very close, so commuting is convenient.',
      examplePron: '[더 서브웨이 스테이션 이즈 베리 클로즈, 소 커뮤팅 이즈 컨비니언트]',
      exampleKo: '지하철역이 매우 가까워서 통근하기에 편리하다.',
      derivativesTip: '형용사: convenient(편리한) ↔ inconvenient(불편한) / 명사: convenience(편의, 편리함) — ※ 사람이 주어가 될 수 없음에 주의',
    },
    {
      level: '중등 필수',
      word: 'participate',
      ipa: '/pɑːrˈtɪs.ə.peɪt/',
      pron: '[파티서페이트]',
      soundBlock: 'participate in / the workshop',
      meaning: '참여하다, 참가하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'actively participate in class',
      collocationKo: '수업에 적극적으로 참여하다',
      exampleEn: 'All members actively participate in the weekly workshop.',
      examplePron: '[올 멤버즈 액티블리 파티서페이트 인 더 위클리 워크샵]',
      exampleKo: '모든 구성원이 주간 워크숍에 적극적으로 참여한다.',
      derivativesTip: '동사: participate in(참여하다 = take part in) / 명사: participation(참여), participant(참가자)',
    },
    {
      level: '중등 필수',
      word: 'focus',
      ipa: '/ˈfoʊ.kəs/',
      pron: '[포커스]',
      soundBlock: 'focus on / the core task',
      meaning: '집중하다 / 초점, 중심',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'focus on the core task',
      collocationKo: '핵심 과제에 집중하다',
      exampleEn: 'I always focus on the core task during the morning hours.',
      examplePron: '[아이 올웨이즈 포커스 안 더 코어 태스크 두링(듀링) 더 모닝 아워즈]',
      exampleKo: '나는 오전 시간 동안 항상 핵심 과제에 집중한다.',
      derivativesTip: '동사·명사: focus on(~에 집중하다 = concentrate on) / 형용사: focused(집중한, 목표가 뚜렷한)',
    },
    {
      level: '중등 필수',
      word: 'achieve',
      ipa: '/əˈtʃiːv/',
      pron: '[어치브]',
      soundBlock: 'achieve / our long-term goals',
      meaning: '(목표·성과를) 달성하다, 이루다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'achieve a meaningful result',
      collocationKo: '의미 있는 결과를 달성하다',
      exampleEn: 'With steady effort, we can achieve our long-term goals.',
      examplePron: '[위드 스테디 에포트, 위 캔 어치브 아워 롱텀 골즈]',
      exampleKo: '꾸준한 노력이 있다면 우리는 장기 목표를 달성할 수 있다.',
      derivativesTip: '동사: achieve(달성하다) / 명사: achievement(성취, 업적) / 형용사: achievable(달성 가능한)',
    },
    {
      level: '중등 필수',
      word: 'regular',
      ipa: '/ˈreɡ.jə.lɚ/',
      pron: '[레귤러]',
      soundBlock: 'keep / a regular routine',
      meaning: '규칙적인, 정기적인, 단골의',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'regular exercise and sleep',
      collocationKo: '규칙적인 운동과 수면',
      exampleEn: 'Keeping a regular sleep schedule is good for your health.',
      examplePron: '[키핑 어 레귤러 슬립 스케줄 이즈 굿 포 유어 헬쓰]',
      exampleKo: '규칙적인 수면 일정을 유지하는 것은 건강에 좋다.',
      derivativesTip: '형용사: regular(규칙적인) ↔ irregular(불규칙한) / 부사: regularly(규칙적으로, 정기적으로)',
    },
    {
      level: '중등 필수',
      word: 'organize',
      ipa: '/ˈɔːr.ɡə.naɪz/',
      pron: '[오거나이즈]',
      soundBlock: 'organize / my study notes',
      meaning: '정리하다, 체계화하다, 주최하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'organize thoughts clearly',
      collocationKo: '생각을 명확하게 정리하다',
      exampleEn: 'I usually organize my study notes right after class.',
      examplePron: '[아이 유주얼리 오거나이즈 마이 스터디 노츠 라잇 애프터 클래스]',
      exampleKo: '나는 주로 수업 직후에 학습 노트를 정리한다.',
      derivativesTip: '동사: organize(정리하다/조직하다) / 명사: organization(조직, 체계화) / 형용사: organized(체계적인, 정돈된)',
    },
    {
      level: '중등 필수',
      word: 'patient',
      ipa: '/ˈpeɪ.ʃənt/',
      pron: '[페이션트]',
      soundBlock: 'remain patient / with beginners',
      meaning: '인내심 있는, 참을성 있는 / 환자',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'be patient with beginners',
      collocationKo: '초보자에게 인내심을 갖다',
      exampleEn: 'Good teachers remain patient with beginners during practice.',
      examplePron: '[굿 티처즈 리메인 페이션트 위드 비기너즈 두링(듀링) 프랙티스]',
      exampleKo: '좋은 선생님들은 연습 중에 초보자들에게 인내심을 유지한다.',
      derivativesTip: '형용사: patient(인내심 있는) ↔ impatient(성급한) / 명사: patience(인내심) / 부사: patiently(참을성 있게)',
    },
    {
      level: '중등 필수',
      word: 'confident',
      ipa: '/ˈkɑːn.fə.dənt/',
      pron: '[칸피던트]',
      soundBlock: 'feel confident / on stage',
      meaning: '자신감 있는, 확신하는',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'feel confident about the interview',
      collocationKo: '면접에 대해 자신감을 느끼다',
      exampleEn: 'Thanks to thorough preparation, we feel confident on stage.',
      examplePron: '[땡스 투 써로우 프레퍼레이션, 위 필 칸피던트 안 스테이지]',
      exampleKo: '철저한 준비 덕분에 우리는 무대 위에서 자신감을 느낀다.',
      derivativesTip: '형용사: confident(자신감 있는) / 명사: confidence(자신감, 신뢰) / 부사: confidently(자신 있게)',
    },
    {
      level: '중등 필수',
      word: 'habit',
      ipa: '/ˈhæb.ɪt/',
      pron: '[해빗]',
      soundBlock: 'build / a strong study habit',
      meaning: '습관, 버릇',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'develop a daily reading habit',
      collocationKo: '매일 독서하는 습관을 기르다',
      exampleEn: 'Small daily actions gradually build a strong study habit.',
      examplePron: '[스몰 데일리 액션즈 그래주얼리 빌드 어 스트롱 스터디 해빗]',
      exampleKo: '매일의 작은 행동들이 점차 탄탄한 학습 습관을 만든다.',
      derivativesTip: '명사: habit(개인의 습관) / 형용사: habitual(습관적인, 평소의) / 부사: habitually(습관적으로)',
    },
  ],

  '고등·수능 핵심': [
    {
      level: '고등·수능 핵심',
      word: 'perspective',
      ipa: '/pɚˈspek.tɪv/',
      pron: '[퍼스펙티브]',
      soundBlock: 'broaden / our perspective',
      meaning: '관점, 시각, 시야',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'broaden our perspective on life',
      collocationKo: '삶에 대한 시야(관점)를 넓히다',
      exampleEn: 'Reading diverse texts broadens our perspective on the world.',
      examplePron: '[리딩 다이버스 텍스트스 브로든즈 아워 퍼스펙티브 안 더 월드]',
      exampleKo: '다양한 글을 읽는 것은 세상을 바라보는 우리의 시야를 넓혀준다.',
      derivativesTip: '명사: perspective(관점, 원근법) / 유의어: viewpoint(관점), outlook(시각, 전망), horizon(시야)',
    },
    {
      level: '고등·수능 핵심',
      word: 'cognitive',
      ipa: '/ˈkɑːɡ.nə.t̬ɪv/',
      pron: '[카그너티브]',
      soundBlock: 'prevent / cognitive rigidity',
      meaning: '인지의, 인식과 관련된',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'cognitive flexibility and growth',
      collocationKo: '인지적 유연성과 성장',
      exampleEn: 'Encountering new ideas helps prevent cognitive rigidity.',
      examplePron: '[인카운터링 뉴 아이디어즈 헬프스 프리벤트 카그너티브 리지더티]',
      exampleKo: '새로운 아이디어를 접하는 것은 인지적 경직성을 예방하는 데 도움이 된다.',
      derivativesTip: '명사: cognition(인지, 인식 작용) / 형용사: cognitive(인지의) / 부사: cognitively(인지적으로)',
    },
    {
      level: '고등·수능 핵심',
      word: 'aesthetic',
      ipa: '/esˈθet̬.ɪk/',
      pron: '[에스쎄틱]',
      soundBlock: 'a modern / aesthetic',
      meaning: '미학, 미적 스타일 / 미학적인',
      posLabel: '명사 (N)',
      compLabel: '전치사 목적어 (M)',
      collocation: 'a clean modern aesthetic',
      collocationKo: '깔끔하고 현대적인 미학',
      exampleEn: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
      examplePron: '[더 컬렉션 심리슬리 블렌즈 더 브랜즈 헤리티지 위더 모던 에스쎄틱]',
      exampleKo: '그 컬렉션은 브랜드의 전통과 현대적인 미학을 조화롭게 결합한다.',
      derivativesTip: '명사·형용사: aesthetic(미학, 미적 감각 / 미학적인) / 학문명: aesthetics(미학) / 부사: aesthetically(미학적으로)',
    },
    {
      level: '고등·수능 핵심',
      word: 'complement',
      ipa: '/ˈkɑːm.plə.ment/',
      pron: '[캄플러먼트]',
      soundBlock: 'complement / each other',
      meaning: '(서로 어울려) 보완하다 / 보완물',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'complement the minimalist silhouette',
      collocationKo: '미니멀한 실루엣을 돋보이게 보완하다',
      exampleEn: 'Theory and hands-on practice nicely complement each other.',
      examplePron: '[씨어리 앤 핸즈온 프랙티스 나이슬리 캄플러먼트 이치 아더]',
      exampleKo: '이론과 실무 연습은 서로를 훌륭하게 보완한다.',
      derivativesTip: '동사·명사: complement(보완하다) / 형용사: complementary(상호 보완적인) — ※ 철자 i를 쓰는 compliment(칭찬하다)와 구별 필수',
    },
    {
      level: '고등·수능 핵심',
      word: 'resonate',
      ipa: '/ˈrez.ə.neɪt/',
      pron: '[레저네이트]',
      soundBlock: 'resonate with / the audience',
      meaning: '(공감·울림을) 불러일으키다, 공명하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'deeply resonate with readers',
      collocationKo: '독자들에게 깊은 공감을 불러일으키다',
      exampleEn: 'Sincere stories always resonate deeply with the audience.',
      examplePron: '[신시어 스토리즈 올웨이즈 레저네이트 디플리 위드 디 오디언스]',
      exampleKo: '진솔한 이야기는 언제나 청중에게 깊은 울림을 준다.',
      derivativesTip: '자동사: resonate with(~와 공명·공감하다) / 명사: resonance(공명, 깊은 울림) / 형용사: resonant(울려 퍼지는)',
    },
    {
      level: '고등·수능 핵심',
      word: 'empirical',
      ipa: '/ɪmˈpɪr.ɪ.kəl/',
      pron: '[임피리컬]',
      soundBlock: 'through / empirical evidence',
      meaning: '실증적인, 경험(관찰·실험)에 기반한',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'solid empirical evidence',
      collocationKo: '탄탄한 실증적 증거',
      exampleEn: 'Scientific hypotheses must be tested through empirical evidence.',
      examplePron: '[사이언티픽 하이파써시즈 머스트 비 테스티드 쓰루 임피리컬 에비던스]',
      exampleKo: '과학적 가설은 실증적 증거를 통해 검증되어야 한다.',
      derivativesTip: '형용사: empirical(실증적인, 실험에 의거한) / 부사: empirically(실증적으로) ↔ theoretical(이론적인)',
    },
    {
      level: '고등·수능 핵심',
      word: 'correlation',
      ipa: '/ˌkɔːr.əˈleɪ.ʃən/',
      pron: '[코럴레이션]',
      soundBlock: 'illustrate / a close correlation',
      meaning: '상관관계, 상호 연관성',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'a correlation between A and B',
      collocationKo: 'A와 B 사이의 상관관계',
      exampleEn: 'This example illustrates a close correlation between steady practice and fluency.',
      examplePron: '[디스 이그잼플 일러스트레이츠 어 클로즈 코럴레이션 비트윈 스테디 프랙티스 앤 플루언시]',
      exampleKo: '이 예시는 꾸준한 연습과 유창성 사이의 밀접한 상관관계를 보여준다. (※ 어휘 학습용 예시 문장)',
      derivativesTip: '명사: correlation(상관관계) / 동사: correlate(연관되다) — 학술 지문에서 correlation(상관관계)과 causation(인과관계)의 대비가 자주 출제됨',
    },
    {
      level: '고등·수능 핵심',
      word: 'autonomy',
      ipa: '/ɔːˈtɑː.nə.mi/',
      pron: '[오타너미]',
      soundBlock: 'respect / the autonomy of members',
      meaning: '자율성, 자주권',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'encourage learner autonomy',
      collocationKo: '학습자의 자율성을 장려하다',
      exampleEn: 'Wise leaders respect the autonomy of their team members.',
      examplePron: '[와이즈 리더즈 리스펙트 디 오타너미 오브 데어 팀 멤버즈]',
      exampleKo: '현명한 리더들은 팀원들의 자율성을 존중한다.',
      derivativesTip: '명사: autonomy(자율성) / 형용사: autonomous(자율적인, 자주적인) / 부사: autonomously(자율적으로)',
    },
    {
      level: '고등·수능 핵심',
      word: 'intrinsic',
      ipa: '/ɪnˈtrɪn.zɪk/',
      pron: '[인트린직]',
      soundBlock: 'source of / intrinsic motivation',
      meaning: '내재적인, 본질적인, 고유의',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'intrinsic motivation and curiosity',
      collocationKo: '내재적 동기와 호기심',
      exampleEn: 'Curiosity is a powerful source of intrinsic motivation in learning.',
      examplePron: '[큐리아서티 이즈 어 파워풀 소스 오브 인트린직 모티베이션 인 러닝]',
      exampleKo: '호기심은 학습에서 내재적 동기의 강력한 원천이다.',
      derivativesTip: '형용사: intrinsic(내재적인, 본질적인) / 부사: intrinsically(본질적으로) ↔ 반의어: extrinsic(외재적인, 외부에서 오는)',
    },
    {
      level: '고등·수능 핵심',
      word: 'deliberate',
      ipa: '/dɪˈlɪb.ɚ.ət/',
      pron: '[딜리버릿]',
      soundBlock: 'through / deliberate practice',
      meaning: '의도적인, 계획적인, 신중한',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'deliberate daily practice',
      collocationKo: '의도적이고 체계적인 일일 연습',
      exampleEn: 'Expertise is built through deliberate practice rather than passive repetition.',
      examplePron: '[엑스퍼티즈 이즈 빌트 쓰루 딜리버릿 프랙티스 래더 댄 패시브 레퍼티션]',
      exampleKo: '전문성은 단순 반복보다는 의도적인 훈련을 통해 구축된다.',
      derivativesTip: '형용사: deliberate(/dɪˈlɪb.ɚ.ət/ 의도적인, 신중한) / 동사: deliberate(/dɪˈlɪb.ə.reɪt/ 숙고하다) / 부사: deliberately(의도적으로)',
    },
    {
      level: '고등·수능 핵심',
      word: 'ambiguous',
      ipa: '/æmˈbɪɡ.ju.əs/',
      pron: '[앰비규어스]',
      soundBlock: 'avoid / ambiguous interpretations',
      meaning: '모호한, 두 가지 이상으로 해석되는',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'avoid ambiguous wording',
      collocationKo: '모호한 표현(문구)을 피하다',
      exampleEn: 'Clear definitions help us avoid ambiguous interpretations.',
      examplePron: '[클리어 데피니션즈 헬프 어스 어보이드 앰비규어스 인터프리테이션즈]',
      exampleKo: '명확한 정의는 우리가 모호한 해석을 피하도록 도와준다.',
      derivativesTip: '형용사: ambiguous(모호한) / 명사: ambiguity(모호함, 중의성) ↔ 반의어: unambiguous, explicit(명백한)',
    },
    {
      level: '고등·수능 핵심',
      word: 'inevitable',
      ipa: '/ɪˈnev.ə.t̬ə.bəl/',
      pron: '[이네버터블]',
      soundBlock: 'an inevitable / part of work',
      meaning: '피할 수 없는, 불가피한',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'an inevitable consequence',
      collocationKo: '불가피한 결과',
      exampleEn: 'Adapting to technological change is an inevitable part of modern work.',
      examplePron: '[어댑팅 투 테크놀로지컬 체인지 이즈 언 이네버터블 파트 오브 모던 워크]',
      exampleKo: '기술 변화에 적응하는 것은 현대 업무의 불가피한 일부이다.',
      derivativesTip: '형용사: inevitable(불가피한) / 부사: inevitably(불가피하게, 필연적으로) / 명사: inevitability(불가피성)',
    },
    {
      level: '고등·수능 핵심',
      word: 'sustainable',
      ipa: '/səˈsteɪ.nə.bəl/',
      pron: '[서스테이너블]',
      soundBlock: 'essential for / sustainable study',
      meaning: '지속 가능한, 오랫동안 유지할 수 있는',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'sustainable management practices',
      collocationKo: '지속 가능한 경영 관행',
      exampleEn: 'Balancing rest and effort is essential for sustainable study.',
      examplePron: '[밸런싱 레스트 앤 에포트 이즈 에센셜 포 서스테이너블 스터디]',
      exampleKo: '휴식과 노력의 균형을 맞추는 것은 지속 가능한 학습에 필수적이다.',
      derivativesTip: '동사: sustain(유지하다, 지탱하다) / 형용사: sustainable(지속 가능한) / 명사: sustainability(지속 가능성)',
    },
    {
      level: '고등·수능 핵심',
      word: 'diverse',
      ipa: '/daɪˈvɝːs/',
      pron: '[다이버스]',
      soundBlock: 'listen to / diverse opinions',
      meaning: '다양한, 여러 가지의',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'expose ourselves to diverse viewpoints',
      collocationKo: '다양한 관점에 우리 자신을 노출시키다',
      exampleEn: 'Listening to diverse opinions helps us make balanced decisions.',
      examplePron: '[리스닝 투 다이버스 오피니언즈 헬프스 어스 메익 밸런스트 디시전즈]',
      exampleKo: '다양한 의견을 경청하는 것은 우리가 균형 잡힌 결정을 내리도록 돕는다.',
      derivativesTip: '형용사: diverse(다양한) / 명사: diversity(다양성) / 동사: diversify(다각화하다, 다양화하다)',
    },
    {
      level: '고등·수능 핵심',
      word: 'foster',
      ipa: '/ˈfɑː.stɚ/',
      pron: '[파스터]',
      soundBlock: 'foster / mutual trust',
      meaning: '(성장·발전을) 촉진하다, 기르다, 육성하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'foster mutual trust',
      collocationKo: '상호 신뢰를 기르다(조성하다)',
      exampleEn: 'Open dialogue fosters mutual trust among team members.',
      examplePron: '[오픈 다이얼로그 파스터즈 뮤추얼 트러스트 어멍 팀 멤버즈]',
      exampleKo: '열린 대화는 팀원들 사이의 상호 신뢰를 증진한다.',
      derivativesTip: '타동사: foster(촉진하다, 함양하다) / 유의어: cultivate(함양하다), promote(증진하다), nurture(양육하다)',
    },
    {
      level: '고등·수능 핵심',
      word: 'comprehend',
      ipa: '/ˌkɑːm.prɪˈhend/',
      pron: '[캄프리헨드]',
      soundBlock: 'fully comprehend / long passages',
      meaning: '(충분히) 이해하다, 파악하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'comprehend complex passages',
      collocationKo: '복잡한 지문을 이해하다',
      exampleEn: 'By analyzing sentence structure, we can fully comprehend long passages.',
      examplePron: '[바이 애널라이징 센텐스 스트럭처, 위 캔 풀리 캄프리헨드 롱 패시지즈]',
      exampleKo: '문장 구조를 분석함으로써 우리는 긴 지문을 완전히 이해할 수 있다.',
      derivativesTip: '동사: comprehend(이해하다) / 명사: comprehension(독해력, 이해) / 형용사: comprehensive(포괄적인, 종합적인), comprehensible(이해할 수 있는)',
    },
    {
      level: '고등·수능 핵심',
      word: 'biodiversity',
      ipa: '/ˌbaɪ.oʊ.daɪˈvɝː.sə.t̬i/',
      pron: '[바이오다이버서티]',
      soundBlock: 'preserve / regional biodiversity',
      meaning: '생물 다양성',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'conserve regional biodiversity',
      collocationKo: '지역 생물 다양성을 보존하다',
      exampleEn: 'Protecting natural habitats preserves regional biodiversity.',
      examplePron: '[프로텍팅 내추럴 해비태츠 프리저브즈 리저널 바이오다이버서티]',
      exampleKo: '자연 서식지를 보호하는 것은 지역의 생물 다양성을 보존해 준다.',
      derivativesTip: '접두사 bio-(생명) + 명사 diversity(다양성) 결합 / 관련 학술어: ecosystem(생태계), habitat(서식지)',
    },
    {
      level: '고등·수능 핵심',
      word: 'informative',
      ipa: '/ɪnˈfɔːr.mə.t̬ɪv/',
      pron: '[인포머티브]',
      soundBlock: 'was deeply / informative',
      meaning: '유익한 정보를 주는, 교육적인',
      posLabel: '형용사 (Adj)',
      compLabel: '주격보어 (SC)',
      collocation: 'an informative documentary',
      collocationKo: '유익한 다큐멘터리',
      exampleEn: 'The seminar was deeply informative and well-organized.',
      examplePron: '[더 세미나 워즈 디플리 인포머티브 앤 웰오거나이즈드]',
      exampleKo: '그 세미나는 매우 유익하고 짜임새 있게 구성되어 있었다.',
      derivativesTip: '동사: inform(알리다) / 명사: information(정보) / 형용사: informative(유익한) ↔ informed(정보에 밝은, 숙지한)',
    },
    {
      level: '고등·수능 핵심',
      word: 'adaptation',
      ipa: '/ˌæd.əpˈteɪ.ʃən/',
      pron: '[애덥테이션]',
      soundBlock: 'rapid adaptation / is essential',
      meaning: '적응, 각색',
      posLabel: '명사 (N)',
      compLabel: '주어 (S)',
      collocation: 'adaptation to a new environment',
      collocationKo: '새로운 환경에 대한 적응',
      exampleEn: 'Rapid adaptation to changing environments is essential for survival.',
      examplePron: '[래피드 애덥테이션 투 체인징 인바이런먼츠 이즈 에센셜 포 서바이벌]',
      exampleKo: '변화하는 환경에 빠르게 적응하는 것은 생존에 필수적이다.',
      derivativesTip: '동사: adapt(적응하다, 맞추다) / 명사: adaptation(적응) / 형용사: adaptable(적응력이 있는) — ※ adopt(채택하다/입양하다)와 철자 구별',
    },
    {
      level: '고등·수능 핵심',
      word: 'mitigate',
      ipa: '/ˈmɪt̬.ə.ɡeɪt/',
      pron: '[미러게이트]',
      soundBlock: 'mitigate / potential risks',
      meaning: '(위험·피해·부정적 영향을) 완화하다, 경감하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'mitigate environmental impact',
      collocationKo: '환경적 악영향을 완화하다',
      exampleEn: 'Proactive safety measures can mitigate potential risks in the project.',
      examplePron: '[프로액티브 세이프티 메저즈 캔 미러게이트 포텐셜 리스크스 인 더 프로젝트]',
      exampleKo: '선제적인 안전 조치는 프로젝트의 잠재적 위험을 완화할 수 있다.',
      derivativesTip: '타동사: mitigate(완화하다 = alleviate) / 명사: mitigation(완화, 경감 — risk mitigation: 위험 완화)',
    },
  ],

  '비즈니스·실무': [
    {
      level: '비즈니스·실무',
      word: 'streamline',
      ipa: '/ˈstriːm.laɪn/',
      pron: '[스트림라인]',
      soundBlock: 'streamline / the entire workflow',
      meaning: '(업무·공정·절차를) 간소화하다, 효율화하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'streamline the approval process',
      collocationKo: '승인 절차를 간소화하다',
      exampleEn: 'We can streamline the entire workflow with this new system.',
      examplePron: '[위 캔 스트림라인 디 인타이어 워크플로우 위드 디스 뉴 시스템]',
      exampleKo: '우리는 이 새로운 시스템으로 전체 업무 공정을 간소화할 수 있다.',
      derivativesTip: '타동사: streamline(간소화·효율화하다) / 분사형 형용사: streamlined(군더더기 없이 효율화된, 유선형의)',
    },
    {
      level: '비즈니스·실무',
      word: 'expedite',
      ipa: '/ˈek.spə.daɪt/',
      pron: '[엑스퍼다이트]',
      soundBlock: 'expedite / the approval process',
      meaning: '(절차·업무를) 신속히 처리하다, 앞당기다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'expedite the delivery',
      collocationKo: '배송·납품을 신속히 앞당기다',
      exampleEn: 'Could you please expedite the approval process before Friday?',
      examplePron: '[쿠쥬 플리즈 엑스퍼다이트 디 어프루벌 프로세스 비포 프라이데이]',
      exampleKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
      derivativesTip: '동사: expedite(신속히 처리하다) / 형용사: expeditious(신속하고 효율적인) ↔ 반의어: delay, postpone(지연시키다)',
    },
    {
      level: '비즈니스·실무',
      word: 'feasible',
      ipa: '/ˈfiː.zə.bəl/',
      pron: '[피저블]',
      soundBlock: 'make the schedule / feasible',
      meaning: '실현 가능한, 실행할 수 있는',
      posLabel: '형용사 (Adj)',
      compLabel: '목적격보어 (OC)',
      collocation: 'economically and technically feasible',
      collocationKo: '경제적·기술적으로 실현 가능한',
      exampleEn: 'Streamlining the workflow makes the tentative schedule feasible.',
      examplePron: '[스트림라이닝 더 워크플로우 메익스 더 텐터티브 스케줄 피저블]',
      exampleKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      derivativesTip: '형용사: feasible(실현 가능한) / 명사: feasibility(실현 가능성, 타당성 — feasibility study: 타당성 조사)',
    },
    {
      level: '비즈니스·실무',
      word: 'tentative',
      ipa: '/ˈten.tə.t̬ɪv/',
      pron: '[텐터티브]',
      soundBlock: 'share / a tentative agenda',
      meaning: '잠정적인, 확정되지 않은',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'a tentative launch date',
      collocationKo: '잠정 출시일',
      exampleEn: 'We have shared a tentative agenda for next week’s meeting.',
      examplePron: '[위 해브 쉐어드 어 텐터티브 어젠다 포 넥스트 위크스 미팅]',
      exampleKo: '다음 주 회의를 위한 잠정 안건을 공유했습니다.',
      derivativesTip: '형용사: tentative(잠정적인) / 부사: tentatively(잠정적으로) ↔ 반의어: confirmed, finalized(최종 확정된)',
    },
    {
      level: '비즈니스·실무',
      word: 'accommodate',
      ipa: '/əˈkɑː.mə.deɪt/',
      pron: '[어카머데이트]',
      soundBlock: 'gladly accommodate / your request',
      meaning: '(요청·필요를) 수용하다, 배려하다 / (인원을) 수용하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'accommodate a late check-out request',
      collocationKo: '레이트 체크아웃 요청을 배려하다',
      exampleEn: 'Our hotel can gladly accommodate your late check-out request.',
      examplePron: '[아워 호텔 캔 글래들리 어카머데이트 유어 레이트 체크아웃 리퀘스트]',
      exampleKo: '저희 호텔은 고객님의 레이트 체크아웃 요청을 기꺼이 수용해 배려해 드릴 수 있습니다.',
      derivativesTip: '동사: accommodate(수용하다, 맞추다) / 명사: accommodation(숙박 시설, 편의 도모) / 형용사: accommodating(협조적인)',
    },
    {
      level: '비즈니스·실무',
      word: 'itinerary',
      ipa: '/aɪˈtɪn.ə.rer.i/',
      pron: '[아이티너레리]',
      soundBlock: 'review / the attached itinerary',
      meaning: '(시간·경로가 포함된) 상세 여행·출장 일정표',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'confirm the business trip itinerary',
      collocationKo: '출장 상세 일정표를 확정하다',
      exampleEn: 'Please review the attached itinerary before your business trip.',
      examplePron: '[플리즈 리뷰 디 어태치트 아이티너레리 비포 유어 비즈니스 트립]',
      exampleKo: '출장 출발 전에 첨부된 상세 일정표를 검토해 주세요.',
      derivativesTip: '단수: itinerary / 복수: itineraries — 항공편·숙소·방문 동선이 적힌 세부 일정표를 뜻함',
    },
    {
      level: '비즈니스·실무',
      word: 'complimentary',
      ipa: '/ˌkɑːm.pləˈmen.t̬ɚ.i/',
      pron: '[캄플러멘터리]',
      soundBlock: 'enjoy / complimentary access',
      meaning: '(우대 차원에서) 무료로 제공되는',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'complimentary airport shuttle',
      collocationKo: '무료 공항 셔틀 서비스',
      exampleEn: 'Hotel guests enjoy complimentary access to the fitness center.',
      examplePron: '[호텔 게스츠 인조이 캄플러멘터리 액세스 투 더 피트니스 센터]',
      exampleKo: '호텔 투숙객은 피트니스 센터를 무료로 이용하실 수 있습니다.',
      derivativesTip: '형용사: complimentary(무료 제공의, 칭찬하는) / 명사·동사: compliment(칭찬, 찬사) — ※ complementary(상호 보완적인)와 구분',
    },
    {
      level: '비즈니스·실무',
      word: 'meticulously',
      ipa: '/məˈtɪk.jə.ləs.li/',
      pron: '[머티큘러슬리]',
      soundBlock: 'check every detail / meticulously',
      meaning: '세심하게, 빈틈없이, 꼼꼼하게',
      posLabel: '부사 (Adv)',
      compLabel: '부사 수식어 (M)',
      collocation: 'inspect the specifications meticulously',
      collocationKo: '세부 사양을 빈틈없이 점검하다',
      exampleEn: 'Our quality team checks every surface detail meticulously.',
      examplePron: '[아워 퀄리티 팀 체크스 에브리 서피스 디테일 머티큘러슬리]',
      exampleKo: '우리 품질 팀은 모든 표면 디테일을 빈틈없이 꼼꼼하게 점검한다.',
      derivativesTip: '형용사: meticulous(세심한, 꼼꼼한) / 부사: meticulously(빈틈없이) / 명사: meticulousness(꼼꼼함)',
    },
    {
      level: '비즈니스·실무',
      word: 'substantial',
      ipa: '/səbˈstæn.ʃəl/',
      pron: '[섭스탠셜]',
      soundBlock: 'brought / a substantial improvement',
      meaning: '상당한, 실질적인',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'a substantial reduction in cost',
      collocationKo: '상당한 비용 절감',
      exampleEn: 'The new system brought a substantial improvement in efficiency.',
      examplePron: '[더 뉴 시스템 브로트 어 섭스탠셜 임프루브먼트 인 이피션시]',
      exampleKo: '새 시스템은 효율성 면에서 상당한 개선을 가져왔다.',
      derivativesTip: '명사: substance(물질, 본질) / 형용사: substantial(상당한, 실질적인) / 부사: substantially(상당히, 크게)',
    },
    {
      level: '비즈니스·실무',
      word: 'compromise',
      ipa: '/ˈkɑːm.prə.maɪz/',
      pron: '[캄프러마이즈]',
      soundBlock: 'reached / a reasonable compromise',
      meaning: '타협, 절충안 / 타협하다, (품질·원칙을) 훼손하다',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'reach a mutually acceptable compromise',
      collocationKo: '상호 수용 가능한 타협안에 도달하다',
      exampleEn: 'After a long discussion, both teams reached a reasonable compromise.',
      examplePron: '[애프터 어 롱 디스커션, 보쓰 팀즈 리치트 어 리즈너블 캄프러마이즈]',
      exampleKo: '긴 논의 끝에 양 팀은 합리적인 타협안에 도달했다.',
      derivativesTip: '명사·자동사: compromise(타협안/타협하다) / 타동사: compromise quality(품질을 저하시키다·타협하다)',
    },
    {
      level: '비즈니스·실무',
      word: 'overhaul',
      ipa: '/ˌoʊ.vɚˈhɔːl/',
      pron: '[오버홀]',
      soundBlock: 'will overhaul / its inventory system',
      meaning: '전면 개편하다, 철저히 점검·수리하다 / 전면 개편',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'overhaul the entire workflow',
      collocationKo: '전체 업무 공정을 전면 개편하다',
      exampleEn: 'The company will overhaul its outdated inventory system next month.',
      examplePron: '[더 컴퍼니 윌 오버홀 이츠 아웃데이티드 인벤토리 시스템 넥스트 먼쓰]',
      exampleKo: '그 회사는 다음 달에 노후화된 재고 관리 시스템을 전면 개편할 것이다.',
      derivativesTip: '동사 강세(/ˌoʊ.vɚˈhɔːl/ 3음절 강세) vs 명사 강세(/ˈoʊ.vɚ.hɔːl/ 1음절 강세): 기계 분해 수리 또는 시스템 전면 개편을 뜻함',
    },
    {
      level: '비즈니스·실무',
      word: 'consolidate',
      ipa: '/kənˈsɑː.lə.deɪt/',
      pron: '[컨살리데이트]',
      soundBlock: 'will consolidate / three branches',
      meaning: '(여러 개를 하나로) 통합하다 / (기반·위치를) 공고히 하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'consolidate data into a single sheet',
      collocationKo: '데이터를 하나의 시트로 통합하다',
      exampleEn: 'We will consolidate three regional branches into one main hub.',
      examplePron: '[위 윌 컨살리데이트 쓰리 리저널 브랜치즈 인투 원 메인 허브]',
      exampleKo: '우리는 3개의 지역 지사를 하나의 메인 허브로 통합할 것이다.',
      derivativesTip: '동사: consolidate(통합하다, 강화하다) / 명사: consolidation(통합, 합병, 공고화)',
    },
    {
      level: '비즈니스·실무',
      word: 'delegate',
      ipa: '/ˈdel.ə.ɡeɪt/',
      pron: '[델러게이트]',
      soundBlock: 'wisely delegate / routine tasks',
      meaning: '(권한·업무를) 위임하다 / 대표자(/ˈdel.ə.ɡət/)',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'delegate authority to team members',
      collocationKo: '팀원들에게 권한을 위임하다',
      exampleEn: 'Effective leaders wisely delegate routine tasks to their team.',
      examplePron: '[이펙티브 리더즈 와이즐리 델러게이트 루틴 태스크스 투 데어 팀]',
      exampleKo: '유능한 리더들은 일상적인 업무를 팀원들에게 현명하게 위임한다.',
      derivativesTip: '동사: delegate(/ˈdel.ə.ɡeɪt/ 위임하다) / 명사: delegation(위임, 대표단), delegate(/ˈdel.ə.ɡət/ 파견 대표자)',
    },
    {
      level: '비즈니스·실무',
      word: 'align',
      ipa: '/əˈlaɪn/',
      pron: '[얼라인]',
      soundBlock: 'align our goals / with the strategy',
      meaning: '(기준·목표·방침을) 일치시키다, 나란히 맞추다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'align the team on key priorities',
      collocationKo: '핵심 우선순위에 대해 팀의 방향을 맞추다',
      exampleEn: 'We always align our departmental goals with the annual strategy.',
      examplePron: '[위 올웨이즈 얼라인 아워 디파트멘털 골즈 위드 디 애뉴얼 스트래티지]',
      exampleKo: '우리는 항상 부서 목표를 연간 전략과 일치시킨다.',
      derivativesTip: '동사: align A with B(A를 B와 일치시키다·정렬하다) / 명사: alignment(정렬, 방향 일치, 제휴)',
    },
    {
      level: '비즈니스·실무',
      word: 'prioritize',
      ipa: '/praɪˈɔːr.ə.taɪz/',
      pron: '[프라이오러타이즈]',
      soundBlock: 'prioritize / the most urgent tasks',
      meaning: '우선순위를 매기다, 우선적으로 처리하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'prioritize high-impact tasks',
      collocationKo: '파급효과가 큰 과제를 우선시하다',
      exampleEn: 'When time is limited, we must prioritize the most urgent tasks.',
      examplePron: '[웬 타임 이즈 리미티드, 위 머스트 프라이오러타이즈 더 모스트 어전트 태스크스]',
      exampleKo: '시간이 제한되어 있을 때 우리는 가장 시급한 과제부터 우선 처리해야 한다.',
      derivativesTip: '형용사: prior(사전의, 이전의) / 명사: priority(우선순위) / 동사: prioritize(우선순위를 두다)',
    },
    {
      level: '비즈니스·실무',
      word: 'specification',
      ipa: '/ˌspes.ə.fəˈkeɪ.ʃən/',
      pron: '[스페서피케이션]',
      soundBlock: 'meet / the exact specifications',
      meaning: '(주로 복수형) 세부 사양, 설명서, 규격(specs)',
      posLabel: '명사 (N)',
      compLabel: '직접목적어 (DO)',
      collocation: 'check the technical specifications',
      collocationKo: '기술 세부 사양(제원)을 확인하다',
      exampleEn: 'All components must meet the manufacturer’s exact specifications.',
      examplePron: '[올 컴포넌츠 머스트 밋 더 매뉴팩처러즈 이그잭트 스페서피케이션즈]',
      exampleKo: '모든 부품은 제조사의 정확한 세부 규격(사양)을 충족해야 한다.',
      derivativesTip: '동사: specify(명시하다) / 형용사: specific(구체적인) / 명사: specification(세부 사양, 실무 줄임말: specs)',
    },
    {
      level: '비즈니스·실무',
      word: 'seamlessly',
      ipa: '/ˈsiːm.ləs.li/',
      pron: '[심리슬리]',
      soundBlock: 'integrates seamlessly / with our workflow',
      meaning: '매끄럽게, 이음매 없이 조화롭게',
      posLabel: '부사 (Adv)',
      compLabel: '부사 수식어 (M)',
      collocation: 'work seamlessly across devices',
      collocationKo: '기기 간에 끊김 없이 매끄럽게 작동하다',
      exampleEn: 'The new software integrates seamlessly with our existing workflow.',
      examplePron: '[더 뉴 소프트웨어 인티그레이츠 심리슬리 위드 아워 이그지스팅 워크플로우]',
      exampleKo: '새 소프트웨어는 우리의 기존 업무 흐름과 매끄럽게 통합된다.',
      derivativesTip: '명사: seam(솔기, 이음매) / 형용사: seamless(이음매 없는, 끊김 없는) / 부사: seamlessly(매끄럽게)',
    },
    {
      level: '비즈니스·실무',
      word: 'proactive',
      ipa: '/ˌproʊˈæk.tɪv/',
      pron: '[프로액티브]',
      soundBlock: 'take / a proactive approach',
      meaning: '선제적인, 주도적인(문제가 생기기 전에 미리 대비하는)',
      posLabel: '형용사 (Adj)',
      compLabel: '수식어 (M)',
      collocation: 'take proactive measures',
      collocationKo: '선제적인 조치를 취하다',
      exampleEn: 'Taking a proactive approach prevents costly delays later.',
      examplePron: '[테이킹 어 프로액티브 어프로치 프리벤츠 코슬리 딜레이즈 레이터]',
      exampleKo: '선제적인 접근 방식을 취하면 나중에 큰 비용이 드는 지연을 막을 수 있다.',
      derivativesTip: '형용사: proactive(선제적인, 주도적인) / 부사: proactively(선제적으로) ↔ 반의어: reactive(사후 대응적인)',
    },
    {
      level: '비즈니스·실무',
      word: 'collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      pron: '[컬래버레이트]',
      soundBlock: 'collaborated closely / on the project',
      meaning: '협업하다, 공동으로 작업하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'collaborate closely on a project',
      collocationKo: '프로젝트에서 긴밀히 협업하다',
      exampleEn: 'Designers and engineers collaborated closely to solve the issue.',
      examplePron: '[디자이너즈 앤 엔지니어즈 컬래버레이티드 클로슬리 투 솔브 디 이슈]',
      exampleKo: '디자이너와 엔지니어들은 그 문제를 해결하기 위해 긴밀히 협업했다.',
      derivativesTip: '동사: collaborate with(~와 협업하다) / 명사: collaboration(협업, 공동 작업) / 형용사: collaborative(협업의)',
    },
    {
      level: '비즈니스·실무',
      word: 'verify',
      ipa: '/ˈver.ə.faɪ/',
      pron: '[베러파이]',
      soundBlock: 'verify / all measurements',
      meaning: '(사실·정확성을) 검증하다, 확인하다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'verify the formula before mixing',
      collocationKo: '배합 전에 공식을 검증·확인하다',
      exampleEn: 'Please verify all measurements before proceeding to the next step.',
      examplePron: '[플리즈 베러파이 올 메저먼츠 비포 프로시딩 투 더 넥스트 스텝]',
      exampleKo: '다음 단계로 넘어가기 전에 모든 측정치를 확인해 주세요.',
      derivativesTip: '동사: verify(검증하다, 확인하다) / 명사: verification(검증, 확인) / 형용사: verified(검증된), verifiable(검증 가능한)',
    },
  ],

  '오픽(OPIc)·구동사': [
    {
      level: '오픽(OPIc)·구동사',
      word: 'wrap up',
      ipa: '/ræp ʌp/',
      pron: '[래펍]',
      soundBlock: 'wrap up / our Friday meeting',
      meaning: '(회의·일과를) 마무리 짓다, 끝내다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: "wrap up today's session",
      collocationKo: '오늘 세션을 마무리하다',
      exampleEn: 'We usually wrap up our Friday meeting before noon.',
      examplePron: '[위 유주얼리 래펍 아워 프라이데이 미팅 비포 눈]',
      exampleKo: '우리는 보통 금요일 회의를 정오 전에 마무리한다.',
      derivativesTip: '타동사구: wrap up(마무리하다) — 대명사 목적어(it)는 반드시 가운데(wrap it up)에 배치함',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'touch base',
      ipa: '/tʌtʃ beɪs/',
      pron: '[터치 베이스]',
      soundBlock: 'touch base / with you again',
      meaning: '(현황 확인차) 잠깐 연락하다, 소통하다',
      posLabel: '관용구 (V)',
      compLabel: '동사 (V)',
      collocation: 'touch base on the schedule',
      collocationKo: '일정에 대해 짧게 연락해 맞추다',
      exampleEn: "I'll touch base with you again early next week.",
      examplePron: '[아일 터치 베이스 위드 유 어겐 얼리 넥스트 위크]',
      exampleKo: '다음 주 초에 다시 잠깐 연락드리겠습니다.',
      derivativesTip: '전치사 결합: touch base with + 사람 (누구와 연락하다) / touch base on + 주제 (무엇에 관해 소통하다)',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'stick to',
      ipa: '/stɪk tuː/',
      pron: '[스틱 투]',
      soundBlock: 'stick to / my workout routine',
      meaning: '(계획·원칙·루틴을) 흔들림 없이 지키다, 고수하다',
      posLabel: '구동사 (V+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'stick to the original plan',
      collocationKo: '원래 계획을 고수하다',
      exampleEn: 'I always stick to my daily workout routine to stay healthy.',
      examplePron: '[아이 올웨이즈 스틱 투 마이 데일리 워크아웃 루틴 투 스테이 헬씨]',
      exampleKo: '나는 건강을 유지하기 위해 항상 매일의 운동 루틴을 지킨다.',
      derivativesTip: '자동사 stick + 전치사 to(보충어 이끌기) 결합 — to 뒤에 동사원형이 아닌 명사구/동명사(stick to the rules)가 옴',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'unwind',
      ipa: '/ʌnˈwaɪnd/',
      pron: '[언와인드]',
      soundBlock: 'unwind / after work',
      meaning: '(일과·긴장 후) 긴장을 풀다, 편히 쉬다',
      posLabel: '동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'unwind by listening to music',
      collocationKo: '음악을 들으며 긴장을 풀다',
      exampleEn: 'I usually unwind after work by walking in the park.',
      examplePron: '[아이 유주얼리 언와인드 애프터 워크 바이 워킹 인 더 파크]',
      exampleKo: '나는 주로 공원을 산책하며 퇴근 후 긴장을 푼다.',
      derivativesTip: '3단 변화: unwind - unwound - unwound (/ʌnˈwaɪnd/ - /ʌnˈwaʊnd/) — 발음이 [언윈드]가 아닌 [언와인드]임에 주의',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'drop off',
      ipa: '/drɑːp ɔːf/',
      pron: '[드랍 오프]',
      soundBlock: 'drop off / our bags',
      meaning: '(짐·물건을) 맡기다, (사람을 차에서) 내려주다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'drop off luggage before check-in',
      collocationKo: '체크인 전에 짐을 맡기다',
      exampleEn: 'Can we drop off our bags at the hotel front desk?',
      examplePron: '[캔 위 드랍 오프 아워 백스 앳 더 호텔 프런트 데스크]',
      exampleKo: '호텔 프런트 데스크에 저희 가방을 먼저 맡겨 둘 수 있을까요?',
      derivativesTip: '반의 구동사: pick up(맡긴 짐을 찾다 / 사람을 차에 태우다) — 대명사는 drop them off 어순으로 사용',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'freshen up',
      ipa: '/ˈfreʃ.ən ʌp/',
      pron: '[프레셔넙]',
      soundBlock: 'freshen up / in the lounge',
      meaning: '(간단히 씻고 옷매무새를 정돈하며) 재정비하다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'freshen up in the lounge',
      collocationKo: '라운지에서 간단히 씻고 재정비하다',
      exampleEn: 'We can freshen up in the airport lounge before boarding.',
      examplePron: '[위 캔 프레셔넙 인 디 에어포트 라운지 비포 보딩]',
      exampleKo: '탑승 전에 공항 라운지에서 간단히 씻고 재정비할 수 있다.',
      derivativesTip: '형용사 fresh + 동사화 접미사 -en + 부사 up 결합 — 장거리 이동 후 세안·양치·환복 등으로 기분을 상쾌하게 할 때 사용',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'binge-watch',
      ipa: '/ˈbɪndʒ.wɑːtʃ/',
      pron: '[빈지워치]',
      soundBlock: 'binge-watched / the whole series',
      meaning: '(드라마·영상을) 몰아 보다, 정주행하다',
      posLabel: '복합동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'binge-watch the entire season',
      collocationKo: '시즌 전체를 몰아서 정주행하다',
      exampleEn: 'The drama was so engaging that I binge-watched it all weekend.',
      examplePron: '[더 드라마 워즈 소 인게이징 댓 아이 빈지워치트 잇 올 위켄드]',
      exampleKo: '그 드라마가 너무 몰입감 있어서 주말 내내 몰아서 정주행했다.',
      derivativesTip: '동사: binge-watch(몰아 보다) / 명사형: binge-watching(정주행, 몰아보기)',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'live up to',
      ipa: '/lɪv ʌp tuː/',
      pron: '[리브 업 투]',
      soundBlock: 'lived up to / our expectations',
      meaning: '(기대·소문·명성에) 부응하다, 기대만큼 훌륭하다',
      posLabel: '구동사 (V+Adv+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'live up to the hype',
      collocationKo: '떠들썩한 소문·기대만큼 훌륭하다',
      exampleEn: 'The newly opened restaurant truly lived up to our expectations.',
      examplePron: '[더 눌리 오픈드 레스토랑 트룰리 리브드 업 투 아워 익스펙테이션즈]',
      exampleKo: '새로 문을 연 그 식당은 우리의 기대에 진정으로 부응했다.',
      derivativesTip: '3단어 구동사(동사+부사+전치사): 뒤에 the hype, expectations, one’s reputation 등의 명사구가 보충어로 결합함',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'pull off',
      ipa: '/pʊl ɔːf/',
      pron: '[풀 오프]',
      soundBlock: 'effortlessly pulled off / a bold look',
      meaning: '(까다로운 스타일·어려운 일을) 멋지게 소화하다, 성공적으로 해내다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'pull off a challenging project',
      collocationKo: '까다로운 프로젝트를 성공적으로 해내다',
      exampleEn: 'She effortlessly pulled off a bold color combination at the show.',
      examplePron: '[쉬 에포트리스리 풀드 오프 어 볼드 컬러 캄비네이션 앳 더 쇼]',
      exampleKo: '그녀는 쇼에서 과감한 색상 조합을 자연스럽고 멋지게 소화해 냈다.',
      derivativesTip: '까다로운 패션 스타일을 소화하거나 성사시키기 어려운 과제를 해냈을 때 두루 쓰는 핵심 구동사',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'try on',
      ipa: '/traɪ ɑːn/',
      pron: '[트라이 안]',
      soundBlock: 'try on / these running shoes',
      meaning: '(옷·신발을 맞는지 보려고) 시험 삼아 입어보다, 신어보다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'try on a blazer in a medium',
      collocationKo: '블레이저를 미디엄 사이즈로 입어보다',
      exampleEn: 'Can I try on these running shoes in the fitting area?',
      examplePron: '[캐나이 트라이 안 디즈 러닝 슈즈 인 더 피팅 에어리어]',
      exampleKo: '피팅 구역에서 이 러닝화를 한 번 신어봐도 될까요?',
      derivativesTip: '입고 있는 상태(wear)와 달리 사이즈·어울림 확인을 위해 착용해 보는 동작(try on)을 나타냄',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'figure out',
      ipa: '/ˈfɪɡ.jɚ aʊt/',
      pron: '[피겨 아웃]',
      soundBlock: 'figured out / the root cause',
      meaning: '(생각·조사 끝에) 알아내다, 이해하다, 해결책을 찾다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'figure out how to fix the issue',
      collocationKo: '문제를 해결할 방법을 알아내다',
      exampleEn: 'We finally figured out why the color tone looked slightly different.',
      examplePron: '[위 파이널리 피겨드 아웃 와이 더 컬러 톤 룩트 슬라이틀리 디퍼런트]',
      exampleKo: '우리는 왜 색조가 미세하게 다르게 보였는지 마침내 원인을 알아냈다.',
      derivativesTip: '단순히 알고 있는 상태(know)가 아니라 고민과 분석을 거쳐 해답을 찾아낼 때 쓰는 구동사',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'come up with',
      ipa: '/kʌm ʌp wɪð/',
      pron: '[컴 업 위드]',
      soundBlock: 'came up with / a practical way',
      meaning: '(아이디어·해결책을) 떠올리다, 생각해 내다',
      posLabel: '구동사 (V+Adv+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'come up with a practical idea',
      collocationKo: '실용적인 아이디어를 생각해 내다',
      exampleEn: 'Our team came up with a practical way to save time.',
      examplePron: '[아워 팀 케임 업 위드 어 프랙티컬 웨이 투 세이브 타임]',
      exampleKo: '우리 팀은 시간을 절약할 실용적인 방법을 생각해 냈다.',
      derivativesTip: '과거형: came up with — 뒤에 an idea, a plan, a solution 등의 명사구가 이어짐',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'keep up with',
      ipa: '/kiːp ʌp wɪð/',
      pron: '[킵 업 위드]',
      soundBlock: 'keep up with / the latest standards',
      meaning: '(빠른 변화·진도·트렌드에) 뒤처지지 않고 따라가다',
      posLabel: '구동사 (V+Adv+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'keep up with industry trends',
      collocationKo: '업계 트렌드를 놓치지 않고 따라가다',
      exampleEn: 'Our engineers always keep up with the latest industry standards.',
      examplePron: '[아워 엔지니어즈 올웨이즈 킵 업 위드 더 레이티스트 인더스트리 스탠더즈]',
      exampleKo: '우리 엔지니어들은 항상 최신 업계 표준을 놓치지 않고 따라간다.',
      derivativesTip: '유사 구동사: catch up with(뒤처진 상태에서 따라잡다) vs keep up with(같은 속도로 뒤처지지 않고 보조를 맞추다)',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'run out of',
      ipa: '/rʌn aʊt əv/',
      pron: '[런 아우러브]',
      soundBlock: 'run out of / stock',
      meaning: '(시간·재료·배터리 등을) 다 써버리다, 바닥나다',
      posLabel: '구동사 (V+Adv+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'run out of time during the test',
      collocationKo: '시험 중에 시간이 다 떨어지다',
      exampleEn: 'We need to order more supplies before we run out of stock.',
      examplePron: '[위 니드 투 오더 모어 서플라이즈 비포 위 런 아우러브 스탁]',
      exampleKo: '재고가 바닥나기 전에 자재를 더 주문해야 한다.',
      derivativesTip: '주어가 사람/기관일 때 run out of + 명사(재료를 다 쓰다)로 쓰며, 재료 자체가 주어일 때는 The battery ran out처럼 자동사로 씀',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'put off',
      ipa: '/pʊt ɔːf/',
      pron: '[풋 오프]',
      soundBlock: 'never put off / urgent repairs',
      meaning: '(일정·결정을) 미루다, 연기하다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'never put off today’s task',
      collocationKo: '오늘 할 과제를 미루지 않다',
      exampleEn: 'We never put off urgent repairs until the next day.',
      examplePron: '[위 네버 풋 오프 어전트 리페어즈 언틸 더 넥스트 데이]',
      exampleKo: '우리는 시급한 수리를 절대 다음 날로 미루지 않는다.',
      derivativesTip: '동의어: postpone, delay(연기하다) — 뒤에 동사가 올 때는 반드시 동명사(put off -ing)를 취함',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'call off',
      ipa: '/kɔːl ɔːf/',
      pron: '[콜 오프]',
      soundBlock: 'called off / the outdoor concert',
      meaning: '(예정된 행사·회의를) 취소하다, 중단하다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'call off the match due to rain',
      collocationKo: '우천으로 경기를 취소하다',
      exampleEn: 'The organizers called off the outdoor concert because of heavy rain.',
      examplePron: '[디 오거나이저즈 콜드 오프 디 아웃도어 콘서트 비코즈 오브 헤비 레인]',
      exampleKo: '주최 측은 폭우 때문에 야외 콘서트를 취소했다.',
      derivativesTip: '동의어: cancel(취소하다) — put off(연기하다)와 call off(취소하다)는 시험 빈출 비교 구동사',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'look forward to',
      ipa: '/lʊk ˈfɔːr.wɚd tuː/',
      pron: '[룩 포워드 투]',
      soundBlock: 'look forward to / discussing the project',
      meaning: '~을 고대하다, 설레며 기다리다',
      posLabel: '구동사 (V+Adv+Prep)',
      compLabel: '동사+전치사구 보충어',
      collocation: 'look forward to working with you',
      collocationKo: '당신과 함께 일하기를 고대하다',
      exampleEn: 'I look forward to discussing the project with you in person.',
      examplePron: '[아이 룩 포워드 투 디스커싱 더 프로젝트 위드 유 인 퍼슨]',
      exampleKo: '직접 뵙고 그 프로젝트에 대해 논의하기를 고대합니다.',
      derivativesTip: '핵심 어법: 끝의 to는 전치사이므로 뒤에 동사원형이 아니라 명사 또는 동명사(V-ing: discussing, hearing)가 와야 함',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'work out',
      ipa: '/wɝːk aʊt/',
      pron: '[워크 아웃]',
      soundBlock: 'work out / in the morning',
      meaning: '운동하다 / (문제가) 잘 풀리다, 해결책을 도출하다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'work out three times a week',
      collocationKo: '일주일에 세 번 운동하다',
      exampleEn: 'I usually work out in the morning to stay energized all day.',
      examplePron: '[아이 유주얼리 워크 아웃 인 더 모닝 투 스테이 에너자이즈드 올 데이]',
      exampleKo: '나는 하루 종일 활력을 유지하기 위해 주로 아침에 운동한다.',
      derivativesTip: '동사구: work out(운동하다 / 해결하다) vs 붙여 쓰는 명사: workout(운동, 트레이닝 — a daily workout routine)',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'pay off',
      ipa: '/peɪ ɔːf/',
      pron: '[페이 오프]',
      soundBlock: 'finally paid off / in the competition',
      meaning: '(노력·투자가) 결실을 맺다, 보답받다 / (빚을) 다 갚다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'consistent effort pays off',
      collocationKo: '꾸준한 노력이 빛을 발하다(결실을 맺다)',
      exampleEn: 'Months of deliberate practice finally paid off in the competition.',
      examplePron: '[먼쓰 오브 딜리버릿 프랙티스 파이널리 페이드 오프 인 더 컴피티션]',
      exampleKo: '수개월간의 의도적인 연습이 마침내 대회에서 결실을 맺었다.',
      derivativesTip: '자동사로 쓰일 때 주어(hard work, effort, patience)가 좋은 성과로 이어지다(결실을 맺다)라는 뜻을 나타냄',
    },
    {
      level: '오픽(OPIc)·구동사',
      word: 'stand out',
      ipa: '/stænd aʊt/',
      pron: '[스탠드 아웃]',
      soundBlock: 'always stands out / for its fine detail',
      meaning: '두드러지다, 눈에 확 띄다',
      posLabel: '구동사 (V)',
      compLabel: '동사 (V)',
      collocation: 'stand out from the crowd',
      collocationKo: '남들 사이에서 단연 돋보이다',
      exampleEn: 'A master craftsman’s work always stands out for its fine detail.',
      examplePron: '[어 마스터 크래프츠먼즈 워크 올웨이즈 스탠즈 아웃 포 이츠 파인 디테일]',
      exampleKo: '장인의 작업물은 정교한 디테일 덕분에 언제나 단연 돋보인다.',
      derivativesTip: '동사구: stand out(두드러지다) / 파생 형용사: outstanding(뛰어난, 두드러진) / 명사: standout(눈에 띄는 사람·물건)',
    },
  ],
};

export function getExpandedWordbookByDay(
  level: WordbookLevel,
  day: number
): WordbookEntry[] {
  const pool = CORE_WORDBOOK_POOL[level] || CORE_WORDBOOK_POOL['중등 필수'];
  const safeDay = Number.isFinite(day) && day >= 1 ? Math.floor(day) : 1;
  // 영역별 20단어 고정 풀을 5단어 단위로 순환(Set 1~4 주기)하여 반환
  const offset = ((safeDay - 1) * 5) % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
}

// ============================================================================
// 3. 2교시 구문 아카이브 12선 & 결정론적 어순 조립 생성기
//    - 7번 비교 구문 패러프레이즈를 원문 의미(경향성: tend to show)와 완벽히 일치
// ============================================================================

const SYNTAX_ARCHIVE_12: Omit<GeneratedSyntaxItem, 'scrambleTokens'>[] = [
  {
    id: 'syn-01',
    openerRule: '구문 #1 · 5형식 동명사구 주어 & 형용사 목적격보어(OC)',
    targetWord: 'feasible',
    matchedForm: 'feasible (형용사 OC)',
    sentenceEn: 'Streamlining the approval process makes the entire project feasible.',
    pronLine: '[스트림라이닝 디 어프루벌 프로세스 / 메익스 디 인타이어 프로젝트 피저블]',
    sentenceKo: '승인 절차를 간소화하는 것은 전체 프로젝트를 실현 가능하게 만든다.',
    paraphrasedEn: 'Simplifying the approval process keeps the whole project realistic and achievable.',
  },
  {
    id: 'syn-02',
    openerRule: '구문 #2 · 부정어(Not until) 문두 이동과 주절 조동사 도치',
    targetWord: 'broaden',
    matchedForm: 'can we genuinely broaden (도치 V)',
    sentenceEn: 'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
    pronLine: '[낫 언틸 위 스텝 아우러브 아워 컴포트 존 / 캔 위 제뉴인리 브로든 아워 퍼스펙티브]',
    sentenceKo: '우리가 안전지대를 벗어나고 나서야 비로소 우리는 진정으로 시야를 넓힐 수 있다.',
    paraphrasedEn: 'Only when we step out of our comfort zone can we truly expand our perspective.',
  },
  {
    id: 'syn-03',
    openerRule: '구문 #3 · 선행사 포함 관계대명사 What 명사절 주어 (단수 수일치)',
    targetWord: 'heritage',
    matchedForm: "What matters most ... is (What이 matters의 주어)",
    sentenceEn: "What matters most in sustainable management is harmonizing the brand's heritage with innovation.",
    pronLine: '[왓 매터즈 모스트 인 서스테이너블 매니지먼트 / 이즈 하머나이징 더 브랜즈 헤리티지 위드 이노베이션]',
    sentenceKo: '지속 가능한 경영에서 가장 중요한 것은 브랜드의 전통을 혁신과 조화시키는 것이다.',
    paraphrasedEn: "The essence of sustainable management lies in blending the brand's heritage with innovation.",
  },
  {
    id: 'syn-04',
    openerRule: '구문 #4 · 타동사 + 직접목적어(A) + 전치사구 보충어(with B)',
    targetWord: 'aesthetic',
    matchedForm: "blends ... with a modern aesthetic (전치사구 보충어)",
    sentenceEn: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
    pronLine: '[더 컬렉션 심리슬리 블렌즈 / 더 브랜즈 헤리티지 / 위더 모던 에스쎄틱]',
    sentenceKo: '그 컬렉션은 브랜드의 전통과 현대적인 미학을 조화롭게 결합한다.',
    paraphrasedEn: "The new line harmoniously combines the brand's heritage with contemporary design.",
  },
  {
    id: 'syn-05',
    openerRule: '구문 #5 · 자동사 + 전치사구 보충어(stick to) & 목적의 to부정사 부가어',
    targetWord: 'stick to',
    matchedForm: 'stick to my daily workout routine',
    sentenceEn: 'I always stick to my daily workout routine to clear my head.',
    pronLine: '[아이 올웨이즈 스틱 투 / 마이 데일리 워크아웃 루틴 / 투 클리어 마이 헤드]',
    sentenceKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
    paraphrasedEn: 'I consistently follow my daily exercise schedule in order to refresh my mind.',
  },
  {
    id: 'syn-06',
    openerRule: '구문 #6 · 가주어(It) - 진주어(to V) 정중한 요청 의문문',
    targetWord: 'accommodate',
    matchedForm: 'to accommodate (진주어 to부정사)',
    sentenceEn: 'Would it be possible to accommodate a late check-out request?',
    pronLine: '[우딧 비 파서블 / 투 어카머데이트 / 어 레이트 체크아웃 리퀘스트]',
    sentenceKo: '혹시 레이트 체크아웃 요청을 수용해 배려해 주실 수 있을까요?',
    paraphrasedEn: 'Could you help us arrange a late check-out if a room is available?',
  },
  {
    id: 'syn-07',
    openerRule: '구문 #7 · The 비교급 ~, the 비교급 ~ (비례·경향성 비교 구문)',
    targetWord: 'autonomy',
    matchedForm: 'The more autonomy ..., the more ...',
    sentenceEn: 'The more autonomy learners are given, the greater intrinsic motivation they display.',
    pronLine: '[더 모어 오타너미 러너즈 아 기븐, / 더 그레이터 인트린직 모티베이션 데이 디스플레이]',
    sentenceKo: '학습자에게 자율성이 더 많이 주어질수록, 그들은 더 큰 내재적 동기를 보인다.',
    paraphrasedEn: 'The more autonomy learners are given, the more intrinsic motivation they tend to show.',
  },
  {
    id: 'syn-08',
    openerRule: '구문 #8 · 복수명사를 거느린 동명사구 주어의 단수 동사 수일치',
    targetWord: 'cognitive',
    matchedForm: 'Exposing ourselves ... prevents (단수 V)',
    sentenceEn: 'Exposing ourselves to diverse viewpoints prevents cognitive rigidity.',
    pronLine: '[익스포징 아워셀브즈 투 다이버스 뷰포인츠 / 프리벤츠 카그너티브 리지더티]',
    sentenceKo: '다양한 관점에 우리 자신을 노출시키는 것은 인지적 경직성을 예방한다.',
    paraphrasedEn: 'When we actively engage with diverse viewpoints, we can avoid cognitive rigidity.',
  },
  {
    id: 'syn-09',
    openerRule: '구문 #9 · 2형식 형용사 보어(SC) & 등위접속사(, so) + 자동사 보충어(resonate with)',
    targetWord: 'resonate',
    matchedForm: 'resonates with the audience',
    sentenceEn: 'The review is deeply informative, so it resonates with the audience.',
    pronLine: '[더 리뷰 이즈 디플리 인포머티브, / 소 잇 레저네이츠 위드 디 오디언스]',
    sentenceKo: '그 리뷰는 내용이 매우 유익해서, 시청자들에게 깊은 공감을 불러일으킨다.',
    paraphrasedEn: 'Because the review provides rich insights, it evokes strong empathy from viewers.',
  },
  {
    id: 'syn-10',
    openerRule: '구문 #10 · 4형식 수여동사 기반 동명사구 (giving + IO + DO)',
    targetWord: 'heads-up',
    matchedForm: 'giving me[IO] a quick heads-up[DO]',
    sentenceEn: 'Thanks for giving me a quick heads-up on the schedule.',
    pronLine: '[땡스 포 기빙 미 / 어 퀵 헤즈업 / 안 더 스케줄]',
    sentenceKo: '일정에 대해 미리 간단히 귀띔해 주셔서 감사합니다.',
    paraphrasedEn: 'I appreciate your letting me know in advance about the schedule.',
  },
  {
    id: 'syn-11',
    openerRule: '구문 #11 · 3형식 타동사 + 방식 부사(meticulously) 수식 구문',
    targetWord: 'meticulously',
    matchedForm: 'reviews ... meticulously (동사 수식 부사)',
    sentenceEn: 'Our quality team reviews every specification meticulously before delivery.',
    pronLine: '[아워 퀄리티 팀 리뷰즈 에브리 스페서피케이션 머티큘러슬리 비포 딜리버리]',
    sentenceKo: '우리 품질 팀은 인도 전에 모든 세부 사양을 빈틈없이 꼼꼼하게 검토한다.',
    paraphrasedEn: 'Every technical specification is carefully inspected by our team prior to delivery.',
  },
  {
    id: 'syn-12',
    openerRule: '구문 #12 · 구동사 live up to + 명사구 보충어(the hype)',
    targetWord: 'live up to',
    matchedForm: 'lived up to the hype',
    sentenceEn: 'The new documentary definitely lived up to the hype.',
    pronLine: '[더 뉴 다큐멘터리 데피니틀리 리브드 업 투 더 하입]',
    sentenceKo: '그 새 다큐멘터리는 사전의 떠들썩한 기대(소문)에 확실히 부응했다.',
    paraphrasedEn: 'The new documentary truly met everyone’s high expectations.',
  },
];

export function generateCombinatorialSentences(
  seed: number,
  count: number
): GeneratedSyntaxItem[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const safeSeed = Number.isFinite(seed) && seed >= 1 ? Math.floor(seed) : 1;
  const shuffledArchive = deterministicShuffle(SYNTAX_ARCHIVE_12, safeSeed * 17);
  const sliceCount = Math.min(Math.floor(count), shuffledArchive.length);

  return shuffledArchive.slice(0, sliceCount).map((item, idx) => {
    const rawTokens = item.sentenceEn.trim().split(/\s+/);
    const scrambled = deterministicShuffle(rawTokens, safeSeed * 31 + idx * 13);
    return {
      ...item,
      scrambleTokens: scrambled,
    };
  });
}

// ============================================================================
// 4. 4교시 학술 6대 영역 독해 예문 (학습용 창작 독해 예문임을 명확히 표기)
// ============================================================================

export const EBS_MAJOR_TOPICS: AcademicTopicPassage[] = [
  {
    id: 'topic-psych',
    category: '🧠 심리·의사결정 (학습용 창작 학술 예문)',
    title: '확증 편향(Confirmation Bias)의 극복과 다양한 관점 수용',
    passageEn:
      'People often tend to favor information that confirms their existing beliefs. Exposing ourselves to diverse viewpoints helps prevent cognitive rigidity and allows us to make more balanced judgments.',
    passagePron:
      '[피플 오픈 텐드 투 페이버 인포메이션 댓 컨펌즈 데어 이그지스팅 빌리프스. 익스포징 아워셀브즈 투 다이버스 뷰포인츠 헬프스 프리벤트 카그너티브 리지더티 앤 얼라우즈 어스 투 메익 모어 밸런스트 저지먼츠]',
    passageKo:
      '사람들은 흔히 자신의 기존 신념을 확인해 주는 정보를 선호하는 경향이 있다. 다양한 관점에 우리 자신을 노출시키는 것은 인지적 경직성을 예방하고 더 균형 잡힌 판단을 내리도록 돕는다.',
    paraphraseSummary:
      '기존 신념만 고수하는 확증 편향을 줄이기 위해 다양한 시각을 접하는 태도가 필요하다. (학습용 창작 독해 예문)',
    keywords: [
      'confirmation bias(확증 편향)',
      'diverse viewpoints(다양한 관점)',
      'cognitive rigidity(인지적 경직성)',
    ],
  },
  {
    id: 'topic-env',
    category: '🌱 환경·생태학 (학습용 창작 학술 예문)',
    title: '핵심종(Keystone Species) 보호와 생태계 먹이그물의 안정성',
    passageEn:
      'In a complex ecosystem, losing a keystone species can trigger a widespread cascade of disruptions across the food web. Conserving habitats and biodiversity is therefore vital for ecological stability.',
    passagePron:
      '[인 어 컴플렉스 에코시스템, 루징 어 키스톤 스피시즈 캔 트리거 어 와이드스프레드 캐스케이드 오브 디스럽션즈 어크로스 더 푸드 웹. 컨서빙 해비태츠 앤 바이오다이버서티 이즈 데어포 바이틀 포 이컬러지컬 스태빌러티]',
    passageKo:
      '복잡한 생태계에서 핵심종(keystone species)을 잃는 것은 먹이그물 전반에 걸쳐 광범위한 연쇄 교란을 촉발할 수 있다. 따라서 서식지와 생물 다양성을 보전하는 것은 생태계 안정성에 매우 중요하다.',
    paraphraseSummary:
      '생태계 내 핵심종의 상실은 먹이그물 전반에 연쇄적인 교란을 일으킬 수 있으므로 생물 다양성 보전이 중요하다. (학습용 창작 독해 예문)',
    keywords: [
      'keystone species(핵심종)',
      'cascade of disruptions(연쇄 교란)',
      'biodiversity(생물 다양성)',
    ],
  },
  {
    id: 'topic-sci',
    category: '🔬 인지·언어학습 (학습용 창작 학술 예문)',
    title: '의미 단위 청킹(Chunking) 연습과 실전 의사소통의 효율성',
    passageEn:
      'When learners practice a language in meaningful sound blocks rather than isolated words, working memory can process and retrieve expressions more smoothly during real-time conversation.',
    passagePron:
      '[웬 러너즈 프랙티스 어 랭귀지 인 미닝풀 사운드 블록스 래더 댄 아이솔레이티드 워즈, 워킹 메모리 캔 프로세스 앤 리트리브 익스프레션즈 모어 스무들리 두링(듀링) 리얼타임 컨버세이션]',
    passageKo:
      '학습자가 개별 단어가 아니라 의미 있는 소리블록(청크) 단위로 언어를 연습할 때, 작업 기억은 실시간 대화 중에 표현을 더 매끄럽게 처리하고 인출할 수 있다.',
    paraphraseSummary:
      '단어를 낱개로 외우기보다 의미 단위(청크)로 묶어 연습하면 실전 발화와 정보 처리에 도움이 된다. (학습용 창작 독해 예문)',
    keywords: [
      'meaningful chunks(의미 단위 청크)',
      'working memory(작업 기억)',
      'retrieve expressions(표현을 인출하다)',
    ],
  },
  {
    id: 'topic-econ',
    category: '📊 경영·비즈니스 (학습용 창작 학술 예문)',
    title: '업무 공정 간소화(Streamlining)와 선제적 품질 관리',
    passageEn:
      'Streamlining internal workflows and verifying specifications meticulously at each stage can reduce costly rework. Taking a proactive approach makes tight project schedules much more feasible.',
    passagePron:
      '[스트림라이닝 인터널 워크플로우즈 앤 베러파잉 스페서피케이션즈 머티큘러슬리 앳 이치 스테이지 캔 리듀스 코슬리 리워크. 테이킹 어 프로액티브 어프로치 메익스 타이트 프로젝트 스케줄즈 머치 모어 피저블]',
    passageKo:
      '내부 업무 공정을 간소화하고 각 단계에서 세부 사양을 빈틈없이 검증하면 비용이 많이 드는 재작업을 줄일 수 있다. 선제적인 접근 방식을 취하는 것은 촉박한 프로젝트 일정을 훨씬 더 실현 가능하게 만든다.',
    paraphraseSummary:
      '공정 효율화와 단계별 선제적 사양 검증은 재작업을 줄이고 일정의 실현 가능성을 높인다. (학습용 창작 독해 예문)',
    keywords: [
      'streamline workflows(공정을 간소화하다)',
      'proactive approach(선제적 접근)',
      'feasible(실현 가능한)',
    ],
  },
  {
    id: 'topic-art',
    category: '🎨 디자인·미학 (학습용 창작 학술 예문)',
    title: '브랜드 고유의 전통(Heritage)과 현대적 미학(Aesthetic)의 조화',
    passageEn:
      "In contemporary design, many brands seek to harmonize their historical heritage with a clean modern aesthetic. Such designs often resonate with consumers who value both authenticity and practicality.",
    passagePron:
      '[인 컨템퍼러리 디자인, 매니 브랜즈 시크 투 하머나이즈 데어 히스토리컬 헤리티지 위더 클린 모던 에스쎄틱. 서치 디자인즈 오픈 레저네이트 위드 컨슈머즈 후 밸류 보쓰 오쎈티서티 앤 프랙티캘러티]',
    passageKo:
      '현대 디자인에서 많은 브랜드는 자신들의 역사적 전통을 깔끔한 현대적 미학과 조화시키고자 한다. 이러한 디자인은 정통성과 실용성을 모두 중시하는 소비자들에게 종종 깊은 공감을 불러일으킨다.',
    paraphraseSummary:
      '브랜드의 고유한 전통과 현대적 미학을 조화시킨 디자인은 정통성과 실용성을 중시하는 소비자와 공감대를 형성한다. (학습용 창작 독해 예문)',
    keywords: [
      'brand heritage(브랜드 전통·유산)',
      'modern aesthetic(현대적 미학)',
      'authenticity(정통성·진정성)',
    ],
  },
  {
    id: 'topic-edu',
    category: '🎓 교육·동기부여 (학습용 창작 학술 예문)',
    title: '학습자 자율성(Autonomy) 지원과 내재적 동기(Intrinsic Motivation)',
    passageEn:
      'Providing learners with clear structure while respecting their autonomy can foster intrinsic motivation. The more autonomy learners are given in choosing their topics, the more active engagement they tend to show.',
    passagePron:
      '[프로바이딩 러너즈 위드 클리어 스트럭처 와일 리스펙팅 데어 오타너미 캔 파스터 인트린직 모티베이션. 더 모어 오타너미 러너즈 아 기븐 인 추징 데어 토픽스, 더 모어 액티브 인게이지먼트 데이 텐드 투 쇼]',
    passageKo:
      '학습자에게 명확한 체계를 제공하면서 동시에 자율성을 존중하면 내재적 동기를 기를 수 있다. 주제 선택에서 학습자에게 자율성이 더 많이 주어질수록 그들은 더 적극적인 참여도를 보이는 경향이 있다.',
    paraphraseSummary:
      '체계적인 안내와 함께 학습자의 자율성을 존중할 때 내재적 동기와 참여도가 높아지는 경향이 있다. (학습용 창작 독해 예문)',
    keywords: [
      'learner autonomy(학습자 자율성)',
      'intrinsic motivation(내재적 동기)',
      'active engagement(적극적 참여)',
    ],
  },
];

// ============================================================================
// 5. 5교시 핵심 빈출 어법 연습 10문항 (학습용 창작·변형 문항)
// ============================================================================

export const GRAMMAR_406_QUIZ_BANK: GrammarQuizItem[] = [
  {
    id: 1,
    schoolTag: '핵심 빈출 어법 연습 #1 (동명사구 주어 수일치)',
    grammarCategory: '동명사구 주어(Streamlining ~) 단수 취급',
    sentenceBefore: 'Streamlining the internal approval procedures',
    choiceA: 'make',
    choiceB: 'makes',
    sentenceAfter: 'the tentative launch schedule feasible.',
    correct: 'B',
    explanation:
      '동사 바로 앞에 복수명사(procedures)가 있지만, 문장의 진짜 주어는 동명사구(Streamlining ~)이므로 단수 취급하여 단수 동사 makes를 써야 합니다.',
  },
  {
    id: 2,
    schoolTag: '핵심 빈출 어법 연습 #2 (5형식 목적격보어 품사)',
    grammarCategory: '5형식 make + 목적어(DO) + 형용사 보어(OC)',
    sentenceBefore: 'Simplifying the workflow makes the entire project',
    choiceA: 'feasible',
    choiceB: 'feasibly',
    sentenceAfter: 'within the tight deadline.',
    correct: 'A',
    explanation:
      '우리말로는 "실현 가능하게"라고 해석되지만, 동사 makes가 아니라 목적어(the entire project)의 상태를 보충 설명하는 목적격보어(OC) 자리이므로 형용사 feasible이 맞습니다.',
  },
  {
    id: 3,
    schoolTag: '핵심 빈출 어법 연습 #3 (명사절 주어 What vs That)',
    grammarCategory: '선행사 포함 관계대명사 What 명사절 주어',
    sentenceBefore: '',
    choiceA: 'What',
    choiceB: 'That',
    sentenceAfter:
      "matters most in sustainable management is harmonizing the brand's heritage with eco-friendly innovation.",
    correct: 'A',
    explanation:
      'What matters most in sustainable management 전체가 문장의 주어인 명사절입니다. What은 동사 matters의 주어이자 "~하는 것(가장 중요한 것)"이라는 뜻을 포함하며, 뒤의 단수 동사 is와 보어 harmonizing ...이 주어를 설명합니다.',
  },
  {
    id: 4,
    schoolTag: '핵심 빈출 어법 연습 #4 (문두 부정어 도치 구문)',
    grammarCategory: 'Not until 부사절 문두 이동 시 주절 조동사 도치',
    sentenceBefore: 'Not until we step out of our comfort zone',
    choiceA: 'we can',
    choiceB: 'can we',
    sentenceAfter: 'genuinely broaden our perspective on life.',
    correct: 'B',
    explanation:
      '부정어구(Not until we step out of our comfort zone)가 문장 맨 앞으로 이동했으므로, 주절에서는 조동사(can)가 주어(we) 앞으로 도치된 can we가 올바른 어순입니다.',
  },
  {
    id: 5,
    schoolTag: '핵심 빈출 어법 연습 #5 (자동사 + 전치사구 보충어)',
    grammarCategory: '자동사 resonate + 전치사 with 결합',
    sentenceBefore: 'The documentary is deeply informative, so it naturally',
    choiceA: 'resonates',
    choiceB: 'resonates with',
    sentenceAfter: 'a wide audience around the world.',
    correct: 'B',
    explanation:
      'resonate(~와 공명하다, 깊은 공감을 불러일으키다)는 자동사이므로 뒤에 대상을 연결할 때 전치사구 보충어(with + 명사구)가 필요합니다.',
  },
  {
    id: 6,
    schoolTag: '핵심 빈출 어법 연습 #6 (동사 수식 방식 부사)',
    grammarCategory: '3형식 타동사를 수식하는 방식 부사(Adv)',
    sentenceBefore: 'Our engineering team inspected every technical specification',
    choiceA: 'meticulous',
    choiceB: 'meticulously',
    sentenceAfter: 'before signing the final contract.',
    correct: 'B',
    explanation:
      '목적어(every technical specification)까지 모두 갖춘 3형식 완전한 문장에서 동사(inspected)의 방식을 꾸며주는 부가어(Adjunct) 자리이므로 부사 meticulously가 맞습니다.',
  },
  {
    id: 7,
    schoolTag: '핵심 빈출 어법 연습 #7 (전치사 to + 동명사)',
    grammarCategory: '구동사 look forward to의 전치사 to + V-ing',
    sentenceBefore: 'We truly look forward to',
    choiceA: 'collaborate',
    choiceB: 'collaborating',
    sentenceAfter: 'with your team on the upcoming project.',
    correct: 'B',
    explanation:
      'look forward to(~을 고대하다)에서 끝의 to는 부정사 표지가 아니라 전치사이므로, 뒤에는 동사원형이 아닌 동명사(collaborating)가 와야 합니다.',
  },
  {
    id: 8,
    schoolTag: '핵심 빈출 어법 연습 #8 (복합 동명사구 주어 수일치)',
    grammarCategory: '동명사구 주어(Exposing ourselves ~) 단수 수일치',
    sentenceBefore: 'Exposing ourselves to diverse viewpoints',
    choiceA: 'prevent',
    choiceB: 'prevents',
    sentenceAfter: 'cognitive rigidity in decision-making.',
    correct: 'B',
    explanation:
      '전치사 to 뒤의 viewpoints가 복수명사일지라도 문장 전체의 주어는 동명사구(Exposing ~)이므로 단수 동사 prevents로 수일치해야 합니다.',
  },
  {
    id: 9,
    schoolTag: '핵심 빈출 어법 연습 #9 (어휘·어법: complement vs compliment)',
    grammarCategory: '보완하다(complement) vs 칭찬하다(compliment)',
    sentenceBefore: 'These minimalist accessories nicely',
    choiceA: 'complement',
    choiceB: 'compliment',
    sentenceAfter: 'the clean tailored silhouette of the suit.',
    correct: 'A',
    explanation:
      '실루엣을 "보완하여 돋보이게 하다"라는 문맥이므로 철자 e를 쓰는 complement가 맞습니다. (철자 i를 쓰는 compliment는 "칭찬하다"라는 뜻입니다.)',
  },
  {
    id: 10,
    schoolTag: '핵심 빈출 어법 연습 #10 (이어동사와 대명사 목적어 어순)',
    grammarCategory: '타동사+부사 구동사(wrap up)의 대명사 위치',
    sentenceBefore: 'The meeting ran over time, so we decided to',
    choiceA: 'wrap it up',
    choiceB: 'wrap up it',
    sentenceAfter: 'before noon.',
    correct: 'A',
    explanation:
      '타동사+부사로 이루어진 이어동사(wrap up, try on, drop off, pull off)의 목적어가 대명사(it, them)일 때는 반드시 동사와 부사 사이(wrap it up)에 위치해야 합니다.',
  },
];

// ============================================================================
// 6. 5교시 내 학교·모의고사 지문 분석기 (약어·소수점 보호 및 동작 기준 투명 고지)
// ============================================================================

export function analyzeCustomSchoolPassage(rawText: string): CustomPassageAnalysis {
  const cleaned = (rawText || '').trim();
  if (!cleaned) {
    return {
      isEmpty: true,
      statusMessage:
        '텍스트 상자가 비어 있습니다. 분석할 영어 문장(4단어 이상)을 입력해 주세요.',
      sentences: [],
    };
  }

  // 주요 약어(Mr., Dr., U.S., e.g., i.e. 등)와 소수점(3.14)의 마침표 보호
  const DOT_TOKEN = '__PROTECTED_DOT__';
  const protectedText = cleaned
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|U\.S|U\.K)\./gi, (m) =>
      m.replace(/\./g, DOT_TOKEN)
    )
    .replace(/(\d)\.(\d)/g, `$1${DOT_TOKEN}$2`);

  const rawChunks = protectedText
    .split(/(?:[.!?]+)\s+|\n+/)
    .map((s) => s.replace(new RegExp(DOT_TOKEN, 'g'), '.').trim())
    .filter((s) => s.length > 0);

  const validSentences = rawChunks.filter((s) => s.split(/\s+/).length >= 4);

  if (validSentences.length === 0) {
    return {
      isEmpty: true,
      statusMessage:
        '4단어 이상으로 이루어진 완전한 영어 문장이 감지되지 않았습니다. (4단어 미만 단문은 분석에서 제외됩니다.)',
      sentences: [],
    };
  }

  const STOP_WORDS = new Set([
    'there', 'their', 'about', 'would', 'could', 'should', 'these', 'those',
    'where', 'which', 'while', 'after', 'before', 'until', 'under', 'through',
  ]);

  const parsedList: CustomPassageSentenceItem[] = validSentences.map(
    (sent, index) => {
      const hasEndPunct = /[.!?]$/.test(sent);
      const normalizedSent = hasEndPunct ? sent : `${sent}.`;
      const words = normalizedSent.split(/\s+/);

      const BREAK_BEFORE = new Set([
        'in', 'on', 'at', 'for', 'with', 'by', 'from', 'to', 'within',
        'before', 'after', 'during', 'because', 'so', 'and', 'but', 'while',
      ]);

      const chunkedWords: string[] = [];
      let sinceLastBreak = 0;
      words.forEach((w, wIdx) => {
        const bare = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (
          wIdx > 1 &&
          sinceLastBreak >= 2 &&
          wIdx < words.length - 1 &&
          BREAK_BEFORE.has(bare)
        ) {
          chunkedWords.push('/');
          sinceLastBreak = 0;
        }
        chunkedWords.push(w);
        sinceLastBreak += 1;
        if (w.endsWith(',') && wIdx < words.length - 1) {
          chunkedWords.push('/');
          sinceLastBreak = 0;
        }
      });

      const soundBlockEn = chunkedWords.join(' ').replace(/\s+\/\s+/g, ' / ');

      let targetIdx = words.findIndex((w, i) => {
        const bare = w.replace(/[^a-zA-Z-]/g, '');
        return i > 0 && bare.length >= 5 && !STOP_WORDS.has(bare.toLowerCase());
      });
      if (targetIdx === -1) targetIdx = Math.min(1, words.length - 1);

      const rawTarget = words[targetIdx];
      const answerWord = rawTarget.replace(/^[^a-zA-Z0-9-]+|[^a-zA-Z0-9-]+$/g, '');
      const blankQuizSentence = words
        .map((w, i) => (i === targetIdx ? '[ _____ ]' : w))
        .join(' ');

      const scrambledWords = deterministicShuffle(words, (index + 1) * 37);

      return {
        idx: index + 1,
        rawEn: normalizedSent,
        soundBlockEn,
        blankQuizSentence,
        answerWord: answerWord || rawTarget,
        scrambledWords,
      };
    }
  );

  return {
    isEmpty: false,
    statusMessage: `총 ${parsedList.length}개 문장 분석됨 — ※ 빈칸 연습은 문장 내 5글자 이상 첫 단어를 자동으로 가리는 방식이며, 4단어 미만 단문은 제외됩니다.`,
    sentences: parsedList,
  };
}
