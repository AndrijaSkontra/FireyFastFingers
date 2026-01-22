import { useState, useEffect, useCallback, useRef } from 'react';
import type { TestState, TestItem, TestResult, DistributionConfig } from '../types/test.types';
import { generateTestItems } from '../utils/testGenerator';
import {
  normalizeKey,
  isModifierKey,
  validateRegularKey,
  validateCombo,
  onlyKeysPressed,
  shouldPreventDefault,
} from '../utils/keyboardUtils';

const TOTAL_ITEMS = 100;

type PerformanceGroupKey =
  | 'word'
  | 'symbol'
  | 'number'
  | 'numberSequence'
  | 'combo'
  | 'modifierKey'
  | 'specialKey';

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

function getPerformanceGroupKey(item: TestItem): PerformanceGroupKey {
  if (item.type !== 'modifier') return item.type;
  const firstExpected = item.expectedKeys[0] ?? '';
  return MODIFIER_KEYS.has(firstExpected) ? 'modifierKey' : 'specialKey';
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mad(values: number[], med: number): number {
  if (values.length === 0) return 0;
  const deviations = values.map(v => Math.abs(v - med));
  return median(deviations);
}

export function useTypingTest() {
  const [testState, setTestState] = useState<TestState>({
    items: [],
    currentIndex: 0,
    startTime: null,
    endTime: null,
    results: [],
    isActive: false,
    isPaused: false,
  });

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentInput, setCurrentInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);

  // Track if modifier was pressed alone (for standalone modifier validation)
  const modifierAloneRef = useRef<boolean>(false);
  const pauseStartTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  // Track attempts per item to determine if correct on first try
  const itemAttemptsRef = useRef<Map<string, number>>(new Map());
  // Track timing for the currently displayed item (more accurate than using previous result timestamp)
  const itemStartTimeRef = useRef<number>(0);
  const itemPausedTimeRef = useRef<number>(0);
  // Per-type rolling performance baseline (successful, non-outlier samples)
  const performanceHistoryRef = useRef<Map<PerformanceGroupKey, number[]>>(new Map());
  const repeatIdCounterRef = useRef<number>(0);

  const currentItem = testState.items[testState.currentIndex];

  const isSlowTime = useCallback((item: TestItem, timeTakenMs: number) => {
    const groupKey = getPerformanceGroupKey(item);
    const history = performanceHistoryRef.current.get(groupKey) ?? [];

    // Don't judge until we have a reasonable baseline.
    const minSamples = 8;
    if (history.length < minSamples) return { groupKey, slow: false, thresholdMs: null };

    const med = median(history);
    const madValue = mad(history, med);
    const robustSigma = 1.4826 * madValue;

    const k = 3;
    const minSlowMs = 1500;
    const thresholdMs =
      robustSigma > 0
        ? med + k * robustSigma
        : Math.max(minSlowMs, med * 2); // guard when MAD=0

    const slow = timeTakenMs > thresholdMs && timeTakenMs > minSlowMs;
    return { groupKey, slow, thresholdMs };
  }, []);

  const maybeRecordBaselineSample = useCallback((item: TestItem, timeTakenMs: number, isSlow: boolean) => {
    // Keep baseline representative: only record non-outlier successful samples.
    if (isSlow) return;

    const groupKey = getPerformanceGroupKey(item);
    const history = performanceHistoryRef.current.get(groupKey) ?? [];
    const next = [...history, timeTakenMs];
    const windowSize = 30;
    const clipped = next.length > windowSize ? next.slice(next.length - windowSize) : next;
    performanceHistoryRef.current.set(groupKey, clipped);
  }, []);

  // Reset per-item timers whenever the current item changes / test starts
  useEffect(() => {
    if (!testState.isActive) return;
    itemStartTimeRef.current = Date.now();
    itemPausedTimeRef.current = 0;
  }, [testState.isActive, testState.currentIndex]);

  // Start test
  const startTest = useCallback((config?: DistributionConfig) => {
    const items = generateTestItems(TOTAL_ITEMS, config);
    setTestState({
      items,
      currentIndex: 0,
      startTime: Date.now(),
      endTime: null,
      results: [],
      isActive: true,
      isPaused: false,
    });
    setCurrentInput('');
    setFeedback(null);
    totalPausedTimeRef.current = 0;
    itemAttemptsRef.current.clear();
    itemStartTimeRef.current = Date.now();
    itemPausedTimeRef.current = 0;
  }, []);

  // Reset test
  const resetTest = useCallback(() => {
    setTestState({
      items: [],
      currentIndex: 0,
      startTime: null,
      endTime: null,
      results: [],
      isActive: false,
      isPaused: false,
    });
    setCurrentInput('');
    setFeedback(null);
    setPressedKeys(new Set());
    totalPausedTimeRef.current = 0;
    itemAttemptsRef.current.clear();
    itemStartTimeRef.current = 0;
    itemPausedTimeRef.current = 0;
  }, []);

  // Pause test
  const pauseTest = useCallback(() => {
    if (testState.isActive && !testState.isPaused) {
      pauseStartTimeRef.current = Date.now();
      setTestState(prev => ({ ...prev, isPaused: true }));
    }
  }, [testState.isActive, testState.isPaused]);

  // Resume test
  const resumeTest = useCallback(() => {
    if (testState.isActive && testState.isPaused) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      totalPausedTimeRef.current += pausedDuration;
      itemPausedTimeRef.current += pausedDuration;
      setTestState(prev => ({ ...prev, isPaused: false }));
    }
  }, [testState.isActive, testState.isPaused]);

  // Record result and move to next item (only if correct)
  const recordResult = useCallback((success: boolean, clearInput: boolean = true) => {
    if (!currentItem) return;

    // Increment attempt count for this item
    const currentAttempts = (itemAttemptsRef.current.get(currentItem.id) || 0) + 1;
    itemAttemptsRef.current.set(currentItem.id, currentAttempts);
    const isFirstTry = currentAttempts === 1;

    // Show feedback
    setFeedback(success ? 'correct' : 'incorrect');
    setTimeout(() => setFeedback(null), 300);

    // Only proceed if correct
    if (!success) {
      // Reset input state but don't advance (optionally keep input for visual feedback)
      if (clearInput) {
        setCurrentInput('');
      }
      setPressedKeys(new Set());
      modifierAloneRef.current = false;
      return;
    }

    const timeTakenMs = Math.max(0, Date.now() - itemStartTimeRef.current - itemPausedTimeRef.current);
    const slowEval = isSlowTime(currentItem, timeTakenMs);

    // Keep baseline representative: record only non-outlier successful samples.
    // (This applies to normal items and repeats.)
    maybeRecordBaselineSample(currentItem, timeTakenMs, slowEval.slow);

    const originalItemId = currentItem.originalItemId ?? currentItem.id;
    const repeatCount = (currentItem.repeatCount ?? 0) + 1;
    const shouldScheduleRepeat = slowEval.slow;

    const now = Date.now();
    const result: TestResult = {
      itemId: currentItem.id,
      success: true,
      timestamp: now,
      timeTaken: timeTakenMs,
      correctOnFirstTry: isFirstTry,
    };

    setTestState(prev => {
      const newResults = [...prev.results, result];
      const newIndex = prev.currentIndex + 1;
      let newItems = prev.items;

      if (shouldScheduleRepeat) {
        const repeatInstance: TestItem = {
          ...currentItem,
          id: `repeat-${originalItemId}-${repeatCount}-${repeatIdCounterRef.current++}`,
          originalItemId,
          isRepeat: true,
          repeatCount,
        };

        // Insert after one intervening item: A -> B -> A-repeat.
        // If we're at/near the end, insertion clamps to the end (no intervening item possible).
        const insertIndex = Math.min(prev.currentIndex + 2, prev.items.length);
        newItems = [
          ...prev.items.slice(0, insertIndex),
          repeatInstance,
          ...prev.items.slice(insertIndex),
        ];
      }

      // Check if test is complete
      if (newIndex >= newItems.length) {
        return {
          ...prev,
          results: newResults,
          currentIndex: newIndex,
          endTime: now,
          isActive: false,
          items: newItems,
        };
      }

      return {
        ...prev,
        results: newResults,
        currentIndex: newIndex,
        items: newItems,
      };
    });

    // Reset input state
    setCurrentInput('');
    setPressedKeys(new Set());
    modifierAloneRef.current = false;
  }, [testState, currentItem, isSlowTime, maybeRecordBaselineSample]);

  // Skip current item
  const skipItem = useCallback(() => {
    if (!currentItem) return;

    // Increment attempt count for this item
    const currentAttempts = (itemAttemptsRef.current.get(currentItem.id) || 0) + 1;
    itemAttemptsRef.current.set(currentItem.id, currentAttempts);

    // Record as skipped (success: false, correctOnFirstTry: false)
    const result: TestResult = {
      itemId: currentItem.id,
      success: false,
      timestamp: Date.now(),
      timeTaken: Math.max(0, Date.now() - itemStartTimeRef.current - itemPausedTimeRef.current),
      correctOnFirstTry: false,
    };

    setTestState(prev => {
      const newResults = [...prev.results, result];
      const newIndex = prev.currentIndex + 1;

      // Check if test is complete
      if (newIndex >= prev.items.length) {
        return {
          ...prev,
          results: newResults,
          currentIndex: newIndex,
          endTime: Date.now(),
          isActive: false,
        };
      }

      return {
        ...prev,
        results: newResults,
        currentIndex: newIndex,
      };
    });

    // Reset input state
    setCurrentInput('');
    setPressedKeys(new Set());
    modifierAloneRef.current = false;
    setFeedback(null);
  }, [testState, currentItem]);

  // Handle key down
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check Caps Lock state
    setCapsLockOn(event.getModifierState('CapsLock'));

    // Prevent default for all keys during active test
    if (shouldPreventDefault(event, testState.isActive && !testState.isPaused)) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!testState.isActive || testState.isPaused || !currentItem) return;

    // Get the key character, handling edge cases like backtick/tilde
    const rawKey = event.key || '';
    let key: string;
    
    // For backtick/tilde, handle special cases
    if (rawKey === 'Backquote' || event.code === 'Backquote') {
      key = event.shiftKey ? '~' : '`';
    } else {
      key = normalizeKey(rawKey);
    }

    // Add key to pressed keys set
    setPressedKeys(prev => new Set([...prev, key]));

    // Handle different item types
    if (currentItem.type === 'word' || currentItem.type === 'numberSequence') {
      // Handle backspace key
      if (key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1));
        return;
      }

      // For words and number sequences, accumulate characters (including wrong ones)
      if (key.length === 1 && !isModifierKey(key)) {
        setCurrentInput(prev => {
          const newInput = prev + key;

          // Check if input is complete and correct
          if (newInput === currentItem.display && currentItem.display.startsWith(prev + key)) {
            recordResult(true);
            return '';
          }

          // Allow any character to be added so user can see their mistakes
          return newInput;
        });
      }
    } else if (currentItem.type === 'symbol' || currentItem.type === 'number') {
      // Handle backspace key
      if (key === 'Backspace') {
        setCurrentInput('');
        return;
      }

      // For symbols and numbers, show what was typed
      if (key.length === 1 && !isModifierKey(key)) {
        setCurrentInput(key);
        const success = validateRegularKey(key, currentItem.expectedKeys[0]);
        if (success) {
          // Correct input - advance to next item
          setTimeout(() => recordResult(true), 100); // Small delay to show feedback
        }
        // If wrong, keep the input visible so user can see their mistake
      }
    } else if (currentItem.type === 'combo') {
      // For key combinations, validate the combo
      const success = validateCombo(event, currentItem.expectedKeys);
      if (success) {
        // Show the successful combo briefly before advancing
        const comboDisplay = Array.from(pressedKeys).concat(key).join('+');
        setCurrentInput(comboDisplay);
        setTimeout(() => recordResult(true), 100);
      } else if (!isModifierKey(key)) {
        // Show the wrong combo attempt (user can immediately retry, no backspace needed)
        const comboDisplay = Array.from(pressedKeys).concat(key).join('+');
        setCurrentInput(comboDisplay);
      }
    } else if (currentItem.type === 'modifier') {
      // For standalone modifiers and special keys
      const expectedKey = normalizeKey(currentItem.expectedKeys[0]);

      // Check if it's a modifier key (Ctrl, Shift, Alt, Meta) or a special key (Enter, Esc, Tab, etc.)
      const isExpectedModifier = isModifierKey(expectedKey);

      if (isExpectedModifier) {
        // Modifier keys - need to validate they're pressed alone
        if (pressedKeys.size === 0 && key === expectedKey) {
          // First key press is the expected modifier
          modifierAloneRef.current = true;
        } else if (pressedKeys.size > 0) {
          // Another key was pressed - fail
          modifierAloneRef.current = false;
          if (!isModifierKey(key)) {
            recordResult(false);
          }
        }
      } else {
        // Special keys (Enter, Esc, Tab, etc.) - validate immediately on keydown
        if (key === expectedKey) {
          recordResult(true);
        } else if (!isModifierKey(key)) {
          recordResult(false);
        }
      }
    }
  }, [testState, currentItem, pressedKeys, recordResult]);

  // Handle key up
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!testState.isActive || testState.isPaused || !currentItem) return;

    const key = normalizeKey(event.key);

    // For standalone modifiers, validate on key up
    if (currentItem.type === 'modifier') {
      const expectedKey = normalizeKey(currentItem.expectedKeys[0]);

      if (key === expectedKey && modifierAloneRef.current && pressedKeys.size === 1) {
        // Modifier was pressed and released alone - success!
        recordResult(true);
      }
    }

    // Remove key from pressed keys set
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [testState, currentItem, pressedKeys, recordResult]);

  // Set up keyboard listeners
  useEffect(() => {
    if (testState.isActive) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [testState.isActive, handleKeyDown, handleKeyUp]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTest();
      } else {
        resumeTest();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseTest, resumeTest]);

  return {
    testState,
    currentItem,
    currentInput,
    feedback,
    capsLockOn,
    startTest,
    resetTest,
    skipItem,
    pauseTest,
    resumeTest,
    totalPausedTime: totalPausedTimeRef.current,
  };
}
