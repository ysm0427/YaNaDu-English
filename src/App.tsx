// ============================================================================
// src/App.tsx — [파트 1/4]
// - 최상단 import 통합 및 16개 문법 노드(7성분 + 9품사) 타입·사전 정의
// - 보충어(Complement)와 부가어/수식어(Adjunct)의 영문법적 구분 명시
// - 9대 매체 큐레이션 표현 90선 (dictTargetWord 전수 일치 · 미국식 IPA 통일 · 매체 사실관계 반영)
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  type WordbookLevel,
  getExpandedWordbookByDay,
  generateCombinatorialSentences,
  analyzeCustomSchoolPassage,
  EBS_MAJOR_TOPICS,
  GRAMMAR_406_QUIZ_BANK,
  deterministicShuffle,
} from './studyData';

export type CompId = 'S' | 'V' | 'IO' | 'DO' | 'SC' | 'OC' | 'M';
export type PosId =
  | 'N'
  | 'Pron'
  | 'V'
  | 'Adj'
  | 'Adv'
  | 'Prep'
  | 'Conj'
  | 'Det'
  | 'Interj';

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExamTrackId = 'CSAT_MASTER' | 'GRAMMAR_ESSAY' | 'SCHOOL_INTERNAL';

export type MediaPlatformId =
  | 'FASHION_MAGS'
  | 'GOOGLE_TRENDS'
  | 'YOUTUBE_TRENDS'
  | 'NAVER_DATALAB'
  | 'SIGNAL_BZ'
  | 'INSTAGRAM_REELS'
  | 'TIKTOK_VIRAL'
  | 'GLOBAL_NEWS'
  | 'BIZ_TECH';

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

export interface MappingEdge {
  comp: CompId;
  pos: PosId;
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
  ipa: string;
  pron: string;
  targetThemeId: string;
  dictTargetWord: string;
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

export interface ParaphraseItem {
  basicExpr: string;
  upgradedExpr: string;
  nuanceDiff: string;
}

export interface DialogueTurn {
  speaker: 'A' | 'B';
  roleName: string;
  en: string;
  soundBlock: string;
  pron: string;
  ko: string;
  pointNote: string;
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
  paraphraseDrill: ParaphraseItem[];
  dialogue: DialogueTurn[];
}

export interface SynonymScaleStep {
  expr: string;
  pron: string;
  ko: string;
  note: string;
}

export interface SynonymScale {
  conceptTitle: string;
  scaleAxisLabel: string;
  weak: SynonymScaleStep;
  medium: SynonymScaleStep;
  strong: SynonymScaleStep;
}

export interface VocabItem {
  id: number;
  type: string;
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

export interface ThemeQuiz {
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
  levelTracks: {
    beginner: LevelTrackContent;
    intermediate: LevelTrackContent;
    advanced: LevelTrackContent;
  };
  synonymScales: SynonymScale[];
  vocab: VocabItem[];
  sentences: TrainingSentence[];
  quiz: ThemeQuiz;
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
  mastered: boolean;
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

export interface ChatTurn {
  role: 'user' | 'coach';
  text: string;
  correction?: string;
  nuanceTip?: string;
}

export interface CanvasPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface CanvasStroke {
  tool: 'fountain' | 'marker' | 'ballpoint' | 'highlighter' | 'eraser';
  color: string;
  width: number;
  alpha: number;
  points: CanvasPoint[];
}

// ============================================================================
// 1. 16개 문법 노드 사전 (7개 문장 성분 + 9품사) & 결합 매핑 엣지
//    - M 노드 해설에 '동사가 요구하는 보충어(Complement)'와 '부가어/수식어(Adjunct)' 구분 명시
// ============================================================================

export const SENTENCE_COMPONENTS: SentenceComponentInfo[] = [
  {
    id: 'S',
    name: '주어 (Subject)',
    engName: 'Subject',
    roleTitle: '문장의 주체 (은/는/이/가)',
    easyMeaning:
      '문장에서 동작을 행하거나 상태의 주인이 되는 핵심 주인공입니다. 단일 명사·대명사뿐만 아니라 동명사구(V-ing ~), to부정사구(To V ~), 명사절(What/That절)도 주어 역할을 수행합니다.',
    wordOrderRule:
      '평서문에서는 본동사(V) 앞에 위치하며, 부정어(Not until 등)나 Only 부사구가 문두에 오면 조동사가 주어 앞으로 도치됩니다.',
    allowedPos: ['N', 'Pron'],
    exampleHighlight:
      '[Streamlining the workflow (동명사구 S)] makes the schedule feasible.',
  },
  {
    id: 'V',
    name: '동사/서술어 (Verb)',
    engName: 'Main Verb / Predicate',
    roleTitle: '주어의 동작·상태 서술 (~다)',
    easyMeaning:
      '주어의 행동이나 상태를 결정짓는 문장의 심장입니다. 동사의 성질(1~5형식)에 따라 뒤에 올 목적어·보어·보충어의 구조가 결정됩니다.',
    wordOrderRule:
      '주어(S) 바로 뒤에 위치하며, 주어의 핵심 명사(Head Noun)나 동명사구·명사절 단수 기준에 맞춰 수일치합니다.',
    allowedPos: ['V'],
    exampleHighlight:
      'Reading diverse texts [broadens (단수 V)] our perspective on life.',
  },
  {
    id: 'IO',
    name: '간접목적어 (Indirect Object)',
    engName: 'Indirect Object',
    roleTitle: '동작이 향하는 대상 (~에게)',
    easyMeaning:
      '4형식 수여동사(give, offer, send, show 등) 뒤에서 무언가를 받는 사람·대상을 나타냅니다.',
    wordOrderRule:
      '수여동사(V) 바로 뒤, 직접목적어(DO) 앞에 위치합니다. 3형식으로 전환할 때는 직접목적어 뒤로 이동하여 전치사구 보충어(to/for + 대상)가 됩니다.',
    allowedPos: ['N', 'Pron'],
    exampleHighlight:
      'Thanks for giving [me (IO)] a quick heads-up on the schedule.',
  },
  {
    id: 'DO',
    name: '직접목적어 (Direct Object)',
    engName: 'Direct Object',
    roleTitle: '타동사의 대상 (~을/를)',
    easyMeaning:
      '타동사의 동작이 직접 미치는 대상입니다. 명사구, 대명사, to부정사구, 동명사구, 명사절이 올 수 있습니다.',
    wordOrderRule:
      '3형식에서는 타동사(V) 바로 뒤에, 4형식에서는 간접목적어(IO) 뒤에 위치합니다.',
    allowedPos: ['N', 'Pron'],
    exampleHighlight:
      'We need to expedite [the approval process (DO)] before Friday.',
  },
  {
    id: 'SC',
    name: '주격보어 (Subject Complement)',
    engName: 'Subject Complement',
    roleTitle: '주어의 정체·상태 보충 설명',
    easyMeaning:
      '2형식 연결동사(be, become, remain, look, go 등) 뒤에서 주어가 누구인지(명사구) 또는 어떤 상태인지(형용사·전치사구·to부정사구) 보충 설명합니다.',
    wordOrderRule:
      '2형식 동사(V) 뒤에 위치하며, 주어의 상태를 설명할 때는 부사(-ly)가 아닌 형용사나 상태 전치사구(on the same page 등)를 씁니다.',
    allowedPos: ['N', 'Pron', 'Adj', 'Prep'],
    exampleHighlight:
      'This quiet cafe is [my go-to spot (명사구 SC)] / Everyone is [on the same page (전치사구 SC)].',
  },
  {
    id: 'OC',
    name: '목적격보어 (Object Complement)',
    engName: 'Object Complement',
    roleTitle: '목적어의 상태·행동 보충 설명',
    easyMeaning:
      '5형식 동사(make, keep, find, consider, help 등)의 목적어(DO) 뒤에서 목적어의 상태나 동작을 보충 설명합니다.',
    wordOrderRule:
      '목적어(DO) 바로 뒤에 위치합니다. 우리말로 "~하게"라고 해석되더라도 목적어의 상태를 설명하면 부사(-ly)가 아닌 형용사를 써야 합니다.',
    allowedPos: ['N', 'Adj'],
    exampleHighlight:
      'Streamlining the process makes the schedule [feasible (형용사 OC)].',
  },
  {
    id: 'M',
    name: '수식어·부가어 및 전치사구 보충어 (Modifier / Adjunct & Complement)',
    engName: 'Modifier / Adjunct & Prepositional Complement',
    roleTitle: '명사·동사 수식(Adjunct) 또는 동사 의미 보충(Complement)',
    easyMeaning:
      '7성분 다이어그램에서는 S·V·O·C 뼈대 외의 요소를 M 노드로 묶어 표시하지만, 영문법(Cambridge 기준)에서는 두 가지로 엄격히 구분합니다: ① 부가어/수식어(Adjunct): in the morning, meticulously처럼 시간·장소·방식을 덧붙이는 선택적 수식 요소, ② 보충어(Complement): stick to my routine의 "to my routine"이나 blend A with B의 "with B"처럼 동사와 밀접하게 결합해 동사가 요구하는 필수 전치사구 보충어.',
    wordOrderRule:
      '한정사(Det)·형용사(Adj)·복합명사 수식어(N)는 주로 명사 앞에서 꾸미고, 전치사구 보충어(Complement)와 부사구 수식어(Adjunct)는 주로 동사·목적어 뒤에 이어집니다.',
    allowedPos: ['Adj', 'Adv', 'Prep', 'Conj', 'Det', 'N', 'Interj'],
    exampleHighlight:
      '부가어(Adjunct): check [today] / 전치사구 보충어(Complement): stick [to my routine], blend heritage [with a modern aesthetic].',
  },
];

export const PARTS_OF_SPEECH: PartOfSpeechInfo[] = [
  {
    id: 'N',
    name: '명사 (Noun)',
    engName: 'Noun',
    identityTitle: '사람·사물·추상 개념의 이름 (동명사 포함)',
    easyMeaning:
      '문장에서 주어(S), 목적어(IO·DO), 보어(SC·OC)의 핵심(Head)이 되며, approval process처럼 다른 명사 앞에서 복합명사 수식어(M) 역할이나 전치사의 목적어 역할도 수행합니다.',
    allowedComp: ['S', 'IO', 'DO', 'SC', 'OC', 'M'],
    exampleWords:
      'schedule, workflow, perspective, aesthetic, approval(명사수식), streamlining(동명사)',
  },
  {
    id: 'Pron',
    name: '대명사 (Pronoun)',
    engName: 'Pronoun',
    identityTitle: '명사를 대신 가리키는 말',
    easyMeaning:
      '명사구 전체를 대신하여 주어(S), 간접목적어(IO), 직접목적어(DO), 보어(SC) 및 전치사의 목적어 자리에 들어갑니다.',
    allowedComp: ['S', 'IO', 'DO', 'SC', 'M'],
    exampleWords: 'I, we, you, it, they, me, us, yourself, ourselves, what, which',
  },
  {
    id: 'V',
    name: '동사 (Verb)',
    engName: 'Verb',
    identityTitle: '동작이나 상태를 나타내는 말 (조동사·준동사 포함)',
    easyMeaning:
      '문장의 본동사(V) 역할을 수행하며, to부정사나 분사로 변신하면 수식어(M)나 보어·주어·목적어 구절 내부의 서술 성질을 담당합니다.',
    allowedComp: ['V', 'M'],
    exampleWords:
      'streamline, expedite, unwind, accommodate, resonate, blend, make, can, could',
  },
  {
    id: 'Adj',
    name: '형용사 (Adjective)',
    engName: 'Adjective',
    identityTitle: '명사의 성질·상태를 설명하는 말',
    easyMeaning:
      '명사 앞뒤에서 명사를 꾸미는 수식어(M)가 되거나, 2형식 주격보어(SC) 및 5형식 목적격보어(OC) 자리에서 상태를 보충 설명합니다.',
    allowedComp: ['SC', 'OC', 'M'],
    exampleWords:
      'tentative, feasible, complimentary, informative, comfortable, go-to, viral',
  },
  {
    id: 'Adv',
    name: '부사 (Adverb)',
    engName: 'Adverb',
    identityTitle: '동사·형용사·다른 부사·문장 전체를 꾸미는 말',
    easyMeaning:
      '시간·장소·빈도·방식·정도를 더해 주는 수식어/부가어(M: Adjunct) 역할을 합니다. 보어(SC/OC) 자리에는 들어갈 수 없습니다.',
    allowedComp: ['M'],
    exampleWords:
      'meticulously, seamlessly, effortlessly, definitely, usually, always, overnight',
  },
  {
    id: 'Prep',
    name: '전치사 (Preposition)',
    engName: 'Preposition',
    identityTitle: '명사구 앞에서 시간·장소·대상 관계를 연결하는 말',
    easyMeaning:
      '뒤에 명사구(전치사의 목적어)를 이끌어 전치사구를 만듭니다. ① 동사가 요구하는 전치사구 보충어(Complement: stick to ~, blend A with B, resonate with ~), ② 부가적 수식어(Adjunct: on weekends, before Friday), ③ 2형식 주격보어(SC: on the same page) 역할을 수행합니다.',
    allowedComp: ['M', 'SC'],
    exampleWords: 'in, on, at, for, with, by, to, before, within, during',
  },
  {
    id: 'Conj',
    name: '접속사 (Conjunction)',
    engName: 'Conjunction',
    identityTitle: '단어·구·절을 논리적으로 이어주는 연결 고리',
    easyMeaning:
      '등위접속사(and, but, so)는 대등한 절을 잇고, 종속접속사(because, if, although, so that, until)는 부사절·명사절을 이끌어 문장을 확장합니다.',
    allowedComp: ['M'],
    exampleWords: 'and, but, so, because, if, although, while, until, whether',
  },
  {
    id: 'Det',
    name: '한정사 (Determiner)',
    engName: 'Determiner',
    identityTitle: '명사구 맨 앞에서 범위·소유·특정성을 한정하는 말',
    easyMeaning:
      '관사(a, an, the), 소유격(my, our, your), 지시한정사(this, that) 등이 해당하며 명사구 내부의 한정 수식어(M)로 기능합니다.',
    allowedComp: ['M'],
    exampleWords: 'a, an, the, my, our, your, this, that, every, some',
  },
  {
    id: 'Interj',
    name: '감탄사 (Interjection)',
    engName: 'Interjection',
    identityTitle: '놀람·부름·응답을 나타내는 독립 표현',
    easyMeaning:
      '문장 구조 밖에서 독립적으로 감탄이나 응답을 나타내며, 7성분 다이어그램에서는 독립 부가 요소(M)로 표시합니다.',
    allowedComp: ['M'],
    exampleWords: 'Oh, Wow, Well, Hey, Oops, Goodness',
  },
];

export const MAPPING_EDGES: MappingEdge[] = [
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
  { comp: 'M', pos: 'Adj' },
  { comp: 'M', pos: 'Adv' },
  { comp: 'M', pos: 'Prep' },
  { comp: 'M', pos: 'Conj' },
  { comp: 'M', pos: 'Det' },
  { comp: 'M', pos: 'N' },
  { comp: 'M', pos: 'V' },
  { comp: 'M', pos: 'Interj' },
];

export const DIAGRAM_EXAMPLES: DiagramSentence[] = [
  {
    title: '표준예문 #1 · 5형식 동명사구 주어 & 형용사 목적격보어(OC)',
    rawEn: 'Streamlining the workflow makes the tentative schedule feasible.',
    naturalKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
    skeleton:
      'Streamlining the workflow[S:동명사구] + makes[V] + the tentative schedule[DO] + feasible[OC].',
    patternType: '5형식 (동명사구 S + 단수 V + DO + 형용사 OC)',
    wordOrderTip:
      '동명사구 주어(Streamlining ~)는 단수 취급하여 makes로 수일치하며, 목적어(schedule)의 상태를 설명하는 보어(OC) 자리에는 부사(feasibly)가 아닌 형용사 feasible을 씁니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Streamlining',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '동명사 (N역할)',
        meaning: '간소화하는 것은',
        roleExplanation:
          '뒤에 목적어(the workflow)를 거느려 문장 전체의 주어(S) 역할을 하는 동명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '명사 workflow를 특정해 주는 정관사(한정사)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
{
        word: 'workflow',
        comp: 'S',
        compLabel: '주어구 내부 목적어 (S)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '업무 공정을',
        roleExplanation: '동명사 Streamlining의 목적어로 결합해 문장 전체의 주어구(S)를 완성합니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'makes',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '만든다',
        roleExplanation: '동명사구 주어(단수)에 수일치된 5형식 본동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '목적어 명사구 schedule을 한정하는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'tentative',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '잠정적인',
        roleExplanation: '명사 schedule을 앞에서 꾸며주는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'schedule',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '일정을',
        roleExplanation: '5형식 동사 makes의 직접목적어(DO) 핵심 명사입니다.',
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
          '목적어(schedule)의 상태를 보충 설명하는 목적격보어(OC) 형용사입니다.',
        colorClass: 'border-amber-600 text-amber-800',
      },
    ],
  },
  {
    title: '표준예문 #2 · 4형식 동명사구(giving + IO + DO)',
    rawEn: 'Thanks for giving me a quick heads-up on the schedule.',
    naturalKo: '일정에 대해 미리 귀띔해 주셔서 감사합니다.',
    skeleton:
      'Thanks[M:독립부가어] + for giving[M] + me[IO] + a quick heads-up[DO] + on the schedule[M]',
    patternType: '4형식 수여동사 기반 동명사구 (giving + IO + DO)',
    wordOrderTip:
      '전치사 for의 목적어로 쓰인 동명사 giving이 4형식 동사의 성질을 유지하여 간접목적어(me)와 직접목적어(a quick heads-up)를 차례대로 이끕니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Thanks',
        comp: 'M',
        compLabel: '독립부가어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '감사합니다',
        roleExplanation: 'Thank you를 간결하게 줄인 감사 명사 표현입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'for',
        comp: 'M',
        compLabel: '전치사 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~에 대해',
        roleExplanation: '감사 이유를 나타내는 동명사구를 이끄는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'giving',
        comp: 'V',
        compLabel: '동명사(동사성질)',
        pos: 'V',
        posLabel: '동사/동명사 (V)',
        meaning: '주신 것',
        roleExplanation: '전치사 for의 목적어(명사적 역할)로 쓰이면서, 내부적으로는 간접목적어(me)와 직접목적어(heads-up)를 거느리는 4형식 동명사입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'me',
        comp: 'IO',
        compLabel: '간접목적어 (IO)',
        pos: 'Pron',
        posLabel: '대명사 (Pron)',
        meaning: '나에게',
        roleExplanation: 'giving의 받는 대상인 간접목적어(IO)입니다.',
        colorClass: 'border-purple-500 text-purple-700',
      },
      {
        word: 'a',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '하나의',
        roleExplanation: '명사구 a quick heads-up을 여는 부정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'quick',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '빠른, 간단한',
        roleExplanation: '명사 heads-up을 꾸며주는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'heads-up',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '사전 귀띔을',
        roleExplanation: 'giving의 직접목적어(DO) 핵심 명사입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
      {
        word: 'on',
        comp: 'M',
        compLabel: '전치사구 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~에 관한',
        roleExplanation: 'heads-up의 주제를 연결하는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '명사 schedule을 한정하는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'schedule.',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '일정',
        roleExplanation: '전치사 on의 목적어로 결합되어 전치사구(on the schedule)를 완성합니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
  {
    title: '표준예문 #3 · 3형식 타동사 + 전치사구 보충어(blend A with B)',
    rawEn: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
    naturalKo: '그 컬렉션은 브랜드의 전통(유산)과 현대적인 미학을 조화롭게 결합한다.',
    skeleton:
      "The collection[S] + seamlessly[M:부가어] + blends[V] + the brand's heritage[DO] + with a modern aesthetic[M:전치사구 보충어].",
    patternType: '3형식 (S + 부사 M + V + DO + 전치사구 보충어 M)',
    wordOrderTip:
      'seamlessly는 동사를 꾸미는 선택적 부가어(Adjunct)이고, with a modern aesthetic은 blend A with B 구문에서 동사 blends가 결합 대상을 나타내기 위해 요구하는 전치사구 보충어(Complement)입니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'The',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '주어 명사 collection을 한정하는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'collection',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '컬렉션은',
        roleExplanation: '문장의 단수 주어(S) 핵심 명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'seamlessly',
        comp: 'M',
        compLabel: '수식어/부가어 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '매끄럽게, 조화롭게',
        roleExplanation: '동사 blends의 방식을 꾸며주는 부사 부가어(Adjunct)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'blends',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '결합한다',
        roleExplanation: '단수 주어에 수일치된 3형식 타동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '소유격 명사구를 여는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: "brand's",
        comp: 'M',
        compLabel: '소유격 한정 (M)',
        pos: 'N',
        posLabel: '소유격 명사 (N)',
        meaning: '브랜드의',
        roleExplanation: '뒤 명사 heritage의 소유 주체를 한정하는 소유격 명사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'heritage',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '전통(유산)을',
        roleExplanation: '타동사 blends의 직접목적어(DO) 핵심 명사입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
      {
        word: 'with',
        comp: 'M',
        compLabel: '전치사구 보충어 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~와',
        roleExplanation:
          'blend A with B 구문에서 동사 blends와 밀접하게 결합하는 전치사구 보충어(Complement)를 이끕니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'a',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '하나의',
        roleExplanation: '명사 aesthetic을 한정하는 부정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'modern',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '현대적인',
        roleExplanation: '명사 aesthetic을 꾸미는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'aesthetic.',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '미학',
        roleExplanation: '전치사 with의 목적어로 결합되어 전치사구 보충어(M)를 완성합니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
];

// ============================================================================
// 2. 9대 매체·분야별 큐레이션 표현 90선 (10선 × 9개 탭)
//    - 모든 dictTargetWord를 실제 enExpression 내부의 핵심 표제어로 100% 일치
//    - 미국식 IPA(/ˈriː.ə.li/ 등) 통일 및 매체별 사실관계(유튜브·네이버·시그널랩) 반영
// ============================================================================

export const INITIAL_MEDIA_PLATFORMS: MediaTrendPlatform[] = [
  {
    id: 'FASHION_MAGS',
    name: '패션·에디토리얼 큐레이션 10선',
    shortName: '👗 패션·에디토리얼',
    badgeColor: 'bg-rose-600 text-white',
    liveUrl: 'https://www.vogue.com/fashion',
    sourceNote: '패션 매거진 스타일링·런웨이 자주 쓰이는 에디토리얼 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '꾸민 듯 안 꾸민 듯 자연스럽게 세련된 룩',
        enExpression: 'create an effortlessly chic look',
        ipa: '/kriˈeɪt ən ˈef.ɚt.ləs.li ʃiːk lʊk/',
        pron: '[크리에이트 언 에포트리스리 시크 룩]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'chic',
      },
      {
        rank: 2,
        koTitle: '유행을 타지 않는 옷장 속 필수 기본템',
        enExpression: 'invest in a timeless wardrobe staple',
        ipa: '/ɪnˈvest ɪn ə ˈtaɪm.ləs ˈwɔːr.droʊb ˈsteɪ.pəl/',
        pron: '[인베스트 이너 타임리스 워드로브 스테이플]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'staple',
      },
      {
        rank: 3,
        koTitle: '시선을 단숨에 사로잡는 과감한 포인트 아이템',
        enExpression: 'add a bold statement piece',
        ipa: '/æd ə boʊld ˈsteɪt.mənt piːs/',
        pron: '[애드 어 볼드 스테이트먼트 피스]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'statement',
      },
      {
        rank: 4,
        koTitle: '소화하기 까다로운 스타일을 멋지게 소화해 내다',
        enExpression: 'really pull off that bold look',
        ipa: '/ˈriː.ə.li pʊl ɔːf ðæt boʊld lʊk/',
        pron: '[릴리 풀 오프 댓 볼드 룩]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'pull',
      },
      {
        rank: 5,
        koTitle: '미니멀한 실루엣을 돋보이게 보완하다',
        enExpression: 'complement the minimalist silhouette',
        ipa: '/ˈkɑːm.plə.ment ðə ˈmɪn.ə.məl.ɪst ˌsɪl.uˈet/',
        pron: '[캄플러먼트 더 미니멀리스트 실루엣]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'silhouette',
      },
      {
        rank: 6,
        koTitle: '브랜드의 전통과 현대적 미학을 조화롭게 결합하다',
        enExpression: "seamlessly blend the brand's heritage with a modern aesthetic",
        ipa: '/ˈsiːm.ləs.li blend ðə brændz ˈher.ɪ.t̬ɪdʒ wɪð ə ˈmɑː.dɚn esˈθet̬.ɪk/',
        pron: '[심리슬리 블렌드 더 브랜즈 헤리티지 위더 모던 에스쎄틱]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'aesthetic',
      },
      {
        rank: 7,
        koTitle: '매장에서 재킷을 미디엄 사이즈로 입어보다',
        enExpression: 'try on this jacket in a medium size',
        ipa: '/traɪ ɑːn ðɪs ˈdʒæk.ɪt ɪn ə ˈmiː.di.əm saɪz/',
        pron: '[트라이 안 디스 재킷 이너 미디엄 사이즈]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'try',
      },
      {
        rank: 8,
        koTitle: '청바지와 정말 잘 어울리다',
        enExpression: 'go really well with your denim jeans',
        ipa: '/ɡoʊ ˈriː.ə.li wel wɪð jʊr ˈden.ɪm dʒiːnz/',
        pron: '[고우 릴리 웰 위드 유어 데님 진즈]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'denim',
      },
      {
        rank: 9,
        koTitle: '한 치의 흠도 없이 완벽하게 재단된 수트',
        enExpression: 'wear an impeccably tailored suit',
        ipa: '/wer ən ɪmˈpek.ə.bli ˈteɪ.lɚd suːt/',
        pron: '[웨어 언 임페커블리 테일러드 수트]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'tailored',
      },
      {
        rank: 10,
        koTitle: '깔끔하고 구조적인 외곽 라인을 연출하다',
        enExpression: 'create a clean structured outline',
        ipa: '/kriˈeɪt ə kliːn ˈstrʌk.tʃɚd ˈaʊt.laɪn/',
        pron: '[크리에이트 어 클린 스트럭처드 아웃라인]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'outline',
      },
    ],
  },
  {
    id: 'GOOGLE_TRENDS',
    name: '구글 뉴스·시사 큐레이션 10선',
    shortName: '🔍 구글시사·비즈니스',
    badgeColor: 'bg-blue-600 text-white',
    liveUrl: 'https://news.google.com',
    sourceNote: '시사·비즈니스 핵심 큐레이션 표현 10선 (+동기화 시 Google 뉴스 RSS 수신)',
    keywords: [
{
        rank: 1,
        koTitle: '전체 업무 공정을 간소화·효율화하다',
        enExpression: 'streamline the entire workflow',
        ipa: '/ˈstriːm.laɪn ði ɪnˈtaɪr ˈwɝːk.floʊ/',
        pron: '[스트림라인 디 인타이어 워크플로우]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'streamline',
      },
      {
        rank: 2,
        koTitle: '승인 절차를 신속히 앞당기다',
        enExpression: 'expedite the approval process',
        ipa: '/ˈek.spə.daɪt ði əˈpruː.vəl ˈprɑː.ses/',
        pron: '[엑스퍼다이트 디 어프루벌 프로세스]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'expedite',
      },
      {
        rank: 3,
        koTitle: '잠정 출시 일정을 실현 가능하게 만들다',
        enExpression: 'make the tentative schedule feasible',
        ipa: '/meɪk ðə ˈten.tə.t̬ɪv ˈskedʒ.uːl ˈfiː.zə.bəl/',
        pron: '[메익 더 텐터티브 스케줄 피저블]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'feasible',
      },
      {
        rank: 4,
        koTitle: '일정 변경에 대해 미리 간단한 귀띔을 주다',
        enExpression: 'give a quick heads-up on the schedule',
        ipa: '/ɡɪv ə kwɪk ˈhedz.ʌp ɑːn ðə ˈskedʒ.uːl/',
        pron: '[기버 퀵 헤즈업 안 더 스케줄]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'heads-up',
      },
      {
        rank: 5,
        koTitle: '오늘 회의를 깔끔하게 마무리하다',
        enExpression: "wrap up today's meeting",
        ipa: '/ræp ʌp təˈdeɪz ˈmiː.t̬ɪŋ/',
        pron: '[래펍 투데이즈 미팅]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'wrap',
      },
      {
        rank: 6,
        koTitle: '계약서의 모든 조항을 빈틈없이 검토하다',
        enExpression: 'review every clause meticulously',
        ipa: '/rɪˈvjuː ˈev.ri klɔːz məˈtɪk.jə.ləs.li/',
        pron: '[리뷰 에브리 클로즈 머티큘러슬리]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'meticulously',
      },
      {
        rank: 7,
        koTitle: '내일 아침에 다시 연락해 진행 현황을 공유하다',
        enExpression: 'touch base again tomorrow morning',
        ipa: '/tʌtʃ beɪs əˈɡen təˈmɔːr.oʊ ˈmɔːr.nɪŋ/',
        pron: '[터치 베이스 어겐 투모로우 모닝]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'touch',
      },
      {
        rank: 8,
        koTitle: '모두가 같은 내용을 공유하며 이해를 맞추다',
        enExpression: 'make sure everyone is on the same page',
        ipa: '/meɪk ʃʊr ˈev.ri.wʌn ɪz ɑːn ðə seɪm peɪdʒ/',
        pron: '[메익 슈어 에브리원 이즈 안 더 세임 페이지]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'page',
      },
      {
        rank: 9,
        koTitle: '양측의 양보로 합리적인 타협안에 도달하다',
        enExpression: 'reach a reasonable compromise',
        ipa: '/riːtʃ ə ˈriː.zən.ə.bəl ˈkɑːm.prə.maɪz/',
        pron: '[리치 어 리즈너블 캄프러마이즈]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'compromise',
      },
      {
        rank: 10,
        koTitle: '업무 처리 속도에서 상당한 개선을 이루다',
        enExpression: 'bring a substantial improvement in speed',
        ipa: '/brɪŋ ə səbˈstæn.ʃəl ɪmˈpruːv.mənt ɪn spiːd/',
        pron: '[브링 어 섭스탠셜 임프루브먼트 인 스피드]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'substantial',
      },
    ],
  },
  {
    id: 'YOUTUBE_TRENDS',
    name: '유튜브·미디어 리뷰 큐레이션 10선',
    shortName: '🎬 유튜브·리뷰',
    badgeColor: 'bg-red-600 text-white',
    liveUrl: 'https://www.youtube.com',
    sourceNote: '유튜브 크리에이터·테크·문화 리뷰에서 자주 쓰이는 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '하룻밤 사이에 입소문을 타고 큰 화제가 되다',
        enExpression: 'go viral overnight on social media',
        ipa: '/ɡoʊ ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt ɑːn ˈsoʊ.ʃəl ˈmiː.di.ə/',
        pron: '[고우 바이럴 오버나이트 안 소셜 미디어]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'viral',
      },
{
        rank: 2,
        koTitle: '주말 동안 드라마 시즌 전체를 몰아서 정주행하다',
        enExpression: 'binge-watch the entire season',
        ipa: '/ˈbɪndʒ.wɑːtʃ ði ɪnˈtaɪr ˈsiː.zən/',
        pron: '[빈지워치 디 인타이어 시즌]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'binge-watch',
      },
      {
        rank: 3,
        koTitle: '사전의 떠들썩한 소문·기대만큼 실제로도 훌륭하다',
        enExpression: 'definitely live up to the hype',
        ipa: '/ˈdef.ə.nət.li lɪv ʌp tə ðə haɪp/',
        pron: '[데피니틀리 리브 업 투 더 하입] (연음 근사: [리법 투 더 하입])',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'hype',
      },
      {
        rank: 4,
        koTitle: '문제의 정곡(핵심)을 정확히 찌르다',
        enExpression: 'really hit the nail on the head',
        ipa: '/ˈriː.ə.li hɪt ðə neɪl ɑːn ðə hed/',
        pron: '[릴리 힛 더 네일 안 더 헤드]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'nail',
      },
      {
        rank: 5,
        koTitle: '시청자들의 시선을 단숨에 사로잡다',
        enExpression: "capture viewers' attention right away",
        ipa: '/ˈkæp.tʃɚ ˈvjuː.ɚz əˈten.ʃən raɪt əˈweɪ/',
        pron: '[캡처 뷰어즈 어텐션 라잇 어웨이]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'capture',
      },
{
        rank: 6,
        koTitle: '시청자들에게 깊은 공감과 울림을 불러일으키다',
        enExpression: 'deeply resonate with the audience',
        ipa: '/ˈdiːp.li ˈrez.ə.neɪt wɪð ði ˈɔː.di.əns/',
        pron: '[디플리 레저네이트 위드 디 오디언스]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'resonate',
      },
      {
        rank: 7,
        koTitle: '흥미로우면서도 매우 유익한 정보를 담고 있다',
        enExpression: 'provide deeply informative content',
        ipa: '/prəˈvaɪd ˈdiːp.li ɪnˈfɔːr.mə.t̬ɪv ˈkɑːn.tent/',
        pron: '[프로바이드 디플리 인포머티브 칸텐트]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'informative',
      },
      {
        rank: 8,
        koTitle: '입소문 추천을 통해 꾸준히 인기를 얻다',
        enExpression: 'gain word-of-mouth popularity',
        ipa: '/ɡeɪn ˌwɝːd.əvˈmaʊθ ˌpɑː.pjəˈlær.ə.t̬i/',
        pron: '[게인 워드오브마우쓰 파퓰래러티]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'popularity',
      },
      {
        rank: 9,
        koTitle: '전체 줄거리의 핵심 요지를 정확히 파악하다',
        enExpression: 'capture the main idea clearly',
        ipa: '/ˈkæp.tʃɚ ðə meɪn aɪˈdiː.ə ˈklɪr.li/',
        pron: '[캡처 더 메인 아이디어 클리얼리]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'capture',
      },
      {
        rank: 10,
        koTitle: '토론에서 매우 타당하고 일리 있는 지적을 하다',
        enExpression: 'make a fair point in the discussion',
        ipa: '/meɪk ə fer pɔɪnt ɪn ðə dɪˈskʌʃ.ən/',
        pron: '[메이커 페어 포인트 인 더 디스커션]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'point',
      },
    ],
  },
  {
    id: 'NAVER_DATALAB',
    name: '일상·라이프스타일 큐레이션 10선',
    shortName: '💚 일상·라이프',
    badgeColor: 'bg-emerald-600 text-white',
    liveUrl: 'https://datalab.naver.com',
    sourceNote: '일상 루틴·여가·자기관리 분야 필수 회화 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '퇴근 후 산책을 하며 하루의 긴장을 풀다',
        enExpression: 'unwind after work with a walk',
        ipa: '/ʌnˈwaɪnd ˈæf.tɚ wɝːk wɪð ə wɔːk/',
        pron: '[언와인드 애프터 워크 위더 워크]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'unwind',
      },
      {
        rank: 2,
        koTitle: '주말마다 늘 믿고 찾는 나의 단골 카페에 가다',
        enExpression: 'visit my go-to coffee shop on weekends',
        ipa: '/ˈvɪz.ɪt maɪ ˈɡoʊ.tuː ˈkɔː.fi ʃɑːp ɑːn ˈwiːk.endz/',
        pron: '[비짓 마이 고우투 커피 샵 안 위켄즈]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'go-to',
      },
      {
        rank: 3,
        koTitle: '매일의 운동 루틴을 흔들림 없이 꾸준히 지키다',
        enExpression: 'stick to my daily workout routine',
        ipa: '/stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn/',
        pron: '[스틱 투 마이 데일리 워크아웃 루틴]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'stick',
      },
      {
        rank: 4,
        koTitle: '복잡한 머리를 식히기 위해 저녁 산책을 하다',
        enExpression: 'take a walk to clear my head',
        ipa: '/teɪk ə wɔːk tə klɪr maɪ hed/',
        pron: '[테이커 워크 투 클리어 마이 헤드]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'clear',
      },
      {
        rank: 5,
        koTitle: '영화 보기 전에 베이커리에서 간단히 요기하다',
        enExpression: 'grab a quick bite before the movie',
        ipa: '/ɡræb ə kwɪk baɪt bɪˈfɔːr ðə ˈmuː.vi/',
        pron: '[그래버 퀵 바이트 비포 더 무비]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'bite',
      },
      {
        rank: 6,
        koTitle: '주말에 조용히 독서하며 방전된 활력을 재충전하다',
        enExpression: 'recharge my batteries on weekends',
        ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz ɑːn ˈwiːk.endz/',
        pron: '[리차지 마이 배러리즈 안 위켄즈]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'recharge',
      },
      {
        rank: 7,
        koTitle: '다양한 분야의 글을 읽으며 삶에 대한 시야를 넓히다',
        enExpression: 'broaden our perspective on life',
        ipa: '/ˈbrɔː.dən ˈaʊ.ɚ pɚˈspek.tɪv ɑːn laɪf/',
        pron: '[브로든 아워 퍼스펙티브 안 라이프]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'perspective',
      },
      {
        rank: 8,
        koTitle: '바쁜 업무 중간에 잠깐 숨을 돌리며 쉬다',
        enExpression: 'take a quick breather between tasks',
        ipa: '/teɪk ə kwɪk ˈbriː.ðɚ bɪˈtwiːn tæsks/',
        pron: '[테이커 퀵 브리더 비트윈 태스크스]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'breather',
      },
      {
        rank: 9,
        koTitle: '친구들과 자주 모이는 단골 아지트에서 어울리다',
        enExpression: 'meet at our regular hangout spot',
        ipa: '/miːt æt ˈaʊ.ɚ ˈreɡ.jə.lɚ ˈhæŋ.aʊt spɑːt/',
        pron: '[밋 앳 아워 레귤러 행아웃 스팟]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'hangout',
      },
      {
        rank: 10,
        koTitle: '의도적이고 꾸준한 매일의 연습 습관을 기르다',
        enExpression: 'keep up deliberate daily practice',
        ipa: '/kiːp ʌp dɪˈlɪb.ɚ.ət ˈdeɪ.li ˈpræk.tɪs/',
        pron: '[키펍 딜리버릿 데일리 프랙티스]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'deliberate',
      },
    ],
  },
  {
    id: 'SIGNAL_BZ',
    name: '여행·공항·호텔 실전 큐레이션 10선',
    shortName: '✈️ 여행·호텔·공항',
    badgeColor: 'bg-indigo-600 text-white',
    liveUrl: 'https://signal.bz',
    sourceNote: '시그널랩(signal.bz 민간 트렌드 서비스) 및 해외여행 실전 회화 큐레이션 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '체크인 시간 전에 프런트에 가방(수하물)을 먼저 맡기다',
        enExpression: 'drop off our bags before check-in',
        ipa: '/drɑːp ɔːf ˈaʊ.ɚ bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
        pron: '[드랍 오프 아워 백스 비포 체크인]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'drop',
      },
      {
        rank: 2,
        koTitle: '기내 반입 수하물 규격 제한을 준수하다',
        enExpression: 'meet the cabin carry-on size limit',
        ipa: '/miːt ðə ˈkæb.ɪn ˈkær.i.ɑːn saɪz ˈlɪm.ɪt/',
        pron: '[밋 더 캐빈 캐리안 사이즈 리밋]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'carry-on',
      },
      {
        rank: 3,
        koTitle: '호텔 예약에 고객 우대 무료 조식이 포함되어 있다',
        enExpression: 'include complimentary breakfast',
        ipa: '/ɪnˈkluːd ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
        pron: '[인클루드 캄플러멘터리 브렉퍼스트]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'complimentary',
      },
      {
        rank: 4,
        koTitle: '공항 경유 대기 시간 동안 간단히 씻고 재정비하다',
        enExpression: 'freshen up during our layover',
        ipa: '/ˈfreʃ.ən ʌp ˈdʊr.ɪŋ ˈaʊ.ɚ ˈleɪ.oʊ.vɚ/',
        pron: '[프레셔넙 듀링 아워 레이오버]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'freshen',
      },
      {
        rank: 5,
        koTitle: '변경된 항공편 상세 일정표를 다시 확인하다',
        enExpression: 'review our updated flight itinerary',
        ipa: '/rɪˈvjuː ˈaʊ.ɚ ʌpˈdeɪ.t̬ɪd flaɪt aɪˈtɪn.ə.rer.i/',
        pron: '[리뷰 아워 업데이티드 플라이트 아이티너레리]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'itinerary',
      },
      {
        rank: 6,
        koTitle: '고객의 레이트 체크아웃 특별 요청을 수용해 배려하다',
        enExpression: 'accommodate a late check-out request',
        ipa: '/əˈkɑː.mə.deɪt ə leɪt ˈtʃek.aʊt rɪˈkwest/',
        pron: '[어카머데이트 어 레이트 체크아웃 리퀘스트]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'accommodate',
      },
      {
        rank: 7,
        koTitle: '로비 라운지에서 편안하게 쉬며 기다리다',
        enExpression: 'make yourself comfortable in the lounge',
        ipa: '/meɪk jʊrˈself ˈkʌm.fɚ.t̬ə.bəl ɪn ðə laʊndʒ/',
        pron: '[메익 유어셀프 컴프터블 인 더 라운지]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'comfortable',
      },
      {
        rank: 8,
        koTitle: '추가 요금 없이 공항 셔틀 서비스를 이용하다',
        enExpression: 'use the shuttle at no extra charge',
        ipa: '/juːz ðə ˈʃʌt̬.əl æt noʊ ˈek.strə tʃɑːrdʒ/',
        pron: '[유즈 더 셔틀 앳 노 엑스트라 차지]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'shuttle',
      },
      {
        rank: 9,
        koTitle: '이용 가능한 객실이 남아 있는지 프런트에 문의하다',
        enExpression: 'check if a quiet room is available',
        ipa: '/tʃek ɪf ə ˈkwaɪ.ət ruːm ɪz əˈveɪ.lə.bəl/',
        pron: '[체크 이프 어 콰이엇 룸 이즈 어베일러블]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'available',
      },
      {
        rank: 10,
        koTitle: '맡겨 두었던 수하물을 벨데스크에서 다시 찾다',
        enExpression: 'pick up our stored luggage at the desk',
        ipa: '/pɪk ʌp ˈaʊ.ɚ stɔːrd ˈlʌɡ.ɪdʒ æt ðə desk/',
        pron: '[피컵 아워 스토어드 러기지 앳 더 데스크]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'luggage',
      },
    ],
  },
  {
    id: 'INSTAGRAM_REELS',
    name: '인스타그램·감성 브이로그 표현 10선',
    shortName: '📸 인스타·브이로그',
    badgeColor: 'bg-pink-600 text-white',
    liveUrl: 'https://www.instagram.com',
    sourceNote: 'SNS 캡션·라이프스타일 브이로그에 자주 쓰이는 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '주말 단골 카페에서 커피 한 잔으로 여유를 즐기다',
        enExpression: 'relax at my go-to neighborhood cafe',
        ipa: '/rɪˈlæks æt maɪ ˈɡoʊ.tuː ˈneɪ.bɚ.hʊd kæˈfeɪ/',
        pron: '[릴랙스 앳 마이 고우투 네이버후드 카페]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'go-to',
      },
      {
        rank: 2,
        koTitle: '꾸민 듯 안 꾸민 듯 세련된 데일리 코디를 완성하다',
        enExpression: 'style an effortlessly chic daily outfit',
        ipa: '/staɪl ən ˈef.ɚt.ləs.li ʃiːk ˈdeɪ.li ˈaʊt.fɪt/',
        pron: '[스타일 언 에포트리스리 시크 데일리 아웃핏]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'outfit',
      },
      {
        rank: 3,
        koTitle: '과감한 컬러의 포인트 아이템을 멋지게 소화하다',
        enExpression: 'pull off a bold statement piece',
        ipa: '/pʊl ɔːf ə boʊld ˈsteɪt.mənt piːs/',
        pron: '[풀 오프 어 볼드 스테이트먼트 피스]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'pull',
      },
      {
        rank: 4,
        koTitle: '소문난 핫플레이스가 실제로도 기대만큼 훌륭하다',
        enExpression: 'truly live up to the hype',
        ipa: '/ˈtruː.li lɪv ʌp tə ðə haɪp/',
        pron: '[트룰리 리브 업 투 더 하입]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'hype',
      },
      {
        rank: 5,
        koTitle: '일상의 스트레스를 잊고 머리를 맑게 식히다',
        enExpression: 'clear my head with an evening walk',
        ipa: '/klɪr maɪ hed wɪð ən ˈiːv.nɪŋ wɔːk/',
        pron: '[클리어 마이 헤드 위던 이브닝 워크]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'clear',
      },
      {
        rank: 6,
        koTitle: '미니멀하고 감각적인 인테리어 미학을 보여주다',
        enExpression: 'showcase a clean minimalist aesthetic',
        ipa: '/ˈʃoʊ.keɪs ə kliːn ˈmɪn.ə.məl.ɪst esˈθet̬.ɪk/',
        pron: '[쇼케이스 어 클린 미니멀리스트 에스쎄틱]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'aesthetic',
      },
      {
        rank: 7,
        koTitle: '짧은 릴스 영상이 하룻밤 사이에 화제가 되다',
        enExpression: 'go viral overnight across platforms',
        ipa: '/ɡoʊ ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt əˈkrɔːs ˈplæt.fɔːrmz/',
        pron: '[고우 바이럴 오버나이트 어크로스 플랫폼즈]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'viral',
      },
      {
        rank: 8,
        koTitle: '저녁 약속 전에 가볍게 브런치를 먹으며 요기하다',
        enExpression: 'grab a bite at a cozy bakery',
        ipa: '/ɡræb ə baɪt æt ə ˈkoʊ.zi ˈbeɪ.kɚ.i/',
        pron: '[그래버 바이트 애러 코지 베이커리]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'cozy',
      },
      {
        rank: 9,
        koTitle: '사계절 내내 입기 좋은 옷장 필수 기본 아이템',
        enExpression: 'choose a versatile wardrobe staple',
        ipa: '/tʃuːz ə ˈvɝː.sə.t̬əl ˈwɔːr.droʊb ˈsteɪ.pəl/',
        pron: '[추즈 어 버서틀 워드로브 스테이플]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'versatile',
      },
      {
        rank: 10,
        koTitle: '주말 여행을 통해 에너지를 완전히 재충전하다',
        enExpression: 'recharge my batteries during the trip',
        ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz ˈdʊr.ɪŋ ðə trɪp/',
        pron: '[리차지 마이 배러리즈 듀링 더 트립]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'recharge',
      },
    ],
  },
  {
    id: 'TIKTOK_VIRAL',
    name: '숏폼·크리에이터 큐레이션 10선',
    shortName: '🎵 숏폼·크리에이터',
    badgeColor: 'bg-purple-600 text-white',
    liveUrl: 'https://www.tiktok.com',
    sourceNote: '글로벌 숏폼 콘텐츠·댓글 반응에서 자주 쓰이는 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '처음 3초 안에 시청자의 시선을 단숨에 사로잡다',
        enExpression: 'capture attention in the first three seconds',
        ipa: '/ˈkæp.tʃɚ əˈten.ʃən ɪn ðə fɝːst θriː ˈsek.əndz/',
        pron: '[캡처 어텐션 인 더 퍼스트 쓰리 세컨즈]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'capture',
      },
      {
        rank: 2,
        koTitle: '댓글 분석이 핵심을 정확히 짚어내다',
        enExpression: 'hit the nail on the head with that comment',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed wɪð ðæt ˈkɑː.ment/',
        pron: '[힛 더 네일 안 더 헤드 위드 댓 카멘트]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'nail',
      },
      {
        rank: 3,
        koTitle: '전 세계 젊은 시청자들과 깊은 공감을 형성하다',
        enExpression: 'resonate with young viewers worldwide',
        ipa: '/ˈrez.ə.neɪt wɪð jʌŋ ˈvjuː.ɚz ˌwɝːldˈwaɪd/',
        pron: '[레저네이트 위드 영 뷰어즈 월드와이드]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'resonate',
      },
      {
        rank: 4,
        koTitle: '크리에이터의 최신 브이로그를 연속으로 정주행하다',
enExpression: 'binge-watch all of their latest vlogs',
        ipa: '/ˈbɪndʒ.wɑːtʃ ɔːl əv ðer ˈleɪ.t̬ɪst vlɑːɡz/',
        pron: '[빈지워치 올 오브 데어 레이티스트 블로그즈(※원어민은 1음절 vlogs로 발음)]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'binge-watch',
      },
      {
        rank: 5,
        koTitle: '짧지만 매우 유익한 팁 영상을 공유하다',
        enExpression: 'share a short and informative clip',
        ipa: '/ʃer ə ʃɔːrt ænd ɪnˈfɔːr.mə.t̬ɪv klɪp/',
        pron: '[쉐어 어 쇼트 앤 인포머티브 클립]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'informative',
      },
      {
        rank: 6,
        koTitle: '신제품 리뷰가 사전 기대치를 완벽히 충족하다',
        enExpression: 'live up to the pre-launch hype',
        ipa: '/lɪv ʌp tə ðə ˈpriː.lɔːntʃ haɪp/',
        pron: '[리브 업 투 더 프리런치 하입]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'hype',
      },
      {
        rank: 7,
        koTitle: '아무나 따라 하기 힘든 룩을 멋지게 소화하다',
        enExpression: 'pull off an unexpected style',
        ipa: '/pʊl ɔːf ən ˌʌn.ɪkˈspek.tɪd staɪl/',
        pron: '[풀 오프 언 언익스펙티드 스타일]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'unexpected',
      },
      {
        rank: 8,
        koTitle: '업데이트 일정에 대해 구독자들에게 미리 귀띔해 주다',
        enExpression: 'give subscribers a quick heads-up',
        ipa: '/ɡɪv səbˈskraɪ.bɚz ə kwɪk ˈhedz.ʌp/',
        pron: '[기브 섭스크라이버즈 어 퀵 헤즈업]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'heads-up',
      },
      {
        rank: 9,
        koTitle: '영상이 알고리즘을 타고 빠르게 확산되다',
        enExpression: 'go viral through the recommendation feed',
        ipa: '/ɡoʊ ˈvaɪ.rəl θruː ðə ˌrek.ə.menˈdeɪ.ʃən fiːd/',
        pron: '[고우 바이럴 쓰루 더 레커멘데이션 피드]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'viral',
      },
      {
        rank: 10,
        koTitle: '라이브 방송을 깔끔하게 마무리하다',
        enExpression: 'wrap up the live stream on time',
        ipa: '/ræp ʌp ðə laɪv striːm ɑːn taɪm/',
        pron: '[래펍 더 라이브 스트림 안 타임]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'wrap',
      },
    ],
  },
  {
    id: 'GLOBAL_NEWS',
    name: '학술·교양 독해 큐레이션 10선',
    shortName: '🌍 학술·교양독해',
    badgeColor: 'bg-amber-600 text-white',
    liveUrl: 'https://www.bbc.com/news',
    sourceNote: '수능·논술·학술 아티클 독해에 자주 등장하는 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '안전지대를 벗어나 우리의 시야와 관점을 넓히다',
        enExpression: 'step out of our comfort zone and broaden our perspective',
        ipa: '/step aʊt əv ˈaʊ.ɚ ˈkʌm.fɚt zoʊn ænd ˈbrɔː.dən ˈaʊ.ɚ pɚˈspek.tɪv/',
        pron: '[스텝 아우러브 아워 컴포트 존 앤 브로든 아워 퍼스펙티브]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'perspective',
      },
      {
        rank: 2,
        koTitle: '다양한 관점에 스스로를 노출시켜 확증 편향을 극복하다',
  enExpression: 'expose ourselves to diverse viewpoints',
        ipa: '/ɪkˈspoʊz ˌaʊ.ɚˈselvz tə daɪˈvɝːs ˈvjuː.pɔɪnts/',
        pron: '[익스포즈 아워셀브즈 투 다이버스 뷰포인츠]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'expose',
      },
      {
        rank: 3,
        koTitle: '탄탄한 실증적 증거에 의해 가설이 뒷받침되다',
        enExpression: 'be supported by solid empirical evidence',
        ipa: '/bi səˈpɔːr.t̬ɪd baɪ ˈsɑː.lɪd ɪmˈpɪr.ɪ.kəl ˈev.ə.dəns/',
        pron: '[비 서포티드 바이 살리드 임피리컬 에비던스]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'empirical',
      },
      {
        rank: 4,
        koTitle: '브랜드의 전통을 지속 가능성과 조화롭게 결합하다',
        enExpression: "blend the brand's heritage with sustainability",
        ipa: '/blend ðə brændz ˈher.ɪ.t̬ɪdʒ wɪð səˌsteɪ.nəˈbɪl.ə.t̬i/',
        pron: '[블렌드 더 브랜즈 헤리티지 위드 서스테이너빌러티]',
        targetThemeId: 'theme-fashion-editorial',
        dictTargetWord: 'heritage',
      },
      {
        rank: 5,
        koTitle: '인지적 경직성을 예방하고 유연한 사고를 기르다',
        enExpression: 'prevent cognitive rigidity and foster flexibility',
        ipa: '/prɪˈvent ˈkɑːɡ.nə.t̬ɪv rɪˈdʒɪd.ə.t̬i ænd ˈfɑː.stɚ ˌflek.səˈbɪl.ə.t̬i/',
        pron: '[프리벤트 카그너티브 리지더티 앤 파스터 플렉서빌러티]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'cognitive',
      },
      {
        rank: 6,
        koTitle: '세부 조항 하나하나를 세심하고 빈틈없이 분석하다',
        enExpression: 'analyze every specification meticulously',
        ipa: '/ˈæn.əl.aɪz ˈev.ri ˌspes.ə.fəˈkeɪ.ʃən məˈtɪk.jə.ləs.li/',
        pron: '[애널라이즈 에브리 스페서피케이션 머티큘러슬리]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'meticulously',
      },
      {
        rank: 7,
        koTitle: '실무적으로 실현 가능한 해결책을 도출하다',
        enExpression: 'develop an economically feasible solution',
        ipa: '/dɪˈvel.əp ən ˌiː.kəˈnɑː.mɪ.kli ˈfiː.zə.bəl səˈluː.ʃən/',
        pron: '[디벨럽 언 이커나미클리 피저블 솔루션]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'feasible',
      },
      {
        rank: 8,
        koTitle: '폭넓은 독자층에게 깊은 학술적·감성적 울림을 주다',
        enExpression: 'resonate deeply with a wide readership',
        ipa: '/ˈrez.ə.neɪt ˈdiːp.li wɪð ə waɪd ˈriː.dɚ.ʃɪp/',
        pron: '[레저네이트 디플리 위더 와이드 리더십]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'resonate',
      },
      {
        rank: 9,
        koTitle: '의도적이고 체계적인 훈련을 통해 전문성을 쌓다',
        enExpression: 'build expertise through deliberate practice',
        ipa: '/bɪld ˌek.spɝːˈtiːz θruː dɪˈlɪb.ɚ.ət ˈpræk.tɪs/',
        pron: '[빌드 엑스퍼티즈 쓰루 딜리버릿 프랙티스]',
        targetThemeId: 'theme-opic-routine',
        dictTargetWord: 'expertise',
      },
      {
        rank: 10,
        koTitle: '생산성 향상에 실질적이고 상당한 기여를 하다',
        enExpression: 'make a substantial contribution to productivity',
        ipa: '/meɪk ə səbˈstæn.ʃəl ˌkɑːn.trɪˈbjuː.ʃən tə ˌproʊ.dʌkˈtɪv.ə.t̬i/',
        pron: '[메이커 섭스탠셜 컨트리뷰션 투 프로덕티버티]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'substantial',
      },
    ],
  },
  {
    id: 'BIZ_TECH',
    name: '실무 이메일·협업 큐레이션 10선',
    shortName: '💼 실무·협업영어',
    badgeColor: 'bg-slate-700 text-white',
    liveUrl: 'https://hbr.org',
    sourceNote: '글로벌 비즈니스 회의·이메일·일정 조율 필수 큐레이션 표현 10선',
    keywords: [
      {
        rank: 1,
        koTitle: '부서 간 보고 및 결재 공정을 효율화하다',
        enExpression: 'streamline our internal reporting process',
        ipa: '/ˈstriːm.laɪn ˈaʊ.ɚ ɪnˈtɝː.nəl rɪˈpɔːr.t̬ɪŋ ˈprɑː.ses/',
        pron: '[스트림라인 아워 인터널 리포팅 프로세스]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'streamline',
      },
      {
        rank: 2,
        koTitle: '이번 금요일 전까지 계약 승인 절차를 신속히 진행하다',
        enExpression: 'expedite the contract approval before Friday',
        ipa: '/ˈek.spə.daɪt ðə ˈkɑːn.trækt əˈpruː.vəl bɪˈfɔːr ˈfraɪ.deɪ/',
        pron: '[엑스퍼다이트 더 컨트랙트 어프루벌 비포 프라이데이]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'expedite',
      },
      {
        rank: 3,
        koTitle: '신제품 출시를 위한 잠정 일정을 수립하다',
        enExpression: 'set a tentative schedule for the launch',
        ipa: '/set ə ˈten.tə.t̬ɪv ˈskedʒ.uːl fɔːr ðə lɔːntʃ/',
        pron: '[셋 어 텐터티브 스케줄 포 더 런치]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'tentative',
      },
      {
        rank: 4,
        koTitle: '팀원들에게 일정 변경을 미리 살짝 귀띔해 주다',
        enExpression: 'share a quick heads-up with the team',
        ipa: '/ʃer ə kwɪk ˈhedz.ʌp wɪð ðə tiːm/',
        pron: '[쉐어 어 퀵 헤즈업 위드 더 팀]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'heads-up',
      },
      {
        rank: 5,
        koTitle: '핵심 실행 과제를 점검하며 회의를 마무리하다',
        enExpression: 'wrap up the discussion and review action items',
        ipa: '/ræp ʌp ðə dɪˈskʌʃ.ən ænd rɪˈvjuː ˈæk.ʃən ˈaɪ.t̬əmz/',
        pron: '[래펍 더 디스커션 앤 리뷰 액션 아이템즈]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'wrap',
      },
      {
        rank: 6,
        koTitle: '출장 항공편과 호텔 상세 일정표를 최종 확인하다',
        enExpression: 'confirm the finalized business trip itinerary',
        ipa: '/kənˈfɝːm ðə ˈfaɪ.nəl.aɪzd ˈbɪz.nəs trɪp aɪˈtɪn.ə.rer.i/',
        pron: '[컨펌 더 파이널라이즈드 비즈니스 트립 아이티너레리]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'itinerary',
      },
      {
        rank: 7,
        koTitle: '파트너사의 일정 조정 요청을 기꺼이 수용해 배려하다',
        enExpression: "gladly accommodate the client's request",
        ipa: '/ˈɡlæd.li əˈkɑː.mə.deɪt ðə ˈklaɪ.ənts rɪˈkwest/',
        pron: '[글래들리 어카머데이트 더 클라이언츠 리퀘스트]',
        targetThemeId: 'theme-travel-hotel',
        dictTargetWord: 'accommodate',
      },
{
        rank: 8,
        koTitle: '기존 시스템을 전면 개편하여 효율성을 높이다',
        enExpression: 'overhaul the entire legacy system',
        ipa: '/ˌoʊ.vɚˈhɔːl ði ɪnˈtaɪr ˈleɡ.ə.si ˈsɪs.təm/',
        pron: '[오버홀 디 인타이어 레거시 시스템]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'overhaul',
      },
      {
        rank: 9,
        koTitle: '다음 달에 업데이트된 서비스를 공식 출시할 계획이다',
        enExpression: 'intend to launch the updated service next month',
        ipa: '/ɪnˈtend tə lɔːntʃ ði ʌpˈdeɪ.t̬ɪd ˈsɝː.vɪs nekst mʌnθ/',
        pron: '[인텐드 투 런치 디 업데이티드 서비스 넥스트 먼쓰]',
        targetThemeId: 'theme-biz-meeting',
        dictTargetWord: 'intend',
      },
      {
        rank: 10,
        koTitle: '발표에서 문제의 본질과 핵심을 정확히 짚어내다',
        enExpression: 'hit the nail on the head during the briefing',
        ipa: '/hɪt ðə neɪl ɑːn ðə hed ˈdʊr.ɪŋ ðə ˈbriː.fɪŋ/',
        pron: '[힛 더 네일 안 더 헤드 듀링 더 브리핑]',
        targetThemeId: 'theme-youtube-viral',
        dictTargetWord: 'nail',
      },
    ],
  },
];
// ============================================================================
// src/App.tsx — [파트 2/4]
// - 다의어·파생어 워밍업 5선 (lawless 발음 [로-러스] 교정 및 미국식 IPA 통일)
// - 테마 1 (비즈니스 회의·일정) · 테마 2 (일상 루틴·여가: OPIc 과장 제거 & 보충어 설명 일치)
// - 테마 3 (해외여행·호텔·공항: help 어법 설명 오류 교정 & carry-on 명사/목적어 예문 일치)
// ============================================================================

export const NAVER_OFFICIAL_WORD_CHALLENGE = [
  {
    id: 1,
    word: 'comprehend',
    ipa: '/ˌkɑːm.prɪˈhend/',
    pron: '[캄프리헨드]',
    meaning: '(충분히) 이해하다, 파악하다',
    enDef: 'to understand something completely and thoroughly',
  },
  {
    id: 2,
    word: 'lawless',
    ipa: '/ˈlɔː.ləs/',
    pron: '[로-러스]',
    meaning: '무법의, 법을 지키지 않는',
    enDef: 'not controlled by or obeying laws; disorderly',
  },
  {
    id: 3,
    word: 'tentative',
    ipa: '/ˈten.tə.t̬ɪv/',
    pron: '[텐터티브]',
    meaning: '잠정적인, 확정되지 않은',
    enDef: 'not certain or fixed; provisional',
  },
  {
    id: 4,
    word: 'complimentary',
    ipa: '/ˌkɑːm.pləˈmen.t̬ɚ.i/',
    pron: '[캄플러멘터리]',
    meaning: '(호텔·항공 등에서) 무료로 제공되는, 우대의',
    enDef: 'given or supplied free of charge as a courtesy',
  },
  {
    id: 5,
    word: 'streamline',
    ipa: '/ˈstriːm.laɪn/',
    pron: '[스트림라인]',
    meaning: '(업무·절차를) 간소화하다, 효율화하다',
    enDef: 'to make a system or organization more efficient and effective by employing faster or simpler working methods',
  },
];

export const THEME_BIZ_MEETING: ThemeData = {
  id: 'theme-biz-meeting',
  badge: '💼 비즈니스 · 실무 회의',
  title: '일정 조율 · 승인 가속화 & 워크플로우 효율화',
  subtitle: '사전 귀띔(heads-up), 결재 신속 처리(expedite), 공정 간소화(streamline) 실전 구사',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (사전 공유 & 회의 마무리)',
      focusBadge: '4형식 동명사구 giving me a quick heads-up & 구동사 wrap up',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '일정 변경을 미리 알려줄 때(heads-up)와 회의를 마무리할 때(wrap up) 쓰는 실무 기본 표현을 익힙니다.',
      patternEn: 'Thanks for giving me a quick heads-up on the schedule.',
      patternIpa: '/θæŋks fɔːr ˈɡɪv.ɪŋ mi ə kwɪk ˈhedz.ʌp ɑːn ðə ˈskedʒ.uːl/',
      patternPron: '[땡스 포 기빙 미 / 어 퀵 헤즈업 / 안 더 스케줄]',
      patternSoundBlock: 'Thanks for giving me / a quick heads-up / on the schedule.',
      patternSoundRule: 'giving me를 한 호흡으로 묶고 heads-up[헤즈업]의 첫 음절에 강세를 줍니다.',
      patternMeaningKo: '일정에 대해 미리 간단히 귀띔해 주셔서 감사합니다.',
      grammarSummary: '전치사 for의 목적어로 쓰인 동명사 giving이 4형식 성질을 유지하여 간접목적어(me)와 직접목적어(a quick heads-up)를 차례로 이끕니다.',
      paraphraseDrill: [
        {
          basicExpr: 'telling me early about the change (변경을 일찍 말해 주는 것)',
          upgradedExpr: 'giving me a quick heads-up on the change (변경 사항을 미리 살짝 귀띔해 주는 것)',
          nuanceDiff: '비즈니스 이메일과 메신저에서 사전 공유에 감사를 표할 때 자연스럽게 쓰이는 표현입니다.',
        },
        {
          basicExpr: 'finish the meeting now (지금 회의를 끝내다)',
          upgradedExpr: "wrap up today's meeting (오늘 회의를 깔끔하게 마무리하다)",
          nuanceDiff: '단순 종료가 아니라 논의 사항을 정리하며 회의를 마칠 때 쓰는 구동사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '팀원 (Coordinator)',
          en: "Just a quick heads-up: the client meeting moved to 3 PM.",
          soundBlock: 'Just a quick heads-up: / the client meeting / moved to 3 PM.',
          pron: '[저스터 퀵 헤즈업: 더 클라이언트 미팅 무브드 투 쓰리 피엠]',
          ko: '간단히 미리 알려드립니다. 고객사 회의가 오후 3시로 변경되었습니다.',
          pointNote: 'a quick heads-up (사전 귀띔·공지)',
        },
        {
          speaker: 'B',
          roleName: '팀장 (Manager)',
          en: "Thanks for giving me a heads-up. Let's wrap up our internal review first.",
          soundBlock: "Thanks for giving me a heads-up. / Let's wrap up / our internal review first.",
          pron: '[땡스 포 기빙 미 어 헤즈업. 렛츠 래펍 아워 인터널 리뷰 퍼스트]',
          ko: '미리 알려줘서 고마워요. 우리 내부 검토부터 먼저 마무리합시다.',
          pointNote: 'wrap up ~ (~을 마무리 짓다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (승인 절차 가속화 요청 & 진행 상황 점검)',
      focusBadge: '정중한 요청 Could you please expedite ~ & touch base',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '마감일 전에 승인이나 절차를 좀 더 빠르게 진행해 달라고 정중히 요청하는 표현을 훈련합니다.',
patternEn: 'Could you please expedite the approval process before Friday?',
      patternIpa: '/kʊd ju pliːz ˈek.spə.daɪt ði əˈpruː.vəl ˈprɑː.ses bɪˈfɔːr ˈfraɪ.deɪ/',
      patternPron: '[쿠쥬 플리즈 엑스퍼다이트 / 디 어프루벌 프로세스 / 비포 프라이데이 ↗]',
      patternSoundBlock: 'Could you please expedite / the approval process / before Friday?',
      patternSoundRule: 'Could you를 [쿠쥬]로 부드럽게 연음하고 expedite[엑스퍼다이트]의 첫 음절(ex-)에 강세를 두며, 정중한 요청 의문문이므로 문장 끝(Friday?↗)을 부드럽게 올려 읽습니다.',
      patternMeaningKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
      grammarSummary: '조동사 Could + 주어(you) + 부사(please) + 타동사(expedite) + 직접목적어(the approval process) + 시간 부가어(before Friday)로 이루어진 3형식 의문문입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'make the approval faster (승인을 더 빠르게 하다)',
          upgradedExpr: 'expedite the approval process (승인 절차를 신속히 앞당기다)',
          nuanceDiff: '공식 이메일이나 부서 간 협조 요청에서 격식 있게 처리를 앞당길 때 쓰는 핵심 타동사입니다.',
        },
        {
          basicExpr: 'talk briefly to check the status (상태 확인을 위해 짧게 이야기하다)',
          upgradedExpr: 'touch base on the project status (프로젝트 진행 현황을 공유하며 짧게 소통하다)',
          nuanceDiff: '업무 진행 중에 서로 진척 상황을 간단히 맞출 때 유용한 실무 관용구입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '프로젝트 매니저 (PM)',
          en: 'Could you please expedite the approval process before Friday?',
          soundBlock: 'Could you please expedite / the approval process / before Friday?',
          pron: '[쿠쥬 플리즈 엑스퍼다이트 디 어프루벌 프로세스 비포 프라이데이]',
          ko: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
          pointNote: 'expedite the approval process (승인 절차를 앞당기다)',
        },
        {
          speaker: 'B',
          roleName: '유관부서 담당자 (Lead)',
          en: "Sure, I'll review it meticulously today and touch base with you tomorrow.",
          soundBlock: "Sure, / I'll review it meticulously today / and touch base with you tomorrow.",
          pron: '[슈어, 아일 리뷰 잇 머티큘러슬리 투데이 앤 터치 베이스 위드 유 투모로우]',
          ko: '네, 오늘 꼼꼼히 검토한 뒤 내일 다시 연락드리겠습니다.',
          pointNote: 'meticulously (빈틈없이) + touch base (소통·연락하다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (동명사구 주어 & 5형식 목적격보어 구문)',
      focusBadge: '동명사구 주어 Streamlining ~ & 5형식 makes + DO + feasible(OC)',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '업무 공정 간소화(streamline)가 잠정 일정(tentative schedule)을 실현 가능하게(feasible) 만든다는 인과 관계를 5형식으로 구사합니다.',
      patternEn: 'Streamlining the workflow makes the tentative schedule feasible.',
      patternIpa: '/ˈstriːm.laɪn.ɪŋ ðə ˈwɝːk.floʊ meɪks ðə ˈten.tə.t̬ɪv ˈskedʒ.uːl ˈfiː.zə.bəl/',
      patternPron: '[스트림라이닝 더 워크플로우 / 메익스 더 텐터티브 스케줄 / 피저블]',
      patternSoundBlock: 'Streamlining the workflow / makes the tentative schedule / feasible.',
      patternSoundRule: '주어구(Streamlining the workflow) 뒤에서 살짝 끊고, 문장 끝 보어 feasible[피저블]을 또렷하게 발음합니다.',
      patternMeaningKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      grammarSummary: '동명사구 주어(Streamlining the workflow)는 단수 취급하여 단수 동사(makes)로 받으며, 목적어(the tentative schedule)의 상태를 설명하는 목적격보어(OC) 자리에는 부사(feasibly)가 아닌 형용사(feasible)를 씁니다.',
      paraphraseDrill: [
        {
          basicExpr: 'make the work steps simpler (업무 단계를 더 단순하게 만들다)',
          upgradedExpr: 'streamline the entire workflow (전체 업무 공정을 간소화·효율화하다)',
          nuanceDiff: '불필요한 중복 단계를 줄여 속도와 효율을 높일 때 쓰는 핵심 비즈니스 동사입니다.',
        },
        {
          basicExpr: 'possible to do within the time (시간 내에 실행할 수 있는)',
          upgradedExpr: 'feasible within the tentative deadline (잠정 마감일 내에 실현 가능한)',
          nuanceDiff: '단순한 가능성(possible)을 넘어 예산·일정·인력 여건상 실제로 실행 가능하다는 뜻을 전달합니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '임원 (Director)',
          en: 'Do you think our tentative launch schedule is still feasible?',
          soundBlock: 'Do you think / our tentative launch schedule / is still feasible?',
          pron: '[두 유 띵크 아워 텐터티브 런치 스케줄 이즈 스틸 피저블]',
          ko: '우리의 잠정 출시 일정이 여전히 실현 가능하다고 보시나요?',
          pointNote: 'tentative schedule (잠정 일정) + feasible (실현 가능한)',
        },
        {
          speaker: 'B',
          roleName: '팀장 (Team Lead)',
          en: 'Yes. Streamlining the workflow makes the tentative schedule feasible.',
          soundBlock: 'Yes. / Streamlining the workflow / makes the tentative schedule / feasible.',
          pron: '[예스. 스트림라이닝 더 워크플로우 메익스 더 텐터티브 스케줄 피저블]',
          ko: '네. 업무 공정을 간소화하면 그 잠정 일정을 충분히 실현 가능하게 만들 수 있습니다.',
          pointNote: '5형식 makes + 목적어(DO) + 형용사 보어(OC: feasible)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '일정·계획의 확정성 정도 (명사구)',
      scaleAxisLabel: '초기 구상 ➔ 잠정적 일정 ➔ 최종 확정 일정표',
      weak: {
        expr: 'a rough timeframe',
        pron: '[어 러프 타임프레임]',
        ko: '대략적인 기간 구상',
        note: '세부 날짜 없이 큰 틀의 기간만 잡은 초기 단계',
      },
      medium: {
        expr: 'a tentative schedule',
        pron: '[어 텐터티브 스케줄]',
        ko: '잠정적인 일정',
        note: '초안은 나왔으나 협의에 따라 조정될 수 있는 실무 일정',
      },
      strong: {
        expr: 'a finalized itinerary',
        pron: '[어 파이널라이즈드 아이티너레리]',
        ko: '최종 확정된 상세 일정표',
        note: '시간·장소·동선까지 모두 확정된 최종 일정',
      },
    },
    {
      conceptTitle: '업무 절차 개선과 개편의 강도 (동사구)',
      scaleAxisLabel: '소폭 조정하다 ➔ 공정을 간소화하다 ➔ 전면 개편하다',
      weak: {
        expr: 'make a minor adjustment',
        pron: '[메이커 마이너 어저스트먼트]',
        ko: '소폭 조정을 가하다',
        note: '기존 틀을 유지한 채 작은 부분만 수정할 때',
      },
      medium: {
        expr: 'streamline the workflow',
        pron: '[스트림라인 더 워크플로우]',
        ko: '업무 공정을 간소화·효율화하다',
        note: '불필요한 절차를 줄여 흐름을 매끄럽고 빠르게 만들 때',
      },
      strong: {
        expr: 'overhaul the entire system',
        pron: '[오버홀 디 인타이어 시스템]',
        ko: '전체 시스템을 전면 개편하다',
        note: '구조 전체를 근본부터 뜯어고쳐 새롭게 바꿀 때',
      },
    },
  ],
  vocab: [
    {
      id: 101,
      type: '트렌드·실무',
      recommendLevel: 'beginner',
      word: 'heads-up',
      masked: 'h____-u_',
      ipa: '/ˈhedz.ʌp/',
      pron: '[헤즈업]',
      soundMethod: '복수형 s가 유성음 /z/로 소리 나며 [헤즈업]으로 붙여 발음합니다.',
      soundBlock: 'give me / a quick heads-up',
      meaning: '사전 귀띔, 미리 알려줌(사전 공지)',
      enDef: 'an advance warning or piece of information given before something happens',
      exampleBlank: 'Thanks for giving me a quick _____ on the schedule.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '4형식 동명사 giving의 직접목적어(DO) 자리에 쓰인 가산명사입니다.',
      collocation: 'give a quick heads-up',
      collocationKo: '미리 간단히 귀띔해 주다',
      paraphraseTip: 'advance notice를 실무 대화에서 친근하고 자연스럽게 표현할 때 씁니다.',
    },
    {
      id: 102,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'wrap up',
      masked: 'wr__ u_',
      ipa: '/ræp ʌp/',
      pron: '[래펍]',
      soundMethod: '묵음 w는 소리 내지 않고 wrap의 끝 /p/와 up을 연결해 [래펍]으로 발음합니다.',
      soundBlock: 'wrap up / the meeting',
      meaning: '(회의·업무 등을) 마무리 짓다, 끝내다',
      enDef: 'to bring a meeting, task, or agreement to a successful conclusion',
      exampleBlank: "Let's _____ today's discussion in five minutes.",
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: "Let's 뒤에서 목적어(today's discussion)를 취하는 타동사구(V)입니다.",
      collocation: "wrap up today's meeting",
      collocationKo: '오늘 회의를 마무리하다',
      paraphraseTip: 'finish보다 핵심을 정리하며 깔끔하게 매듭짓는다는 어감을 줍니다.',
    },
    {
      id: 103,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'touch base',
      masked: 't____ b___',
      ipa: '/tʌtʃ beɪs/',
      pron: '[터치 베이스]',
      soundMethod: 'touch[터치]와 base[베이스] 각각의 모음을 정확히 살려 발음합니다.',
      soundBlock: 'touch base / with you tomorrow',
      meaning: '(진행 상황 확인을 위해) 잠깐 연락하다, 소통하다',
      enDef: 'to briefly make or renew contact with someone to update each other',
      exampleBlank: "I'll _____ with the client tomorrow morning.",
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 will 뒤에서 본동사구(V)로 쓰이며 주로 전치사구(with + 사람)를 동반합니다.',
      collocation: 'touch base on the progress',
      collocationKo: '진행 상황에 대해 짧게 소통하다',
      paraphraseTip: '장시간 회의가 아니라 중간 점검차 간단히 연락할 때 매우 유용한 표현입니다.',
    },
    {
      id: 104,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'tentative',
      masked: 'ten______',
      ipa: '/ˈten.tə.t̬ɪv/',
      pron: '[텐터티브]',
      soundMethod: '첫 음절(ten-)에 강세를 두고 두 번째 t는 미국식 플랩으로 부드럽게 발음합니다.',
      soundBlock: 'a tentative / schedule',
      meaning: '잠정적인, 확정되지 않은',
      enDef: 'not certain or fixed; done as a trial or provisional arrangement',
      exampleBlank: 'We have set a _____ date for the product launch.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 date나 schedule 앞에서 명사를 꾸며주는 형용사 수식어(M)입니다.',
      collocation: 'a tentative launch schedule',
      collocationKo: '잠정 출시 일정',
      paraphraseTip: '확정(confirmed/finalized)되기 전 단계의 임시 일정을 뜻합니다.',
    },
    {
      id: 105,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'expedite',
      masked: 'ex______',
      ipa: '/ˈek.spə.daɪt/',
      pron: '[엑스퍼다이트]',
      soundMethod: '첫 음절(ex-)에 강세를 두고 마지막 음절을 [-다이트]로 명확히 발음합니다.',
      soundBlock: 'expedite / the approval process',
      meaning: '(절차·업무를) 신속히 처리하다, 앞당기다',
      enDef: 'to make an action or process happen sooner or be accomplished more quickly',
      exampleBlank: 'Could you please _____ the customs clearance?',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Could 뒤에서 목적어(the customs clearance)를 취하는 3형식 타동사(V)입니다.',
      collocation: 'expedite the approval process',
      collocationKo: '승인 절차를 신속히 진행하다',
      paraphraseTip: 'speed up의 격식 있는 비즈니스·행정 실무 표준 어휘입니다.',
    },
{
      id: 106,
      type: '트렌드·실무',
      recommendLevel: 'advanced',
      word: 'streamline',
      masked: 'str_______',
      ipa: '/ˈstriːm.laɪn/',
      pron: '[스트림라인]',
      soundMethod: 'stream[스트림]에 강세를 두고 line[라인]을 자연스럽게 이어 읽습니다.',
      soundBlock: 'streamline / the workflow',
      meaning: '(공정·조직·절차를) 간소화하다, 효율화하다',
      enDef: 'to make a system or process more efficient by employing simpler working methods',
      exampleBlank: 'We must _____ our internal reporting process.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 must 뒤에서 목적어(our internal reporting process)를 취하는 3형식 본동사(V)입니다.',
      collocation: 'streamline the workflow',
      collocationKo: '업무 공정을 간소화·효율화하다',
      paraphraseTip: '단순히 줄이는(reduce) 것이 아니라 군더더기를 없애 효율을 높인다는 뜻입니다.',
    },
    {
      id: 107,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'feasible',
      masked: 'fea_____',
      ipa: '/ˈfiː.zə.bəl/',
      pron: '[피저블]',
      soundMethod: '첫 음절(fea-)을 길게 [피-]로 발음하고 s는 유성음 /z/[저]로 소리 냅니다.',
      soundBlock: 'make the schedule / feasible',
      meaning: '(계획·일정이) 실현 가능한, 실행할 수 있는',
      enDef: 'possible to do easily or conveniently; practical and achievable',
      exampleBlank: 'Streamlining the workflow makes the tentative schedule _____.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'OC',
      compLabel: '목적격보어 (OC)',
      roleDesc: '5형식 동사 makes 뒤에서 목적어(the tentative schedule)의 상태를 보충 설명하는 목적격보어(OC)입니다.',
      collocation: 'an economically feasible plan',
      collocationKo: '경제적으로 실현 가능한 계획',
      paraphraseTip: '해석이 "실현 가능하게"여도 목적어의 상태 설명이면 부사(feasibly)가 아닌 형용사 feasible을 씁니다.',
    },
  ],
  sentences: [
    {
      id: 1001,
      levelTag: 'beginner',
      tag: '초급 필수 · 사전 일정 공유 감사',
      targetWord: 'heads-up',
      wordOrderFormula: 'Thanks[M] + for giving[M] + me[IO] + a quick heads-up[DO] + on the schedule[M].',
      structure: '4형식 수여동사 기반 동명사구 (giving + IO + DO)',
      soundBlockEn: 'Thanks for giving me / a quick heads-up / on the schedule.',
      soundMethodGuide: 'Thanks for giving me를 한 덩어리로 묶고 heads-up을 강조해 읽습니다.',
      ipaLine: '/θæŋks fɔːr ˈɡɪv.ɪŋ mi ə kwɪk ˈhedz.ʌp ɑːn ðə ˈskedʒ.uːl/',
      koLine: '감사합니다 주셔서 / 나에게 빠른 사전 귀띔을 / 그 일정에 대해.',
      enLine: 'Thanks for giving me / a quick heads-up / on the schedule.',
      rawEn: 'Thanks for giving me a quick heads-up on the schedule.',
      pronLine: '[땡스 포 기빙 미 / 어 퀵 헤즈업 / 안 더 스케줄]',
      naturalKo: '일정에 대해 미리 간단히 귀띔해 주셔서 감사합니다.',
      paraphraseVersion: 'I appreciate your letting me know in advance about the schedule change.',
      grammarPoint: '전치사 for 뒤에 동명사 giving이 왔지만, 동사의 성질은 그대로 남아서 간접목적어(me)와 직접목적어(a quick heads-up)를 차례대로 거느립니다.',
      contextNuance: '동료나 파트너가 일정 변경을 미리 알려주었을 때 감사를 전하는 실무 표현입니다.',
    },
    {
      id: 1002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 승인 절차 가속화 요청',
      targetWord: 'expedite',
      wordOrderFormula: 'Could you[조동사+S] + please[M] + expedite[V] + the approval process[DO] + before Friday[M]?',
      structure: '3형식 정중한 요청 의문문 (Could + S + V + DO + M)',
      soundBlockEn: 'Could you please expedite / the approval process / before Friday?',
      soundMethodGuide: 'Could you please를 부드럽게 이어 읽고 expedite the approval process를 또렷하게 발음합니다.',
   ipaLine: '/kʊd ju pliːz ˈek.spə.daɪt ði əˈpruː.vəl ˈprɑː.ses bɪˈfɔːr ˈfraɪ.deɪ/',
      koLine: '부디 신속히 진행해 주실 수 있을까요 / 그 승인 절차를 / 금요일 전까지?',
      enLine: 'Could you please expedite / the approval process / before Friday?',
      rawEn: 'Could you please expedite the approval process before Friday?',
      pronLine: '[쿠쥬 플리즈 엑스퍼다이트 / 디 어프루벌 프로세스 / 비포 프라이데이]',
      naturalKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
      paraphraseVersion: 'Would it be possible to speed up the approval process ahead of Friday?',
      grammarPoint: 'approval은 명사지만 뒤 명사 process 앞에서 어떤 절차인지 설명하는 복합명사 수식어(M-N)로 쓰였습니다.',
      contextNuance: '독촉하는 느낌 없이 상대방을 존중하면서 빠른 결재를 요청할 때 쓰는 표준 문장입니다.',
    },
    {
      id: 1003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 동명사구 주어 & 5형식 형용사 보어(OC)',
      targetWord: 'feasible',
      wordOrderFormula: 'Streamlining the workflow[S:동명사구] + makes[V] + the tentative schedule[DO] + feasible[OC].',
      structure: '5형식 (동명사구 S + 단수 V + DO + 형용사 OC)',
      soundBlockEn: 'Streamlining the workflow / makes the tentative schedule / feasible.',
      soundMethodGuide: 'Streamlining the workflow 뒤에서 살짝 쉬고 makes the tentative schedule feasible을 연결합니다.',
      ipaLine: '/ˈstriːm.laɪn.ɪŋ ðə ˈwɝːk.floʊ meɪks ðə ˈten.tə.t̬ɪv ˈskedʒ.uːl ˈfiː.zə.bəl/',
      koLine: '업무 공정을 간소화하는 것은 / 만든다 그 잠정 일정을 / 실현 가능한 상태로.',
      enLine: 'Streamlining the workflow / makes the tentative schedule / feasible.',
      rawEn: 'Streamlining the workflow makes the tentative schedule feasible.',
      pronLine: '[스트림라이닝 더 워크플로우 / 메익스 더 텐터티브 스케줄 / 피저블]',
      naturalKo: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      paraphraseVersion: 'If we simplify the workflow, we can realistically meet the provisional schedule.',
      grammarPoint: '동명사구 주어(Streamlining the workflow)는 단수 취급하므로 단수 동사 makes를 쓰며, 목적어(schedule)의 상태를 설명하는 목적격보어(OC)에는 형용사 feasible을 씁니다.',
      contextNuance: '기획안 발표나 일정 단축 방안을 제시할 때 논리적 설득력을 높여주는 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'heads-up',
      ipa: '/ˈhedz.ʌp/',
      options: [
        '최종 결산 보고서',
        '장기 휴가 신청서',
        '사전 귀띔, 미리 알려줌(사전 공지)',
        '회의실 예약 취소',
      ],
      answerIdx: 2,
      explanation: 'heads-up은 상대방이 미리 대비할 수 있도록 사전에 알려주는 귀띔·사전 공지를 뜻합니다.',
    },
    intermediate: {
      sentenceBefore: 'Could you please',
      sentenceAfter: 'the approval process before Friday?',
      hint: '(절차·업무를) 신속히 처리하다, 앞당기다',
      options: ['postpone', 'expedite', 'hesitate', 'complicate'],
      answerIdx: 1,
      explanation: '금요일 전까지 승인 절차를 신속히 앞당겨 달라는 문맥이므로 expedite가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법상 올바른 형태를 2개 고르세요: "Streamlining the approval procedures [ (A) ] the tentative schedule [ (B) ]."',
      highlightWord: '동명사구 주어 단수 수일치 & 5형식 목적격보어(OC) 형용사',
      options: [
        '(A) make (복수 동사 — 오답)',
        '(A) makes (동명사구 주어 단수 수일치)',
        '(B) feasible (형용사 목적격보어)',
        '(B) feasibly (부사 — 보어 자리 불가)',
      ],
      answerIndices: [1, 2],
      explanation:
        '(A) 앞의 procedures가 복수여도 주어의 핵심은 동명사 Streamlining이므로 단수 동사 makes가 맞으며, (B) 목적어(schedule)의 상태를 보충 설명하는 목적격보어(OC) 자리이므로 형용사 feasible이 맞습니다.',
    },
    writingMission: {
      koPrompt: '업무 공정을 간소화하는 것은 그 잠정 일정을 실현 가능하게 만든다.',
      targetPattern: 'Streamlining the workflow makes ~ feasible.',
      modelAnswer: 'Streamlining the workflow makes the tentative schedule feasible.',
    },
  },
};

export const THEME_OPIC_ROUTINE: ThemeData = {
  id: 'theme-opic-routine',
  badge: '☕ 일상 루틴 · 여가 · 자기관리',
  title: '단골 장소 · 퇴근 후 휴식 & 꾸준한 운동 습관 묘사',
  subtitle: '단골 카페(go-to spot), 긴장 해소(unwind), 루틴 고수(stick to) 및 관점 확장 표현',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (내가 좋아하는 단골 장소 & 가벼운 식사)',
      focusBadge: '복합형용사 go-to & 관용구 grab a quick bite',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '주말마다 즐겨 찾는 단골 장소와 가벼운 외식 습관을 자연스러운 구어체로 묘사합니다.',
      patternEn: 'This quiet cafe is my go-to spot on weekends.',
      patternIpa: '/ðɪs ˈkwaɪ.ət kæˈfeɪ ɪz maɪ ˈɡoʊ.tuː spɑːt ɑːn ˈwiːk.endz/',
      patternPron: '[디스 콰이엇 카페 / 이즈 마이 고우투 스팟 / 안 위켄즈]',
      patternSoundBlock: 'This quiet cafe / is my go-to spot / on weekends.',
      patternSoundRule: 'go-to spot[고우투 스팟]을 한 덩어리의 명사구처럼 리듬감 있게 붙여 읽습니다.',
      patternMeaningKo: '이 조용한 카페는 내가 주말마다 늘 믿고 찾는 단골 장소이다.',
      grammarSummary: '주어(This quiet cafe) + 2형식 연결동사(is) + 명사구 주격보어(my go-to spot) + 시간 부가어(on weekends)로 이루어진 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'my favorite place that I visit often (내가 자주 가는 좋아하는 장소)',
          upgradedExpr: 'my go-to spot on weekends (주말마다 고민 없이 늘 찾는 단골 장소)',
          nuanceDiff: '좋아하는 카페·식당·공원을 소개할 때 가장 자연스럽게 쓸 수 있는 일상 표현입니다.',
        },
        {
          basicExpr: 'eat food quickly (음식을 빨리 먹다)',
          upgradedExpr: 'grab a quick bite (간단히 요기하다, 가볍게 식사하다)',
          nuanceDiff: '바쁜 일상이나 약속 전에 가볍게 식사를 해결할 때 자주 쓰이는 구어 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '동료 (Colleague)',
          en: 'Where do you usually go to relax on weekends?',
          soundBlock: 'Where do you usually go / to relax / on weekends?',
          pron: '[웨어 두 유 유주얼리 고우 투 릴랙스 안 위켄즈]',
          ko: '주말에 쉴 때 주로 어디에 가시나요?',
          pointNote: 'usually go to relax (쉬러 주로 가다)',
        },
        {
          speaker: 'B',
          roleName: '화자 (Speaker)',
          en: 'This quiet neighborhood cafe is my go-to spot to grab a quick bite and read.',
          soundBlock: 'This quiet neighborhood cafe / is my go-to spot / to grab a quick bite and read.',
          pron: '[디스 콰이엇 네이버후드 카페 이즈 마이 고우투 스팟 투 그래버 퀵 바이트 앤 리드]',
          ko: '이 조용한 동네 카페가 간단히 요기하며 책 읽으러 늘 찾는 제 단골 장소예요.',
          pointNote: 'my go-to spot (나의 단골 장소) + grab a quick bite (간단히 요기하다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (꾸준한 운동 루틴 유지 & 스트레스 해소)',
      focusBadge: '자동사 + 전치사구 보충어 stick to ~ & clear my head',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '건강이나 마인드 컨트롤을 위해 매일의 루틴을 어떻게 지키는지 구체적인 이유와 함께 설명합니다.',
      patternEn: 'I always stick to my daily workout routine to clear my head.',
      patternIpa: '/aɪ ˈɔːl.weɪz stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn tə klɪr maɪ hed/',
      patternPron: '[아이 올웨이즈 스틱 투 / 마이 데일리 워크아웃 루틴 / 투 클리어 마이 헤드]',
      patternSoundBlock: 'I always stick to / my daily workout routine / to clear my head.',
      patternSoundRule: 'stick to[스틱 투]를 가볍게 이어 읽고 workout routine과 clear my head에 강세를 둡니다.',
      patternMeaningKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
      grammarSummary: '앞의 to는 자동사 stick이 대상을 연결하기 위해 요구하는 전치사(to + 명사구 보충어)이고, 뒤의 to는 목적(~하기 위해)을 나타내는 to부정사(to + 동사원형 부가어)입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'keep doing my exercise plan (운동 계획을 계속하다)',
          upgradedExpr: 'stick to my daily workout routine (매일의 운동 루틴을 흔들림 없이 고수하다)',
          nuanceDiff: '작심삼일로 끝나지 않고 계획이나 원칙을 꾸준히 지킨다는 뜻을 명확히 전달합니다.',
        },
        {
          basicExpr: 'forget stress and rest (스트레스를 잊고 쉬다)',
          upgradedExpr: 'unwind and clear my head (긴장을 풀고 복잡한 머리를 맑게 식히다)',
          nuanceDiff: '퇴근 후 산책·운동·음악 감상을 하는 이유를 구체적으로 설명할 때 활용하기 좋습니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '진행자 (Interviewer)',
          en: 'How do you usually unwind after a long day at work?',
          soundBlock: 'How do you usually unwind / after a long day / at work?',
          pron: '[하우 두 유 유주얼리 언와인드 애프터 어 롱 데이 앳 워크]',
          ko: '긴 하루 일과를 마친 뒤에는 주로 어떻게 긴장을 푸시나요?',
          pointNote: 'unwind after work (퇴근 후 긴장을 풀다)',
        },
        {
          speaker: 'B',
          roleName: '응답자 (Speaker)',
          en: 'I always stick to my daily workout routine to clear my head and recharge my batteries.',
          soundBlock: 'I always stick to / my daily workout routine / to clear my head / and recharge my batteries.',
          pron: '[아이 올웨이즈 스틱 투 마이 데일리 워크아웃 루틴 투 클리어 마이 헤드 앤 리차지 마이 배러리즈]',
          ko: '머리를 맑게 식히고 활력을 재충전하기 위해 항상 매일의 운동 루틴을 지킵니다.',
          pointNote: 'stick to + 명사구 + to clear my head',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (독서·경험을 통한 시야 확장 & 동명사구 주어)',
      focusBadge: '동명사구 주어 Reading diverse texts + 단수 동사 broadens',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '여가 활동이나 독서가 나에게 어떤 내면적 성장을 주는지 학술적이고 깊이 있는 문장으로 표현합니다.',
      patternEn: 'Reading diverse texts broadens our perspective on life.',
      patternIpa: '/ˈriː.dɪŋ daɪˈvɝːs teksts ˈbrɔː.dənz ˈaʊ.ɚ pɚˈspek.tɪv ɑːn laɪf/',
      patternPron: '[리딩 다이버스 텍스트스 / 브로든즈 아워 퍼스펙티브 / 안 라이프]',
      patternSoundBlock: 'Reading diverse texts / broadens our perspective / on life.',
      patternSoundRule: '주어구(Reading diverse texts)의 핵심인 Reading과 동사 broadens[브로든즈]를 힘 있게 발음합니다.',
      patternMeaningKo: '다양한 글을 읽는 것은 삶에 대한 우리의 시야(관점)를 넓혀준다.',
      grammarSummary: '동사 바로 앞에 복수명사(texts)가 있더라도 진짜 주어는 동명사구(Reading ~)이므로 단수 동사 broadens로 수일치해야 합니다.',
      paraphraseDrill: [
        {
          basicExpr: 'helps us think more widely (우리가 더 넓게 생각하도록 돕는다)',
          upgradedExpr: 'broadens our perspective on life (삶에 대한 우리의 시야와 관점을 넓혀준다)',
          nuanceDiff: '독서·여행·문화 체험의 가치를 요약할 때 설득력 있게 활용할 수 있는 고급 표현입니다.',
        },
        {
          basicExpr: 'get new energy for the week (한 주를 위한 새 에너지를 얻다)',
          upgradedExpr: 'fully recharge our batteries for the week ahead (다가올 한 주를 위해 활력을 완전히 재충전하다)',
          nuanceDiff: '휴식이 일상의 생산성으로 이어지는 과정을 자연스럽게 연결해 줍니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '질문자 (Partner)',
          en: 'Why do you enjoy reading books from so many different fields?',
          soundBlock: 'Why do you enjoy / reading books / from so many different fields?',
          pron: '[와이 두 유 인조이 리딩 북스 프럼 소 매니 디퍼런트 필즈]',
          ko: '왜 그렇게 다양한 분야의 책 읽기를 즐기시나요?',
          pointNote: 'enjoy + 동명사(reading ~)',
        },
        {
          speaker: 'B',
          roleName: '화자 (Speaker)',
          en: 'Because reading diverse texts broadens our perspective on life and prevents cognitive rigidity.',
          soundBlock: 'Because reading diverse texts / broadens our perspective on life / and prevents cognitive rigidity.',
          pron: '[비코즈 리딩 다이버스 텍스트스 브로든즈 아워 퍼스펙티브 안 라이프 앤 프리벤츠 카그너티브 리지더티]',
          ko: '다양한 글을 읽는 것이 삶에 대한 시야를 넓혀주고 사고의 경직을 막아주기 때문입니다.',
          pointNote: '동명사구 주어 단수 수일치 (broadens / prevents)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '휴식과 활력 회복의 깊이 (동사구)',
      scaleAxisLabel: '잠깐 숨을 돌리다 ➔ 하루의 긴장을 풀다 ➔ 에너지를 완전히 재충전하다',
      weak: {
        expr: 'take a quick breather',
        pron: '[테이커 퀵 브리더]',
        ko: '잠깐 숨을 돌리며 쉬다',
        note: '일과 중간에 5~10분 정도 짧게 쉬어 갈 때',
      },
      medium: {
        expr: 'unwind after work',
        pron: '[언와인드 애프터 워크]',
        ko: '퇴근 후 하루의 긴장을 풀다',
        note: '일과의 긴장감을 내려놓고 편안한 상태로 전환할 때',
      },
      strong: {
        expr: 'recharge my batteries',
        pron: '[리차지 마이 배러리즈]',
        ko: '방전된 체력과 활력을 완전히 재충전하다',
        note: '충분한 휴식이나 주말 여가로 에너지를 가득 채울 때',
      },
    },
    {
      conceptTitle: '습관과 루틴 유지의 지속성 강도 (동사구)',
      scaleAxisLabel: '가끔 시도하다 ➔ 규칙적으로 챙기다 ➔ 흔들림 없이 고수하다',
      weak: {
        expr: 'give it a try from time to time',
        pron: '[기비러 트라이 프럼 타임 투 타임]',
        ko: '가끔 한 번씩 시도해 보다',
        note: '아직 고정된 습관이 되기 전 가볍게 해보는 단계',
      },
      medium: {
        expr: 'keep a regular routine',
        pron: '[키퍼 레귤러 루틴]',
        ko: '규칙적인 일과를 유지하다',
        note: '일정한 주기로 습관을 꾸준히 이어가는 단계',
      },
      strong: {
        expr: 'strictly stick to my routine',
        pron: '[스트릭틀리 스틱 투 마이 루틴]',
        ko: '나의 루틴을 철저히 고수하며 지키다',
        note: '바쁜 날에도 예외 없이 정해 둔 원칙과 루틴을 지키는 단계',
      },
    },
  ],
  vocab: [
    {
      id: 201,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'go-to',
      masked: 'g_-t_',
      ipa: '/ˈɡoʊ.tuː/',
      pron: '[고우투]',
      soundMethod: '하이픈으로 연결된 두 단어를 하나의 단어처럼 붙여 [고우투]로 발음합니다.',
      soundBlock: 'my go-to / coffee shop',
      meaning: '늘 믿고 찾는, 단골의, 가장 선호하는',
      enDef: 'regularly chosen or relied on as the best or most convenient option',
      exampleBlank: 'This quiet cafe is my _____ spot on weekends.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 spot 앞에서 어떤 장소인지 꾸며주는 한정적 형용사 수식어(M)입니다.',
      collocation: 'my go-to spot',
      collocationKo: '내가 늘 찾는 단골 장소',
      paraphraseTip: '장소뿐만 아니라 my go-to recipe(단골 레시피), my go-to song(애창곡)처럼 폭넓게 활용할 수 있습니다.',
    },
    {
      id: 202,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'grab a bite',
      masked: 'gr__ a b___',
      ipa: '/ɡræb ə baɪt/',
      pron: '[그래버 바이트]',
      soundMethod: 'grab과 a를 [그래버]로 연음하고 bite[바이트]를 경쾌하게 발음합니다.',
      soundBlock: 'grab a quick bite / together',
      meaning: '간단히 요기하다, 가볍게 식사하다',
      enDef: 'to get something to eat quickly and casually',
      exampleBlank: "Let's _____ before the movie starts.",
      pos: 'V',
      posLabel: '동사구 (V+DO 결합)',
      comp: 'V',
      compLabel: '서술어 동사구 (V+DO)',
      roleDesc: '동사 grab(V)과 목적어 명사구 a bite(DO)가 결합된 관용 동사구로, 9품사 다이어그램에서는 중심 동사(V) 노드에 매핑됩니다.',
      collocation: 'grab a quick bite',
      collocationKo: '빠르게 간단히 요기하다',
      paraphraseTip: '격식 있는 정찬이 아니라 일상적인 가벼운 식사를 표현할 때 자연스럽습니다.',
    },
    {
      id: 203,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'unwind',
      masked: 'un____',
      ipa: '/ʌnˈwaɪnd/',
      pron: '[언와인드]',
      soundMethod: '두 번째 음절(-wind)을 바람[윈드]이 아닌 감다의 발음인 [와인드](/waɪnd/)로 읽습니다.',
      soundBlock: 'unwind / after work',
      meaning: '(일·피로 후) 긴장을 풀다, 휴식을 취하다',
      enDef: 'to relax and allow your mind to be free from worry after a period of work',
      exampleBlank: 'I usually _____ by listening to music after work.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(I)의 동작을 서술하는 1형식 본동사(V)입니다.',
      collocation: 'unwind after a long day',
      collocationKo: '긴 하루 끝에 긴장을 풀다',
      paraphraseTip: '태엽(wind)을 반대로 풀어 긴장을 완화한다는 비유에서 온 표현입니다.',
    },
    {
      id: 204,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'stick to',
      masked: 'st___ t_',
      ipa: '/stɪk tuː/',
      pron: '[스틱 투]',
      soundMethod: 'stick[스틱] 뒤에 전치사 to를 붙여 뒤 명사구와 연결합니다.',
      soundBlock: 'stick to / my daily routine',
      meaning: '(계획·원칙·루틴을) 흔들림 없이 지키다, 고수하다',
      enDef: 'to continue doing or using something and not change it',
      exampleBlank: 'I always _____ my daily workout routine.',
      pos: 'V',
      posLabel: '동사+전치사 (V+Prep)',
      comp: 'V',
      compLabel: '동사 + 전치사구 보충어',
      roleDesc: '자동사 stick(V)이 의미를 완성하기 위해 전치사구 보충어(to + 명사구, M)를 필수적으로 요구합니다.',
      collocation: 'stick to a workout routine',
      collocationKo: '운동 루틴을 꾸준히 지키다',
      paraphraseTip: '전치사 to 없이 stick my routine이라고 쓰면 비문이 되므로 반드시 to를 함께 써야 합니다.',
    },
    {
      id: 205,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'clear my head',
      masked: 'cl___ my h___',
      ipa: '/klɪr maɪ hed/',
      pron: '[클리어 마이 헤드]',
      soundMethod: 'clear[클리어]와 head[헤드] 두 핵심 단어에 강세를 줍니다.',
      soundBlock: 'take a walk / to clear my head',
      meaning: '복잡한 머리를 식히다, 생각을 정리하다',
      enDef: 'to free your mind from worry, confusion, or mental fatigue',
      exampleBlank: 'Whenever I feel stressed, I take a walk to _____.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'M',
      compLabel: 'to부정사 부사구 (M)',
      roleDesc: '목적(~하기 위해)을 나타내는 to부정사구(to clear my head)를 이루어 동사를 수식(M)합니다.',
      collocation: 'go for a walk to clear my head',
      collocationKo: '머리를 식히러 산책하러 가다',
      paraphraseTip: '산책이나 조깅을 즐기는 이유를 설명할 때 매우 자연스러운 표현입니다.',
    },
    {
      id: 206,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'recharge my batteries',
      masked: 're______ my b________',
      ipa: '/riːˈtʃɑːrdʒ maɪ ˈbæt̬.ɚ.iz/',
      pron: '[리차지 마이 배러리즈]',
      soundMethod: 'batteries의 tt는 미국식 플랩으로 부드럽게 [배러리즈]로 발음합니다.',
      soundBlock: 'recharge / my batteries',
      meaning: '활력을 재충전하다, 기운을 회복하다',
      enDef: 'to rest and relax for a period of time so that you feel energetic again',
      exampleBlank: 'I always _____ on weekends by reading at home.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사구 (V)',
      roleDesc: '주어(I)의 서술어 역할을 하는 타동사+목적어 관용 동사구(V)입니다.',
      collocation: 'fully recharge my batteries',
      collocationKo: '활력을 완전히 재충전하다',
      paraphraseTip: '주어에 맞춰 소유격을 our batteries, your batteries로 바꾸어 활용합니다.',
    },
    {
      id: 207,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'broaden',
      masked: 'br_____',
      ipa: '/ˈbrɔː.dən/',
      pron: '[브로든]',
      soundMethod: '형용사 broad[브로드]에 동사화 접미사 -en이 붙어 [브로든]으로 소리 납니다.',
      soundBlock: 'broaden / our perspective',
      meaning: '(시야·지식·경험을) 넓히다, 확장하다',
      enDef: 'to increase the range of someone’s knowledge, experience, or understanding',
      exampleBlank: 'Reading diverse texts _____ our perspective on life.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '동명사구 주어(Reading diverse texts)의 동작을 서술하는 3형식 타동사(V)입니다.',
      collocation: 'broaden our perspective',
      collocationKo: '우리의 시야(관점)를 넓히다',
      paraphraseTip: 'expand one’s horizons와 함께 독서·여행 주제의 단골 고급 표현입니다.',
    },
  ],
  sentences: [
    {
      id: 2001,
      levelTag: 'beginner',
      tag: '초급 필수 · 주말 단골 카페 소개',
      targetWord: 'go-to',
      wordOrderFormula: 'This quiet cafe[S] + is[V] + my go-to spot[SC] + on weekends[M:부가어].',
      structure: '2형식 (S + be동사 V + 명사구 SC + 시간 부가어 M)',
      soundBlockEn: 'This quiet cafe / is my go-to spot / on weekends.',
      soundMethodGuide: 'is my go-to spot을 자연스럽게 이어 읽고 weekends의 첫 음절에 강세를 둡니다.',
      ipaLine: '/ðɪs ˈkwaɪ.ət kæˈfeɪ ɪz maɪ ˈɡoʊ.tuː spɑːt ɑːn ˈwiːk.endz/',
      koLine: '이 조용한 카페는 / 내가 늘 찾는 단골 장소이다 / 주말마다.',
      enLine: 'This quiet cafe / is my go-to spot / on weekends.',
      rawEn: 'This quiet cafe is my go-to spot on weekends.',
      pronLine: '[디스 콰이엇 카페 / 이즈 마이 고우투 스팟 / 안 위켄즈]',
      naturalKo: '이 조용한 카페는 내가 주말마다 늘 믿고 찾는 단골 장소이다.',
      paraphraseVersion: 'This peaceful cafe is the place I always visit on weekends.',
      grammarPoint: 'on weekends(주말마다)는 문장이 완성된 뒤 시간 정보를 덧붙이는 부가어(Adjunct, M)입니다.',
      contextNuance: '좋아하는 동네 장소나 맛집을 소개할 때 첫 문장으로 쓰기 좋습니다.',
    },
    {
      id: 2002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 전치사구 보충어(stick to) & 목적의 to부정사',
      targetWord: 'stick to',
      wordOrderFormula: 'I[S] + always[M] + stick[V] + to my daily workout routine[M:보충어] + to clear my head[M:목적 부가어].',
      structure: '1형식 자동사 + 전치사구 보충어(to + 명사구) + 부사적 to부정사구(to + V)',
      soundBlockEn: 'I always stick to / my daily workout routine / to clear my head.',
      soundMethodGuide: 'stick to my daily workout routine까지 한 흐름으로 읽고 to clear my head를 덧붙입니다.',
      ipaLine: '/aɪ ˈɔːl.weɪz stɪk tə maɪ ˈdeɪ.li ˈwɝːk.aʊt ruːˈtiːn tə klɪr maɪ hed/',
      koLine: '나는 항상 지킨다 / 나의 매일의 운동 루틴을 / 복잡한 머리를 식히기 위해.',
      enLine: 'I always stick to / my daily workout routine / to clear my head.',
      rawEn: 'I always stick to my daily workout routine to clear my head.',
      pronLine: '[아이 올웨이즈 스틱 투 / 마이 데일리 워크아웃 루틴 / 투 클리어 마이 헤드]',
      naturalKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
      paraphraseVersion: 'I consistently follow my daily exercise schedule in order to refresh my mind.',
      grammarPoint: 'to my daily workout routine은 동사 stick이 요구하는 전치사구 보충어(Complement)이고, to clear my head는 목적을 덧붙이는 to부정사 부가어(Adjunct)입니다.',
      contextNuance: '운동이나 자기관리 습관을 왜 꾸준히 유지하는지 설명할 때 활용하기 좋습니다.',
    },
    {
      id: 2003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 동명사구 주어 단수 수일치',
      targetWord: 'broaden',
      wordOrderFormula: 'Reading diverse texts[S:동명사구] + broadens[V] + our perspective[DO] + on life[M].',
      structure: '3형식 (동명사구 S + 단수 V + DO + 전치사구 M)',
      soundBlockEn: 'Reading diverse texts / broadens our perspective / on life.',
      soundMethodGuide: 'Reading diverse texts 뒤에서 호흡을 가다듬고 broadens our perspective를 또렷하게 발음합니다.',
      ipaLine: '/ˈriː.dɪŋ daɪˈvɝːs teksts ˈbrɔː.dənz ˈaʊ.ɚ pɚˈspek.tɪv ɑːn laɪf/',
      koLine: '다양한 글들을 읽는 것은 / 넓혀준다 우리의 시야(관점)를 / 삶에 대한.',
      enLine: 'Reading diverse texts / broadens our perspective / on life.',
      rawEn: 'Reading diverse texts broadens our perspective on life.',
      pronLine: '[리딩 다이버스 텍스트스 / 브로든즈 아워 퍼스펙티브 / 안 라이프]',
      naturalKo: '다양한 글을 읽는 것은 삶에 대한 우리의 시야를 넓혀준다.',
      paraphraseVersion: 'Exposing ourselves to various writings expands how we view the world.',
      grammarPoint: '주어 자리에 온 동명사구(Reading diverse texts)는 하나의 행위를 나타내므로 단수 취급하여 broadens(-s)로 수일치합니다.',
      contextNuance: '에세이나 인터뷰에서 독서·경험의 교육적 가치를 요약할 때 쓰기 좋은 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'go-to',
      ipa: '/ˈɡoʊ.tuː/',
      options: [
        '임시로 폐쇄된',
        '예약이 불가능한',
        '처음 방문해 보는',
        '늘 믿고 찾는, 단골의',
      ],
      answerIdx: 3,
      explanation: 'go-to는 명사 앞에서 "고민 없이 늘 믿고 찾는, 단골의"라는 뜻을 나타내는 복합형용사입니다.',
    },
    intermediate: {
      sentenceBefore: 'After a busy week, I like to read quietly at home to',
      sentenceAfter: 'for the upcoming week.',
      hint: '활력을 재충전하다, 기운을 회복하다',
      options: [
        'miss the deadline',
        'jump to conclusions',
        'recharge my batteries',
        'cut corners',
      ],
      answerIdx: 2,
      explanation: '바쁜 한 주를 보낸 뒤 다가올 한 주를 위해 조용히 독서하며 활력을 재충전한다는 문맥이므로 recharge my batteries가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 중 어법상 올바른 문장을 2개 고르세요. (전치사구 보충어 결합 및 동명사구 주어 수일치 확인)',
      highlightWord: 'stick to + 명사구 & 동명사구 주어 단수 동사(broadens)',
      options: [
        'I always stick to my daily workout routine to clear my head.',
        'I always stick my daily workout routine to clear my head.',
        'Reading diverse texts broaden our perspective on life.',
        'Reading diverse texts broadens our perspective on life.',
      ],
      answerIndices: [0, 3],
      explanation:
        '1번: 자동사 stick이 "~을 고수하다"라는 뜻일 때는 전치사 to가 필수(stick to my daily workout routine)입니다. 4번: 동명사구 주어(Reading diverse texts)는 단수 취급하므로 단수 동사 broadens를 써야 합니다.',
    },
    writingMission: {
      koPrompt: '다양한 글을 읽는 것은 삶에 대한 우리의 시야를 넓혀준다.',
      targetPattern: 'Reading diverse texts broadens ~',
      modelAnswer: 'Reading diverse texts broadens our perspective on life.',
    },
  },
};

export const THEME_TRAVEL_HOTEL: ThemeData = {
  id: 'theme-travel-hotel',
  badge: '✈️ 해외여행 · 호텔 · 공항',
  title: '수하물 보관 · 무료 조식 확인 & 레이트 체크아웃 요청',
  subtitle: '짐 맡기기(drop off), 기내 수하물(carry-on), 무료 혜택(complimentary), 요청 배려(accommodate)',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (체크인 전 수하물 보관 & 기내 반입 가방)',
      focusBadge: '구동사 drop off & 가산명사 carry-on',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '호텔 체크인 시간 전에 도착해 짐을 먼저 맡길 때와 기내 반입 가방을 다룰 때 쓰는 필수 표현입니다.',
      patternEn: 'Can we drop off our bags before check-in?',
      patternIpa: '/kæn wi drɑːp ɔːf ˈaʊ.ɚ bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
      patternPron: '[캔 위 드랍 오프 / 아워 백스 / 비포 체크인]',
      patternSoundBlock: 'Can we drop off / our bags / before check-in?',
      patternSoundRule: 'drop off[드랍 오프]를 명확히 발음하고 문장 끝 check-in을 살짝 올려 물어봅니다.',
      patternMeaningKo: '체크인 시간 전에 저희 가방(짐)을 먼저 맡겨 둘 수 있을까요?',
      grammarSummary: '조동사 Can + 주어(we) + 타동사구(drop off) + 목적어(our bags) + 시간 부가어(before check-in)로 이루어진 의문문입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'leave our luggage here (우리 짐을 여기에 두다)',
          upgradedExpr: 'drop off our bags at the front desk (프런트 데스크에 가방을 맡기다)',
          nuanceDiff: '짐이나 세탁물을 맡기거나 동승자를 내려줄 때 두루 쓰는 핵심 구동사입니다.',
        },
        {
          basicExpr: 'small bag for the airplane cabin (비행기 객실용 작은 가방)',
          upgradedExpr: 'carry-on (기내 반입용 가방/수하물)',
          nuanceDiff: '위탁 수하물(checked baggage)과 대비되는 기내 반입 가방을 뜻합니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '투숙객 (Guest)',
          en: 'Good morning! Can we drop off our bags before check-in?',
          soundBlock: 'Good morning! / Can we drop off our bags / before check-in?',
          pron: '[굿 모닝! 캔 위 드랍 오프 아워 백스 비포 체크인]',
          ko: '안녕하세요! 체크인 전에 저희 가방을 먼저 맡겨 둘 수 있을까요?',
          pointNote: 'drop off our bags (가방을 맡기다)',
        },
        {
          speaker: 'B',
          roleName: '프런트 직원 (Staff)',
          en: 'Certainly! Please keep your valuables in your carry-on.',
          soundBlock: 'Certainly! / Please keep your valuables / in your carry-on.',
          pron: '[써튼리! 플리즈 킵 유어 밸류어블즈 인 유어 캐리안]',
          ko: '물론입니다! 귀중품은 휴대하시는 기내 가방에 보관해 주세요.',
          pointNote: 'carry-on (기내 반입용 휴대 가방)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (무료 제공 혜택 확인 & 경유지 재정비)',
      focusBadge: '형용사 complimentary(무료의) & 구동사 freshen up',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '호텔 예약에 무료 조식이나 라운지 이용이 포함되어 있는지 확인하는 표현을 익힙니다.',
      patternEn: 'Does our reservation include complimentary breakfast?',
      patternIpa: '/dʌz ˈaʊ.ɚ ˌrez.ɚˈveɪ.ʃən ɪnˈkluːd ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
      patternPron: '[더즈 아워 레저베이션 인클루드 / 캄플러멘터리 브렉퍼스트]',
      patternSoundBlock: 'Does our reservation include / complimentary breakfast?',
      patternSoundRule: 'complimentary[캄플러멘터리]의 세 번째 음절(-men-)에 강세를 두어 리듬감 있게 읽습니다.',
      patternMeaningKo: '저희 예약에 무료(고객 우대) 조식이 포함되어 있나요?',
      grammarSummary: '조동사 Does + 단수 주어(our reservation) + 타동사 원형(include) + 직접목적어(complimentary breakfast)로 구성된 3형식 의문문입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'free breakfast (무료 아침 식사)',
          upgradedExpr: 'complimentary breakfast (고객 우대용 무료 제공 조식)',
          nuanceDiff: '호텔·항공사·라운지에서 서비스 차원으로 무료 제공하는 혜택에는 free 대신 complimentary를 즐겨 씁니다.',
        },
        {
          basicExpr: 'wash my face and rest briefly (세수하고 잠깐 쉬다)',
          upgradedExpr: 'freshen up during the layover (경유 대기 시간 동안 간단히 씻고 재정비하다)',
          nuanceDiff: '장거리 비행이나 외출 중에 화장실·라운지에서 간단히 씻고 단장할 때 쓰는 구동사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '투숙객 (Guest)',
          en: 'Does our reservation include complimentary breakfast?',
          soundBlock: 'Does our reservation include / complimentary breakfast?',
          pron: '[더즈 아워 레저베이션 인클루드 캄플러멘터리 브렉퍼스트]',
          ko: '저희 예약에 무료 조식이 포함되어 있나요?',
          pointNote: 'complimentary breakfast (무료 제공 조식)',
        },
        {
          speaker: 'B',
          roleName: '컨시어지 (Concierge)',
          en: 'Yes, it does. You can also freshen up in our lounge before your flight.',
          soundBlock: 'Yes, it does. / You can also freshen up / in our lounge / before your flight.',
          pron: '[예스, 잇 더즈. 유 캔 올소 프레셔넙 인 아워 라운지 비포 유어 플라이트]',
          ko: '네, 포함되어 있습니다. 비행 전 저희 라운지에서 간단히 씻고 재정비하실 수도 있습니다.',
          pointNote: 'freshen up (간단히 씻고 재정비하다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (정중한 특별 요청 & 상세 일정표 점검)',
      focusBadge: '정중한 의문문 Would it be possible to ~ & 타동사 accommodate',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '레이트 체크아웃이나 일정 조정을 정중하게 요청할 때 help 구문과 타동사 accommodate를 상황에 맞게 활용합니다.',
      patternEn: 'Would it be possible to accommodate a late check-out request?',
      patternIpa: '/wʊd ɪt bi ˈpɑː.sə.bəl tə əˈkɑː.mə.deɪt ə leɪt ˈtʃek.aʊt rɪˈkwest/',
      patternPron: '[우딧 비 파서블 / 투 어카머데이트 / 어 레이트 체크아웃 리퀘스트]',
      patternSoundBlock: 'Would it be possible / to accommodate / a late check-out request?',
      patternSoundRule: 'Would it be를 [우딧비]로 부드럽게 연결하고 accommodate[어카머데이트]의 두 번째 음절(-com-)에 강세를 줍니다.',
      patternMeaningKo: '레이트 체크아웃(체크아웃 시간 연장) 요청을 배려해 주실 수 있을까요?',
      grammarSummary: '가주어(it) + 진주어(to accommodate a late check-out request) 구문으로, 상대방에게 부담을 주지 않고 가능 여부를 정중히 타진하는 표현입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'Could you help us arrange a late check-out? (레이트 체크아웃을 준비하도록 도와주실 수 있나요?)',
          upgradedExpr: 'Would it be possible to accommodate a late check-out request? (레이트 체크아웃 요청을 수용해 배려해 주실 수 있을까요?)',
          nuanceDiff: 'help는 help me, help me (to) do ~, help me with ~ 구조로 모두 자연스럽고 정중하게 쓸 수 있으며, 요청을 수용한다는 뜻의 타동사 accommodate를 함께 알아두면 격식 있는 대안 표현으로 활용할 수 있습니다.',
        },
        {
          basicExpr: 'check our travel plan again (여행 계획을 다시 확인하다)',
          upgradedExpr: 'review our updated flight itinerary (변경된 항공편 상세 일정표를 검토하다)',
          nuanceDiff: '항공편·숙소·이동 시간이 적힌 상세 여행 일정표는 itinerary라고 부릅니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '투숙객 (Guest)',
          en: 'Our flight itinerary changed. Would it be possible to accommodate a late check-out request?',
          soundBlock: 'Our flight itinerary changed. / Would it be possible / to accommodate / a late check-out request?',
          pron: '[아워 플라이트 아이티너레리 체인지드. 우딧 비 파서블 투 어카머데이트 어 레이트 체크아웃 리퀘스트]',
          ko: '항공편 일정이 변경되었습니다. 혹시 레이트 체크아웃 요청을 배려해 주실 수 있을까요?',
          pointNote: 'itinerary (상세 일정표) + accommodate a request (요청을 수용·배려하다)',
        },
        {
          speaker: 'B',
          roleName: '호텔 매니저 (Manager)',
          en: 'We would be happy to accommodate your request until 2 PM at no extra charge.',
          soundBlock: 'We would be happy / to accommodate your request / until 2 PM / at no extra charge.',
          pron: '[위 우드 비 해피 투 어카머데이트 유어 리퀘스트 언틸 투 피엠 앳 노 엑스트라 차지]',
          ko: '추가 요금 없이 오후 2시까지 고객님의 요청을 기꺼이 배려해 드리겠습니다.',
          pointNote: 'at no extra charge (추가 요금 없이)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '요청·문의 표현의 정중함과 격식도 단계 (의문문)',
      scaleAxisLabel: '편한 일상 요청 ➔ 정중한 도움 요청(help) ➔ 격식 있는 배려 타진(accommodate)',
      weak: {
        expr: 'Can I get a late check-out?',
        pron: '[캐나이 게러 레이트 체크아웃]',
        ko: '레이트 체크아웃 좀 될까요?',
        note: '일상에서 간단하고 직접적으로 묻는 표현',
      },
      medium: {
        expr: 'Could you help us arrange a late check-out?',
        pron: '[쿠쥬 헬프 어스 어레인지 어 레이트 체크아웃]',
        ko: '레이트 체크아웃을 할 수 있게 도와주실 수 있을까요?',
        note: 'help + 목적어 + 동사원형(또는 to V / with N)을 활용한 자연스럽고 정중한 표현',
      },
      strong: {
        expr: 'Would it be possible to accommodate a late check-out request?',
        pron: '[우딧 비 파서블 투 어카머데이트 어 레이트 체크아웃 리퀘스트]',
        ko: '레이트 체크아웃 요청을 배려해 주시는 것이 가능할까요?',
        note: '상황 여건을 존중하며 특별 요청 수락 여부를 묻는 격식 있는 표현',
      },
    },
    {
      conceptTitle: '무료 제공 및 요금 면제 표현 단계 (형용사·전치사구)',
      scaleAxisLabel: '일상적인 무료 ➔ 추가 비용 없음 ➔ 호텔·항공 고객 우대 무료 제공',
      weak: {
        expr: 'free of charge',
        pron: '[프리 오브 차지]',
        ko: '무료의, 요금이 없는',
        note: '일상과 안내문에서 가장 보편적으로 쓰는 표현',
      },
      medium: {
        expr: 'at no extra charge',
        pron: '[앳 노 엑스트라 차지]',
        ko: '별도의 추가 요금 없이',
        note: '기본 이용료 외에 추가 비용이 발생하지 않음을 명확히 할 때',
      },
      strong: {
        expr: 'complimentary (service)',
        pron: '[캄플러멘터리 서비스]',
        ko: '(고객 우대 차원에서) 무료로 제공되는',
        note: '호텔 조식·라운지·웰컴 드링크 등 서비스 혜택을 격식 있게 부를 때',
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
      soundMethod: '미국식 모음 /ɑː/를 살려 [드랍 오프]로 또렷하게 발음합니다.',
      soundBlock: 'drop off / our bags',
      meaning: '(짐·물건을) 맡기다, (사람을) 내려주다',
      enDef: 'to take someone or something to a particular place and leave them or it there',
      exampleBlank: 'Can we _____ our bags at the front desk before check-in?',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Can 뒤에서 목적어(our bags)를 취하는 3형식 타동사구(V)입니다.',
      collocation: 'drop off luggage before check-in',
      collocationKo: '체크인 전에 짐을 맡기다',
      paraphraseTip: '반대로 맡긴 짐을 다시 찾거나 사람을 태우러 갈 때는 pick up을 씁니다.',
    },
    {
      id: 302,
      type: '트렌드·실무',
      recommendLevel: 'beginner',
      word: 'carry-on',
      masked: 'c____-o_',
      ipa: '/ˈkær.i.ɑːn/',
      pron: '[캐리안]',
      soundMethod: '첫 음절(car-)에 강세를 두어 [캐리안]으로 붙여 발음합니다.',
      soundBlock: 'store your carry-on / in the bin',
      meaning: '기내 반입용 가방(휴대 수하물)',
      enDef: 'a small bag or suitcase that a passenger is allowed to take into the cabin of an aircraft',
      exampleBlank: 'You can store your _____ in the overhead bin.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 store의 직접목적어(DO) 역할을 하는 가산명사입니다. (carry-on bag처럼 명사 앞에서 복합명사/형용사 수식어로도 쓰입니다.)',
      collocation: 'put a carry-on in the overhead bin',
      collocationKo: '기내 가방을 좌석 위 수하물 칸에 넣다',
      paraphraseTip: '항공사에 부치는 짐은 checked baggage(위탁 수하물)라고 구분해 부릅니다.',
    },
    {
      id: 303,
      type: '수능·학술',
      recommendLevel: 'intermediate',
      word: 'complimentary',
      masked: 'com__________',
      ipa: '/ˌkɑːm.pləˈmen.t̬ɚ.i/',
      pron: '[캄플러멘터리]',
      soundMethod: '세 번째 음절(-men-)에 주강세를 두고 t는 부드럽게 발음합니다.',
      soundBlock: 'complimentary / breakfast',
      meaning: '(호텔·항공 등에서) 무료로 제공되는, 우대의',
      enDef: 'given or supplied free of charge as a courtesy or polite gesture',
      exampleBlank: 'Does our hotel reservation include _____ breakfast?',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '명사 breakfast 앞에서 명사를 꾸며주는 형용사 수식어(M)입니다.',
      collocation: 'complimentary lounge access',
      collocationKo: '무료 라운지 이용 혜택',
      paraphraseTip: '철자 i를 쓰는 complimentary(무료의/칭찬하는)와 철자 e를 쓰는 complementary(상호 보완적인)를 구별하세요.',
    },
{
      id: 304,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'freshen up',
      masked: 'fr_____ u_',
      ipa: '/ˈfreʃ.ən ʌp/',
      pron: '[프레셔넙]',
      soundMethod: 'freshen의 끝 /n/과 up을 자연스럽게 연음하여 [프레셔넙]으로 읽습니다.',
      soundBlock: 'freshen up / in the lounge',
      meaning: '(간단히 씻고 옷매무새를 정돈하며) 재정비하다',
      enDef: 'to wash your hands and face and make yourself clean and tidy',
      exampleBlank: 'We can _____ in the airport lounge before dinner.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 주어(We)의 동작을 서술하는 1형식 본동사구(V)입니다.',
      collocation: 'freshen up after a long flight',
      collocationKo: '장거리 비행 후 간단히 씻고 재정비하다',
      paraphraseTip: '체크인 직후나 저녁 식사 약속 전에 잠깐 씻고 단장한다고 말할 때 딱 맞는 표현입니다.',
    },
    {
      id: 305,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'itinerary',
      masked: 'iti______',
      ipa: '/aɪˈtɪn.ə.rer.i/',
      pron: '[아이티너레리]',
      soundMethod: '첫 음절을 [이-]가 아닌 이중모음 [아이-]로 시작하고 두 번째 음절(-tin-)에 강세를 줍니다.',
      soundBlock: 'our updated / flight itinerary',
      meaning: '(시간·경로가 적힌) 상세 여행 일정표',
      enDef: 'a detailed plan or route of a journey, including flight and hotel times',
      exampleBlank: 'Let me double-check our updated flight _____.',
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '타동사 double-check의 직접목적어(DO) 역할을 하는 핵심 명사입니다.',
      collocation: 'review the travel itinerary',
      collocationKo: '상세 여행 일정표를 검토하다',
      paraphraseTip: '단순한 schedule보다 이동 경로·항공편·숙박 정보가 포함된 여행/출장 일정표를 가리킵니다.',
    },
{
      id: 306,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'accommodate',
      masked: 'acc________',
      ipa: '/əˈkɑː.mə.deɪt/',
      pron: '[어카머데이트]',
      soundMethod: '두 번째 음절(-com-)에 강세를 두어 [어카머데이트]로 발음하며, 철자 c와 m이 모두 2개씩(cc, mm) 들어갑니다.',
      soundBlock: 'accommodate / a special request',
      meaning: '(요청·필요를) 수용하다, 배려하다 / (인원을) 수용하다',
      enDef: 'to fulfill or adapt to someone’s request or needs; to provide enough space for',
      exampleBlank: 'Our hotel can gladly _____ a late check-out request.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 목적어(a late check-out request)를 취하는 3형식 본동사(V)입니다.',
      collocation: 'accommodate a client’s request',
      collocationKo: '고객의 요청을 수용해 배려하다',
      paraphraseTip: 'help는 help me, help me (to) do ~, help me with ~로 모두 자연스럽게 쓸 수 있으며, 요청 자체를 목적어로 바로 받아 "요청을 들어주다·배려하다"라고 표현할 때는 타동사 accommodate도 유용하게 쓰입니다.',
    },
    {
      id: 307,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'comfortable',
      masked: 'com________',
      ipa: '/ˈkʌm.fɚ.t̬ə.bəl/',
      pron: '[컴프터블]',
      soundMethod: '사전상 4음절(/ˈkʌm.fɚ.t̬ə.bəl/) 또는 일상 구어 축약 3음절(/ˈkʌmf.tə.bəl/)로 발음하며 첫 음절(com-)에 강세를 둡니다.',
      soundBlock: 'make yourself / comfortable',
      meaning: '편안한, 쾌적한',
      enDef: 'providing physical ease and relaxation; free from stress or tension',
      exampleBlank: 'Please make yourself _____ in the lobby lounge.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'OC',
      compLabel: '목적격보어 (OC)',
      roleDesc: '5형식 동사 make의 목적어(yourself) 뒤에서 상태를 보충 설명하는 목적격보어(OC)입니다.',
      collocation: 'make yourself comfortable',
      collocationKo: '편안하게 계시다(편히 쉬다)',
      paraphraseTip: '손님에게 "편히 계세요"라고 안내할 때 쓰는 대표적인 5형식 관용 표현입니다.',
    },
  ],
  sentences: [
    {
      id: 3001,
      levelTag: 'beginner',
      tag: '초급 필수 · 체크인 전 수하물 보관 요청',
      targetWord: 'drop off',
      wordOrderFormula: 'Can we[조동사+S] + drop off[V] + our bags[DO] + before check-in[M]?',
      structure: '3형식 구동사 의문문 (Can + S + V + DO + M)',
      soundBlockEn: 'Can we drop off / our bags / before check-in?',
      soundMethodGuide: 'Can we drop off를 경쾌하게 잇고 our bags before check-in을 자연스럽게 연결합니다.',
      ipaLine: '/kæn wi drɑːp ɔːf ˈaʊ.ɚ bæɡz bɪˈfɔːr ˈtʃek.ɪn/',
      koLine: '저희가 먼저 맡겨 둘 수 있을까요 / 저희 가방들을 / 체크인 시간 전에?',
      enLine: 'Can we drop off / our bags / before check-in?',
      rawEn: 'Can we drop off our bags before check-in?',
      pronLine: '[캔 위 드랍 오프 / 아워 백스 / 비포 체크인]',
      naturalKo: '체크인 시간 전에 저희 가방을 먼저 맡겨 둘 수 있을까요?',
      paraphraseVersion: 'Could we leave our luggage at the front desk prior to check-in?',
      grammarPoint: '타동사구 drop off 뒤에 명사 목적어(our bags)가 왔으며, 대명사(them)를 쓸 때는 반드시 drop them off 어순으로 써야 합니다.',
      contextNuance: '호텔에 일찍 도착했을 때 프런트 데스크에서 바로 쓸 수 있는 실전 문장입니다.',
    },
    {
      id: 3002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 무료 조식 포함 여부 확인',
      targetWord: 'complimentary',
      wordOrderFormula: 'Does[조동사] + our reservation[S] + include[V] + complimentary breakfast[DO]?',
      structure: '3형식 의문문 (Does + 단수 S + 동사원형 V + DO)',
      soundBlockEn: 'Does our reservation include / complimentary breakfast?',
      soundMethodGuide: 'reservation include를 부드럽게 이어 읽고 complimentary의 강세(-men-)를 살려 발음합니다.',
      ipaLine: '/dʌz ˈaʊ.ɚ ˌrez.ɚˈveɪ.ʃən ɪnˈkluːd ˌkɑːm.pləˈmen.t̬ɚ.i ˈbrek.fəst/',
      koLine: '저희 예약이 포함하고 있나요 / 고객 우대용 무료 조식을?',
      enLine: 'Does our reservation include / complimentary breakfast?',
      rawEn: 'Does our reservation include complimentary breakfast?',
      pronLine: '[더즈 아워 레저베이션 인클루드 / 캄플러멘터리 브렉퍼스트]',
      naturalKo: '저희 예약에 무료 조식이 포함되어 있나요?',
      paraphraseVersion: 'Is breakfast provided at no extra charge with our booking?',
      grammarPoint: '단수 주어(our reservation)의 일반동사 의문문이므로 앞에 조동사 Does가 오고 본동사는 원형(include)으로 씁니다.',
      contextNuance: '체크인할 때 조식·수영장·라운지 등 무료 포함 혜택을 확인하는 정중한 질문입니다.',
    },
    {
      id: 3003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 정중한 레이트 체크아웃 요청',
      targetWord: 'accommodate',
      wordOrderFormula: 'Would it[조동사+가주어] + be[V] + possible[SC] + to accommodate a late check-out request[진주어]?',
      structure: '2형식 가주어(it) - 진주어(to V ~) 정중한 의문문',
      soundBlockEn: 'Would it be possible / to accommodate / a late check-out request?',
      soundMethodGuide: 'Would it be possible 뒤에서 살짝 끊고 to accommodate a late check-out request를 정중한 톤으로 읽습니다.',
      ipaLine: '/wʊd ɪt bi ˈpɑː.sə.bəl tə əˈkɑː.mə.deɪt ə leɪt ˈtʃek.aʊt rɪˈkwest/',
      koLine: '혹시 가능할까요 / 수용하여 배려해 주시는 것이 / 레이트 체크아웃 요청을?',
      enLine: 'Would it be possible / to accommodate / a late check-out request?',
      rawEn: 'Would it be possible to accommodate a late check-out request?',
      pronLine: '[우딧 비 파서블 / 투 어카머데이트 / 어 레이트 체크아웃 리퀘스트]',
      naturalKo: '혹시 레이트 체크아웃(체크아웃 시간 연장) 요청을 배려해 주실 수 있을까요?',
      paraphraseVersion: 'Could you help us arrange a late check-out if a room is available?',
      grammarPoint: 'Could you help us arrange a late check-out?처럼 help + 목적어 + (to) 동사원형/with 명사구 구조로도 정중하게 요청할 수 있으며, 타동사 accommodate는 요청(request)을 바로 목적어로 취합니다.',
      contextNuance: '호텔이나 비즈니스 파트너에게 일정·조건 배려를 정중하게 요청할 때 유용한 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'drop off',
      ipa: '/drɑːp ɔːf/',
      options: [
        '비행기 좌석을 취소하다',
        '(짐·물건을) 맡기다, (사람을) 내려주다',
        '여권 유효기간을 연장하다',
        '환전 수수료를 계산하다',
      ],
      answerIdx: 1,
      explanation: 'drop off는 체크인 전에 가방을 맡기거나 동승자를 목적지에 내려줄 때 쓰는 구동사입니다.',
    },
    intermediate: {
      sentenceBefore: 'Does our hotel reservation include',
      sentenceAfter: 'breakfast and lounge access?',
      hint: '(호텔·항공 등에서 고객 우대로) 무료로 제공되는',
      options: ['mandatory', 'temporary', 'fragile', 'complimentary'],
      answerIdx: 3,
      explanation: '호텔이나 항공사에서 서비스 차원으로 무료 제공하는 혜택은 complimentary라고 표현합니다.',
    },
    advanced: {
      questionPrompt:
        '호텔 프런트에서 레이트 체크아웃을 정중하게 요청하는 문장으로 어법상 자연스러운 것을 2개 고르세요. (help 및 accommodate의 올바른 결합 확인)',
      highlightWord: 'help + 목적어 + (to) V / with N & 타동사 accommodate + 목적어',
      options: [
        'Would it be possible to accommodate a late check-out request?',
        'Would it be possible to accommodate with us a late check-out?',
        'Could you help us arrange a late check-out?',
        'Could you accommodate us arrange a late check-out?',
      ],
      answerIndices: [0, 2],
      explanation:
        '1번: 타동사 accommodate는 요청(a late check-out request)을 바로 목적어로 취합니다. 3번: help는 help + 목적어(us) + 동사원형(arrange) / to V / with N 구조로 모두 자연스럽고 정중하게 쓸 수 있습니다.',
    },
    writingMission: {
      koPrompt: '레이트 체크아웃 요청을 배려해 주실 수 있을까요?',
      targetPattern: 'Would it be possible to accommodate ~?',
      modelAnswer: 'Would it be possible to accommodate a late check-out request?',
    },
  },
};
// ============================================================================
// src/App.tsx — [파트 3/4]
// - 테마 4 (유튜브·미디어 리뷰: exampleBlank 원형 일치, ", so" 구두점, 근사 발음 병기)
// - 테마 5 (패션·에디토리얼: the brand's heritage 구체화, 미국식 IPA /ˈriː.ə.li/, statement piece DO 일치)
// - 3대 입시 코스 (CSAT / GRAMMAR_ESSAY / SCHOOL_INTERNAL: What절 해설 및 givenWords 1:1 일치)
// - 구문 다이어그램 분석 엔진 (VERIFIED_SENTENCE_TOKEN_MAP + 오분류 개선 및 추정 한계 명시)
// ============================================================================

export const THEME_YOUTUBE_VIRAL: ThemeData = {
  id: 'theme-youtube-viral',
  badge: '🎬 유튜브 · 미디어 · 콘텐츠 리뷰',
  title: '화제의 영상 · 드라마 정주행 & 핵심을 찌르는 리뷰 표현',
  subtitle: '입소문 확산(go viral), 몰아보기(binge-watch), 기대 충족(live up to the hype), 깊은 공감(resonate)',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (화제의 영상 확산 & 주말 시리즈 정주행)',
      focusBadge: '2형식 결합 go viral & 복합동사 binge-watch',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: 'SNS나 동영상 플랫폼에서 큰 화제가 된 영상과 주말 몰아보기 경험을 자연스럽게 이야기합니다.',
      patternEn: 'The short clip went viral overnight, so I binge-watched the whole series.',
      patternIpa: '/ðə ʃɔːrt klɪp went ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt, soʊ aɪ ˈbɪndʒ.wɑːtʃt ðə hoʊl ˈsɪr.iːz/',
      patternPron: '[더 쇼트 클립 웬트 바이럴 오버나이트, / 소 아이 빈지워치트 / 더 홀 시리즈]',
      patternSoundBlock: 'The short clip went viral overnight, / so I binge-watched / the whole series.',
      patternSoundRule: '절을 잇는 접속사 so 앞에서 쉼표 호흡을 두고 binge-watched[빈지워치트]를 리듬감 있게 발음합니다.',
      patternMeaningKo: '그 짧은 영상이 하룻밤 사이에 화제가 되어서, 나는 시리즈 전체를 몰아서 정주행했다.',
      grammarSummary: '앞절은 주어(The short clip) + 2형식 변화동사(went) + 형용사 주격보어(viral) + 부사(overnight) 구조이며, 등위접속사(, so) 뒤로 3형식 절(I binge-watched the whole series)이 이어집니다.',
      paraphraseDrill: [
        {
          basicExpr: 'became very popular quickly on the internet (인터넷에서 빠르게 인기를 얻었다)',
          upgradedExpr: 'went viral overnight on social media (소셜 미디어에서 하룻밤 사이에 입소문을 타고 화제가 되었다)',
          nuanceDiff: '영상이 알고리즘과 공유를 통해 폭발적으로 퍼져 나갈 때 쓰는 표준 표현입니다.',
        },
        {
          basicExpr: 'watched all episodes in one weekend (주말 동안 모든 에피소드를 다 봤다)',
          upgradedExpr: 'binge-watched the entire season over the weekend (주말 내내 시즌 전체를 몰아서 정주행했다)',
          nuanceDiff: 'OTT 드라마나 유튜브 시리즈를 쉬지 않고 연속 시청할 때 쓰는 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '친구 (Friend)',
          en: 'Did you see that cooking video that went viral overnight?',
          soundBlock: 'Did you see / that cooking video / that went viral overnight?',
          pron: '[디쥬 씨 댓 쿠킹 비디오 댓 웬트 바이럴 오버나이트]',
          ko: '하룻밤 사이에 화제가 된 그 요리 영상 봤어?',
          pointNote: 'go viral overnight (하룻밤 사이에 화제가 되다)',
        },
        {
          speaker: 'B',
          roleName: '화자 (Speaker)',
          en: "Yes! It captured my attention right away, so I binge-watched all of the creator's videos.",
          soundBlock: "Yes! / It captured my attention right away, / so I binge-watched / all of the creator's videos.",
          pron: '[예스! 잇 캡처드 마이 어텐션 라잇 어웨이, 소 아이 빈지워치트 올 오브 더 크리에이터즈 비디오즈]',
          ko: '응! 단숨에 시선을 사로잡길래 그 크리에이터의 영상을 전부 몰아 봤어.',
          pointNote: 'capture attention (시선을 사로잡다) + binge-watch (정주행하다)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (소문·기대치 충족 평가 & 핵심을 찌르는 분석)',
      focusBadge: '구동사 live up to the hype & 관용구 hit the nail on the head',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '소문난 영화·제품·콘텐츠가 실제 기대만큼 훌륭했는지 구체적으로 평가하는 표현을 익힙니다.',
      patternEn: 'The new series definitely lived up to the hype.',
      patternIpa: '/ðə nuː ˈsɪr.iːz ˈdef.ə.nət.li lɪvd ʌp tə ðə haɪp/',
      patternPron: '[더 뉴 시리즈 / 데피니틀리 리브드 업 투 더 하입] (연음 근사: [리브덥 투 더 하입])',
      patternSoundBlock: 'The new series / definitely lived up / to the hype.',
      patternSoundRule: 'lived up[리브드 업]을 자연스럽게 이어 읽고 문장 끝 명사 hype[하입]에 강세를 줍니다.',
      patternMeaningKo: '그 새 시리즈는 사전의 떠들썩한 기대(소문)에 확실히 부응했다(기대만큼 훌륭했다).',
      grammarSummary: 'live up to(~라는 기대·기준에 부응하다)는 동사 live + 부사 up + 전치사 to가 결합해 뒤에 명사구 보충어(the hype)를 취하는 구동사 표현입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'was as good as people said before (사람들이 사전에 말했던 것만큼 좋았다)',
          upgradedExpr: 'definitely lived up to the hype (사전의 높은 기대와 소문에 확실히 부응했다)',
          nuanceDiff: '출시 전 홍보나 입소문(hype)이 자자했던 작품·맛집·신제품이 실제로도 만족스러웠을 때 씁니다.',
        },
        {
          basicExpr: 'explained the main problem very accurately (핵심 문제를 매우 정확히 설명했다)',
          upgradedExpr: 'really hit the nail on the head (문제의 정곡·핵심을 정확히 찔렀다)',
          nuanceDiff: '리뷰어나 발표자의 분석이 핵심을 정확히 짚어냈을 때 칭찬하는 관용구입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '동료 (Colleague)',
          en: 'Everyone is talking about that new documentary. Did it live up to the hype?',
          soundBlock: 'Everyone is talking about / that new documentary. / Did it live up to the hype?',
          pron: '[에브리원 이즈 토킹 어바웃 댓 뉴 다큐멘터리. 디딧 리브 업 투 더 하입]',
          ko: '다들 그 새 다큐멘터리 이야기뿐이던데, 소문만큼 정말 괜찮았나요?',
          pointNote: 'live up to the hype (소문·기대만큼 훌륭하다)',
        },
        {
          speaker: 'B',
          roleName: '화자 (Speaker)',
          en: 'Absolutely. The director really hit the nail on the head regarding modern work culture.',
          soundBlock: 'Absolutely. / The director really hit the nail on the head / regarding modern work culture.',
          pron: '[앱솔루틀리. 더 디렉터 릴리 힛 더 네일 안 더 헤드 리가딩 모던 워크 컬처]',
          ko: '그럼요. 감독이 현대 직장 문화에 대해 정곡을 정확히 찔렀더라고요.',
          pointNote: 'hit the nail on the head (정곡을 찌르다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (유익한 콘텐츠 분석 & 대중적 공감·울림 묘사)',
      focusBadge: '형용사 보어 informative & 자동사+전치사구 보충어 resonate with ~',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '좋은 콘텐츠나 강연이 왜 대중에게 깊은 울림(resonate with)을 주는지 논리적으로 서술합니다.',
      patternEn: 'The review is deeply informative, so it resonates with the audience.',
      patternIpa: '/ðə rɪˈvjuː ɪz ˈdiːp.li ɪnˈfɔːr.mə.t̬ɪv, soʊ ɪt ˈrez.ə.neɪts wɪð ði ˈɔː.di.əns/',
      patternPron: '[더 리뷰 이즈 디플리 인포머티브, / 소 잇 레저네이츠 / 위드 디 오디언스]',
      patternSoundBlock: 'The review is deeply informative, / so it resonates / with the audience.',
      patternSoundRule: 'informative[인포머티브]의 두 번째 음절(-for-)과 resonates[레저네이츠]의 첫 음절(res-)에 강세를 둡니다.',
      patternMeaningKo: '그 리뷰는 내용이 매우 유익해서, 시청자들에게 깊은 공감(울림)을 불러일으킨다.',
      grammarSummary: '앞절은 2형식(The review[S] + is[V] + deeply[M] + informative[SC])이고, 등위접속사(, so) 뒤의 절은 단수 주어(it) + 자동사(resonates) + 전치사구 보충어(with the audience)로 이루어집니다.',
      paraphraseDrill: [
        {
          basicExpr: 'gives a lot of useful information (유용한 정보를 많이 준다)',
          upgradedExpr: 'is deeply informative and insightful (내용이 매우 유익하고 통찰력이 있다)',
          nuanceDiff: '단순히 재미있는 것을 넘어 배울 점과 유익한 정보가 풍부한 콘텐츠를 묘사할 때 씁니다.',
        },
        {
          basicExpr: 'makes many people agree and feel the same way (많은 사람이 공감하게 만든다)',
          upgradedExpr: 'deeply resonates with the audience (시청자·청중에게 깊은 공감과 울림을 준다)',
          nuanceDiff: '소리가 공명하듯 메시지나 이야기가 사람들의 마음에 큰 울림을 줄 때 쓰는 고급 동사입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '패널 (Panelist)',
          en: 'Why do you think this channel gained such strong word-of-mouth popularity?',
          soundBlock: 'Why do you think / this channel gained / such strong word-of-mouth popularity?',
          pron: '[와이 두 유 띵크 디스 채널 게인드 서치 스트롱 워드오브마우쓰 파퓰래러티]',
          ko: '이 채널이 왜 이렇게 강력한 입소문 인기를 얻었다고 생각하시나요?',
          pointNote: 'word-of-mouth popularity (입소문 인기)',
        },
        {
          speaker: 'B',
          roleName: '분석가 (Reviewer)',
          en: 'Because every episode is deeply informative, so it naturally resonates with the audience.',
          soundBlock: 'Because every episode is deeply informative, / so it naturally resonates / with the audience.',
          pron: '[비코즈 에브리 에피소드 이즈 디플리 인포머티브, 소 잇 내추럴리 레저네이츠 위드 디 오디언스]',
          ko: '매 에피소드가 매우 유익해서 시청자들에게 자연스럽게 깊은 공감을 불러일으키기 때문입니다.',
          pointNote: 'deeply informative (매우 유익한) + resonate with ~ (~와 공명·공감하다)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '콘텐츠 인기와 확산 속도의 단계 (동사구)',
      scaleAxisLabel: '주목을 끌다 ➔ 입소문을 타다 ➔ 하룻밤 새 폭발적 화제가 되다',
      weak: {
        expr: "capture viewers' attention",
        pron: '[캡처 뷰어즈 어텐션]',
        ko: '시청자들의 시선·주목을 끌다',
        note: '흥미로운 도입부나 주제로 사람들의 관심을 모으는 단계',
      },
      medium: {
        expr: 'gain word-of-mouth popularity',
        pron: '[게인 워드오브마우쓰 파퓰래러티]',
        ko: '입소문을 통해 인기를 얻다',
        note: '시청자들의 자발적인 추천으로 인기가 꾸준히 확산되는 단계',
      },
      strong: {
        expr: 'go viral overnight',
        pron: '[고우 바이럴 오버나이트]',
        ko: '하룻밤 사이에 폭발적인 화제가 되다',
        note: 'SNS와 알고리즘을 타고 단기간에 폭발적으로 퍼져 나가는 단계',
      },
    },
    {
      conceptTitle: '의견·분석의 정확도와 설득력 단계 (동사구)',
      scaleAxisLabel: '일리 있는 말을 하다 ➔ 핵심 요지를 짚다 ➔ 정곡을 정확히 찌르다',
      weak: {
        expr: 'make a fair point',
        pron: '[메이커 페어 포인트]',
        ko: '타당하고 일리 있는 지적을 하다',
        note: '상대방의 의견이 수긍할 만할 때 쓰는 기본 표현',
      },
      medium: {
        expr: 'capture the main idea',
        pron: '[캡처 더 메인 아이디어]',
        ko: '핵심 요지를 정확히 포착하다',
        note: '전체 내용의 줄기와 중심 생각을 잘 짚어냈을 때',
      },
      strong: {
        expr: 'hit the nail on the head',
        pron: '[힛 더 네일 안 더 헤드]',
        ko: '문제의 정곡(핵심)을 정확히 찌르다',
        note: '가장 본질적인 핵심을 한 치의 오차도 없이 정확히 짚어냈을 때',
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
      soundMethod: 'viral의 첫 모음은 [비]가 아닌 이중모음 /aɪ/[바이럴]로 발음합니다.',
      soundBlock: 'go viral / overnight',
      meaning: '(영상·소식이) 입소문을 타고 빠르게 확산되다, 화제가 되다',
      enDef: 'to spread rapidly and widely from one Internet user to another',
      exampleBlank: 'Short videos can _____ overnight on social media.',
      pos: 'V',
      posLabel: '동사+형용사보어 (V+SC)',
      comp: 'V',
      compLabel: '2형식 동사구 (go + viral)',
      roleDesc: '변화를 나타내는 2형식 연결동사 go(V) 뒤에 형용사 주격보어 viral(SC)이 결합된 구문입니다.',
      collocation: 'go viral overnight',
      collocationKo: '하룻밤 사이에 폭발적인 화제가 되다',
      paraphraseTip: '과거 시제로 쓸 때는 went viral 형태로 활용합니다.',
    },
{
      id: 402,
      type: '오픽·구동사',
      recommendLevel: 'beginner',
      word: 'binge-watch',
      masked: 'b____-w____',
      ipa: '/ˈbɪndʒ.wɑːtʃ/',
      pron: '[빈지워치]',
      soundMethod: 'binge[빈지]와 watch[워치]를 한 단어처럼 이어 발음합니다.',
      soundBlock: 'binge-watch / the entire season',
      meaning: '(드라마·영상을) 몰아 보다, 정주행하다',
      enDef: 'to watch multiple episodes of a television program in rapid succession',
      exampleBlank: 'We can _____ the entire season this weekend.',
      pos: 'V',
      posLabel: '복합동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 목적어(the entire season)를 바로 취하는 3형식 본동사(V)입니다.',
      collocation: 'binge-watch the whole series',
      collocationKo: '시리즈 전체를 몰아서 정주행하다',
      paraphraseTip: '명사형으로 "정주행, 몰아보기"를 뜻할 때는 binge-watching이라고 씁니다.',
    },
    {
      id: 403,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'live up to the hype',
      masked: 'l___ u_ t_ the h___',
      ipa: '/lɪv ʌp tə ðə haɪp/',
      pron: '[리브 업 투 더 하입] (빠른 연음 근사: [리법 투 더 하입])',
      soundMethod: 'IPA(/lɪv ʌp tə ðə haɪp/)와 원어민 음성을 우선 기준으로 삼되, 빠르게 이어 말할 때는 live와 up이 연음됩니다.',
      soundBlock: 'live up / to the hype',
      meaning: '사전의 떠들썩한 소문·기대만큼 실제로도 훌륭하다',
      enDef: 'to be as good or exciting as people expected based on strong publicity',
      exampleBlank: 'Did the new movie really _____?',
      pos: 'V',
      posLabel: '구동사 표현 (V)',
      comp: 'V',
      compLabel: '동사구 + 전치사구 보충어',
      roleDesc: '구동사 live up to 뒤에 명사 목적어(the hype)가 결합하여 기대치 충족을 서술합니다.',
      collocation: 'definitely live up to the hype',
      collocationKo: '기대와 소문에 확실히 부응하다',
      paraphraseTip: 'hype는 출시 전의 대대적인 홍보나 떠들썩한 입소문 기대치를 뜻합니다.',
    },
{
      id: 404,
      type: '일상 회화',
      recommendLevel: 'intermediate',
      word: 'hit the nail on the head',
      masked: 'h__ the n___ on the h___',
      ipa: '/hɪt ðə neɪl ɑːn ðə hed/',
      pron: '[힛 더 네일 안 더 헤드]',
      soundMethod: '내용어인 hit, nail, head 세 단어에 강세를 두어 리듬감 있게 발음합니다.',
      soundBlock: 'hit the nail / on the head',
      meaning: '정곡을 찌르다, 핵심을 정확히 짚어내다',
      enDef: 'to describe exactly what is causing a situation or problem',
      exampleBlank: 'Your analysis really _____ during the meeting.',
      pos: 'V',
      posLabel: '관용 동사구 (V+DO+M)',
      comp: 'V',
      compLabel: '관용 서술어구 (V)',
      roleDesc: '망치로 못(nail)의 머리(head)를 정확히 친다는 비유에서 유래한 관용 동사구로, 주어(Your analysis)의 본동사구 역할을 합니다.',
      collocation: 'really hit the nail on the head',
      collocationKo: '문제의 정곡을 정확히 찌르다',
      paraphraseTip: 'hit은 3단 변화(hit - hit - hit)가 동일하므로 과거 시제에서도 형태가 같습니다.',
    },
    {
      id: 405,
      type: '수능·학술',
      recommendLevel: 'intermediate',
      word: 'capture',
      masked: 'cap____',
      ipa: '/ˈkæp.tʃɚ/',
      pron: '[캡처]',
      soundMethod: '첫 음절(cap-)에 강세를 두고 -ture는 [처]로 부드럽게 발음합니다.',
      soundBlock: 'capture / attention',
      meaning: '(관심·시선을) 사로잡다 / (특징·장면을) 포착하다',
      enDef: 'to succeed in getting someone’s attention or interest; to record or express accurately',
      exampleBlank: "The opening scene will _____ viewers' attention right away.",
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: "조동사 will 뒤에서 목적어(viewers' attention)를 취하는 3형식 타동사(V)입니다.",
      collocation: "capture viewers' attention",
      collocationKo: '시청자들의 시선을 사로잡다',
      paraphraseTip: 'catch attention보다 격식 있고 생생하게 관심을 끌 때 쓰는 표현입니다.',
    },
    {
      id: 406,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'resonate',
      masked: 'res_____',
      ipa: '/ˈrez.ə.neɪt/',
      pron: '[레저네이트]',
      soundMethod: '첫 음절(res-)의 s가 유성음 /z/[레저-]로 소리 나며 마지막 음절은 [-네이트]로 읽습니다.',
      soundBlock: 'resonate / with the audience',
      meaning: '(깊은 공감·울림을) 불러일으키다, 공명하다',
      enDef: 'to evoke a feeling of shared emotion or belief; to have special meaning for someone',
      exampleBlank: 'Authentic stories deeply _____ with the audience.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주로 전치사구 보충어(with + 대상)와 함께 쓰여 누구에게 깊은 공감을 주는지 나타내는 자동사(V)입니다.',
      collocation: 'deeply resonate with the audience',
      collocationKo: '청중·시청자에게 깊은 공감을 불러일으키다',
      paraphraseTip: '타동사처럼 resonate the audience로 쓰지 않고 반드시 전치사 with와 함께 씁니다.',
    },
    {
      id: 407,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'informative',
      masked: 'inf________',
      ipa: '/ɪnˈfɔːr.mə.t̬ɪv/',
      pron: '[인포머티브]',
      soundMethod: '두 번째 음절(-for-)에 강세를 두어 [인포머티브]로 발음합니다.',
      soundBlock: 'deeply / informative',
      meaning: '유익한 정보를 주는, 교육적인',
      enDef: 'providing useful or interesting information',
      exampleBlank: 'This documentary is both entertaining and deeply _____.',
      pos: 'Adj',
      posLabel: '형용사 (Adj)',
      comp: 'SC',
      compLabel: '주격보어 (SC)',
      roleDesc: '2형식 동사 is 뒤에서 주어(The review / This documentary)의 성질을 설명하는 주격보어(SC) 형용사입니다.',
      collocation: 'a deeply informative review',
      collocationKo: '내용이 매우 유익한 리뷰',
      paraphraseTip: '2형식 보어 자리이므로 부사(informatively)가 아닌 형용사 informative를 써야 합니다.',
    },
  ],
  sentences: [
    {
      id: 4001,
      levelTag: 'beginner',
      tag: '초급 필수 · 화제의 영상 & 시리즈 정주행',
      targetWord: 'go viral',
      wordOrderFormula: 'The short clip[S] + went[V] + viral[SC] + overnight[M], + so[Conj] + I[S] + binge-watched[V] + the whole series[DO].',
      structure: '2형식 절(S+V+SC) + 등위접속사(, so) + 3형식 절(S+V+DO)',
      soundBlockEn: 'The short clip went viral overnight, / so I binge-watched / the whole series.',
      soundMethodGuide: 'overnight 뒤 쉼표에서 살짝 끊어 읽고 so I binge-watched the whole series를 연결합니다.',
      ipaLine: '/ðə ʃɔːrt klɪp went ˈvaɪ.rəl ˌoʊ.vɚˈnaɪt, soʊ aɪ ˈbɪndʒ.wɑːtʃt ðə hoʊl ˈsɪr.iːz/',
      koLine: '그 짧은 영상이 하룻밤 사이에 화제가 되어서, / 그래서 나는 몰아서 정주행했다 / 시리즈 전체를.',
      enLine: 'The short clip went viral overnight, / so I binge-watched / the whole series.',
      rawEn: 'The short clip went viral overnight, so I binge-watched the whole series.',
      pronLine: '[더 쇼트 클립 웬트 바이럴 오버나이트, / 소 아이 빈지워치트 / 더 홀 시리즈]',
      naturalKo: '그 짧은 영상이 하룻밤 사이에 화제가 되어서, 나는 시리즈 전체를 몰아서 정주행했다.',
      paraphraseVersion: 'Because the short video spread rapidly overnight, I watched all episodes of the series at once.',
      grammarPoint: 'went는 2형식 연결동사로 쓰여 뒤에 형용사 보어 viral(SC)을 취하며, 두 개의 독립된 절을 등위접속사 so로 연결할 때는 앞에 쉼표(, so)를 찍습니다.',
      contextNuance: '주말에 본 유튜브나 넷플릭스 작품 이야기를 꺼낼 때 자연스럽게 쓸 수 있는 문장입니다.',
    },
    {
      id: 4002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 기대치 충족 평가 (live up to)',
      targetWord: 'live up to the hype',
      wordOrderFormula: 'The new series[S] + definitely[M] + lived up[V] + to the hype[M:전치사구 보충어].',
      structure: '구동사(live up to) + 명사구 보충어(the hype)',
      soundBlockEn: 'The new series / definitely lived up / to the hype.',
      soundMethodGuide: 'definitely lived up까지 리듬감 있게 읽고 to the hype를 명확히 발음합니다.',
      ipaLine: '/ðə nuː ˈsɪr.iːz ˈdef.ə.nət.li lɪvd ʌp tə ðə haɪp/',
      koLine: '그 새 시리즈는 / 확실히 부응했다(도달했다) / 사전의 떠들썩한 기대(소문)에.',
      enLine: 'The new series / definitely lived up / to the hype.',
      rawEn: 'The new series definitely lived up to the hype.',
      pronLine: '[더 뉴 시리즈 / 데피니틀리 리브드 업 투 더 하입]',
      naturalKo: '그 새 시리즈는 사전의 높은 기대(소문)에 확실히 부응했다.',
      paraphraseVersion: 'The new series truly met everyone’s high expectations.',
      grammarPoint: 'to the hype는 동사구 lived up의 의미를 완성하는 전치사구 보충어(Complement)입니다.',
      contextNuance: '영화·드라마·신제품·맛집이 소문만큼 만족스러웠다고 추천할 때 쓰는 표현입니다.',
    },
    {
      id: 4003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 2형식 형용사 보어 & 전치사구 보충어(resonate with)',
      targetWord: 'resonate',
      wordOrderFormula: 'The review[S] + is[V] + deeply[M] + informative[SC], + so[Conj] + it[S] + resonates[V] + with the audience[M:보충어].',
      structure: '2형식 절(S+V+SC) + 등위접속사(, so) + 1형식 자동사 + 전치사구 보충어(with ~)',
      soundBlockEn: 'The review is deeply informative, / so it resonates / with the audience.',
      soundMethodGuide: 'informative 뒤에서 호흡을 고르고 so it resonates with the audience를 부드럽게 이어 읽습니다.',
      ipaLine: '/ðə rɪˈvjuː ɪz ˈdiːp.li ɪnˈfɔːr.mə.t̬ɪv, soʊ ɪt ˈrez.ə.neɪts wɪð ði ˈɔː.di.əns/',
      koLine: '그 리뷰는 내용이 매우 유익해서, / 그래서 그것은 깊은 공감을 불러일으킨다 / 시청자들과.',
      enLine: 'The review is deeply informative, / so it resonates / with the audience.',
      rawEn: 'The review is deeply informative, so it resonates with the audience.',
      pronLine: '[더 리뷰 이즈 디플리 인포머티브, / 소 잇 레저네이츠 / 위드 디 오디언스]',
      naturalKo: '그 리뷰는 내용이 매우 유익해서, 시청자들에게 깊은 공감을 불러일으킨다.',
      paraphraseVersion: 'Because the review provides rich insights, it evokes strong empathy from viewers.',
      grammarPoint: '부사 deeply는 형용사 주격보어 informative(SC)를 수식하며, 뒷절의 자동사 resonates는 공명 대상을 나타내는 전치사구 보충어(with the audience)와 결합합니다.',
      contextNuance: '콘텐츠나 도서·강연의 가치를 품격 있게 분석할 때 활용하기 좋은 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'binge-watch',
      ipa: '/ˈbɪndʒ.wɑːtʃ/',
      options: [
        '(드라마·영상을) 몰아 보다, 정주행하다',
        '영화관 예매표를 환불하다',
        '예고편만 짧게 건너뛰며 보다',
        '자막 없이 뉴스를 청취하다',
      ],
      answerIdx: 0,
      explanation: 'binge-watch는 드라마나 영상 시리즈의 여러 편을 한꺼번에 연속해서 몰아 보는 것(정주행)을 뜻합니다.',
    },
    intermediate: {
      sentenceBefore: 'Everyone praised the new film, and it definitely',
      sentenceAfter: 'when I watched it in theaters.',
      hint: '사전의 떠들썩한 소문·기대만큼 실제로도 훌륭했다',
      options: [
        'fell behind schedule',
        'ran out of time',
        'lived up to the hype',
        'missed the point',
      ],
      answerIdx: 2,
      explanation: '모두가 극찬했던 새 영화가 실제로 보았을 때도 기대와 소문에 부응했다는 문맥이므로 lived up to the hype가 정답입니다.',
    },
    advanced: {
      questionPrompt:
        '다음 문장의 빈칸 (A)와 (B)에 들어갈 어법상 올바른 형태를 2개 고르세요: "The documentary is deeply [ (A) ], so it [ (B) ] the audience."',
      highlightWord: '2형식 주격보어(SC) 형용사 informative & 자동사 resonates with 결합',
      options: [
        '(A) informatively (부사 — 주격보어 불가)',
        '(A) informative (형용사 주격보어)',
        '(B) resonates (전치사 누락 — 오답)',
        '(B) resonates with (자동사 + 전치사 결합)',
      ],
      answerIndices: [1, 3],
      explanation:
        '(A) 2형식 동사 is 뒤에서 주어(The documentary)의 상태를 설명하는 주격보어(SC) 자리이므로 부사 deeply의 수식을 받는 형용사 informative가 맞습니다. (B) resonate는 자동사이므로 대상 앞에 전치사 with를 붙여 resonates with the audience로 써야 합니다.',
    },
    writingMission: {
      koPrompt: '그 리뷰는 내용이 매우 유익해서, 시청자들에게 깊은 공감을 불러일으킨다.',
      targetPattern: 'The review is deeply informative, so it resonates with ~.',
      modelAnswer: 'The review is deeply informative, so it resonates with the audience.',
    },
  },
};

export const THEME_FASHION_EDITORIAL: ThemeData = {
  id: 'theme-fashion-editorial',
  badge: '👗 패션 · 매거진 · 스타일링',
  title: '매장 피팅 · 옷장 기본템 & 브랜드 헤리티지 미학 묘사',
  subtitle: '입어보기(try on), 옷장 기본템(wardrobe staple), 스타일 소화(pull off), 미학적 조화(blend A with B)',
  levelTracks: {
    beginner: {
      levelName: '🌱 초급 (매장에서 사이즈 입어보기 & 잘 어울리는 코디)',
      focusBadge: '이어동사 try on & go really well with ~',
      speedGuide: '권장 리딩 속도: 0.30x(초저속) ~ 0.50x(천천히) 배속으로 끊어 읽기',
      levelGuide: '오프라인 매장에서 옷이나 신발을 착용해 볼 때와 어울리는 아이템을 칭찬할 때 쓰는 표현입니다.',
      patternEn: 'Can I try on this jacket in a medium?',
      patternIpa: '/kæn aɪ traɪ ɑːn ðɪs ˈdʒæk.ɪt ɪn ə ˈmiː.di.əm/',
      patternPron: '[캐나이 트라이 안 / 디스 재킷 / 이너 미디엄]',
      patternSoundBlock: 'Can I try on / this jacket / in a medium?',
      patternSoundRule: 'Can I를 [캐나이]로, in a를 [이너]로 연음하고 try on과 medium에 강세를 줍니다.',
      patternMeaningKo: '이 재킷을 미디엄(M) 사이즈로 한 번 입어봐도 될까요?',
      grammarSummary: '조동사 Can + 주어(I) + 타동사구(try on) + 직접목적어(this jacket) + 사이즈 전치사구(in a medium)로 이루어진 의문문입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'wear this jacket to check the size (사이즈 확인을 위해 이 재킷을 입다)',
          upgradedExpr: 'try on this jacket in a medium (이 재킷을 미디엄 사이즈로 피팅해 보다)',
          nuanceDiff: '구매 전에 옷이나 신발이 맞는지 시험 삼아 입어볼 때는 wear 대신 try on을 씁니다.',
        },
        {
          basicExpr: 'looks good with your jeans (청바지와 잘 어울려 보인다)',
          upgradedExpr: 'goes really well with your denim jeans (청바지와 정말 잘 어울린다)',
          nuanceDiff: '옷·가방·색상이 서로 조화롭게 어울릴 때 go well with ~를 씁니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '고객 (Shopper)',
          en: 'Excuse me, can I try on this jacket in a medium?',
          soundBlock: 'Excuse me, / can I try on this jacket / in a medium?',
          pron: '[익스큐즈 미, 캐나이 트라이 안 디스 재킷 이너 미디엄]',
          ko: '실례합니다, 이 재킷 미디엄 사이즈로 입어볼 수 있을까요?',
          pointNote: 'try on ~ in a medium (미디엄 사이즈로 입어보다)',
        },
        {
          speaker: 'B',
          roleName: '매장 스태프 (Stylist)',
          en: 'Of course! That tailored blazer is a timeless wardrobe staple and goes really well with jeans.',
          soundBlock: 'Of course! / That tailored blazer is a timeless wardrobe staple / and goes really well with jeans.',
          pron: '[오브 코스! 댓 테일러드 블레이저 이즈 어 타임리스 워드로브 스테이플 앤 고우즈 릴리 웰 위드 진즈]',
          ko: '물론이죠! 그 테일러드 블레이저는 유행을 타지 않는 옷장 필수 기본템이라 청바지와도 정말 잘 어울립니다.',
          pointNote: 'a timeless wardrobe staple (유행을 타지 않는 옷장 필수 기본템)',
        },
      ],
    },
    intermediate: {
      levelName: '🌿 중급 (까다로운 스타일 소화하기 & 실루엣 보완)',
      focusBadge: '구동사 pull off & 타동사 complement(보완하다)',
      speedGuide: '권장 리딩 속도: 0.75x(연음·중저속) ~ 1.0x(원어민 정속)',
      levelGuide: '소화하기 쉽지 않은 과감한 룩을 멋지게 소화했을 때(pull off)와 아이템 간의 조화(complement)를 표현합니다.',
      patternEn: 'You really pulled off that bold statement piece!',
      patternIpa: '/ju ˈriː.ə.li pʊld ɔːf ðæt boʊld ˈsteɪt.mənt piːs/',
      patternPron: '[유 릴리 풀드 오프 / 댓 볼드 스테이트먼트 피스]',
      patternSoundBlock: 'You really pulled off / that bold statement piece!',
      patternSoundRule: 'really(/ˈriː.ə.li/)와 pulled off[풀드 오프]에 강세를 실어 생동감 있게 칭찬합니다.',
      patternMeaningKo: '그 과감한 포인트 아이템을 정말 멋지게 소화해 내셨네요!',
      grammarSummary: '주어(You) + 부사(really) + 타동사구(pulled off) + 직접목적어(that bold statement piece)로 이루어진 3형식 문장입니다.',
      paraphraseDrill: [
        {
          basicExpr: 'wore that difficult style very well (그 어려운 스타일을 아주 잘 입었다)',
          upgradedExpr: 'really pulled off that bold look (그 과감한 룩을 정말 멋지게 소화해 냈다)',
          nuanceDiff: 'pull off는 아무나 어울리기 힘든 과감한 색상이나 디자인을 성공적으로 소화했을 때 쓰는 표현입니다.',
        },
        {
          basicExpr: 'makes the simple outfit look better (심플한 코디를 더 돋보이게 만든다)',
          upgradedExpr: 'nicely complements the minimalist silhouette (미니멀한 실루엣을 멋지게 보완해 돋보이게 한다)',
          nuanceDiff: '서로 부족한 점을 채워 완벽한 조화를 이룰 때 타동사 complement(철자 e)를 씁니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '동료 (Friend)',
          en: 'You really pulled off that bold statement piece today!',
          soundBlock: 'You really pulled off / that bold statement piece today!',
          pron: '[유 릴리 풀드 오프 댓 볼드 스테이트먼트 피스 투데이]',
          ko: '오늘 그 과감한 포인트 아이템을 정말 멋지게 소화했네!',
          pointNote: 'pull off ~ (까다로운 스타일을 멋지게 소화하다)',
        },
        {
          speaker: 'B',
          roleName: '화자 (Speaker)',
          en: 'Thanks! I wanted a piece that complements a minimalist silhouette.',
          soundBlock: 'Thanks! / I wanted a piece / that complements a minimalist silhouette.',
          pron: '[땡스! 아이 원티드 어 피스 댓 캄플러먼츠 어 미니멀리스트 실루엣]',
          ko: '고마워! 미니멀한 실루엣을 돋보이게 보완해 줄 아이템을 매치하고 싶었거든.',
          pointNote: 'complement (보완하다·돋보이게 하다)',
        },
      ],
    },
    advanced: {
      levelName: '🌳 고급 (브랜드 헤리티지와 현대적 미학의 조화 묘사)',
      focusBadge: '타동사+전치사구 보충어 blend A with B & 명사 aesthetic',
      speedGuide: '권장 리딩 속도: 1.0x(원어민 정속) ~ 1.25x(고급·쾌속)',
      levelGuide: '패션·디자인·건축 리뷰에서 브랜드의 전통(the brand’s heritage)과 현대적 미학(a modern aesthetic)의 결합을 품격 있게 서술합니다.',
      patternEn: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
      patternIpa: '/ðə kəˈlek.ʃən ˈsiːm.ləs.li blendz ðə brændz ˈher.ɪ.t̬ɪdʒ wɪð ə ˈmɑː.dɚn esˈθet̬.ɪk/',
      patternPron: '[더 컬렉션 심리슬리 블렌즈 / 더 브랜즈 헤리티지 / 위더 모던 에스쎄틱]',
      patternSoundBlock: "The collection seamlessly blends / the brand's heritage / with a modern aesthetic.",
      patternSoundRule: 'seamlessly blends[심리슬리 블렌즈]를 매끄럽게 잇고 aesthetic[에스쎄틱]의 θ(/θ/) 무성 마찰음을 살려 발음합니다.',
      patternMeaningKo: '그 컬렉션은 브랜드의 전통(유산)과 현대적인 미학을 조화롭게 결합한다.',
      grammarSummary: "주어(The collection) + 부사 부가어(seamlessly) + 3형식 타동사(blends) + 직접목적어(the brand's heritage) + 전치사구 보충어(with a modern aesthetic)로 구성된 문장입니다.",
      paraphraseDrill: [
        {
          basicExpr: 'mixes the brand’s tradition and modern design well (브랜드의 전통과 현대 디자인을 잘 섞는다)',
          upgradedExpr: "seamlessly blends the brand's heritage with a modern aesthetic (브랜드의 헤리티지와 현대적 미학을 조화롭게 결합한다)",
          nuanceDiff: '무엇의 전통인지(the brand’s heritage) 구체화하고 blend A with B 구문을 사용해 디자인 비평의 완성도를 높입니다.',
        },
        {
          basicExpr: 'looks stylish without trying too hard (너무 애쓰지 않은 듯 세련되어 보인다)',
          upgradedExpr: 'creates an effortlessly chic aesthetic (꾸민 듯 안 꾸민 듯 자연스럽게 세련된 미학을 연출한다)',
          nuanceDiff: '과한 장식 없이 자연스럽고 우아한 스타일을 묘사하는 대표적인 패션 표현입니다.',
        },
      ],
      dialogue: [
        {
          speaker: 'A',
          roleName: '에디터 (Editor)',
          en: 'What stood out to you most about this season’s runway show?',
          soundBlock: 'What stood out to you most / about this season’s runway show?',
          pron: '[왓 스투드 아웃 투 유 모스트 어바웃 디스 시즌즈 런웨이 쇼]',
          ko: '이번 시즌 런웨이 쇼에서 어떤 점이 가장 인상 깊으셨나요?',
          pointNote: 'stand out (두드러지다, 눈에 띄다)',
        },
        {
          speaker: 'B',
          roleName: '디자이너 (Designer)',
          en: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
          soundBlock: "The collection seamlessly blends / the brand's heritage / with a modern aesthetic.",
          pron: '[더 컬렉션 심리슬리 블렌즈 더 브랜즈 헤리티지 위더 모던 에스쎄틱]',
          ko: '이번 컬렉션은 브랜드 고유의 전통과 현대적인 미학을 아주 조화롭게 결합했습니다.',
          pointNote: 'blend A with B (A와 B를 조화롭게 결합하다)',
        },
      ],
    },
  },
  synonymScales: [
    {
      conceptTitle: '스타일과 디자인의 세련미·완성도 단계 (형용사구)',
      scaleAxisLabel: '깔끔하고 단정한 ➔ 꾸안꾸로 세련된 ➔ 한 치의 흠도 없이 완벽히 재단된',
      weak: {
        expr: 'neat and casual',
        pron: '[닛 앤 캐주얼]',
        ko: '깔끔하고 편안한',
        note: '일상에서 단정하고 부담 없이 입기 좋은 기본 스타일',
      },
      medium: {
        expr: 'effortlessly chic',
        pron: '[에포트리스리 시크]',
        ko: '꾸민 듯 안 꾸민 듯 자연스럽게 세련된',
        note: '과하게 힘주지 않으면서도 감각적인 멋이 살아 있는 상태',
      },
      strong: {
        expr: 'impeccably tailored',
        pron: '[임페커블리 테일러드]',
        ko: '한 치의 흠도 없이 완벽하게 재단된',
        note: '수트나 코트의 핏과 마감이 장인 정신으로 완성된 최고급 상태',
      },
    },
    {
      conceptTitle: '아이템의 활용도와 존재감 스펙트럼 (명사구)',
      scaleAxisLabel: '실용적인 기본 아이템 ➔ 유행 타지 않는 옷장 필수템 ➔ 시선을 압도하는 포인트 아이템',
      weak: {
        expr: 'a versatile everyday basic',
        pron: '[어 버서틀 에브리데이 베이직]',
        ko: '다용도로 활용하기 좋은 일상 기본템',
        note: '여러 옷에 무난하게 받쳐 입기 좋은 실용 아이템',
      },
      medium: {
        expr: 'a timeless wardrobe staple',
        pron: '[어 타임리스 워드로브 스테이플]',
        ko: '유행을 타지 않는 옷장 속 필수 기본 아이템',
        note: '트렌치코트·화이트 셔츠처럼 몇 년이 지나도 가치 있는 핵심 기본템',
      },
      strong: {
        expr: 'a bold statement piece',
        pron: '[어 볼드 스테이트먼트 피스]',
        ko: '단숨에 시선을 사로잡는 과감한 포인트 아이템',
        note: '독특한 컬러나 실루엣으로 코디 전체의 인상을 결정짓는 아이템',
      },
    },
  ],
  vocab: [
    {
      id: 501,
      type: '일상 회화',
      recommendLevel: 'beginner',
      word: 'try on',
      masked: 'tr_ o_',
      ipa: '/traɪ ɑːn/',
      pron: '[트라이 안]',
      soundMethod: '미국식 발음에서 on은 /ɑːn/[안]에 가깝게 소리를 열어 발음합니다.',
      soundBlock: 'try on / this jacket',
      meaning: '(옷·신발 등을) 시험 삼아 입어보다, 신어보다',
      enDef: 'to put on an item of clothing to see if it fits or suits you',
      exampleBlank: 'Can I _____ this jacket in a medium?',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 Can 뒤에서 목적어(this jacket)를 취하는 3형식 이어동사(V)입니다.',
      collocation: 'try on a jacket in a medium',
      collocationKo: '재킷을 미디엄 사이즈로 입어보다',
      paraphraseTip: '목적어가 대명사(it/them)일 때는 반드시 try it on 어순으로 사이에 넣어야 합니다.',
    },
    {
      id: 502,
      type: '트렌드·실무',
      recommendLevel: 'beginner',
      word: 'wardrobe staple',
      masked: 'w_______ st____',
      ipa: '/ˈwɔːr.droʊb ˈsteɪ.pəl/',
      pron: '[워드로브 스테이플]',
      soundMethod: 'wardrobe[워드로브]와 staple[스테이플] 각각의 첫 음절에 강세를 줍니다.',
      soundBlock: 'a timeless / wardrobe staple',
      meaning: '옷장 속 필수 기본 아이템',
      enDef: 'an essential item of clothing that forms the foundation of a person’s wardrobe',
      exampleBlank: 'A classic trench coat is a timeless _____.',
      pos: 'N',
      posLabel: '복합명사 (N)',
      comp: 'SC',
      compLabel: '주격보어 (SC)',
      roleDesc: '2형식 동사 is 뒤에서 주어(A classic trench coat)가 무엇인지 정의하는 명사 주격보어(SC)입니다.',
      collocation: 'a timeless wardrobe staple',
      collocationKo: '유행을 타지 않는 옷장 필수 기본템',
      paraphraseTip: 'staple은 원래 주식(쌀·빵)이나 필수품을 뜻하며 패션에서는 사계절 기본 아이템을 가리킵니다.',
    },
    {
      id: 503,
      type: '트렌드·실무',
      recommendLevel: 'intermediate',
      word: 'statement piece',
      masked: 'st_______ p____',
      ipa: '/ˈsteɪt.mənt piːs/',
      pron: '[스테이트먼트 피스]',
      soundMethod: 'statement의 명사 강세를 살려 [스테이트먼트 피스]로 또렷하게 읽습니다.',
      soundBlock: 'a bold / statement piece',
      meaning: '시선을 단숨에 사로잡는 강렬한 포인트 아이템',
      enDef: 'an eye-catching item of clothing or accessory that defines an outfit',
      exampleBlank: 'She added a bold _____ to complete her outfit.',
      pos: 'N',
      posLabel: '복합명사 (N)',
      comp: 'DO',
      compLabel: '직접목적어 (DO)',
      roleDesc: '3형식 타동사 added의 직접목적어(DO) 역할을 하는 핵심 복합명사입니다.',
      collocation: 'add a bold statement piece',
      collocationKo: '과감한 포인트 아이템을 더하다',
      paraphraseTip: '단조로운 기본 코디에 개성과 존재감을 확 살려주는 아이템을 뜻합니다.',
    },
    {
      id: 504,
      type: '오픽·구동사',
      recommendLevel: 'intermediate',
      word: 'pull off',
      masked: 'p___ o__',
      ipa: '/pʊl ɔːf/',
      pron: '[풀 오프]',
      soundMethod: 'pull의 단모음 /ʊ/를 짧게 발음하고 off와 자연스럽게 연결합니다.',
      soundBlock: 'really pull off / that bold look',
      meaning: '(소화하기 까다로운 옷·어려운 일을) 멋지게 소화하다, 해내다',
      enDef: 'to succeed in wearing a difficult style well or achieving something challenging',
      exampleBlank: 'Not everyone can _____ such a bold look.',
      pos: 'V',
      posLabel: '동사구 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '조동사 can 뒤에서 목적어(such a bold look)를 취하는 3형식 타동사구(V)입니다.',
      collocation: 'really pull off that bold look',
      collocationKo: '그 과감한 스타일을 멋지게 소화해 내다',
      paraphraseTip: '평범한 기본템보다는 소화하기 까다로운 디자인이나 과감한 컬러를 잘 어울리게 입었을 때 씁니다.',
    },
    {
      id: 505,
      type: '수능·학술',
      recommendLevel: 'intermediate',
      word: 'complement',
      masked: 'com_______',
      ipa: '/ˈkɑːm.plə.ment/',
      pron: '[캄플러먼트]',
      soundMethod: '첫 음절(com-)을 미국식 /kɑːm/[캄-]으로 열고 동사로 쓰일 때는 끝 음절(-ment)도 분명히 발음합니다.',
      soundBlock: 'complement / the silhouette',
      meaning: '(서로 어울려) 보완하다, 돋보이게 하다',
      enDef: 'to add to something in a way that enhances or improves its qualities',
      exampleBlank: 'These shoes nicely _____ the minimalist silhouette.',
      pos: 'V',
      posLabel: '동사 (V)',
      comp: 'V',
      compLabel: '동사 (V)',
      roleDesc: '주어(These shoes) 뒤에서 목적어(the minimalist silhouette)를 취하는 3형식 타동사(V)입니다.',
      collocation: 'complement the minimalist silhouette',
      collocationKo: '미니멀한 실루엣을 돋보이게 보완하다',
      paraphraseTip: '철자 e(complement: 보완하다)와 철자 i(compliment: 칭찬하다)의 철자·의미 차이를 꼭 구분하세요.',
    },
    {
      id: 506,
      type: '수능·학술',
      recommendLevel: 'advanced',
      word: 'aesthetic',
      masked: 'aes______',
      ipa: '/esˈθet̬.ɪk/',
      pron: '[에스쎄틱]',
      soundMethod: 'th는 된소리 [ㄸ]이 아니라 혀끝을 윗니 사이에 살짝 대고 바람을 내보내는 무성 마찰음 /θ/[쎄]로 발음합니다.',
      soundBlock: 'a modern / aesthetic',
      meaning: '미학, 미적 감각(특유의 아름다움의 스타일) / 미학적인',
      enDef: 'a set of principles underlying the beauty or artistic style of a particular work or brand',
      exampleBlank: "The collection blends the brand's heritage with a modern _____.",
      pos: 'N',
      posLabel: '명사 (N)',
      comp: 'M',
      compLabel: '전치사 목적어 (M)',
      roleDesc: '전치사 with의 목적어로 결합되어 전치사구 보충어(with a modern aesthetic, M)를 완성하는 명사입니다.',
      collocation: 'a clean modern aesthetic',
      collocationKo: '깔끔하고 현대적인 미학(감성)',
      paraphraseTip: '관사(a modern aesthetic)와 함께 단수 가산명사로 쓰이면 특정 브랜드나 작품 고유의 미적 스타일을 뜻합니다.',
    },
    {
      id: 507,
      type: '트렌드·실무',
      recommendLevel: 'advanced',
      word: 'effortlessly chic',
      masked: 'eff_________ ch__',
      ipa: '/ˈef.ɚt.ləs.li ʃiːk/',
      pron: '[에포트리스리 시크]',
      soundMethod: 'chic는 스펠링 ch가 /ʃ/로 소리 나므로 [칙]이 아닌 [시크]로 발음합니다.',
      soundBlock: 'an effortlessly chic / look',
      meaning: '꾸민 듯 안 꾸민 듯 자연스럽게 세련된',
      enDef: 'stylish and sophisticated in a natural way without appearing to have tried too hard',
      exampleBlank: 'She created an _____ look with a simple blazer.',
      pos: 'Adj',
      posLabel: '부사+형용사구 (Adj)',
      comp: 'M',
      compLabel: '수식어 (M)',
      roleDesc: '부사 effortlessly가 형용사 chic를 꾸미고, 이 전체가 명사 look을 수식하는 수식어(M) 역할을 합니다.',
      collocation: 'create an effortlessly chic look',
      collocationKo: '자연스럽게 세련된 룩을 연출하다',
      paraphraseTip: '우리말의 "꾸안꾸(꾸민 듯 안 꾸민 듯 세련됨)"에 가장 정확히 대응하는 영어 표현입니다.',
    },
  ],
  sentences: [
    {
      id: 5001,
      levelTag: 'beginner',
      tag: '초급 필수 · 매장 사이즈 피팅 문의',
      targetWord: 'try on',
      wordOrderFormula: 'Can I[조동사+S] + try on[V] + this jacket[DO] + in a medium[M]?',
      structure: '3형식 이어동사 의문문 (Can + S + V + DO + M)',
      soundBlockEn: 'Can I try on / this jacket / in a medium?',
      soundMethodGuide: 'Can I try on을 부드럽게 연결하고 사이즈를 나타내는 in a medium을 또렷하게 붙입니다.',
      ipaLine: '/kæn aɪ traɪ ɑːn ðɪs ˈdʒæk.ɪt ɪn ə ˈmiː.di.əm/',
      koLine: '제가 입어봐도 될까요 / 이 재킷을 / 미디엄(M) 사이즈로?',
      enLine: 'Can I try on / this jacket / in a medium?',
      rawEn: 'Can I try on this jacket in a medium?',
      pronLine: '[캐나이 트라이 안 / 디스 재킷 / 이너 미디엄]',
      naturalKo: '이 재킷을 미디엄 사이즈로 한 번 입어봐도 될까요?',
      paraphraseVersion: 'Could I check how this jacket fits in a medium size?',
      grammarPoint: '옷·신발의 사이즈나 색상을 지정할 때는 전치사 in(in a medium, in black)을 사용합니다.',
      contextNuance: '해외 쇼핑이나 편집샵 매장에서 원하는 사이즈를 요청할 때 바로 쓰는 표현입니다.',
    },
    {
      id: 5002,
      levelTag: 'intermediate',
      tag: '중급 핵심 · 과감한 포인트 아이템 소화 칭찬',
      targetWord: 'pull off',
      wordOrderFormula: 'You[S] + really[M] + pulled off[V] + that bold statement piece[DO]!',
      structure: '3형식 구동사 문장 (S + 부사 M + 타동사구 V + DO)',
      soundBlockEn: 'You really pulled off / that bold statement piece!',
      soundMethodGuide: 'really pulled off에 강세를 주어 감탄하는 어조로 발음합니다.',
      ipaLine: '/ju ˈriː.ə.li pʊld ɔːf ðæt boʊld ˈsteɪt.mənt piːs/',
      koLine: '당신은 정말 멋지게 소화해 냈군요 / 그 과감한 포인트 아이템을!',
      enLine: 'You really pulled off / that bold statement piece!',
      rawEn: 'You really pulled off that bold statement piece!',
      pronLine: '[유 릴리 풀드 오프 / 댓 볼드 스테이트먼트 피스]',
      naturalKo: '그 과감한 포인트 아이템을 정말 멋지게 소화해 내셨네요!',
      paraphraseVersion: 'That striking statement item looks amazing on you!',
      grammarPoint: 'statement은 명사지만 뒤 명사 piece를 꾸며 어떤 아이템인지 규정하는 복합명사 수식어(M-N)로 기능합니다.',
      contextNuance: '상대방의 독창적이거나 감각적인 패션 스타일링을 칭찬할 때 아주 자연스러운 표현입니다.',
    },
    {
      id: 5003,
      levelTag: 'advanced',
      tag: '고급 마스터 · 브랜드 헤리티지와 현대적 미학의 결합 (blend A with B)',
      targetWord: 'aesthetic',
      wordOrderFormula: "The collection[S] + seamlessly[M:부가어] + blends[V] + the brand's heritage[DO] + with a modern aesthetic[M:전치사구 보충어].",
      structure: '3형식 타동사 + 직접목적어(A) + 전치사구 보충어(with B)',
      soundBlockEn: "The collection seamlessly blends / the brand's heritage / with a modern aesthetic.",
      soundMethodGuide: "seamlessly blends 뒤에서 살짝 끊고 the brand's heritage with a modern aesthetic을 우아하게 연결합니다.",
      ipaLine: '/ðə kəˈlek.ʃən ˈsiːm.ləs.li blendz ðə brændz ˈher.ɪ.t̬ɪdʒ wɪð ə ˈmɑː.dɚn esˈθet̬.ɪk/',
      koLine: '그 컬렉션은 매끄럽게(조화롭게) 결합한다 / 브랜드의 전통(유산)을 / 현대적인 미학과.',
      enLine: "The collection seamlessly blends / the brand's heritage / with a modern aesthetic.",
      rawEn: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
      pronLine: '[더 컬렉션 심리슬리 블렌즈 / 더 브랜즈 헤리티지 / 위더 모던 에스쎄틱]',
      naturalKo: '그 컬렉션은 브랜드의 전통(유산)과 현대적인 미학을 조화롭게 결합한다.',
      paraphraseVersion: "The line harmoniously combines the house's tradition with contemporary design.",
      grammarPoint: 'seamlessly는 동사를 수식하는 선택적 부가어(Adjunct)이고, with a modern aesthetic은 blend A with B 구문에서 동사가 요구하는 전치사구 보충어(Complement)입니다.',
      contextNuance: '패션 매거진 칼럼이나 자동차·제품 디자인 리뷰에서 전통과 혁신의 조화를 묘사할 때 쓰이는 핵심 문장입니다.',
    },
  ],
  quiz: {
    beginner: {
      word: 'try on',
      ipa: '/traɪ ɑːn/',
      options: [
        '세탁소에 수선을 맡기다',
        '(옷·신발 등을) 시험 삼아 입어보다',
        '영수증을 보여주고 환불하다',
        '선물용 포장지를 고르다',
      ],
      answerIdx: 1,
      explanation: 'try on은 옷이나 신발이 잘 맞는지 확인하기 위해 시험 삼아 입어보거나 신어보는 것을 뜻합니다.',
    },
    intermediate: {
      sentenceBefore: 'That vibrant emerald coat is hard to wear, but you really',
      sentenceAfter: 'with confidence!',
      hint: '(소화하기 까다로운 스타일을) 멋지게 소화해 내다',
      options: ['pulled it off', 'put it off', 'called it off', 'turned it down'],
      answerIdx: 0,
      explanation: '소화하기 쉽지 않은 강렬한 코트를 자신감 있게 멋지게 소화해 냈다는 문맥이므로 pulled it off가 정답입니다. (put off: 미루다, call off: 취소하다)',
    },
    advanced: {
      questionPrompt:
        '다음 중 어휘 선택(complement vs compliment)과 동사 수일치가 모두 올바른 문장을 2개 고르세요.',
      highlightWord: 'complement(보완하다) vs compliment(칭찬하다) & 단수 주어 수일치',
      options: [
        "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
        "The collection seamlessly blend the brand's heritage with a modern aesthetic.",
        'These minimalist shoes nicely complement the tailored silhouette.',
        'These minimalist shoes nicely compliment the tailored silhouette.',
      ],
      answerIndices: [0, 2],
      explanation:
        '1번: 단수 주어(The collection)에 맞춰 단수 동사 blends를 쓴 올바른 문장입니다. 3번: 실루엣을 "보완하여 돋보이게 하다"라는 뜻이므로 철자 e를 쓰는 complement가 맞습니다(compliment는 칭찬하다).',
    },
    writingMission: {
      koPrompt: '그 컬렉션은 브랜드의 전통과 현대적인 미학을 조화롭게 결합한다.',
      targetPattern: "The collection seamlessly blends ~ with a modern aesthetic.",
      modelAnswer: "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
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
// 3. 수능독해 · 서술형어법 · 고교내신 3대 마스터 코스 (EXAM_COURSES)
//    - CSAT_MASTER / SCHOOL_INTERNAL 서술형 givenWords 1:1 완전 일치 및 What절 해설 교정
// ============================================================================

export const EXAM_COURSES: ExamMasterCourse[] = [
  {
    id: 'CSAT_MASTER',
    badge: '🎯 트랙 1 · 수능·학술 고난도 구문 독해',
    title: '부정어 도치 · 동명사구 주어 & 추상 학술 지문 패러프레이징',
    shortTabName: '🎯 수능·학술 독해 트랙',
    scheduleGuide: '학습 가이드: 원문 소리블록 직독 ➔ 핵심 구문 변형 비교 ➔ 어법 함정 판별 ➔ 조건 영작',
    targetGoal: '문두 부정어 도치 구문과 복합 동명사구 주어의 수일치 원리를 체화하고 학술 지문의 논리 구조를 파악합니다.',
    coreCurriculum: [
      'Not until ~ 부사절 문두 이동 시 주절 조동사 도치(can we broaden)',
      '복수명사를 거느린 동명사구 주어(Exposing ourselves to viewpoints)의 단수 수일치',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1 · 부정어(Not until) 문두 도치 구문 정복',
        focusPoint: 'Not until 부사절 뒤 주절의 조동사+주어+동사원형(can we broaden) 도치',
        originalPassageEn:
          'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
        originalPassagePron:
          '[낫 언틸 위 스텝 아우러브 아워 컴포트 존 / 캔 위 제뉴인리 브로든 / 아워 퍼스펙티브]',
        originalPassageKo:
          '우리가 안전지대(익숙한 영역)를 벗어나고 나서야 비로소 우리는 진정으로 시야를 넓힐 수 있다.',
        transformedEn:
          'Only when we step out of our comfort zone can we genuinely broaden our perspective.',
        transformedPron:
          '[온리 웬 위 스텝 아우러브 아워 컴포트 존 / 캔 위 제뉴인리 브로든 아워 퍼스펙티브]',
        transformedPoint:
          'Not until ~ 구문은 Only when ~ 구문으로 전환할 수 있으며, 두 경우 모두 주절에서 조동사(can)가 주어(we) 앞으로 도치됩니다.',
        grammarTrapQuestion: {
          prompt:
            'Not until we step out of our comfort zone [ (A) we can / (B) can we ] genuinely broaden our perspective.',
          choiceA: 'we can',
          choiceB: 'can we',
          correctChoice: 'B',
          explanation:
            '부정어구(Not until we step out of our comfort zone)가 강조를 위해 문장 맨 앞으로 이동했으므로, 주절의 주어와 조동사 어순이 도치되어 can we가 되어야 합니다.',
        },
        essayMission: {
          typeBadge: '부정어 도치 서술형',
          koCondition:
            '우리말 뜻("안전지대를 벗어나고 나서야 비로소 우리는 진정으로 시야를 넓힐 수 있다")에 맞게 제시어를 모두 사용하여 도치 구문으로 배열하세요. (we, our 각 2회 사용)',
          givenWords:
            'Not / until / we / step / out / of / our / comfort / zone / can / we / genuinely / broaden / our / perspective.',
          modelAnswerEn:
            'Not until we step out of our comfort zone can we genuinely broaden our perspective.',
          scoringCriteria:
            '1) 부사절 내부는 평서문 어순(we step out of our comfort zone) 유지 2) 주절은 조동사 도치(can we genuinely broaden) 적용',
        },
      },
      {
        stepNum: 2,
        stepTitle: 'STEP 2 · 확증 편향 극복과 동명사구 주어 수일치',
        focusPoint: 'Exposing ourselves to diverse viewpoints(동명사구 S) + 단수 동사 prevents',
        originalPassageEn:
          'Exposing ourselves to diverse viewpoints prevents cognitive rigidity and helps us overcome confirmation bias.',
        originalPassagePron:
          '[익스포징 아워셀브즈 투 다이버스 뷰포인츠 / 프리벤츠 카그너티브 리지더티 / 앤 헬프스 어스 오버컴 컨퍼메이션 바이어스]',
        originalPassageKo:
          '다양한 관점에 우리 자신을 노출시키는 것은 인지적 경직성을 예방하고 우리가 확증 편향을 극복하도록 돕는다.',
        transformedEn:
          'When we actively engage with diverse viewpoints, we can avoid cognitive rigidity caused by confirmation bias.',
        transformedPron:
          '[웬 위 액티블리 인게이지 위드 다이버스 뷰포인츠, 위 캔 어보이드 카그너티브 리지더티 코즈드 바이 컨퍼메이션 바이어스]',
        transformedPoint:
          '원문의 동명사구 주어(Exposing ~)를 조건·시간의 부사절(When we actively engage with ~)로 풀어서 확증 편향이 초래하는 인지적 경직성을 피한다는 인과 관계를 재구성한 문장입니다.',
        grammarTrapQuestion: {
          prompt:
            'Exposing ourselves to diverse viewpoints [ (A) prevent / (B) prevents ] cognitive rigidity.',
          choiceA: 'prevent',
          choiceB: 'prevents',
          correctChoice: 'B',
          explanation:
            '동사 바로 앞에 복수명사(viewpoints)가 위치하지만 문장 전체의 주어는 동명사구(Exposing ourselves ~)이므로 단수 취급하여 prevents를 써야 합니다.',
        },
        essayMission: {
          typeBadge: '동명사구 주어 영작',
          koCondition:
            '우리말 뜻("다양한 관점에 우리 자신을 노출시키는 것은 인지적 경직성을 예방한다")에 맞게 제시어를 모두 배열하세요.',
          givenWords:
            'Exposing / ourselves / to / diverse / viewpoints / prevents / cognitive / rigidity.',
          modelAnswerEn:
            'Exposing ourselves to diverse viewpoints prevents cognitive rigidity.',
          scoringCriteria:
            '1) 동명사구 주어(Exposing ourselves to diverse viewpoints) 어순 완성 2) 단수 동사(prevents) 수일치 확인',
        },
      },
    ],
  },
  {
    id: 'GRAMMAR_ESSAY',
    badge: '✍️ 트랙 2 · 5형식 목적격보어 & 수식어 부사 정밀 판별',
    title: '5형식 상태 보어(OC) vs 동사 수식 부사(M) 완벽 구분 훈련',
    shortTabName: '✍️ 서술형·어법 트랙',
    scheduleGuide: '학습 가이드: 5형식 문장 성분 분해 ➔ 형용사 보어(OC)와 부사(M) 대조 ➔ 서술형 영작',
    targetGoal: '해석이 "~하게"로 같더라도 목적어의 상태를 설명하는 목적격보어(OC)와 동사를 꾸미는 부사(M)를 정확히 구분합니다.',
    coreCurriculum: [
      'make / keep / find + 목적어(DO) + 형용사 목적격보어(OC: feasible, comfortable)',
      '3형식 타동사를 앞에서 꾸미는 방식 부사(M: meticulously, seamlessly)',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1 · 5형식 동사 make의 목적격보어(OC) 품사 판별',
        focusPoint: 'makes + the entire project(DO) + feasible(형용사 OC)',
        originalPassageEn:
          'Streamlining the approval process makes the entire project feasible within the deadline.',
        originalPassagePron:
          '[스트림라이닝 디 어프루벌 프로세스 / 메익스 디 인타이어 프로젝트 피저블 / 위딘 더 데드라인]',
        originalPassageKo:
          '승인 절차를 간소화하는 것은 마감 기한 내에 전체 프로젝트를 실현 가능하게 만든다.',
        transformedEn:
          'By simplifying the approval process, we can keep the project schedule realistic and feasible.',
        transformedPron:
          '[바이 심플리파잉 디 어프루벌 프로세스, 위 캔 킵 더 프로젝트 스케줄 리얼리스틱 앤 피저블]',
        transformedPoint:
          '동명사구 주어를 수단의 전치사구(By -ing)로 전환하고, 5형식 동사 keep + 목적어 + 형용사 보어(realistic and feasible) 구조로 변형한 문장입니다.',
        grammarTrapQuestion: {
          prompt:
            'Streamlining the approval process makes the entire project [ (A) feasible / (B) feasibly ] within the deadline.',
          choiceA: 'feasible',
          choiceB: 'feasibly',
          correctChoice: 'A',
          explanation:
            '우리말로는 "실현 가능하게"라고 해석되지만, 동사 makes가 아니라 목적어(the entire project)가 어떤 상태가 되는지 설명하는 목적격보어(OC) 자리이므로 형용사 feasible이 맞습니다.',
        },
        essayMission: {
          typeBadge: '5형식 구문 서술형',
          koCondition:
            '우리말 뜻("승인 절차를 간소화하는 것은 전체 프로젝트를 실현 가능하게 만든다")에 맞게 제시어를 모두 사용하여 배열하세요.',
          givenWords:
            'Streamlining / the / approval / process / makes / the / entire / project / feasible.',
          modelAnswerEn:
            'Streamlining the approval process makes the entire project feasible.',
          scoringCriteria:
            '1) 동명사구 주어 단수 동사(makes) 결합 2) 목적어 뒤 형용사 보어(feasible) 배치',
        },
      },
    ],
  },
  {
    id: 'SCHOOL_INTERNAL',
    badge: '🏫 트랙 3 · 고교 내신 빈출 명사절(What) & 핵심 구문 변형',
    title: '선행사 포함 관계대명사 What 명사절 주어 & blend A with B 서술형',
    shortTabName: '🏫 고교 내신 트랙',
    scheduleGuide: '학습 가이드: 명사절 주어 구조 분석 ➔ 패러프레이징 비교 ➔ 내신형 조건 영작',
    targetGoal: '내신 서술형 단골 출제 포인트인 선행사 포함 관계대명사 What절 주어와 타동사+전치사구 보충어 구문을 완벽히 익힙니다.',
    coreCurriculum: [
      'What matters most(선행사 포함 관계대명사절 S, What이 matters의 주어) + 단수 동사 is',
      'seamlessly blend A with B 구문을 활용한 서술형 영작',
    ],
    steps: [
      {
        stepNum: 1,
        stepTitle: 'STEP 1 · 선행사 포함 관계대명사 What 명사절 주어와 수일치',
        focusPoint: 'What matters most in sustainable management(명사절 S) + is(단수 V)',
        originalPassageEn:
          "What matters most in sustainable management is harmonizing the brand's heritage with eco-friendly innovation.",
        originalPassagePron:
          '[왓 매터즈 모스트 인 서스테이너블 매니지먼트 / 이즈 하머나이징 더 브랜즈 헤리티지 / 위드 에코프렌들리 이노베이션]',
        originalPassageKo:
          '지속 가능한 경영에서 가장 중요한 것은 브랜드의 전통을 친환경 혁신과 조화시키는 것이다.',
        transformedEn:
          "The essence of sustainable management lies in blending the brand's heritage with eco-friendly innovation.",
        transformedPron:
          '[디 에센스 오브 서스테이너블 매니지먼트 라이즈 인 블렌딩 더 브랜즈 헤리티지 위드 에코프렌들리 이노베이션]',
        transformedPoint:
          'What matters most ~ is -ing 구문을 The essence of ~ lies in -ing(~의 본질은 ~하는 데 있다) 구문으로 패러프레이징한 문장입니다.',
        grammarTrapQuestion: {
          prompt:
            '[ (A) What / (B) That ] matters most in sustainable management is harmonizing the brand’s heritage with innovation.',
          choiceA: 'What',
          choiceB: 'That',
          correctChoice: 'A',
          explanation:
            'What matters most in sustainable management 전체가 문장의 주어인 명사절입니다. 여기서 What은 동사 matters의 주어 역할을 하면서 동시에 선행사를 포함해 "가장 중요한 것(~하는 것)"을 뜻하므로 What이 맞습니다. (접속사 That 뒤에는 주어+동사가 모두 갖춘 완전한 절이 와야 합니다.)',
        },
        essayMission: {
          typeBadge: '내신 서술형 영작',
          koCondition:
            '우리말 뜻("그 컬렉션은 브랜드의 전통과 현대적인 미학을 조화롭게 결합한다")에 맞게 제시어를 모두 그대로 사용하여 문장을 완성하세요.',
          givenWords:
            "The / collection / seamlessly / blends / the / brand's / heritage / with / a / modern / aesthetic.",
          modelAnswerEn:
            "The collection seamlessly blends the brand's heritage with a modern aesthetic.",
          scoringCriteria:
            "1) 부사 seamlessly + 타동사 blends 결합 2) 목적어(the brand's heritage)와 전치사구 보충어(with a modern aesthetic) 어순 정확성",
        },
      },
    ],
  },
];

// ============================================================================
// 4. STEP 3 다이어그램 정밀 분석용 사전 검증 토큰 맵 (VERIFIED_SENTENCE_TOKEN_MAP)
//    & 미등록 문장용 문맥 규칙 기반 추정 분석기 (buildDynamicDiagramSentence)
// ============================================================================

const VERIFIED_SENTENCE_TOKEN_MAP: Record<string, DiagramSentence> = {
  'thanks for giving me a quick heads-up on the schedule.': DIAGRAM_EXAMPLES[1],
  'streamlining the workflow makes the tentative schedule feasible.':
    DIAGRAM_EXAMPLES[0],
  "the collection seamlessly blends the brand's heritage with a modern aesthetic.":
    DIAGRAM_EXAMPLES[2],
  'could you please expedite the approval process before friday?': {
    title: '중급 핵심 · 승인 절차 가속화 요청 (3형식 의문문)',
    rawEn: 'Could you please expedite the approval process before Friday?',
    naturalKo: '금요일 전까지 승인 절차를 좀 더 신속히 진행해 주실 수 있을까요?',
    skeleton:
      'Could[조동사] + you[S] + please[M] + expedite[V] + the approval process[DO] + before Friday[M:부가어]?',
    patternType: '3형식 의문문 (Could + S + V + DO + 시간 부가어 M)',
    wordOrderTip:
      'approval은 명사(N)이지만 뒤 명사 process를 앞에서 꾸며주는 복합명사 수식어(M-N) 역할을 하며, before Friday는 시간 정보를 덧붙이는 전치사구 부가어(Adjunct)입니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Could',
        comp: 'V',
        compLabel: '조동사 (V)',
        pos: 'V',
        posLabel: '조동사 (V)',
        meaning: '~해 주실 수 있을까요',
        roleExplanation: '정중한 요청 의문문을 여는 조동사입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'you',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'Pron',
        posLabel: '대명사 (Pron)',
        meaning: '당신이',
        roleExplanation: '문장의 주어(S)인 인칭대명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'please',
        comp: 'M',
        compLabel: '부가어 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '부디, 제발',
        roleExplanation: '정중한 어조를 더하는 부사(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'expedite',
        comp: 'V',
        compLabel: '본동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '신속히 진행하다',
        roleExplanation: '목적어(the approval process)를 취하는 3형식 본동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'the',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '그',
        roleExplanation: '명사구 approval process를 한정하는 정관사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'approval',
        comp: 'M',
        compLabel: '명사수식어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '승인',
        roleExplanation: '뒤 명사 process의 종류를 수식하는 복합명사 수식어(M-N)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'process',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '절차를',
        roleExplanation: '타동사 expedite의 직접목적어(DO) 핵심 명사입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
      {
        word: 'before',
        comp: 'M',
        compLabel: '전치사 부가어 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~ 전에',
        roleExplanation: '시간 부가어 전치사구(before Friday)를 이끄는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'Friday?',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '금요일',
        roleExplanation: '전치사 before의 목적어로 쓰인 고유명사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
  'this quiet cafe is my go-to spot on weekends.': {
    title: '초급 필수 · 2형식 명사구 주격보어(SC)',
    rawEn: 'This quiet cafe is my go-to spot on weekends.',
    naturalKo: '이 조용한 카페는 내가 주말마다 늘 믿고 찾는 단골 장소이다.',
    skeleton: 'This quiet cafe[S] + is[V] + my go-to spot[SC] + on weekends[M:부가어].',
    patternType: '2형식 (S + 연결동사 V + 명사구 SC + 시간 부가어 M)',
    wordOrderTip:
      'is 뒤의 my go-to spot은 주어(This quiet cafe)와 동격 관계를 이루는 명사구 주격보어(SC)입니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'This',
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '이',
        roleExplanation: '주어 명사 cafe를 가리키는 지시한정사(Det)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'quiet',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '조용한',
        roleExplanation: '명사 cafe를 꾸미는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'cafe',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '카페는',
        roleExplanation: '문장의 단수 주어(S) 핵심 명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'is',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '~이다',
        roleExplanation: '주어와 주격보어를 이어주는 2형식 연결동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'my',
        comp: 'M',
        compLabel: '소유한정 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '나의',
        roleExplanation: '보어 명사 spot을 한정하는 소유격 한정사(Det)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'go-to',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '늘 믿고 찾는(단골의)',
        roleExplanation: '명사 spot을 수식하는 복합형용사(Adj)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'spot',
        comp: 'SC',
        compLabel: '주격보어 (SC)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '장소(이다)',
        roleExplanation: '주어(cafe)의 정체를 설명하는 주격보어(SC) 핵심 명사입니다.',
        colorClass: 'border-amber-600 text-amber-800',
      },
      {
        word: 'on',
        comp: 'M',
        compLabel: '전치사 부가어 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~마다',
        roleExplanation: '시간 부가어(on weekends)를 이끄는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'weekends.',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '주말',
        roleExplanation: '전치사 on의 목적어로 결합되어 시간 부가어(Adjunct)를 완성합니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
  'i always stick to my daily workout routine to clear my head.': {
    title: '중급 핵심 · 전치사구 보충어(stick to) & 목적의 to부정사 부가어',
    rawEn: 'I always stick to my daily workout routine to clear my head.',
    naturalKo: '나는 복잡한 머리를 식히기 위해 항상 매일의 운동 루틴을 지킨다.',
    skeleton:
      'I[S] + always[M] + stick[V] + to my daily workout routine[M:전치사구 보충어] + to clear my head[M:to부정사 부가어].',
    patternType: '1형식 자동사 + 전치사구 보충어(Complement) + 목적 부가어(Adjunct)',
    wordOrderTip:
      '앞의 to my daily workout routine은 동사 stick이 요구하는 전치사구 보충어(Complement)이고, 뒤의 to clear my head는 목적(~하기 위해)을 덧붙이는 to부정사 부가어(Adjunct)입니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'I',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'Pron',
        posLabel: '대명사 (Pron)',
        meaning: '나는',
        roleExplanation: '문장의 주어(S)인 1인칭 대명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'always',
        comp: 'M',
        compLabel: '빈도부사 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '항상',
        roleExplanation: '일반동사 stick 앞에서 빈도를 나타내는 부사 부가어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'stick',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '고수하다, 지키다',
        roleExplanation: '전치사구 보충어(to + 명사구)를 요구하는 동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'to',
        comp: 'M',
        compLabel: '전치사 보충어 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~을(에)',
        roleExplanation: '동사 stick과 밀접하게 결합해 대상 명사구를 연결하는 전치사(보충어 이끌기)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'my',
        comp: 'M',
        compLabel: '소유한정 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '나의',
        roleExplanation: '명사 routine을 한정하는 소유격 한정사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'daily',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '매일의',
        roleExplanation: '뒤 명사구를 꾸미는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'workout',
        comp: 'M',
        compLabel: '명사수식어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '운동',
        roleExplanation: '명사 routine의 종류를 설명하는 복합명사 수식어(M-N)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'routine',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '루틴을',
        roleExplanation: '전치사 to의 목적어로 결합되어 전치사구 보충어(to my daily workout routine)를 완성합니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'to',
        comp: 'M',
        compLabel: 'to부정사 표지 (M)',
        pos: 'Prep',
        posLabel: '부정사 표지 (to)',
        meaning: '~하기 위해',
        roleExplanation: '뒤에 동사원형(clear)을 이끌어 목적의 부사구(Adjunct)를 만드는 to부정사 표지입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'clear',
        comp: 'M',
        compLabel: '준동사 (M)',
        pos: 'V',
        posLabel: '동사원형 (V)',
        meaning: '맑게 식히다',
        roleExplanation: 'to부정사구 내부에서 목적어(my head)를 취하는 동사원형입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'my',
        comp: 'M',
        compLabel: '소유한정 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '나의',
        roleExplanation: '명사 head를 한정하는 소유격 한정사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
{
        word: 'head.',
        comp: 'M',
        compLabel: '부사구 내부 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '머리를',
        roleExplanation: '부사적 to부정사(to clear)의 내부 목적어로 결합되어 목적 부사구(M)를 완성합니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
  'reading diverse texts broadens our perspective on life.': {
    title: '고급 마스터 · 동명사구 주어(Reading ~) & 단수 동사 수일치',
    rawEn: 'Reading diverse texts broadens our perspective on life.',
    naturalKo: '다양한 글을 읽는 것은 삶에 대한 우리의 시야를 넓혀준다.',
    skeleton: 'Reading diverse texts[S:동명사구] + broadens[V] + our perspective[DO] + on life[M].',
    patternType: '3형식 (동명사구 S + 단수 V + DO + 전치사구 M)',
    wordOrderTip:
      '복수명사 texts는 동명사 Reading의 목적어일 뿐이며, 문장 전체의 주어는 Reading diverse texts(단수 행위)이므로 단수 동사 broadens를 씁니다.',
    isHeuristic: false,
    tokens: [
      {
        word: 'Reading',
        comp: 'S',
        compLabel: '주어 (S)',
        pos: 'N',
        posLabel: '동명사 (N역할)',
        meaning: '읽는 것은',
        roleExplanation: '문장 전체의 주어(S) 중심이 되는 동명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'diverse',
        comp: 'M',
        compLabel: '수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '다양한',
        roleExplanation: '명사 texts를 수식하는 형용사(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
{
        word: 'texts',
        comp: 'S',
        compLabel: '주어구 내부 목적어 (S)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '글들을',
        roleExplanation: '동명사 Reading의 목적어로 결합되어 문장 전체의 주어구(S)를 이룹니다.',
        colorClass: 'border-blue-500 text-blue-700',
      },
      {
        word: 'broadens',
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '넓혀준다',
        roleExplanation: '동명사구 주어(단수)에 수일치된 3형식 본동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      },
      {
        word: 'our',
        comp: 'M',
        compLabel: '소유한정 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '우리의',
        roleExplanation: '목적어 명사 perspective를 한정하는 소유격 한정사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'perspective',
        comp: 'DO',
        compLabel: '직접목적어 (DO)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '시야(관점)를',
        roleExplanation: '타동사 broadens의 직접목적어(DO) 핵심 명사입니다.',
        colorClass: 'border-emerald-500 text-emerald-700',
      },
      {
        word: 'on',
        comp: 'M',
        compLabel: '전치사구 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '~에 대한',
        roleExplanation: 'perspective의 대상을 연결하는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
      {
        word: 'life.',
        comp: 'M',
        compLabel: '전치사 목적어 (M)',
        pos: 'N',
        posLabel: '명사 (N)',
        meaning: '삶',
        roleExplanation: '전치사 on의 목적어로 쓰인 명사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      },
    ],
  },
};

const KNOWN_DETERMINERS = new Set([
  'a', 'an', 'the', 'my', 'our', 'your', 'his', 'her', 'its', 'their',
  'this', 'these', 'those', 'every', 'each', 'some', 'any', 'no',
]);

const KNOWN_PRONOUNS = new Set([
  'i', 'we', 'you', 'he', 'she', 'it', 'they', 'me', 'us', 'him', 'her', 'them',
  'myself', 'ourselves', 'yourself', 'themselves', 'everyone', 'everything', 'what', 'which', 'who',
]);

const KNOWN_PREPOSITIONS = new Set([
  'in', 'on', 'at', 'for', 'with', 'by', 'from', 'of', 'into', 'during',
  'before', 'after', 'within', 'without', 'through', 'between', 'across', 'until', 'about', 'regarding',
]);

const KNOWN_CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'so', 'because', 'if', 'although', 'though', 'while', 'when', 'whether', 'that',
]);

const KNOWN_ADVERBS = new Set([
  'always', 'usually', 'often', 'definitely', 'really', 'deeply', 'seamlessly',
  'meticulously', 'effortlessly', 'overnight', 'genuinely', 'naturally', 'mutually',
  'nicely', 'gladly', 'truly', 'impeccably', 'please', 'not', 'only', 'also', 'still', 'again', 'today', 'tomorrow',
]);

const KNOWN_ADJECTIVES = new Set([
  'quick', 'tentative', 'feasible', 'quiet', 'go-to', 'daily', 'diverse',
  'complimentary', 'late', 'possible', 'comfortable', 'short', 'viral',
  'whole', 'entire', 'new', 'informative', 'bold', 'modern', 'classic',
  'minimalist', 'tailored', 'chic', 'versatile', 'timeless', 'cognitive',
  'empirical', 'substantial', 'reasonable', 'cozy', 'unexpected', 'available',
]);

const KNOWN_VERBS = new Set([
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did',
  'make', 'makes', 'made', 'keep', 'keeps', 'kept', 'find', 'found', 'consider',
  'give', 'gives', 'gave', 'giving', 'take', 'takes', 'took', 'go', 'goes', 'went',
  'get', 'gets', 'got', 'streamline', 'streamlines', 'expedite', 'expedites',
  'wrap', 'touch', 'review', 'reviewed', 'stick', 'sticks', 'clear', 'unwind',
  'recharge', 'broaden', 'broadens', 'drop', 'include', 'includes', 'freshen',
  'accommodate', 'binge-watch', 'binge-watched', 'live', 'lived', 'hit', 'hits',
  'capture', 'captures', 'captured', 'resonate', 'resonates', 'try', 'pull', 'pulled',
  'complement', 'complements', 'blend', 'blends', 'use', 'convey', 'step', 'help', 'helps',
  'expose', 'prevents', 'prevent', 'overcome', 'confirm', 'overhaul', 'intend', 'launch',
]);

const LINKING_VERBS = new Set([
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'become', 'becomes', 'became',
  'remain', 'remains', 'look', 'looks', 'sound', 'sounds', 'feel', 'feels', 'went',
]);

const FIVE_PATTERN_VERBS = new Set([
  'make', 'makes', 'made', 'keep', 'keeps', 'kept', 'find', 'found', 'consider', 'considers',
]);

const AUXILIARY_VERBS = new Set([
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did',
]);
export function buildDynamicDiagramSentence(
  rawEnInput: string,
  naturalKoInput?: string,
  tagLabelInput?: string
): DiagramSentence {
  const trimmed = (rawEnInput || '').trim();
  const normKey = trimmed.toLowerCase().replace(/\s+/g, ' ');
  if (VERIFIED_SENTENCE_TOKEN_MAP[normKey]) {
    const matched = VERIFIED_SENTENCE_TOKEN_MAP[normKey];
    return {
      ...matched,
      title: tagLabelInput || matched.title,
      naturalKo: naturalKoInput || matched.naturalKo,
    };
  }

  const rawWords = trimmed ? trimmed.split(/\s+/) : ['Streamlining', 'makes', 'it', 'feasible.'];
  let subjectFound = false;
  let mainVerbFound = false;
  let lastMainVerb = '';
  let inPrepPhrase = false;

  const tokens: DiagramToken[] = rawWords.map((rawWord, idx) => {
    const clean = rawWord.replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, '');
    const lower = clean.toLowerCase();
    const hasClauseBreakPunct = /[,;:.!?]$/.test(rawWord);
    const nextClean =
      idx + 1 < rawWords.length
        ? rawWords[idx + 1].replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase()
        : '';

    // 1. 접속사 (절이 새로 시작되면 주어·본동사·전치사구 상태 리셋)
    if (KNOWN_CONJUNCTIONS.has(lower)) {
      subjectFound = false;
      mainVerbFound = false;
      inPrepPhrase = false;
      return {
        word: rawWord,
        comp: 'M',
        compLabel: '접속사 (M)',
        pos: 'Conj',
        posLabel: '접속사 (Conj)',
        meaning: '연결 접속사',
        roleExplanation: '절과 절 또는 구를 논리적으로 연결하는 접속사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 2. to 처리 (뒤에 동사원형이 오면 to부정사 표지, 명사/한정사가 오면 전치사)
    if (lower === 'to') {
      const isInfinitive = KNOWN_VERBS.has(nextClean) && !KNOWN_DETERMINERS.has(nextClean);
      inPrepPhrase = !isInfinitive;
      return {
        word: rawWord,
        comp: 'M',
        compLabel: isInfinitive ? 'to부정사 표지 (M)' : '전치사 보충/수식 (M)',
        pos: 'Prep',
        posLabel: isInfinitive ? '부정사 표지 (to)' : '전치사 (Prep)',
        meaning: isInfinitive ? '~하기 위해 / ~하는 것' : '~로 / ~에',
        roleExplanation: isInfinitive
          ? '뒤에 동사원형을 이끌어 to부정사구를 만드는 부정사 표지(Infinitival Marker)입니다. (9품사 다이어그램에서는 편의상 Prep 노드에 연결하되 전치사 to와 구분합니다.)'
          : '뒤에 명사구를 이끌어 전치사구(보충어 또는 수식어)를 만드는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 3. 전치사
    if (KNOWN_PREPOSITIONS.has(lower)) {
      inPrepPhrase = true;
      return {
        word: rawWord,
        comp: 'M',
        compLabel: '전치사구 (M)',
        pos: 'Prep',
        posLabel: '전치사 (Prep)',
        meaning: '전치사',
        roleExplanation: '명사구 앞에서 전치사구(보충어 또는 부가어)를 이끄는 전치사입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 4. 한정사
    if (KNOWN_DETERMINERS.has(lower)) {
      return {
        word: rawWord,
        comp: 'M',
        compLabel: '한정수식 (M)',
        pos: 'Det',
        posLabel: '한정사 (Det)',
        meaning: '관사/소유격/지시어',
        roleExplanation: '뒤에 오는 명사의 범위를 한정하는 한정사(Det)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 5. 부사
    if (
      KNOWN_ADVERBS.has(lower) ||
      (lower.endsWith('ly') && !KNOWN_ADJECTIVES.has(lower))
    ) {
      return {
        word: rawWord,
        comp: 'M',
        compLabel: '부사 수식어 (M)',
        pos: 'Adv',
        posLabel: '부사 (Adv)',
        meaning: '방식/빈도/정도 부사',
        roleExplanation: '동사·형용사 또는 문장을 꾸며주는 부사 부가어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 6. 문두 -ing 형태 (콤마가 바로 뒤따르면 분사구문 M, 아니면 동명사 주어 S)
    if (idx === 0 && lower.endsWith('ing')) {
      if (rawWord.endsWith(',')) {
        return {
          word: rawWord,
          comp: 'M',
          compLabel: '분사구문 (M)',
          pos: 'V',
          posLabel: '현재분사 (V)',
          meaning: '~하면서(분사구문)',
          roleExplanation: '문두에서 콤마와 함께 부사구 역할을 하는 분사구문입니다.',
          colorClass: 'border-slate-300 text-slate-600',
        };
      }
      subjectFound = true;
      return {
        word: rawWord,
        comp: 'S',
        compLabel: '동명사 주어 (S)',
        pos: 'N',
        posLabel: '동명사 (N역할)',
        meaning: '~하는 것은',
        roleExplanation: '문장 맨 앞에서 주어(S) 역할을 수행하는 동명사입니다.',
        colorClass: 'border-blue-500 text-blue-700',
      };
    }

    // 7. 동사 (조동사와 본동사를 구분하여 의문문 주어 오분류 방지)
    if (KNOWN_VERBS.has(lower) && !inPrepPhrase) {
      if (AUXILIARY_VERBS.has(lower) && !subjectFound) {
        return {
          word: rawWord,
          comp: 'V',
          compLabel: '조동사 (V)',
          pos: 'V',
          posLabel: '조동사 (V)',
          meaning: '조동사',
          roleExplanation: '의문문이나 도치문에서 주어 앞에 위치한 조동사(V)입니다.',
          colorClass: 'border-rose-500 text-rose-700',
        };
      }
      mainVerbFound = true;
      lastMainVerb = lower;
      return {
        word: rawWord,
        comp: 'V',
        compLabel: '동사 (V)',
        pos: 'V',
        posLabel: '동사 (V)',
        meaning: '서술어 동사',
        roleExplanation: '주어의 동작이나 상태를 서술하는 동사(V)입니다.',
        colorClass: 'border-rose-500 text-rose-700',
      };
    }

    // 8. 형용사
    if (
      KNOWN_ADJECTIVES.has(lower) ||
      (lower.length > 5 &&
        (lower.endsWith('able') ||
          lower.endsWith('ible') ||
          lower.endsWith('ous') ||
          lower.endsWith('ful') ||
          lower.endsWith('less')))
    ) {
      if (mainVerbFound && LINKING_VERBS.has(lastMainVerb) && !inPrepPhrase) {
        return {
          word: rawWord,
          comp: 'SC',
          compLabel: '주격보어 (SC)',
          pos: 'Adj',
          posLabel: '형용사 (Adj)',
          meaning: '주격보어 형용사',
          roleExplanation: '2형식 연결동사 뒤에서 주어의 상태를 보충 설명하는 주격보어(SC)입니다.',
          colorClass: 'border-amber-600 text-amber-800',
        };
      }
      if (
        mainVerbFound &&
        FIVE_PATTERN_VERBS.has(lastMainVerb) &&
        !inPrepPhrase &&
        (idx === rawWords.length - 1 || KNOWN_PREPOSITIONS.has(nextClean))
      ) {
        return {
          word: rawWord,
          comp: 'OC',
          compLabel: '목적격보어 (OC)',
          pos: 'Adj',
          posLabel: '형용사 (Adj)',
          meaning: '목적격보어 형용사',
          roleExplanation: '5형식 동사의 목적어 뒤에서 목적어의 상태를 보충 설명하는 목적격보어(OC)입니다.',
          colorClass: 'border-amber-600 text-amber-800',
        };
      }
      return {
        word: rawWord,
        comp: 'M',
        compLabel: '형용사 수식어 (M)',
        pos: 'Adj',
        posLabel: '형용사 (Adj)',
        meaning: '명사 수식 형용사',
        roleExplanation: '명사의 성질이나 상태를 꾸며주는 형용사 수식어(M)입니다.',
        colorClass: 'border-slate-300 text-slate-600',
      };
    }

    // 9. 대명사 (전치사구 목적어로 쓰인 직후 inPrepPhrase 해제)
    if (KNOWN_PRONOUNS.has(lower)) {
      if (inPrepPhrase) {
        inPrepPhrase = false;
        return {
          word: rawWord,
          comp: 'M',
          compLabel: '전치사 목적어 (M)',
          pos: 'Pron',
          posLabel: '대명사 (Pron)',
          meaning: '대명사',
          roleExplanation: '전치사의 목적어로 결합하여 전치사구를 완성하는 대명사입니다.',
          colorClass: 'border-slate-300 text-slate-600',
        };
      }
      const isSubjectPron =
        !mainVerbFound || ['i', 'we', 'he', 'she', 'they', 'who'].includes(lower);
      if (isSubjectPron) subjectFound = true;
      const compRole: CompId = isSubjectPron ? 'S' : 'DO';
      return {
        word: rawWord,
        comp: compRole,
        compLabel: compRole === 'S' ? '주어 (S)' : '목적어 (DO)',
        pos: 'Pron',
        posLabel: '대명사 (Pron)',
        meaning: '대명사',
        roleExplanation: '명사구를 대신하여 주어·목적어 역할을 수행하는 대명사입니다.',
        colorClass:
          compRole === 'S'
            ? 'border-blue-500 text-blue-700'
            : 'border-emerald-500 text-emerald-700',
      };
    }

    // 10. 기본 명사 판별 (전치사구의 핵심 명사에 도달하면 inPrepPhrase를 해제하여 뒤따르는 본동사 인식 보장)
    let nounComp: CompId = 'DO';
    let nounCompLabel = '직접목적어 (DO)';
    if (inPrepPhrase) {
      nounComp = 'M';
      nounCompLabel = '전치사 목적어 (M)';
      const nextIsAnotherNoun =
        nextClean.length > 0 &&
        !KNOWN_VERBS.has(nextClean) &&
        !KNOWN_PREPOSITIONS.has(nextClean) &&
        !KNOWN_CONJUNCTIONS.has(nextClean) &&
        !KNOWN_ADVERBS.has(nextClean) &&
        !KNOWN_DETERMINERS.has(nextClean);
      if (hasClauseBreakPunct || !nextIsAnotherNoun) {
        inPrepPhrase = false;
      }
    } else if (!mainVerbFound) {
      nounComp = 'S';
      nounCompLabel = '주어 (S)';
      subjectFound = true;
    } else if (LINKING_VERBS.has(lastMainVerb)) {
      nounComp = 'SC';
      nounCompLabel = '주격보어 (SC)';
    }

    return {
      word: rawWord,
      comp: nounComp,
      compLabel: nounCompLabel,
      pos: 'N',
      posLabel: '명사 (N)',
      meaning: '핵심 명사(추정)',
      roleExplanation:
        nounComp === 'S'
          ? '문장의 주체 역할을 하는 주어(S) 명사입니다.'
          : nounComp === 'SC'
          ? '연결동사 뒤에서 주어를 보충 설명하는 주격보어(SC) 명사입니다.'
          : nounComp === 'M'
          ? '전치사와 결합하여 전치사구(보충어/부가어)를 이루는 명사입니다.'
          : '타동사의 대상이 되는 목적어(DO) 명사입니다.',
      colorClass:
        nounComp === 'S'
          ? 'border-blue-500 text-blue-700'
          : nounComp === 'SC'
          ? 'border-amber-600 text-amber-800'
          : nounComp === 'DO'
          ? 'border-emerald-500 text-emerald-700'
          : 'border-slate-300 text-slate-600',
    };
  });

  return {
    title: tagLabelInput || '문맥 규칙 기반 자동 추정 분석 (참고용)',
    rawEn: trimmed,
    naturalKo:
      naturalKoInput ||
      '선택한 문장의 어절별 문장 성분(7직책)과 품사(9신분) 추정 연결도입니다.',
    skeleton: '주어부(S) + 서술어 동사(V) + 목적어/보어(DO/SC/OC) + 보충어/부가어(M)',
    patternType: '문맥 규칙 기반 추정 분석 (복합절·미등록 어휘 주의)',
    wordOrderTip:
      '⚠️ 사전 미등록 문장에 대한 간이 규칙 기반 자동 추정 결과입니다. 복합절이나 미등록 어휘는 실제 문법 성분·품사와 다르게 분류될 수 있으므로 확정적 분석이 아닌 참고용으로만 확인하세요.',
    isHeuristic: true,
    tokens,
  };
}
// ============================================================================
// src/App.tsx — [파트 4/4] 최종 검증 완결본
// - SSR 안전 로컬스토리지 파서(readStorageJson / readStorageString) 및 TS6133 에러 0건 검증
// - 무단어 클릭 시 자동 폴백 발화 & 1~6회 연속 반복 듣기(Loop) 오디오 엔진
// - 4대 AI 통합 허브 (Apple Siri 신경망 음성 · ChatGPT · Gemini · Claude 실시간 API & 1클릭 런처)
// - 구글 뉴스 RSS 헤드라인 분리 표시 · 코어 80단어(Set 1~4) 정직화 · 한글 근사 발음 안내 · 백서 매뉴얼 수록
// ============================================================================

type AiEngineId = 'chatgpt' | 'gemini' | 'claude' | 'siri_rule';

interface AiApiKeyStore {
  chatgpt: string;
  gemini: string;
  claude: string;
}

interface AiModelStore {
  chatgpt: string;
  gemini: string;
  claude: string;
}

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
  M: { x: 805, y: 72, short: '보충/수식(M)' },
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

  // 2. UI 환경 설정 (SSR 안전한 readStorageJson 사용)
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
  
// ============================================================================
  // [UI 밀도(View Mode) 3단계 최적화: Step 1 - 상태, localStorage, Tailwind 매핑]
  // ============================================================================
  const [viewDensity, setViewDensity] = useState<'compact' | 'standard' | 'spacious'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('yanadu_view_density');
      if (saved === 'compact' || saved === 'standard' || saved === 'spacious') {
        return saved;
      }
    }
    return 'standard';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('yanadu_view_density', viewDensity);
      document.documentElement.dataset.density = viewDensity;
    }
  }, [viewDensity]);

  const DENSITY_STYLES = {
    compact: {
      label: '📱 8.5" 미니',
      desc: '아이패드 미니급 고밀도 압축 뷰',
      container: 'max-w-5xl px-2.5 py-2 space-y-2.5 text-xs',
      cardPadding: 'p-2.5 sm:p-3',
      sectionGap: 'gap-2 space-y-2',
    },
    standard: {
      label: '💻 11" 표준',
      desc: '아이패드 11인치급 균형 표준 뷰',
      container: 'max-w-6xl px-3 sm:px-5 py-4 space-y-4 text-sm',
      cardPadding: 'p-4 sm:p-5',
      sectionGap: 'gap-3.5 space-y-3.5',
    },
    spacious: {
      label: '🖥️ 13" 와이드',
      desc: '아이패드 프로 13인치·PC 대화면 뷰',
      container: 'max-w-[1440px] px-5 sm:px-8 py-6 space-y-6 text-base',
      cardPadding: 'p-5 sm:p-7',
      sectionGap: 'gap-5 space-y-5',
    },
  }[viewDensity];
  
  // 3. 시리(Siri) 신경망 TTS 음성 합성 · 리딩 속도 5단계 · 1~6회 반복 듣기(Loop) 상태
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsAccent, setTtsAccent] = useState<'en-US' | 'en-GB' | 'en-AU' | 'en-CA'>('en-US');
  const [ttsRepeatCount, setTtsRepeatCount] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [ttsLoopProgress, setTtsLoopProgress] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() =>
    readStorageString('yanadu_siri_voice_uri', '')
  );
  const [siriAutoSpeak, setSiriAutoSpeak] = useState<boolean>(true);
  const repeatSessionIdRef = useRef<number>(0);
  const repeatTimeoutRef = useRef<number | null>(null);

  // 4. 4대 최신 AI 통합 허브 상태 (ChatGPT · Gemini · Claude · Apple Siri 규칙엔진)
  const [activeAiEngine, setActiveAiEngine] = useState<AiEngineId>(() =>
    readStorageJson('yanadu_active_ai_v1', 'chatgpt')
  );
  const [showAiKeyModal, setShowAiKeyModal] = useState<boolean>(false);
  const [aiApiKeys, setAiApiKeys] = useState<AiApiKeyStore>(() =>
    readStorageJson('yanadu_ai_keys_v1', {
      chatgpt: '',
      gemini: '',
      claude: '',
    })
  );
  const [aiModels] = useState<AiModelStore>(() =>
    readStorageJson('yanadu_ai_models_v1', {
      chatgpt: 'gpt-4o-mini',
      gemini: 'gemini-2.5-flash',
      claude: 'claude-3-7-sonnet-latest',
    })
  );
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // 5. 9대 매체 큐레이션 표현 10선 & Google 뉴스 RSS 헤드라인(별도 분리) 상태
  const [mediaPlatforms, setMediaPlatforms] =
    useState<MediaTrendPlatform[]>(INITIAL_MEDIA_PLATFORMS);
  const [activePlatformId, setActivePlatformId] =
    useState<MediaPlatformId>('FASHION_MAGS');
  const [selectedLiveKeyword, setSelectedLiveKeyword] =
    useState<MediaTrendKeyword | null>(null);
  const [liveNewsHeadlines, setLiveNewsHeadlines] = useState<string[]>([]);
  const [isTrendSyncing, setIsTrendSyncing] = useState<boolean>(false);
  const [lastTrendSyncTime, setLastTrendSyncTime] = useState<string>(() =>
    readStorageString('yanadu_trend_sync_time', '기본 큐레이션 10선 로드됨')
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

  // 6. STEP 3 (16노드 다이어그램 · 자유 문장 AI 해부 · 사전 탭 전환) 및 STEP 4/5 상태
  const [diagramTab, setDiagramTab] = useState<'all' | 'comp' | 'pos'>('all');
  const [diagramSourceMode, setDiagramSourceMode] = useState<
    'theme' | 'standard' | 'custom_ai'
  >('theme');
  const [selectedStandardExIdx, setSelectedStandardExIdx] = useState<number>(0);
  const [customDiagramInput, setCustomDiagramInput] = useState<string>('');
  const [aiAnalyzedDiagram, setAiAnalyzedDiagram] =
    useState<DiagramSentence | null>(null);
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

  // 7. 1~5교시 실전 모듈 & 어순 배열(Scramble 인덱스 추적) 상태
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

  // 8. 단어·문장 보관함 (readStorageJson으로 기존 저장 데이터 안전 복원)
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

  // 9. 4대 AI & 시리 음성 코칭 상태
  const [speakingGoalMins, setSpeakingGoalMins] = useState<5 | 15 | 30>(15);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);
  const [isSpeakingTimerRunning, setIsSpeakingTimerRunning] = useState<boolean>(false);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'coach',
      text: '안녕하세요! 챗GPT · 제미나이 · 클로드 · 애플 시리(Siri) 통합 코치입니다. 오늘 배운 핵심 표현을 넣어 영어 문장을 입력하거나 [🎙️ 시리 음성발화] 버튼으로 말씀해 보세요!',
    },
  ]);
  const [userChatInput, setUserChatInput] = useState<string>('');

  // 10. 아이패드 애플펜슬 필기장 상태 (실제 필압 반영 · 최대 200획 자동 보존 · Undo)
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

  // 로컬스토리지 안전 동기화
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

  useEffect(() => {
    writeStorageString('yanadu_active_ai_v1', JSON.stringify(activeAiEngine));
  }, [activeAiEngine]);

  useEffect(() => {
    writeStorageString('yanadu_ai_keys_v1', JSON.stringify(aiApiKeys));
  }, [aiApiKeys]);

  useEffect(() => {
    writeStorageString('yanadu_ai_models_v1', JSON.stringify(aiModels));
  }, [aiModels]);

  useEffect(() => {
    writeStorageString('yanadu_siri_voice_uri', selectedVoiceURI);
  }, [selectedVoiceURI]);

  // 브라우저 & Apple Siri 신경망 음성 목록 로드 (Siri / Premium / Enhanced 우선 정렬)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const rawVoices = window.speechSynthesis.getVoices();
      if (rawVoices.length === 0) return;
      const enVoices = rawVoices.filter((v) =>
        v.lang.replace('_', '-').toLowerCase().startsWith('en')
      );
      const sorted = [...(enVoices.length > 0 ? enVoices : rawVoices)].sort(
        (a, b) => {
          const score = (v: SpeechSynthesisVoice) => {
            const n = `${v.name} ${v.voiceURI}`.toLowerCase();
            if (n.includes('siri')) return 100;
            if (n.includes('premium') || n.includes('enhanced') || n.includes('natural'))
              return 80;
            if (n.includes('samantha') || n.includes('aaron') || n.includes('nicky') || n.includes('daniel'))
              return 60;
            return 10;
          };
          return score(b) - score(a);
        }
      );
      setAvailableVoices(sorted);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

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
      tag: `🔥 선택 표현 집중 훈련 (#${selectedLiveKeyword.rank} ${ko})`,
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
      contextNuance: `좌측 9대 매체 큐레이션 표현에서 선택한 "${ko}" 항목을 실전 문장 속에서 체화하는 맞춤형 카드입니다.`,
    };

    return {
      ...base,
      sentences: [liveSentObj, ...base.sentences],
    };
  }, [selectedThemeId, selectedLiveKeyword, learningLevel]);

  const currentTrack: LevelTrackContent = currentTheme.levelTracks[learningLevel];
  const activePlatform =
    mediaPlatforms.find((p) => p.id === activePlatformId) || mediaPlatforms[0];
  const currentSentence: TrainingSentence =
    currentTheme.sentences[activeSentenceIdx] || currentTheme.sentences[0];

  // ============================================================================
  // 무단어 폴백(Fallback) + 1~6회 연속 반복 듣기(Loop) + Apple Siri 우선 오디오 엔진
  // ============================================================================
  const stopSpeakingLoop = () => {
    repeatSessionIdRef.current += 1;
    if (repeatTimeoutRef.current !== null) {
      window.clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsLoopProgress('');
  };

  const speakText = (
    rawText?: string,
    customRate?: number,
    customRepeat?: number
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const fallbackSentence =
      currentTrack?.patternEn ||
      currentSentence?.rawEn ||
      'Streamlining the workflow makes the schedule feasible.';

    const cleanedInput = (rawText || '')
      .replace(/\s*\/\s*/g, ', ')
      .replace(/[~_*[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const finalText = cleanedInput.length > 0 ? cleanedInput : fallbackSentence;
    const totalRepeats = Math.max(
      1,
      Math.min(6, customRepeat ?? ttsRepeatCount)
    );
    const rateToUse = customRate ?? ttsRate;

    stopSpeakingLoop();
    const sessionId = repeatSessionIdRef.current;

    const pickPreferredVoice = (): SpeechSynthesisVoice | undefined => {
      if (selectedVoiceURI) {
        const explicit = availableVoices.find(
          (v) => v.voiceURI === selectedVoiceURI
        );
        if (explicit) return explicit;
      }
      const targetNorm = ttsAccent.toLowerCase();
      const accentVoices = availableVoices.filter((v) =>
        v.lang.replace('_', '-').toLowerCase().includes(targetNorm)
      );
      const pool = accentVoices.length > 0 ? accentVoices : availableVoices;
      return (
        pool.find((v) =>
          `${v.name} ${v.voiceURI}`.toLowerCase().includes('siri')
        ) ||
        pool.find((v) =>
          /(premium|enhanced|natural|samantha|aaron|nicky)/i.test(
            `${v.name} ${v.voiceURI}`
          )
        ) ||
        pool[0]
      );
    };

    const chosenVoice = pickPreferredVoice();

    const playIteration = (currentIdx: number) => {
      if (repeatSessionIdRef.current !== sessionId) return;
      if (totalRepeats > 1) {
        setTtsLoopProgress(`🔁 ${currentIdx}/${totalRepeats}회 재생 중`);
      } else {
        setTtsLoopProgress('🔊 재생 중');
      }

      const utter = new SpeechSynthesisUtterance(finalText);
      utter.lang = ttsAccent;
      utter.rate = rateToUse;
      if (chosenVoice) {
        utter.voice = chosenVoice;
      }

      utter.onend = () => {
        if (repeatSessionIdRef.current !== sessionId) return;
        if (currentIdx < totalRepeats) {
          repeatTimeoutRef.current = window.setTimeout(() => {
            playIteration(currentIdx + 1);
          }, 420);
        } else {
          setTtsLoopProgress('');
        }
      };

      utter.onerror = () => {
        if (repeatSessionIdRef.current === sessionId) {
          setTtsLoopProgress('');
        }
      };

      window.speechSynthesis.speak(utter);
    };

    repeatTimeoutRef.current = window.setTimeout(() => {
      playIteration(1);
    }, 50);
  };

  const toggleBlankKey = (key: string) => {
    setRevealedBlankKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ============================================================================
  // 4대 최신 AI (ChatGPT · Gemini · Claude) API 호출 & 1클릭 외부 런처 헬퍼
  // ============================================================================
  const callSelectedAiText = async (
    systemPrompt: string,
    userPrompt: string
  ): Promise<string | null> => {
    if (activeAiEngine === 'chatgpt' && aiApiKeys.chatgpt.trim()) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiApiKeys.chatgpt.trim()}`,
        },
        body: JSON.stringify({
          model: aiModels.chatgpt || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });
      if (!res.ok) throw new Error('OpenAI API 호출 실패');
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || null;
    }

    if (activeAiEngine === 'gemini' && aiApiKeys.gemini.trim()) {
      const modelName = aiModels.gemini || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        modelName
      )}:generateContent?key=${encodeURIComponent(aiApiKeys.gemini.trim())}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('Gemini API 호출 실패');
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    if (activeAiEngine === 'claude' && aiApiKeys.claude.trim()) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiApiKeys.claude.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: aiModels.claude || 'claude-3-7-sonnet-latest',
          max_tokens: 700,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (!res.ok) throw new Error('Claude API 호출 실패');
      const data = await res.json();
      return data?.content?.[0]?.text || null;
    }

    return null;
  };

  const launchExternalAi = (
    target: 'chatgpt' | 'gemini' | 'claude',
    customSentence?: string
  ) => {
    const targetText =
      (customSentence || userChatInput || currentSentence.rawEn).trim();
    const prompt = `[나만의 야나두 영어 PRO 코칭 요청]\n분석·첨삭 대상 문장: "${targetText}"\n1) 7개 문장 성분(S, V, IO, DO, SC, OC, M: 보충어/부가어 구분)과 9품사 결합 구조 설명\n2) 문법·어조 교정 및 원어민 패러프레이징 2가지\n3) 미국식 IPA와 소리블록 끊어읽기 발음 가이드`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(prompt).catch(() => {});
    }

    if (target === 'chatgpt') {
      window.open(
        `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (target === 'claude') {
      window.open(
        `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else {
      window.open(
        'https://gemini.google.com/app',
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  // STEP 3에서 사용자가 입력한 임의 문장을 4대 AI 또는 규칙 엔진으로 16노드 다이어그램에 해부
  const handleAnalyzeCustomSentenceWithAi = async () => {
    const raw = (customDiagramInput || currentSentence.rawEn).trim();
    if (!raw) return;

    const fallbackDiag = buildDynamicDiagramSentence(
      raw,
      '직접 입력한 영어 문장 16노드 분석 (미등록 문장 자동 추정)',
      '직접 입력 문장 (규칙 기반 자동 추정)'
    );
    setAiAnalyzedDiagram(fallbackDiag);
    setDiagramSourceMode('custom_ai');
    setSelectedTokenIdx(0);

    const hasKey =
      (activeAiEngine === 'chatgpt' && aiApiKeys.chatgpt.trim()) ||
      (activeAiEngine === 'gemini' && aiApiKeys.gemini.trim()) ||
      (activeAiEngine === 'claude' && aiApiKeys.claude.trim());

    if (!hasKey) return;

    setIsAiProcessing(true);
    try {
      const sys =
        '당신은 영어 통사론 전문가입니다. 입력 문장의 각 어절을 7개 문장성분(S, V, IO, DO, SC, OC, M)과 9품사(N, Pron, V, Adj, Adv, Prep, Conj, Det, Interj)로 분류해 순수 JSON만 반환하세요. 형식: {"naturalKo":"해석","skeleton":"뼈대","patternType":"형식","wordOrderTip":"팁","tokens":[{"word":"단어","comp":"S","compLabel":"주어 (S)","pos":"N","posLabel":"명사 (N)","meaning":"뜻","roleExplanation":"설명"}]}';
      const aiText = await callSelectedAiText(sys, `분석할 문장: "${raw}"`);
      if (aiText) {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.tokens) && parsed.tokens.length > 0) {
            setAiAnalyzedDiagram({
              title: `✨ ${activeAiEngine.toUpperCase()} 실시간 16노드 정밀 해부`,
              rawEn: raw,
              naturalKo: parsed.naturalKo || fallbackDiag.naturalKo,
              skeleton: parsed.skeleton || fallbackDiag.skeleton,
              patternType: parsed.patternType || fallbackDiag.patternType,
              wordOrderTip: parsed.wordOrderTip || fallbackDiag.wordOrderTip,
              isHeuristic: false,
              tokens: parsed.tokens.map(
                (t: {
                  word?: string;
                  comp?: CompId;
                  compLabel?: string;
                  pos?: PosId;
                  posLabel?: string;
                  meaning?: string;
                  roleExplanation?: string;
                }) => ({
                  word: t.word || '',
                  comp: (t.comp as CompId) || 'M',
                  compLabel: t.compLabel || `${t.comp || 'M'}`,
                  pos: (t.pos as PosId) || 'N',
                  posLabel: t.posLabel || `${t.pos || 'N'}`,
                  meaning: t.meaning || '',
                  roleExplanation: t.roleExplanation || '',
                  colorClass: 'border-blue-500 text-blue-700',
                })
              ),
            });
          }
        }
      }
    } catch {
      // API 오류 시 이미 세팅된 fallbackDiag 유지
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 영영사전 API 조회 (표제어 dictTargetWord 우선 매칭)
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
        const phonetic =
          entry?.phonetic ||
          entry?.phonetics?.find((p: { text?: string }) => p.text)?.text ||
          '/발음기호 미제공/';
        const firstDef = entry?.meanings?.[0]?.definitions?.[0];

        setLiveDictData({
          word: entry?.word || candidate,
          phonetic,
          definition:
            firstDef?.definition || '영영사전 정의가 제공되지 않는 항목입니다.',
          example:
            firstDef?.example ||
            `하단 학습 카드에서 "${candidate}"의 실제 활용 예문을 확인하세요.`,
          loading: false,
          notFound: false,
        });
      } catch {
        setLiveDictData({
          word: candidate,
          phonetic: '/사전 미등재 또는 복합어/',
          definition:
            '표준 영영사전 API에서 단일 표제어로 검색되지 않은 다단어 구문·복합어이거나 미등록 어휘입니다.',
          example:
            '구동사나 복합 표현은 STEP 2 핵심 어휘 표의 상세 해설을 참고해 주세요.',
          loading: false,
          notFound: true,
        });
      }
};
  // 9대 매체 큐레이션 표현 10선 순서 셔플 + Google 뉴스 RSS 헤드라인 별도 수신 (기존 koTitle 오염 방지)
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
        ? data.items
            .slice(0, 5)
            .map((it: { title?: string }) => (it.title || '').trim())
            .filter(Boolean)
        : [];

      if (liveTitles.length === 0) throw new Error('No RSS items');

      setLiveNewsHeadlines(liveTitles);
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

      const stamp = `${getKstTimestampString()} (큐레이션 10선 셔플 + Google 뉴스 헤드라인 5건 수신)`;
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
      const fallbackStamp = `${getKstTimestampString()} (큐레이션 표현 10선 순서 셔플 완료)`;
      setLastTrendSyncTime(fallbackStamp);
      setTrendSyncStatus('local_shuffle');
    } finally {
      setIsTrendSyncing(false);
    }
  };

  const handleClickTrendKeyword = (kw: MediaTrendKeyword) => {
    setSelectedLiveKeyword(kw);
    setSelectedThemeId(kw.targetThemeId);
    setActiveMode('daily');
    setDiagramSourceMode('theme');
    setActiveSentenceIdx(0);
    setSelectedTokenIdx(0);
    fetchLiveDictionary(kw.enExpression, kw.dictTargetWord);
  };

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

  // STEP 3 다이어그램 분석 대상 문장
  const currentDiagramData: DiagramSentence = useMemo(() => {
    if (diagramSourceMode === 'custom_ai' && aiAnalyzedDiagram) {
      return aiAnalyzedDiagram;
    }
    if (diagramSourceMode === 'standard') {
      return DIAGRAM_EXAMPLES[selectedStandardExIdx] || DIAGRAM_EXAMPLES[0];
    }
    return buildDynamicDiagramSentence(
      currentSentence.rawEn,
      currentSentence.naturalKo,
      currentSentence.tag
    );
  }, [
    diagramSourceMode,
    aiAnalyzedDiagram,
    selectedStandardExIdx,
    currentSentence,
  ]);

  const activeToken: DiagramToken =
    currentDiagramData.tokens[selectedTokenIdx] || currentDiagramData.tokens[0];

  // 코어 단어장 (영역별 20단어 × 4영역 = 총 80단어 고정 풀, Set 1~4 순환)
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

  // 1교시 어휘 20문항: 80단어 풀에서 시드 기반으로 20문항을 추출하고 보기 4개를 무작위 셔플
  const period1QuizQuestions = useMemo(() => {
    const allPool = (
      ['중등 필수', '고등·수능 핵심', '비즈니스·실무', '오픽(OPIc)·구동사'] as WordbookLevel[]
    ).flatMap((lv) => getExpandedWordbookByDay(lv, 1));

    const selectedItems = deterministicShuffle(
      allPool,
      vocabChallengeSetSeed * 13 + 7
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
        qKey: `${vocabChallengeSetSeed}-${idx}`,
        item,
        options: shuffledOptions,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
      };
    });
  }, [vocabChallengeSetSeed]);

  const period1CorrectCount = useMemo(() => {
    let count = 0;
    period1QuizQuestions.forEach((q) => {
      if (period1Answers[q.qKey] === q.correctIdx) count++;
    });
    return count;
  }, [period1QuizQuestions, period1Answers]);

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

  // WebKit 시리 받아쓰기(SpeechRecognition) 연동
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
        '현재 브라우저에서는 음성 인식을 지원하지 않습니다. 아이패드/아이폰 Safari 또는 Chrome을 이용해 주세요.'
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

  // 4대 AI(ChatGPT·Gemini·Claude) + 시리 음성 자동 발화 코치 핸들러
  const handleSendCoachMessage = async () => {
    const raw = userChatInput.trim();
    const targetInput = raw || currentTrack.patternEn;
    setUserChatInput('');

    setChatHistory((prev) => [...prev, { role: 'user', text: targetInput }]);

    const hasApiKey =
      (activeAiEngine === 'chatgpt' && aiApiKeys.chatgpt.trim()) ||
      (activeAiEngine === 'gemini' && aiApiKeys.gemini.trim()) ||
      (activeAiEngine === 'claude' && aiApiKeys.claude.trim());

    if (hasApiKey) {
      setIsAiProcessing(true);
      try {
        const sysPrompt =
          '당신은 친절하고 정확한 영어 회화·구문 코치입니다. 사용자의 영어 문장을 분석해 JSON 형식으로만 답하세요: {"feedback":"한국어 문법·어순 피드백 1~2문장","correctedEn":"자연스럽게 다듬은 영어 문장 1개","upgradedEn":"고급 패러프레이징 영어 문장 1개"}';
        const resText = await callSelectedAiText(
          sysPrompt,
          `현재 테마: ${currentTheme.title} / 사용자 입력 문장: "${targetInput}"`
        );
        if (resText) {
          const jsonMatch = resText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const corrected = parsed.correctedEn || targetInput;
            const reply: ChatTurn = {
              role: 'coach',
              text: `🤖 [${activeAiEngine.toUpperCase()} 실시간 코칭] ${
                parsed.feedback || '문장 구조가 자연스럽습니다!'
              }`,
              correction: `교정 문장: "${corrected}"`,
              nuanceTip: `고급 확장: "${
                parsed.upgradedEn || currentTrack.patternEn
              }"`,
            };
            setChatHistory((prev) => [...prev, reply]);
            if (siriAutoSpeak) {
              speakText(corrected, 1.0, 1);
            }
            setIsAiProcessing(false);
            return;
          }
        }
      } catch {
        // API 실패 시 규칙 기반 코치로 자동 전환
      } finally {
        setIsAiProcessing(false);
      }
    }

    const words = targetInput.split(/\s+/);
    const lower = targetInput.toLowerCase();
    const notes: string[] = [];

    if (words.length < 3) {
      notes.push('주어와 동사가 포함된 3어절 이상의 완전한 문장으로 작성해 보세요.');
    }
    if (!/^[A-Z]/.test(targetInput)) {
      notes.push('문장 첫 글자는 대문자로 시작하는 것이 표준 표기입니다.');
    }
    if (!/[.!?]$/.test(targetInput)) {
      notes.push('문장 끝에 마침표(.)나 물음표(?) 등 종결 부호를 붙여 주세요.');
    }
    if (
      /\b(make|makes|made|keep|keeps|kept)\b.*\b(feasibly|comfortably|independently|ambiguousl?y)\b/i.test(
        targetInput
      )
    ) {
      notes.push(
        '주의: 5형식 동사(make/keep)의 목적격보어(OC) 자리에는 부사(-ly)가 아니라 형용사(feasible, comfortable 등)를 써야 합니다.'
      );
    }
    if (/\bstick\s+(my|our|the)\b/i.test(targetInput)) {
      notes.push(
        '주의: stick이 "~을 고수하다/지키다"라는 뜻일 때는 전치사구 보충어(to + 명사구)를 붙여 "stick to + 명사구"로 써야 합니다.'
      );
    }

    const matchedVocab = currentTheme.vocab.find((v) =>
      lower.includes(v.word.toLowerCase())
    );
    const polished =
      targetInput.charAt(0).toUpperCase() +
      targetInput.slice(1) +
      (/[.!?]$/.test(targetInput) ? '' : '.');

    const feedbackText =
      notes.length > 0
        ? `🔍 [구문 규칙 점검 결과] ${notes.join(' / ')}`
        : matchedVocab
        ? `✅ [규칙 통과] 총 ${words.length}어절 문장이며, 오늘 테마의 핵심 표현("${matchedVocab.word}")이 자연스럽게 포함되었습니다!`
        : `✅ [기본 구두점 통과] 총 ${words.length}어절 문장입니다. 여기에 오늘의 핵심 패턴("${currentTrack.patternEn}")을 함께 활용해 보세요.`;

    const replyTurn: ChatTurn = {
      role: 'coach',
      text: feedbackText,
      correction: `교정 표기: "${polished}"`,
      nuanceTip: `대표 패턴: ${currentTrack.patternEn} (${currentTrack.patternMeaningKo})`,
    };

    setChatHistory((prev) => [...prev, replyTurn]);
    if (siriAutoSpeak) {
      speakText(polished, 1.0, 1);
    }
  };

  // ============================================================================
  // 아이패드 애플펜슬 벡터 획 배열(strokesRef) 캔버스 렌더링 엔진
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

  const REPEAT_STEPS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

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
              16문법 노드(7성분+9품사) · 4대 AI(ChatGPT·Siri·Gemini·Claude) · 1~6회 반복 오디오
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
              onClick={() => speakText('')}
              className="px-2.5 py-1 rounded-md font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              🔊 즉시 오디오 듣기 ({ttsRepeatCount}회)
            </button>
            {ttsLoopProgress && (
              <button
                onClick={stopSpeakingLoop}
                className="px-2 py-1 rounded-md font-extrabold bg-rose-600 text-white animate-pulse"
              >
                ⏹️ {ttsLoopProgress} (정지)
              </button>
            )}

            <button
              onClick={() => setShowPronGuide((p) => !p)}
              title="한글 발음 표기는 이해를 돕는 근사치이므로, 미국식 IPA와 원어민 음성(🔊)을 우선 기준으로 삼으세요."
              className={`px-2.5 py-1 rounded-md font-bold border ${
                showPronGuide
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : darkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {showPronGuide ? '👁️ 한글근사발음 켜짐' : '🙈 한글근사발음 가림'}
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
              {layoutMode === 'split' ? '📐 2단 분할' : '🖥️ 와이드'}
            </button>
{/* [UI 밀도 최적화 Step 2] 다중 기기 대응 3단계 뷰 모드 전환 컨트롤러 */}
          <div
            title={`${DENSITY_STYLES.desc} (${DENSITY_STYLES.container})`}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
<style>{`
              html[data-density="compact"] main {
                max-width: 64rem !important;
                padding: 0.5rem 0.65rem !important;
                font-size: 0.82rem !important;
              }
              html[data-density="compact"] main section,
              html[data-density="compact"] main .rounded-2xl,
              html[data-density="compact"] main .rounded-xl {
                padding: 0.65rem !important;
              }
              html[data-density="standard"] main {
                max-width: 76rem !important;
              }
              html[data-density="spacious"] main {
                max-width: 92rem !important;
                padding: 1.5rem 2rem !important;
                font-size: 1.04rem !important;
              }
              html[data-density="spacious"] main section {
                padding: 1.35rem !important;
              }

              /* [다크/라이트 모드 글씨 및 버튼 묻힘 정밀 보정] */
              ${
                darkMode
                  ? `
                /* 1. 다크모드에서 하얗게 뜨는 카드·배경 박스 어둡게 보정 */
                main div.bg-white,
                main div.bg-slate-50,
                main div.bg-slate-100,
                main section.bg-white,
                main section.bg-slate-50 {
                  background-color: #0f172a !important;
                  color: #e2e8f0 !important;
                  border-color: #334155 !important;
                }
                /* 2. 다크모드에서 하얗게 남던 버튼(필기장 접기 등)을 다크 슬레이트 버튼으로 통일 */
                main button.bg-white,
                main button.bg-slate-50,
                main button.bg-slate-100,
                main button.bg-slate-200 {
                  background-color: #1e293b !important;
                  color: #f1f5f9 !important;
                  border-color: #475569 !important;
                }
                /* 3. 어두운 배경 위 어두운 글씨만 밝게 보정 (노란색 등 밝은 컬러 버튼 내부는 제외) */
                main .text-slate-900:not(button),
                main .text-slate-800:not(button),
                main .text-slate-700:not(button),
                main .text-slate-600:not(button) {
                  color: #cbd5e1 !important;
                }
              `
                  : `
                /* 라이트모드에서 기기 다크모드 영향으로 어두워지는 박스·글씨 보정 */
                main .dark\\:bg-slate-950,
                main .dark\\:bg-slate-900,
                main .dark\\:bg-slate-800\\/60 {
                  background-color: #f8fafc !important;
                  color: #1e293b !important;
                  border-color: #e2e8f0 !important;
                }
                main .dark\\:text-white:not(button),
                main .dark\\:text-slate-300:not(button) {
                  color: #1e293b !important;
                }
              `
              }
            `}</style>
            
            <span className="text-[11px] font-extrabold px-1 text-blue-500">
              {DENSITY_STYLES.label.split(' ')[0]}
            </span>
            {(
              [
                { id: 'compact', label: '8.5" 미니' },
                { id: 'standard', label: '11" 표준' },
                { id: 'spacious', label: '13" 와이드' },
              ] as const
            ).map((mode) => {
              const isActive = viewDensity === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setViewDensity(mode.id)}
                  className={`px-2 py-0.5 rounded font-bold text-xs transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>            
{/* ==================================================================== */}
          {/* [즉석 붙여넣기 단어·문장 스피커 & 여성/남성 다중 음성 선택 컨트롤러] */}
          {/* ==================================================================== */}
          <div
            className={`w-full mt-1.5 p-2 rounded-xl border flex flex-wrap items-center gap-2 ${
              darkMode
                ? 'bg-slate-900/95 border-slate-700 text-slate-100'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {/* 1. 여성 / 남성 / 다중 음성 선택기 (페이지 전체 적용) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-purple-600 text-white">
                🎙️ 음성 선택
              </span>
              <button
                type="button"
                onClick={() => {
                  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
                  const female =
                    voices.find((v) =>
                      /Samantha|Ava|Allison|Susan|Victoria|Karen|Moira|Tessa|Zira|Aria|Jenny|Female|Google US English/i.test(
                        v.name
                      )
                    ) || voices[1] || voices[0];
                  if (female) {
                    setSelectedVoiceURI(female.voiceURI);
                    (window as unknown as Record<string, unknown>).__yanaduVoice = female;
                    const sel = document.getElementById('yanadu-voice-select') as HTMLSelectElement | null;
                    if (sel) sel.value = female.voiceURI;
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Hello! Female voice is now active.');
                    u.voice = female;
                    u.lang = female.lang;
                    u.rate = ttsRate;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="px-2 py-1 rounded-md text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-sm"
              >
                👩 여성 대표음성
              </button>

              <button
                type="button"
                onClick={() => {
                  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
                  const male =
                    voices.find((v) =>
                      /Aaron|Alex|Daniel|Arthur|Fred|David|Mark|Guy|Male/i.test(v.name)
                    ) || voices[0];
                  if (male) {
                    setSelectedVoiceURI(male.voiceURI);
                    (window as unknown as Record<string, unknown>).__yanaduVoice = male;
                    const sel = document.getElementById('yanadu-voice-select') as HTMLSelectElement | null;
                    if (sel) sel.value = male.voiceURI;
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Hello! Male voice is now active.');
                    u.voice = male;
                    u.lang = male.lang;
                    u.rate = ttsRate;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                👨 남성 대표음성
              </button>

              <select
                id="yanadu-voice-select"
                value={selectedVoiceURI}
                onFocus={(e) => {
                  const selectEl = e.currentTarget;
                  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
                  if (selectEl.options.length <= 1 && voices.length > 0) {
                    selectEl.innerHTML = '';
                    voices.forEach((v) => {
                      const opt = document.createElement('option');
                      const isFemale =
                        /Samantha|Ava|Allison|Susan|Victoria|Karen|Moira|Tessa|Zira|Aria|Jenny|Sonia|Female|Flo|Sandy|Shelley/i.test(
                          v.name
                        );
                      const isMale = /Aaron|Alex|Daniel|Arthur|Fred|David|Mark|Guy|Reed|Rocko|Eddy|Male/i.test(
                        v.name
                      );
                      const genderTag = isFemale ? '👩 여성' : isMale ? '👨 남성' : '🔊 기본';
                      opt.value = v.voiceURI;
                      opt.textContent = `${genderTag} · ${v.name} (${v.lang})`;
                      selectEl.appendChild(opt);
                    });
                  }
                }}
                onChange={(e) => {
                  const uri = e.target.value;
                  setSelectedVoiceURI(uri);
                  const voices = window.speechSynthesis.getVoices();
                  const picked = voices.find((v) => v.voiceURI === uri);
                  if (picked) {
                    (window as unknown as Record<string, unknown>).__yanaduVoice = picked;
                    const w = window as unknown as Record<string, unknown>;
                    if (!w.__yanaduPatched) {
                      const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
                      window.speechSynthesis.speak = (utter: SpeechSynthesisUtterance) => {
                        const pref = w.__yanaduVoice as SpeechSynthesisVoice | undefined;
                        if (pref && (!utter.lang || utter.lang.startsWith('en'))) {
                          utter.voice = pref;
                          utter.lang = pref.lang;
                        }
                        return origSpeak(utter);
                      };
                      w.__yanaduPatched = true;
                    }
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Voice changed successfully.');
                    u.voice = picked;
                    u.lang = picked.lang;
                    u.rate = ttsRate;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className={`px-2 py-1 rounded-md text-xs font-bold border ${
                  darkMode
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">🔊 기기 내장 영어 목소리 전체 선택 (클릭)</option>
              </select>
            </div>

            {/* 2. 즉석 복사·붙여넣기 단어/문장 해석 & 스피커 바 */}
            <div className="flex-1 min-w-[260px] flex flex-wrap items-center gap-1.5">
              <input
                id="yanadu-instant-input"
                type="text"
                placeholder="궁금한 영어 단어·문장을 붙여넣으세요 (자동 뜻 풀이 + 스피커 발음)"
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text').trim();
                  if (pasted) {
                    setTimeout(() => {
                      const btn = document.getElementById('yanadu-instant-speak-btn');
                      if (btn) btn.click();
                    }, 60);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const btn = document.getElementById('yanadu-instant-speak-btn');
                    if (btn) btn.click();
                  }
                }}
                className={`flex-1 min-w-[180px] px-2.5 py-1 rounded-md text-xs font-bold border ${
                  darkMode
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />

              <button
                id="yanadu-instant-speak-btn"
                type="button"
                onClick={async () => {
                  const inputEl = document.getElementById('yanadu-instant-input') as HTMLInputElement | null;
                  const resultEl = document.getElementById('yanadu-instant-result');
                  if (!inputEl || !resultEl) return;
                  const text = inputEl.value.trim();
                  if (!text) return;

                  resultEl.textContent = '⏳ 뜻 검색 및 발음 출력 중...';

                  // 1) 즉시 영어 음성 발화
                  window.speechSynthesis.cancel();
                  const utterEn = new SpeechSynthesisUtterance(text);
                  const pref = (window as unknown as Record<string, unknown>).__yanaduVoice as
                    | SpeechSynthesisVoice
                    | undefined;
                  if (pref) {
                    utterEn.voice = pref;
                    utterEn.lang = pref.lang;
                  } else {
                    utterEn.lang = ttsAccent;
                  }
                  utterEn.rate = ttsRate;
                  window.speechSynthesis.speak(utterEn);

                  // 2) 실시간 한글 뜻 번역 조회 후 화면 표시 & 한국어 음성 이어서 읽기
                  try {
                    const res = await fetch(
                      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&dt=bd&q=${encodeURIComponent(
                        text
                      )}`
                    );
                    const data = await res.json();
                    const koMeaning = Array.isArray(data?.[0])
                      ? data[0].map((item: unknown[]) => item?.[0] || '').join('')
                      : '뜻을 불러오지 못했습니다.';
                    const dictExtra =
                      Array.isArray(data?.[1]) && data[1][0]?.[1]
                        ? ` (${data[1][0][0]}: ${data[1][0][1].slice(0, 3).join(', ')})`
                        : '';
                    resultEl.textContent = `💡 뜻: ${koMeaning}${dictExtra}`;

                    const utterKo = new SpeechSynthesisUtterance(koMeaning);
                    utterKo.lang = 'ko-KR';
                    utterKo.rate = 1.05;
                    window.speechSynthesis.speak(utterKo);
                  } catch {
                    resultEl.textContent = '⚠️ 네트워크 상태를 확인해 주세요.';
                  }
                }}
                className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                🔊 바로 듣기 + 뜻
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const clip = await navigator.clipboard.readText();
                    const inputEl = document.getElementById('yanadu-instant-input') as HTMLInputElement | null;
                    if (inputEl && clip.trim()) {
                      inputEl.value = clip.trim();
                      const btn = document.getElementById('yanadu-instant-speak-btn');
                      if (btn) btn.click();
                    }
                  } catch {
                    alert('입력창을 길게 눌러 붙여넣기 해주세요.');
                  }
                }}
                className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                📋 복사한 글 바로 붙여넣기
              </button>
            </div>

            {/* 3. 즉석 해석 결과 표시줄 (페이지 이동 없이 바로 아래에 노출) */}
            <div
              id="yanadu-instant-result"
              className="w-full text-xs font-extrabold text-amber-400 px-1 truncate"
            >
              💡 책이나 웹에서 복사한 영어 단어·문장을 붙여넣으면 이곳에 즉시 한글 뜻이 표시되고 스피커로 읽어줍니다.
          </div>
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
              🖨️ 인쇄
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
            {/* 1) 애플 시리(Siri) 음성 선택기 · 속도 5단계 · 1~6회 반복 듣기 컨트롤러 */}
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold">
                  🍎 시리(Siri) 음성 & 1~6회 반복 플레이어
                </span>
                <button
                  onClick={() => speakText('')}
                  className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold"
                >
                  🔊 즉시 재생
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1 mb-2">
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

              <div className="mb-2">
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded-lg border text-[11px] font-bold ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="">
                    🍎 Apple Siri / 고품질 신경망 보이스 자동 우선 매칭
                  </option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span>🔁 연속 반복 듣기 횟수 설정:</span>
                  <span className="text-emerald-500 font-extrabold">
                    {ttsRepeatCount}회 연속 재생
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {REPEAT_STEPS.map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setTtsRepeatCount(cnt)}
                      className={`py-1 rounded-lg text-xs font-black border transition-all ${
                        ttsRepeatCount === cnt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {cnt}회
                    </button>
                  ))}
                </div>
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

            {/* 2) 4대 최신 AI 통합 허브 (ChatGPT · Gemini · Claude · Apple Siri) */}
            <div
              className={`p-3.5 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold">
                  🤖 4대 최신 AI 엔진 통합 허브
                </span>
                <button
                  onClick={() => setShowAiKeyModal((p) => !p)}
                  className="text-[10px] px-2 py-0.5 rounded border font-bold text-blue-500 border-blue-500/40"
                >
                  {showAiKeyModal ? '설정 닫기' : '🔑 API·모델 설정'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {(
                  [
                    { id: 'chatgpt', label: '🤖 ChatGPT (OpenAI)' },
                    { id: 'gemini', label: '✨ Gemini (Google)' },
                    { id: 'claude', label: '🧠 Claude (Anthropic)' },
                    { id: 'siri_rule', label: '🍎 Siri + 내장코치' },
                  ] as const
                ).map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => setActiveAiEngine(eng.id)}
                    className={`p-2 rounded-xl border font-extrabold text-left transition-all ${
                      activeAiEngine === eng.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {eng.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-[10px] font-bold opacity-80 mb-1.5">
                  🚀 API 키 없이도 현재 문장을 담아 공식 앱/웹 즉시 실행:
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => launchExternalAi('chatgpt')}
                    className="py-1.5 rounded-lg font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    ChatGPT↗
                  </button>
                  <button
                    onClick={() => launchExternalAi('gemini')}
                    className="py-1.5 rounded-lg font-extrabold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Gemini↗
                  </button>
                  <button
                    onClick={() => launchExternalAi('claude')}
                    className="py-1.5 rounded-lg font-extrabold bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Claude↗
                  </button>
                </div>
              </div>

              {showAiKeyModal && (
                <div className="mt-2.5 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2 text-[11px]">
                  <div className="font-bold text-blue-500">
                    🔑 브라우저 전용 API 키 설정 (로컬에만 안전 저장)
                  </div>
                  <div>
                    <label className="block font-semibold">
                      OpenAI Key & 모델 ({aiModels.chatgpt})
                    </label>
                    <input
                      type="password"
                      value={aiApiKeys.chatgpt}
                      onChange={(e) =>
                        setAiApiKeys((p) => ({ ...p, chatgpt: e.target.value }))
                      }
                      placeholder="sk-..."
                      className="w-full mt-0.5 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">
                      Google Gemini Key & 모델 ({aiModels.gemini})
                    </label>
                    <input
                      type="password"
                      value={aiApiKeys.gemini}
                      onChange={(e) =>
                        setAiApiKeys((p) => ({ ...p, gemini: e.target.value }))
                      }
                      placeholder="AIza..."
                      className="w-full mt-0.5 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">
                      Anthropic Claude Key & 모델 ({aiModels.claude})
                    </label>
                    <input
                      type="password"
                      value={aiApiKeys.claude}
                      onChange={(e) =>
                        setAiApiKeys((p) => ({ ...p, claude: e.target.value }))
                      }
                      placeholder="sk-ant-..."
                      className="w-full mt-0.5 px-2 py-1 rounded border bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold">🍎 첨삭 후 시리 음성 자동 읽기</span>
                    <input
                      type="checkbox"
                      checked={siriAutoSpeak}
                      onChange={(e) => setSiriAutoSpeak(e.target.checked)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3) 9대 매체·분야별 큐레이션 표현 10선 & Google 뉴스 헤드라인(별도 분리) */}
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
                    🌐 큐레이션 표현 10선 + Google 뉴스 헤드라인
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
                  {isTrendSyncing ? '⏳ 동기화 중...' : '🔄 순서셔플·뉴스수신'}
                </button>
              </div>

              {liveNewsHeadlines.length > 0 && (
                <div
                  className={`p-2 rounded-xl border text-[10px] mb-2 space-y-0.5 ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-amber-50/70 border-amber-200 text-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-amber-600 dark:text-amber-400">
                    📰 수신된 Google 뉴스 최신 헤드라인 (참고용 별도 표시):
                  </div>
                  {liveNewsHeadlines.map((hl, idx) => (
                    <div key={idx} className="truncate">
                      • {hl}
                    </div>
                  ))}
                </div>
              )}

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
                  className="text-blue-500 font-bold underline shrink-0 ml-1"
                >
                  참고링크↗
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
                          <span className="inline-block w-5 text-rose-500 font-black">
                            #{kw.rank}
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
                      📖 표제어 사전 조회: {liveDictData.word}
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

            {/* 4) 5대 정규 테마 선택 */}
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
          {/* 한글 발음 근사 표기 안내 배너 */}
          {showPronGuide && (
            <div
              className={`px-3.5 py-2 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 no-print ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                  : 'bg-emerald-50/80 border-emerald-200 text-slate-700'
              }`}
            >
              <span>
                ℹ️ <strong>발음 학습 안내:</strong> 한글 발음 표기는 초급자의 이해를 돕기 위한 <strong>근사 표기</strong>입니다. 실제 원어민 소리는 반드시 함께 표기된 <strong>미국식 IPA 발음기호와 원어민 음성(🔊)을 최우선 기준</strong>으로 익혀 주세요.
              </span>
            </div>
          )}

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
                {/* STEP 1. 오늘의 대표 패턴 & 소리블록 & 1~6회 반복 듣기 */}
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
                          🗣️ 한글 근사 발음: {currentTrack.patternPron}
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
                        🐌 0.30x 초저속 ({ttsRepeatCount}회)
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 0.5)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        🐢 0.50x 천천히 ({ttsRepeatCount}회)
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 0.75)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        🚶 0.75x 연음 ({ttsRepeatCount}회)
                      </button>
                      <button
                        onClick={() => speakText(currentTrack.patternEn, 1.0)}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700"
                      >
                        🔊 1.0x 원어민 정속 ({ttsRepeatCount}회)
                      </button>
                      {REPEAT_STEPS.slice(1).map((rep) => (
                        <button
                          key={rep}
                          onClick={() => {
                            setTtsRepeatCount(rep);
                            speakText(currentTrack.patternEn, ttsRate, rep);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          🔁 {rep}회 연속듣기
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 패러프레이징 비교 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3">
                    {currentTrack.paraphraseDrill.map((pd, idx) => (
                      <div
                        key={idx}
                        onClick={() => speakText(pd.upgradedExpr)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer ${
                          darkMode
                            ? 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-slate-500 line-through">
                          기본 표현: {pd.basicExpr}
                        </div>
                        <div className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                          🚀 확장 표현: {pd.upgradedExpr} 🔊
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
                      💬 2인 실전 롤플레이 대화 (클릭 시 {ttsRepeatCount}회 음성 재생)
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
                                🔊 듣기 ({ttsRepeatCount}회)
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
              {/* STEP 2. 핵심 어휘 (표제어 옆 단독 스피커 & 빈칸 정답 가림 토글) */}
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
                      표제어 옆의 <strong>[🔊 단어]</strong> 버튼으로 단어 발음을 바로 듣거나(반복 {ttsRepeatCount}회 적용), 우측의 <strong>[❓ 정답 확인]</strong>을 눌러 표제어 원형 그대로 빈칸을 채워 보세요.
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
                        <th className="p-2.5">단어(🔊) & 미국식 IPA · 소리블록</th>
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
              {/* STEP 3. 16개 문법 노드 연결도 & 자유 문장 AI 실시간 해부기 */}
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
                      STEP 3 · 문장 성분 7개(보충어·부가어 구분) + 9품사 = 총 16개 문법 노드 & AI 해부기
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      ※ M 노드는 동사가 의미를 완성하기 위해 요구하는 <strong>전치사구 보충어(Complement: stick to ~, blend A with B)</strong>와 선택적 수식 요소인 <strong>부가어/수식어(Adjunct)</strong>를 포괄하여 보여주며, 각 어절 설명에서 이를 명확히 구분해 안내합니다.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: '🕸️ 16개 문법 노드 대표 연결도' },
                        { id: 'comp', label: '📘 문장 성분(7직책·보충어/부가어) 사전' },
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
                            title={exItem.title}
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
                        <button
                          onClick={() => speakText(currentDiagramData.rawEn)}
                          className="px-2.5 py-1 rounded-lg font-extrabold bg-blue-600 text-white"
                        >
                          🔊 분석 문장 듣기 ({ttsRepeatCount}회)
                        </button>
                      </div>
                      {currentDiagramData.isHeuristic && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ⚠️ 미등록 문장 간이 추정 결과 (복합절·미등록 어휘는 오분류될 수 있으니 참고용으로만 확인하세요)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={customDiagramInput}
                        onChange={(e) => setCustomDiagramInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          handleAnalyzeCustomSentenceWithAi()
                        }
                        placeholder="직접 분석하고 싶은 영어 문장을 입력하면 AI(또는 간이 추정기)로 16노드 다이어그램에 표시합니다..."
                        className={`flex-1 min-w-[240px] px-3 py-1.5 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-950 border-slate-700'
                            : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                      <button
                        onClick={handleAnalyzeCustomSentenceWithAi}
                        disabled={isAiProcessing}
                        className="px-3 py-1.5 rounded-lg font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 shrink-0"
                      >
                        {isAiProcessing
                          ? '⏳ AI 해부 중...'
                          : `✨ ${activeAiEngine.toUpperCase()} 16노드 해부`}
                      </button>
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
                          className={`text-[12px] font-black ${
                            darkMode ? 'fill-blue-400' : 'fill-blue-700'
                          }`}
                        >
                          ▲ 상단 7개 노드: 문장 성분 (M 노드는 동사 보충어 Complement 및 수식 부가어 Adjunct 포함) — 원 클릭 시 상세 설명 표시
                        </text>
                        <text
                          x="20"
                          y="308"
                          className={`text-[12px] font-black ${
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
                        👇 아래 문장의 각 단어를 클릭하면 위 연결선이 움직이고 발음과 상세 문법 역할(보충어 vs 부가어 구분 포함)이 표시됩니다:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentDiagramData.tokens.map((tok, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTokenIdx(idx);
                              speakText(tok.word, ttsRate, 1);
                            }}
                            className={`px-3 py-2 rounded-xl border-2 text-left transition-all ${
                              selectedTokenIdx === idx
                                ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-slate-800 border-amber-500'
                                : darkMode
                                ? 'bg-slate-950 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="text-sm font-black">
                              {tok.word} <span className="text-[10px]">🔊</span>
                            </div>
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
                            • <strong>핵심 어순·문법 포인트:</strong> {currentDiagramData.wordOrderTip}
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
                          💡 <strong>쉬운 뜻 & 영문법 구분:</strong> {comp.easyMeaning}
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
                    문장 카드를 클릭하면 위 STEP 3 다이어그램이 해당 문장의 정밀 토큰 분석으로 즉시 연동됩니다.
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
                              🔊 핵심어 ({ttsRepeatCount}회)
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
                              🔊 1.0x ({ttsRepeatCount}회)
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
                                미국식 IPA: {sent.ipaLine}
                              </div>
                              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                🗣️ 한글 근사 발음: {sent.pronLine}
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
              {/* STEP 5. 단계별 확인 퀴즈 & 서술형 영작 · 4대 AI 스피킹 코치 */}
              {/* ============================================================ */}
              <section
                className={`p-4 rounded-2xl border space-y-4 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white">
                  STEP 5 · 초·중·고급 실전 점검 퀴즈 & 4대 AI(ChatGPT·Siri·Gemini·Claude) 코칭
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
                          onClick={() => {
                            setIntSelected(idx);
                            speakText(opt, ttsRate, 1);
                          }}
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
                          {idx + 1}. {opt} 🔊
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
                        🔊 듣기 ({ttsRepeatCount}회)
                      </button>
                    </div>
                  )}
                </div>

                {/* 4대 AI(ChatGPT · Gemini · Claude · Apple Siri) 통합 코치 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-extrabold">
                        🤖 4대 AI 스피킹·구문 코치 (현재 엔진:{' '}
                        <strong className="text-blue-500 uppercase">
                          {activeAiEngine}
                        </strong>
                        )
                      </span>
                      <button
                        onClick={() => launchExternalAi('chatgpt')}
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                      >
                        🚀 ChatGPT↗
                      </button>
                      <button
                        onClick={() => launchExternalAi('gemini')}
                        className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                      >
                        ✨ Gemini↗
                      </button>
                      <button
                        onClick={() => launchExternalAi('claude')}
                        className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold"
                      >
                        🧠 Claude↗
                      </button>
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

                  <div className="space-y-2 max-h-48 overflow-y-auto mb-2 p-2 rounded bg-white dark:bg-slate-900">
                    {chatHistory.map((turn, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          speakText(turn.correction || turn.text, ttsRate, 1)
                        }
                        className={`p-2 rounded-lg cursor-pointer ${
                          turn.role === 'user'
                            ? 'bg-blue-600 text-white ml-8'
                            : darkMode
                            ? 'bg-slate-800 mr-8'
                            : 'bg-slate-100 mr-8'
                        }`}
                      >
                        <div className="font-semibold">{turn.text} 🔊</div>
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleStartVoiceRecognition}
                      className={`px-3 py-2 rounded-lg font-extrabold text-white shrink-0 ${
                        isMicListening ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600'
                      }`}
                    >
                      {isMicListening ? '🎙️ 시리 듣는 중...' : '🎙️ 시리 음성발화'}
                    </button>
                    <input
                      type="text"
                      value={userChatInput}
                      onChange={(e) => setUserChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendCoachMessage()}
                      placeholder="영어로 문장을 입력하거나 비워둔 채 [AI 첨삭·시리발화]를 누르면 대표 문장으로 즉시 코칭합니다..."
                      className={`flex-1 min-w-[200px] px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                    <button
                      onClick={handleSendCoachMessage}
                      disabled={isAiProcessing}
                      className="px-3 py-2 rounded-lg font-extrabold bg-blue-600 text-white shrink-0"
                    >
                      {isAiProcessing ? '⏳ AI 분석중...' : '✨ AI 첨삭·시리발화'}
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
                        { p: 4, label: '4교시 · EBS형 창작 학술예문 6선' },
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

                {/* 1교시: 어휘 스피드 20문항 (80단어 고정 풀에서 무작위 셔플 추출 & 정답 위치 1~4번 분산) */}
                {activeModulePeriod === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-500/10 text-xs">
                      <div className="font-extrabold">
                        🎯 실시간 채점 점수:{' '}
                        <span className="text-blue-600 dark:text-blue-400 text-sm">
                          {period1CorrectCount} / {period1QuizQuestions.length}점
                        </span>{' '}
                        (코어 80단어 풀 무작위 셔플 추출 · 정답 위치 1~4번 고르게 분산)
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
                          🎲 문항·보기 셔플 재구성 (#{vocabChallengeSetSeed})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {period1QuizQuestions.map((qObj, idx) => {
                        const { qKey, item, options, correctIdx } = qObj;
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
                                🔊 단어듣기 ({ttsRepeatCount}회)
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

                {/* 2교시: 12대 고정 구문 아카이브 & 중복 방지·개별 취소 어순 조립기 */}
                {activeModulePeriod === 2 && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold">
                        🧩 핵심 구문 아카이브 12선 (고정 12구문 순서 회전 & 시드 기반 어절 셔플 조립 훈련)
                      </span>
                      <button
                        onClick={() => {
                          setSyntaxGeneratorSeed((s) => s + 1);
                          setScramblePickedIndices({});
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                      >
                        🔄 어절 셔플 시드 변경 (#{syntaxGeneratorSeed})
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
                                #{idx + 1} · {syn.openerRule} (표제어: {syn.targetWord} / 문장 속 형태: {syn.matchedForm})
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => speakText(syn.targetWord)}
                                  className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-bold"
                                >
                                  🔊 단어
                                </button>
                                <button
                                  onClick={() => speakText(syn.sentenceEn)}
                                  className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
                                >
                                  🔊 원문듣기 ({ttsRepeatCount}회)
                                </button>
                              </div>
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
                              🔄 의미 보존 Paraphrase: {syn.paraphrasedEn}
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-amber-500">
                                  🧩 섞인 어절을 클릭해 조립하세요 (선택한 조각이나 아래 조립된 단어를 다시 누르면 개별 취소됩니다):
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
                                      onClick={() => {
                                        speakText(tok, ttsRate, 1);
                                        setScramblePickedIndices((prev) => {
                                          const cur = prev[syn.id] || [];
                                          return {
                                            ...prev,
                                            [syn.id]: cur.includes(tIdx)
                                              ? cur.filter((x) => x !== tIdx)
                                              : [...cur, tIdx],
                                          };
                                        });
                                      }}
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
                                    🔊 지문듣기 ({ttsRepeatCount}회)
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

                {/* 4교시: EBS형 창작 학술 독해 예문 6선 (창작 예시 명시) */}
                {activeModulePeriod === 4 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-semibold">
                      ℹ️ 안내: 아래 6개 지문은 실제 EBS 공식 교재 인용문이 아니라, 수능·학술 독해에 자주 등장하는 주제와 구문 구조를 연습하기 위해 직접 작성된 <strong>학습용 창작 학술 독해 예문(6선)</strong>입니다.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                              {top.category} (학습용 창작 예문)
                            </span>
                            <button
                              onClick={() => speakText(top.passageEn)}
                              className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                            >
                              🔊 지문듣기 ({ttsRepeatCount}회)
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
                                onClick={() => speakText(kw.split('(')[0])}
                                className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold cursor-pointer"
                              >
                                {kw} 🔊
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5교시: 핵심 빈출 어법 연습 10문항 & 내 지문 기계적 빈칸·어순 연습기 */}
                {activeModulePeriod === 5 && (
                  <div className="space-y-6 text-xs">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-indigo-500/10 mb-3">
                        <span className="font-extrabold">
                          ⚡ 핵심 빈출 어법 연습 10문항 (자체 제작 학습 문항) 실시간 점수:{' '}
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
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-indigo-500">
                                  {q.schoolTag}
                                </span>
                                <button
                                  onClick={() =>
                                    speakText(
                                      `${q.sentenceBefore} ${
                                        q.correct === 'A'
                                          ? q.choiceA
                                          : q.choiceB
                                      } ${q.sentenceAfter}`
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                                >
                                  🔊 문장듣기
                                </button>
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

                    {/* 내 학교 지문 붙여넣기 연습기 (기계적 빈칸·4단어 미만 제외 한계 명시) */}
                    <div
                      className={`p-4 rounded-xl border ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h3 className="font-black text-sm mb-1">
                        🏫 내 영어 지문 직접 붙여넣기 연습기 (청크 분할 · 단어 가리기 · 어절 섞기)
                      </h3>
                      <p className="text-[11px] opacity-80 mb-2">
                        ℹ️ {customPassageAnalysis.statusMessage} (※ 빈칸은 문장 내 5글자 이상 첫 단어를 자동으로 가리는 기계적 암기 연습이며, 4단어 미만 단문은 제외됩니다.)
                      </p>
                      <textarea
                        rows={3}
                        value={customSchoolPassage}
                        onChange={(e) => setCustomSchoolPassage(e.target.value)}
                        placeholder="연습할 영어 지문을 여기에 붙여넣으세요..."
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
                                    문장 #{s.idx} 호흡 분할 연습
                                  </span>
                                  <button
                                    onClick={() => speakText(s.rawEn)}
                                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold"
                                  >
                                    🔊 듣기 ({ttsRepeatCount}회)
                                  </button>
                                </div>
                                <div className="font-black text-sm">
                                  {s.soundBlockEn}
                                </div>
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono flex flex-wrap items-center justify-between gap-2">
                                  <span>단어 가리기 연습: {s.blankQuizSentence}</span>
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
          {/* [모드 3] 📘 코어 80단어 & 파생어 족보 (Set 1~4 순환 명시) */}
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
                  💡 4대 영역 코어 80단어 & 파생어 족보 학습장 (영역별 20단어 × 4영역 = 총 80단어 고정 풀 · Set 1~4 시작 순서 순환)
                </div>
                <p className="mt-1 leading-relaxed">
                  본 단어장은 중등 필수·고등 수능·비즈니스 실무·오픽 구동사 4대 영역의 <strong>엄선된 코어 표제어 80선(영역당 20단어 고정 풀)</strong>을 수록하고 있으며, <strong>순환 순서 Set 1 ~ Set 4</strong> 버튼으로 시작 위치를 5단어씩 이동하며 복습할 수 있습니다.
                </p>
              </div>

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

              {/* 한글 발음 근사 표기 안내 및 80단어 고정 풀(Set 1~4) 안내 */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                ℹ️ <strong>학습 안내:</strong> 한글 발음 표기는 초급자의 이해를 돕기 위한 <strong>근사 표기</strong>이므로, 정확한 발음은 반드시 <strong>미국식 IPA 발음기호와 원어민 음성(🔊)</strong>을 우선 기준으로 익혀 주세요. 또한 본 단어장은 영역별 20개씩 <strong>총 80개 핵심 어휘 고정 풀</strong>을 제공하며, <strong>Set #1 ~ Set #4</strong> 버튼을 통해 시작 순서를 5단어씩 바꾸어 복습할 수 있습니다.
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

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold opacity-80">
                    배열 순서 (4주기 순환):
                  </span>
                  {([1, 2, 3, 4] as const).map((setNum) => (
                    <button
                      key={setNum}
                      onClick={() => setSelectedWordbookDay(setNum)}
                      className={`px-2.5 py-1 rounded-lg font-extrabold border ${
                        ((selectedWordbookDay - 1) % 4) + 1 === setNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Set #{setNum}
                    </button>
                  ))}
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
                        <button
                          onClick={() => speakText(entry.word)}
                          className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]"
                        >
                          🔊 단어 ({ttsRepeatCount}회)
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
                        🗣️ 근사발음: {entry.pron} · 소리블록: {entry.soundBlock}
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
                    placeholder="한글 근사발음 (예: [스트림라인])"
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
                    placeholder="한글 근사발음 메모"
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
                            🔊 ({ttsRepeatCount}회)
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
                  모든 테마의 레벨별 대표 문장, 소리블록, 미국식 IPA 및 한글 근사 발음을 한눈에 비교하고 클릭 한 번으로 해당 강의로 바로 이동할 수 있는 마스터 요약표입니다.
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
                                  🔊 ({ttsRepeatCount}회)
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
          {/* [모드 6] 🛠️ 제작과정 백서 (초등학생용 쉬운 설명서 + 정식 매뉴얼 원문 수록) */}
          {/* ---------------------------------------------------------------- */}
          {activeMode === 'devStory' && (
            <section
              className={`p-5 rounded-2xl border space-y-6 text-xs leading-relaxed ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-black">
                  PROJECT ARCHITECTURE & USER MANUAL WHITEPAPER
                </span>
                <h2 className="text-xl font-black mt-2">
                  🛠️ [나만의 야나두 영어 PRO] 전체 설계 백서 & 4대 AI·시리·반복 오디오 완벽 사용 설명서
                </h2>
                <p className="text-slate-500 mt-1">
                  본 문서는 기획자(윤성만)의 실전 학습 철학을 바탕으로 제작된 기술·교육 아키텍처 백서이자, 누구나 바로 따라 할 수 있는 공식 사용 매뉴얼입니다.
                </p>
              </div>

              {/* ============================================================ */}
              {/* [파트 A] 🐣 초등학생도 3초 만에 따라 하는 쉬운 사용 설명서 */}
              {/* ============================================================ */}
              <div
                className={`p-4 rounded-2xl border-2 space-y-3 ${
                  darkMode
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                    🐣 초등학생도 3초 만에 이해하는 쉬운 사용 방법 요약
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    가장 먼저 읽어보세요!
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 space-y-1.5">
                    <h4 className="font-black text-sm text-blue-600 dark:text-blue-400">
                      🔊 1단계: 소리 듣기 & 2~6번 반복 듣기
                    </h4>
                    <p>
                      • <strong>아무 단어나 안 골라도 소리가 나요:</strong> 맨 위 파란색 <strong>[🔊 즉시 오디오 듣기]</strong> 버튼만 누르면 오늘 배울 대표 문장을 바로 읽어 줍니다.
                    </p>
                    <p>
                      • <strong>단어만 콕 집어 듣기:</strong> 단어장 표에서 영어 단어 바로 옆 <strong>[🔊 단어]</strong>를 누르면 그 단어 발음만 또렷하게 들려줍니다.
                    </p>
                    <p>
                      • <strong>2번~6번 연속 반복 듣기:</strong> 왼쪽 메뉴에서 <strong>[2회]~[6회]</strong> 중 원하는 숫자를 눌러 두면, 한 번만 클릭해도 정한 횟수만큼 연속으로 읽어 줍니다. (멈출 땐 <strong>[⏹️ 정지]</strong> 클릭!)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 space-y-1.5">
                    <h4 className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      🚀 2단계: 암호(API 키) 없이 AI 선생님 무료 호출
                    </h4>
                    <p>
                      • <strong>1번:</strong> 오늘 공부할 문장을 하나 고릅니다.
                    </p>
                    <p>
                      • <strong>2번:</strong> 왼쪽 메뉴나 STEP 5에 있는 <strong>[ChatGPT↗] · [Gemini↗] · [Claude↗]</strong> 버튼 중 하나를 누릅니다.
                    </p>
                    <p>
                      • <strong>3번:</strong> <strong>챗GPT와 클로드</strong>는 질문이 자동으로 적혀서 열리니 그냥 <strong>전송(엔터)</strong>만 누르면 끝! <strong>제미나이</strong>는 빈칸을 꾹 눌러 <strong>붙여넣기(Cmd+V)</strong>만 하면 문법과 발음을 쉽게 설명해 줍니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 space-y-1.5">
                    <h4 className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                      🍎 3단계: 시리(Siri)와 대화하고 그림으로 문장 해부하기
                    </h4>
                    <p>
                      • <strong>내 목소리로 말하기:</strong> STEP 5 아래 <strong>[🎙️ 시리 음성발화]</strong>를 누르고 영어로 말하면 글자로 받아적어 줍니다.
                    </p>
                    <p>
                      • <strong>틀린 곳 고치고 시리 목소리로 듣기:</strong> <strong>[✨ AI 첨삭·시리발화]</strong>를 누르면 문장을 바르게 고쳐 주고 시리가 고운 목소리로 읽어 줍니다.
                    </p>
                    <p>
                      • <strong>어려운 문장 그림으로 해부(STEP 3):</strong> 궁금한 영어 문장을 STEP 3 빈칸에 넣고 <strong>[✨ 16노드 해부]</strong>를 누르면 16개 동그라미 선으로 주인공(주어)과 행동(동사)을 한눈에 이어 줍니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* [파트 B] 📖 4대 최신 AI 엔진 통합 허브 & 시리·반복 플레이어 정식 매뉴얼 (원문 100% 수록) */}
              {/* ============================================================ */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-blue-50/40 border-blue-200'
                }`}
              >
                <div className="font-black text-sm text-blue-600 dark:text-blue-400">
                  📖 4대 최신 AI 엔진 통합 허브 & 시리(Siri)·반복 플레이어 공식 상세 매뉴얼
                </div>

                {/* 1. API 키 없이 무료로 바로 쓰는 법 */}
                <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    1. API 키 없이 무료로 바로 쓰는 법 (1클릭 공식 앱/웹 연동)
                  </h3>
                  <p className="font-semibold">
                    별도 설정이나 비용 없이 현재 공부 중인 문장을 ChatGPT·Gemini·Claude 공식 화면으로 곧바로 넘겨 심화 학습하는 방법입니다.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 font-medium">
                    <li>학습할 테마와 문장을 선택합니다.</li>
                    <li>
                      좌측 사이드바 <strong>🤖 4대 최신 AI 엔진 통합 허브</strong> 하단 또는 <strong>STEP 5</strong> 상단에 있는 <strong>[ChatGPT↗] · [Gemini↗] · [Claude↗]</strong> 버튼 중 원하는 것을 누릅니다.
                    </li>
                    <li>
                      앱이 자동으로 <strong>현재 학습 문장 + 7성분·9품사 분석 + 패러프레이징 + 한글 발음 가이드 요청 프롬프트</strong>를 클립보드에 복사하면서 해당 AI 창을 엽니다.
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                        <li>
                          <strong>ChatGPT / Claude:</strong> 프롬프트가 입력창에 자동으로 채워진 상태로 열리므로 전송 버튼만 누르면 됩니다.
                        </li>
                        <li>
                          <strong>Gemini:</strong> 복사된 프롬프트가 클립보드에 들어 있으므로 입력창에 <strong>붙여넣기(Cmd + V 또는 터치 후 붙여넣기)</strong> 하시면 바로 답변을 받을 수 있습니다.
                        </li>
                      </ul>
                    </li>
                  </ol>
                </div>

                {/* 2. 앱 화면 안에서 실시간으로 쓰는 법 (내장 API 모드) */}
                <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-3">
                  <h3 className="text-sm font-black text-blue-600 dark:text-blue-400">
                    2. 앱 화면 안에서 실시간으로 쓰는 법 (내장 API 모드)
                  </h3>
                  <p className="font-semibold">
                    API 키를 한 번만 등록해 두면 외부 창으로 나가지 않고 앱 내부에서 16노드 구문 다이어그램 해부와 실시간 1:1 문장 첨삭이 즉시 작동합니다.
                  </p>

                  <div className="space-y-1.5">
                    <div className="font-extrabold text-indigo-500">
                      ① 엔진 선택 및 API 키 등록 (최초 1회)
                    </div>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        좌측 <strong>🤖 4대 최신 AI 엔진 통합 허브</strong>에서 주력으로 사용할 AI 버튼을 클릭합니다.
                        <div className="pl-4 text-slate-600 dark:text-slate-300">
                          - <strong>🤖 ChatGPT (OpenAI) / ✨ Gemini (Google) / 🧠 Claude (Anthropic) / 🍎 Siri + 내장코치</strong> (키가 없을 때 쓰는 내장 규칙 코치)
                        </div>
                      </li>
                      <li>
                        바로 위 <strong>[🔑 API·모델 설정]</strong> 버튼을 눌러 사용하실 API 키를 입력합니다. 입력한 키는 외부 서버가 아닌 성만 님의 아이패드 브라우저(<code>localStorage</code>)에만 안전하게 저장됩니다.
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                          <li>
                            <strong>Google Gemini (AIza...):</strong> Google AI Studio에서 Google 계정 로그인 후 무료 한도 내에서 바로 발급 가능
                          </li>
                          <li>
                            <strong>OpenAI ChatGPT (sk-...):</strong> OpenAI Platform에서 발급
                          </li>
                          <li>
                            <strong>Anthropic Claude (sk-ant-...):</strong> Claude Console에서 발급
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="font-extrabold text-indigo-500">
                      ② 실전 활용 기능 2가지
                    </div>
                    <ul className="list-disc list-inside space-y-1.5">
                      <li>
                        <strong>STEP 3 — 외부 영어 문장 16노드 정밀 해부:</strong>
                        <div className="pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                          <div>
                            - 다이어그램 위 입력창에 교과서·뉴스·원서 등 분석하고 싶은 영어 문장을 붙여넣고 <strong>[✨ CHATGPT / GEMINI / CLAUDE 16노드 해부]</strong> 버튼을 누릅니다.
                          </div>
                          <div>
                            - 선택한 AI가 문장의 각 어절을 7개 문장 성분(S, V, IO, DO, SC, OC, M)과 9품사로 분석해 상단 다이어그램 연결선과 하단 어절 카드에 즉시 표시합니다. (API 키가 없어도 내장 추정 분석기가 자동 작동합니다.)
                          </div>
                        </div>
                      </li>
                      <li>
                        <strong>STEP 5 — 1:1 영작 첨삭 & 시리 음성 답변:</strong>
                        <div className="pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                          <div>
                            - 하단 코치 입력창에 영어로 문장을 적고 <strong>[✨ AI 첨삭·시리발화]</strong> 버튼을 누릅니다. (입력창을 비워둔 채 누르면 현재 레슨의 대표 패턴 문장을 기준으로 코칭을 시작합니다.)
                          </div>
                          <div>
                            - AI가 문법 오류 교정과 고급 패러프레이징 문장을 띄워주며, <strong>🍎 첨삭 후 시리 음성 자동 읽기</strong>가 켜져 있으면 교정된 영어 문장을 시리 목소리로 즉시 읽어줍니다.
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 3. Apple Siri(시리) 음성 & 1~6회 반복 플레이어 활용법 */}
                <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">
                    3. 🍎 Apple Siri(시리) 음성 & 1~6회 반복 플레이어 활용법
                  </h3>
                  <p className="font-semibold">
                    좌측 최상단 <strong>🍎 시리(Siri) 음성 & 1~6회 반복 플레이어</strong>는 아이패드/아이폰 Safari에 내장된 애플 신경망 음성 엔진과 받아쓰기를 연동합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5">
                    <li>
                      <strong>시리 목소리 우선 연결:</strong> 드롭다운을 기본값인 <strong>🍎 Apple Siri / 고품질 신경망 보이스 자동 우선 매칭</strong>으로 두면 기기에 설치된 Siri, Premium, Enhanced 음성을 1순위로 자동 선택합니다. (iPadOS <code>설정 - 손쉬운 사용 - 말하기 콘텐츠 - 음성 - 영어</code>에서 Siri 또는 고품질 음성을 미리 다운로드해 두시면 더욱 자연스러운 원어민 발음이 나옵니다.)
                    </li>
                    <li>
                      <strong>핸즈프리 음성 대화:</strong> STEP 5 하단의 <strong>[🎙️ 시리 음성발화]</strong> 버튼을 누르고 영어로 말하면 받아쓰기로 텍스트가 입력되며, 이어서 <strong>[✨ AI 첨삭·시리발화]</strong>를 누르면 교정된 답변을 시리 음성으로 바로 들을 수 있습니다.
                    </li>
                    <li>
                      <strong>무단어 즉시 재생 & 1~6회 반복 듣기:</strong> 단어를 따로 선택하지 않은 상태에서도 상단 <strong>[🔊 즉시 오디오 듣기]</strong>를 누르면 현재 학습 트랙의 대표 문장이 바로 재생되며, <strong>1회 ~ 6회</strong> 반복 횟수를 지정해 두면 모든 스피커 버튼에서 설정한 횟수만큼 연속 재생됩니다.
                    </li>
                  </ul>
                </div>
              </div>

              {/* ============================================================ */}
              {/* [파트 C] 핵심 엔지니어링 & 문법 검증 아키텍처 요약 4대 카드 */}
              {/* ============================================================ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-blue-500">
                    1. 16개 문법 노드(7성분 + 9품사) 및 보충어(Complement)·부가어(Adjunct) 구분
                  </h3>
                  <p>
                    • <strong>보충어와 수식어/부가어의 엄밀한 설명:</strong> 7성분 다이어그램의 <code>M</code> 노드를 단순 부가어(Adjunct)와 동사가 필수적으로 요구하는 전치사구 보충어(Complement: <code>stick to ~</code>, <code>blend A with B</code>)로 구분해 설명하여 영문법적 정확성을 확보했습니다.
                  </p>
                  <p>
                    • <strong>미국식 IPA 통일 및 한글 근사 발음 기준 안내:</strong> 모든 IPA를 미국식 표준(<code>/ˈriː.ə.li/</code> 등)으로 통일하고, 한글 발음은 근사 표기임을 명시하여 IPA와 원어민 음성을 우선 기준으로 삼도록 안내합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-emerald-500">
                    2. 4대 최신 AI 통합 허브 & 자동 문장 해부기의 투명한 한계 고지
                  </h3>
                  <p>
                    • <strong>사전 검증 토큰 맵 + AI 실시간 해부:</strong> 핵심 예문은 수작업으로 검증된 토큰 맵(<code>VERIFIED_SENTENCE_TOKEN_MAP</code>)으로 100% 정확히 표시하며, 외부 미등록 문장은 4대 AI API 또는 내장 간이 규칙 엔진으로 분석하되 <strong>참고용 추정 분류임</strong>을 투명하게 고지합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                  <h3 className="text-sm font-black text-amber-500">
                    3. <code>src/studyData.ts</code> 정직한 데이터 구성 및 출처 투명성
                  </h3>
                  <p>
                    • <strong>코어 80단어 고정 풀(Set 1~4 순환):</strong> 4대 영역별 20개씩 총 80개 핵심 어휘와 파생어 족보를 4주기로 순환 복습하도록 구성했습니다.
                  </p>
                  <p>
                    • <strong>창작 학술 지문 6선 & 빈출 어법 10문항:</strong> 모든 구문 아카이브(12선), 창작 학술 독해 예문(6선), 빈출 어법 문제(10문항)는 과장된 외부 출처 표기 없이 학습용 창작·검증 예문으로 투명하게 제공됩니다.
                  </p>
                </div>
<div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 space-y-2">
                <h3 className="text-sm font-black text-rose-500">
                  4. 아이패드(iPadOS Safari) 애플펜슬 벡터 획 배열(<code>strokesRef</code>) 엔진
                </h3>
                <p>
                  • <strong>실제 필압 반영 및 시각적 완성도:</strong> 만년필 도구에서 포인트의 실제 <code>pressure</code>(필압) 값을 선 두께에 반영하며, 5단계 굵기(<code>1.5~9px</code>), 형광펜 5색 및 3단계 투명도(<code>15/30/60%</code>)를 지원합니다.
                </p>
                <p>
                  • <strong>최근 200획 자동 보존 및 다크모드 반전:</strong> 최근 200획까지 브라우저 스토리지에 안전하게 자동 보존하며, ↩️ 실행취소(Undo), 메모장 접기 시 필기 보존(<code>hidden</code> 클래스), 펜 색상 자동 대비 반전 기능을 탑재했습니다.
                </p>
              </div>

              {/* [파트 D] 원어민·언어학 교수진 합동 최종 검수 및 정밀 패치 노트 */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🔬 [파트 D] 원어민·언어학 교수진 합동 최종 검수 및 정밀 패치 노트</span>
                  </h4>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    최종 무결성 검증 완료
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="font-black text-emerald-800 dark:text-emerald-300 mb-1">
                      ① 코어 80단어 & 테마 어휘 ‘예문-문장성분’ 1:1 완전 일치화
                    </div>
                    <p>
                      • 단어장 카드의 <code>[품사 · 예문내 문장성분]</code> 배지와 실제 영어 예문 속 통사 역할이 어긋나지 않도록 전수 대조하여 교정했습니다.<br />
                      • <code>adaptation</code>(주어 S), <code>feasible</code>(5형식 목적격보어 OC), <code>streamline</code>·<code>put off</code> 등 준동사에 묶여 있던 동사들을 모두 주절의 본동사(V) 예문으로 통일하고, 테마 어휘 빈칸 예문 5건(<code>id: 106, 304, 306, 402, 404</code>)도 본동사 자리에 맞췄습니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="font-black text-blue-800 dark:text-blue-300 mb-1">
                      ② 미국식 표준 IPA · 강세 · 원어민 발음 디테일 정밀 교정
                    </div>
                    <p>
                      • 모음 소리(<code>entire</code>, <code>approval</code>, <code>audience</code>, <code>updated</code>) 앞 정관사 <code>the</code>의 IPA를 <code>/ði/</code>(<code>[디]</code>)로 통일하고, 동사 <code>overhaul</code>의 3음절 강세(<code>/ˌoʊ.vɚˈhɔːl/</code>) 및 <code>ourselves</code>(<code>/ˌaʊ.ɚˈselvz/</code>) 표기를 일치시켰습니다.<br />
                      • <code>vlogs</code>의 원어민 1음절 자음군 발음(<code>/vlɑːɡz/</code>, <code>[블로그즈]</code>), <code>Adequate</code>(<code>[애더쿼트]</code>), <code>during</code>(<code>[두링(듀링)]</code>), <code>All components</code>(<code>[올 컴포넌츠]</code>), 요청 의문문 끝올림 억양(<code>↗</code>), 핵심 학술어 <code>mitigate</code> 교체를 완료했습니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <div className="font-black text-indigo-800 dark:text-indigo-300 mb-1">
                      ③ STEP 3 16노드 다이어그램 & 자동 구문 분석기 알고리즘 고도화
                    </div>
                    <p>
                      • 1형식 문장의 부사적 to부정사 내부 목적어(<code>head.</code>)나 동명사 주어 내부 목적어(<code>workflow</code>, <code>texts</code>)가 주절의 직접목적어(<code>DO</code>) 노드를 오점등하지 않도록 각각 <code>M</code>(부사구 내부 목적어)과 <code>S</code>(주어구 내부 목적어)로 정밀 분리했습니다.<br />
                      • 자동 분석기(<code>buildDynamicDiagramSentence</code>)에서 조동사 의문문의 주어(<code>S</code>) 오분류와 주어 뒤 전치사구(<code>inPrepPhrase</code>) 고착 현상을 해결하고, 어법 3번(<code>What matters most</code> 주어절) 해설과 구문 7번(<code>The more ~ tend to show</code>) 패러프레이즈를 바로잡았습니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="font-black text-purple-800 dark:text-purple-300 mb-1">
                      ④ 실시간 영영사전 API & Google 뉴스 RSS 연동 안정화
                    </div>
                    <p>
                      • 영영사전 API 조회 시 관사·대명사 등 첫 기능어(<code>stopSet</code>)를 건너뛰고 핵심 단어를 추출하며, 404 미등재·복합어 조회 시 과장 없는 정확한 안내 문구를 출력합니다.<br />
                      • Google 뉴스 RSS 호출 시 <code>encodeURIComponent</code>로 쿼리 유실을 방지하고, 실시간 뉴스 헤드라인(<code>setLiveNewsHeadlines</code>)을 기존 영어 학습 표현과 분리하여 한·영 의미 불일치를 원천 차단했습니다.
                    </p>
                  </div>
                </div>
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
