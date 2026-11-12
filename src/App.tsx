// ============================================================================
// src/App.tsx — [파트 1/4]
// - 최상단 모듈 Import 통합 (React Hooks & studyData.ts 단방향 참조)
// - 문장 성분 7개(구·절 역할) + 9품사(단어 정체, 한정사 포함) = 총 16개 문법 노드 및 21개 결합선 사전
// - 명사 수식어(M-N) 매핑 반영, 감탄사(Interj) 예시 정정, IO 전치사구 보충어 설명 엄밀화
// - STEP 3 기준점 예문(DIAGRAM_EXAMPLES 3선) & 9대 분야 큐레이션 토픽 90선
// ============================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  type CompId,
  type PosId,
  type WordbookLevel,
  type WordbookEntry,
  deterministicShuffle,
  getExpandedWordbookByDay,
  generateCombinatorialSentences,
  EBS_MAJOR_TOPICS,
  GRAMMAR_406_QUIZ_BANK,
  analyzeCustomSchoolPassage,
} from './studyData';

export type { CompId, PosId, WordbookLevel, WordbookEntry };

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export type MediaPlatformId =
  | 'FASHION_MAGS'
  | 'NAVER'
  | 'NATE'
  | 'DAUM_ZUM'
  | 'GOOGLE_TRENDS'
  | 'YOUTUBE'
  | 'INSTA_TIKTOK'
  | 'THREADS_X'
  | 'DANAWA_KOVO';

export type ExamTrackId = 'CSAT_MASTER' | 'GRAMMAR_ESSAY' | 'SCHOOL_INTERNAL';

export interface SentenceComponentInfo {
  id: CompId;
  name: string;
  engName: string;
  roleTitle: string;
  easyMeaning: string;
  wordOrderRule: string;
  allowedPos: PosId[];
  exampleHighlight: string;
}

export interface PartOfSpeechInfo {
  id: PosId;
  name: string;
  engName: string;
  identityTitle: string;
  easyMeaning: string;
  allowedComp: CompId[];
  exampleWords: string;
}

export interface VocabItem {
  id: number;
  type: '일상 회화' | '비즈니스' | '오픽·구동사' | '트렌드·실무' | '수능·학술';
  recommendLevel: LearningLevel;
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
  paraphraseTip: string;
}

export interface TrainingSentence {
  id: number;
  levelTag: LearningLevel;
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
  paraphraseVersion: string;
  grammarPoint: string;
  contextNuance: string;
}

export interface LevelTrackContent {
  levelName: string;
  focusBadge: string;
  speedGuide: string;
  levelGuide: string;
  patternEn: string;
  patternIpa: string;
  patternPron: string;
  patternSoundBlock: string;
  patternSoundRule: string;
  patternMeaningKo: string;
  grammarSummary: string;
  paraphraseDrill: {
    basicExpr: string;
    upgradedExpr: string;
    nuanceDiff: string;
  }[];
  dialogue: {
    speaker: 'A' | 'B';
    roleName: string;
    en: string;
    soundBlock: string;
    pron: string;
    ko: string;
    pointNote: string;
  }[];
}

export interface SynonymScaleGroup {
  conceptTitle: string;
  scaleAxisLabel: string;
  weak: { expr: string; pron: string; ko: string; note: string };
  medium: { expr: string; pron: string; ko: string; note: string };
  strong: { expr: string; pron: string; ko: string; note: string };
}

export interface ThemeQuizData {
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
    questionPrompt: string;
    highlightWord: string;
    options: string[];
    answerIndices: number[];
    explanation: string;
  };
  writingMission: {
    koPrompt: string;
    targetPattern: string;
    modelAnswer: string;
  };
}

export interface ThemeData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  levelTracks: Record<LearningLevel, LevelTrackContent>;
  synonymScales: SynonymScaleGroup[];
  vocab: VocabItem[];
  sentences: TrainingSentence[];
  quiz: ThemeQuizData;
}

export interface DiagramToken {
  word: string;
  comp: CompId;
  compLabel: string;
  pos: PosId;
  posLabel: string;
  meaning: string;
  roleExplanation: string;
  colorClass: string;
}

export interface DiagramSentence {
  title: string;
  rawEn: string;
  naturalKo: string;
  skeleton: string;
  patternType: string;
  wordOrderTip: string;
  isHeuristic?: boolean;
  tokens: DiagramToken[];
}

export interface MediaTrendKeyword {
  rank: number;
  koTitle: string;
  enExpression: string;
  dictTargetWord: string;
  ipa: string;
  pron: string;
  targetThemeId: string;
  extUrl: string;
}

export interface MediaTrendPlatform {
  id: MediaPlatformId;
  name: string;
  shortName: string;
  badgeColor: string;
  liveUrl: string;
  sourceNote: string;
  keywords: MediaTrendKeyword[];
}

export interface ExamCourseStep {
  stepNum: number;
  stepTitle: string;
  focusPoint: string;
  originalPassageEn: string;
  originalPassagePron: string;
  originalPassageKo: string;
  transformedEn: string;
  transformedPron: string;
  transformedPoint: string;
  grammarTrapQuestion: {
    prompt: string;
    choiceA: string;
    choiceB: string;
    correctChoice: 'A' | 'B';
    explanation: string;
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
  badge: string;
  title: string;
  shortTabName: string;
  scheduleGuide: string;
  targetGoal: string;
  coreCurriculum: string[];
  steps: ExamCourseStep[];
}

export interface ChatTurn {
  role: 'user' | 'coach';
  text: string;
  correction?: string;
  nuanceTip?: string;
}

export interface SavedWordItem {
  id: string;
  word: string;
  ipa: string;
  pron?: string;
  meaning: string;
  collocation: string;
  posLabel: string;
  compLabel: string;
  levelBadge?: string;
  customNote?: string;
  mastered?: boolean;
}

export interface SavedSentenceItem {
  id: string;
  en: string;
  pron?: string;
  ko: string;
  note: string;
  category: string;
  mastered: boolean;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface CanvasStroke {
  tool: 'fountain' | 'marker' | 'ballpoint' | 'highlighter' | 'eraser';
  color: '#2563eb' | '#0f172a' | '#10b981' | '#e11d48' | '#facc15';
  width: number;
  alpha: number;
  points: StrokePoint[];
}

// ============================================================================
// 1. 문장 성분 7개(구·절 역할) + 9품사(단어 정체, 한정사 포함) = 총 16개 문법 노드 사전
//    ※ 연결선은 "품사 자체가 곧바로 문장 성분이 된다"는 뜻이 아니라,
//       "해당 품사 단어가 단독으로 쓰이거나 구(전치사구·부정사구·동명사구·명사구)·절을 구성하여
//        문장 성분 역할을 수행할 수 있음"을 나타냅니다.
// ============================================================================
export const SENTENCE_COMPONENTS: SentenceComponentInfo[] = [
  {
    id: 'S',
    name: '주어',
    engName: 'Subject (S)',
    roleTitle: '문장의 주체 (~은/는/이/가)',
    easyMeaning:
      '문장에서 동작을 행하거나 상태의 주체가 되는 자리입니다. 기본적으로 명사(구)·대명사가 오며, 구·절 단위에서는 동명사구(V-ing), to부정사구, 명사절(that절·what절·의문사절)도 주어 역할을 수행합니다.',
    wordOrderRule:
      '평서문에서는 원칙적으로 본동사(V) 앞에 위치합니다. (단, 부정어구·Only 부사구 문두 도치나 유도부사 There 구문에서는 조동사/동사 뒤로 위치가 바뀜)',
    allowedPos: ['N', 'Pron'],
    exampleHighlight:
      '[Our team (S)] streamlined the workflow. / [Streamlining the process (S:동명사구)] makes it feasible.',
  },
  {
    id: 'V',
    name: '동사(서술어)',
    engName: 'Verb / Predicate (V)',
    roleTitle: '주어의 동작·상태 서술 (~하다/~이다)',
    easyMeaning:
      '주어가 어떤 동작을 하는지 또는 어떤 상태인지를 서술하는 문장의 핵심 동사(구) 자리입니다. 조동사(will, can, should 등)나 완료형(have p.p.)과 결합하여 하나의 서술어 블록을 이룹니다.',
    wordOrderRule:
      '주어(S) 바로 뒤에 위치하며, 동사의 성질(자동사·타동사·연결동사·수여동사)에 따라 뒤에 올 목적어(O)나 보어(C), 전치사구 보충어의 구조가 결정됩니다.',
    allowedPos: ['V'],
    exampleHighlight:
      'Our team [streamlined (V)] the workflow. / We [will touch base (V)] tomorrow.',
  },
  {
    id: 'IO',
    name: '간접목적어',
    engName: 'Indirect Object (IO)',
    roleTitle: '4형식 수여동사의 받는 대상 (~에게)',
    easyMeaning:
      '4형식 수여동사(give, send, offer, grant, show 등) 뒤에서 직접목적어(DO)를 전달받는 수혜 대상(~에게)입니다.',
    wordOrderRule:
      '4형식에서는 [수여동사(V) + 간접목적어(IO: ~에게) + 직접목적어(DO: ~을/를)] 어순으로 놓입니다. 3형식으로 전환하면 직접목적어(DO) 뒤로 이동하여 전치사(to/for/of)와 결합한 전치사구(동사가 요구하는 수혜자·도착점 보충어/부가어 기능) 형태가 됩니다.',
    allowedPos: ['N', 'Pron'],
    exampleHighlight: 'Thanks for giving [me (IO)] a quick heads-up(DO).',
  },
  {
    id: 'DO',
    name: '직접목적어',
    engName: 'Direct Object (DO)',
    roleTitle: '타동사 동작의 대상 (~을/를)',
    easyMeaning:
      '타동사가 나타내는 동작의 직접적인 대상입니다. 명사(구)·대명사뿐만 아니라 to부정사구, 동명사구(V-ing), 명사절(that절·what절·if/whether절)도 목적어 자리에 옵니다.',
    wordOrderRule:
      '3형식에서는 타동사(V) 바로 뒤에, 4형식에서는 간접목적어(IO) 바로 뒤에 위치합니다.',
    allowedPos: ['N', 'Pron'],
    exampleHighlight: 'We carefully checked [the schedule (DO)].',
  },
  {
    id: 'SC',
    name: '주격보어',
    engName: 'Subject Complement (SC)',
    roleTitle: '주어(S)의 정체·상태 보충 설명',
    easyMeaning:
      '2형식 연결동사(be, become, remain, seem, feel, look 등) 뒤에서 주어가 무엇인지(명사구) 또는 어떤 상태인지(형용사구) 보충합니다. 구·절 단위에서는 to부정사구·동명사구·명사절 및 상태를 나타내는 전치사구(예: on the same page, in good shape)도 보어 역할을 수행합니다.',
    wordOrderRule:
      '2형식 연결동사 바로 뒤에 위치합니다. 우리말 해석이 "~하게"로 되더라도 주어의 상태를 설명하므로 부사(-ly)가 아닌 형용사를 써야 합니다.',
    allowedPos: ['N', 'Pron', 'Adj', 'Prep'],
    exampleHighlight:
      'The wording remained [ambiguous (SC:형용사)]. / Everyone is [on the same page (SC:전치사구)].',
  },
  {
    id: 'OC',
    name: '목적격보어',
    engName: 'Object Complement (OC)',
    roleTitle: '목적어(DO)의 정체·상태·동작 보충 설명',
    easyMeaning:
      '5형식 동사(make, keep, find, consider, help, encourage 등) 뒤에서 목적어(DO)가 어떤 상태인지(형용사구·명사구) 또는 어떤 동작을 하는지(to부정사구·원형부정사구·분사구)를 보충 설명합니다.',
    wordOrderRule:
      '[5형식 동사(V) + 목적어(DO) + 목적격보어(OC)] 어순입니다. 뒤에 부사구(전치사구)가 이어지더라도 목적어 바로 뒤 상태 보어 자리에는 부사(-ly)를 쓸 수 없습니다.',
    allowedPos: ['N', 'Adj', 'V'],
    exampleHighlight:
      'Streamlining the process makes the project [feasible (OC:형용사)] within the deadline.',
  },
  {
    id: 'M',
    name: '수식어(및 부가어·독립요소)',
    engName: 'Modifier / Adjunct (M)',
    roleTitle: '명사·동사·문장 수식, 명사구 한정 및 전치사구·독립부가어',
    easyMeaning:
      '문장의 필수 뼈대(S·V·O·C)를 꾸며주거나 시간·장소·이유·조건 등의 부가 정보를 더합니다. 단어 단위에서는 형용사·부사·한정사(명사구 내부 한정)·복합명사 앞 명사 수식어(예: approval process의 approval)·감탄사가, 구·절 단위에서는 전치사구(전치사+명사 목적어)·부사절·분사구문이 이 역할을 수행합니다.',
    wordOrderRule:
      '한정사(Det)·형용사(Adj)·명사수식어(N)는 주로 명사 앞에서, 전치사구·관계사절·부사절은 명사 뒤나 문장 앞뒤에서 수식·보충합니다.',
    allowedPos: ['N', 'Adj', 'Adv', 'Prep', 'Conj', 'Det', 'Interj'],
    exampleHighlight:
      '[The (M:한정사)] [approval (M:명사수식어)] process / [on the schedule (M:전치사구)]',
  },
];

export const PARTS_OF_SPEECH: PartOfSpeechInfo[] = [
  {
    id: 'N',
    name: '명사',
    engName: 'Noun (N)',
    identityTitle: '사람·사물·추상 개념의 이름',
    easyMeaning:
      '구체적인 사물부터 추상적 개념(perspective, autonomy, feasibility 등)까지 이름을 나타내는 품사입니다. 명사구의 중심(핵)이 되어 주어·목적어·보어 자리에 들어가며, 다른 명사 앞에서 복합명사 수식어(M)가 되거나 전치사의 목적어로서 전치사구(M)를 구성하기도 합니다.',
    allowedComp: ['S', 'IO', 'DO', 'SC', 'OC', 'M'],
    exampleWords: 'schedule, perspective, itinerary, silhouette, milestone, bias',
  },
  {
    id: 'Pron',
    name: '대명사',
    engName: 'Pronoun (Pron)',
    identityTitle: '명사(구)를 대신 가리키는 말',
    easyMeaning:
      '명사의 반복을 피하거나 화자·청자·대상을 가리킬 때 명사구 자리에 대신 들어갑니다. 인칭대명사(I, we, you, me, us), 재귀대명사(yourself), 관계대명사(what, which) 등이 포함됩니다.',
    allowedComp: ['S', 'IO', 'DO', 'SC'],
    exampleWords: 'I, we, you, they, me, us, it, yourself, ourselves, what',
  },
  {
    id: 'V',
    name: '동사',
    engName: 'Verb (V)',
    identityTitle: '동작이나 상태를 나타내는 말',
    easyMeaning:
      '시제와 수일치를 가지며 문장의 서술어(V)가 됩니다. 또한 to부정사·원형부정사·분사(준동사구) 형태로 쓰일 때는 5형식 목적격보어(OC) 구문을 이끌기도 합니다.',
    allowedComp: ['V', 'OC'],
    exampleWords: 'streamline, expedite, accommodate, unwind, foster, consolidate',
  },
  {
    id: 'Adj',
    name: '형용사',
    engName: 'Adjective (Adj)',
    identityTitle: '명사의 성질·상태를 설명하는 말',
    easyMeaning:
      '명사 앞뒤에서 명사를 꾸미는 수식어(M)가 되거나, 2형식 주격보어(SC) 및 5형식 목적격보어(OC) 자리에서 주어·목적어의 상태를 설명합니다.',
    allowedComp: ['SC', 'OC', 'M'],
    exampleWords:
      'feasible, available, comfortable, ambiguous, tentative, sustainable',
  },
  {
    id: 'Adv',
    name: '부사',
    engName: 'Adverb (Adv)',
    identityTitle: '동사·형용사·다른 부사·문장 전체를 수식하는 말',
    easyMeaning:
      '시간, 장소, 빈도, 방식, 정도 및 화자의 태도(honestly, thankfully 등)를 나타내며 문장에서 수식어(M)로 기능합니다. (주의: 보어 자리인 SC·OC에는 부사가 들어갈 수 없습니다.)',
    allowedComp: ['M'],
    exampleWords:
      'meticulously, simultaneously, seamlessly, overnight, genuinely, honestly',
  },
  {
    id: 'Prep',
    name: '전치사',
    engName: 'Preposition (Prep)',
    identityTitle: '명사구(동명사구) 앞에 놓여 시간·장소·대상 관계를 나타내는 말',
    easyMeaning:
      '단독으로 성분이 되지 않고 뒤에 목적어(명사구·동명사구)를 이끌어 [전치사구]를 형성합니다. 형성된 전치사구 전체가 문장에서 부사적/형용사적 수식어·보충어(M)가 되거나 상태를 나타내는 주격보어(SC)로 쓰입니다.',
    allowedComp: ['SC', 'M'],
    exampleWords:
      'in, on, at, for, with, by, before, during, without, within, upon',
  },
  {
    id: 'Conj',
    name: '접속사',
    engName: 'Conjunction (Conj)',
    identityTitle: '단어·구·절을 이어주는 연결어',
    easyMeaning:
      '대등한 요소를 잇는 등위접속사(and, but, or, so)와 부사절·명사절을 이끄는 종속접속사(because, although, if, until, that, whether)가 있으며 절 단위의 연결 및 부사절 수식(M)을 담당합니다.',
    allowedComp: ['M'],
    exampleWords: 'and, but, so, because, although, if, until, whether, while',
  },
  {
    id: 'Det',
    name: '한정사',
    engName: 'Determiner (Det)',
    identityTitle: '명사구 맨 앞에서 명사의 범위·소유·특정성을 한정하는 말',
    easyMeaning:
      '관사(a, an, the), 소유격(my, our, their), 지시한정사(this, that) 등입니다. 단독으로 독립된 문장 성분이 되기보다 명사구(NP) 내부에서 핵심 명사를 한정하는 수식 요소(M)로 기능합니다.',
    allowedComp: ['M'],
    exampleWords: 'the, a, an, my, our, your, their, this, that, every, each',
  },
  {
    id: 'Interj',
    name: '감탄사(담화표지)',
    engName: 'Interjection (Interj)',
    identityTitle: '놀람·느낌·부름·응답을 나타내는 독립 단어',
    easyMeaning:
      '문장의 필수 뼈대 밖에서 독립적으로 감정을 표현하거나 말을 꺼내는 담화 표지입니다. 공식 7성분 다이어그램에서는 부가·독립 요소(M)에 연결됩니다.',
    allowedComp: ['M'],
    exampleWords: 'Oh, Wow, Hey, Well, Oops, Bravo, Ah, Hurray',
  },
];

// SENTENCE_COMPONENTS.allowedPos 및 PARTS_OF_SPEECH.allowedComp와 1:1로 일치하는 21개 결합 관계선
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
  { comp: 'SC', pos: 'Prep' },
  { comp: 'OC', pos: 'N' },
  { comp: 'OC', pos: 'Adj' },
  { comp: 'OC', pos: 'V' },
  { comp: 'M', pos: 'N' },
  { comp: 'M', pos: 'Adj' },
  { comp: 'M', pos: 'Adv' },
  { comp: 'M', pos: 'Prep' },
  { comp: 'M', pos: 'Conj' },
  { comp: 'M', pos: 'Det' },
  { comp: 'M', pos: 'Interj' },
];

// STEP 3에서 언제든 선택해 확인할 수 있는 정밀 수작업 주석 대표 예문 3선 (5형식 · 4형식 · 2형식)
export const DIAGRAM_EXAMPLES: DiagramSentence[] = [
  {
    title: '대표 표준 예문 1 (5형식: 동명사구 주어 + make + 목적어 + 형용사 보어)',
    rawEn: 'Streamlining the process makes the schedule feasible.',
    naturalKo: '절차를 간소화하는 것은 그 일정을 실현 가능하게 만든다.',
    skeleton:
      'Streamlining the process[S] + makes[V] + the schedule[DO] + feasible[OC]',
    patternType: '5형식 (S + V + DO + OC) — 목적격보어 형용사 주의 구문',
    wordOrderTip:
      '문장 맨 앞의 Streamlining은 뒤에 콤마(,) 없이 곧바로 단수 본동사 makes와 결합하므로 분사구문이 아니라 동명사구 주어(S)입니다. 맨 끝 feasible은 목적어(the schedule)의 상태를 보충하는 목적격보어(OC)이므로 부사(feasibly)를 쓰지 않습니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Streamlining',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '동명사 (N역할)',
        meaning: '간소화하는 것',
        roleExplanation:
          '동사 streamline에 -ing가 붙어 명사구 역할을 하는 동명사구 주어(S)의 핵심어입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation:
          '명사 process 앞에서 특정 대상을 한정하는 정관사(한정사)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'process',
        comp: 'DO',
        compLabel: '준동사의 목적어',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '절차를',
        roleExplanation:
          '앞의 동명사 Streamlining의 의미상 목적어로 결합되어 전체 주어구(Streamlining the process)를 완성합니다.',
        colorClass: 'border-indigo-400 text-indigo-700',
      },
      {
        word: 'makes',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '만든다',
        roleExplanation:
          '동명사구 주어(단수 취급)에 수일치된 5형식 본동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '목적어 명사 schedule을 한정하는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'schedule',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '일정을',
        roleExplanation: '5형식 동사 makes의 직접목적어(DO)입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
      {
        word: 'feasible.',
        comp: 'OC',
        compLabel: '목적격보어 (OC)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '실현 가능한(가능하게)',
        roleExplanation:
          '목적어(the schedule)가 어떤 상태가 되는지 설명하는 목적격보어(OC)이므로 형용사 형태를 씁니다.',
        colorClass: 'border-amber-500 text-amber-700',
      },
    ],
  },
  {
    title: '대표 표준 예문 2 (4형식: 수여동사 give + 간접목적어 IO + 직접목적어 DO)',
    rawEn: 'Traveling abroad gives us valuable experience.',
    naturalKo: '해외여행을 하는 것은 우리에게 귀중한 경험을 준다.',
    skeleton:
      'Traveling abroad[S] + gives[V] + us[IO] + valuable experience[DO]',
    patternType: '4형식 수여동사 구문 (S + V + IO + DO)',
    wordOrderTip:
      '4형식 동사 gives 뒤에 받는 사람(us: 우리에게, IO)이 먼저 오고, 주는 대상(valuable experience: 귀중한 경험을, DO)이 바로 이어집니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Traveling',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '동명사 (N역할)',
        meaning: '여행하는 것은',
        roleExplanation: '문장의 주어 역할을 하는 동명사(S)입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'abroad',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '해외로',
        roleExplanation:
          '앞의 동명사 Traveling을 수식하는 장소·방향 부사(M)입니다.',
        colorClass: 'border-slate-400 text-slate-600',
      },
      {
        word: 'gives',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '준다',
        roleExplanation:
          '간접목적어와 직접목적어 두 개를 취하는 4형식 수여동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'us',
        comp: 'IO',
        compLabel: '간접목적어 (IO)',
        pos: 'Pron',
        posLabel: '대명사 (Pron)',
        meaning: '우리에게',
        roleExplanation:
          '경험을 받는 대상인 간접목적어(IO) 자리에 목적격 대명사가 쓰였습니다.',
        colorClass: 'border-purple-500 text-purple-700',
      },
      {
        word: 'valuable',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '귀중한',
        roleExplanation:
          '뒤의 명사 experience를 꾸며주는 형용사 수식어(M)입니다.',
        colorClass: 'border-amber-500 text-amber-700',
      },
      {
        word: 'experience.',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '경험을',
        roleExplanation:
          '수여동사 gives가 전달하는 실제 내용물인 직접목적어(DO)입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
    ],
  },
  {
    title: '대표 표준 예문 3 (2형식: 연결동사 remain + 형용사 주격보어 SC)',
    rawEn: 'The wording remained somewhat ambiguous.',
    naturalKo: '그 문구는 다소 모호한 상태로 남아 있었다.',
    skeleton: 'The wording[S] + remained[V] + somewhat[M] + ambiguous[SC]',
    patternType: '2형식 상태유지 구문 (S + V + SC)',
    wordOrderTip:
      'remained는 2형식 연결동사이며, 부사 somewhat(다소)은 뒤의 형용사 보어 ambiguous를 수식(M)하고, 핵심 주격보어(SC)는 형용사 ambiguous입니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'The',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '주어 명사 wording을 한정하는 정관사(Det)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'wording',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '문구는',
        roleExplanation: '문장의 주체가 되는 주어(S) 명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'remained',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '남아 있었다',
        roleExplanation: '주어의 상태가 유지됨을 나타내는 2형식 연결동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'somewhat',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '다소, 어느 정도',
        roleExplanation:
          '뒤에 오는 형용사 보어 ambiguous의 정도를 꾸며주는 부사(M)입니다.',
        colorClass: 'border-slate-400 text-slate-600',
      },
      {
        word: 'ambiguous.',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '모호한 (상태로)',
        roleExplanation:
          '주어(The wording)의 상태를 보충 설명하는 주격보어(SC)입니다.',
        colorClass: 'border-amber-500 text-amber-700',
      },
    ],
  },
];

// ============================================================================
// 2. 9대 분야 에디터 큐레이션 & 구글 뉴스 RSS 연동 토픽 90선
//    - 모든 키워드에 dictTargetWord(사전 검색용 단일 표제어), ipa(미국식), pron(한글발음) 완비
//    - 실제 서비스 현황(유튜브 크리에이터·쇼츠, 네이버 뉴스 큐레이션 등) 반영
// ============================================================================
export const INITIAL_MEDIA_PLATFORMS: MediaTrendPlatform[] = [
  {
    id: 'FASHION_MAGS',
    name: '패션 에디토리얼 큐레이션 (런웨이·스타일링 핵심 표현)',
    shortName: '👗 패션에디토리얼',
    badgeColor: 'bg-rose-600 text-white',
    liveUrl: 'https://www.vogue.com/fashion',
    sourceNote: '에디터 선정 패션·스타일링 필수 연어 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '테일러드 룩을 멋지게 소화하기',
        enExpression: 'pull off a tailored look',
        dictTargetWord: 'tailored',
        ipa: '/pʊl ɔːf ə ˈteɪ.lɚd lʊk/',
        pron: '[풀 오프 어 테일러드 룩]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.vogue.com/fashion',
      },
      {
        rank: 2,
        koTitle: '유행을 타지 않는 옷장 필수 기본템에 투자하기',
        enExpression: 'invest in a wardrobe staple',
        dictTargetWord: 'staple',
        ipa: '/ɪnˈvest ɪn ə ˈwɔːr.droʊb ˈsteɪ.pəl/',
        pron: '[인베스트 이너 워드로브 스테이플]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.harpersbazaar.com/fashion/',
      },
      {
        rank: 3,
        koTitle: '절제된 미니멀 미학(조용한 럭셔리) 수용하기',
        enExpression: 'embrace a minimalist aesthetic',
        dictTargetWord: 'aesthetic',
        ipa: '/ɪmˈbreɪs ə ˈmɪn.ə.məl.ɪst esˈθet̬.ɪk/',
        pron: '[임브레이스 어 미니멀리스트 에스쎄틱]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.elle.com/fashion/',
      },
      {
        rank: 4,
        koTitle: '지속 가능한 친환경 패션 캠페인 선도하기',
        enExpression: 'spearhead sustainable fashion',
        dictTargetWord: 'spearhead',
        ipa: '/ˈspɪr.hed səˈsteɪ.nə.bəl ˈfæʃ.ən/',
        pron: '[스피어헤드 서스테이너블 패션]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://wwd.com/fashion-news/',
      },
      {
        rank: 5,
        koTitle: '서로 다른 소재·질감을 자연스럽게 레이어링하기',
        enExpression: 'layer different textures seamlessly',
        dictTargetWord: 'texture',
        ipa: '/ˈleɪ.ɚ ˈdɪf.ɚ.ənt ˈteks.tʃɚz ˈsiːm.ləs.li/',
        pron: '[레이어 디프런트 텍스처즈 심리슬리]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.gq.com/style',
      },
      {
        rank: 6,
        koTitle: '체형과 전체적인 실루엣을 돋보이게 보완하기',
        enExpression: 'complement your silhouette naturally',
        dictTargetWord: 'silhouette',
        ipa: '/ˈkɑːm.plə.ment jʊr ˌsɪl.uˈet ˈnætʃ.ɚ.əl.i/',
        pron: '[캄플러먼트 유어 실루엣 내추럴리]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.vogue.com/fashion',
      },
      {
        rank: 7,
        koTitle: '단숨에 시선을 사로잡는 포인트 아이템 착용하기',
        enExpression: 'wear a bold statement piece',
        dictTargetWord: 'statement',
        ipa: '/wer ə boʊld ˈsteɪt.mənt piːs/',
        pron: '[웨어 러 볼드 스테이트먼트 피스]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.elle.com/fashion/',
      },
      {
        rank: 8,
        koTitle: '전통 헤리티지와 현대적 감각을 조화롭게 결합하기',
        enExpression: 'blend heritage with modern style',
        dictTargetWord: 'heritage',
        ipa: '/blend ˈher.ɪ.t̬ɪdʒ wɪð ˈmɑː.dɚn staɪl/',
        pron: '[블렌드 헤리티지 위드 모던 스타일]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://wwd.com/',
      },
      {
        rank: 9,
        koTitle: '사이즈와 핏을 확인하기 위해 재킷 직접 입어보기',
        enExpression: 'try on the jacket for size',
        dictTargetWord: 'jacket',
        ipa: '/traɪ ɑːn ðə ˈdʒæk.ɪt fɔːr saɪz/',
        pron: '[트라이 안 더 재킷 포 사이즈]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.gq.com/style',
      },
      {
        rank: 10,
        koTitle: '캐주얼과 정장 모두에 잘 어울리기',
        enExpression: 'go well with both casual and formal wear',
        dictTargetWord: 'casual',
        ipa: '/ɡoʊ wel wɪð boʊθ ˈkæʒ.u.əl ænd ˈfɔːr.məl wer/',
        pron: '[고우 웰 위드 보쓰 캐주얼 앤 포멀 웨어]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.harpersbazaar.com/',
      },
    ],
  },
  {
    id: 'NAVER',
    name: '네이버 뉴스·비즈니스 토픽 큐레이션',
    shortName: '💚 네이버뉴스',
    badgeColor: 'bg-emerald-600 text-white',
    liveUrl: 'https://news.naver.com/',
    sourceNote: '직장인·시사 뉴스 핵심 비즈니스 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '복잡한 업무 프로세스 간소화·효율화하기',
        enExpression: 'streamline the workflow',
        dictTargetWord: 'streamline',
        ipa: '/ˈstriːm.laɪn ðə ˈwɝːk.floʊ/',
        pron: '[스트림라인 더 워크플로우]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 2,
        koTitle: '결재 및 승인 절차를 신속히 앞당겨 처리하기',
        enExpression: 'expedite the approval process',
        dictTargetWord: 'expedite',
        ipa: '/ˈek.spə.daɪt ðə əˈpruː.vəl ˈprɑː.ses/',
        pron: '[엑스퍼다이트 디 어프루벌 프로세스]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 3,
        koTitle: '일정 변경에 대해 팀에 미리 귀띔해 주기',
        enExpression: 'give a quick heads-up',
        dictTargetWord: 'schedule',
        ipa: '/ɡɪv ə kwɪk ˈhedz.ʌp/',
        pron: '[기버 퀵 헤즈업]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 4,
        koTitle: '프로젝트 일정을 실현 가능하게 만들기',
        enExpression: 'make the project feasible',
        dictTargetWord: 'feasible',
        ipa: '/meɪk ðə ˈprɑː.dʒekt ˈfiː.zə.bəl/',
        pron: '[메익 더 프로젝트 피저블]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 5,
        koTitle: '긴 하루 일과를 마치고 퇴근 후 긴장 풀기',
        enExpression: 'unwind after a long day at work',
        dictTargetWord: 'unwind',
        ipa: '/ʌnˈwaɪnd ˈæf.tɚ ə lɔːŋ deɪ æt wɝːk/',
        pron: '[언와인드 애프터 러 롱 데이 앳 워크]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 6,
        koTitle: '호텔 레이트 체크아웃 요청을 수용해 주다',
        enExpression: 'accommodate a late check-out request',
        dictTargetWord: 'accommodate',
        ipa: '/əˈkɑː.mə.deɪt ə leɪt ˈtʃek.aʊt rɪˈkwest/',
        pron: '[어카머데이트 어 레이트 체크아웃 리퀘스트]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 7,
        koTitle: '하룻밤 사이에 입소문을 타고 빠르게 확산되다',
        enExpression: 'go viral overnight',
        dictTargetWord: 'viral',
        ipa: '/ɡoʊ ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt/',
        pron: '[고우 바이럴 오버나이트]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 8,
        koTitle: '모두가 같은 내용을 공유하고 있는지 확인하기',
        enExpression: 'make sure we are on the same page',
        dictTargetWord: 'consensus',
        ipa: '/meɪk ʃʊr wi ɑːr ɑːn ðə seɪm peɪdʒ/',
        pron: '[메익 슈어 위 아 안 더 세임 페이지]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 9,
        koTitle: '주말마다 늘 찾는 단골 커피숍 방문하기',
        enExpression: 'visit my go-to coffee shop',
        dictTargetWord: 'routine',
        ipa: '/ˈvɪz.ɪt maɪ ˈɡoʊ.tuː ˈkɔː.fi ʃɑːp/',
        pron: '[비짓 마이 고우투 커피 샵]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.naver.com/',
      },
      {
        rank: 10,
        koTitle: '체크인 시간 전에 수하물 먼저 맡기기',
        enExpression: 'drop off our luggage early',
        dictTargetWord: 'luggage',
        ipa: '/drɑːp ɔːf ˈaʊ.ɚ ˈlʌɡ.ɪdʒ ˈɝː.li/',
        pron: '[드랍 오프 아워 러기지 얼리]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://news.naver.com/',
      },
    ],
  },
  {
    id: 'GOOGLE_TRENDS',
    name: '구글 뉴스 RSS & 글로벌 테크 토픽 (RSS 연동)',
    shortName: '🔵 구글트렌드',
    badgeColor: 'bg-blue-600 text-white',
    liveUrl: 'https://trends.google.co.kr/trending?geo=KR',
    sourceNote: '구글 뉴스 RSS 헤드라인 연동 지원 플랫폼',
    keywords: [
      {
        rank: 1,
        koTitle: '소문·기대만큼 실제로도 뛰어난 가치를 증명하다',
        enExpression: 'live up to the hype',
        dictTargetWord: 'hype',
        ipa: '/lɪv ʌp tə ðə haɪp/',
        pron: '[리법 투 더 하입]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 2,
        koTitle: '문제의 핵심(정곡)을 정확히 찌르다',
        enExpression: 'hit the nail on the head',
        dictTargetWord: 'accurate',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 3,
        koTitle: '데이터 분석 도구를 실무에 적극 활용하다',
        enExpression: 'leverage data analytics tools',
        dictTargetWord: 'leverage',
        ipa: '/ˈlev.ɚ.ɪdʒ ˈdeɪ.t̬ə ˌæn.əˈlɪt̬.ɪks tuːlz/',
        pron: '[레버리지 데이터 애널리틱스 툴즈]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 4,
        koTitle: '신제품 출시를 위한 잠정 일정을 잡다',
        enExpression: 'set a tentative launch date',
        dictTargetWord: 'tentative',
        ipa: '/set ə ˈten.tə.t̬ɪv lɔːntʃ deɪt/',
        pron: '[세러 텐터티브 런치 데이트]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 5,
        koTitle: '주말 동안 신작 시리즈 전체를 몰아서 정주행하다',
        enExpression: 'binge-watch the entire season',
        dictTargetWord: 'episode',
        ipa: '/ˈbɪndʒ.wɑːtʃ ðə ɪnˈtaɪr ˈsiː.zən/',
        pron: '[빈지워치 디 인타이어 시즌]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 6,
        koTitle: '복잡한 머리를 식히기 위해 산책하다',
        enExpression: 'take a walk to clear my head',
        dictTargetWord: 'refresh',
        ipa: '/teɪk ə wɔːk tə klɪr maɪ hed/',
        pron: '[테이커 워크 투 클리어 마이 헤드]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 7,
        koTitle: '호텔 투숙객용 무료 조식 혜택을 이용하다',
        enExpression: 'enjoy complimentary breakfast',
        dictTargetWord: 'complimentary',
        ipa: '/ɪnˈdʒɔɪ ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
        pron: '[인조이 캄플러멘터리 브렉퍼스트]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 8,
        koTitle: '세부 계약 조건을 빈틈없이 꼼꼼하게 검토하다',
        enExpression: 'review the terms meticulously',
        dictTargetWord: 'meticulous',
        ipa: '/rɪˈvjuː ðə tɝːmz məˈtɪk.jə.ləs.li/',
        pron: '[리뷰 더 텀즈 머티큘러슬리]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 9,
        koTitle: '매일 정해둔 운동 루틴을 흔들림 없이 지키다',
        enExpression: 'stick to my daily workout routine',
        dictTargetWord: 'consistent',
        ipa: '/stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn/',
        pron: '[스틱 투 마이 데일리 워크아웃 루틴]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
      {
        rank: 10,
        koTitle: '업데이트된 항공편 상세 일정표를 확인하다',
        enExpression: 'check the updated flight itinerary',
        dictTargetWord: 'itinerary',
        ipa: '/tʃek ðə ʌpˈdeɪ.t̬ɪd flaɪt aɪˈtɪn.ə.rer.i/',
        pron: '[체크 디 업데이티드 플라이트 아이티너레리]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://trends.google.co.kr/trending?geo=KR',
      },
    ],
  },
  {
    id: 'YOUTUBE',
    name: '유튜브 크리에이터 & 쇼츠(Shorts) 핵심 표현',
    shortName: '🔴 유튜브·쇼츠',
    badgeColor: 'bg-red-600 text-white',
    liveUrl: 'https://www.youtube.com/',
    sourceNote: '유튜브 크리에이터·브이로그·리뷰 빈출 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '소셜 미디어 전반에서 빠르게 입소문을 타다',
        enExpression: 'go viral across social media',
        dictTargetWord: 'viral',
        ipa: '/ɡoʊ ˈvaɪ.rəl əˈkrɔːs ˈsoʊ.ʃəl ˈmiː.di.ə/',
        pron: '[고우 바이럴 어크로스 소셜 미디어]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 2,
        koTitle: '시청자의 시선을 즉시 사로잡다',
        enExpression: 'capture viewers’ attention right away',
        dictTargetWord: 'capture',
        ipa: '/ˈkæp.tʃɚ ˈvjuː.ɚz əˈten.ʃən raɪt əˈweɪ/',
        pron: '[캡처 뷰어즈 어텐션 라이러웨이]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 3,
        koTitle: '확실히 소문·기대만큼의 가치를 증명하다',
        enExpression: 'definitely live up to the hype',
        dictTargetWord: 'hype',
        ipa: '/ˈdef.ə.nət.li lɪv ʌp tə ðə haɪp/',
        pron: '[데피니틀리 리법 투 더 하입]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 4,
        koTitle: '핵심을 정확히 찌르는 분석을 제시하다',
        enExpression: 'hit the nail on the head',
        dictTargetWord: 'insight',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 5,
        koTitle: '밀린 최신 브이로그들을 몰아서 정주행하다',
        enExpression: 'binge-watch the latest vlogs',
        dictTargetWord: 'marathon',
        ipa: '/ˈbɪndʒ.wɑːtʃ ðə ˈleɪ.t̬ɪst vlɑːɡz/',
        pron: '[빈지워치 더 레이티스트 브이로그즈]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 6,
        koTitle: '좋아하는 음악을 들으며 에너지를 재충전하다',
        enExpression: 'recharge my batteries with music',
        dictTargetWord: 'recharge',
        ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz wɪð ˈmjuː.zɪk/',
        pron: '[리차지 마이 배러리즈 위드 뮤직]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 7,
        koTitle: '과감한 포인트 스타일을 멋지게 소화해 내다',
        enExpression: 'pull off a bold look',
        dictTargetWord: 'bold',
        ipa: '/pʊl ɔːf ə boʊld lʊk/',
        pron: '[풀 오프 어 볼드 룩]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 8,
        koTitle: '경유 대기 시간 동안 간단히 씻고 재정비하다',
        enExpression: 'freshen up during the layover',
        dictTargetWord: 'layover',
        ipa: '/ˈfreʃ.ən ʌp ˈdʊr.ɪŋ ðə ˈleɪ.oʊ.vɚ/',
        pron: '[프레셔넙 듀링 더 레이오버]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 9,
        koTitle: '오늘의 논의를 매끄럽게 마무리하다',
        enExpression: 'wrap up the discussion smoothly',
        dictTargetWord: 'conclude',
        ipa: '/ræp ʌp ðə dɪˈskʌʃ.ən ˈsmuːð.li/',
        pron: '[래펍 더 디스커션 스무들리]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.youtube.com/',
      },
      {
        rank: 10,
        koTitle: '기내 반입 수하물 크기 제한 규격을 맞추다',
        enExpression: 'meet the carry-on size limit',
        dictTargetWord: 'baggage',
        ipa: '/miːt ðə ˈkær.i.ɑːn saɪz ˈlɪm.ɪt/',
        pron: '[밋 더 캐리안 사이즈 리밋]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.youtube.com/',
      },
    ],
  },
  {
    id: 'NATE',
    name: '네이트 직장인 & 라이프 토픽 큐레이션',
    shortName: '🟠 네이트뉴스',
    badgeColor: 'bg-orange-600 text-white',
    liveUrl: 'https://news.nate.com/',
    sourceNote: '직장 생활·여가·일상 회화 빈출 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '매니저와 잠깐 연락해 진행 상황을 공유하다',
        enExpression: 'touch base with my manager',
        dictTargetWord: 'manager',
        ipa: '/tʌtʃ beɪs wɪð maɪ ˈmæn.ɪ.dʒɚ/',
        pron: '[터치 베이스 위드 마이 매니저]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 2,
        koTitle: '파급력이 큰 핵심 업무부터 우선순위에 두다',
        enExpression: 'prioritize high-impact tasks',
        dictTargetWord: 'prioritize',
        ipa: '/praɪˈɔːr.ə.taɪz haɪ ˈɪm.pækt tæsks/',
        pron: '[프라이오러타이즈 하이 임팩트 태스크스]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 3,
        koTitle: '단골 베이커리에서 간단히 요기하다',
        enExpression: 'grab a bite at my go-to bakery',
        dictTargetWord: 'bakery',
        ipa: '/ɡræb ə baɪt æt maɪ ˈɡoʊ.tuː ˈbeɪ.kɚ.i/',
        pron: '[그래버 바이트 앳 마이 고우투 베이커리]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 4,
        koTitle: '오션뷰 객실이 이용 가능한지 확인하다',
        enExpression: 'check if an ocean-view room is available',
        dictTargetWord: 'available',
        ipa: '/tʃek ɪf ən ˈoʊ.ʃən vjuː ruːm ɪz əˈveɪ.lə.bəl/',
        pron: '[체크 이프 언 오션뷰 룸 이즈 어베일러블]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 5,
        koTitle: '부서 간에 긴밀하게 협업하다',
        enExpression: 'collaborate closely across teams',
        dictTargetWord: 'collaborate',
        ipa: '/kəˈlæb.ə.reɪt ˈkloʊs.li əˈkrɔːs tiːmz/',
        pron: '[컬래버레이트 클로슬리 어크로스 팀즈]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 6,
        koTitle: '저녁 운동으로 하루의 긴장과 피로를 풀다',
        enExpression: 'unwind with an evening workout',
        dictTargetWord: 'unwind',
        ipa: '/ʌnˈwaɪnd wɪð ən ˈiːv.nɪŋ ˈwɝːk.aʊt/',
        pron: '[언와인드 위드 언 이브닝 워크아웃]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 7,
        koTitle: '문제의 정곡을 정확히 찌르다',
        enExpression: 'hit the nail on the head',
        dictTargetWord: 'precise',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 8,
        koTitle: '유행을 타지 않는 옷장 필수 기본템을 활용하다',
        enExpression: 'rely on a timeless wardrobe staple',
        dictTargetWord: 'timeless',
        ipa: '/rɪˈlaɪ ɑːn ə ˈtaɪm.ləs ˈwɔːr.droʊb ˈsteɪ.pəl/',
        pron: '[릴라이 아너 타임리스 워드로브 스테이플]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 9,
        koTitle: '예산을 효율적으로 할당·배분하다',
        enExpression: 'allocate the budget efficiently',
        dictTargetWord: 'allocate',
        ipa: '/ˈæl.ə.keɪt ðə ˈbʌdʒ.ɪt ɪˈfɪʃ.ənt.li/',
        pron: '[앨러케이트 더 버짓 이피션틀리]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.nate.com/',
      },
      {
        rank: 10,
        koTitle: '수하물 찾는 구역으로 이동하다',
        enExpression: 'head to the baggage claim area',
        dictTargetWord: 'baggage',
        ipa: '/hed tə ðə ˈbæɡ.ɪdʒ kleɪm ˈer.i.ə/',
        pron: '[헤드 투 더 배기지 클레임 에어리어]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://news.nate.com/',
      },
    ],
  },
  {
    id: 'DAUM_ZUM',
    name: '다음·ZUM 시사 & 교양 인사이트 큐레이션',
    shortName: '🟡 다음·ZUM',
    badgeColor: 'bg-amber-500 text-slate-950',
    liveUrl: 'https://news.daum.net/',
    sourceNote: '시사·칼럼·학술 교양 핵심 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '다양한 관점을 수용해 확증 편향을 극복하다',
        enExpression: 'overcome confirmation bias',
        dictTargetWord: 'bias',
        ipa: '/ˌoʊ.vɚˈkʌm ˌkɑːn.fɚˈmeɪ.ʃən ˈbaɪ.əs/',
        pron: '[오버컴 칸퍼메이션 바이어스]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 2,
        koTitle: '독서와 대화를 통해 우리의 시야(관점)를 넓히다',
        enExpression: 'broaden our perspective',
        dictTargetWord: 'perspective',
        ipa: '/ˈbrɔː.dən ˈaʊ.ɚ pɚˈspek.tɪv/',
        pron: '[브로든 아워 퍼스펙티브]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 3,
        koTitle: '전통 유산과 현대적 미학을 조화롭게 결합하다',
        enExpression: 'blend heritage with modern aesthetics',
        dictTargetWord: 'aesthetic',
        ipa: '/blend ˈher.ɪ.t̬ɪdʒ wɪð ˈmɑː.dɚn esˈθet̬.ɪks/',
        pron: '[블렌드 헤리티지 위드 모던 에스쎄틱스]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 4,
        koTitle: '지속 가능한 일상 습관을 채택하다',
        enExpression: 'adopt sustainable daily habits',
        dictTargetWord: 'sustainable',
        ipa: '/əˈdɑːpt səˈsteɪ.nə.bəl ˈdeɪ.li ˈhæb.ɪts/',
        pron: '[어답트 서스테이너블 데일리 해비츠]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 5,
        koTitle: '상호 이익이 되는 계약 조건을 협상하다',
        enExpression: 'negotiate mutually beneficial terms',
        dictTargetWord: 'negotiate',
        ipa: '/nəˈɡoʊ.ʃi.eɪt ˈmjuː.tʃu.əl.i ˌben.əˈfɪʃ.əl tɝːmz/',
        pron: '[너고우시에이트 뮤추얼리 베니피셜 텀즈]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 6,
        koTitle: '높은 사전 기대치에 부응하다',
        enExpression: 'live up to the high expectations',
        dictTargetWord: 'expectation',
        ipa: '/lɪv ʌp tə ðə haɪ ˌek.spekˈteɪ.ʃənz/',
        pron: '[리법 투 더 하이 익스펙테이션즈]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 7,
        koTitle: '투숙객의 특별 요청을 수용해 편의를 봐주다',
        enExpression: 'accommodate special guest requests',
        dictTargetWord: 'accommodate',
        ipa: '/əˈkɑː.mə.deɪt ˈspeʃ.əl ɡest rɪˈkwests/',
        pron: '[어카머데이트 스페셜 게스트 리퀘스츠]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 8,
        koTitle: '차분한 음악으로 복잡한 머리를 식히다',
        enExpression: 'clear my head with calm music',
        dictTargetWord: 'calm',
        ipa: '/klɪr maɪ hed wɪð kɑːm ˈmjuː.zɪk/',
        pron: '[클리어 마이 헤드 위드 캄 뮤직]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 9,
        koTitle: '업데이트된 신규 시스템을 시행하다',
        enExpression: 'implement the updated system',
        dictTargetWord: 'implement',
        ipa: '/ˈɪm.plə.ment ðə ʌpˈdeɪ.t̬ɪd ˈsɪs.təm/',
        pron: '[임플러먼트 디 업데이티드 시스템]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://news.daum.net/',
      },
      {
        rank: 10,
        koTitle: '착용자의 실루엣을 돋보이게 보완하다',
        enExpression: 'complement the wearer’s silhouette',
        dictTargetWord: 'complement',
        ipa: '/ˈkɑːm.plə.ment ðə ˈwer.ɚz ˌsɪl.uˈet/',
        pron: '[캄플러먼트 더 웨어러즈 실루엣]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://news.daum.net/',
      },
    ],
  },
  {
    id: 'INSTA_TIKTOK',
    name: '인스타그램·틱톡 라이프스타일 표현 큐레이션',
    shortName: '🟣 인스타·틱톡',
    badgeColor: 'bg-pink-600 text-white',
    liveUrl: 'https://www.instagram.com/',
    sourceNote: 'SNS 일상·패션·여행 캡션 핵심 구어 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '오늘의 아웃핏을 자연스럽게 소화해 내다',
        enExpression: 'pull off today’s outfit effortlessly',
        dictTargetWord: 'outfit',
        ipa: '/pʊl ɔːf təˈdeɪz ˈaʊt.fɪt ˈef.ɚt.ləs.li/',
        pron: '[풀 오프 투데이즈 아웃핏 에포트리스리]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 2,
        koTitle: '하룻밤 사이에 릴스에서 큰 화제가 되다',
        enExpression: 'go viral on social media overnight',
        dictTargetWord: 'viral',
        ipa: '/ɡoʊ ˈvaɪ.rəl ɑːn ˈsoʊ.ʃəl ˈmiː.di.ə ˌoʊ.vɚˈnaɪt/',
        pron: '[고우 바이럴 안 소셜 미디어 오버나이트]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 3,
        koTitle: '주말마다 찾는 나만의 단골 브런치 카페에 가다',
        enExpression: 'visit my go-to brunch spot',
        dictTargetWord: 'brunch',
        ipa: '/ˈvɪz.ɪt maɪ ˈɡoʊ.tuː brʌntʃ spɑːt/',
        pron: '[비짓 마이 고우투 브런치 스팟]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 4,
        koTitle: '프런트 데스크에 가방을 먼저 맡기다',
        enExpression: 'drop off our bags at the front desk',
        dictTargetWord: 'luggage',
        ipa: '/drɑːp ɔːf ˈaʊ.ɚ bæɡz æt ðə frʌnt desk/',
        pron: '[드랍 오프 아워 백스 앳 더 프런트 데스크]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 5,
        koTitle: '데님 청바지와 정말 잘 어울리다',
        enExpression: 'go really well with denim jeans',
        dictTargetWord: 'denim',
        ipa: '/ɡoʊ ˈrɪə.li wel wɪð ˈden.ɪm dʒiːnz/',
        pron: '[고우 릴리 웰 위드 데님 진즈]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 6,
        koTitle: '아침 운동 루틴을 거르지 않고 꾸준히 지키다',
        enExpression: 'stick to my morning workout routine',
        dictTargetWord: 'routine',
        ipa: '/stɪk tə maɪ ˈmɔːr.nɪŋ ˈwɝːk.aʊt ruːˈtiːn/',
        pron: '[스틱 투 마이 모닝 워크아웃 루틴]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 7,
        koTitle: '팀 프로젝트를 성공적으로 마무리하다',
        enExpression: 'wrap up the project successfully',
        dictTargetWord: 'project',
        ipa: '/ræp ʌp ðə ˈprɑː.dʒekt səkˈses.fəl.i/',
        pron: '[래펍 더 프로젝트 석세스풀리]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 8,
        koTitle: '저녁 식사 전에 간단히 씻고 단장하다',
        enExpression: 'freshen up before dinner',
        dictTargetWord: 'refresh',
        ipa: '/ˈfreʃ.ən ʌp bɪˈfɔːr ˈdɪn.ɚ/',
        pron: '[프레셔넙 비포 디너]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 9,
        koTitle: '블레이저 재킷을 미디엄 사이즈로 입어보다',
        enExpression: 'try on the blazer in a medium size',
        dictTargetWord: 'blazer',
        ipa: '/traɪ ɑːn ðə ˈbleɪ.zɚ ɪn ə ˈmiː.di.əm saɪz/',
        pron: '[트라이 안 더 블레이저 이너 미디엄 사이즈]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.instagram.com/',
      },
      {
        rank: 10,
        koTitle: '소문난 핫플레이스가 기대만큼 훌륭하다',
        enExpression: 'definitely live up to the hype',
        dictTargetWord: 'hype',
        ipa: '/ˈdef.ə.nət.li lɪv ʌp tə ðə haɪp/',
        pron: '[데피니틀리 리법 투 더 하입]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.instagram.com/',
      },
    ],
  },
  {
    id: 'THREADS_X',
    name: '스레드(Threads) & X 실전 코멘트 표현',
    shortName: '⚫ 스레드·X',
    badgeColor: 'bg-slate-900 text-white',
    liveUrl: 'https://www.threads.net/',
    sourceNote: '짧은 의견 개진·공감·토론 핵심 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '모두가 공감할 만큼 정곡을 정확히 찌르다',
        enExpression: 'hit the nail on the head',
        dictTargetWord: 'exact',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 2,
        koTitle: '팀원들에게 변경 사항을 미리 귀띔해 주다',
        enExpression: 'give the team a quick heads-up',
        dictTargetWord: 'notice',
        ipa: '/ɡɪv ðə tiːm ə kwɪk ˈhedz.ʌp/',
        pron: '[기브 더 팀 어 퀵 헤즈업]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 3,
        koTitle: '복잡한 머리를 식히기 위해 산책하러 나가다',
        enExpression: 'go for a walk to clear my head',
        dictTargetWord: 'stroll',
        ipa: '/ɡoʊ fɔːr ə wɔːk tə klɪr maɪ hed/',
        pron: '[고우 포 러 워크 투 클리어 마이 헤드]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 4,
        koTitle: '모두의 이해와 방향성이 일치하는지 확인하다',
        enExpression: 'make sure everyone is on the same page',
        dictTargetWord: 'agreement',
        ipa: '/meɪk ʃʊr ˈev.ri.wʌn ɪz ɑːn ðə seɪm peɪdʒ/',
        pron: '[메익 슈어 에브리원 이즈 안 더 세임 페이지]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 5,
        koTitle: '글로벌 패션 트렌드를 주의 깊게 지켜보다',
        enExpression: 'keep an eye on fashion trends',
        dictTargetWord: 'trend',
        ipa: '/kiːp ən aɪ ɑːn ˈfæʃ.ən trendz/',
        pron: '[키퍼나이 안 패션 트렌즈]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 6,
        koTitle: '불필요한 보고 절차를 간소화하다',
        enExpression: 'streamline the reporting process',
        dictTargetWord: 'streamline',
        ipa: '/ˈstriːm.laɪn ðə rɪˈpɔːr.t̬ɪŋ ˈprɑː.ses/',
        pron: '[스트림라인 더 리포팅 프로세스]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 7,
        koTitle: '좋아하는 시리즈를 몰아서 정주행하다',
        enExpression: 'binge-watch my favorite series',
        dictTargetWord: 'series',
        ipa: '/ˈbɪndʒ.wɑːtʃ maɪ ˈfeɪ.vər.ɪt ˈsɪr.iːz/',
        pron: '[빈지워치 마이 페이버릿 시리즈]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 8,
        koTitle: '호텔에서 무료 조식을 즐기다',
        enExpression: 'have complimentary breakfast at the hotel',
        dictTargetWord: 'complimentary',
        ipa: '/hæv ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst æt ðə hoʊˈtel/',
        pron: '[해브 캄플러멘터리 브렉퍼스트 앳 더 호텔]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 9,
        koTitle: '미니멀한 코디에 과감한 포인트 아이템을 더하다',
        enExpression: 'add a bold statement piece',
        dictTargetWord: 'statement',
        ipa: '/æd ə boʊld ˈsteɪt.mənt piːs/',
        pron: '[애더 볼드 스테이트먼트 피스]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.threads.net/',
      },
      {
        rank: 10,
        koTitle: '퇴근 후 취미 활동으로 활력을 재충전하다',
        enExpression: 'recharge my batteries after work',
        dictTargetWord: 'recharge',
        ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz ˈæf.tɚ wɝːk/',
        pron: '[리차지 마이 배러리즈 애프터 워크]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://www.threads.net/',
      },
    ],
  },
  {
    id: 'DANAWA_KOVO',
    name: '테크 리뷰 & 스포츠 리포트 핵심 표현',
    shortName: '🏆 테크·스포츠',
    badgeColor: 'bg-indigo-600 text-white',
    liveUrl: 'https://www.danawa.com/',
    sourceNote: 'IT 기기 벤치마크·스포츠 중계 필수 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '성능 면에서 업계의 새로운 기준점을 세우다',
        enExpression: 'set a new benchmark in performance',
        dictTargetWord: 'benchmark',
        ipa: '/set ə nuː ˈbentʃ.mɑːrk ɪn pɚˈfɔːr.məns/',
        pron: '[세러 뉴 벤치마크 인 퍼포먼스]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 2,
        koTitle: '출시 전의 높은 기대치에 부응하다',
        enExpression: 'live up to the pre-launch hype',
        dictTargetWord: 'hype',
        ipa: '/lɪv ʌp tə ðə priː lɔːntʃ haɪp/',
        pron: '[리법 투 더 프리런치 하입]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 3,
        koTitle: '팀 프로젝트에서 중요한 이정표에 도달하다',
        enExpression: 'reach a major milestone',
        dictTargetWord: 'milestone',
        ipa: '/riːtʃ ə ˈmeɪ.dʒɚ ˈmaɪl.stoʊn/',
        pron: '[리치 어 메이저 마일스톤]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 4,
        koTitle: '경기 분석이 승부처의 핵심을 정확히 찌르다',
        enExpression: 'hit the nail on the head',
        dictTargetWord: 'analysis',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://kovo.co.kr/',
      },
      {
        rank: 5,
        koTitle: '비시즌 동안 체력 훈련 루틴을 꾸준히 유지하다',
        enExpression: 'stick to the training routine',
        dictTargetWord: 'training',
        ipa: '/stɪk tə ðə ˈtreɪ.nɪŋ ruːˈtiːn/',
        pron: '[스틱 투 더 트레이닝 루틴]',
        targetThemeId: 'theme-opic-routine',
        extUrl: 'https://kovo.co.kr/',
      },
      {
        rank: 6,
        koTitle: '원정 경기 이동을 위한 상세 일정표를 검토하다',
        enExpression: 'review the team travel itinerary',
        dictTargetWord: 'itinerary',
        ipa: '/rɪˈvjuː ðə tiːm ˈtræv.əl aɪˈtɪn.ə.rer.i/',
        pron: '[리뷰 더 팀 트래블 아이티너레리]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://kovo.co.kr/',
      },
      {
        rank: 7,
        koTitle: '기내 반입 수하물 규격 내에 꼭 맞다',
        enExpression: 'fit within the carry-on size limit',
        dictTargetWord: 'limit',
        ipa: '/fɪt wɪˈðɪn ðə ˈkær.i.ɑːn saɪz ˈlɪm.ɪt/',
        pron: '[핏 위딘 더 캐리안 사이즈 리밋]',
        targetThemeId: 'theme-travel-hotel',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 8,
        koTitle: '모든 하드웨어 세부 사양을 빈틈없이 비교하다',
        enExpression: 'compare specifications meticulously',
        dictTargetWord: 'specification',
        ipa: '/kəmˈper ˌspes.ə.fəˈkeɪ.ʃənz məˈtɪk.jə.ləs.li/',
        pron: '[컴페어 스페시피케이션즈 머티큘러슬리]',
        targetThemeId: 'theme-biz-meeting',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 9,
        koTitle: '기능성 스포츠웨어와 일상 스타일을 조화롭게 결합하다',
        enExpression: 'blend athletic function with daily style',
        dictTargetWord: 'athletic',
        ipa: '/blend æθˈlet̬.ɪk ˈfʌŋk.ʃən wɪð ˈdeɪ.li staɪl/',
        pron: '[블렌드 애쓸레틱 펑션 위드 데일리 스타일]',
        targetThemeId: 'theme-fashion-editorial',
        extUrl: 'https://www.danawa.com/',
      },
      {
        rank: 10,
        koTitle: '스포츠 팬들 사이에서 빠르게 입소문을 타다',
        enExpression: 'go viral among sports fans',
        dictTargetWord: 'viral',
        ipa: '/ɡoʊ ˈvaɪ.rəl əˈmʌŋ spɔːrts fænz/',
        pron: '[고우 바이럴 어멍 스포츠 팬즈]',
        targetThemeId: 'theme-youtube-viral',
        extUrl: 'https://kovo.co.kr/',
      },
    ],
  },
];
// ============================================================================
// src/App.tsx — [파트 2/4]
// - 필수 어휘 챌린지 (미국식 IPA · 한글발음 · 영영정의 검증 완료)
// - 테마 1 (비즈니스 회의) · 테마 2 (OPIc 일상 루틴) · 테마 3 (여행·호텔·공항)
// - 퀴즈 정답 인덱스(0, 1, 2, 3) 분산 배치 & stick to 전치사구 분석 기준 통일
// ============================================================================

export const NAVER_OFFICIAL_WORD_CHALLENGE = [
  {
    id: 'chal-1',
    word: 'intend',
    ipa: '/ɪnˈtend/',
    pron: '[인텐드]',
    pos: '동사 (V)',
    meaning: '의도하다, ~할 작정이다',
    enDef: 'to have a plan or purpose in mind to do something',
    exampleEn: 'We intend to launch the updated service next month.',
    examplePron: '[위 인텐드 투 런치 / 디 업데이티드 서비스 넥스트 먼쓰]',
    exampleKo: '우리는 다음 달에 업데이트된 서비스를 출시할 계획이다.',
  },
  {
    id: 'chal-2',
    word: 'lawless',
    ipa: '/ˈlɔː.ləs/',
    pron: '[로-리스]',
    pos: '형용사 (Adj)',
    meaning: '무법의, 법을 지키지 않는',
    enDef: 'not controlled by laws or rules; disorderly',
    exampleEn: 'Strict regulations prevented the market from becoming lawless.',
    examplePron: '[스트릭트 레귤레이션즈 프리벤티드 더 마켓 / 프롬 비커밍 로-리스]',
    exampleKo: '엄격한 규제가 시장이 무법 상태가 되는 것을 막아주었다.',
  },
  {
    id: 'chal-3',
    word: 'deliberate',
    ipa: '/dɪˈlɪb.ɚ.ət/',
    pron: '[딜리버릿]',
    pos: '형용사 (Adj)',
    meaning: '의도적인, 계획적인, 신중한',
    enDef: 'done consciously and intentionally rather than by accident',
    exampleEn: 'Mastering a language requires deliberate daily practice.',
    examplePron: '[마스터링 어 랭귀지 리콰이어즈 / 딜리버릿 데일리 프랙티스]',
    exampleKo: '언어를 마스터하는 것은 의도적인 매일의 연습을 필요로 한다.',
  },
  {
    id: 'chal-4',
    word: 'compromise',
    ipa: '/ˈkɑːm.prə.maɪz/',
    pron: '[캄프러마이즈]',
    pos: '명사/동사 (N/V)',
    meaning: '타협(하다), 절충안; (신뢰·안전을) 위태롭게 하다',
    enDef: 'an agreement reached by each side making concessions',
    exampleEn: 'Both teams reached a reasonable compromise after the meeting.',
    examplePron: '[보쓰 팀즈 리치드 어 리즈너블 캄프러마이즈 / 애프터 더 미팅]',
    exampleKo: '양 팀은 회의 끝에 합리적인 타협안에 도달했다.',
  },
  {
    id: 'chal-5',
    word: 'substantial',
    ipa: '/səbˈstæn.ʃəl/',
    pron: '[섭스탠셜]',
    pos: '형용사 (Adj)',
    meaning: '상당한, 실질적인, 꽤 많은',
    enDef: 'of considerable importance, size, or worth',
    exampleEn: 'The new workflow brought a substantial improvement in speed.',
    examplePron: '[더 뉴 워크플로우 브로트 / 어 섭스탠셜 임프루브먼트 인 스피드]',
    exampleKo: '새로운 업무 공정은 속도 면에서 상당한 개선을 가져왔다.',
  },
];

// ============================================================================
// 3. 테마별 초·중·고급 통합 커리큘럼 (테마 1 ~ 테마 3)
// ============================================================================

export const THEME_BIZ_MEETING: ThemeData = {
  id: 'theme-biz-meeting',
  badge: '💼 비즈니스·실무 핵심',
  title: '업무 효율화 & 프로젝트 일정 조율',
  subtitle: '회의 진행, 결재 독려, 잠정 일정 공유 및 부서 간 협업 표현',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (뼈대 어순 & 기본 의사소통)',
      focusBadge: '3형식 S + V + DO 기본 어순 체화',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 소리블록 끊어 읽기',
      levelGuide: '복잡한 수식어를 빼고 [주어 + 동사 + 목적어] 핵심 3단어 뼈대를 정확히 소리 내어 말합니다.',
      patternEn: 'We need to check the schedule today.',
      patternIpa: '/wi niːd tə tʃek ðə ˈskedʒ.uːl təˈdeɪ/',
      patternPron: '[위 니드 투 체크 / 더 스케줄 투데이]',
      patternSoundBlock: 'We need to check / the schedule / today.',
      patternSoundRule: 'need to에서 d가 약화되어 [니투]에 가깝게 발음되며, check와 the schedule을 한 호흡으로 연결합니다.',
      patternMeaningKo: '우리는 오늘 일정을 확인해야 합니다.',
      grammarSummary: '주어(We) + 본동사(need) + 목적어(to부정사구: to check the schedule) + 시간부사(today)로 이루어진 명확한 3형식 구조입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'check the schedule (일정을 확인하다)',
          upgradedExpr: 'review the tentative schedule (잠정 일정을 검토하다)',
          nuanceDiff: '단순 확인(check)에서 면밀한 검토(review)로 격식을 높인 표현입니다.',
        },
        {
          basicExpr: 'finish the meeting (회의를 끝내다)',
          upgradedExpr: 'wrap up the meeting (회의를 깔끔히 마무리하다)',
          nuanceDiff: '원어민 비즈니스 회의 말미에 가장 자연스럽게 쓰는 구동사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '팀장 (Manager)',
          en: "Let's check the project schedule before lunch.",
          soundBlock: "Let's check / the project schedule / before lunch.",
          pron: '[레츠 체크 / 더 프로젝트 스케줄 / 비포 런치]',
          ko: '점심 식사 전에 프로젝트 일정을 확인합시다.',
          pointNote: "권유 표현 Let's + 동사원형(check)",
        },
        {
          speaker: 'B',
          roleName: '팀원 (Member)',
          en: 'Sure, I will share a quick heads-up with the team.',
          soundBlock: 'Sure, / I will share / a quick heads-up / with the team.',
          pron: '[슈어, 아이 윌 쉐어 / 어 퀵 헤즈업 / 위드 더 팀]',
          ko: '네, 팀원들에게 미리 간단한 귀띔(사전 안내)을 공유하겠습니다.',
          pointNote: 'share A with B (B와 A를 공유하다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (실전 구동사 & 5형식 활용)',
      focusBadge: 'to부정사 목적어 & 5형식 목적격보어(OC)',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '실무에서 매일 쓰는 동사(streamline, expedite, touch base)를 소리블록 단위로 유창하게 연결합니다.',
      patternEn: 'We need to streamline the workflow this quarter.',
      patternIpa: '/wi niːd tə ˈstriːm.laɪn ðə ˈwɝːk.floʊ ðɪs ˈkwɔːr.t̬ɚ/',
      patternPron: '[위 니드 투 스트림라인 / 더 워크플로우 / 디스 쿼터]',
      patternSoundBlock: 'We need to streamline / the workflow / this quarter.',
      patternSoundRule: 'streamline[스트림라인]에 명확한 강세를 실어주고 this quarter[디스 쿼러]는 가볍게 마무리합니다.',
      patternMeaningKo: '우리는 이번 분기에 업무 공정을 간소화(효율화)해야 합니다.',
      grammarSummary: 'streamline은 불필요한 단계를 줄여 효율적으로 만들다라는 뜻의 타동사로, 뒤에 전치사 없이 바로 목적어(the workflow)가 옵니다.',
      paraphraseDrill: [
        {
          basicExpr: 'make the work simpler (업무를 더 단순하게 만들다)',
          upgradedExpr: 'streamline the entire workflow (전체 업무 공정을 효율화하다)',
          nuanceDiff: '보고서와 회의에서 전문성을 즉시 높여주는 핵심 비즈니스 동사입니다.',
        },
        {
          basicExpr: 'make the review faster (검토를 더 빠르게 하다)',
          upgradedExpr: 'expedite the approval process (승인 절차를 신속히 앞당기다)',
          nuanceDiff: '정중하게 빠른 처리를 요청할 때 쓰는 격식 있는 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '프로젝트 리더 (PL)',
          en: 'Could you please expedite the approval process for this contract?',
          soundBlock: 'Could you please expedite / the approval process / for this contract?',
          pron: '[쿠쥬 플리즈 엑스퍼다이트 / 디 어프루벌 프로세스 / 포 디스 컨트랙트]',
          ko: '이번 계약 건에 대한 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
          pointNote: '정중한 요청 Could you please + 동사원형(expedite)',
        },
        {
          speaker: 'B',
          roleName: '부서 매니저 (Director)',
          en: "Of course. Let's touch base again tomorrow morning.",
          soundBlock: "Of course. / Let's touch base again / tomorrow morning.",
          pron: '[오브 코스. 레츠 터치 베이스 어겐 / 투모로우 모닝]',
          ko: '물론이죠. 내일 아침에 다시 잠깐 연락해서 진행 상황을 공유합시다.',
          pointNote: 'touch base with ~ (~와 잠깐 연락해 현황을 점검하다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (동명사구 주어 & 조건·도치 구문)',
      focusBadge: '동명사구 주어 수일치 & 5형식 형용사 보어',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '동명사구 주어(Streamlining ~)와 5형식 목적격보어(feasible)를 결합해 논리적인 임원급 발언을 구사합니다.',
      patternEn: 'Streamlining the approval process makes the schedule feasible.',
      patternIpa: '/ˈstriːm.laɪ.nɪŋ ðə əˈpruː.vəl ˈprɑː.ses meɪks ðə ˈskedʒ.uːl ˈfiː.zə.bəl/',
      patternPron: '[스트림라이닝 디 어프루벌 프로세스 / 메익스 더 스케줄 피저블]',
      patternSoundBlock: 'Streamlining the approval process / makes the schedule / feasible.',
      patternSoundRule: '주어 덩어리(Streamlining the approval process) 끝에서 살짝 호흡을 고른 뒤 단수 동사 makes를 강하게 발음합니다.',
      patternMeaningKo: '승인 절차를 간소화하는 것은 그 일정을 실현 가능하게 만든다.',
      grammarSummary: '동명사구 주어(Streamlining ~)는 단수 취급하여 단수 동사 makes를 쓰며, 목적어(the schedule)의 상태를 설명하는 목적격보어(OC) 자리에는 부사(feasibly)가 아닌 형용사 feasible이 옵니다.',
      paraphraseDrill: [
        {
          basicExpr: 'give you early notice about the tentative schedule',
          upgradedExpr: 'give you a quick heads-up on the tentative itinerary',
          nuanceDiff: '실전 비즈니스 회화와 이메일에서 가장 자연스럽게 쓰이는 고급 연어 조합입니다.',
        },
        {
          basicExpr: 'check every detail very carefully',
          upgradedExpr: 'review every specification meticulously',
          nuanceDiff: 'very carefully를 부사 meticulously 한 단어로 압축해 정밀한 느낌을 줍니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '전략 기획 총괄 (VP)',
          en: 'Streamlining our reporting process makes the tentative launch schedule feasible.',
          soundBlock: 'Streamlining our reporting process / makes the tentative launch schedule / feasible.',
          pron: '[스트림라이닝 아워 리포팅 프로세스 / 메익스 더 텐터티브 런치 스케줄 / 피저블]',
          ko: '보고 절차를 간소화하는 것이 우리의 잠정 출시 일정을 실현 가능하게 만들어 줍니다.',
          pointNote: '5형식 makes + 목적어 + 형용사 보어(feasible)',
        },
        {
          speaker: 'B',
          roleName: '운영 디렉터 (Lead)',
          en: "I agree. Let's review the action items so that everyone is on the same page.",
          soundBlock: "I agree. / Let's review the action items / so that everyone is / on the same page.",
          pron: '[아이 어그리. 레츠 리뷰 디 액션 아이템즈 / 소 댓 에브리원 이즈 안 더 세임 페이지]',
          ko: '동의합니다. 모두가 같은 내용을 공유할 수 있도록 실행 과제를 함께 점검합시다.',
          pointNote: '목적 부사절 접속사 so that + 주어 + 동사 (~하도록)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '업무 절차 개선·효율화 강도 (동사구)',
      scaleAxisLabel: '단순 정리 ➔ 공정 효율화 ➔ 전면 개편',
      weak: {
        expr: 'organize the tasks',
        pron: '[오거나이즈 더 태스크스]',
        ko: '업무를 정리하다',
        note: '일상적인 할 일 목록을 정돈할 때 쓰는 기본 표현',
      },
      medium: {
        expr: 'streamline the workflow',
        pron: '[스트림라인 더 워크플로우]',
        ko: '업무 공정을 간소화·효율화하다',
        note: '불필요한 절차를 줄여 속도와 능률을 높이는 실무 표준 표현',
      },
      strong: {
        expr: 'overhaul the entire system',
        pron: '[오버홀 디 인타이어 시스템]',
        ko: '전체 시스템을 전면 개편하다',
        note: '기존 체계를 뿌리부터 완전히 뜯어고칠 때 쓰는 강한 표현',
      },
    },
    {
      conceptTitle: '일정 및 계획의 확정성 정도 (형용사)',
      scaleAxisLabel: '초안 상태 ➔ 잠정 가안 ➔ 최종 확정',
      weak: {
        expr: 'rough (draft)',
        pron: '[러프 드래프트]',
        ko: '대략적인 (초안의)',
        note: '세부 내용이 아직 잡히지 않은 초기 단계',
      },
      medium: {
        expr: 'tentative (schedule)',
        pron: '[텐터티브 스케줄]',
        ko: '잠정적인 (일정)',
        note: '일단은 잡아두었으나 추후 변경될 수 있는 비즈니스 가안',
      },
      strong: {
        expr: 'finalized (itinerary)',
        pron: '[파이널라이즈드 아이티너레리]',
        ko: '최종 확정된 (일정표)',
        note: '모든 승인을 마치고 변경 없이 실행되는 확정 단계',
      },
    },
  ],
  vocab: [
    {
      id: 101,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'wrap up',
      masked: 'w___ u_',
      ipa: '/ræp ʌp/',
      pron: '[래펍]',
      soundMethod: 'wrap의 끝 자음 /p/와 up이 연음되어 [래펍]으로 한 단어처럼 발음됩니다.',
      soundBlock: 'wrap up / the meeting',
      meaning: '(회의·업무 등을) 마무리하다, 끝내다',
      enDef: 'to bring a meeting, task, or agreement to a successful conclusion',
      exampleBlank: "Let's _____ today's meeting in five minutes.",
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: "Let's 뒤에서 문장의 본동사(서술어) 역할을 수행합니다.",
      collocation: 'wrap up the meeting',
      collocationKo: '회의를 마무리하다',
      paraphraseTip: 'finish the meeting보다 훨씬 자연스럽고 정중한 비즈니스 마무리 표현입니다.',
    },
    {
      id: 102,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'heads-up',
      masked: 'h____-u_',
      ipa: '/ˈhedz.ʌp/',
      pron: '[헤즈업]',
      soundMethod: 'heads의 /z/와 up이 이어져 [헤즈업]으로 부드럽게 발음됩니다.',
      soundBlock: 'give me / a quick heads-up',
      meaning: '사전 귀띔, 미리 알림',
      enDef: 'an advance warning or piece of information given before something happens',
      exampleBlank: 'Thanks for giving me a quick _____ on the change.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '4형식 동명사 giving의 직접목적어(DO) 자리에 쓰인 가산명사입니다.',
      collocation: 'give a quick heads-up',
      collocationKo: '미리 살짝 귀띔해 주다',
      paraphraseTip: 'advance notice(사전 통지)를 친근하고 간결하게 표현할 때 씁니다.',
    },
    {
      id: 103,
      type: '비즈니스',
      recommendLevel: 'intermediate',
      word: 'streamline',
      masked: 'str_______',
      ipa: '/ˈstriːm.laɪn/',
      pron: '[스트림라인]',
      soundMethod: '첫 음절(stream-)을 길게 빼며 [스트림라인]으로 발음합니다.',
      soundBlock: 'streamline / the workflow',
      meaning: '(업무·절차를) 간소화하다, 효율화하다',
      enDef: 'to make an organization or system more efficient by employing faster or simpler working methods',
      exampleBlank: 'We need to _____ the entire workflow this quarter.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '목적어(the entire workflow)를 취해 효율화 동작을 나타내는 타동사입니다.',
      collocation: 'streamline the workflow',
      collocationKo: '업무 공정을 효율화하다',
      paraphraseTip: 'simplify(단순화하다)보다 능률과 속도를 높인다는 전문적 뉘앙스가 강합니다.',
    },
    {
      id: 104,
      type: '비즈니스',
      recommendLevel: 'intermediate',
      word: 'expedite',
      masked: 'ex______',
      ipa: '/ˈek.spə.daɪt/',
      pron: '[엑스퍼다이트]',
      soundMethod: '첫 음절(ex-)에 강세를 두고 끝음절(-dite)은 [다이트]로 발음합니다.',
      soundBlock: 'expedite / the approval process',
      meaning: '(절차·처리를) 신속히 처리하다, 앞당기다',
      enDef: 'to make an action or process happen sooner or be accomplished more quickly',
      exampleBlank: 'Could you please _____ the approval process?',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Could와 결합해 정중한 요청문의 본동사(V) 역할을 합니다.',
      collocation: 'expedite the process',
      collocationKo: '절차를 신속히 앞당기다',
      paraphraseTip: 'speed up의 격식 있는 비즈니스 상위 표현입니다.',
    },
    {
      id: 105,
      type: '비즈니스',
      recommendLevel: 'intermediate',
      word: 'tentative',
      masked: 'ten______',
      ipa: '/ˈten.tə.t̬ɪv/',
      pron: '[텐터티브]',
      soundMethod: '첫 음절(ten-)에 강세를 두어 미국식으로 부드럽게 [텐터티브]로 읽습니다.',
      soundBlock: 'a tentative / schedule',
      meaning: '잠정적인, 가안의, 확정되지 않은',
      enDef: 'not certain or fixed; provisional and subject to change',
      exampleBlank: 'We have set a _____ schedule for the launch.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 schedule 앞에서 명사의 성질을 꾸며주는 한정적 수식어(M)입니다.',
      collocation: 'a tentative schedule',
      collocationKo: '잠정적인 일정',
      paraphraseTip: 'provisional(임시의)과 유사하며, 반대말은 confirmed(확정된)입니다.',
    },
    {
      id: 106,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'feasible',
      masked: 'fea_____',
      ipa: '/ˈfiː.zə.bəl/',
      pron: '[피저블]',
      soundMethod: '첫 음절(fea-)에 강세를 두고 s는 유성음 /z/[저]로 발음합니다.',
      soundBlock: 'make the schedule / feasible',
      meaning: '실현 가능한, 실행할 수 있는',
      enDef: 'possible to do easily or conveniently; achievable in practice',
      exampleBlank: 'Streamlining the process makes the schedule _____.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'OC',
      compLabel: '목적격보어 (OC)',
      roleDesc: '5형식 동사 makes 뒤에서 목적어(the schedule)의 상태를 보충 설명하는 목적격보어(OC)입니다.',
      collocation: 'economically feasible',
      collocationKo: '경제적으로 실현 가능한',
      paraphraseTip: '단순히 확률상 가능한(possible) 것을 넘어 실무적으로 실행 가능한(viable, achievable) 상태를 뜻합니다.',
    },
    {
      id: 107,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'meticulously',
      masked: 'met_________',
      ipa: '/məˈtɪk.jə.ləs.li/',
      pron: '[머티큘러슬리]',
      soundMethod: '두 번째 음절(-tic-)에 강한 강세를 두어 [머티큘러슬리]로 발음합니다.',
      soundBlock: 'reviewed / meticulously',
      meaning: '꼼꼼하게, 세심하게, 빈틈없이',
      enDef: 'in a way that shows great attention to detail; very thoroughly',
      exampleBlank: 'Our team _____ checked every single clause.',
      pos: 'Adv',
      posLabel: '부사 (Adv)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '동사 checked를 앞에서 수식하여 동작의 방식을 설명하는 부사 수식어(M)입니다.',
      collocation: 'review meticulously',
      collocationKo: '빈틈없이 검토하다',
      paraphraseTip: 'carefully나 thoroughly보다 훨씬 더 정밀하고 세심한 주의를 기울일 때 씁니다.',
    },
  ],
  sentences: [
    {
      id: 1001,
      levelTag: 'beginner',
      tag: '초급 필수 · 4형식 사전 공유',
      targetWord: 'heads-up',
      wordOrderFormula: 'Thanks[M] + for giving[M] + me[IO] + a quick heads-up[DO] + on the schedule[M]',
      structure: '전치사구 + 4형식 동명사구(giving + IO + DO)',
      soundBlockEn: 'Thanks for giving me / a quick heads-up / on the schedule.',
      soundMethodGuide: 'giving me[기빙 미] 뒤에 a quick heads-up[어 퀵 헤즈업]을 한 덩어리로 경쾌하게 붙여 읽습니다.',
      ipaLine: '/θæŋks fɔːr ˈɡɪv.ɪŋ mi ə kwɪk ˈhedz.ʌp ɑːn ðə ˈskedʒ.uːl/',
      koLine: '나에게 주셔서 감사합니다 / 빠른 사전 귀띔을 / 일정에 관한.',
      enLine: 'Thanks for giving me / a quick heads-up / on the schedule.',
      rawEn: 'Thanks for giving me a quick heads-up on the schedule.',
      pronLine: '[땡스 포 기빙 미 / 어 퀵 헤즈업 / 안 더 스케줄]',
      naturalKo: '일정에 대해 미리 귀띔해 주셔서 감사합니다.',
      paraphraseVersion: 'Thank you for letting me know in advance about the schedule.',
      grammarPoint: '수여동사 give에서 파생된 동명사 giving이 간접목적어(me)와 직접목적어(a quick heads-up)를 차례대로 이끌고 있습니다.',
      contextNuance: '동료가 회의 시간 변경이나 중요 이슈를 미리 알려주었을 때 가볍고 세련되게 고마움을 표하는 표현입니다.',
    },
    {
      id: 1002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 절차 신속 처리 요청',
      targetWord: 'expedite',
      wordOrderFormula: 'Could you please[조동사+S+M] + expedite[V] + the approval process[DO] + before Friday[M]?',
      structure: '3형식 정중한 의문문 (Could + S + V + DO + M)',
      soundBlockEn: 'Could you please expedite / the approval process / before Friday?',
      soundMethodGuide: 'Could you는 [쿠쥬]로 연음하고 expedite[엑스퍼다이트]에 강세를 실어 정중하게 올림조로 발음합니다.',
      ipaLine: '/kʊd ju pliːz ˈek.spə.daɪt ðə əˈpruː.vəl ˈprɑː.ses bɪˈfɔːr ˈfraɪ.deɪ/',
      koLine: '신속히 처리해 주실 수 있나요 / 승인 절차를 / 금요일 전까지?',
      enLine: 'Could you please expedite / the approval process / before Friday?',
      rawEn: 'Could you please expedite the approval process before Friday?',
      pronLine: '[쿠쥬 플리즈 엑스퍼다이트 / 디 어프루벌 프로세스 / 비포 프라이데이]',
      naturalKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
      paraphraseVersion: 'Would it be possible to speed up the approval process before Friday?',
      grammarPoint: 'approval process에서 approval은 명사(N)이지만 뒤 명사 process를 앞에서 꾸미는 복합명사 수식어(M) 역할을 수행합니다.',
      contextNuance: '타 부서나 상사에게 결재·검토를 빠르게 부탁할 때 가장 격식 있고 효과적인 문장입니다.',
    },
    {
      id: 1003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 동명사구 주어 & 5형식 보어',
      targetWord: 'feasible',
      wordOrderFormula: 'Streamlining the workflow[S:동명사구] + makes[V] + the tentative schedule[DO] + feasible[OC].',
      structure: '5형식 (동명사구 S + 단수 V + DO + 형용사 OC)',
      soundBlockEn: 'Streamlining the workflow / makes the tentative schedule / feasible.',
      soundMethodGuide: '동명사구 주어 끝(workflow)에서 살짝 끊어 읽고, makes와 마지막 보어 feasible[피저블]을 명확히 강조합니다.',
      ipaLine: '/ˈstriːm.laɪ.nɪŋ ðə ˈwɝːk.floʊ meɪks ðə ˈten.tə.t̬ɪv ˈskedʒ.uːl ˈfiː.zə.bəl/',
      koLine: '업무 공정을 간소화하는 것은 / 잠정 일정을 만든다 / 실현 가능한 상태로.',
      enLine: 'Streamlining the workflow / makes the tentative schedule / feasible.',
      rawEn: 'Streamlining the workflow makes the tentative schedule feasible.',
      pronLine: '[스트림라이닝 더 워크플로우 / 메익스 더 텐터티브 스케줄 / 피저블]',
      naturalKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      paraphraseVersion: 'If we streamline the workflow, the tentative schedule becomes achievable.',
      grammarPoint: '주어 핵이 동명사(Streamlining)이므로 단수 동사 makes를 쓰며, 목적격보어(OC) 자리에는 부사 feasibly가 아닌 형용사 feasible이 와야 합니다.',
      contextNuance: '단순히 일정이 어렵다고 말하기보다 해결책(공정 간소화)과 결과(실현 가능성)를 한 문장으로 제시하는 고급 구문입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'wrap up',
      ipa: '/ræp ʌp/',
      options: [
        '새 프로젝트를 기획하다',
        '예산을 추가로 배정하다',
        '(회의·업무 등을) 마무리하다, 끝내다',
        '출장 일정을 연기하다',
      ],
      answerIdx: 2,
      explanation: 'wrap up은 회의나 업무를 깔끔하게 마무리하다(bring to a close)라는 뜻의 필수 구동사입니다.',
    },
    intermediate: {
      sentenceBefore: 'We need to',
      sentenceAfter: 'the entire workflow to save time this quarter.',
      hint: '(업무 공정을) 간소화하다, 효율화하다',
      options: ['hesitate', 'streamline', 'complicate', 'postpone'],
      answerIdx: 1,
      explanation: '시간을 절약하기 위해 전체 업무 공정(workflow)의 불필요한 단계를 줄여 효율화한다는 맥락이므로 streamline이 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법상 올바른 형태를 2개 고르세요: "[ (A) ] the process makes the tentative schedule [ (B) ]."',
      highlightWord: '동명사구 주어 단수 수일치 & 5형식 목적격보어(OC) 형용사',
      options: [
        '(A) Streamlining (동명사구 주어)',
        '(A) Streamlined (과거분사)',
        '(B) feasible (목적격보어 형용사)',
        '(B) feasibly (부사 — 보어 불가)',
      ],
      answerIndices: [0, 2],
      explanation:
        '(A) 뒤에 목적어(the process)를 취해 문장의 주어 역할을 해야 하므로 능동형 동명사 Streamlining이 맞고, (B) 5형식 동사 makes의 목적격보어(OC) 자리이므로 형용사 feasible이 정답입니다.',
    },
    writingMission: {
      koPrompt: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      targetPattern: 'Streamlining ~ makes ... feasible',
      modelAnswer: 'Streamlining the workflow makes the tentative schedule feasible.',
    },
  },
};

export const THEME_OPIC_ROUTINE: ThemeData = {
  id: 'theme-opic-routine',
  badge: '🎧 OPIc AL · 일상 루틴',
  title: '퇴근 후 힐링 산책 & 주말 단골 카페 루틴',
  subtitle: '스트레스 해소, 에너지 재충전, 나만의 단골 장소 및 습관 묘사',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (일상 빈도부사 & 습관 말하기)',
      focusBadge: '주어(I) + 빈도부사 + 현재시제 동사',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 또렷하게 발음',
      levelGuide: '일상 습관을 나타낼 때는 현재시제를 쓰며, 빈도부사(usually, always)를 일반동사 앞에 배치합니다.',
      patternEn: 'I usually unwind after work with a walk.',
      patternIpa: '/aɪ ˈjuː.ʒu.ə.li ʌnˈwaɪnd ˈæf.tɚ wɝːk wɪð ə wɔːk/',
      patternPron: '[아이 유주얼리 언와인드 / 애프터 워크 / 위더 워크]',
      patternSoundBlock: 'I usually unwind / after work / with a walk.',
      patternSoundRule: 'unwind는 [언윈드]가 아니라 [언와인드]로 발음하며, with a walk는 [위더 워크]로 부드럽게 이어 읽습니다.',
      patternMeaningKo: '나는 보통 산책을 하며 퇴근 후 긴장을 풉니다.',
      grammarSummary: '주어(I) + 빈도부사(usually) + 자동사(unwind) + 부사구(after work / with a walk)로 이루어진 1형식 일상 묘사 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'rest after work (퇴근 후 쉬다)',
          upgradedExpr: 'unwind after work (퇴근 후 긴장을 풀며 휴식하다)',
          nuanceDiff: '단순히 멈춰 쉬는 것을 넘어 하루 동안 쌓인 긴장감을 풀 때 쓰는 원어민 표현입니다.',
        },
        {
          basicExpr: 'my favorite cafe (내가 좋아하는 카페)',
          upgradedExpr: 'my go-to cafe (내가 늘 믿고 찾는 단골 카페)',
          nuanceDiff: 'OPIc에서 단골 장소나 선호 아이템을 말할 때 점수를 높여주는 핵심 형용사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '질문자 (Interviewer)',
          en: 'How do you usually relax after a busy day at work?',
          soundBlock: 'How do you usually relax / after a busy day / at work?',
          pron: '[하우 두 유 유주얼리 릴랙스 / 애프터 러 비지 데이 앳 워크]',
          ko: '바쁜 하루 일과를 마친 뒤에는 보통 어떻게 휴식을 취하시나요?',
          pointNote: '일상 루틴 질문 How do you usually + 동사원형',
        },
        {
          speaker: 'B',
          roleName: '응시자 (Speaker)',
          en: 'I usually unwind after work by walking in the neighborhood park.',
          soundBlock: 'I usually unwind after work / by walking / in the neighborhood park.',
          pron: '[아이 유주얼리 언와인드 애프터 워크 / 바이 워킹 / 인 더 네이버후드 파크]',
          ko: '저는 보통 동네 공원을 산책하면서 퇴근 후 긴장을 풉니다.',
          pointNote: '수단·방법 전치사구 by + 동명사(walking)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (전치사구 결합 구동사 & 목적 to부정사)',
      focusBadge: 'stick + 전치사구(to + 명사구) & 목적의 to부정사',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '내가 왜 그 루틴을 하는지(to clear my head) 이유와 꾸준함(stick to)을 자연스럽게 덧붙입니다.',
      patternEn: 'I always stick to my daily workout routine to clear my head.',
      patternIpa: '/aɪ ˈɔːl.weɪz stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn tə klɪr maɪ hed/',
      patternPron: '[아이 올웨이즈 스틱 투 / 마이 데일리 워크아웃 루틴 / 투 클리어 마이 헤드]',
      patternSoundBlock: 'I always stick to / my daily workout routine / to clear my head.',
      patternSoundRule: 'stick to는 전치사구와 연결해 끊지 않고 읽으며, 뒤의 to clear my head에서 목적 의미를 살려줍니다.',
      patternMeaningKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킵니다.',
      grammarSummary: 'stick(자동사 V) 뒤에 전치사 to가 이끄는 전치사구(to my daily workout routine: 전치사 목적어 구문 M)가 결합하고, 뒤의 to clear는 목적(~하기 위해)을 나타내는 부사적 to부정사구(M)입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'keep my exercise plan (운동 계획을 지키다)',
          upgradedExpr: 'stick to my workout routine (운동 루틴을 흔들림 없이 고수하다)',
          nuanceDiff: '작심삼일로 끝나지 않고 꾸준히 지킨다는 어감을 생생하게 전달합니다.',
        },
        {
          basicExpr: 'forget stress (스트레스를 잊다)',
          upgradedExpr: 'clear my head (복잡한 머리를 맑게 식히다)',
          nuanceDiff: '산책·운동·음악 감상의 효과를 설명할 때 가장 자연스러운 구어 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '동료 (Colleague)',
          en: 'You look really energetic these days. What is your secret?',
          soundBlock: 'You look really energetic / these days. / What is your secret?',
          pron: '[유 룩 릴리 에너제틱 디즈 데이즈. 왓 이즈 유어 시크릿]',
          ko: '요즘 정말 활기차 보이시네요. 비결이 뭔가요?',
          pointNote: '2형식 감각동사 look + 형용사 보어(energetic)',
        },
        {
          speaker: 'B',
          roleName: '나 (Speaker)',
          en: 'I stick to my morning jogging routine, and it helps me clear my head.',
          soundBlock: 'I stick to my morning jogging routine, / and it helps me / clear my head.',
          pron: '[아이 스틱 투 마이 모닝 조깅 루틴 / 앤 잇 헬프스 미 클리어 마이 헤드]',
          ko: '아침 조깅 루틴을 꾸준히 지키고 있는데, 복잡한 머리를 식히는 데 큰 도움이 돼요.',
          pointNote: '5형식 helps + 목적어(me) + 원형부정사 보어(clear)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (감각적 이유 설명 & 관점 확장)',
      focusBadge: '전치사 + 동명사(by V-ing) & 병렬 구조',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '주말 루틴이 내 삶에 주는 긍정적 영향(recharge my batteries, broaden my perspective)을 입체적으로 연결합니다.',
      patternEn: 'I recharge my batteries on weekends by reading at my go-to cafe.',
      patternIpa: '/aɪ riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz ɑːn ˈwiːk.endz baɪ ˈriː.dɪŋ æt maɪ ˈɡoʊ.tuː kæˈfeɪ/',
      patternPron: '[아이 리차지 마이 배러리즈 안 위켄즈 / 바이 리딩 앳 마이 고우투 카페]',
      patternSoundBlock: 'I recharge my batteries / on weekends / by reading / at my go-to cafe.',
      patternSoundRule: 'batteries의 tt를 미국식 플랩 사운드 [배러리즈]로 부드럽게 발음하고 전치사구마다 리듬을 나누어 읽습니다.',
      patternMeaningKo: '나는 주말마다 단골 카페에서 책을 읽으며 에너지를 재충전합니다.',
      grammarSummary: '주절(I recharge my batteries on weekends) 뒤에 수단을 나타내는 전치사구(by + 동명사 reading)와 장소 전치사구(at my go-to cafe)가 결합된 완성도 높은 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'get energy again (에너지를 다시 얻다)',
          upgradedExpr: 'recharge my batteries (방전된 활력을 완전히 재충전하다)',
          nuanceDiff: '비유적 관용 표현을 사용해 OPIc AL 등급에서 요구하는 어휘 다양성을 보여줍니다.',
        },
        {
          basicExpr: 'learn many new things (새로운 것을 많이 배우다)',
          upgradedExpr: 'broaden my perspective on life (삶에 대한 시야와 관점을 넓히다)',
          nuanceDiff: '독서·여행·대화 주제의 결론 문장으로 활용하기 좋은 고급 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '질문자 (Interviewer)',
          en: 'Tell me about your favorite place to spend time on weekends.',
          soundBlock: 'Tell me about / your favorite place / to spend time / on weekends.',
          pron: '[텔 미 어바웃 / 유어 페이버릿 플레이스 / 투 스펜드 타임 안 위켄즈]',
          ko: '주말에 시간을 보내기 좋아하는 당신만의 장소에 대해 말씀해 주세요.',
          pointNote: '명사(place)를 뒤에서 수식하는 형용사적 용법의 to부정사(to spend time)',
        },
        {
          speaker: 'B',
          roleName: '응시자 (Speaker)',
          en: 'This quiet neighborhood cafe is my go-to spot where I recharge my batteries.',
          soundBlock: 'This quiet neighborhood cafe / is my go-to spot / where I recharge my batteries.',
          pron: '[디스 콰이엇 네이버후드 카페 / 이즈 마이 고우투 스팟 / 웨어 아이 리차지 마이 배러리즈]',
          ko: '이 조용한 동네 카페는 제가 에너지를 재충전하는 단골 장소입니다.',
          pointNote: '장소 선행사(my go-to spot)를 수식하는 관계부사 where절',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '휴식 및 에너지 회복의 깊이 (동사구)',
      scaleAxisLabel: '잠깐 숨 돌리기 ➔ 긴장 해소 ➔ 완전한 활력 충전',
      weak: {
        expr: 'take a quick breather',
        pron: '[테이커 퀵 브리더]',
        ko: '잠깐 숨을 돌리다',
        note: '업무나 공부 중간에 5~10분 정도 짧게 쉬어갈 때',
      },
      medium: {
        expr: 'unwind after work',
        pron: '[언와인드 애프터 워크]',
        ko: '퇴근 후 긴장을 풀다',
        note: '하루 일과를 마치고 산책이나 취미로 긴장감을 내려놓을 때',
      },
      strong: {
        expr: 'recharge my batteries',
        pron: '[리차지 마이 배러리즈]',
        ko: '에너지를 완전히 재충전하다',
        note: '주말이나 휴가를 통해 소진된 체력과 마음의 활력을 가득 채울 때',
      },
    },
    {
      conceptTitle: '장소·습관에 대한 선호도와 방문 빈도 (형용사 수식어)',
      scaleAxisLabel: '가끔 들르는 ➔ 자주 찾는 ➔ 무조건 믿고 가는 단골',
      weak: {
        expr: 'a casual spot',
        pron: '[어 캐주얼 스팟]',
        ko: '부담 없이 들르는 곳',
        note: '격식 없이 가볍게 방문하는 장소',
      },
      medium: {
        expr: 'a regular hangout',
        pron: '[어 레귤러 행아웃]',
        ko: '자주 모이는 단골 아지트',
        note: '친구들이나 동료들과 주기적으로 어울리는 장소',
      },
      strong: {
        expr: 'my go-to spot',
        pron: '[마이 고우투 스팟]',
        ko: '늘 믿고 찾는 최애 단골 장소',
        note: '고민할 필요 없이 가장 먼저 떠오르고 선택하는 최고의 장소',
      },
    },
  ],
  vocab: [
    {
      id: 201,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'unwind',
      masked: 'un____',
      ipa: '/ʌnˈwaɪnd/',
      pron: '[언와인드]',
      soundMethod: 'wind(감다 /waɪnd/)의 반대말이므로 [언윈드]가 아닌 [언와인드]로 발음합니다.',
      soundBlock: 'unwind / after work',
      meaning: '긴장을 풀다, 휴식을 취하다',
      enDef: 'to relax and allow your mind to be free from worry after a period of work',
      exampleBlank: 'I usually _____ after work by taking a walk.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(I)의 휴식 동작을 서술하는 본동사(V)입니다.',
      collocation: 'unwind after a long day',
      collocationKo: '긴 하루 끝에 긴장을 풀다',
      paraphraseTip: 'relax보다 하루의 피로와 긴장(tension)을 스르르 풀어낸다는 생생한 어감이 있습니다.',
    },
    {
      id: 202,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'go-to',
      masked: 'g_-t_',
      ipa: '/ˈɡoʊ.tuː/',
      pron: '[고우투]',
      soundMethod: '첫 음절(go-)에 강세를 두고 명사 앞에서 붙여 읽습니다.',
      soundBlock: 'my go-to / coffee shop',
      meaning: '늘 믿고 찾는, 단골의, 가장 선호하는',
      enDef: 'regularly chosen or relied upon as the best option in a particular situation',
      exampleBlank: 'This quiet cafe is my _____ spot on weekends.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 spot 앞에서 어떤 장소인지를 꾸며주는 한정적 수식어(M)입니다.',
      collocation: 'my go-to cafe',
      collocationKo: '내가 늘 찾는 단골 카페',
      paraphraseTip: 'my favorite보다 실제 생활에서 늘 선택한다는 실용적인 뉘앙스를 줍니다.',
    },
    {
      id: 203,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'stick to',
      masked: 'st___ t_',
      ipa: '/stɪk tuː/',
      pron: '[스틱 투]',
      soundMethod: 'stick과 전치사 to를 끊지 않고 [스틱투]로 이어 발음합니다.',
      soundBlock: 'stick to / my routine',
      meaning: '(계획·원칙·루틴을) 바꾸지 않고 지키다, 고수하다',
      enDef: 'to continue doing or using something and not change to anything else',
      exampleBlank: 'I always _____ my daily workout routine.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '자동사 stick(V)과 전치사 to가 결합해 뒤에 전치사의 목적어(명사구·동명사구, M)를 이끕니다.',
      collocation: 'stick to a routine',
      collocationKo: '루틴을 꾸준히 지키다',
      paraphraseTip: '전치사 to가 반드시 필요하며(stick my routine [X]), 유혹에 흔들리지 않고 끝까지 고수한다는 뜻이 강합니다.',
    },
    {
      id: 204,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'clear my head',
      masked: 'cl___ my h___',
      ipa: '/klɪr maɪ hed/',
      pron: '[클리어 마이 헤드]',
      soundMethod: 'clear[클리어]와 head[헤드]에 강세를 두어 발음합니다.',
      soundBlock: 'clear / my head',
      meaning: '복잡한 머리를 식히다, 생각을 정리하다',
      enDef: 'to free your mind from worry, confusion, or mental fatigue',
      exampleBlank: 'I take an evening walk to _____.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사구 (V)',
      roleDesc: '목적을 나타내는 to부정사구(to clear my head)를 이루는 핵심 동사구입니다.',
      collocation: 'take a walk to clear my head',
      collocationKo: '머리를 식히기 위해 산책하다',
      paraphraseTip: 'refresh my mind와 같은 뜻으로 일상 회화에서 훨씬 자주 쓰입니다.',
    },
    {
      id: 205,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'grab a bite',
      masked: 'gr__ a b___',
      ipa: '/ɡræb ə baɪt/',
      pron: '[그래버 바이트]',
      soundMethod: 'grab과 a가 연음되어 [그래버 바이트]로 경쾌하게 소리 납니다.',
      soundBlock: 'grab a bite / before the movie',
      meaning: '간단히 요기하다, 가볍게 식사하다',
      enDef: 'to get something quick and casual to eat',
      exampleBlank: "Let's _____ at the bakery before the movie.",
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: "권유문 Let's 뒤에서 서술어(V) 역할을 하는 관용 동사구입니다.",
      collocation: 'grab a quick bite',
      collocationKo: '간단히 빨리 식사하다',
      paraphraseTip: 'eat food보다 훨씬 원어민다운 자연스러운 약속 표현입니다.',
    },
    {
      id: 206,
      type: '오픽·구동사',
      recommendLevel: 'advanced',
      word: 'recharge my batteries',
      masked: 're______ my b________',
      ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz/',
      pron: '[리차지 마이 배러리즈]',
      soundMethod: '미국식 발음에서 batteries는 플랩 현상으로 [배러리즈]로 부드럽게 발음합니다.',
      soundBlock: 'recharge / my batteries',
      meaning: '에너지를 재충전하다, 활력을 되찾다',
      enDef: 'to rest and relax for a period of time so that you feel energetic again',
      exampleBlank: 'I _____ on weekends by listening to jazz.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(I)의 서술어(V) 역할을 하는 관용 동사구입니다.',
      collocation: 'recharge my batteries on weekends',
      collocationKo: '주말에 에너지를 재충전하다',
      paraphraseTip: 'regain my energy를 생동감 있게 표현한 고득점 이디엄입니다.',
    },
    {
      id: 207,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'perspective',
      masked: 'per________',
      ipa: '/pɚˈspek.tɪv/',
      pron: '[퍼스펙티브]',
      soundMethod: '두 번째 음절(-spec-)에 강세를 두어 [퍼스펙티브]로 발음합니다.',
      soundBlock: 'broaden / our perspective',
      meaning: '관점, 시각, 세상을 보는 눈',
      enDef: 'a particular attitude toward or way of regarding something; a point of view',
      exampleBlank: 'Reading diverse books broadens our _____ on life.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 broadens의 직접목적어(DO) 역할을 하는 추상명사입니다.',
      collocation: 'broaden our perspective',
      collocationKo: '시야(관점)를 넓히다',
      paraphraseTip: 'viewpoint, outlook과 바꿔 쓸 수 있는 핵심 어휘입니다.',
    },
  ],
  sentences: [
    {
      id: 2001,
      levelTag: 'beginner',
      tag: '초급 필수 · 단골 장소 소개',
      targetWord: 'go-to',
      wordOrderFormula: 'This quiet cafe[S] + is[V] + my go-to spot[SC] + on weekends[M].',
      structure: '2형식 (S + be동사 V + 명사구 보어 SC + 시간 전치사구 M)',
      soundBlockEn: 'This quiet cafe / is my go-to spot / on weekends.',
      soundMethodGuide: 'is my go-to spot[이즈 마이 고우투 스팟]을 한 호흡으로 묶어 명쾌하게 발음합니다.',
      ipaLine: '/ðɪs ˈkwaɪ.ət kæˈfeɪ ɪz maɪ ˈɡoʊ.tuː spɑːt ɑːn ˈwiːk.endz/',
      koLine: '이 조용한 카페는 / 나의 단골 장소이다 / 주말마다 찾는.',
      enLine: 'This quiet cafe / is my go-to spot / on weekends.',
      rawEn: 'This quiet cafe is my go-to spot on weekends.',
      pronLine: '[디스 콰이엇 카페 / 이즈 마이 고우투 스팟 / 안 위켄즈]',
      naturalKo: '이 조용한 카페는 내가 주말마다 늘 찾는 단골 장소이다.',
      paraphraseVersion: 'This quiet cafe is the place I always visit on weekends.',
      grammarPoint: 'be동사(is) 뒤에서 주어(This quiet cafe)가 어떤 곳인지 정의해 주는 주격보어(SC) 자리에 명사구(my go-to spot)가 쓰였습니다.',
      contextNuance: 'OPIc 카페·음식점·공원 묘사 문제에서 첫 문장으로 던지기 가장 좋은 만능 템플릿입니다.',
    },
    {
      id: 2002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 루틴 유지와 목적',
      targetWord: 'stick to',
      wordOrderFormula: 'I[S] + always[M] + stick[V] + to my daily workout routine[M:전치사구] + to clear my head[M:목적].',
      structure: '자동사(stick) + 전치사구(to + 전치사 목적어 M) + 목적의 to부정사구(M)',
      soundBlockEn: 'I always stick to / my daily workout routine / to clear my head.',
      soundMethodGuide: 'stick to[스틱투] 뒤에 명사구를 자연스럽게 연결하고, to clear my head 앞에서 살짝 끊어 읽습니다.',
      ipaLine: '/aɪ ˈɔːl.weɪz stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn tə klɪr maɪ hed/',
      koLine: '나는 항상 지킨다 / 매일의 운동 루틴을 / 복잡한 머리를 식히기 위해.',
      enLine: 'I always stick to / my daily workout routine / to clear my head.',
      rawEn: 'I always stick to my daily workout routine to clear my head.',
      pronLine: '[아이 올웨이즈 스틱 투 / 마이 데일리 워크아웃 루틴 / 투 클리어 마이 헤드]',
      naturalKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
      paraphraseVersion: 'I consistently follow my daily exercise schedule in order to refresh my mind.',
      grammarPoint: '앞의 to는 자동사 stick과 결합해 명사구(my daily workout routine: 전치사의 목적어 M)를 이끄는 전치사이고, 뒤의 to는 동사원형 clear를 이끌어 목적(~하기 위해)을 나타내는 to부정사 표지입니다.',
      contextNuance: '건강 관리나 자기계발 습관을 설명할 때 의지력과 목적을 동시에 보여줄 수 있는 문장입니다.',
    },
    {
      id: 2003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 동명사구 주어와 관점 확장',
      targetWord: 'perspective',
      wordOrderFormula: 'Reading diverse texts[S:동명사구] + broadens[V] + our perspective[DO] + on life[M].',
      structure: '3형식 (동명사구 S + 단수 타동사 V + DO + 전치사구 M)',
      soundBlockEn: 'Reading diverse texts / broadens our perspective / on life.',
      soundMethodGuide: '동명사구 주어(Reading diverse texts)와 동사+목적어(broadens our perspective)를 리듬감 있게 연결합니다.',
      ipaLine: '/ˈriː.dɪŋ daɪˈvɝːs teksts ˈbrɔː.dənz ˈaʊ.ɚ pɚˈspek.tɪv ɑːn laɪf/',
      koLine: '다양한 글을 읽는 것은 / 우리의 시야(관점)를 넓혀준다 / 삶에 대한.',
      enLine: 'Reading diverse texts / broadens our perspective / on life.',
      rawEn: 'Reading diverse texts broadens our perspective on life.',
      pronLine: '[리딩 다이버스 텍스츠 / 브로든즈 아워 퍼스펙티브 / 안 라이프]',
      naturalKo: '다양한 글을 읽는 것은 삶에 대한 우리의 시야를 넓혀준다.',
      paraphraseVersion: 'When we read a wide range of books, we can expand our viewpoint on the world.',
      grammarPoint: '복수 명사 texts가 바로 앞에 있지만 진짜 주어 핵은 동명사 Reading이므로 단수 동사 broadens(-s)로 수일치해야 합니다.',
      contextNuance: '에세이나 스피킹 시험 마무리에서 내 취미가 주는 지적인 가치를 요약할 때 빛을 발하는 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'unwind',
      ipa: '/ʌnˈwaɪnd/',
      options: [
        '긴장을 풀다, 휴식을 취하다',
        '일정을 앞당기다',
        '서류를 철저히 검토하다',
        '회의록을 작성하다',
      ],
      answerIdx: 0,
      explanation: 'unwind(/ʌnˈwaɪnd/, [언와인드])는 감겨 있던 태엽을 풀듯 긴장과 피로를 풀며 쉬다라는 뜻입니다.',
    },
    intermediate: {
      sentenceBefore: 'I always try to',
      sentenceAfter: 'my morning workout routine even when I am busy.',
      hint: '(계획·루틴을) 바꾸지 않고 꾸준히 지키다',
      options: ['put off', 'give up', 'turn down', 'stick to'],
      answerIdx: 3,
      explanation: '바쁠 때에도 아침 운동 루틴을 포기하지 않고 꾸준히 지킨다는 문맥이므로 stick to가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 중 문법적으로 올바르고 자연스러운 문장을 2개 고르세요.',
      highlightWord: '동명사구 주어 단수 수일치 & 자동사 stick + 전치사 to 결합 규칙',
      options: [
        'Reading diverse books broaden our perspective on life.',
        'Reading diverse books broadens our perspective on life.',
        'I always stick my daily workout routine every morning.',
        'I take an evening walk to clear my head and recharge my batteries.',
      ],
      answerIndices: [1, 3],
      explanation:
        '두 번째 문장은 동명사구 주어(Reading ~)에 단수 동사 broadens를 정확히 수일치시켰고, 네 번째 문장은 목적의 to부정사(to clear ~ and recharge ~) 병렬 구조가 완벽합니다. (세 번째 문장에서 stick은 "~을 고수하다/지키다"라는 뜻일 때 반드시 전치사 to와 결합해 stick to my daily workout routine으로 써야 합니다.)',
    },
    writingMission: {
      koPrompt: '다양한 글을 읽는 것은 삶에 대한 우리의 시야(관점)를 넓혀준다.',
      targetPattern: 'Reading ~ broadens our perspective on ...',
      modelAnswer: 'Reading diverse texts broadens our perspective on life.',
    },
  },
};

export const THEME_TRAVEL_HOTEL: ThemeData = {
  id: 'theme-travel-hotel',
  badge: '✈️ 해외여행 · 호텔·공항',
  title: '호텔 체크인·레이트 체크아웃 & 공항 수하물 실전',
  subtitle: '짐 맡기기, 무료 조식 문의, 특별 요청 수용 및 항공 일정표 확인',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (정중한 허락·요청 의문문)',
      focusBadge: 'Can we + 동사원형(구동사) + 목적어?',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '호텔 프런트나 공항 카운터에서 가장 많이 쓰는 [Can we + 구동사 ~?] 패턴을 입에 붙입니다.',
      patternEn: 'Can we drop off our bags before check-in?',
      patternIpa: '/kæn wi drɑːp ɔːf ˈaʊ.ɚ bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
      patternPron: '[캔 위 드랍 오프 / 아워 백스 / 비포 체크인]',
      patternSoundBlock: 'Can we drop off / our bags / before check-in?',
      patternSoundRule: 'drop off[드라포프]를 한 호흡으로 연결하고 문장 끝 check-in?을 살짝 올려 정중하게 묻습니다.',
      patternMeaningKo: '체크인 시간 전에 저희 가방(짐)을 먼저 맡길 수 있을까요?',
      grammarSummary: '조동사 Can + 주어(we) + 타동사구(drop off) + 목적어(our bags) + 시간 전치사구(before check-in)로 구성된 실전 여행 필수 의문문입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'leave our bags here (가방을 여기에 두다)',
          upgradedExpr: 'drop off our bags at the front desk (프런트에 짐을 맡기다)',
          nuanceDiff: '호텔 벨데스크나 프런트에 짐을 맡길 때 원어민이 가장 흔히 쓰는 구동사입니다.',
        },
        {
          basicExpr: 'Can you help me with my request? (제 요청을 도와주실 수 있나요?)',
          upgradedExpr: 'Could you accommodate my request? (제 요청을 수용해 배려해 주실 수 있을까요?)',
          nuanceDiff: 'help는 반드시 help me with ~ 구조로 써야 하며, 호텔에서는 타동사 accommodate가 훨씬 품격 있습니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '투숙객 (Guest)',
          en: 'Hi, we arrived a bit early. Can we drop off our bags before check-in?',
          soundBlock: 'Hi, / we arrived a bit early. / Can we drop off our bags / before check-in?',
          pron: '[하이, 위 어라이브드 어 빗 얼리. 캔 위 드랍 오프 아워 백스 / 비포 체크인]',
          ko: '안녕하세요, 저희가 조금 일찍 도착했는데요. 체크인 전에 짐을 먼저 맡길 수 있을까요?',
          pointNote: '구동사 drop off (짐을 맡기다)',
        },
        {
          speaker: 'B',
          roleName: '프런트 직원 (Receptionist)',
          en: 'Certainly! Feel free to make yourself comfortable in the lobby lounge.',
          soundBlock: 'Certainly! / Feel free to make yourself comfortable / in the lobby lounge.',
          pron: '[서튼리! 필 프리 투 메익 유어셀프 컴프터블 / 인 더 로비 라운지]',
          ko: '물론이죠! 로비 라운지에서 편하게 쉬고 계세요.',
          pointNote: '5형식 make yourself comfortable (편히 계시다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (호텔 혜택 확인 & 경유지 재정비)',
      focusBadge: '타동사 include & 구동사 freshen up',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '호텔 무료 혜택(complimentary)과 공항 환승 대기(layover) 관련 필수 어휘를 정확한 강세로 발음합니다.',
      patternEn: 'Our hotel booking includes complimentary breakfast.',
      patternIpa: '/ˈaʊ.ɚ hoʊˈtel ˈbʊk.ɪŋ ɪnˈkluːdz ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
      patternPron: '[아워 호텔 부킹 인클루즈 / 캄플러멘터리 브렉퍼스트]',
      patternSoundBlock: 'Our hotel booking / includes / complimentary breakfast.',
      patternSoundRule: 'complimentary의 세 번째 음절(-men-)에 강세를 실어 [캄플러멘터리]로 또렷이 발음합니다.',
      patternMeaningKo: '우리 호텔 예약에는 무료 조식이 포함되어 있습니다.',
      grammarSummary: '단수 주어(Our hotel booking)에 수일치된 단수 타동사 includes 뒤에 형용사(complimentary) + 명사(breakfast)가 목적어(DO)로 왔습니다.',
      paraphraseDrill: [
        {
          basicExpr: 'free breakfast (공짜 아침 식사)',
          upgradedExpr: 'complimentary breakfast (호텔·항공사에서 우대 혜택으로 제공하는 무료 조식)',
          nuanceDiff: '안내 방송이나 예약 확인서에 등장하는 공식 서비스 용어입니다.',
        },
        {
          basicExpr: 'wash my face and rest (세수하고 쉬다)',
          upgradedExpr: 'freshen up in the airport lounge (공항 라운지에서 간단히 씻고 재정비하다)',
          nuanceDiff: '비행 전후에 몸단장을 하고 상쾌하게 재정비한다는 뜻을 깔끔하게 전달합니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '여행객 (Traveler)',
          en: 'Does our room reservation include complimentary breakfast?',
          soundBlock: 'Does our room reservation / include / complimentary breakfast?',
          pron: '[더즈 아워 룸 레저베이션 인클루드 / 캄플러멘터리 브렉퍼스트]',
          ko: '저희 객실 예약에 무료 조식이 포함되어 있나요?',
          pointNote: 'include + 목적어 (~을 포함하다)',
        },
        {
          speaker: 'B',
          roleName: '컨시어지 (Concierge)',
          en: 'Yes, it does. We also offer a complimentary shuttle to the airport.',
          soundBlock: 'Yes, it does. / We also offer / a complimentary shuttle / to the airport.',
          pron: '[예스 잇 더즈. 위 올소 오퍼 / 어 캄플러멘터리 셔틀 투 디 에어포트]',
          ko: '네, 포함되어 있습니다. 공항까지 무료 셔틀버스도 제공하고 있습니다.',
          pointNote: 'complimentary shuttle (무료 우대 셔틀)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (특별 요청 정중히 문의하기 & 관계대명사절)',
      focusBadge: 'Would it be possible to + 동사원형 & 계속적 용법 , which',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '가정법 조동사를 활용한 극존칭 요청(Would it be possible to accommodate ~?)을 물 흐르듯 구사합니다.',
      patternEn: 'Would it be possible to accommodate a late check-out request?',
      patternIpa: '/wʊd ɪt bi ˈpɑː.sə.bəl tə əˈkɑː.mə.deɪt ə leɪt ˈtʃek.aʊt rɪˈkwest/',
      patternPron: '[우딧 비 파서블 / 투 어카머데이트 / 어 레이트 체크아웃 리퀘스트]',
      patternSoundBlock: 'Would it be possible / to accommodate / a late check-out request?',
      patternSoundRule: 'Would it을 [우딧]으로 가볍게 연음하고 핵심 동사 accommodate[어카머데이트]를 또렷하게 발음합니다.',
      patternMeaningKo: '레이트 체크아웃 요청을 수용해 배려해 주실 수 있을까요?',
      grammarSummary: '가주어(it) + 진주어(to accommodate a late check-out request) 구문으로, 상대방에게 부담을 주지 않으면서 가장 정중하게 편의를 요청하는 표현입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'Can I check out late? (늦게 체크아웃해도 되나요?)',
          upgradedExpr: 'Would it be possible to accommodate a late check-out request?',
          nuanceDiff: '직설적인 질문을 격식 있는 정중한 요청문으로 격상시켜 긍정적인 답변을 이끌어냅니다.',
        },
        {
          basicExpr: 'check our travel plan (여행 계획을 확인하다)',
          upgradedExpr: 'review our updated flight itinerary (업데이트된 항공편 상세 일정표를 검토하다)',
          nuanceDiff: '항공사·호텔·여행사 소통에서 필수적으로 쓰이는 표준 명사 itinerary입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '투숙객 (Guest)',
          en: 'Our flight itinerary changed. Would it be possible to accommodate a late check-out?',
          soundBlock: 'Our flight itinerary changed. / Would it be possible / to accommodate a late check-out?',
          pron: '[아워 플라이트 아이티너레리 체인지드. 우딧 비 파서블 / 투 어카머데이트 어 레이트 체크아웃]',
          ko: '저희 항공편 일정이 변경되었는데요. 혹시 레이트 체크아웃 요청을 수용해 주실 수 있을까요?',
          pointNote: 'itinerary(일정표) + accommodate(요청을 수용하다)',
        },
        {
          speaker: 'B',
          roleName: '호텔 매니저 (Manager)',
          en: 'We would be happy to accommodate your request until 2 PM at no extra charge.',
          soundBlock: 'We would be happy / to accommodate your request / until 2 PM / at no extra charge.',
          pron: '[위 우드 비 해피 투 어카머데이트 유어 리퀘스트 / 언틸 투 피엠 / 앳 노 엑스트라 차지]',
          ko: '추가 요금 없이 오후 2시까지 고객님의 요청을 기꺼이 수용해 드리겠습니다.',
          pointNote: 'at no extra charge (추가 비용 없이)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '요청·문의 표현의 정중함 및 격식도 (의문문 패턴)',
      scaleAxisLabel: '일상적 질문 ➔ 정중한 부탁 ➔ 격식 있는 최상급 요청',
      weak: {
        expr: 'Can you help me with this?',
        pron: '[캔 유 헬프 미 위드 디스]',
        ko: '이것 좀 도와주실 수 있나요?',
        note: '가벼운 일상 상황에서 편하게 도움을 청할 때 (help + 사람 + with + 대상)',
      },
      medium: {
        expr: 'Could you check if a room is available?',
        pron: '[쿠쥬 체크 이프 어 룸 이즈 어베일러블]',
        ko: '이용 가능한 객실이 있는지 확인해 주시겠어요?',
        note: '예약이나 프런트 문의에서 두루 쓰이는 표준 정중 표현',
      },
      strong: {
        expr: 'Would it be possible to accommodate our request?',
        pron: '[우딧 비 파서블 투 어카머데이트 아워 리퀘스트]',
        ko: '저희의 특별 요청을 수용해 주시는 것이 가능할까요?',
        note: '레이트 체크아웃이나 좌석·객실 배정 등 특별한 배려를 구할 때 쓰는 최고급 표현',
      },
    },
    {
      conceptTitle: '가격·혜택 제공 조건의 격식도 (형용사)',
      scaleAxisLabel: '구어체 공짜 ➔ 추가 요금 없음 ➔ 호텔·항공사 우대 무료 제공',
      weak: {
        expr: 'free (drinks)',
        pron: '[프리 드링크스]',
        ko: '무료의 (음료)',
        note: '일상 대화에서 가장 흔하게 쓰는 기본 단어',
      },
      medium: {
        expr: 'included at no extra charge',
        pron: '[인클루디드 앳 노 엑스트라 차지]',
        ko: '추가 요금 없이 포함된',
        note: '요금 정산이나 계약 조건에서 비용이 들지 않음을 명시할 때',
      },
      strong: {
        expr: 'complimentary (breakfast / lounge access)',
        pron: '[캄플러멘터리 브렉퍼스트]',
        ko: '고객 우대 무료 혜택으로 제공되는 (조식/라운지)',
        note: '호텔·항공사·리조트에서 고객 서비스 차원으로 무료 제공할 때 쓰는 품격 있는 단어',
      },
    },
  ],
  vocab: [
    {
      id: 301,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'drop off',
      masked: 'dr__ o__',
      ipa: '/drɑːp ɔːf/',
      pron: '[드랍 오프]',
      soundMethod: 'drop의 /p/와 off가 이어져 [드라포프]처럼 자연스럽게 발음됩니다.',
      soundBlock: 'drop off / our bags',
      meaning: '(짐·세탁물 등을) 맡기다, 내려놓다',
      enDef: 'to take someone or something to a particular place and leave them there',
      exampleBlank: 'Can we _____ our bags at the front desk?',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Can 뒤에서 목적어(our bags)를 취하는 타동사구(V)입니다.',
      collocation: 'drop off our luggage',
      collocationKo: '수하물을 맡기다',
      paraphraseTip: '맡긴 짐을 나중에 다시 찾아가는 것은 pick up이라고 합니다.',
    },
    {
      id: 302,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'carry-on',
      masked: 'c____-o_',
      ipa: '/ˈkær.i.ɑːn/',
      pron: '[캐리안]',
      soundMethod: '첫 음절(car-)에 강세를 두어 [캐리안]으로 발음합니다.',
      soundBlock: 'bring / one carry-on',
      meaning: '기내 반입 수하물(가방)',
      enDef: 'a small bag or suitcase that a passenger is allowed to take into the cabin of an aircraft',
      exampleBlank: 'Passengers may bring one _____ onto the aircraft.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 bring의 직접목적어(DO) 자리에 쓰인 가산명사입니다. (형용사로 쓰일 때는 carry-on bag처럼 명사를 수식함)',
      collocation: 'a cabin carry-on',
      collocationKo: '기내 반입 가방',
      paraphraseTip: '화물칸에 부치는 위탁 수하물은 checked baggage라고 부릅니다.',
    },
    {
      id: 303,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'complimentary',
      masked: 'com__________',
      ipa: '/ˌkɑːm.pləˈmen.t̬ɚ.i/',
      pron: '[캄플러멘터리]',
      soundMethod: '세 번째 음절(-men-)에 주강세를 두어 [캄플러멘터리]로 발음합니다.',
      soundBlock: 'complimentary / breakfast',
      meaning: '(우대 혜택으로) 무료로 제공되는',
      enDef: 'given or supplied free of charge as a courtesy or hospitality',
      exampleBlank: 'Our hotel booking includes _____ breakfast.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 breakfast를 앞에서 꾸며주는 형용사 수식어(M)입니다.',
      collocation: 'complimentary lounge access',
      collocationKo: '라운지 무료 이용 혜택',
      paraphraseTip: '철자 i가 들어가면 무료의/칭찬하는(complimentary), e가 들어가면 상호 보완적인(complementary)입니다.',
    },
    {
      id: 304,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'freshen up',
      masked: 'fr_____ u_',
      ipa: '/ˈfreʃ.ən ʌp/',
      pron: '[프레셔넙]',
      soundMethod: 'freshen의 /n/과 up이 연음되어 [프레셔넙]으로 부드럽게 소리 납니다.',
      soundBlock: 'freshen up / during our layover',
      meaning: '간단히 씻고 단장하다, 재정비하다',
      enDef: 'to wash your hands and face and make yourself clean and tidy',
      exampleBlank: 'I would like to _____ during our layover.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사구 (V)',
      roleDesc: 'would like to 뒤에서 동작을 나타내는 자동사구입니다.',
      collocation: 'freshen up before dinner',
      collocationKo: '저녁 식사 전에 간단히 씻고 단장하다',
      paraphraseTip: '장거리 이동 후 샤워나 세안으로 기분을 산뜻하게 전환할 때 쓰는 표현입니다.',
    },
    {
      id: 305,
      type: '비즈니스',
      recommendLevel: 'intermediate',
      word: 'itinerary',
      masked: 'iti______',
      ipa: '/aɪˈtɪn.ə.rer.i/',
      pron: '[아이티너레리]',
      soundMethod: '첫 글자 i를 [아이]로 읽고 두 번째 음절(-tin-)에 강세를 둡니다.',
      soundBlock: 'updated / flight itinerary',
      meaning: '여행 상세 일정표, 여정',
      enDef: 'a planned route or detailed schedule of a journey',
      exampleBlank: 'Please check your updated flight _____.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 check의 직접목적어(DO) 역할을 하는 핵심 명사입니다.',
      collocation: 'flight itinerary',
      collocationKo: '항공편 상세 일정표',
      paraphraseTip: '단순한 schedule보다 항공편·숙소·이동 경로가 적힌 여행 일정표를 가리킵니다.',
    },
    {
      id: 306,
      type: '비즈니스',
      recommendLevel: 'advanced',
      word: 'accommodate',
      masked: 'acc________',
      ipa: '/əˈkɑː.mə.deɪt/',
      pron: '[어카머데이트]',
      soundMethod: '두 번째 음절(-com-)을 미국식 [카]로 열어 [어카머데이트]로 발음합니다.',
      soundBlock: 'accommodate / our request',
      meaning: '(요청·요구를) 수용하다, 편의를 봐주다; 숙박시키다',
      enDef: 'to fit in with someone’s wishes or needs; to provide lodging or sufficient space for',
      exampleBlank: 'Would it be possible to _____ a late check-out request?',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '진주어 to부정사구 안에서 목적어(a late check-out request)를 취하는 타동사입니다.',
      collocation: 'accommodate a special request',
      collocationKo: '특별 요청을 수용해 배려하다',
      paraphraseTip: 'accept보다 상대방의 사정을 배려해 편의를 맞춰준다는 정중한 어감이 있습니다.',
    },
    {
      id: 307,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'comfortable',
      masked: 'com________',
      ipa: '/ˈkʌm.fɚ.t̬ə.bəl/',
      pron: '[컴프터블]',
      soundMethod: '미국식 회화에서는 가운데 모음이 약화되어 [컴프터블]로 빠르게 발음됩니다.',
      soundBlock: 'make yourself / comfortable',
      meaning: '편안한, 쾌적한',
      enDef: 'providing physical ease and relaxation; free from stress',
      exampleBlank: 'Please make yourself _____ in the lounge.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'OC',
      compLabel: '목적격보어 (OC)',
      roleDesc: '5형식 동사 make + 목적어(yourself) 뒤에서 상태를 보충하는 목적격보어(OC)입니다.',
      collocation: 'make yourself comfortable',
      collocationKo: '편안하게 계시다',
      paraphraseTip: '손님에게 편히 쉬시라고 권할 때 쓰는 대표적인 5형식 관용 표현입니다.',
    },
  ],
  sentences: [
    {
      id: 3001,
      levelTag: 'beginner',
      tag: '초급 필수 · 체크인 전 수하물 보관',
      targetWord: 'drop off',
      wordOrderFormula: 'Can we[조동사+S] + drop off[V] + our bags[DO] + before check-in[M]?',
      structure: '3형식 구동사 의문문 (Can + S + V + DO + M)',
      soundBlockEn: 'Can we drop off / our bags / before check-in?',
      soundMethodGuide: 'drop off[드라포프]와 our bags[아워 백스]를 부드럽게 이어서 발음합니다.',
      ipaLine: '/kæn wi drɑːp ɔːf ˈaʊ.ɚ bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
      koLine: '저희가 맡길 수 있을까요 / 가방들을 / 체크인 시간 전에?',
      enLine: 'Can we drop off / our bags / before check-in?',
      rawEn: 'Can we drop off our bags before check-in?',
      pronLine: '[캔 위 드랍 오프 / 아워 백스 / 비포 체크인]',
      naturalKo: '체크인 시간 전에 저희 가방을 먼저 맡길 수 있을까요?',
      paraphraseVersion: 'Could we leave our luggage at the front desk before check-in time?',
      grammarPoint: '구동사 drop off는 목적어가 일반 명사구(our bags)일 때 drop off our bags와 drop our bags off 두 어순 모두 가능합니다.',
      contextNuance: '호텔 체크인 시간(보통 오후 3시)보다 일찍 도착했을 때 짐을 맡기며 쓰는 필수 문장입니다.',
    },
    {
      id: 3002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 무료 조식 포함 확인',
      targetWord: 'complimentary',
      wordOrderFormula: 'Our hotel booking[S] + includes[V] + complimentary breakfast[DO].',
      structure: '3형식 (S + 타동사 V + 형용사 수식 명사구 DO)',
      soundBlockEn: 'Our hotel booking / includes / complimentary breakfast.',
      soundMethodGuide: 'includes의 끝 /z/ 소리를 분명히 내고 complimentary[캄플러멘터리]의 강세를 살려 읽습니다.',
      ipaLine: '/ˈaʊ.ɚ hoʊˈtel ˈbʊk.ɪŋ ɪnˈkluːdz ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
      koLine: '우리의 호텔 예약은 / 포함하고 있다 / 무료 제공 조식을.',
      enLine: 'Our hotel booking / includes / complimentary breakfast.',
      rawEn: 'Our hotel booking includes complimentary breakfast.',
      pronLine: '[아워 호텔 부킹 / 인클루즈 / 캄플러멘터리 브렉퍼스트]',
      naturalKo: '우리 호텔 예약에는 무료 조식이 포함되어 있다.',
      paraphraseVersion: 'Breakfast is included in our hotel reservation at no extra charge.',
      grammarPoint: 'include는 타동사이므로 뒤에 전치사 with나 in 없이 바로 목적어(complimentary breakfast)를 씁니다.',
      contextNuance: '호텔 체크인 시 조식 포함 여부나 라운지 무료 이용 혜택을 재확인할 때 유용합니다.',
    },
    {
      id: 3003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 계속적 용법 관계대명사 , which',
      targetWord: 'accommodate',
      wordOrderFormula: 'The hotel[S] + kindly[M] + accommodated[V] + our late check-out request[DO], + which[S] + made[V] + our trip[DO] + much more comfortable[OC].',
      structure: '3형식 주절 + 계속적 용법 관계대명사절(, which + 5형식 made + DO + OC)',
      soundBlockEn: 'The hotel kindly accommodated / our late check-out request, / which made our trip / much more comfortable.',
      soundMethodGuide: '콤마(,) 앞에서 살짝 호흡을 멈춘 뒤 which made our trip을 부드럽게 이어 읽습니다.',
      ipaLine: '/ðə hoʊˈtel ˈkaɪnd.li əˈkɑː.mə.deɪ.t̬ɪd ˈaʊ.ɚ leɪt ˈtʃek.aʊt rɪˈkwest wɪtʃ meɪd ˈaʊ.ɚ trɪp mʌtʃ mɔːr ˈkʌm.fɚ.t̬ə.bəl/',
      koLine: '호텔 측에서 친절히 수용해 주었다 / 우리의 레이트 체크아웃 요청을, / 그리고 그것이 우리 여행을 만들어 주었다 / 훨씬 더 편안하게.',
      enLine: 'The hotel kindly accommodated / our late check-out request, / which made our trip / much more comfortable.',
      rawEn: 'The hotel kindly accommodated our late check-out request, which made our trip much more comfortable.',
      pronLine: '[더 호텔 카인들리 어카머데이티드 / 아워 레이트 체크아웃 리퀘스트 / 위치 메이드 아워 트립 / 머치 모어 컴프터블]',
      naturalKo: '호텔 측에서 레이트 체크아웃 요청을 친절히 수용해 주었는데, 그것이 우리 여행을 훨씬 더 편안하게 만들어 주었다.',
      paraphraseVersion: 'Because the hotel gladly accommodated our late check-out request, our trip became much more comfortable.',
      grammarPoint: '앞 절 전체를 선행사로 받는 콤마(,) 뒤 계속적 용법에는 관계대명사 which를 쓰며(that 불가), 비교급(more comfortable) 앞에서는 very가 아닌 much/even/far로 강조합니다.',
      contextNuance: '여행 경험담(OPIc)이나 호텔 리뷰를 작성할 때 문장 수준을 단숨에 높여주는 고급 연결 구문입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'drop off',
      ipa: '/drɑːp ɔːf/',
      options: [
        '비행기 좌석을 변경하다',
        '호텔 예약을 취소하다',
        '여권 유효기간을 갱신하다',
        '(짐·세탁물 등을) 맡기다, 내려놓다',
      ],
      answerIdx: 3,
      explanation: 'drop off는 체크인 전에 가방·수하물을 프런트에 맡기거나 사람을 특정 장소에 내려줄 때 쓰는 구동사입니다.',
    },
    intermediate: {
      sentenceBefore: 'Our hotel reservation includes',
      sentenceAfter: 'breakfast and airport shuttle service.',
      hint: '(고객 우대 혜택으로) 무료로 제공되는 (철자 i 주의)',
      options: ['complimentary', 'temporary', 'mandatory', 'fragmentary'],
      answerIdx: 0,
      explanation: '호텔이나 항공사에서 우대 혜택으로 무료 제공하는 서비스는 complimentary(무료의)라고 표현합니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법상 올바른 단어를 2개 고르세요: "The hotel accommodated our request, [ (A) ] made our family trip much more [ (B) ]."',
      highlightWord: '계속적 용법 관계대명사(, which) & 5형식 목적격보어(OC) 형용사',
      options: [
        '(A) that (계속적 용법 불가)',
        '(A) which (앞 절 전체 선행사)',
        '(B) comfortable (목적격보어 형용사)',
        '(B) comfortably (부사 — 보어 불가)',
      ],
      answerIndices: [1, 2],
      explanation:
        '콤마(,) 뒤에서 앞 절 전체의 내용을 받아 이어주는 계속적 용법에는 관계대명사 which를 쓰며, 5형식 동사 made의 목적어(our family trip)를 보충 설명하는 목적격보어(OC) 자리에는 형용사 comfortable이 와야 합니다.',
    },
    writingMission: {
      koPrompt: '호텔 측에서 우리의 레이트 체크아웃 요청을 친절히 수용해 주었다.',
      targetPattern: 'The hotel kindly accommodated ~',
      modelAnswer: 'The hotel kindly accommodated our late check-out request.',
    },
  },
};
// ============================================================================
// src/App.tsx — [파트 3/4]
// - 테마 4 (유튜브·바이럴·미디어) & 테마 5 (패션 에디토리얼·스타일링)
// - 수능·서술형·내신 3대 집중 코스 (보기 단어 givenWords 100% 일치 검증)
// - 정밀 토큰 주석 맵(VERIFIED_SENTENCE_TOKEN_MAP) 및 고도화된 추정 분류 구문 분석기
// ============================================================================

export const THEME_YOUTUBE_VIRAL: ThemeData = {
  id: 'theme-youtube-viral',
  badge: '🎬 유튜브 · 바이럴 · 리뷰',
  title: '화제의 숏폼 알고리즘 & 정곡을 찌르는 리뷰 표현',
  subtitle: '입소문 확산, 시리즈 정주행, 기대치 충족 여부 및 핵심 공감 댓글 표현',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (화제성 & 정주행 경험 말하기)',
      focusBadge: '2형식 변화동사 go viral & 타동사 binge-watch',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '온라인에서 영상이 화제가 되었을 때(go viral)와 몰아보기(binge-watch)를 자연스럽게 연결합니다.',
      patternEn: 'The short video went viral overnight.',
      patternIpa: '/ðə ʃɔːrt ˈvɪd.i.oʊ went ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt/',
      patternPron: '[더 쇼트 비디오 / 웬트 바이럴 / 오버나이트]',
      patternSoundBlock: 'The short video / went viral / overnight.',
      patternSoundRule: 'went viral[웬트 바이럴]에서 t는 가볍게 받치고 viral의 첫 음절(vi-)에 강세를 둡니다.',
      patternMeaningKo: '그 짧은 영상은 하룻밤 사이에 입소문을 타고 큰 화제가 되었습니다.',
      grammarSummary: '주어(The short video) + 2형식 변화동사(went) + 형용사 주격보어(viral) + 시간부사(overnight)로 이루어진 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'became very popular quickly (빠르게 아주 유명해졌다)',
          upgradedExpr: 'went viral overnight (하룻밤 사이에 입소문을 타고 확산되었다)',
          nuanceDiff: 'SNS·유튜브·릴스에서 콘텐츠가 폭발적으로 퍼질 때 쓰는 표준 표현입니다.',
        },
        {
          basicExpr: 'watched all episodes at once (모든 에피소드를 한 번에 다 봤다)',
          upgradedExpr: 'binge-watched the entire season (시즌 전체를 몰아서 정주행했다)',
          nuanceDiff: 'OTT 시리즈나 브이로그를 연속으로 몰아볼 때 쓰는 필수 동사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '친구 1 (Viewer)',
          en: 'Did you see that dance clip? It went viral overnight!',
          soundBlock: 'Did you see / that dance clip? / It went viral / overnight!',
          pron: '[디쥬 씨 댓 댄스 클립? 잇 웬트 바이럴 오버나이트]',
          ko: '그 댄스 영상 봤어? 하룻밤 사이에 완전히 화제가 됐더라!',
          pointNote: 'go viral overnight (하룻밤 사이에 화제가 되다)',
        },
        {
          speaker: 'B',
          roleName: '친구 2 (Subscriber)',
          en: 'Yes! I loved it so much that I binge-watched all of their vlogs.',
          soundBlock: 'Yes! / I loved it so much / that I binge-watched / all of their vlogs.',
          pron: '[예스! 아이 러브드 잇 소 머치 / 댓 아이 빈지워치트 올 오브 데어 브이로그즈]',
          ko: '응! 너무 마음에 들어서 그 채널 브이로그를 전부 정주행했잖아.',
          pointNote: '원인·결과 구문 so ~ that S + V (너무 ~해서 …하다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (기대치 부응 평가 & 정곡을 찌르는 리뷰)',
      focusBadge: '관용구 live up to the hype & hit the nail on the head',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '소문난 제품이나 콘텐츠가 실제 기대만큼 훌륭했는지 평가하는 관용 표현을 익힙니다.',
      patternEn: 'The new series definitely lived up to the hype.',
      patternIpa: '/ðə nuː ˈsɪr.iːz ˈdef.ə.nət.li lɪvd ʌp tə ðə haɪp/',
      patternPron: '[더 뉴 시리즈 / 데피니틀리 리브드 업 / 투 더 하입]',
      patternSoundBlock: 'The new series / definitely lived up / to the hype.',
      patternSoundRule: 'lived up을 [리브드업]으로 연음하고 문장 끝 명사 hype[하입]에 확실한 강세를 줍니다.',
      patternMeaningKo: '그 신작 시리즈는 확실히 소문(사전 기대치)만큼 훌륭했습니다.',
      grammarSummary: 'live up to(~에 부응하다, 기대치를 충족하다) 뒤에 the hype(떠들썩한 홍보·소문)가 결합해 "명불허전이다"라는 뜻을 나타냅니다.',
      paraphraseDrill: [
        {
          basicExpr: 'was as good as people said (사람들이 말한 것만큼 좋았다)',
          upgradedExpr: 'definitely lived up to the hype (확실히 소문·기대만큼 훌륭했다)',
          nuanceDiff: '맛집·영화·신제품 리뷰에서 만족감을 표현할 때 가장 자연스러운 표현입니다.',
        },
        {
          basicExpr: 'was exactly right (정확히 맞았다)',
          upgradedExpr: 'hit the nail on the head (문제의 정곡·핵심을 정확히 찔렀다)',
          nuanceDiff: '상대방의 분석이나 댓글이 핵심을 콕 집어냈을 때 쓰는 관용구입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '리뷰어 (Reviewer)',
          en: 'Everyone was talking about this tablet. Did it live up to the hype?',
          soundBlock: 'Everyone was talking about / this tablet. / Did it live up / to the hype?',
          pron: '[에브리원 워즈 토킹 어바웃 디스 태블릿. 디딧 리법 투 더 하입]',
          ko: '모두가 이 태블릿 이야기를 하던데요. 실제로 소문만큼 훌륭하던가요?',
          pointNote: 'Did it live up to the hype? (소문만큼 좋았나요?)',
        },
        {
          speaker: 'B',
          roleName: '사용자 (User)',
          en: 'Absolutely. Your review video really hit the nail on the head.',
          soundBlock: 'Absolutely. / Your review video / really hit the nail / on the head.',
          pron: '[앱설루틀리. 유어 리뷰 비디오 / 릴리 힛 더 네일 안 더 헤드]',
          ko: '그럼요. 올려주신 리뷰 영상이 정말 핵심을 정확히 짚어내셨더라고요.',
          pointNote: 'hit the nail on the head (정곡을 찌르다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (시청자 공감 유도 & 복합 문장 연결)',
      focusBadge: '등위접속사(, so) 절 연결 & 자동사 resonate with',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '콘텐츠가 왜 대중의 시선을 사로잡고(capture attention) 깊은 공감을 얻는지(resonate with) 논리적으로 설명합니다.',
      patternEn: 'The documentary is deeply informative, so it resonates with viewers.',
      patternIpa: '/ðə ˌdɑː.kjəˈmen.t̬ɚ.i ɪz ˈdiːp.li ɪnˈfɔːr.mə.t̬ɪv soʊ ɪt ˈrez.ə.neɪts wɪð ˈvjuː.ɚz/',
      patternPron: '[더 다큐멘터리 이즈 디플리 인포머티브, / 소 잇 레저네이츠 위드 뷰어즈]',
      patternSoundBlock: 'The documentary is deeply informative, / so it resonates / with viewers.',
      patternSoundRule: '쉼표(, so) 앞에서 호흡을 살짝 정리한 뒤 resonates with[레저네이츠 위드]를 부드럽게 이어 읽습니다.',
      patternMeaningKo: '그 다큐멘터리는 매우 유익해서 시청자들에게 깊은 공감을 불러일으킵니다.',
      grammarSummary: '두 개의 완전한 절을 등위접속사 so로 이어줄 때는 앞에 쉼표(, so)를 찍어주며, resonate는 전치사 with와 결합해 "~와 공명하다, 깊은 공감을 얻다"를 뜻합니다.',
      paraphraseDrill: [
        {
          basicExpr: 'makes many people agree and feel moved (많은 사람이 공감하고 감동하게 만들다)',
          upgradedExpr: 'deeply resonates with a wide audience (폭넓은 대중에게 깊은 공감을 불러일으키다)',
          nuanceDiff: '문화·예술·미디어 비평 및 에세이에서 가장 선호하는 고급 동사구입니다.',
        },
        {
          basicExpr: 'make people look at it quickly (사람들이 빨리 보게 만들다)',
          upgradedExpr: 'capture viewers’ attention right away (시청자의 시선을 단숨에 사로잡다)',
          nuanceDiff: '프레젠테이션 도입부나 영상 오프닝의 중요성을 설명할 때 쓰입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '콘텐츠 디렉터 (PD)',
          en: 'What makes this creator’s short-form videos so successful?',
          soundBlock: 'What makes / this creator’s short-form videos / so successful?',
          pron: '[왓 메익스 디스 크리에이터즈 숏폼 비디오즈 / 소 석세스풀]',
          ko: '무엇이 이 크리에이터의 숏폼 영상들을 이토록 성공적으로 만드는 걸까요?',
          pointNote: '5형식 의문사 주어 What + makes + DO + 형용사 OC(successful)',
        },
        {
          speaker: 'B',
          roleName: '미디어 분석가 (Analyst)',
          en: 'They capture attention in three seconds, and the stories deeply resonate with young viewers.',
          soundBlock: 'They capture attention / in three seconds, / and the stories deeply resonate / with young viewers.',
          pron: '[데이 캡처 어텐션 인 쓰리 세컨즈, / 앤 더 스토리즈 디플리 레저네이트 위드 영 뷰어즈]',
          ko: '3초 만에 시선을 사로잡고, 그 이야기들이 젊은 시청자들에게 깊은 공감을 불러일으키기 때문입니다.',
          pointNote: 'capture attention (시선을 사로잡다) + resonate with (~에게 공감을 얻다)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '대중적 인기와 확산 파급력의 강도 (동사구)',
      scaleAxisLabel: '관심을 끌다 ➔ 입소문이 나다 ➔ 폭발적으로 바이럴되다',
      weak: {
        expr: 'attract public attention',
        pron: '[어트랙트 퍼블릭 어텐션]',
        ko: '대중의 관심을 끌다',
        note: '사람들의 이목이 모이기 시작하는 초기 단계',
      },
      medium: {
        expr: 'gain word-of-mouth popularity',
        pron: '[게인 워드오브마우쓰 파퓰래러티]',
        ko: '입소문으로 인기를 얻다',
        note: '실제 경험자들의 추천을 통해 꾸준히 인기가 퍼지는 단계',
      },
      strong: {
        expr: 'go viral overnight',
        pron: '[고우 바이럴 오버나이트]',
        ko: '하룻밤 사이에 폭발적인 화제가 되다',
        note: '알고리즘과 공유를 통해 단기간에 전방위로 확산되는 최고 단계',
      },
    },
    {
      conceptTitle: '의견·분석의 정확도와 설득력 강도 (동사구)',
      scaleAxisLabel: '일리 있는 말이다 ➔ 요점을 잘 짚다 ➔ 정곡을 정확히 찌르다',
      weak: {
        expr: 'make a fair point',
        pron: '[메이커 페어 포인트]',
        ko: '타당한(일리 있는) 지적을 하다',
        note: '상대방의 말에 수긍할 만한 부분이 있을 때',
      },
      medium: {
        expr: 'capture the main idea',
        pron: '[캡처 더 메인 아이디어]',
        ko: '핵심 요지를 잘 파악하다',
        note: '전체적인 줄거리나 중심 내용을 정확히 짚어낼 때',
      },
      strong: {
        expr: 'hit the nail on the head',
        pron: '[힛 더 네일 안 더 헤드]',
        ko: '문제의 정곡(핵심)을 정확히 찌르다',
        note: '가장 본질적인 핵심을 한 치의 오차도 없이 명쾌하게 짚어냈을 때',
      },
    },
  ],
  vocab: [
    {
      id: 401,
      type: '트렌드·실무',
      recommendLevel: 'beginner',
      word: 'go viral',
      masked: 'g_ v____',
      ipa: '/ɡoʊ ˈvaɪ.rəl/',
      pron: '[고우 바이럴]',
      soundMethod: 'viral의 첫 음절(vi-)에 강세를 두어 [바이럴]로 발음합니다.',
      soundBlock: 'go viral / overnight',
      meaning: '(영상·소식이) 입소문을 타고 빠르게 확산되다',
      enDef: 'to spread rapidly and widely from one Internet user to another',
      exampleBlank: 'Creative short videos can _____ overnight.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 주어의 상태 변화를 나타내는 2형식 동사구(go + 형용사 보어 viral)입니다.',
      collocation: 'go viral on social media',
      collocationKo: '소셜 미디어에서 화제가 되다',
      paraphraseTip: 'spread rapidly online을 가장 간결하게 표현하는 현대 필수 숙어입니다.',
    },
    {
      id: 402,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'binge-watch',
      masked: 'b____-w____',
      ipa: '/ˈbɪndʒ.wɑːtʃ/',
      pron: '[빈지워치]',
      soundMethod: 'binge[빈지]에 강세를 두고 watch[워치]를 이어 발음합니다.',
      soundBlock: 'binge-watch / the whole season',
      meaning: '(드라마·시리즈를) 몰아서 정주행하다',
      enDef: 'to watch multiple episodes of a television program in rapid succession',
      exampleBlank: 'I plan to _____ the whole season this weekend.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: 'plan to 뒤에서 목적어(the whole season)를 취하는 타동사입니다.',
      collocation: 'binge-watch a drama series',
      collocationKo: '드라마 시리즈를 정주행하다',
      paraphraseTip: '주말 여가 활동을 답할 때 watch TV 대신 쓰면 훨씬 생동감 있습니다.',
    },
    {
      id: 403,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'live up to the hype',
      masked: 'l___ u_ t_ the h___',
      ipa: '/lɪv ʌp tə ðə haɪp/',
      pron: '[리법 투 더 하입]',
      soundMethod: 'live up을 [리법]으로 연음하고 hype[하입]를 강하게 발음합니다.',
      soundBlock: 'live up / to the hype',
      meaning: '소문·기대만큼 실제로도 훌륭하다(명불허전이다)',
      enDef: 'to be as good or exciting as people expected after a lot of publicity',
      exampleBlank: 'Did the new smartphone really _____?',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Did 뒤에서 원형으로 쓰여 문장의 본동사구(V) 역할을 합니다.',
      collocation: 'definitely live up to the hype',
      collocationKo: '확실히 소문(기대)에 부응하다',
      paraphraseTip: '기대에 못 미쳤을 때는 반대로 fail to live up to the hype라고 표현합니다.',
    },
    {
      id: 404,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'hit the nail on the head',
      masked: 'h__ the n___ on the h___',
      ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
      pron: '[힛 더 네일 안 더 헤드]',
      soundMethod: 'nail[네일]과 head[헤드] 두 명사에 강세를 주어 리듬감 있게 읽습니다.',
      soundBlock: 'hit the nail / on the head',
      meaning: '문제의 정곡(핵심)을 정확히 찌르다',
      enDef: 'to describe exactly what is causing a situation or problem',
      exampleBlank: 'Your analysis really _____ during the debate.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(Your analysis)의 동작을 서술하는 본동사구(V)입니다. (과거형도 hit으로 동일)',
      collocation: 'hit the nail on the head',
      collocationKo: '정곡을 정확히 찌르다',
      paraphraseTip: 'be completely accurate를 비유적으로 표현한 관용구입니다.',
    },
    {
      id: 405,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'capture',
      masked: 'cap____',
      ipa: '/ˈkæp.tʃɚ/',
      pron: '[캡처]',
      soundMethod: '첫 음절(cap-)에 강세를 두어 [캡처]로 발음합니다.',
      soundBlock: 'capture / viewers’ attention',
      meaning: '(관심·시선·장면을) 사로잡다, 포착하다',
      enDef: 'to succeed in getting someone’s attention or interest; to record or express accurately',
      exampleBlank: 'Strong visuals help _____ viewers’ attention right away.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '목적어(viewers’ attention)를 취해 시선을 사로잡는 동작을 나타냅니다.',
      collocation: 'capture attention right away',
      collocationKo: '시선을 단숨에 사로잡다',
      paraphraseTip: 'catch나 grab보다 프레젠테이션·마케팅 문맥에서 격식 있게 쓰입니다.',
    },
    {
      id: 406,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'resonate',
      masked: 'res_____',
      ipa: '/ˈrez.ə.neɪt/',
      pron: '[레저네이트]',
      soundMethod: '첫 음절(res-)에 강세를 두어 [레저네이트]로 발음합니다.',
      soundBlock: 'resonate / with the audience',
      meaning: '(깊은 공감·울림을) 불러일으키다, 공명하다',
      enDef: 'to produce a positive feeling, emotional response, or shared understanding in someone',
      exampleBlank: 'Authentic stories always _____ deeply with viewers.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(Authentic stories)의 본동사(V)로, 주로 전치사 with와 함께 쓰입니다.',
      collocation: 'resonate deeply with viewers',
      collocationKo: '시청자들에게 깊은 공감을 얻다',
      paraphraseTip: '공감하다라는 뜻의 학술·미디어 핵심 자동사입니다.',
    },
    {
      id: 407,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'informative',
      masked: 'inf________',
      ipa: '/ɪnˈfɔːr.mə.t̬ɪv/',
      pron: '[인포머티브]',
      soundMethod: '두 번째 음절(-for-)에 강세를 두고 미국식 t는 부드럽게 [티브/리브]로 발음합니다.',
      soundBlock: 'highly / informative',
      meaning: '유익한, 유용한 정보를 많이 주는',
      enDef: 'providing useful or interesting information',
      exampleBlank: 'The lecture was both engaging and _____.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'SC',
      compLabel: '주격보어 (SC)',
      roleDesc: 'be동사(was) 뒤에서 주어(The lecture)의 성격을 설명하는 주격보어(SC)입니다.',
      collocation: 'deeply informative content',
      collocationKo: '매우 유익한 콘텐츠',
      paraphraseTip: 'useful보다 정보적 가치와 배울 점이 풍부하다는 뜻을 정확히 전달합니다.',
    },
  ],
  sentences: [
    {
      id: 4001,
      levelTag: 'beginner',
      tag: '초급 필수 · 화제성과 정주행 연결(, so)',
      targetWord: 'binge-watch',
      wordOrderFormula: 'The new drama[S] + went[V] + viral[SC] + overnight[M], + so + I[S] + binge-watched[V] + the whole season[DO].',
      structure: '2형식 앞절 + 등위접속사(, so) + 3형식 뒷절',
      soundBlockEn: 'The new drama went viral / overnight, / so I binge-watched / the whole season.',
      soundMethodGuide: '쉼표(, so)에서 살짝 호흡을 끊고 binge-watched the whole season을 리듬감 있게 이어 읽습니다.',
      ipaLine: '/ðə nuː ˈdrɑː.mə went ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt soʊ aɪ ˈbɪndʒ.wɑːtʃt ðə hoʊl ˈsiː.zən/',
      koLine: '그 새 드라마가 입소문을 탔다 / 하룻밤 사이에, / 그래서 나는 몰아서 정주행했다 / 시즌 전체를.',
      enLine: 'The new drama went viral / overnight, / so I binge-watched / the whole season.',
      rawEn: 'The new drama went viral overnight, so I binge-watched the whole season.',
      pronLine: '[더 뉴 드라마 웬트 바이럴 오버나이트, / 소 아이 빈지워치트 더 홀 시즌]',
      naturalKo: '그 새 드라마가 하룻밤 사이에 화제가 되어서, 나는 시즌 전체를 몰아서 정주행했다.',
      paraphraseVersion: 'Because the new drama became popular so quickly, I watched all the episodes over the weekend.',
      grammarPoint: '완전한 두 문장(절)을 등위접속사 so로 연결할 때는 앞 절 끝에 쉼표(, so)를 찍어 절의 경계를 명확히 표시합니다.',
      contextNuance: '최근 본 영화나 드라마를 소개할 때 계기와 행동을 한 번에 설명하는 자연스러운 문장입니다.',
    },
    {
      id: 4002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 기대치 충족 리뷰',
      targetWord: 'live up to the hype',
      wordOrderFormula: 'The new flagship tablet[S] + definitely[M] + lived up to the hype[V].',
      structure: '3형식 상당 관용구 (S + 부사 M + 구동사 V + 목적어)',
      soundBlockEn: 'The new flagship tablet / definitely lived up / to the hype.',
      soundMethodGuide: 'definitely[데피니틀리]로 확신을 더하고 끝 단어 hype[하입]에 강세를 줍니다.',
      ipaLine: '/ðə nuː ˈflæɡ.ʃɪp ˈtæb.lət ˈdef.ə.nət.li lɪvd ʌp tə ðə haɪp/',
      koLine: '그 새로운 플래그십 태블릿은 / 확실히 부응했다 / 사전의 떠들썩한 기대(소문)에.',
      enLine: 'The new flagship tablet / definitely lived up / to the hype.',
      rawEn: 'The new flagship tablet definitely lived up to the hype.',
      pronLine: '[더 뉴 플래그십 태블릿 / 데피니틀리 리브드 업 투 더 하입]',
      naturalKo: '그 신형 플래그십 태블릿은 확실히 소문(기대)만큼 훌륭했다.',
      paraphraseVersion: 'The new flagship tablet fully met the high pre-launch expectations.',
      grammarPoint: 'live up to(~의 기대·수준에 부응하다)는 세 단어가 하나의 타동사구처럼 결합하여 목적어(the hype)를 취합니다.',
      contextNuance: 'IT 기기, 맛집, 공연 등을 직접 경험한 뒤 만족스러웠음을 밝히는 핵심 리뷰 표현입니다.',
    },
    {
      id: 4003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 유익함과 시청자 공감(, so)',
      targetWord: 'resonate',
      wordOrderFormula: 'The documentary[S] + is[V] + deeply informative[SC], + so + it[S] + deeply[M] + resonates[V] + with viewers[M].',
      structure: '2형식 앞절(S+V+SC) + 등위접속사(, so) + 1형식 뒷절(S+V+전치사구 M)',
      soundBlockEn: 'The documentary is deeply informative, / so it deeply resonates / with viewers.',
      soundMethodGuide: 'informative[인포머티브] 뒤 쉼표에서 잠깐 쉬고 resonates with[레저네이츠 위드]를 부드럽게 연결합니다.',
      ipaLine: '/ðə ˌdɑː.kjəˈmen.t̬ɚ.i ɪz ˈdiːp.li ɪnˈfɔːr.mə.t̬ɪv soʊ ɪt ˈdiːp.li ˈrez.ə.neɪts wɪð ˈvjuː.ɚz/',
      koLine: '그 다큐멘터리는 매우 유익하다, / 그래서 그것은 깊은 공감을 불러일으킨다 / 시청자들에게.',
      enLine: 'The documentary is deeply informative, / so it deeply resonates / with viewers.',
      rawEn: 'The documentary is deeply informative, so it deeply resonates with viewers.',
      pronLine: '[더 다큐멘터리 이즈 디플리 인포머티브, / 소 잇 디플리 레저네이츠 위드 뷰어즈]',
      naturalKo: '그 다큐멘터리는 매우 유익해서 시청자들에게 깊은 공감을 불러일으킨다.',
      paraphraseVersion: 'Because the documentary provides valuable insights, it strikes a chord with the audience.',
      grammarPoint: 'informative는 be동사(is)의 주격보어(SC)로 쓰인 형용사이며, resonate는 자동사이므로 대상 앞에 전치사 with를 동반합니다.',
      contextNuance: '좋은 책이나 영상이 왜 대중에게 사랑받는지를 지적인 어휘로 요약할 때 활용합니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'go viral',
      ipa: '/ɡoʊ ˈvaɪ.rəl/',
      options: [
        '영상을 비공개로 전환하다',
        '입소문을 타고 빠르게 확산되다(화제가 되다)',
        '자막 번역을 수정하다',
        '구독 알림을 해제하다',
      ],
      answerIdx: 1,
      explanation: 'go viral은 온라인 영상이나 소식이 바이러스처럼 빠르게 퍼져 큰 화제가 되다라는 뜻입니다.',
    },
    intermediate: {
      sentenceBefore: 'Your insightful comment really',
      sentenceAfter: 'during the strategy meeting.',
      hint: '문제의 정곡(핵심)을 정확히 찌르다',
      options: [
        'missed the boat',
        'beat around the bush',
        'hit the nail on the head',
        'dropped the ball',
      ],
      answerIdx: 2,
      explanation: '통찰력 있는 의견이 회의에서 핵심(정곡)을 정확히 찔렀다는 맥락이므로 hit the nail on the head가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법상 올바른 형태를 2개 고르세요: "The lecture was highly [ (A) ], so it deeply resonated [ (B) ] the audience."',
      highlightWord: '2형식 주격보어(SC) 형용사 & 자동사 resonate + 전치사 with',
      options: [
        '(A) informative (형용사 주격보어)',
        '(A) informatively (부사 — 보어 불가)',
        '(B) 전치사 필요 없음',
        '(B) with (자동사 resonate와 결합하는 전치사)',
      ],
      answerIndices: [0, 3],
      explanation:
        '(A) be동사(was)의 주격보어(SC) 자리이므로 부사(informatively)가 아닌 형용사 informative가 와야 하며, (B) 자동사 resonate는 대상 앞에 전치사 with를 취합니다.',
    },
    writingMission: {
      koPrompt: '그 새로운 플래그십 태블릿은 확실히 소문(기대)만큼 훌륭했다.',
      targetPattern: 'The new flagship tablet definitely lived up to ~',
      modelAnswer: 'The new flagship tablet definitely lived up to the hype.',
    },
  },
};

export const THEME_FASHION_EDITORIAL: ThemeData = {
  id: 'theme-fashion-editorial',
  badge: '👗 패션 · 스타일링 · 미학',
  title: '런웨이 에디토리얼 & 미니멀 스타일링 표현',
  subtitle: '과감한 룩 소화하기, 실루엣 보완, 포인트 아이템 및 현대적 미학 묘사',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (매장 피팅 & 코디 어울림 표현)',
      focusBadge: '구동사 try on & go well with',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '옷을 직접 입어볼 때(try on)와 다른 옷과 잘 어울린다고 말할 때(go well with) 쓰는 표현을 익힙니다.',
      patternEn: 'This linen shirt goes really well with your jeans.',
      patternIpa: '/ðɪs ˈlɪn.ɪn ʃɝːt ɡoʊz ˈrɪə.li wel wɪð jʊr dʒiːnz/',
      patternPron: '[디스 린넨 셔츠 / 고우즈 릴리 웰 / 위드 유어 진즈]',
      patternSoundBlock: 'This linen shirt / goes really well / with your jeans.',
      patternSoundRule: 'goes really well[고우즈 릴리 웰]에 강세를 주어 칭찬하는 밝은 억양으로 발음합니다.',
      patternMeaningKo: '이 린넨 셔츠는 당신의 청바지와 정말 잘 어울립니다.',
      grammarSummary: '단수 주어(This linen shirt) + 단수 동사(goes) + 부사구(really well) + 전치사구(with your jeans)로 이루어진 자연스러운 칭찬 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'matches your jeans well (청바지와 잘 맞는다)',
          upgradedExpr: 'goes really well with your jeans (청바지와 정말 잘 어울린다)',
          nuanceDiff: '일상 쇼핑과 코디 대화에서 원어민이 가장 즐겨 쓰는 표현입니다.',
        },
        {
          basicExpr: 'wear this jacket to test the size (사이즈를 보려고 재킷을 입다)',
          upgradedExpr: 'try on this jacket in a medium size (이 재킷을 미디엄 사이즈로 입어보다)',
          nuanceDiff: '매장 피팅룸에서 옷이나 신발을 시착해 볼 때는 착용(wear)이 아닌 try on을 씁니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '고객 (Shopper)',
          en: 'Excuse me, can I try on this tailored blazer in a medium size?',
          soundBlock: 'Excuse me, / can I try on / this tailored blazer / in a medium size?',
          pron: '[익스큐즈 미, 캐나이 트라이 안 디스 테일러드 블레이저 / 이너 미디엄 사이즈]',
          ko: '실례합니다, 이 테일러드 블레이저를 미디엄 사이즈로 입어볼 수 있을까요?',
          pointNote: 'try on + 옷 + in a [사이즈] size',
        },
        {
          speaker: 'B',
          roleName: '매장 직원 (Stylist)',
          en: 'Of course! That color goes really well with your denim jeans.',
          soundBlock: 'Of course! / That color goes really well / with your denim jeans.',
          pron: '[오브 코스! 댓 컬러 고우즈 릴리 웰 / 위드 유어 데님 진즈]',
          ko: '물론이죠! 그 색상이 고객님의 데님 청바지와 정말 잘 어울리네요.',
          pointNote: 'go well with ~ (~와 잘 어울리다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (스타일 소화력 칭찬 & 실루엣 보완)',
      focusBadge: '구동사 pull off & 타동사 complement',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '아무나 소화하기 힘든 과감한 룩을 멋지게 소화했을 때(pull off)와 실루엣을 살려줄 때(complement)를 구사합니다.',
      patternEn: 'You really pulled off that bold statement look.',
      patternIpa: '/ju ˈrɪə.li pʊld ɔːf ðæt boʊld ˈsteɪt.mənt lʊk/',
      patternPron: '[유 릴리 풀도프 / 댓 볼드 스테이트먼트 룩]',
      patternSoundBlock: 'You really pulled off / that bold statement look.',
      patternSoundRule: 'pulled off를 [풀도프]로 한 호흡에 연음하고 bold statement look을 또렷하게 발음합니다.',
      patternMeaningKo: '그 과감한 포인트 룩을 정말 멋지게 소화해 내셨네요.',
      grammarSummary: '타동사구 pull off는 소화하기 까다로운 스타일이나 어려운 과제를 성공적으로 해내다라는 뜻으로, 뒤에 목적어(that bold statement look)를 취합니다.',
      paraphraseDrill: [
        {
          basicExpr: 'looked great in that difficult style (그 어려운 스타일이 잘 어울렸다)',
          upgradedExpr: 'really pulled off that bold statement look (그 과감한 포인트 룩을 멋지게 소화해 냈다)',
          nuanceDiff: '상대방의 뛰어난 패션 소화력을 칭찬할 때 쓰는 최고의 표현입니다.',
        },
        {
          basicExpr: 'makes the minimalist design look better (미니멀한 디자인을 더 돋보이게 한다)',
          upgradedExpr: 'complements the minimalist silhouette (미니멀한 실루엣을 완벽히 보완해 돋보이게 한다)',
          nuanceDiff: '두 아이템이 서로 조화를 이루어 매력을 배가시킬 때 쓰는 동사 complement입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '패션 에디터 (Editor)',
          en: 'Not everyone can wear bright red, but you really pulled off that bold look!',
          soundBlock: 'Not everyone can wear bright red, / but you really pulled off / that bold look!',
          pron: '[낫 에브리원 캔 웨어 브라이트 레드, / 벗 유 릴리 풀도프 댓 볼드 룩]',
          ko: '밝은 레드 컬러는 아무나 입기 힘든데, 그 과감한 룩을 정말 멋지게 소화하셨네요!',
          pointNote: 'pull off a bold look (과감한 룩을 소화해 내다)',
        },
        {
          speaker: 'B',
          roleName: '디자이너 (Designer)',
          en: 'Thank you! The structured coat also complements the clean silhouette.',
          soundBlock: 'Thank you! / The structured coat / also complements / the clean silhouette.',
          pron: '[땡큐! 더 스트럭처드 코트 / 올소 캄플러먼츠 더 클린 실루엣]',
          ko: '감사합니다! 구조적인 핏의 코트가 깔끔한 실루엣을 한층 돋보이게 보완해 주거든요.',
          pointNote: 'complement the silhouette (실루엣을 보완해 살려주다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (브랜드 헤리티지와 현대적 미학의 조화)',
      focusBadge: 'blend A with B & 명사 aesthetic [에스-쎄틱]',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '고전적 유산(classic heritage)과 현대적 미학(modern aesthetic)의 조화를 설명하는 에디토리얼 문장을 완성합니다.',
      patternEn: 'The collection seamlessly blends classic heritage with a modern aesthetic.',
      patternIpa: '/ðə kəˈlek.ʃən ˈsiːm.ləs.li blendz ˈklæs.ɪk ˈher.ɪ.t̬ɪdʒ wɪð ə ˈmɑː.dɚn esˈθet̬.ɪk/',
      patternPron: '[더 컬렉션 심리슬리 블렌즈 / 클래식 헤리티지 / 위더 모던 에스쎄틱]',
      patternSoundBlock: 'The collection seamlessly blends / classic heritage / with a modern aesthetic.',
      patternSoundRule: 'aesthetic의 th는 무성 마찰음 /θ/이므로 [에스-떼틱]이 아닌 [에스-쎄틱]으로 정확히 발음합니다.',
      patternMeaningKo: '그 컬렉션은 고전적 유산과 현대적인 미학을 매끄럽게(조화롭게) 결합합니다.',
      grammarSummary: '주어(The collection) + 부사(seamlessly) + 타동사(blends) + 목적어(classic heritage) + 전치사구(with a modern aesthetic)로 구성된 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'mixes old tradition and new style smoothly (전통과 새 스타일을 부드럽게 섞는다)',
          upgradedExpr: 'seamlessly blends classic heritage with a modern aesthetic',
          nuanceDiff: '디자인·건축·브랜드 철학을 설명할 때 설득력을 극대화하는 에디토리얼 구문입니다.',
        },
        {
          basicExpr: 'looks stylish without trying too hard (너무 애쓰지 않아도 멋져 보인다)',
          upgradedExpr: 'creates an effortlessly chic look (자연스러우면서도 세련된 룩을 연출한다)',
          nuanceDiff: '우리말의 이른바 꾸안꾸(꾸민 듯 안 꾸민 듯 세련된) 스타일을 뜻하는 정확한 영어 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '크리에이티브 디렉터 (CD)',
          en: 'What is the core theme of our autumn collection this year?',
          soundBlock: 'What is the core theme / of our autumn collection / this year?',
          pron: '[왓 이즈 더 코어 씸 / 오브 아워 오텀 컬렉션 디스 이어]',
          ko: '올해 우리 가을 컬렉션의 핵심 테마는 무엇인가요?',
          pointNote: 'the core theme of ~ (~의 핵심 테마)',
        },
        {
          speaker: 'B',
          roleName: '수석 디자이너 (Lead Designer)',
          en: 'Our collection seamlessly blends classic heritage with a minimalist aesthetic.',
          soundBlock: 'Our collection seamlessly blends / classic heritage / with a minimalist aesthetic.',
          pron: '[아워 컬렉션 심리슬리 블렌즈 / 클래식 헤리티지 / 위더 미니멀리스트 에스쎄틱]',
          ko: '이번 컬렉션은 고전적인 헤리티지와 미니멀한 미학을 조화롭게 결합했습니다.',
          pointNote: 'seamlessly blend A with B (A와 B를 매끄럽게 결합하다)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '의상 아이템의 역할과 시각적 존재감 (명사구)',
      scaleAxisLabel: '일상 기본템 ➔ 다용도 필수템 ➔ 시선 집중 포인트 아이템',
      weak: {
        expr: 'a basic everyday item',
        pron: '[어 베이직 에브리데이 아이템]',
        ko: '일상적인 기본 아이템',
        note: '매일 편하게 받쳐 입는 무난한 기본 의류',
      },
      medium: {
        expr: 'a timeless wardrobe staple',
        pron: '[어 타임리스 워드로브 스테이플]',
        ko: '유행을 타지 않는 옷장 필수 기본템',
        note: '트렌치코트나 화이트 셔츠처럼 사계절·매년 활용도가 높은 핵심 아이템',
      },
      strong: {
        expr: 'a bold statement piece',
        pron: '[어 볼드 스테이트먼트 피스]',
        ko: '단숨에 시선을 사로잡는 과감한 포인트 아이템',
        note: '전체 룩의 분위기를 주도하며 강렬한 인상을 남기는 핵심 포인트 의상·액세서리',
      },
    },
    {
      conceptTitle: '스타일링의 세련미와 연출 강도 (형용사구)',
      scaleAxisLabel: '단정한 ➔ 자연스럽게 멋스러운(꾸안꾸) ➔ 런웨이급으로 정교한',
      weak: {
        expr: 'neat and casual',
        pron: '[니트 앤 캐주얼]',
        ko: '단정하고 편안한',
        note: '일상에서 깔끔하고 부담 없이 입은 상태',
      },
      medium: {
        expr: 'effortlessly chic',
        pron: '[에포트리스리 시크]',
        ko: '꾸민 듯 안 꾸민 듯 자연스럽게 세련된',
        note: '과하게 힘주지 않으면서도 세련된 감각이 돋보이는 스타일',
      },
      strong: {
        expr: 'impeccably tailored',
        pron: '[임페커블리 테일러드]',
        ko: '한 치의 흠도 없이 완벽하게 재단된',
        note: '맞춤복처럼 핏과 실루엣이 완벽하게 떨어지는 최고급 스타일링',
      },
    },
  ],
  vocab: [
    {
      id: 501,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'try on',
      masked: 'tr_ o_',
      ipa: '/traɪ ɑːn/',
      pron: '[트라이 안]',
      soundMethod: 'try[트라이]와 on[안]을 부드럽게 이어 발음합니다.',
      soundBlock: 'try on / this jacket',
      meaning: '(옷·신발 등을) 입어보다, 신어보다',
      enDef: 'to put on a piece of clothing to see if it fits and how it looks',
      exampleBlank: 'Can I _____ this jacket in a medium size?',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Can 뒤에서 목적어(this jacket)를 취하는 타동사구(V)입니다.',
      collocation: 'try on a blazer for size',
      collocationKo: '사이즈를 보려고 블레이저를 입어보다',
      paraphraseTip: '대명사(it/them)를 목적어로 쓸 때는 반드시 try it on 어순으로 써야 합니다.',
    },
    {
      id: 502,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'pull off',
      masked: 'p___ o__',
      ipa: '/pʊl ɔːf/',
      pron: '[풀 오프]',
      soundMethod: 'pull의 끝 /l/과 off를 자연스럽게 연결해 발음합니다.',
      soundBlock: 'pull off / a bold look',
      meaning: '(소화하기 어려운 스타일·과제를) 멋지게 소화해 내다',
      enDef: 'to succeed in achieving or wearing something difficult or unexpected',
      exampleBlank: 'Not everyone can _____ such a bold look.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 목적어(such a bold look)를 취하는 타동사구(V)입니다.',
      collocation: 'pull off a bold statement look',
      collocationKo: '과감한 포인트 룩을 멋지게 소화하다',
      paraphraseTip: '무난한 기본템이 아니라 소화하기 까다로운 색상이나 스타일을 멋지게 입어냈을 때 씁니다.',
    },
    {
      id: 503,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'wardrobe staple',
      masked: 'w_______ st____',
      ipa: '/ˈwɔːr.droʊb ˈsteɪ.pəl/',
      pron: '[워드로브 스테이플]',
      soundMethod: 'wardrobe[워드로브]와 staple[스테이플] 각각의 첫 음절에 강세를 둡니다.',
      soundBlock: 'a timeless / wardrobe staple',
      meaning: '옷장 속 필수 기본 아이템',
      enDef: 'an essential, versatile piece of clothing that forms the foundation of a wardrobe',
      exampleBlank: 'A classic trench coat is a timeless _____.',
      pos: 'N',
      posLabel: '명사구 (N)',
      comp: 'SC',
      compLabel: '주격보어 (SC)',
      roleDesc: 'be동사(is) 뒤에서 주어(A classic trench coat)를 정의하는 주격보어(SC)입니다.',
      collocation: 'invest in a wardrobe staple',
      collocationKo: '옷장 필수 기본템에 투자하다',
      paraphraseTip: '유행을 타지 않고 오래 입는 기본 아이템을 뜻합니다.',
    },
    {
      id: 504,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'statement piece',
      masked: 'st_______ p____',
      ipa: '/ˈsteɪt.mənt piːs/',
      pron: '[스테이트먼트 피스]',
      soundMethod: 'statement[스테이트먼트]의 첫 음절에 강세를 두고 piece[피스]를 길게 발음합니다.',
      soundBlock: 'a bold / statement piece',
      meaning: '단숨에 시선을 사로잡는 포인트 아이템',
      enDef: 'an eye-catching clothing item or accessory that stands out and defines an outfit',
      exampleBlank: 'She added a bold _____ to her minimalist outfit.',
      pos: 'N',
      posLabel: '명사구 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 added의 직접목적어(DO) 자리에 쓰인 명사구입니다.',
      collocation: 'wear a bold statement piece',
      collocationKo: '과감한 포인트 아이템을 착용하다',
      paraphraseTip: '단조로운 코디에 강렬한 개성을 더해주는 핵심 아이템을 가리킵니다.',
    },
    {
      id: 505,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'silhouette',
      masked: 'sil_______',
      ipa: '/ˌsɪl.uˈet/',
      pron: '[실루엣]',
      soundMethod: '철자 h는 묵음이며 마지막 음절(-ette)에 강세를 두어 [실루엣]으로 발음합니다.',
      soundBlock: 'a structured / silhouette',
      meaning: '실루엣, 윤곽, 옷의 전체적인 라인',
      enDef: 'the overall outline, shape, or contour of a garment or body',
      exampleBlank: 'The tailored coat creates a clean _____.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 creates의 직접목적어(DO) 역할을 하는 명사입니다.',
      collocation: 'complement the silhouette',
      collocationKo: '실루엣을 돋보이게 보완하다',
      paraphraseTip: '핏(fit)이나 전체적인 외곽 라인을 품격 있게 표현하는 단어입니다.',
    },
    {
      id: 506,
      type: '트렌드·실무',
      recommendLevel: 'advanced',
      word: 'effortlessly chic',
      masked: 'eff_________ ch__',
      ipa: '/ˈef.ɚt.ləs.li ʃiːk/',
      pron: '[에포트리스리 시크]',
      soundMethod: 'chic은 프랑스어 유래 단어로 [칙]이 아니라 /ʃiːk/[시크]로 발음합니다.',
      soundBlock: 'an effortlessly chic / look',
      meaning: '꾸민 듯 안 꾸민 듯 자연스럽게 세련된',
      enDef: 'stylish and fashionable in a way that appears natural and unforced',
      exampleBlank: 'The linen blazer creates an _____ look.',
      pos: 'Adj',
      posLabel: '형용사구 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '부사(effortlessly)가 형용사(chic)를 꾸미고, 그 전체가 명사(look)를 앞에서 꾸미는 수식어(M)입니다.',
      collocation: 'an effortlessly chic outfit',
      collocationKo: '자연스럽게 세련된(꾸안꾸) 아웃핏',
      paraphraseTip: '과한 장식 없이도 세련미가 흐르는 스타일을 묘사할 때 씁니다.',
    },
    {
      id: 507,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'aesthetic',
      masked: 'aes______',
      ipa: '/esˈθet̬.ɪk/',
      pron: '[에스쎄틱]',
      soundMethod: 'th는 무성 마찰음 /θ/이므로 [에스-쎄틱]으로 발음합니다.',
      soundBlock: 'a modern / aesthetic',
      meaning: '미학, 미적 감각 (형용사: 미학적인)',
      enDef: 'a set of principles underlying and guiding the work of a particular artist or artistic movement',
      exampleBlank: 'The brand showcases a clean modern _____.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 showcases의 직접목적어(DO) 역할을 하는 가산명사입니다.',
      collocation: 'a minimalist aesthetic',
      collocationKo: '미니멀한 미학(미적 감각)',
      paraphraseTip: '단순한 style보다 철학이 담긴 미적 감각을 뜻하는 고급 어휘입니다.',
    },
  ],
  sentences: [
    {
      id: 5001,
      levelTag: 'beginner',
      tag: '초급 필수 · 코디 어울림 칭찬',
      targetWord: 'try on',
      wordOrderFormula: 'Can I[조동사+S] + try on[V] + this jacket[DO] + in a medium size[M]?',
      structure: '3형식 구동사 의문문 (Can + S + V + DO + 전치사구 M)',
      soundBlockEn: 'Can I try on / this jacket / in a medium size?',
      soundMethodGuide: 'Can I를 [캐나이]로 연음하고 try on this jacket을 자연스럽게 이어 읽습니다.',
      ipaLine: '/kæn aɪ traɪ ɑːn ðɪs ˈdʒæk.ɪt ɪn ə ˈmiː.di.əm saɪz/',
      koLine: '제가 입어볼 수 있을까요 / 이 재킷을 / 미디엄 사이즈로?',
      enLine: 'Can I try on / this jacket / in a medium size?',
      rawEn: 'Can I try on this jacket in a medium size?',
      pronLine: '[캐나이 트라이 안 / 디스 재킷 / 이너 미디엄 사이즈]',
      naturalKo: '이 재킷을 미디엄 사이즈로 입어볼 수 있을까요?',
      paraphraseVersion: 'Could I test the fit of this jacket in a medium?',
      grammarPoint: '사이즈나 색상 앞에 전치사 in을 써서 in a medium size, in black처럼 표현합니다.',
      contextNuance: '해외 의류 매장에서 원하는 사이즈를 요청하고 피팅룸을 이용할 때 바로 쓰는 문장입니다.',
    },
    {
      id: 5002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 실루엣을 살려주는 코트',
      targetWord: 'silhouette',
      wordOrderFormula: 'The tailored coat[S] + complements[V] + the minimalist silhouette[DO].',
      structure: '3형식 (S + 타동사 V + DO)',
      soundBlockEn: 'The tailored coat / complements / the minimalist silhouette.',
      soundMethodGuide: 'complements[캄플러먼츠]와 silhouette[실루엣]의 강세를 또렷하게 살려 발음합니다.',
      ipaLine: '/ðə ˈteɪ.lɚd koʊt ˈkɑːm.plə.ments ðə ˈmɪn.ə.məl.ɪst ˌsɪl.uˈet/',
      koLine: '그 테일러드 코트는 / 돋보이게 보완한다 / 미니멀한 실루엣을.',
      enLine: 'The tailored coat / complements / the minimalist silhouette.',
      rawEn: 'The tailored coat complements the minimalist silhouette.',
      pronLine: '[더 테일러드 코트 / 캄플러먼츠 / 더 미니멀리스트 실루엣]',
      naturalKo: '그 테일러드 코트는 미니멀한 실루엣을 한층 돋보이게 보완한다.',
      paraphraseVersion: 'The structured coat enhances the clean outline of the outfit.',
      grammarPoint: 'complement(보완하다)는 타동사로 목적어(the minimalist silhouette)를 바로 취하며, compliment(칭찬하다)와 스펠링 e/i를 구별해야 합니다.',
      contextNuance: '의상이나 인테리어 소품이 전체적인 조화를 높여줄 때 세련되게 묘사하는 문장입니다.',
    },
    {
      id: 5003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 헤리티지와 현대적 미학의 결합',
      targetWord: 'aesthetic',
      wordOrderFormula: 'The collection[S] + seamlessly[M] + blends[V] + classic heritage[DO] + with a modern aesthetic[M].',
      structure: '3형식 (S + 부사 M + V + DO + 전치사구 M)',
      soundBlockEn: 'The collection seamlessly blends / classic heritage / with a modern aesthetic.',
      soundMethodGuide: 'seamlessly blends[심리슬리 블렌즈]를 매끄럽게 잇고 마지막 aesthetic을 [에스-쎄틱]으로 정확히 발음합니다.',
      ipaLine: '/ðə kəˈlek.ʃən ˈsiːm.ləs.li blendz ˈklæs.ɪk ˈher.ɪ.t̬ɪdʒ wɪð ə ˈmɑː.dɚn esˈθet̬.ɪk/',
      koLine: '그 컬렉션은 매끄럽게 결합한다 / 고전적 유산을 / 현대적인 미학과.',
      enLine: 'The collection seamlessly blends / classic heritage / with a modern aesthetic.',
      rawEn: 'The collection seamlessly blends classic heritage with a modern aesthetic.',
      pronLine: '[더 컬렉션 심리슬리 블렌즈 / 클래식 헤리티지 / 위더 모던 에스쎄틱]',
      naturalKo: '그 컬렉션은 고전적 유산과 현대적인 미학을 조화롭게 결합한다.',
      paraphraseVersion: 'The new line harmonizes traditional craftsmanship with contemporary design principles.',
      grammarPoint: 'blend A with B(A를 B와 조화롭게 결합하다) 구문에서 부사 seamlessly가 동사 blends를 앞에서 수식(M)합니다.',
      contextNuance: '패션·자동차·건축·브랜드 기획서에서 전통과 혁신의 조화를 설명할 때 가장 설득력 있는 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'try on',
      ipa: '/traɪ ɑːn/',
      options: [
        '세탁소에 옷을 맡기다',
        '환불 영수증을 요청하다',
        '(옷·신발 등을) 입어보다, 신어보다',
        '선물 포장을 부탁하다',
      ],
      answerIdx: 2,
      explanation: 'try on은 매장에서 사이즈나 핏을 확인하기 위해 옷·신발을 시험 삼아 입어보다/신어보다라는 뜻입니다.',
    },
    intermediate: {
      sentenceBefore: 'Not everyone can wear neon colors, but you really',
      sentenceAfter: 'that bold statement look!',
      hint: '(소화하기 어려운 스타일·과제를) 멋지게 소화해 내다',
      options: ['pulled off', 'called off', 'put off', 'turned off'],
      answerIdx: 0,
      explanation: '아무나 소화하기 힘든 과감한 룩(bold statement look)을 성공적으로 멋지게 소화해 냈다는 뜻이므로 pulled off가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법·어휘상 올바른 단어를 2개 고르세요: "The tailored coat [ (A) ] the silhouette and blends heritage [ (B) ] a modern aesthetic."',
      highlightWord: '보완하다(complement vs compliment) & blend A with B 연어',
      options: [
        '(A) compliments (칭찬하다 — 문맥 부적절)',
        '(A) complements (보완하다, 돋보이게 하다)',
        '(B) with (blend A with B)',
        '(B) at (결합 전치사 부적절)',
      ],
      answerIndices: [1, 2],
      explanation:
        '(A) 실루엣을 보완해 돋보이게 한다는 뜻이므로 철자 e를 쓰는 complements가 맞으며, (B) blend A with B(A와 B를 결합하다)에서는 전치사 with를 씁니다.',
    },
    writingMission: {
      koPrompt: '그 컬렉션은 고전적 유산과 현대적인 미학을 조화롭게 결합한다.',
      targetPattern: 'The collection seamlessly blends ~ with ...',
      modelAnswer: 'The collection seamlessly blends classic heritage with a modern aesthetic.',
    },
  },
};

export const THEMES: ThemeData[] = [
  THEME_BIZ_MEETING,
  THEME_OPIC_ROUTINE,
  THEME_TRAVEL_HOTEL,
  THEME_YOUTUBE_VIRAL,
  THEME_FASHION_EDITORIAL,
];

// ============================================================================
// 4. 수능 독해 · 서술형 어법 · 고교 내신 3대 집중 마스터 코스
//    - 서술형 미션의 givenWords(보기 단어)와 modelAnswerEn(모범 답안) 1:1 완전 일치
// ============================================================================
export const EXAM_COURSES: ExamMasterCourse[] = [
  {
    id: 'CSAT_MASTER',
    badge: '🎯 수능·모의고사 독해 트랙',
    title: '학술 추상어 패러프레이징 & 고난도 구문 독해',
    shortTabName: '🎯 수능독해·추론',
    scheduleGuide: '권장 루틴: 지문 소리블록 직독직해(10분) ➔ 핵심 어법 판별(10분) ➔ 요약문 서술형 영작(10분)',
    targetGoal:
      '문장 성분 7개와 9품사의 결합 원리를 바탕으로 긴 학술 문장의 주어·동사 뼈대를 찾고, 지문의 핵심 논지를 다른 어휘로 바꿔 쓰는(Paraphrasing) 추론 능력을 완성합니다.',
    coreCurriculum: [
      '1단계: 부정어·Only 부사구 문두 도치 구문의 주어·동사 파악',
      '2단계: 인과 관계 및 대조 구문을 활용한 빈칸·요약문 패러프레이징',
      '3단계: 수식어 거품 제거를 통한 장문 주어-동사 수일치 판별',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1. 부정어(Not until) 문두 도치와 관점의 확장',
        focusPoint: 'Not until 부사절이 문두로 나올 때 주절의 [조동사 + 주어 + 동사원형] 도치 어순 파악',
        originalPassageEn:
          'Human beings tend to favor information that confirms their existing beliefs. Not until we step out of our comfort zone can we genuinely broaden our perspective.',
        originalPassagePron:
          '[휴먼 비잉즈 텐드 투 페이버 인포메이션 댓 컨펌즈 데어 이그지스팅 빌리프스. 낫 언틸 위 스텝 아우러브 아워 컴포트 존 / 캔 위 제뉴인리 브로든 아워 퍼스펙티브.]',
        originalPassageKo:
          '인간은 자신의 기존 신념을 확인해 주는 정보를 선호하는 경향이 있다. 우리가 익숙한 안전지대를 벗어나서야 비로소 우리의 시야(관점)를 진정으로 넓힐 수 있다.',
        transformedEn:
          'It is not until we step out of our comfort zone that we can genuinely broaden our perspective.',
        transformedPron:
          '[이리즈 낫 언틸 위 스텝 아우러브 아워 컴포트 존 / 댓 위 캔 제뉴인리 브로든 아워 퍼스펙티브.]',
        transformedPoint:
          '문두 도치 구문(Not until ~ can we ...)을 It is not until ~ that S + V 강조구문(정상 어순)으로 전환한 형태입니다.',
        grammarTrapQuestion: {
          prompt:
            'Not until we step out of our comfort zone [ (A) we can / (B) can we ] genuinely broaden our perspective.',
          choiceA: 'we can',
          choiceB: 'can we',
          correctChoice: 'B',
          explanation:
            '부정어구(Not until we step out of our comfort zone)가 문장 맨 앞에 위치했으므로, 뒤따르는 주절은 조동사 can이 주어 we 앞으로 나오는 의문문 어순(can we broaden)으로 도치되어야 합니다.',
        },
        essayMission: {
          typeBadge: '부정어 문두 도치 서술형 영작',
          koCondition:
            '우리말 뜻("우리가 익숙한 안전지대를 벗어나서야 비로소 시야를 진정으로 넓힐 수 있다.")에 맞도록 주어진 단어와 구절을 모두 사용하여 도치 구문으로 배열하세요.',
          givenWords:
            'Not until / we (2회 사용) / step out of / our comfort zone / can / genuinely / broaden / our perspective',
          modelAnswerEn:
            'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
          scoringCriteria:
            '① Not until 부사절 정상 어순(we step out of our comfort zone) 준수 ② 주절 조동사 도치(can we genuinely broaden) 정확성',
        },
      },
      {
        stepNum: 2,
        stepTitle: 'STEP 2. 확증 편향 극복과 인지적 경직성 예방 (인과 패러프레이징)',
        focusPoint: '지문의 핵심 인과 관계(다양한 관점 노출 ➔ 확증 편향 극복 및 경직성 예방) 요약',
        originalPassageEn:
          'Only by exposing ourselves to diverse viewpoints can we overcome confirmation bias and prevent cognitive rigidity.',
        originalPassagePron:
          '[온리 바이 익스포징 아워셀브즈 투 다이버스 뷰포인츠 / 캔 위 오버컴 칸퍼메이션 바이어스 앤 프리벤트 카그너티브 리지더티.]',
        originalPassageKo:
          '다양한 관점에 우리 자신을 노출시킴으로써만 우리는 확증 편향을 극복하고 인지적 경직성을 예방할 수 있다.',
        transformedEn:
          'Deliberate exposure to diverse viewpoints helps us overcome confirmation bias and foster cognitive flexibility.',
        transformedPron:
          '[딜리버릿 익스포저 투 다이버스 뷰포인츠 / 헬프스 어스 오버컴 칸퍼메이션 바이어스 앤 파스터 카그너티브 플렉서빌러티.]',
        transformedPoint:
          'prevent cognitive rigidity(인지적 경직성을 막다)를 긍정 방향의 표현인 foster cognitive flexibility(인지적 유연성을 기르다)로 패러프레이징했습니다.',
        grammarTrapQuestion: {
          prompt:
            'Deliberate exposure to diverse viewpoints and cultures [ (A) prevent / (B) prevents ] cognitive rigidity.',
          choiceA: 'prevent',
          choiceB: 'prevents',
          correctChoice: 'B',
          explanation:
            '전치사구(to diverse viewpoints and cultures)는 수식어(M)이며, 문장의 핵심 주어는 단수 명사 exposure이므로 단수 동사 prevents가 정답입니다.',
        },
        essayMission: {
          typeBadge: '요약문 완성 서술형 영작',
          koCondition:
            '우리말 뜻("다양한 관점에 스스로를 노출시킴으로써만 우리는 확증 편향을 극복할 수 있다.")에 맞도록 주어진 단어를 배열하세요.',
          givenWords:
            'Only by / exposing / ourselves / to / diverse viewpoints / can / we / overcome / confirmation bias',
          modelAnswerEn:
            'Only by exposing ourselves to diverse viewpoints can we overcome confirmation bias.',
          scoringCriteria:
            '① Only by + 동명사구(exposing ourselves to diverse viewpoints) ② 주절 조동사 도치(can we overcome)',
        },
      },
    ],
  },
  {
    id: 'GRAMMAR_ESSAY',
    badge: '✍️ 서술형·어법 집중 트랙',
    title: '5형식 목적격보어 & 분사구문·관계사 서술형 마스터',
    shortTabName: '✍️ 서술형·핵심어법',
    scheduleGuide: '권장 루틴: 어법 함정 비교(10분) ➔ 문장 전환 연습(10분) ➔ 조건부 영작(10분)',
    targetGoal:
      '우리말 해석("~하게")에 속기 쉬운 5형식 목적격보어(OC) 형용사 규칙과 분사구문의 능동·수동 판별, 계속적 용법 관계대명사를 완벽히 체화합니다.',
    coreCurriculum: [
      '1단계: 5형식(make/keep/find/consider + O + 형용사 OC) 함정 격파',
      '2단계: 과거분사(p.p.) 수동 분사구문과 주절 주어의 태 일치',
      '3단계: 선행사 포함 관계대명사 What 명사절 주어 구문 완성',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1. 동명사구 주어 수일치 & 5형식 형용사 보어(OC)',
        focusPoint: '해석이 "실현 가능하게"여도 목적어의 상태 설명이면 형용사(feasible) 사용',
        originalPassageEn:
          'Streamlining the approval process makes the entire project feasible within the tentative deadline.',
        originalPassagePron:
          '[스트림라이닝 디 어프루벌 프로세스 / 메익스 디 인타이어 프로젝트 피저블 / 위딘 더 텐터티브 데드라인.]',
        originalPassageKo:
          '승인 절차를 간소화하는 것은 잠정 마감일 내에 전체 프로젝트를 실현 가능하게 만든다.',
        transformedEn:
          'If we streamline the approval process, the entire project becomes feasible within the tentative deadline.',
        transformedPron:
          '[이프 위 스트림라인 디 어프루벌 프로세스, / 디 인타이어 프로젝트 비컴즈 피저블 위딘 더 텐터티브 데드라인.]',
        transformedPoint:
          '동명사구 주어(Streamlining ~)로 시작하는 5형식 문장을 조건 부사절(If we streamline ~)과 2형식 주절(becomes feasible)로 풀어서 전환했습니다.',
        grammarTrapQuestion: {
          prompt:
            'Streamlining the approval process makes the entire project [ (A) feasible / (B) feasibly ] within the deadline.',
          choiceA: 'feasible',
          choiceB: 'feasibly',
          correctChoice: 'A',
          explanation:
            '5형식 동사 makes 뒤에서 목적어(the entire project)의 상태를 보충 설명하는 목적격보어(OC) 자리이므로 형용사 feasible이 정답입니다.',
        },
        essayMission: {
          typeBadge: '5형식 구문 서술형 영작',
          koCondition:
            '우리말 뜻("승인 절차를 간소화하는 것은 전체 프로젝트를 실현 가능하게 만든다.")에 맞도록 주어진 단어를 배열하세요.',
          givenWords:
            'Streamlining / the approval process / makes / the entire project / feasible',
          modelAnswerEn:
            'Streamlining the approval process makes the entire project feasible.',
          scoringCriteria:
            '① 동명사구 주어(Streamlining the approval process) ② 단수 동사(makes) ③ 목적격보어 형용사(feasible)',
        },
      },
      {
        stepNum: 2,
        stepTitle: 'STEP 2. 수동 분사구문(Supported by ~)과 패러다임 전환',
        focusPoint: '주절 주어(the new hypothesis)와 분사의 수동 관계 판별',
        originalPassageEn:
          'Supported by solid empirical evidence, the new hypothesis shifted the scientific paradigm.',
        originalPassagePron:
          '[서포티드 바이 살리드 임피리컬 에비던스, / 더 뉴 하이파써시스 시프티드 더 사이언티픽 패러다임.]',
        originalPassageKo:
          '탄탄한 실증적 증거에 의해 뒷받침되면서, 그 새로운 가설은 과학적 패러다임을 바꾸어 놓았다.',
        transformedEn:
          'Because it was supported by solid empirical evidence, the new hypothesis shifted the scientific paradigm.',
        transformedPron:
          '[비코즈 잇 워즈 서포티드 바이 살리드 임피리컬 에비던스, / 더 뉴 하이파써시스 시프티드 더 사이언티픽 패러다임.]',
        transformedPoint:
          '과거분사로 시작하는 수동 분사구문(Supported by ~)을 이유 접속사 Because가 이끄는 수동태 부사절로 복원한 문장입니다.',
        grammarTrapQuestion: {
          prompt:
            '[ (A) Supporting / (B) Supported ] by solid empirical evidence, the new hypothesis shifted the scientific paradigm.',
          choiceA: 'Supporting',
          choiceB: 'Supported',
          correctChoice: 'B',
          explanation:
            '주절의 주어(the new hypothesis: 새로운 가설)는 실증적 증거에 의해 "뒷받침되는" 수동 관계이므로 과거분사 Supported가 정답입니다.',
        },
        essayMission: {
          typeBadge: '수동 분사구문 서술형 영작',
          koCondition:
            '우리말 뜻("탄탄한 실증적 증거에 의해 뒷받침되면서, 그 새로운 가설은 과학적 패러다임을 바꾸어 놓았다.")에 맞도록 주어진 단어를 배열하세요.',
          givenWords:
            'Supported / by / solid empirical evidence, / the new hypothesis / shifted / the scientific paradigm',
          modelAnswerEn:
            'Supported by solid empirical evidence, the new hypothesis shifted the scientific paradigm.',
          scoringCriteria:
            '① 수동 분사구문(Supported by solid empirical evidence,) ② 주절 어순(the new hypothesis shifted the scientific paradigm)',
        },
      },
    ],
  },
  {
    id: 'SCHOOL_INTERNAL',
    badge: '🏫 고교 내신 변형 대비 트랙',
    title: '교과서·부교재 지문 변형 & 조건부 영작 실전',
    shortTabName: '🏫 내신변형·영작',
    scheduleGuide: '권장 루틴: 원문 구조 분석 ➔ 변형 문장 비교 ➔ 내 학교 지문 직접 붙여넣기 훈련',
    targetGoal:
      '학교 내신 시험에서 자주 출제되는 원문 어휘 변형(Paraphrasing)과 관계대명사 What절·간접의문문 어순 결합 서술형을 완벽하게 대비합니다.',
    coreCurriculum: [
      '1단계: 선행사 포함 관계대명사 What절 주어 + 단수 동사 is',
      '2단계: 의문사절(how + 형용사/부사 + 주어 + 동사) 간접의문문 어순',
      '3단계: 내 학교 시험 범위 지문 직접 입력 및 빈칸·어순 배열 실전',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1. 관계대명사 What절 주어와 간접의문문 보어 결합',
        focusPoint: 'What matters most(주어절) + is + how seamlessly brands blend ~(보어절)',
        originalPassageEn:
          'In the modern market, consumers do not judge a brand only by its price. What matters most is how seamlessly brands blend heritage with sustainability.',
        originalPassagePron:
          '[인 더 모던 마켓, 컨슈머즈 두 낫 저지 어 브랜드 온리 바이 이츠 프라이스. 왓 매러즈 모스트 이즈 / 하우 심리슬리 브랜즈 블렌드 헤리티지 위드 서스테이너빌러티.]',
        originalPassageKo:
          '현대 시장에서 소비자들은 가격만으로 브랜드를 판단하지 않는다. 가장 중요한 것은 브랜드들이 얼마나 조화롭게 헤리티지를 지속 가능성과 결합하는가이다.',
        transformedEn:
          'The most crucial factor is whether an enterprise harmonizes its classic heritage with sustainable practices.',
        transformedPron:
          '[더 모스트 크루셜 팩터 이즈 / 웨더 언 엔터프라이즈 하머나이지즈 이츠 클래식 헤리티지 위드 서스테이너블 프랙티시즈.]',
        transformedPoint:
          'What matters most를 명사구(The most crucial factor)로, blend를 harmonize로 변형한 내신 패러프레이징 형태입니다.',
        grammarTrapQuestion: {
          prompt:
            '[ (A) What / (B) That ] matters most is how seamlessly brands blend heritage with sustainability.',
          choiceA: 'What',
          choiceB: 'That',
          correctChoice: 'A',
          explanation:
            '앞에 선행사가 없고 뒤에 주어가 빠진 불완전한 절(matters most)이 이어지므로 선행사를 포함한 관계대명사 What이 정답입니다.',
        },
        essayMission: {
          typeBadge: '내신 서술형 영작 (What절 + 간접의문문)',
          koCondition:
            '우리말 뜻("가장 중요한 것은 브랜드들이 얼마나 조화롭게 헤리티지를 지속 가능성과 결합하는가이다.")에 맞도록 주어진 단어를 모두 사용하여 문장을 완성하세요.',
          givenWords:
            'What / matters / most / is / how / seamlessly / brands / blend / heritage / with / sustainability',
          modelAnswerEn:
            'What matters most is how seamlessly brands blend heritage with sustainability.',
          scoringCriteria:
            '① 관계대명사 주어절(What matters most) ② 단수 동사(is) ③ 간접의문문 어순(how seamlessly brands blend ~)',
        },
      },
    ],
  },
];

// ============================================================================
// 5. 정밀 토큰 주석 맵(VERIFIED_SENTENCE_TOKEN_MAP) & 추정 분류 구문 분석기
//    - 공식 7개 문장 성분(CompId)과 9품사(PosId) 체계를 100% 일관되게 준수
//    - 사전 등록 문장 반환 시에도 전달받은 naturalKo 및 tagLabel 보존 (#40)
//    - 미등록 일반 문장 분석 시:
//      ① 문두 -ing 뒤에 콤마(,)가 존재하면 분사구문(M), 콤마 없이 본동사와 직결되면 동명사구 주어(S)
//      ② 5형식 동사 + 목적어 뒤에서 전치사구 앞에 위치한 형용사도 목적격보어(OC)로 정확히 인식
// ============================================================================
const COLOR_BY_COMP: Record<CompId, string> = {
  S: 'border-blue-500 text-blue-700',
  V: 'border-rose-500 text-rose-700',
  IO: 'border-purple-500 text-purple-700',
  DO: 'border-emerald-500 text-emerald-700',
  SC: 'border-amber-500 text-amber-700',
  OC: 'border-amber-600 text-amber-800',
  M: 'border-slate-300 text-slate-600',
};

function makeToken(
  word: string,
  comp: CompId,
  compLabel: string,
  pos: PosId,
  posLabel: string,
  meaning: string,
  roleExplanation: string
): DiagramToken {
  return {
    word,
    comp,
    compLabel,
    pos,
    posLabel,
    meaning,
    roleExplanation,
    colorClass: COLOR_BY_COMP[comp],
  };
}

const VERIFIED_SENTENCE_TOKEN_MAP: Record<string, DiagramSentence> = {
  'thanks for giving me a quick heads-up on the schedule.': {
    title: '테마 1 초급 · 4형식 동명사구(giving + IO + DO)',
    rawEn: 'Thanks for giving me a quick heads-up on the schedule.',
    naturalKo: '일정에 대해 미리 귀띔해 주셔서 감사합니다.',
    skeleton: 'Thanks[M:독립부가어] + for giving[M] + me[IO] + a quick heads-up[DO] + on the schedule[M]',
    patternType: '4형식 수여동사 기반 동명사구 (giving + IO + DO)',
    wordOrderTip:
      '전치사 for의 목적어로 쓰인 동명사 giving이 4형식 성질을 그대로 유지하여 간접목적어(me: 나에게)와 직접목적어(a quick heads-up: 빠른 사전 귀띔을)를 차례로 이끕니다.',
    isHeuristic: false,
    tokens: [
      makeToken('Thanks', 'M', '독립부가어 (M)', 'N', '명사 (N)', '감사합니다', 'Thank you를 간결하게 줄여 감사를 표하는 명사 표현(부가 요소 M)입니다.'),
      makeToken('for', 'M', '전치사 (M)', 'Prep', '전치사 (Prep)', '~에 대해', '뒤에 동명사구(giving ~)를 이끌어 감사 이유를 나타내는 전치사입니다.'),
      makeToken('giving', 'V', '동명사(동사성질)', 'V', '동사/동명사 (V)', '주신 것', '전치사 for의 목적어로 쓰인 동명사이며, 뒤의 me(IO)와 heads-up(DO)을 거느립니다.'),
      makeToken('me', 'IO', '간접목적어 (IO)', 'Pron', '대명사 (Pron)', '나에게', 'giving의 받는 대상인 간접목적어(IO)입니다.'),
      makeToken('a', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '하나의', '명사구 a quick heads-up을 여는 부정관사입니다.'),
      makeToken('quick', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '빠른, 간단한', '명사 heads-up을 꾸며주는 형용사 수식어(M)입니다.'),
      makeToken('heads-up', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '사전 귀띔을', 'giving의 직접목적어(DO) 역할을 하는 핵심 명사입니다.'),
      makeToken('on', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~에 관한', '뒤의 the schedule과 결합해 heads-up의 주제를 설명하는 전치사입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '명사 schedule을 한정하는 정관사입니다.'),
      makeToken('schedule.', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '일정', '전치사 on의 목적어로 결합되어 수식어구(on the schedule, M)를 완성합니다.'),
    ],
  },
  'could you please expedite the approval process before friday?': {
    title: '테마 1 중급 · 3형식 정중한 요청 의문문',
    rawEn: 'Could you please expedite the approval process before Friday?',
    naturalKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
    skeleton: 'Could[조동사] + you[S] + please[M] + expedite[V] + the approval process[DO] + before Friday[M]?',
    patternType: '3형식 의문문 (Could + S + V + DO + M)',
    wordOrderTip:
      '정중한 요청을 나타내는 Could you please 뒤에 타동사 원형 expedite와 목적어(the approval process)가 바로 이어지며, approval은 뒤 명사 process를 꾸미는 명사 수식어(M-N)입니다.',
    isHeuristic: false,
    tokens: [
      makeToken('Could', 'V', '조동사 (V)', 'V', '조동사 (V)', '~해주실 수 있나요', '정중한 요청 의문문을 만드는 조동사입니다.'),
      makeToken('you', 'S', '주어 (S)', 'Pron', '대명사 (Pron)', '당신이', '문장의 주어(S) 대명사입니다.'),
      makeToken('please', 'M', '수식어 (M)', 'Adv', '부사 (Adv)', '부디, 제발', '요청의 정중함을 높여주는 부사입니다.'),
      makeToken('expedite', 'V', '본동사 (V)', 'V', '동사 (V)', '신속히 처리하다', '조동사 Could와 결합하는 문장의 3형식 본동사(V)입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '목적어 명사구를 한정하는 정관사입니다.'),
      makeToken('approval', 'M', '명사수식어 (M)', 'N', '명사 (N)', '승인, 결재', '뒤 명사 process를 앞에서 수식하는 복합명사 수식어(M-N)입니다.'),
      makeToken('process', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '절차를', '타동사 expedite의 직접목적어(DO) 핵심 명사입니다.'),
      makeToken('before', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~전에', '기한을 나타내는 시간 전치사입니다.'),
      makeToken('Friday?', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '금요일', '전치사 before와 결합해 시간 부사구(M)를 이룹니다.'),
    ],
  },
  'streamlining the workflow makes the tentative schedule feasible.': {
    title: '테마 1 고급 · 동명사구 주어 & 5형식 형용사 목적격보어(OC)',
    rawEn: 'Streamlining the workflow makes the tentative schedule feasible.',
    naturalKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
    skeleton: 'Streamlining the workflow[S:동명사구] + makes[V] + the tentative schedule[DO] + feasible[OC].',
    patternType: '5형식 (동명사구 S + 단수 V + DO + 형용사 OC)',
    wordOrderTip:
      '문두의 Streamlining은 콤마 없이 동사 makes로 이어지므로 동명사구 주어(S)이며, 목적어(the tentative schedule) 뒤의 feasible은 상태를 설명하는 목적격보어(OC)입니다.',
    isHeuristic: false,
    tokens: [
      makeToken('Streamlining', 'S', '주어 (S)', 'N', '동명사 (N역할)', '간소화하는 것은', '뒤의 the workflow를 목적어로 취해 문장 전체의 주어(S) 역할을 하는 동명사입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '명사 workflow를 한정하는 정관사입니다.'),
      makeToken('workflow', 'DO', '준동사의 목적어', 'N', '명사 (N)', '업무 공정을', '동명사 Streamlining의 목적어로 결합되어 주어구를 완성합니다.'),
      makeToken('makes', 'V', '동사 (V)', 'V', '동사 (V)', '만든다', '동명사구 주어에 단수 수일치된 5형식 본동사(V)입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '목적어 schedule을 한정하는 정관사입니다.'),
      makeToken('tentative', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '잠정적인', '명사 schedule을 앞에서 꾸며주는 형용사 수식어(M)입니다.'),
      makeToken('schedule', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '일정을', '5형식 동사 makes의 직접목적어(DO)입니다.'),
      makeToken('feasible.', 'OC', '목적격보어 (OC)', 'Adj', '형용사 (Adj)', '실현 가능한(가능하게)', '목적어(schedule)의 상태를 보충 설명하는 목적격보어(OC) 형용사입니다.'),
    ],
  },
  'streamlining the approval process makes the entire project feasible within the deadline.': {
    title: '5형식 대표 구문 · 전치사구 앞 목적격보어(OC) 판별',
    rawEn: 'Streamlining the approval process makes the entire project feasible within the deadline.',
    naturalKo: '승인 절차를 간소화하는 것은 마감일 내에 전체 프로젝트를 실현 가능하게 만든다.',
    skeleton: 'Streamlining the approval process[S] + makes[V] + the entire project[DO] + feasible[OC] + within the deadline[M].',
    patternType: '5형식 (S + V + DO + 형용사 OC + 전치사구 M)',
    wordOrderTip:
      'feasible 뒤에 전치사구(within the deadline)가 붙어 있더라도, 5형식 동사 makes와 목적어(the entire project) 바로 뒤에서 목적어의 상태를 설명하므로 feasible은 목적격보어(OC)입니다.',
    isHeuristic: false,
    tokens: [
      makeToken('Streamlining', 'S', '주어 (S)', 'N', '동명사 (N역할)', '간소화하는 것은', '동명사구 주어(S)의 핵심어입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '정관사입니다.'),
      makeToken('approval', 'M', '명사수식어 (M)', 'N', '명사 (N)', '승인', '뒤 명사 process를 꾸미는 명사 수식어(M-N)입니다.'),
      makeToken('process', 'DO', '준동사의 목적어', 'N', '명사 (N)', '절차를', '동명사 Streamlining의 목적어입니다.'),
      makeToken('makes', 'V', '동사 (V)', 'V', '동사 (V)', '만든다', '단수 수일치된 5형식 본동사(V)입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '정관사입니다.'),
      makeToken('entire', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '전체의', '명사 project를 꾸미는 형용사 수식어(M)입니다.'),
      makeToken('project', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '프로젝트를', 'makes의 직접목적어(DO)입니다.'),
      makeToken('feasible', 'OC', '목적격보어 (OC)', 'Adj', '형용사 (Adj)', '실현 가능한', '목적어(project)의 상태를 보충 설명하는 목적격보어(OC)입니다.'),
      makeToken('within', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~이내에', '기한을 나타내는 전치사입니다.'),
      makeToken('the', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '정관사입니다.'),
      makeToken('deadline.', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '마감일', '전치사 within의 목적어로 부사구(M)를 완성합니다.'),
    ],
  },
  'this quiet cafe is my go-to spot on weekends.': {
    title: '테마 2 초급 · 2형식 be동사 + 명사구 주격보어(SC)',
    rawEn: 'This quiet cafe is my go-to spot on weekends.',
    naturalKo: '이 조용한 카페는 내가 주말마다 늘 찾는 단골 장소이다.',
    skeleton: 'This quiet cafe[S] + is[V] + my go-to spot[SC] + on weekends[M].',
    patternType: '2형식 (S + V + 명사구 SC + M)',
    wordOrderTip:
      '주어(This quiet cafe)와 주격보어(my go-to spot)가 동격 관계를 이루는 2형식 문장입니다.',
    isHeuristic: false,
    tokens: [
      makeToken('This', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '이', '명사 cafe를 가리키는 지시한정사입니다.'),
      makeToken('quiet', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '조용한', '명사 cafe를 꾸미는 형용사 수식어(M)입니다.'),
      makeToken('cafe', 'S', '주어 (S)', 'N', '명사 (N)', '카페는', '문장의 핵심 주어(S) 명사입니다.'),
      makeToken('is', 'V', '동사 (V)', 'V', '동사 (V)', '~이다', '주어와 보어를 이어주는 2형식 연결동사(be동사)입니다.'),
      makeToken('my', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '나의', '소유격 한정사(Det)입니다.'),
      makeToken('go-to', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '늘 믿고 찾는(단골의)', '명사 spot을 앞에서 꾸며주는 복합 형용사(M)입니다.'),
      makeToken('spot', 'SC', '주격보어 (SC)', 'N', '명사 (N)', '장소(이다)', 'be동사(is) 뒤에서 주어가 어떤 곳인지 설명하는 주격보어(SC)입니다.'),
      makeToken('on', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~마다', '요일·주말 앞에 쓰이는 시간 전치사입니다.'),
      makeToken('weekends.', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '주말', 'on과 결합해 "주말마다"라는 시간 부사구(M)를 이룹니다.'),
    ],
  },
  'i always stick to my daily workout routine to clear my head.': {
    title: '테마 2 중급 · 자동사 stick + 전치사구(to + 명사구) + 목적의 to부정사구',
    rawEn: 'I always stick to my daily workout routine to clear my head.',
    naturalKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
    skeleton: 'I[S] + always[M] + stick[V] + to my daily workout routine[M:전치사구] + to clear my head[M:목적].',
    patternType: '1형식 동사 + 전치사구 보충어(M) + 부사적 to부정사구(M)',
    wordOrderTip:
      '앞의 to는 자동사 stick과 결합해 전치사의 목적어(my daily workout routine, M)를 이끄는 전치사이고, 뒤의 to는 동사원형 clear를 이끌어 목적(~하기 위해)을 나타내는 to부정사 표지입니다.',
    isHeuristic: false,
    tokens: [
      makeToken('I', 'S', '주어 (S)', 'Pron', '대명사 (Pron)', '나는', '문장의 주어(S)입니다.'),
      makeToken('always', 'M', '수식어 (M)', 'Adv', '부사 (Adv)', '항상', '일반동사 stick 앞에서 빈도를 나타내는 빈도부사(M)입니다.'),
      makeToken('stick', 'V', '동사 (V)', 'V', '동사 (V)', '지키다, 고수하다', '전치사 to와 결합해 "~을 고수하다"를 뜻하는 본동사(V)입니다.'),
      makeToken('to', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~을(에)', '뒤에 명사구 목적어(my daily workout routine)를 이끌어 전치사구(M)를 형성합니다.'),
      makeToken('my', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '나의', '소유격 한정사입니다.'),
      makeToken('daily', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '매일의', '뒤 명사구를 꾸미는 형용사입니다.'),
      makeToken('workout', 'M', '명사수식어 (M)', 'N', '명사 (N)', '운동', '명사 routine을 앞에서 수식하는 복합명사 수식어(M-N)입니다.'),
      makeToken('routine', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '루틴을', '전치사 to의 목적어로 결합되어 전치사구(to my daily workout routine, M)를 완성합니다.'),
      makeToken('to', 'M', 'to부정사 표지 (M)', 'Prep', 'to부정사 표지', '~하기 위해', '뒤에 동사원형 clear를 이끌어 목적 부사구(M)를 만드는 to부정사입니다.'),
      makeToken('clear', 'M', '준동사 (목적)', 'V', '동사원형 (V)', '맑게 식히다', 'to부정사구를 이루는 동사원형입니다.'),
      makeToken('my', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '나의', '소유격 한정사입니다.'),
      makeToken('head.', 'DO', '준동사의 목적어', 'N', '명사 (N)', '머리를', '준동사 clear의 목적어로 결합되어 to clear my head를 완성합니다.'),
    ],
  },
  'reading diverse texts broadens our perspective on life.': {
    title: '테마 2 고급 · 동명사구 주어(Reading ~)와 단수 동사 수일치',
    rawEn: 'Reading diverse texts broadens our perspective on life.',
    naturalKo: '다양한 글을 읽는 것은 삶에 대한 우리의 시야를 넓혀준다.',
    skeleton: 'Reading diverse texts[S:동명사구] + broadens[V] + our perspective[DO] + on life[M].',
    patternType: '3형식 (동명사구 S + 단수 V + DO + M)',
    wordOrderTip:
      '동사 바로 앞의 texts(복수)에 현혹되지 않고 주어구의 핵심인 동명사 Reading에 맞춰 단수 동사 broadens를 씁니다.',
    isHeuristic: false,
    tokens: [
      makeToken('Reading', 'S', '주어 (S)', 'N', '동명사 (N역할)', '읽는 것은', '문장 전체의 주어(S) 핵심이 되는 동명사입니다.'),
      makeToken('diverse', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '다양한', '명사 texts를 꾸며주는 형용사 수식어(M)입니다.'),
      makeToken('texts', 'DO', '준동사의 목적어', 'N', '명사 (N)', '글들을', '동명사 Reading의 의미상 목적어입니다.'),
      makeToken('broadens', 'V', '동사 (V)', 'V', '동사 (V)', '넓혀준다', '동명사구 주어(단수)에 수일치된 3형식 본동사(V)입니다.'),
      makeToken('our', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '우리의', '소유격 한정사(Det)입니다.'),
      makeToken('perspective', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '시야(관점)를', '타동사 broadens의 직접목적어(DO)입니다.'),
      makeToken('on', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~에 대한', 'perspective의 대상을 연결하는 전치사입니다.'),
      makeToken('life.', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '삶', '전치사 on의 목적어로 수식어구(on life)를 완성합니다.'),
    ],
  },
  'the collection seamlessly blends classic heritage with a modern aesthetic.': {
    title: '테마 5 고급 · 3형식 blend A with B 구문',
    rawEn: 'The collection seamlessly blends classic heritage with a modern aesthetic.',
    naturalKo: '그 컬렉션은 고전적 유산과 현대적인 미학을 조화롭게 결합한다.',
    skeleton: 'The collection[S] + seamlessly[M] + blends[V] + classic heritage[DO] + with a modern aesthetic[M].',
    patternType: '3형식 (S + 부사 M + V + DO + 전치사구 M)',
    wordOrderTip:
      '부사 seamlessly는 동사 blends 앞에서 동작 방식을 꾸며주고, 타동사 blends 뒤에 목적어(classic heritage)와 전치사구(with a modern aesthetic)가 이어집니다.',
    isHeuristic: false,
    tokens: [
      makeToken('The', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '그', '주어 명사 collection을 한정하는 정관사입니다.'),
      makeToken('collection', 'S', '주어 (S)', 'N', '명사 (N)', '컬렉션은', '문장의 단수 주어(S) 명사입니다.'),
      makeToken('seamlessly', 'M', '수식어 (M)', 'Adv', '부사 (Adv)', '매끄럽게, 조화롭게', '뒤의 동사 blends를 수식하는 방식 부사(M)입니다.'),
      makeToken('blends', 'V', '동사 (V)', 'V', '동사 (V)', '결합한다', '단수 주어에 수일치된 3형식 타동사(V)입니다.'),
      makeToken('classic', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '고전적인', '명사 heritage를 꾸미는 형용사 수식어(M)입니다.'),
      makeToken('heritage', 'DO', '직접목적어 (DO)', 'N', '명사 (N)', '유산(헤리티지)을', '타동사 blends의 직접목적어(DO)입니다.'),
      makeToken('with', 'M', '전치사구 (M)', 'Prep', '전치사 (Prep)', '~와', 'blend A with B 구조를 이루는 전치사입니다.'),
      makeToken('a', 'M', '한정수식 (M)', 'Det', '한정사 (Det)', '하나의', '명사 aesthetic을 한정하는 부정관사입니다.'),
      makeToken('modern', 'M', '수식어 (M)', 'Adj', '형용사 (Adj)', '현대적인', '명사 aesthetic을 꾸미는 형용사 수식어(M)입니다.'),
      makeToken('aesthetic.', 'M', '전치사 목적어 (M)', 'N', '명사 (N)', '미학', '전치사 with의 목적어로 결합되어 부사구(M)를 완성합니다.'),
    ],
  },
};

const KNOWN_DETERMINERS = new Set([
  'a', 'an', 'the', 'my', 'our', 'your', 'his', 'her', 'its', 'their',
  'this', 'that', 'these', 'those', 'every', 'each', 'some', 'any', 'no',
]);

const KNOWN_PREPOSITIONS = new Set([
  'in', 'on', 'at', 'for', 'with', 'by', 'from', 'of', 'into', 'onto',
  'upon', 'within', 'without', 'during', 'before', 'after', 'through',
  'across', 'among', 'between', 'under', 'over', 'about', 'around',
]);

const KNOWN_CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'so', 'because', 'although', 'though', 'if',
  'unless', 'until', 'when', 'while', 'whereas', 'whether', 'provided',
]);

const KNOWN_PRONOUNS = new Set([
  'i', 'we', 'you', 'he', 'she', 'it', 'they', 'me', 'us', 'him', 'her',
  'them', 'myself', 'yourself', 'ourselves', 'themselves', 'everyone',
  'everything', 'someone', 'anyone', 'what', 'which', 'who',
]);

const KNOWN_AUX_AND_VERBS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'do', 'does', 'did', 'have', 'has', 'had',
  'check', 'checked', 'checks', 'improve', 'improves', 'recommend', 'make', 'makes', 'made',
  'miss', 'protect', 'give', 'gives', 'giving', 'communicate', 'concentrate',
  'participate', 'participated', 'encourage', 'encouraged', 'recognize', 'appreciate',
  'broaden', 'broadens', 'occur', 'occurred', 'boost', 'boosts', 'analyze', 'analyzed',
  'overcome', 'foster', 'fosters', 'transcend', 'transcends', 'prevent', 'prevents',
  'remain', 'remained', 'last', 'lasts', 'build', 'builds', 'focus', 'shift', 'shifted',
  'support', 'supported', 'consolidate', 'consolidates', 'grant', 'increase', 'increases',
  'demonstrate', 'streamline', 'streamlined', 'expedite', 'set', 'accommodate', 'accommodated',
  'include', 'includes', 'spearhead', 'spearheaded', 'complement', 'complements',
  'praise', 'praised', 'showcase', 'showcases', 'negotiate', 'negotiated', 'collaborate',
  'collaborated', 'implement', 'prioritize', 'allocate', 'leverage', 'unwind', 'pulled',
  'pull', 'wrap', 'touch', 'visit', 'visits', 'visited', 'drop', 'freshen', 'binge-watch',
  'binge-watched', 'went', 'go', 'goes', 'live', 'lived', 'hit', 'clear', 'stick',
  'recharge', 'try', 'keep', 'keeps', 'kept', 'grab', 'blend', 'blends', 'capture',
  'resonate', 'resonates', 'step', 'expose', 'exposing', 'matter', 'matters', 'seem',
  'take', 'takes', 'taking', 'help', 'helps', 'helped', 'study', 'studies', 'studied',
  'work', 'works', 'worked', 'read', 'reads', 'write', 'writes', 'speak', 'speaks',
  'listen', 'listens', 'watch', 'watches', 'learn', 'learns', 'use', 'uses', 'used',
  'create', 'creates', 'created', 'add', 'added', 'plan', 'plans', 'enjoy', 'enjoys',
  'find', 'finds', 'found', 'consider', 'considers', 'know', 'knows', 'think', 'thinks',
]);

const LINKING_VERBS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'become', 'becomes', 'became',
  'remain', 'remained', 'remains', 'seem', 'seems', 'seemed', 'feel', 'feels', 'felt',
  'look', 'looks', 'looked', 'went',
]);

const FIVE_PATTERN_VERBS = new Set([
  'make', 'makes', 'made', 'keep', 'keeps', 'kept', 'find', 'finds', 'found',
  'consider', 'considers', 'considered', 'help', 'helps', 'helped',
]);

const KNOWN_ADJECTIVES = new Set([
  'available', 'comfortable', 'essential', 'independent', 'responsible', 'confident',
  'creative', 'significant', 'inevitable', 'cognitive', 'ambiguous', 'intrinsic',
  'sustainable', 'empirical', 'reciprocal', 'predominant', 'feasible', 'tentative',
  'complimentary', 'viral', 'go-to', 'informative', 'chic', 'bold', 'tailored',
  'minimalist', 'modern', 'classic', 'quiet', 'quick', 'golden', 'natural', 'valuable',
  'good', 'strong', 'diverse', 'major', 'new', 'entire', 'close', 'solid', 'scientific',
  'complex', 'systematic', 'consistent', 'daily', 'long-term', 'late', 'much', 'more',
  'intellectual', 'open-minded', 'updated', 'structured', 'mutually', 'beneficial',
  'urgent', 'impactful', 'short', 'whole', 'calm', 'special', 'high', 'timeless', 'practical',
]);

const KNOWN_ADVERBS = new Set([
  'carefully', 'highly', 'clearly', 'simultaneously', 'meticulously', 'seamlessly',
  'genuinely', 'effectively', 'efficiently', 'gladly', 'kindly', 'definitely',
  'really', 'always', 'usually', 'often', 'overnight', 'today', 'abroad', 'best',
  'again', 'somewhat', 'actually', 'heavily', 'closely', 'first', 'well', 'deeply',
  'effortlessly', 'not', 'only', 'never', 'here', 'there', 'honestly', 'thankfully',
]);

export function buildDynamicDiagramSentence(
  rawEn: string,
  naturalKo: string,
  tagLabel: string = '실전 구문 분석'
): DiagramSentence {
  const normalizedKey = (rawEn || '').trim().toLowerCase();

  // 1. 사전 검증된 문장 맵에 일치할 경우: 토큰은 그대로 유지하되 전달받은 naturalKo와 tagLabel을 반영 (#40)
  const exactMatch = VERIFIED_SENTENCE_TOKEN_MAP[normalizedKey];
  if (exactMatch) {
    return {
      ...exactMatch,
      naturalKo: naturalKo || exactMatch.naturalKo,
      title: tagLabel ? `${tagLabel} · ${exactMatch.title}` : exactMatch.title,
    };
  }

  const exampleMatch = DIAGRAM_EXAMPLES.find(
    (ex) => ex.rawEn.trim().toLowerCase() === normalizedKey
  );
  if (exampleMatch) {
    return {
      ...exampleMatch,
      naturalKo: naturalKo || exampleMatch.naturalKo,
      title: tagLabel ? `${tagLabel} · ${exampleMatch.title}` : exampleMatch.title,
    };
  }

  // 2. 미등록 문장에 대한 문맥 기반 추정 분류기
  const words = (rawEn || 'We need to check the schedule today.')
    .trim()
    .split(/\s+/);

  // 문두 -ing가 콤마(,)로 분리된 분사구문인지 아니면 본동사로 직결되는 동명사구 주어인지 사전 스캔
  const firstCommaIdx = words.findIndex((w) => w.endsWith(','));
  const firstVerbIdx = words.findIndex((w, i) =>
    i > 0 && KNOWN_AUX_AND_VERBS.has(w.toLowerCase().replace(/[^a-z-]/g, ''))
  );
  const isIntroParticipleClause =
    words[0]?.toLowerCase().replace(/[^a-z-]/g, '').endsWith('ing') &&
    firstCommaIdx !== -1 &&
    (firstVerbIdx === -1 || firstCommaIdx < firstVerbIdx);

  let mainVerbFound = false;
  let mainVerbWord = '';
  let directObjectFound = false;
  let insidePrepositionPhrase = false;

  const tokens: DiagramToken[] = words.map((rawWord, idx) => {
    const clean = rawWord.toLowerCase().replace(/[^a-z-]/g, '');
    const prevClean =
      idx > 0 ? words[idx - 1].toLowerCase().replace(/[^a-z-]/g, '') : '';
    const nextClean =
      idx < words.length - 1
        ? words[idx + 1].toLowerCase().replace(/[^a-z-]/g, '')
        : '';

    // 1) 문두 -ing 판별: 콤마로 분리된 분사구문(M) vs 동명사구 주어(S)
    if (idx === 0 && clean.endsWith('ing')) {
      if (isIntroParticipleClause) {
        return makeToken(
          rawWord,
          'M',
          '분사구문 수식 (M)',
          'V',
          '현재분사 (V-ing)',
          '~하면서 / ~할 때',
          '콤마(,) 앞까지 분사구문을 이끌며 주절 전체를 수식하는 부사구(M) 역할을 수행합니다.'
        );
      }
      return makeToken(
        rawWord,
        'S',
        '동명사구 주어 (S)',
        'N',
        '동명사 (N역할)',
        '~하는 것은',
        '문장 맨 앞에서 동명사구 주어(S)를 이끄는 핵심어입니다.'
      );
    }

    // 2) to부정사(to + 동사원형) vs 전치사 to 구별
    if (clean === 'to') {
      if (KNOWN_AUX_AND_VERBS.has(nextClean)) {
        insidePrepositionPhrase = false;
        return makeToken(
          rawWord,
          'M',
          'to부정사 표지',
          'Prep',
          'to부정사 (to+V)',
          '~하기 위해 / ~하는 것',
          '뒤에 동사원형을 이끌어 to부정사구를 만드는 표지입니다.'
        );
      }
      insidePrepositionPhrase = true;
      return makeToken(
        rawWord,
        'M',
        '전치사구 (M)',
        'Prep',
        '전치사 (Prep)',
        '~에게 / ~로',
        '뒤에 명사구를 이끄는 전치사입니다.'
      );
    }

    // 3) 한정사 (관사·소유격·지시사)
    if (KNOWN_DETERMINERS.has(clean)) {
      return makeToken(
        rawWord,
        'M',
        '한정수식 (M)',
        'Det',
        '한정사 (Det)',
        '관사/한정사',
        '명사구 앞에서 명사의 범위나 소유를 한정하는 한정사(Det)입니다.'
      );
    }

    // 4) 접속사
    if (KNOWN_CONJUNCTIONS.has(clean)) {
      insidePrepositionPhrase = false;
      return makeToken(
        rawWord,
        'M',
        '연결어 (M)',
        'Conj',
        '접속사 (Conj)',
        '접속사',
        '단어·구·절을 논리적으로 이어주는 접속사(Conj)입니다.'
      );
    }

    // 5) 전치사
    if (KNOWN_PREPOSITIONS.has(clean)) {
      insidePrepositionPhrase = true;
      return makeToken(
        rawWord,
        'M',
        '전치사구 (M)',
        'Prep',
        '전치사 (Prep)',
        '전치사',
        '뒤의 명사구와 결합해 전치사구(수식어 M 또는 보어 SC)를 형성합니다.'
      );
    }

    // 6) 부사
    if (
      KNOWN_ADVERBS.has(clean) ||
      (clean.endsWith('ly') && clean !== 'family' && clean !== 'friendly')
    ) {
      return makeToken(
        rawWord,
        'M',
        '수식어 (M)',
        'Adv',
        '부사 (Adv)',
        '부사(수식)',
        '동사·형용사·문장을 꾸며주는 부사 수식어(M)입니다.'
      );
    }

    // 7) 형용사 (명사 앞 수식어 M vs 2형식 SC vs 5형식 전치사구 앞/문장 끝 OC 정밀 분기)
    if (KNOWN_ADJECTIVES.has(clean)) {
      const followedByBoundaryOrPrep =
        idx === words.length - 1 ||
        /[,.;!?]$/.test(rawWord) ||
        KNOWN_PREPOSITIONS.has(nextClean) ||
        KNOWN_CONJUNCTIONS.has(nextClean) ||
        KNOWN_ADVERBS.has(nextClean) ||
        nextClean === 'to';

      if (
        mainVerbFound &&
        FIVE_PATTERN_VERBS.has(mainVerbWord) &&
        directObjectFound &&
        followedByBoundaryOrPrep &&
        !insidePrepositionPhrase
      ) {
        return makeToken(
          rawWord,
          'OC',
          '목적격보어 (OC)',
          'Adj',
          '형용사 (Adj)',
          '목적어 상태 보충',
          '5형식 동사와 목적어(DO) 뒤에서 목적어의 상태를 보충 설명하는 목적격보어(OC)입니다.'
        );
      }
      if (
        mainVerbFound &&
        LINKING_VERBS.has(mainVerbWord) &&
        followedByBoundaryOrPrep &&
        !insidePrepositionPhrase
      ) {
        return makeToken(
          rawWord,
          'SC',
          '주격보어 (SC)',
          'Adj',
          '형용사 (Adj)',
          '주어 상태 보충',
          '2형식 연결동사 뒤에서 주어(S)의 상태를 보충 설명하는 주격보어(SC)입니다.'
        );
      }
      return makeToken(
        rawWord,
        'M',
        '수식어 (M)',
        'Adj',
        '형용사 (Adj)',
        '명사 수식 형용사',
        '뒤에 오는 명사를 꾸며주는 형용사 수식어(M)입니다.'
      );
    }

    // 8) 동사 (사전 등록 동사 + 주어 뒤 굴절 어미 패턴 추정)
    const looksLikeInflectedVerb =
      !mainVerbFound &&
      idx > 0 &&
      !insidePrepositionPhrase &&
      !KNOWN_DETERMINERS.has(prevClean) &&
      !KNOWN_ADJECTIVES.has(prevClean) &&
      (clean.endsWith('ed') ||
        clean.endsWith('ize') ||
        clean.endsWith('ate') ||
        clean.endsWith('ify') ||
        (KNOWN_PRONOUNS.has(prevClean) && clean.endsWith('s')));

    if (KNOWN_AUX_AND_VERBS.has(clean) || looksLikeInflectedVerb) {
      if (prevClean === 'to') {
        return makeToken(
          rawWord,
          'M',
          'to부정사 동사원형',
          'V',
          '준동사 (to V)',
          '~하다(부정사)',
          '앞의 to와 결합해 to부정사구를 이루는 동사원형입니다.'
        );
      }
      mainVerbFound = true;
      mainVerbWord = clean;
      insidePrepositionPhrase = false;
      return makeToken(
        rawWord,
        'V',
        '동사 (V)',
        'V',
        '동사 (V)',
        '서술어(동사)',
        '문장의 동작이나 상태를 서술하는 핵심 동사(V)입니다.'
      );
    }

    // 9) 대명사
    if (KNOWN_PRONOUNS.has(clean)) {
      if (!mainVerbFound) {
        return makeToken(
          rawWord,
          'S',
          '주어 (S)',
          'Pron',
          '대명사 (Pron)',
          '주어 대명사',
          '문장의 주체가 되는 주어(S) 대명사입니다.'
        );
      }
      if (
        prevClean === 'give' ||
        prevClean === 'gives' ||
        prevClean === 'giving'
      ) {
        return makeToken(
          rawWord,
          'IO',
          '간접목적어 (IO)',
          'Pron',
          '대명사 (Pron)',
          '~에게',
          '4형식 수여동사 뒤에서 대상을 받는 간접목적어(IO)입니다.'
        );
      }
      directObjectFound = true;
      return makeToken(
        rawWord,
        'DO',
        '목적어 (DO)',
        'Pron',
        '대명사 (Pron)',
        '목적어 대명사',
        '동사의 대상이 되는 목적격 대명사입니다.'
      );
    }

    // 10) 일반 명사 (본동사 앞 주어 S / 전치사구 내부 M / 2형식 보어 SC / 타동사 목적어 DO)
    if (!mainVerbFound) {
      if (isIntroParticipleClause && firstCommaIdx !== -1 && idx <= firstCommaIdx) {
        return makeToken(
          rawWord,
          'M',
          '분사구문 내부 (M)',
          'N',
          '명사 (N)',
          '분사구문 목적어/수식어',
          '문두 분사구문 내부를 구성하는 명사(M)입니다.'
        );
      }
      return makeToken(
        rawWord,
        'S',
        '주어 (S)',
        'N',
        '명사 (N)',
        '주어 명사',
        '본동사 앞에서 문장의 주체 역할을 하는 주어(S) 명사입니다.'
      );
    }
    if (insidePrepositionPhrase) {
      if (/[,.;!?]$/.test(rawWord)) insidePrepositionPhrase = false;
      return makeToken(
        rawWord,
        'M',
        '전치사 목적어 (M)',
        'N',
        '명사 (N)',
        '전치사구 명사',
        '앞의 전치사와 결합하여 전치사구(수식어 M)를 완성하는 명사입니다.'
      );
    }
    if (LINKING_VERBS.has(mainVerbWord)) {
      return makeToken(
        rawWord,
        'SC',
        '주격보어 (SC)',
        'N',
        '명사 (N)',
        '보어 명사',
        '2형식 연결동사 뒤에서 주어를 보충 설명하는 주격보어(SC) 명사입니다.'
      );
    }
    directObjectFound = true;
    return makeToken(
      rawWord,
      'DO',
      '직접목적어 (DO)',
      'N',
      '명사 (N)',
      '목적어 명사',
      '타동사의 동작 대상이 되는 직접목적어(DO) 명사입니다.'
    );
  });

  return {
    title: `${tagLabel} (문맥 규칙 기반 추정 분류)`,
    rawEn,
    naturalKo,
    skeleton: '주어부(S) + 서술어 동사(V) + 목적어/보어(O/C) + 수식어구(M)',
    patternType: '추정 분류 (사전 미등록 문장에 대한 문맥 규칙 추정)',
    wordOrderTip:
      '각 단어 카드를 클릭하면 위의 16개 문법 노드(7성분 + 9품사) 다이어그램에서 해당 결합선이 하이라이트됩니다.',
    isHeuristic: true,
    tokens,
  };
}
// ============================================================================
// src/App.tsx — [파트 4/4]
// - SSR 안전 로컬스토리지 파서(readStorageJson / readStorageString) 및 KST 시간 유틸리티
// - 표제어 단독 스피커 · 1교시 정답 1~4번 무작위 분산 · 빈칸 정답 스포일러 가림 토글
// - 2교시 어순 조립 중복 방지 및 개별 취소 · 규칙 기반 문장 점검 코치 · 필압 반영 펜슬 엔진
// ============================================================================

function readStorageJson<T>(storageKey: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readStorageString(storageKey: string, fallback: string): string {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw !== null ? raw : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageString(storageKey: string, value: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // ignore storage quota errors
  }
}

function getKstTimestampString(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  return `${map.year}.${map.month}.${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

function getKstDayOfYear(): number {
  const now = new Date();
  const kstStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [y, m, d] = kstStr.split('-').map(Number);
  const start = Date.UTC(y, 0, 0);
  const current = Date.UTC(y, (m || 1) - 1, d || 1);
  return Math.max(1, Math.floor((current - start) / (1000 * 60 * 60 * 24)));
}

const COMP_COORDS: Record<CompId, { x: number; y: number; short: string }> = {
  S: { x: 85, y: 72, short: '주어(S)' },
  V: { x: 205, y: 72, short: '동사(V)' },
  IO: { x: 325, y: 72, short: '간접목적(IO)' },
  DO: { x: 445, y: 72, short: '직접목적(DO)' },
  SC: { x: 565, y: 72, short: '주격보어(SC)' },
  OC: { x: 685, y: 72, short: '목적보어(OC)' },
  M: { x: 805, y: 72, short: '수식어(M)' },
};

const POS_COORDS: Record<PosId, { x: number; y: number; short: string }> = {
  N: { x: 65, y: 255, short: '명사(N)' },
  Pron: { x: 160, y: 255, short: '대명사(Pron)' },
  V: { x: 255, y: 255, short: '동사(V)' },
  Adj: { x: 350, y: 255, short: '형용사(Adj)' },
  Adv: { x: 445, y: 255, short: '부사(Adv)' },
  Prep: { x: 540, y: 255, short: '전치사(Prep)' },
  Conj: { x: 635, y: 255, short: '접속사(Conj)' },
  Det: { x: 730, y: 255, short: '한정사(Det)' },
  Interj: { x: 825, y: 255, short: '감탄사(Interj)' },
};

export default function App() {
  // 1. 코어 내비게이션 & 테마 상태
  const [selectedThemeId, setSelectedThemeId] = useState<string>(THEMES[0].id);
  const [learningLevel, setLearningLevel] = useState<LearningLevel>('intermediate');
  const [activeMode, setActiveMode] = useState<
    'daily' | 'examCourses' | 'wordbook' | 'myVault' | 'curriculum' | 'devStory'
  >('daily');
  const [selectedExamTrackId, setSelectedExamTrackId] =
    useState<ExamTrackId>('CSAT_MASTER');
  const [activeModulePeriod, setActiveModulePeriod] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 2. UI 환경 설정 (SSR 안전한 readStorageJson 사용으로 기존 저장값 완벽 복원)
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    readStorageJson('yanadu_dark_v1', false)
  );
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [colorTheme, setColorTheme] = useState<'blue' | 'emerald' | 'indigo' | 'amber'>('blue');
  const [layoutMode, setLayoutMode] = useState<'split' | 'wide'>('split');
  const [showPronGuide, setShowPronGuide] = useState<boolean>(true);
  const [hideWords, setHideWords] = useState<boolean>(false);
  const [hideMeanings, setHideMeanings] = useState<boolean>(false);
  const [revealedWordIds, setRevealedWordIds] = useState<number[]>([]);
  const [revealedBlankKeys, setRevealedBlankKeys] = useState<Record<string, boolean>>({});

  // 3. TTS 음성 합성 & 리딩 속도 5단계 (0.30x · 0.50x · 0.75x · 1.0x · 1.25x)
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsAccent, setTtsAccent] = useState<'en-US' | 'en-GB' | 'en-AU' | 'en-CA'>('en-US');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 4. 9대 매체 큐레이션 & 구글 뉴스 RSS 동기화 상태
  const [mediaPlatforms, setMediaPlatforms] =
    useState<MediaTrendPlatform[]>(INITIAL_MEDIA_PLATFORMS);
  const [activePlatformId, setActivePlatformId] =
    useState<MediaPlatformId>('FASHION_MAGS');
  const [selectedLiveKeyword, setSelectedLiveKeyword] =
    useState<MediaTrendKeyword | null>(null);
  const [isTrendSyncing, setIsTrendSyncing] = useState<boolean>(false);
  const [lastTrendSyncTime, setLastTrendSyncTime] = useState<string>(() =>
    readStorageString('yanadu_trend_sync_time', '기본 큐레이션 로드됨')
  );
  const [trendSyncStatus, setTrendSyncStatus] = useState<'curated' | 'rss_ok' | 'local_shuffle'>('curated');
  const [trendSyncCount, setTrendSyncCount] = useState<number>(0);
  const [liveDictData, setLiveDictData] = useState<{
    word: string;
    phonetic: string;
    definition: string;
    example: string;
    loading: boolean;
    notFound?: boolean;
  } | null>(null);

  // 5. STEP 3 (16노드 다이어그램 & 사전 탭 전환) 및 STEP 4/5 상태
  const [diagramTab, setDiagramTab] = useState<'all' | 'comp' | 'pos'>('all');
  const [diagramSourceMode, setDiagramSourceMode] = useState<'theme' | 'standard'>('theme');
  const [selectedStandardExIdx, setSelectedStandardExIdx] = useState<number>(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);
  const [focusedNode, setFocusedNode] = useState<{
    type: 'comp' | 'pos';
    id: CompId | PosId;
  } | null>(null);
  const [dictationInputs, setDictationInputs] = useState<Record<number, string>>({});
  const [begSelected, setBegSelected] = useState<number | null>(null);
  const [intSelected, setIntSelected] = useState<number | null>(null);
  const [advSelected, setAdvSelected] = useState<number[]>([]);
  const [writingInput, setWritingInput] = useState<string>('');
  const [showWritingModel, setShowWritingModel] = useState<boolean>(false);

  // 6. 1~5교시 실전 모듈 & 어순 배열(Scramble 인덱스 추적) 상태
  const [wordbookLevelFilter, setWordbookLevelFilter] = useState<
    '전체' | WordbookLevel
  >('전체');
  const [selectedWordbookDay, setSelectedWordbookDay] = useState<number>(1);
  const [vocabChallengeSetSeed, setVocabChallengeSetSeed] = useState<number>(1);
  const [syntaxGeneratorSeed, setSyntaxGeneratorSeed] = useState<number>(1);
  const [period1Answers, setPeriod1Answers] = useState<Record<string, number>>({});
  const [quiz406Answers, setQuiz406Answers] = useState<Record<number, 'A' | 'B'>>({});
  const [scramblePickedIndices, setScramblePickedIndices] = useState<
    Record<string, number[]>
  >({});
  const [customSchoolPassage, setCustomSchoolPassage] = useState<string>(
    'Not until we step out of our comfort zone can we genuinely broaden our perspective. Streamlining the approval process makes the entire project feasible within the deadline.'
  );
  const [examStepTrapAns, setExamStepTrapAns] = useState<Record<string, 'A' | 'B'>>({});
  const [examStepEssayInputs, setExamStepEssayInputs] = useState<Record<string, string>>({});
  const [examStepShowModel, setExamStepShowModel] = useState<Record<string, boolean>>({});

  // 7. 단어·문장 보관함 (readStorageJson으로 기존 저장 데이터 안전 복원)
  const [bookmarkedWords, setBookmarkedWords] = useState<SavedWordItem[]>(() =>
    readStorageJson('yanadu_words_v3', [
      {
        id: 'init-w-1',
        word: 'streamline',
        ipa: '/ˈstriːm.laɪn/',
        pron: '[스트림라인]',
        meaning: '(업무·절차를) 간소화하다, 효율화하다',
        collocation: 'streamline the workflow',
        posLabel: '동사 (V)',
        compLabel: '동사 (V)',
        levelBadge: '비즈니스 핵심',
        customNote: '불필요한 단계를 줄여 능률을 높일 때 사용',
        mastered: false,
      },
      {
        id: 'init-w-2',
        word: 'feasible',
        ipa: '/ˈfiː.zə.bəl/',
        pron: '[피저블]',
        meaning: '실현 가능한, 실행할 수 있는',
        collocation: 'make the schedule feasible',
        posLabel: '형용사 (Adj)',
        compLabel: '목적격보어 (OC)',
        levelBadge: '수능·실무 필수',
        customNote: '5형식 make + O + 형용사 보어(OC) 주의',
        mastered: false,
      },
    ])
  );
  const [savedSentences, setSavedSentences] = useState<SavedSentenceItem[]>(() =>
    readStorageJson('yanadu_sents_v3', [
      {
        id: 'init-s-1',
        en: 'Streamlining the approval process makes the entire project feasible.',
        pron: '[스트림라이닝 디 어프루벌 프로세스 / 메익스 디 인타이어 프로젝트 피저블]',
        ko: '승인 절차를 간소화하는 것은 전체 프로젝트를 실현 가능하게 만든다.',
        note: '동명사구 주어(단수) + 5형식 makes + 목적격보어 feasible(형용사)',
        category: '5형식 핵심 구문',
        mastered: false,
      },
    ])
  );
  const [newWordForm, setNewWordForm] = useState({
    word: '',
    pron: '',
    meaning: '',
    collocation: '',
    note: '',
  });
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWordDraft, setEditingWordDraft] = useState({
    meaning: '',
    customNote: '',
  });
  const [newSentEn, setNewSentEn] = useState('');
  const [newSentPron, setNewSentPron] = useState('');
  const [newSentKo, setNewSentKo] = useState('');
  const [newSentNote, setNewSentNote] = useState('');
  const [editingSentId, setEditingSentId] = useState<string | null>(null);
  const [editingSentDraft, setEditingSentDraft] = useState({
    en: '',
    ko: '',
    note: '',
  });

  // 8. 규칙 기반 문장 점검 코치 & 실제 음성 인식(SpeechRecognition) 타이머 상태
  const [speakingGoalMins, setSpeakingGoalMins] = useState<5 | 15 | 30>(15);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);
  const [isSpeakingTimerRunning, setIsSpeakingTimerRunning] = useState<boolean>(false);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'coach',
      text: '안녕하세요! 오늘 배운 핵심 표현(streamline, feasible, unwind, pull off 등)을 넣어 영어 문장을 작성하거나 🎙️마이크 버튼으로 말씀해 보세요. 어절 수, 대소문자·구두점, 5형식 보어 품사 등 핵심 구문 규칙을 점검해 드립니다.',
    },
  ]);
  const [userChatInput, setUserChatInput] = useState<string>('');

  // 9. 아이패드 애플펜슬 필기장 상태 (실제 필압 반영 · 최대 200획 자동 보존 · Undo)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const strokesRef = useRef<CanvasStroke[]>(
    readStorageJson('yanadu_strokes_v1', [])
  );
  const currentStrokeRef = useRef<CanvasStroke | null>(null);
  const [strokeCount, setStrokeCount] = useState<number>(
    () => strokesRef.current.length
  );
  const [penType, setPenType] = useState<
    'fountain' | 'marker' | 'ballpoint' | 'highlighter' | 'eraser'
  >('fountain');
  const [penColor, setPenColor] = useState<
    '#2563eb' | '#0f172a' | '#10b981' | '#e11d48' | '#facc15'
  >('#2563eb');
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [highlighterAlpha, setHighlighterAlpha] = useState<0.15 | 0.3 | 0.5>(0.3);
  const [canvasBgStyle, setCanvasBgStyle] = useState<'lined' | 'grid' | 'blank'>('lined');
  const [canvasHeight, setCanvasHeight] = useState<number>(260);
  const [isPadFloating, setIsPadFloating] = useState<boolean>(true);
  const [isPadMinimized, setIsPadMinimized] = useState<boolean>(false);
  const [padQuickText, setPadQuickText] = useState<string>(() =>
    readStorageString('yanadu_pad_quick_text', '')
  );

  // 보관함 및 다크모드 로컬스토리지 안전 동기화
  useEffect(() => {
    writeStorageString('yanadu_words_v3', JSON.stringify(bookmarkedWords));
  }, [bookmarkedWords]);

  useEffect(() => {
    writeStorageString('yanadu_sents_v3', JSON.stringify(savedSentences));
  }, [savedSentences]);

  useEffect(() => {
    writeStorageString('yanadu_dark_v1', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    writeStorageString('yanadu_pad_quick_text', padQuickText);
  }, [padQuickText]);

  // 브라우저 TTS 음성 목록 비동기 로드 (voiceschanged 대응)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  // 안전한 TTS 발화 함수
  const speakText = (text: string, customRate?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const cleaned = (text || '')
      .replace(/\s*\/\s*/g, ', ')
      .replace(/[~_*[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return;

    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.lang = ttsAccent;
      utter.rate = customRate ?? ttsRate;
      const targetNorm = ttsAccent.toLowerCase();
      const matchedVoice = availableVoices.find((v) =>
        v.lang.replace('_', '-').toLowerCase().includes(targetNorm)
      );
      if (matchedVoice) utter.voice = matchedVoice;
      window.speechSynthesis.speak(utter);
    }, 45);
  };

  // 빈칸 정답 확인 개별 토글 헬퍼
  const toggleBlankKey = (key: string) => {
    setRevealedBlankKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 영영사전 Live API 조회 (불용어 건너뛰기 및 dictTargetWord 우선 사용)
  const fetchLiveDictionary = async (rawQuery: string, explicitTarget?: string) => {
    const stopSet = new Set([
      'a', 'an', 'the', 'i', 'we', 'you', 'this', 'that', 'my', 'our', 'your',
      'to', 'in', 'on', 'at', 'for', 'with', 'by', 'be', 'is', 'are',
    ]);
    const candidate =
      explicitTarget ||
      rawQuery
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z-]/g, ''))
        .find((w) => w.length >= 3 && !stopSet.has(w.toLowerCase())) ||
      'streamline';

    setLiveDictData({
      word: candidate,
      phonetic: '',
      definition: '',
      example: '',
      loading: true,
      notFound: false,
    });

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          candidate.toLowerCase()
        )}`
      );
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const entry = data[0];
      const meaningObj = entry?.meanings?.[0]?.definitions?.[0];
      setLiveDictData({
        word: entry?.word || candidate,
        phonetic: entry?.phonetic || entry?.phonetics?.[0]?.text || '/표준 발음/',
        definition:
          meaningObj?.definition || '표준 영영사전 정의가 확인된 어휘입니다.',
        example:
          meaningObj?.example ||
          `Let's apply "${candidate}" in a real conversation.`,
        loading: false,
        notFound: false,
      });
    } catch {
      setLiveDictData({
        word: candidate,
        phonetic: '사전 API 미등재 (구동사·복합어)',
        definition:
          '복합 구동사 또는 파생 형태이므로 하단 STEP 2 단어장 해설이나 우측 외부 사전 링크를 참고해 주세요.',
        example: '',
        loading: false,
        notFound: true,
      });
    }
  };

  // 9대 매체 큐레이션 셔플 & 구글 뉴스 RSS 동기화 (RSS 성공과 로컬 셔플 상태를 정직하게 구분)
  const handleForceSyncTrends = async () => {
    setIsTrendSyncing(true);
    const nextSeed = trendSyncCount + getKstDayOfYear() + Math.floor(Date.now() % 97);
    setTrendSyncCount((prev) => prev + 1);

    try {
      const rssUrl = encodeURIComponent(
        'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko'
      );
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`
      );
      if (!res.ok) throw new Error('RSS fetch failed');
      const data = await res.json();
      const liveTitles: string[] = Array.isArray(data?.items)
        ? data.items.slice(0, 5).map((it: { title?: string }) => it.title || '')
        : [];

      if (liveTitles.length === 0) throw new Error('No RSS items');

      setMediaPlatforms((prev) =>
        prev.map((plat) => {
          const shuffled = deterministicShuffle(plat.keywords, nextSeed).map(
            (kw, idx) => ({
              ...kw,
              rank: idx + 1,
              koTitle:
                plat.id === 'GOOGLE_TRENDS' && liveTitles[idx]
                  ? `[뉴스헤드라인] ${liveTitles[idx].slice(0, 24)}… · 학습표현: ${kw.koTitle}`
                  : kw.koTitle,
            })
          );
          return { ...plat, keywords: shuffled };
        })
      );

      const stamp = `${getKstTimestampString()} (구글RSS 연동 + 큐레이션 셔플)`;
      setLastTrendSyncTime(stamp);
      setTrendSyncStatus('rss_ok');
      writeStorageString('yanadu_trend_sync_time', stamp);
    } catch {
      setMediaPlatforms((prev) =>
        prev.map((plat) => ({
          ...plat,
          keywords: deterministicShuffle(plat.keywords, nextSeed).map(
            (kw, idx) => ({
              ...kw,
              rank: idx + 1,
            })
          ),
        }))
      );
      const fallbackStamp = `${getKstTimestampString()} (로컬 큐레이션 순서 셔플됨)`;
      setLastTrendSyncTime(fallbackStamp);
      setTrendSyncStatus('local_shuffle');
    } finally {
      setIsTrendSyncing(false);
    }
  };

  // 트렌드 키워드 클릭 핸들러
  const handleClickTrendKeyword = (kw: MediaTrendKeyword) => {
    setSelectedLiveKeyword(kw);
    setSelectedThemeId(kw.targetThemeId);
    setActiveMode('daily');
    setDiagramSourceMode('theme');
    setActiveSentenceIdx(0);
    setSelectedTokenIdx(0);
    fetchLiveDictionary(kw.enExpression, kw.dictTargetWord);
  };

  // 현재 활성화된 테마 데이터
  const currentTheme: ThemeData = useMemo(() => {
    const base = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];
    if (!selectedLiveKeyword) return base;

    const expr = selectedLiveKeyword.enExpression;
    const ko = selectedLiveKeyword.koTitle;
    const liveSentenceEn = `In practical communication, we often use the expression "${expr}" to convey our point clearly.`;
    const liveSoundBlock = `In practical communication, / we often use / "${expr}" / to convey our point clearly.`;

    const liveSentObj: TrainingSentence = {
      id: 9999,
      levelTag: learningLevel,
      tag: `🔥 선택 토픽 집중 훈련 (#${selectedLiveKeyword.rank} ${ko})`,
      targetWord: expr,
      wordOrderFormula: `In practical communication[M], + we[S] + often[M] + use[V] + "${expr}"[DO] + to convey our point[M].`,
      structure: '전치사구(M) + 3형식 주절(S + V + DO) + 목적의 to부정사구(M)',
      soundBlockEn: liveSoundBlock,
      soundMethodGuide: `핵심 표현인 "${expr}" ${selectedLiveKeyword.pron} 부분에 가장 강한 강세를 실어 또렷하게 발음합니다.`,
      ipaLine: selectedLiveKeyword.ipa,
      koLine: `실전 소통에서 / 우리는 자주 활용한다 / "${expr}"(${ko}) 표현을 / 핵심 요지를 명확히 전달하기 위해.`,
      enLine: liveSoundBlock,
      rawEn: liveSentenceEn,
      pronLine: `${selectedLiveKeyword.pron} — [인 프랙티컬 커뮤니케이션 / 위 오픈 유즈 "${expr}" / 투 컨베이 아워 포인트 클리얼리]`,
      naturalKo: `실전 의사소통에서 우리는 "${ko}"라는 뜻을 명확히 전달하기 위해 "${expr}" 표현을 자주 활용합니다.`,
      paraphraseVersion: `Mastering the phrase "${expr}" helps us communicate more naturally.`,
      grammarPoint: `어떤 문법 형태의 구절(동사구·명사구·형용사구)이든 타동사 use의 목적어로 안전하게 결합하여 비문 없이 연습할 수 있습니다.`,
      contextNuance: `좌측 9대 매체 큐레이션 토픽에서 선택한 "${ko}" 표현을 실전 문장 속에서 체화하는 맞춤형 카드입니다.`,
    };

    return {
      ...base,
      sentences: [liveSentObj, ...base.sentences],
    };
  }, [selectedThemeId, selectedLiveKeyword, learningLevel]);

  const handleSelectLevel = (lvl: LearningLevel) => {
    setLearningLevel(lvl);
    const defaultSpeed =
      lvl === 'beginner' ? 0.5 : lvl === 'intermediate' ? 0.75 : 1.0;
    setTtsRate(defaultSpeed);
    const matchIdx = currentTheme.sentences.findIndex(
      (s) => s.levelTag === lvl && s.id !== 9999
    );
    if (matchIdx !== -1) {
      setActiveSentenceIdx(matchIdx);
      setSelectedTokenIdx(0);
    }
  };

  const currentTrack: LevelTrackContent = currentTheme.levelTracks[learningLevel];
  const activePlatform =
    mediaPlatforms.find((p) => p.id === activePlatformId) || mediaPlatforms[0];
  const currentSentence: TrainingSentence =
    currentTheme.sentences[activeSentenceIdx] || currentTheme.sentences[0];

  // STEP 3 다이어그램 분석 대상 문장
  const currentDiagramData: DiagramSentence = useMemo(() => {
    if (diagramSourceMode === 'standard') {
      return DIAGRAM_EXAMPLES[selectedStandardExIdx] || DIAGRAM_EXAMPLES[0];
    }
    return buildDynamicDiagramSentence(
      currentSentence.rawEn,
      currentSentence.naturalKo,
      currentSentence.tag
    );
  }, [diagramSourceMode, selectedStandardExIdx, currentSentence]);

  const activeToken: DiagramToken =
    currentDiagramData.tokens[selectedTokenIdx] || currentDiagramData.tokens[0];

  // 코어 단어장 & 구문 아카이브 & 학교 지문 파생 데이터
  const wordbookEntries = useMemo(() => {
    const levels: WordbookLevel[] =
      wordbookLevelFilter === '전체'
        ? ['중등 필수', '고등·수능 핵심', '비즈니스·실무', '오픽(OPIc)·구동사']
        : [wordbookLevelFilter];
    return levels.flatMap((lvl) =>
      getExpandedWordbookByDay(lvl, selectedWordbookDay)
    );
  }, [wordbookLevelFilter, selectedWordbookDay]);

  const generatedSyntaxList = useMemo(
    () => generateCombinatorialSentences(syntaxGeneratorSeed, 12),
    [syntaxGeneratorSeed]
  );

  const customPassageAnalysis = useMemo(
    () => analyzeCustomSchoolPassage(customSchoolPassage),
    [customSchoolPassage]
  );

  // [핵심 수정] 1교시 어휘 20문항: 다른 실제 단어들의 뜻으로 오답 3개를 구성하고 보기 4개를 셔플하여 정답 번호(1~4번)를 고르게 분산
  const period1QuizQuestions = useMemo(() => {
    const allPool = (
      ['중등 필수', '고등·수능 핵심', '비즈니스·실무', '오픽(OPIc)·구동사'] as WordbookLevel[]
    ).flatMap((lv) => getExpandedWordbookByDay(lv, 1));

    const selectedItems = deterministicShuffle(
      allPool,
      vocabChallengeSetSeed * 13
    ).slice(0, 20);

    return selectedItems.map((item, idx) => {
      const otherMeanings = allPool
        .filter((other) => other.word !== item.word)
        .map((other) => other.meaning);
      const pickedDistractors = deterministicShuffle(
        otherMeanings,
        vocabChallengeSetSeed * 29 + idx * 7
      ).slice(0, 3);
      const rawOptions = [item.meaning, ...pickedDistractors];
      const shuffledOptions = deterministicShuffle(
        rawOptions,
        vocabChallengeSetSeed * 41 + idx * 11
      );
      const correctIdx = shuffledOptions.indexOf(item.meaning);

      return {
        item,
        options: shuffledOptions,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
      };
    });
  }, [vocabChallengeSetSeed]);

  const period1CorrectCount = useMemo(() => {
    let count = 0;
    period1QuizQuestions.forEach((q, idx) => {
      const key = `${vocabChallengeSetSeed}-${idx}`;
      if (period1Answers[key] === q.correctIdx) count++;
    });
    return count;
  }, [period1QuizQuestions, period1Answers, vocabChallengeSetSeed]);

  const quiz406CorrectCount = useMemo(() => {
    let count = 0;
    GRAMMAR_406_QUIZ_BANK.forEach((q) => {
      if (quiz406Answers[q.id] === q.correct) count++;
    });
    return count;
  }, [quiz406Answers]);

  // 스피킹 타이머
  useEffect(() => {
    if (!isSpeakingTimerRunning) return;
    const goalSecs = speakingGoalMins * 60;
    const timer = window.setInterval(() => {
      setSpeakingSeconds((prev) => {
        if (prev + 1 >= goalSecs) {
          setIsSpeakingTimerRunning(false);
          return goalSecs;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSpeakingTimerRunning, speakingGoalMins]);

  const handleToggleSpeakingTimer = () => {
    const goalSecs = speakingGoalMins * 60;
    if (!isSpeakingTimerRunning && speakingSeconds >= goalSecs) {
      setSpeakingSeconds(0);
    }
    setIsSpeakingTimerRunning((prev) => !prev);
  };

  // Web Speech API 실제 음성 인식
  const handleStartVoiceRecognition = () => {
    const SpeechRec =
      (
        window as unknown as {
          SpeechRecognition?: unknown;
          webkitSpeechRecognition?: unknown;
        }
      ).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(
        '현재 브라우저에서는 음성 인식(SpeechRecognition)을 지원하지 않습니다. 크롬 또는 사파리 최신 버전을 이용해 주세요.'
      );
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRec as any)();
      recognition.lang = ttsAccent;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsMicListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setUserChatInput((prev) =>
            prev ? `${prev} ${transcript}` : transcript
          );
        }
        setIsMicListening(false);
      };
      recognition.onerror = () => setIsMicListening(false);
      recognition.onend = () => setIsMicListening(false);
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // 규칙 기반 문장·표현 점검 코치 (어절 수, 대소문자, 구두점, 동사 유무, 5형식 보어 부사 오용 등 실제 규칙 검사)
  const handleSendCoachMessage = () => {
    const raw = userChatInput.trim();
    if (!raw) return;

    const words = raw.split(/\s+/);
    const lower = raw.toLowerCase();
    const notes: string[] = [];

    if (words.length < 3) {
      notes.push('주어와 동사가 포함된 3어절 이상의 완전한 문장으로 작성해 보세요.');
    }
    if (!/^[A-Z]/.test(raw)) {
      notes.push('문장 첫 글자는 대문자로 시작하는 것이 표준 표기입니다.');
    }
    if (!/[.!?]$/.test(raw)) {
      notes.push('문장 끝에 마침표(.)나 물음표(?) 등 종결 부호를 붙여 주세요.');
    }
    if (/\b(make|makes|made|keep|keeps|kept)\b.*\b(feasibly|comfortably|independently|ambiguousl?y)\b/i.test(raw)) {
      notes.push(
        '주의: 5형식 동사(make/keep)의 목적격보어(OC) 자리에는 부사(-ly)가 아니라 형용사(feasible, comfortable 등)를 써야 합니다.'
      );
    }
    if (/\bstick\s+(my|our|the)\b/i.test(raw)) {
      notes.push(
        '주의: stick이 "~을 고수하다/지키다"라는 뜻일 때는 전치사 to를 붙여 "stick to + 명사구"로 써야 합니다.'
      );
    }

    const matchedVocab = currentTheme.vocab.find((v) =>
      lower.includes(v.word.toLowerCase())
    );
    const polished =
      raw.charAt(0).toUpperCase() +
      raw.slice(1) +
      (/[.!?]$/.test(raw) ? '' : '.');

    const feedbackText =
      notes.length > 0
        ? `🔍 [구문 규칙 점검 결과] ${notes.join(' / ')}`
        : matchedVocab
        ? `✅ [규칙 통과] 총 ${words.length}어절 문장이며, 오늘 테마의 핵심 표현("${matchedVocab.word}")이 자연스럽게 포함되었습니다!`
        : `✅ [기본 구두점 통과] 총 ${words.length}어절 문장입니다. 여기에 오늘의 핵심 패턴("${currentTrack.patternEn}")이나 주요 어휘를 결합해 보면 더욱 좋습니다.`;

    const replyTurn: ChatTurn = {
      role: 'coach',
      text: feedbackText,
      correction: `교정 표기: "${polished}"`,
      nuanceTip: `참고 패턴: ${currentTrack.patternEn} (${currentTrack.patternMeaningKo})`,
    };

    setChatHistory((prev) => [...prev, { role: 'user', text: raw }, replyTurn]);
    setUserChatInput('');
  };

  // ============================================================================
  // 아이패드 애플펜슬 벡터 획 배열(strokesRef) 캔버스 렌더링 엔진
  // - 만년필 실제 필압(point.pressure) 두께 반영 / 최대 200획 자동 보존 / 다크모드 검정->흰색 반전
  // ============================================================================
  const renderAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (
      canvas.width !== Math.floor(rect.width * dpr) ||
      canvas.height !== Math.floor(rect.height * dpr)
    ) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const allStrokes = currentStrokeRef.current
      ? [...strokesRef.current, currentStrokeRef.current]
      : strokesRef.current;

    for (const st of allStrokes) {
      if (st.points.length === 0) continue;
      ctx.save();
      ctx.lineCap = st.tool === 'highlighter' ? 'square' : 'round';
      ctx.lineJoin = 'round';

      const avgPressure =
        st.points.reduce((acc, pt) => acc + (pt.pressure || 0.5), 0) /
        st.points.length;
      const pressureFactor =
        st.tool === 'fountain' ? 0.65 + avgPressure * 0.75 : 1.0;

      if (st.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = st.width * 4.5;
        ctx.strokeStyle = '#000000';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = st.tool === 'highlighter' ? st.alpha : 1.0;
        const effectiveColor =
          darkMode && st.color === '#0f172a' ? '#f8fafc' : st.color;
        ctx.strokeStyle = effectiveColor;
        ctx.lineWidth =
          st.tool === 'highlighter'
            ? st.width * 3.2
            : st.tool === 'ballpoint'
            ? Math.max(1.2, st.width * 0.85)
            : st.width * pressureFactor;
      }

      ctx.beginPath();
      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      if (st.points.length === 1) {
        ctx.lineTo(st.points[0].x + 0.1, st.points[0].y + 0.1);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  useEffect(() => {
    renderAllStrokes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode, canvasHeight, isPadMinimized, layoutMode, strokeCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventDefaultTouch = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    canvas.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    canvas.addEventListener('selectstart', preventDefaultTouch);
    return () => {
      canvas.removeEventListener('touchstart', preventDefaultTouch);
      canvas.removeEventListener('touchmove', preventDefaultTouch);
      canvas.removeEventListener('selectstart', preventDefaultTouch);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    currentStrokeRef.current = {
      tool: penType,
      color: penColor,
      width: penWidth,
      alpha: highlighterAlpha,
      points: [{ x, y, pressure: e.pressure || 0.5 }],
    };
    renderAllStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentStrokeRef.current.points.push({ x, y, pressure: e.pressure || 0.5 });
    renderAllStrokes();
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current].slice(
        -200
      );
      currentStrokeRef.current = null;
      setStrokeCount(strokesRef.current.length);
      writeStorageString(
        'yanadu_strokes_v1',
        JSON.stringify(strokesRef.current)
      );
    }
    renderAllStrokes();
  };

  const handleUndoStroke = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    writeStorageString('yanadu_strokes_v1', JSON.stringify(strokesRef.current));
    renderAllStrokes();
  };

  const handleClearCanvas = () => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setStrokeCount(0);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('yanadu_strokes_v1');
      } catch {
        // ignore
      }
    }
    renderAllStrokes();
  };

  // 단어·문장 보관함 핸들러
  const isWordBookmarked = (wordStr: string) =>
    bookmarkedWords.some((w) => w.word.toLowerCase() === wordStr.toLowerCase());

  const toggleBookmarkWord = (item: {
    word: string;
    ipa: string;
    pron?: string;
    meaning: string;
    collocation: string;
    posLabel: string;
    compLabel: string;
    levelBadge?: string;
  }) => {
    setBookmarkedWords((prev) => {
      const exists = prev.some(
        (w) => w.word.toLowerCase() === item.word.toLowerCase()
      );
      if (exists) {
        return prev.filter(
          (w) => w.word.toLowerCase() !== item.word.toLowerCase()
        );
      }
      return [
        {
          id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          word: item.word,
          ipa: item.ipa,
          pron: item.pron,
          meaning: item.meaning,
          collocation: item.collocation,
          posLabel: item.posLabel,
          compLabel: item.compLabel,
          levelBadge: item.levelBadge || '일일 강의',
          customNote: '',
          mastered: false,
        },
        ...prev,
      ];
    });
  };

  const handleAddCustomWord = () => {
    const w = newWordForm.word.trim();
    const m = newWordForm.meaning.trim();
    if (!w || !m) return;
    setBookmarkedWords((prev) => [
      {
        id: `custom-w-${Date.now()}`,
        word: w,
        ipa: '/직접 추가/',
        pron: newWordForm.pron.trim() || '[발음 메모]',
        meaning: m,
        collocation: newWordForm.collocation.trim() || w,
        posLabel: '핵심 어휘',
        compLabel: '직접 등록',
        levelBadge: '내 단어장',
        customNote: newWordForm.note.trim(),
        mastered: false,
      },
      ...prev,
    ]);
    setNewWordForm({ word: '', pron: '', meaning: '', collocation: '', note: '' });
  };

  const handleAddCustomSentence = () => {
    const en = newSentEn.trim();
    const ko = newSentKo.trim();
    if (!en || !ko) return;
    setSavedSentences((prev) => [
      {
        id: `custom-s-${Date.now()}`,
        en,
        pron: newSentPron.trim(),
        ko,
        note: newSentNote.trim() || '직접 추가한 핵심 예문',
        category: '직접 등록 구문',
        mastered: false,
      },
      ...prev,
    ]);
    setNewSentEn('');
    setNewSentPron('');
    setNewSentKo('');
    setNewSentNote('');
  };

  const toggleSaveSentenceFromLesson = (
    en: string,
    ko: string,
    note: string,
    pron?: string
  ) => {
    setSavedSentences((prev) => {
      const exists = prev.some((s) => s.en.toLowerCase() === en.toLowerCase());
      if (exists) {
        return prev.filter((s) => s.en.toLowerCase() !== en.toLowerCase());
      }
      return [
        {
          id: `lesson-s-${Date.now()}`,
          en,
          pron,
          ko,
          note,
          category: currentTheme.badge,
          mastered: false,
        },
        ...prev,
      ];
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

  const SPEED_STEPS: { rate: number; label: string; badge: string }[] = [
    { rate: 0.3, label: '0.30x', badge: '입문·초저속' },
    { rate: 0.5, label: '0.50x', badge: '초보·천천히' },
    { rate: 0.75, label: '0.75x', badge: '연음·중저속' },
    { rate: 1.0, label: '1.0x', badge: '원어민 표준' },
    { rate: 1.25, label: '1.25x', badge: '고급·쾌속' },
  ];

  const PEN_WIDTH_STEPS: { px: number; label: string }[] = [
    { px: 1.5, label: '극세필 1.5' },
    { px: 2.5, label: '세필 2.5' },
    { px: 4, label: '보통 4.0' },
    { px: 6, label: '중간 6.0' },
    { px: 9, label: '강조 9.0' },
  ];

  return (
    <div
      className={`min-h-dvh pb-40 ${fontClass} ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <style>{`
        @media print {
          html, body, #root { height: auto !important; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-expand { height: auto !important; overflow: visible !important; max-height: none !important; }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 상단 글로벌 헤더 */}
      {/* ==================================================================== */}
      <header
        className={`sticky top-0 z-30 border-b px-4 py-2.5 backdrop-blur-md no-print ${
          darkMode
            ? 'bg-slate-900/95 border-slate-800'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold text-white ${themeAccentBg}`}
            >
              야나두 영어 PRO
            </span>
            <h1 className="text-sm md:text-base font-black tracking-tight">
              16문법 노드(7성분+9품사) · 소리블록 · 수능·오픽 통합 마스터
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {[
              { id: 'daily', label: '📚 일일 강의 (STEP 1~5)' },
              { id: 'examCourses', label: '🎓 1~5교시·수능·내신' },
              { id: 'wordbook', label: '📘 코어 80단어 & 파생어 족보' },
              {
                id: 'myVault',
                label: `⭐ 내 보관함 (${bookmarkedWords.length + savedSentences.length})`,
              },
              { id: 'curriculum', label: '🗓️ 전체 총람(치트시트)' },
              { id: 'devStory', label: '🛠️ 제작과정 백서' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveMode(
                    tab.id as
                      | 'daily'
                      | 'examCourses'
                      | 'wordbook'
                      | 'myVault'
                      | 'curriculum'
                      | 'devStory'
                  )
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMode === tab.id
                    ? `${themeAccentBg} text-white shadow-xs`
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setShowPronGuide((p) => !p)}
              className={`px-2.5 py-1 rounded-md font-bold border ${
                showPronGuide
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : darkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {showPronGuide ? '👁️ 한글발음 켜짐' : '🙈 한글발음 가림'}
            </button>

            <div
              className={`flex items-center rounded-md border px-1.5 py-0.5 gap-1 ${
                darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <span className="text-[11px] font-bold opacity-75">글씨체:</span>
              {(
                [
                  { id: 'sans', label: '고딕' },
                  { id: 'serif', label: '명조' },
                  { id: 'mono', label: '코딩체' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontStyle(f.id)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    fontStyle === f.id
                      ? `${themeAccentBg} text-white`
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              className={`flex items-center rounded-md border px-1.5 py-0.5 gap-1 ${
                darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <span className="text-[11px] font-bold opacity-75">테마색:</span>
              {(['blue', 'emerald', 'indigo', 'amber'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setColorTheme(c)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    colorTheme === c
                      ? `${themeAccentBg} text-white`
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setLayoutMode((m) => (m === 'split' ? 'wide' : 'split'))
              }
              className={`px-2 py-1 rounded-md font-bold border ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              {layoutMode === 'split' ? '📐 2단 분할화면' : '🖥️ 와이드 전체화면'}
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`px-2 py-1 rounded-md font-bold border ${
                darkMode
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-white border-slate-800'
              }`}
            >
              {darkMode ? '☀️ 라이트' : '🌙 다크'}
            </button>

            <button
              onClick={() => window.print()}
              className="px-2 py-1 rounded-md font-bold border bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            >
              🖨️ 교안인쇄
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 메인 레이아웃 컨테이너 */}
      {/* ==================================================================== */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-4 p-3 md:p-4 print-expand">
        {/* 좌측 사이드바 */}
        {layoutMode === 'split' && (
          <aside className="w-full lg:w-80 shrink-0 space-y-4 no-print">
            {/* 1) 리딩 속도 5단계 & 4개국 억양 */}
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold">
                  🎙️ 원어민 음성 & 리딩 속도 5단계
                </span>
                <span className="text-[11px] font-bold text-blue-500">
                  현재 {ttsRate.toFixed(2)}x
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2.5">
                {(
                  [
                    { code: 'en-US', label: '🇺🇸 미국' },
                    { code: 'en-GB', label: '🇬🇧 영국' },
                    { code: 'en-AU', label: '🇦🇺 호주' },
                    { code: 'en-CA', label: '🇨🇦 캐나다' },
                  ] as const
                ).map((acc) => (
                  <button
                    key={acc.code}
                    onClick={() => setTtsAccent(acc.code)}
                    className={`py-1 rounded-lg text-[11px] font-bold border ${
                      ttsAccent === acc.code
                        ? `${themeAccentBg} text-white border-transparent`
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {SPEED_STEPS.map((st) => (
                  <button
                    key={st.rate}
                    onClick={() => setTtsRate(st.rate)}
                    className={`py-1.5 px-1 rounded-lg text-center border transition-all ${
                      Math.abs(ttsRate - st.rate) < 0.02
                        ? `${themeAccentBg} text-white border-transparent shadow-xs`
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">{st.label}</div>
                    <div className="text-[9px] opacity-85 truncate">{st.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2) 9대 매체 큐레이션 토픽 & 구글 뉴스 RSS 동기화 */}
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div>
                  <h2 className="text-xs font-extrabold">
                    🌐 9대 매체 큐레이션 표현 10선
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {trendSyncStatus === 'rss_ok'
                      ? '🟢'
                      : trendSyncStatus === 'local_shuffle'
                      ? '🟡'
                      : '📚'}{' '}
                    상태: <strong className="text-emerald-500">{lastTrendSyncTime}</strong>
                  </p>
                </div>
                <button
                  onClick={handleForceSyncTrends}
                  disabled={isTrendSyncing}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-rose-600 text-white hover:bg-rose-700 shadow-xs shrink-0"
                >
                  {isTrendSyncing ? '⏳ 동기화 중...' : '🔄 셔플·뉴스연동'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1 my-2">
                {mediaPlatforms.map((plat) => (
                  <button
                    key={plat.id}
                    onClick={() => setActivePlatformId(plat.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                      activePlatformId === plat.id
                        ? plat.badgeColor
                        : darkMode
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plat.shortName}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                <span>📌 {activePlatform.sourceNote}</span>
                <a
                  href={activePlatform.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 font-bold underline"
                >
                  매체 바로가기↗
                </a>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {activePlatform.keywords.map((kw) => {
                  const isSel =
                    selectedLiveKeyword?.enExpression === kw.enExpression &&
                    selectedLiveKeyword?.rank === kw.rank;
                  return (
                    <div
                      key={`${activePlatform.id}-${kw.rank}-${kw.enExpression}`}
                      onClick={() => handleClickTrendKeyword(kw)}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        isSel
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50'
                          : darkMode
                          ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold truncate">
                          <span className="inline-block w-4 text-rose-500 font-black">
                            {kw.rank}.
                          </span>
                          {kw.koTitle}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(kw.enExpression);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold shrink-0"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                        {kw.enExpression}
                      </div>
                      {showPronGuide && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {kw.ipa} · {kw.pron}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {liveDictData && (
                <div
                  className={`mt-2.5 p-2.5 rounded-xl border text-xs ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-500">
                      📖 영영사전 조회: {liveDictData.word}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {liveDictData.phonetic}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed">
                    {liveDictData.loading
                      ? '영영사전 데이터를 불러오는 중입니다...'
                      : liveDictData.definition}
                  </p>
                </div>
              )}
            </div>

            {/* 3) 5대 정규 테마 선택 */}
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <h2 className="text-xs font-extrabold mb-2">
                🗂️ 5대 실전 테마 커리큘럼
              </h2>
              <div className="space-y-1.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setSelectedLiveKeyword(null);
                      setSelectedThemeId(th.id);
                      setActiveMode('daily');
                      setActiveSentenceIdx(0);
                      setSelectedTokenIdx(0);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      selectedThemeId === th.id && !selectedLiveKeyword
                        ? `${themeAccentBg} text-white border-transparent shadow-xs`
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-85">
                      {th.badge}
                    </div>
                    <div className="text-xs font-extrabold mt-0.5">{th.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* ================================================================== */}
        {/* 우측 메인 콘텐츠 영역 */}
        {/* ================================================================== */}
        <main className="flex-1 min-w-0 space-y-6 print-expand">
          {/* ---------------------------------------------------------------- */}
          {/* [모드 1] 📚 일일 강의 (STEP 1 ~ STEP 5) */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'daily' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-extrabold text-blue-500">
                      {currentTheme.badge}
                    </span>
                    <h2 className="text-lg md:text-xl font-black">
                      {currentTheme.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentTheme.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'beginner', label: '🌱 초급 (0.30~0.50x)' },
                        { id: 'intermediate', label: '🌿 중급 (0.75~1.0x)' },
                        { id: 'advanced', label: '🌳 고급 (1.0~1.25x)' },
                      ] as const
                    ).map((lv) => (
                      <button
                        key={lv.id}
                        onClick={() => handleSelectLevel(lv.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          learningLevel === lv.id
                            ? `${themeAccentBg} text-white shadow-xs`
                            : darkMode
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {lv.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ========================================================== */}
                {/* STEP 1. 오늘의 대표 패턴 & 소리블록 & 2인 롤플레이 대화 & 어조 스케일 */}
                {/* ========================================================== */}
                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-blue-600 text-white">
                      STEP 1 · 오늘의 대표 패턴 & 소리블록 법칙 ({currentTrack.levelName})
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {currentTrack.speedGuide}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    💡 {currentTrack.levelGuide}
                  </p>

                  <div
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="text-lg md:text-2xl font-black text-blue-600 dark:text-blue-400">
                      {currentTrack.patternSoundBlock}
                    </div>
                    {showPronGuide && (
                      <div className="mt-1.5 space-y-0.5">
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          미국식 IPA: {currentTrack.patternIpa}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          🗣️ 실전 한글발음: {currentTrack.patternPron}
                        </div>
                      </div>
                    )}
                    <div className="text-sm font-bold mt-2">
                      🇰🇷 뜻: {currentTrack.patternMeaningKo}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 pt-1.5 border-t border-dashed border-slate-300 dark:border-slate-700">
                      🔊 <strong>소리블록 연음 법칙:</strong> {currentTrack.patternSoundRule}
                      <br />
                      📐 <strong>핵심 어순·문법 해설:</strong> {currentTrack.grammarSummary}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 0.3)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400"
                      >
                        🐌 0.30x 초저속 듣기
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 0.5)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        🐢 0.50x 천천히 듣기
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 0.75)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        🚶 0.75x 연음 듣기
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 1.0)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700"
                      >
                        🔊 1.0x 원어민 정속
                      </button>
                    </div>
                  </div>

                  {/* 패러프레이징 비교 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3">
                    {currentTrack.paraphraseDrill.map((pd, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          darkMode
                            ? 'bg-slate-900 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="text-slate-500 line-through">
                          기본 표현: {pd.basicExpr}
                        </div>
                        <div className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                          🚀 업그레이드: {pd.upgradedExpr}
                        </div>
                        <div className="text-[11px] opacity-80 mt-1">
                          💡 {pd.nuanceDiff}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 💬 2인 실전 롤플레이 대화문 */}
                  <div
                    className={`mt-3 p-3.5 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <h4 className="text-xs font-black mb-2">
                      💬 2인 실전 롤플레이 대화 (소리블록 & 한글 발음 포함)
                    </h4>
                    <div className="space-y-2">
                      {currentTrack.dialogue.map((turn, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            turn.speaker === 'A'
                              ? darkMode
                                ? 'bg-slate-800/70 border-slate-700'
                                : 'bg-slate-50 border-slate-200'
                              : darkMode
                              ? 'bg-blue-950/40 border-blue-800'
                              : 'bg-blue-50/60 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-500">
                              {turn.speaker} · {turn.roleName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
                                {turn.pointNote}
                              </span>
                              <button
                                onClick={() => speakText(turn.en)}
                                className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                              >
                                🔊 듣기
                              </button>
                            </div>
                          </div>
                          <div className="font-black text-sm mt-1">
                            {turn.soundBlock}
                          </div>
                          {showPronGuide && (
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                              🗣️ {turn.pron}
                            </div>
                          )}
                          <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                            {turn.ko}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 📊 3단계 어조·격식도 온도계 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {currentTheme.synonymScales.map((sc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          darkMode
                            ? 'bg-slate-900 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="font-extrabold text-blue-500">
                          🌡️ {sc.conceptTitle}
                        </div>
                        <div className="text-[10px] opacity-75 mb-2">
                          {sc.scaleAxisLabel}
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { badge: '1단계 (기본)', item: sc.weak },
                            { badge: '2단계 (실무표준)', item: sc.medium },
                            { badge: '3단계 (고급강조)', item: sc.strong },
                          ].map((col, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => speakText(col.item.expr)}
                              className={`p-2 rounded-lg border cursor-pointer ${
                                darkMode
                                  ? 'bg-slate-800/70 border-slate-700 hover:bg-slate-800'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="text-[10px] font-bold text-amber-500">
                                {col.badge} 🔊
                              </div>
                              <div className="font-black text-xs mt-0.5">
                                {col.item.expr}
                              </div>
                              {showPronGuide && (
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {col.item.pron}
                                </div>
                              )}
                              <div className="text-[11px] font-semibold mt-0.5">
                                {col.item.ko}
                              </div>
                              <div className="text-[10px] opacity-75 mt-0.5">
                                {col.item.note}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* STEP 2. 핵심 어휘 (표제어 옆 단독 스피커 추가 & 빈칸 정답 가림 토글 적용) */}
              {/* ============================================================ */}
              <section
                className={`p-4 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-600 text-white">
                      STEP 2 · 테마 필수 어휘 & 문법 성분(7직책)·품사(9신분) 매칭표
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      짧은 표제어 바로 옆의 <strong>[🔊 단어]</strong> 버튼으로 단어 발음을 바로 듣거나, 우측의 <strong>[❓ 정답 확인]</strong>을 눌러 빈칸 추론 훈련을 할 수 있습니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => {
                        setHideWords((p) => !p);
                        setRevealedWordIds([]);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        hideWords
                          ? 'bg-rose-600 text-white border-rose-600'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      {hideWords ? '🔓 영어단어 모두보기' : '🙈 영어단어 가리기'}
                    </button>
                    <button
                      onClick={() => {
                        setHideMeanings((p) => !p);
                        setRevealedWordIds([]);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        hideMeanings
                          ? 'bg-rose-600 text-white border-rose-600'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      {hideMeanings ? '🔓 한글뜻 모두보기' : '🙈 한글뜻 가리기'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={`border-b ${
                          darkMode
                            ? 'border-slate-800 bg-slate-950 text-slate-300'
                            : 'border-slate-200 bg-slate-100 text-slate-700'
                        }`}
                      >
                        <th className="p-2.5">단어(🔊) & 소리블록 · 한글발음</th>
                        <th className="p-2.5">뜻 & 영영정의</th>
                        <th className="p-2.5">품사(9신분) & 문장성분(7직책)</th>
                        <th className="p-2.5">실전 연어 & 빈칸 적용 예문</th>
                        <th className="p-2.5 text-center">연어발음·보관함</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {currentTheme.vocab.map((v) => {
                        const isRevealed = revealedWordIds.includes(v.id);
                        const maskWord = hideWords && !isRevealed;
                        const maskMean = hideMeanings && !isRevealed;
                        const saved = isWordBookmarked(v.word);
                        const blankKey = `step2-blank-${v.id}`;
                        const isBlankShown = !!revealedBlankKeys[blankKey];

                        return (
                          <tr
                            key={v.id}
                            onClick={() =>
                              setRevealedWordIds((prev) =>
                                prev.includes(v.id)
                                  ? prev.filter((id) => id !== v.id)
                                  : [...prev, v.id]
                              )
                            }
                            className="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-slate-800/50"
                          >
                            <td className="p-2.5 align-top">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                  {v.recommendLevel.toUpperCase()}
                                </span>
                                <span className="font-black text-sm text-blue-600 dark:text-blue-400">
                                  {maskWord ? v.masked : v.word}
                                </span>
                                {/* [성만 님 요청 반영] 짧은 표제어 바로 오른쪽 옆 전용 스피커 버튼 */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(v.word);
                                  }}
                                  title={`"${v.word}" 단어 발음 듣기`}
                                  className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs"
                                >
                                  🔊 단어
                                </button>
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                                <span>{v.ipa} · 끊어읽기:</span>
                                <strong>{v.soundBlock}</strong>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(v.soundBlock);
                                  }}
                                  className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold"
                                >
                                  🔊
                                </button>
                              </div>
                              {showPronGuide && (
                                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  🗣️ {v.pron} — {v.soundMethod}
                                </div>
                              )}
                            </td>

                            <td className="p-2.5 align-top">
                              <div className="font-extrabold text-sm">
                                {maskMean ? '🔒 [클릭하여 뜻 확인]' : v.meaning}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                EN: {v.enDef}
                              </div>
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                                💡 {v.paraphraseTip}
                              </div>
                            </td>

                            <td className="p-2.5 align-top">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                                  품사: {v.posLabel}
                                </span>
                                <span className="px-2 py-0.5 rounded font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300">
                                  성분: {v.compLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {v.roleDesc}
                              </p>
                            </td>

                            <td
                              className="p-2.5 align-top"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-bold text-blue-600 dark:text-blue-400">
                                🔗 {v.collocation} ({v.collocationKo})
                              </div>
                              {/* 빈칸 훈련 정답 스포일러 가림 토글 */}
                              <div className="text-[11px] mt-1 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded flex flex-wrap items-center justify-between gap-1.5">
                                <span>빈칸훈련: {v.exampleBlank}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleBlankKey(blankKey)}
                                  className={`px-2 py-0.5 rounded font-sans font-bold text-[10px] ${
                                    isBlankShown
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-amber-500 text-slate-950'
                                  }`}
                                >
                                  {isBlankShown ? `정답: ${v.word}` : '❓ 정답 확인'}
                                </button>
                              </div>
                            </td>

                            <td
                              className="p-2.5 align-top text-center space-y-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => speakText(v.collocation)}
                                className="w-full px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px]"
                              >
                                🔊 연어발음
                              </button>
                              <button
                                onClick={() =>
                                  toggleBookmarkWord({
                                    word: v.word,
                                    ipa: v.ipa,
                                    pron: v.pron,
                                    meaning: v.meaning,
                                    collocation: v.collocation,
                                    posLabel: v.posLabel,
                                    compLabel: v.compLabel,
                                    levelBadge: currentTheme.badge,
                                  })
                                }
                                className={`w-full px-2 py-1 rounded font-bold text-[11px] border ${
                                  saved
                                    ? 'bg-amber-400 text-slate-950 border-amber-500'
                                    : darkMode
                                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                                    : 'bg-slate-100 border-slate-300 text-slate-700'
                                }`}
                              >
                                {saved ? '⭐ 저장됨' : '☆ 단어장 저장'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ============================================================ */}
              {/* STEP 3. 16개 문법 노드(7성분+9품사) 연결도 & 사전 탭 전환 */}
              {/* ============================================================ */}
              <section
                className={`p-4 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-indigo-600 text-white">
                      STEP 3 · 문장 성분 7개(구·절 역할) + 9품사(단어 정체) = 총 16개 문법 노드 & 사전
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      ※ 연결선은 단어 품사 자체가 곧바로 성분이 된다는 뜻이 아니라, <strong>해당 품사가 단독으로 쓰이거나 구(전치사구·준동사구·명사구)·절을 구성하여 해당 문장 성분 역할을 수행할 수 있음</strong>을 나타냅니다.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: '🕸️ 16개 문법 노드 대표 연결도' },
                        { id: 'comp', label: '📘 문장 성분(7직책) 사전' },
                        { id: 'pos', label: '📗 9품사(한정사 포함) 사전' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDiagramTab(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          diagramTab === t.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : darkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {diagramTab === 'all' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-extrabold">분석 문장 선택:</span>
                        <button
                          onClick={() => {
                            setDiagramSourceMode('theme');
                            setSelectedTokenIdx(0);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            diagramSourceMode === 'theme'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        >
                          현재 테마 문장 ({currentSentence.tag})
                        </button>
                        {DIAGRAM_EXAMPLES.map((exItem, idx) => (
                          <button
                            key={exItem.rawEn}
                            onClick={() => {
                              setDiagramSourceMode('standard');
                              setSelectedStandardExIdx(idx);
                              setSelectedTokenIdx(0);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold ${
                              diagramSourceMode === 'standard' &&
                              selectedStandardExIdx === idx
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            표준예문 #{idx + 1}
                          </button>
                        ))}
                      </div>
                      {currentDiagramData.isHeuristic && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ℹ️ 참고: 사전 미등록 문장에 대한 문맥 규칙 기반 추정 분류입니다
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl border overflow-x-auto ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <svg
                        viewBox="0 0 890 320"
                        className="w-full min-w-[680px] h-auto select-none"
                      >
                        <text
                          x="20"
                          y="26"
                          className={`text-[12px] font-bold ${
                            darkMode ? 'fill-blue-400' : 'fill-blue-700'
                          }`}
                        >
                          ▲ 상단 7개 노드: 문장 성분 (단어·구·절이 문장에서 맡는 역할) — 원을 클릭하면 아래에 상세 설명이 표시됩니다
                        </text>
                        <text
                          x="20"
                          y="308"
                          className={`text-[12px] font-bold ${
                            darkMode ? 'fill-emerald-400' : 'fill-emerald-700'
                          }`}
                        >
                          ▲ 하단 9개 노드: 품사 (개별 단어의 정체, 한정사 포함) — 현재 선택 어절: &quot;{activeToken?.word}&quot; ({activeToken?.comp} ↔ {activeToken?.pos})
                        </text>

                        {MAPPING_EDGES.map((edge, idx) => {
                          const cPos = COMP_COORDS[edge.comp];
                          const pPos = POS_COORDS[edge.pos];
                          const isHighlighted =
                            activeToken &&
                            activeToken.comp === edge.comp &&
                            activeToken.pos === edge.pos;
                          return (
                            <line
                              key={idx}
                              x1={cPos.x}
                              y1={cPos.y + 26}
                              x2={pPos.x}
                              y2={pPos.y - 26}
                              stroke={
                                isHighlighted
                                  ? '#f59e0b'
                                  : darkMode
                                  ? '#334155'
                                  : '#cbd5e1'
                              }
                              strokeWidth={isHighlighted ? 4 : 1.5}
                              strokeDasharray={isHighlighted ? undefined : '4 3'}
                            />
                          );
                        })}

                        {(Object.keys(COMP_COORDS) as CompId[]).map((cid) => {
                          const coord = COMP_COORDS[cid];
                          const isActive =
                            activeToken?.comp === cid ||
                            (focusedNode?.type === 'comp' && focusedNode.id === cid);
                          return (
                            <g
                              key={cid}
                              onClick={() => setFocusedNode({ type: 'comp', id: cid })}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={coord.x}
                                cy={coord.y}
                                r={28}
                                fill={
                                  isActive
                                    ? '#2563eb'
                                    : darkMode
                                    ? '#0f172a'
                                    : '#ffffff'
                                }
                                stroke={isActive ? '#f59e0b' : '#3b82f6'}
                                strokeWidth={isActive ? 3.5 : 2}
                              />
                              <text
                                x={coord.x}
                                y={coord.y - 3}
                                textAnchor="middle"
                                className={`text-[12px] font-black ${
                                  isActive
                                    ? 'fill-white'
                                    : darkMode
                                    ? 'fill-slate-100'
                                    : 'fill-slate-900'
                                }`}
                              >
                                {cid}
                              </text>
                              <text
                                x={coord.x}
                                y={coord.y + 13}
                                textAnchor="middle"
                                className={`text-[9px] font-bold ${
                                  isActive
                                    ? 'fill-blue-100'
                                    : darkMode
                                    ? 'fill-slate-300'
                                    : 'fill-slate-600'
                                }`}
                              >
                                {coord.short}
                              </text>
                            </g>
                          );
                        })}

                        {(Object.keys(POS_COORDS) as PosId[]).map((pid) => {
                          const coord = POS_COORDS[pid];
                          const isActive =
                            activeToken?.pos === pid ||
                            (focusedNode?.type === 'pos' && focusedNode.id === pid);
                          return (
                            <g
                              key={pid}
                              onClick={() => setFocusedNode({ type: 'pos', id: pid })}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={coord.x}
                                cy={coord.y}
                                r={26}
                                fill={
                                  isActive
                                    ? '#059669'
                                    : darkMode
                                    ? '#0f172a'
                                    : '#ffffff'
                                }
                                stroke={isActive ? '#f59e0b' : '#10b981'}
                                strokeWidth={isActive ? 3.5 : 2}
                              />
                              <text
                                x={coord.x}
                                y={coord.y - 2}
                                textAnchor="middle"
                                className={`text-[11px] font-black ${
                                  isActive
                                    ? 'fill-white'
                                    : darkMode
                                    ? 'fill-slate-100'
                                    : 'fill-slate-900'
                                }`}
                              >
                                {pid}
                              </text>
                              <text
                                x={coord.x}
                                y={coord.y + 12}
                                textAnchor="middle"
                                className={`text-[8.5px] font-bold ${
                                  isActive
                                    ? 'fill-emerald-100'
                                    : darkMode
                                    ? 'fill-slate-300'
                                    : 'fill-slate-600'
                                }`}
                              >
                                {coord.short}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {focusedNode && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs ${
                          darkMode
                            ? 'bg-indigo-950/50 border-indigo-700'
                            : 'bg-indigo-50 border-indigo-200'
                        }`}
                      >
                        {focusedNode.type === 'comp' ? (
                          (() => {
                            const info = SENTENCE_COMPONENTS.find(
                              (c) => c.id === focusedNode.id
                            );
                            if (!info) return null;
                            return (
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-sm text-blue-600 dark:text-blue-400">
                                    📘 [문장 성분 상세] {info.name} — {info.engName} ({info.roleTitle})
                                  </span>
                                  <button
                                    onClick={() => setFocusedNode(null)}
                                    className="text-[11px] font-bold underline"
                                  >
                                    닫기✕
                                  </button>
                                </div>
                                <p className="mt-1 font-semibold">{info.easyMeaning}</p>
                                <p className="mt-1 text-slate-600 dark:text-slate-300">
                                  • <strong>어순 규칙:</strong> {info.wordOrderRule} | <strong>결합 가능 품사(구·절 포함):</strong> {info.allowedPos.join(', ')}
                                </p>
                                <p className="mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                                  • <strong>대표 예문:</strong> {info.exampleHighlight}
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          (() => {
                            const info = PARTS_OF_SPEECH.find(
                              (p) => p.id === focusedNode.id
                            );
                            if (!info) return null;
                            return (
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                    📗 [9품사 상세] {info.name} — {info.engName} ({info.identityTitle})
                                  </span>
                                  <button
                                    onClick={() => setFocusedNode(null)}
                                    className="text-[11px] font-bold underline"
                                  >
                                    닫기✕
                                  </button>
                                </div>
                                <p className="mt-1 font-semibold">{info.easyMeaning}</p>
                                <p className="mt-1 text-slate-600 dark:text-slate-300">
                                  • <strong>수행 가능한 문장 성분 역할(구 단위 포함):</strong> {info.allowedComp.join(', ')}
                                </p>
                                <p className="mt-1 font-mono text-blue-600 dark:text-blue-400">
                                  • <strong>대표 어휘:</strong> {info.exampleWords}
                                </p>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-bold mb-2">
                        👇 아래 문장의 각 단어를 클릭하면 위 연결선이 움직이고 아래에 상세 문법 역할이 표시됩니다:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentDiagramData.tokens.map((tok, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTokenIdx(idx)}
                            className={`px-3 py-2 rounded-xl border-2 text-left transition-all ${
                              selectedTokenIdx === idx
                                ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-slate-800 border-amber-500'
                                : darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="text-sm font-black">{tok.word}</div>
                            <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                              {tok.compLabel} · {tok.posLabel}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {tok.meaning}
                            </div>
                          </button>
                        ))}
                      </div>

                      {activeToken && (
                        <div
                          className={`mt-3 p-3.5 rounded-xl border text-xs ${
                            darkMode
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-amber-50/60 border-amber-200'
                          }`}
                        >
                          <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                            🔍 선택 어절 정밀 분석: &quot;{activeToken.word}&quot; — [{activeToken.compLabel} ↔ {activeToken.posLabel}]
                          </div>
                          <p className="mt-1 font-semibold">
                            • 단어 의미: {activeToken.meaning} | 문법 역할: {activeToken.roleExplanation}
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            • <strong>문장 해석:</strong> {currentDiagramData.naturalKo}
                          </p>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                            • <strong>문장 뼈대 공식:</strong> {currentDiagramData.skeleton} ({currentDiagramData.patternType})
                          </p>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                            • <strong>핵심 어순 포인트:</strong> {currentDiagramData.wordOrderTip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {diagramTab === 'comp' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SENTENCE_COMPONENTS.map((comp) => (
                      <div
                        key={comp.id}
                        className={`p-4 rounded-xl border text-xs ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                            [{comp.id}] {comp.name} — {comp.engName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold">
                            {comp.roleTitle}
                          </span>
                        </div>
                        <p className="mt-2 font-semibold leading-relaxed">
                          💡 <strong>쉬운 뜻:</strong> {comp.easyMeaning}
                        </p>
                        <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                          📐 <strong>어순 규칙:</strong> {comp.wordOrderRule}
                        </p>
                        <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          🔗 <strong>결합 가능 품사(구·절 포함):</strong> {comp.allowedPos.join(', ')}
                        </p>
                        <div className="mt-2 p-2 rounded bg-white dark:bg-slate-900 font-mono text-[11px]">
                          예문: {comp.exampleHighlight}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {diagramTab === 'pos' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PARTS_OF_SPEECH.map((pos) => (
                      <div
                        key={pos.id}
                        className={`p-4 rounded-xl border text-xs ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            [{pos.id}] {pos.name} — {pos.engName}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          {pos.identityTitle}
                        </div>
                        <p className="mt-2 font-semibold leading-relaxed">
                          💡 <strong>쉬운 뜻:</strong> {pos.easyMeaning}
                        </p>
                        <p className="mt-1.5 text-blue-600 dark:text-blue-400 font-bold">
                          🎯 <strong>담당하는 문장 성분(구 단위 포함):</strong> {pos.allowedComp.join(', ')}
                        </p>
                        <div className="mt-2 p-2 rounded bg-white dark:bg-slate-900 font-mono text-[11px]">
                          대표 단어: {pos.exampleWords}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ============================================================ */}
              {/* STEP 4. 3단 소리블록 직독직해 & 따라 쓰기 완벽 일치 판정 */}
              {/* ============================================================ */}
              <section
                className={`p-4 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-500 text-slate-950">
                    STEP 4 · 3단 소리블록 직독직해 & 타이핑 필사 훈련
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    문장 카드를 클릭하면 위 STEP 3 다이어그램이 해당 문장으로 즉시 연동됩니다.
                  </p>
                </div>

                <div className="space-y-3">
                  {currentTheme.sentences.map((sent, idx) => {
                    const typed = (dictationInputs[sent.id] || '').trim();
                    const isExactMatch =
                      typed.length > 0 &&
                      typed.toLowerCase() === sent.rawEn.trim().toLowerCase();

                    return (
                      <div
                        key={sent.id}
                        onClick={() => {
                          setDiagramSourceMode('theme');
                          setActiveSentenceIdx(idx);
                          setSelectedTokenIdx(0);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          activeSentenceIdx === idx
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-slate-800/80'
                            : darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-600 text-white">
                              {sent.tag} · 핵심어: {sent.targetWord}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakText(sent.targetWord);
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold"
                            >
                              🔊 핵심어
                            </button>
                          </div>
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => speakText(sent.rawEn, 0.5)}
                              className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold"
                            >
                              🐢 0.50x
                            </button>
                            <button
                              onClick={() => speakText(sent.rawEn, 1.0)}
                              className="px-2 py-1 rounded bg-blue-600 text-white text-[11px] font-bold"
                            >
                              🔊 1.0x 문장듣기
                            </button>
                            <button
                              onClick={() =>
                                toggleSaveSentenceFromLesson(
                                  sent.rawEn,
                                  sent.naturalKo,
                                  sent.grammarPoint,
                                  sent.pronLine
                                )
                              }
                              className="px-2 py-1 rounded border text-[11px] font-bold bg-white dark:bg-slate-900"
                            >
                              ⭐ 구문보관
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-1.5 text-xs">
                          <div className="text-slate-600 dark:text-slate-300 font-semibold">
                            ① <strong>의미단위 직독:</strong> {sent.koLine}
                          </div>
                          <div className="text-base md:text-lg font-black text-blue-600 dark:text-blue-400">
                            ② {sent.enLine}
                          </div>
                          {showPronGuide && (
                            <div className="space-y-0.5">
                              <div className="font-mono text-[11px] text-slate-500">
                                IPA: {sent.ipaLine}
                              </div>
                              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                🗣️ 한글 연음 가이드: {sent.pronLine}
                              </div>
                            </div>
                          )}
                          <div className="font-bold text-sm">
                            ③ <strong>자연스러운 완역:</strong> {sent.naturalKo}
                          </div>
                          <div className="pt-1.5 border-t border-dashed border-slate-300 dark:border-slate-700 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                            <div>
                              📐 <strong>어순 공식:</strong> {sent.wordOrderFormula} ({sent.structure})
                            </div>
                            <div>
                              📌 <strong>문법 포인트:</strong> {sent.grammarPoint}
                            </div>
                            <div>
                              🔄 <strong>Paraphrase:</strong> {sent.paraphraseVersion}
                            </div>
                          </div>
                        </div>

                        <div
                          className="mt-3 flex flex-wrap items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={dictationInputs[sent.id] || ''}
                            onChange={(e) =>
                              setDictationInputs((prev) => ({
                                ...prev,
                                [sent.id]: e.target.value,
                              }))
                            }
                            placeholder={`✍️ 따라 쓰기: ${sent.rawEn}`}
                            className={`flex-1 min-w-[240px] px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                              isExactMatch
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                : darkMode
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white border-slate-300'
                            }`}
                          />
                          {isExactMatch && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold">
                              ✅ 원문 완벽 일치!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ============================================================ */}
              {/* STEP 5. 단계별 확인 퀴즈(정답 위치 분산 완료) & 서술형 영작 · 규칙 점검 코치 */}
              {/* ============================================================ */}
              <section
                className={`p-4 rounded-2xl border space-y-4 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white">
                  STEP 5 · 초·중·고급 실전 점검 퀴즈 & 서술형 영작 · 규칙 기반 구문 점검 코치
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* 초급 퀴즈 */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-blue-500">
                        🌱 초급 어휘: &quot;{currentTheme.quiz.beginner.word}&quot;
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(currentTheme.quiz.beginner.word)}
                        className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                      >
                        🔊 발음
                      </button>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {currentTheme.quiz.beginner.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setBegSelected(idx)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg border font-semibold ${
                            begSelected === idx
                              ? idx === currentTheme.quiz.beginner.answerIdx
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : darkMode
                              ? 'bg-slate-900 border-slate-800'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {idx + 1}. {opt}
                        </button>
                      ))}
                    </div>
                    {begSelected !== null && (
                      <div className="mt-2 p-2 rounded bg-blue-500/10 text-[11px] font-semibold">
                        💡 해설: {currentTheme.quiz.beginner.explanation}
                      </div>
                    )}
                  </div>

                  {/* 중급 빈칸 퀴즈 */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-emerald-500 mb-1">
                      🌿 중급 문맥 빈칸 ({currentTheme.quiz.intermediate.hint})
                    </div>
                    <p className="font-mono text-[11px] mb-2">
                      {currentTheme.quiz.intermediate.sentenceBefore} [ _____ ]{' '}
                      {currentTheme.quiz.intermediate.sentenceAfter}
                    </p>
                    <div className="space-y-1.5">
                      {currentTheme.quiz.intermediate.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setIntSelected(idx)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg border font-semibold ${
                            intSelected === idx
                              ? idx === currentTheme.quiz.intermediate.answerIdx
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : darkMode
                              ? 'bg-slate-900 border-slate-800'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {idx + 1}. {opt}
                        </button>
                      ))}
                    </div>
                    {intSelected !== null && (
                      <div className="mt-2 p-2 rounded bg-emerald-500/10 text-[11px] font-semibold">
                        💡 해설: {currentTheme.quiz.intermediate.explanation}
                      </div>
                    )}
                  </div>

                  {/* 고급 어법 복수선택 퀴즈 */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-amber-500 mb-1">
                      🌳 고급 어법 판별 (2개 선택)
                    </div>
                    <p className="text-[11px] mb-2">
                      {currentTheme.quiz.advanced.questionPrompt}
                    </p>
                    <div className="space-y-1.5">
                      {currentTheme.quiz.advanced.options.map((opt, idx) => {
                        const isPicked = advSelected.includes(idx);
                        const isCorrect =
                          currentTheme.quiz.advanced.answerIndices.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              setAdvSelected((prev) =>
                                prev.includes(idx)
                                  ? prev.filter((i) => i !== idx)
                                  : [...prev, idx]
                              )
                            }
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg border font-semibold ${
                              isPicked
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-rose-600 text-white border-rose-600'
                                : darkMode
                                ? 'bg-slate-900 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            {idx + 1}. {opt}
                          </button>
                        );
                      })}
                    </div>
                    {advSelected.length > 0 && (
                      <div className="mt-2 p-2 rounded bg-amber-500/10 text-[11px] font-semibold">
                        💡 해설: {currentTheme.quiz.advanced.explanation}
                      </div>
                    )}
                  </div>
                </div>

                {/* 서술형 영작 미션 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold">
                      ✍️ 서술형 영작 미션: &quot;{currentTheme.quiz.writingMission.koPrompt}&quot; (목표 패턴: {currentTheme.quiz.writingMission.targetPattern})
                    </span>
                    <button
                      onClick={() => setShowWritingModel((p) => !p)}
                      className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-[11px]"
                    >
                      {showWritingModel ? '🙈 모범답안 숨기기' : '👁️ 모범답안 확인'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={writingInput}
                    onChange={(e) => setWritingInput(e.target.value)}
                    placeholder="위 우리말을 영어로 직접 영작해 보세요..."
                    className={`w-full mt-2 px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-900 border-slate-700'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                  {showWritingModel && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold flex items-center justify-between">
                      <span>✅ 모범 답안: {currentTheme.quiz.writingMission.modelAnswer}</span>
                      <button
                        onClick={() =>
                          speakText(currentTheme.quiz.writingMission.modelAnswer)
                        }
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]"
                      >
                        🔊 듣기
                      </button>
                    </div>
                  )}
                </div>

                {/* 규칙 기반 문장·표현 점검 코치 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-extrabold">
                      🤖 규칙 기반 문장·표현 점검 코치 & 실전 스피킹 타이머
                    </div>
                    <div className="flex items-center gap-1.5">
                      {([5, 15, 30] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSpeakingGoalMins(m);
                            setSpeakingSeconds(0);
                            setIsSpeakingTimerRunning(false);
                          }}
                          className={`px-2 py-0.5 rounded font-bold ${
                            speakingGoalMins === m
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        >
                          {m}분 목표
                        </button>
                      ))}
                      <span className="font-mono font-black text-sm px-2">
                        {String(Math.floor(speakingSeconds / 60)).padStart(2, '0')}:
                        {String(speakingSeconds % 60).padStart(2, '0')}
                      </span>
                      <button
                        onClick={handleToggleSpeakingTimer}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold"
                      >
                        {isSpeakingTimerRunning ? '⏸ 일시정지' : '▶ 타이머시작'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto mb-2 p-2 rounded bg-white dark:bg-slate-900">
                    {chatHistory.map((turn, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg ${
                          turn.role === 'user'
                            ? 'bg-blue-600 text-white ml-8'
                            : darkMode
                            ? 'bg-slate-800 mr-8'
                            : 'bg-slate-100 mr-8'
                        }`}
                      >
                        <div className="font-semibold">{turn.text}</div>
                        {turn.correction && (
                          <div className="text-[11px] text-emerald-500 font-bold mt-1">
                            {turn.correction}
                          </div>
                        )}
                        {turn.nuanceTip && (
                          <div className="text-[11px] text-amber-500 font-semibold mt-0.5">
                            {turn.nuanceTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartVoiceRecognition}
                      className={`px-3 py-2 rounded-lg font-extrabold text-white shrink-0 ${
                        isMicListening ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600'
                      }`}
                    >
                      {isMicListening ? '🎙️ 듣는 중...' : '🎙️ 음성발화 입력'}
                    </button>
                    <input
                      type="text"
                      value={userChatInput}
                      onChange={(e) => setUserChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendCoachMessage()}
                      placeholder="영어로 문장을 입력하거나 음성발화 버튼을 눌러 말씀해 보세요..."
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                    <button
                      onClick={handleSendCoachMessage}
                      className="px-3 py-2 rounded-lg font-extrabold bg-blue-600 text-white shrink-0"
                    >
                      구문점검
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* [모드 2] 🎓 1~5교시 실전 훈련소 & 수능·서술형·내신 3대 마스터 코스 */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'examCourses' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="text-base md:text-lg font-black">
                    🎓 1~5교시 실전 훈련 모듈 & 수능·내신 마스터 코스
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { p: 1, label: '1교시 · 어휘 20문항 채점' },
                        { p: 2, label: '2교시 · 12구문 & 어순조립' },
                        { p: 3, label: '3교시 · 3대 입시트랙' },
                        { p: 4, label: '4교시 · 학술 6대 지문' },
                        { p: 5, label: '5교시 · 빈출어법 10선 & 내 지문분석' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.p}
                        onClick={() => setActiveModulePeriod(item.p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                          activeModulePeriod === item.p
                            ? `${themeAccentBg} text-white`
                            : darkMode
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1교시: 어휘 스피드 20문항 (정답 번호 1~4번 무작위 셔플 완료) */}
                {activeModulePeriod === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-500/10 text-xs">
                      <div className="font-extrabold">
                        🎯 실시간 채점 점수:{' '}
                        <span className="text-blue-600 dark:text-blue-400 text-sm">
                          {period1CorrectCount} / {period1QuizQuestions.length}점
                        </span>{' '}
                        (응시 {Object.keys(period1Answers).length}문항 · 정답 위치 1~4번 무작위 배정)
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPeriod1Answers({})}
                          className="px-2.5 py-1 rounded bg-slate-700 text-white font-bold"
                        >
                          🔄 현재 시험지 다시 풀기
                        </button>
                        <button
                          onClick={() => {
                            setVocabChallengeSetSeed((s) => s + 1);
                            setPeriod1Answers({});
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
                        >
                          🎲 새 시험지 셔플 생성 (Set #{vocabChallengeSetSeed})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {period1QuizQuestions.map((qObj, idx) => {
                        const { item, options, correctIdx } = qObj;
                        const qKey = `${vocabChallengeSetSeed}-${idx}`;
                        const picked = period1Answers[qKey];

                        return (
                          <div
                            key={qKey}
                            className={`p-3 rounded-xl border ${
                              darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm text-blue-500">
                                Q{idx + 1}. {item.word}{' '}
                                <span className="text-[11px] font-normal opacity-75">
                                  {item.ipa} {showPronGuide ? item.pron : ''}
                                </span>
                              </span>
                              <button
                                onClick={() => speakText(item.word)}
                                className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                              >
                                🔊 단어듣기
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              {options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() =>
                                    setPeriod1Answers((prev) => ({
                                      ...prev,
                                      [qKey]: oIdx,
                                    }))
                                  }
                                  className={`p-1.5 rounded border text-left font-semibold ${
                                    picked === oIdx
                                      ? oIdx === correctIdx
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-rose-600 text-white border-rose-600'
                                      : darkMode
                                      ? 'bg-slate-900 border-slate-800'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  {oIdx + 1}. {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2교시: 12대 검증 구문 아카이브 & 중복 방지·개별 취소 어순 조립기 */}
                {activeModulePeriod === 2 && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold">
                        🧩 검증 구문 12선 (한글발음 + 시드 기반 결정론적 어순 배열 훈련)
                      </span>
                      <button
                        onClick={() => {
                          setSyntaxGeneratorSeed((s) => s + 1);
                          setScramblePickedIndices({});
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                      >
                        🔄 어순 셔플 시드 변경 (#{syntaxGeneratorSeed})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {generatedSyntaxList.map((syn, idx) => {
                        const pickedIdxs = scramblePickedIndices[syn.id] || [];
                        const builtWords = pickedIdxs.map(
                          (i) => syn.scrambleTokens[i]
                        );
                        const builtStr = builtWords.join(' ');
                        const isComplete =
                          builtStr.toLowerCase() ===
                          syn.sentenceEn.trim().toLowerCase();

                        return (
                          <div
                            key={syn.id}
                            className={`p-4 rounded-xl border ${
                              darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-extrabold text-blue-500">
                                #{idx + 1} · {syn.openerRule} (표제어: {syn.targetWord} / 문장 속 형태·파생형: {syn.matchedForm})
                              </span>
                              <button
                                onClick={() => speakText(syn.sentenceEn)}
                                className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
                              >
                                🔊 원문듣기
                              </button>
                            </div>
                            <div className="text-sm font-black mt-1">
                              {syn.sentenceEn}
                            </div>
                            {showPronGuide && (
                              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                🗣️ {syn.pronLine}
                              </div>
                            )}
                            <div className="mt-1 font-semibold">{syn.sentenceKo}</div>
                            <div className="text-[11px] opacity-80 mt-0.5">
                              🔄 조건·의미 보존 Paraphrase: {syn.paraphrasedEn}
                            </div>

                            {/* 중복 클릭 방지 및 개별 단어 클릭 취소 지원 어순 조립판 */}
                            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-amber-500">
                                  🧩 섞인 어절을 클릭해 조립하세요 (이미 선택한 조각이나 아래 조립된 단어를 다시 누르면 개별 취소됩니다):
                                </span>
                                <button
                                  onClick={() =>
                                    setScramblePickedIndices((prev) => ({
                                      ...prev,
                                      [syn.id]: [],
                                    }))
                                  }
                                  className="text-[11px] underline font-bold"
                                >
                                  전체 초기화
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {syn.scrambleTokens.map((tok, tIdx) => {
                                  const isUsed = pickedIdxs.includes(tIdx);
                                  return (
                                    <button
                                      key={tIdx}
                                      onClick={() =>
                                        setScramblePickedIndices((prev) => {
                                          const cur = prev[syn.id] || [];
                                          return {
                                            ...prev,
                                            [syn.id]: cur.includes(tIdx)
                                              ? cur.filter((x) => x !== tIdx)
                                              : [...cur, tIdx],
                                          };
                                        })
                                      }
                                      className={`px-2 py-1 rounded border font-bold transition-all ${
                                        isUsed
                                          ? 'opacity-40 bg-slate-200 dark:bg-slate-800 line-through border-slate-400'
                                          : 'bg-white dark:bg-slate-900 hover:border-blue-500'
                                      }`}
                                    >
                                      {tok}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="p-2 rounded bg-white dark:bg-slate-900 min-h-[36px] flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1">
                                  {pickedIdxs.length === 0 ? (
                                    <span className="text-slate-400 font-mono">
                                      👆 위 단어 조각을 순서대로 클릭해 보세요.
                                    </span>
                                  ) : (
                                    pickedIdxs.map((tokenIndex, orderIdx) => (
                                      <button
                                        key={`${tokenIndex}-${orderIdx}`}
                                        onClick={() =>
                                          setScramblePickedIndices((prev) => ({
                                            ...prev,
                                            [syn.id]: (prev[syn.id] || []).filter(
                                              (x) => x !== tokenIndex
                                            ),
                                          }))
                                        }
                                        title="클릭하면 이 단어를 뺍니다"
                                        className="px-2 py-0.5 rounded bg-blue-600/15 text-blue-600 dark:text-blue-300 font-mono font-bold hover:bg-rose-500/20 hover:text-rose-500"
                                      >
                                        {syn.scrambleTokens[tokenIndex]} ✕
                                      </button>
                                    ))
                                  )}
                                </div>
                                {isComplete && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                    ✅ 어순 완벽 일치!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3교시: 수능독해 · 서술형어법 · 고교내신 3대 마스터 트랙 */}
                {activeModulePeriod === 3 && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-wrap gap-2">
                      {EXAM_COURSES.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedExamTrackId(c.id)}
                          className={`px-3.5 py-2 rounded-xl font-extrabold ${
                            selectedExamTrackId === c.id
                              ? 'bg-indigo-600 text-white'
                              : darkMode
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.shortTabName}
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const course =
                        EXAM_COURSES.find((c) => c.id === selectedExamTrackId) ||
                        EXAM_COURSES[0];
                      return (
                        <div className="space-y-4">
                          <div
                            className={`p-4 rounded-xl border ${
                              darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-indigo-50/50 border-indigo-200'
                            }`}
                          >
                            <div className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                              {course.badge} — {course.title}
                            </div>
                            <p className="mt-1 font-semibold">{course.targetGoal}</p>
                            <p className="mt-1 text-[11px] opacity-80">
                              ⏱️ {course.scheduleGuide}
                            </p>
                          </div>

                          {course.steps.map((st) => {
                            const key = `${course.id}-${st.stepNum}`;
                            const pickedTrap = examStepTrapAns[key];
                            const essayVal = examStepEssayInputs[key] || '';
                            const showMod = examStepShowModel[key];

                            return (
                              <div
                                key={key}
                                className={`p-4 rounded-xl border space-y-3 ${
                                  darkMode
                                    ? 'bg-slate-950 border-slate-800'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-sm text-blue-500">
                                    {st.stepTitle} ({st.focusPoint})
                                  </span>
                                  <button
                                    onClick={() => speakText(st.originalPassageEn)}
                                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
                                  >
                                    🔊 지문듣기
                                  </button>
                                </div>
                                <p className="text-sm font-bold leading-relaxed">
                                  {st.originalPassageEn}
                                </p>
                                {showPronGuide && (
                                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    🗣️ {st.originalPassagePron}
                                  </p>
                                )}
                                <p className="text-slate-600 dark:text-slate-300">
                                  {st.originalPassageKo}
                                </p>
                                <div className="p-2.5 rounded-lg bg-amber-500/10">
                                  <div className="font-extrabold text-amber-600 dark:text-amber-400">
                                    🔄 변형 패러프레이징: {st.transformedEn}
                                  </div>
                                  {showPronGuide && (
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                      🗣️ {st.transformedPron}
                                    </div>
                                  )}
                                  <div className="text-[11px] mt-0.5">
                                    💡 {st.transformedPoint}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg border border-slate-300 dark:border-slate-700">
                                  <div className="font-extrabold mb-1.5">
                                    ⚡ 핵심 어법 판별: {st.grammarTrapQuestion.prompt}
                                  </div>
                                  <div className="flex gap-2">
                                    {(['A', 'B'] as const).map((ch) => (
                                      <button
                                        key={ch}
                                        onClick={() =>
                                          setExamStepTrapAns((prev) => ({
                                            ...prev,
                                            [key]: ch,
                                          }))
                                        }
                                        className={`px-3 py-1 rounded font-bold border ${
                                          pickedTrap === ch
                                            ? ch ===
                                              st.grammarTrapQuestion.correctChoice
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-rose-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800'
                                        }`}
                                      >
                                        ({ch}){' '}
                                        {ch === 'A'
                                          ? st.grammarTrapQuestion.choiceA
                                          : st.grammarTrapQuestion.choiceB}
                                      </button>
                                    ))}
                                  </div>
                                  {pickedTrap && (
                                    <p className="mt-1.5 text-[11px] font-semibold text-blue-500">
                                      💡 해설: {st.grammarTrapQuestion.explanation}
                                    </p>
                                  )}
                                </div>

                                <div className="p-3 rounded-lg border border-slate-300 dark:border-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-indigo-500">
                                      ✍️ [{st.essayMission.typeBadge}] {st.essayMission.koCondition}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setExamStepShowModel((prev) => ({
                                          ...prev,
                                          [key]: !prev[key],
                                        }))
                                      }
                                      className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold"
                                    >
                                      {showMod ? '모범답안 닫기' : '모범답안 보기'}
                                    </button>
                                  </div>
                                  <div className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                    제시어(givenWords): {st.essayMission.givenWords}
                                  </div>
                                  <input
                                    type="text"
                                    value={essayVal}
                                    onChange={(e) =>
                                      setExamStepEssayInputs((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    placeholder="제시어를 모두 활용하여 서술형 답안을 작성해 보세요..."
                                    className="w-full mt-2 px-3 py-1.5 rounded border bg-white dark:bg-slate-900"
                                  />
                                  {showMod && (
                                    <div className="mt-2 p-2 rounded bg-emerald-500/15 font-bold">
                                      ✅ 모범답안: {st.essayMission.modelAnswerEn}
                                      <div className="text-[11px] opacity-80 mt-0.5">
                                        채점 기준: {st.essayMission.scoringCriteria}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 4교시: 학술 6대 영역 독해 지문 */}
                {activeModulePeriod === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {EBS_MAJOR_TOPICS.map((top) => (
                      <div
                        key={top.id}
                        className={`p-4 rounded-xl border space-y-2 ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-500">
                            {top.category}
                          </span>
                          <button
                            onClick={() => speakText(top.passageEn)}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                          >
                            🔊 지문듣기
                          </button>
                        </div>
                        <div className="text-sm font-black">{top.title}</div>
                        <p className="leading-relaxed font-semibold">
                          {top.passageEn}
                        </p>
                        {showPronGuide && (
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                            🗣️ {top.passagePron}
                          </p>
                        )}
                        <p className="text-slate-600 dark:text-slate-300">
                          {top.passageKo}
                        </p>
                        <div className="p-2 rounded bg-amber-500/10 font-bold text-amber-600 dark:text-amber-300">
                          📌 요약문: {top.paraphraseSummary}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {top.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5교시: 핵심 빈출 어법 10문항 채점 & 내 학교 지문 분석기 (빈칸 정답 스포일러 가림 토글 적용) */}
                {activeModulePeriod === 5 && (
                  <div className="space-y-6 text-xs">
                    <div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 mb-3">
                        <span className="font-extrabold">
                          ⚡ 핵심 빈출 어법 10문항 실시간 점수:{' '}
                          <strong className="text-indigo-500 text-sm">
                            {quiz406CorrectCount} / {GRAMMAR_406_QUIZ_BANK.length}점
                          </strong>
                        </span>
                        <button
                          onClick={() => setQuiz406Answers({})}
                          className="px-2.5 py-1 rounded bg-slate-700 text-white font-bold"
                        >
                          🔄 어법 선택 초기화
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {GRAMMAR_406_QUIZ_BANK.map((q) => {
                          const picked = quiz406Answers[q.id];
                          return (
                            <div
                              key={q.id}
                              className={`p-3.5 rounded-xl border ${
                                darkMode
                                  ? 'bg-slate-950 border-slate-800'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="font-extrabold text-indigo-500">
                                {q.schoolTag}
                              </div>
                              <p className="font-mono text-xs my-1.5">
                                {q.sentenceBefore} [{' '}
                                <strong className="text-blue-500">
                                  (A) {q.choiceA} / (B) {q.choiceB}
                                </strong>{' '}
                                ] {q.sentenceAfter}
                              </p>
                              <div className="flex gap-2">
                                {(['A', 'B'] as const).map((ch) => (
                                  <button
                                    key={ch}
                                    onClick={() =>
                                      setQuiz406Answers((prev) => ({
                                        ...prev,
                                        [q.id]: ch,
                                      }))
                                    }
                                    className={`px-3 py-1 rounded font-bold border ${
                                      picked === ch
                                        ? ch === q.correct
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-rose-600 text-white'
                                        : 'bg-white dark:bg-slate-900'
                                    }`}
                                  >
                                    ({ch}) {ch === 'A' ? q.choiceA : q.choiceB}
                                  </button>
                                ))}
                              </div>
                              {picked && (
                                <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  💡 [{q.grammarCategory}] {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 내 학교 지문 붙여넣기 자동 문제 생성기 */}
                    <div
                      className={`p-4 rounded-xl border ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h3 className="font-black text-sm mb-1">
                        🏫 내 학교 교과서·모의고사 지문 직접 붙여넣기 분석기 (약어·소수점 보호 적용)
                      </h3>
                      <p className="text-[11px] opacity-80 mb-2">
                        {customPassageAnalysis.statusMessage}
                      </p>
                      <textarea
                        rows={3}
                        value={customSchoolPassage}
                        onChange={(e) => setCustomSchoolPassage(e.target.value)}
                        placeholder="분석할 영어 지문을 여기에 붙여넣으세요..."
                        className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                      />
                      {!customPassageAnalysis.isEmpty && (
                        <div className="space-y-2.5 mt-3">
                          {customPassageAnalysis.sentences.map((s) => {
                            const pBlankKey = `passage-blank-${s.idx}`;
                            const isPBlankShown = !!revealedBlankKeys[pBlankKey];
                            return (
                              <div
                                key={s.idx}
                                className="p-3 rounded-lg border bg-white dark:bg-slate-900 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-blue-500">
                                    문장 #{s.idx} 의미단위 청크 분할
                                  </span>
                                  <button
                                    onClick={() => speakText(s.rawEn)}
                                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                                  >
                                    🔊 듣기
                                  </button>
                                </div>
                                <div className="font-black text-sm">
                                  {s.soundBlockEn}
                                </div>
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono flex flex-wrap items-center justify-between gap-2">
                                  <span>빈칸 추론: {s.blankQuizSentence}</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleBlankKey(pBlankKey)}
                                    className={`px-2 py-0.5 rounded font-sans font-bold text-[10px] ${
                                      isPBlankShown
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 text-slate-950'
                                    }`}
                                  >
                                    {isPBlankShown
                                      ? `정답: ${s.answerWord}`
                                      : '❓ 정답 확인'}
                                  </button>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  어순 배열 시드 셔플: {s.scrambledWords.join(' / ')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* [모드 3] 📘 코어 80단어 & 파생어 족보 (데이터 구조와 일치하는 정직한 안내 + 표제어 단독 스피커) */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'wordbook' && (
            <section
              className={`p-4 rounded-2xl border space-y-4 ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <div className="font-black text-sm text-blue-600 dark:text-blue-400">
                  💡 4대 영역 코어 80단어 & 파생어 족보 순환 학습장 (영역별 20개 × 4영역 정밀 검증 DB)
                </div>
                <p className="mt-1 leading-relaxed">
                  본 단어장은 중등 필수·수능 학술·비즈니스 실무·오픽 구동사 4대 영역의 <strong>핵심 표제어 80선</strong>을 중심으로, 각 카드 하단 <strong>📌 [파생어 & 어법 족보]</strong>를 통해 품사별 파생어·반의어·문장 성분 역할을 함께 익히도록 구성되어 있습니다. Day(Set)를 이동하면 시작 오프셋이 5칸씩 순환하여 매일 새로운 순서로 복습할 수 있습니다.
                </p>
              </div>

              {/* 영영정의 워밍업 챌린지 5선 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-extrabold text-indigo-500 mb-2">
                  🔥 필수 다의어·파생어 워밍업 5선 (미국식 IPA & 영영정의)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {NAVER_OFFICIAL_WORD_CHALLENGE.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-600 dark:text-blue-400">
                          {ch.word}
                        </span>
                        <button
                          onClick={() => speakText(ch.word)}
                          className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {ch.ipa} {showPronGuide ? ch.pron : ''}
                      </div>
                      <div className="font-bold text-[11px]">{ch.meaning}</div>
                      <div className="text-[10px] opacity-75">{ch.enDef}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      '전체',
                      '중등 필수',
                      '고등·수능 핵심',
                      '비즈니스·실무',
                      '오픽(OPIc)·구동사',
                    ] as const
                  ).map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setWordbookLevelFilter(lv)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold ${
                        wordbookLevelFilter === lv
                          ? `${themeAccentBg} text-white`
                          : darkMode
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedWordbookDay((d) => Math.max(1, d - 1))
                    }
                    className="px-2.5 py-1 rounded border font-bold"
                  >
                    ◀ 이전 순환 Set
                  </button>
                  <span className="font-black text-sm text-blue-500">
                    순환 Set #{selectedWordbookDay}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedWordbookDay((d) => Math.min(100, d + 1))
                    }
                    className="px-2.5 py-1 rounded border font-bold"
                  >
                    다음 순환 Set ▶
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {wordbookEntries.map((entry, idx) => (
                  <div
                    key={`${entry.level}-${entry.word}-${idx}`}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 font-bold text-[10px]">
                          {entry.level}
                        </span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">
                          {entry.word}
                        </span>
                        <span className="font-mono text-[11px] opacity-75">
                          {entry.ipa}
                        </span>
                        {/* 표제어 단독 발음 스피커 */}
                        <button
                          onClick={() => speakText(entry.word)}
                          className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]"
                        >
                          🔊 단어
                        </button>
                      </div>
                      <button
                        onClick={() => speakText(entry.exampleEn)}
                        className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]"
                      >
                        🔊 예문듣기
                      </button>
                    </div>

                    {showPronGuide && (
                      <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        🗣️ {entry.pron} · 소리블록: {entry.soundBlock}
                      </div>
                    )}

                    <div className="font-bold text-sm">
                      뜻: {entry.meaning}{' '}
                      <span className="text-[11px] font-semibold text-indigo-500">
                        [{entry.posLabel} · 예문내 {entry.compLabel}]
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold">
                      🔗 짝꿍 표현: <strong>{entry.collocation}</strong> ({entry.collocationKo})
                    </div>

                    <div className="p-2 rounded bg-white dark:bg-slate-900 space-y-0.5">
                      <div className="font-bold">{entry.exampleEn}</div>
                      {showPronGuide && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {entry.examplePron}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500">
                        {entry.exampleKo}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      📌 [파생어 & 어법 족보] {entry.derivativesTip}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* [모드 4] ⭐ 내 보관함 */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'myVault' && (
            <div className="space-y-6 text-xs">
              <section
                className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <h2 className="text-base font-black">
                  ⭐ 내 단어 보관함 ({bookmarkedWords.length}개 · 브라우저 자동 보존)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950">
                  <input
                    type="text"
                    value={newWordForm.word}
                    onChange={(e) =>
                      setNewWordForm((p) => ({ ...p, word: e.target.value }))
                    }
                    placeholder="영단어 (필수)"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newWordForm.pron}
                    onChange={(e) =>
                      setNewWordForm((p) => ({ ...p, pron: e.target.value }))
                    }
                    placeholder="한글발음 (예: [스트림라인])"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newWordForm.meaning}
                    onChange={(e) =>
                      setNewWordForm((p) => ({ ...p, meaning: e.target.value }))
                    }
                    placeholder="한글 뜻 (필수)"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newWordForm.collocation}
                    onChange={(e) =>
                      setNewWordForm((p) => ({
                        ...p,
                        collocation: e.target.value,
                      }))
                    }
                    placeholder="연어/예문"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <button
                    onClick={handleAddCustomWord}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white font-extrabold"
                  >
                    ➕ 내 단어 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bookmarkedWords.map((bw) => (
                    <div
                      key={bw.id}
                      className={`p-3.5 rounded-xl border ${
                        bw.mastered
                          ? 'opacity-65 border-emerald-500/40'
                          : darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-blue-500">
                          {bw.word} {showPronGuide && bw.pron ? `(${bw.pron})` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakText(bw.word)}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                          >
                            🔊 단어
                          </button>
                          <button
                            onClick={() =>
                              setBookmarkedWords((prev) =>
                                prev.map((w) =>
                                  w.id === bw.id ? { ...w, mastered: !w.mastered } : w
                                )
                              )
                            }
                            className={`px-2 py-0.5 rounded font-bold ${
                              bw.mastered
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            {bw.mastered ? '✅ 암기완료' : '암기체크'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingWordId(bw.id);
                              setEditingWordDraft({
                                meaning: bw.meaning,
                                customNote: bw.customNote || '',
                              });
                            }}
                            className="px-2 py-0.5 rounded border"
                          >
                            ✏️수정
                          </button>
                          <button
                            onClick={() =>
                              setBookmarkedWords((prev) =>
                                prev.filter((w) => w.id !== bw.id)
                              )
                            }
                            className="px-2 py-0.5 rounded bg-rose-600 text-white"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="font-bold mt-1">뜻: {bw.meaning}</div>
                      <div className="text-[11px] opacity-80">
                        연어: {bw.collocation} | {bw.posLabel} · {bw.compLabel}
                      </div>
                      {bw.customNote && (
                        <div className="text-[11px] text-amber-500 mt-0.5">
                          📝 메모: {bw.customNote}
                        </div>
                      )}

                      {editingWordId === bw.id && (
                        <div className="mt-2 pt-2 border-t flex gap-1.5">
                          <input
                            type="text"
                            value={editingWordDraft.meaning}
                            onChange={(e) =>
                              setEditingWordDraft((d) => ({
                                ...d,
                                meaning: e.target.value,
                              }))
                            }
                            className="flex-1 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                          />
                          <input
                            type="text"
                            value={editingWordDraft.customNote}
                            onChange={(e) =>
                              setEditingWordDraft((d) => ({
                                ...d,
                                customNote: e.target.value,
                              }))
                            }
                            placeholder="메모"
                            className="flex-1 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                          />
                          <button
                            onClick={() => {
                              setBookmarkedWords((prev) =>
                                prev.map((w) =>
                                  w.id === bw.id
                                    ? {
                                        ...w,
                                        meaning: editingWordDraft.meaning,
                                        customNote: editingWordDraft.customNote,
                                      }
                                    : w
                                )
                              );
                              setEditingWordId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold"
                          >
                            저장
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section
                className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <h2 className="text-base font-black">
                  📌 내 문장 보관함 ({savedSentences.length}개 · 브라우저 자동 보존)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950">
                  <input
                    type="text"
                    value={newSentEn}
                    onChange={(e) => setNewSentEn(e.target.value)}
                    placeholder="영어 문장 (필수)"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newSentPron}
                    onChange={(e) => setNewSentPron(e.target.value)}
                    placeholder="한글 발음 메모"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newSentKo}
                    onChange={(e) => setNewSentKo(e.target.value)}
                    placeholder="우리말 해석 (필수)"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={newSentNote}
                    onChange={(e) => setNewSentNote(e.target.value)}
                    placeholder="문법 포인트 메모"
                    className="px-2.5 py-1.5 rounded border bg-white dark:bg-slate-900"
                  />
                  <button
                    onClick={handleAddCustomSentence}
                    className="px-3 py-1.5 rounded bg-emerald-600 text-white font-extrabold"
                  >
                    ➕ 내 문장 추가
                  </button>
                </div>

                <div className="space-y-2.5">
                  {savedSentences.map((ss) => (
                    <div
                      key={ss.id}
                      className={`p-3.5 rounded-xl border ${
                        ss.mastered
                          ? 'opacity-65 border-emerald-500/40'
                          : darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-blue-500">
                          {ss.en}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakText(ss.en)}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                          >
                            🔊
                          </button>
                          <button
                            onClick={() =>
                              setSavedSentences((prev) =>
                                prev.map((s) =>
                                  s.id === ss.id ? { ...s, mastered: !s.mastered } : s
                                )
                              )
                            }
                            className={`px-2 py-0.5 rounded font-bold ${
                              ss.mastered
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            {ss.mastered ? '✅ 체화완료' : '체화체크'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingSentId(ss.id);
                              setEditingSentDraft({
                                en: ss.en,
                                ko: ss.ko,
                                note: ss.note,
                              });
                            }}
                            className="px-2 py-0.5 rounded border"
                          >
                            ✏️수정
                          </button>
                          <button
                            onClick={() =>
                              setSavedSentences((prev) =>
                                prev.filter((s) => s.id !== ss.id)
                              )
                            }
                            className="px-2 py-0.5 rounded bg-rose-600 text-white"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      {showPronGuide && ss.pron && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          🗣️ {ss.pron}
                        </div>
                      )}
                      <div className="font-semibold mt-1">{ss.ko}</div>
                      <div className="text-[11px] text-amber-500 mt-0.5">
                        📌 {ss.note}
                      </div>

                      {editingSentId === ss.id && (
                        <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5">
                          <input
                            type="text"
                            value={editingSentDraft.en}
                            onChange={(e) =>
                              setEditingSentDraft((d) => ({
                                ...d,
                                en: e.target.value,
                              }))
                            }
                            className="flex-1 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                          />
                          <input
                            type="text"
                            value={editingSentDraft.ko}
                            onChange={(e) =>
                              setEditingSentDraft((d) => ({
                                ...d,
                                ko: e.target.value,
                              }))
                            }
                            className="flex-1 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                          />
                          <button
                            onClick={() => {
                              setSavedSentences((prev) =>
                                prev.map((s) =>
                                  s.id === ss.id
                                    ? {
                                        ...s,
                                        en: editingSentDraft.en,
                                        ko: editingSentDraft.ko,
                                      }
                                    : s
                                )
                              );
                              setEditingSentId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold"
                          >
                            저장
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* [모드 5] 🗓️ 전체 총람 (전 과정 15개 트랙 비교 치트시트) */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'curriculum' && (
            <section
              className={`p-4 rounded-2xl border space-y-6 text-xs ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <h2 className="text-lg font-black">
                  🗓️ 전 과정 핵심 요약 치트시트 (테마 1~5 × 초·중·고급 15트랙 & 입시 공식 총람)
                </h2>
                <p className="text-slate-500 mt-1">
                  모든 테마의 레벨별 대표 문장, 소리블록, 한글 발음을 한눈에 비교하고 클릭 한 번으로 해당 강의로 바로 이동할 수 있는 마스터 요약표입니다.
                </p>
              </div>

              <div className="space-y-4">
                {THEMES.map((th) => (
                  <div
                    key={th.id}
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-blue-500">
                        {th.badge} · {th.title}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLiveKeyword(null);
                          setSelectedThemeId(th.id);
                          setActiveMode('daily');
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
                      >
                        이 테마 강의로 바로 이동 ↗
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {(['beginner', 'intermediate', 'advanced'] as const).map(
                        (lv) => {
                          const tr = th.levelTracks[lv];
                          return (
                            <div
                              key={lv}
                              className="p-3 rounded-lg border bg-white dark:bg-slate-900 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-indigo-500">
                                  {tr.levelName}
                                </span>
                                <button
                                  onClick={() => speakText(tr.patternEn)}
                                  className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                                >
                                  🔊
                                </button>
                              </div>
                              <div className="font-black text-xs">
                                {tr.patternSoundBlock}
                              </div>
                              {showPronGuide && (
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  🗣️ {tr.patternPron}
                                </div>
                              )}
                              <div className="text-[11px]">{tr.patternMeaningKo}</div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* [모드 6] 🛠️ 제작과정 백서 */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'devStory' && (
            <section
              className={`p-5 rounded-2xl border space-y-5 text-xs leading-relaxed ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-black">
                  PROJECT ARCHITECTURE & QA WHITEPAPER
                </span>
                <h2 className="text-xl font-black mt-2">
                  🛠️ [나만의 야나두 영어 PRO] 전체 설계 철학 및 엔지니어링 제작 백서
                </h2>
                <p className="text-slate-500 mt-1">
                  본 문서는 기획자(윤성만)의 실전 학습 철학을 바탕으로 <code>src/App.tsx</code> (파트 1~4)와 <code>src/studyData.ts</code>가 어떤 구조와 검증 과정을 거쳐 완성되었는지 기록한 기술·교육 아키텍처 백서입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-blue-500">
                    1. 핵심 교육 철학: 16개 문법 노드(7성분 + 9품사)와 소리블록(Chunking)
                  </h3>
                  <p>
                    • <strong>단어(품사)와 구·절(문장 성분)의 입체적 연결:</strong> 문장 성분 7개(S·V·IO·DO·SC·OC·M)와 9품사(명·대·동·형·부·전·접·한정사·감탄사)를 총 16개 노드로 시각화하고, 명사 수식어(<code>M-N</code>), 동명사구 주어(<code>S</code>), 전치사구 보어(<code>SC</code>), 한정사의 명사구 내부 한정 원리까지 일관되게 구현했습니다.
                  </p>
                  <p>
                    • <strong>전 문장 미국식 IPA & 실전 연음 한글 발음 탑재:</strong> 모든 표제어와 구문에 개별 발음 스피커와 <strong>0.30x · 0.50x · 0.75x · 1.0x · 1.25x 5단계 배속</strong>을 결합했습니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-emerald-500">
                    2. <code>src/App.tsx</code> (파트 1 ~ 파트 4) 프론트엔드 모듈 구조
                  </h3>
                  <p>
                    • <strong>[파트 1/4 ~ 3/4]:</strong> 단방향 타입 시스템, 16노드 사전, 9대 매체 큐레이션 90선, 5대 테마 초·중·고급 커리큘럼, 수능·서술형·내신 3대 코스, 그리고 사전 검증된 토큰 주석 맵(<code>VERIFIED_SENTENCE_TOKEN_MAP</code>)과 문맥 기반 추정 분류기를 결합한 구문 분석 엔진.
                  </p>
                  <p>
                    • <strong>[파트 4/4]:</strong> SSR 안전한 로컬스토리지 복원기(<code>readStorageJson</code>), 정답 위치가 1~4번으로 무작위 분산되는 1교시 어휘 채점 엔진, 중복 클릭 방지 어순 조립기, 규칙 기반 구문 점검 코치.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-amber-500">
                    3. <code>src/studyData.ts</code> 데이터 무결성 및 결정론적 셔플
                  </h3>
                  <p>
                    • <strong>코어 80단어 & 파생어 패밀리 DB:</strong> 4대 영역 80개 핵심 어휘의 의미 단위 소리블록과 파생어·어법 족보(<code>derivativesTip</code>), 12대 고정 구문 아카이브, 학술 독해 6대 지문 및 빈출 어법 10문항을 수록했습니다.
                  </p>
                  <p>
                    • <strong>시드 기반의 결정론적 피셔-예이츠 방식 셔플 & 약어 보호 분석기:</strong> 어순 배열 문제에서 원문 순서가 노출되지 않도록 문장 전체 어절을 재현 가능하게 섞으며, 약어(<code>Dr.</code>, <code>e.g.</code>)와 소수점(<code>3.14</code>)을 보호하는 문장 분리기를 구현했습니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-rose-500">
                    4. 아이패드(iPadOS Safari) 애플펜슬 벡터 획 배열(<code>strokesRef</code>) 엔진
                  </h3>
                  <p>
                    • <strong>실제 필압 반영 및 시각적 완성도:</strong> 만년필 도구에서 포인트의 실제 <code>pressure</code>(필압) 값을 선 두께에 반영하며, 5단계 굵기(<code>1.5~9px</code>), 형광펜 5색 및 3단계 투명도(<code>15/30/50%</code>) 조절을 지원합니다.
                  </p>
                  <p>
                    • <strong>최대 200획 자동 보존 및 다크모드 반전:</strong> 최근 200획까지 브라우저 스토리지에 안전하게 자동 보존하며, <strong>↩️ 실행취소(Undo)</strong>, 메모장 접기 시 필기 보존(<code>hidden</code> 클래스), 다크모드 전환 시 검정 필기의 흰색 자동 반전을 지원합니다.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* 하단 아이패드 애플펜슬 전용 필기장 */}
          {/* ================================================================ */}
          <section
            className={`${
              isPadFloating
                ? 'sticky bottom-2 z-20 shadow-2xl'
                : 'relative'
            } rounded-2xl border p-3 transition-all no-print ${
              darkMode
                ? 'bg-slate-900/95 border-slate-700'
                : 'bg-white/95 border-slate-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-black text-blue-500 mr-1">
                  ✏️ 애플펜슬 노트 ({strokeCount} / 최대 200획 자동보존)
                </span>

                {(
                  [
                    { id: 'fountain', label: '✒️ 만년필(필압)' },
                    { id: 'ballpoint', label: '🖊️ 볼펜' },
                    { id: 'marker', label: '🖍️ 사인펜' },
                    { id: 'highlighter', label: '🌟 형광펜' },
                    { id: 'eraser', label: '🧹 지우개' },
                  ] as const
                ).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setPenType(tool.id)}
                    className={`px-2 py-1 rounded-lg font-bold border ${
                      penType === tool.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}

                <div className="flex items-center gap-1 ml-1">
                  {(
                    [
                      { hex: '#2563eb', name: '파랑' },
                      { hex: '#0f172a', name: '검정(다크자동반전)' },
                      { hex: '#10b981', name: '초록' },
                      { hex: '#e11d48', name: '분홍/빨강' },
                      { hex: '#facc15', name: '노랑' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => setPenColor(c.hex)}
                      style={{
                        backgroundColor:
                          darkMode && c.hex === '#0f172a' ? '#f8fafc' : c.hex,
                      }}
                      className={`w-5 h-5 rounded-full border-2 ${
                        penColor === c.hex
                          ? 'ring-2 ring-amber-400 scale-110 border-white'
                          : 'border-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-1">
                  {PEN_WIDTH_STEPS.map((w) => (
                    <button
                      key={w.px}
                      onClick={() => setPenWidth(w.px)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        penWidth === w.px
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {penType === 'highlighter' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    <span className="text-[10px] font-extrabold text-amber-500">
                      💧형광펜 투명도:
                    </span>
                    {(
                      [
                        { a: 0.15, label: '연하게 15%' },
                        { a: 0.3, label: '보통 30%' },
                        { a: 0.5, label: '진하게 50%' },
                      ] as const
                    ).map((al) => (
                      <button
                        key={al.a}
                        onClick={() => setHighlighterAlpha(al.a)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          highlighterAlpha === al.a
                            ? 'bg-amber-500 text-slate-950'
                            : 'opacity-75'
                        }`}
                      >
                        {al.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={handleUndoStroke}
                  className="px-2.5 py-1 rounded-lg font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  ↩️ 실행취소(한 획 뒤로)
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="px-2.5 py-1 rounded-lg font-bold bg-rose-600 text-white"
                >
                  🗑️ 전체지우기
                </button>
                <button
                  onClick={() =>
                    setCanvasBgStyle((b) =>
                      b === 'lined' ? 'grid' : b === 'grid' ? 'blank' : 'lined'
                    )
                  }
                  className="px-2 py-1 rounded-lg border font-bold"
                >
                  노트배경: {canvasBgStyle === 'lined' ? '줄노트' : canvasBgStyle === 'grid' ? '모눈' : '백지'}
                </button>
                <button
                  onClick={() =>
                    setCanvasHeight((h) => (h === 260 ? 400 : 260))
                  }
                  className="px-2 py-1 rounded-lg border font-bold"
                >
                  {canvasHeight === 260 ? '↕️ 노트크게' : '↕️ 기본크기'}
                </button>
                <button
                  onClick={() => setIsPadFloating((f) => !f)}
                  className={`px-2.5 py-1 rounded-lg font-bold border ${
                    isPadFloating
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  {isPadFloating ? '🔒 화면고정(따라다님)' : '🔓 하단고정'}
                </button>
                <button
                  onClick={() => setIsPadMinimized((m) => !m)}
                  className="px-2.5 py-1 rounded-lg font-bold border bg-slate-100 dark:bg-slate-800"
                >
                  {isPadMinimized ? '🔼 필기장 펼치기' : '🔽 접기(필기보존)'}
                </button>
              </div>
            </div>

            <div className={isPadMinimized ? 'hidden' : 'block mt-2.5 space-y-2'}>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold shrink-0">⌨️ 빠른 타이핑 메모:</span>
                <input
                  type="text"
                  value={padQuickText}
                  onChange={(e) => setPadQuickText(e.target.value)}
                  placeholder="펜슬 필기와 함께 기억할 핵심 단어나 공식을 타이핑해 두세요 (자동 저장됨)..."
                  className={`flex-1 px-2.5 py-1 rounded border ${
                    darkMode
                      ? 'bg-slate-950 border-slate-700'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div
                style={{
                  height: `${canvasHeight}px`,
                  backgroundImage:
                    canvasBgStyle === 'lined'
                      ? darkMode
                        ? 'repeating-linear-gradient(transparent, transparent 31px, #1e293b 32px)'
                        : 'repeating-linear-gradient(transparent, transparent 31px, #e2e8f0 32px)'
                      : canvasBgStyle === 'grid'
                      ? darkMode
                        ? 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)'
                        : 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
                      : 'none',
                  backgroundSize:
                    canvasBgStyle === 'grid' ? '24px 24px' : '100% 32px',
                }}
                className={`w-full rounded-xl border overflow-hidden relative ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-amber-50/20 border-slate-300'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUpOrCancel}
                  onPointerCancel={handlePointerUpOrCancel}
                  style={{
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                  className="w-full h-full block cursor-crosshair"
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
