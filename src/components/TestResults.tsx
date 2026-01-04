import { TestItem, TestResult } from '../types/test.types';
import { calculateStats, formatTime } from '../utils/statsCalculator';

interface TestResultsProps {
  items: TestItem[];
  results: TestResult[];
  startTime: number;
  endTime: number;
  onRestart: () => void;
}

export function TestResults({
  items,
  results,
  startTime,
  endTime,
  onRestart,
}: TestResultsProps) {
  const stats = calculateStats(items, results, startTime, endTime);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">Test Complete!</h1>
        <p className="text-gray-400">Here are your results</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <div className="text-5xl font-bold text-blue-400 mb-2">{stats.wpm}</div>
          <div className="text-sm text-gray-400 uppercase tracking-wide">WPM</div>
          <div className="text-xs text-gray-500 mt-1">Words Per Minute</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <div className="text-5xl font-bold text-purple-400 mb-2">{stats.ipm}</div>
          <div className="text-sm text-gray-400 uppercase tracking-wide">IPM</div>
          <div className="text-xs text-gray-500 mt-1">Items Per Minute</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
          <div className={`text-5xl font-bold mb-2 ${getAccuracyColor(stats.accuracy)}`}>
            {stats.accuracy}%
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wide">Accuracy</div>
          <div className="text-xs text-gray-500 mt-1">
            {results.filter(r => r.success).length}/{results.length} correct
          </div>
        </div>
      </div>

      {/* Time stat */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
        <div className="text-3xl font-bold text-white mb-1">
          {formatTime(stats.totalTime)}
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">Total Time</div>
      </div>

      {/* Breakdown by category */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>
        <div className="space-y-3">
          {/* Words */}
          {stats.breakdown.word.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-semibold">Words</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.word.correct}/{stats.breakdown.word.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.word.correct,
                    stats.breakdown.word.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.word.correct, stats.breakdown.word.total)}%
                </span>
              </div>
            </div>
          )}

          {/* Symbols */}
          {stats.breakdown.symbol.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="font-semibold">Symbols</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.symbol.correct}/{stats.breakdown.symbol.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.symbol.correct,
                    stats.breakdown.symbol.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.symbol.correct, stats.breakdown.symbol.total)}%
                </span>
              </div>
            </div>
          )}

          {/* Numbers */}
          {stats.breakdown.number.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-semibold">Numbers</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.number.correct}/{stats.breakdown.number.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.number.correct,
                    stats.breakdown.number.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.number.correct, stats.breakdown.number.total)}%
                </span>
              </div>
            </div>
          )}

          {/* Number Sequences */}
          {stats.breakdown.numberSequence.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-semibold">Number Sequences</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.numberSequence.correct}/{stats.breakdown.numberSequence.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.numberSequence.correct,
                    stats.breakdown.numberSequence.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.numberSequence.correct, stats.breakdown.numberSequence.total)}%
                </span>
              </div>
            </div>
          )}

          {/* Key Combos */}
          {stats.breakdown.combo.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-semibold">Key Combos</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.combo.correct}/{stats.breakdown.combo.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.combo.correct,
                    stats.breakdown.combo.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.combo.correct, stats.breakdown.combo.total)}%
                </span>
              </div>
            </div>
          )}

          {/* Modifiers */}
          {stats.breakdown.modifier.total > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="font-semibold">Modifier Keys</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {stats.breakdown.modifier.correct}/{stats.breakdown.modifier.total}
                </span>
                <span className={`font-bold w-16 text-right ${
                  getAccuracyColor(getCategoryAccuracy(
                    stats.breakdown.modifier.correct,
                    stats.breakdown.modifier.total
                  ))
                }`}>
                  {getCategoryAccuracy(stats.breakdown.modifier.correct, stats.breakdown.modifier.total)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restart button */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors duration-200"
        >
          Take Another Test
        </button>
      </div>
    </div>
  );
}
