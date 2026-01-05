import { KeyCombo } from '../types/test.types';

// Common words pool (expanded to ~400 words)
export const WORD_POOL = [
  // Very common short words
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',

  // Common medium words
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',

  // Common verbs
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'may',
  'must', 'should', 'might', 'can', 'could', 'will', 'would', 'shall', 'need', 'want',
  'go', 'come', 'take', 'get', 'make', 'see', 'know', 'think', 'say', 'tell',
  'ask', 'try', 'give', 'use', 'find', 'help', 'show', 'call', 'keep', 'let',
  'put', 'mean', 'leave', 'seem', 'turn', 'start', 'run', 'move', 'live', 'bring',
  'happen', 'write', 'sit', 'stand', 'lose', 'pay', 'meet', 'play', 'speak', 'read',

  // Common nouns
  'man', 'woman', 'child', 'people', 'thing', 'place', 'world', 'house', 'time', 'day',
  'year', 'week', 'month', 'part', 'point', 'number', 'fact', 'hand', 'eye', 'face',
  'door', 'room', 'car', 'street', 'book', 'water', 'food', 'money', 'mother', 'father',
  'life', 'work', 'school', 'system', 'group', 'company', 'problem', 'service', 'party', 'country',
  'case', 'question', 'study', 'night', 'home', 'area', 'power', 'end', 'job', 'war',

  // Adjectives
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old',
  'right', 'big', 'high', 'small', 'large', 'next', 'early', 'young', 'few', 'public',
  'bad', 'same', 'able', 'important', 'best', 'possible', 'local', 'sure', 'free', 'low',
  'certain', 'true', 'clear', 'recent', 'strong', 'real', 'simple', 'full', 'common', 'poor',

  // Programming/tech words
  'function', 'class', 'method', 'variable', 'array', 'object', 'string', 'number', 'boolean', 'null',
  'true', 'false', 'return', 'import', 'export', 'const', 'let', 'var', 'if', 'else',
  'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'async',
  'await', 'promise', 'callback', 'event', 'component', 'state', 'props', 'hook', 'render', 'effect',
  'data', 'api', 'request', 'response', 'server', 'client', 'database', 'query', 'error', 'debug',

  // Additional variety
  'through', 'still', 'since', 'both', 'under', 'never', 'more', 'most', 'less', 'much',
  'very', 'too', 'only', 'just', 'even', 'also', 'here', 'there', 'where', 'why',
  'how', 'what', 'when', 'who', 'which', 'whose', 'whom', 'whatever', 'however', 'therefore',
  'another', 'such', 'each', 'every', 'any', 'some', 'many', 'few', 'several', 'all',
  'both', 'either', 'neither', 'none', 'nothing', 'something', 'anything', 'everything', 'someone', 'anyone',

  // Action words
  'build', 'create', 'delete', 'update', 'change', 'add', 'remove', 'open', 'close', 'save',
  'load', 'send', 'receive', 'click', 'type', 'press', 'release', 'hold', 'drag', 'drop',
  'scroll', 'swipe', 'tap', 'touch', 'move', 'resize', 'rotate', 'flip', 'toggle', 'switch',

  // Common longer words
  'between', 'without', 'against', 'during', 'before', 'after', 'around', 'through', 'include', 'provide',
  'continue', 'consider', 'appear', 'produce', 'present', 'program', 'however', 'remember', 'understand', 'develop',
  'example', 'special', 'general', 'process', 'increase', 'student', 'interest', 'different', 'require', 'follow',
  'necessary', 'possible', 'available', 'national', 'political', 'support', 'community', 'information', 'education', 'position'
];

// Coding-style word items with symbols (like const, function, =>, !=, etc.)
export const CODING_WORD_POOL = [
  'const', 'function', '=>', '!=', '===', '!==', '<=', '>=', '&&', '||',
  '++', '--', '+=', '-=', '*=', '/=', '%=', '**', '??', '?.',
  '()', '[]', '{}', '/*', '*/', '//', '`', '${',
  '==', '!', '?', ':', ';', ',', '.', '...', '->',
];

// Symbol pool - ALL symbols on US English keyboard
export const SYMBOL_POOL = [
  // Backtick row symbols
  '`',   // backtick/grave
  '~',   // tilde (Shift+`)

  // Number row symbols (with Shift)
  '!',   // exclamation (Shift+1)
  '@',   // at (Shift+2)
  '#',   // hash/pound (Shift+3)
  '$',   // dollar (Shift+4)
  '%',   // percent (Shift+5)
  '^',   // caret (Shift+6)
  '&',   // ampersand (Shift+7)
  '*',   // asterisk (Shift+8)
  '(',   // left parenthesis (Shift+9)
  ')',   // right parenthesis (Shift+0)

  // Minus/underscore
  '-',   // hyphen/minus
  '_',   // underscore (Shift+-)

  // Equals/plus
  '=',   // equals
  '+',   // plus (Shift+=)

  // Brackets
  '[',   // left square bracket
  ']',   // right square bracket
  '{',   // left curly brace (Shift+[)
  '}',   // right curly brace (Shift+])

  // Backslash/pipe
  '\\',  // backslash
  '|',   // pipe (Shift+\)

  // Semicolon/colon
  ';',   // semicolon
  ':',   // colon (Shift+;)

  // Quotes
  "'",   // single quote/apostrophe
  '"',   // double quote (Shift+')

  // Comma/less than
  ',',   // comma
  '<',   // less than (Shift+,)

  // Period/greater than
  '.',   // period/dot
  '>',   // greater than (Shift+.)

  // Slash/question
  '/',   // forward slash
  '?',   // question mark (Shift+/)
];

// Number pool
export const NUMBER_POOL = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Safe key combinations (avoiding dangerous browser shortcuts)
export const COMBO_POOL: KeyCombo[] = [
  // Ctrl combinations
  { display: 'Ctrl+A', keys: ['Control', 'a'], modifiers: { ctrl: true }, mainKey: 'a' },
  { display: 'Ctrl+C', keys: ['Control', 'c'], modifiers: { ctrl: true }, mainKey: 'c' },
  { display: 'Ctrl+V', keys: ['Control', 'v'], modifiers: { ctrl: true }, mainKey: 'v' },
  { display: 'Ctrl+X', keys: ['Control', 'x'], modifiers: { ctrl: true }, mainKey: 'x' },
  { display: 'Ctrl+Z', keys: ['Control', 'z'], modifiers: { ctrl: true }, mainKey: 'z' },
  { display: 'Ctrl+Y', keys: ['Control', 'y'], modifiers: { ctrl: true }, mainKey: 'y' },
  { display: 'Ctrl+F', keys: ['Control', 'f'], modifiers: { ctrl: true }, mainKey: 'f' },
  { display: 'Ctrl+S', keys: ['Control', 's'], modifiers: { ctrl: true }, mainKey: 's' },
  { display: 'Ctrl+P', keys: ['Control', 'p'], modifiers: { ctrl: true }, mainKey: 'p' },
  { display: 'Ctrl+B', keys: ['Control', 'b'], modifiers: { ctrl: true }, mainKey: 'b' },
  { display: 'Ctrl+I', keys: ['Control', 'i'], modifiers: { ctrl: true }, mainKey: 'i' },
  { display: 'Ctrl+U', keys: ['Control', 'u'], modifiers: { ctrl: true }, mainKey: 'u' },

  // Shift combinations
  { display: 'Shift+Enter', keys: ['Shift', 'Enter'], modifiers: { shift: true }, mainKey: 'Enter' },
  { display: 'Shift+Tab', keys: ['Shift', 'Tab'], modifiers: { shift: true }, mainKey: 'Tab' },

  // Mac-specific Command combinations (will be filtered by platform)
  { display: 'Cmd+A', keys: ['Meta', 'a'], modifiers: { meta: true }, mainKey: 'a' },
  { display: 'Cmd+C', keys: ['Meta', 'c'], modifiers: { meta: true }, mainKey: 'c' },
  { display: 'Cmd+V', keys: ['Meta', 'v'], modifiers: { meta: true }, mainKey: 'v' },
  { display: 'Cmd+X', keys: ['Meta', 'x'], modifiers: { meta: true }, mainKey: 'x' },
];

// Special keys pool (for standalone key testing)
export const SPECIAL_KEYS_POOL = [
  { display: 'Enter', keys: ['Enter'] },
  { display: 'Esc', keys: ['Escape'] },
  { display: 'Tab', keys: ['Tab'] },
  { display: 'Caps Lock', keys: ['CapsLock'] },
  { display: 'Backspace', keys: ['Backspace'] },
  { display: 'Space', keys: [' '] },
  { display: '← Left Arrow', keys: ['ArrowLeft'] },
  { display: '→ Right Arrow', keys: ['ArrowRight'] },
  { display: '↑ Up Arrow', keys: ['ArrowUp'] },
  { display: '↓ Down Arrow', keys: ['ArrowDown'] },
];

// Modifier keys pool (for standalone modifier testing)
export const MODIFIER_POOL = [
  { display: 'Ctrl', keys: ['Control'] },
  { display: 'Shift', keys: ['Shift'] },
  { display: 'Alt', keys: ['Alt'] },
  { display: 'Super', keys: ['Meta'] }, // Windows key / Command key
];

// Dangerous shortcuts to avoid (for reference)
export const DANGEROUS_SHORTCUTS = [
  'Ctrl+W', 'Cmd+W',     // Close tab
  'Ctrl+Q', 'Cmd+Q',     // Quit browser
  'Ctrl+N', 'Cmd+N',     // New window
  'Ctrl+T', 'Cmd+T',     // New tab
  'Alt+F4',              // Close window (OS level)
  'F5', 'Ctrl+R',        // Reload
  'Ctrl+Shift+T',        // Reopen closed tab
  'Ctrl+Shift+N',        // New incognito window
];
