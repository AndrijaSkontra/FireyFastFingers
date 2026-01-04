import { getPlatformKeyName, isMacOS } from '../utils/platformUtils';

interface TestControlsProps {
  onStart: () => void;
}

export function TestControls({ onStart }: TestControlsProps) {
  const superKeyName = getPlatformKeyName('Meta');
  const altKeyName = getPlatformKeyName('Alt');

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
        <div className="mt-4 text-xs text-gray-500 text-center">
          20% Words • 25% Symbols • 10% Numbers • 10% Sequences • 15% Combos • 10% Special Keys • 10% Modifiers
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
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          Start Test
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Press any key to begin once the test starts
        </p>
      </div>
    </div>
  );
}
