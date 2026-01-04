import { useState, useEffect, useCallback, useRef } from 'react';
import { TestState, TestItem, TestResult } from '../types/test.types';
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

  const currentItem = testState.items[testState.currentIndex];

  // Start test
  const startTest = useCallback(() => {
    const items = generateTestItems(TOTAL_ITEMS);
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
      setTestState(prev => ({ ...prev, isPaused: false }));
    }
  }, [testState.isActive, testState.isPaused]);

  // Record result and move to next item (only if correct)
  const recordResult = useCallback((success: boolean) => {
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
      // Reset input state but don't advance
      setCurrentInput('');
      setPressedKeys(new Set());
      modifierAloneRef.current = false;
      return;
    }

    const itemStartTime = testState.results.length === 0 && testState.startTime
      ? testState.startTime
      : testState.results[testState.results.length - 1]?.timestamp || Date.now();

    const result: TestResult = {
      itemId: currentItem.id,
      success: true,
      timestamp: Date.now(),
      timeTaken: Date.now() - itemStartTime,
      correctOnFirstTry: isFirstTry,
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
  }, [testState, currentItem]);

  // Skip current item
  const skipItem = useCallback(() => {
    if (!currentItem) return;

    // Increment attempt count for this item
    const currentAttempts = (itemAttemptsRef.current.get(currentItem.id) || 0) + 1;
    itemAttemptsRef.current.set(currentItem.id, currentAttempts);

    const itemStartTime = testState.results.length === 0 && testState.startTime
      ? testState.startTime
      : testState.results[testState.results.length - 1]?.timestamp || Date.now();

    // Record as skipped (success: false, correctOnFirstTry: false)
    const result: TestResult = {
      itemId: currentItem.id,
      success: false,
      timestamp: Date.now(),
      timeTaken: Date.now() - itemStartTime,
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
      // For words and number sequences, accumulate characters
      if (key.length === 1 && !isModifierKey(key)) {
        setCurrentInput(prev => {
          const newInput = prev + key;

          // Check if input is complete
          if (newInput === currentItem.display) {
            recordResult(true);
            return '';
          }

          // Check if input is still on track
          if (!currentItem.display.startsWith(newInput)) {
            recordResult(false);
            return '';
          }

          return newInput;
        });
      }
    } else if (currentItem.type === 'symbol' || currentItem.type === 'number') {
      // For symbols and numbers, validate single key
      if (key.length === 1 && !isModifierKey(key)) {
        const success = validateRegularKey(key, currentItem.expectedKeys[0]);
        recordResult(success);
      }
    } else if (currentItem.type === 'combo') {
      // For key combinations, validate the combo
      const success = validateCombo(event, currentItem.expectedKeys);
      if (success) {
        recordResult(true);
      } else if (!isModifierKey(key)) {
        // Only fail if a non-modifier key was pressed wrong
        recordResult(false);
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
