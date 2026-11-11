// ============================================================================
// [1/4 파트] 전 레벨(초·중·고급) 타입 정의 + 16개(7성분×9품사) 사전 + 9대 매체(패션 포함) 90선
// ============================================================================
import { useState, useRef, useEffect } from 'react';

export type CompId = 'S' | 'V' | 'IO' | 'DO' | 'SC' | 'OC' | 'M';
export type PosId = 'N' | 'Pron' | 'V' | 'Adj' | 'Adv' | 'Prep' | 'Conj' | 'Interj' | 'Det';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type MediaPlatformId =
  | 'NAVER_DATALAB'
  | 'NAVER_SHORTENTS'
  | 'GOOGLE_TRENDS'
  | 'SIGNAL_BZ'
  | 'NATE_ISSUE'
  | 'INSTA_THREADS'
  | 'YOUTUBE_SHORTS'
  | 'TIKTOK_TRENDS'
  | 'FASHION_MAGS';

// 초급·중급·고급 레벨별 맞춤 코스 데이터 구조
export interface LevelSpecificTrack {
  levelName: string;
  targetSpeed: number;
  focusBadge: string;
  patternEn: string;
  patternIpa: string;
  patternPron: string;
  patternSoundBlock: string;
  patternMeaningKo: string;
  levelGuide: string;
  paraphraseDrill: {
    basicExpr: string;
    upgradedExpr: string;
    nuanceDiff: string;
  }[];
  longTalkPrompt: string;
}

export interface VocabItem {
  id: number;
  type: '일상 회화' | '고급/실무';
  recommendLevel: LearningLevel; // 초급·중급·고급 추천 배지
  word: string;
  masked: string;
  ipa: string;
  pron: string;
  soundMethod: string;
  soundBlock: string;
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
  paraphraseTip: string; // 중급 바꿔 말하기 & 고급 뉘앙스 팁
}

export interface SynonymScale {
  baseWord: string;
  pos: string;
  meaning: string;
  levels: {
    strength: '매우 강함 (Extreme)' | '강함 (Strong)' | '보통 (Neutral)' | '약함/완곡 (Mild)';
    words: { word: string; ipa: string; nuance: string }[];
  }[];
}

export interface TrainingSentence {
  id: number;
  levelTag: LearningLevel; // 초급 / 중급 / 고급 문장 구분
  tag: string;
  targetWord: string;
  wordOrderFormula: string;
  structure: string;
  soundBlockEn: string;
  soundMethodGuide: string;
  ipaLine: string;
  koLine: string;
  enLine: string;
  rawEn: string;
  pronLine: string;
  naturalKo: string;
  paraphraseVersion: string; // 중급 바꿔 말하기 버전
  grammarPoint: string;
  contextNuance: string;
}

export interface WordToken {
  word: string;
  comp: CompId | '독립어';
  compLabel: string;
  pos: PosId;
  posLabel: string;
  colorClass: string;
}

export interface DiagramSentence {
  id: string;
  label: string;
  tokens: WordToken[];
  translation: string;
  skeleton: string;
  patternType: string;
  wordOrderTip: string;
}

export interface ThemeData {
  id: string;
  title: string;
  badge: string;
  dateLabel: string;
  opicLevel: string;
  coachPoint: string;
  wordOrderPrinciple: string;
  grammarSummary: string;
  situationGuide: string;
  levelTracks: Record<LearningLevel, LevelSpecificTrack>; // 같은 주제의 초·중·고급 3단계 트랙
  pattern: {
    en: string;
    ipa: string;
    soundBlock: string;
    soundMethod: string;
    pron: string;
    nuance: string;
    opicApplication: string;
  };
  vocab: VocabItem[];
  synonymScale: SynonymScale;
  sentences: TrainingSentence[];
  quiz: {
    beginner: {
      word: string;
      ipa: string;
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
      wordOrderHint: string;
      hint: string;
      modelAnswer: string;
      checkPoint: string;
    };
  };
}

export interface WordbookEntry {
  day: number;
  level: '중등 필수' | '고등·수능 핵심' | '비즈니스·실무' | '오픽(OPIc)·구동사';
  word: string;
  ipa: string;
  pron: string;
  soundBlock: string;
  soundMethod: string;
  meaning: string;
  pos: PosId;
  posLabel: string;
  comp: CompId;
  compLabel: string;
  collocation: string;
  collocationKo: string;
  exampleEn: string;
  exampleKo: string;
}

export interface ChatTurn {
  role: 'coach' | 'user';
  text: string;
  correction?: string;
  nuanceTip?: string;
}

// ============================================================================
// 2. [절대 핵심 · 누락 금지] 16개 전체 매핑: 7개 문장 성분(직책) × 9품사(신분) 사전
// ============================================================================
export const SENTENCE_COMPONENTS: {
  id: CompId;
  name: string;
  sub: string;
  colorBadge: string;
  meaning: string;
  wordOrderRule: string;
}[] = [
  {
    id: 'S',
    name: '주어',
    sub: 'S (Subject)',
    colorBadge: 'bg-blue-100 text-blue-700 border-blue-300',
    meaning: '문장의 주인공(누가/무엇이) 역할을 하는 자리입니다. 명사·대명사 계열만 앉을 수 있습니다.',
    wordOrderRule: '평서문 맨 앞(동사 앞 1번 자리)에 위치하여 문장의 출발점이 됩니다.',
  },
  {
    id: 'V',
    name: '동사',
    sub: 'V (Verb)',
    colorBadge: 'bg-rose-100 text-rose-700 border-rose-300',
    meaning: '주어의 동작(~하다)이나 상태(~이다)를 결정짓는 문장의 심장(서술어) 자리입니다.',
    wordOrderRule: '영어 어순의 핵심! 주어(S) 바로 뒤 2번 자리에 오며, 뒤따라올 목적어/보어 구조를 결정합니다.',
  },
  {
    id: 'IO',
    name: '간접목적어',
    sub: 'IO (O)',
    colorBadge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    meaning: '4형식 수여동사(give, send, tell, show 등) 뒤에서 동작을 받는 대상(~에게)을 뜻합니다.',
    wordOrderRule: '타동사(V) 바로 뒤, 직접목적어(DO) 바로 앞자리에 위치합니다. (V + 누구에게[IO] + 무엇을[DO])',
  },
  {
    id: 'DO',
    name: '직접목적어',
    sub: 'DO (O)',
    colorBadge: 'bg-teal-100 text-teal-700 border-teal-300',
    meaning: '주어의 동작이 직접 닿는 대상(~을/를)을 뜻합니다. 명사·대명사·동명사·투부정사가 옵니다.',
    wordOrderRule: '3형식에서는 동사(V) 바로 뒤, 4형식에서는 간접목적어(IO) 바로 뒤에 위치합니다.',
  },
  {
    id: 'SC',
    name: '주격보어',
    sub: 'SC (C)',
    colorBadge: 'bg-purple-100 text-purple-700 border-purple-300',
    meaning: '2형식 동사(be, become, look, seem 등) 뒤에서 주어(S)가 어떤 상태/신분인지 보충 설명합니다.',
    wordOrderRule: '연결동사(V) 바로 뒤에 오며, 명사(동격) 또는 형용사(상태 설명)만 올 수 있습니다(부사 불가!).',
  },
  {
    id: 'OC',
    name: '목적격보어',
    sub: 'OC (C)',
    colorBadge: 'bg-violet-100 text-violet-700 border-violet-300',
    meaning: '5형식 동사(make, keep, find, help 등) 뒤에서 목적어(DO)의 상태나 행동을 보충 설명합니다.',
    wordOrderRule: '목적어(DO) 바로 뒤에 위치하여 [목적어가 ~한 상태 / ~하는 행동]이라는 주술 관계를 만듭니다.',
  },
  {
    id: 'M',
    name: '수식어',
    sub: 'M (Modifier)',
    colorBadge: 'bg-amber-100 text-amber-700 border-amber-300',
    meaning: '문장의 5대 뼈대(S·V·O·C)는 아니지만 시간·장소·이유·방법·명사 특징을 풍성하게 꾸며줍니다.',
    wordOrderRule: '짧은 형용사·부사는 꾸미는 말 앞, 긴 전치사구·부사절은 주로 문장 맨 뒤(소리블럭 끝)에 붙습니다.',
  },
];

export const PARTS_OF_SPEECH: {
  id: PosId;
  name: string;
  sub: string;
  meaning: string;
  canBeComponents: string;
}[] = [
  {
    id: 'N',
    name: '명사',
    sub: 'N (Noun)',
    meaning: '사람, 사물, 장소, 추상적 개념의 이름을 나타내는 단어입니다. (예: schedule, silhouette, itinerary)',
    canBeComponents: '주어(S), 간접목적어(IO), 직접목적어(DO), 주격보어(SC), 목적격보어(OC)',
  },
  {
    id: 'Pron',
    name: '대명사',
    sub: 'Pron (Pronoun)',
    meaning: '명사를 대신하여 부르는 단어입니다. (예: I, you, we, they, it, this)',
    canBeComponents: '주어(S), 간접목적어(IO), 직접목적어(DO), 주격보어(SC)',
  },
  {
    id: 'V',
    name: '동사',
    sub: 'V (Verb)',
    meaning: '움직임(동작)이나 상태(~이다/있다)를 나타내는 단어입니다. (예: wrap up, streamline, pull off)',
    canBeComponents: '오직 동사(V) 직책만 전담! (단, to부정사/동명사/분사로 변신하면 다른 직책 가능)',
  },
  {
    id: 'Adj',
    name: '형용사',
    sub: 'Adj (Adjective)',
    meaning: '명사의 성질, 모양, 상태를 꾸며주거나 보충 설명하는 단어입니다. (예: feasible, chic, tailored)',
    canBeComponents: '주격보어(SC), 목적격보어(OC), 명사를 꾸미는 수식어(M)',
  },
  {
    id: 'Adv',
    name: '부사',
    sub: 'Adv (Adverb)',
    meaning: '동사, 형용사, 다른 부사 또는 문장 전체를 세밀하게 꾸며주는 단어입니다. (예: meticulously, effortlessly)',
    canBeComponents: '오직 수식어(M) 역할만 수행 (문장 5대 뼈대 자리에는 절대 못 들어감)',
  },
  {
    id: 'Prep',
    name: '전치사',
    sub: 'Prep (Preposition)',
    meaning: '명사 앞에 놓여 시간·장소·방향·목적의 관계를 연결해 주는 단어입니다. (예: in, on, before, with)',
    canBeComponents: '뒤에 명사(O)와 결합해 전치사구로서 수식어(M) 또는 보어(SC) 역할 수행',
  },
  {
    id: 'Conj',
    name: '접속사*',
    sub: 'Conj (Conjunction)',
    meaning: '단어와 단어, 구와 구, 문장(절)과 문장을 이어주는 연결 다리입니다. (예: and, if, because, whenever)',
    canBeComponents: '문장들을 연결하거나 부사절/명사절을 이끌어 수식어(M)·목적어(O) 블록 형성',
  },
  {
    id: 'Interj',
    name: '감탄사*',
    sub: 'Interj (Interjection)',
    meaning: '놀람, 기쁨, 부름, 추임새 등 말하는 이의 감정을 즉각 표현하는 단어입니다. (예: Oh, Well, Wow)',
    canBeComponents: '문장 구조에서 독립된 독립어 / 수식 요소(M)',
  },
  {
    id: 'Det',
    name: '한정사',
    sub: 'Det (Determiner)',
    meaning: '명사 맨 앞에서 그 명사의 범위, 소유, 수량, 특정 여부를 딱 정해주는 단어입니다. (예: the, a, our, my)',
    canBeComponents: '명사 앞에서 명사를 한정하는 수식어(M)',
  },
];

export const MAPPING_EDGES: { comp: CompId; pos: PosId }[] = [
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

export const DIAGRAM_EXAMPLES: DiagramSentence[] = [
  {
    id: 'ex1',
    label: '예문 1 (3형식+수식어)',
    tokens: [
      { word: 'Oh,', comp: '독립어', compLabel: '독립어', pos: 'Interj', posLabel: '감탄사(Interj)', colorClass: 'border-slate-300 text-slate-600' },
      { word: 'our', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'new', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'team', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-blue-400 text-blue-700' },
      { word: 'carefully', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'checked', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)', colorClass: 'border-rose-400 text-rose-700' },
      { word: 'the', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'schedule', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-teal-400 text-teal-700' },
      { word: 'in the morning.', comp: 'M', compLabel: '수식어 (M)', pos: 'Prep', posLabel: '전치사구(Prep+N)', colorClass: 'border-amber-300 text-amber-700' },
    ],
    translation: '“아, 우리 신규 팀이 오전에 일정을 꼼꼼히 확인했습니다.”',
    skeleton: 'team[S] + checked[V] + schedule[DO]',
    patternType: '3형식 (S + V + DO) + 다중 수식어(M)',
    wordOrderTip: '영어는 [누가(S) + 한다(V) + 무엇을(DO)] 뼈대를 먼저 던지고, 언제/어디서(in the morning)는 맨 뒤에 붙입니다.',
  },
  {
    id: 'ex2',
    label: '예문 2 (4형식 수여문)',
    tokens: [
      { word: 'The', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'director', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-blue-400 text-blue-700' },
      { word: 'kindly', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'gave', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)', colorClass: 'border-rose-400 text-rose-700' },
      { word: 'us', comp: 'IO', compLabel: '간접목적어 (IO)', pos: 'Pron', posLabel: '대명사(Pron)', colorClass: 'border-emerald-400 text-emerald-700' },
      { word: 'a', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'quick', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'heads-up', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-teal-400 text-teal-700' },
      { word: 'before the meeting.', comp: 'M', compLabel: '수식어 (M)', pos: 'Prep', posLabel: '전치사구(Prep+N)', colorClass: 'border-amber-300 text-amber-700' },
    ],
    translation: '“디렉터님이 회의 전에 우리에게 빠른 사전 귀띔을 친절히 주셨습니다.”',
    skeleton: 'director[S] + gave[V] + us[IO] + heads-up[DO]',
    patternType: '4형식 (S + V + IO + DO) 수여동사 문형',
    wordOrderTip: '주는 동사(give, send, tell) 뒤에는 [사람(IO: ~에게) + 사물(DO: ~을)] 순서로 나란히 놓는 것이 핵심 어순입니다.',
  },
  {
    id: 'ex3',
    label: '예문 3 (5형식 보어문)',
    tokens: [
      { word: 'This', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'tailored', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'jacket', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-blue-400 text-blue-700' },
      { word: 'makes', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)', colorClass: 'border-rose-400 text-rose-700' },
      { word: 'your', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'daily', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'outfit', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-teal-400 text-teal-700' },
      { word: 'effortlessly', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'chic.', comp: 'OC', compLabel: '목적격보어 (OC)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-violet-400 text-violet-700' },
    ],
    translation: '“이 테일러드 재킷은 당신의 데일리 코디를 물 흐르듯 시크하게 만들어 줍니다.”',
    skeleton: 'jacket[S] + makes[V] + outfit[DO] + chic[OC]',
    patternType: '5형식 (S + V + DO + OC) 목적격보어 문형',
    wordOrderTip: '목적어(outfit)의 상태를 설명하는 목적격보어(OC) 자리에는 부사가 아닌 형용사(chic, feasible)를 씁니다!',
  },
];

// ============================================================================
// 3. [선제시형 트렌드 허브] 9대 빅미디어 실시간 최다 검색어 (각 10개 = 총 90개)
//    - 9번째 탭: 👗 글로벌 패션 5대 매거진 (Vogue Runway · WWD · ELLE · Bazaar · GQ) 탑재
// ============================================================================
export interface MediaTrendItem {
  rank: number;
  koTitle: string;
  enExpression: string;
  targetThemeId: string;
  extUrl: string;
  sourceTag?: string;
}

export interface MediaTrendPlatform {
  id: MediaPlatformId;
  name: string;
  shortName: string;
  badgeColor: string;
  liveUrl: string;
  rssTopicQuery: string; // 실시간 새로고침 Fetch용 쿼리
  desc: string;
  keywords: MediaTrendItem[];
}

export const INITIAL_MEDIA_PLATFORMS: MediaTrendPlatform[] = [
  {
    id: 'FASHION_MAGS',
    name: '👗 글로벌 패션 5대 매거진',
    shortName: '패션5대매체',
    badgeColor: 'bg-fuchsia-600 text-white',
    liveUrl: 'https://www.vogue.com/fashion/runway',
    rssTopicQuery: 'Vogue Runway WWD GQ Style Fashion Week',
    desc: 'Vogue Runway · WWD · ELLE · Harper’s Bazaar · GQ Style TOP 10',
    keywords: [
      { rank: 1, sourceTag: 'Vogue Runway', koTitle: '[Vogue] 패션위크 디자이너 컬렉션 & 대담한 실루엣', enExpression: 'make a bold fashion statement', targetThemeId: 'fashion-runway', extUrl: 'https://www.vogue.com/fashion/runway' },
      { rank: 2, sourceTag: 'Vogue Runway', koTitle: '[Vogue] 클래식 헤리티지와 모던 미학의 결합', enExpression: 'blend heritage with modern aesthetics', targetThemeId: 'fashion-runway', extUrl: 'https://www.vogue.com/fashion/runway' },
      { rank: 3, sourceTag: 'WWD', koTitle: '[WWD] 글로벌 럭셔리 브랜드 시장 동향 & 실적', enExpression: 'spearhead the global luxury market', targetThemeId: 'fashion-runway', extUrl: 'https://wwd.com/fashion-news/' },
      { rank: 4, sourceTag: 'WWD', koTitle: '[WWD] 친환경 지속 가능 소재 & 리테일 혁신', enExpression: 'sustainable fabric and retail trend', targetThemeId: 'fashion-runway', extUrl: 'https://wwd.com/business-news/' },
      { rank: 5, sourceTag: 'ELLE Runway', koTitle: '[ELLE] 런웨이에서 건진 리얼웨이 데일리룩 팁', enExpression: 'pull off an effortlessly chic look', targetThemeId: 'fashion-runway', extUrl: 'https://www.elle.com/fashion/trend-reports/' },
      { rank: 6, sourceTag: 'ELLE Runway', koTitle: '[ELLE] 환절기 레이어링 & 컬러 매칭 공식', enExpression: 'layer different textures seamlessly', targetThemeId: 'fashion-runway', extUrl: 'https://www.elle.com/fashion/' },
      { rank: 7, sourceTag: 'Harper’s Bazaar', koTitle: '[Bazaar] 시즌 핵심 포인트 액세서리 & 백 트렌드', enExpression: 'elevate the outfit with a statement piece', targetThemeId: 'fashion-runway', extUrl: 'https://www.harpersbazaar.com/fashion/trends/' },
      { rank: 8, sourceTag: 'Harper’s Bazaar', koTitle: '[Bazaar] 우아하고 세련된 미니멀 스타일링', enExpression: 'complement your silhouette gracefully', targetThemeId: 'fashion-runway', extUrl: 'https://www.harpersbazaar.com/fashion/' },
      { rank: 9, sourceTag: 'GQ Style', koTitle: '[GQ] 남성 테일러드 수트 핏 & 스마트 캐주얼 정석', enExpression: 'a sharp tailored fit for men', targetThemeId: 'fashion-runway', extUrl: 'https://www.gq.com/style' },
      { rank: 10, sourceTag: 'GQ Style', koTitle: '[GQ] 유행을 타지 않는 옷장 속 필수 기본템 10선', enExpression: 'a timeless wardrobe staple', targetThemeId: 'fashion-runway', extUrl: 'https://www.gq.com/style' },
    ],
  },
  {
    id: 'NAVER_DATALAB',
    name: '💚 네이버 데이터랩',
    shortName: 'N데이터랩',
    badgeColor: 'bg-emerald-600 text-white',
    liveUrl: 'https://datalab.naver.com/',
    rssTopicQuery: 'Korea Business Tech Trend',
    desc: '분야별(쇼핑·경제·패션·IT·생활) 급상승 검색어 TOP 10',
    keywords: [
      { rank: 1, koTitle: '아이패드 M5 11인치 스마트 워크플로우', enExpression: 'streamline the entire workflow', targetThemeId: 'biz-meeting', extUrl: 'https://datalab.naver.com/' },
      { rank: 2, koTitle: '시즌 남성/여성 테일러드 자켓 & 데일리룩', enExpression: 'pull off a tailored look', targetThemeId: 'fashion-runway', extUrl: 'https://datalab.naver.com/' },
      { rank: 3, koTitle: '해외여행 공항 라운지 무료 이용권', enExpression: 'complimentary lounge access', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=complimentary' },
      { rank: 4, koTitle: '오픽(OPIc) 초급 탈출 & AL 달성 템플릿', enExpression: 'from my perspective', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=perspective' },
      { rank: 5, koTitle: '연말 비즈니스 성과 보고 & 일정 조율', enExpression: 'touch base with the team', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=touch%20base' },
      { rank: 6, koTitle: 'SNS 바이럴 릴스 & 숏폼 챌린지', enExpression: 'go viral overnight', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=go%20viral' },
      { rank: 7, koTitle: '글로벌 금리 인하 & 잠정 예산안', enExpression: 'set a tentative schedule', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=tentative' },
      { rank: 8, koTitle: '주말 브런치 카페 & 힐링 루틴', enExpression: 'unwind on the weekend', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=unwind' },
      { rank: 9, koTitle: '부티크 호텔 얼리 체크인 & 수하물 보관', enExpression: 'drop off the luggage early', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=drop%20off' },
      { rank: 10, koTitle: 'AI 생산성 앱 & 결재 절차 간소화', enExpression: 'expedite the approval process', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=expedite' },
    ],
  },
  {
    id: 'NAVER_SHORTENTS',
    name: '⚡ 네이버 숏텐츠',
    shortName: 'N숏텐츠',
    badgeColor: 'bg-green-600 text-white',
    liveUrl: 'https://m.naver.com/',
    rssTopicQuery: 'Korea Daily News Lifestyle',
    desc: '지금 가장 많이 본 짧은 뉴스·패션·라이프 핵심 이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '직장인 점심시간 10분 영어 공부 루틴', enExpression: 'grab a quick bite and study', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=grab%20a%20bite' },
      { rank: 2, koTitle: '셀럽 공항 패션 & 포인트 액세서리 매칭', enExpression: 'elevate the look with accessories', targetThemeId: 'fashion-runway', extUrl: 'https://en.dict.naver.com/#/search?query=elevate' },
      { rank: 3, koTitle: '해외 명소 숨은 로컬 맛집 투어', enExpression: 'off the beaten track', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=off%20the%20beaten%20track' },
      { rank: 4, koTitle: '번아웃 극복하는 저녁 산책 습관', enExpression: 'clear my head after work', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=clear%20my%20head' },
      { rank: 5, koTitle: '넷플릭스 글로벌 TOP 1 드라마 정주행', enExpression: 'binge-watch the whole season', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=binge%20watch' },
      { rank: 6, koTitle: '메이저리그 & 유럽축구 빅매치 하이라이트', enExpression: 'keep an eye on the live score', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=keep%20an%20eye%20on' },
      { rank: 7, koTitle: '긴급 일정 변경 & 사전 귀띔 매너', enExpression: 'give you a quick heads-up', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=heads-up' },
      { rank: 8, koTitle: '호텔 좌석·객실 특별 요청 배려받기', enExpression: 'accommodate a special request', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=accommodate' },
      { rank: 9, koTitle: '품격 있는 대안 제시 & 실현 가능성 검토', enExpression: 'find a feasible solution', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=feasible' },
      { rank: 10, koTitle: '리조트 인피니티 풀 & 편의시설 안내', enExpression: 'luxury hotel amenities', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=amenities' },
    ],
  },
  {
    id: 'GOOGLE_TRENDS',
    name: '🌐 구글 트렌드 & 뉴스',
    shortName: '구글트렌드',
    badgeColor: 'bg-blue-600 text-white',
    liveUrl: 'https://trends.google.co.kr/trending?geo=KR',
    rssTopicQuery: 'World Technology Business Headline',
    desc: '한국 및 글로벌 실시간 급상승 검색어 & 월드 헤드라인 TOP 10',
    keywords: [
      { rank: 1, koTitle: 'Next-Gen AI Agent & Smart Work', enExpression: 'meticulously analyze the data', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 2, koTitle: 'Paris & Milan Fashion Week Runway', enExpression: 'avant-garde runway silhouette', targetThemeId: 'fashion-runway', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 3, koTitle: 'Global Remote Work & Travel Itinerary', enExpression: 'updated travel itinerary', targetThemeId: 'travel-concierge', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 4, koTitle: 'OPIc Speaking High-Score Strategy', enExpression: 'what I love most about this', targetThemeId: 'opic-master', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 5, koTitle: 'Short-Form Video Algorithm Trend', enExpression: 'live up to the hype', targetThemeId: 'media-viral', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 6, koTitle: 'Executive Meeting & Negotiation', enExpression: 'wrap up the discussion', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 7, koTitle: 'Luxury Resort Concierge Service', enExpression: 'vacant ocean-view suite', targetThemeId: 'travel-concierge', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 8, koTitle: 'Menswear Tailoring & GQ Trend', enExpression: 'timeless wardrobe staple', targetThemeId: 'fashion-runway', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 9, koTitle: 'Cross-Team Collaboration & Synergy', enExpression: 'get on the same page', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 10, koTitle: 'Work-Life Balance & Evening Routine', enExpression: 'recharge my batteries', targetThemeId: 'opic-master', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
    ],
  },
  {
    id: 'SIGNAL_BZ',
    name: '📡 시그널 실시간 검색어',
    shortName: '시그널실검',
    badgeColor: 'bg-indigo-600 text-white',
    liveUrl: 'https://signal.bz/',
    rssTopicQuery: 'Korea Breaking News Top 10',
    desc: '국내 포털 통합 실시간 검색어 차트 TOP 10',
    keywords: [
      { rank: 1, koTitle: '실시간 주요 경제 브리핑 & 시장 전망', enExpression: 'keep track of market trends', targetThemeId: 'biz-meeting', extUrl: 'https://signal.bz/' },
      { rank: 2, koTitle: '인천공항 스마트패스 & 온라인 체크인', enExpression: 'check in online in advance', targetThemeId: 'travel-concierge', extUrl: 'https://signal.bz/' },
      { rank: 3, koTitle: '올가을 유행하는 클래식 트렌치코트 코디', enExpression: 'dress up for the occasion', targetThemeId: 'fashion-runway', extUrl: 'https://signal.bz/' },
      { rank: 4, koTitle: '화제의 유튜브 100만 조회수 인터뷰', enExpression: 'deeply resonate with viewers', targetThemeId: 'media-viral', extUrl: 'https://signal.bz/' },
      { rank: 5, koTitle: '프로젝트 마감 기한 조율 & 정중한 요청', enExpression: 'I was wondering if you could', targetThemeId: 'biz-meeting', extUrl: 'https://signal.bz/' },
      { rank: 6, koTitle: '주말 날씨 & 근교 힐링 산책 코스', enExpression: 'my go-to place for a walk', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
      { rank: 7, koTitle: '호텔 레이트 체크아웃 & 조식 혜택', enExpression: 'complimentary breakfast buffet', targetThemeId: 'travel-concierge', extUrl: 'https://signal.bz/' },
      { rank: 8, koTitle: '정곡을 찌르는 속 시원한 평론 화제', enExpression: 'hit the nail on the head', targetThemeId: 'media-viral', extUrl: 'https://signal.bz/' },
      { rank: 9, koTitle: '효율적인 시간 관리 & 생산성 향상', enExpression: 'make my day productive', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
      { rank: 10, koTitle: '꾸준한 자기관리 & 영어 습관 만들기', enExpression: 'stick to my daily routine', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
    ],
  },
  {
    id: 'NATE_ISSUE',
    name: '🔥 네이트 실시간 이슈',
    shortName: '네이트이슈',
    badgeColor: 'bg-rose-600 text-white',
    liveUrl: 'https://news.nate.com/rank/interest',
    rssTopicQuery: 'Trending Social Issue Korea',
    desc: '네이트 판 & 뉴스 실시간 대중 공감 이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '직장 내 센스 있는 대화법 & 일정 조율', enExpression: 'touch base before the meeting', targetThemeId: 'biz-meeting', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 2, koTitle: '결혼식 하객룩 & 센스 있는 드레스코드', enExpression: 'flatter your body shape', targetThemeId: 'fashion-runway', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 3, koTitle: '나만의 스트레스 해소법 & 최애 힐링 푸드', enExpression: 'my go-to comfort food', targetThemeId: 'opic-master', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 4, koTitle: '해외여행 중 호텔 방 변경 정중히 요청하기', enExpression: 'would it be possible to get', targetThemeId: 'travel-concierge', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 5, koTitle: 'SNS 핫플 카페 웨이팅 & 솔직 방문 후기', enExpression: 'really lived up to the hype', targetThemeId: 'media-viral', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 6, koTitle: '회의 시간 단축하는 핵심 결론 도출법', enExpression: 'streamline our weekly meeting', targetThemeId: 'biz-meeting', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 7, koTitle: '집에서 즐기는 홈카페 & 재충전 시간', enExpression: 'unwind and recharge my batteries', targetThemeId: 'opic-master', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 8, koTitle: '기내 반입 캐리어 규정 & 환승 대기 꿀팁', enExpression: 'carry-on luggage and layover', targetThemeId: 'travel-concierge', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 9, koTitle: '요즘 유행하는 숏폼 드라마 몰아보기', enExpression: 'binge-watch the captivating series', targetThemeId: 'media-viral', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 10, koTitle: '백화점 명품관 & 컨템포러리 브랜드 트렌드', enExpression: 'spearhead the seasonal trend', targetThemeId: 'fashion-runway', extUrl: 'https://news.nate.com/rank/interest' },
    ],
  },
  {
    id: 'INSTA_THREADS',
    name: '📸 인스타 & 스레드',
    shortName: '인스타·스레드',
    badgeColor: 'bg-pink-600 text-white',
    liveUrl: 'https://www.threads.net/',
    rssTopicQuery: 'Instagram OOTD Viral Fashion Lifestyle',
    desc: '인기 해시태그, #OOTD 릴스 바이럴, 스레드 핫이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '#OOTD 꾸안꾸 시크 데일리룩 영어 캡션', enExpression: 'effortlessly chic daily outfit', targetThemeId: 'fashion-runway', extUrl: 'https://www.instagram.com/' },
      { rank: 2, koTitle: '스레드에서 난리 난 원어민 리얼 공감 표현', enExpression: 'this deeply resonated with me', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
      { rank: 3, koTitle: '릴스 100만 뷰 자기관리 & 아이패드 공부', enExpression: 'stick to a productive routine', targetThemeId: 'opic-master', extUrl: 'https://www.instagram.com/' },
      { rank: 4, koTitle: '감성 부티크 호텔 & 인피니티 풀 인생샷', enExpression: 'freshen up and enjoy the amenities', targetThemeId: 'travel-concierge', extUrl: 'https://www.instagram.com/' },
      { rank: 5, koTitle: '일잘러의 스마트 데스크 & 업무 효율화', enExpression: 'streamline my daily tasks', targetThemeId: 'biz-meeting', extUrl: 'https://www.threads.net/' },
      { rank: 6, koTitle: '패션 피플들의 포인트 아이템 매칭 비법', enExpression: 'a bold statement piece', targetThemeId: 'fashion-runway', extUrl: 'https://www.instagram.com/' },
      { rank: 7, koTitle: '원어민들이 댓글에 제일 많이 쓰는 극찬', enExpression: 'a truly phenomenal performance', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
      { rank: 8, koTitle: '해외 로컬 빈티지 샵 & 편집샵 투어', enExpression: 'try on a vintage jacket', targetThemeId: 'fashion-runway', extUrl: 'https://www.instagram.com/' },
      { rank: 9, koTitle: '퇴근 후 복잡한 머리를 식히는 밤 산책', enExpression: 'clear my head in the evening', targetThemeId: 'opic-master', extUrl: 'https://www.threads.net/' },
      { rank: 10, koTitle: '유익하고 영감을 주는 스레드 정보 타래', enExpression: 'both captivating and informative', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
    ],
  },
  {
    id: 'YOUTUBE_SHORTS',
    name: '▶️ 유튜브 & 숏츠',
    shortName: '유튜브·숏츠',
    badgeColor: 'bg-red-600 text-white',
    liveUrl: 'https://www.youtube.com/feed/trending',
    rssTopicQuery: 'YouTube Trending Shorts English',
    desc: '인기 급상승 동영상 및 숏츠(Shorts) 최다 조회 키워드 TOP 10',
    keywords: [
      { rank: 1, koTitle: '초보자도 1분 만에 들리는 원어민 연음 법칙', enExpression: 'speak in natural sound blocks', targetThemeId: 'opic-master', extUrl: 'https://www.youtube.com/results?search_query=english+linking+sounds+shorts' },
      { rank: 2, koTitle: 'GQ & Vogue 에디터가 꼽은 올해의 스타일', enExpression: 'pull off a sharp tailored look', targetThemeId: 'fashion-runway', extUrl: 'https://www.youtube.com/results?search_query=vogue+gq+fashion+essentials' },
      { rank: 3, koTitle: '실리콘밸리 리더들의 정중하고 간결한 회의 영어', enExpression: 'I was wondering if we could', targetThemeId: 'biz-meeting', extUrl: 'https://www.youtube.com/results?search_query=business+english+meeting+shorts' },
      { rank: 4, koTitle: '뉴욕·런던 호텔 체크인 & 컨시어지 실전 브이로그', enExpression: 'drop off our bags before check-in', targetThemeId: 'travel-concierge', extUrl: 'https://www.youtube.com/results?search_query=hotel+check+in+english' },
      { rank: 5, koTitle: '유튜브 댓글창 지배하는 원어민 극찬 표현', enExpression: 'it definitely lived up to the hype', targetThemeId: 'media-viral', extUrl: 'https://www.youtube.com/results?search_query=english+slang+shorts' },
      { rank: 6, koTitle: '오픽 초급에서 AL까지 단숨에 올리는 만능 문장', enExpression: 'broaden my perspective on life', targetThemeId: 'opic-master', extUrl: 'https://www.youtube.com/results?search_query=opic+al+tips' },
      { rank: 7, koTitle: '글로벌 패션위크 백스테이지 인터뷰 영어', enExpression: 'aesthetic and runway silhouette', targetThemeId: 'fashion-runway', extUrl: 'https://www.youtube.com/results?search_query=vogue+runway+interview' },
      { rank: 8, koTitle: '해외 공항 환승 & 라운지 이용 실전 회화', enExpression: 'during a three-hour layover', targetThemeId: 'travel-concierge', extUrl: 'https://www.youtube.com/results?search_query=airport+english+conversation' },
      { rank: 9, koTitle: '업무 마감 기한 앞당기는 세련된 협상 기술', enExpression: 'expedite the review process', targetThemeId: 'biz-meeting', extUrl: 'https://www.youtube.com/results?search_query=business+english+negotiation' },
      { rank: 10, koTitle: '하룻밤 사이에 1,000만 뷰 터진 바이럴 영상', enExpression: 'went viral overnight', targetThemeId: 'media-viral', extUrl: 'https://www.youtube.com/feed/trending' },
    ],
  },
  {
    id: 'TIKTOK_TRENDS',
    name: '🎵 틱톡 트렌드',
    shortName: '틱톡트렌드',
    badgeColor: 'bg-slate-900 text-white',
    liveUrl: 'https://www.tiktok.com/explore',
    rssTopicQuery: 'TikTok Viral Trend Challenge',
    desc: '글로벌 바이럴 챌린지, 겟레디윗미(GRWM), 숏폼 네이티브 표현 TOP 10',
    keywords: [
      { rank: 1, koTitle: '#GRWM (겟레디윗미) 오늘의 착장 & 스타일링 소개', enExpression: 'this jacket goes well with jeans', targetThemeId: 'fashion-runway', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 2, koTitle: '원어민들이 매일 쓰는 리얼 맞장구 & 공감', enExpression: 'you hit the nail on the head', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 3, koTitle: '초보자용 0.75배속 천천히 또렷하게 말하기 챌린지', enExpression: 'practice speaking step by step', targetThemeId: 'opic-master', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 4, koTitle: '해외 호텔 무료 룸 업그레이드 성공 치트키', enExpression: 'any vacant ocean-view rooms', targetThemeId: 'travel-concierge', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 5, koTitle: '글로벌 직장인 공감 오피스 퇴근 전 마무리 회화', enExpression: 'wrap up and head home', targetThemeId: 'biz-meeting', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 6, koTitle: '남성 그루밍 & 수트 핏 변신 비포 애프터', enExpression: 'a timeless and tailored look', targetThemeId: 'fashion-runway', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 7, koTitle: '주말 집순이·집돌이 드라마 정주행 브이로그', enExpression: 'binge-watch all weekend', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 8, koTitle: '팀원들과 한마음으로 호흡 맞추기', enExpression: 'make sure we are on the same page', targetThemeId: 'biz-meeting', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 9, koTitle: '즉흥으로 떠나는 주말 힐링 여행', enExpression: 'take a trip spontaneously', targetThemeId: 'opic-master', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 10, koTitle: '소문난 맛집 솔직 리뷰 (명불허전!)', enExpression: 'lived up to the hype effortlessly', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
    ],
  },
];
// ============================================================================
// [2/4 파트] 네이버 퀴즈 + 중·고등·실무·오픽 단어장 + 3단계 레벨별 테마 DB (전반부)
// ============================================================================

export const NAVER_OFFICIAL_WORD_CHALLENGE = [
  {
    word: 'news',
    masked: 'n ⬛ ⬛ s',
    ipa: '/nuːz/',
    pos: 'noun (명사 · N)',
    comp: 'DO' as CompId,
    pron: '[누-즈]',
    soundBlock: 'any news / to report',
    soundMethod: '끝소리 s는 무성음 [스]가 아니라 성대가 울리는 유성음 [즈/z/]로 길게 빼줍니다.',
    koMeaning: '소식, 뉴스, 새로운 정보',
    enDef: '1. noun new information or a report about something that has happened recently',
    example: 'Do you have any ______ to report?',
    exampleFull: 'Do you have any news to report?',
  },
  {
    word: 'big',
    masked: 'b ⬛ g',
    ipa: '/bɪɡ/',
    pos: 'adverb (부사 · Adv)',
    comp: 'M' as CompId,
    pron: '[빅]',
    soundBlock: 'won big / at the casino',
    soundMethod: '짧고 단단한 단모음 /ɪ/ 소리로, 끝 자음 g는 입을 다물지 말고 목구멍 뒤쪽에서 살짝 막아줍니다.',
    koMeaning: '크게, 대대적으로, 성공적으로',
    enDef: '1. adverb in a big way',
    example: 'They won/lost ______ at the casino.',
    exampleFull: 'They won big at the casino.',
  },
  {
    word: 'inner',
    masked: 'i ⬛ ⬛ ⬛ r',
    ipa: '/ˈɪn.ər/',
    pos: 'adjective (형용사 · Adj)',
    comp: 'M' as CompId,
    pron: '[이-너]',
    soundBlock: 'find / inner peace',
    soundMethod: '강세가 앞 음절(in-)에 강하게 들어가며, 뒤의 -ner는 힘을 빼고 혀끝을 말아 부드럽게 연결합니다.',
    koMeaning: '내면의, 마음속의, 내부의',
    enDef: "1. adjective of or relating to a person's mind or spirit",
    example: '______ peace',
    exampleFull: 'inner peace',
  },
  {
    word: 'lawless',
    masked: 'la ⬛ ⬛ ⬛ ss',
    ipa: '/ˈlɔː.ləs/',
    pos: 'adjective (형용사 · Adj)',
    comp: 'M' as CompId,
    pron: '[러-러스]',
    soundBlock: 'the lawless / society',
    soundMethod: '첫 자음 L은 혀끝을 윗잇몸에 단단히 붙이고, 턱을 아래로 툭 떨어뜨리며 /ɔː/ 모음을 냅니다.',
    koMeaning: '무법의, 법이 없는, 질서 없는',
    enDef: '1. adjective having no laws',
    example: 'the ______ society of the frontier',
    exampleFull: 'the lawless society of the frontier',
  },
  {
    word: 'intend',
    masked: 'i ⬛ ⬛ ⬛ ⬛ d',
    ipa: '/ɪnˈtend/',
    pos: 'verb (동사 · V)',
    comp: 'V' as CompId,
    pron: '[인-텐드]',
    soundBlock: 'He intended / that his daughter / would inherit',
    soundMethod: '2음절 동사이므로 뒤쪽(-tend)에 강한 강세를 두어 T 파열음을 또렷하게 터뜨려 줍니다.',
    koMeaning: '의도하다, 작정하다, 계획하다',
    enDef: '1. verb to plan or want to do (something) to have (something) in your mind as a purpose or goal',
    example: 'He ______ that his daughter would inherit the business.',
    exampleFull: 'He intended that his daughter would inherit the business.',
  },
  {
    word: 'lick',
    masked: 'l ⬛ ⬛ k',
    ipa: '/lɪk/',
    pos: 'verb (동사 · V)',
    comp: 'V' as CompId,
    pron: '[릭]',
    soundBlock: 'leapt to lick / his face',
    soundMethod: 'R이 아닌 L 시작음이므로 혀끝을 윗니 뒤 천장에 정확히 댔다가 떼면서 짧게 발음합니다.',
    koMeaning: '(혀로) 핥다',
    enDef: '1. verb to pass the tongue over something in order to taste, moisten, or clean it',
    example: 'Can you ______ your nose with your tongue?',
    exampleFull: 'Can you lick your nose with your tongue?',
  },
];

export const WORDBOOK_DATA: WordbookEntry[] = [
  // --- [중등 필수] Day 1 ~ Day 3 ---
  {
    day: 1,
    level: '중등 필수',
    word: 'schedule',
    ipa: '/ˈskedʒ.uːl/',
    pron: '[스-케줄]',
    soundBlock: 'check / the daily schedule',
    soundMethod: 'sch-가 합쳐져 [스크] 소리가 나며, 강세는 첫 음절(sche-)에 강하게 둡니다.',
    meaning: '일정, 시간표, 예정하다',
    pos: 'N',
    posLabel: '명사 (N)',
    comp: 'DO',
    compLabel: '직접목적어 (DO)',
    collocation: 'ahead of schedule',
    collocationKo: '예정된 일정보다 앞서서',
    exampleEn: 'Our new team carefully checked the schedule in the morning.',
    exampleKo: '우리 신규 팀이 오전에 일정을 꼼꼼히 확인했습니다.',
  },
  {
    day: 1,
    level: '중등 필수',
    word: 'improve',
    ipa: '/ɪmˈpruːv/',
    pron: '[임-프루브]',
    soundBlock: 'improve / my English skills',
    soundMethod: '뒤쪽 -prove에 강세를 주고, 끝소리 v는 윗니로 아랫입술을 살짝 물며 진동시킵니다.',
    meaning: '향상시키다, 개선하다, 나아지다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'room for improvement',
    collocationKo: '개선할 여지 / 발전 가능성',
    exampleEn: 'Practicing in sound blocks will rapidly improve your fluency.',
    exampleKo: '소리블럭 단위로 연습하면 유창성이 빠르게 향상될 것입니다.',
  },
  {
    day: 1,
    level: '중등 필수',
    word: 'available',
    ipa: '/əˈveɪ.lə.bəl/',
    pron: '[어-베일러블]',
    soundBlock: 'available / right now',
    soundMethod: '첫 모음 a는 힘 빼고 [어], 두 번째 음절(-vai-)을 가장 높고 길게 발음합니다.',
    meaning: '이용 가능한, 시간이 비어 있는',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'SC',
    compLabel: '주격보어 (SC)',
    collocation: 'available for a quick call',
    collocationKo: '잠깐 통화 가능한(시간이 되는)',
    exampleEn: 'Are you available for a quick meeting this afternoon?',
    exampleKo: '오늘 오후에 잠깐 미팅 시간 괜찮으신가요?',
  },
  {
    day: 2,
    level: '중등 필수',
    word: 'recommend',
    ipa: '/ˌrek.əˈmend/',
    pron: '[레커-멘드]',
    soundBlock: 'highly recommend / this place',
    soundMethod: '마지막 음절 -mend에 주강세가 오며, 앞의 re-는 가볍게 짚어줍니다.',
    meaning: '추천하다, 권고하다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'highly recommend',
    collocationKo: '적극 추천하다 / 강추하다',
    exampleEn: 'What do you recommend on the menu today?',
    exampleKo: '오늘 메뉴 중에서 어떤 걸 추천해 주시겠어요?',
  },
  {
    day: 2,
    level: '중등 필수',
    word: 'comfortable',
    ipa: '/ˈkʌm.fə.tə.bəl/',
    pron: '[컴-프터블]',
    soundBlock: 'feel comfortable / speaking English',
    soundMethod: '중간의 -or- 소리가 사실상 탈락하여 3음절 [컴-프터블]로 압축 발음됩니다!',
    meaning: '편안한, 쾌적한, 마음 편한',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'SC',
    compLabel: '주격보어 (SC)',
    collocation: 'step out of my comfort zone',
    collocationKo: '익숙하고 편안한 안전지대를 벗어나다',
    exampleEn: 'Please make yourself comfortable in the lounge.',
    exampleKo: '라운지에서 편하게 쉬고 계세요.',
  },
  {
    day: 3,
    level: '중등 필수',
    word: 'opportunity',
    ipa: '/ˌɒp.əˈtjuː.nə.ti/',
    pron: '[아퍼-튜너티]',
    soundBlock: 'take / this opportunity',
    soundMethod: '-tu- 음절에 강한 강세를 주며, 미국식 발음에서는 마지막 -ty가 부드러운 플랩 [리]로 소리 납니다.',
    meaning: '기회, 찬스',
    pos: 'N',
    posLabel: '명사 (N)',
    comp: 'DO',
    compLabel: '직접목적어 (DO)',
    collocation: 'seize the opportunity',
    collocationKo: '찾아온 기회를 놓치지 않고 잡다',
    exampleEn: 'I would like to thank you for giving me this opportunity.',
    exampleKo: '저에게 이런 좋은 기회를 주셔서 감사드립니다.',
  },
  // --- [고등·수능 핵심] Day 1 ~ Day 3 ---
  {
    day: 1,
    level: '고등·수능 핵심',
    word: 'perspective',
    ipa: '/pəˈspek.tɪv/',
    pron: '[퍼-스펙티브]',
    soundBlock: 'from / a broader perspective',
    soundMethod: '중간 음절 -spec-에 강세를 주며, s 뒤의 p는 된소리 [ㅃ]로 발음합니다.',
    meaning: '관점, 시각, 전망',
    pos: 'N',
    posLabel: '명사 (N)',
    comp: 'DO',
    compLabel: '직접목적어 (DO)',
    collocation: 'put things into perspective',
    collocationKo: '사안을 균형 잡힌 넓은 시각으로 바라보다',
    exampleEn: 'This book gave me a completely new perspective on life.',
    exampleKo: '이 책은 나에게 삶에 대한 완전히 새로운 관점을 주었습니다.',
  },
  {
    day: 2,
    level: '고등·수능 핵심',
    word: 'significant',
    ipa: '/sɪɡˈnɪf.ɪ.kənt/',
    pron: '[시그-니피컨트]',
    soundBlock: 'a significant / difference',
    soundMethod: '-nif- 음절을 가장 강하게 발음하고, 마지막 t는 파열시키지 않고 받침으로 삼킵니다.',
    meaning: '중요한, 상당한, 의미심장한',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'M',
    compLabel: '수식어 (M)',
    collocation: 'make significant progress',
    collocationKo: '상당한(눈에 띄는) 진전을 이루다',
    exampleEn: 'There has been a significant increase in productivity.',
    exampleKo: '생산성에 있어서 상당한 증가가 있었습니다.',
  },
  {
    day: 3,
    level: '고등·수능 핵심',
    word: 'simultaneously',
    ipa: '/ˌsaɪ.məlˈteɪ.ni.əs.li/',
    pron: '[사이멀-테이니어슬리]',
    soundBlock: 'happened / simultaneously',
    soundMethod: '-ta- 음절에 주강세를 두어 리듬감 있게 끊어 읽으면 긴 단어도 한 번에 발음됩니다.',
    meaning: '동시에, 일제히',
    pos: 'Adv',
    posLabel: '부사 (Adv)',
    comp: 'M',
    compLabel: '수식어 (M)',
    collocation: 'work on two tasks simultaneously',
    collocationKo: '두 가지 업무를 동시에 처리하다',
    exampleEn: 'The live broadcast was streamed simultaneously worldwide.',
    exampleKo: '그 생방송은 전 세계에 동시에 스트리밍되었습니다.',
  },
  // --- [비즈니스·실무] Day 1 ~ Day 2 ---
  {
    day: 1,
    level: '비즈니스·실무',
    word: 'streamline',
    ipa: '/ˈstriːm.laɪn/',
    pron: '[스트림-라인]',
    soundBlock: 'streamline / the entire workflow',
    soundMethod: 'str- 자음군을 모음 끼어들기 없이 한 호흡으로 묶어 [스트림]으로 발음합니다.',
    meaning: '(업무·절차를) 간소화·효율화하다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'streamline the approval process',
    collocationKo: '결재 절차를 대폭 간소화하다',
    exampleEn: 'We need to streamline our reporting system to save time.',
    exampleKo: '시간을 절약하기 위해 보고 체계를 간소화해야 합니다.',
  },
  {
    day: 2,
    level: '비즈니스·실무',
    word: 'expedite',
    ipa: '/ˈek.spə.daɪt/',
    pron: '[엑-스퍼다이트]',
    soundBlock: 'expedite / the delivery',
    soundMethod: '첫 음절 ex-에 강세를 강하게 찍고, 중간 -pe-는 약하게 흘린 뒤 -dite로 마무리합니다.',
    meaning: '(절차·업무를) 신속히 처리하다, 앞당기다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'expedite the shipping process',
    collocationKo: '배송 절차를 최대한 앞당기다',
    exampleEn: 'I was wondering if you could expedite this urgent order.',
    exampleKo: '혹시 이 긴급 주문을 조금 앞당겨 처리해 주실 수 있을까요?',
  },
  // --- [오픽(OPIc)·구동사] Day 1 ~ Day 2 ---
  {
    day: 1,
    level: '오픽(OPIc)·구동사',
    word: 'unwind',
    ipa: '/ʌnˈwaɪnd/',
    pron: '[언-와인드]',
    soundBlock: 'help me / unwind after work',
    soundMethod: '바람 빠지는 명사 wind[윈드]가 아니라, 감긴 태엽을 푼다는 동사이므로 [와인드/waɪnd/]로 발음합니다!',
    meaning: '(긴장·피로를) 풀다, 휴식을 취하다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'OC',
    compLabel: '목적격보어 (OC)',
    collocation: 'unwind on the weekend',
    collocationKo: '주말에 긴장을 풀고 푹 쉬다',
    exampleEn: 'Listening to music helps me unwind after a busy day.',
    exampleKo: '바쁜 하루 일과 후 음악을 듣는 것은 긴장을 푸는 데 큰 도움이 됩니다.',
  },
  {
    day: 2,
    level: '오픽(OPIc)·구동사',
    word: 'pull off',
    ipa: '/pʊl ɒf/',
    pron: '[풀-오프]',
    soundBlock: 'pull off / a tailored look',
    soundMethod: 'pull의 끝 자음 l과 off의 모음이 자연스럽게 이어져 [풀-러프]처럼 부드럽게 소리 납니다.',
    meaning: '(어려운 일·독특한 패션을) 멋지게 소화해 내다, 성사시키다',
    pos: 'V',
    posLabel: '구동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'pull off a bold style',
    collocationKo: '과감한 스타일을 완벽하게 소화하다',
    exampleEn: 'You really pulled off that classic trench coat!',
    exampleKo: '그 클래식한 트렌치코트를 정말 멋지게 소화하셨네요!',
  },
];

// ============================================================================
// 5. 전 레벨(초·중·고급) 맞춤형 5대 핵심 테마 풀코스 DB (전반부: 테마 1 ~ 3)
// ============================================================================
export const THEMES_PART1: ThemeData[] = [
  // --------------------------------------------------------------------------
  // THEME 1: 비즈니스 미팅 & 프로젝트 일정 조율
  // --------------------------------------------------------------------------
  {
    id: 'biz-meeting',
    title: '📊 비즈니스 미팅 & 프로젝트 일정 조율',
    badge: '비즈니스 핵심 · 초급~고급 완비',
    dateLabel: '오늘의 실무 코스 · 업무 & 협업',
    opicLevel: '초급(기본요청) ➔ 중급(바꿔말하기) ➔ 고급(정중한 협상)',
    coachPoint:
      '같은 일정 조율이라도 초급은 직관적인 조동사(Can we ~?), 중급은 상황별 구동사 바꿔 말하기(wrap up / touch base), 고급은 거리두기 공손법(I was wondering if ~)으로 단계별 확장합니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [요청 도입부] + [핵심 행동 동사(V)] + [목적어 대상(DO)] + [시간·목적 수식어(M)]',
    grammarSummary:
      '초급은 조동사+동사원형(Can we check ~?), 중급은 수여동사 4형식(give you a heads-up), 고급은 과거진행 공손법(I was wondering if you could ~)으로 문장 뼈대를 확장합니다.',
    situationGuide:
      '동료와 점심 식사나 커피를 마시며 가볍게 일정을 점검할 때(초급)부터, 부서 간 마감 기한을 단축하고 프로세스를 효율화하는 임원 회의(고급)까지 모두 커버합니다.',
    levelTracks: {
      beginner: {
        levelName: '🌱 초급 (느린 발음 0.75x & 한글 뜻·발음 기본 도움)',
        targetSpeed: 0.75,
        focusBadge: '기초 뼈대 패턴 + 또렷한 소리블럭 따라하기',
        patternEn: 'Can we check / the schedule / together?',
        patternIpa: '/kæn wi tʃek ðə ˈskedʒ.uːl təˈɡeð.ər/',
        patternPron: '[캔 위 체크 / 더 스케줄 / 투게더?]',
        patternSoundBlock: 'Can we check / the schedule / together?',
        patternMeaningKo: '우리 함께 일정을 확인해 볼 수 있을까요?',
        levelGuide: '초급에서는 문장 맨 앞에 "Can we + 동사원형(check / grab / finish)"만 정확히 던져도 의사소통이 100% 성공합니다. 0.75배속 느린 발음으로 소리블럭 3덩어리를 천천히 따라 읽어보세요.',
        paraphraseDrill: [
          { basicExpr: 'eat lunch quickly', upgradedExpr: 'grab a quick bite', nuanceDiff: '간단히 요기하자는 자연스러운 일상 표현' },
          { basicExpr: 'finish the meeting', upgradedExpr: 'wrap up the meeting', nuanceDiff: '회의를 깔끔하게 마무리한다는 실전 구동사' },
        ],
        longTalkPrompt: '동료에게 오늘 오후에 잠깐 일정을 같이 확인하자고 한 문장으로 말해 보세요.',
      },
      intermediate: {
        levelName: '🌿 중급 (듣기 집중 0.90x & 구동사 바꿔 말하기 훈련)',
        targetSpeed: 0.9,
        focusBadge: '리스닝 빈칸 파악 & 원어민 구동사로 바꿔 말하기(Paraphrasing)',
        patternEn: 'Let us touch base / and wrap up / the checklist.',
        patternIpa: '/let ʌs tʌtʃ beɪs ænd ræp ʌp ðə ˈtʃek.lɪst/',
        patternPron: '[레러스 터치 베이스 / 앤 래-펍 / 더 체크리스트]',
        patternSoundBlock: 'Let us touch base / and wrap up / the checklist.',
        patternMeaningKo: '서로 진행 상황을 공유하고 체크리스트를 마무리합시다.',
        levelGuide: '중급의 핵심은 쉬운 단어(contact, finish, tell)를 원어민이 매일 쓰는 구동사·짝꿍 표현(touch base, wrap up, give a heads-up)으로 즉석에서 바꿔 말하는 능력입니다.',
        paraphraseDrill: [
          { basicExpr: 'call you briefly (잠깐 연락하다)', upgradedExpr: 'touch base with you', nuanceDiff: '업무 진행 현황을 가볍게 점검·공유하는 세련된 표현' },
          { basicExpr: 'tell you in advance (미리 말하다)', upgradedExpr: 'give you a quick heads-up', nuanceDiff: '상대가 당황하지 않게 사전 귀띔을 준다는 4형식 표현' },
          { basicExpr: 'agree with each other (생각이 같다)', upgradedExpr: 'get on the same page', nuanceDiff: '팀원 전체가 같은 이해를 공유한다는 필수 이디엄' },
        ],
        longTalkPrompt: '일정이 변경되었다는 것을 동료에게 미리 귀띔(heads-up)해 주는 2~3문장 대화를 만들어 보세요.',
      },
      advanced: {
        levelName: '🌳 고급 (실전 속도 1.0x+ & 세련된 뉘앙스·긴 대화 토론)',
        targetSpeed: 1.0,
        focusBadge: '최상급 공손 화법 & 비즈니스 프로세스 효율화 긴 호흡 토론',
        patternEn: 'I was wondering if we could streamline / the entire workflow.',
        patternIpa: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf wi kʊd ˈstriːm.laɪn ði ɪnˈtaɪər ˈwɜːk.fləʊ/',
        patternPron: '[아이 워즈 원더링 / 이프 위 쿳 스트림-라인 / 디 인타이어 워크플로우]',
        patternSoundBlock: 'I was wondering / if we could streamline / the entire workflow.',
        patternMeaningKo: '시간을 절약하기 위해 전체 업무 공정을 좀 더 간소화할 수 있을지 여쭙고 싶습니다.',
        levelGuide: '고급에서는 상대방에게 부담을 주지 않는 거리두기 공손법(I was wondering if ~)과 격식 있는 어휘(streamline, feasible, expedite, meticulously)를 결합하여 설득력 있는 긴 대화를 이끌어갑니다.',
        paraphraseDrill: [
          { basicExpr: 'make the work faster', upgradedExpr: 'streamline the workflow & expedite the process', nuanceDiff: '단순 속도 향상을 넘어 불필요한 절차를 없애고 신속히 처리하는 임원급 화법' },
          { basicExpr: 'a possible plan', upgradedExpr: 'a highly feasible and tentative schedule', nuanceDiff: '실현 가능성이 높으면서도 유연하게 조율 가능한 잠정 계획' },
        ],
        longTalkPrompt: '[5~30분 AI 토론 주제] 우리 팀의 반복적인 회의와 보고 절차를 어떻게 효율화(streamline)할 수 있을지 당신의 관점(perspective)을 4문장 이상으로 설득해 보세요.',
      },
    },
    pattern: {
      en: 'I was wondering if you could ~',
      ipa: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf ju kʊd/',
      soundBlock: 'I was wondering / if you could / + 동사원형',
      soundMethod:
        'was는 약하게 [워즈], wondering의 첫 음절 [원-]에 가장 강한 강세를 실어주고, if you는 연음하여 [이퓨]로 한 호흡에 처리합니다.',
      pron: '[아이 워즈 원더링 / 이퓨 쿳 ~]',
      nuance:
        '단순한 "Can you ~?"보다 훨씬 정중하고 부드럽게 상대방의 일정과 입장을 배려하며 협조를 구하는 만능 패턴입니다.',
      opicApplication:
        '초급의 단순 질문을 중·고급 롤플레이 만점 문장으로 즉시 업그레이드해 줍니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'grab',
        masked: 'g ⬛ ⬛ b',
        ipa: '/ɡræb/',
        pron: '[그랩]',
        soundMethod: '입을 옆으로 넓게 벌리는 단모음 /æ/를 정확히 내고 끝 자음 b는 입술을 닫으며 멈춥니다.',
        soundBlock: 'grab / a quick bite',
        meaning: '간단히 먹다, 챙기다',
        enDef: '1. verb to get, take, or eat something quickly and informally',
        exampleBlank: 'Let us ______ a quick coffee before the afternoon session.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '주어의 동작을 나타내며 뒤에 목적어(a quick bite/coffee)를 취함',
        collocation: 'grab a quick bite',
        collocationKo: '간단히 요기하다 / 빠르게 식사하다',
        paraphraseTip: '[초급➔중급 변환] eat lunch quickly 대신 grab a quick bite를 쓰세요!',
      },
      {
        id: 2,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'wrap up',
        masked: 'wr ⬛ p  u ⬛',
        ipa: '/ræp ʌp/',
        pron: '[래-펍]',
        soundMethod: '첫 자음 w는 묵음! wrap의 끝 자음 p가 up의 모음과 합쳐져 [래-펍]으로 연음됩니다.',
        soundBlock: 'wrap up / the meeting',
        meaning: '깔끔하게 마무리하다, 끝내다',
        enDef: '1. phrasal verb to complete or finish a meeting or task successfully',
        exampleBlank: 'We need to ______ this review by 5 PM.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '회의나 업무를 성공적으로 갈무리하는 3형식 타동사구 역할',
        collocation: 'wrap up the meeting',
        collocationKo: '회의를 깔끔하게 마무리 짓다',
        paraphraseTip: '[초급➔중급 변환] finish the work 대신 wrap up the work로 바꿔 말하기!',
      },
      {
        id: 3,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'touch base',
        masked: 't ⬛ ⬛ ch  b ⬛ se',
        ipa: '/tʌtʃ beɪs/',
        pron: '[터치 베이스]',
        soundMethod: '두 단어 모두 내용어이므로 각각 강세를 살려 리듬감 있게 끊어 발음합니다.',
        soundBlock: 'touch base / with the team',
        meaning: '잠깐 연락해 상황을 공유하다',
        enDef: '1. idiom to briefly make or renew contact with someone',
        exampleBlank: 'I just wanted to ______ with you on the project progress.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '전치사 with와 결합하여 상대방과 현황을 점검하는 서술어',
        collocation: 'touch base with the team',
        collocationKo: '팀원들과 진행 상황을 공유하다',
        paraphraseTip: '[중급 핵심] call or talk briefly를 대체하는 비즈니스 1순위 표현',
      },
      {
        id: 4,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'on the same page',
        masked: 'on the s ⬛ ⬛ e p ⬛ ge',
        ipa: '/ɒn ðə seɪm peɪdʒ/',
        pron: '[온 더 세임 페이지]',
        soundMethod: '기능어 on the는 약하고 빠르게 넘기고, 핵심어 same과 page에 강세를 줍니다.',
        soundBlock: 'make sure / we are / on the same page',
        meaning: '생각·이해가 완전히 일치하는',
        enDef: '1. idiom thinking in a similar way or having the same understanding',
        exampleBlank: 'Let us make sure everyone is ______ before we launch.',
        pos: 'Prep',
        posLabel: '전치사구 (Prep)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: 'be동사 뒤에서 주어(우리)의 이해 상태가 일치함을 보충 설명',
        collocation: 'get on the same page',
        collocationKo: '서로의 생각과 이해를 일치시키다',
        paraphraseTip: '[중급 바꿔말하기] We agree with each other ➔ We are on the same page.',
      },
      {
        id: 5,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'heads-up',
        masked: 'he ⬛ ds-u ⬛',
        ipa: '/ˈhedz.ʌp/',
        pron: '[헤-즈업]',
        soundMethod: '복수형 s(/z/)와 뒤 모음 up이 연음되어 [헤-즈업]으로 부드럽게 이어집니다.',
        soundBlock: 'give you / a quick heads-up',
        meaning: '사전 귀띔, 미리 알림',
        enDef: '1. noun an advance warning or piece of information given ahead of time',
        exampleBlank: 'Thanks for giving me a quick ______ about the schedule change.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '4형식 동사 give 뒤에서 직접목적어(무엇을) 자리에 위치함',
        collocation: 'give you a quick heads-up',
        collocationKo: '미리 살짝 언질을 주다 / 귀띔해 주다',
        paraphraseTip: '[중급 바꿔말하기] tell you beforehand ➔ give you a quick heads-up',
      },
      {
        id: 6,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'streamline',
        masked: 'str ⬛ ⬛ ml ⬛ ne',
        ipa: '/ˈstriːm.laɪn/',
        pron: '[스트림-라인]',
        soundMethod: '첫 음절 stream-을 길게 끌어주고 -line을 깔끔하게 붙여 발음합니다.',
        soundBlock: 'streamline / the entire workflow',
        meaning: '(업무·절차를) 간소화·효율화하다',
        enDef: '1. verb to make an organization or system more efficient and effective',
        exampleBlank: 'We aim to ______ the entire workflow this quarter.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '복잡한 업무 프로세스를 효율화한다는 핵심 타동사 역할',
        collocation: 'streamline the entire workflow',
        collocationKo: '전체 업무 과정을 효율화하다',
        paraphraseTip: '[고급 뉘앙스] make simpler보다 시스템 전체의 군더더기를 없앤다는 전문 어휘',
      },
      {
        id: 7,
        type: '고급/실무',
        recommendLevel: 'intermediate',
        word: 'tentative',
        masked: 'te ⬛ t ⬛ t ⬛ ve',
        ipa: '/ˈten.tə.tɪv/',
        pron: '[텐-터티브]',
        soundMethod: '첫 음절 ten-에 강세를 두고, 뒤의 -tative는 힘을 빼고 빠르게 굴려줍니다.',
        soundBlock: 'set a / tentative schedule',
        meaning: '잠정적인, 가안의',
        enDef: '1. adjective not certain or fixed; provisional',
        exampleBlank: 'We have set a ______ date for the next workshop.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(schedule/date) 앞에서 성질을 꾸며주는 한정 수식어',
        collocation: 'set a tentative schedule',
        collocationKo: '잠정적인 일정을 잡다',
        paraphraseTip: '[중·고급] not fixed yet 대신 단어 하나로 tentative를 명사 앞에 배치!',
      },
      {
        id: 8,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'feasible',
        masked: 'fe ⬛ s ⬛ ble',
        ipa: '/ˈfiː.zə.bəl/',
        pron: '[피-저블]',
        soundMethod: '첫 음절 fea-에 강한 강세를 두고, s는 유성음 /z/([즈])로 발음합니다.',
        soundBlock: 'a highly / feasible solution',
        meaning: '실행 가능한, 실현성 있는',
        enDef: '1. adjective possible to do easily or conveniently',
        exampleBlank: 'Is it ______ to complete the report by tomorrow?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '주어나 목적어의 실현 가능성 상태를 보충 설명하는 보어 역할',
        collocation: 'a highly feasible solution',
        collocationKo: '매우 실현 가능한 해결책',
        paraphraseTip: '[고급 뉘앙스] 단순 possible이 아니라 현실적·실무적으로 실행 가능함을 뜻함',
      },
      {
        id: 9,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'expedite',
        masked: 'ex ⬛ ⬛ d ⬛ te',
        ipa: '/ˈek.spə.daɪt/',
        pron: '[엑-스퍼다이트]',
        soundMethod: 'ex-에 강세를 찍고 -dite(/daɪt/)의 이중모음을 선명하게 살려줍니다.',
        soundBlock: 'expedite / the approval process',
        meaning: '신속히 처리하다, 앞당기다',
        enDef: '1. verb to make an action or process happen sooner or be accomplished more quickly',
        exampleBlank: 'Could you please ______ the review process?',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '지연된 일정이나 결재 과정을 빠르게 촉진하는 타동사',
        collocation: 'expedite the process',
        collocationKo: '처리 과정을 신속히 앞당기다',
        paraphraseTip: '[고급 변환] speed up을 대체하는 품격 있는 비즈니스 타동사',
      },
      {
        id: 10,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'meticulously',
        masked: 'me ⬛ i ⬛ u ⬛ ously',
        ipa: '/məˈtɪk.jə.ləs.li/',
        pron: '[머-티큘러슬리]',
        soundMethod: '두 번째 음절 -tic-에 강한 강세를 주면 5음절 단어도 리듬감 있게 넘어갑니다.',
        soundBlock: 'meticulously / reviewed the data',
        meaning: '꼼꼼하게, 빈틈없이 세심하게',
        enDef: '1. adverb in a way that shows great attention to detail; very thoroughly',
        exampleBlank: 'Our team ______ checked every single item on the list.',
        pos: 'Adv',
        posLabel: '부사 (Adverb)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '문장 뼈대에 영향 없이 동사(검토하다/점검하다)의 정밀도를 수식함',
        collocation: 'review the plan meticulously',
        collocationKo: '계획을 빈틈없이 꼼꼼하게 검토하다',
        paraphraseTip: '[고급 변환] very carefully를 한 단어로 압축한 최고급 부사',
      },
    ],
    synonymScale: {
      baseWord: 'fast / careful (비즈니스 속도·정밀도 강세 비교)',
      pos: '동사·부사 뉘앙스 강도 비교',
      meaning: '초급 기본어에서 고급 실무어로 올라갈 때의 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [
            { word: 'overhaul / meticulously', ipa: '/məˈtɪk.jə.ləs.li/', nuance: '전면 개편하다 / 티끌 하나 없이 치밀하게 (최고급)' },
          ],
        },
        {
          strength: '강함 (Strong)',
          words: [
            { word: 'expedite / streamline', ipa: '/ˈek.spə.daɪt/', nuance: '공식 절차를 신속히 앞당기다·효율화하다 (고급 실무)' },
          ],
        },
        {
          strength: '보통 (Neutral)',
          words: [
            { word: 'speed up / carefully', ipa: '/ˈkeə.fəl.i/', nuance: '속도를 높이다 / 주의 깊게 (초·중급 표준)' },
          ],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [
            { word: 'wrap up / touch base', ipa: '/ræp ʌp/', nuance: '가볍게 마무리하다 / 잠깐 연락해 조율하다 (일상 구어)' },
          ],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        levelTag: 'beginner',
        tag: '🌱 [초급] 기본 표현 & 느린 발음 훈련',
        targetWord: 'grab & wrap up',
        wordOrderFormula: '[권유(Let us)] + [동사1(grab)] + [목적어1(a quick coffee)] + [연결(and)] + [동사2(wrap up)] + [목적어2(the list)]',
        structure: '동사원형1(V) + 목적어1(DO) + 접속사 + 동사원형2(V) + 목적어2(DO)',
        soundBlockEn: 'Let us grab / a quick coffee / and wrap up / the checklist.',
        soundMethodGuide: '천천히 0.75배속으로 grab과 wrap up[래-펍] 두 동사에만 힘을 주어 읽어보세요.',
        ipaLine: '/let ʌs ɡræb ə kwɪk ˈkɒf.i ænd ræp ʌp ðə ˈtʃek.lɪst/',
        koLine: '우리 간단히 마십시다(V) / 커피 한잔을(DO) / 그리고 마무리합시다(V) / 체크리스트를(DO).',
        enLine: 'Let us [grab](V) / a quick coffee(DO) / and [wrap up](V) / the checklist(DO).',
        rawEn: 'Let us grab a quick coffee and wrap up the checklist.',
        pronLine: '[레러스 그랩 / 어 퀵 커피 / 앤 래-펍 / 더 체크리스트]',
        naturalKo: '우리 커피 한잔 간단히 마시면서 체크리스트 마무리해요.',
        paraphraseVersion: 'Why don’t we get some coffee and finish the checklist together?',
        grammarPoint: 'Let us(Let’s) 뒤에는 동사원형(grab, wrap up)이 나란히 연결되어 상대방에게 부담 없이 제안하는 초급 필수 문형입니다.',
        contextNuance: '팀원이나 동료에게 부드럽게 휴식과 업무 마무리를 동시에 제안할 때 씁니다.',
      },
      {
        id: 2,
        levelTag: 'intermediate',
        tag: '🌿 [중급] 상황별 대화 & 바꿔 말하기 훈련',
        targetWord: 'heads-up & touch base',
        wordOrderFormula: '[주어(I)] + [동사(wanted to give)] + [간접목적어(you)] + [직접목적어(a quick heads-up)] + [수식어(about ~)]',
        structure: '주어(S) + 동사(V) + 간접목적어(IO) + 직접목적어(DO) + 수식어(M)',
        soundBlockEn: 'I wanted to give you / a quick heads-up / about the tentative schedule.',
        soundMethodGuide: 'give you를 [기뷰]로, heads-up을 [헤-즈업]으로 묶어 중급 리듬감을 만드세요.',
        ipaLine: '/aɪ ˈwɒn.tɪd tə ɡɪv ju ə kwɪk ˈhedz.ʌp əˈbaʊt ðə ˈten.tə.tɪv ˈskedʒ.uːl/',
        koLine: '나는(S) / 주고 싶었습니다(V) / 당신에게(IO) / 빠른 사전 귀띔을(DO) / 잠정적인 일정에 대해(M).',
        enLine: 'I(S) / wanted to give(V) / you(IO) / a quick [heads-up](DO) / about the [tentative] schedule(M).',
        rawEn: 'I wanted to give you a quick heads-up about the tentative schedule.',
        pronLine: '[아이 원티투 기뷰 / 어 퀵 헤-즈업 / 어바웃 더 텐-터티브 스케줄]',
        naturalKo: '잠정 일정에 대해 미리 살짝 귀띔을 드리려고 연락드렸습니다.',
        paraphraseVersion: 'I am calling to touch base and let you know early about the provisional plan.',
        grammarPoint: '4형식 수여동사 give(누구에게[IO] + 무엇을[DO]) 구조로, 초급의 "I want to tell you"를 완벽히 대체합니다.',
        contextNuance: '일정이 확정되기 전 동료에게 미리 언질을 주어 배려심을 보여주는 실전 문장입니다.',
      },
      {
        id: 3,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 프로세스 협상 ①',
        targetWord: 'streamline & expedite',
        wordOrderFormula: '[정중도입(I was wondering)] + [목적어절(if we could streamline ~)] + [목적수식어(to expedite ~)]',
        structure: '주어(S) + 동사(V) + 목적어절(O) + 수식어(M: 목적의 to부정사)',
        soundBlockEn: 'I was wondering / if we could streamline / the workflow / to expedite the launch.',
        soundMethodGuide: 'streamline과 expedite의 강세 음절만 정확히 짚어 물 흐르듯 연결하세요.',
        ipaLine: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf wi kʊd ˈstriːm.laɪn ðə ˈwɜːk.fləʊ tu ˈek.spə.daɪt ðə lɔːntʃ/',
        koLine: '나는 궁금했습니다(S+V) / 우리가 업무 공정을 간소화할 수 있을지(O) / 런칭을 앞당기기 위해(M).',
        enLine: 'I was wondering(S+V) / if we could [streamline] the workflow(O) / to [expedite] the launch(M).',
        rawEn: 'I was wondering if we could streamline the workflow to expedite the launch.',
        pronLine: '[아이 워즈 원더링 / 이프 위 쿳 스트림-라인 더 워크플로우 / 투 엑-스퍼다이트 더 런치]',
        naturalKo: '런칭 일정을 앞당기기 위해 업무 프로세스를 좀 더 효율화할 수 있을지 논의해 보고 싶습니다.',
        paraphraseVersion: 'Would it be possible for our team to simplify the process so we can speed up the release?',
        grammarPoint: '과거진행 공손법(I was wondering if ~)과 목적을 나타내는 부사적 용법(to expedite ~)이 결합된 고급 복문입니다.',
        contextNuance: '임원 미팅이나 프로젝트 총괄 회의에서 품격 있게 일정 단축을 제안하는 화법입니다.',
      },
      {
        id: 4,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 긴 대화 토론 ②',
        targetWord: 'meticulously & feasible',
        wordOrderFormula: '[주어(Our team)] + [부사(meticulously)] + [동사(reviewed)] + [목적어(the most feasible option)] + [수식어(to get on the same page)]',
        structure: '주어(S) + 수식어(M) + 동사(V) + 직접목적어(DO) + 수식어(M)',
        soundBlockEn: 'Our team / meticulously reviewed / the most feasible option / to get on the same page.',
        soundMethodGuide: 'most의 끝소리 t를 생략해 [모스 피-저블]로 발음하면 네이티브의 자연스러운 속도가 완성됩니다.',
        ipaLine: '/aʊər tiːm məˈtɪk.jə.ləs.li rɪˈvjuːd ðə məʊst ˈfiː.zə.bəl ˈɒp.ʃən tə ɡet ɒn ðə seɪm peɪdʒ/',
        koLine: '우리 팀은(S) / 빈틈없이 검토했습니다(M+V) / 가장 실현 가능한 방안을(DO) / 모두의 의견을 일치시키기 위해(M).',
        enLine: 'Our team(S) / [meticulously] reviewed(M+V) / the most [feasible] option(DO) / to get [on the same page](M).',
        rawEn: 'Our team meticulously reviewed the most feasible option to get on the same page.',
        pronLine: '[아워 팀 / 머-티큘러슬리 리뷰드 / 더 모스 피-저블 옵션 / 투 겟 온 더 세임 페이지]',
        naturalKo: '저희 팀은 전원이 한마음으로 뜻을 모으기 위해 가장 실현 가능성 높은 방안을 빈틈없이 검토했습니다.',
        paraphraseVersion: 'We thoroughly examined the most practical solution so that everyone shares the same understanding.',
        grammarPoint: '부사 meticulously는 동사 reviewed를 수식하고, 형용사 feasible은 명사 option을 수식하는 정확한 품사 배치를 보여줍니다.',
        contextNuance: '발표나 보고의 마무리 문장으로 사용하면 완벽한 준비성과 신뢰감을 전달합니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'wrap up',
        ipa: '/ræp ʌp/',
        options: ['새로 시작하다', '깔끔하게 마무리하다, 끝내다', '일정을 연기하다', '서류를 복사하다'],
        answerIdx: 1,
        explanation: 'wrap up은 선물 포장을 마지막에 묶듯 회의나 업무를 깔끔하게 마무리한다는 필수 구동사입니다.',
      },
      intermediate: {
        sentenceBefore: 'I wanted to give you a quick',
        sentenceAfter: 'about the schedule change.',
        hint: '일정 변경에 대해 상대방이 미리 알고 대비할 수 있도록 주는 "사전 귀띔"입니다.',
        options: ['heads-up', 'layover', 'carry-on', 'silhouette'],
        answerIdx: 0,
        explanation: 'give someone a quick heads-up은 미리 살짝 언질을 주다는 뜻의 핵심 짝꿍 표현입니다.',
      },
      advanced: {
        sentenceBefore: 'We need to',
        highlightWord: 'expedite',
        sentenceAfter: 'the approval process before Friday.',
        options: ['accelerate', 'speed up', 'postpone'],
        answerIndices: [0, 1],
        explanation: 'expedite(신속히 처리하다, 앞당기다)는 accelerate 및 speed up과 같은 의미로 바꿔 쓸 수 있습니다.',
      },
      writingMission: {
        koPrompt: '혹시 이번 주 금요일까지 잠정적인 일정을 공유해 주실 수 있을까요?',
        wordOrderHint: '[패턴: I was wondering if you could] + [동사: share] + [목적어: a tentative schedule] + [기한: by this Friday]',
        hint: 'I was wondering if you could / share / a tentative schedule / by this Friday.',
        modelAnswer: 'I was wondering if you could share a tentative schedule by this Friday.',
        checkPoint:
          '초급의 "Can you share ~?"를 고급 패턴 "I was wondering if you could share ~"로 업그레이드한 문장입니다.',
      },
    },
  },

  // --------------------------------------------------------------------------
  // THEME 2: 일상 힐링 루틴 & 오픽(OPIc) 전 레벨 스피킹
  // --------------------------------------------------------------------------
  {
    id: 'opic-master',
    title: '☕ 일상 힐링 루틴 & 오픽(OPIc) 전 레벨 스피킹',
    badge: '초급 스몰톡 ~ 오픽 AL 완비',
    dateLabel: '오늘의 스피킹 코스 · 일상 & 여가',
    opicLevel: '초급(일상묘사) ➔ 중급(감정·바꿔말하기) ➔ 고급(관점·긴대화)',
    coachPoint:
      '퇴근 후 휴식, 주말 카페, 산책, 아이패드 자기계발 등 내 일상을 영어로 말할 때 초급은 기본 동사구, 중급은 원어민 최애 표현(go-to / unwind), 고급은 관계대명사 강조 구문으로 자연스럽게 이어집니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [강조 도입부 (I love ~ / What I love most is that ~)] + [주어(S) + 동사(V)] + [장소·시간·이유 수식어(M)]',
    grammarSummary:
      '초급은 "I usually + 동사원형", 중급은 사역·준사역동사 "help me + 동사원형(unwind)", 고급은 명사절 주어 "What I love most about ~ is that S+V" 구조를 익힙니다.',
    situationGuide:
      '외국인 친구와의 가벼운 주말 안부 대화부터 오픽 시험의 여가·취미·루틴 질문까지 단 하나의 막힘도 없이 대답할 수 있습니다.',
    levelTracks: {
      beginner: {
        levelName: '🌱 초급 (느린 발음 0.75x & 한글 뜻·발음 기본 도움)',
        targetSpeed: 0.75,
        focusBadge: '나의 하루 루틴을 짧고 명확한 3덩어리 어순으로 말하기',
        patternEn: 'I usually / take a walk / to clear my head.',
        patternIpa: '/aɪ ˈjuː.ʒu.ə.li teɪk ə wɔːk tə klɪər maɪ hed/',
        patternPron: '[아이 유주얼리 / 테이크 어 워크 / 투 클리어 마이 헤드]',
        patternSoundBlock: 'I usually / take a walk / to clear my head.',
        patternMeaningKo: '나는 보통 복잡한 머리를 식히기 위해 산책을 합니다.',
        levelGuide: '초급에서는 "나는 보통 ~한다 (I usually + 동사)" 뒤에 목적("머리를 식히기 위해: to clear my head")만 붙여도 훌륭한 원어민 문장이 됩니다.',
        paraphraseDrill: [
          { basicExpr: 'favorite cafe (좋아하는 카페)', upgradedExpr: 'my go-to cafe', nuanceDiff: '늘 믿고 찾는 나만의 최애 단골 카페' },
          { basicExpr: 'relax after work (퇴근 후 쉬다)', upgradedExpr: 'unwind after work', nuanceDiff: '하루의 긴장과 피로를 싹 풀다는 원어민 표현' },
        ],
        longTalkPrompt: '퇴근 후나 주말에 머리를 식히기 위해 주로 무엇을 하는지 한 문장으로 말해 보세요.',
      },
      intermediate: {
        levelName: '🌿 중급 (듣기 집중 0.90x & 바꿔 말하기 훈련)',
        targetSpeed: 0.9,
        focusBadge: '단조로운 표현(like, relax)을 네이티브 어휘로 바꿔 말하기',
        patternEn: 'This quiet cafe / is my go-to place / to unwind.',
        patternIpa: '/ðɪs ˈkwaɪ.ət ˈkæf.eɪ ɪz maɪ ˈɡəʊ.tuː pleɪs tu ʌnˈwaɪnd/',
        patternPron: '[디스 콰이엇 카페 / 이즈 마이 고-투 플레이스 / 투 언-와인드]',
        patternSoundBlock: 'This quiet cafe / is my go-to place / to unwind.',
        patternMeaningKo: '이 조용한 카페는 긴장을 풀고 싶을 때 늘 찾는 저의 최애 장소입니다.',
        levelGuide: '중급에서는 "I like this cafe because I can relax"라는 초급 문장을 "my go-to place", "unwind", "recharge my batteries"로 바꿔 말하는 연습을 집중적으로 진행합니다.',
        paraphraseDrill: [
          { basicExpr: 'get energy again (에너지를 다시 얻다)', upgradedExpr: 'recharge my batteries', nuanceDiff: '배터리를 충전하듯 활력을 100% 되찾다는 생생한 관용구' },
          { basicExpr: 'keep my habit (습관을 유지하다)', upgradedExpr: 'stick to my daily routine', nuanceDiff: '작심삼일로 끝나지 않고 루틴을 꾸준히 지킨다는 구동사' },
        ],
        longTalkPrompt: '당신이 가장 좋아하는 최애 장소(go-to place)와 그곳에서 어떻게 에너지를 재충전하는지 2~3문장으로 말해 보세요.',
      },
      advanced: {
        levelName: '🌳 고급 (실전 속도 1.0x+ & 세련된 뉘앙스·긴 대화 토론)',
        targetSpeed: 1.0,
        focusBadge: 'What절 강조 구문 & 자기계발 철학 긴 호흡 프리토킹',
        patternEn: 'What I love most about this habit / is that it broadens my perspective.',
        patternIpa: '/wɒt aɪ lʌv məʊst əˈbaʊt ðɪs ˈhæb.ɪt ɪz ðæt ɪt ˈbrɔː.dənz maɪ pəˈspek.tɪv/',
        patternPron: '[와-라이 러브 모스트 어바웃 디스 해빗 / 이즈 대-릿 브로-든즈 마이 퍼-스펙티브]',
        patternSoundBlock: 'What I love most / about this habit / is that / it broadens my perspective.',
        patternMeaningKo: '이 습관에서 제가 가장 좋아하는 점은 저의 시야와 관점을 넓혀준다는 것입니다.',
        levelGuide: '고급에서는 단순한 사실 나열을 넘어, 그 루틴이 내 삶에 주는 가치(productive, immersive, consistency, perspective)를 깊이 있게 풀어내는 5분 이상의 긴 대화를 훈련합니다.',
        paraphraseDrill: [
          { basicExpr: 'good study time', upgradedExpr: 'a highly productive and immersive routine', nuanceDiff: '생산적이고 몰입감 넘치는 고밀도 자기계발 시간' },
          { basicExpr: 'without a plan', upgradedExpr: 'spontaneously', nuanceDiff: '즉흥적이고 자발적으로 훌쩍 실행하는 고급 부사' },
        ],
        longTalkPrompt: '[5~30분 AI 프리토킹 주제] 바쁜 일상 속에서 일과 삶의 균형(Work-Life Balance)을 지키고 꾸준히 자기계발(consistency)을 이어가는 당신만의 노하우를 이야기해 보세요.',
      },
    },
    pattern: {
      en: 'What I love most about ~ is that ~',
      ipa: '/wɒt aɪ lʌv məʊst əˈbaʊt ~ ɪz ðæt ~/',
      soundBlock: 'What I love most / about this routine / is that ~',
      soundMethod:
        'What I는 연음하여 [와-라이]로 부드럽게 굴려주고, love와 most에 강한 강세를 실어 감정을 풍부하게 표현합니다.',
      pron: '[와-라이 러브 모스트 / 어바웃 ~ / 이즈 댓 ~]',
      nuance:
        '단순히 "I like ~"라고 말하는 대신, "~에 대해 내가 가장 좋아하는 점은 바로 ~라는 것입니다"라며 집중도를 확 끌어올리는 패턴입니다.',
      opicApplication:
        '초급자도 이 틀만 외우면 중·고급 문장으로 자연스럽게 말을 길게 이어갈 수 있습니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'unwind',
        masked: 'u ⬛ w ⬛ nd',
        ipa: '/ʌnˈwaɪnd/',
        pron: '[언-와인드]',
        soundMethod: '뒤쪽 -wind를 [윈드]가 아닌 이중모음 [와인드/waɪnd/]로 길게 발음하는 것이 핵심입니다.',
        soundBlock: 'unwind / after work',
        meaning: '(긴장·피로를) 풀다, 편히 쉬다',
        enDef: '1. verb to relax and allow your mind to be free from worry after a period of work',
        exampleBlank: 'Listening to music helps me ______ after a busy day.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '하루의 긴장과 스트레스를 해소하는 자동사 역할',
        collocation: 'unwind on the weekend',
        collocationKo: '주말에 긴장을 풀고 여유를 즐기다',
        paraphraseTip: '[초급➔중급 변환] relax 대신 쓰면 즉시 원어민 느낌이 살아납니다.',
      },
      {
        id: 2,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'go-to',
        masked: 'g ⬛ - t ⬛',
        ipa: '/ˈɡəʊ.tuː/',
        pron: '[고-투]',
        soundMethod: 'go에 강세를 주어 탄력 있게 [고-투]로 붙여 발음합니다.',
        soundBlock: 'my go-to / coffee shop',
        meaning: '언제나 믿고 찾는 단골의, 최애의',
        enDef: '1. adjective regularly chosen or relied on as the best option',
        exampleBlank: 'This quiet lounge is my ______ spot for studying.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '소유격(my)과 명사(place/food) 사이에서 명사를 꾸미는 수식어',
        collocation: 'my go-to comfort food',
        collocationKo: '내가 늘 찾는 최애 소울푸드',
        paraphraseTip: '[초급➔중급 변환] my favorite place ➔ my go-to place',
      },
      {
        id: 3,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'clear my head',
        masked: 'cl ⬛ ar my h ⬛ ad',
        ipa: '/klɪər maɪ hed/',
        pron: '[클리어 마이 헤드]',
        soundMethod: 'clear와 head 두 단어에 강세를 두어 상쾌한 느낌으로 발음합니다.',
        soundBlock: 'go for a walk / to clear my head',
        meaning: '복잡한 머리를 식히다, 기분 전환하다',
        enDef: '1. idiom to free one’s mind from confusion or stress so one can think clearly',
        exampleBlank: 'I usually take an evening walk to ______.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '산책이나 취미 활동을 하는 목적을 생생하게 묘사하는 표현',
        collocation: 'get some fresh air and clear my head',
        collocationKo: '찬 바람 쐬며 복잡한 머리를 식히다',
        paraphraseTip: '[초급 필수] forget stress 대신 쓰는 자연스러운 일상 표현',
      },
      {
        id: 4,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'stick to',
        masked: 'st ⬛ ck  t ⬛',
        ipa: '/stɪk tuː/',
        pron: '[스틱 투]',
        soundMethod: 's 뒤의 t는 된소리 [ㄸ]로 [스띡-투]처럼 단단하게 발음합니다.',
        soundBlock: 'stick to / my daily routine',
        meaning: '(계획·습관을) 포기하지 않고 꾸준히 지키다',
        enDef: '1. phrasal verb to continue doing or using something faithfully without changing',
        exampleBlank: 'I try hard to ______ my daily English study routine.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '뒤에 명사 목적어(routine/plan)를 취해 꾸준함을 강조함',
        collocation: 'stick to a healthy routine',
        collocationKo: '건강한 루틴을 꾸준히 유지하다',
        paraphraseTip: '[중급 바꿔말하기] keep my plan ➔ stick to my routine',
      },
      {
        id: 5,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'recharge my batteries',
        masked: 'rech ⬛ rge my b ⬛ tteries',
        ipa: '/ˌriːˈtʃɑːdʒ maɪ ˈbæt.ər.iz/',
        pron: '[리-차지 마이 배러리즈]',
        soundMethod: 'batteries의 tt는 모음 사이에서 부드러운 플랩 [ㄹ]로 발음하여 [배러리즈]로 소리 냅니다.',
        soundBlock: 'helps me / recharge my batteries',
        meaning: '에너지를 재충전하다, 활력을 되찾다',
        enDef: '1. idiom to rest and relax in order to regain energy and strength',
        exampleBlank: 'Spending time with my family helps me ______.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'OC',
        compLabel: '목적격보어 (OC)',
        roleDesc: '준사역동사 help 뒤에서 목적격보어로 자주 쓰이는 관용구',
        collocation: 'fully recharge my batteries',
        collocationKo: '지친 에너지를 100% 재충전하다',
        paraphraseTip: '[중급 핵심] take a rest보다 활력 회복의 뉘앙스가 훨씬 생생합니다.',
      },
      {
        id: 6,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'perspective',
        masked: 'pe ⬛ sp ⬛ ctive',
        ipa: '/pəˈspek.tɪv/',
        pron: '[퍼-스펙티브]',
        soundMethod: '중간 -spec-에 강세를 실어 또렷하게 발음합니다.',
        soundBlock: 'from my / personal perspective',
        meaning: '관점, 시각, 시야',
        enDef: '1. noun a particular attitude toward or way of regarding something; a point of view',
        exampleBlank: 'Reading books broadens my ______ on global issues.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '동사 broaden의 목적어 또는 전치사구(from my perspective)로 활약',
        collocation: 'broaden my perspective',
        collocationKo: '나의 시야와 관점을 넓히다',
        paraphraseTip: '[고급 변환] In my opinion ➔ From my perspective',
      },
      {
        id: 7,
        type: '고급/실무',
        recommendLevel: 'intermediate',
        word: 'productive',
        masked: 'pr ⬛ d ⬛ ctive',
        ipa: '/prəˈdʌk.tɪv/',
        pron: '[프러-덕티브]',
        soundMethod: '첫 음절은 힘 뺀 [프러], 두 번째 -duc-에 강한 강세를 줍니다.',
        soundBlock: 'a highly / productive day',
        meaning: '생산적인, 알찬, 결실 있는',
        enDef: '1. adjective achieving or producing a significant amount or result',
        exampleBlank: 'Using split-view on my tablet makes my study time very ______.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'OC',
        compLabel: '목적격보어 (OC)',
        roleDesc: '5형식 동사 make 뒤에서 목적어(study time)의 상태를 설명함',
        collocation: 'make the most productive use of time',
        collocationKo: '시간을 가장 생산적으로 활용하다',
        paraphraseTip: '[중·고급] a good day 대신 a productive day로 표현력을 높이세요.',
      },
      {
        id: 8,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'consistency',
        masked: 'co ⬛ s ⬛ stency',
        ipa: '/kənˈsɪs.tən.si/',
        pron: '[컨-시스턴시]',
        soundMethod: '-sis- 음절에 강세를 두고 전후 모음은 약모음으로 가볍게 처리합니다.',
        soundBlock: 'consistency / is the key',
        meaning: '일관성, 한결같음, 꾸준함',
        enDef: '1. noun steadfast adherence to the same principles or course',
        exampleBlank: '______ is the most important factor in mastering a language.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '문장 맨 앞 주어(S) 자리에서 핵심 가치를 나타내는 추상명사',
        collocation: 'maintain daily consistency',
        collocationKo: '매일 꾸준한 일관성을 유지하다',
        paraphraseTip: '[고급 명사] 꾸준히 하는 힘을 한 단어로 표현하는 고급 추상명사',
      },
      {
        id: 9,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'immersive',
        masked: 'im ⬛ e ⬛ sive',
        ipa: '/ɪˈmɜː.sɪv/',
        pron: '[이-머시브]',
        soundMethod: '-mer-에 강세를 두고 혀를 부드럽게 말며 깊이 있는 소리를 냅니다.',
        soundBlock: 'an immersive / learning experience',
        meaning: '몰입감 넘치는, 깊숙이 빠져드는',
        enDef: '1. adjective generating a deeply engaging environment',
        exampleBlank: 'Watching movies with great sound provides an ______ experience.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(experience/sound) 앞에서 몰입도 높은 성질을 꾸며줌',
        collocation: 'an immersive audio and visual experience',
        collocationKo: '몰입감 넘치는 시청각 경험',
        paraphraseTip: '[고급 형용사] fun or exciting을 넘어 완전히 몰입되는 상태를 묘사',
      },
      {
        id: 10,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'spontaneously',
        masked: 'sp ⬛ nt ⬛ neously',
        ipa: '/spɒnˈteɪ.ni.əs.li/',
        pron: '[스판-테이니어슬리]',
        soundMethod: '-ta- 음절에 강한 악센트를 주어 리듬을 타듯 발음합니다.',
        soundBlock: 'decided / spontaneously',
        meaning: '즉흥적으로, 계획 없이 자발적으로',
        enDef: '1. adverb in a sudden, impulsive, and unplanned manner',
        exampleBlank: 'We ______ decided to go for a drive to the coast.',
        pos: 'Adv',
        posLabel: '부사 (Adverb)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '동사(decided)를 꾸며 계획 없이 즉흥적으로 행동했음을 나타냄',
        collocation: 'take a trip spontaneously',
        collocationKo: '즉흥적으로 훌쩍 여행을 떠나다',
        paraphraseTip: '[고급 부사] without planning을 한 단어로 격조 높게 표현',
      },
    ],
    synonymScale: {
      baseWord: 'relax / habit (일상 휴식·습관 강세 비교)',
      pos: '동사·관용구 뉘앙스 스케일',
      meaning: '스트레스를 풀고 루틴을 유지하는 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'rejuvenate / unwavering consistency', ipa: '/rɪˈdʒuː.vən.eɪt/', nuance: '완전히 활력을 되살리다 / 흔들림 없는 일관성' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'recharge my batteries / unwind', ipa: '/ʌnˈwaɪnd/', nuance: '팽팽했던 긴장을 풀고 에너지를 꽉 채우다 (중·고급 핵심)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'relax / keep a routine', ipa: '/rɪˈlæks/', nuance: '편안히 쉬다 / 루틴을 유지하다 (초급 기본)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'chill out / take it easy', ipa: '/tʃɪl aʊt/', nuance: '가볍게 힘 빼고 쉬다 (구어 슬랭)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        levelTag: 'beginner',
        tag: '🌱 [초급] 기본 표현 & 느린 발음 훈련',
        targetWord: 'clear my head & unwind',
        wordOrderFormula: '[주어(I)] + [빈도부사(usually)] + [동사(take a walk)] + [목적수식어(to clear my head and unwind)]',
        structure: '주어(S) + 수식어(M) + 동사(V) + 목적어(DO) + 목적 수식어(M)',
        soundBlockEn: 'I usually / take a walk / in the evening / to clear my head.',
        soundMethodGuide: '0.75배속으로 take a walk[테이-커 워크] 연음을 천천히 따라 읽어보세요.',
        ipaLine: '/aɪ ˈjuː.ʒu.ə.li teɪk ə wɔːk ɪn ði ˈiːv.nɪŋ tə klɪər maɪ hed/',
        koLine: '나는 보통(S+M) / 산책을 합니다(V+DO) / 저녁에(M) / 복잡한 머리를 식히기 위해(M).',
        enLine: 'I usually(S+M) / take a walk(V+DO) / in the evening(M) / to [clear my head](M).',
        rawEn: 'I usually take a walk in the evening to clear my head.',
        pronLine: '[아이 유주얼리 / 테이-커 워크 / 인 디 이브닝 / 투 클리어 마이 헤드]',
        naturalKo: '저는 보통 저녁에 복잡한 머리를 식히려고 산책을 합니다.',
        paraphraseVersion: 'Going for an evening stroll helps me unwind after work.',
        grammarPoint: '빈도부사 usually는 일반동사(take) 바로 앞에 위치하며, to clear my head는 목적(~하기 위해)을 나타냅니다.',
        contextNuance: '누구나 쉽게 입을 뗄 수 있는 가장 자연스러운 일상 루틴 첫 문장입니다.',
      },
      {
        id: 2,
        levelTag: 'intermediate',
        tag: '🌿 [중급] 상황별 대화 & 바꿔 말하기 훈련',
        targetWord: 'go-to & recharge my batteries',
        wordOrderFormula: '[주어(This park)] + [동사(is)] + [보어(my go-to place)] + [수식어(to unwind and recharge my batteries)]',
        structure: '주어(S) + 동사(V) + 주격보어(SC) + 수식어(M)',
        soundBlockEn: 'This neighborhood park / is my go-to place / to unwind / and recharge my batteries.',
        soundMethodGuide: 'go-to와 recharge에 강세를 두고 리듬감 있게 읽어보세요.',
        ipaLine: '/ðɪs ˈneɪ.bə.hʊd pɑːk ɪz maɪ ˈɡəʊ.tuː pleɪs tu ʌnˈwaɪnd ænd ˌriːˈtʃɑːdʒ maɪ ˈbæt.ər.iz/',
        koLine: '이 동네 공원은(S) / 나의 최애 장소입니다(V+SC) / 긴장을 풀고 에너지를 재충전하기 위한(M).',
        enLine: 'This neighborhood park(S) / is my [go-to] place(V+SC) / to [unwind] and [recharge my batteries](M).',
        rawEn: 'This neighborhood park is my go-to place to unwind and recharge my batteries.',
        pronLine: '[디스 네이버훗 파크 / 이즈 마이 고-투 플레이스 / 투 언-와인드 / 앤 리-차지 마이 배러리즈]',
        naturalKo: '이 동네 공원은 제가 긴장을 풀고 에너지를 재충전할 때 늘 찾는 최애 장소입니다.',
        paraphraseVersion: 'Whenever I need to destress, this local park is my favorite spot.',
        grammarPoint: '명사 my go-to place(SC) 뒤에 to부정사구(to unwind ~)가 붙어 어떤 장소인지 꾸며주는 형용사적 수식어(M) 역할을 합니다.',
        contextNuance: '초급의 "favorite place to rest"를 완벽한 네이티브 표현으로 바꿔 말한 문장입니다.',
      },
      {
        id: 3,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 5형식 구문 ①',
        targetWord: 'productive & immersive',
        wordOrderFormula: '[동명사주어(Studying on my iPad)] + [동사(makes)] + [목적어(my daily routine)] + [목적격보어(productive and immersive)]',
        structure: '동명사구 주어(S) + 5형식 동사(V) + 목적어(DO) + 형용사 목적격보어(OC)',
        soundBlockEn: 'Studying on my iPad / makes my daily routine / highly productive / and immersive.',
        soundMethodGuide: 'productive의 -duc-와 immersive의 -mer-에 강세를 실어 지적인 톤으로 발음합니다.',
        ipaLine: '/ˈstʌd.i.ɪŋ ɒn maɪ ˈaɪ.pæd meɪks maɪ ˈdeɪ.li ruːˈtiːn ˈhaɪ.li prəˈdʌk.tɪv ænd ɪˈmɜː.sɪv/',
        koLine: '아이패드로 공부하는 것은(S) / 만듭니다(V) / 나의 일일 루틴을(DO) / 매우 생산적이고 몰입감 넘치게(OC).',
        enLine: 'Studying on my iPad(S) / makes(V) / my daily routine(DO) / highly [productive] and [immersive](OC).',
        rawEn: 'Studying on my iPad makes my daily routine highly productive and immersive.',
        pronLine: '[스터디잉 온 마이 아이패드 / 메익스 마이 데일리 루-틴 / 하일리 프러-덕티브 / 앤 이-머시브]',
        naturalKo: '아이패드로 공부하는 습관은 저의 하루 일과를 매우 생산적이고 몰입감 넘치게 만들어 줍니다.',
        paraphraseVersion: 'What I love most about studying on my tablet is that it keeps me deeply focused and efficient.',
        grammarPoint: '5형식 make 동사의 목적격보어(OC) 자리에는 부사가 아닌 형용사(productive, immersive)가 와야 합니다.',
        contextNuance: '자기계발이나 디지털 학습 환경을 수준 높게 묘사할 때 쓰입니다.',
      },
      {
        id: 4,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 긴 대화 토론 ②',
        targetWord: 'stick to & consistency & perspective',
        wordOrderFormula: '[주어(I)] + [동사(stick to)] + [목적어(this habit)] + [이유절(because consistency broadens my perspective)]',
        structure: '주어(S) + 동사(V) + 목적어(DO) + 이유 부사절 수식어(M)',
        soundBlockEn: 'I try to stick to / this habit / because consistency / broadens my perspective.',
        soundMethodGuide: 'stick to를 [스띡-투]로 묶고, consistency와 perspective에 강세를 두어 마무리합니다.',
        ipaLine: '/aɪ traɪ tə stɪk tu ðɪs ˈhæb.ɪt bɪˈkɒz kənˈsɪs.tən.si ˈbrɔː.dənz maɪ pəˈspek.tɪv/',
        koLine: '나는 꾸준히 지키려 노력합니다(S+V) / 이 습관을(DO) / 꾸준함이 나의 시야를 넓혀주기 때문입니다(M).',
        enLine: 'I try to [stick to](S+V) / this habit(DO) / because [consistency] broadens my [perspective](M).',
        rawEn: 'I try to stick to this habit because consistency broadens my perspective.',
        pronLine: '[아이 트라이 투 스띡-투 / 디스 해빗 / 비커즈 컨-시스턴시 / 브로-든즈 마이 퍼-스펙티브]',
        naturalKo: '꾸준함이 저의 시야를 넓혀주기 때문에 저는 이 습관을 한결같이 지키려고 노력합니다.',
        paraphraseVersion: 'Maintaining daily consistency is essential to me as it gives me a wider view of the world.',
        grammarPoint: '접속사 because 뒤에 추상명사 주어 consistency(S) + 타동사 broadens(V) + 목적어 my perspective(DO)가 완전한 절로 이어집니다.',
        contextNuance: '오픽이나 영어 인터뷰에서 자신의 가치관을 보여줄 수 있는 만점 마무리 문장입니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'unwind',
        ipa: '/ʌnˈwaɪnd/',
        options: ['바람이 강하게 불다', '일정을 앞당기다', '(긴장·피로를) 풀다, 쉬다', '법률을 위반하다'],
        answerIdx: 2,
        explanation: 'unwind는 감겨 있던 태엽을 풀듯 긴장과 피로를 풀고 휴식한다는 뜻의 핵심 동사입니다.',
      },
      intermediate: {
        sentenceBefore: 'This quiet cafe is my',
        sentenceAfter: 'place whenever I study English.',
        hint: '내가 공부할 때마다 언제나 믿고 찾는 "최애 단골" 장소를 뜻하는 형용사입니다.',
        options: ['go-to', 'lawless', 'tentative', 'vacant'],
        answerIdx: 0,
        explanation: '명사 place 앞에서 "늘 믿고 찾는 단골의/최애의"라는 뜻을 더해주는 표현은 go-to입니다.',
      },
      advanced: {
        sentenceBefore: 'Taking a walk in the park helps me',
        highlightWord: 'unwind',
        sentenceAfter: 'after work.',
        options: ['relax', 'destress', 'complicate'],
        answerIndices: [0, 1],
        explanation: '퇴근 후 긴장을 푼다는 문맥이므로 relax(쉬다), destress(스트레스를 풀다)가 복수 정답입니다.',
      },
      writingMission: {
        koPrompt: '내가 주말에 대해 가장 좋아하는 점은 에너지를 재충전할 수 있다는 것입니다.',
        wordOrderHint: '[패턴: What I love most about weekends] + [동사: is] + [보어절: that I can recharge my batteries]',
        hint: 'What I love most about weekends / is that / I can recharge my batteries.',
        modelAnswer: 'What I love most about weekends is that I can recharge my batteries.',
        checkPoint:
          'What I love most about ~ 절 전체가 주어(S)가 되며, is that 뒤에 주어+동사(I can recharge my batteries)를 연결합니다.',
      },
    },
  },

  // --------------------------------------------------------------------------
  // THEME 3: 해외여행 공항 라운지 & 호텔 컨시어지 (초·중·고급 단계별 완비)
  // --------------------------------------------------------------------------
  {
    id: 'travel-concierge',
    title: '✈️ 해외여행 공항 라운지 & 호텔 컨시어지',
    badge: '여행 필수 · 초급 생존~고급 컨시어지',
    dateLabel: '오늘의 글로벌 코스 · 공항 & 호텔',
    opicLevel: '초급(체크인·짐보관) ➔ 중급(상황별 요청) ➔ 고급(품격있는 업그레이드)',
    coachPoint:
      '말씀하신 대로 여행 주제를 3단계로 나누었습니다! 초급은 공항·호텔 데스크에서 바로 통하는 기본 생존 표현(Can we drop off ~?), 중급은 상황별 바꿔 말하기, 고급은 호텔리어가 가장 대우해 주는 최상급 격식 표현(Would it be possible to accommodate ~?)으로 이어집니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [요청 패턴 (Can we ~ / Would it be possible to ~)] + [핵심 동사(V)] + [목적어(DO)] + [시간·장소 수식어(M)]',
    grammarSummary:
      '초급은 조동사 Can/Could, 중급은 원어민 구동사(drop off, freshen up)와 정중한 희망(would like to), 고급은 가주어·진주어(Would it be possible to V) 구문을 사용합니다.',
    situationGuide:
      '공항 체크인 카운터, 환승 라운지, 호텔 벨데스크 짐 보관, 객실 뷰 변경 및 레이트 체크아웃 요청까지 여행의 모든 순간에 즉시 꺼내 쓸 수 있습니다.',
    levelTracks: {
      beginner: {
        levelName: '🌱 초급 (느린 발음 0.75x & 한글 뜻·발음 기본 도움)',
        targetSpeed: 0.75,
        focusBadge: '공항·호텔 데스크에서 바로 통하는 3초 생존 표현',
        patternEn: 'Can we drop off / our bags / before check-in?',
        patternIpa: '/kæn wi drɒp ɒf aʊər bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
        patternPron: '[캔 위 드라-포프 / 아워 백즈 / 비포 체-킨?]',
        patternSoundBlock: 'Can we drop off / our bags / before check-in?',
        patternMeaningKo: '체크인 전에 저희 가방을 먼저 맡길 수 있을까요?',
        levelGuide: '초급에서는 복잡한 문법 없이 "Can we check in?(체크인할 수 있나요?)", "Can we drop off our bags?(가방을 맡길 수 있나요?)" 두 문장만 천천히 또렷하게 말해도 호텔 이용이 완벽히 해결됩니다.',
        paraphraseDrill: [
          { basicExpr: 'leave our bags (가방을 두다)', upgradedExpr: 'drop off our luggage', nuanceDiff: '벨데스크에 짐을 맡겨두다는 가장 자연스러운 구동사' },
          { basicExpr: 'wash my face (세수하다)', upgradedExpr: 'freshen up', nuanceDiff: '비행이나 이동 후 간단히 씻고 재정비하다는 세련된 표현' },
        ],
        longTalkPrompt: '호텔 프런트 직원에게 체크인 전에 가방을 먼저 맡길 수 있는지 한 문장으로 물어보세요.',
      },
      intermediate: {
        levelName: '🌿 중급 (듣기 집중 0.90x & 상황별 바꿔 말하기 훈련)',
        targetSpeed: 0.9,
        focusBadge: '공항·호텔 안내방송 리스닝 & 상황별 정중한 바꿔 말하기',
        patternEn: 'We would like to freshen up / before heading out / for dinner.',
        patternIpa: '/wi wʊd laɪk tə ˈfreʃ.ən ʌp bɪˈfɔːr ˈhed.ɪŋ aʊt fɔːr ˈdɪn.ər/',
        patternPron: '[위 우드 라익 투 프레-셔넙 / 비포 헤딩 아웃 / 포 디너]',
        patternSoundBlock: 'We would like to / freshen up / before heading out / for dinner.',
        patternMeaningKo: '저녁 먹으러 나가기 전에 방에서 간단히 씻고 재정비하고 싶습니다.',
        levelGuide: '중급에서는 "want to" 대신 정중한 "would like to"를 쓰고, 여행 필수 어휘(carry-on, layover, itinerary, vacant)를 활용해 공항과 호텔의 다양한 상황에 대처합니다.',
        paraphraseDrill: [
          { basicExpr: 'free breakfast (공짜 조식)', upgradedExpr: 'complimentary breakfast', nuanceDiff: '호텔·항공사에서 공식 제공하는 품격 있는 무료 혜택' },
          { basicExpr: 'empty room (빈방)', upgradedExpr: 'vacant ocean-view room', nuanceDiff: '현재 투숙객이 없어 바로 배정 가능한 빈 객실' },
          { basicExpr: 'travel plan (여행 계획)', upgradedExpr: 'updated travel itinerary', nuanceDiff: '항공편과 숙소 동선이 담긴 상세 여행 일정표' },
        ],
        longTalkPrompt: '3시간의 경유 대기 시간(layover) 동안 라운지에서 간단히 씻고 재정비(freshen up)하고 싶다고 말해 보세요.',
      },
      advanced: {
        levelName: '🌳 고급 (실전 속도 1.0x+ & 컨시어지 협상·긴 대화)',
        targetSpeed: 1.0,
        focusBadge: '호텔 매니저도 감탄하는 VIP 컨시어지 요청 & 돌발 상황 해결',
        patternEn: 'Would it be possible to accommodate / a complimentary late check-out?',
        patternIpa: '/wʊd ɪt bi ˈpɒs.ə.bəl tu əˈkɒm.ə.deɪt ə ˌkɒm.plɪˈmen.tər.i leɪt ˈtʃek.aʊt/',
        patternPron: '[우-딧 비 파-서블 / 투 어-카머데이트 / 어 캄플리-멘터리 레이트 체-카웃?]',
        patternSoundBlock: 'Would it be possible / to accommodate / a complimentary late check-out?',
        patternMeaningKo: '혹시 무료 레이트 체크아웃으로 배려해 주시는 것이 가능할까요?',
        levelGuide: '고급에서는 "Would it be possible to ~?" 패턴과 고급 어휘(accommodate, complimentary, amenities)를 결합하여 룸 업그레이드나 예약 문제 해결 등 긴 호흡의 협상 대화를 구사합니다.',
        paraphraseDrill: [
          { basicExpr: 'Can you help my request?', upgradedExpr: 'Would it be possible to accommodate my special request?', nuanceDiff: '상대방의 재량을 최대한 존중하며 특별 배려를 이끌어내는 최상급 표현' },
          { basicExpr: 'hotel facilities', upgradedExpr: 'resort amenities and concierge service', nuanceDiff: '수영장·스파·라운지 등 호텔이 제공하는 모든 고급 부대시설과 비품' },
        ],
        longTalkPrompt: '[5~30분 AI 롤플레이 주제] 기념일 여행으로 호텔에 도착했습니다. 리셉션 매니저에게 비어 있는(vacant) 고층 오션뷰 객실로의 업그레이드와 오후 2시 무료 레이트 체크아웃이 가능한지 정중하게 요청해 보세요.',
      },
    },
    pattern: {
      en: 'Would it be possible to get ~?',
      ipa: '/wʊd ɪt bi ˈpɒs.ə.bəl tə ɡet ~/',
      soundBlock: 'Would it be possible / to get / + 원하는 서비스?',
      soundMethod:
        'Would it은 연음하여 [우-딧]으로 가볍게 튕기고, possible의 첫 음절 [파-]에 가장 높은 음정과 강세를 둡니다.',
      pron: '[우-딧 비 파-서블 / 투 겟 ~?]',
      nuance:
        '데스크 직원에게 부담을 주지 않으면서 기분 좋은 미소와 함께 특별 배려나 업그레이드를 이끌어내는 마법의 호텔·공항 패턴입니다.',
      opicApplication:
        '여행 롤플레이 및 해외 출장 실전에서 가장 정중하고 확실한 결과를 만들어 냅니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'check in',
        masked: 'ch ⬛ ck  i ⬛',
        ipa: '/tʃek ɪn/',
        pron: '[체-킨]',
        soundMethod: 'check의 끝소리 k가 뒤 모음 in과 합쳐져 한 단어처럼 [체-킨]으로 연음됩니다.',
        soundBlock: 'check in / online in advance',
        meaning: '탑승 수속하다, 호텔에 입실 수속하다',
        enDef: '1. phrasal verb to register upon arrival at a hotel or airport',
        exampleBlank: 'How early can we ______ for the international flight?',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '공항이나 호텔 데스크에서 도착 등록을 하는 자동사구',
        collocation: 'check in online in advance',
        collocationKo: '사전에 온라인으로 체크인하다',
        paraphraseTip: '[초급 필수] 동사는 띄어 쓰고(check in), 명사는 하이픈(check-in)을 씁니다.',
      },
      {
        id: 2,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'carry-on',
        masked: 'c ⬛ rry-o ⬛',
        ipa: '/ˈkær.i.ɒn/',
        pron: '[캐-리온]',
        soundMethod: '첫 음절 car-에 강세를 두고 부드럽게 -on을 이어 붙입니다.',
        soundBlock: 'carry-on / luggage',
        meaning: '기내 반입용 수하물',
        enDef: '1. noun/adj a small bag or suitcase allowed in the aircraft cabin',
        exampleBlank: 'This compact bag fits easily in the ______ overhead bin.',
        pos: 'N',
        posLabel: '명사/형용사 (N)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '위탁 수하물(checked baggage)과 구분되는 기내 휴대 가방',
        collocation: 'carry-on baggage allowance',
        collocationKo: '기내 반입 수하물 허용 기준',
        paraphraseTip: '[초급➔중급] small bag for airplane ➔ carry-on luggage',
      },
      {
        id: 3,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'layover',
        masked: 'l ⬛ yo ⬛ er',
        ipa: '/ˈleɪ.əʊ.vər/',
        pron: '[레-이오버]',
        soundMethod: '앞쪽 lay-에 강세를 두고 over를 자연스럽게 연결합니다.',
        soundBlock: 'a three-hour / layover',
        meaning: '경유, 환승 대기 시간',
        enDef: '1. noun a short stay or stop between parts of an air journey',
        exampleBlank: 'We have a three-hour ______ before our connecting flight.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: 'have 동사의 직접목적어로 경유 대기 시간을 나타냄',
        collocation: 'during a short layover',
        collocationKo: '짧은 경유 환승 대기 시간 동안에',
        paraphraseTip: '[중급 핵심] waiting time at the airport를 한 단어로 표현!',
      },
      {
        id: 4,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'freshen up',
        masked: 'fr ⬛ sh ⬛ n  u ⬛',
        ipa: '/ˈfreʃ.ən ʌp/',
        pron: '[프레-셔넙]',
        soundMethod: 'freshen의 끝소리 n과 up이 연음되어 [프레-셔넙]으로 발음됩니다.',
        soundBlock: 'freshen up / in the room',
        meaning: '간단히 씻고 재정비하다',
        enDef: '1. phrasal verb to wash and make oneself look neat and fresh after traveling',
        exampleBlank: 'I would like to ______ in the lounge before boarding.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '장시간 이동 후 세수·샤워로 컨디션을 회복하는 동작',
        collocation: 'freshen up before dinner',
        collocationKo: '저녁 식사 전에 간단히 씻고 단장하다',
        paraphraseTip: '[중급 바꿔말하기] wash my face and hands ➔ freshen up',
      },
      {
        id: 5,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'drop off',
        masked: 'dr ⬛ p  o ⬛ f',
        ipa: '/drɒp ɒf/',
        pron: '[드라-포프]',
        soundMethod: 'drop의 끝 자음 p가 off와 이어져 [드라-포프]로 리듬감 있게 소리 납니다.',
        soundBlock: 'drop off / our luggage early',
        meaning: '(짐을) 먼저 맡기다, 내려주다',
        enDef: '1. phrasal verb to take someone or something to a place and leave them there',
        exampleBlank: 'Can we ______ our bags at the bell desk before check-in?',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '체크인 시간 전에 벨데스크에 짐을 먼저 보관 요청할 때 사용',
        collocation: 'drop off the luggage early',
        collocationKo: '짐을 일찍 먼저 맡겨두다',
        paraphraseTip: '[초급 필수] 호텔 벨데스크에서 가장 많이 쓰는 1순위 구동사',
      },
      {
        id: 6,
        type: '고급/실무',
        recommendLevel: 'intermediate',
        word: 'complimentary',
        masked: 'co ⬛ pl ⬛ mentary',
        ipa: '/ˌkɒm.plɪˈmen.tər.i/',
        pron: '[캄플리-멘터리]',
        soundMethod: '세 번째 음절 -men-에 주강세를 두고 뒤의 -tary는 [터리]로 가볍게 줄여 읽습니다.',
        soundBlock: 'complimentary / breakfast and water',
        meaning: '(호텔·항공에서) 무료로 제공되는',
        enDef: '1. adjective given or supplied free of charge as a courtesy',
        exampleBlank: 'Does our booking include ______ breakfast and lounge access?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: 'free보다 훨씬 격식 있게 무료 제공 혜택(조식·음료)을 수식함',
        collocation: 'complimentary late check-out',
        collocationKo: '무료 레이트 체크아웃 혜택',
        paraphraseTip: '[중·고급 변환] free 대신 쓰면 대우가 달라지는 호텔 표준어',
      },
      {
        id: 7,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'accommodate',
        masked: 'ac ⬛ o ⬛ modate',
        ipa: '/əˈkɒm.ə.deɪt/',
        pron: '[어-카머데이트]',
        soundMethod: '-com-에 강세를 두고 입을 크게 벌려 풍성한 소리를 냅니다.',
        soundBlock: 'accommodate / your special request',
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
        paraphraseTip: '[고급 핵심] accept or help를 대체하는 최고급 컨시어지 동사',
      },
      {
        id: 8,
        type: '고급/실무',
        recommendLevel: 'intermediate',
        word: 'itinerary',
        masked: 'it ⬛ n ⬛ rary',
        ipa: '/aɪˈtɪn.ər.ər.i/',
        pron: '[아이-티너러리]',
        soundMethod: '첫 글자 i를 [이]가 아닌 이중모음 [아이]로 시작하고 -tin-에 강세를 줍니다!',
        soundBlock: 'review / our travel itinerary',
        meaning: '상세 여행 일정표, 항공 여정',
        enDef: '1. noun a planned route or journey and schedule',
        exampleBlank: 'Please check your flight ______ and boarding gate.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '항공권 예약 확인서나 전체 여행 동선을 뜻하는 필수 명사',
        collocation: 'updated travel itinerary',
        collocationKo: '업데이트된 상세 여행 일정표',
        paraphraseTip: '[중·고급] travel schedule을 대체하는 글로벌 공항·호텔 표준 명사',
      },
      {
        id: 9,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'vacant',
        masked: 'v ⬛ c ⬛ nt',
        ipa: '/ˈveɪ.kənt/',
        pron: '[베-이컨트]',
        soundMethod: '첫 음절 va-를 [바]가 아닌 윗니로 아랫입술을 스치는 [베-이]로 발음합니다.',
        soundBlock: 'any vacant / ocean-view suites',
        meaning: '비어 있는, 이용 가능한(빈방·빈자리)',
        enDef: '1. adjective not occupied; empty and available',
        exampleBlank: 'Are there any ______ ocean-view rooms available tonight?',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '객실이나 좌석이 현재 비어 있어 배정 가능함을 나타냄',
        collocation: 'a vacant ocean-view room',
        collocationKo: '비어 있는 오션뷰 객실',
        paraphraseTip: '[고급 변환] empty room ➔ vacant room',
      },
      {
        id: 10,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'amenities',
        masked: 'am ⬛ n ⬛ ties',
        ipa: '/əˈmen.ə.tiz/',
        pron: '[어-메너티즈]',
        soundMethod: '두 번째 음절 -men-에 강세를 두고 끝은 부드럽게 [티즈]로 닫아줍니다.',
        soundBlock: 'enjoy / the hotel amenities',
        meaning: '호텔 부대시설 및 객실 편의용품',
        enDef: '1. plural noun desirable or useful features or facilities of a hotel or resort',
        exampleBlank: 'Guests can enjoy all the resort ______ including the infinity pool.',
        pos: 'N',
        posLabel: '복수명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '호텔이 제공하는 수영장·피트니스·세면도구 등 모든 편의 요소를 지칭',
        collocation: 'luxury hotel amenities',
        collocationKo: '고급 호텔 부대시설 및 어메니티',
        paraphraseTip: '[고급 명사] 호텔의 모든 시설과 비품을 아우르는 필수 어휘',
      },
    ],
    synonymScale: {
      baseWord: 'free / polite (호텔·항공 격식도 강세 비교)',
      pos: '여행·컨시어지 표현 뉘앙스 스케일',
      meaning: '초급 생존 표현에서 고급 VIP 표현으로의 격식 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'Would it be possible to accommodate ~', ipa: '/əˈkɒm.ə.deɪt/', nuance: '최상급 정중함으로 특별 배려를 요청하는 VIP 화법' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'complimentary / vacant suite', ipa: '/ˌkɒm.plɪˈmen.tər.i/', nuance: '품격 있는 공식 무료 혜택 및 빈 객실 문의 (중·고급)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'Could we drop off / freshen up', ipa: '/drɒp ɒf/', nuance: '자연스럽고 예의 바른 일상 구동사 요청 (초·중급)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'Can I get free ~ / empty room', ipa: '/friː/', nuance: '의사소통은 되지만 다소 직설적인 기초 표현' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        levelTag: 'beginner',
        tag: '🌱 [초급] 기본 표현 & 느린 발음 훈련',
        targetWord: 'drop off & check in',
        wordOrderFormula: '[질문(Can we)] + [동사구(drop off)] + [목적어(our bags)] + [시간수식어(before we check in)]?',
        structure: '조동사 + 주어(S) + 동사(V) + 목적어(DO) + 시간 수식어(M)?',
        soundBlockEn: 'Can we drop off / our bags / before we check in?',
        soundMethodGuide: '0.75배속으로 drop off[드라-포프]와 check in[체-킨] 연음만 정확히 소리 내 보세요.',
        ipaLine: '/kæn wi drɒp ɒf aʊər bæɡz bɪˈfɔːr wi tʃek ɪn/',
        koLine: '우리가 먼저 맡길 수 있을까요(S+V) / 우리 가방들을(DO) / 우리가 체크인하기 전에(M)?',
        enLine: 'Can we [drop off](S+V) / our bags(DO) / before we [check in](M)?',
        rawEn: 'Can we drop off our bags before we check in?',
        pronLine: '[캔 위 드라-포프 / 아워 백즈 / 비포 위 체-킨↗]',
        naturalKo: '체크인하기 전에 저희 가방을 먼저 좀 맡길 수 있을까요?',
        paraphraseVersion: 'Would it be possible to leave our luggage at the bell desk early?',
        grammarPoint: '조동사 Can으로 시작하는 가장 직관적인 초급 의문문 어순(Can + 주어 + 동사원형 + 목적어)입니다.',
        contextNuance: '초보자도 호텔에 도착하자마자 부담 없이 바로 써먹을 수 있는 1순위 생존 문장입니다.',
      },
      {
        id: 2,
        levelTag: 'intermediate',
        tag: '🌿 [중급] 상황별 대화 & 바꿔 말하기 훈련',
        targetWord: 'freshen up & layover',
        wordOrderFormula: '[주어(We)] + [동사(would like to freshen up)] + [장소(in the lounge)] + [시간(during our layover)]',
        structure: '주어(S) + 동사구(V+O) + 장소 수식어(M) + 시간 수식어(M)',
        soundBlockEn: 'We would like to / freshen up / in the lounge / during our three-hour layover.',
        soundMethodGuide: 'freshen up을 [프레-셔넙]으로 부드럽게 잇고, layover에 또렷한 강세를 줍니다.',
        ipaLine: '/wi wʊd laɪk tə ˈfreʃ.ən ʌp ɪn ðə laʊndʒ ˈdjʊə.rɪŋ aʊər θriː ˈaʊər ˈleɪ.əʊ.vər/',
        koLine: '우리는 간단히 씻고 재정비하고 싶습니다(S+V) / 라운지에서(M) / 3시간의 경유 대기 동안에(M).',
        enLine: 'We would like to [freshen up](S+V) / in the lounge(M) / during our three-hour [layover](M).',
        rawEn: 'We would like to freshen up in the lounge during our three-hour layover.',
        pronLine: '[위 우드 라익 투 / 프레-셔넙 / 인 더 라운지 / 듀어링 아워 쓰리-아워 레-이오버]',
        naturalKo: '3시간 환승 대기하는 동안 라운지에서 간단히 씻고 재정비 좀 하고 싶습니다.',
        paraphraseVersion: 'We want to wash up and rest in the airport lounge while waiting for our connecting flight.',
        grammarPoint: '특정 기간 동안을 나타낼 때는 전치사 during + 명사구(our three-hour layover)를 사용합니다.',
        contextNuance: '공항 환승 카운터나 라운지 리셉션에서 아주 유용하게 쓰이는 중급 실전 문장입니다.',
      },
      {
        id: 3,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 컨시어지 협상 ①',
        targetWord: 'accommodate & complimentary',
        wordOrderFormula: '[정중질문(Would it be possible)] + [진주어(to accommodate)] + [목적어(a complimentary late check-out)] + [시간(until 2 PM)]?',
        structure: '조동사 + 가주어(It) + 동사(V) + 보어(SC) + 진주어(to V + DO + M)?',
        soundBlockEn: 'Would it be possible / to accommodate / a complimentary late check-out / until 2 PM?',
        soundMethodGuide: 'accommodate와 complimentary 두 고급 단어의 강세 음절(-com-, -men-)만 정확히 짚어주면 발음이 꼬이지 않습니다.',
        ipaLine: '/wʊd ɪt bi ˈpɒs.ə.bəl tu əˈkɒm.ə.deɪt ə ˌkɒm.plɪˈmen.tər.i leɪt ˈtʃek.aʊt ənˈtɪl tuː ˌpiːˈem/',
        koLine: '가능할까요(V+SC) / 배려해 주시는 것이(S) / 무료 레이트 체크아웃을(DO) / 오후 2시까지(M)?',
        enLine: 'Would it be possible(V+SC) / to [accommodate](S) / a [complimentary] late check-out(DO) / until 2 PM(M)?',
        rawEn: 'Would it be possible to accommodate a complimentary late check-out until 2 PM?',
        pronLine: '[우-딧 비 파-서블 / 투 어-카머데이트 / 어 캄플리-멘터리 레이트 체-카웃 / 언틸 투 피엠↗]',
        naturalKo: '혹시 오후 2시까지 무료 레이트 체크아웃으로 배려해 주실 수 있을까요?',
        paraphraseVersion: 'Could we possibly stay in the room until 2 PM without an extra charge?',
        grammarPoint: '가주어 it과 진주어 to accommodate를 결합하여 상대방에게 정중하게 가능 여부를 묻는 최고급 문형입니다.',
        contextNuance: '호텔리어들이 가장 대우해 주는 격식 있는 문장으로, 실제 무료 연장 성공률을 높여줍니다.',
      },
      {
        id: 4,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 긴 대화 토론 ②',
        targetWord: 'itinerary & amenities',
        wordOrderFormula: '[주어(The concierge)] + [동사(explained)] + [목적어1(our tour itinerary)] + [목적어2(and the hotel amenities)]',
        structure: '주어(S) + 동사(V) + 직접목적어 1(DO) + 접속사 + 직접목적어 2(DO)',
        soundBlockEn: 'The concierge / kindly explained / our tour itinerary / and the hotel amenities.',
        soundMethodGuide: 'itinerary는 [아이-티너러리], amenities는 [어-메너티즈]로 리듬감 있게 끊어 발음합니다.',
        ipaLine: '/ðə ˌkɒn.siˈeəʒ ˈkaɪnd.li ɪkˈspleɪnd aʊər tʊər aɪˈtɪn.ər.ər.i ænd ðə həʊˈtel əˈmen.ə.tiz/',
        koLine: '컨시어지 직원이(S) / 친절히 설명해 주었습니다(M+V) / 우리의 투어 일정표와(DO) / 호텔 편의시설들을(DO).',
        enLine: 'The concierge(S) / kindly explained(M+V) / our tour [itinerary](DO) / and the hotel [amenities](DO).',
        rawEn: 'The concierge kindly explained our tour itinerary and the hotel amenities.',
        pronLine: '[더 칸시-에어즈 / 카인들리 익스플레인드 / 아워 투어 아이-티너러리 / 앤 더 호텔 어-메너티즈]',
        naturalKo: '컨시어지 직원이 저희 투어 일정표와 호텔 부대시설 이용법을 친절히 안내해 주었습니다.',
        paraphraseVersion: 'The hotel staff gave us a detailed guide on our travel schedule and resort facilities.',
        grammarPoint: '3형식 타동사 explain은 목적어(DO) 두 개를 등위접속사 and로 나란히 병렬 연결하고 있습니다.',
        contextNuance: '여행 경험담에서 호텔 서비스가 얼마나 좋았는지 구체적으로 묘사할 때 빛을 발합니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'complimentary',
        ipa: '/ˌkɒm.plɪˈmen.tər.i/',
        options: ['불평이 많은', '(호텔·항공에서) 무료로 제공되는', '일시적으로 중단된', '매우 위험한'],
        answerIdx: 1,
        explanation: 'complimentary는 호텔 조식, 라운지, 웰컴 드링크 등이 무료 서비스로 제공될 때 쓰는 고급 형용사입니다.',
      },
      intermediate: {
        sentenceBefore: 'Can we',
        sentenceAfter: 'our bags at the bell desk before check-in?',
        hint: '체크인 전에 벨데스크에 가방을 먼저 맡겨두다(내려놓다)라는 뜻의 구동사입니다.',
        options: ['drop off', 'wrap up', 'unwind', 'lick'],
        answerIdx: 0,
        explanation: '짐이나 사람을 특정 장소에 맡기거나 내려줄 때는 drop off를 사용합니다.',
      },
      advanced: {
        sentenceBefore: 'We would be happy to',
        highlightWord: 'accommodate',
        sentenceAfter: 'your request for a quiet room.',
        options: ['fulfill', 'meet', 'reject'],
        answerIndices: [0, 1],
        explanation: '고객의 요청(request)을 수용하고 들어준다는 문맥이므로 fulfill(이행하다), meet(충족하다)이 복수 정답입니다.',
      },
      writingMission: {
        koPrompt: '혹시 높은 층의 조용한 방으로 배정받는 것이 가능할까요?',
        wordOrderHint: '[패턴: Would it be possible to get] + [목적어: a quiet room] + [장소수식어: on a higher floor]?',
        hint: 'Would it be possible to get / a quiet room / on a higher floor?',
        modelAnswer: 'Would it be possible to get a quiet room on a higher floor?',
        checkPoint:
          '건물의 층수를 나타낼 때는 표면 접촉의 전치사 on(on a higher floor)을 사용하여 앞의 명사 room을 수식(M)합니다.',
      },
    },
  },
];
// ============================================================================
// [3/4 파트] 테마 4~5 + 🎓수능·내신 1등급 마스터 DB(3대 반) + 실시간 동적 엔진 + 메인 UI
// ============================================================================

export const THEMES_PART2: ThemeData[] = [
  // --------------------------------------------------------------------------
  // THEME 4: 유튜브·인스타·숏폼 바이럴 & 네이티브 리액션
  // --------------------------------------------------------------------------
  {
    id: 'media-viral',
    title: '🔥 유튜브·인스타·숏폼 바이럴 & 네이티브 리액션',
    badge: 'SNS 실검 연동 · 초급 리액션~고급 비평',
    dateLabel: '오늘의 미디어 코스 · 트렌드 & 숏폼',
    opicLevel: '초급(공감·리액션) ➔ 중급(화제성 묘사) ➔ 고급(콘텐츠 비평·토론)',
    coachPoint:
      '유튜브, 인스타, 스레드, 틱톡에서 쏟아지는 화제의 콘텐츠를 말할 때 초급은 짧은 맞장구와 정주행 표현, 중급은 기대 이상(live up to the hype)의 후기 묘사, 고급은 대중적 울림(resonate)을 분석하는 비평 화법으로 확장합니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [감탄·평가 주어+동사 (It went viral / It lived up to the hype)] + [이유·방식 수식어(because / with ~)]',
    grammarSummary:
      '초급은 2형식 변화동사(go viral), 중급은 구동사+전치사 숙어(live up to the hype, keep an eye on), 고급은 감정의 원인과 영향력을 설명하는 이유 부사절(because it resonates with ~)을 구사합니다.',
    situationGuide:
      '화제의 유튜브 영상이나 스포츠 하이라이트 스몰톡, 새로 산 아이패드 리뷰, 넷플릭스 정주행 후기부터 미디어 트렌드 토론까지 완벽히 소화합니다.',
    levelTracks: {
      beginner: {
        levelName: '🌱 초급 (느린 발음 0.75x & 한글 뜻·발음 기본 도움)',
        targetSpeed: 0.75,
        focusBadge: '짧고 강렬한 원어민 리액션 & 주말 정주행 표현',
        patternEn: 'This short video / went viral / overnight!',
        patternIpa: '/ðɪs ʃɔːt ˈvɪd.i.əʊ went ˈvaɪ.rəl ˌəʊ.vəˈnaɪt/',
        patternPron: '[디스 쇼트 비디오 / 웬-바이럴 / 오버나잇!]',
        patternSoundBlock: 'This short video / went viral / overnight!',
        patternMeaningKo: '이 짧은 영상은 하룻밤 사이에 대유행했습니다!',
        levelGuide: '초급에서는 SNS에서 인기 폭발한 영상을 보고 "It went viral!(그거 대박 났어!)", 드라마를 몰아볼 때 "I binge-watched it!(정주행했어!)" 두 문장만 천천히 따라 해도 원어민과 대화가 통합니다.',
        paraphraseDrill: [
          { basicExpr: 'became very popular (인기 있게 되었다)', upgradedExpr: 'went viral overnight', nuanceDiff: '입소문을 타고 하룻밤 새 폭발적으로 퍼졌다는 SNS 필수 표현' },
          { basicExpr: 'watched all episodes (전편을 다 봤다)', upgradedExpr: 'binge-watched the whole series', nuanceDiff: '주말 내내 한꺼번에 몰아서 정주행했다는 생생한 동사' },
        ],
        longTalkPrompt: '최근 유튜브나 넷플릭스에서 몰아서 정주행(binge-watch)한 영상이 있다고 한 문장으로 말해 보세요.',
      },
      intermediate: {
        levelName: '🌿 중급 (듣기 집중 0.90x & 바꿔 말하기 훈련)',
        targetSpeed: 0.9,
        focusBadge: '소문난 맛집·신제품·콘텐츠 후기를 네이티브 이디엄으로 바꿔 말하기',
        patternEn: 'It definitely / lived up to the hype!',
        patternIpa: '/ɪt ˈdef.ɪ.nət.li lɪvd ʌp tə ðə haɪp/',
        patternPron: '[잇 데피닛리 / 리브-덥 투 더 하입!]',
        patternSoundBlock: 'It definitely / lived up / to the hype!',
        patternMeaningKo: '그건 정말 소문(기대)만큼 명불허전이었습니다!',
        levelGuide: '중급에서는 단순히 "It was really good as people said"라고 길게 설명하는 대신, "lived up to the hype(명불허전이다)"와 "hit the nail on the head(정곡을 찌르다)"로 세련되게 바꿔 말합니다.',
        paraphraseDrill: [
          { basicExpr: 'as good as the rumor (소문만큼 좋은)', upgradedExpr: 'lived up to the hype', nuanceDiff: '높은 기대치와 홍보(hype)에 100% 부응했다는 원어민 최애 표현' },
          { basicExpr: 'watch carefully (주의 깊게 보다)', upgradedExpr: 'keep a close eye on', nuanceDiff: '트렌드나 실시간 스코어를 놓치지 않고 눈여겨보다' },
          { basicExpr: 'you are exactly right (정확히 맞다)', upgradedExpr: 'you hit the nail on the head', nuanceDiff: '핵심 정곡을 정확히 짚어냈다는 극찬의 이디엄' },
        ],
        longTalkPrompt: '새로 산 아이패드나 최근 다녀온 핫플레이스가 소문만큼 정말 훌륭했다고(lived up to the hype) 2문장으로 말해 보세요.',
      },
      advanced: {
        levelName: '🌳 고급 (실전 속도 1.0x+ & 콘텐츠 비평·긴 대화 토론)',
        targetSpeed: 1.0,
        focusBadge: '작품의 매혹적인 연출과 대중적 공감대를 분석하는 고급 비평',
        patternEn: 'The captivating storyline / deeply resonated / with millions of viewers.',
        patternIpa: '/ðə ˈkæp.tɪ.veɪ.tɪŋ ˈstɔː.ri.laɪn ˈdiːp.li ˈrez.ən.eɪ.tɪd wɪð ˈmɪl.jənz əv ˈvjuː.əz/',
        patternPron: '[더 캡-티베이팅 스토리라인 / 디플리 레-저네이티드 / 위드 밀리언즈 오브 뷰어즈]',
        patternSoundBlock: 'The captivating storyline / deeply resonated / with millions of viewers.',
        patternMeaningKo: '그 매혹적인 스토리라인은 수백만 시청자들에게 깊은 울림과 공감을 주었습니다.',
        levelGuide: '고급에서는 콘텐츠가 왜 성공했는지 분석할 때 captivating(매혹적인), phenomenal(경이로운), informative(유익한), resonate(공감을 불러일으키다)를 결합해 깊이 있는 평론을 전개합니다.',
        paraphraseDrill: [
          { basicExpr: 'touched people’s hearts', upgradedExpr: 'deeply resonated with the audience', nuanceDiff: '단순 감동을 넘어 사람들의 내면에 깊은 공명과 울림을 주다' },
          { basicExpr: 'very exciting and useful', upgradedExpr: 'both captivating and highly informative', nuanceDiff: '눈을 뗄 수 없이 매력적이면서도 유익한 정보가 가득한' },
        ],
        longTalkPrompt: '[5~30분 AI 토론 주제] 최근 당신의 마음을 사로잡은(captivating) 영화, 음악, 혹은 유튜브 채널을 소개하고, 왜 그 콘텐츠가 사람들에게 깊은 공감(resonate)을 주는지 이야기해 보세요.',
      },
    },
    pattern: {
      en: 'It really lived up to the hype!',
      ipa: '/ɪt ˈrɪə.li lɪvd ʌp tə ðə haɪp/',
      soundBlock: 'It really / lived up / to the hype!',
      soundMethod:
        'lived up은 연음하여 [리브-덥]으로 묶고, 마지막 핵심 명사 hype(/haɪp/)에 강하고 높은 강세를 실어 감탄하듯 발음합니다.',
      pron: '[잇 리얼리 / 리브-덥 / 투 더 하입!]',
      nuance:
        '엄청나게 화제가 된 맛집, 영화, 신제품을 직접 경험해 보니 "소문대로 진짜 명불허전이더라!"라고 극찬할 때 쓰는 원어민 1순위 표현입니다.',
      opicApplication:
        '기억에 남는 영화, 공연, 새로 산 기기, 맛집 후기의 마침표로 쓰면 만점을 받습니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'go viral',
        masked: 'g ⬛  v ⬛ ral',
        ipa: '/ɡəʊ ˈvaɪ.rəl/',
        pron: '[고- 바이럴]',
        soundMethod: 'viral의 첫 음절 vi-를 [비]가 아닌 이중모음 [바이]로 발음하는 것에 주의하세요!',
        soundBlock: 'went viral / overnight',
        meaning: '(영상·이슈가) 입소문을 타고 대유행하다',
        enDef: '1. idiom to spread rapidly and widely on the internet through social media',
        exampleBlank: 'The short clip ______ on YouTube Shorts within hours.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '2형식 변화동사 go 뒤에 형용사 보어 viral이 결합한 서술어 블록',
        collocation: 'go viral overnight',
        collocationKo: '하룻밤 사이에 폭발적인 화제가 되다',
        paraphraseTip: '[초급 필수] become super popular on SNS를 대체하는 표현',
      },
      {
        id: 2,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'binge-watch',
        masked: 'b ⬛ nge-w ⬛ tch',
        ipa: '/ˈbɪndʒ.wɒtʃ/',
        pron: '[빈지-워치]',
        soundMethod: 'binge(/bɪndʒ/)에 강세를 두고 watch를 리듬감 있게 붙여 발음합니다.',
        soundBlock: 'binge-watch / the entire series',
        meaning: '(드라마·영화를) 몰아서 정주행하다',
        enDef: '1. verb to watch multiple episodes of a program in rapid succession',
        exampleBlank: 'We decided to ______ the new drama series this weekend.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '뒤에 시리즈나 영상 목적어(DO)를 취하는 타동사',
        collocation: 'binge-watch the whole season',
        collocationKo: '전 시즌을 한꺼번에 몰아보다(정주행하다)',
        paraphraseTip: '[초급 필수] 넷플릭스·유튜브 시대의 필수 동사',
      },
      {
        id: 3,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'live up to the hype',
        masked: 'l ⬛ ve up to the h ⬛ pe',
        ipa: '/lɪv ʌp tə ðə haɪp/',
        pron: '[리-법 투 더 하입]',
        soundMethod: 'live up을 [리-법]으로 연음하고, hype의 p를 깔끔하게 닫아줍니다.',
        soundBlock: 'definitely / lived up to the hype',
        meaning: '소문·기대만큼 실제로도 대단하다(명불허전이다)',
        enDef: '1. idiom to be as good as people expected or advertised',
        exampleBlank: 'The new tablet definitely ______ with its amazing display.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '주어의 품질이나 경험이 대중의 기대치(hype)에 부응함을 서술함',
        collocation: 'more than live up to the hype',
        collocationKo: '소문과 기대 그 이상으로 훌륭하다',
        paraphraseTip: '[중급 바꿔말하기] as good as people said ➔ lived up to the hype',
      },
      {
        id: 4,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'keep an eye on',
        masked: 'k ⬛ ep an e ⬛ e on',
        ipa: '/kiːp ən aɪ ɒn/',
        pron: '[키-퍼-나이 온]',
        soundMethod: 'keep an eye가 전부 연음되어 [키-퍼-나이]처럼 한 덩어리로 흘러갑니다!',
        soundBlock: 'keep an eye on / the live score',
        meaning: '~을 주의 깊게 지켜보다, 눈여겨보다',
        enDef: '1. idiom to watch or monitor someone or something carefully',
        exampleBlank: 'I always ______ the live sports standings and highlights.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '전치사 on 뒤에 지켜보는 대상(DO)을 취하는 3형식 동사구',
        collocation: 'keep a close eye on trends',
        collocationKo: '최신 트렌드를 면밀히 주시하다',
        paraphraseTip: '[중급 핵심] watch closely를 대체하는 원어민 구어 표현',
      },
      {
        id: 5,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'hit the nail on the head',
        masked: 'h ⬛ t the n ⬛ il on the h ⬛ ad',
        ipa: '/hɪt ðə neɪl ɒn ðə hed/',
        pron: '[힛 더 네일 온 더 헤드]',
        soundMethod: 'hit, nail, head 세 내용어에 똑같이 박자를 맞춰 리듬감 있게 발음합니다.',
        soundBlock: 'you hit / the nail / on the head',
        meaning: '정곡을 찌르다, 핵심을 정확히 짚어내다',
        enDef: '1. idiom to describe exactly what is causing a situation or problem',
        exampleBlank: 'Your comment ______ regarding the main issue.',
        pos: 'V',
        posLabel: '관용구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '상대방의 분석이나 발언이 100% 정확함을 극찬하는 서술어',
        collocation: 'absolutely hit the nail on the head',
        collocationKo: '완벽하게 핵심 정곡을 찌르다',
        paraphraseTip: '[중·고급] You are totally right을 가장 세련되게 바꿔 말하는 표현',
      },
      {
        id: 6,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'resonate',
        masked: 'r ⬛ s ⬛ nate',
        ipa: '/ˈrez.ən.eɪt/',
        pron: '[레-저네이트]',
        soundMethod: '첫 음절 re-에 강세를 두고 s는 유성음 [즈]로 부드럽게 울려줍니다.',
        soundBlock: 'deeply resonate / with the audience',
        meaning: '깊은 공감을 불러일으키다, 마음에 울림을 주다',
        enDef: '1. verb to evoke emotions; to be deeply meaningful to someone',
        exampleBlank: 'The movie’s message deeply ______ with millions of viewers.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '전치사 with와 함께 쓰여 감동과 공감대를 형성함을 나타냄',
        collocation: 'resonate with the public',
        collocationKo: '대중들에게 깊은 공감과 울림을 주다',
        paraphraseTip: '[고급 동사] touch people’s hearts를 대체하는 지적인 어휘',
      },
      {
        id: 7,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'captivating',
        masked: 'c ⬛ pt ⬛ vating',
        ipa: '/ˈkæp.tɪ.veɪ.tɪŋ/',
        pron: '[캡-티베이팅]',
        soundMethod: '첫 음절 cap-을 강하게 발음하고 부드럽게 연결합니다.',
        soundBlock: 'a truly / captivating performance',
        meaning: '눈을 뗄 수 없게 매혹적인, 마음을 사로잡는',
        enDef: '1. adjective capable of attracting and holding interest; charming',
        exampleBlank: 'The piano soundtrack and storyline were truly ______.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '작품이나 영상의 매력도를 보충 설명하는 고급 형용사 보어',
        collocation: 'a captivating storyline',
        collocationKo: '마음을 완전히 사로잡는 스토리라인',
        paraphraseTip: '[고급 변환] very interesting ➔ truly captivating',
      },
      {
        id: 8,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'phenomenal',
        masked: 'ph ⬛ n ⬛ menal',
        ipa: '/fəˈnɒm.ɪ.nəl/',
        pron: '[퍼-나미널]',
        soundMethod: 'ph는 /f/ 소리이며, 두 번째 음절 -nom-에 강한 강세를 실어 발음합니다.',
        soundBlock: 'a phenomenal / success',
        meaning: '경이로운, 놀라울 정도로 대단한',
        enDef: '1. adjective very remarkable; extraordinary',
        exampleBlank: 'The athlete showed a ______ performance in the final match.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(performance/quality) 앞에서 압도적 수준을 꾸며줌',
        collocation: 'phenomenal display quality',
        collocationKo: '경이로울 정도로 뛰어난 디스플레이 화질',
        paraphraseTip: '[고급 극찬] great or amazing보다 한 차원 높은 감탄 형용사',
      },
      {
        id: 9,
        type: '고급/실무',
        recommendLevel: 'intermediate',
        word: 'informative',
        masked: 'inf ⬛ rm ⬛ tive',
        ipa: '/ɪnˈfɔː.mə.tɪv/',
        pron: '[인-포머티브]',
        soundMethod: '-for- 음절에 강세를 두고 뒤의 -mative는 힘을 빼고 빠르게 붙여줍니다.',
        soundBlock: 'both entertaining / and informative',
        meaning: '유익한, 배울 만한 정보가 가득한',
        enDef: '1. adjective providing useful or interesting information',
        exampleBlank: 'This YouTube channel is both entertaining and ______.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '유튜브 영상이나 기사가 매우 유익함을 설명하는 주격보어',
        collocation: 'an informative video clip',
        collocationKo: '알차고 유익한 영상 클립',
        paraphraseTip: '[중·고급] useful to know를 한 단어로 압축한 형용사',
      },
      {
        id: 10,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'effortlessly',
        masked: 'ef ⬛ o ⬛ tlessly',
        ipa: '/ˈef.ət.ləs.li/',
        pron: '[에-퍼트러슬리]',
        soundMethod: '첫 음절 ef-에 강세를 두고 물 흐르듯 가볍게 발음합니다.',
        soundBlock: 'handled the task / effortlessly',
        meaning: '물 흐르듯 자연스럽게, 힘들이지 않고 능숙하게',
        enDef: '1. adverb in a way that requires no physical or mental exertion; smoothly',
        exampleBlank: 'He ______ switched between Korean and English during the talk.',
        pos: 'Adv',
        posLabel: '부사 (Adverb)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '동사나 형용사를 꾸며 숙련된 자연스러움(꾸안꾸)을 강조함',
        collocation: 'effortlessly cool and natural',
        collocationKo: '힘 주지 않아도 물 흐르듯 멋스러운',
        paraphraseTip: '[고급 필수] easily보다 훨씬 우아하고 숙련된 느낌을 줍니다.',
      },
    ],
    synonymScale: {
      baseWord: 'good / amazing (극찬·감탄 표현 강세 비교)',
      pos: '형용사 뉘앙스 스케일',
      meaning: '초급 칭찬에서 고급 극찬으로 올라가는 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'phenomenal / mind-blowing', ipa: '/fəˈnɒm.ɪ.nəl/', nuance: '경이롭고 압도적이어서 입이 다물어지지 않는 수준' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'captivating / lived up to the hype', ipa: '/ˈkæp.tɪ.veɪ.tɪŋ/', nuance: '마음을 완전히 사로잡는, 소문대로 명불허전인' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'impressive / informative', ipa: '/ɪnˈfɔː.mə.tɪv/', nuance: '인상 깊고 유익한 (중급 표준 칭찬)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'nice / pretty good', ipa: '/naɪs/', nuance: '꽤 괜찮은, 무난한 (초급 기초 표현)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        levelTag: 'beginner',
        tag: '🌱 [초급] 기본 표현 & 느린 발음 훈련',
        targetWord: 'go viral & binge-watch',
        wordOrderFormula: '[주어(The drama)] + [동사1(went viral)] + [연결(so)] + [주어2+동사2(I binge-watched it)]',
        structure: '주어(S) + 동사구(V+SC) + 접속사 + 주어(S) + 동사(V) + 목적어(DO)',
        soundBlockEn: 'The new drama / went viral / so I binge-watched it / all weekend.',
        soundMethodGuide: '0.75배속으로 went viral[웬-바이럴]과 binge-watched[빈지-워치트]를 천천히 따라 읽으세요.',
        ipaLine: '/ðə njuː ˈdrɑː.mə went ˈvaɪ.rəl səʊ aɪ ˈbɪndʒ.wɒtʃt ɪt ɔːl ˌwiːkˈend/',
        koLine: '새 드라마가 대유행했습니다(S+V) / 그래서 나는 그것을 몰아봤습니다(S+V+DO) / 주말 내내(M).',
        enLine: 'The new drama [went viral](S+V) / so I [binge-watched] it(S+V+DO) / all weekend(M).',
        rawEn: 'The new drama went viral so I binge-watched it all weekend.',
        pronLine: '[더 뉴 드라마 / 웬-바이럴 / 쏘 아이 빈지-워치트 잇 / 올 위켄드]',
        naturalKo: '새 드라마가 입소문이 자자해서 주말 내내 몰아서 정주행했습니다.',
        paraphraseVersion: 'Because the series became a huge hit online, I watched the entire season in two days.',
        grammarPoint: '원인(went viral)과 결과(binge-watched)를 접속사 so로 자연스럽게 이어준 초급 필수 문장입니다.',
        contextNuance: '월요일 아침 동료들과 주말에 본 영상을 이야기할 때 바로 쓸 수 있습니다.',
      },
      {
        id: 2,
        levelTag: 'intermediate',
        tag: '🌿 [중급] 상황별 대화 & 바꿔 말하기 훈련',
        targetWord: 'live up to the hype & phenomenal',
        wordOrderFormula: '[주어(The new iPad)] + [동사구(lived up to the hype)] + [수식어(with its phenomenal display)]',
        structure: '주어(S) + 동사구(V+O) + 전치사구 수식어(M)',
        soundBlockEn: 'The new iPad / definitely lived up to the hype / with its phenomenal display.',
        soundMethodGuide: 'lived up to를 [리브-덥-투]로 묶고, phenomenal의 [-나-] 음절을 높게 강조합니다.',
        ipaLine: '/ðə njuː ˈaɪ.pæd ˈdef.ɪ.nət.li lɪvd ʌp tə ðə haɪp wɪð ɪts fəˈnɒm.ɪ.nəl dɪˈspleɪ/',
        koLine: '새 아이패드는(S) / 확실히 소문만큼 명불허전이었습니다(M+V+O) / 경이로운 디스플레이 덕분에(M).',
        enLine: 'The new iPad(S) / definitely [lived up to the hype](M+V+O) / with its [phenomenal] display(M).',
        rawEn: 'The new iPad definitely lived up to the hype with its phenomenal display.',
        pronLine: '[더 뉴 아이패드 / 데피닛리 리브-덥 투 더 하입 / 위드 잇츠 퍼-나미널 디스플레이]',
        naturalKo: '새로 나온 아이패드는 경이로운 화질 덕분에 정말 소문대로 명불허전이었습니다.',
        paraphraseVersion: 'The new tablet was every bit as amazing as people said, especially the screen quality.',
        grammarPoint: '부사 definitely가 동사구 lived up to the hype 바로 앞에서 확신의 정도를 꾸며주는 수식어(M)로 쓰였습니다.',
        contextNuance: '초급의 "It was very good"을 중·고급 원어민 리뷰 표현으로 완벽히 바꾼 문장입니다.',
      },
      {
        id: 3,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 미디어 비평 ①',
        targetWord: 'captivating & resonate & informative',
        wordOrderFormula: '[주어(This channel)] + [동사+보어(is captivating and informative)] + [결과절(so it resonates with viewers)]',
        structure: '주어(S) + 동사(V) + 주격보어(SC) + 접속사 + 동사2(V) + 수식어(M)',
        soundBlockEn: 'This content / is both captivating and informative / so it deeply resonates / with viewers.',
        soundMethodGuide: 'captivating, informative, resonates 세 핵심 어휘의 강세를 리듬감 있게 짚어주세요.',
        ipaLine: '/ðɪs ˈkɒn.tent ɪz bəʊθ ˈkæp.tɪ.veɪ.tɪŋ ænd ɪnˈfɔː.mə.tɪv səʊ ɪt ˈdiːp.li ˈrez.ən.eɪts wɪð ˈvjuː.əz/',
        koLine: '이 콘텐츠는(S) / 매혹적이면서도 유익합니다(V+SC) / 그래서 시청자들에게 깊은 공감을 줍니다(S+V+M).',
        enLine: 'This content(S) / is both [captivating] and [informative](V+SC) / so it deeply [resonates] with viewers(S+V+M).',
        rawEn: 'This content is both captivating and informative so it deeply resonates with viewers.',
        pronLine: '[디스 컨텐츠 / 이즈 보쓰 캡-티베이팅 앤 인-포머티브 / 쏘 잇 디플리 레-저네이츠 위드 뷰어즈]',
        naturalKo: '이 콘텐츠는 눈을 뗄 수 없이 매력적이면서도 유익해서 시청자들에게 깊은 울림을 줍니다.',
        paraphraseVersion: 'Because the video combines great storytelling with useful insights, people can strongly relate to it.',
        grammarPoint: '상관접속사 both A and B 구조로 형용사 보어(captivating, informative) 두 개를 균형 있게 연결했습니다.',
        contextNuance: '품격 있는 문화·미디어 비평이나 오픽 고급 질문에서 최고점을 받는 문장입니다.',
      },
      {
        id: 4,
        levelTag: 'advanced',
        tag: '🌳 [고급] 세련된 뉘앙스 & 긴 대화 토론 ②',
        targetWord: 'hit the nail on the head & effortlessly',
        wordOrderFormula: '[주어(Your analysis)] + [동사구(hit the nail on the head)] + [연결(and)] + [동사2(persuaded everyone effortlessly)]',
        structure: '주어(S) + 동사구(V+O+M) + 접속사 + 동사2(V) + 목적어(DO) + 수식어(M)',
        soundBlockEn: 'Your analysis / hit the nail on the head / and persuaded everyone / effortlessly.',
        soundMethodGuide: 'nail on을 [네이-론]으로 연음하고 effortlessly를 부드럽게 흘려줍니다.',
        ipaLine: '/jɔːr əˈnæl.ə.sɪs hɪt ðə neɪl ɒn ðə hed ænd pəˈsweɪ.dɪd ˈev.ri.wʌn ˈef.ət.ləs.li/',
        koLine: '당신의 분석이(S) / 정확히 핵심 정곡을 찔렀고(V+O+M) / 모두를 물 흐르듯 설득했습니다(V+DO+M).',
        enLine: 'Your analysis(S) / [hit the nail on the head](V+O+M) / and persuaded everyone [effortlessly](V+DO+M).',
        rawEn: 'Your analysis hit the nail on the head and persuaded everyone effortlessly.',
        pronLine: '[유어 어-낼러시스 / 힛 더 네이-론 더 헤드 / 앤 퍼스웨이디드 에브리원 / 에-퍼트러슬리]',
        naturalKo: '당신의 분석이 정확히 정곡을 찔러서 모두를 자연스럽게 설득해 냈습니다.',
        paraphraseVersion: 'You pinpointed the exact core of the issue and convinced the whole team without difficulty.',
        grammarPoint: '과거 시제에서도 hit의 형태는 그대로 hit(hit-hit-hit)이며, 등위접속사 and 뒤의 과거동사 persuaded와 병렬을 이룹니다.',
        contextNuance: '토론이나 회의에서 상대방의 통찰력을 극찬할 때 쓰는 최고급 표현입니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'binge-watch',
        ipa: '/ˈbɪndʒ.wɒtʃ/',
        options: ['일정을 취소하다', '(드라마·영화를) 몰아서 정주행하다', '운동 계획을 세우다', '회의를 주재하다'],
        answerIdx: 1,
        explanation: 'binge(한꺼번에 몰아서 하기) + watch가 결합하여 시리즈물을 몰아본다는 뜻입니다.',
      },
      intermediate: {
        sentenceBefore: 'The new tablet definitely',
        sentenceAfter: 'with its breathtaking display.',
        hint: '소문이나 기대만큼 실제로도 명불허전이었다는 뜻의 이디엄입니다.',
        options: ['lived up to the hype', 'dropped off', 'checked in', 'unwound'],
        answerIdx: 0,
        explanation: '대중의 높은 기대치나 홍보(hype)에 걸맞게 훌륭했다는 표현은 lived up to the hype입니다.',
      },
      advanced: {
        sentenceBefore: 'The pianist’s performance was truly',
        highlightWord: 'captivating',
        sentenceAfter: 'from start to finish.',
        options: ['fascinating', 'enchanting', 'tedious'],
        answerIndices: [0, 1],
        explanation: 'captivating(마음을 사로잡는, 매혹적인)과 같은 의미로 쓰일 수 있는 단어는 fascinating과 enchanting입니다.',
      },
      writingMission: {
        koPrompt: '그 짧은 영상은 매우 유익했기 때문에 하룻밤 사이에 대유행했습니다.',
        wordOrderHint: '[주어: The short video] + [동사구: went viral overnight] + [이유절: because it was very informative]',
        hint: 'The short video / went viral overnight / because it was very informative.',
        modelAnswer: 'The short video went viral overnight because it was very informative.',
        checkPoint:
          '유행하다(go viral)의 과거 시제 went viral 뒤에 부사 overnight(하룻밤 사이에)를 수식어(M)로 붙입니다.',
      },
    },
  },

  // --------------------------------------------------------------------------
  // THEME 5: 글로벌 패션·스타일 & 업계 트렌드 (Vogue · WWD · ELLE · Bazaar · GQ)
  // --------------------------------------------------------------------------
  {
    id: 'fashion-runway',
    title: '👔 글로벌 패션·스타일 & 트렌드 비평 (Vogue · WWD · GQ)',
    badge: '5대 패션 매거진 연동 · 초급 코디~고급 런웨이',
    dateLabel: '오늘의 스타일 & 트렌드 코스 · Vogue / WWD / ELLE / Bazaar / GQ',
    opicLevel: '초급(일상코디·쇼핑) ➔ 중급(스타일링·바꿔말하기) ➔ 고급(런웨이·업계동향 토론)',
    coachPoint:
      '5대 패션 매체(Vogue Runway, WWD, ELLE, Harper’s Bazaar, GQ Style)를 완벽 통합했습니다! 초급은 일상 착장과 쇼핑 기본 표현, 중급은 ELLE·GQ 스타일의 세련된 칭찬과 바꿔 말하기, 고급은 Vogue 런웨이 미학과 WWD 럭셔리 시장 동향 토론으로 이어집니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [스타일·아이템 주어(S)] + [매칭·소화 동사(go well with / pull off / elevate)] + [대상·효과 목적어(DO)]',
    grammarSummary:
      '초급은 자동사+전치사(go well with ~: ~와 잘 어울리다), 중급은 타동사구(pull off a look: 룩을 멋지게 소화하다), 고급은 타동사(blend A with B, spearhead the market)를 구사합니다.',
    situationGuide:
      '오늘 입은 옷(OOTD) 칭찬하기, 해외 편집샵 쇼핑, 남성 수트 핏(GQ)과 액세서리 스타일링(Bazaar) 대화부터 패션 업계 트렌드(WWD·Vogue) 분석까지 모두 아우릅니다.',
    levelTracks: {
      beginner: {
        levelName: '🌱 초급 (느린 발음 0.75x & 한글 뜻·발음 기본 도움)',
        targetSpeed: 0.75,
        focusBadge: '일상 데일리룩 칭찬 & 해외 쇼핑 필수 생존 표현 (ELLE / GQ 기초)',
        patternEn: 'This jacket / goes really well / with your jeans.',
        patternIpa: '/ðɪs ˈdʒæk.ɪt ɡəʊz ˈrɪə.li wel wɪð jɔːr dʒiːnz/',
        patternPron: '[디스 재킷 / 고-즈 리얼리 웰 / 위드 유어 진즈]',
        patternSoundBlock: 'This jacket / goes really well / with your jeans.',
        patternMeaningKo: '이 재킷은 당신의 청바지와 정말 잘 어울리네요.',
        levelGuide: '초급에서는 매장이나 일상에서 가장 많이 쓰는 "Can I try this on?(입어봐도 될까요?)"과 "It goes well with ~(그거 ~랑 잘 어울린다)" 두 가지만 천천히 익혀도 패션 대화가 시작됩니다.',
        paraphraseDrill: [
          { basicExpr: 'matches your jeans (청바지와 맞다)', upgradedExpr: 'goes really well with your jeans', nuanceDiff: '색상이나 스타일이 자연스럽게 잘 어우러진다는 원어민 일상 표현' },
          { basicExpr: 'wear nice clothes (좋은 옷을 입다)', upgradedExpr: 'dress up for the occasion', nuanceDiff: '특별한 날이나 격식 있는 자리에 맞춰 멋지게 차려입다' },
        ],
        longTalkPrompt: '상대방의 셔츠나 재킷이 오늘 코디와 정말 잘 어울린다고(go well with) 한 문장으로 칭찬해 보세요.',
      },
      intermediate: {
        levelName: '🌿 중급 (듣기 집중 0.90x & ELLE·Bazaar·GQ 스타일 바꿔 말하기)',
        targetSpeed: 0.9,
        focusBadge: '단순 칭찬(looks good)을 패션 매거진 에디터 표현으로 바꿔 말하기',
        patternEn: 'You really pull off / that effortlessly chic / tailored look!',
        patternIpa: '/ju ˈrɪə.li pʊl ɒf ðæt ˈef.ət.ləs.li ʃiːk ˈteɪ.ləd lʊk/',
        patternPron: '[유 리얼리 풀-오프 / 댓 에-퍼트러슬리 시크 / 테일러드 룩!]',
        patternSoundBlock: 'You really pull off / that effortlessly chic / tailored look!',
        patternMeaningKo: '그 꾸안꾸 시크 테일러드 룩을 정말 완벽하게 소화하시네요!',
        levelGuide: '중급에서는 GQ Style과 ELLE에서 매일 쓰는 "pull off(멋지게 소화하다)", "effortlessly chic(힘 안 준 듯 세련된/꾸안꾸)", "wardrobe staple(옷장 속 필수 기본템)"으로 바꿔 말하는 훈련을 합니다.',
        paraphraseDrill: [
          { basicExpr: 'It looks good on you (너한테 잘 어울려)', upgradedExpr: 'You really pull off that look!', nuanceDiff: '아무나 소화하기 힘든 스타일까지 자기 것처럼 멋지게 소화해 냈다는 극찬' },
          { basicExpr: 'basic clothes I always wear (늘 입는 기본 옷)', upgradedExpr: 'a timeless wardrobe staple', nuanceDiff: 'GQ 선정 유행을 타지 않는 옷장 속 평생 기본 아이템' },
          { basicExpr: 'make the clothes look better (옷을 더 돋보이게 하다)', upgradedExpr: 'elevate the outfit with a statement piece', nuanceDiff: 'Bazaar 스타일: 포인트 액세서리 하나로 전체 룩의 격을 높이다' },
        ],
        longTalkPrompt: '당신의 옷장 속에 있는 유행 타지 않는 최애 기본템(timeless wardrobe staple)이 무엇인지 2~3문장으로 소개해 보세요.',
      },
      advanced: {
        levelName: '🌳 고급 (실전 속도 1.0x+ & Vogue 런웨이·WWD 업계 동향 토론)',
        targetSpeed: 1.0,
        focusBadge: 'Vogue Runway 컬렉션 미학 비평 & WWD 글로벌 브랜드 시장 분석',
        patternEn: 'The new collection seamlessly blends / classic heritage / with modern aesthetics.',
        patternIpa: '/ðə njuː kəˈlek.ʃən ˈsiːm.ləs.li blendz ˈklæs.ɪk ˈher.ɪ.tɪdʒ wɪð ˈmɒd.ən iːsˈθet.ɪks/',
        patternPron: '[더 뉴 컬렉션 심-러슬리 블렌즈 / 클래식 헤리티지 / 위드 모던 에스-떼틱스]',
        patternSoundBlock: 'The new collection / seamlessly blends / classic heritage / with modern aesthetics.',
        patternMeaningKo: '이번 신규 컬렉션은 클래식한 브랜드 헤리티지와 현대적 미학을 물 흐르듯 결합했습니다.',
        levelGuide: '고급에서는 Vogue Runway와 WWD 기사 원문에 등장하는 silhouette(실루엣), aesthetic(미학/감성), spearhead(시장을 선도하다), complement(상호 보완해 돋보이게 하다)를 활용해 수준 높은 트렌드 토론을 진행합니다.',
        paraphraseDrill: [
          { basicExpr: 'lead the fashion market', upgradedExpr: 'spearhead the global luxury market', nuanceDiff: 'WWD 비즈니스 용어: 글로벌 럭셔리 시장의 최전선에서 트렌드를 선도하다' },
          { basicExpr: 'has a very unique style and shape', upgradedExpr: 'features an avant-garde silhouette and bold aesthetic', nuanceDiff: 'Vogue Runway 용어: 독창적인 실루엣과 대담한 미학적 감성을 보여주다' },
        ],
        longTalkPrompt: '[5~30분 AI 트렌드 토론] 유행을 빠르게 소비하는 패스트 패션과 오랫동안 입는 타임리스 클래식(timeless staple / heritage) 중 당신이 선호하는 스타일 철학을 Vogue·GQ 에디터처럼 이야기해 보세요.',
      },
    },
    pattern: {
      en: 'You really pull off that effortlessly chic look!',
      ipa: '/ju ˈrɪə.li pʊl ɒf ðæt ˈef.ət.ləs.li ʃiːk lʊk/',
      soundBlock: 'You really / pull off / that effortlessly chic look!',
      soundMethod:
        'pull off는 연음해 [풀-러프]로 부드럽게 잇고, chic는 [칙]이 아니라 프랑스어 유래 발음인 [시-크/ʃiːk/]로 발음하는 것이 핵심입니다!',
      pron: '[유 리얼리 풀-오프 / 댓 에-퍼트러슬리 시-크 룩!]',
      nuance:
        '단순히 옷이 예쁘다는 것을 넘어, 입은 사람의 분위기와 핏이 그 스타일을 완벽하게 자기 것으로 소화해 냈을 때 쓰는 세련된 찬사입니다.',
      opicApplication:
        '인물 묘사, 패션·쇼핑 취미, 문화 트렌드 답변에서 어휘력을 단숨에 돋보이게 만듭니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'try on',
        masked: 'tr ⬛  o ⬛',
        ipa: '/traɪ ɒn/',
        pron: '[트라이 온]',
        soundMethod: 'try의 이중모음 /aɪ/ 뒤에 on을 부드럽게 연결해 발음합니다.',
        soundBlock: 'try on / this tailored jacket',
        meaning: '(옷·신발 등을) 입어보다, 착용해 보다',
        enDef: '1. phrasal verb to put on an item of clothing to see if it fits or suits one',
        exampleBlank: 'Where is the fitting room? I would like to ______ these trousers.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '옷이나 액세서리가 맞는지 착용해 보는 3형식 타동사구',
        collocation: 'try on a new outfit',
        collocationKo: '새 옷(코디)을 피팅룸에서 입어보다',
        paraphraseTip: '[초급 필수] 대명사(it/them)는 반드시 try it on처럼 사이에 넣습니다!',
      },
      {
        id: 2,
        type: '일상 회화',
        recommendLevel: 'beginner',
        word: 'go well with',
        masked: 'g ⬛  w ⬛ ll  w ⬛ th',
        ipa: '/ɡəʊ wel wɪð/',
        pron: '[고- 웰 위드]',
        soundMethod: 'well에 강세를 실어 긍정적이고 밝은 톤으로 발음합니다.',
        soundBlock: 'goes really well / with your suit',
        meaning: '(색상·스타일이) ~와 아주 잘 어울리다',
        enDef: '1. idiom to harmonize or match nicely with another item',
        exampleBlank: 'That classic watch ______ your smart-casual outfit.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '주어 아이템이 전치사 with 뒤의 아이템과 조화를 이룸을 서술',
        collocation: 'go well with everything',
        collocationKo: '어느 옷에나 두루두루 잘 어울리다',
        paraphraseTip: '[초급➔고급] 초급은 go well with, 고급은 complement를 씁니다.',
      },
      {
        id: 3,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'pull off',
        masked: 'p ⬛ ll  o ⬛ f',
        ipa: '/pʊl ɒf/',
        pron: '[풀-오프]',
        soundMethod: 'pull의 끝소리 l을 윗잇몸에 댔다가 off로 곧바로 연결합니다.',
        soundBlock: 'pull off / a bold style',
        meaning: '(패션·스타일을) 멋지게 소화해 내다',
        enDef: '1. phrasal verb to succeed in wearing a style of clothing attractively',
        exampleBlank: 'Not everyone can ______ a bright burgundy suit like you do.',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '까다로운 옷이나 컬러를 훌륭하게 소화해 내는 타동사구',
        collocation: 'pull off a tailored look',
        collocationKo: '테일러드 수트 룩을 완벽히 소화하다 (GQ 표현)',
        paraphraseTip: '[중급 1순위] wear well을 대체하는 패션 매거진 최다 빈출 구동사',
      },
      {
        id: 4,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'effortlessly chic',
        masked: 'ef ⬛ ortlessly  ch ⬛ c',
        ipa: '/ˈef.ət.ləs.li ʃiːk/',
        pron: '[에-퍼트러슬리 시-크]',
        soundMethod: 'chic는 철자 c가 [크]로 끝나지만 첫 ch는 [ʃ(쉬/시)] 소리여서 [시-크]로 발음합니다!',
        soundBlock: 'an effortlessly chic / daily look',
        meaning: '힘 안 준 듯 자연스럽게 세련된 (꾸안꾸 시크)',
        enDef: '1. phrase stylish and elegant in a natural, unforced way',
        exampleBlank: 'ELLE highlighted her ______ street style in Paris.',
        pos: 'Adj',
        posLabel: '형용사구 (Adj)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '부사 effortlessly가 형용사 chic를 수식하여 세련된 상태를 나타냄',
        collocation: 'effortlessly chic vibe',
        collocationKo: '꾸민 듯 안 꾸민 듯 시크한 분위기 (ELLE 표현)',
        paraphraseTip: '[중·고급] 한국어의 "꾸안꾸"에 100% 대응하는 원어민 패션 표현!',
      },
      {
        id: 5,
        type: '일상 회화',
        recommendLevel: 'intermediate',
        word: 'wardrobe staple',
        masked: 'wa ⬛ drobe  st ⬛ ple',
        ipa: '/ˈwɔː.drəʊb ˈsteɪ.pəl/',
        pron: '[워-드로브 스테이플]',
        soundMethod: 'wardrobe(옷장)와 staple(필수품) 각각의 첫 음절에 강세를 줍니다.',
        soundBlock: 'a timeless / wardrobe staple',
        meaning: '옷장 속 필수 기본템 (유행 안 타는 클래식 아이템)',
        enDef: '1. noun a basic, essential item of clothing that forms the foundation of an outfit',
        exampleBlank: 'A well-fitted white shirt is a timeless ______ for every man.',
        pos: 'N',
        posLabel: '명사구 (Noun)',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        roleDesc: '주어 아이템이 옷장의 핵심 필수품임을 설명하는 명사 보어',
        collocation: 'a timeless wardrobe staple',
        collocationKo: '시대를 초월한 옷장 속 필수 기본템 (GQ 선정)',
        paraphraseTip: '[중급 바꿔말하기] must-have basic item ➔ wardrobe staple',
      },
      {
        id: 6,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'silhouette',
        masked: 'si ⬛ hou ⬛ tte',
        ipa: '/ˌsɪl.uˈet/',
        pron: '[실루-엣]',
        soundMethod: '묵음 h는 발음하지 않고, 마지막 음절 -ette에 강한 강세를 둡니다.',
        soundBlock: 'a sharp / tailored silhouette',
        meaning: '(옷의 전체적인) 실루엣, 라인, 윤곽',
        enDef: '1. noun the overall shape or outline created by a garment on the body',
        exampleBlank: 'Vogue Runway praised the designer’s structured and modern ______.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '컬렉션이나 의상의 전체적인 핏과 외형 라인을 뜻하는 핵심 명사',
        collocation: 'flatter your silhouette',
        collocationKo: '체형과 실루엣을 돋보이게 살려주다',
        paraphraseTip: '[Vogue 핵심] shape or fit을 격조 높게 표현하는 런웨이 필수 명사',
      },
      {
        id: 7,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'aesthetic',
        masked: 'ae ⬛ th ⬛ tic',
        ipa: '/iːsˈθet.ɪk/',
        pron: '[에스-떼틱]',
        soundMethod: 'th는 혀끝을 윗니 사이에 살짝 끼우는 무성음 /θ/로 발음하고 -the-에 강세를 줍니다.',
        soundBlock: 'minimalist / aesthetic',
        meaning: '미학, 독창적인 미적 감성·스타일 철학',
        enDef: '1. noun/adj a set of principles underlying the work of a particular artist or brand',
        exampleBlank: 'The brand’s signature ______ combines luxury with comfort.',
        pos: 'N',
        posLabel: '명사/형용사 (N)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '브랜드나 디자이너만의 고유한 미적 세계관을 나타내는 주어/목적어',
        collocation: 'modern and refined aesthetic',
        collocationKo: '현대적이고 정제된 미학적 감성',
        paraphraseTip: '[Vogue·Bazaar] 단순 style을 넘어 예술적 감성과 디자인 철학을 뜻함',
      },
      {
        id: 8,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'statement piece',
        masked: 'st ⬛ tement  p ⬛ ece',
        ipa: '/ˈsteɪt.mənt piːs/',
        pron: '[스테이트먼트 피-스]',
        soundMethod: 'statement의 첫 음절과 piece의 장모음 /iː/를 선명하게 살려줍니다.',
        soundBlock: 'elevate the look / with a statement piece',
        meaning: '단번에 시선을 사로잡는 강렬한 포인트 아이템',
        enDef: '1. noun an eye-catching item of clothing or accessory that defines an outfit',
        exampleBlank: 'Harper’s Bazaar recommends adding a bold watch or bag as a ______.',
        pos: 'N',
        posLabel: '명사구 (Noun)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '전체 코디의 중심을 잡아주는 핵심 포인트 아이템을 지칭',
        collocation: 'make a bold statement',
        collocationKo: '강렬하고 대담한 존재감을 드러내다',
        paraphraseTip: '[Bazaar 핵심] point item(콩글리시)을 대체하는 진짜 원어민 표현!',
      },
      {
        id: 9,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'complement',
        masked: 'co ⬛ pl ⬛ ment',
        ipa: '/ˈkɒm.plɪ.ment/',
        pron: '[캄-플리먼트]',
        soundMethod: '칭찬하다(compliment: i)와 발음은 같지만 철자 e를 써서 "서로 보완해 돋보이게 하다"를 뜻합니다.',
        soundBlock: 'perfectly complement / the tailored suit',
        meaning: '(서로 어울려) 한층 더 돋보이게 보완하다',
        enDef: '1. verb to add to something in a way that enhances or improves its quality',
        exampleBlank: 'The silk tie and pocket square ______ the charcoal suit.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '아이템끼리 조화를 이루어 서로의 매력을 배가시키는 타동사',
        collocation: 'complement each other beautifully',
        collocationKo: '서로 기막히게 어우러져 빛을 발하다',
        paraphraseTip: '[고급 변환] 초급의 go well with를 대체하는 최고급 동사',
      },
      {
        id: 10,
        type: '고급/실무',
        recommendLevel: 'advanced',
        word: 'spearhead',
        masked: 'sp ⬛ arh ⬛ ad',
        ipa: '/ˈspɪə.hed/',
        pron: '[스피어-헤드]',
        soundMethod: '창(spear)의 끝(head)이라는 뜻에서 유래했으며, 첫 음절 spear-에 강세를 줍니다.',
        soundBlock: 'spearhead / the global trend',
        meaning: '(새로운 트렌드·시장을) 최전선에서 선도하다, 앞장서다',
        enDef: '1. verb to lead an attack, movement, or market trend',
        exampleBlank: 'According to WWD, the new creative director will ______ the brand’s digital expansion.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '패션 하우스나 기업이 새로운 시장 흐름을 주도함을 나타내는 동사',
        collocation: 'spearhead the luxury market',
        collocationKo: '글로벌 럭셔리 시장을 선도하다 (WWD 표현)',
        paraphraseTip: '[WWD 비즈니스] lead the market을 대체하는 강력하고 전문적인 동사',
      },
    ],
    synonymScale: {
      baseWord: 'stylish / match (패션 감각 & 조화 강세 비교)',
      pos: '패션 매거진(Vogue·GQ·ELLE) 뉘앙스 스케일',
      meaning: '초급 일상 칭찬에서 하이패션 에디터 표현까지의 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'avant-garde / refined aesthetic', ipa: '/ˌæv.ɒ̃ˈɡɑːd/', nuance: '시대를 앞서가는 독창적 실루엣과 정제된 미학 (Vogue Runway)' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'effortlessly chic / complement', ipa: '/ˈef.ət.ləs.li ʃiːk/', nuance: '꾸안꾸 시크의 정석 / 서로를 완벽히 돋보이게 보완하다 (ELLE·Bazaar)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'pull off / tailored fit', ipa: '/pʊl ɒf/', nuance: '멋지게 소화해 내다 / 몸에 딱 맞는 테일러드 핏 (GQ Style)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'look nice / go well with', ipa: '/ɡəʊ wel wɪð/', nuance: '보기 좋다 / 잘 어울린다 (초급 일상 회화)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        levelTag: 'beginner',
        tag: '🌱 [초급] 일상 스타일 & 느린 발음 훈련 (ELLE·GQ 기초)',
        targetWord: 'try on & go well with',
        wordOrderFormula: '[주어+동사(I tried on this jacket)] + [연결(and)] + [주어2+동사2(it goes well with my jeans)]',
        structure: '주어(S) + 동사(V) + 목적어(DO) + 접속사 + 주어(S) + 동사(V) + 수식어(M)',
        soundBlockEn: 'I tried on / this jacket / and it goes really well / with my jeans.',
        soundMethodGuide: '0.75배속으로 tried on[트라이-돈] 연음과 goes well with를 천천히 따라 읽어보세요.',
        ipaLine: '/aɪ traɪd ɒn ðɪs ˈdʒæk.ɪt ænd ɪt ɡəʊz ˈrɪə.li wel wɪð maɪ dʒiːnz/',
        koLine: '나는 입어보았습니다(S+V) / 이 재킷을(DO) / 그리고 그것은 정말 잘 어울립니다(S+V) / 내 청바지와(M).',
        enLine: 'I [tried on](S+V) / this jacket(DO) / and it [goes really well with](S+V) / my jeans(M).',
        rawEn: 'I tried on this jacket and it goes really well with my jeans.',
        pronLine: '[아이 트라이-돈 / 디스 재킷 / 앤 잇 고-즈 리얼리 웰 / 위드 마이 진즈]',
        naturalKo: '이 재킷을 입어봤는데 제 청바지랑 정말 잘 어울리네요.',
        paraphraseVersion: 'This jacket fits me nicely and matches my denim trousers.',
        grammarPoint: '구동사 try on 뒤에 일반명사(this jacket)가 목적어로 와서 자연스럽게 연결된 3형식 문장입니다.',
        contextNuance: '쇼핑할 때나 오늘 입은 옷을 이야기할 때 가장 먼저 쓰게 되는 필수 표현입니다.',
      },
      {
        id: 2,
        levelTag: 'intermediate',
        tag: '🌿 [중급] 스타일 묘사 & 바꿔 말하기 훈련 (GQ & Bazaar)',
        targetWord: 'pull off & wardrobe staple & statement piece',
        wordOrderFormula: '[주어(You)] + [동사(pulled off)] + [목적어(that wardrobe staple)] + [수식어(by adding a statement piece)]',
        structure: '주어(S) + 동사(V) + 직접목적어(DO) + 수단 전치사구 수식어(M)',
        soundBlockEn: 'You effortlessly pulled off / that wardrobe staple / by adding / a bold statement piece.',
        soundMethodGuide: 'pulled off를 [풀-도프]로 연음하고 statement piece에 또렷한 강세를 실어줍니다.',
        ipaLine: '/ju ˈef.ət.ləs.li pʊld ɒf ðæt ˈwɔː.drəʊb ˈsteɪ.pəl baɪ ˈæd.ɪŋ ə bəʊld ˈsteɪt.mənt piːs/',
        koLine: '당신은 물 흐르듯 소화해 냈습니다(S+M+V) / 그 기본 필수템을(DO) / 대담한 포인트 아이템을 더함으로써(M).',
        enLine: 'You effortlessly [pulled off](S+M+V) / that [wardrobe staple](DO) / by adding a bold [statement piece](M).',
        rawEn: 'You effortlessly pulled off that wardrobe staple by adding a bold statement piece.',
        pronLine: '[유 에-퍼트러슬리 풀-도프 / 댓 워-드로브 스테이플 / 바이 애딩 / 어 볼드 스테이트먼트 피-스]',
        naturalKo: '기본 필수 아이템에 대담한 포인트 액세서리를 더해서 코디를 정말 시크하게 소화하셨네요.',
        paraphraseVersion: 'You made a classic basic outfit look extraordinary with an eye-catching accessory.',
        grammarPoint: '전치사 by + 동명사(by adding ~: ~함으로써) 구조로 스타일링 비법(수단·방법)을 문장 뒤 수식어(M)로 덧붙였습니다.',
        contextNuance: 'GQ와 Harper’s Bazaar 에디터들이 가장 즐겨 쓰는 세련된 스타일링 찬사입니다.',
      },
      {
        id: 3,
        levelTag: 'advanced',
        tag: '🌳 [고급] 런웨이 컬렉션 비평 ① (Vogue Runway & ELLE)',
        targetWord: 'silhouette & aesthetic & complement',
        wordOrderFormula: '[주어(The tailored silhouette)] + [동사(complements)] + [목적어(the brand’s modern aesthetic)]',
        structure: '주어(S) + 동사(V) + 직접목적어(DO) + 수식어(M)',
        soundBlockEn: 'The tailored silhouette / on Vogue Runway / perfectly complements / the brand’s modern aesthetic.',
        soundMethodGuide: 'silhouette[실루-엣]과 aesthetic[에스-떼틱]의 강세를 정확히 살려 지적인 톤으로 발음하세요.',
        ipaLine: '/ðə ˈteɪ.ləd ˌsɪl.uˈet ɒn vəʊɡ ˈrʌn.weɪ ˈpɜː.fekt.li ˈkɒm.plɪ.ments ðə brændz ˈmɒd.ən iːsˈθet.ɪk/',
        koLine: '테일러드 실루엣은(S) / 보그 런웨이의(M) / 완벽히 돋보이게 보완합니다(M+V) / 브랜드의 현대적 미학을(DO).',
        enLine: 'The tailored [silhouette](S) / on Vogue Runway(M) / perfectly [complements](M+V) / the brand’s modern [aesthetic](DO).',
        rawEn: 'The tailored silhouette on Vogue Runway perfectly complements the brand’s modern aesthetic.',
        pronLine: '[더 테일러드 실루-엣 / 온 보그 런웨이 / 퍼펙틀리 캄-플리먼츠 / 더 브랜즈 모던 에스-떼틱]',
        naturalKo: '보그 런웨이에서 선보인 정교한 실루엣은 브랜드 특유의 현대적 미학을 한층 더 완벽하게 돋보이게 합니다.',
        paraphraseVersion: 'The structured outline of the collection harmonizes seamlessly with the house’s contemporary design philosophy.',
        grammarPoint: '주어 핵이 단수명사 silhouette이므로 전치사구(on Vogue Runway)에 현혹되지 않고 단수동사 complements(-s)로 수일치시킵니다.',
        contextNuance: 'Vogue Runway 컬렉션 리뷰 기사를 읽거나 디자인·트렌드를 비평할 때 쓰이는 최고급 문장입니다.',
      },
      {
        id: 4,
        levelTag: 'advanced',
        tag: '🌳 [고급] 패션 업계 동향 토론 ② (WWD 비즈니스)',
        targetWord: 'spearhead & effortlessly chic',
        wordOrderFormula: '[부사구(According to WWD)] + [주어(the luxury house)] + [동사(will spearhead)] + [목적어(the market)] + [수식어(with ~)]',
        structure: '수식어(M) + 주어(S) + 동사(V) + 직접목적어(DO) + 전치사구 수식어(M)',
        soundBlockEn: 'According to WWD, / the luxury house / will spearhead the market / with effortlessly chic collections.',
        soundMethodGuide: 'spearhead[스피어-헤드]와 effortlessly chic[에-퍼트러슬리 시-크]를 매끄럽게 연결합니다.',
        ipaLine: '/əˈkɔː.dɪŋ tə ˌdʌb.əl.juː.dʌb.əl.juːˈdiː ðə ˈlʌk.ʃər.i haʊs wɪl ˈspɪə.hed ðə ˈmɑː.kɪt wɪð ˈef.ət.ləs.li ʃiːk kəˈlek.ʃənz/',
        koLine: 'WWD에 따르면(M) / 그 럭셔리 하우스는(S) / 시장을 선도할 것입니다(V+DO) / 꾸안꾸 시크 컬렉션들로(M).',
        enLine: 'According to WWD(M), / the luxury house(S) / will [spearhead] the market(V+DO) / with [effortlessly chic] collections(M).',
        rawEn: 'According to WWD, the luxury house will spearhead the market with effortlessly chic collections.',
        pronLine: '[어코딩 투 더블유더블유디 / 더 럭셔리 하우스 / 윌 스피어-헤드 더 마켓 / 위드 에-퍼트러슬리 시-크 컬렉션즈]',
        naturalKo: 'WWD 보도에 따르면, 해당 럭셔리 브랜드는 자연스러우면서도 시크한 컬렉션을 앞세워 글로벌 시장을 선도할 전망입니다.',
        paraphraseVersion: 'WWD reports that the fashion brand is set to lead the industry through its refined yet relaxed designs.',
        grammarPoint: '출처를 밝히는 전치사구 According to ~(WWD에 따르면)를 문두 수식어(M)로 두어 비즈니스 브리핑의 객관성을 높였습니다.',
        contextNuance: '패션 업계뿐만 아니라 모든 산업의 시장 트렌드와 브랜드 전략을 논의할 때 그대로 응용할 수 있습니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'pull off (GQ & ELLE 핵심 표현)',
        ipa: '/pʊl ɒf/',
        options: ['옷을 벗어 두다', '(어려운 스타일·룩을) 멋지게 소화해 내다', '매장을 방문하다', '가격을 할인하다'],
        answerIdx: 1,
        explanation: 'pull off는 까다로운 패션 스타일이나 과감한 컬러를 자기 것처럼 멋지게 소화해 낸다는 뜻의 필수 구동사입니다.',
      },
      intermediate: {
        sentenceBefore: 'A crisp white shirt is a timeless',
        sentenceAfter: 'that goes well with everything.',
        hint: '유행을 타지 않고 옷장 속에 늘 갖추어야 할 "필수 기본템"을 뜻하는 GQ 선정 표현입니다.',
        options: ['wardrobe staple', 'layover', 'heads-up', 'itinerary'],
        answerIdx: 0,
        explanation: 'timeless wardrobe staple은 시대를 초월한 옷장 속 필수 기본 아이템을 뜻합니다.',
      },
      advanced: {
        sentenceBefore: 'The silk scarf and leather bag perfectly',
        highlightWord: 'complement',
        sentenceAfter: 'her tailored coat.',
        options: ['enhance', 'harmonize with', 'ruin'],
        answerIndices: [0, 1],
        explanation: 'complement(보완하여 한층 더 돋보이게 하다)는 enhance(높이다/돋보이게 하다), harmonize with(~와 조화를 이루다)와 바꿔 쓸 수 있습니다.',
      },
      writingMission: {
        koPrompt: '당신은 그 꾸안꾸 시크(힘 안 준 듯 세련된) 테일러드 룩을 정말 멋지게 소화해 내시네요!',
        wordOrderHint: '[주어: You] + [동사구: really pull off] + [목적어: that effortlessly chic tailored look]!',
        hint: 'You really pull off / that effortlessly chic / tailored look!',
        modelAnswer: 'You really pull off that effortlessly chic tailored look!',
        checkPoint:
          '부사 effortlessly가 형용사 chic를 꾸며주고, 전체가 명사 look을 수식(M)하는 세련된 어순입니다.',
      },
    },
  },
];

export const THEMES: ThemeData[] = [...THEMES_PART1, ...THEMES_PART2];

// ============================================================================
// 🎓 [신규 탑재] 수능·내신 1등급 완벽 대비 전략적 학습 데이터베이스
//    - 슬로건: "영어로 생각하고 표현하는 힘, 외운 답이 아닌 답을 만드는 영어"
//    - 3대 전문 반: ① 수능 정규 완성반(고3 1등급) ② 고등 어법·서술형 완성반(406개교 6개년) ③ 학교별 내신 대비반(5단계 누적·변형)
// ============================================================================
export type ExamTrackId = 'CSAT_MASTER' | 'GRAMMAR_ESSAY' | 'SCHOOL_INTERNAL';

export interface ExamStepModule {
  stepNum: number;
  stepTitle: string;
  durationLabel: string;
  goalDesc: string;
  originalPassageEn: string;
  originalPassageKo: string;
  transformedEn: string; // 변형 / 패러프레이징 지문
  transformedPoint: string;
  killerGrammarTrap: {
    questionEn: string;
    wrongChoice: string;
    correctChoice: string;
    freqBadge: string;
    ruleExplanation: string;
  };
  essayMission: {
    typeBadge: string;
    koCondition: string;
    givenWords: string;
    modelAnswerEn: string;
    scoringCriteria: string;
  };
}

export interface ExamMasterCourse {
  id: ExamTrackId;
  name: string;
  shortTabName: string;
  badge: string;
  targetGoal: string;
  scheduleRule: string;
  philosophy: string;
  curriculumPills: string[];
  steps: ExamStepModule[];
}

export const EXAM_MASTER_COURSES: ExamMasterCourse[] = [
  {
    id: 'CSAT_MASTER',
    name: '🏆 수능 정규 완성반 (고3 수능 모의고사 1등급 완성)',
    shortTabName: '① 수능 1등급 완성반 (주1회 3시간)',
    badge: '고3 수능 1등급 · 최상위권 실력 유지',
    targetGoal: '학습목표: 고3 수능 1등급 달성 및 킬러 문항(빈칸·순서·삽입·요약) 완전 정복',
    scheduleRule: '수업구성: 주 1회 3시간(180분) 집중 수업 · EBS 수능 연계교재 + 주요 소재 심화 + 고난도 기출/변형 실전 모의고사',
    philosophy:
      '영어로 생각하고 표현하는 힘! 지문을 단순 해석하는 것을 넘어 EBS 핵심 소재의 논리 구조와 구문 뼈대를 장악해 어떤 고난도 변형 문제에서도 스스로 정답을 도출합니다.',
    curriculumPills: [
      '1교시: 단어학습 & 단어테스트 (25분)',
      '2교시: 핵심문장 구문 학습 (35분)',
      '3교시: 독해심화 변형 문제 (40분)',
      '4교시: 주요소재 연계학습 (30분)',
      '5교시: 고난도 실전 테스트 (50분)',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1~2. EBS 연계 어휘 테스트 & 고난도 핵심문장 구문 해부',
        durationLabel: '1~2교시 (60분)',
        goalDesc: 'EBS 수능특강·수능완성 최빈출 추상 어휘를 점검하고, 3줄 이상의 길고 복잡한 도치·분사구문을 16개(7성분×9품사) 뼈대로 직독직해합니다.',
        originalPassageEn:
          'Not until we step out of our cognitive comfort zone can we genuinely broaden our perspective on complex phenomena.',
        originalPassageKo:
          '우리가 인지적 안전지대(편안한 영역) 밖으로 걸어 나와서야 비로소 우리는 복잡한 현상에 대한 우리의 관점을 진정으로 넓힐 수 있다.',
        transformedEn:
          'Only by transcending familiar cognitive boundaries is it feasible for us to expand our viewpoint.',
        transformedPoint:
          '[수능 간접연계 변형 포인트] 부정어 도치 구문(Not until ~ can we)을 제한 부사구 도치(Only by ~ is it feasible)로 패러프레이징하여 빈칸 추론 문항으로 출제!',
        killerGrammarTrap: {
          questionEn: 'Not until we step out of our comfort zone [ we can / can we ] genuinely broaden our perspective.',
          wrongChoice: 'we can (평서문 어순 오답)',
          correctChoice: 'can we (부정어 문두 도치 정답!)',
          freqBadge: '수능·평가원 어법 1순위 도치 구문',
          ruleExplanation:
            '부정어구(Not until절)가 강조를 위해 문장 맨 앞으로 이동하면, 주절의 어순은 반드시 의문문 어순인 [조동사(can) + 주어(we) + 동사원형(broaden)]으로 도치되어야 합니다!',
        },
        essayMission: {
          typeBadge: '수능 40번 요약문 완성 & 고난도 구문 영작',
          koCondition: '“익숙한 영역을 벗어날 때 비로소 우리는 시야를 넓힐 수 있다”를 부정어 도치(Not until)를 사용해 완성하시오.',
          givenWords: '[ Not until / step out of / can / broaden / our perspective / we ]',
          modelAnswerEn: 'Not until we step out of our comfort zone can we broaden our perspective.',
          scoringCriteria: '1) Not until 부사절 내 현재시제(step) 사용 2) 주절 조동사 도치(can we broaden) 어순 정확성',
        },
      },
      {
        stepNum: 2,
        stepTitle: 'STEP 3~5. 독해심화 변형 문제 · 주요소재 연계 · 고난도 실전 테스트',
        durationLabel: '3~5교시 (120분)',
        goalDesc: '철학·뇌과학·환경·경제 등 수능 주요 소재를 연계 학습하고, 실제 수능 31~34번 빈칸 추론 수준으로 변형된 모의고사를 시간 내에 돌파합니다.',
        originalPassageEn:
          'Consistent exposure to diverse viewpoints prevents confirmation bias and fosters intellectual flexibility.',
        originalPassageKo:
          '다양한 관점에 대한 꾸준한 노출은 확증 편향을 방지하고 지적 유연성을 길러준다.',
        transformedEn:
          'Maintaining consistency in encountering opposing ideas is essential to overcoming cognitive rigidity.',
        transformedPoint:
          '[독해심화 변형 포인트] confirmation bias(확증 편향) ➔ cognitive rigidity(인지적 경직성), intellectual flexibility(지적 유연성) ➔ overcoming rigidity로 반의어·유의어 치환!',
        killerGrammarTrap: {
          questionEn: 'Consistent exposure to diverse viewpoints [ prevent / prevents ] confirmation bias.',
          wrongChoice: 'prevent (앞 복수명사 viewpoints에 현혹된 오답)',
          correctChoice: 'prevents (단수 주어 핵 exposure에 수일치!)',
          freqBadge: '수능·모의고사 99% 출제 주어-동사 수일치',
          ruleExplanation:
            '전치사구(to diverse viewpoints)는 주어(exposure)를 꾸며주는 수식어(M)일 뿐입니다. 진짜 주어 핵은 단수 추상명사 exposure이므로 단수동사 prevents(-s)를 써야 합니다.',
        },
        essayMission: {
          typeBadge: '주제·요약 서술형 실전 테스트',
          koCondition: '위 지문의 핵심 요지를 [동명사 주어(Maintaining consistency) + 5형식(makes our mind flexible)] 구조로 요약 영작하시오.',
          givenWords: '[ Maintaining / consistency / makes / our mind / flexible / and / objective ]',
          modelAnswerEn: 'Maintaining consistency makes our mind flexible and objective.',
          scoringCriteria: '1) 동명사구 주어(Maintaining consistency) 단수 취급(makes) 2) 목적격보어(OC) 자리에 형용사(flexible, objective) 배치',
        },
      },
    ],
  },
  {
    id: 'GRAMMAR_ESSAY',
    name: '✍️ 고등 어법·서술형 완성반 (내신 1등급 치트키 · 방학 특강)',
    shortTabName: '② 고등 어법·서술형 완성반 (406개교 기출)',
    badge: '전국 406개교 최신 6개년 기출 완전 분석',
    targetGoal: '학습목표: 고등 내신 1등급을 결정짓는 어법과 서술형(조건 영작·요약) 완벽 마스터',
    scheduleRule: '수업구성: 기출 필수 어법 개념 총정리 + 서술형 유형별 전략 + 내신 기출 실전 모의고사',
    philosophy:
      '외운 답이 아닌 답을 만드는 영어! 전국 406개 고등학교의 최신 6개년 기출 빅데이터를 분석하여, 내신 1등급으로 직결되는 필수 어법 함정과 감점 없는 서술형 답안 작성 공식을 체화합니다.',
    curriculumPills: [
      '모듈 1: 406개교 6개년 기출 필수 어법 총정리',
      '모듈 2: 서술형 유형별 전략 (조건영작·어형변화·요약)',
      '모듈 3: 내신 1등급 실전 기출 모의고사',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: '모듈 1~2. 전국 406개교 6개년 최다 빈출 어법 TOP 킬러 & 서술형 영작 전략',
        durationLabel: '핵심 어법 + 서술형 전략',
        goalDesc: '학교 시험 서술형에서 가장 많이 감점되는 [5형식 보어 품사 / 관계대명사 vs 관계부사 / 분사구문 태 결정]을 16개 매핑 원리로 완벽히 정복합니다.',
        originalPassageEn:
          'Streamlining the approval process makes the entire project feasible, which allows the team to expedite the launch.',
        originalPassageKo:
          '결재 절차를 간소화하는 것은 전체 프로젝트를 실현 가능하게 만들어 주며, 이는 팀이 런칭을 앞당길 수 있게 해 준다.',
        transformedEn:
          'The streamlined process renders the project highly feasible, thereby enabling the team to accelerate the release.',
        transformedPoint:
          '[내신 어법·서술형 변형] 계속적 용법의 관계대명사(, which allows ~)를 분사구문(, thereby enabling ~)으로 어형 변화시키는 서술형 단골 출제 유형!',
        killerGrammarTrap: {
          questionEn: 'Streamlining the process makes the entire project [ feasible / feasibly ], [ which / that ] allows the team to expedite it.',
          wrongChoice: 'feasibly (부사 오답) / that (콤마 뒤 관계대명사 that 불가)',
          correctChoice: 'feasible (목적격보어 형용사) / which (계속적 용법)',
          freqBadge: '406개교 6개년 내신 출제율 1위 (보어 품사 & 관계사)',
          ruleExplanation:
            '① 5형식 동사 make의 목적격보어(OC) 자리에는 해석이 "~하게"라도 반드시 형용사(feasible)를 써야 합니다! ② 콤마(,) 뒤 계속적 용법에는 관계대명사 that이나 what을 절대 쓸 수 없으며 which를 씁니다.',
        },
        essayMission: {
          typeBadge: '406개교 기출 서술형 1순위: [조건 영작 & 어형 변화]',
          koCondition: '조건: 1) 가목적어 it과 진목적어 to부정사를 사용할 것 2) 보기 단어를 필요시 어형 변화할 것 (“새로운 시스템은 우리가 일정을 간소화하는 것을 가능하게 만들었다”)',
          givenWords: '[ make / the new system / possible / streamline / the schedule / for us ]',
          modelAnswerEn: 'The new system made it possible for us to streamline the schedule.',
          scoringCriteria: '1) 5형식 가목적어 구문(made it possible) 2) 의미상 주어(for us) + 진목적어(to streamline) 어순 정확성',
        },
      },
    ],
  },
  {
    id: 'SCHOOL_INTERNAL',
    name: '🏫 학교별 내신 대비반 (5단계 누적·심화·변형 완벽 대비)',
    shortTabName: '③ 학교별 내신 대비반 (5단계 변형)',
    badge: '양치기·무조건 암기 지양 · 고등 R&D센터 선별 콘텐츠',
    targetGoal: '학습목표: 학교별 맞춤 출제 경향 완벽 장악 및 어떠한 지문 변형에도 흔들리지 않는 고등 내신 1등급',
    scheduleRule: '5단계 공식: 전체 흐름 ▶ 세부 내용 ▶ 심화 ▶ 변형(Paraphrasing) ▶ 서술형(요약·영작)',
    philosophy:
      '무조건적인 본문 암기는 시험장에서 지문이 조금만 변형되어도 무너집니다! 이해 기반의 누적·심화 반복 학습으로 지문의 논리 구조와 어휘 변형을 완벽히 장악합니다.',
    curriculumPills: [
      '1단계: 전체 흐름 (논리 구조도)',
      '2단계: 세부 내용 (소리블럭 직독직해)',
      '3단계: 심화 (킬러 구문·어법 해부)',
      '4단계: 변형 (어휘·문장 Paraphrasing)',
      '5단계: 서술형 (요약문·조건 영작)',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: '학교별 내신 5단계 마스터: [전체 흐름 ▶ 세부 ▶ 심화 ▶ 변형 ▶ 서술형]',
        durationLabel: '5단계 누적·반복 시스템',
        goalDesc: '하나의 내신 핵심 지문을 단순 암기하지 않고 1단계(전체 흐름)부터 5단계(서술형 요약·영작)까지 입체적으로 변형·확장하며 내신 1등급 실력을 완성합니다.',
        originalPassageEn:
          'What matters most in sustainable luxury is that brands seamlessly blend classic heritage with modern aesthetics.',
        originalPassageKo:
          '지속 가능한 럭셔리에서 가장 중요한 것은 브랜드가 클래식한 헤리티지와 현대적 미학을 물 흐르듯 결합한다는 점이다.',
        transformedEn:
          'The core essence of sustainable luxury lies in harmonizing traditional heritage with contemporary aesthetics effortlessly.',
        transformedPoint:
          '[학교별 내신 4단계 변형] 원문의 "What matters most ~ is that S+V" 강조 구문을 학교 선생님이 시험지에서는 "The core essence ~ lies in V-ing"로 변형 출제!',
        killerGrammarTrap: {
          questionEn: '[ What / That ] matters most in luxury is [ what / that ] brands blend heritage with aesthetics.',
          wrongChoice: 'That ~ what (선행사 유무 및 완전/불완전 혼동)',
          correctChoice: 'What (불완전한 절 이끄는 관계대명사) ~ that (완전한 보어절 접속사)',
          freqBadge: '내신 서술형·어법 단골: What vs That 구별',
          ruleExplanation:
            '앞자리는 선행사가 없고 뒤에 주어 없이 동사(matters)가 바로 오므로 불완전한 절을 이끄는 What이 정답! 뒷자리는 주어(brands)+동사(blend)+목적어(heritage)가 모두 갖춘 완전한 문장이므로 접속사 that이 정답입니다.',
        },
        essayMission: {
          typeBadge: '학교별 내신 5단계 최종 관문: [본문 요약 & 변형 영작]',
          koCondition: '본문 내용을 바탕으로 아래 요약문의 빈칸을 채워 전체 문장을 완성하시오. (“지속 가능한 럭셔리의 핵심은 전통 유산과 현대 미학의 조화에 있다.”)',
          givenWords: '[ What / love / matters / most / is / that / blend / heritage / with / aesthetics ]',
          modelAnswerEn: 'What matters most is that brands blend heritage with aesthetics.',
          scoringCriteria: '1) 명사절 주어(What matters most) 단수동사(is) 수일치 2) 보어절 접속사(that) 뒤 완전한 3형식 문장 결합',
        },
      },
    ],
  },
];

// ============================================================================
// 어떤 영어 문장이나 수능·내신 구문을 눌러도 즉시 16개(7성분×9품사) 해부 카드로 변환하는 엔진
// ============================================================================
export function buildDynamicDiagramSentence(
  rawSentence: string,
  koTranslation: string,
  labelTitle: string
): DiagramSentence {
  const cleanWords = rawSentence
    .replace(/\[|\]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const detSet = new Set(['the', 'a', 'an', 'this', 'that', 'our', 'my', 'your', 'its', 'their', 'every', 'all']);
  const pronSet = new Set(['i', 'you', 'we', 'they', 'he', 'she', 'it', 'us', 'me', 'them', 'everyone', 'what']);
  const prepSet = new Set(['in', 'on', 'at', 'to', 'for', 'with', 'about', 'before', 'until', 'during', 'from', 'by', 'of', 'into', 'over']);
  const conjSet = new Set(['and', 'or', 'but', 'so', 'because', 'if', 'whenever', 'whether']);
  const auxVerbSet = new Set(['can', 'could', 'will', 'would', 'is', 'are', 'was', 'were', 'let', 'lets', 'try', 'tried', 'want', 'wanted', 'need', 'makes', 'make', 'made', 'goes', 'went', 'pulled', 'pull', 'lived', 'live', 'streamline', 'wrap', 'check', 'checked', 'drop', 'freshen', 'unwind', 'accommodate', 'spearhead', 'complements', 'complement', 'binge-watched', 'resonates', 'hit', 'step', 'broaden', 'prevents', 'fosters', 'matters', 'blend']);

  let verbFound = false;

  const tokens: WordToken[] = cleanWords.map((w, idx) => {
    const lower = w.toLowerCase().replace(/[^a-z-]/g, '');

    if (conjSet.has(lower)) {
      return {
        word: w,
        comp: 'M',
        compLabel: '연결/수식 (M)',
        pos: 'Conj',
        posLabel: '접속사(Conj)',
        colorClass: 'border-slate-400 text-slate-700',
      };
    }
    if (prepSet.has(lower)) {
      return {
        word: w,
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Prep',
        posLabel: '전치사(Prep)',
        colorClass: 'border-amber-400 text-amber-700',
      };
    }
    if (detSet.has(lower)) {
      return {
        word: w,
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Det',
        posLabel: '한정사(Det)',
        colorClass: 'border-amber-300 text-amber-700',
      };
    }
    if (lower.endsWith('ly') && lower !== 'family') {
      return {
        word: w,
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adv',
        posLabel: '부사(Adv)',
        colorClass: 'border-amber-400 text-amber-700',
      };
    }
    if (pronSet.has(lower)) {
      const isSubj = !verbFound || idx === 0;
      return {
        word: w,
        comp: isSubj ? 'S' : 'IO',
        compLabel: isSubj ? '주어 (S)' : '목적어 (O)',
        pos: 'Pron',
        posLabel: '대명사(Pron)',
        colorClass: isSubj ? 'border-blue-500 text-blue-700' : 'border-emerald-500 text-emerald-700',
      };
    }
    if (auxVerbSet.has(lower) || (!verbFound && idx === 1)) {
      verbFound = true;
      return {
        word: w,
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사(V)',
        colorClass: 'border-rose-500 text-rose-700',
      };
    }
    if (
      lower.endsWith('ble') ||
      lower.endsWith('ive') ||
      lower.endsWith('al') ||
      lower.endsWith('ic') ||
      lower.endsWith('ed') ||
      ['new', 'quick', 'short', 'bold', 'sharp', 'vacant', 'chic', 'timeless', 'modern', 'complex', 'diverse'].includes(lower)
    ) {
      return {
        word: w,
        comp: verbFound ? 'SC' : 'M',
        compLabel: verbFound ? '보어/수식(C·M)' : '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사(Adj)',
        colorClass: 'border-purple-400 text-purple-700',
      };
    }

    const isSubjNoun = !verbFound && idx <= 2;
    return {
      word: w,
      comp: isSubjNoun ? 'S' : 'DO',
      compLabel: isSubjNoun ? '주어 (S)' : '직접목적어 (DO)',
      pos: 'N',
      posLabel: '명사(N)',
      colorClass: isSubjNoun ? 'border-blue-500 text-blue-700' : 'border-teal-500 text-teal-700',
    };
  });

  const subjToken = tokens.find((t) => t.comp === 'S')?.word || cleanWords[0] || 'S';
  const verbToken = tokens.find((t) => t.comp === 'V')?.word || cleanWords[1] || 'V';
  const objToken = tokens.find((t) => t.comp === 'DO' || t.comp === 'SC')?.word || cleanWords[cleanWords.length - 1] || 'O';

  return {
    id: 'dynamic-live',
    label: labelTitle,
    tokens,
    translation: `“${koTranslation}”`,
    skeleton: `${subjToken}[S] + ${verbToken}[V] + ${objToken}[O/C]`,
    patternType: '실시간 선택 문장 16개(7성분×9품사) 자동 해부 모드',
    wordOrderTip: '어절 카드를 터치하면 위 16개 다이어그램 전광판의 문장 성분(직책)과 9품사(신분)가 실시간으로 움직입니다!',
  };
}
// ============================================================================
// [업그레이드 3-B 파트] 초고속 펜슬 엔진(파란블록 원천차단·4종 펜·굵기확대)
// + 단어·문장 양방향 보관함(수정·추가·암기완료 해제) + 제작과정 백서 연결
// ============================================================================
import {
  getExpandedWordbookByDay,
  generateCombinatorialSentences,
  EBS_MAJOR_TOPICS,
  GRAMMAR_406_QUIZ_BANK,
  analyzeCustomSchoolPassage,
} from './studyData';

export interface SavedSentenceItem {
  id: string;
  en: string;
  ko: string;
  note: string;
  category: string;
  mastered: boolean;
}

export default function App() {
  const todayObj = new Date();
  const todayKey = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  const todayDateStr = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
  const dayOfYear = Math.floor(
    (todayObj.getTime() - new Date(todayObj.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const [learningLevel, setLearningLevel] = useState<LearningLevel>('beginner');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    THEMES[dayOfYear % THEMES.length].id
  );
  // 상단 메인 모드에 'devStory' (🛠️ 제작과정 백서) 포함!
  const [activeMode, setActiveMode] = useState<
    'daily' | 'examMaster' | 'wordbook' | 'naverQuiz' | 'aiCoach' | 'weekly' | 'devStory'
  >('daily');
  const [activeMediaPlatform, setActiveMediaPlatform] =
    useState<MediaPlatformId>('FASHION_MAGS');

  // 🎓 수능·내신 1등급 마스터 & 1~5교시 독립 작동 상태
  const [selectedExamTrack, setSelectedExamTrack] = useState<ExamTrackId>('CSAT_MASTER');
  const [schoolInternalStage, setSchoolInternalStage] = useState<number>(1);
  const [syntaxSeed, setSyntaxSeed] = useState<number>(1);
  const [vocabQuizSeed, setVocabQuizSeed] = useState<number>(1);
  const [selectedVocabQuizAnswers, setSelectedVocabQuizAnswers] = useState<Record<number, number>>({});
  const [selectedGrammarQuizAnswers, setSelectedGrammarQuizAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [customSchoolText, setCustomSchoolText] = useState<string>(
    'Not until we step out of our cognitive comfort zone can we genuinely broaden our perspective on complex phenomena. Consistent exposure to diverse viewpoints prevents confirmation bias and fosters intellectual flexibility. Streamlining the approval process makes the entire project feasible.'
  );
  const [examEssayInput, setExamEssayInput] = useState<string>('');
  const [showExamModelAnswer, setShowExamModelAnswer] = useState<boolean>(false);
  const [csatTimerMins, setCsatTimerMins] = useState<number>(180);

  const [selectedLiveKeyword, setSelectedLiveKeyword] = useState<{
    platformName: string;
    rank: number;
    koTitle: string;
    enExpression: string;
    extUrl: string;
  } | null>(null);

  const [activeDiagramSentenceIdx, setActiveDiagramSentenceIdx] = useState<number>(0);
  const [customDissectSentence, setCustomDissectSentence] = useState<{
    en: string;
    ko: string;
    title: string;
  } | null>(null);

  const [mediaPlatforms, setMediaPlatforms] = useState<MediaTrendPlatform[]>(
    INITIAL_MEDIA_PLATFORMS
  );
  const [lastTrendSyncTime, setLastTrendSyncTime] = useState<string>('방금 전 실시간 동기화됨');
  const [isRefreshingTrends, setIsRefreshingTrends] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('yanadu_dark_mode') === 'true';
    }
    return false;
  });
  const [colorTheme, setColorTheme] = useState<'blue' | 'emerald' | 'indigo' | 'amber'>('blue');
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [layoutMode, setLayoutMode] = useState<'split' | 'wide'>('split');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const rootHtml = document.documentElement;
    const rootBody = document.body;
    if (darkMode) {
      rootHtml.classList.add('dark');
      rootBody.classList.add('dark');
      rootHtml.style.colorScheme = 'dark';
      rootBody.style.backgroundColor = '#020617';
      rootBody.style.color = '#f1f5f9';
    } else {
      rootHtml.classList.remove('dark');
      rootBody.classList.remove('dark');
      rootHtml.style.colorScheme = 'light';
      rootBody.style.backgroundColor = '#f8fafc';
      rootBody.style.color = '#0f172a';
    }
    localStorage.setItem('yanadu_dark_mode', String(darkMode));
  }, [darkMode]);

  const [accent, setAccent] = useState<'en-US' | 'en-GB' | 'en-AU' | 'en-IN'>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(0.75);
  const [dictQuery, setDictQuery] = useState<string>('');
  const [liveDictResult, setLiveDictResult] = useState<{
    word: string;
    phonetic: string;
    definition: string;
    example: string;
  } | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState<boolean>(false);

  const [showAllKoreanPron, setShowAllKoreanPron] = useState<boolean>(true);
  const [revealedPronKeys, setRevealedPronKeys] = useState<string[]>([]);
  const [hideWordMode, setHideWordMode] = useState<boolean>(false);
  const [hideMeaningMode, setHideMeaningMode] = useState<boolean>(false);
  const [revealedWordIds, setRevealedWordIds] = useState<number[]>([]);
  const [revealedChallengeIdx, setRevealedChallengeIdx] = useState<number[]>([]);

  const handleSelectLevel = (lvl: LearningLevel) => {
    setLearningLevel(lvl);
    setCustomDissectSentence(null);
    if (lvl === 'beginner') {
      setSpeechRate(0.75);
      setShowAllKoreanPron(true);
      setHideMeaningMode(false);
      setActiveDiagramSentenceIdx(0);
    } else if (lvl === 'intermediate') {
      setSpeechRate(0.9);
      setShowAllKoreanPron(false);
      setHideMeaningMode(false);
      setActiveDiagramSentenceIdx(1);
    } else {
      setSpeechRate(1.0);
      setShowAllKoreanPron(false);
      setActiveDiagramSentenceIdx(2);
    }
  };

  // ==========================================================================
  // 🗂️ [업그레이드] 양방향 단어·문장 보관함 & 직접 수정 & 암기완료 토글 시스템
  // ==========================================================================
  const [wordbookLevel, setWordbookLevel] = useState<
    '중등 필수' | '고등·수능 핵심' | '비즈니스·실무' | '오픽(OPIc)·구동사'
  >('고등·수능 핵심');
  const [wordbookDay, setWordbookDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yanadu_completed_days');
      if (saved) return JSON.parse(saved);
    }
    return ['중등 필수-1', '고등·수능 핵심-1'];
  });

  // [핵심 수리] 암기 완료 버튼을 다시 누르면 언제든 완료가 해제되는 양방향 토글 함수!
  const toggleCompletedDay = (dayKey: string) => {
    setCompletedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((k) => k !== dayKey) : [...prev, dayKey]
    );
  };

  const [bookmarkedWords, setBookmarkedWords] = useState<
    {
      word: string;
      ipa: string;
      meaning: string;
      collocation: string;
      posLabel: string;
      compLabel: string;
      levelBadge?: string;
      customNote?: string;
      mastered?: boolean;
    }[]
  >(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yanadu_bookmarks');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        word: 'perspective',
        ipa: '/pəˈspek.tɪv/',
        meaning: '관점, 시각 (수능·내신 1순위)',
        collocation: 'broaden our perspective',
        posLabel: '명사 (Noun)',
        compLabel: '직접목적어 (DO)',
        levelBadge: '수능1등급',
        customNote: 'broaden / expand 와 항상 짝꿍으로 쓰임!',
        mastered: false,
      },
      {
        word: 'feasible',
        ipa: '/ˈfiː.zə.bəl/',
        meaning: '실현 가능한 (406개교 5형식 보어 기출)',
        collocation: 'make the project feasible',
        posLabel: '형용사 (Adj)',
        compLabel: '목적격보어 (OC)',
        levelBadge: '내신서술형',
        customNote: '5형식 make 목적격보어 자리에 부사(feasibly) 쓰면 오답!',
        mastered: false,
      },
    ];
  });

  // [신규 탑재] 내가 저장한 문장·구문 보관함 (회화·실검·수능·내신 모든 문장 저장 및 수정 가능!)
  const [savedSentences, setSavedSentences] = useState<SavedSentenceItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yanadu_saved_sentences');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: 'init-sent-1',
        en: 'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
        ko: '우리가 안전지대를 벗어나서야 비로소 시야를 진정으로 넓힐 수 있다.',
        note: '[수능·내신 1순위] 부정어 Not until 문두 이동 ➔ can we 동사원형 도치 주의!',
        category: '수능·내신 킬러구문',
        mastered: false,
      },
      {
        id: 'init-sent-2',
        en: 'You really pull off that effortlessly chic tailored look!',
        ko: '그 꾸안꾸 시크 테일러드 룩을 정말 완벽하게 소화하시네요!',
        note: 'pull off(멋지게 소화하다) + effortlessly chic(꾸안꾸 시크)',
        category: '실전 회화·패션',
        mastered: false,
      },
    ];
  });

  // 단어 & 문장 수정용 상태
  const [editingWordIdx, setEditingWordIdx] = useState<number | null>(null);
  const [editWordMeaning, setEditWordMeaning] = useState<string>('');
  const [editWordCollocation, setEditWordCollocation] = useState<string>('');
  const [editWordNote, setEditWordNote] = useState<string>('');

  const [editingSentId, setEditingSentId] = useState<string | null>(null);
  const [editSentEn, setEditSentEn] = useState<string>('');
  const [editSentKo, setEditSentKo] = useState<string>('');
  const [editSentNote, setEditSentNote] = useState<string>('');

  // 새 단어 / 새 문장 직접 추가용 입력 상태
  const [newCustomWord, setNewCustomWord] = useState<string>('');
  const [newCustomWordMeaning, setNewCustomWordMeaning] = useState<string>('');
  const [newCustomWordNote, setNewCustomWordNote] = useState<string>('');
  const [newCustomSentEn, setNewCustomSentEn] = useState<string>('');
  const [newCustomSentKo, setNewCustomSentKo] = useState<string>('');
  const [newCustomSentNote, setNewCustomSentNote] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yanadu_bookmarks', JSON.stringify(bookmarkedWords));
    }
  }, [bookmarkedWords]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yanadu_saved_sentences', JSON.stringify(savedSentences));
    }
  }, [savedSentences]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yanadu_completed_days', JSON.stringify(completedDays));
    }
  }, [completedDays]);

  const toggleSaveSentence = (item: Omit<SavedSentenceItem, 'id' | 'mastered'>) => {
    setSavedSentences((prev) => {
      const exists = prev.some((s) => s.en === item.en);
      if (exists) return prev.filter((s) => s.en !== item.en);
      return [
        {
          id: `sent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...item,
          mastered: false,
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDate = localStorage.getItem('yanadu_last_study_date');
    if (savedDate !== todayKey) {
      const nextTheme = THEMES[dayOfYear % THEMES.length].id;
      const nextWbDay = (dayOfYear % 100) + 1;
      const todayPlat = INITIAL_MEDIA_PLATFORMS[dayOfYear % INITIAL_MEDIA_PLATFORMS.length];
      const todayKw = todayPlat.keywords[dayOfYear % todayPlat.keywords.length];

      setSelectedThemeId(nextTheme);
      setWordbookDay(nextWbDay);
      setSelectedLiveKeyword({
        platformName: todayPlat.name,
        rank: todayKw.rank,
        koTitle: todayKw.koTitle,
        enExpression: todayKw.enExpression,
        extUrl: todayKw.extUrl,
      });
      localStorage.setItem('yanadu_last_study_date', todayKey);
    }
  }, [todayKey, dayOfYear]);

  const handleRefreshLiveTrends = async () => {
    setIsRefreshingTrends(true);
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} 실시간 반영됨`;

    try {
      const res = await fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko'
      );
      let liveHeadlines: string[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data?.items?.length) {
          liveHeadlines = data.items
            .slice(0, 5)
            .map((it: { title: string }) => it.title.split(' - ')[0]);
        }
      }

      setMediaPlatforms((prev) =>
        prev.map((plat) => {
          const rotated = [...plat.keywords]
            .sort(() => Math.random() - 0.5)
            .map((k, idx) => {
              if (
                plat.id === 'GOOGLE_TRENDS' &&
                idx < liveHeadlines.length &&
                liveHeadlines[idx]
              ) {
                return {
                  ...k,
                  rank: idx + 1,
                  koTitle: `[실시간] ${liveHeadlines[idx]}`,
                };
              }
              return {
                ...k,
                rank: idx + 1,
              };
            });
          return { ...plat, keywords: rotated };
        })
      );
      setLastTrendSyncTime(timeLabel);
    } catch {
      setMediaPlatforms((prev) =>
        prev.map((plat) => ({
          ...plat,
          keywords: [...plat.keywords]
            .reverse()
            .map((k, idx) => ({ ...k, rank: idx + 1 })),
        }))
      );
      setLastTrendSyncTime(timeLabel);
    } finally {
      setIsRefreshingTrends(false);
    }
  };

  const [diagramTab, setDiagramTab] = useState<'all' | 'comp' | 'pos'>('all');
  const [selectedComp, setSelectedComp] = useState<CompId | null>('DO');
  const [selectedPos, setSelectedPos] = useState<PosId | null>('N');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(0);

  // ==========================================================================
  // ✏️ [완벽 수리] 아이패드 사파리 파란블록 원천차단 + 첫 획 지연 0초 + 4종 펜슬 & 굵기 대폭 확대
  // ==========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padWrapperRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [isFloatingPad, setIsFloatingPad] = useState<boolean>(true);
  const [isPadLocked, setIsPadLocked] = useState<boolean>(true);
  const [isPadMinimized, setIsPadMinimized] = useState<boolean>(false);
  // ✋ 기본값을 아예 '펜슬 전용(손바닥 무시 ON)'으로 설정!
  const [penOnlyMode, setPenOnlyMode] = useState<boolean>(true);
  // 4종 펜슬 스타일: 만년필(fountain) | 굵은 수성사인펜(marker) | 볼펜(ballpoint) | 형광펜(highlighter) | 지우개(eraser)
  const [penType, setPenType] = useState<
    'fountain' | 'marker' | 'ballpoint' | 'highlighter' | 'eraser'
  >('marker');
  const [penColor, setPenColor] = useState<'#2563eb' | '#0f172a' | '#10b981' | '#e11d48'>('#2563eb');
  // 굵기 기본값을 6px(중간 굵기)로 올리고 3px ~ 24px까지 5단계 지원!
  const [penWidth, setPenWidth] = useState<number>(6);
  const [padHeight, setPadHeight] = useState<number>(210);

  // iOS 사파리에서 손바닥이 닿을 때 파랗게 블록 선택되는 현상을 네이티브 레벨에서 100% 차단!
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = padWrapperRef.current;
    if (!canvas || !wrapper) return;

    const blockSafariTouchAndSelect = (e: Event) => {
      if (isPadLocked) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', blockSafariTouchAndSelect, { passive: false });
    canvas.addEventListener('touchmove', blockSafariTouchAndSelect, { passive: false });
    canvas.addEventListener('selectstart', blockSafariTouchAndSelect);
    canvas.addEventListener('contextmenu', blockSafariTouchAndSelect);
    wrapper.addEventListener('selectstart', blockSafariTouchAndSelect);
    wrapper.addEventListener('contextmenu', blockSafariTouchAndSelect);

    return () => {
      canvas.removeEventListener('touchstart', blockSafariTouchAndSelect);
      canvas.removeEventListener('touchmove', blockSafariTouchAndSelect);
      canvas.removeEventListener('selectstart', blockSafariTouchAndSelect);
      canvas.removeEventListener('contextmenu', blockSafariTouchAndSelect);
      wrapper.removeEventListener('selectstart', blockSafariTouchAndSelect);
      wrapper.removeEventListener('contextmenu', blockSafariTouchAndSelect);
    };
  }, [isPadLocked, isPadMinimized]);

  // 캔버스 해상도 동기화 (창 크기가 바뀔 때만 실행하고, 펜슬이 닿을 때는 절대 실행하지 않아 첫 획 렉 0초!)
  const syncCanvasResolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { desynchronized: true });
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(
            tempCanvas,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height,
            0,
            0,
            rect.width,
            rect.height
          );
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => syncCanvasResolution(), 60);
    window.addEventListener('resize', syncCanvasResolution);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', syncCanvasResolution);
    };
  }, [isFloatingPad, isPadMinimized, padHeight, layoutMode, activeMode]);

  const getExactPointerPos = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // [초고속 즉각 반응] 펜촉이 닿는 즉시 0.001초 만에 선을 그립니다!
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPadLocked) return;
    // 손바닥 무시(penOnlyMode)가 켜져 있을 때 손가락/손바닥(touch)은 즉시 차단하고 선택 효과도 막음
    if (penOnlyMode && e.pointerType === 'touch') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getExactPointerPos(canvas, e.clientX, e.clientY);
    isDrawingRef.current = true;
    lastPointRef.current = pos;

    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    const actualColor =
      penColor === '#0f172a' && darkMode ? '#f8fafc' : penColor;

    if (penType === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(28, penWidth * 3.5);
    } else if (penType === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = '#facc15';
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
      ctx.lineWidth = Math.max(20, penWidth * 2.8);
    } else if (penType === 'marker') {
      // 🖊️ 굵은 수성 사인펜: 필압과 무관하게 묵직하고 선명한 굵기 유지!
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = actualColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = penWidth * 1.35;
    } else if (penType === 'fountain') {
      // ✒️ 만년필: 애플 펜슬 필압에 따라 굵기가 다이내믹하게 변화
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = actualColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const pressureFactor =
        e.pointerType === 'pen' && e.pressure > 0 ? 0.6 + e.pressure * 1.5 : 1.1;
      ctx.lineWidth = penWidth * pressureFactor;
    } else {
      // ✏️ 부드러운 볼펜
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = actualColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = penWidth;
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.05, pos.y + 0.05);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isPadLocked) return;
    if (penOnlyMode && e.pointerType === 'touch') {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    if (penType === 'fountain' && e.pointerType === 'pen' && e.pressure > 0) {
      ctx.lineWidth = penWidth * (0.6 + e.pressure * 1.5);
    }

    const nativeEvt = e.nativeEvent as PointerEvent;
    const events =
      typeof nativeEvt.getCoalescedEvents === 'function'
        ? nativeEvt.getCoalescedEvents()
        : [nativeEvt];

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    }

    for (const ev of events) {
      const pt = getExactPointerPos(canvas, ev.clientX, ev.clientY);
      ctx.lineTo(pt.x, pt.y);
      lastPointRef.current = pt;
    }
    ctx.stroke();
  };

  const endDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const [quizLevelTab, setQuizLevelTab] = useState<
    'word' | 'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [selectedBeginnerOpt, setSelectedBeginnerOpt] = useState<number | null>(null);
  const [selectedInterOpt, setSelectedInterOpt] = useState<number | null>(null);
  const [showInterHint, setShowInterHint] = useState<boolean>(false);
  const [selectedAdvOpts, setSelectedAdvOpts] = useState<number[]>([]);
  const [userWritingMission, setUserWritingMission] = useState<string>('');

  const [targetSpeakingMins, setTargetSpeakingMins] = useState<number>(5);
  const [, setSpeakingSeconds] = useState<number>(0);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'coach',
      text: 'Welcome! Safari blue palm-selection is now 100% blocked, pen thickness is up to 24px with 4 pen styles, and you can edit/uncheck any saved word or sentence!',
      nuanceTip: '이제 손바닥이 닿아도 파랗게 변하지 않고 즉각 써지며, 저장한 단어·문장을 자유롭게 수정하고 암기 완료도 언제든 해제할 수 있습니다!',
    },
  ]);
  const [correctionInput, setCorrectionInput] = useState<string>('');
  const [correctionResult, setCorrectionResult] = useState<{
    original: string;
    naturalEn: string;
    wordOrderFix: string;
    grammarExplanation: string;
    opicUpgrade: string;
  } | null>(null);
  const [studyStats, setStudyStats] = useState({
    masteredWords: 120,
    completedSentences: 64,
    quizAccuracy: 96,
    speakingMinutes: 55,
    streakDays: 12,
  });

  const baseTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  const currentTheme: ThemeData = (() => {
    if (!selectedLiveKeyword) return baseTheme;

    const kwEn = selectedLiveKeyword.enExpression;
    const kwKo = selectedLiveKeyword.koTitle;
    const kwFirstWord = kwEn.split(' ')[0] || 'trend';

    const liveVocabItem: VocabItem = {
      id: 0,
      type: '일상 회화',
      recommendLevel: learningLevel,
      word: kwEn,
      masked: `${kwFirstWord.slice(0, 2)} ⬛ ⬛ ⬛`,
      ipa: '/실시간 트렌드 핵심 표현/',
      pron: `[실시간 키워드 발음 듣기 🔊]`,
      soundMethod: `앞 단어 끝소리와 뒤 단어 첫 모음을 한 호흡의 소리블럭(${kwEn})으로 부드럽게 이어 발음합니다.`,
      soundBlock: `${kwFirstWord} / ${kwEn.split(' ').slice(1).join(' ') || 'now'}`,
      meaning: `[실검 ${selectedLiveKeyword.rank}위] ${kwKo}`,
      enDef: `Live Trend Expression from ${selectedLiveKeyword.platformName}`,
      exampleBlank: `Let us practice how to ______ in our daily conversation.`,
      pos: 'V',
      posLabel: '핵심 표현 블록 (V/N)',
      comp: 'DO',
      compLabel: '핵심 성분 (V·DO)',
      roleDesc: '방금 왼쪽 실시간 트렌드에서 선택한 최우선 집중 학습 표현',
      collocation: kwEn,
      collocationKo: kwKo,
      paraphraseTip: `[실시간 연동 완료] 클릭하신 "${kwKo}" 이슈를 아래 직독직해와 16개 해부 카드로 즉시 학습합니다!`,
    };

    const liveSentence: TrainingSentence = {
      id: 0,
      levelTag: learningLevel,
      tag: `🔥 [실시간 ${selectedLiveKeyword.rank}위 집중 문장] ${selectedLiveKeyword.platformName}`,
      targetWord: kwEn,
      wordOrderFormula: `[도입 패턴] + [실시간 핵심 표현 (${kwEn})] + [실전 상황 수식어(M)]`,
      structure: '주어(S) + 동사(V) + 실시간 타겟 표현(DO/SC) + 수식어(M)',
      soundBlockEn:
        learningLevel === 'beginner'
          ? `We really need / to focus on / ${kwEn} / today.`
          : learningLevel === 'intermediate'
          ? `Everyone is talking about / how to ${kwEn} / effectively.`
          : `I was wondering if we could / ${kwEn} / from a broader perspective.`,
      soundMethodGuide: `방금 선택하신 실시간 검색어 "${kwEn}"에 가장 강한 강세를 실어 또렷하게 발음하세요!`,
      ipaLine: `/Live Trend Sentence — ${kwEn}/`,
      koLine: `오늘의 핫이슈(S) / [${kwKo}] 표현을(DO) / 실전 문장으로 완벽히 소화합니다(V+M).`,
      enLine:
        learningLevel === 'beginner'
          ? `We really need(S+V) / to focus on [${kwEn}](DO) / today(M).`
          : learningLevel === 'intermediate'
          ? `Everyone is talking about(S+V) / how to [${kwEn}](O) / right now(M).`
          : `I was wondering(S+V) / if we could [${kwEn}](O) / effortlessly(M).`,
      rawEn:
        learningLevel === 'beginner'
          ? `We really need to focus on ${kwEn} today.`
          : learningLevel === 'intermediate'
          ? `Everyone is talking about how to ${kwEn} right now.`
          : `I was wondering if we could ${kwEn} effortlessly.`,
      pronLine: `[실시간 문장 발음: 위 🔊 듣기 버튼을 눌러 원어민 연음을 확인하세요]`,
      naturalKo: `[실시간 ${selectedLiveKeyword.rank}위 응용] 우리는 오늘 "${kwKo} (${kwEn})" 주제를 실전 영어로 자연스럽게 구사할 수 있습니다.`,
      paraphraseVersion: `What I love most is that we can apply "${kwEn}" right away in real life.`,
      grammarPoint: `왼쪽에서 클릭하신 실시간 키워드(${kwEn})가 문장의 핵심 목적어/동사구 블록으로 자동 결합되었습니다.`,
      contextNuance: `${selectedLiveKeyword.platformName} 실시간 ${selectedLiveKeyword.rank}위 화젯거리를 원어민 스몰톡으로 즉시 연결한 문장입니다.`,
    };

    return {
      ...baseTheme,
      title: `🔥 [${selectedLiveKeyword.platformName} ${selectedLiveKeyword.rank}위] ${kwKo}`,
      badge: `실시간 트렌드 연동 · ${baseTheme.badge}`,
      levelTracks: {
        beginner: {
          ...baseTheme.levelTracks.beginner,
          patternEn: `Let us practice / "${kwEn}" / step by step!`,
          patternSoundBlock: `Let us practice / ${kwEn} / step by step!`,
          patternMeaningKo: `[실시간 초급] "${kwKo}" 표현을 단계별로 쉽게 연습해 봅시다!`,
        },
        intermediate: {
          ...baseTheme.levelTracks.intermediate,
          patternEn: `Everyone is talking about / ${kwEn} / these days.`,
          patternSoundBlock: `Everyone is talking about / ${kwEn} / these days.`,
          patternMeaningKo: `[실시간 중급] 요즘 모두가 "${kwKo}"에 대해 이야기하고 있습니다.`,
        },
        advanced: {
          ...baseTheme.levelTracks.advanced,
          patternEn: `I was wondering if we could apply / "${kwEn}" / effectively.`,
          patternSoundBlock: `I was wondering / if we could apply / ${kwEn} / effectively.`,
          patternMeaningKo: `[실시간 고급] "${kwKo}" 트렌드를 실무와 일상에 효과적으로 적용해 볼 수 있을지 논의해 보고 싶습니다.`,
        },
      },
      vocab: [liveVocabItem, ...baseTheme.vocab.slice(0, 9)],
      sentences: [liveSentence, ...baseTheme.sentences],
      quiz: {
        ...baseTheme.quiz,
        intermediate: {
          sentenceBefore: 'Everyone is talking about how to',
          sentenceAfter: 'in today’s trending issue.',
          hint: `방금 왼쪽에서 클릭하신 [${selectedLiveKeyword.platformName} ${selectedLiveKeyword.rank}위: ${kwKo}] 영어 표현입니다!`,
          options: [kwEn, 'take a rain check', 'miss the boat', 'call it a day'],
          answerIdx: 0,
          explanation: `방금 선택하신 실시간 트렌드 ${selectedLiveKeyword.rank}위 표현인 "${kwEn}"(${kwKo})이 정답입니다!`,
        },
      },
    };
  })();

  const currentLevelTrack = currentTheme.levelTracks[learningLevel];
  const currentExamCourse =
    EXAM_MASTER_COURSES.find((c) => c.id === selectedExamTrack) || EXAM_MASTER_COURSES[0];

  const activeSentenceForDiagram = customDissectSentence
    ? {
        rawEn: customDissectSentence.en,
        naturalKo: customDissectSentence.ko,
        tag: customDissectSentence.title,
      }
    : currentTheme.sentences[activeDiagramSentenceIdx] || currentTheme.sentences[0];

  const currentDiagramEx: DiagramSentence = buildDynamicDiagramSentence(
    activeSentenceForDiagram.rawEn,
    activeSentenceForDiagram.naturalKo,
    activeSentenceForDiagram.tag
  );

  const currentMediaObj =
    mediaPlatforms.find((m) => m.id === activeMediaPlatform) || mediaPlatforms[0];

  useEffect(() => {
    setSelectedBeginnerOpt(null);
    setSelectedInterOpt(null);
    setShowInterHint(false);
    setSelectedAdvOpts([]);
    setRevealedWordIds([]);
    setActiveDiagramSentenceIdx(0);
    setSelectedTokenIdx(0);
    setCustomDissectSentence(null);
  }, [selectedThemeId, selectedLiveKeyword]);

  useEffect(() => {
    if (!isVoiceActive) return;
    const timer = setInterval(() => {
      setSpeakingSeconds((prev) => {
        if (prev + 1 >= targetSpeakingMins * 60) {
          setIsVoiceActive(false);
          return targetSpeakingMins * 60;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVoiceActive, targetSpeakingMins]);

  const toggleKoreanPron = (key: string) => {
    setRevealedPronKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isPronVisible = (key: string) => showAllKoreanPron || revealedPronKeys.includes(key);

  const toggleBookmark = (item: {
    word: string;
    ipa: string;
    meaning: string;
    collocation: string;
    posLabel: string;
    compLabel: string;
    levelBadge?: string;
  }) => {
    setBookmarkedWords((prev) => {
      const exists = prev.some((b) => b.word === item.word);
      if (exists) return prev.filter((b) => b.word !== item.word);
      setStudyStats((s) => ({ ...s, masteredWords: s.masteredWords + 1 }));
      return [{ ...item, customNote: '', mastered: false }, ...prev];
    });
  };

  const fetchLiveDictionary = async (wordToSearch: string) => {
    const clean = wordToSearch.trim().split(' ')[0];
    if (!clean) return;
    setIsLoadingDict(true);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`
      );
      if (res.ok) {
        const data = await res.json();
        const first = data[0];
        const meaningObj = first?.meanings?.[0]?.definitions?.[0];
        setLiveDictResult({
          word: first?.word || clean,
          phonetic: first?.phonetic || first?.phonetics?.[0]?.text || '/발음기호/',
          definition: meaningObj?.definition || '영영 사전 정의를 불러왔습니다.',
          example:
            meaningObj?.example ||
            `Let us practice using "${clean}" in our ${learningLevel} track.`,
        });
      } else {
        setLiveDictResult({
          word: clean,
          phonetic: '/실전 구어/입시 핵심 표현/',
          definition: '원어민 실전 구동사·수능 핵심 표현입니다. 우측 네이버/구글 사전 버튼으로 상세 예문을 확인하세요.',
          example: `You really pulled off "${clean}" effortlessly!`,
        });
      }
    } catch {
      setLiveDictResult({
        word: clean,
        phonetic: '/사전 안내/',
        definition: '우측 사전 바로가기 링크를 이용해 주세요.',
        example: `Practice "${clean}" step by step.`,
      });
    } finally {
      setIsLoadingDict(false);
    }
  };

  const speakText = (
    text: string,
    customAccent?: 'en-US' | 'en-GB' | 'en-AU' | 'en-IN',
    customRate?: number
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[|\]|"/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = customAccent || accent;
    utterance.lang = targetLang;
    utterance.rate = customRate || speechRate;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.includes(targetLang));
    if (matchedVoice) utterance.voice = matchedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const getGoogleTranslateUrl = (text: string) => {
    const clean = text.replace(/\[|\]/g, '');
    return `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(clean)}&op=translate`;
  };

  const getNaverDictUrl = (text: string) => {
    const clean = text.replace(/\[|\]/g, '');
    return `https://en.dict.naver.com/#/search?query=${encodeURIComponent(clean)}`;
  };

  const handleRunCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = correctionInput.trim();
    if (!raw) return;
    const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
    const withPeriod =
      capitalized.endsWith('.') || capitalized.endsWith('?')
        ? capitalized
        : `${capitalized}.`;

    setCorrectionResult({
      original: raw,
      naturalEn: `[수능·내신 서술형 패러프레이징] ${currentLevelTrack.patternEn.replace('~', raw)}`,
      wordOrderFix:
        '서술형 감점 방지 점검: [주어(S) + 동사(V) + 목적어(DO)/보어(SC·OC)] 수일치와 5형식 보어 품사(형용사)를 확인하세요.',
      grammarExplanation: `입력하신 "${withPeriod}" 문장을 외운 답이 아닌 구조적 어순으로 변형하면 내신 서술형 만점 답안이 됩니다.`,
      opicUpgrade: `[고급 확장] Not only does it clarify the meaning, but ${withPeriod}`,
    });
    setStudyStats((s) => ({ ...s, completedSentences: s.completedSentences + 1 }));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    const userTurn: ChatTurn = { role: 'user', text: msg };
    const coachReply: ChatTurn = {
      role: 'coach',
      text: `[${learningLevel.toUpperCase()} COACH] Great structure! "${msg}" shows strong command of word order. Try transforming it with "${currentTheme.vocab[0].collocation}"!`,
      correction: `💡 레벨업 & 서술형 추천 표현: "${currentLevelTrack.patternEn}"`,
      nuanceTip: `현재 배속(${speechRate}x)에 맞춰 의미단위(소리블럭)로 끊어 읽어보세요!`,
    };
    setChatHistory((prev) => [...prev, userTurn, coachReply]);
    setChatInput('');
    speakText(coachReply.text);
  };

  const renderHighlightedSentence = (line: string) => {
    const parts = line.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const word = part.slice(1, -1);
        return (
          <strong
            key={idx}
            className="underline decoration-2 decoration-blue-500 underline-offset-4 font-extrabold text-blue-600 dark:text-yellow-300 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70"
          >
            {word}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const fontClass =
    fontStyle === 'serif'
      ? 'font-serif'
      : fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const themeAccentBg =
    colorTheme === 'emerald'
      ? 'bg-emerald-600'
      : colorTheme === 'indigo'
      ? 'bg-indigo-600'
      : colorTheme === 'amber'
      ? 'bg-amber-600'
      : 'bg-blue-600';

  const filteredWordbook = getExpandedWordbookByDay(wordbookLevel, wordbookDay);
  const generatedSyntaxList = generateCombinatorialSentences(syntaxSeed, 12);
  const customPassageAnalysis = analyzeCustomSchoolPassage(customSchoolText);
  const examVocabTestList = getExpandedWordbookByDay('고등·수능 핵심', vocabQuizSeed);
  // ==========================================================================
  // [마지막 4파트] 파란블록 원천차단 4종 펜슬장 + 양방향 보관함(수정·완료해제) + 제작백서 UI
  // ==========================================================================
  return (
    <div
      className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} ${fontClass} min-h-screen`}
    >
      <style>{`
        /* 아이패드 사파리 손바닥 접촉 시 파랗게 블록 선택되는 현상 원천 차단 */
        .no-safari-select, .no-safari-select * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        @media print {
          .no-print { display: none !important; }
          .print-container {
            width: 210mm !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 10mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        {/* ====================================================================
            좌측 사이드바: 9대 매체 실시간 새로고침 + 수능·내신 1등급 바로가기 + 5단계 배속
        ==================================================================== */}
        <aside
          className={`no-print w-80 flex-shrink-0 border-r flex flex-col h-full select-none transition-colors ${
            darkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded text-white ${themeAccentBg}`}>
                  8,000단어+무한구문
                </span>
                <h1 className="text-base font-extrabold tracking-tight">나만의 야나두 PRO</h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                📅 {todayDateStr} · 실시간 연동 ON
              </p>
            </div>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition ${
                darkMode
                  ? 'bg-yellow-400 text-slate-950 border-yellow-400'
                  : 'bg-slate-900 text-white border-slate-900'
              }`}
            >
              {darkMode ? '☀️ 라이트' : '🌙 다크'}
            </button>
          </div>

          <div className="p-3 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                수능·내신 1등급 마스터
              </span>
              <span className="text-[10px] text-blue-200 font-bold">1~5교시 무제한 문제</span>
            </div>
            <div className="text-xs font-extrabold leading-snug">
              🎓 외운 답이 아닌 스스로 답을 만드는 영어!
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {[
                { id: 'CSAT_MASTER' as ExamTrackId, label: '수능완성반' },
                { id: 'GRAMMAR_ESSAY' as ExamTrackId, label: '어법·서술형' },
                { id: 'SCHOOL_INTERNAL' as ExamTrackId, label: '학교별내신' },
              ].map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    setSelectedExamTrack(tr.id);
                    setActiveMode('examMaster');
                  }}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold transition ${
                    activeMode === 'examMaster' && selectedExamTrack === tr.id
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-white'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-900 text-white border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>💚 실시간 영영·네이버 사전 허브</span>
              <span className="text-emerald-400">Live API</span>
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLiveDictionary(dictQuery)}
                placeholder="단어 검색 (예: feasible, perspective)"
                className="flex-1 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => fetchLiveDictionary(dictQuery || currentTheme.vocab[0].word)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg"
              >
                {isLoadingDict ? '...' : '검색'}
              </button>
            </div>

            {liveDictResult && (
              <div className="p-2.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 text-xs">
                    {liveDictResult.word}{' '}
                    <span className="text-slate-300 font-mono">{liveDictResult.phonetic}</span>
                  </strong>
                  <button
                    onClick={() => setLiveDictResult(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-slate-200">{liveDictResult.definition}</p>
                <p className="text-blue-300 italic">"{liveDictResult.example}"</p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center">
              <a
                href={getNaverDictUrl(dictQuery || currentTheme.vocab[0].word)}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-emerald-300"
              >
                N영어사전
              </a>
              <a
                href="https://en.dict.naver.com/#/enendict/home"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-200"
              >
                영영사전
              </a>
              <a
                href="https://papago.naver.com/"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-slate-200"
              >
                파파고
              </a>
              <a
                href={getGoogleTranslateUrl(dictQuery || currentLevelTrack.patternEn)}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-blue-300"
              >
                구글번역
              </a>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div
              className={`p-3 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-100/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold">🔥 9대 매체 실시간 트렌드 TOP 10</span>
                <button
                  onClick={handleRefreshLiveTrends}
                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
                >
                  <span>{isRefreshingTrends ? '⏳ 갱신중...' : '🔄 실시간 새로고침'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                <span>⏱️ {lastTrendSyncTime}</span>
                <a
                  href={currentMediaObj.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-bold underline"
                >
                  매체 원문↗
                </a>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-2.5">
                {mediaPlatforms.map((mp) => (
                  <button
                    key={mp.id}
                    onClick={() => setActiveMediaPlatform(mp.id)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-extrabold truncate transition ${
                      activeMediaPlatform === mp.id
                        ? mp.badgeColor
                        : darkMode
                        ? 'bg-slate-900 text-slate-300 border border-slate-700'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {mp.shortName}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {currentMediaObj.keywords.map((kw) => {
                  const isKwActive =
                    selectedLiveKeyword?.koTitle === kw.koTitle &&
                    selectedLiveKeyword?.rank === kw.rank;
                  return (
                    <div
                      key={kw.rank}
                      onClick={() => {
                        setSelectedThemeId(kw.targetThemeId);
                        setSelectedLiveKeyword({
                          platformName: currentMediaObj.shortName,
                          rank: kw.rank,
                          koTitle: kw.koTitle,
                          enExpression: kw.enExpression,
                          extUrl: kw.extUrl,
                        });
                        setActiveMode('daily');
                        setActiveDiagramSentenceIdx(0);
                        speakText(kw.enExpression);
                        fetchLiveDictionary(kw.enExpression);
                      }}
                      className={`group flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                        isKwActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow'
                          : darkMode
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
                          : 'bg-white hover:bg-blue-50 border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                            isKwActive
                              ? 'bg-white text-blue-700'
                              : kw.rank <= 3
                              ? `${themeAccentBg} text-white`
                              : darkMode
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {kw.rank}
                        </span>
                        <div className="truncate">
                          <div className="text-[11px] font-bold truncate">{kw.koTitle}</div>
                          <div
                            className={`text-[10px] font-semibold truncate ${
                              isKwActive ? 'text-yellow-300' : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            🗣️ {kw.enExpression}
                          </div>
                        </div>
                      </div>
                      <a
                        href={kw.extUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 flex-shrink-0"
                      >
                        ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase">
                  📚 5대 정규 커리큘럼 (초·중·고급)
                </p>
                {selectedLiveKeyword && (
                  <button
                    onClick={() => setSelectedLiveKeyword(null)}
                    className="text-[10px] font-extrabold text-rose-500 underline"
                  >
                    실검모드 해제
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {THEMES.map((theme) => {
                  const isSel =
                    theme.id === selectedThemeId &&
                    !selectedLiveKeyword &&
                    activeMode === 'daily';
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedLiveKeyword(null);
                        setSelectedThemeId(theme.id);
                        setActiveMode('daily');
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border transition ${
                        isSel
                          ? `${themeAccentBg} text-white border-transparent shadow`
                          : darkMode
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-100'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold opacity-85">
                        <span>{theme.badge}</span>
                      </div>
                      <div className="text-xs font-extrabold mt-0.5">{theme.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border space-y-2 ${
                darkMode
                  ? 'bg-slate-800/70 border-slate-700'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span>🎚️ 리딩 속도 5단계 세분화 제어</span>
                <span className="text-blue-600 dark:text-blue-400">{speechRate}x</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-extrabold">
                {[
                  { rate: 0.75, label: '0.75x\n초급느림' },
                  { rate: 0.85, label: '0.85x\n연음훈련' },
                  { rate: 1.0, label: '1.0x\n실전표준' },
                  { rate: 1.15, label: '1.15x\n빠른청해' },
                  { rate: 1.25, label: '1.25x\n고급도전' },
                ].map((r) => (
                  <button
                    key={r.rate}
                    onClick={() => {
                      setSpeechRate(r.rate);
                      speakText(currentLevelTrack.patternEn, accent, r.rate);
                    }}
                    className={`py-1.5 px-1 rounded-lg border whitespace-pre-line leading-tight text-center transition ${
                      speechRate === r.rate
                        ? `${themeAccentBg} text-white border-transparent`
                        : darkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ====================================================================
            우측 메인 영역: 상단 헤더 + 본문 + 따라다니는 4종 펜슬 메모장
        ==================================================================== */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header
            className={`no-print border-b px-5 py-3 space-y-2.5 transition-colors ${
              darkMode
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  🎯 레벨 스위치:
                </span>
                <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {[
                    { id: 'beginner' as LearningLevel, label: '🌱 초급 (0.75x 느림)' },
                    { id: 'intermediate' as LearningLevel, label: '🌿 중급 (바꿔 말하기)' },
                    { id: 'advanced' as LearningLevel, label: '🌳 고급 (긴 대화·비평)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => handleSelectLevel(lvl.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        learningLevel === lvl.id
                          ? `${themeAccentBg} text-white shadow`
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveMode('naverQuiz')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold"
                >
                  🗂️ 보관함 (단어 {bookmarkedWords.length} · 문장 {savedSentences.length} · 완료 {completedDays.length}일)
                </button>
                <button
                  onClick={() => {
                    setIsFloatingPad(!isFloatingPad);
                    setIsPadMinimized(false);
                  }}
                  className={`px-3 py-1 rounded-lg border font-extrabold transition ${
                    isFloatingPad
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isFloatingPad ? '📌 따라다니는 펜슬장 ON' : '📌 펜슬장 하단고정'}
                </button>
                <button
                  onClick={() => setIsPadLocked(!isPadLocked)}
                  className={`px-3 py-1 rounded-lg border font-extrabold transition ${
                    isPadLocked
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-emerald-600 text-white border-emerald-600'
                  }`}
                >
                  {isPadLocked ? '🔒 메모장 락(필기고정)' : '🔓 락 해제(스크롤)'}
                </button>
                <button
                  onClick={() => setShowAllKoreanPron(!showAllKoreanPron)}
                  className={`px-2.5 py-1 rounded-lg border font-extrabold ${
                    showAllKoreanPron
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {showAllKoreanPron ? '👁️ 한글발음' : '🙈 발음가림'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'daily', label: '📝 일일 강의 & 16매핑' },
                  { id: 'examMaster', label: '🎓 수능·내신 1등급 (1~5교시)' },
                  { id: 'wordbook', label: '📘 8,000단어장 (Day 1~100)' },
                  { id: 'naverQuiz', label: '🗂️ 내 보관함·수정·완료관리' },
                  { id: 'aiCoach', label: '🎙️ AI 회화·첨삭' },
                  { id: 'weekly', label: '🗓️ 전체 총람' },
                  { id: 'devStory', label: '🛠️ 제작과정 백서' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMode(tab.id as typeof activeMode)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                      activeMode === tab.id
                        ? tab.id === 'examMaster'
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-amber-400/60'
                          : tab.id === 'devStory'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : `${themeAccentBg} text-white shadow-sm`
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                {(['blue', 'emerald', 'indigo', 'amber'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorTheme(c)}
                    className={`px-2 py-0.5 rounded font-bold ${
                      colorTheme === c
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={() => setLayoutMode(layoutMode === 'split' ? 'wide' : 'split')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  {layoutMode === 'split' ? '📐 스플릿' : '📐 와이드'}
                </button>
                <button
                  onClick={() =>
                    setFontStyle(
                      fontStyle === 'sans' ? 'serif' : fontStyle === 'serif' ? 'mono' : 'sans'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  🔤 {fontStyle}
                </button>
              </div>
            </div>
          </header>

          {/* 메인 스크롤 본문 */}
          <div className="print-container flex-1 overflow-y-auto p-5 md:p-7">
            <div
              className={`${
                layoutMode === 'split' ? 'max-w-4xl' : 'max-w-6xl'
              } mx-auto space-y-7 ${isFloatingPad && !isPadMinimized ? 'pb-72' : 'pb-20'}`}
            >
              {/* ==============================================================
                  [모드 NEW] 🎓 수능·내신 1등급 마스터 전용관 (1~5교시 대량 문제은행)
              ============================================================== */}
              {activeMode === 'examMaster' && (
                <div className="space-y-6">
                  <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-indigo-500/30 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                            수능 & 내신 1등급 대량 문제은행 가동중
                          </span>
                          <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-extrabold">
                            10,000+ 조합 구문 · 406개교 6개년 기출 · 내 학교 지문 자동 생성기
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight pt-1">
                          🎓 영어로 생각하고 표현하는 힘,{' '}
                          <span className="text-yellow-300 underline decoration-2 underline-offset-4">
                            외운 답이 아닌 답을 만드는 영어
                          </span>
                        </h2>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 text-center min-w-[180px]">
                        <div className="text-[10px] font-extrabold text-amber-300 uppercase">
                          ⏱️ 주 1회 3시간 집중 루틴
                        </div>
                        <div className="text-xl font-black font-mono text-white mt-0.5">
                          {csatTimerMins}분 코스
                        </div>
                        <div className="flex justify-center gap-1 mt-1">
                          {[60, 120, 180].map((m) => (
                            <button
                              key={m}
                              onClick={() => setCsatTimerMins(m)}
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                csatTimerMins === m
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {m}분
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                      {EXAM_MASTER_COURSES.map((course) => {
                        const isSel = course.id === selectedExamTrack;
                        return (
                          <button
                            key={course.id}
                            onClick={() => {
                              setSelectedExamTrack(course.id);
                              setShowExamModelAnswer(false);
                              setExamEssayInput('');
                            }}
                            className={`p-4 rounded-2xl border text-left transition ${
                              isSel
                                ? 'bg-white text-slate-900 border-amber-400 ring-2 ring-amber-400 shadow-md'
                                : 'bg-slate-900/70 hover:bg-slate-800/80 text-white border-slate-700'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                isSel ? 'bg-indigo-600 text-white' : 'bg-indigo-500/30 text-indigo-200'
                              }`}
                            >
                              {course.badge}
                            </span>
                            <div className="text-sm font-black mt-1.5">{course.shortTabName}</div>
                            <div
                              className={`text-[11px] mt-1 font-semibold ${
                                isSel ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              {course.targetGoal}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-6 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {[
                        { step: 1, title: '1교시: 단어 스피드 테스트', sub: '20문항 무한 시험지' },
                        { step: 2, title: '2교시: 10,000+ 킬러구문', sub: '도치·분사·강조 12문장씩' },
                        { step: 3, title: '3교시: 독해심화 & 지문변형', sub: 'Paraphrasing 비교' },
                        { step: 4, title: '4교시: 주요 학술소재 연계', sub: '철학·경제·뇌과학·환경' },
                        { step: 5, title: '5교시: 406개교 어법·서술형', sub: '+내 학교 지문 자동생성기' },
                      ].map((stObj) => {
                        const activeStage = schoolInternalStage === stObj.step;
                        return (
                          <button
                            key={stObj.step}
                            onClick={() => setSchoolInternalStage(stObj.step)}
                            className={`p-3.5 rounded-2xl border text-left transition ${
                              activeStage
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-amber-400'
                                : darkMode
                                ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                                : 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] font-black opacity-80">
                              STEP 0{stObj.step}
                            </div>
                            <div className="text-xs font-extrabold mt-0.5">{stObj.title}</div>
                            <div className="text-[10px] opacity-75 mt-0.5">{stObj.sub}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 1교시 */}
                    {schoolInternalStage === 1 && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl bg-indigo-950 text-white">
                          <div>
                            <h4 className="text-base font-black">
                              ⚡ [1교시 단어학습 & 테스트] 고등·수능 핵심 어휘 20문항 (Set #{vocabQuizSeed})
                            </h4>
                            <p className="text-xs text-indigo-200">
                              우측 버튼을 누를 때마다 Day 1 ~ Day 100 압축 사전에서 새로운 20문항이 출제됩니다!
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setVocabQuizSeed((s) => (s % 100) + 1);
                              setSelectedVocabQuizAnswers({});
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow"
                          >
                            🎲 새 20문항 시험지 생성 (Set #{(vocabQuizSeed % 100) + 1})
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {examVocabTestList.map((item, idx) => {
                            const picked = selectedVocabQuizAnswers[idx];
                            const wrong1 =
                              examVocabTestList[(idx + 3) % examVocabTestList.length].meaning;
                            const wrong2 =
                              examVocabTestList[(idx + 7) % examVocabTestList.length].meaning;
                            const options = [item.meaning, wrong1, wrong2];
                            const isSaved = bookmarkedWords.some((b) => b.word === item.word);

                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border space-y-2 ${
                                  darkMode
                                    ? 'bg-slate-950 border-slate-800'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                                      Q{idx + 1}
                                    </span>
                                    <strong className="text-base font-black">{item.word}</strong>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        toggleBookmark({
                                          word: item.word,
                                          ipa: item.ipa,
                                          meaning: item.meaning,
                                          collocation: item.collocation,
                                          posLabel: item.posLabel,
                                          compLabel: item.compLabel,
                                          levelBadge: '수능테스트',
                                        })
                                      }
                                      className="px-2 py-0.5 rounded border text-xs font-bold"
                                    >
                                      {isSaved ? '⭐ 저장됨' : '☆ 단어저장'}
                                    </button>
                                    <button
                                      onClick={() => speakText(item.word.split(' ')[0])}
                                      className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs"
                                    >
                                      🔊
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1 pt-1">
                                  {options.map((opt, oIdx) => {
                                    const isSel = picked === oIdx;
                                    const isAns = oIdx === 0;
                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() =>
                                          setSelectedVocabQuizAnswers((prev) => ({
                                            ...prev,
                                            [idx]: oIdx,
                                          }))
                                        }
                                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                          isSel
                                            ? isAns
                                              ? 'bg-emerald-600 text-white border-emerald-500'
                                              : 'bg-rose-600 text-white border-rose-500'
                                            : darkMode
                                            ? 'bg-slate-900 border-slate-800'
                                            : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        {oIdx + 1}) {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2교시: 10,000+ 조합형 킬러 구문 (문장 스크랩 버튼 완비!) */}
                    {schoolInternalStage === 2 && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl bg-indigo-950 text-white">
                          <div>
                            <h4 className="text-base font-black">
                              🧩 [2교시 핵심구문 학습] 10,000+ 조합형 고3 킬러 구문 (Batch #{syntaxSeed})
                            </h4>
                            <p className="text-xs text-indigo-200">
                              마음에 드는 구문은 <strong>[📌 문장저장]</strong>을 눌러 내 보관함에서 수정·복습하세요!
                            </p>
                          </div>
                          <button
                            onClick={() => setSyntaxSeed((s) => s + 1)}
                            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow"
                          >
                            🔄 새 킬러 구문 12문장 즉시 생성 (Batch #{syntaxSeed + 1})
                          </button>
                        </div>

                        <div className="space-y-3">
                          {generatedSyntaxList.map((item, idx) => {
                            const isSentSaved = savedSentences.some(
                              (s) => s.en === item.sentenceEn
                            );
                            return (
                              <div
                                key={item.id}
                                className={`p-4 rounded-2xl border space-y-2 ${
                                  darkMode
                                    ? 'bg-slate-950 border-slate-800'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                                    킬러구문 #{idx + 1} · {item.openerRule}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        toggleSaveSentence({
                                          en: item.sentenceEn,
                                          ko: item.sentenceKo,
                                          note: `${item.openerRule} | 변형: ${item.paraphrasedEn}`,
                                          category: '수능·내신 2교시 킬러구문',
                                        })
                                      }
                                      className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                                        isSentSaved
                                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                                          : 'border-slate-300 dark:border-slate-700'
                                      }`}
                                    >
                                      {isSentSaved ? '📌 문장저장됨(클릭해제)' : '📌 문장저장'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCustomDissectSentence({
                                          en: item.sentenceEn,
                                          ko: item.sentenceKo,
                                          title: `킬러구문 #${idx + 1}: ${item.openerRule}`,
                                        });
                                        setActiveMode('daily');
                                        speakText(item.sentenceEn);
                                      }}
                                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold"
                                    >
                                      🔍 16매핑 즉시 해부↗
                                    </button>
                                    <button
                                      onClick={() => speakText(item.sentenceEn)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold"
                                    >
                                      🔊 듣기
                                    </button>
                                  </div>
                                </div>

                                <div className="text-base font-black text-blue-600 dark:text-yellow-300">
                                  "{item.sentenceEn}"
                                </div>
                                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  🇰🇷 직독직해: {item.sentenceKo}
                                </div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                  🔄 [내신·수능 변형]: "{item.paraphrasedEn}"
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3교시 */}
                    {schoolInternalStage === 3 && (
                      <div className="space-y-5">
                        {currentExamCourse.steps.map((st) => (
                          <div
                            key={st.stepNum}
                            className={`p-5 rounded-3xl border space-y-4 ${
                              darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold">
                                {st.stepTitle}
                              </span>
                              <button
                                onClick={() =>
                                  toggleSaveSentence({
                                    en: st.transformedEn,
                                    ko: st.originalPassageKo,
                                    note: st.transformedPoint,
                                    category: '3교시 패러프레이징 변형문장',
                                  })
                                }
                                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold"
                              >
                                📌 변형문장 보관함에 저장
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="text-xs font-extrabold text-blue-500">
                                  📘 [교과서·EBS 원문 지문]
                                </div>
                                <div className="text-sm font-black">"{st.originalPassageEn}"</div>
                                <div className="text-xs text-slate-500">{st.originalPassageKo}</div>
                              </div>

                              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                                <div className="text-xs font-extrabold text-emerald-500">
                                  🔄 [학교 시험 변형 출제 문장]
                                </div>
                                <div className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                                  "{st.transformedEn}"
                                </div>
                                <div className="text-xs font-semibold">{st.transformedPoint}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4교시 */}
                    {schoolInternalStage === 4 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {EBS_MAJOR_TOPICS.map((tp) => (
                          <div
                            key={tp.id}
                            className={`p-5 rounded-3xl border space-y-3 ${
                              darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-indigo-500">
                                {tp.category}
                              </span>
                              <button
                                onClick={() =>
                                  toggleSaveSentence({
                                    en: tp.paraphraseSummary,
                                    ko: tp.passageKo,
                                    note: `EBS 소재 요약: ${tp.title}`,
                                    category: '4교시 EBS 학술요약',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold"
                              >
                                📌 요약문 저장
                              </button>
                            </div>
                            <h4 className="text-base font-black">{tp.title}</h4>
                            <p className="text-xs font-bold leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                              "{tp.passageEn}"
                            </p>
                            <p className="text-xs text-slate-500">{tp.passageKo}</p>
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                              📌 [수능 40번 한 줄 요약]: "{tp.paraphraseSummary}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 5교시 */}
                    {schoolInternalStage === 5 && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-base font-black text-rose-500">
                            🚨 1) 전국 406개교 6개년 최다 빈출 어법 양자택일 실전 테스트
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {GRAMMAR_406_QUIZ_BANK.map((q) => {
                              const picked = selectedGrammarQuizAnswers[q.id];
                              return (
                                <div
                                  key={q.id}
                                  className={`p-4 rounded-2xl border space-y-2.5 ${
                                    darkMode
                                      ? 'bg-slate-950 border-slate-800'
                                      : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500">
                                    {q.schoolTag}
                                  </span>
                                  <div className="text-xs font-bold leading-relaxed">
                                    {q.sentenceBefore}{' '}
                                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300 font-black">
                                      [ (A) {q.choiceA} / (B) {q.choiceB} ]
                                    </span>{' '}
                                    {q.sentenceAfter}
                                  </div>
                                  <div className="flex gap-2">
                                    {(['A', 'B'] as const).map((choice) => {
                                      const isSel = picked === choice;
                                      const isCorrect = q.correct === choice;
                                      return (
                                        <button
                                          key={choice}
                                          onClick={() =>
                                            setSelectedGrammarQuizAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: choice,
                                            }))
                                          }
                                          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                                            isSel
                                              ? isCorrect
                                                ? 'bg-emerald-600 text-white border-emerald-500'
                                                : 'bg-rose-600 text-white border-rose-500'
                                              : darkMode
                                              ? 'bg-slate-900 border-slate-700'
                                              : 'bg-white border-slate-300'
                                          }`}
                                        >
                                          ({choice}) {choice === 'A' ? q.choiceA : q.choiceB}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {picked && (
                                    <div className="text-[11px] text-emerald-500 font-semibold pt-1 border-t border-slate-200 dark:border-slate-800">
                                      ✅ 정답 ({q.correct}): {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-slate-900 text-white border border-indigo-500/40 space-y-4">
                          <h4 className="text-base font-black">
                            📋 2) 내 학교 내신 교과서 / 모의고사 지문 붙여넣기 ➔ 구문 해부 & 서술형 문제 자동 생성!
                          </h4>
                          <textarea
                            rows={3}
                            value={customSchoolText}
                            onChange={(e) => setCustomSchoolText(e.target.value)}
                            placeholder="여기에 학교 시험 범위 영어 지문을 붙여넣으세요..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />

                          <div className="space-y-3">
                            {customPassageAnalysis.sentences.map((item) => (
                              <div
                                key={item.idx}
                                className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-extrabold text-amber-300">
                                    문장 #{item.idx} 분석 완료
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() =>
                                        toggleSaveSentence({
                                          en: item.rawEn,
                                          ko: `핵심어휘: ${item.extractedKeywords.join(', ')}`,
                                          note: `빈칸정답: ${item.answerWord}`,
                                          category: '내 학교 시험지문',
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold"
                                    >
                                      📌 문장저장
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCustomDissectSentence({
                                          en: item.rawEn,
                                          ko: '내가 입력한 학교 내신·모의고사 지문 실시간 해부 모드',
                                          title: `내 학교 지문 문장 #${item.idx}`,
                                        });
                                        setActiveMode('daily');
                                        speakText(item.rawEn);
                                      }}
                                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-extrabold"
                                    >
                                      🔍 16매핑 해부↗
                                    </button>
                                  </div>
                                </div>
                                <div className="text-emerald-300 font-bold">
                                  🧱 소리블럭: {item.soundBlockEn}
                                </div>
                                <div className="text-slate-200">
                                  ✍️ [빈칸 문제]: {item.blankQuizSentence}{' '}
                                  <span className="text-amber-300 font-bold">
                                    (정답: {item.answerWord})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ==============================================================
                  [모드 A] Day 1 ~ Day 100 (8,000단어) 단어장 + 암기완료 양방향 해제
              ============================================================== */}
              {activeMode === 'wordbook' && (
                <section
                  className={`border rounded-3xl p-6 shadow-sm space-y-6 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-extrabold text-blue-500">
                        8,000+ MASSIVE E-WORDBOOK (완료 체크 언제든 다시 해제 가능!)
                      </span>
                      <h2 className="text-2xl font-extrabold mt-0.5">
                        📘 초고밀도 영단어장 (Day 1 ~ Day 100)
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                      {(
                        [
                          '중등 필수',
                          '고등·수능 핵심',
                          '비즈니스·실무',
                          '오픽(OPIc)·구동사',
                        ] as const
                      ).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => {
                            setWordbookLevel(lvl);
                            setWordbookDay(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                            wordbookLevel === lvl
                              ? `${themeAccentBg} text-white shadow`
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 내가 암기 완료한 Day 현황판 & 원클릭 완료 해제 바 */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                      <span>
                        ✅ 내가 암기 완료한 Day 목록 ({completedDays.length}개 완료 — 배지를 누르면 해당 Day로 이동하거나 ✕를 눌러 완료를 해제할 수 있습니다!)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {completedDays.length === 0 && (
                        <span className="text-xs text-slate-500">
                          아직 완료 체크한 Day가 없습니다.
                        </span>
                      )}
                      {completedDays.map((dKey) => {
                        const [lvlName, dStr] = dKey.split('-');
                        return (
                          <div
                            key={dKey}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold"
                          >
                            <button
                              onClick={() => {
                                setWordbookLevel(lvlName as typeof wordbookLevel);
                                setWordbookDay(Number(dStr) || 1);
                              }}
                            >
                              {lvlName} Day {dStr}
                            </button>
                            <button
                              onClick={() => toggleCompletedDay(dKey)}
                              title="암기 완료 해제"
                              className="px-1 rounded-full bg-emerald-800 hover:bg-rose-600 text-[10px]"
                            >
                              ✕해제
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => setWordbookDay((d) => (d > 1 ? d - 1 : 100))}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-extrabold"
                    >
                      ◀ 이전 Day {wordbookDay > 1 ? wordbookDay - 1 : 100}
                    </button>

                    <div className="text-center space-y-1">
                      <div className="text-base font-black">
                        📖 [{wordbookLevel}] — Day {wordbookDay} / 100 페이지
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {[1, 2, 3, 5, 10, 20, 30, 50, 75, 100].map((dNum) => (
                          <button
                            key={dNum}
                            onClick={() => setWordbookDay(dNum)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              wordbookDay === dNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            Day {dNum}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 양방향 토글: 다시 누르면 즉시 암기 완료 해제! */}
                      <button
                        onClick={() => toggleCompletedDay(`${wordbookLevel}-${wordbookDay}`)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                          completedDays.includes(`${wordbookLevel}-${wordbookDay}`)
                            ? 'bg-emerald-600 hover:bg-rose-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {completedDays.includes(`${wordbookLevel}-${wordbookDay}`)
                          ? '✅ 암기완료됨 (다시 누르면 해제)'
                          : '⬜ 오늘 Day 완료 체크하기'}
                      </button>

                      <button
                        onClick={() => setWordbookDay((d) => (d < 100 ? d + 1 : 1))}
                        className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                      >
                        다음 Day {wordbookDay < 100 ? wordbookDay + 1 : 1} ▶
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWordbook.map((item, idx) => {
                      const pronKey = `wb-${item.level}-${item.day}-${idx}`;
                      const isBookmarked = bookmarkedWords.some((b) => b.word === item.word);
                      return (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border space-y-2.5 ${
                            darkMode
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-400">
                                  #{idx + 1}
                                </span>
                                <span className="text-lg font-black">{item.word}</span>
                                <span className="text-xs font-mono text-blue-500 font-bold">
                                  {item.ipa}
                                </span>
                                <button
                                  onClick={() => speakText(item.word.split('(')[0])}
                                  className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs"
                                >
                                  🔊
                                </button>
                              </div>
                              <button
                                onClick={() => toggleKoreanPron(pronKey)}
                                className="mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300"
                              >
                                {isPronVisible(pronKey)
                                  ? `🗣️ ${item.pron}`
                                  : '🔒 [한글발음 보기 터치]'}
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                toggleBookmark({
                                  word: item.word,
                                  ipa: item.ipa,
                                  meaning: item.meaning,
                                  collocation: item.collocation,
                                  posLabel: item.posLabel,
                                  compLabel: item.compLabel,
                                  levelBadge: item.level,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                                isBookmarked
                                  ? 'bg-amber-400 text-slate-900 border-amber-400'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isBookmarked ? '⭐ 저장됨(해제)' : '☆ 단어장저장'}
                            </button>
                          </div>

                          <div className="text-sm font-extrabold">뜻: {item.meaning}</div>
                          <div className="text-xs space-y-1">
                            <div>🧱 소리블럭: {item.soundBlock}</div>
                            <div className="text-blue-500 font-bold">
                              🔗 짝꿍: {item.collocation} ({item.collocationKo})
                            </div>
                            <div className="text-slate-500 italic">"{item.exampleEn}"</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ==============================================================
                  [모드 B] 전 레벨 일일 강의 노트 (STEP 1 ~ STEP 5 + 문장저장 버튼)
              ============================================================== */}
              {activeMode === 'daily' && (
                <>
                  <div
                    className={`border rounded-3xl p-6 shadow-sm space-y-4 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-extrabold text-white px-3 py-1 rounded-full ${themeAccentBg}`}>
                          {currentTheme.badge}
                        </span>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300">
                          {currentLevelTrack.levelName}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toggleSaveSentence({
                            en: currentLevelTrack.patternEn,
                            ko: currentLevelTrack.patternMeaningKo,
                            note: currentLevelTrack.focusBadge,
                            category: '일일 대표 패턴',
                          })
                        }
                        className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold"
                      >
                        📌 이 대표 패턴 문장 보관함에 저장
                      </button>
                    </div>

                    <h2 className="text-2xl font-black">📣 {currentTheme.title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      💡 <strong>학습 가이드:</strong> {currentLevelTrack.levelGuide}
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-emerald-400">
                          🎯 [{learningLevel.toUpperCase()} FOCUS] {currentLevelTrack.focusBadge}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => speakText(currentLevelTrack.patternEn, accent, 0.75)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-amber-300"
                          >
                            🐢 0.75x 느림
                          </button>
                          <button
                            onClick={() => speakText(currentLevelTrack.patternEn, accent, 1.0)}
                            className={`px-3 py-1 rounded-lg text-white text-xs font-extrabold ${themeAccentBg}`}
                          >
                            🔊 듣기
                          </button>
                        </div>
                      </div>

                      <div className="text-xl font-black text-yellow-400">
                        {currentLevelTrack.patternEn}
                      </div>
                      <div className="text-sm font-bold text-white">
                        🇰🇷 뜻 도움: "{currentLevelTrack.patternMeaningKo}"
                      </div>
                    </div>
                  </div>

                  {/* STEP 2 단어장 */}
                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-6 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold">
                        📚 STEP 2. 전 레벨 짝꿍 단어장 (⭐ 클릭 시 보관함에 저장 & 수정 가능)
                      </h3>
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                        <button
                          onClick={() => setHideWordMode(!hideWordMode)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            hideWordMode ? `${themeAccentBg} text-white` : ''
                          }`}
                        >
                          {hideWordMode ? '🙈 Hide Word ON' : '👁️ Hide Word'}
                        </button>
                        <button
                          onClick={() => setHideMeaningMode(!hideMeaningMode)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            hideMeaningMode ? `${themeAccentBg} text-white` : ''
                          }`}
                        >
                          {hideMeaningMode ? '🙈 Hide Meaning ON' : '👁️ Hide Meaning'}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold">
                          <tr>
                            <th className="py-3 px-3 text-center">레벨</th>
                            <th className="py-3 px-3">단어 · 저장</th>
                            <th className="py-3 px-3">뜻 & 16매핑</th>
                            <th className="py-3 px-3">🧱 소리블럭</th>
                            <th className="py-3 px-3">🔗 짝꿍 표현</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {currentTheme.vocab.map((v) => {
                            const isWordHidden = hideWordMode && !revealedWordIds.includes(v.id);
                            const isMeaningHidden =
                              hideMeaningMode && !revealedWordIds.includes(v.id);
                            const isSaved = bookmarkedWords.some((b) => b.word === v.word);

                            return (
                              <tr
                                key={v.id}
                                onClick={() => {
                                  setSelectedComp(v.comp);
                                  setSelectedPos(v.pos);
                                }}
                                className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                              >
                                <td className="py-3 px-3 text-center">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300">
                                    {v.id === 0 ? '🔥 실검1위' : v.recommendLevel.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-black">
                                      {isWordHidden ? v.masked : v.word}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(v.word);
                                      }}
                                      className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px]"
                                    >
                                      🔊
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark({
                                          word: v.word,
                                          ipa: v.ipa,
                                          meaning: v.meaning,
                                          collocation: v.collocation,
                                          posLabel: v.posLabel,
                                          compLabel: v.compLabel,
                                        });
                                      }}
                                      className="px-2 py-0.5 rounded border text-[10px] font-bold"
                                    >
                                      {isSaved ? '⭐ 저장됨' : '☆ 저장'}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-extrabold">
                                  {isMeaningHidden ? '🔒 [뜻 숨김]' : v.meaning}
                                </td>
                                <td className="py-3 px-3 font-bold text-emerald-600">
                                  {v.soundBlock}
                                </td>
                                <td className="py-3 px-3 font-bold text-blue-500">
                                  {v.collocation}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* STEP 3 16매핑 & 어절 해부 카드 */}
                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-6 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                        {[
                          { id: 'all', label: '16개 전체 매핑 다이어그램' },
                          { id: 'comp', label: '문장 성분(7직책) 사전' },
                          { id: 'pos', label: '9품사(9신분) 사전' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setDiagramTab(t.id as 'all' | 'comp' | 'pos')}
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold ${
                              diagramTab === t.id
                                ? 'bg-white dark:bg-slate-900 text-blue-600 border-2 border-blue-600'
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
                        }}
                        className="px-3.5 py-1.5 rounded-full border text-xs font-bold"
                      >
                        전체 연결 보기
                      </button>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <svg viewBox="0 0 920 310" className="w-full min-w-[760px] h-auto select-none">
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
                            (selectedComp !== null &&
                              selectedPos === null &&
                              edge.comp === selectedComp) ||
                            (selectedPos !== null &&
                              selectedComp === null &&
                              edge.pos === selectedPos);

                          return (
                            <path
                              key={idx}
                              d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
                              fill="none"
                              stroke={isHighlighted ? '#2563eb' : '#cbd5e1'}
                              strokeWidth={isHighlighted ? 2.8 : 1.2}
                              opacity={isHighlighted ? 1 : 0.3}
                            />
                          );
                        })}

                        {SENTENCE_COMPONENTS.map((comp, idx) => {
                          const cx = 75 + idx * 128;
                          const cy = 74;
                          const isActive = selectedComp === comp.id;
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
                                strokeWidth={isActive ? 3 : 1.5}
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
                                className="text-[10px] font-bold fill-blue-600"
                              >
                                {comp.id}
                              </text>
                            </g>
                          );
                        })}

                        {PARTS_OF_SPEECH.map((pos, idx) => {
                          const cx = 55 + idx * 101;
                          const cy = 248;
                          const isActive = selectedPos === pos.id;
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
                                strokeWidth={isActive ? 3 : 1.5}
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
                                className="text-[10px] font-bold fill-slate-500"
                              >
                                {pos.id}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div
                      className={`border rounded-3xl p-5 space-y-4 ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base font-extrabold">
                          🧩 실전 예문 이중 레이어 해부 카드
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentTheme.sentences.map((s, idx) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setCustomDissectSentence(null);
                                setActiveDiagramSentenceIdx(idx);
                                setSelectedTokenIdx(0);
                                speakText(s.rawEn);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                !customDissectSentence && activeDiagramSentenceIdx === idx
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`}
                            >
                              {s.id === 0 ? '🔥 실검문장' : `문장 ${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {currentDiagramEx.tokens.map((tk, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTokenIdx(idx);
                              setSelectedComp(tk.comp === '독립어' ? 'M' : tk.comp);
                              setSelectedPos(tk.pos);
                              speakText(tk.word);
                            }}
                            className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 text-center flex flex-col items-center gap-1.5 ${
                              selectedTokenIdx === idx
                                ? 'border-blue-600'
                                : `${tk.colorClass} dark:border-slate-800`
                            }`}
                          >
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                              {tk.compLabel}
                            </span>
                            <span className="text-base font-black">{tk.word}</span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {tk.posLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* STEP 4. 3단 직독직해 + 문장 저장 */}
                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-5 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <h3 className="text-lg font-extrabold">
                      🗣️ STEP 4. 전 레벨 3단 직독직해 & 문장 스크랩
                    </h3>
                    {currentTheme.sentences.map((sent, sIdx) => {
                      const isSentSaved = savedSentences.some((s) => s.en === sent.rawEn);
                      return (
                        <div
                          key={sent.id}
                          className={`p-5 rounded-2xl border space-y-2.5 ${
                            darkMode
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white ${themeAccentBg}`}>
                              {sent.tag}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() =>
                                  toggleSaveSentence({
                                    en: sent.rawEn,
                                    ko: sent.naturalKo,
                                    note: `바꿔말하기: ${sent.paraphraseVersion} | 문법: ${sent.grammarPoint}`,
                                    category: currentTheme.title,
                                  })
                                }
                                className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                                  isSentSaved
                                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                                    : 'border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {isSentSaved ? '📌 문장저장됨(해제)' : '📌 문장저장'}
                              </button>
                              <button
                                onClick={() => {
                                  setCustomDissectSentence(null);
                                  setActiveDiagramSentenceIdx(sIdx);
                                  speakText(sent.rawEn);
                                }}
                                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold"
                              >
                                🔍 16매핑 해부
                              </button>
                              <button
                                onClick={() => speakText(sent.rawEn)}
                                className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold"
                              >
                                🔊 듣기
                              </button>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">① {sent.koLine}</div>
                          <div className="text-base font-bold">
                            ② {renderHighlightedSentence(sent.enLine)}
                          </div>
                          <div className="text-xs text-emerald-500 font-extrabold">
                            🔄 바꿔 말하기: "{sent.paraphraseVersion}"
                          </div>
                        </div>
                      );
                    })}
                  </section>

                  {/* STEP 5. 네이버 퀴즈 */}
                  <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-4 border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-extrabold">🎮 STEP 5. 네이버 4단계 실전 퀴즈</h3>
                      <div className="flex gap-1.5">
                        {(['word', 'beginner', 'intermediate', 'advanced'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setQuizLevelTab(tab)}
                            className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                              quizLevelTab === tab ? 'bg-blue-600' : 'bg-slate-800'
                            }`}
                          >
                            {tab.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {quizLevelTab === 'word' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {NAVER_OFFICIAL_WORD_CHALLENGE.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-black text-base">
                                {revealedChallengeIdx.includes(idx) ? item.word : item.masked}
                              </div>
                              <div className="text-xs text-slate-300">{item.koMeaning}</div>
                            </div>
                            <button
                              onClick={() =>
                                setRevealedChallengeIdx((prev) =>
                                  prev.includes(idx)
                                    ? prev.filter((i) => i !== idx)
                                    : [...prev, idx]
                                )
                              }
                              className="px-2.5 py-1 rounded bg-slate-700 text-xs"
                            >
                              정답
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {quizLevelTab === 'beginner' && (
                      <div className="space-y-2">
                        <div className="text-xl font-black">{currentTheme.quiz.beginner.word}</div>
                        {currentTheme.quiz.beginner.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedBeginnerOpt(idx)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                              selectedBeginnerOpt === idx
                                ? idx === currentTheme.quiz.beginner.answerIdx
                                  ? 'bg-emerald-600'
                                  : 'bg-rose-600'
                                : 'bg-slate-800 border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {quizLevelTab === 'intermediate' && (
                      <div className="space-y-2">
                        <div className="text-sm font-bold">
                          {currentTheme.quiz.intermediate.sentenceBefore} _______{' '}
                          {currentTheme.quiz.intermediate.sentenceAfter}
                        </div>
                        <button
                          onClick={() => setShowInterHint(!showInterHint)}
                          className="text-xs text-blue-300 underline"
                        >
                          {showInterHint ? currentTheme.quiz.intermediate.hint : '힌트 보기'}
                        </button>
                        {currentTheme.quiz.intermediate.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedInterOpt(idx)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                              selectedInterOpt === idx
                                ? idx === currentTheme.quiz.intermediate.answerIdx
                                  ? 'bg-emerald-600'
                                  : 'bg-rose-600'
                                : 'bg-slate-800 border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {quizLevelTab === 'advanced' && (
                      <div className="space-y-2">
                        <div className="text-sm font-bold">
                          유의어 모두 선택: {currentTheme.quiz.advanced.highlightWord}
                        </div>
                        {currentTheme.quiz.advanced.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              setSelectedAdvOpts((prev) =>
                                prev.includes(idx)
                                  ? prev.filter((i) => i !== idx)
                                  : [...prev, idx]
                              )
                            }
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                              selectedAdvOpts.includes(idx)
                                ? currentTheme.quiz.advanced.answerIndices.includes(idx)
                                  ? 'bg-emerald-600'
                                  : 'bg-rose-600'
                                : 'bg-slate-800 border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={userWritingMission}
                        onChange={(e) => setUserWritingMission(e.target.value)}
                        placeholder={currentTheme.quiz.writingMission.koPrompt}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </section>
                </>
              )}

              {/* ==============================================================
                  [모드 C 업그레이드] 🗂️ 내 단어·문장 보관함 & 직접 수정 & 암기완료 해제 관리소
              ============================================================== */}
              {activeMode === 'naverQuiz' && (
                <div className="space-y-6">
                  {/* 1. 저장한 단어 목록 + 뜻/메모 직접 수정 + 암기완료 양방향 토글 + 새 단어 추가 */}
                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-5 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-extrabold text-amber-500">
                          EDITABLE WORD & SENTENCE VAULT
                        </span>
                        <h2 className="text-2xl font-extrabold mt-0.5">
                          ⭐ 1) 내가 저장한 단어장 ({bookmarkedWords.length}개 · 뜻/메모 수정 & 암기완료 해제 가능)
                        </h2>
                      </div>
                    </div>

                    {/* 새 단어 직접 추가 폼 */}
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        ➕ 나만의 새 단어 직접 추가하기
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={newCustomWord}
                          onChange={(e) => setNewCustomWord(e.target.value)}
                          placeholder="영단어 (예: resilience)"
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={newCustomWordMeaning}
                          onChange={(e) => setNewCustomWordMeaning(e.target.value)}
                          placeholder="뜻 (예: 회복탄력성)"
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={newCustomWordNote}
                          onChange={(e) => setNewCustomWordNote(e.target.value)}
                          placeholder="짝꿍표현/나만의 메모"
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => {
                            if (!newCustomWord.trim()) return;
                            setBookmarkedWords((prev) => [
                              {
                                word: newCustomWord.trim(),
                                ipa: '/직접추가/',
                                meaning: newCustomWordMeaning.trim() || '나만의 단어',
                                collocation: newCustomWordNote.trim() || newCustomWord.trim(),
                                posLabel: '내 단어',
                                compLabel: '핵심어휘',
                                levelBadge: '직접등록',
                                customNote: newCustomWordNote.trim(),
                                mastered: false,
                              },
                              ...prev,
                            ]);
                            setNewCustomWord('');
                            setNewCustomWordMeaning('');
                            setNewCustomWordNote('');
                          }}
                          className={`rounded-xl text-white text-xs font-extrabold py-2 ${themeAccentBg}`}
                        >
                          ➕ 단어장에 즉시 추가
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bookmarkedWords.map((bw, idx) => {
                        const isEditing = editingWordIdx === idx;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border space-y-2.5 transition ${
                              bw.mastered
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <strong className="text-base font-black">{bw.word}</strong>
                                <span className="text-xs font-mono text-blue-500">{bw.ipa}</span>
                                <button
                                  onClick={() => speakText(bw.word)}
                                  className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs"
                                >
                                  🔊
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* 암기 완료 ⇄ 암기중 양방향 스위치 */}
                                <button
                                  onClick={() =>
                                    setBookmarkedWords((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, mastered: !item.mastered } : item
                                      )
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                                    bw.mastered
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {bw.mastered ? '✅ 암기완료(해제)' : '⬜ 암기중'}
                                </button>

                                <button
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingWordIdx(null);
                                    } else {
                                      setEditingWordIdx(idx);
                                      setEditWordMeaning(bw.meaning);
                                      setEditWordCollocation(bw.collocation);
                                      setEditWordNote(bw.customNote || '');
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[11px] font-extrabold"
                                >
                                  {isEditing ? '취소' : '✏️ 수정'}
                                </button>

                                <button
                                  onClick={() => toggleBookmark(bw)}
                                  className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 text-[11px] font-extrabold"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <input
                                  type="text"
                                  value={editWordMeaning}
                                  onChange={(e) => setEditWordMeaning(e.target.value)}
                                  placeholder="뜻 수정"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                />
                                <input
                                  type="text"
                                  value={editWordCollocation}
                                  onChange={(e) => setEditWordCollocation(e.target.value)}
                                  placeholder="짝꿍 표현 수정"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                />
                                <input
                                  type="text"
                                  value={editWordNote}
                                  onChange={(e) => setEditWordNote(e.target.value)}
                                  placeholder="나만의 암기 팁 / 어법 메모 추가"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                                />
                                <button
                                  onClick={() => {
                                    setBookmarkedWords((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? {
                                              ...item,
                                              meaning: editWordMeaning,
                                              collocation: editWordCollocation,
                                              customNote: editWordNote,
                                            }
                                          : item
                                      )
                                    );
                                    setEditingWordIdx(null);
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs font-extrabold"
                                >
                                  💾 수정 내용 저장하기
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="text-xs font-extrabold">뜻: {bw.meaning}</div>
                                <div className="text-[11px] text-blue-500 font-bold">
                                  🔗 짝꿍: {bw.collocation}
                                </div>
                                {bw.customNote && (
                                  <div className="text-[11px] text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg font-semibold">
                                    📝 내 메모: {bw.customNote}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* 2. 내가 저장한 문장·구문 보관함 (직접 수정 & 16매핑 즉시 해부 & 암기완료 해제) */}
                  <section
                    className={`border rounded-3xl p-6 shadow-sm space-y-5 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <h2 className="text-2xl font-extrabold">
                      📌 2) 내가 스크랩한 문장·구문 보관함 ({savedSentences.length}문장 · 직접 수정 & 16매핑 연동)
                    </h2>

                    {/* 새 문장 직접 추가 폼 */}
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                        ➕ 나만의 중요 영어 문장 / 내신 서술형 문장 직접 등록하기
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newCustomSentEn}
                          onChange={(e) => setNewCustomSentEn(e.target.value)}
                          placeholder="영어 문장 입력..."
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={newCustomSentKo}
                          onChange={(e) => setNewCustomSentKo(e.target.value)}
                          placeholder="한글 해석 입력..."
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCustomSentNote}
                            onChange={(e) => setNewCustomSentNote(e.target.value)}
                            placeholder="어법/서술형 메모..."
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                          />
                          <button
                            onClick={() => {
                              if (!newCustomSentEn.trim()) return;
                              toggleSaveSentence({
                                en: newCustomSentEn.trim(),
                                ko: newCustomSentKo.trim() || '직접 등록한 문장',
                                note: newCustomSentNote.trim(),
                                category: '내 직접 등록 문장',
                              });
                              setNewCustomSentEn('');
                              setNewCustomSentKo('');
                              setNewCustomSentNote('');
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold"
                          >
                            ➕ 추가
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {savedSentences.map((sItem) => {
                        const isEditSent = editingSentId === sItem.id;
                        return (
                          <div
                            key={sItem.id}
                            className={`p-4 rounded-2xl border space-y-2 ${
                              sItem.mastered
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                                {sItem.category}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setSavedSentences((prev) =>
                                      prev.map((it) =>
                                        it.id === sItem.id
                                          ? { ...it, mastered: !it.mastered }
                                          : it
                                      )
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                    sItem.mastered
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-800'
                                  }`}
                                >
                                  {sItem.mastered ? '✅ 암기완료(해제)' : '⬜ 암기중'}
                                </button>
                                <button
                                  onClick={() => {
                                    setCustomDissectSentence({
                                      en: sItem.en,
                                      ko: sItem.ko,
                                      title: sItem.category,
                                    });
                                    setActiveMode('daily');
                                    speakText(sItem.en);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold"
                                >
                                  🔍 16매핑 해부↗
                                </button>
                                <button
                                  onClick={() => speakText(sItem.en)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold"
                                >
                                  🔊 듣기
                                </button>
                                <button
                                  onClick={() => {
                                    if (isEditSent) {
                                      setEditingSentId(null);
                                    } else {
                                      setEditingSentId(sItem.id);
                                      setEditSentEn(sItem.en);
                                      setEditSentKo(sItem.ko);
                                      setEditSentNote(sItem.note);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-500 text-xs font-extrabold"
                                >
                                  {isEditSent ? '취소' : '✏️ 수정'}
                                </button>
                                <button
                                  onClick={() =>
                                    setSavedSentences((prev) =>
                                      prev.filter((it) => it.id !== sItem.id)
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 text-xs font-extrabold"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>

                            {isEditSent ? (
                              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <input
                                  type="text"
                                  value={editSentEn}
                                  onChange={(e) => setEditSentEn(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold"
                                />
                                <input
                                  type="text"
                                  value={editSentKo}
                                  onChange={(e) => setEditSentKo(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                                />
                                <input
                                  type="text"
                                  value={editSentNote}
                                  onChange={(e) => setEditSentNote(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                                />
                                <button
                                  onClick={() => {
                                    setSavedSentences((prev) =>
                                      prev.map((it) =>
                                        it.id === sItem.id
                                          ? {
                                              ...it,
                                              en: editSentEn,
                                              ko: editSentKo,
                                              note: editSentNote,
                                            }
                                          : it
                                      )
                                    );
                                    setEditingSentId(null);
                                  }}
                                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-extrabold"
                                >
                                  💾 문장 수정 완료
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="text-base font-black text-blue-600 dark:text-yellow-300">
                                  "{sItem.en}"
                                </div>
                                <div className="text-xs font-bold">{sItem.ko}</div>
                                {sItem.note && (
                                  <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold">
                                    📝 메모: {sItem.note}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}

              {/* 모드 D: AI 음성 회화 & 첨삭 */}
              {activeMode === 'aiCoach' && (
                <div className="space-y-6">
                  <section className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold">
                        🎙️ AI 원어민 코치 ({targetSpeakingMins}분 코스)
                      </h3>
                      <div className="flex gap-1.5">
                        {[5, 10, 15, 30].map((m) => (
                          <button
                            key={m}
                            onClick={() => setTargetSpeakingMins(m)}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              targetSpeakingMins === m ? 'bg-blue-600' : 'bg-slate-800'
                            }`}
                          >
                            {m}분
                          </button>
                        ))}
                        <button
                          onClick={() => setIsVoiceActive(!isVoiceActive)}
                          className="px-3 py-1 rounded bg-emerald-600 text-xs font-extrabold"
                        >
                          {isVoiceActive ? '⏸️ 일시정지' : '▶️ 시작'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-950 rounded-2xl">
                      {chatHistory.map((turn, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs ${
                            turn.role === 'coach' ? 'bg-slate-800 mr-8' : 'bg-blue-600 ml-8'
                          }`}
                        >
                          {turn.text}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendChat} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="영어로 문장을 입력해 보세요..."
                        className="flex-1 bg-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-extrabold"
                      >
                        전송
                      </button>
                    </form>
                  </section>

                  <section
                    className={`border rounded-3xl p-6 space-y-3 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <h3 className="text-base font-extrabold">✍️ 1:1 실시간 서술형·회화 영작 첨삭</h3>
                    <form onSubmit={handleRunCorrection} className="flex gap-2">
                      <input
                        type="text"
                        value={correctionInput}
                        onChange={(e) => setCorrectionInput(e.target.value)}
                        placeholder="첨삭받을 영어 문장을 입력하세요..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                      >
                        첨삭 실행
                      </button>
                    </form>
                    {correctionResult && (
                      <div className="text-xs space-y-1 pt-2">
                        <div className="font-bold text-blue-500">{correctionResult.naturalEn}</div>
                        <div>{correctionResult.wordOrderFix}</div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* 모드 E: 주간·월간 총람 */}
              {activeMode === 'weekly' && (
                <section
                  className={`border rounded-3xl p-6 space-y-4 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <h2 className="text-xl font-extrabold">🗓️ 전 테마 & 수능·내신 핵심 총람</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {THEMES.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
                      >
                        <strong className="text-sm font-black">{t.title}</strong>
                        <div className="text-xs text-blue-500 mt-1">
                          {t.levelTracks[learningLevel].patternEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==============================================================
                  [모드 F 신규 탑재] 🛠️ 나만의 야나두 PRO 전체 제작 과정 & 아키텍처 마스터 백서
              ============================================================== */}
              {activeMode === 'devStory' && (
                <section
                  className={`border rounded-3xl p-6 shadow-sm space-y-6 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-xs font-extrabold text-emerald-500">
                      SYSTEM ARCHITECTURE & DEVELOPMENT BLUEPRINT
                    </span>
                    <h2 className="text-2xl font-black mt-0.5">
                      🛠️ [나만의 야나두 PRO] 파트 1~4 및 studyData.ts 전체 제작 과정 마스터 백서
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      단일 파일의 한계를 넘어 8,000단어 압축 사전, 10,000+ 조합 구문, 406개교 내신 어법·서술형, 아이패드 M5 펜슬 엔진을 완성한 전체 개발 기록입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                      <h3 className="text-sm font-black text-indigo-500">
                        📦 1. src/studyData.ts (초대형 데이터 & 무한 문제 생성 엔진)
                      </h3>
                      <p>• <strong>8,000+ 초고밀도 파이프(|) 압축 단어장</strong>: 중등·고등/수능·비즈니스·오픽 4대 영역 × Day 1~100 (하루 20단어씩 파생·문맥 자동 확장)</p>
                      <p>• <strong>10,000+ 조합형 킬러 구문 생성기</strong>: [도치/강조/분사절] × [핵심 동사구] × [수식어구] 블록을 교차 조합하여 무한 구문 생성</p>
                      <p>• <strong>EBS 4대 학술 소재 & 406개교 6개년 어법 은행</strong>: 철학·경제·뇌과학·환경 지문 및 최빈출 어법 함정 문제 탑재</p>
                      <p>• <strong>내 학교 지문 자동 분석기</strong>: 교과서/모의고사 지문 입력 시 소리블럭·빈칸 추론·서술형 어순 배열 문제 즉석 생성</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                      <h3 className="text-sm font-black text-blue-500">
                        🧱 2. src/App.tsx [1/4 파트] & [2/4 파트] (기반 사전 & 정규 테마 1~3)
                      </h3>
                      <p>• <strong>[1/4 파트]</strong>: TypeScript 규격 정의 + 16개(7문장성분 × 9품사) 뜻·어순 매핑 사전 + 9대 빅미디어(패션 5대 매거진 Vogue·WWD·ELLE·Bazaar·GQ 포함) 실시간 트렌드 90선</p>
                      <p>• <strong>[2/4 파트]</strong>: 네이버 공식 단어 챌린지 + 테마 1(비즈니스 회의) · 테마 2(오픽 일상 루틴) · 테마 3(해외여행·호텔·공항) 초·중·고급 3단계 트랙</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <h3 className="text-sm font-black text-emerald-500">
                        ⚙️ 3. src/App.tsx [3/4 파트] (테마 4~5 & 입시 3대 반 & 초고속 펜슬 엔진)
                      </h3>
                      <p>• <strong>테마 4~5</strong>: 유튜브·숏폼 바이럴 리액션 및 5대 패션 매거진 런웨이 비평</p>
                      <p>• <strong>수능·내신 3대 반</strong>: ① 수능 정규 완성반(주1회 3시간) ② 고등 어법·서술형 완성반(406개교 6개년) ③ 학교별 내신 대비반(5단계 변형)</p>
                      <p>• <strong>애플 펜슬 칼보정 엔진</strong>: 레티나 해상도 1:1 매칭, 사파리 파란 블록 원천 차단, 4종 펜슬(수성펜·만년필·볼펜·형광펜) 및 3px~24px 굵기 제어</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <h3 className="text-sm font-black text-amber-500">
                        🖥️ 4. src/App.tsx [4/4 파트] (통합 UI & 양방향 보관함 & 플로팅 메모장)
                      </h3>
                      <p>• <strong>실시간 트렌드 연동</strong>: 좌측 실검 클릭 시 우측 전체 수업·16매핑·퀴즈 즉시 변환</p>
                      <p>• <strong>양방향 보관함 관리소</strong>: 단어·문장 스크랩, 내 뜻/메모 직접 수정, 새 단어·문장 직접 추가, 암기 완료 언제든 해제(토글)</p>
                      <p>• <strong>따라다니는(Floating) 락/락해제 메모장</strong>: 스크롤 시 화면 하단에 고정되어 따라다니며 흔들림 없는 필기 지원</p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* ==================================================================
              ✏️ [완벽 수리] 파란 블록 선택 100% 차단 + 첫 획 지연 0초 + 4종 펜슬 & 5단계 굵기 메모장
          ================================================================== */}
          <div
            ref={padWrapperRef}
            className={`no-print no-safari-select transition-all z-40 ${
              isFloatingPad
                ? 'fixed bottom-3 right-4 left-4 md:left-[21rem] shadow-2xl rounded-3xl border-2 border-blue-500/80'
                : 'mx-6 mb-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700'
            } ${
              darkMode
                ? 'bg-slate-900/95 text-white'
                : 'bg-white/95 text-slate-900'
            } backdrop-blur-md`}
          >
            {/* 메모장 상단 컨트롤 툴바 */}
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setIsPadLocked(!isPadLocked)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                    isPadLocked
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isPadLocked ? '🔒 락 걸림(필기고정)' : '🔓 락 해제(스크롤)'}
                </button>

                <button
                  onClick={() => setPenOnlyMode(!penOnlyMode)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
                    penOnlyMode
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {penOnlyMode ? '✋ 손바닥무시 ON(펜슬전용)' : '👆 손가락겸용'}
                </button>

                {/* 4종 펜슬 종류 변경 스위치 */}
                {[
                  { id: 'marker' as const, label: '🖊️ 수성사인펜' },
                  { id: 'fountain' as const, label: '✒️ 만년필' },
                  { id: 'ballpoint' as const, label: '✏️ 볼펜' },
                  { id: 'highlighter' as const, label: '🖍️ 형광펜' },
                  { id: 'eraser' as const, label: '🧽 지우개' },
                ].map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => setPenType(pt.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition ${
                      penType === pt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* 색상 & 5단계 굵기(3px~24px) & 창 조절 */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { c: '#2563eb' as const, label: '🔵파랑' },
                  { c: '#0f172a' as const, label: '⚫검정/흰색' },
                  { c: '#10b981' as const, label: '🟢초록' },
                  { c: '#e11d48' as const, label: '🔴빨강' },
                ].map((col) => (
                  <button
                    key={col.c}
                    onClick={() => {
                      setPenColor(col.c);
                      if (penType === 'eraser' || penType === 'highlighter') {
                        setPenType('marker');
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${
                      penColor === col.c && penType !== 'eraser' && penType !== 'highlighter'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}

                {/* 굵기 5단계 직관적 선택 버튼 */}
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-300 dark:border-slate-700">
                  {[
                    { w: 3, label: '세필(3)' },
                    { w: 6, label: '보통(6)' },
                    { w: 10, label: '굵게(10)' },
                    { w: 16, label: '왕굵게(16)' },
                    { w: 24, label: '붓펜(24)' },
                  ].map((sz) => (
                    <button
                      key={sz.w}
                      onClick={() => setPenWidth(sz.w)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        penWidth === sz.w
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPadHeight((h) => (h === 210 ? 310 : 210))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold"
                >
                  {padHeight === 210 ? '⬆️ 크게' : '⬇️ 기본'}
                </button>

                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold"
                >
                  지우기
                </button>

                <button
                  onClick={() => setIsPadMinimized(!isPadMinimized)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[10px] font-extrabold"
                >
                  {isPadMinimized ? '🔼 펼치기' : '🔽 접기'}
                </button>
              </div>
            </div>

            {/* 캔버스 본체 */}
            {!isPadMinimized && (
              <div className="p-2.5 no-safari-select">
                <div
                  className={`relative rounded-2xl overflow-hidden border-2 no-safari-select ${
                    isPadLocked
                      ? 'border-blue-500 bg-white dark:bg-slate-950'
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/50'
                  }`}
                  style={{ height: `${padHeight}px` }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(transparent, transparent 38px, #94a3b8 39px)',
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={endDrawing}
                    onPointerCancel={endDrawing}
                    style={{
                      touchAction: isPadLocked ? 'none' : 'pan-y',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                    }}
                    className={`relative z-10 w-full h-full block no-safari-select ${
                      isPadLocked ? 'cursor-crosshair' : 'cursor-grab'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
  
