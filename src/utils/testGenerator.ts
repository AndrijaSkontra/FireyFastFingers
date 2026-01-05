import { TestItem } from '../types/test.types';
import { WORD_POOL, SYMBOL_POOL, NUMBER_POOL, COMBO_POOL, MODIFIER_POOL, SPECIAL_KEYS_POOL, CODING_WORD_POOL } from '../data/testItemPools';
import { isMacOS } from './platformUtils';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random number sequence (4-8 digits)
function generateNumberSequence(): string {
  const length = Math.floor(Math.random() * 5) + 4; // 4 to 8
  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += Math.floor(Math.random() * 10).toString();
  }
  return sequence;
}

// Generate test items with balanced distribution
export function generateTestItems(totalItems: number = 100): TestItem[] {
  const distribution = {
    word: Math.floor(totalItems * 0.1),        // 10% words (reduced from 20%)
    codingWord: 2,                              // 2 coding-style word items
    symbol: Math.floor(totalItems * 0.25),     // 25% symbols
    number: Math.floor(totalItems * 0.1),      // 10% single numbers
    numberSequence: Math.floor(totalItems * 0.1), // 10% number sequences
    combo: Math.floor(totalItems * 0.28),      // 28% key combinations (increased from 15%)
    modifier: Math.floor(totalItems * 0.1),    // 10% standalone modifiers
    specialKey: Math.floor(totalItems * 0.07),  // 7% special keys (reduced from 10%)
  };

  // Adjust to ensure we hit exactly totalItems
  const currentTotal = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (currentTotal < totalItems) {
    distribution.combo += totalItems - currentTotal;
  }

  const items: TestItem[] = [];
  let idCounter = 0;
  const isMac = isMacOS();

  // Filter combos based on platform
  const availableCombos = COMBO_POOL.filter(combo => {
    // On Mac, prefer Mac combos but also include Ctrl combos
    // On non-Mac, exclude Mac combos
    if (isMac) {
      return true; // Include all combos on Mac
    } else {
      return !combo.display.startsWith('Cmd+'); // Exclude Mac combos on non-Mac
    }
  });

  // Generate word items
  for (let i = 0; i < distribution.word; i++) {
    const word = getRandomItem(WORD_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'word',
      display: word,
      expectedKeys: word.split(''),
      requiresSimultaneous: false,
    });
  }

  // Generate coding-style word items
  for (let i = 0; i < distribution.codingWord; i++) {
    const codingWord = getRandomItem(CODING_WORD_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'word',
      display: codingWord,
      expectedKeys: codingWord.split(''),
      requiresSimultaneous: false,
    });
  }

  // Generate symbol items
  for (let i = 0; i < distribution.symbol; i++) {
    const symbol = getRandomItem(SYMBOL_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'symbol',
      display: symbol,
      expectedKeys: [symbol],
      requiresSimultaneous: false,
    });
  }

  // Generate number items
  for (let i = 0; i < distribution.number; i++) {
    const number = getRandomItem(NUMBER_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'number',
      display: number,
      expectedKeys: [number],
      requiresSimultaneous: false,
    });
  }

  // Generate number sequence items
  for (let i = 0; i < distribution.numberSequence; i++) {
    const sequence = generateNumberSequence();
    items.push({
      id: `item-${idCounter++}`,
      type: 'numberSequence',
      display: sequence,
      expectedKeys: sequence.split(''),
      requiresSimultaneous: false,
    });
  }

  // Generate key combination items
  // On Mac, prioritize Mac combos (Cmd+C, Cmd+V, Cmd+X, Cmd+A, Shift+Enter)
  const macCombos = availableCombos.filter(c => 
    c.display.startsWith('Cmd+') || c.display === 'Shift+Enter'
  );
  const otherCombos = availableCombos.filter(c => 
    !c.display.startsWith('Cmd+') && c.display !== 'Shift+Enter'
  );

  for (let i = 0; i < distribution.combo; i++) {
    let combo: typeof COMBO_POOL[0];
    
    // On Mac, 60% chance to pick Mac combo, 40% chance for other combos
    if (isMac && macCombos.length > 0 && Math.random() < 0.6) {
      combo = getRandomItem(macCombos);
    } else if (otherCombos.length > 0) {
      combo = getRandomItem(otherCombos);
    } else {
      combo = getRandomItem(availableCombos);
    }

    items.push({
      id: `item-${idCounter++}`,
      type: 'combo',
      display: combo.display,
      expectedKeys: combo.keys,
      requiresSimultaneous: true,
    });
  }

  // Generate standalone modifier items
  for (let i = 0; i < distribution.modifier; i++) {
    const modifier = getRandomItem(MODIFIER_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'modifier',
      display: modifier.display,
      expectedKeys: modifier.keys,
      requiresSimultaneous: true,
    });
  }

  // Generate special key items (Enter, Esc, Tab, etc.)
  for (let i = 0; i < distribution.specialKey; i++) {
    const specialKey = getRandomItem(SPECIAL_KEYS_POOL);
    items.push({
      id: `item-${idCounter++}`,
      type: 'modifier', // Use 'modifier' type for similar behavior (single press)
      display: specialKey.display,
      expectedKeys: specialKey.keys,
      requiresSimultaneous: true,
    });
  }

  // Shuffle all items to mix them up
  return shuffleArray(items);
}

// Get character count for an item (for WPM calculation)
export function getItemCharCount(item: TestItem): number {
  switch (item.type) {
    case 'word':
      return item.display.length;
    case 'numberSequence':
      return item.display.length; // Count each digit
    case 'symbol':
    case 'number':
      return 1;
    case 'combo':
      return 5; // Treat combos as standard word (5 chars)
    case 'modifier':
      return 3; // Treat modifiers as 3 chars
    default:
      return 1;
  }
}
