import { useState, useRef, useEffect } from 'react';

// ==========================================
// 1. 타입 정의 (TypeScript Strict 호환)
// ==========================================
type CompId = 'S' | 'V' | 'IO' | 'DO' | 'SC' | 'OC' | 'M';
type PosId = 'N' | 'Pron' | 'V' | 'Adj' | 'Adv' | 'Prep' | 'Conj' | 'Interj' | 'Det';

interface VocabItem {
  id: number;
  type: '일상 회화' | '고급/실무';
  word: string;
  masked: string;
  pron: string;
  meaning: string;
  enDef: string;
  exampleBlank: string;
  pos: PosId;
  posLabel: string;
  comp: CompId;
  compLabel: string;
  roleDesc: string;
  collocation: string;
  collocationKo: string;
}

interface SynonymScale {
  baseWord: string;
  pos: string;
  meaning: string;
  levels: {
    strength: '매우 강함 (Extreme)' | '강함 (Strong)' | '보통 (Neutral)' | '약함/완곡 (Mild)';
    words: { word: string; nuance: string }[];
  }[];
}

interface TrainingSentence {
  id: number;
  tag: string;
  targetWord: string;
  structure: string;
  koLine: string;
  enLine: string;
  rawEn: string;
  pronLine: string;
  naturalKo: string;
}

interface WordToken {
  word: string;
  comp: CompId | '독립어';
  compLabel: string;
  pos: PosId;
  posLabel: string;
}

interface DiagramSentence {
  id: string;
  label: string;
  tokens: WordToken[];
  translation: string;
  skeleton: string;
  patternType: string;
}

interface ThemeData {
  id: string;
  group: 'trend' | 'biz' | 'life' | 'travel';
  portal?: 'NAVER' | 'DAUM' | 'GOOGLE';
  rank?: number;
  title: string;
  badge: string;
  dateLabel: string;
  coachPoint: string;
  pattern: {
    en: string;
    pron: string;
    nuance: string;
  };
  vocab: VocabItem[];
  synonymScale: SynonymScale;
  sentences: TrainingSentence[];
  quiz: {
    beginner: {
      word: string;
      options: string[];
      answerIdx: number;
      explanation: string;
    };
    intermediate: {
      sentenceBefore: string;
      sentenceAfter: string;
      hint: string;
      options: string[];
      answerIdx: number;
      explanation: string;
    };
    advanced: {
      sentenceBefore: string;
      highlightWord: string;
      sentenceAfter: string;
      options: string[];
      answerIndices: number[];
      explanation: string;
    };
    writingMission: {
      koPrompt: string;
      hint: string;
      modelAnswer: string;
      checkPoint: string;
    };
  };
}

// ==========================================
// 2. 16개 문장 성분(7) × 9품사(9) 매핑 데이터
// ==========================================
const SENTENCE_COMPONENTS: { id: CompId; name: string; sub: string }[] = [
  { id: 'S', name: '주어', sub: 'S' },
  { id: 'V', name: '동사', sub: 'V' },
  { id: 'IO', name: '간접목적어', sub: 'IO (O)' },
  { id: 'DO', name: '직접목적어', sub: 'DO (O)' },
  { id: 'SC', name: '주격보어', sub: 'SC (C)' },
  { id: 'OC', name: '목적격보어', sub: 'OC (C)' },
  { id: 'M', name: '수식어', sub: 'M' },
];

const PARTS_OF_SPEECH: { id: PosId; name: string; sub: string }[] = [
  { id: 'N', name: '명사', sub: 'N' },
  { id: 'Pron', name: '대명사', sub: 'Pron' },
  { id: 'V', name: '동사', sub: 'V' },
  { id: 'Adj', name: '형용사', sub: 'Adj' },
  { id: 'Adv', name: '부사', sub: 'Adv' },
  { id: 'Prep', name: '전치사', sub: 'Prep' },
  { id: 'Conj', name: '접속사*', sub: 'Conj' },
  { id: 'Interj', name: '감탄사*', sub: 'Interj' },
  { id: 'Det', name: '한정사', sub: 'Det' },
];

const MAPPING_EDGES: { comp: CompId; pos: PosId }[] = [
  { comp: 'S', pos: 'N' },
  { comp: 'S', pos: 'Pron' },
  { comp: 'V', pos: 'V' },
  { comp: 'IO', pos: 'N' },
  { comp: 'IO', pos: 'Pron' },
  { comp: 'DO', pos: 'N' },
  { comp: 'DO', pos: 'Pron' },
  { comp: 'SC', pos: 'N' },
  { comp: 'SC', pos: 'Pron' },
  { comp: 'SC', pos: 'Adj' },
  { comp: 'OC', pos: 'N' },
  { comp: 'OC', pos: 'Adj' },
  { comp: 'M', pos: 'Adj' },
  { comp: 'M', pos: 'Adv' },
  { comp: 'M', pos: 'Prep' },
  { comp: 'M', pos: 'Det' },
  { comp: 'M', pos: 'Conj' },
  { comp: 'M', pos: 'Interj' },
];

const DIAGRAM_EXAMPLES: DiagramSentence[] = [
  {
    id: 'ex1',
    label: '예문 1 (3형식+수식어)',
    tokens: [
      { word: 'Oh,', comp: '독립어', compLabel: '독립어', pos: 'Interj', posLabel: '감탄사(Interj)' },
      { word: 'our', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'new', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)' },
      { word: 'team', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)' },
      { word: 'carefully', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)' },
      { word: 'checked', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)' },
      { word: 'the', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'schedule', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)' },
      { word: 'in the morning.', comp: 'M', compLabel: '수식어 (M)', pos: 'Prep', posLabel: '전치사구(Prep+N)' },
    ],
    translation: '“아, 우리 신규 팀이 오전에 일정을 꼼꼼히 확인했습니다.”',
    skeleton: 'team[S] + checked[V] + schedule[DO]',
    patternType: '3형식 (S + V + DO) + 다중 수식어(M)',
  },
  {
    id: 'ex2',
    label: '예문 2 (4형식 수여문)',
    tokens: [
      { word: 'The', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'manager', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)' },
      { word: 'promptly', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)' },
      { word: 'gave', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)' },
      { word: 'us', comp: 'IO', compLabel: '간접목적어 (IO)', pos: 'Pron', posLabel: '대명사(Pron)' },
      { word: 'a', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'quick', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)' },
      { word: 'heads-up', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)' },
      { word: 'before the meeting.', comp: 'M', compLabel: '수식어 (M)', pos: 'Prep', posLabel: '전치사구(Prep+N)' },
    ],
    translation: '“매니저님이 회의 전에 우리에게 빠른 사전 귀띔을 즉시 주셨습니다.”',
    skeleton: 'manager[S] + gave[V] + us[IO] + heads-up[DO]',
    patternType: '4형식 (S + V + IO + DO) 수여동사 문형',
  },
  {
    id: 'ex3',
    label: '예문 3 (5형식 보어문)',
    tokens: [
      { word: 'This', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'smart', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)' },
      { word: 'system', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)' },
      { word: 'makes', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)' },
      { word: 'our', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)' },
      { word: 'daily', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)' },
      { word: 'workflow', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)' },
      { word: 'highly', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)' },
      { word: 'feasible.', comp: 'OC', compLabel: '목적격보어 (OC)', pos: 'Adj', posLabel: '형용사(Adj)' },
    ],
    translation: '“이 스마트 시스템은 우리의 일일 작업 공정을 매우 실현 가능하게 만듭니다.”',
    skeleton: 'system[S] + makes[V] + workflow[DO] + feasible[OC]',
    patternType: '5형식 (S + V + O + OC) 목적격보어 문형',
  },
];

// ==========================================
// 3. 네이버 오늘의 단어 퀴즈 스페셜 데이터 (스크린샷 완벽 반영)
// ==========================================
const NAVER_OFFICIAL_WORD_CHALLENGE = [
  {
    word: 'news',
    masked: 'n ⬛ ⬛ s',
    pos: 'noun',
    pron: '[뉴즈]',
    koMeaning: '소식, 뉴스, 새로운 정보',
    enDef: '1. noun new information or a report about something that has happened recently',
    example: 'Do you have any ______ to report?',
    exampleFull: 'Do you have any news to report?',
  },
  {
    word: 'big',
    masked: 'b ⬛ g',
    pos: 'adverb',
    pron: '[빅]',
    koMeaning: '크게, 대대적으로, 성공적으로',
    enDef: '1. adverb in a big way',
    example: 'They won/lost ______ at the casino.',
    exampleFull: 'They won big at the casino.',
  },
  {
    word: 'inner',
    masked: 'i ⬛ ⬛ ⬛ r',
    pos: 'adjective',
    pron: '[이너]',
    koMeaning: '내면의, 마음속의, 내부의',
    enDef: "1. adjective of or relating to a person's mind or spirit",
    example: '______ peace',
    exampleFull: 'inner peace',
  },
  {
    word: 'lawless',
    masked: 'la ⬛ ⬛ ⬛ ss',
    pos: 'adjective',
    pron: '[로-리스]',
    koMeaning: '무법의, 법이 없는, 질서 없는',
    enDef: '1. adjective having no laws',
    example: 'the ______ society of the frontier',
    exampleFull: 'the lawless society of the frontier',
  },
  {
    word: 'intend',
    masked: 'i ⬛ ⬛ ⬛ ⬛ d',
    pos: 'verb',
    pron: '[인-텐드]',
    koMeaning: '의도하다, 작정하다, 계획하다',
    enDef: '1. verb to plan or want to do (something) to have (something) in your mind as a purpose or goal',
    example: 'He ______ that his daughter would inherit the business.',
    exampleFull: 'He intended that his daughter would inherit the business.',
  },
];

// ==========================================
// 4. 테마별 풀코스 강의 데이터베이스
// ==========================================
const THEMES: ThemeData[] = [
  {
    id: 'biz-meeting',
    group: 'biz',
    portal: 'NAVER',
    rank: 1,
    title: '📊 비즈니스 미팅 & 공정/일정 조율',
    badge: '실검 1위 · 고급 실무',
    dateLabel: '11월 10일 (화) · Day 1 실전 코스',
    coachPoint:
      '비즈니스 현장에서 일방적인 지시 대신 상대방의 자발적인 협조를 끌어내는 가장 세련된 화법입니다. 오늘 배울 만능 패턴과 5:5 황금 비율 어휘 10개만 체화해도 회의 주도권과 품격을 동시에 잡을 수 있습니다.',
    pattern: {
      en: 'I was wondering if you could ~',
      pron: '[아이 워즈 원더링 이프 유 쿳 ~]',
      nuance:
        '단순한 "Can you ~?"나 "Please ~"보다 훨씬 정중하고 부드럽게 상대방의 일정과 입장을 배려하며 협조를 구할 때 쓰는 비즈니스 최상급 만능 패턴입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'grab',
        masked: 'g ⬛ ⬛ b',
        pron: '[그랩]',
        meaning: '간단히 먹다, 챙기다',
        enDef: '1. verb to get or take something quickly and informally',
        exampleBlank: 'Let us ______ a quick coffee before the session.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '주어의 동작을 나타내며 뒤에 목적어(a coffee)를 취함',
        collocation: 'grab a quick bite',
        collocationKo: '간단히 요기하다 / 식사하다',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'wrap up',
        masked: 'wr ⬛ p  u ⬛',
        pron: '[랩 업]',
        meaning: '마무리하다, 끝내다',
        enDef: '1. phrasal verb to complete or finish a meeting or task successfully',
        exampleBlank: 'We need to ______ this inspection by 5 PM.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '회의나 작업 공정을 깔끔하게 갈무리하는 서술어 역할',
        collocation: 'wrap up the meeting',
        collocationKo: '회의를 깔끔하게 마무리 짓다',
      },
      {
        id: 3,
        type: '일상 회화',
        word: 'touch base',
        masked: 't ⬛ ⬛ ch  b ⬛ se',
        pron: '[터치 베이스]',
        meaning: '잠깐 연락해 상황을 공유하다',
        enDef: '1. idiom to briefly make or renew contact with someone',
        exampleBlank: 'I just wanted to ______ with you on the progress.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '전치사 with와 결합하여 상대방과 안부·현황을 점검함',
        collocation: 'touch base with the team',
        collocationKo: '팀원들과 진행 상황을 공유하다',
      },
      {
        id: 4,
        type: '일상 회화',
        word: 'on the same page',
        masked: 'on the s ⬛ ⬛ e p ⬛ ge',
        pron: '[온 더 세임 페이지]',
        meaning: '생각·이해가 일치하는',
        enDef: '1. idiom thinking in a similar way or having the same understanding',
        exampleBlank: 'Let us make sure everyone is ______ before starting.',
        pos: 'Prep',
        posLabel: '전치사구 (Prep)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: 'be동사 뒤에서 주어(우리)의 상태가 일치함을 보충 설명',
        collocation: 'get on the same page',
        collocationKo: '서로의 이해를 일치시키다',
      },
      {
        id: 5,
        type: '일상 회화',
        word: 'heads-up',
        masked: 'he ⬛ ds-u ⬛',
        pron: '[헤즈업]',
        meaning: '사전 귀띔, 미리 알림',
        enDef: '1. noun an advance warning or piece of information given ahead of time',
        exampleBlank: 'Thanks for giving me a quick ______ about the delay.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '4형식 수여동사 give 뒤에서 직접목적어 자리에 위치함',
        collocation: 'give you a quick heads-up',
        collocationKo: '미리 살짝 귀띔해 주다',
      },
      {
        id: 6,
        type: '고급/실무',
        word: 'streamline',
        masked: 'str ⬛ ⬛ ml ⬛ ne',
        pron: '[스트림라인]',
        meaning: '(공정·절차를) 간소화·효율화하다',
        enDef: '1. verb to make an organization or system more efficient and effective',
        exampleBlank: 'We aim to ______ the entire workflow this quarter.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '복잡한 작업 프로세스를 효율화한다는 핵심 타동사 역할',
        collocation: 'streamline the entire workflow',
        collocationKo: '전체 작업 공정을 효율화하다',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'tentative',
        masked: 'te ⬛ t ⬛ t ⬛ ve',
        pron: '[텐터티브]',
        meaning: '잠정적인, 가안의',
        enDef: '1. adjective not certain or fixed; provisional',
        exampleBlank: 'We have set a ______ date for the new launch.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(schedule/date) 앞에서 성질을 꾸며주는 한정 수식어',
        collocation: 'set a tentative schedule',
        collocationKo: '잠정적인 일정을 잡다',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'feasible',
        masked: 'fe ⬛ s ⬛ ble',
        pron: '[피저블]',
        meaning: '실행 가능한, 실현성 있는',
        enDef: '1. adjective possible to do easily or conveniently',
        exampleBlank: 'Is it ______ to complete the coating by tomorrow?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '주어나 목적어의 실현 가능성 상태를 설명하는 보어 역할',
        collocation: 'a highly feasible solution',
        collocationKo: '매우 실현 가능한 해결책',
      },
      {
        id: 9,
        type: '고급/실무',
        word: 'expedite',
        masked: 'ex ⬛ ⬛ d ⬛ te',
        pron: '[엑스퍼다이트]',
        meaning: '신속히 처리하다, 앞당기다',
        enDef: '1. verb to make an action or process happen sooner or be accomplished more quickly',
        exampleBlank: 'Please ______ the delivery of the replacement parts.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '지연된 일정이나 출고 과정을 빠르게 촉진하는 동사',
        collocation: 'expedite the process',
        collocationKo: '처리 공정을 신속히 앞당기다',
      },
      {
        id: 10,
        type: '고급/실무',
        word: 'meticulously',
        masked: 'me ⬛ i ⬛ u ⬛ ously',
        pron: '[머티큘러슬리]',
        meaning: '꼼꼼하게, 빈틈없이 세심하게',
        enDef: '1. adverb in a way that shows great attention to detail; very thoroughly',
        exampleBlank: 'Our team ______ inspected the final surface finish.',
        pos: 'Adv',
        posLabel: '부사 (Adverb)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '문장 뼈대에 영향 없이 동사(검수하다)의 정밀도를 수식함',
        collocation: 'inspect the quality meticulously',
        collocationKo: '품질을 빈틈없이 꼼꼼하게 검수하다',
      },
    ],
    synonymScale: {
      baseWord: 'violent / fast (네이버 유의어 강세 사전)',
      pos: '형용사·동사 뉘앙스 강도 비교',
      meaning: '단어의 세기와 격식도에 따른 원어민 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [
            { word: 'murderous / homicidal', nuance: '살인적인, 치명적인 극단적 강도 (Oxford Thesaurus)' },
            { word: 'accelerate / overhaul', nuance: '전면적으로 급가속·대개조하다' },
          ],
        },
        {
          strength: '강함 (Strong)',
          words: [
            { word: 'bloody / fierce', nuance: '피비린내 나는, 맹렬하고 격렬한' },
            { word: 'expedite / streamline', nuance: '(공정·일정을) 공식적으로 신속히 앞당기다·효율화하다' },
          ],
        },
        {
          strength: '보통 (Neutral)',
          words: [
            { word: 'violent / intense', nuance: '폭력적인, 강한 (기준 단어)' },
            { word: 'speed up / organize', nuance: '속도를 높이다, 정리하다 (일반 회화)' },
          ],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [
            { word: 'rough / tough', nuance: '다소 거친, 험한 (일상적 완곡 표현)' },
            { word: 'wrap up / touch base', nuance: '가볍게 마무리하다, 잠깐 연락해 조율하다' },
          ],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 일상 대화 응용 ①',
        targetWord: 'wrap up',
        structure: '주어(S) + 동사(V) + 목적어절(O: 패턴 결합) + 수식어(M)',
        koLine: '나는(S) / 궁금했습니다(V) / 당신이 마무리할 수 있는지(O) / 오후 회의 전에 그 점검표를(M).',
        enLine: 'I(S) / was wondering(V) / if you could [wrap up](O) / the checklist before the afternoon meeting(M).',
        rawEn: 'I was wondering if you could wrap up the checklist before the afternoon meeting.',
        pronLine: '[아이 / 워즈 원더링 / 이프 유 쿳 랩 업 / 더 체크리스트 비포 디 애프터눈 미팅]',
        naturalKo: '오후 미팅 시작 전에 혹시 체크리스트 정리를 좀 마무리해 주실 수 있을까요?',
      },
      {
        id: 2,
        tag: 'Training 2 - 일상 대화 응용 ②',
        targetWord: 'heads-up',
        structure: '주어(S) + 동사(V) + 간접목적어(IO) + 직접목적어(DO) + 수식어(M)',
        koLine: '나는(S) / 주고 싶었습니다(V) / 당신에게(IO) / 빠른 사전 귀띔을(DO) / 변경된 일정에 대해(M).',
        enLine: 'I(S) / wanted to give(V) / you(IO) / a quick [heads-up](DO) / about the updated schedule(M).',
        rawEn: 'I wanted to give you a quick heads-up about the updated schedule.',
        pronLine: '[아이 / 원티드 투 기브 / 유 / 어 퀵 헤즈업 / 어바웃 디 업데이티드 스케줄]',
        naturalKo: '변경된 일정에 대해 미리 살짝 귀띔해 드리려고 연락드렸습니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 고급/비즈니스 응용 ①',
        targetWord: 'streamline',
        structure: '주어(S) + 동사(V) + 목적어절(O) + 수식어(M: 목적의 부사구)',
        koLine: '나는(S) / 궁금했습니다(V) / 우리가 간소화할 수 있을지(O) / 전체 작업 공정을 시간을 아끼기 위해(M).',
        enLine: 'I(S) / was wondering(V) / if we could [streamline](O) / the entire workflow to save time(M).',
        rawEn: 'I was wondering if we could streamline the entire workflow to save time.',
        pronLine: '[아이 / 워즈 원더링 / 이프 위 쿳 스트림라인 / 디 인타이어 워크플로우 투 세이브 타임]',
        naturalKo: '시간을 단축하기 위해 전체 작업 공정을 좀 더 효율화할 수 있을지 논의해 보고 싶습니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 고급/비즈니스 응용 ②',
        targetWord: 'meticulously & feasible',
        structure: '주어(S) + 수식어(M) + 동사(V) + 목적어(O) + 수식어(M)',
        koLine: '우리 팀은(S) / 꼼꼼하게(M) / 검토했습니다(V) / 가장 실현 가능한 일정을(O) / 오전에(M).',
        enLine: 'Our team(S) / [meticulously](M) / reviewed(V) / the most [feasible] schedule(O) / in the morning(M).',
        rawEn: 'Our team meticulously reviewed the most feasible schedule in the morning.',
        pronLine: '[아워 팀 / 머티큘러슬리 / 리뷰드 / 더 모스트 피저블 스케줄 / 인 더 모닝]',
        naturalKo: '저희 팀이 오전에 가장 실현 가능성 높은 일정을 빈틈없이 검토했습니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'lick (네이버 오늘의 퀴즈 초급)',
        options: [
          '억제[저해]하다',
          '(특히 화가 나서 거칠게) 내던지다',
          '(~에) 중요성, 의미, 가치, 무게 등을 두다',
          '핥다',
        ],
        answerIdx: 3,
        explanation: 'lick은 혀를 대어 핥다는 뜻의 기본 동사입니다. (예: The cat licked its paws.)',
      },
      intermediate: {
        sentenceBefore: 'Can you',
        sentenceAfter: 'your nose with your tongue?',
        hint: '혀(tongue)로 코(nose)를 핥을 수 있는지 묻는 문장입니다.',
        options: ['lick', 'crunch', 'display', 'guard'],
        answerIdx: 0,
        explanation: '조동사 Can 뒤의 동사원형 자리로, 혀(tongue)와 짝을 이루는 동사 lick(핥다)이 가장 자연스럽습니다.',
      },
      advanced: {
        sentenceBefore: 'The spaniel leapt to',
        highlightWord: 'lick',
        sentenceAfter: 'his face.',
        options: ['moisten', 'cover', 'wet'],
        answerIndices: [0, 2],
        explanation: '강아지가 얼굴을 핥아 촉촉하게 적신다는 문맥이므로 moisten(적시다, 촉촉하게 하다)과 wet(적시다)이 유의어로 쓰일 수 있습니다.',
      },
      writingMission: {
        koPrompt: '혹시 이번 주 금요일까지 잠정적인 일정을 공유해 주실 수 있을까요?',
        hint: '패턴 I was wondering if you could + share + a tentative schedule',
        modelAnswer: 'I was wondering if you could share a tentative schedule by this Friday.',
        checkPoint:
          '형용사 tentative(잠정적인)는 명사 schedule 앞에서 수식어(M) 역할을 하며, 완료 기한은 until이 아닌 by(~까지)를 씁니다.',
      },
    },
  },
  {
    id: 'cat-care',
    group: 'life',
    portal: 'NAVER',
    rank: 2,
    title: '🐱 반려동물(랙돌 고양이) 건강·영양 케어',
    badge: '맞춤 테마 · 일상 & 전문',
    dateLabel: '11월 10일 (화) · Day 2 스페셜 코스',
    coachPoint:
      '반려묘의 음수량, 사료 급여, 정기 검진 및 그루밍 상태를 설명할 때 원어민 수의사와 브리더들이 가장 많이 쓰는 표현들입니다. 일상 표현과 전문 케어 어휘를 동시에 마스터해 보세요.',
    pattern: {
      en: 'Make sure to keep an eye on ~',
      pron: '[메이크 슈어 투 킵 언 아이 온 ~]',
      nuance:
        '"~을 반드시 주의 깊게 지켜보다/모니터링하다"라는 뜻으로, 반려동물의 일일 컨디션이나 음수량·체중 변화를 세심하게 챙길 때 쓰는 필수 패턴입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'lick',
        masked: 'l ⬛ ⬛ k',
        pron: '[릭]',
        meaning: '(혀로) 핥다, 그루밍하다',
        enDef: '1. verb to pass the tongue over something in order to taste, moisten, or clean it',
        exampleBlank: 'Cats often ______ their fur to keep themselves clean.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '주어(고양이)가 털이나 간식을 핥는 동작을 나타내는 타동사',
        collocation: 'lick the wet food',
        collocationKo: '습식 사료를 핥아 먹다',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'picky',
        masked: 'p ⬛ c ⬛ y',
        pron: '[피키]',
        meaning: '(식성이) 까다로운, 입이 짧은',
        enDef: '1. adjective fussy and hard to please, especially about food',
        exampleBlank: 'My cat is quite ______ about scented litter.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: 'be동사 뒤에서 반려묘의 성향이나 입맛을 설명하는 주격보어',
        collocation: 'a picky eater',
        collocationKo: '입이 짧은 아이 (까다로운 식성)',
      },
      {
        id: 3,
        type: '일상 회화',
        word: 'cuddle',
        masked: 'c ⬛ d ⬛ le',
        pron: '[커들]',
        meaning: '꼭 껴안다, 품에 안기다',
        enDef: '1. verb to hold close in one’s arms as a way of showing love or affection',
        exampleBlank: 'Ragdoll cats love to ______ with their owners.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '보호자와 애정 어린 스킨십을 나누는 자동사/타동사',
        collocation: 'cuddle up on the couch',
        collocationKo: '소파에서 다정하게 품에 안기다',
      },
      {
        id: 4,
        type: '일상 회화',
        word: 'shed',
        masked: 'sh ⬛ d',
        pron: '[쉐드]',
        meaning: '털이 빠지다, 털갈이하다',
        enDef: '1. verb to naturally lose hair or fur',
        exampleBlank: 'Long-haired cats ______ more during the change of seasons.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '환절기 등에 자연스럽게 털이 빠지는 현상을 서술함',
        collocation: 'shed a lot of fur',
        collocationKo: '털이 많이 빠지다',
      },
      {
        id: 5,
        type: '일상 회화',
        word: 'unscented',
        masked: 'un ⬛ c ⬛ nted',
        pron: '[언센티드]',
        meaning: '무향의, 인공 향료가 없는',
        enDef: '1. adjective having no added scent or perfume',
        exampleBlank: 'We always prefer ______ natural cat litter.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '고양이 용품이나 모래(litter) 앞에서 성질을 수식함',
        collocation: 'unscented clumping litter',
        collocationKo: '무향 응고형 고양이 모래',
      },
      {
        id: 6,
        type: '고급/실무',
        word: 'hydration',
        masked: 'hy ⬛ r ⬛ tion',
        pron: '[하이드레이션]',
        meaning: '수분 공급, 일일 음수량 유지',
        enDef: '1. noun the process of causing something to absorb water or stay hydrated',
        exampleBlank: 'Proper daily ______ is critical for feline kidney health.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '문장의 주어 자리에서 핵심 건강 지표(수분 섭취)를 나타냄',
        collocation: 'monitor daily hydration',
        collocationKo: '일일 수분 섭취(음수량)를 모니터링하다',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'nutritious',
        masked: 'nu ⬛ r ⬛ tious',
        pron: '[뉴트리셔스]',
        meaning: '영양가가 높은, 영양 균형이 잡힌',
        enDef: '1. adjective efficient as food; nourishing',
        exampleBlank: 'We feed them a highly ______ wet food blend.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(diet/food) 앞에서 영양 상태를 꾸며주는 형용사',
        collocation: 'a balanced and nutritious diet',
        collocationKo: '균형 잡히고 영양가 높은 식단',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'docile',
        masked: 'd ⬛ c ⬛ le',
        pron: '[도사일 / 다슬]',
        meaning: '성격이 온순한, 유순한',
        enDef: '1. adjective ready to accept control or instruction; submissive and gentle',
        exampleBlank: 'Ragdolls are famous for their gentle and ______ temperament.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '랙돌 품종의 온화하고 순한 기질을 설명하는 고급 형용사',
        collocation: 'a calm and docile personality',
        collocationKo: '차분하고 온순한 성격',
      },
      {
        id: 9,
        type: '고급/실무',
        word: 'preventive',
        masked: 'pr ⬛ v ⬛ ntive',
        pron: '[프리벤티브]',
        meaning: '예방하는, 사전 예방적인',
        enDef: '1. adjective designed to keep something undesirable such as illness from occurring',
        exampleBlank: 'Regular tooth brushing is the best ______ dental care.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '치아 위생이나 건강 관리 명사 앞에서 예방적 성격을 수식함',
        collocation: 'preventive dental hygiene',
        collocationKo: '예방적 치아 위생 관리',
      },
      {
        id: 10,
        type: '고급/실무',
        word: 'scheduled',
        masked: 'sch ⬛ d ⬛ led',
        pron: '[스케줄드]',
        meaning: '정해진 시간에 맞춘, 규칙적인',
        enDef: '1. adjective arranged or planned to take place at a particular time',
        exampleBlank: 'Automatic feeders help maintain ______ portion control.',
        pos: 'Adj',
        posLabel: '분사형 형용사 (Adj)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '자동 급식기를 통한 정량·정시 급여(feeding)를 수식함',
        collocation: 'scheduled automatic feeding',
        collocationKo: '정시 자동 급여 시스템',
      },
    ],
    synonymScale: {
      baseWord: 'gentle / docile (온순함·차분함 강세 비교)',
      pos: '형용사 뉘앙스 스케일',
      meaning: '반려동물의 온순하고 차분한 성격을 묘사하는 어휘 강도',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'placid / serene', nuance: '조금의 동요도 없이 고요하고 평온한' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'docile / affectionate', nuance: '매우 유순하고 사람을 잘 따르며 애교가 많은 (랙돌 특성)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'gentle / calm', nuance: '온화하고 차분한 (가장 보편적인 표현)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'easygoing / chill', nuance: '무던하고 까탈스럽지 않은 (구어체)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 일상 케어 응용 ①',
        targetWord: 'unscented',
        structure: '주어(S) + 수식어(M) + 동사(V) + 목적어(O) + 수식어(M)',
        koLine: '우리는(S) / 항상(M) / 사용합니다(V) / 무향의 천연 모래를(O) / 후각 스트레스를 예방하기 위해(M).',
        enLine: 'We(S) / always(M) / use(V) / [unscented] natural litter(O) / to prevent olfactory stress(M).',
        rawEn: 'We always use unscented natural litter to prevent olfactory stress.',
        pronLine: '[위 / 올웨이즈 / 유즈 / 언센티드 내추럴 리터 / 투 프리벤트 올팩토리 스트레스]',
        naturalKo: '저희는 아이들의 후각 스트레스를 막기 위해 항상 무향 천연 모래를 사용합니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 일상 케어 응용 ②',
        targetWord: 'cuddle & docile',
        structure: '주어(S) + 동사(V) + 주격보어(SC) + 접속사 + 동사2(V) + 목적어(O)',
        koLine: '우리 랙돌 고양이들은(S) / 매우 온순하고(SC) / 품에 안기는 것을 좋아합니다(V+O) / 매일 저녁(M).',
        enLine: 'Our Ragdoll cats(S) / are very [docile](SC) / and love to [cuddle](O) / every evening(M).',
        rawEn: 'Our Ragdoll cats are very docile and love to cuddle every evening.',
        pronLine: '[아워 랙돌 캣츠 / 아 베리 도사일 / 앤 러브 투 커들 / 에브리 이브닝]',
        naturalKo: '우리 랙돌 아이들은 성격이 워낙 온순해서 매일 저녁 품에 안기는 걸 정말 좋아합니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 전문 영양 관리 ①',
        targetWord: 'hydration',
        structure: '명령문 동사(V) + 목적어(O: 패턴) + 수식어(M)',
        koLine: '반드시 주의 깊게 살펴보세요(V) / 그들의 일일 수분 섭취량을(O) / 그리고 체중 변화를(M).',
        enLine: 'Make sure to keep an eye on(V) / their daily [hydration](O) / and body condition score(M).',
        rawEn: 'Make sure to keep an eye on their daily hydration and body condition score.',
        pronLine: '[메이크 슈어 투 킵 언 아이 온 / 데어 데일리 하이드레이션 / 앤 바디 컨디션 스코어]',
        naturalKo: '아이들의 일일 음수량과 체형(BCS) 변화를 반드시 세심하게 모니터링해 주세요.',
      },
      {
        id: 4,
        tag: 'Training 4 - 전문 건강 관리 ②',
        targetWord: 'scheduled & nutritious',
        structure: '주어(S) + 동사(V) + 목적어(O) + 수식어(M)',
        koLine: '자동 급식기는(S) / 제공합니다(V) / 규칙적이고 영양가 높은 식사를(O) / 하루 종일(M).',
        enLine: 'Automatic feeders(S) / provide(V) / [scheduled] and [nutritious] meals(O) / throughout the day(M).',
        rawEn: 'Automatic feeders provide scheduled and nutritious meals throughout the day.',
        pronLine: '[오토매틱 피더스 / 프로바이드 / 스케줄드 앤 뉴트리셔스 밀즈 / 쓰루아웃 더 데이]',
        naturalKo: '자동 급식기를 통해 하루 종일 정해진 시간에 영양 균형이 잡힌 식사를 급여합니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'hydration',
        options: ['인공 향료 첨가', '수분 공급 / 음수량 유지', '계절성 털갈이', '사전 예고'],
        answerIdx: 1,
        explanation: 'hydration은 수분 섭취 및 수분 공급 상태를 뜻하는 핵심 명사입니다.',
      },
      intermediate: {
        sentenceBefore: 'We prefer',
        sentenceAfter: 'cat supplies to protect their sensitive noses.',
        hint: '고양이의 예민한 코를 보호하기 위해 향기가 없는(무향의) 용품을 선호한다는 문맥입니다.',
        options: ['unscented', 'tentative', 'violent', 'lawless'],
        answerIdx: 0,
        explanation: '명사구 cat supplies 앞에서 "무향의"라는 뜻으로 수식하는 형용사 unscented가 정답입니다.',
      },
      advanced: {
        sentenceBefore: 'Ragdoll cats are known for their',
        highlightWord: 'docile',
        sentenceAfter: 'and affectionate nature.',
        options: ['gentle', 'calm', 'hostile'],
        answerIndices: [0, 1],
        explanation: 'docile(온순한, 유순한)과 같은 맥락으로 쓸 수 있는 유의어는 gentle(온화한)과 calm(차분한)입니다.',
      },
      writingMission: {
        koPrompt: '아이들의 일일 음수량과 치아 위생을 반드시 주의 깊게 지켜봐 주세요.',
        hint: '패턴 Make sure to keep an eye on + their daily hydration and dental hygiene',
        modelAnswer: 'Make sure to keep an eye on their daily hydration and dental hygiene.',
        checkPoint:
          '전치사 on의 목적어(O) 자리에 명사구(their daily hydration and dental hygiene)를 나란히 연결하면 완벽한 문장이 됩니다.',
      },
    },
  },
  {
    id: 'auto-tech',
    group: 'biz',
    portal: 'DAUM',
    rank: 1,
    title: '🚗 자동차 컬러 조색 & 프리미엄 정비 기술',
    badge: '다음 트렌드 1위 · 기술 실무',
    dateLabel: '11월 10일 (화) · Day 3 마스터 코스',
    coachPoint:
      '수용성 도료 조색(Color Formulation), 멀티 앵글 입자감 분석, 알루미늄 패널 복원 및 정밀 품질 검수 과정에서 글로벌 브랜드 엔지니어들이 사용하는 핵심 실무 영어입니다.',
    pattern: {
      en: 'It is essential to calibrate ~ so that ~',
      pron: '[잇 이즈 에센셜 투 캘리브레이트 ~ 소 댓 ~]',
      nuance:
        '"~하도록 정밀하게 보정/조정하는 것이 필수적이다"라는 뜻으로, 조색 배합비나 차량 모듈 세팅의 정확도를 강조할 때 쓰는 전문 패턴입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'blend in',
        masked: 'bl ⬛ nd  i ⬛',
        pron: '[블렌드 인]',
        meaning: '티 나지 않게 자연스럽게 어우러지다 (블렌딩하다)',
        enDef: '1. phrasal verb to match or harmonize seamlessly with the surrounding area',
        exampleBlank: 'The new clear coat needs to ______ seamlessly with the adjacent panel.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '기존 도장면과 신규 도장면이 이색 없이 어우러짐을 표현함',
        collocation: 'blend in seamlessly',
        collocationKo: '경계선 없이 감쪽같이 어우러지다',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'spot-on',
        masked: 'sp ⬛ t-o ⬛',
        pron: '[스팟 온]',
        meaning: '정확히 일치하는, 한 치의 오차도 없는',
        enDef: '1. adjective completely accurate or exact',
        exampleBlank: 'The metallic color match under sunlight is absolutely ______.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '조색 결과물이나 진단 수치가 100% 정확함을 나타내는 보어',
        collocation: 'a spot-on color match',
        collocationKo: '완벽하게 들어맞는 컬러 매칭',
      },
      {
        id: 3,
        type: '일상 회화',
        word: 'touch up',
        masked: 't ⬛ ⬛ ch  u ⬛',
        pron: '[터치 업]',
        meaning: '부분 보수하다, 마무리 손질을 하다',
        enDef: '1. phrasal verb to make small improvements or repairs to the surface',
        exampleBlank: 'We will ______ the minor stone chips on the front bumper.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '미세한 흠집이나 도장면을 정교하게 다듬는 타동사 역할',
        collocation: 'touch up the scratch',
        collocationKo: '스크래치 부위를 정교하게 보수하다',
      },
      {
        id: 4,
        type: '일상 회화',
        word: 'fine-tune',
        masked: 'f ⬛ ne-t ⬛ ne',
        pron: '[파인 튠]',
        meaning: '미세 조정하다, 정밀 세팅하다',
        enDef: '1. verb to make small adjustments to achieve the best or most precise performance',
        exampleBlank: 'Let us ______ the toner ratio by 0.5 grams.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '조색 배합 비율이나 오디오·시트 모듈 파라미터를 미세 조정함',
        collocation: 'fine-tune the parameters',
        collocationKo: '세부 설정값을 미세 조정하다',
      },
      {
        id: 5,
        type: '일상 회화',
        word: 'flawless',
        masked: 'fl ⬛ wl ⬛ ss',
        pron: '[플로-리스]',
        meaning: '흠잡을 데 없는, 무결점의',
        enDef: '1. adjective without any blemishes or imperfections; perfect',
        exampleBlank: 'The final mirror-like gloss is completely ______.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '최종 마감 품질에 단 하나의 결점도 없음을 강조하는 보어',
        collocation: 'a flawless surface finish',
        collocationKo: '티 하나 없이 완벽한 표면 마감',
      },
      {
        id: 6,
        type: '고급/실무',
        word: 'formulation',
        masked: 'fo ⬛ m ⬛ lation',
        pron: '[포뮬레이션]',
        meaning: '정밀 배합식, 조색 데이터 레시피',
        enDef: '1. noun a mixture prepared according to a precise formula',
        exampleBlank: 'This waterborne color ______ requires precise pearl toner measurement.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '문장의 주어 또는 목적어로 쓰여 도료 배합 공식을 뜻함',
        collocation: 'waterborne paint formulation',
        collocationKo: '수용성 도료 정밀 조색 배합식',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'substrate',
        masked: 's ⬛ bstr ⬛ te',
        pron: '[섭스트레이트]',
        meaning: '소지(하도 표면), 베이스 패널 재질(스틸/알루미늄)',
        enDef: '1. noun an underlying layer or material on which paint or coating is applied',
        exampleBlank: 'Aluminum ______ requires specialized tension control and primer.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '도장이 올라가는 바탕 금속(철판·알루미늄)을 지칭하는 전문 명사',
        collocation: 'prepare the aluminum substrate',
        collocationKo: '알루미늄 패널 소지면을 전처리하다',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'iridescence',
        masked: 'ir ⬛ d ⬛ scence',
        pron: '[이리데슨스]',
        meaning: '각도에 따라 변하는 진주빛 컬러 트래블(플립 효과)',
        enDef: '1. noun the phenomenon of certain surfaces appearing to gradually change color as the angle of view changes',
        exampleBlank: 'Multi-angle rendering checks the pearl ______ at 15 and 45 degrees.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '보는 각도(정면·측면)에 따른 입자감과 색상 변화를 뜻하는 목적어',
        collocation: 'multi-angle color iridescence',
        collocationKo: '다각도 컬러 트래블 및 펄 반사감',
      },
      {
        id: 9,
        type: '고급/실무',
        word: 'calibrate',
        masked: 'c ⬛ l ⬛ brate',
        pron: '[캘리브레이트]',
        meaning: '(장비·수치를) 정밀 보정하다, 영점을 맞추다',
        enDef: '1. verb to adjust precisely for a particular function or measurement',
        exampleBlank: 'We must ______ the spectrophotometer before scanning the vehicle.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '측색기나 전자 모듈을 표준 규격에 맞게 보정하는 타동사',
        collocation: 'calibrate the color scanner',
        collocationKo: '측색기를 정밀 영점 보정하다',
      },
      {
        id: 10,
        type: '고급/실무',
        word: 'viscosity',
        masked: 'vi ⬛ c ⬛ sity',
        pron: '[비스카시티]',
        meaning: '(도료·액체의) 점도, 끈적이는 농도',
        enDef: '1. noun the state of being thick, sticky, and semi-fluid in consistency',
        exampleBlank: 'Maintaining optimal paint ______ prevents sagging and orange peel.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '분사 균일도를 결정짓는 도료의 점도를 나타내는 전문 명사',
        collocation: 'optimal spray viscosity',
        collocationKo: '최적의 스프레이 분사 점도',
      },
    ],
    synonymScale: {
      baseWord: 'accurate / exact (정확도·완벽성 강세 비교)',
      pos: '형용사 뉘앙스 스케일',
      meaning: '조색 매칭과 정비 품질의 정밀도를 나타내는 어휘 단계',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'flawless / impeccable', nuance: '단 0.1%의 오차나 흠도 없는 완벽 무결점 상태' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'spot-on / calibrated', nuance: '정확히 과녁 정중앙에 들어맞는, 정밀 보정된' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'accurate / precise', nuance: '정확한, 정밀한 (표준 기술 용어)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'acceptable / close', nuance: '허용 오차 범위 내의, 거의 비슷한' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 실전 조색 응용 ①',
        targetWord: 'fine-tune & spot-on',
        structure: '주어(S) + 동사(V) + 목적어(O) + 접속사 + 주어2(S) + 동사2(V) + 보어(SC)',
        koLine: '우리는(S) / 미세 조정했습니다(V) / 토너 배합비를(O) / 그래서 컬러 매칭이(S) / 완벽히 일치합니다(V+SC).',
        enLine: 'We(S) / [fine-tuned](V) / the toner ratio(O) / so the color match(S) / is [spot-on](SC).',
        rawEn: 'We fine-tuned the toner ratio so the color match is spot-on.',
        pronLine: '[위 / 파인-튠드 / 더 토너 레이시오 / 소 더 컬러 매치 / 이즈 스팟-온]',
        naturalKo: '토너 배합 비율을 미세 조정해서 이제 컬러 매칭이 한 치의 오차도 없이 딱 들어맞습니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 실전 블렌딩 응용 ②',
        targetWord: 'blend in & flawless',
        structure: '주어(S) + 동사(V) + 수식어(M) + 수식어(M: 결과의 부정사)',
        koLine: '수용성 베이스코트가(S) / 자연스럽게 어우러집니다(V) / 인접 패널과(M) / 무결점 마감을 만들기 위해(M).',
        enLine: 'The waterborne basecoat(S) / [blends in](V) / with the adjacent panel(M) / for a [flawless] finish(M).',
        rawEn: 'The waterborne basecoat blends in with the adjacent panel for a flawless finish.',
        pronLine: '[더 워터본 베이스코트 / 블렌즈 인 / 위드 디 어제이슨트 패널 / 포 어 플로-리스 피니시]',
        naturalKo: '수용성 베이스코트가 인접 패널과 감쪽같이 블렌딩되어 무결점 마감 품질을 보여줍니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 고급 기술 응용 ①',
        targetWord: 'calibrate & formulation',
        structure: '가주어(It) + 동사(V) + 보어(SC) + 진주어(to V) + 목적어(O)',
        koLine: '필수적입니다(V+SC) / 정밀 보정하는 것이(S:진주어) / 수용성 조색 배합식을(O) / 도포 전에(M).',
        enLine: 'It is essential(V+SC) / to [calibrate](S) / the waterborne [formulation](O) / before application(M).',
        rawEn: 'It is essential to calibrate the waterborne formulation before application.',
        pronLine: '[잇 이즈 에센셜 / 투 캘리브레이트 / 더 워터본 포뮬레이션 / 비포 애플리케이션]',
        naturalKo: '실제 도포 작업에 들어가기 전에 수용성 도료 조색 배합 데이터를 정밀 보정하는 것이 필수적입니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 고급 기술 응용 ②',
        targetWord: 'substrate & viscosity',
        structure: '주어(S) + 동사(V) + 목적어1(O) + 그리고 + 목적어2(O)',
        koLine: '우리 팀은(S) / 점검합니다(V) / 알루미늄 소지 상태와(O) / 최적의 도료 점도를(O).',
        enLine: 'Our team(S) / inspects(V) / the aluminum [substrate](O) / and optimal paint [viscosity](O).',
        rawEn: 'Our team inspects the aluminum substrate and optimal paint viscosity.',
        pronLine: '[아워 팀 / 인스펙츠 / 디 알루미늄 섭스트레이트 / 앤 옵티멀 페인트 비스카시티]',
        naturalKo: '저희 팀은 알루미늄 패널의 소지 상태와 최적의 도료 점도를 철저히 점검합니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'flawless',
        options: ['잠정적인', '흠잡을 데 없는, 무결점의', '점도가 높은', '무법의'],
        answerIdx: 1,
        explanation: 'flaw(결점) + less(~이 없는)가 결합하여 흠잡을 데 없이 완벽하다는 뜻의 형용사입니다.',
      },
      intermediate: {
        sentenceBefore: 'Let us',
        sentenceAfter: 'the pearl toner formula by 0.2 grams.',
        hint: '펄 토너 배합비를 0.2그램 단위로 미세 조정하자는 뜻입니다.',
        options: ['fine-tune', 'shed', 'cuddle', 'lick'],
        answerIdx: 0,
        explanation: '수치나 배합을 정밀하게 미세 조정한다는 뜻의 동사 fine-tune이 정답입니다.',
      },
      advanced: {
        sentenceBefore: 'The final color match under multi-angle light was',
        highlightWord: 'spot-on',
        sentenceAfter: '.',
        options: ['exact', 'accurate', 'rough'],
        answerIndices: [0, 1],
        explanation: 'spot-on은 정확히 일치한다는 뜻이므로 exact, accurate와 바꿔 쓸 수 있습니다.',
      },
      writingMission: {
        koPrompt: '인접 패널과 자연스럽게 어우러지도록 토너 배합식을 정밀 보정하는 것이 필수적입니다.',
        hint: 'It is essential to calibrate the formulation so that it blends in with the adjacent panel.',
        modelAnswer: 'It is essential to calibrate the formulation so that it blends in with the adjacent panel.',
        checkPoint:
          '가주어 It ~ 진주어 to calibrate 구문과 목적을 나타내는 접속사 so that절을 결합한 고급 실무 문장입니다.',
      },
    },
  },
  {
    id: 'travel-airport',
    group: 'travel',
    portal: 'GOOGLE',
    rank: 1,
    title: '✈️ 해외여행 공항 라운지 & 호텔 컨시어지',
    badge: '구글 트렌드 1위 · 필수 회화',
    dateLabel: '11월 10일 (화) · Day 4 글로벌 코스',
    coachPoint:
      '공항 체크인, 좌석 및 객실 업그레이드 요청, 레이트 체크아웃, 현지 컨시어지 추천까지 해외여행의 품격을 높여주는 가장 정중하고 확실한 원어민 표현입니다.',
    pattern: {
      en: 'Would it be possible to get ~?',
      pron: '[우드 잇 비 파서블 투 겟 ~?]',
      nuance:
        '호텔이나 공항 데스크에서 무리한 요구처럼 들리지 않게 기분 좋은 미소와 함께 업그레이드나 특별 배려를 이끌어내는 마법의 질문 패턴입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'check in',
        masked: 'ch ⬛ ck  i ⬛',
        pron: '[체크 인]',
        meaning: '탑승 수속하다, 호텔에 입실 수속하다',
        enDef: '1. phrasal verb to register upon arrival at a hotel or airport',
        exampleBlank: 'How early can we ______ for the international flight?',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '공항이나 호텔 데스크에서 도착 등록을 하는 자동사',
        collocation: 'check in online in advance',
        collocationKo: '사전에 온라인으로 체크인하다',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'carry-on',
        masked: 'c ⬛ rry-o ⬛',
        pron: '[캐리 온]',
        meaning: '기내 반입 수하물',
        enDef: '1. noun a small bag or suitcase that a passenger is allowed to take into the cabin',
        exampleBlank: 'This compact bag fits easily in the ______ overhead bin.',
        pos: 'N',
        posLabel: '명사/형용사 (N)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '위탁 수하물과 구분되는 기내 휴대용 가방을 뜻함',
        collocation: 'carry-on luggage',
        collocationKo: '기내 반입용 캐리어',
      },
      {
        id: 3,
        type: '일상 회화',
        word: 'layover',
        masked: 'l ⬛ yo ⬛ er',
        pron: '[레이오버]',
        meaning: '경유, 환승 대기 시간',
        enDef: '1. noun a short stay or stop between parts of a journey',
        exampleBlank: 'We have a three-hour ______ before the connecting flight.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: 'have 동사의 목적어로 경유 대기 시간을 나타냄',
        collocation: 'a two-hour layover',
        collocationKo: '2시간의 경유 대기',
      },
      {
        id: 4,
        type: '일상 회화',
        word: 'freshen up',
        masked: 'fr ⬛ sh ⬛ n  u ⬛',
        pron: '[프레션 업]',
        meaning: '간단히 씻고 재정비하다',
        enDef: '1. phrasal verb to wash and make oneself look neat and fresh after traveling',
        exampleBlank: 'I would like to ______ in the lounge before boarding.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '장시간 비행이나 이동 후 세수·샤워로 컨디션을 회복함',
        collocation: 'freshen up in the hotel room',
        collocationKo: '객실에서 간단히 씻고 단장하다',
      },
      {
        id: 5,
        type: '일상 회화',
        word: 'drop off',
        masked: 'dr ⬛ p  o ⬛ f',
        pron: '[드랍 오프]',
        meaning: '(짐을) 먼저 맡기다, 내려주다',
        enDef: '1. phrasal verb to take someone or something to a particular place and leave them there',
        exampleBlank: 'Can we ______ our bags before the official check-in time?',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '체크인 시간 전에 벨데스크에 짐을 먼저 보관 요청할 때 사용',
        collocation: 'drop off the luggage early',
        collocationKo: '짐을 일찍 먼저 맡겨두다',
      },
      {
        id: 6,
        type: '고급/실무',
        word: 'complimentary',
        masked: 'co ⬛ pl ⬛ mentary',
        pron: '[컴플리멘터리]',
        meaning: '(호텔·항공에서) 무료로 제공되는, 서비스의',
        enDef: '1. adjective given or supplied free of charge as a courtesy',
        exampleBlank: 'Does our reservation include ______ breakfast and lounge access?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: 'free보다 훨씬 격식 있게 무료 제공 혜택(조식·음료)을 수식함',
        collocation: 'complimentary lounge access',
        collocationKo: '무료 라운지 이용 혜택',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'accommodate',
        masked: 'ac ⬛ o ⬛ modate',
        pron: '[어카머데이트]',
        meaning: '(요청·인원을) 수용하다, 편의를 봐주다',
        enDef: '1. verb to fit in with the wishes or needs of someone; provide lodging for',
        exampleBlank: 'We would be delighted to ______ your late check-out request.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '고객의 특별 요청 사항을 기꺼이 들어주다라는 고급 타동사',
        collocation: 'accommodate a special request',
        collocationKo: '특별 요청 사항을 반영해 배려하다',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'itinerary',
        masked: 'it ⬛ n ⬛ rary',
        pron: '[아이티너러리]',
        meaning: '상세 여행 일정표, 항공 여정',
        enDef: '1. noun a planned route or journey and schedule',
        exampleBlank: 'Please review your flight ______ and boarding gate.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '항공권 예약 확인서나 전체 여행 동선을 뜻하는 필수 명사',
        collocation: 'updated travel itinerary',
        collocationKo: '업데이트된 상세 여행 일정표',
      },
      {
        id: 9,
        type: '고급/실무',
        word: 'vacant',
        masked: 'v ⬛ c ⬛ nt',
        pron: '[베이컨트]',
        meaning: '비어 있는, 이용 가능한(빈방·빈자리)',
        enDef: '1. adjective not occupied; empty and available',
        exampleBlank: 'Are there any ______ ocean-view suites available tonight?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '객실이나 좌석이 현재 비어 있어 배정 가능함을 나타냄',
        collocation: 'a vacant ocean-view room',
        collocationKo: '비어 있는 오션뷰 객실',
      },
      {
        id: 10,
        type: '고급/실무',
        word: 'amenities',
        masked: 'am ⬛ n ⬛ ties',
        pron: '[어메니티즈]',
        meaning: '편의 시설 및 객실 비품(수영장·스파·세면도구)',
        enDef: '1. plural noun desirable or useful features or facilities of a hotel or place',
        exampleBlank: 'Guests can enjoy all the resort ______ including the infinity pool.',
        pos: 'N',
        posLabel: '복수명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '호텔이 제공하는 모든 부대시설과 비품을 아우르는 명사',
        collocation: 'luxury hotel amenities',
        collocationKo: '고급 호텔 부대시설 및 어메니티',
      },
    ],
    synonymScale: {
      baseWord: 'free / polite (격식도 & 정중함 강세 비교)',
      pos: '여행·호텔 표현 뉘앙스 스케일',
      meaning: '상황의 격식에 따라 달라지는 어휘 선택',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'on the house / VIP courtesy', nuance: '호텔·레스토랑 측의 최고급 특별 무료 대접' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'complimentary', nuance: '품격 있는 공식 무료 제공 (호텔·항공사 표준어)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'free of charge / included', nuance: '요금이 부과되지 않는, 포함된' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'free', nuance: '일상적인 무료 (격식 있는 자리에서는 다소 직설적)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 공항/호텔 일상 ①',
        targetWord: 'drop off',
        structure: '조동사 + 주어(S) + 동사(V) + 목적어(O) + 수식어(M)?',
        koLine: '가능할까요(V) / 맡기는 것이(O) / 우리 짐을 먼저(O) / 체크인 시간 전에(M)?',
        enLine: 'Would it be possible(V) / to [drop off](O) / our luggage early(O) / before check-in(M)?',
        rawEn: 'Would it be possible to drop off our luggage early before check-in?',
        pronLine: '[우드 잇 비 파서블 / 투 드랍 오프 / 아워 러기지 얼리 / 비포 체크인]',
        naturalKo: '체크인 시간 전에 저희 짐을 먼저 좀 맡겨둘 수 있을까요?',
      },
      {
        id: 2,
        tag: 'Training 2 - 공항/호텔 일상 ②',
        targetWord: 'freshen up',
        structure: '주어(S) + 동사(V) + 목적어(to V) + 수식어(M)',
        koLine: '우리는(S) / 원합니다(V) / 간단히 씻고 재정비하기를(O) / 저녁 식사하러 나가기 전에(M).',
        enLine: 'We(S) / would like to [freshen up](V+O) / in our room(M) / before heading out for dinner(M).',
        rawEn: 'We would like to freshen up in our room before heading out for dinner.',
        pronLine: '[위 / 우드 라이크 투 프레션 업 / 인 아워 룸 / 비포 헤딩 아웃 포 디너]',
        naturalKo: '저녁 먹으러 나가기 전에 방에서 간단히 씻고 재정비 좀 하고 싶습니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 프리미엄 컨시어지 ①',
        targetWord: 'complimentary & accommodate',
        structure: '조동사 + 가주어(It) + 동사(V) + 보어(SC) + 진주어(to V)?',
        koLine: '가능할까요(V+SC) / 배려해 주시는 것이(S) / 무료 레이트 체크아웃을(O) / 오후 2시까지(M)?',
        enLine: 'Would it be possible(V+SC) / to [accommodate](S) / a [complimentary] late check-out(O) / until 2 PM(M)?',
        rawEn: 'Would it be possible to accommodate a complimentary late check-out until 2 PM?',
        pronLine: '[우드 잇 비 파서블 / 투 어카머데이트 / 어 컴플리멘터리 레이트 체크아웃 / 언틸 투 피엠]',
        naturalKo: '혹시 오후 2시까지 무료 레이트 체크아웃으로 배려해 주실 수 있을까요?',
      },
      {
        id: 4,
        tag: 'Training 4 - 프리미엄 컨시어지 ②',
        targetWord: 'itinerary & amenities',
        structure: '주어(S) + 동사(V) + 목적어1(O) + 그리고 + 목적어2(O)',
        koLine: '컨시어지가(S) / 안내해 주었습니다(V) / 우리의 여행 일정표와(O) / 호텔 편의시설들을(O).',
        enLine: 'The concierge(S) / explained(V) / our tour [itinerary](O) / and the hotel [amenities](O).',
        rawEn: 'The concierge explained our tour itinerary and the hotel amenities.',
        pronLine: '[더 컨시어지 / 익스플레인드 / 아워 투어 아이티너러리 / 앤 더 호텔 어메니티즈]',
        naturalKo: '컨시어지 직원이 저희 투어 일정표와 호텔 부대시설 이용법을 친절히 안내해 주었습니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'complimentary',
        options: ['불평하는', '(호텔 등에서) 무료로 제공되는', '잠정적인', '위험한'],
        answerIdx: 1,
        explanation: 'complimentary는 호텔 조식, 라운지, 웰컴 드링크 등이 무료 서비스로 제공될 때 쓰는 고급 형용사입니다.',
      },
      intermediate: {
        sentenceBefore: 'Can we',
        sentenceAfter: 'our bags at the bell desk before check-in?',
        hint: '체크인 전에 벨데스크에 가방을 먼저 맡겨두다(내려놓다)라는 뜻의 구동사입니다.',
        options: ['drop off', 'wrap up', 'shed', 'lick'],
        answerIdx: 0,
        explanation: '짐이나 사람을 특정 장소에 맡기거나 내려줄 때는 drop off를 사용합니다.',
      },
      advanced: {
        sentenceBefore: 'We would be happy to',
        highlightWord: 'accommodate',
        sentenceAfter: 'your request for a quiet room.',
        options: ['fulfill', 'meet', 'reject'],
        answerIndices: [0, 1],
        explanation: '고객의 요청(request)을 수용하고 들어준다는 문맥이므로 fulfill(이행하다), meet(충족하다)과 같은 의미입니다.',
      },
      writingMission: {
        koPrompt: '혹시 높은 층의 조용한 방으로 배정받는 것이 가능할까요?',
        hint: 'Would it be possible to get + a quiet room on a higher floor?',
        modelAnswer: 'Would it be possible to get a quiet room on a higher floor?',
        checkPoint:
          '층수를 나타낼 때는 표면 접촉의 전치사 on(on a higher floor)을 사용하여 앞의 명사 room을 수식(M)합니다.',
      },
    },
  },
];

// 실시간 포털 트렌드 15개 목록 (사이드바 실검 연동용)
const PORTAL_TRENDS: {
  portal: 'NAVER' | 'DAUM' | 'GOOGLE';
  items: { rank: number; keyword: string; enTopic: string; mappedThemeId: string; searchUrl: string }[];
}[] = [
  {
    portal: 'NAVER',
    items: [
      { rank: 1, keyword: '하반기 프로젝트 일정 & 공정 효율화', enTopic: 'Streamlining Workflow', mappedThemeId: 'biz-meeting', searchUrl: 'https://en.dict.naver.com/#/search?query=streamline' },
      { rank: 2, keyword: '반려묘 환절기 음수량 & 무향 모래 케어', enTopic: 'Feline Hydration & Care', mappedThemeId: 'cat-care', searchUrl: 'https://en.dict.naver.com/#/search?query=hydration' },
      { rank: 3, keyword: '오늘의 영단어 퀴즈 (lick / violent / news)', enTopic: 'Naver Daily Quiz Pick', mappedThemeId: 'biz-meeting', searchUrl: 'https://en.dict.naver.com/#/main' },
      { rank: 4, keyword: '수용성 도료 조색 & 멀티앵글 펄 매칭', enTopic: 'Waterborne Color Formulation', mappedThemeId: 'auto-tech', searchUrl: 'https://en.dict.naver.com/#/search?query=formulation' },
      { rank: 5, keyword: '연말 해외여행 항공권 & 호텔 업그레이드', enTopic: 'Airport & Hotel Concierge', mappedThemeId: 'travel-airport', searchUrl: 'https://en.dict.naver.com/#/search?query=complimentary' },
    ],
  },
  {
    portal: 'DAUM',
    items: [
      { rank: 1, keyword: '친환경 수용성 페인트 & 알루미늄 판금 기술', enTopic: 'Automotive Refinishing Tech', mappedThemeId: 'auto-tech', searchUrl: 'https://dic.daum.net/search.do?q=substrate' },
      { rank: 2, keyword: '직장인 영어 회의 주도권 잡는 만능 패턴', enTopic: 'Business Meeting Patterns', mappedThemeId: 'biz-meeting', searchUrl: 'https://dic.daum.net/search.do?q=tentative' },
      { rank: 3, keyword: '고양이 자동급식기 & 예방 치아 관리법', enTopic: 'Preventive Pet Dental Care', mappedThemeId: 'cat-care', searchUrl: 'https://dic.daum.net/search.do?q=preventive' },
      { rank: 4, keyword: '공항 라운지 & 레이트 체크아웃 실전 회화', enTopic: 'Late Check-out English', mappedThemeId: 'travel-airport', searchUrl: 'https://dic.daum.net/search.do?q=itinerary' },
      { rank: 5, keyword: '글로벌 스포츠 빅매치 하이라이트 회화', enTopic: 'Live Sports Commentary', mappedThemeId: 'biz-meeting', searchUrl: 'https://dic.daum.net/search.do?q=expedite' },
    ],
  },
  {
    portal: 'GOOGLE',
    items: [
      { rank: 1, keyword: 'Luxury Hotel Concierge & Travel Tips', enTopic: 'Global Travel English', mappedThemeId: 'travel-airport', searchUrl: 'https://translate.google.com/?sl=en&tl=ko&text=complimentary%20upgrade&op=translate' },
      { rank: 2, keyword: 'Oxford & Collins Thesaurus Nuance Scale', enTopic: 'Synonym Intensity Scale', mappedThemeId: 'biz-meeting', searchUrl: 'https://translate.google.com/?sl=en&tl=ko&text=meticulously&op=translate' },
      { rank: 3, keyword: 'Ragdoll Cat Nutrition & BCS Monitoring', enTopic: 'Feline Health & Nutrition', mappedThemeId: 'cat-care', searchUrl: 'https://translate.google.com/?sl=en&tl=ko&text=nutritious%20diet&op=translate' },
      { rank: 4, keyword: 'Smart Web App & UI Automation Trend', enTopic: 'Tech & Productivity', mappedThemeId: 'auto-tech', searchUrl: 'https://translate.google.com/?sl=en&tl=ko&text=calibrate&op=translate' },
      { rank: 5, keyword: 'Executive Leadership & Team Synergy', enTopic: 'Team Management', mappedThemeId: 'biz-meeting', searchUrl: 'https://translate.google.com/?sl=en&tl=ko&text=on%20the%20same%20page&op=translate' },
    ],
  },
];

// ==========================================
// 5. 메인 컴포넌트
// ==========================================
export default function App() {
  // 테마 및 모드 상태
  const [selectedThemeId, setSelectedThemeId] = useState<string>('biz-meeting');
  const [activeMode, setActiveMode] = useState<'daily' | 'naverQuiz' | 'weekly' | 'monthly' | 'infinite'>('daily');
  const [activePortal, setActivePortal] = useState<'NAVER' | 'DAUM' | 'GOOGLE'>('NAVER');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 오디오(글로벌 발음) 상태 - 네이버 사전 글로벌 발음 듣기 반영
  const [accent, setAccent] = useState<'en-US' | 'en-GB' | 'en-AU' | 'en-IN'>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  // STEP 2 & 네이버 Word of the Day (Hide Word / Hide Meaning) 상태
  const [hideWordMode, setHideWordMode] = useState<boolean>(false);
  const [hideMeaningMode, setHideMeaningMode] = useState<boolean>(false);
  const [revealedWordIds, setRevealedWordIds] = useState<number[]>([]);
  const [revealedChallengeIdx, setRevealedChallengeIdx] = useState<number[]>([]);

  // STEP 3 (16개 문장 성분 × 9품사 매핑 다이어그램) 상태
  const [diagramTab, setDiagramTab] = useState<'all' | 'comp' | 'pos'>('all');
  const [selectedComp, setSelectedComp] = useState<CompId | null>('DO');
  const [selectedPos, setSelectedPos] = useState<PosId | null>('N');
  const [selectedDiagramExId, setSelectedDiagramExId] = useState<string>('ex1');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(7);

  // STEP 4 아이패드 펜슬 필기/타이핑 입력 상태
  const [writingInputs, setWritingInputs] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // STEP 5 네이버 스타일 퀴즈 탭 (Q단어 | Q초급 | Q중급 | Q고급) 상태
  const [quizLevelTab, setQuizLevelTab] = useState<'word' | 'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedBeginnerOpt, setSelectedBeginnerOpt] = useState<number | null>(null);
  const [selectedInterOpt, setSelectedInterOpt] = useState<number | null>(null);
  const [showInterHint, setShowInterHint] = useState<boolean>(false);
  const [selectedAdvOpts, setSelectedAdvOpts] = useState<number[]>([]);
  const [userWritingMission, setUserWritingMission] = useState<string>('');

  // 사전 검색창 입력 상태
  const [dictQuery, setDictQuery] = useState<string>('');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');

  const currentTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];
  const currentDiagramEx = DIAGRAM_EXAMPLES.find((e) => e.id === selectedDiagramExId) || DIAGRAM_EXAMPLES[0];

  // 테마 변경 시 퀴즈 선택 초기화
  useEffect(() => {
    setSelectedBeginnerOpt(null);
    setSelectedInterOpt(null);
    setShowInterHint(false);
    setSelectedAdvOpts([]);
    setRevealedWordIds([]);
  }, [selectedThemeId]);

  // Web Speech API 원어민 음성 재생 함수 (미국/영국/호주/인도 억양 지원)
  const speakText = (text: string, customAccent?: 'en-US' | 'en-GB' | 'en-AU' | 'en-IN') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[|\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = customAccent || accent;
    utterance.lang = targetLang;
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.includes(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // 구글 번역기 하이퍼링크 생성 함수 (Core Rule 2 완벽 준수)
  const getGoogleTranslateUrl = (text: string) => {
    const clean = text.replace(/\[|\]/g, '');
    return `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(clean)}&op=translate`;
  };

  // 네이버 사전 링크 생성 함수
  const getNaverDictUrl = (text: string) => {
    const clean = text.replace(/\[|\]/g, '');
    return `https://en.dict.naver.com/#/search?query=${encodeURIComponent(clean)}`;
  };

  // 아이패드 애플펜슬 드로잉 캔버스 핸들러
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = darkMode ? '#60a5fa' : '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 명령어 입력창 자동 모드 전환 핸들러
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = customTopicInput.trim();
    if (!q) return;
    if (q.includes('요일별') || q.includes('주간')) {
      setActiveMode('weekly');
    } else if (q.includes('월별') || q.includes('월간')) {
      setActiveMode('monthly');
    } else if (q.includes('퀴즈') || q.includes('첨삭') || q.includes('훈련')) {
      setActiveMode('naverQuiz');
    } else if (q.includes('고양이') || q.includes('랙돌') || q.includes('벨라') || q.includes('로이')) {
      setSelectedThemeId('cat-care');
      setActiveMode('daily');
    } else if (q.includes('자동차') || q.includes('조색') || q.includes('도장') || q.includes('판금')) {
      setSelectedThemeId('auto-tech');
      setActiveMode('daily');
    } else if (q.includes('여행') || q.includes('공항') || q.includes('호텔')) {
      setSelectedThemeId('travel-airport');
      setActiveMode('daily');
    } else {
      setSelectedThemeId('biz-meeting');
      setActiveMode('daily');
    }
    setCustomTopicInput('');
  };

  // STEP 4 예문 내 [단어]를 굵은 밑줄로 렌더링하는 헬퍼 (Core Rule 5)
  const renderHighlightedSentence = (line: string) => {
    const parts = line.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const word = part.slice(1, -1);
        return (
          <strong
            key={idx}
            className="underline decoration-2 decoration-blue-500 underline-offset-4 font-extrabold text-blue-600 dark:text-yellow-300 px-1 rounded bg-blue-50 dark:bg-blue-950/60"
          >
            {word}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        {/* ==========================================
            좌측 사이드바: 포털 실검 TOP 5 + 16개 카테고리 + 네이버 사전 허브
        ========================================== */}
        <aside className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
          {/* 브랜드 헤더 */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-extrabold rounded bg-emerald-500 text-white">N사전 연동</span>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  나만의 야나두 PRO
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                iPad Split-View · 16품사/성분 · 네이버 퀴즈 통합
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              title="라이트/다크 모드 전환"
            >
              {darkMode ? '☀️ 라이트' : '🌙 다크'}
            </button>
          </div>

          {/* 네이버 영어사전 다이렉트 검색창 (스크린샷 2, 4 반영) */}
          <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
              <span>💚 NAVER 영어사전 · 유의어 허브</span>
              <span className="text-emerald-400">Oxford 2026</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                placeholder="단어 검색 (예: streamline, lick)"
                className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
              />
              <a
                href={getNaverDictUrl(dictQuery || currentTheme.vocab[0].word)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center"
              >
                사전🔍
              </a>
            </div>
            {/* 사전 빠른 바로가기 4버튼 (KO-EN Dict, 영영사전, 파파고, 유의어사전) */}
            <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] font-semibold text-center">
              <a
                href="https://en.dict.naver.com/#/main"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-slate-200"
              >
                한영사전
              </a>
              <a
                href="https://en.dict.naver.com/#/enendict/home"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-slate-200"
              >
                영영사전
              </a>
              <a
                href="https://papago.naver.com/"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-emerald-300"
              >
                파파고
              </a>
              <a
                href={getGoogleTranslateUrl(dictQuery || currentTheme.pattern.en)}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-blue-300"
              >
                구글번역
              </a>
            </div>
          </div>

          {/* 스크롤 영역: 1) 포털 실검 TOP 5  2) 테마 카테고리 */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
            {/* 실시간 포털 트렌드 (네이버 / 다음 / 구글 실검 순서 학습) */}
            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  🔥 포털 실검 트렌드 학습
                </span>
                <div className="flex gap-1">
                  {(['NAVER', 'DAUM', 'GOOGLE'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePortal(p)}
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md transition ${
                        activePortal === p
                          ? p === 'NAVER'
                            ? 'bg-emerald-600 text-white'
                            : p === 'DAUM'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {PORTAL_TRENDS.find((pt) => pt.portal === activePortal)?.items.map((item) => (
                  <div
                    key={item.rank}
                    onClick={() => {
                      setSelectedThemeId(item.mappedThemeId);
                      setActiveMode('daily');
                    }}
                    className="group flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {item.rank}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.keyword}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{item.enTopic}</div>
                      </div>
                    </div>
                    <a
                      href={item.searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 flex-shrink-0"
                      title="포털 사전 원문 보기"
                    >
                      원문↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 메인 커리큘럼 카테고리 선택 */}
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-2">
                📚 맞춤형 정규 학습 테마 (클릭 시 즉시 전환)
              </p>
              <div className="space-y-2">
                {THEMES.map((theme) => {
                  const isSelected = theme.id === selectedThemeId && activeMode === 'daily';
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        setActiveMode('daily');
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {theme.badge}
                        </span>
                        <span className="text-[10px] opacity-75">{theme.portal} 연동</span>
                      </div>
                      <div className="text-sm font-extrabold mt-1.5">{theme.title}</div>
                      <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        패턴: {theme.pattern.en}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 글로벌 발음 듣기 컨트롤러 (스크린샷 2 글로벌 발음 듣기 반영) */}
            <div className="bg-slate-100 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-2 flex items-center justify-between">
                <span>🌍 글로벌 원어민 발음 설정</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{speechRate}x 속도</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                {[
                  { code: 'en-US', label: '🇺🇸 미국' },
                  { code: 'en-GB', label: '🇬🇧 영국' },
                  { code: 'en-AU', label: '🇦🇺 호주' },
                  { code: 'en-IN', label: '🇮🇳 인도' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setAccent(item.code as 'en-US' | 'en-GB' | 'en-AU' | 'en-IN');
                      speakText(currentTheme.pattern.en, item.code as 'en-US' | 'en-GB' | 'en-AU' | 'en-IN');
                    }}
                    className={`py-1.5 rounded-lg border transition ${
                      accent === item.code
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setSpeechRate(0.8)}
                  className={`flex-1 py-1 rounded text-[11px] font-bold ${
                    speechRate === 0.8 ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900 text-slate-500'
                  }`}
                >
                  🐢 0.8x 연음 듣기
                </button>
                <button
                  onClick={() => setSpeechRate(0.95)}
                  className={`flex-1 py-1 rounded text-[11px] font-bold ${
                    speechRate === 0.95 ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900 text-slate-500'
                  }`}
                >
                  ⚡ 1.0x 실전 속도
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ==========================================
            우측 메인 영역: 상단 5대 모드 네비게이션 + 본문
        ========================================== */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* 상단 모드 전환 바 & 코치 명령어 입력창 */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {[
                { id: 'daily', label: '📝 일일 강의 노트' },
                { id: 'naverQuiz', label: '💚 네이버 단어·퀴즈 챌린지' },
                { id: 'weekly', label: '🗓️ 요일별(주간) 정리' },
                { id: 'monthly', label: '🏆 월별 마스터 사전' },
                { id: 'infinite', label: '🔥 무한 훈련 & 펜슬장' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMode(tab.id as typeof activeMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeMode === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 명령어 입력창 (자동 모드 전환 시스템) */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="명령어 입력 (예: 요일별 정리, 퀴즈 추가, 고양이, 조색)"
                className="w-64 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-extrabold hover:opacity-90"
              >
                실행
              </button>
            </form>
          </header>

          {/* 본문 스크롤 컨테이너 */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <div className="max-w-5xl mx-auto space-y-8 pb-16">
              {/* ==========================================
                  MODE 1: 일일 강의 노트 (STEP 1 ~ STEP 5 풀코스)
              ========================================== */}
              {activeMode === 'daily' && (
                <>
                  {/* 강의 헤더 배너 */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full">
                        🗓️ {currentTheme.dateLabel} · {currentTheme.badge}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(currentTheme.pattern.en)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1"
                        >
                          🔊 패턴 원어민 발음 듣기
                        </button>
                        <a
                          href={getGoogleTranslateUrl(currentTheme.pattern.en)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          🔗 구글 번역기
                        </a>
                      </div>
                    </div>
                    <h2 className="text-2xl font-extrabold mt-3 text-slate-900 dark:text-white">
                      📣 오늘의 선택 테마: {currentTheme.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      💡 <strong>코치의 핵심 포인트:</strong> {currentTheme.coachPoint}
                    </p>
                  </div>

                  {/* STEP 1. 오늘의 야나두 만능 패턴 */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        🧩 STEP 1. 오늘의 야나두 만능 패턴 (Pattern Drill)
                      </h3>
                      <span className="text-xs text-slate-400">단어만 갈아 끼우면 100문장 완성</span>
                    </div>
                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xl font-extrabold text-yellow-400 tracking-wide">
                          {currentTheme.pattern.en}
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-medium">
                          원어민 리얼 발음: <strong className="text-white">{currentTheme.pattern.pron}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(currentTheme.pattern.en)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow"
                        >
                          🔊 즉시 발음 재생
                        </button>
                        <a
                          href={getGoogleTranslateUrl(currentTheme.pattern.en)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                        >
                          🔗 번역기 열기
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 bg-blue-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
                      💬 <strong>원어민 뉘앙스 해설:</strong> {currentTheme.pattern.nuance}
                    </p>
                  </section>

                  {/* STEP 2. 일상 & 고급 짝꿍 단어장 (10 Words Mix) + 네이버 Hide Word/Meaning + 유의어 강세 보기 */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          📚 STEP 2. 일상 & 고급 짝꿍 단어장 (5:5 황금 비율 10 Words)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          단어를 클릭하면 아래 <strong>STEP 3의 16개 문장 성분×품사 다이어그램</strong>에서 연결 경로가 즉시 하이라이트됩니다!
                        </p>
                      </div>

                      {/* 네이버 Word of the Day 스타일 Hide Word / Hide Meaning 토글 버튼 (스크린샷 7, 8 반영) */}
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setHideWordMode(!hideWordMode)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition ${
                            hideWordMode
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                          }`}
                        >
                          {hideWordMode ? '🙈 Hide Word (ON)' : '👁️ Hide Word'}
                        </button>
                        <button
                          onClick={() => setHideMeaningMode(!hideMeaningMode)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition ${
                            hideMeaningMode
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                          }`}
                        >
                          {hideMeaningMode ? '🙈 Hide Meaning (ON)' : '👁️ Hide Meaning'}
                        </button>
                      </div>
                    </div>

                    {/* 10개 어휘 테이블 */}
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-extrabold">
                          <tr>
                            <th className="py-3.5 px-4 text-center">번호</th>
                            <th className="py-3.5 px-4">구분</th>
                            <th className="py-3.5 px-4">단어 & 원어민 발음 (클릭 시 STEP 3 연동)</th>
                            <th className="py-3.5 px-4">핵심 뜻 (9품사 / 문장성분)</th>
                            <th className="py-3.5 px-4">🔗 실전 짝꿍 표현 (Collocation) & 영영 풀이</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {currentTheme.vocab.map((v) => {
                            const isWordHidden = hideWordMode && !revealedWordIds.includes(v.id);
                            const isMeaningHidden = hideMeaningMode && !revealedWordIds.includes(v.id);
                            const isSelectedInDiagram = selectedComp === v.comp && selectedPos === v.pos;

                            return (
                              <tr
                                key={v.id}
                                onClick={() => {
                                  setSelectedComp(v.comp);
                                  setSelectedPos(v.pos);
                                  setDiagramTab('all');
                                }}
                                className={`cursor-pointer transition ${
                                  isSelectedInDiagram
                                    ? 'bg-blue-50/90 dark:bg-blue-950/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <td className="py-3.5 px-4 text-center font-extrabold text-slate-400">{v.id}</td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                                      v.type === '일상 회화'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                    }`}
                                  >
                                    {v.type}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide">
                                      {isWordHidden ? v.masked : v.word}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(v.word);
                                      }}
                                      className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs hover:scale-105"
                                      title="원어민 발음 듣기"
                                    >
                                      🔊
                                    </button>
                                    {(hideWordMode || hideMeaningMode) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRevealedWordIds((prev) =>
                                            prev.includes(v.id) ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                                          );
                                        }}
                                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs"
                                        title="정답 철자/뜻 미리보기"
                                      >
                                        👁️
                                      </button>
                                    )}
                                    <a
                                      href={getGoogleTranslateUrl(v.collocation)}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] text-slate-400 hover:text-blue-500"
                                      title="구글 번역기로 보기"
                                    >
                                      🔗
                                    </a>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                                    {v.pron}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-800 dark:text-slate-100">
                                    {isMeaningHidden ? '🔒 [뜻 숨김 - 👁️ 터치]' : v.meaning}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      품사: {v.posLabel}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                      성분: {v.compLabel}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                    <span>{v.collocation}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(v.collocation);
                                      }}
                                      className="text-xs opacity-80 hover:opacity-100"
                                    >
                                      🔊
                                    </button>
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-300">
                                    ({isMeaningHidden ? '짝꿍 뜻 숨김' : v.collocationKo})
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1 italic">{v.enDef}</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 옥스퍼드 & 콜린스 유의어 강세 보기 (스크린샷 6 완벽 반영) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">
                            Oxford & Collins Thesaurus Dictionaries
                          </span>
                          <h4 className="text-base font-extrabold mt-0.5">
                            📊 유의어 강세 보기 (강함 ↕ 약함 뉘앙스 스케일) — {currentTheme.synonymScale.baseWord}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400">{currentTheme.synonymScale.meaning}</span>
                      </div>

                      <div className="mt-4 flex gap-4 items-stretch">
                        {/* 수직 강함 <-> 약함 화살표 바 */}
                        <div className="flex flex-col items-center justify-between py-2 px-2 bg-slate-800 rounded-xl text-[11px] font-extrabold text-blue-300">
                          <span>▲ 강함</span>
                          <div className="w-1 flex-1 bg-gradient-to-b from-rose-500 via-blue-500 to-emerald-400 my-2 rounded-full" />
                          <span>▼ 약함</span>
                        </div>

                        {/* 단계별 유의어 블록 */}
                        <div className="flex-1 space-y-2.5">
                          {currentTheme.synonymScale.levels.map((lvl, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2"
                            >
                              <span className="text-xs font-extrabold text-slate-300 w-36">{lvl.strength}</span>
                              <div className="flex-1 flex flex-wrap gap-2">
                                {lvl.words.map((w, wIdx) => (
                                  <button
                                    key={wIdx}
                                    onClick={() => speakText(w.word)}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-xs font-extrabold text-indigo-200 flex items-center gap-1.5 transition"
                                  >
                                    <span>{w.word} 🔊</span>
                                    <span className="text-[11px] font-normal text-slate-300">— {w.nuance}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ==========================================
                      STEP 3. 16개 문장 성분(7) × 9품사(9) 인터랙티브 매핑 다이어그램 (두 번째 이미지 완벽 구현)
                  ========================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    {/* 상단 탭 (16개 전체 매핑 | 문장 성분(7) 기준 | 9품사 기준) */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {[
                          { id: 'all', label: '16개 전체 매핑' },
                          { id: 'comp', label: '문장 성분(7) 기준' },
                          { id: 'pos', label: '9품사 기준' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setDiagramTab(t.id as 'all' | 'comp' | 'pos')}
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition ${
                              diagramTab === t.id
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedComp(null);
                          setSelectedPos(null);
                          setSelectedTokenIdx(null);
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        전체 연결 보기
                      </button>
                    </div>

                    {/* 인터랙티브 SVG 노드 & 연결선 다이어그램 박스 */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        상단 직책(문장 성분 7개) 또는 하단 신분(9품사) 노드를 클릭해 연결 경로를 확인하세요.
                      </p>

                      <div className="w-full overflow-x-auto">
                        <svg viewBox="0 0 920 310" className="w-full min-w-[760px] h-auto select-none">
                          <text x="30" y="24" className="fill-slate-400 text-[11px] font-bold">
                            문장 성분 (5대 요소 · 세부 7직책) — 문장에서 맡는 자리
                          </text>

                          {/* 연결선 (Edges) */}
                          {MAPPING_EDGES.map((edge, idx) => {
                            const compIdx = SENTENCE_COMPONENTS.findIndex((c) => c.id === edge.comp);
                            const posIdx = PARTS_OF_SPEECH.findIndex((p) => p.id === edge.pos);
                            const x1 = 75 + compIdx * 128;
                            const y1 = 112;
                            const x2 = 55 + posIdx * 101;
                            const y2 = 212;
                            const midY = 162;

                            const isHighlighted =
                              (selectedComp === null && selectedPos === null) ||
                              (selectedComp !== null &&
                                selectedPos !== null &&
                                edge.comp === selectedComp &&
                                edge.pos === selectedPos) ||
                              (selectedComp !== null && selectedPos === null && edge.comp === selectedComp) ||
                              (selectedPos !== null && selectedComp === null && edge.pos === selectedPos);

                            const isDashed = edge.comp === 'M';

                            return (
                              <path
                                key={idx}
                                d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
                                fill="none"
                                stroke={isHighlighted ? '#2563eb' : '#cbd5e1'}
                                strokeWidth={isHighlighted ? 2.6 : 1.2}
                                strokeDasharray={isDashed ? '4 3' : undefined}
                                opacity={isHighlighted ? 1 : 0.35}
                              />
                            );
                          })}

                          {/* 상단 7개 문장 성분 노드 */}
                          {SENTENCE_COMPONENTS.map((comp, idx) => {
                            const cx = 75 + idx * 128;
                            const cy = 74;
                            const isActive =
                              selectedComp === comp.id ||
                              (selectedComp === null &&
                                selectedPos !== null &&
                                MAPPING_EDGES.some((e) => e.comp === comp.id && e.pos === selectedPos));

                            return (
                              <g
                                key={comp.id}
                                onClick={() => {
                                  setSelectedComp(comp.id);
                                  setSelectedPos(null);
                                }}
                                className="cursor-pointer"
                              >
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={38}
                                  fill={isActive ? '#eff6ff' : '#ffffff'}
                                  stroke={isActive ? '#2563eb' : '#94a3b8'}
                                  strokeWidth={isActive ? 2.8 : 1.5}
                                />
                                <text
                                  x={cx}
                                  y={cy - 4}
                                  textAnchor="middle"
                                  className="text-[13px] font-extrabold fill-slate-800"
                                >
                                  {comp.name}
                                </text>
                                <text
                                  x={cx}
                                  y={cy + 15}
                                  textAnchor="middle"
                                  className="text-[11px] font-bold fill-blue-600 italic"
                                >
                                  {comp.sub}
                                </text>
                              </g>
                            );
                          })}

                          {/* 하단 9품사 노드 */}
                          {PARTS_OF_SPEECH.map((pos, idx) => {
                            const cx = 55 + idx * 101;
                            const cy = 248;
                            const isActive =
                              selectedPos === pos.id ||
                              (selectedPos === null &&
                                selectedComp !== null &&
                                MAPPING_EDGES.some((e) => e.pos === pos.id && e.comp === selectedComp));

                            return (
                              <g
                                key={pos.id}
                                onClick={() => {
                                  setSelectedPos(pos.id);
                                  setSelectedComp(null);
                                }}
                                className="cursor-pointer"
                              >
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={34}
                                  fill={isActive ? '#eff6ff' : '#ffffff'}
                                  stroke={isActive ? '#2563eb' : '#cbd5e1'}
                                  strokeWidth={isActive ? 2.8 : 1.5}
                                />
                                <text
                                  x={cx}
                                  y={cy - 3}
                                  textAnchor="middle"
                                  className="text-[12px] font-extrabold fill-slate-800"
                                >
                                  {pos.name}
                                </text>
                                <text
                                  x={cx}
                                  y={cy + 14}
                                  textAnchor="middle"
                                  className="text-[10px] font-bold fill-slate-500 italic"
                                >
                                  {pos.sub}
                                </text>
                              </g>
                            );
                          })}

                          <text x="30" y="302" className="fill-slate-400 text-[11px] font-bold">
                            9품사 (단어의 고유 신분) — 사전에 등재된 갈래 (*접속사·감탄사는 독립/연결 요소)
                          </text>
                        </svg>
                      </div>

                      {/* 16개 전체 요약 및 원클릭 탐색 버튼 바 */}
                      <div className="mt-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            16개 전체 요약
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            7개 문장 성분(직책)과 9품사(신분)의 상호 매핑
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          <strong>핵심 규칙:</strong> 동사는 동사만, 주·목적어는 명사계열만, 보어는 명·형용사만! 단어마다 타고난 품사(명사·동사·형용사 등 9가지)가 있으며, 문장 속에 들어가면 주어(S)·동사(V)·목적어(IO/DO)·보어(SC/OC)·수식어(M) 중 하나의 직책을 맡습니다.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[
                            { label: '주어 (S) 탐색', comp: 'S' as CompId, pos: null },
                            { label: '주격보어 (SC) 탐색', comp: 'SC' as CompId, pos: null },
                            { label: '수식어 (M) 탐색', comp: 'M' as CompId, pos: null },
                            { label: '명사 (N) 탐색', comp: null, pos: 'N' as PosId },
                            { label: '형용사 (Adj) 탐색', comp: null, pos: 'Adj' as PosId },
                          ].map((btn, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedComp(btn.comp);
                                setSelectedPos(btn.pos);
                              }}
                              className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-500 transition"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 실전 예문 이중 레이어 해부 (문장 성분 × 9품사 어절 카드) */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            실전 예문 이중 레이어 해부 (문장 성분 × 9품사)
                          </h4>
                          <p className="text-xs text-slate-500">
                            어절 카드를 클릭하면 위 매핑 다이어그램에서 해당 문장 성분과 품사가 동시에 강조됩니다.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {DIAGRAM_EXAMPLES.map((ex) => (
                            <button
                              key={ex.id}
                              onClick={() => {
                                setSelectedDiagramExId(ex.id);
                                setSelectedTokenIdx(null);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition ${
                                selectedDiagramExId === ex.id
                                  ? 'bg-white dark:bg-slate-900 text-blue-600 border-2 border-blue-600 shadow-sm'
                                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {ex.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 어절 카드 그리드 (두 번째 이미지 하단 카드 완벽 재현) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {currentDiagramEx.tokens.map((tk, idx) => {
                          const isCardSelected = selectedTokenIdx === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedTokenIdx(idx);
                                setSelectedComp(tk.comp === '독립어' ? 'M' : tk.comp);
                                setSelectedPos(tk.pos);
                                speakText(tk.word);
                              }}
                              className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border text-center flex flex-col items-center justify-between gap-2 transition shadow-sm ${
                                isCardSelected
                                  ? 'border-2 border-blue-600 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                              }`}
                            >
                              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {tk.compLabel}
                              </span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white my-0.5">
                                {tk.word}
                              </span>
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                {tk.posLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                        <div>
                          <strong>해석:</strong> {currentDiagramEx.translation} (<strong>뼈대:</strong>{' '}
                          {currentDiagramEx.skeleton})
                        </div>
                        <div className="italic text-slate-500">
                          <strong>문형:</strong> {currentDiagramEx.patternType}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ==========================================
                      STEP 4. 3단 직독직해 & 아이패드 펜슬 트레이닝 (4 Sentences)
                  ========================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          🗣️ STEP 4. 3단 직독직해 & 아이패드 펜슬 트레이닝 (4 Sentences)
                        </h3>
                        <p className="text-xs text-slate-500">
                          ①한국어 의미 단위(S/V/O/C/M) ➔ ②영어 1:1 매칭(타겟 단어 굵은 밑줄) ➔ ③원어민 리얼 한글 발음
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {currentTheme.sentences.map((sent) => (
                        <div
                          key={sent.id}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-600 text-white">
                                {sent.tag}
                              </span>
                              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                                Target:{' '}
                                <strong className="underline decoration-2 decoration-blue-500 text-blue-600 dark:text-yellow-300">
                                  {sent.targetWord}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => speakText(sent.rawEn)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold"
                              >
                                🔊 문장 듣기
                              </button>
                              <a
                                href={getGoogleTranslateUrl(sent.rawEn)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-white dark:hover:bg-slate-800"
                              >
                                🔗 번역기
                              </a>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-slate-500">🔗 문장 뼈대 구조: {sent.structure}</div>

                          {/* 3단 직독직해 박스 */}
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-sm leading-relaxed">
                            <div className="text-slate-700 dark:text-slate-300 font-semibold">① {sent.koLine}</div>
                            <div className="text-slate-900 dark:text-white font-bold text-base">
                              ② {renderHighlightedSentence(sent.enLine)}
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 text-xs font-bold">③ {sent.pronLine}</div>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                            💡 <strong>세련된 의역:</strong> "{sent.naturalKo}"
                          </div>

                          {/* ✍️ iPad Pencil Writing 입력 라인 */}
                          <div className="pt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-500 w-36">✍️ 1) 따라 쓰기:</span>
                              <input
                                type="text"
                                value={writingInputs[`copy-${sent.id}`] || ''}
                                onChange={(e) =>
                                  setWritingInputs({ ...writingInputs, [`copy-${sent.id}`]: e.target.value })
                                }
                                placeholder={sent.rawEn}
                                className="flex-1 text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 py-1.5 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-500 w-36">✍️ 2) 나만의 응용문:</span>
                              <input
                                type="text"
                                value={writingInputs[`custom-${sent.id}`] || ''}
                                onChange={(e) =>
                                  setWritingInputs({ ...writingInputs, [`custom-${sent.id}`]: e.target.value })
                                }
                                placeholder="단어를 갈아 끼워 나만의 문장을 애플 펜슬이나 키보드로 적어보세요."
                                className="flex-1 text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 py-1.5 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ==========================================
                      STEP 5. 네이버 오늘의 단어 퀴즈 (Q단어 | Q초급 | Q중급 | Q고급) & 실전 영작
                  ========================================== */}
                  <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-6 border border-slate-800">
                    {/* 네이버 퀴즈 상단 네비게이션 완벽 구현 (스크린샷 1, 3, 5, 7 반영) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded bg-white text-slate-900 font-black flex items-center justify-center text-sm">
                          N
                        </span>
                        <div>
                          <h3 className="text-lg font-extrabold">
                            🎮 STEP 5. 오늘의 단어 퀴즈 (초급 · 중급 · 고급 & 실전 영작)
                          </h3>
                          <p className="text-xs text-slate-400">11월 10일 · 네이버 영어사전 퀴즈 포맷 완벽 연동</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl">
                        {[
                          { id: 'word', label: '단어 (빈칸 추론)' },
                          { id: 'beginner', label: 'Q 초급 (뜻 맞추기)' },
                          { id: 'intermediate', label: 'Q 중급 (문장 빈칸)' },
                          { id: 'advanced', label: 'Q 고급 (유의어 복수선택)' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setQuizLevelTab(tab.id as typeof quizLevelTab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                              quizLevelTab === tab.id
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 탭 1: 단어 (Word of the Day 빈칸 철자 추론 - 스크린샷 7, 8) */}
                    {quizLevelTab === 'word' && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-300 flex items-center justify-between">
                          <span>💡 철자 빈칸(`⬛`)을 추론해 보고 오른쪽 눈(👁️) 아이콘을 눌러 정답을 확인하세요.</span>
                          <button
                            onClick={() =>
                              setRevealedChallengeIdx(
                                revealedChallengeIdx.length === NAVER_OFFICIAL_WORD_CHALLENGE.length
                                  ? []
                                  : NAVER_OFFICIAL_WORD_CHALLENGE.map((_, i) => i)
                              )
                            }
                            className="text-blue-400 font-bold underline"
                          >
                            전체 정답 토글
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {NAVER_OFFICIAL_WORD_CHALLENGE.map((item, idx) => {
                            const isRevealed = revealedChallengeIdx.includes(idx);
                            return (
                              <div
                                key={idx}
                                className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-extrabold tracking-widest text-white">
                                    {isRevealed ? item.word : item.masked}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => speakText(item.word)}
                                      className="w-8 h-8 rounded-full bg-slate-700 hover:bg-blue-600 text-blue-300 hover:text-white flex items-center justify-center"
                                    >
                                      🔊
                                    </button>
                                    <button
                                      onClick={() =>
                                        setRevealedChallengeIdx((prev) =>
                                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                        )
                                      }
                                      className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center"
                                    >
                                      👁️
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-blue-300 font-semibold">{item.enDef}</div>
                                <div className="text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/60">
                                  "{isRevealed ? item.exampleFull : item.example}"
                                </div>
                                {isRevealed && (
                                  <div className="text-xs text-emerald-400 font-bold">
                                    ✅ 정답: {item.word} {item.pron} — {item.koMeaning}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 탭 2: Q초급 (단어 뜻 맞추기 - 스크린샷 5 반영) */}
                    {quizLevelTab === 'beginner' && (
                      <div className="max-w-xl mx-auto text-center space-y-5 py-4">
                        <div className="text-xs text-slate-400">아래 단어의 뜻은?</div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-extrabold text-white">{currentTheme.quiz.beginner.word}</span>
                          <button
                            onClick={() => speakText(currentTheme.quiz.beginner.word.split(' ')[0])}
                            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="space-y-2.5 text-left">
                          {currentTheme.quiz.beginner.options.map((opt, idx) => {
                            const isPicked = selectedBeginnerOpt === idx;
                            const isCorrect = idx === currentTheme.quiz.beginner.answerIdx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedBeginnerOpt(idx)}
                                className={`w-full p-4 rounded-2xl font-bold text-sm text-center transition border ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-600 border-emerald-400 text-white'
                                      : 'bg-rose-600 border-rose-400 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {selectedBeginnerOpt !== null && (
                          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-left text-slate-200">
                            💡 <strong>해설:</strong> {currentTheme.quiz.beginner.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 탭 3: Q중급 (문장 빈칸 추론 + Hint 버튼 - 스크린샷 3 반영) */}
                    {quizLevelTab === 'intermediate' && (
                      <div className="max-w-xl mx-auto text-center space-y-5 py-4">
                        <div className="text-xs text-slate-400">아래 빈칸에 들어갈 단어는?</div>
                        <div className="text-xl font-extrabold leading-relaxed flex flex-wrap items-center justify-center gap-2">
                          <span>{currentTheme.quiz.intermediate.sentenceBefore}</span>
                          <span className="inline-block w-28 h-9 rounded-lg bg-slate-800 border-2 border-dashed border-blue-400 align-middle px-2 text-blue-300 text-base leading-8">
                            {selectedInterOpt !== null
                              ? currentTheme.quiz.intermediate.options[selectedInterOpt]
                              : '______'}
                          </span>
                          <span>{currentTheme.quiz.intermediate.sentenceAfter}</span>
                        </div>

                        <button
                          onClick={() => setShowInterHint(!showInterHint)}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300"
                        >
                          👁️ Hint {showInterHint ? `— ${currentTheme.quiz.intermediate.hint}` : '(클릭하여 힌트 보기)'}
                        </button>

                        <div className="space-y-2.5">
                          {currentTheme.quiz.intermediate.options.map((opt, idx) => {
                            const isPicked = selectedInterOpt === idx;
                            const isCorrect = idx === currentTheme.quiz.intermediate.answerIdx;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedInterOpt(idx);
                                  speakText(opt);
                                }}
                                className={`w-full p-4 rounded-2xl font-bold text-sm text-center transition border ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-600 border-emerald-400 text-white'
                                      : 'bg-rose-600 border-rose-400 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {selectedInterOpt !== null && (
                          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-left text-slate-200">
                            💡 <strong>해설:</strong> {currentTheme.quiz.intermediate.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 탭 4: Q고급 (문맥 유의어 복수 선택 - 스크린샷 1 완벽 반영) */}
                    {quizLevelTab === 'advanced' && (
                      <div className="max-w-xl mx-auto text-center space-y-5 py-4">
                        <div className="text-xs text-slate-400">
                          아래 문장에서 같은 의미로 쓰일 수 있는 단어를 <strong>모두 선택</strong>해 주세요.
                        </div>
                        <div className="text-xl font-extrabold flex items-center justify-center gap-2 flex-wrap">
                          <span>{currentTheme.quiz.advanced.sentenceBefore}</span>
                          <span className="text-blue-400 underline underline-offset-4">
                            {currentTheme.quiz.advanced.highlightWord}
                          </span>
                          <span>{currentTheme.quiz.advanced.sentenceAfter}</span>
                          <button
                            onClick={() =>
                              speakText(
                                `${currentTheme.quiz.advanced.sentenceBefore} ${currentTheme.quiz.advanced.highlightWord} ${currentTheme.quiz.advanced.sentenceAfter}`
                              )
                            }
                            className="w-8 h-8 rounded-full bg-slate-800 text-sm"
                          >
                            🔊
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {currentTheme.quiz.advanced.options.map((opt, idx) => {
                            const isSelected = selectedAdvOpts.includes(idx);
                            const isAnswer = currentTheme.quiz.advanced.answerIndices.includes(idx);
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  speakText(opt);
                                  setSelectedAdvOpts((prev) =>
                                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                  );
                                }}
                                className={`w-full p-4 rounded-2xl font-bold text-sm text-center transition border ${
                                  isSelected
                                    ? isAnswer
                                      ? 'bg-emerald-600 border-emerald-400 text-white'
                                      : 'bg-rose-600 border-rose-400 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {selectedAdvOpts.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-left text-slate-200">
                            💡 <strong>고급 유의어 해설:</strong> {currentTheme.quiz.advanced.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Q3. 나만의 영작 미션 & <details> 정답 숨김 (Core Rule 8) */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="text-sm font-extrabold text-yellow-400">
                        ✍️ [실전 영작 미션] 오늘의 패턴을 활용해 다음 한국어 문장을 영어로 적어보세요.
                      </div>
                      <div className="text-xs text-slate-300">
                        • 미션 문장: <strong>"{currentTheme.quiz.writingMission.koPrompt}"</strong> (힌트:{' '}
                        {currentTheme.quiz.writingMission.hint})
                      </div>
                      <input
                        type="text"
                        value={userWritingMission}
                        onChange={(e) => setUserWritingMission(e.target.value)}
                        placeholder="My Answer: 여기에 직접 영작해 보세요..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />

                      <details className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 cursor-pointer">
                        <summary className="text-xs font-extrabold text-blue-300">
                          👀 정답 및 코치의 뉘앙스 해설 확인하기 (터치)
                        </summary>
                        <div className="mt-3 space-y-2 text-xs text-slate-200 leading-relaxed">
                          <div>
                            ✅ <strong>Q초급 정답:</strong>{' '}
                            {currentTheme.quiz.beginner.options[currentTheme.quiz.beginner.answerIdx]} —{' '}
                            {currentTheme.quiz.beginner.explanation}
                          </div>
                          <div>
                            ✅ <strong>Q중급 정답:</strong>{' '}
                            {currentTheme.quiz.intermediate.options[currentTheme.quiz.intermediate.answerIdx]} —{' '}
                            {currentTheme.quiz.intermediate.explanation}
                          </div>
                          <div>
                            ✅ <strong>Q고급 복수 정답:</strong>{' '}
                            {currentTheme.quiz.advanced.answerIndices
                              .map((i) => currentTheme.quiz.advanced.options[i])
                              .join(', ')}{' '}
                            — {currentTheme.quiz.advanced.explanation}
                          </div>
                          <div className="pt-2 border-t border-slate-700 text-emerald-300 font-bold flex items-center gap-2">
                            <span>✅ 영작 모범 답안: {currentTheme.quiz.writingMission.modelAnswer}</span>
                            <button
                              onClick={() => speakText(currentTheme.quiz.writingMission.modelAnswer)}
                              className="px-2 py-0.5 rounded bg-emerald-700 text-white"
                            >
                              🔊 듣기
                            </button>
                          </div>
                          <div>
                            💡 <strong>체크 포인트:</strong> {currentTheme.quiz.writingMission.checkPoint}
                          </div>
                        </div>
                      </details>
                    </div>
                  </section>
                </>
              )}

              {/* ==========================================
                  MODE 2: 네이버 단어·퀴즈 챌린지 단독 랩 (스크린샷 1~8 풀스크린 버전)
              ========================================== */}
              {activeMode === 'naverQuiz' && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-8 border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400">NAVER ENGLISH DICTIONARY & QUIZ</span>
                      <h2 className="text-2xl font-extrabold mt-1">
                        💚 WORD OF THE DAY QUIZ & 옥스퍼드 유의어 강세 사전
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        올려주신 네이버 영어사전 퀴즈(단어 · Q초급 · Q중급 · Q고급)와 유의어 강세 사전을 한 화면에서 집중 훈련합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveMode('daily')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold"
                    >
                      ← 일일 강의 노트로 돌아가기
                    </button>
                  </div>

                  {/* Word of the Day 5문항 전체 리스트 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-blue-300">
                        1️⃣ WORD OF THE DAY (철자 빈칸 & 영영 풀이 챌린지)
                      </h3>
                      <button
                        onClick={() =>
                          setRevealedChallengeIdx(
                            revealedChallengeIdx.length === NAVER_OFFICIAL_WORD_CHALLENGE.length
                              ? []
                              : NAVER_OFFICIAL_WORD_CHALLENGE.map((_, i) => i)
                          )
                        }
                        className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold"
                      >
                        Start Challenge / 정답 전체 보기
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {NAVER_OFFICIAL_WORD_CHALLENGE.map((item, idx) => {
                        const isRev = revealedChallengeIdx.includes(idx);
                        return (
                          <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black tracking-wider text-white">
                                {isRev ? item.word : item.masked}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => speakText(item.word)}
                                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center"
                                >
                                  🔊
                                </button>
                                <button
                                  onClick={() =>
                                    setRevealedChallengeIdx((prev) =>
                                      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                    )
                                  }
                                  className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center"
                                >
                                  👁️
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-blue-300 font-semibold">{item.enDef}</p>
                            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl">
                              "{isRev ? item.exampleFull : item.example}"
                            </p>
                            {isRev && (
                              <p className="text-xs font-bold text-emerald-400">
                                정답: {item.word} {item.pron} ({item.koMeaning})
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  MODE 3: 요일별(주간) 정리 노트 (Output Format 2)
              ========================================== */}
              {activeMode === 'weekly' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-xs font-extrabold text-blue-600">WEEKLY MASTER NOTE</span>
                    <h2 className="text-2xl font-extrabold mt-1">📊 요일별(주간) 학습 로드맵 & 핵심 문장 TOP 5</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      월~금요일까지 학습한 테마, 만능 패턴, 대표 일상/고급 어휘를 한눈에 복습하는 아이패드 보관용 요약표입니다.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-200">
                        <tr>
                          <th className="p-3.5">요일</th>
                          <th className="p-3.5">학습 테마</th>
                          <th className="p-3.5">핵심 만능 패턴</th>
                          <th className="p-3.5">대표 일상 어휘</th>
                          <th className="p-3.5">대표 고급/실무 어휘</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="p-3.5 font-extrabold text-blue-600">월요일</td>
                          <td className="p-3.5 font-bold">📊 비즈니스 미팅 & 공정 조율</td>
                          <td className="p-3.5 font-mono">I was wondering if you could ~</td>
                          <td className="p-3.5">wrap up, touch base, heads-up</td>
                          <td className="p-3.5">streamline, tentative, feasible</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-extrabold text-blue-600">화요일</td>
                          <td className="p-3.5 font-bold">🐱 반려동물(랙돌) 건강·영양 케어</td>
                          <td className="p-3.5 font-mono">Make sure to keep an eye on ~</td>
                          <td className="p-3.5">lick, picky, cuddle, unscented</td>
                          <td className="p-3.5">hydration, nutritious, docile</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-extrabold text-blue-600">수요일</td>
                          <td className="p-3.5 font-bold">🚗 수용성 컬러 조색 & 정밀 정비</td>
                          <td className="p-3.5 font-mono">It is essential to calibrate ~</td>
                          <td className="p-3.5">blend in, spot-on, fine-tune</td>
                          <td className="p-3.5">formulation, substrate, viscosity</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-extrabold text-blue-600">목요일</td>
                          <td className="p-3.5 font-bold">✈️ 공항 라운지 & 호텔 컨시어지</td>
                          <td className="p-3.5 font-mono">Would it be possible to get ~?</td>
                          <td className="p-3.5">drop off, freshen up, layover</td>
                          <td className="p-3.5">complimentary, accommodate, itinerary</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-extrabold text-blue-600">금요일</td>
                          <td className="p-3.5 font-bold">💚 네이버 주간 퀴즈 & 유의어 총정리</td>
                          <td className="p-3.5 font-mono">Let us make sure we are on the same page.</td>
                          <td className="p-3.5">grab, shed, carry-on</td>
                          <td className="p-3.5">expedite, meticulously, vacant</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==========================================
                  MODE 4: 월별 정리 마스터 사전 (Output Format 2)
              ========================================== */}
              {activeMode === 'monthly' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-xs font-extrabold text-purple-600">MONTHLY MASTER DICTIONARY</span>
                    <h2 className="text-2xl font-extrabold mt-1">
                      🏆 월간 마스터 패턴 치트시트 & 40개 필수 어휘 총람
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {THEMES.map((t) => (
                      <div
                        key={t.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{t.title}</span>
                          <button
                            onClick={() => speakText(t.pattern.en)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold"
                          >
                            🔊 패턴
                          </button>
                        </div>
                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {t.pattern.en}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {t.vocab.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => speakText(v.word)}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:border-blue-500"
                            >
                              {v.word} <span className="text-[10px] text-slate-400">({v.meaning})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==========================================
                  MODE 5: 무한 훈련 & 아이패드 애플펜슬 드로잉 캔버스
              ========================================== */}
              {activeMode === 'infinite' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        ✍️ 아이패드 애플 펜슬 프리핸드 필기장 & 무한 영작 훈련
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        아이패드에서 애플 펜슬이나 손가락으로 직접 영어 문장과 단어를 써보며 근육 기억으로 체화하세요.
                      </p>
                    </div>
                    <button
                      onClick={clearCanvas}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-500"
                    >
                      🗑️ 필기장 지우기
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-blue-400 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <canvas
                      ref={canvasRef}
                      width={860}
                      height={340}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={endDrawing}
                      onPointerLeave={endDrawing}
                      className="w-full h-[340px] touch-none cursor-crosshair"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
