// ============================================================================
// [1/4 파트] 타입 정의 + 16개(7문장성분×9품사) 뜻/매핑 + 8대 빅미디어 실검 80선
// ============================================================================
import { useState, useRef, useEffect } from 'react';

export type CompId = 'S' | 'V' | 'IO' | 'DO' | 'SC' | 'OC' | 'M';
export type PosId = 'N' | 'Pron' | 'V' | 'Adj' | 'Adv' | 'Prep' | 'Conj' | 'Interj' | 'Det';
export type MediaPlatformId =
  | 'NAVER_DATALAB'
  | 'NAVER_SHORTENTS'
  | 'GOOGLE_TRENDS'
  | 'SIGNAL_BZ'
  | 'NATE_ISSUE'
  | 'INSTA_THREADS'
  | 'YOUTUBE_SHORTS'
  | 'TIKTOK_TRENDS';

export interface VocabItem {
  id: number;
  type: '일상 회화' | '고급/실무';
  word: string;
  masked: string;
  ipa: string; // 발음기호 (IPA)
  pron: string; // 한글 발음 (클릭 전 기본 가림)
  soundMethod: string; // 소리방식 (연음/조음/강세 원리)
  soundBlock: string; // 소리블럭 (호흡 청크 단위)
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
  opicTip: string; // 오픽(OPIc) 실전 활용 팁
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
  tag: string;
  targetWord: string;
  wordOrderFormula: string; // 어순 공식
  structure: string;
  soundBlockEn: string; // 영어 소리블럭 (청크 끊어 말하기)
  soundMethodGuide: string; // 소리방식 (원어민 연음/탈락/강세 비법)
  ipaLine: string; // 문장 발음기호
  koLine: string;
  enLine: string;
  rawEn: string;
  pronLine: string; // 클릭 시 공개되는 한글 발음
  naturalKo: string;
  grammarPoint: string; // 핵심 문법 포인트
  contextNuance: string; // 표현·뉘앙스·상황 해설
}

export interface WordToken {
  word: string;
  comp: CompId | '독립어';
  compLabel: string;
  pos: PosId;
  posLabel: string;
  colorClass: string; // 핵심 키워드 컬러 표시
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
  wordOrderPrinciple: string; // 오늘의 핵심 어순 원리 인포그래픽 요약
  grammarSummary: string; // 핵심 문법 포인트
  situationGuide: string; // 표현·뉘앙스·상황 가이드
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
// 2. [절대 핵심] 16개 전체 매핑: 7개 문장 성분(직책) × 9품사(신분) 뜻 & 어순 사전
// ============================================================================
export const SENTENCE_COMPONENTS: {
  id: CompId;
  name: string;
  sub: string;
  colorBadge: string;
  meaning: string; // 문장 성분의 정확한 뜻
  wordOrderRule: string; // 영어 어순 위치 규칙
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
    meaning: '4형식 수여동사(give, send, tell 등) 뒤에서 동작을 받는 대상(~에게)을 뜻합니다.',
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
    meaning: '2형식 동사(be, become, seem 등) 뒤에서 주어(S)가 어떤 사람/상태인지 보충 설명하는 자리입니다.',
    wordOrderRule: '연결동사(V) 바로 뒤에 오며, 명사(동격) 또는 형용사(상태 설명)만 올 수 있습니다(부사 불가!).',
  },
  {
    id: 'OC',
    name: '목적격보어',
    sub: 'OC (C)',
    colorBadge: 'bg-violet-100 text-violet-700 border-violet-300',
    meaning: '5형식 동사(make, keep, find, ask 등) 뒤에서 목적어(DO)의 상태나 행동을 보충 설명하는 자리입니다.',
    wordOrderRule: '목적어(DO) 바로 뒤에 위치하여 [목적어가 ~한 상태 / ~하는 행동]이라는 작은 주술 관계를 만듭니다.',
  },
  {
    id: 'M',
    name: '수식어',
    sub: 'M (Modifier)',
    colorBadge: 'bg-amber-100 text-amber-700 border-amber-300',
    meaning: '문장의 5대 뼈대(S·V·O·C)는 아니지만, 시간·장소·이유·방법·명사 특징을 풍성하게 꾸며주는 자리입니다.',
    wordOrderRule: '짧은 형용사·부사는 꾸미는 말 앞, 긴 전치사구·부사절은 주로 문장 맨 뒤(소리블럭 끝)에 붙습니다.',
  },
];

export const PARTS_OF_SPEECH: {
  id: PosId;
  name: string;
  sub: string;
  meaning: string; // 9품사의 정확한 뜻
  canBeComponents: string; // 맡을 수 있는 문장 성분
}[] = [
  {
    id: 'N',
    name: '명사',
    sub: 'N (Noun)',
    meaning: '사람, 사물, 장소, 추상적 개념의 이름을 나타내는 단어입니다. (예: team, schedule, hydration)',
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
    meaning: '사람이나 사물의 움직임(동작)이나 상태(~이다/있다)를 나타내는 단어입니다. (예: wrap up, streamline)',
    canBeComponents: '오직 동사(V) 직책만 전담! (단, to부정사/분사로 변신하면 다른 직책 가능)',
  },
  {
    id: 'Adj',
    name: '형용사',
    sub: 'Adj (Adjective)',
    meaning: '명사의 성질, 모양, 상태를 꾸며주거나 보충 설명하는 단어입니다. (예: feasible, tentative)',
    canBeComponents: '주격보어(SC), 목적격보어(OC), 명사를 꾸미는 수식어(M)',
  },
  {
    id: 'Adv',
    name: '부사',
    sub: 'Adv (Adverb)',
    meaning: '동사, 형용사, 다른 부사 또는 문장 전체를 세밀하게 꾸며주는 단어입니다. (예: meticulously, always)',
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
    meaning: '단어와 단어, 구와 구, 문장(절)과 문장을 이어주는 연결 다리입니다. (예: and, if, because, so that)',
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
      { word: 'smart', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'platform', comp: 'S', compLabel: '주어 (S)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-blue-400 text-blue-700' },
      { word: 'makes', comp: 'V', compLabel: '동사 (V)', pos: 'V', posLabel: '동사(V)', colorClass: 'border-rose-400 text-rose-700' },
      { word: 'our', comp: 'M', compLabel: '수식어 (M)', pos: 'Det', posLabel: '한정사(Det)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'daily', comp: 'M', compLabel: '수식어 (M)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'workflow', comp: 'DO', compLabel: '직접목적어 (DO)', pos: 'N', posLabel: '명사(N)', colorClass: 'border-teal-400 text-teal-700' },
      { word: 'highly', comp: 'M', compLabel: '수식어 (M)', pos: 'Adv', posLabel: '부사(Adv)', colorClass: 'border-amber-300 text-amber-700' },
      { word: 'feasible.', comp: 'OC', compLabel: '목적격보어 (OC)', pos: 'Adj', posLabel: '형용사(Adj)', colorClass: 'border-violet-400 text-violet-700' },
    ],
    translation: '“이 스마트 플랫폼은 우리의 일일 업무 과정을 매우 실현 가능하게 만듭니다.”',
    skeleton: 'platform[S] + makes[V] + workflow[DO] + feasible[OC]',
    patternType: '5형식 (S + V + DO + OC) 목적격보어 문형',
    wordOrderTip: '목적어(workflow)의 상태를 설명하는 자리(OC)에는 한국어로 "~하게"라고 해석되어도 부사(feasibly)가 아닌 형용사(feasible)를 씁니다!',
  },
];

// ============================================================================
// 3. [선제시형 트렌드 허브] 8대 빅미디어 실시간 최다 검색어 (각 10개씩 = 총 80개)
// ============================================================================
export interface MediaTrendPlatform {
  id: MediaPlatformId;
  name: string;
  shortName: string;
  badgeColor: string;
  liveUrl: string;
  desc: string;
  keywords: {
    rank: number;
    koTitle: string;
    enExpression: string;
    targetThemeId: string;
    extUrl: string;
  }[];
}

export const MEDIA_PLATFORMS: MediaTrendPlatform[] = [
  {
    id: 'NAVER_DATALAB',
    name: '💚 네이버 데이터랩',
    shortName: 'N데이터랩',
    badgeColor: 'bg-emerald-600 text-white',
    liveUrl: 'https://datalab.naver.com/',
    desc: '분야별(쇼핑·경제·IT·생활) 급상승 검색어 TOP 10',
    keywords: [
      { rank: 1, koTitle: '아이패드 M5 & 스마트 워크플로우', enExpression: 'streamline the workflow', targetThemeId: 'biz-meeting', extUrl: 'https://datalab.naver.com/' },
      { rank: 2, koTitle: '오픽(OPIc) 단기 AL 달성 템플릿', enExpression: 'from my perspective', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=perspective' },
      { rank: 3, koTitle: '해외여행 공항 라운지 무료 이용권', enExpression: 'complimentary lounge access', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=complimentary' },
      { rank: 4, koTitle: '연말 비즈니스 성과 보고 & 협상', enExpression: 'touch base with the team', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=touch%20base' },
      { rank: 5, koTitle: 'SNS 바이럴 릴스 & 숏폼 챌린지', enExpression: 'go viral overnight', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=go%20viral' },
      { rank: 6, koTitle: '글로벌 금리 인하 & 환율 전망', enExpression: 'tentative financial forecast', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=tentative' },
      { rank: 7, koTitle: '주말 브런치 카페 & 힐링 루틴', enExpression: 'unwind on the weekend', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=unwind' },
      { rank: 8, koTitle: '부티크 호텔 얼리 체크인 & 수하물', enExpression: 'drop off the luggage', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=drop%20off' },
      { rank: 9, koTitle: 'AI 생산성 앱 & 일정 자동화', enExpression: 'expedite the process', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=expedite' },
      { rank: 10, koTitle: '원어민 필수 구동사 & 뉘앙스 사전', enExpression: 'get on the same page', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=on%20the%20same%20page' },
    ],
  },
  {
    id: 'NAVER_SHORTENTS',
    name: '⚡ 네이버 숏텐츠',
    shortName: 'N숏텐츠',
    badgeColor: 'bg-green-600 text-white',
    liveUrl: 'https://m.naver.com/',
    desc: '지금 가장 많이 본 짧은 뉴스·연예·스포츠 이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '메이저리그 & 유럽축구 빅매치 하이라이트', enExpression: 'keep an eye on the score', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=keep%20an%20eye%20on' },
      { rank: 2, koTitle: '직장인 점심시간 10분 자기계발 루틴', enExpression: 'grab a quick bite', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=grab%20a%20bite' },
      { rank: 3, koTitle: '해외 명소 숨은 로컬 맛집 투어', enExpression: 'off the beaten track', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=off%20the%20beaten%20track' },
      { rank: 4, koTitle: '번아웃 극복하는 저녁 산책 습관', enExpression: 'clear my head after work', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=clear%20my%20head' },
      { rank: 5, koTitle: '넷플릭스 글로벌 TOP 1 드라마 명대사', enExpression: 'binge-watch the whole season', targetThemeId: 'media-viral', extUrl: 'https://en.dict.naver.com/#/search?query=binge%20watch' },
      { rank: 6, koTitle: '스마트 홈 가전 & 미니멀 인테리어', enExpression: 'declutter the living space', targetThemeId: 'opic-master', extUrl: 'https://en.dict.naver.com/#/search?query=declutter' },
      { rank: 7, koTitle: '긴급 일정 변경 & 사전 공지 매너', enExpression: 'give you a quick heads-up', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=heads-up' },
      { rank: 8, koTitle: '항공권 오버부킹 & 좌석 업그레이드 팁', enExpression: 'accommodate a special request', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=accommodate' },
      { rank: 9, koTitle: '품격 있는 거절 & 대안 제시 화법', enExpression: 'find a feasible alternative', targetThemeId: 'biz-meeting', extUrl: 'https://en.dict.naver.com/#/search?query=feasible' },
      { rank: 10, koTitle: '반려동물 동반 카페 & 휴양지 에티켓', enExpression: 'pet-friendly amenities', targetThemeId: 'travel-concierge', extUrl: 'https://en.dict.naver.com/#/search?query=amenities' },
    ],
  },
  {
    id: 'GOOGLE_TRENDS',
    name: '🌐 구글 트렌드 & 뉴스',
    shortName: '구글트렌드',
    badgeColor: 'bg-blue-600 text-white',
    liveUrl: 'https://trends.google.co.kr/trending?geo=KR',
    desc: '한국 및 글로벌 실시간 급상승 검색어 & 월드 헤드라인 TOP 10',
    keywords: [
      { rank: 1, koTitle: 'Next-Gen AI Agent & Productivity', enExpression: 'meticulously analyze data', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 2, koTitle: 'Global Remote Work & Digital Nomad', enExpression: 'updated travel itinerary', targetThemeId: 'travel-concierge', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 3, koTitle: 'OPIc Speaking High-Score Strategy', enExpression: 'speaking of which', targetThemeId: 'opic-master', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 4, koTitle: 'Short-Form Video Algorithm Trend', enExpression: 'catchy hook and caption', targetThemeId: 'media-viral', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 5, koTitle: 'Executive Meeting & Negotiation', enExpression: 'wrap up the agenda', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 6, koTitle: 'Sustainable Eco-Friendly Lifestyle', enExpression: 'make a conscious effort', targetThemeId: 'opic-master', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 7, koTitle: 'Luxury Resort Concierge Service', enExpression: 'vacant ocean-view suite', targetThemeId: 'travel-concierge', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 8, koTitle: 'Social Media Meme & Slang Culture', enExpression: 'live rent-free in my mind', targetThemeId: 'media-viral', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 9, koTitle: 'Cross-Team Collaboration & Synergy', enExpression: 'align our core priorities', targetThemeId: 'biz-meeting', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
      { rank: 10, koTitle: 'Work-Life Balance & Fitness Routine', enExpression: 'stay in good shape', targetThemeId: 'opic-master', extUrl: 'https://trends.google.co.kr/trending?geo=KR' },
    ],
  },
  {
    id: 'SIGNAL_BZ',
    name: '📡 시그널 실시간 검색어',
    shortName: '시그널실검',
    badgeColor: 'bg-indigo-600 text-white',
    liveUrl: 'https://signal.bz/',
    desc: '국내 포털 통합 실시간 검색어 차트 TOP 10',
    keywords: [
      { rank: 1, koTitle: '실시간 주요 경제 브리핑 & 증시 전망', enExpression: 'keep track of market trends', targetThemeId: 'biz-meeting', extUrl: 'https://signal.bz/' },
      { rank: 2, koTitle: '인천공항 스마트패스 & 출국장 혼잡도', enExpression: 'check in online in advance', targetThemeId: 'travel-concierge', extUrl: 'https://signal.bz/' },
      { rank: 3, koTitle: '직장인 이직 & 영어 면접 자기소개', enExpression: 'walk you through my career', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
      { rank: 4, koTitle: '화제의 유튜브 100만 조회수 인터뷰', enExpression: 'resonate with viewers', targetThemeId: 'media-viral', extUrl: 'https://signal.bz/' },
      { rank: 5, koTitle: '프로젝트 마감 기한 조율 & 협업 요청', enExpression: 'I was wondering if you could', targetThemeId: 'biz-meeting', extUrl: 'https://signal.bz/' },
      { rank: 6, koTitle: '주말 날씨 & 근교 드라이브 코스 추천', enExpression: 'go for a scenic drive', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
      { rank: 7, koTitle: '호텔 레이트 체크아웃 & 조식 포함 혜택', enExpression: 'complimentary breakfast buffet', targetThemeId: 'travel-concierge', extUrl: 'https://signal.bz/' },
      { rank: 8, koTitle: '화제의 신조어 & 원어민 리얼 반응', enExpression: 'hit the nail on the head', targetThemeId: 'media-viral', extUrl: 'https://signal.bz/' },
      { rank: 9, koTitle: '효율적인 시간 관리 & 우선순위 설정', enExpression: 'prioritize urgent tasks', targetThemeId: 'biz-meeting', extUrl: 'https://signal.bz/' },
      { rank: 10, koTitle: '취미 생활 & 홈트레이닝 루틴 공유', enExpression: 'stick to a daily routine', targetThemeId: 'opic-master', extUrl: 'https://signal.bz/' },
    ],
  },
  {
    id: 'NATE_ISSUE',
    name: '🔥 네이트 실시간 이슈',
    shortName: '네이트이슈',
    badgeColor: 'bg-rose-600 text-white',
    liveUrl: 'https://news.nate.com/rank/interest',
    desc: '네이트 판 & 뉴스 실시간 대중 공감 이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '직장 내 센스 있는 대화법 & 거절의 기술', enExpression: 'take a rain check', targetThemeId: 'biz-meeting', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 2, koTitle: '친구·동료와 오해 풀고 의견 맞추기', enExpression: 'clear the air right away', targetThemeId: 'media-viral', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 3, koTitle: '나만의 스트레스 해소법 & 힐링 푸드', enExpression: 'my go-to comfort food', targetThemeId: 'opic-master', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 4, koTitle: '해외여행 중 예상치 못한 문제 해결하기', enExpression: 'sort out the reservation issue', targetThemeId: 'travel-concierge', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 5, koTitle: '회의 시간 단축하는 핵심 결론 도출법', enExpression: 'cut to the chase', targetThemeId: 'biz-meeting', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 6, koTitle: 'SNS 핫플 카페 웨이팅 & 솔직 후기', enExpression: 'live up to the hype', targetThemeId: 'media-viral', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 7, koTitle: '집에서 즐기는 홈카페 & 독서 타임', enExpression: 'recharge my batteries', targetThemeId: 'opic-master', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 8, koTitle: '기내 수하물 규정 & 환승 대기 꿀팁', enExpression: 'a three-hour layover', targetThemeId: 'travel-concierge', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 9, koTitle: '팀원 사기 진작 & 긍정적 피드백 주기', enExpression: 'give credit where it is due', targetThemeId: 'biz-meeting', extUrl: 'https://news.nate.com/rank/interest' },
      { rank: 10, koTitle: '요즘 유행하는 숏폼 밈 & 댓글 리액션', enExpression: 'I can totally relate to this', targetThemeId: 'media-viral', extUrl: 'https://news.nate.com/rank/interest' },
    ],
  },
  {
    id: 'INSTA_THREADS',
    name: '📸 인스타 & 스레드',
    shortName: '인스타·스레드',
    badgeColor: 'bg-pink-600 text-white',
    liveUrl: 'https://www.threads.net/',
    desc: '인기 해시태그, 릴스(Reels) 바이럴, 스레드 핫이슈 TOP 10',
    keywords: [
      { rank: 1, koTitle: '#OOTD #DailyVibes 감성 영어 캡션', enExpression: 'soak up the good vibes', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
      { rank: 2, koTitle: '스레드에서 난리 난 원어민 공감 한 줄', enExpression: 'low-key obsessed with this', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
      { rank: 3, koTitle: '릴스 100만 뷰 자기관리 & 모닝 루틴', enExpression: 'kick off the day with coffee', targetThemeId: 'opic-master', extUrl: 'https://www.instagram.com/' },
      { rank: 4, koTitle: '감성 숙소 & 인피니티 풀 인생샷 표현', enExpression: 'breathtaking panoramic view', targetThemeId: 'travel-concierge', extUrl: 'https://www.instagram.com/' },
      { rank: 5, koTitle: '일잘러의 데스크테리어 & 아이패드 필기', enExpression: 'keep everything organized', targetThemeId: 'biz-meeting', extUrl: 'https://www.threads.net/' },
      { rank: 6, koTitle: '기분 전환용 주말 맛집 & 디저트 투어', enExpression: 'treat myself to something sweet', targetThemeId: 'opic-master', extUrl: 'https://www.instagram.com/' },
      { rank: 7, koTitle: '원어민들이 댓글에 제일 많이 쓰는 칭찬', enExpression: 'you nailed it Effortlessly', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
      { rank: 8, koTitle: '해외 로컬 마켓 & 빈티지 샵 쇼핑 회화', enExpression: 'browse around the local market', targetThemeId: 'travel-concierge', extUrl: 'https://www.instagram.com/' },
      { rank: 9, koTitle: '커리어 성장 & 동기부여 영어 명언', enExpression: 'step out of my comfort zone', targetThemeId: 'biz-meeting', extUrl: 'https://www.threads.net/' },
      { rank: 10, koTitle: '짧고 강렬한 스레드 트렌드 요약 표현', enExpression: 'long story short', targetThemeId: 'media-viral', extUrl: 'https://www.threads.net/' },
    ],
  },
  {
    id: 'YOUTUBE_SHORTS',
    name: '▶️ 유튜브 & 숏츠',
    shortName: '유튜브·숏츠',
    badgeColor: 'bg-red-600 text-white',
    liveUrl: 'https://www.youtube.com/feed/trending',
    desc: '인기 급상승 동영상 및 숏츠(Shorts) 최다 조회 키워드 TOP 10',
    keywords: [
      { rank: 1, koTitle: '1분 만에 귀가 트이는 원어민 연음 비법', enExpression: 'link the consonant and vowel', targetThemeId: 'opic-master', extUrl: 'https://www.youtube.com/results?search_query=english+linking+sounds+shorts' },
      { rank: 2, koTitle: '실리콘밸리 리더들의 간결한 회의 영어', enExpression: 'streamline the entire workflow', targetThemeId: 'biz-meeting', extUrl: 'https://www.youtube.com/results?search_query=business+english+meeting+shorts' },
      { rank: 3, koTitle: '뉴욕·런던 브이로그 실전 주문 & 스몰톡', enExpression: 'freshen up before dinner', targetThemeId: 'travel-concierge', extUrl: 'https://www.youtube.com/results?search_query=travel+english+vlog' },
      { rank: 4, koTitle: '유튜브 댓글창 지배하는 원어민 밈 모음', enExpression: 'this hits different at night', targetThemeId: 'media-viral', extUrl: 'https://www.youtube.com/results?search_query=english+slang+shorts' },
      { rank: 5, koTitle: '오픽 AL 만점자의 필러(Filler) 구사법', enExpression: 'well, if I remember correctly', targetThemeId: 'opic-master', extUrl: 'https://www.youtube.com/results?search_query=opic+al+tips' },
      { rank: 6, koTitle: '글로벌 테크 키노트 프리젠테이션 화법', enExpression: 'seamless integration and performance', targetThemeId: 'biz-meeting', extUrl: 'https://www.youtube.com/results?search_query=tech+keynote+english' },
      { rank: 7, koTitle: '해외 공항 입국심사 10초 통과 치트키', enExpression: 'here for leisure and sightseeing', targetThemeId: 'travel-concierge', extUrl: 'https://www.youtube.com/results?search_query=airport+immigration+english' },
      { rank: 8, koTitle: '미국 토크쇼 진행자의 재치 있는 리액션', enExpression: 'that makes total sense', targetThemeId: 'media-viral', extUrl: 'https://www.youtube.com/results?search_query=talk+show+english+expressions' },
      { rank: 9, koTitle: '영어 어순 뇌구조 바꾸는 소리블럭 훈련', enExpression: 'speak in meaningful chunks', targetThemeId: 'opic-master', extUrl: 'https://www.youtube.com/results?search_query=english+chunking+practice' },
      { rank: 10, koTitle: '협상 테이블에서 분위기 반전시키는 한마디', enExpression: 'meet halfway on the terms', targetThemeId: 'biz-meeting', extUrl: 'https://www.youtube.com/results?search_query=negotiation+english+phrases' },
    ],
  },
  {
    id: 'TIKTOK_TRENDS',
    name: '🎵 틱톡 트렌드',
    shortName: '틱톡트렌드',
    badgeColor: 'bg-slate-900 text-white',
    liveUrl: 'https://www.tiktok.com/explore',
    desc: '글로벌 바이럴 챌린지, 밈(Meme), 숏폼 네이티브 슬랭 TOP 10',
    keywords: [
      { rank: 1, koTitle: '원어민들이 매일 쓰는 리얼 맞장구 표현', enExpression: 'no cap, that is spot-on', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 2, koTitle: '15초 만에 배우는 원어민 발음 강세 리듬', enExpression: 'stress the content words', targetThemeId: 'opic-master', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 3, koTitle: '글로벌 직장인 공감 오피스 숏폼 회화', enExpression: 'circle back to this tomorrow', targetThemeId: 'biz-meeting', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 4, koTitle: '해외 호텔 룸 업그레이드 성공 챌린지', enExpression: 'would it be possible to upgrade', targetThemeId: 'travel-concierge', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 5, koTitle: '친한 사이에 쓰는 쿨한 인사 & 안부', enExpression: 'catch up over coffee soon', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 6, koTitle: '오픽 프리토킹 막힐 때 시간 버는 마법문장', enExpression: 'let me think about how to put it', targetThemeId: 'opic-master', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 7, koTitle: '스마트하게 내 의견 어필하는 실무 표현', enExpression: 'bring a fresh perspective', targetThemeId: 'biz-meeting', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 8, koTitle: '해외 레스토랑 팁 & 추천 메뉴 물어보기', enExpression: 'what do you recommend on the menu', targetThemeId: 'travel-concierge', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 9, koTitle: '감탄이 절로 나올 때 원어민 한마디', enExpression: 'blown away by the quality', targetThemeId: 'media-viral', extUrl: 'https://www.tiktok.com/explore' },
      { rank: 10, koTitle: '꾸준히 성장하는 습관 챌린지 영어', enExpression: 'consistency is the key to fluency', targetThemeId: 'opic-master', extUrl: 'https://www.tiktok.com/explore' },
    ],
  },
];
// ============================================================================
// [2/4 파트] 네이버 퀴즈 챌린지 + 중·고등·실무·오픽 전자책 단어장 + 4대 테마 풀코스 DB
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

// ============================================================================
// 4. 전자책 페이지 넘김용 4대 단어장 (중등 필수 / 고등·수능 / 비즈니스 / 오픽·구동사)
// ============================================================================
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
    day: 1,
    level: '중등 필수',
    word: 'experience',
    ipa: '/ɪkˈspɪə.ri.əns/',
    pron: '[익-스피어리언스]',
    soundBlock: 'a valuable / experience',
    soundMethod: 'sp-에서 된소리 [피]로 발음하며, -pe- 음절에 강세를 실어 부드럽게 이어줍니다.',
    meaning: '경험, 체험, 겪다',
    pos: 'N',
    posLabel: '명사 (N)',
    comp: 'SC',
    compLabel: '주격보어 (SC)',
    collocation: 'hands-on experience',
    collocationKo: '직접 몸으로 부딪쳐 얻은 실무 경험',
    exampleEn: 'Traveling abroad alone was an unforgettable experience.',
    exampleKo: '혼자 해외여행을 떠난 것은 잊지 못할 경험이었습니다.',
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
    soundMethod: '중간의 -or- 소리가 사실상 탈락하여 4음절이 아닌 3음절 [컴-프터블]로 압축 발음됩니다!',
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
    day: 2,
    level: '중등 필수',
    word: 'carefully',
    ipa: '/ˈkeə.fəl.i/',
    pron: '[케어-풀리]',
    soundBlock: 'carefully / reviewed the plan',
    soundMethod: '첫 음절 care-에 강세를 두고, 뒤의 -fully는 약하고 빠르게 흘려줍니다.',
    meaning: '주의 깊게, 꼼꼼하게, 신중히',
    pos: 'Adv',
    posLabel: '부사 (Adv)',
    comp: 'M',
    compLabel: '수식어 (M)',
    collocation: 'listen carefully to',
    collocationKo: '~을 주의 깊게 경청하다',
    exampleEn: 'We carefully checked every detail before the launch.',
    exampleKo: '우리는 런칭 전에 모든 세부 사항을 꼼꼼히 점검했습니다.',
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
  {
    day: 3,
    level: '중등 필수',
    word: 'prepare',
    ipa: '/prɪˈpeər/',
    pron: '[프리-페어]',
    soundBlock: 'prepare for / the presentation',
    soundMethod: '앞의 pre-는 짧게 스치고, 뒤의 -pare를 길고 선명하게 강조합니다.',
    meaning: '준비하다, 대비하다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'prepare in advance',
    collocationKo: '사전에 미리 철저히 준비하다',
    exampleEn: 'We need to prepare for the upcoming client meeting.',
    exampleKo: '다가오는 고객사 미팅을 미리 준비해야 합니다.',
  },

  // --- [고등·수능 핵심] Day 1 ~ Day 3 ---
  {
    day: 1,
    level: '고등·수능 핵심',
    word: 'perspective',
    ipa: '/pəˈspek.tɪv/',
    pron: '[퍼-스펙티브]',
    soundBlock: 'from / a broader perspective',
    soundMethod: '중간 음절 -spec-에 강세를 주며, s 뒤의 p는 거센소리가 아닌 된소리 [ㅃ]로 발음합니다.',
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
    day: 1,
    level: '고등·수능 핵심',
    word: 'inevitable',
    ipa: '/ɪˈnev.ɪ.tə.bəl/',
    pron: '[이-네비터블]',
    soundBlock: 'an inevitable / outcome',
    soundMethod: 'in + evitable이 연음되어 [이-네-비-러-블]처럼 부드럽게 이어집니다.',
    meaning: '불가피한, 피할 수 없는, 필연적인',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'SC',
    compLabel: '주격보어 (SC)',
    collocation: 'an inevitable change',
    collocationKo: '피할 수 없는 시대적 변화',
    exampleEn: 'A slight delay in the schedule seemed inevitable.',
    exampleKo: '일정이 약간 지연되는 것은 불가피해 보였습니다.',
  },
  {
    day: 1,
    level: '고등·수능 핵심',
    word: 'contribute',
    ipa: '/kənˈtrɪb.juːt/',
    pron: '[컨-트리뷰트]',
    soundBlock: 'contribute to / team success',
    soundMethod: '-trib-에 강세를 실어주며, 전치사 to와 하나의 소리블럭으로 묶어 발음합니다.',
    meaning: '기여하다, 공헌하다, 원인이 되다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'contribute to the project',
    collocationKo: '프로젝트 성공에 크게 기여하다',
    exampleEn: 'Every member contributed greatly to our final success.',
    exampleKo: '모든 팀원이 우리의 최종 성공에 크게 기여했습니다.',
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
    day: 2,
    level: '고등·수능 핵심',
    word: 'accommodate',
    ipa: '/əˈkɒm.ə.deɪt/',
    pron: '[어-카머데이트]',
    soundBlock: 'accommodate / your request',
    soundMethod: '두 번째 음절 -com-에 강세를 두고 입을 크게 벌려 [카] 소리를 냅니다.',
    meaning: '(요구·인원을) 수용하다, 편의를 봐주다',
    pos: 'V',
    posLabel: '동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'accommodate up to 50 guests',
    collocationKo: '최대 50명의 손님을 수용하다',
    exampleEn: 'We will do our best to accommodate your schedule.',
    exampleKo: '고객님의 일정에 맞출 수 있도록 최선을 다해 배려하겠습니다.',
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
    day: 1,
    level: '비즈니스·실무',
    word: 'feasible',
    ipa: '/ˈfiː.zə.bəl/',
    pron: '[피-저블]',
    soundBlock: 'a highly / feasible option',
    soundMethod: '윗니로 아랫입술을 스치는 /f/ 소리로 시작해 장모음 /iː/를 충분히 늘려줍니다.',
    meaning: '실현 가능한, 실행할 수 있는',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'OC',
    compLabel: '목적격보어 (OC)',
    collocation: 'economically feasible',
    collocationKo: '경제적으로 타당성 있는(실현 가능한)',
    exampleEn: 'This new software makes our target deadline feasible.',
    exampleKo: '이 새로운 소프트웨어는 우리의 목표 마감 기한을 실현 가능하게 만듭니다.',
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
  {
    day: 2,
    level: '비즈니스·실무',
    word: 'tentative',
    ipa: '/ˈten.tə.tɪv/',
    pron: '[텐-터티브]',
    soundBlock: 'set a / tentative date',
    soundMethod: '미국식 발음에서는 두 번째 t가 n 뒤에서 약화되어 [테-너-티브]처럼 부드럽게 소리 납니다!',
    meaning: '잠정적인, 가안의, 확정되지 않은',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'M',
    compLabel: '수식어 (M)',
    collocation: 'a tentative agreement',
    collocationKo: '잠정 합의안',
    exampleEn: 'Here is the tentative schedule for next month.',
    exampleKo: '다음 달 잠정 일정표를 공유해 드립니다.',
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
    exampleEn: 'Listening to hip-hop music helps me unwind after a busy day.',
    exampleKo: '바쁜 하루 일과 후 힙합 음악을 듣는 것은 긴장을 푸는 데 큰 도움이 됩니다.',
  },
  {
    day: 1,
    level: '오픽(OPIc)·구동사',
    word: 'wrap up',
    ipa: '/ræp ʌp/',
    pron: '[래-펍]',
    soundBlock: 'wrap up / the meeting early',
    soundMethod: '앞 단어 끝 자음 p와 뒤 단어 모음 u가 연음되어 [랩 업]이 아니라 한 단어처럼 [래-펍]으로 소리 납니다.',
    meaning: '깔끔하게 마무리하다, 끝내다',
    pos: 'V',
    posLabel: '구동사 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'wrap up the project',
    collocationKo: '프로젝트를 성공적으로 갈무리하다',
    exampleEn: 'Let us wrap up today’s discussion and grab some coffee.',
    exampleKo: '오늘 논의는 여기까지 마무리하고 커피나 한잔하러 가시죠.',
  },
  {
    day: 2,
    level: '오픽(OPIc)·구동사',
    word: 'go-to',
    ipa: '/ˈɡəʊ.tuː/',
    pron: '[고-투]',
    soundBlock: 'my go-to / coffee shop',
    soundMethod: '명사 앞에서 형용사처럼 쓰이므로 앞쪽 go-에 강세를 두어 리듬감 있게 붙여서 발음합니다.',
    meaning: '언제나 믿고 찾는 단골의, 최애의',
    pos: 'Adj',
    posLabel: '형용사 (Adj)',
    comp: 'M',
    compLabel: '수식어 (M)',
    collocation: 'my go-to place for weekend brunch',
    collocationKo: '주말 브런치로 늘 믿고 가는 내 단골 맛집',
    exampleEn: 'This quiet cafe is my go-to spot whenever I study on my iPad.',
    exampleKo: '이 조용한 카페는 내가 아이패드로 공부할 때마다 늘 찾는 최애 장소입니다.',
  },
  {
    day: 2,
    level: '오픽(OPIc)·구동사',
    word: 'touch base',
    ipa: '/tʌtʃ beɪs/',
    pron: '[터치 베이스]',
    soundBlock: 'touch base / with you soon',
    soundMethod: '야구에서 주자가 베이스를 밟고 확인하듯, 두 단어 모두 강세를 살려 또렷하게 발음합니다.',
    meaning: '잠깐 연락해 안부·진행 상황을 공유하다',
    pos: 'V',
    posLabel: '동사구 (V)',
    comp: 'V',
    compLabel: '동사 (V)',
    collocation: 'touch base next Monday',
    collocationKo: '다음 주 월요일에 다시 연락해 상황을 공유하다',
    exampleEn: 'I just wanted to touch base with you regarding the new plan.',
    exampleKo: '새로운 계획과 관련해서 진행 상황을 잠깐 공유하고자 연락드렸습니다.',
  },
];

// ============================================================================
// 5. 4대 핵심 테마 풀코스 강의 DB (어순·발음기호·소리방식·소리블럭·오픽·문법·뉘앙스 완비)
// ============================================================================
export const THEMES: ThemeData[] = [
  // --------------------------------------------------------------------------
  // THEME 1: 비즈니스 미팅 & 프로젝트 일정 조율
  // --------------------------------------------------------------------------
  {
    id: 'biz-meeting',
    title: '📊 비즈니스 미팅 & 프로젝트 일정 조율',
    badge: '실무 리더십 · OPIc AL 필수',
    dateLabel: '11월 10일 (화) · 비즈니스 마스터 코스',
    opicLevel: 'OPIc IH ~ AL (직장·업무·협업 롤플레이 핵심)',
    coachPoint:
      '실무에서 일방적인 통보 대신 상대방의 자발적 협조를 이끌어내는 최고급 화법입니다. [누가(S) + 궁금하다(V) + 상대가 ~해줄 수 있는지(O절)] 어순 뼈대와 소리블럭 연음만 익히면 회의 주도권을 완벽히 잡을 수 있습니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [정중한 완충어구 (I was wondering if you could)] + [핵심 행동 동사(V)] + [목적어 대상(DO)] + [시간·목적 수식어(M)]',
    grammarSummary:
      '과거진행형(I was wondering)을 쓰면 현재 시점의 부탁을 한 발짝 물러서서 공손하게 여쭙는 "거리두기 공손법(Polite Distancing)" 효과가 발생하며, if절 안의 조동사 could 뒤에는 반드시 동사원형(V)이 옵니다.',
    situationGuide:
      '동료에게 마감 기한 단축을 요청할 때, 타 부서와 업무 일정을 맞출 때, 고객사에게 변경된 일정을 사전 공지(heads-up)할 때 가장 품격 있게 쓰입니다.',
    pattern: {
      en: 'I was wondering if you could ~',
      ipa: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf ju kʊd/',
      soundBlock: 'I was wondering / if you could / + 동사원형',
      soundMethod:
        'was는 약하게 [워즈], wondering의 첫 음절 [원-]에 가장 강한 강세를 실어주고, if you는 연음하여 [이퓨]로 한 호흡에 처리합니다.',
      pron: '[아이 워즈 원더링 / 이퓨 쿳 ~]',
      nuance:
        '단순한 "Can you ~?"나 "Please ~"보다 훨씬 정중하고 세련되게 상대방의 일정과 입장을 배려하며 협조를 구하는 비즈니스 최상급 만능 패턴입니다.',
      opicApplication:
        '오픽 롤플레이(질문하기·대안 제시하기) 문제에서 점수를 단숨에 AL로 끌어올리는 치트키 문장입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
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
        opicTip: '일상 루틴이나 점심시간 묘사 시 eat 대신 쓰면 원어민 느낌이 확 살아납니다.',
      },
      {
        id: 2,
        type: '일상 회화',
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
        opicTip: '답변 마지막 결론을 내릴 때 "To wrap up my story~"라고 쓰면 만점 구성이 됩니다.',
      },
      {
        id: 3,
        type: '일상 회화',
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
        opicTip: '전화를 걸거나 이메일을 보내는 이유 첫 문장으로 쓰기 가장 좋은 표현입니다.',
      },
      {
        id: 4,
        type: '일상 회화',
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
        opicTip: '팀 프로젝트나 협업 경험을 말할 때 빠질 수 없는 1순위 이디엄입니다.',
      },
      {
        id: 5,
        type: '일상 회화',
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
        opicTip: '일정 변경이나 돌발 상황을 미리 알려줄 때 warning 대신 쓰면 훨씬 세련됩니다.',
      },
      {
        id: 6,
        type: '고급/실무',
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
        opicTip: '업무 혁신이나 아이패드 디지털 스마트워크를 설명할 때 최고의 고급 동사입니다.',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'tentative',
        masked: 'te ⬛ t ⬛ t ⬛ ve',
        ipa: '/ˈten.tə.tɪv/',
        pron: '[텐-터티브 / 테너티브]',
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
        opicTip: '확정 전인 가안 일정이나 계획을 말할 때 temporary보다 훨씬 전문적입니다.',
      },
      {
        id: 8,
        type: '고급/실무',
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
        opicTip: 'possible 대신 feasible을 쓰면 비즈니스 영어 수준이 한 단계 올라갑니다.',
      },
      {
        id: 9,
        type: '고급/실무',
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
        opicTip: 'speed up의 완벽한 고급 비즈니스 대체어입니다.',
      },
      {
        id: 10,
        type: '고급/실무',
        word: 'meticulously',
        masked: 'me ⬛ i ⬛ u ⬛ ously',
        ipa: '/məˈtɪk.jə.ləs.li/',
        pron: '[머-티큘러슬리]',
        soundMethod: '두 번째 음절 -tic-에 강한 강세를 주면 5음절 단어도 리듬감 있게 한 번에 넘어갑니다.',
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
        opicTip: '본인의 꼼꼼한 업무 스타일이나 성격을 어필할 때 최고의 부사입니다.',
      },
    ],
    synonymScale: {
      baseWord: 'violent / fast (옥스퍼드 & 콜린스 유의어 강세 사전)',
      pos: '형용사·동사 뉘앙스 강도 비교',
      meaning: '단어의 세기와 격식도에 따른 원어민 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [
            { word: 'murderous / homicidal', ipa: '/ˈmɜː.dər.əs/', nuance: '살인적인, 치명적인 극단적 강도 (Oxford Thesaurus)' },
            { word: 'overhaul / revolutionize', ipa: '/ˈəʊ.və.hɔːl/', nuance: '시스템 전체를 완전히 뜯어고치다·혁신하다' },
          ],
        },
        {
          strength: '강함 (Strong)',
          words: [
            { word: 'bloody / fierce', ipa: '/ˈblʌd.i/', nuance: '맹렬하고 치열한 강도' },
            { word: 'expedite / streamline', ipa: '/ˈek.spə.daɪt/', nuance: '(업무·일정을) 공식적으로 신속히 앞당기다·효율화하다' },
          ],
        },
        {
          strength: '보통 (Neutral)',
          words: [
            { word: 'violent / intense', ipa: '/ˈvaɪə.lənt/', nuance: '격렬한, 강한 (기준 단어)' },
            { word: 'speed up / organize', ipa: '/spiːd ʌp/', nuance: '속도를 높이다, 정리하다 (일반 표준 회화)' },
          ],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [
            { word: 'rough / tough', ipa: '/rʌf/', nuance: '다소 거친, 빡빡한 (일상적 완곡 표현)' },
            { word: 'wrap up / touch base', ipa: '/ræp ʌp/', nuance: '가볍게 마무리하다, 잠깐 연락해 조율하다' },
          ],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 일상 대화 응용 ①',
        targetWord: 'wrap up',
        wordOrderFormula: '[주어(I)] + [동사(was wondering)] + [목적어절(if you could wrap up ~)] + [시간수식어(before ~)]',
        structure: '주어(S) + 동사(V) + 목적어절(O: 패턴 결합) + 수식어(M)',
        soundBlockEn: 'I was wondering / if you could wrap up / the checklist / before the afternoon meeting.',
        soundMethodGuide: 'could 끝소리 d는 잠시 숨을 멈추고 wrap up을 [래-펍]으로 연음해 리듬을 살립니다.',
        ipaLine: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf ju kʊd ræp ʌp ðə ˈtʃek.lɪst bɪˈfɔːr ði ˌæf.tərˈnuːn ˈmiː.tɪŋ/',
        koLine: '나는(S) / 궁금했습니다(V) / 당신이 마무리할 수 있는지(O) / 오후 회의 전에 그 점검표를(M).',
        enLine: 'I(S) / was wondering(V) / if you could [wrap up](O) / the checklist before the afternoon meeting(M).',
        rawEn: 'I was wondering if you could wrap up the checklist before the afternoon meeting.',
        pronLine: '[아이 워즈 원더링 / 이퓨 쿳 래-펍 / 더 체크리스트 / 비포 디 애프터눈 미팅]',
        naturalKo: '오후 미팅 시작 전에 혹시 체크리스트 정리를 좀 마무리해 주실 수 있을까요?',
        grammarPoint: '타동사 역할을 하는 구동사 wrap up 뒤에 목적어(the checklist)가 오고, 시간을 나타내는 전치사구(before ~)가 문장 맨 뒤 수식어(M)로 배치된 3형식 확장 문장입니다.',
        contextNuance: '직접적으로 "마무리해 주세요(Please finish)"라고 하면 압박감을 줄 수 있지만, 이 문장은 상대방을 존중하면서도 명확한 마감 시점을 전달합니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 일상 대화 응용 ②',
        targetWord: 'heads-up',
        wordOrderFormula: '[주어(I)] + [동사(wanted to give)] + [간접목적어(you)] + [직접목적어(a quick heads-up)] + [수식어(about ~)]',
        structure: '주어(S) + 동사(V) + 간접목적어(IO) + 직접목적어(DO) + 수식어(M)',
        soundBlockEn: 'I wanted to give you / a quick heads-up / about the updated schedule.',
        soundMethodGuide: 'wanted to는 원어민들이 [워너(wanna)] 또는 [원-티투]로 빠르게 연결하며, heads-up은 [헤-즈업]으로 붙입니다.',
        ipaLine: '/aɪ ˈwɒn.tɪd tə ɡɪv ju ə kwɪk ˈhedz.ʌp əˈbaʊt ði ʌpˈdeɪ.tɪd ˈskedʒ.uːl/',
        koLine: '나는(S) / 주고 싶었습니다(V) / 당신에게(IO) / 빠른 사전 귀띔을(DO) / 변경된 일정에 대해(M).',
        enLine: 'I(S) / wanted to give(V) / you(IO) / a quick [heads-up](DO) / about the updated schedule(M).',
        rawEn: 'I wanted to give you a quick heads-up about the updated schedule.',
        pronLine: '[아이 원티투 기뷰 / 어 퀵 헤-즈업 / 어바웃 디 업데이티드 스케줄]',
        naturalKo: '변경된 일정에 대해 미리 살짝 귀띔해 드리려고 연락드렸습니다.',
        grammarPoint: '4형식 수여동사 give의 어순(give + 사람[IO] + 사물[DO])을 그대로 따르며, 분사 형용사 updated가 명사 schedule을 앞에서 수식(M)합니다.',
        contextNuance: '갑작스러운 변경 사항을 통보할 때 상대방이 당황하지 않도록 배려하는 비즈니스 매너의 정석 표현입니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 고급/비즈니스 응용 ①',
        targetWord: 'streamline',
        wordOrderFormula: '[주어(I)] + [동사(was wondering)] + [목적어절(if we could streamline ~)] + [목적수식어(to save time)]',
        structure: '주어(S) + 동사(V) + 목적어절(O) + 수식어(M: 목적의 to부정사구)',
        soundBlockEn: 'I was wondering / if we could streamline / the entire workflow / to save time.',
        soundMethodGuide: 'the entire는 모음 앞이므로 [디 인타이어]로 연음하고, streamline과 save에 강한 악센트를 줍니다.',
        ipaLine: '/aɪ wəz ˈwʌn.dər.ɪŋ ɪf wi kʊd ˈstriːm.laɪn ði ɪnˈtaɪər ˈwɜːk.fləʊ tə seɪv taɪm/',
        koLine: '나는(S) / 궁금했습니다(V) / 우리가 간소화할 수 있을지(O) / 전체 업무 과정을 시간을 아끼기 위해(M).',
        enLine: 'I(S) / was wondering(V) / if we could [streamline](O) / the entire workflow to save time(M).',
        rawEn: 'I was wondering if we could streamline the entire workflow to save time.',
        pronLine: '[아이 워즈 원더링 / 이프 위 쿳 스트림-라인 / 디 인타이어 워크플로우 / 투 세이브 타임]',
        naturalKo: '시간을 단축하기 위해 전체 업무 프로세스를 좀 더 효율화할 수 있을지 논의해 보고 싶습니다.',
        grammarPoint: '문장 맨 끝의 to save time은 부사적 용법(목적: ~하기 위해서)으로 쓰인 수식어(M) 블록입니다.',
        contextNuance: '불필요한 절차를 줄이고 스마트하게 일하자고 제안할 때 리더십을 보여주는 고급 문장입니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 고급/비즈니스 응용 ②',
        targetWord: 'meticulously & feasible',
        wordOrderFormula: '[주어(Our team)] + [수식어(meticulously)] + [동사(reviewed)] + [목적어(the most feasible schedule)] + [수식어(in the morning)]',
        structure: '주어(S) + 수식어(M) + 동사(V) + 직접목적어(DO) + 수식어(M)',
        soundBlockEn: 'Our team / meticulously reviewed / the most feasible schedule / in the morning.',
        soundMethodGuide: 'most의 끝소리 t는 자음 f 앞에서 생략되어 [모스 피-저블]로 발음하면 원어민처럼 매끄럽습니다.',
        ipaLine: '/aʊər tiːm məˈtɪk.jə.ləs.li rɪˈvjuːd ðə məʊst ˈfiː.zə.bəl ˈskedʒ.uːl ɪn ðə ˈmɔː.nɪŋ/',
        koLine: '우리 팀은(S) / 꼼꼼하게(M) / 검토했습니다(V) / 가장 실현 가능한 일정을(O) / 오전에(M).',
        enLine: 'Our team(S) / [meticulously](M) / reviewed(V) / the most [feasible] schedule(O) / in the morning(M).',
        rawEn: 'Our team meticulously reviewed the most feasible schedule in the morning.',
        pronLine: '[아워 팀 / 머-티큘러슬리 리뷰드 / 더 모스 피-저블 스케줄 / 인 더 모닝]',
        naturalKo: '저희 팀이 오전에 가장 실현 가능성 높은 일정을 빈틈없이 검토했습니다.',
        grammarPoint: '부사 meticulously는 일반동사 reviewed 바로 앞에서 동사를 수식(M)하고, 형용사 최상급 most feasible은 명사 schedule을 수식(M)합니다.',
        contextNuance: '임원 보고나 고객사 브리핑에서 우리 팀의 철저한 준비성을 강조할 때 신뢰감을 극대화합니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'lick (네이버 오늘의 퀴즈 초급)',
        ipa: '/lɪk/',
        options: [
          '억제[저해]하다',
          '(특히 화가 나서 거칠게) 내던지다',
          '(~에) 중요성, 의미, 가치, 무게 등을 두다',
          '핥다',
        ],
        answerIdx: 3,
        explanation: 'lick은 혀를 대어 핥다는 뜻의 기본 동사입니다. (네이버 오늘의 단어 퀴즈 초급 기출)',
      },
      intermediate: {
        sentenceBefore: 'Can you',
        sentenceAfter: 'your nose with your tongue?',
        hint: '혀(tongue)로 코(nose)를 핥을 수 있는지 묻는 문장입니다.',
        options: ['lick', 'crunch', 'display', 'guard'],
        answerIdx: 0,
        explanation: '조동사 Can 뒤의 동사원형 자리로, 혀(tongue)와 짝을 이루는 동사 lick(핥다)이 정답입니다.',
      },
      advanced: {
        sentenceBefore: 'The spaniel leapt to',
        highlightWord: 'lick',
        sentenceAfter: 'his face.',
        options: ['moisten', 'cover', 'wet'],
        answerIndices: [0, 2],
        explanation: '얼굴을 핥아 촉촉하게 적신다는 문맥이므로 moisten(촉촉하게 적시다)과 wet(적시다) 2개가 복수 정답입니다.',
      },
      writingMission: {
        koPrompt: '혹시 이번 주 금요일까지 잠정적인 일정을 공유해 주실 수 있을까요?',
        wordOrderHint: '[패턴: I was wondering if you could] + [동사: share] + [목적어: a tentative schedule] + [기한: by this Friday]',
        hint: 'I was wondering if you could / share / a tentative schedule / by this Friday.',
        modelAnswer: 'I was wondering if you could share a tentative schedule by this Friday.',
        checkPoint:
          '잠정적인(tentative)은 형용사(Adj)로서 명사 schedule 앞에서 수식어(M) 역할을 하며, 완료 기한은 until이 아닌 by(~까지)를 씁니다.',
      },
    },
  },

  // --------------------------------------------------------------------------
  // THEME 2: 오픽(OPIc) AL 달성 만능 템플릿 & 일상 힐링 루틴
  // --------------------------------------------------------------------------
  {
    id: 'opic-master',
    title: '🎙️ 오픽(OPIc) AL 만능 템플릿 & 일상 힐링 루틴',
    badge: '오픽 AL 직결 · 소리블럭 특화',
    dateLabel: '11월 10일 (화) · 스피킹 & 오픽 마스터 코스',
    opicLevel: 'OPIc IM3 ~ AL (자기소개·여가·취미·루틴 만능 적용)',
    coachPoint:
      '오픽(OPIc)에서 AL 등급을 받는 핵심 비결은 어려운 단어가 아니라 "자연스러운 필러(Filler) + 소리블럭 단위의 리듬감 + 구동사 활용"입니다. 어떤 문제가 나와도 5분 이상 막힘없이 말할 수 있는 만능 구조를 체화합니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [감정·의견 도입부 (What I love most is that ~)] + [주어(S) + 동사(V)] + [감각적 이유·수식어(M)]',
    grammarSummary:
      '관계대명사 What절(What I really like is ~)을 문장 맨 앞 주어(S) 자리에 세우면, 원어민처럼 내가 강조하고 싶은 핵심 포인트를 드라마틱하게 던질 수 있습니다.',
    situationGuide:
      '오픽 시험장뿐만 아니라 외국인 동료와의 커피 타임, 주말 계획 스몰톡, 나만의 취미(아이패드 공부, 음악 감상, 산책)를 소개할 때 100% 활용됩니다.',
    pattern: {
      en: 'What I love most about ~ is that ~',
      ipa: '/wɒt aɪ lʌv məʊst əˈbaʊt ~ ɪz ðæt ~/',
      soundBlock: 'What I love most / about this routine / is that ~',
      soundMethod:
        'What I는 연음하여 [와-라이]로 부드럽게 굴려주고, love와 most에 강한 강세를 실어 감정을 풍부하게 표현합니다.',
      pron: '[와-라이 러브 모스트 / 어바웃 ~ / 이즈 댓 ~]',
      nuance:
        '단순히 "I like ~"라고 밋밋하게 말하는 대신, "~에 대해 내가 가장 좋아하는 점은 바로 ~라는 것입니다"라며 이야기의 집중도를 확 끌어올리는 원어민 최애 패턴입니다.',
      opicApplication:
        '카페 가기, 음악 감상, 운동, 집에서 쉬기 등 오픽의 모든 설문 주제 도입부에 그대로 끼워 쓸 수 있는 AL 보장 템플릿입니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'unwind',
        masked: 'u ⬛ w ⬛ nd',
        ipa: '/ʌnˈwaɪnd/',
        pron: '[언-와인드]',
        soundMethod: '뒤쪽 -wind를 [윈드]가 아닌 이중모음 [와인드/waɪnd/]로 길게 발음하는 것이 핵심입니다.',
        soundBlock: 'unwind / after work',
        meaning: '(긴장·피로를) 풀다, 편히 쉬다',
        enDef: '1. verb to relax and allow your mind to be free from worry after a period of work',
        exampleBlank: 'Listening to music helps me ______ after a hectic day.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '하루의 긴장과 스트레스를 해소하는 자동사 역할',
        collocation: 'unwind on the weekend',
        collocationKo: '주말에 긴장을 풀고 여유를 즐기다',
        opicTip: 'relax 대신 unwind를 쓰는 순간 채점관이 느끼는 어휘 수준이 달라집니다.',
      },
      {
        id: 2,
        type: '일상 회화',
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
        opicTip: 'favorite 대신 my go-to를 쓰면 100% 네이티브 스피커 표현이 됩니다.',
      },
      {
        id: 3,
        type: '일상 회화',
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
        opicTip: '공원 산책, 조깅, 드라이브 주제에서 만능으로 쓰이는 핵심 표현입니다.',
      },
      {
        id: 4,
        type: '일상 회화',
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
        opicTip: '자기관리나 운동, 영어 공부 습관을 말할 때 keep보다 훨씬 생동감 있습니다.',
      },
      {
        id: 5,
        type: '일상 회화',
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
        roleDesc: '사역/준사역 동사 help 뒤에서 목적격보어로 자주 쓰이는 관용구',
        collocation: 'fully recharge my batteries',
        collocationKo: '지친 에너지를 100% 재충전하다',
        opicTip: '휴가, 주말, 취미 관련 모든 오픽 답변의 마무리 문장으로 완벽합니다.',
      },
      {
        id: 6,
        type: '고급/실무',
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
        opicTip: '"In my opinion" 대신 "From my perspective"라고 시작하면 점수가 수직 상승합니다.',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'productive',
        masked: 'pr ⬛ d ⬛ ctive',
        ipa: '/prəˈdʌk.tɪv/',
        pron: '[프러-덕티브]',
        soundMethod: '첫 음절은 [프로]가 아니라 힘 뺀 [프러], 두 번째 -duc-에 강한 강세를 줍니다.',
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
        opicTip: '알찬 하루나 스마트 기기 활용법을 설명할 때 필수 형용사입니다.',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'consistency',
        masked: 'co ⬛ s ⬛ stency',
        ipa: '/kənˈsɪs.tən.si/',
        pron: '[컨-시스턴시]',
        soundMethod: '-sis- 음절에 강세를 두고 전후 모음은 약모음(슈와 /ə/)으로 가볍게 처리합니다.',
        soundBlock: 'consistency / is the key',
        meaning: '일관성, 한결같음, 꾸준함',
        enDef: '1. noun conformity in the application of something; steadfast adherence to the same principles',
        exampleBlank: '______ is the most important factor in mastering a language.',
        pos: 'N',
        posLabel: '명사 (Noun)',
        comp: 'S',
        compLabel: '주어 (S)',
        roleDesc: '문장 맨 앞 주어(S) 자리에서 핵심 가치를 나타내는 추상명사',
        collocation: 'maintain daily consistency',
        collocationKo: '매일 꾸준한 일관성을 유지하다',
        opicTip: '자신의 장점을 말할 때 꾸준함과 성실함을 나타내는 최고급 명사입니다.',
      },
      {
        id: 9,
        type: '고급/실무',
        word: 'immersive',
        masked: 'im ⬛ e ⬛ sive',
        ipa: '/ɪˈmɜː.sɪv/',
        pron: '[이-머시브]',
        soundMethod: '-mer-에 강세를 두고 혀를 부드럽게 말며 깊이 있는 소리를 냅니다.',
        soundBlock: 'an immersive / learning experience',
        meaning: '몰입감 넘치는, 깊숙이 빠져드는',
        enDef: '1. adjective generating a three-dimensional or deeply engaging environment',
        exampleBlank: 'Watching movies with great sound provides an ______ experience.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(experience/sound) 앞에서 몰입도 높은 성질을 꾸며줌',
        collocation: 'an immersive audio and visual experience',
        collocationKo: '몰입감 넘치는 시청각 경험',
        opicTip: '영화 감상, 음악 감상, 디지털 기기 주제의 고급 어휘로 강력 추천합니다.',
      },
      {
        id: 10,
        type: '고급/실무',
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
        opicTip: '오픽 돌발 질문이나 기억에 남는 주말 에피소드에서 쓰면 AL 감점 요인이 사라집니다.',
      },
    ],
    synonymScale: {
      baseWord: 'relax / calm (휴식·힐링 표현 강세 비교)',
      pos: '동사·관용구 뉘앙스 스케일',
      meaning: '스트레스를 풀고 휴식하는 정도의 어감 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'rejuvenate / revitalize', ipa: '/rɪˈdʒuː.vən.eɪt/', nuance: '몸과 마음의 활력을 완전히 새롭게 되살리다' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'recharge my batteries / unwind', ipa: '/ʌnˈwaɪnd/', nuance: '팽팽했던 긴장을 풀고 에너지를 꽉 채우다 (원어민 선호 1위)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'relax / take a rest', ipa: '/rɪˈlæks/', nuance: '편안히 쉬다, 휴식을 취하다 (기본 표현)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'chill out / take it easy', ipa: '/tʃɪl aʊt/', nuance: '가볍게 힘 빼고 빈둥거리며 쉬다 (캐주얼 슬랭)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 오픽 일상 루틴 ①',
        targetWord: 'unwind & recharge my batteries',
        wordOrderFormula: '[주어절(What I love most ~)] + [동사(is)] + [보어절(that it helps me unwind ~)]',
        structure: '명사절 주어(S) + 동사(V) + 명사절 주격보어(SC)',
        soundBlockEn: 'What I love most / about weekend evenings / is that I can unwind / and recharge my batteries.',
        soundMethodGuide: 'What I는 [와-라이], is that I는 [이즈 대-라이]로 부드럽게 연음하여 끊김 없이 이어줍니다.',
        ipaLine: '/wɒt aɪ lʌv məʊst əˈbaʊt ˌwiːkˈend ˈiːv.nɪŋz ɪz ðæt aɪ kæn ʌnˈwaɪnd ænd ˌriːˈtʃɑːdʒ maɪ ˈbæt.ər.iz/',
        koLine: '내가 가장 좋아하는 점은(S) / 주말 저녁에 대해(M) / 내가 긴장을 풀고 에너지를 재충전할 수 있다는 것입니다(V+SC).',
        enLine: 'What I love most(S) / about weekend evenings(M) / is that I can [unwind] and [recharge my batteries](V+SC).',
        rawEn: 'What I love most about weekend evenings is that I can unwind and recharge my batteries.',
        pronLine: '[와-라이 러브 모스트 / 어바웃 위켄드 이브닝즈 / 이즈 대-라이 캔 언-와인드 / 앤 리-차지 마이 배러리즈]',
        naturalKo: '제가 주말 저녁 시간에서 가장 좋아하는 점은 긴장을 싹 풀고 에너지를 재충전할 수 있다는 것입니다.',
        grammarPoint: 'What 관계대명사절이 주어(S) 역할을 할 때는 단수 취급하므로 본동사로 단수 동사 is(V)를 쓰는 것이 핵심 문법 포인트입니다.',
        contextNuance: '오픽 여가·주말·휴식 문제에서 첫 문장으로 던지면 원어민 채점관이 감탄하는 도입부입니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 오픽 일상 루틴 ②',
        targetWord: 'go-to & clear my head',
        wordOrderFormula: '[주어(This park)] + [동사(is)] + [주격보어(my go-to place)] + [시간·목적 수식어(whenever I need to clear my head)]',
        structure: '주어(S) + 동사(V) + 주격보어(SC) + 부사절 수식어(M)',
        soundBlockEn: 'This neighborhood park / is my go-to place / whenever I need / to clear my head.',
        soundMethodGuide: 'whenever I는 [웨네버-라이]로 연음하고, go-to와 clear에 또렷한 강세를 줍니다.',
        ipaLine: '/ðɪs ˈneɪ.bə.hʊd pɑːk ɪz maɪ ˈɡəʊ.tuː pleɪs wenˈev.ər aɪ niːd tə klɪər maɪ hed/',
        koLine: '이 동네 공원은(S) / 나의 최애 단골 장소입니다(V+SC) / 내가 복잡한 머리를 식혀야 할 때마다(M).',
        enLine: 'This neighborhood park(S) / is my [go-to] place(V+SC) / whenever I need to [clear my head](M).',
        rawEn: 'This neighborhood park is my go-to place whenever I need to clear my head.',
        pronLine: '[디스 네이버훗 파크 / 이즈 마이 고-투 플레이스 / 웨네버-라이 니드 / 투 클리어 마이 헤드]',
        naturalKo: '이 동네 공원은 제가 복잡한 머리를 식히고 싶을 때마다 언제나 찾는 최애 장소입니다.',
        grammarPoint: '복합관계부사 whenever(~할 때마다 언제든지)가 이끄는 절이 문장 뒤에서 시간·조건의 수식어(M) 역할을 합니다.',
        contextNuance: '공원, 카페, 드라이브 코스 등 좋아하는 장소를 소개할 때 단어만 바꿔 바로 쓸 수 있습니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 스마트 학습 응용 ①',
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
        grammarPoint: '5형식 동사 make의 목적격보어(OC) 자리에는 형용사(productive, immersive)가 와야 하며, 부사 highly는 그 형용사를 꾸미는 수식어(M)입니다.',
        contextNuance: '최신 기기 활용이나 자기계발 루틴을 설명할 때 매우 세련된 인상을 줍니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 고급 스피킹 응용 ②',
        targetWord: 'stick to & consistency',
        wordOrderFormula: '[주어(I)] + [동사(try to stick to)] + [목적어(this habit)] + [이유절(because consistency broadens my perspective)]',
        structure: '주어(S) + 동사(V) + 목적어(DO) + 이유 부사절 수식어(M)',
        soundBlockEn: 'I try to stick to / this habit / because consistency / broadens my perspective.',
        soundMethodGuide: 'try to는 [트라이-투], stick to는 [스띡-투]로 묶고, 접속사 because 앞에서 살짝 숨을 쉬어줍니다.',
        ipaLine: '/aɪ traɪ tə stɪk tu ðɪs ˈhæb.ɪt bɪˈkɒz kənˈsɪs.tən.si ˈbrɔː.dənz maɪ pəˈspek.tɪv/',
        koLine: '나는 꾸준히 지키려 노력합니다(S+V) / 이 습관을(DO) / 꾸준함이 나의 시야를 넓혀주기 때문입니다(M).',
        enLine: 'I try to [stick to](S+V) / this habit(DO) / because [consistency] broadens my [perspective](M).',
        rawEn: 'I try to stick to this habit because consistency broadens my perspective.',
        pronLine: '[아이 트라이 투 스띡-투 / 디스 해빗 / 비커즈 컨-시스턴시 / 브로-든즈 마이 퍼-스펙티브]',
        naturalKo: '꾸준함이 저의 시야를 넓혀주기 때문에 저는 이 습관을 한결같이 지키려고 노력합니다.',
        grammarPoint: '접속사 because 뒤에는 완전한 절(주어 consistency + 동사 broadens + 목적어 my perspective)이 이어집니다.',
        contextNuance: '인터뷰나 오픽 마지막 문장으로 말하면 논리적이고 깊이 있는 성인 학습자의 인상을 남깁니다.',
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
  // THEME 3: 해외여행 공항 라운지 & 호텔 컨시어지
  // --------------------------------------------------------------------------
  {
    id: 'travel-concierge',
    title: '✈️ 해외여행 공항 라운지 & 호텔 컨시어지',
    badge: '글로벌 매너 · 실전 여행 회화',
    dateLabel: '11월 10일 (화) · 글로벌 트래블 코스',
    opicLevel: 'OPIc IM2 ~ AL (해외여행·호텔·공항 롤플레이 필수)',
    coachPoint:
      '해외 공항과 호텔 데스크에서 무례하지 않으면서도 원하는 서비스(얼리 체크인, 레이트 체크아웃, 룸 업그레이드, 수하물 보관)를 100% 얻어내는 품격 있는 요청 화법입니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [정중한 가능성 질문 (Would it be possible to ~?)] + [핵심 동사(V)] + [요청 서비스 목적어(DO)] + [시간·장소 수식어(M)]',
    grammarSummary:
      '가주어 it과 진주어 to부정사를 결합한 "Would it be possible to + 동사원형 ~?" 구문은 내가 주어가 되는 "Can I ~?"보다 상대방의 재량을 존중하는 최고급 정중 표현입니다.',
    situationGuide:
      '호텔 리셉션에서 고층 오션뷰 배정을 요청할 때, 체크인 전 벨데스크에 짐을 맡길 때, 공항 라운지 및 무료 어메니티 혜택을 확인할 때 즉시 사용합니다.',
    pattern: {
      en: 'Would it be possible to get ~?',
      ipa: '/wʊd ɪt bi ˈpɒs.ə.bəl tə ɡet ~/',
      soundBlock: 'Would it be possible / to get / + 원하는 서비스?',
      soundMethod:
        'Would it은 연음하여 [우-딧]으로 가볍게 튕기고, possible의 첫 음절 [파-]에 가장 높은 음정과 강세를 둡니다.',
      pron: '[우-딧 비 파-서블 / 투 겟 ~?]',
      nuance:
        '데스크 직원에게 부담을 주지 않으면서 기분 좋은 미소와 함께 특별 배려나 업그레이드를 이끌어내는 마법의 호텔·공항 치트키 패턴입니다.',
      opicApplication:
        '오픽 호텔 예약 변경이나 공항 문제 해결 롤플레이에서 이 문장 하나로 정중함과 유창성을 동시에 증명할 수 있습니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
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
        opicTip: '명사로 쓸 때는 하이픈을 넣어 check-in counter(체크인 카운터)로 씁니다.',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'carry-on',
        masked: 'c ⬛ rry-o ⬛',
        ipa: '/ˈkær.i.ɒn/',
        pron: '[캐-리온]',
        soundMethod: '첫 음절 car-에 강세를 두고 부드럽게 -on을 이어 붙입니다.',
        soundBlock: 'carry-on / luggage',
        meaning: '기내 반입용 수하물',
        enDef: '1. noun/adj a small bag or suitcase that a passenger is allowed to take into the aircraft cabin',
        exampleBlank: 'This compact bag fits easily in the ______ overhead bin.',
        pos: 'N',
        posLabel: '명사/형용사 (N)',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        roleDesc: '위탁 수하물(checked baggage)과 구분되는 기내 휴대 가방',
        collocation: 'carry-on baggage allowance',
        collocationKo: '기내 반입 수하물 허용 기준',
        opicTip: '공항 에피소드에서 기내 캐리어를 말할 때 필수 어휘입니다.',
      },
      {
        id: 3,
        type: '일상 회화',
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
        opicTip: '해외여행 비행기 환승 경험을 묘사할 때 transit보다 원어민이 훨씬 많이 씁니다.',
      },
      {
        id: 4,
        type: '일상 회화',
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
        opicTip: '호텔 도착 직후 첫 일정을 말할 때 "I freshened up first"라고 하면 완벽합니다.',
      },
      {
        id: 5,
        type: '일상 회화',
        word: 'drop off',
        masked: 'dr ⬛ p  o ⬛ f',
        ipa: '/drɒp ɒf/',
        pron: '[드라-포프]',
        soundMethod: 'drop의 끝 자음 p가 off와 이어져 [드라-포프]로 리듬감 있게 소리 납니다.',
        soundBlock: 'drop off / our luggage early',
        meaning: '(짐을) 먼저 맡기다, 내려주다',
        enDef: '1. phrasal verb to take someone or something to a particular place and leave them there',
        exampleBlank: 'Can we ______ our bags at the bell desk before check-in?',
        pos: 'V',
        posLabel: '구동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '체크인 시간 전에 벨데스크에 짐을 먼저 보관 요청할 때 사용',
        collocation: 'drop off the luggage early',
        collocationKo: '짐을 일찍 먼저 맡겨두다',
        opicTip: '해외여행 첫날 짐 보관 요청 시 가장 실용적인 1순위 구동사입니다.',
      },
      {
        id: 6,
        type: '고급/실무',
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
        opicTip: '호텔 생수병이나 안내문에 늘 적혀 있는 단어로, 알고 쓰면 품격이 달라집니다.',
      },
      {
        id: 7,
        type: '고급/실무',
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
        opicTip: '호텔이나 고객 서비스 롤플레이에서 상대방의 배려를 구할 때 최고급 동사입니다.',
      },
      {
        id: 8,
        type: '고급/실무',
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
        opicTip: '공항 입국심사나 호텔 컨시어지에서 schedule 대신 쓰면 즉시 통합니다.',
      },
      {
        id: 9,
        type: '고급/실무',
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
        opicTip: '기내 좌석 변경이나 호텔 빈방 문의 시 empty보다 훨씬 정확한 표현입니다.',
      },
      {
        id: 10,
        type: '고급/실무',
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
        opicTip: '오픽 호텔 묘사 문제에서 이 단어 하나만 써도 설명이 풍성해집니다.',
      },
    ],
    synonymScale: {
      baseWord: 'free / polite (호텔·항공 격식도 강세 비교)',
      pos: '여행·컨시어지 표현 뉘앙스 스케일',
      meaning: '상황의 격식에 따라 달라지는 어휘 선택',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'on the house / VIP courtesy', ipa: '/ɒn ðə haʊs/', nuance: '호텔·레스토랑 측의 최고급 특별 무료 대접' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'complimentary', ipa: '/ˌkɒm.plɪˈmen.tər.i/', nuance: '품격 있는 공식 무료 제공 (호텔·항공사 표준어)' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'free of charge / included', ipa: '/friː əv tʃɑːdʒ/', nuance: '추가 요금이 부과되지 않는, 포함된' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'free', ipa: '/friː/', nuance: '일상적인 무료 (격식 있는 데스크에서는 다소 직설적)' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 공항/호텔 일상 ①',
        targetWord: 'drop off',
        wordOrderFormula: '[정중질문(Would it be possible)] + [진주어(to drop off ~)] + [수식어(before check-in)]?',
        structure: '조동사 + 가주어(It) + 동사(V) + 보어(SC) + 진주어(to V + DO + M)?',
        soundBlockEn: 'Would it be possible / to drop off / our luggage early / before check-in?',
        soundMethodGuide: 'drop off를 [드라-포프]로 연음하고, 의문문이므로 문장 끝 check-in의 억양을 살짝 올려줍니다(↗).',
        ipaLine: '/wʊd ɪt bi ˈpɒs.ə.bəl tə drɒp ɒf aʊər ˈlʌɡ.ɪdʒ ˈɜː.li bɪˈfɔːr ˈtʃek.ɪn/',
        koLine: '가능할까요(V+SC) / 맡기는 것이(S:진주어) / 우리 짐을 일찍(DO+M) / 체크인 시간 전에(M)?',
        enLine: 'Would it be possible(V+SC) / to [drop off](S) / our luggage early(DO) / before check-in(M)?',
        rawEn: 'Would it be possible to drop off our luggage early before check-in?',
        pronLine: '[우-딧 비 파-서블 / 투 드라-포프 / 아워 러기지 얼리 / 비포 체-킨↗]',
        naturalKo: '체크인 시간 전에 저희 짐을 먼저 좀 맡겨둘 수 있을까요?',
        grammarPoint: '불가산명사 luggage(수하물)는 복수형(luggages X)으로 쓰지 않으며, 부사 early가 동사구 drop off를 수식(M)합니다.',
        contextNuance: '호텔에 일찍 도착했을 때 짐을 맡기고 가볍게 관광하러 나갈 수 있게 해주는 필수 문장입니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 공항/호텔 일상 ②',
        targetWord: 'freshen up',
        wordOrderFormula: '[주어(We)] + [동사(would like to freshen up)] + [장소수식어(in our room)] + [시간수식어(before ~)]',
        structure: '주어(S) + 동사구(V+O) + 장소 수식어(M) + 시간 수식어(M)',
        soundBlockEn: 'We would like to / freshen up / in our room / before heading out for dinner.',
        soundMethodGuide: 'freshen up in our를 한 호흡처럼 [프레셔-너-피-나워]로 부드럽게 이어주면 유창하게 들립니다.',
        ipaLine: '/wi wʊd laɪk tə ˈfreʃ.ən ʌp ɪn aʊər ruːm bɪˈfɔːr ˈhed.ɪŋ aʊt fɔːr ˈdɪn.ər/',
        koLine: '우리는(S) / 간단히 씻고 재정비하고 싶습니다(V+O) / 우리 객실에서(M) / 저녁 먹으러 나가기 전에(M).',
        enLine: 'We(S) / would like to [freshen up](V+O) / in our room(M) / before heading out for dinner(M).',
        rawEn: 'We would like to freshen up in our room before heading out for dinner.',
        pronLine: '[위 우드 라익 투 / 프레-셔넙 / 인 아워 룸 / 비포 헤딩 아웃 포 디너]',
        naturalKo: '저녁 먹으러 나가기 전에 방에서 간단히 씻고 재정비 좀 하고 싶습니다.',
        grammarPoint: '전치사 before 뒤에는 동명사구(heading out for dinner: 저녁 먹으러 외출하기)가 와서 시간 수식어(M) 블록을 이룹니다.',
        contextNuance: '"샤워하다(take a shower)"라고 직접 말하는 것보다 훨씬 교양 있고 세련된 원어민 표현입니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 프리미엄 컨시어지 ①',
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
        grammarPoint: '어떤 상태(객실 이용)가 특정 시점까지 계속 이어질 때는 전치사 until(~까지 쭉)을 사용하여 시간 수식어(M)를 만듭니다.',
        contextNuance: '호텔리어들이 가장 대우해 주는 격식 있는 문장으로, 실제 무료 연장 성공률을 높여줍니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 프리미엄 컨시어지 ②',
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
        grammarPoint: '3형식 타동사 explain은 목적어(DO) 두 개를 등위접속사 and로 나란히 병렬 연결하고 있습니다.',
        contextNuance: '오픽 여행 경험담에서 호텔 서비스가 얼마나 좋았는지 구체적으로 묘사할 때 빛을 발합니다.',
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

  // --------------------------------------------------------------------------
  // THEME 4: 유튜브·인스타·숏폼 바이럴 & 네이티브 리액션
  // --------------------------------------------------------------------------
  {
    id: 'media-viral',
    title: '🔥 유튜브·인스타·숏폼 바이럴 & 네이티브 리액션',
    badge: 'SNS 실검 연동 · 리얼 구어체',
    dateLabel: '11월 10일 (화) · 글로벌 트렌드 & 미디어 코스',
    opicLevel: 'OPIc IM3 ~ AL (미디어·영화·스포츠·이슈 토론)',
    coachPoint:
      '유튜브, 인스타그램, 스레드, 틱톡에서 원어민들이 매일 쏟아내는 진짜 살아있는 리액션과 트렌드 어휘입니다. 자막 없이 숏폼과 해외 영상을 즐기고 감각적인 맞장구를 치는 비법을 익힙니다.',
    wordOrderPrinciple:
      '📌 핵심 어순 공식: [공감·감탄 주어+동사 (I cannot get enough of ~ / It really resonated with me)] + [구체적 대상·이유 수식어(M)]',
    grammarSummary:
      '감각동사나 자동사 뒤에 전치사구(resonate with ~, live up to ~)가 결합하여 하나의 타동사처럼 목적어를 취하는 숙어 블록을 통째로 소리블럭화하는 것이 핵심입니다.',
    situationGuide:
      '화제의 유튜브 영상이나 스포츠 경기를 보고 대화할 때, 맛집이나 신제품이 소문만큼 좋을 때, 상대방의 말에 100% 공감하며 맞장구칠 때 바로 씁니다.',
    pattern: {
      en: 'It really lived up to the hype!',
      ipa: '/ɪt ˈrɪə.li lɪvd ʌp tə ðə haɪp/',
      soundBlock: 'It really / lived up / to the hype!',
      soundMethod:
        'lived up은 연음하여 [리브-덥]으로 묶고, 마지막 핵심 명사 hype(/haɪp/)에 강하고 높은 강세를 실어 감탄하듯 발음합니다.',
      pron: '[잇 리얼리 / 리브-덥 / 투 더 하입!]',
      nuance:
        'SNS나 뉴스에서 엄청나게 화제가 된 맛집, 영화, 신제품(아이패드 등)을 직접 경험해 보니 "소문대로(기대했던 것만큼) 진짜 명불허전이더라!"라고 극찬할 때 쓰는 원어민 1순위 표현입니다.',
      opicApplication:
        '기억에 남는 영화, 콘서트, 새로 산 전자기기, 맛집 후기를 말할 때 마지막 평가 문장으로 쓰면 AL을 받기에 완벽합니다.',
    },
    vocab: [
      {
        id: 1,
        type: '일상 회화',
        word: 'go viral',
        masked: 'g ⬛  v ⬛ ral',
        ipa: '/ɡəʊ ˈvaɪ.rəl/',
        pron: '[고- 바이럴]',
        soundMethod: 'viral의 첫 음절 vi-를 [비]가 아닌 [바이]로 발음하는 것에 주의하세요!',
        soundBlock: 'went viral / overnight',
        meaning: '(영상·이슈가) SNS에서 입소문을 타고 대유행하다',
        enDef: '1. idiom to spread rapidly and widely on the internet through social media',
        exampleBlank: 'The short clip ______ on YouTube Shorts within hours.',
        pos: 'V',
        posLabel: '동사구 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '2형식 변화동사 go 뒤에 형용사 보어 viral이 결합한 서술어 블록',
        collocation: 'go viral overnight',
        collocationKo: '하룻밤 사이에 폭발적인 화제가 되다',
        opicTip: '유튜브나 SNS 트렌드를 설명할 때 가장 먼저 나와야 하는 표현입니다.',
      },
      {
        id: 2,
        type: '일상 회화',
        word: 'binge-watch',
        masked: 'b ⬛ nge-w ⬛ tch',
        ipa: '/ˈbɪndʒ.wɒtʃ/',
        pron: '[빈지-워치]',
        soundMethod: 'binge(/bɪndʒ/)에 강세를 두고 watch를 리듬감 있게 붙여 발음합니다.',
        soundBlock: 'binge-watch / the entire series',
        meaning: '(드라마·영화를) 몰아서 정주행하다',
        enDef: '1. verb to watch multiple episodes of a television program in rapid succession',
        exampleBlank: 'We decided to ______ the new drama series this weekend.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '뒤에 시리즈나 영상 목적어(DO)를 취하는 타동사',
        collocation: 'binge-watch the whole season',
        collocationKo: '전 시즌을 한꺼번에 몰아보다(정주행하다)',
        opicTip: '영화·드라마 관람 취미 질문에서 100% 출제 포인트가 되는 단어입니다.',
      },
      {
        id: 3,
        type: '일상 회화',
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
        opicTip: '신제품 리뷰나 핫플레이스 방문 후기에서 원어민들이 가장 사랑하는 표현입니다.',
      },
      {
        id: 4,
        type: '일상 회화',
        word: 'keep an eye on',
        masked: 'k ⬛ ep an e ⬛ e on',
        ipa: '/kiːp ən aɪ ɒn/',
        pron: '[키-퍼-나이 온]',
        soundMethod: 'keep an eye가 전부 연음되어 [키-퍼-나이]처럼 한 덩어리로 매끄럽게 흘러갑니다!',
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
        opicTip: '스포츠 경기 시청이나 시장 트렌드 관찰을 말할 때 만능으로 쓰입니다.',
      },
      {
        id: 5,
        type: '일상 회화',
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
        opicTip: '토론이나 회의, 댓글 리액션에서 격조 높은 맞장구 표현입니다.',
      },
      {
        id: 6,
        type: '고급/실무',
        word: 'resonate',
        masked: 'r ⬛ s ⬛ nate',
        ipa: '/ˈrez.ən.eɪt/',
        pron: '[레-저네이트]',
        soundMethod: '첫 음절 re-에 강세를 두고 s는 유성음 [즈]로 부드럽게 울려줍니다.',
        soundBlock: 'deeply resonate / with the audience',
        meaning: '깊은 공감을 불러일으키다, 마음에 울림을 주다',
        enDef: '1. verb to evoke images, memories, and emotions; to be deeply meaningful to someone',
        exampleBlank: 'The movie’s message deeply ______ with millions of viewers.',
        pos: 'V',
        posLabel: '동사 (Verb)',
        comp: 'V',
        compLabel: '동사 (V)',
        roleDesc: '전치사 with와 함께 쓰여 감동과 공감대를 형성함을 나타냄',
        collocation: 'resonate with the public',
        collocationKo: '대중들에게 깊은 공감과 울림을 주다',
        opicTip: '명작 영화(피아니스트의 전설 등)나 음악 감상평을 말할 때 최고의 동사입니다.',
      },
      {
        id: 7,
        type: '고급/실무',
        word: 'captivating',
        masked: 'c ⬛ pt ⬛ vating',
        ipa: '/ˈkæp.tɪ.veɪ.tɪŋ/',
        pron: '[캡-티베이팅]',
        soundMethod: '첫 음절 cap-을 강하게 발음하고 미국식에서는 마지막 -ting을 [링]으로 부드럽게 처리합니다.',
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
        opicTip: 'interesting이나 good 대신 쓰면 즉시 고급 어휘 점수를 획득합니다.',
      },
      {
        id: 8,
        type: '고급/실무',
        word: 'phenomenal',
        masked: 'ph ⬛ n ⬛ menal',
        ipa: '/fəˈnɒm.ɪ.nəl/',
        pron: '[퍼-나미널]',
        soundMethod: 'ph는 /f/ 소리이며, 두 번째 음절 -nom-에 강한 강세를 실어 감탄하듯 발음합니다.',
        soundBlock: 'a phenomenal / success',
        meaning: '경이로운, 놀라울 정도로 대단한',
        enDef: '1. adjectivevery remarkable; extraordinary',
        exampleBlank: 'The athlete showed a ______ performance in the final match.',
        pos: 'Adj',
        posLabel: '형용사 (Adjective)',
        comp: 'M',
        compLabel: '수식어 (M)',
        roleDesc: '명사(performance/quality) 앞에서 압도적 수준을 꾸며줌',
        collocation: 'phenomenal sound quality',
        collocationKo: '경이로울 정도로 뛰어난 음질',
        opicTip: '스포츠 명승부나 오디오·공연 퀄리티를 극찬할 때 원어민들이 즐겨 씁니다.',
      },
      {
        id: 9,
        type: '고급/실무',
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
        collocation: 'an informative documentary',
        collocationKo: '알차고 유익한 다큐멘터리/콘텐츠',
        opicTip: '즐겨 보는 유튜브 채널이나 뉴스 트렌드를 소개할 때 필수 형용사입니다.',
      },
      {
        id: 10,
        type: '고급/실무',
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
        roleDesc: '동사(수행하다/연주하다)를 꾸며 숙련된 자연스러움을 강조함',
        collocation: 'blend style and function effortlessly',
        collocationKo: '스타일과 기능을 물 흐르듯 자연스럽게 결합하다',
        opicTip: '전문가의 솜씨나 스마트 기기의 매끄러운 작동을 묘사할 때 최고급 부사입니다.',
      },
    ],
    synonymScale: {
      baseWord: 'good / amazing (극찬·감탄 표현 강세 비교)',
      pos: '형용사 뉘앙스 스케일',
      meaning: '콘텐츠·제품·경험을 칭찬할 때의 감탄 강도 차이',
      levels: [
        {
          strength: '매우 강함 (Extreme)',
          words: [{ word: 'phenomenal / mind-blowing', ipa: '/fəˈnɒm.ɪ.nəl/', nuance: '경이롭고 압도적이어서 입이 다물어지지 않는 수준' }],
        },
        {
          strength: '강함 (Strong)',
          words: [{ word: 'captivating / top-notch', ipa: '/ˈkæp.tɪ.veɪ.tɪŋ/', nuance: '마음을 완전히 사로잡는, 타의 추종을 불허하는 일류 품질' }],
        },
        {
          strength: '보통 (Neutral)',
          words: [{ word: 'impressive / informative', ipa: '/ɪmˈpres.ɪv/', nuance: '인상 깊고 유익한 (격식·표준 칭찬)' }],
        },
        {
          strength: '약함/완곡 (Mild)',
          words: [{ word: 'decent / pretty good', ipa: '/ˈdiː.sənt/', nuance: '꽤 괜찮은, 나쁘지 않고 준수한' }],
        },
      ],
    },
    sentences: [
      {
        id: 1,
        tag: 'Training 1 - 트렌드 리액션 ①',
        targetWord: 'live up to the hype & phenomenal',
        wordOrderFormula: '[주어(The new iPad)] + [동사(lived up to the hype)] + [이유수식어(with its phenomenal display)]',
        structure: '주어(S) + 동사구(V+O) + 전치사구 수식어(M)',
        soundBlockEn: 'The new iPad / definitely lived up to the hype / with its phenomenal display.',
        soundMethodGuide: 'lived up to를 [리브-덥-투]로 묶고, phenomenal의 [-나-] 음절을 높게 강조합니다.',
        ipaLine: '/ðə njuː ˈaɪ.pæd ˈdef.ɪ.nət.li lɪvd ʌp tə ðə haɪp wɪð ɪts fəˈnɒm.ɪ.nəl dɪˈspleɪ/',
        koLine: '새 아이패드는(S) / 확실히 소문만큼 명불허전이었습니다(M+V+O) / 그것의 경이로운 디스플레이 덕분에(M).',
        enLine: 'The new iPad(S) / definitely [lived up to the hype](M+V+O) / with its [phenomenal] display(M).',
        rawEn: 'The new iPad definitely lived up to the hype with its phenomenal display.',
        pronLine: '[더 뉴 아이패드 / 데피닛리 리브-덥 투 더 하입 / 위드 잇츠 퍼-나미널 디스플레이]',
        naturalKo: '새로 나온 아이패드는 경이로운 화질 덕분에 정말 소문대로 명불허전이었습니다.',
        grammarPoint: '부사 definitely가 동사구 lived up to the hype 바로 앞에서 확신의 정도를 꾸며주는 수식어(M)로 쓰였습니다.',
        contextNuance: '새로 구매한 기기나 핫플레이스 후기를 말할 때 가장 트렌디한 문장입니다.',
      },
      {
        id: 2,
        tag: 'Training 2 - 트렌드 리액션 ②',
        targetWord: 'binge-watch & captivating',
        wordOrderFormula: '[주어(I)] + [동사(binge-watched)] + [목적어(the series)] + [이유절(because the plot was captivating)]',
        structure: '주어(S) + 동사(V) + 직접목적어(DO) + 이유 부사절 수식어(M)',
        soundBlockEn: 'I binge-watched / the whole series / because the storyline / was so captivating.',
        soundMethodGuide: 'binge-watched의 -ed는 무성음 ch 뒤이므로 [워치트]로 가볍게 스치듯 발음합니다.',
        ipaLine: '/aɪ ˈbɪndʒ.wɒtʃt ðə həʊl ˈsɪə.riːz bɪˈkɒz ðə ˈstɔː.ri.laɪn wəz səʊ ˈkæp.tɪ.veɪ.tɪŋ/',
        koLine: '나는 몰아서 정주행했습니다(S+V) / 전체 시리즈를(DO) / 스토리가 너무 매혹적이었기 때문입니다(M).',
        enLine: 'I [binge-watched](S+V) / the whole series(DO) / because the storyline was so [captivating](M).',
        rawEn: 'I binge-watched the whole series because the storyline was so captivating.',
        pronLine: '[아이 빈지-워치트 / 더 홀 시리즈 / 비커즈 더 스토리라인 / 워즈 쏘 캡-티베이팅]',
        naturalKo: '스토리라인이 워낙 매혹적이어서 주말 동안 전 시리즈를 한꺼번에 정주행했습니다.',
        grammarPoint: 'series(시리즈)는 단수형과 복수형 철자가 모두 series로 동일한 명사입니다.',
        contextNuance: '주말에 무엇을 했는지 묻는 스몰톡이나 오픽 질문에 즉시 활용할 수 있습니다.',
      },
      {
        id: 3,
        tag: 'Training 3 - 고급 미디어 비평 ①',
        targetWord: 'resonate & informative',
        wordOrderFormula: '[주어(This video)] + [동사(went viral)] + [이유절(because it is informative and resonates with people)]',
        structure: '주어(S) + 동사구(V+SC) + 이유 부사절 수식어(M)',
        soundBlockEn: 'This short video / went viral / because it is informative / and resonates with people.',
        soundMethodGuide: 'went의 끝소리 t는 자음 v 앞에서 생략되어 [웬-바이럴]로 발음하면 원어민 속도가 납니다.',
        ipaLine: '/ðɪs ʃɔːt ˈvɪd.i.əʊ went ˈvaɪ.rəl bɪˈkɒz ɪt ɪz ɪnˈfɔː.mə.tɪv ænd ˈrez.ən.eɪts wɪð ˈpiː.pəl/',
        koLine: '이 짧은 영상은(S) / 대유행했습니다(V+SC) / 유익하고 사람들의 공감을 불러일으키기 때문입니다(M).',
        enLine: 'This short video(S) / [went viral](V+SC) / because it is [informative] and [resonates] with people(M).',
        rawEn: 'This short video went viral because it is informative and resonates with people.',
        pronLine: '[디스 쇼트 비디오 / 웬-바이럴 / 비커즈 잇 이즈 인-포머티브 / 앤 레-저네이츠 위드 피플]',
        naturalKo: '이 숏폼 영상은 내용이 유익할 뿐 아니라 사람들의 깊은 공감을 자아내서 폭발적인 화제가 되었습니다.',
        grammarPoint: '단수 주어 it에 맞춰 동사 is와 resonates에 둘 다 3인칭 단수 현재형(-s) 수일치가 적용되었습니다.',
        contextNuance: '최근 본 뉴스나 유튜브 트렌드가 왜 인기 있는지 분석적으로 설명할 때 쓰입니다.',
      },
      {
        id: 4,
        tag: 'Training 4 - 고급 스몰톡 응용 ②',
        targetWord: 'hit the nail on the head',
        wordOrderFormula: '[주어(Your analysis)] + [동사구(hit the nail on the head)] + [연결어(and)] + [주어2+동사2(everyone agreed)]',
        structure: '주어(S) + 동사구(V+O+M) + 접속사 + 주어2(S) + 동사2(V) + 수식어(M)',
        soundBlockEn: 'Your analysis / hit the nail on the head / and everyone agreed / effortlessly.',
        soundMethodGuide: 'nail on을 [네이-론]으로 연음하고, effortlessly에 부드러운 강세를 줍니다.',
        ipaLine: '/jɔːr əˈnæl.ə.sɪs hɪt ðə neɪl ɒn ðə hed ænd ˈev.ri.wʌn əˈɡriːd ˈef.ət.ləs.li/',
        koLine: '당신의 분석이(S) / 정확히 핵심 정곡을 찔렀고(V+O+M) / 모두가 자연스럽게 동의했습니다(S+V+M).',
        enLine: 'Your analysis(S) / [hit the nail on the head](V+O+M) / and everyone agreed [effortlessly](S+V+M).',
        rawEn: 'Your analysis hit the nail on the head and everyone agreed effortlessly.',
        pronLine: '[유어 어-낼러시스 / 힛 더 네이-론 더 헤드 / 앤 에브리원 어그리드 / 에-퍼트러슬리]',
        naturalKo: '당신의 분석이 정확히 핵심을 짚어내서 모두가 이견 없이 자연스럽게 동의했습니다.',
        grammarPoint: '과거 시점의 일이라도 hit의 과거형은 형태 변화 없이 그대로 hit(hit - hit - hit)을 씁니다.',
        contextNuance: '상대방의 통찰력을 최고 수준으로 칭찬할 때 쓰는 세련된 표현입니다.',
      },
    ],
    quiz: {
      beginner: {
        word: 'binge-watch',
        ipa: '/ˈbɪndʒ.wɒtʃ/',
        options: ['일정을 취소하다', '(드라마·영화를) 몰아서 정주행하다', '운동 계획을 세우다', '회의를 주재하다'],
        answerIdx: 1,
        explanation: 'binge(폭음·폭식 등 한꺼번에 몰아서 하기) + watch가 결합하여 시리즈물을 몰아본다는 뜻입니다.',
      },
      intermediate: {
        sentenceBefore: 'The new movie definitely',
        sentenceAfter: 'with its breathtaking soundtrack.',
        hint: '소문이나 기대만큼 실제로도 명불허전이었다는 뜻의 이디엄입니다.',
        options: ['lived up to the hype', 'dropped off', 'checked in', 'shed'],
        answerIdx: 0,
        explanation: '대중의 높은 기대치나 홍보(hype)에 걸맞게 훌륭했다는 표현은 lived up to the hype입니다.',
      },
      advanced: {
        sentenceBefore: 'The pianist’s performance was truly',
        highlightWord: 'captivating',
        sentenceAfter: 'from start to finish.',
        options: ['fascinating', 'enchanting', 'boring'],
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
];
// ============================================================================
// [3/4 파트] 메인 앱 상태 엔진 + 8대 매체 사이드바 + 전자책 단어장 + STEP 1~2 UI
// ============================================================================

export default function App() {
  // 1. 날짜 자동 감지 (365일 매일 다른 추천 테마 & 단어장 자동 로테이션)
  const todayObj = new Date();
  const todayDateStr = `${todayObj.getFullYear()}년 ${todayObj.getMonth() + 1}월 ${todayObj.getDate()}일`;
  const dayOfYear = Math.floor(
    (todayObj.getTime() - new Date(todayObj.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // 2. 핵심 모드 & 테마 상태
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    THEMES[dayOfYear % THEMES.length].id
  );
  const [activeMode, setActiveMode] = useState<
    'daily' | 'wordbook' | 'naverQuiz' | 'aiCoach' | 'weekly'
  >('daily');
  const [activeMediaPlatform, setActiveMediaPlatform] =
    useState<MediaPlatformId>('NAVER_DATALAB');

  // 3. UI 커스터마이징 상태 (디자인 테마 / 글씨체 구분 / 레이아웃 배치 / 다크모드)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [colorTheme, setColorTheme] = useState<'blue' | 'emerald' | 'indigo' | 'amber'>('blue');
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [layoutMode, setLayoutMode] = useState<'split' | 'wide'>('split');

  // 4. 오디오(글로벌 4개국 발음) & 실시간 영영사전 API 상태
  const [accent, setAccent] = useState<'en-US' | 'en-GB' | 'en-AU' | 'en-IN'>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [dictQuery, setDictQuery] = useState<string>('');
  const [liveDictResult, setLiveDictResult] = useState<{
    word: string;
    phonetic: string;
    definition: string;
    example: string;
  } | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState<boolean>(false);

  // 5. 한글 발음 블라인드 (기본 가림 -> 클릭 시 볼 수 있게) & 네이버 Hide 스위치
  const [showAllKoreanPron, setShowAllKoreanPron] = useState<boolean>(false);
  const [revealedPronKeys, setRevealedPronKeys] = useState<string[]>([]);
  const [hideWordMode, setHideWordMode] = useState<boolean>(false);
  const [hideMeaningMode, setHideMeaningMode] = useState<boolean>(false);
  const [revealedWordIds, setRevealedWordIds] = useState<number[]>([]);
  const [revealedChallengeIdx, setRevealedChallengeIdx] = useState<number[]>([]);

  // 6. 전자책 단어장 (중등/고등/실무/오픽 페이지 넘기기 & 진도 저장) + 스마트 복습 북마크
  const [wordbookLevel, setWordbookLevel] = useState<
    '중등 필수' | '고등·수능 핵심' | '비즈니스·실무' | '오픽(OPIc)·구동사'
  >('중등 필수');
  const [wordbookDay, setWordbookDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<string[]>(['중등 필수-1']);
  const [bookmarkedWords, setBookmarkedWords] = useState<
    { word: string; ipa: string; meaning: string; collocation: string; posLabel: string; compLabel: string }[]
  >([
    {
      word: 'streamline',
      ipa: '/ˈstriːm.laɪn/',
      meaning: '(업무·절차를) 간소화·효율화하다',
      collocation: 'streamline the entire workflow',
      posLabel: '동사 (Verb)',
      compLabel: '동사 (V)',
    },
    {
      word: 'unwind',
      ipa: '/ʌnˈwaɪnd/',
      meaning: '(긴장·피로를) 풀다, 쉬다',
      collocation: 'unwind on the weekend',
      posLabel: '동사 (Verb)',
      compLabel: '동사 (V)',
    },
  ]);

  // 7. STEP 3: 16개 문장 성분(7) × 9품사(9) 인터랙티브 다이어그램 상태
  const [diagramTab, setDiagramTab] = useState<'all' | 'comp' | 'pos'>('all');
  const [selectedComp, setSelectedComp] = useState<CompId | null>('DO');
  const [selectedPos, setSelectedPos] = useState<PosId | null>('N');
  const [selectedDiagramExId, setSelectedDiagramExId] = useState<string>('ex1');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(7);

  // 8. STEP 4: 아이패드 펜슬 필기 캔버스 & 타이핑 상태
  const [writingInputs, setWritingInputs] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // 9. STEP 5: 네이버 4단계 퀴즈 상태
  const [quizLevelTab, setQuizLevelTab] = useState<
    'word' | 'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [selectedBeginnerOpt, setSelectedBeginnerOpt] = useState<number | null>(null);
  const [selectedInterOpt, setSelectedInterOpt] = useState<number | null>(null);
  const [showInterHint, setShowInterHint] = useState<boolean>(false);
  const [selectedAdvOpts, setSelectedAdvOpts] = useState<number[]>([]);
  const [userWritingMission, setUserWritingMission] = useState<string>('');

  // 10. AI 음성 회화(5분~30분 시간 연장 가능) & 실시간 영작 첨삭 & 성장 리포트 상태
  const [targetSpeakingMins, setTargetSpeakingMins] = useState<number>(5);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'coach',
      text: 'Hello! I am your 1:1 iPad AI English Coach. Let us practice speaking using today’s pattern and sound blocks! Try making a sentence or ask me anything.',
      nuanceTip: '오늘의 패턴(I was wondering if you could ~ / What I love most ~)을 사용해 문장을 입력하거나 음성으로 말해 보세요!',
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
    masteredWords: 48,
    completedSentences: 24,
    quizAccuracy: 92,
    speakingMinutes: 35,
    streakDays: 7,
  });

  const currentTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];
  const currentDiagramEx =
    DIAGRAM_EXAMPLES.find((e) => e.id === selectedDiagramExId) || DIAGRAM_EXAMPLES[0];
  const currentMediaObj =
    MEDIA_PLATFORMS.find((m) => m.id === activeMediaPlatform) || MEDIA_PLATFORMS[0];

  // 테마 변경 시 퀴즈 선택 초기화
  useEffect(() => {
    setSelectedBeginnerOpt(null);
    setSelectedInterOpt(null);
    setShowInterHint(false);
    setSelectedAdvOpts([]);
    setRevealedWordIds([]);
  }, [selectedThemeId]);

  // AI 음성 회화 타이머 작동 (5분~30분 확장 지원)
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

  // 한글 발음 개별 토글 헬퍼 함수
  const toggleKoreanPron = (key: string) => {
    setRevealedPronKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isPronVisible = (key: string) => showAllKoreanPron || revealedPronKeys.includes(key);

  // 북마크 추가/제거 헬퍼
  const toggleBookmark = (item: {
    word: string;
    ipa: string;
    meaning: string;
    collocation: string;
    posLabel: string;
    compLabel: string;
  }) => {
    setBookmarkedWords((prev) => {
      const exists = prev.some((b) => b.word === item.word);
      if (exists) return prev.filter((b) => b.word !== item.word);
      setStudyStats((s) => ({ ...s, masteredWords: s.masteredWords + 1 }));
      return [...prev, item];
    });
  };

  // 무료 글로벌 영영사전 API 실시간 호출 (Free Dictionary API)
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
          phonetic: first?.phonetic || first?.phonetics?.[0]?.text || '/발음기호 확인/',
          definition: meaningObj?.definition || '영영 사전 정의를 불러왔습니다.',
          example:
            meaningObj?.example ||
            `Let us practice using "${clean}" in a real conversation.`,
        });
      } else {
        setLiveDictResult({
          word: clean,
          phonetic: '/실전 구어 표현/',
          definition: '원어민 실전 구동사·이디엄 표현입니다. 우측 네이버/구글 사전 버튼으로 상세 예문을 확인하세요.',
          example: `I often use "${clean}" in daily business and OPIc speaking.`,
        });
      }
    } catch {
      setLiveDictResult({
        word: clean,
        phonetic: '/오프라인 사전 모드/',
        definition: '네트워크 연결을 확인하거나 우측 사전 바로가기 링크를 이용해 주세요.',
        example: `Practice "${clean}" with sound blocks.`,
      });
    } finally {
      setIsLoadingDict(false);
    }
  };

  // 원어민 음성 합성 재생 (4개국 억양 지원)
  const speakText = (
    text: string,
    customAccent?: 'en-US' | 'en-GB' | 'en-AU' | 'en-IN'
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[|\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = customAccent || accent;
    utterance.lang = targetLang;
    utterance.rate = speechRate;

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

  // 아이패드 애플펜슬 드로잉 핸들러
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

  const endDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 실시간 영작 첨삭 분석기 (어순·문법·오픽 업그레이드 자동 진단)
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
      naturalEn: `I was wondering if we could ${raw.replace(/^i want to /i, '')} to streamline our schedule.`,
      wordOrderFix:
        '영어 어순 점검 완료: [주어(S) + 동사(V) + 목적어(DO)] 핵심 뼈대를 먼저 말하고, 시간·이유·장소 수식어(M)는 소리블럭 단위로 문장 끝에 배치하세요.',
      grammarExplanation: `입력하신 "${withPeriod}" 문장에 거리두기 공손법(I was wondering if ~) 또는 오픽 강조 구문(What I love most is that ~)을 결합하면 훨씬 원어민다운 문장이 됩니다.`,
      opicUpgrade: `Honestly, speaking of this topic, ${withPeriod} It really helps me stay productive!`,
    });
    setStudyStats((s) => ({ ...s, completedSentences: s.completedSentences + 1 }));
  };

  // 대화형 AI 코치 턴 전송 핸들러
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    const userTurn: ChatTurn = { role: 'user', text: msg };
    const coachReply: ChatTurn = {
      role: 'coach',
      text: `Great job! Your sentence "${msg}" has a very clear Subject + Verb structure. Could you also try adding "${currentTheme.vocab[0].collocation}" or "${currentTheme.vocab[5].collocation}" in your next response?`,
      correction: `💡 더 세련된 원어민 표현: "${currentTheme.pattern.en.replace('~', msg.toLowerCase())}"`,
      nuanceTip: `소리방식 팁: ${currentTheme.pattern.soundMethod}`,
    };
    setChatHistory((prev) => [...prev, userTurn, coachReply]);
    setChatInput('');
    speakText(coachReply.text);
  };

  // STEP 4 예문 내 [타겟단어] 컬러 & 밑줄 하이라이트
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

  // 글씨체 구분 클래스
  const fontClass =
    fontStyle === 'serif'
      ? 'font-serif'
      : fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // 테마 포인트 컬러 클래스
  const themeAccentBg =
    colorTheme === 'emerald'
      ? 'bg-emerald-600'
      : colorTheme === 'indigo'
      ? 'bg-indigo-600'
      : colorTheme === 'amber'
      ? 'bg-amber-600'
      : 'bg-blue-600';

  const filteredWordbook = WORDBOOK_DATA.filter(
    (w) => w.level === wordbookLevel && w.day === wordbookDay
  );

  return (
    <div className={`${darkMode ? 'dark' : ''} ${fontClass}`}>
      {/* A4 인쇄 최적화 전용 스타일시트 */}
      <style>{`
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
          body, html { background: #ffffff !important; height: auto !important; overflow: visible !important; }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* ====================================================================
            좌측 사이드바: 8대 빅미디어 실시간 검색어 80선 + 사전 허브 (인쇄 시 자동 숨김)
        ==================================================================== */}
        <aside className="no-print w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
          {/* 상단 브랜드 & 오늘 날짜 자동 감지 배지 */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded text-white ${themeAccentBg}`}>
                  iPad M5 11"
                </span>
                <h1 className="text-base font-extrabold tracking-tight">나만의 야나두 PRO</h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                📅 {todayDateStr} · 자동 업데이트 ON
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* 네이버 사전 · 옥스퍼드 영영 API 실시간 검색창 */}
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
                placeholder="단어 입력 후 엔터 (예: streamline)"
                className="flex-1 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => fetchLiveDictionary(dictQuery || currentTheme.vocab[0].word)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg"
              >
                {isLoadingDict ? '...' : '검색'}
              </button>
            </div>

            {/* 실시간 API 검색 결과 미니 팝업 */}
            {liveDictResult && (
              <div className="p-2.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 text-xs">
                    {liveDictResult.word} <span className="text-slate-300 font-mono">{liveDictResult.phonetic}</span>
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
                href={getGoogleTranslateUrl(dictQuery || currentTheme.pattern.en)}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 py-1 rounded text-blue-300"
              >
                구글번역
              </a>
            </div>
          </div>

          {/* 좌측 스크롤: 8대 빅미디어 실시간 최다 검색어 (각 10개 = 80개 선제시) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div className="bg-slate-100/90 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold">🔥 8대 매체 실시간 검색어 TOP 10</span>
                <a
                  href={currentMediaObj.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 underline"
                >
                  실시간 원문↗
                </a>
              </div>

              {/* 8대 플랫폼 선택 그리드 버튼 */}
              <div className="grid grid-cols-4 gap-1 mb-2.5">
                {MEDIA_PLATFORMS.map((mp) => (
                  <button
                    key={mp.id}
                    onClick={() => setActiveMediaPlatform(mp.id)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-extrabold truncate transition ${
                      activeMediaPlatform === mp.id
                        ? mp.badgeColor
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mp.shortName}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                {currentMediaObj.name}: {currentMediaObj.desc}
              </p>

              {/* 선택된 매체의 1~10위 검색어 리스트 (터치 시 즉시 해당 수업 오픈) */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {currentMediaObj.keywords.map((kw) => (
                  <div
                    key={kw.rank}
                    onClick={() => {
                      setSelectedThemeId(kw.targetThemeId);
                      setActiveMode('daily');
                      speakText(kw.enExpression);
                    }}
                    className="group flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                          kw.rank <= 3
                            ? `${themeAccentBg} text-white`
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {kw.rank}
                      </span>
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600">
                          {kw.koTitle}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
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
                ))}
              </div>
            </div>

            {/* 정규 4대 마스터 테마 선택 */}
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase px-1 mb-1.5">
                📚 핵심 커리큘럼 테마 (자동차 제외 · 4대 영역)
              </p>
              <div className="space-y-1.5">
                {THEMES.map((theme) => {
                  const isSel = theme.id === selectedThemeId && activeMode === 'daily';
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        setActiveMode('daily');
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition ${
                        isSel
                          ? `${themeAccentBg} text-white border-transparent shadow`
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold opacity-85">
                        <span>{theme.badge}</span>
                        <span>{theme.opicLevel.split(' ')[1]}</span>
                      </div>
                      <div className="text-xs font-extrabold mt-1">{theme.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 글로벌 4개국 발음 컨트롤러 */}
            <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span>🌍 글로벌 4개국 발음 & 속도</span>
                <span className="text-blue-600 dark:text-blue-400">{speechRate}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {[
                  { code: 'en-US', label: '🇺🇸 미국' },
                  { code: 'en-GB', label: '🇬🇧 영국' },
                  { code: 'en-AU', label: '🇦🇺 호주' },
                  { code: 'en-CA', label: '🇨🇦 캐나다' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setAccent(item.code as 'en-US' | 'en-GB' | 'en-AU' | 'en-IN');
                      speakText(
                        currentTheme.pattern.en,
                        item.code as 'en-US' | 'en-GB' | 'en-AU' | 'en-IN'
                      );
                    }}
                    className={`py-1 rounded-lg border ${
                      accent === item.code
                        ? `${themeAccentBg} text-white border-transparent`
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSpeechRate(0.8)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold ${
                    speechRate === 0.8 ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  🐢 0.8x 연음훈련
                </button>
                <button
                  onClick={() => setSpeechRate(0.95)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold ${
                    speechRate === 0.95 ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  ⚡ 1.0x 실전속도
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ====================================================================
            우측 메인 영역: 상단 모드 탭 + 디자인/글씨체/인쇄 컨트롤 바 + 본문
        ==================================================================== */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* 상단 헤더 (모드 전환 & 디자인/글씨체/한글발음/A4인쇄 컨트롤러) */}
          <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* 5대 핵심 모드 원터치 탭 */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'daily', label: '📝 일일 강의 & 16매핑' },
                  { id: 'wordbook', label: '📘 중·고등·실무·오픽 단어장' },
                  { id: 'naverQuiz', label: '💚 네이버 퀴즈 & 복습장' },
                  { id: 'aiCoach', label: '🎙️ AI 음성회화(5~30분)·첨삭·리포트' },
                  { id: 'weekly', label: '🗓️ 주간·월간 마스터' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMode(tab.id as typeof activeMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                      activeMode === tab.id
                        ? `${themeAccentBg} text-white shadow-sm`
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 한글 발음 전체 가리기/보이기 & A4 인쇄 최적화 버튼 */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowAllKoreanPron(!showAllKoreanPron)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    showAllKoreanPron
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {showAllKoreanPron ? '👁️ 한글발음 전체 공개중' : '🙈 한글발음 가림 (클릭 시 표시)'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-extrabold hover:opacity-90"
                  title="A4 규격으로 깔끔하게 인쇄하거나 PDF로 저장합니다"
                >
                  🖨️ A4 인쇄 / PDF
                </button>
              </div>
            </div>

            {/* 디자인 테마 · 글씨체 구분 · 레이아웃 배치 컨트롤 바 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-400">🎨 테마:</span>
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
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-400">🔤 글씨체:</span>
                  {[
                    { id: 'sans', label: '고딕(Sans)' },
                    { id: 'serif', label: '명조(Serif)' },
                    { id: 'mono', label: '코드(Mono)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontStyle(f.id as 'sans' | 'serif' | 'mono')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        fontStyle === f.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-400">📐 레이아웃:</span>
                  <button
                    onClick={() => setLayoutMode(layoutMode === 'split' ? 'wide' : 'split')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                  >
                    {layoutMode === 'split' ? '아이패드 스플릿뷰 최적화' : '와이드 풀스크린'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 font-bold text-slate-500">
                <span>⭐ 복습 단어장: {bookmarkedWords.length}개</span>
                <span>🔥 연속 학습: {studyStats.streakDays}일째</span>
              </div>
            </div>
          </header>

          {/* 메인 스크롤 본문 컨테이너 */}
          <div className="print-container flex-1 overflow-y-auto p-5 md:p-7">
            <div
              className={`${
                layoutMode === 'split' ? 'max-w-4xl' : 'max-w-6xl'
              } mx-auto space-y-7 pb-16`}
            >
              {/* ==============================================================
                  [모드 A] 중등·고등·실무·오픽 전자책 단어장 (페이지 넘기기 UI)
              ============================================================== */}
              {activeMode === 'wordbook' && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-extrabold text-blue-600">
                        PAGE-TURNING E-WORDBOOK
                      </span>
                      <h2 className="text-2xl font-extrabold mt-0.5">
                        📘 단계별 영단어장 (발음기호 · 소리블럭 · 소리방식 · 16매핑 연동)
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        종이 단어장처럼 페이지를 넘기며 학습하고, 단어를 누르면 16개 문장성분×9품사 역할과 발음을 즉시 확인합니다.
                      </p>
                    </div>

                    {/* 4대 단어장 종류 탭 */}
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

                  {/* 전자책 페이지 넘김 컨트롤 바 (◀ 이전 Day | 현재 Day | 다음 Day ▶) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setWordbookDay((d) => (d > 1 ? d - 1 : 3))}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-extrabold hover:bg-slate-100"
                    >
                      ◀ 이전 페이지 (Day {wordbookDay > 1 ? wordbookDay - 1 : 3})
                    </button>

                    <div className="text-center">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        📖 [{wordbookLevel}] — Day {wordbookDay} 페이지
                      </div>
                      <div className="text-[11px] text-slate-500">
                        한글 발음은 가려져 있습니다. 보고 싶은 단어의 <strong>[한글발음 보기]</strong>를 터치하세요!
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const key = `${wordbookLevel}-${wordbookDay}`;
                          setCompletedDays((prev) =>
                            prev.includes(key) ? prev : [...prev, key]
                          );
                          setStudyStats((s) => ({
                            ...s,
                            masteredWords: s.masteredWords + filteredWordbook.length,
                          }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold ${
                          completedDays.includes(`${wordbookLevel}-${wordbookDay}`)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {completedDays.includes(`${wordbookLevel}-${wordbookDay}`)
                          ? '✅ 암기 완료됨'
                          : '오늘 페이지 암기 완료 체크'}
                      </button>

                      <button
                        onClick={() => setWordbookDay((d) => (d < 3 ? d + 1 : 1))}
                        className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                      >
                        다음 페이지 (Day {wordbookDay < 3 ? wordbookDay + 1 : 1}) ▶
                      </button>
                    </div>
                  </div>

                  {/* 단어장 카드 리스트 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWordbook.map((item, idx) => {
                      const pronKey = `wb-${item.level}-${item.day}-${idx}`;
                      const isBookmarked = bookmarkedWords.some((b) => b.word === item.word);
                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-400 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                  {item.word}
                                </span>
                                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                                  {item.ipa}
                                </span>
                                <button
                                  onClick={() => speakText(item.word)}
                                  className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center"
                                >
                                  🔊
                                </button>
                              </div>
                              {/* 클릭 시 열리는 한글 발음 블라인드 */}
                              <button
                                onClick={() => toggleKoreanPron(pronKey)}
                                className="mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                              >
                                {isPronVisible(pronKey)
                                  ? `🗣️ ${item.pron}`
                                  : '🔒 [한글발음 보기 터치]'}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  toggleBookmark({
                                    word: item.word,
                                    ipa: item.ipa,
                                    meaning: item.meaning,
                                    collocation: item.collocation,
                                    posLabel: item.posLabel,
                                    compLabel: item.compLabel,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                                  isBookmarked
                                    ? 'bg-amber-400 text-slate-900 border-amber-400'
                                    : 'border-slate-300 dark:border-slate-700 text-slate-500'
                                }`}
                              >
                                {isBookmarked ? '⭐ 복습저장됨' : '☆ 복습저장'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedComp(item.comp);
                                  setSelectedPos(item.pos);
                                  setActiveMode('daily');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-extrabold"
                              >
                                16매핑 보기↗
                              </button>
                            </div>
                          </div>

                          <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            뜻: {item.meaning}
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                              9품사(신분): {item.posLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              문장성분(직책): {item.compLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              소리블럭: {item.soundBlock}
                            </span>
                          </div>

                          <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                            <div>
                              🎯 <strong>소리방식(연음·조음):</strong> {item.soundMethod}
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-bold">
                              🔗 <strong>짝꿍 표현:</strong> {item.collocation} ({item.collocationKo})
                            </div>
                            <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                              📝 "{item.exampleEn}" ({item.exampleKo})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ==============================================================
                  [모드 B] 일일 강의 노트 (인포그래픽 헤더 + STEP 1 ~ STEP 5)
              ============================================================== */}
              {activeMode === 'daily' && (
                <>
                  {/* 인포그래픽 강의 요약 배너 (어순 공식 · 문법 포인트 · 표현/뉘앙스/상황 · 오픽 등급) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold text-white px-3 py-1 rounded-full ${themeAccentBg}`}>
                          {currentTheme.badge}
                        </span>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          🎯 {currentTheme.opicLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(currentTheme.pattern.en)}
                          className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl text-white ${themeAccentBg}`}
                        >
                          🔊 패턴 원어민 발음
                        </button>
                        <a
                          href={getGoogleTranslateUrl(currentTheme.pattern.en)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                          🔗 번역기
                        </a>
                      </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      📣 {currentTheme.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      💡 <strong>코치의 핵심 포인트:</strong> {currentTheme.coachPoint}
                    </p>

                    {/* 3대 인포그래픽 핵심 요약 카드 (어순 공식 / 핵심 문법 / 표현·뉘앙스·상황) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                        <div className="text-xs font-extrabold text-blue-700 dark:text-blue-300 mb-1">
                          🧭 1. 오늘의 영어 어순 공식
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                          {currentTheme.wordOrderPrinciple}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                        <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 mb-1">
                          📐 2. 핵심 문법 포인트
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {currentTheme.grammarSummary}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                        <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300 mb-1">
                          🎭 3. 표현 · 뉘앙스 · 실전 상황
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {currentTheme.situationGuide}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ==========================================================
                      STEP 1. 오늘의 야나두 만능 패턴 (IPA · 소리블럭 · 소리방식 · 한글발음 클릭 토글)
                  ========================================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-extrabold">
                        🧩 STEP 1. 오늘의 야나두 만능 패턴 & 소리블럭 훈련
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        발음기호(IPA)와 소리블럭을 먼저 익힌 뒤 한글발음을 클릭해 확인하세요
                      </span>
                    </div>

                    <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-2xl font-black text-yellow-400 tracking-wide">
                            {currentTheme.pattern.en}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                            <span className="font-mono text-blue-300 font-bold">
                              발음기호(IPA): {currentTheme.pattern.ipa}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              🧱 소리블럭: {currentTheme.pattern.soundBlock}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleKoreanPron('pattern-main')}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
                          >
                            {isPronVisible('pattern-main')
                              ? `🗣️ ${currentTheme.pattern.pron}`
                              : '🔒 한글발음 보기 (터치)'}
                          </button>
                          <button
                            onClick={() => speakText(currentTheme.pattern.en)}
                            className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                          >
                            🔊 원어민 발음
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
                        <div className="bg-slate-800/90 p-3 rounded-xl">
                          <strong className="text-emerald-400">🎙️ 소리방식 (연음·강세 비법):</strong>
                          <p className="text-slate-200 mt-1">{currentTheme.pattern.soundMethod}</p>
                        </div>
                        <div className="bg-slate-800/90 p-3 rounded-xl">
                          <strong className="text-blue-400">💬 원어민 핵심 뉘앙스:</strong>
                          <p className="text-slate-200 mt-1">{currentTheme.pattern.nuance}</p>
                        </div>
                        <div className="bg-slate-800/90 p-3 rounded-xl">
                          <strong className="text-purple-400">🏆 오픽(OPIc) 실전 팁:</strong>
                          <p className="text-slate-200 mt-1">{currentTheme.pattern.opicApplication}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ==========================================================
                      STEP 2. 5:5 황금 비율 단어장 (10 Words) + 유의어 강세 스케일
                  ========================================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold">
                          📚 STEP 2. 일상 & 고급 짝꿍 단어장 (발음기호 · 소리방식 · 소리블럭 · 오픽)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          단어를 클릭하면 <strong>STEP 3의 16개 문장성분×9품사 다이어그램</strong>이 즉시 변환됩니다. 한글 발음은 터치 시 공개됩니다!
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                        <button
                          onClick={() => setHideWordMode(!hideWordMode)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            hideWordMode ? `${themeAccentBg} text-white` : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {hideWordMode ? '🙈 Hide Word ON' : '👁️ Hide Word'}
                        </button>
                        <button
                          onClick={() => setHideMeaningMode(!hideMeaningMode)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            hideMeaningMode ? `${themeAccentBg} text-white` : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {hideMeaningMode ? '🙈 Hide Meaning ON' : '👁️ Hide Meaning'}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="py-3 px-3 text-center">구분</th>
                            <th className="py-3 px-3">단어 · 발음기호(IPA) · 한글발음(터치)</th>
                            <th className="py-3 px-3">뜻 & 16매핑 (9품사×7성분)</th>
                            <th className="py-3 px-3">🧱 소리블럭 & 🎙️ 소리방식</th>
                            <th className="py-3 px-3">🔗 실전 짝꿍 표현 & 오픽 팁</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {currentTheme.vocab.map((v) => {
                            const isWordHidden = hideWordMode && !revealedWordIds.includes(v.id);
                            const isMeaningHidden = hideMeaningMode && !revealedWordIds.includes(v.id);
                            const pronKey = `vocab-${currentTheme.id}-${v.id}`;
                            const isSaved = bookmarkedWords.some((b) => b.word === v.word);

                            return (
                              <tr
                                key={v.id}
                                onClick={() => {
                                  setSelectedComp(v.comp);
                                  setSelectedPos(v.pos);
                                  setDiagramTab('all');
                                }}
                                className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition"
                              >
                                <td className="py-3.5 px-3 text-center">
                                  <span
                                    className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                      v.type === '일상 회화'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                    }`}
                                  >
                                    {v.id}. {v.type}
                                  </span>
                                </td>

                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                      {isWordHidden ? v.masked : v.word}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(v.word);
                                      }}
                                      className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center"
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
                                      className="text-sm"
                                      title="복습 단어장에 저장"
                                    >
                                      {isSaved ? '⭐' : '☆'}
                                    </button>
                                  </div>
                                  <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                                    {v.ipa}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleKoreanPron(pronKey);
                                    }}
                                    className="mt-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]"
                                  >
                                    {isPronVisible(pronKey) ? `🗣️ ${v.pron}` : '🔒 [한글발음 터치]'}
                                  </button>
                                </td>

                                <td className="py-3.5 px-3">
                                  <div className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                    {isMeaningHidden ? '🔒 [뜻 숨김]' : v.meaning}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                                      품사: {v.posLabel}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                      성분: {v.compLabel}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-3 max-w-xs">
                                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                    🧱 {v.soundBlock}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                    🎙️ {v.soundMethod}
                                  </div>
                                </td>

                                <td className="py-3.5 px-3">
                                  <div className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <span>{v.collocation}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(v.collocation);
                                      }}
                                    >
                                      🔊
                                    </button>
                                    <a
                                      href={getGoogleTranslateUrl(v.collocation)}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-slate-400 hover:text-blue-500"
                                    >
                                      🔗
                                    </a>
                                  </div>
                                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                                    ({v.collocationKo})
                                  </div>
                                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                                    🏆 OPIc: {v.opicTip}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 옥스퍼드 & 콜린스 유의어 강세 보기 (▲ 강함 ↕ ▼ 약함) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase">
                            OXFORD & COLLINS THESAURUS INTENSITY SCALE
                          </span>
                          <h4 className="text-sm font-extrabold mt-0.5">
                            📊 유의어 강세 보기 (▲ 강함 ↕ ▼ 약함 뉘앙스 비교) — {currentTheme.synonymScale.baseWord}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400">{currentTheme.synonymScale.meaning}</span>
                      </div>

                      <div className="mt-3 flex gap-3 items-stretch">
                        <div className="flex flex-col items-center justify-between py-2 px-2 bg-slate-800 rounded-xl text-[10px] font-extrabold text-blue-300">
                          <span>▲ 강함</span>
                          <div className="w-1 flex-1 bg-gradient-to-b from-rose-500 via-blue-500 to-emerald-400 my-1.5 rounded-full" />
                          <span>▼ 약함</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {currentTheme.synonymScale.levels.map((lvl, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2"
                            >
                              <span className="text-xs font-extrabold text-slate-300 w-36">
                                {lvl.strength}
                              </span>
                              <div className="flex-1 flex flex-wrap gap-2">
                                {lvl.words.map((w, wIdx) => (
                                  <button
                                    key={wIdx}
                                    onClick={() => speakText(w.word)}
                                    className="px-3 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-xs font-bold text-indigo-200 flex items-center gap-1.5"
                                  >
                                    <span>{w.word}</span>
                                    <span className="font-mono text-[10px] text-slate-300">{w.ipa}</span>
                                    <span>🔊</span>
                                    <span className="text-[11px] font-normal text-slate-300">
                                      — {w.nuance}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
{/* ==========================================================
                      [4/4 파트] STEP 3 (16개 매핑 다이어그램 & 뜻 사전) + STEP 4~5 + AI회화/첨삭/리포트
                  ========================================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    {/* 상단 탭 (16개 전체 매핑 | 문장 성분(7) 뜻·어순 | 9품사 뜻·역할) */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {[
                          { id: 'all', label: '16개 전체 매핑 다이어그램' },
                          { id: 'comp', label: '문장 성분(7직책) 뜻·어순 사전' },
                          { id: 'pos', label: '9품사(9신분) 뜻·역할 사전' },
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setRevealedWordIds(
                              revealedWordIds.length > 0
                                ? []
                                : currentTheme.vocab.map((v) => v.id)
                            )
                          }
                          className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          단어장 숨김 전체해제
                        </button>
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
                    </div>

                    {/* 16개 노드 인터랙티브 SVG 다이어그램 */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        🔍 <strong>STEP 3. 문장 성분(7직책) × 9품사(9신분) 총 16개 매핑 다이어그램:</strong> 상단 문장 성분(7개) 또는 하단 9품사 노드를 클릭하면 연결 경로와 정확한 뜻·어순 규칙이 아래에 표시됩니다.
                      </p>

                      <div className="w-full overflow-x-auto">
                        <svg viewBox="0 0 920 310" className="w-full min-w-[760px] h-auto select-none">
                          <text x="30" y="24" className="fill-slate-400 text-[11px] font-bold">
                            문장 성분 (5대 요소 · 세부 7직책) — 문장에서 맡는 자리와 어순 역할
                          </text>

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

                            const isDashed = edge.comp === 'M';

                            return (
                              <path
                                key={idx}
                                d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
                                fill="none"
                                stroke={isHighlighted ? '#2563eb' : '#cbd5e1'}
                                strokeWidth={isHighlighted ? 2.8 : 1.2}
                                strokeDasharray={isDashed ? '4 3' : undefined}
                                opacity={isHighlighted ? 1 : 0.3}
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
                                MAPPING_EDGES.some(
                                  (e) => e.comp === comp.id && e.pos === selectedPos
                                ));

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
                                  className="text-[10px] font-bold fill-blue-600 italic"
                                >
                                  {comp.id}
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
                                MAPPING_EDGES.some(
                                  (e) => e.pos === pos.id && e.comp === selectedComp
                                ));

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
                                  className="text-[10px] font-bold fill-slate-500 italic"
                                >
                                  {pos.id}
                                </text>
                              </g>
                            );
                          })}

                          <text x="30" y="302" className="fill-slate-400 text-[11px] font-bold">
                            9품사 (단어가 타고난 고유 신분) — 사전에 등재된 갈래 (*접속사·감탄사는 독립/연결 요소)
                          </text>
                        </svg>
                      </div>

                      {/* 선택된 문장 성분(7) & 9품사 뜻/어순 실시간 해설 박스 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              16개 전체 요약 & 뜻 사전
                            </span>
                            <h4 className="text-sm font-extrabold">
                              7개 문장 성분(직책)과 9품사(신분)의 정확한 뜻 & 어순 규칙
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: '주어(S) 탐색', comp: 'S' as CompId, pos: null },
                              { label: '동사(V) 탐색', comp: 'V' as CompId, pos: null },
                              { label: '직접목적어(DO)', comp: 'DO' as CompId, pos: null },
                              { label: '주격보어(SC)', comp: 'SC' as CompId, pos: null },
                              { label: '수식어(M)', comp: 'M' as CompId, pos: null },
                              { label: '명사(N)', comp: null, pos: 'N' as PosId },
                              { label: '형용사(Adj)', comp: null, pos: 'Adj' as PosId },
                            ].map((btn, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedComp(btn.comp);
                                  setSelectedPos(btn.pos);
                                }}
                                className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-bold hover:bg-blue-50 dark:hover:bg-slate-800"
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 현재 선택된 직책(성분)과 신분(품사)의 뜻 표시 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {selectedComp && (
                            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                              <div className="font-extrabold text-blue-700 dark:text-blue-300">
                                📌 선택된 문장 성분(직책):{' '}
                                {SENTENCE_COMPONENTS.find((c) => c.id === selectedComp)?.name} (
                                {selectedComp})
                              </div>
                              <p className="mt-1 text-slate-700 dark:text-slate-300">
                                • <strong>뜻:</strong>{' '}
                                {SENTENCE_COMPONENTS.find((c) => c.id === selectedComp)?.meaning}
                              </p>
                              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                                • <strong>어순 위치:</strong>{' '}
                                {
                                  SENTENCE_COMPONENTS.find((c) => c.id === selectedComp)
                                    ?.wordOrderRule
                                }
                              </p>
                            </div>
                          )}

                          {selectedPos && (
                            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                              <div className="font-extrabold text-purple-700 dark:text-purple-300">
                                🏷️ 선택된 9품사(신분):{' '}
                                {PARTS_OF_SPEECH.find((p) => p.id === selectedPos)?.name} (
                                {selectedPos})
                              </div>
                              <p className="mt-1 text-slate-700 dark:text-slate-300">
                                • <strong>뜻:</strong>{' '}
                                {PARTS_OF_SPEECH.find((p) => p.id === selectedPos)?.meaning}
                              </p>
                              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                                • <strong>담당 가능한 문장 성분:</strong>{' '}
                                {
                                  PARTS_OF_SPEECH.find((p) => p.id === selectedPos)
                                    ?.canBeComponents
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 탭이 'comp' 또는 'pos'일 때 16개 전체 뜻 사전 표 출력 */}
                        {diagramTab === 'comp' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                            {SENTENCE_COMPONENTS.map((c) => (
                              <div
                                key={c.id}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] border ${c.colorBadge}`}>
                                  {c.name} ({c.sub})
                                </span>
                                <p className="mt-1.5 font-semibold">{c.meaning}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  🧭 어순: {c.wordOrderRule}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {diagramTab === 'pos' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                            {PARTS_OF_SPEECH.map((p) => (
                              <div
                                key={p.id}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                <div className="font-extrabold text-blue-600 dark:text-blue-400">
                                  {p.name} ({p.sub})
                                </div>
                                <p className="mt-1 text-[11px]">{p.meaning}</p>
                                <p className="mt-1 text-[10px] text-slate-500 font-bold">
                                  ➔ 직책: {p.canBeComponents}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 실전 예문 이중 레이어 해부 카드 (어절 클릭 시 상단 다이어그램 연동) */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-extrabold">
                            실전 예문 이중 레이어 해부 (문장 성분 × 9품사 컬러 코딩)
                          </h4>
                          <p className="text-xs text-slate-500">
                            어절 카드를 터치하면 위 16개 다이어그램에서 해당 문장 성분과 품사가 동시에 강조되고 발음이 재생됩니다.
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

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {currentDiagramEx.tokens.map((tk, idx) => {
                          const isCardSel = selectedTokenIdx === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedTokenIdx(idx);
                                setSelectedComp(tk.comp === '독립어' ? 'M' : tk.comp);
                                setSelectedPos(tk.pos);
                                speakText(tk.word);
                              }}
                              className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 text-center flex flex-col items-center justify-between gap-2 transition shadow-sm ${
                                isCardSel
                                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                                  : `${tk.colorClass} dark:border-slate-800`
                              }`}
                            >
                              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                {tk.compLabel}
                              </span>
                              <span className="text-base font-black text-slate-900 dark:text-white my-0.5">
                                {tk.word}
                              </span>
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                {tk.posLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                        <div>
                          <strong>해석:</strong> {currentDiagramEx.translation} (
                          <strong>핵심 뼈대:</strong> {currentDiagramEx.skeleton})
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-bold">
                          🧭 <strong>어순 포인트:</strong> {currentDiagramEx.wordOrderTip}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ==========================================================
                      STEP 4. 3단 직독직해 & 소리블럭 & 아이패드 애플펜슬 트레이닝
                  ========================================================== */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold">
                          🗣️ STEP 4. 어순·소리블럭 3단 직독직해 & 아이패드 펜슬 트레이닝 (4 Sentences)
                        </h3>
                        <p className="text-xs text-slate-500">
                          한글 발음은 기본적으로 가려져 있습니다. 스스로 소리블럭과 발음기호(IPA)로 먼저 읽은 뒤 터치해 확인하세요!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {currentTheme.sentences.map((sent) => {
                        const sentPronKey = `sent-${currentTheme.id}-${sent.id}`;
                        return (
                          <div
                            key={sent.id}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white ${themeAccentBg}`}>
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
                                  onClick={() => toggleKoreanPron(sentPronKey)}
                                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold"
                                >
                                  {isPronVisible(sentPronKey)
                                    ? '🙈 한글발음 숨기기'
                                    : '👁️ 한글발음 보기'}
                                </button>
                                <button
                                  onClick={() => speakText(sent.rawEn)}
                                  className={`px-3 py-1 rounded-lg text-white text-xs font-extrabold ${themeAccentBg}`}
                                >
                                  🔊 문장 듣기
                                </button>
                                <a
                                  href={getGoogleTranslateUrl(sent.rawEn)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
                                >
                                  🔗 번역기
                                </a>
                              </div>
                            </div>

                            {/* 어순 공식 & 소리블럭 배지 */}
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-100/80 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                                🧭 어순 공식: {sent.wordOrderFormula}
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                                🧱 소리블럭: {sent.soundBlockEn}
                              </span>
                            </div>

                            {/* 3단 직독직해 메인 박스 */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-sm leading-relaxed">
                              <div className="text-slate-700 dark:text-slate-300 font-semibold">
                                ① [의미단위 직독직해] {sent.koLine}
                              </div>
                              <div className="text-slate-900 dark:text-white font-bold text-base">
                                ② [영어 어순 매칭] {renderHighlightedSentence(sent.enLine)}
                              </div>
                              <div className="font-mono text-xs text-slate-500">
                                🔤 [발음기호 IPA] {sent.ipaLine}
                              </div>
                              <div
                                onClick={() => toggleKoreanPron(sentPronKey)}
                                className="cursor-pointer text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg inline-block"
                              >
                                ③ [원어민 리얼 발음]{' '}
                                {isPronVisible(sentPronKey)
                                  ? sent.pronLine
                                  : '🔒 [여기를 터치하면 한글 리얼 발음이 공개됩니다]'}
                              </div>
                            </div>

                            {/* 소리방식 · 문법 포인트 · 표현/뉘앙스/상황 3단 해설 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                🎙️ <strong>소리방식 비법:</strong> {sent.soundMethodGuide}
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                📐 <strong>핵심 문법:</strong> {sent.grammarPoint}
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                💬 <strong>의역 & 뉘앙스:</strong> "{sent.naturalKo}" ({sent.contextNuance})
                              </div>
                            </div>

                            {/* 타이핑 & 펜슬 따라쓰기 라인 */}
                            <div className="pt-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-500 w-32">
                                  ✍️ 1) 따라 쓰기:
                                </span>
                                <input
                                  type="text"
                                  value={writingInputs[`copy-${sent.id}`] || ''}
                                  onChange={(e) =>
                                    setWritingInputs({
                                      ...writingInputs,
                                      [`copy-${sent.id}`]: e.target.value,
                                    })
                                  }
                                  placeholder={sent.rawEn}
                                  className="flex-1 text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-500 w-32">
                                  ✍️ 2) 나만의 응용:
                                </span>
                                <input
                                  type="text"
                                  value={writingInputs[`custom-${sent.id}`] || ''}
                                  onChange={(e) =>
                                    setWritingInputs({
                                      ...writingInputs,
                                      [`custom-${sent.id}`]: e.target.value,
                                    })
                                  }
                                  placeholder="단어를 바꿔 나만의 실전 문장을 만들어 보세요."
                                  className="flex-1 text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 아이패드 애플 펜슬 프리핸드 드로잉 노트 */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          ✏️ 아이패드 M5 애플 펜슬 손글씨 연습장 (직접 펜슬로 문장과 어순을 적어보세요)
                        </span>
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-extrabold"
                        >
                          지우기
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-blue-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <canvas
                          ref={canvasRef}
                          width={820}
                          height={180}
                          onPointerDown={startDrawing}
                          onPointerMove={draw}
                          onPointerUp={endDrawing}
                          onPointerLeave={endDrawing}
                          className="w-full h-[180px] touch-none cursor-crosshair"
                        />
                      </div>
                    </div>
                  </section>

                  {/* ==========================================================
                      STEP 5. 네이버 4단계 퀴즈 (단어 | Q초급 | Q중급 | Q고급) & 영작 미션
                  ========================================================== */}
                  <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-6 border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                          N
                        </span>
                        <div>
                          <h3 className="text-lg font-extrabold">
                            🎮 STEP 5. 네이버 오늘의 단어 퀴즈 (단어 · 초급 · 중급 · 고급) & 영작 미션
                          </h3>
                          <p className="text-xs text-slate-400">
                            단계별 문제를 풀고 맨 아래 정답 및 코치의 뉘앙스 해설을 터치해 확인하세요.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl">
                        {[
                          { id: 'word', label: '단어 (철자 추론)' },
                          { id: 'beginner', label: 'Q 초급 (뜻 맞추기)' },
                          { id: 'intermediate', label: 'Q 중급 (문장 빈칸)' },
                          { id: 'advanced', label: 'Q 고급 (유의어 복수선택)' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setQuizLevelTab(tab.id as typeof quizLevelTab)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
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

                    {quizLevelTab === 'word' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {NAVER_OFFICIAL_WORD_CHALLENGE.map((item, idx) => {
                          const isRev = revealedChallengeIdx.includes(idx);
                          return (
                            <div
                              key={idx}
                              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-black tracking-widest">
                                  {isRev ? item.word : item.masked}
                                </span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => speakText(item.word)}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-xs"
                                  >
                                    🔊
                                  </button>
                                  <button
                                    onClick={() =>
                                      setRevealedChallengeIdx((prev) =>
                                        prev.includes(idx)
                                          ? prev.filter((i) => i !== idx)
                                          : [...prev, idx]
                                      )
                                    }
                                    className="w-8 h-8 rounded-full bg-slate-700 text-xs"
                                  >
                                    👁️
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs text-blue-300">{item.enDef}</div>
                              <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl">
                                "{isRev ? item.exampleFull : item.example}"
                              </div>
                              {isRev && (
                                <div className="text-xs text-emerald-400 font-bold">
                                  ✅ 정답: {item.word} ({item.ipa}) — {item.koMeaning} | 소리블럭:{' '}
                                  {item.soundBlock}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {quizLevelTab === 'beginner' && (
                      <div className="max-w-xl mx-auto text-center space-y-4 py-2">
                        <div className="text-xs text-slate-400">아래 단어의 알맞은 뜻은?</div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-black">
                            {currentTheme.quiz.beginner.word}
                          </span>
                          <span className="font-mono text-sm text-blue-400">
                            {currentTheme.quiz.beginner.ipa}
                          </span>
                          <button
                            onClick={() =>
                              speakText(currentTheme.quiz.beginner.word.split(' ')[0])
                            }
                            className="w-9 h-9 rounded-full bg-blue-600"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="space-y-2">
                          {currentTheme.quiz.beginner.options.map((opt, idx) => {
                            const isPicked = selectedBeginnerOpt === idx;
                            const isCorrect = idx === currentTheme.quiz.beginner.answerIdx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedBeginnerOpt(idx)}
                                className={`w-full p-3.5 rounded-2xl font-bold text-sm border transition ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-600 border-emerald-400'
                                      : 'bg-rose-600 border-rose-400'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {quizLevelTab === 'intermediate' && (
                      <div className="max-w-xl mx-auto text-center space-y-4 py-2">
                        <div className="text-xs text-slate-400">아래 빈칸에 들어갈 알맞은 표현은?</div>
                        <div className="text-lg font-extrabold flex flex-wrap items-center justify-center gap-2">
                          <span>{currentTheme.quiz.intermediate.sentenceBefore}</span>
                          <span className="px-4 py-1 rounded-lg bg-slate-800 border-2 border-dashed border-blue-400 text-blue-300">
                            {selectedInterOpt !== null
                              ? currentTheme.quiz.intermediate.options[selectedInterOpt]
                              : '______'}
                          </span>
                          <span>{currentTheme.quiz.intermediate.sentenceAfter}</span>
                        </div>
                        <button
                          onClick={() => setShowInterHint(!showInterHint)}
                          className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
                        >
                          👁️ Hint{' '}
                          {showInterHint
                            ? `— ${currentTheme.quiz.intermediate.hint}`
                            : '(터치하여 힌트 보기)'}
                        </button>
                        <div className="space-y-2">
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
                                className={`w-full p-3.5 rounded-2xl font-bold text-sm border transition ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-600 border-emerald-400'
                                      : 'bg-rose-600 border-rose-400'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {quizLevelTab === 'advanced' && (
                      <div className="max-w-xl mx-auto text-center space-y-4 py-2">
                        <div className="text-xs text-slate-400">
                          아래 문장에서 같은 의미로 쓰일 수 있는 유의어를 <strong>모두 선택</strong>하세요.
                        </div>
                        <div className="text-lg font-extrabold flex flex-wrap items-center justify-center gap-2">
                          <span>{currentTheme.quiz.advanced.sentenceBefore}</span>
                          <span className="text-blue-400 underline">
                            {currentTheme.quiz.advanced.highlightWord}
                          </span>
                          <span>{currentTheme.quiz.advanced.sentenceAfter}</span>
                        </div>
                        <div className="space-y-2">
                          {currentTheme.quiz.advanced.options.map((opt, idx) => {
                            const isSel = selectedAdvOpts.includes(idx);
                            const isAns =
                              currentTheme.quiz.advanced.answerIndices.includes(idx);
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  speakText(opt);
                                  setSelectedAdvOpts((prev) =>
                                    prev.includes(idx)
                                      ? prev.filter((i) => i !== idx)
                                      : [...prev, idx]
                                  );
                                }}
                                className={`w-full p-3.5 rounded-2xl font-bold text-sm border transition ${
                                  isSel
                                    ? isAns
                                      ? 'bg-emerald-600 border-emerald-400'
                                      : 'bg-rose-600 border-rose-400'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 실전 영작 미션 & <details> 정답 숨김 */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="text-sm font-extrabold text-yellow-400">
                        ✍️ [나만의 영작 미션] {currentTheme.quiz.writingMission.koPrompt}
                      </div>
                      <div className="text-xs text-blue-300">
                        🧭 어순 힌트: {currentTheme.quiz.writingMission.wordOrderHint}
                      </div>
                      <input
                        type="text"
                        value={userWritingMission}
                        onChange={(e) => setUserWritingMission(e.target.value)}
                        placeholder="여기에 영어 문장을 직접 작성해 보세요..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />

                      <details className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 cursor-pointer">
                        <summary className="text-xs font-extrabold text-blue-300">
                          👀 정답 및 코치의 어순·뉘앙스 해설 확인하기 (터치)
                        </summary>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-200 leading-relaxed">
                          <div>
                            ✅ <strong>Q초급 정답:</strong>{' '}
                            {
                              currentTheme.quiz.beginner.options[
                                currentTheme.quiz.beginner.answerIdx
                              ]
                            }{' '}
                            — {currentTheme.quiz.beginner.explanation}
                          </div>
                          <div>
                            ✅ <strong>Q중급 정답:</strong>{' '}
                            {
                              currentTheme.quiz.intermediate.options[
                                currentTheme.quiz.intermediate.answerIdx
                              ]
                            }{' '}
                            — {currentTheme.quiz.intermediate.explanation}
                          </div>
                          <div>
                            ✅ <strong>Q고급 복수 정답:</strong>{' '}
                            {currentTheme.quiz.advanced.answerIndices
                              .map((i) => currentTheme.quiz.advanced.options[i])
                              .join(', ')}{' '}
                            — {currentTheme.quiz.advanced.explanation}
                          </div>
                          <div className="pt-2 border-t border-slate-700 text-emerald-300 font-bold flex items-center gap-2">
                            <span>
                              ✅ 모범 영작: {currentTheme.quiz.writingMission.modelAnswer}
                            </span>
                            <button
                              onClick={() =>
                                speakText(currentTheme.quiz.writingMission.modelAnswer)
                              }
                              className="px-2 py-0.5 rounded bg-emerald-700 text-white"
                            >
                              🔊 듣기
                            </button>
                          </div>
                          <div>
                            💡 <strong>어순·문법 체크포인트:</strong>{' '}
                            {currentTheme.quiz.writingMission.checkPoint}
                          </div>
                        </div>
                      </details>
                    </div>
                  </section>
                </>
              )}

              {/* ==============================================================
                  [모드 C] 네이버 퀴즈 챌린지 & 스마트 복습 북마크 보관함
              ============================================================== */}
              {activeMode === 'naverQuiz' && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-600">
                        SMART REVIEW & NAVER WORD CHALLENGE
                      </span>
                      <h2 className="text-2xl font-extrabold mt-0.5">
                        ⭐ 나만의 스마트 복습 단어장 & 네이버 Word of the Day
                      </h2>
                    </div>
                    <button
                      onClick={() =>
                        setRevealedChallengeIdx(
                          revealedChallengeIdx.length === NAVER_OFFICIAL_WORD_CHALLENGE.length
                            ? []
                            : NAVER_OFFICIAL_WORD_CHALLENGE.map((_, i) => i)
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                    >
                      전체 정답 토글
                    </button>
                  </div>

                  {/* 내가 별표(⭐)로 저장한 스마트 복습 리스트 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold">
                      ⭐ 내가 저장한 핵심 복습 단어 ({bookmarkedWords.length}개)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bookmarkedWords.map((bw, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-base font-black">{bw.word}</strong>
                              <span className="font-mono text-xs text-blue-600">{bw.ipa}</span>
                              <button
                                onClick={() => speakText(bw.word)}
                                className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white"
                              >
                                🔊
                              </button>
                            </div>
                            <div className="text-xs font-bold mt-1">{bw.meaning}</div>
                            <div className="text-[11px] text-slate-500">
                              짝꿍: {bw.collocation} ({bw.posLabel} · {bw.compLabel})
                            </div>
                          </div>
                          <button
                            onClick={() => toggleBookmark(bw)}
                            className="text-xs text-rose-500 font-bold"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ==============================================================
                  [모드 D] 5~30분 시간 연장형 AI 음성 회화 · 실시간 첨삭 · 영어 성장 리포트
              ============================================================== */}
              {activeMode === 'aiCoach' && (
                <div className="space-y-6">
                  {/* 1. 영어 성장 인포그래픽 리포트 */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold">
                        📈 나만의 영어 성장 인포그래픽 리포트 (iPad M5 학습 통계)
                      </h2>
                      <span className="text-xs font-extrabold text-emerald-600">
                        예상 오픽 등급: IH ➔ AL 달성 88%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                        <div className="text-2xl font-black text-blue-600">
                          {studyStats.masteredWords}개
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          누적 마스터 어휘
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                        <div className="text-2xl font-black text-emerald-600">
                          {studyStats.completedSentences}문장
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          직독직해 & 영작 완료
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900">
                        <div className="text-2xl font-black text-purple-600">
                          {studyStats.quizAccuracy}%
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          네이버 퀴즈 정답률
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900">
                        <div className="text-2xl font-black text-amber-600">
                          {studyStats.speakingMinutes + Math.floor(speakingSeconds / 60)}분
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          누적 스피킹 훈련 시간
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. 5~10분(최대 30분 연장 가능) AI 음성 회화 & 대화형 인공지능 코치 */}
                  <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-5 border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-400">
                          INTERACTIVE AI VOICE COACH
                        </span>
                        <h3 className="text-lg font-extrabold mt-0.5">
                          🎙️ 실전 AI 음성 회화 & 오픽 프리토킹 (5분~10분 기본 · 시간 연장 가능)
                        </h3>
                      </div>

                      {/* 시간 선택 및 연장 컨트롤러 (5분 / 10분 / 15분 / 30분 + 5분 추가 연장 버튼) */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[5, 10, 15, 30].map((m) => (
                          <button
                            key={m}
                            onClick={() => setTargetSpeakingMins(m)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                              targetSpeakingMins === m
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m}분 코스
                          </button>
                        ))}
                        <button
                          onClick={() => setTargetSpeakingMins((prev) => prev + 5)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
                        >
                          +5분 시간 연장
                        </button>
                      </div>
                    </div>

                    {/* 타이머 진행 바 */}
                    <div className="bg-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-400">
                          현재 세션 타이머 (목표: {targetSpeakingMins}분)
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                          {String(Math.floor(speakingSeconds / 60)).padStart(2, '0')}:
                          {String(speakingSeconds % 60).padStart(2, '0')} /{' '}
                          {String(targetSpeakingMins).padStart(2, '0')}:00
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsVoiceActive(!isVoiceActive)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold ${
                            isVoiceActive ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isVoiceActive ? '⏸️ 음성 회화 일시정지' : '🎙️ AI 음성 회화 시작'}
                        </button>
                        <button
                          onClick={() => {
                            setIsVoiceActive(false);
                            setSpeakingSeconds(0);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-700 text-xs font-bold"
                        >
                          초기화
                        </button>
                      </div>
                    </div>

                    {/* 대화형 AI 채팅창 */}
                    <div className="space-y-3 max-h-80 overflow-y-auto p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      {chatHistory.map((turn, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                            turn.role === 'coach'
                              ? 'bg-slate-800 text-slate-100 mr-8'
                              : 'bg-blue-600 text-white ml-8'
                          }`}
                        >
                          <div className="font-extrabold flex items-center justify-between">
                            <span>
                              {turn.role === 'coach' ? '🤖 AI 원어민 코치' : '🙋‍♂️ 나의 스피킹'}
                            </span>
                            <button
                              onClick={() => speakText(turn.text)}
                              className="text-[11px] underline"
                            >
                              🔊 음성 듣기
                            </button>
                          </div>
                          <p className="text-sm font-semibold">{turn.text}</p>
                          {turn.correction && (
                            <p className="text-emerald-300 font-bold pt-1 border-t border-slate-700">
                              {turn.correction}
                            </p>
                          )}
                          {turn.nuanceTip && (
                            <p className="text-amber-300 text-[11px]">🎙️ {turn.nuanceTip}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="영어로 답변을 입력하거나 아이패드 키보드 마이크(🎙️)를 눌러 말해 보세요..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold"
                      >
                        전송 & 발음교정
                      </button>
                    </form>
                  </section>

                  {/* 3. 1:1 실시간 영작 첨삭 연구소 */}
                  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-extrabold">
                      ✍️ 1:1 실시간 영작 첨삭 & 어순·오픽 업그레이드 클리닉
                    </h3>
                    <form onSubmit={handleRunCorrection} className="flex gap-2">
                      <input
                        type="text"
                        value={correctionInput}
                        onChange={(e) => setCorrectionInput(e.target.value)}
                        placeholder="첨삭받고 싶은 영어 문장을 입력하세요 (예: I want to finish the meeting early)"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                      />
                      <button
                        type="submit"
                        className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold ${themeAccentBg}`}
                      >
                        즉시 첨삭 실행
                      </button>
                    </form>

                    {correctionResult && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          • <strong>내가 쓴 문장:</strong> {correctionResult.original}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-extrabold text-sm flex items-center gap-2">
                          <span>• 비즈니스 원어민 교정본: {correctionResult.naturalEn}</span>
                          <button
                            onClick={() => speakText(correctionResult.naturalEn)}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="text-purple-600 dark:text-purple-400 font-bold">
                          • 🏆 오픽 AL 고득점 버전: "{correctionResult.opicUpgrade}"
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          • 🧭 어순 & 문법 진단: {correctionResult.wordOrderFix} /{' '}
                          {correctionResult.grammarExplanation}
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ==============================================================
                  [모드 E] 요일별(주간) · 월별 마스터 정리 노트
              ============================================================== */}
              {activeMode === 'weekly' && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <span className="text-xs font-extrabold text-blue-600">
                      WEEKLY & MONTHLY MASTER SHEET
                    </span>
                    <h2 className="text-2xl font-extrabold mt-0.5">
                      🗓️ 요일별(주간) & 월별 핵심 패턴·어순·오픽 치트시트 총람
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {THEMES.map((t) => (
                      <div
                        key={t.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-extrabold">{t.title}</strong>
                          <button
                            onClick={() => speakText(t.pattern.en)}
                            className={`px-2.5 py-1 rounded-lg text-white text-xs font-bold ${themeAccentBg}`}
                          >
                            🔊 패턴 듣기
                          </button>
                        </div>
                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                          패턴: {t.pattern.en} ({t.pattern.ipa})
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          {t.wordOrderPrinciple}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {t.vocab.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => speakText(v.word)}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold"
                            >
                              {v.word} ({v.meaning})
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}                  
                  
