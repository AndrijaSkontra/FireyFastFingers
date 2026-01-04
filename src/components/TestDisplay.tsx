import { TestItem } from '../types/test.types';
import { getPlatformComboDisplay } from '../utils/platformUtils';

interface TestDisplayProps {
  item: TestItem;
  currentInput: string;
  feedback: 'correct' | 'incorrect' | null;
  isPaused: boolean;
  capsLockOn: boolean;
}

export function TestDisplay({ item, currentInput, feedback, isPaused, capsLockOn }: TestDisplayProps) {
  if (!item) {
    return null;
  }

  // Determine background color based on item type
  const getBackgroundClass = () => {
    switch (item.type) {
      case 'word':
        return 'bg-blue-600/20 border-blue-500';
      case 'symbol':
        return 'bg-purple-600/20 border-purple-500';
      case 'number':
        return 'bg-green-600/20 border-green-500';
      case 'numberSequence':
        return 'bg-emerald-600/20 border-emerald-500';
      case 'combo':
        return 'bg-orange-600/20 border-orange-500';
      case 'modifier':
        // Check if it's a special key or a modifier key
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(item.expectedKeys[0])) {
          return 'bg-pink-600/20 border-pink-500';
        } else {
          return 'bg-cyan-600/20 border-cyan-500';
        }
      default:
        return 'bg-gray-600/20 border-gray-500';
    }
  };

  // Determine label text
  const getLabel = () => {
    switch (item.type) {
      case 'word':
        return 'Word';
      case 'symbol':
        return 'Symbol';
      case 'number':
        return 'Number';
      case 'numberSequence':
        return 'Number Sequence';
      case 'combo':
        return 'Key Combo';
      case 'modifier':
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(item.expectedKeys[0])) {
          return 'Modifier Key';
        } else {
          return 'Special Key';
        }
      default:
        return 'Type';
    }
  };

  // Apply feedback animation classes
  const getFeedbackClass = () => {
    if (feedback === 'correct') return 'animate-flash-green';
    if (feedback === 'incorrect') return 'animate-shake-red';
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Caps Lock indicator */}
      {capsLockOn && (
        <div className="bg-yellow-600/20 border border-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="text-yellow-500 text-xl">⚠</div>
          <div className="text-yellow-200 font-semibold">Caps Lock is ON</div>
        </div>
      )}

      {/* Type label */}
      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        {getLabel()}
      </div>

      {/* Main display box */}
      <div
        className={`
          relative min-w-[400px] px-12 py-16 rounded-2xl border-2
          ${getBackgroundClass()}
          ${getFeedbackClass()}
          transition-all duration-200
        `}
      >
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl z-10">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Paused</div>
              <div className="text-sm text-gray-400">Return to tab to resume</div>
            </div>
          </div>
        )}

        <div className="text-center">
          {/* Display text */}
          <div className="text-6xl font-bold mb-4">
            {(item.type === 'word' || item.type === 'numberSequence') ? (
              <span>
                <span className="text-green-400">{currentInput}</span>
                <span>{item.display.slice(currentInput.length)}</span>
              </span>
            ) : (
              <span>{getPlatformComboDisplay(item.display)}</span>
            )}
          </div>

          {/* Helper text for combos and modifiers */}
          {item.type === 'combo' && (
            <div className="text-sm text-gray-400 mt-2">
              Press these keys together
            </div>
          )}
          {item.type === 'modifier' && (
            <div className="text-sm text-gray-400 mt-2">
              {['Control', 'Shift', 'Alt', 'Meta'].includes(item.expectedKeys[0])
                ? 'Press and release this modifier key alone'
                : 'Press this key'}
            </div>
          )}
          {item.type === 'word' && (
            <div className="text-sm text-gray-400 mt-2">
              Type the word
            </div>
          )}
          {item.type === 'numberSequence' && (
            <div className="text-sm text-gray-400 mt-2">
              Type the number sequence
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
