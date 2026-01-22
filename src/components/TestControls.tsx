import { getPlatformKeyName } from '../utils/platformUtils';
import type { DistributionConfig } from '../types/test.types';
import { DEFAULT_DISTRIBUTION } from '../types/test.types';

interface TestControlsProps {
  onStart: () => void;
  distribution: DistributionConfig;
  onDistributionChange: (config: DistributionConfig) => void;
}

// Category configuration for UI rendering
const CATEGORIES: Array<{
  key: keyof DistributionConfig;
  label: string;
  description: string;
  color: string;
}> = [
  { key: 'word', label: 'Words', description: 'Common English words', color: 'bg-blue-500' },
  { key: 'symbol', label: 'Symbols', description: '@#$%^&* and more', color: 'bg-purple-500' },
  { key: 'number', label: 'Numbers', description: 'Single digits 0-9', color: 'bg-green-500' },
  { key: 'numberSequence', label: 'Sequences', description: '4-8 digit sequences', color: 'bg-emerald-500' },
  { key: 'combo', label: 'Key Combos', description: 'Ctrl+A, Shift+Enter', color: 'bg-orange-500' },
  { key: 'modifier', label: 'Modifiers', description: 'Ctrl, Shift, Alt alone', color: 'bg-pink-500' },
  { key: 'specialKey', label: 'Special Keys', description: 'Enter, Tab, Arrows', color: 'bg-cyan-500' },
];

export function TestControls({ onStart, distribution, onDistributionChange }: TestControlsProps) {
  const superKeyName = getPlatformKeyName('Meta');
  const altKeyName = getPlatformKeyName('Alt');

  // Calculate total percentage
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const isValid = total === 100;

  // Handle individual category change
  const handleCategoryChange = (key: keyof DistributionConfig, value: number) => {
    onDistributionChange({
      ...distribution,
      [key]: Math.max(0, Math.min(100, value)),
    });
  };

  // Reset to defaults
  const handleReset = () => {
    onDistributionChange(DEFAULT_DISTRIBUTION);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Typing Master
        </h1>
        <p className="text-xl text-gray-400">
          Test your typing speed across all keyboard keys
        </p>
      </div>

      {/* Changelog */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✨</div>
          <div>
            <h3 className="text-lg font-bold text-green-400 mb-2">Latest Updates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">NEW:</span>
                <span className="text-gray-300">Real-time input display - see exactly what you're typing below the target text</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">NEW:</span>
                <span className="text-gray-300">Backspace to correct - wrong characters are blocked until you delete them</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">What You'll Type</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <div className="font-semibold">Words</div>
              <div className="text-sm text-gray-400">Common English words</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5" />
            <div>
              <div className="font-semibold">Symbols</div>
              <div className="text-sm text-gray-400">@#$%^&* and more</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
            <div>
              <div className="font-semibold">Numbers</div>
              <div className="text-sm text-gray-400">Single digits 0-9</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5" />
            <div>
              <div className="font-semibold">Number Sequences</div>
              <div className="text-sm text-gray-400">4-8 digit sequences</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5" />
            <div>
              <div className="font-semibold">Key Combos</div>
              <div className="text-sm text-gray-400">Ctrl+A, Shift+Enter, etc.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-pink-500 mt-1.5" />
            <div>
              <div className="font-semibold">Modifier Keys</div>
              <div className="text-sm text-gray-400">
                Ctrl, Shift, {altKeyName}, {superKeyName} (press alone)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 mt-1.5" />
            <div>
              <div className="font-semibold">Special Keys</div>
              <div className="text-sm text-gray-400">
                Enter, Esc, Tab, Caps Lock, Arrows, Space
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Customization */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Customize Distribution</h2>
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Distribution sliders */}
        <div className="space-y-3">
          {CATEGORIES.map(({ key, label, description, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
              <div className="w-24 flex-shrink-0">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={distribution[key]}
                onChange={(e) => handleCategoryChange(key, parseInt(e.target.value, 10))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center gap-1 w-16 flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={distribution[key]}
                  onChange={(e) => handleCategoryChange(key, parseInt(e.target.value, 10) || 0)}
                  className="w-12 px-2 py-1 text-sm text-center bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-400 text-sm">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total indicator */}
        <div className={`flex items-center justify-between pt-3 border-t border-gray-700 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
          <span className="font-medium">Total:</span>
          <span className="font-bold">{total}%</span>
        </div>
        {!isValid && (
          <div className="text-sm text-red-400 text-center">
            Total must equal 100% to start the test
          </div>
        )}
      </div>

      {/* Test Details */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-center">Test Details</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-white">100</div>
            <div className="text-sm text-gray-400">Items Total</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">WPM</div>
            <div className="text-sm text-gray-400">Speed Metric</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">Live</div>
            <div className="text-sm text-gray-400">Real-Time Stats</div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-yellow-500 text-xl">⚠</div>
          <div className="text-sm text-yellow-200">
            <div className="font-semibold mb-1">Important:</div>
            <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
              <li>Browser shortcuts will be prevented during the test</li>
              <li>Some OS-level shortcuts (like Alt+F4) cannot be prevented</li>
              <li>Switching tabs will pause the test automatically</li>
              <li>Use a physical keyboard (touch devices not supported)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center pt-4">
        <button
          onClick={onStart}
          disabled={!isValid}
          className={`px-12 py-5 text-white text-xl font-bold rounded-xl transition-all duration-200 transform ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Start Test
        </button>
        <p className="text-sm text-gray-500 mt-3">
          {isValid ? 'Press any key to begin once the test starts' : 'Adjust distribution to total 100%'}
        </p>
      </div>
    </div>
  );
}
