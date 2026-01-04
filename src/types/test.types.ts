export type TestItemType = 'word' | 'symbol' | 'number' | 'numberSequence' | 'combo' | 'modifier';

export interface TestItem {
  id: string;
  type: TestItemType;
  display: string; // What to show user: "Ctrl+A", "@", "hello"
  expectedKeys: string[]; // For validation: ['Control', 'a'] or ['@']
  requiresSimultaneous: boolean; // true for combos/modifiers
}

export interface TestResult {
  itemId: string;
  success: boolean;
  timestamp: number;
  timeTaken: number;
  correctOnFirstTry: boolean; // true if item was correct on the first attempt
}

export interface TestState {
  items: TestItem[];
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  results: TestResult[];
  isActive: boolean;
  isPaused: boolean;
}

export interface Stats {
  wpm: number;
  ipm: number;
  accuracy: number;
  totalTime: number;
  breakdown: {
    word: { total: number; correct: number };
    symbol: { total: number; correct: number };
    number: { total: number; correct: number };
    numberSequence: { total: number; correct: number };
    combo: { total: number; correct: number };
    modifier: { total: number; correct: number };
  };
}

export interface KeyCombo {
  display: string;
  keys: string[];
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  mainKey: string;
}
