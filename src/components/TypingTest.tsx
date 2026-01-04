import { useTypingTest } from '../hooks/useTypingTest';
import { TestControls } from './TestControls';
import { TestDisplay } from './TestDisplay';
import { ProgressBar } from './ProgressBar';
import { TestResults } from './TestResults';

export function TypingTest() {
  const {
    testState,
    currentItem,
    currentInput,
    feedback,
    capsLockOn,
    startTest,
    resetTest,
    skipItem,
  } = useTypingTest();

  const isTestComplete = testState.endTime !== null;
  const isTestActive = testState.isActive && !isTestComplete;

  // Welcome screen - before test starts
  if (!testState.isActive && !isTestComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <TestControls onStart={startTest} />
      </div>
    );
  }

  // Active test screen
  if (isTestActive && currentItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12 relative">
        {/* Restart button in top-right corner */}
        <button
          onClick={resetTest}
          className="absolute top-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
        >
          Restart Test
        </button>

        {/* Progress bar at top */}
        <ProgressBar
          currentIndex={testState.currentIndex}
          totalItems={testState.items.length}
          items={testState.items}
          results={testState.results}
          startTime={testState.startTime}
        />

        {/* Main test display */}
        <TestDisplay
          item={currentItem}
          currentInput={currentInput}
          feedback={feedback}
          isPaused={testState.isPaused}
          capsLockOn={capsLockOn}
        />

        {/* Next button */}
        <button
          onClick={skipItem}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-base font-semibold rounded-lg transition-colors duration-200"
        >
          Next →
        </button>

        {/* Helper text */}
        <div className="text-center text-sm text-gray-500">
          <p>Type the displayed text or press the shown keys</p>
          <p className="mt-1">Tab switching will pause the test automatically</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (isTestComplete && testState.startTime && testState.endTime) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <TestResults
          items={testState.items}
          results={testState.results}
          startTime={testState.startTime}
          endTime={testState.endTime}
          onRestart={resetTest}
        />
      </div>
    );
  }

  return null;
}
