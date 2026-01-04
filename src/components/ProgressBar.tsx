import { useEffect, useState } from 'react';
import { TestItem, TestResult } from '../types/test.types';
import { calculateRealTimeWPM, calculateAccuracy, formatTime } from '../utils/statsCalculator';
import { getPlatformComboDisplay } from '../utils/platformUtils';

interface ProgressBarProps {
  currentIndex: number;
  totalItems: number;
  items: TestItem[];
  results: TestResult[];
  startTime: number | null;
}

export function ProgressBar({
  currentIndex,
  totalItems,
  items,
  results,
  startTime,
}: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every 100ms for live stats
  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  const progress = (currentIndex / totalItems) * 100;
  const accuracy = calculateAccuracy(results);
  const wpm = startTime ? calculateRealTimeWPM(items, results, startTime) : 0;
  const elapsedTime = startTime ? currentTime - startTime : 0;

  // Get next few items for preview
  const nextItems = items.slice(currentIndex + 1, currentIndex + 5);

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Progress text */}
      <div className="flex justify-between items-center text-sm font-semibold">
        <span className="text-gray-400">
          Progress: {currentIndex}/{totalItems}
        </span>
        <span className="text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-8 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Time</div>
        </div>

        <div className="border-l border-gray-700" />

        <div>
          <div className="text-2xl font-bold text-blue-400">{wpm}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">WPM</div>
        </div>

        <div className="border-l border-gray-700" />

        <div>
          <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Accuracy</div>
        </div>
      </div>

      {/* Next items preview */}
      {nextItems.length > 0 && (
        <div className="mt-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Next:</div>
          <div className="flex gap-2 flex-wrap">
            {nextItems.map((item, index) => {
              const isSpecialKey = item.type === 'modifier' &&
                !['Control', 'Shift', 'Alt', 'Meta'].includes(item.expectedKeys[0]);

              return (
                <div
                  key={item.id}
                  className={`
                    px-3 py-1 rounded text-sm font-mono
                    ${item.type === 'word' ? 'bg-blue-600/10 text-blue-400' : ''}
                    ${item.type === 'symbol' ? 'bg-purple-600/10 text-purple-400' : ''}
                    ${item.type === 'number' ? 'bg-green-600/10 text-green-400' : ''}
                    ${item.type === 'numberSequence' ? 'bg-emerald-600/10 text-emerald-400' : ''}
                    ${item.type === 'combo' ? 'bg-orange-600/10 text-orange-400' : ''}
                    ${item.type === 'modifier' && !isSpecialKey ? 'bg-pink-600/10 text-pink-400' : ''}
                    ${isSpecialKey ? 'bg-cyan-600/10 text-cyan-400' : ''}
                  `}
                >
                  {getPlatformComboDisplay(item.display)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
