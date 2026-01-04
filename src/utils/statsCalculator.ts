import { TestItem, TestResult, Stats } from '../types/test.types';
import { getItemCharCount } from './testGenerator';

// Calculate WPM (Words Per Minute) - standard formula
export function calculateWPM(
  items: TestItem[],
  results: TestResult[],
  totalTimeMs: number
): number {
  if (totalTimeMs === 0 || results.length === 0) return 0;

  const totalChars = results.reduce((sum, result) => {
    if (result.success) {
      const item = items.find(i => i.id === result.itemId);
      if (item) {
        return sum + getItemCharCount(item);
      }
    }
    return sum;
  }, 0);

  const minutes = totalTimeMs / 60000;
  const wpm = (totalChars / 5) / minutes;

  return Math.round(wpm);
}

// Calculate IPM (Items Per Minute)
export function calculateIPM(
  results: TestResult[],
  totalTimeMs: number
): number {
  if (totalTimeMs === 0) return 0;

  const successfulItems = results.filter(r => r.success).length;
  const minutes = totalTimeMs / 60000;

  return Math.round(successfulItems / minutes);
}

// Calculate accuracy percentage (only counting items correct on first try)
export function calculateAccuracy(results: TestResult[]): number {
  if (results.length === 0) return 0;

  const firstTryCorrect = results.filter(r => r.correctOnFirstTry).length;
  return Math.round((firstTryCorrect / results.length) * 100);
}

// Get breakdown by item type
export function getTypeBreakdown(
  items: TestItem[],
  results: TestResult[]
) {
  const breakdown = {
    word: { total: 0, correct: 0 },
    symbol: { total: 0, correct: 0 },
    number: { total: 0, correct: 0 },
    numberSequence: { total: 0, correct: 0 },
    combo: { total: 0, correct: 0 },
    modifier: { total: 0, correct: 0 },
  };

  results.forEach(result => {
    const item = items.find(i => i.id === result.itemId);
    if (item) {
      breakdown[item.type].total++;
      if (result.correctOnFirstTry) {
        breakdown[item.type].correct++;
      }
    }
  });

  return breakdown;
}

// Calculate all statistics
export function calculateStats(
  items: TestItem[],
  results: TestResult[],
  startTime: number,
  endTime: number
): Stats {
  const totalTime = endTime - startTime;

  return {
    wpm: calculateWPM(items, results, totalTime),
    ipm: calculateIPM(results, totalTime),
    accuracy: calculateAccuracy(results),
    totalTime: totalTime,
    breakdown: getTypeBreakdown(items, results),
  };
}

// Format time in MM:SS format
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Calculate real-time WPM during test
export function calculateRealTimeWPM(
  items: TestItem[],
  results: TestResult[],
  startTime: number
): number {
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;

  if (elapsedTime < 1000) return 0; // Don't calculate until at least 1 second

  return calculateWPM(items, results, elapsedTime);
}
