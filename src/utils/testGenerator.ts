import { TestItem } from '../types/test.types';
import { WORD_POOL, SYMBOL_POOL, NUMBER_POOL, COMBO_POOL, MODIFIER_POOL, SPECIAL_KEYS_POOL } from '../data/testItemPools';

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
    word: Math.floor(totalItems * 0.2),        // 20% words
    symbol: Math.floor(totalItems * 0.25),     // 25% symbols
    number: Math.floor(totalItems * 0.1),      // 10% single numbers
    numberSequence: Math.floor(totalItems * 0.1), // 10% number sequences (NEW)
    combo: Math.floor(totalItems * 0.15),      // 15% key combinations
    modifier: Math.floor(totalItems * 0.1),    // 10% standalone modifiers
    specialKey: Math.floor(totalItems * 0.1),  // 10% special keys (Enter, Esc, Tab, etc.)
  };

  // Adjust to ensure we hit exactly totalItems
  const currentTotal = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (currentTotal < totalItems) {
    distribution.word += totalItems - currentTotal;
  }

  const items: TestItem[] = [];
  let idCounter = 0;

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
  for (let i = 0; i < distribution.combo; i++) {
    const combo = getRandomItem(COMBO_POOL);
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
