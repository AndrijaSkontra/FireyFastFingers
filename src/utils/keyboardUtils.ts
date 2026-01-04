// Normalize key names across different browsers
export function normalizeKey(key: string): string {
  // Handle common variations
  const keyMap: Record<string, string> = {
    'OS': 'Meta',        // Windows key on some browsers
    'Win': 'Meta',       // Windows key
    'Cmd': 'Meta',       // Mac Command key alternative name
    'Esc': 'Escape',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Del': 'Delete',
  };

  return keyMap[key] || key;
}

// Check if a key is a modifier key
export function isModifierKey(key: string): boolean {
  const modifiers = ['Control', 'Shift', 'Alt', 'Meta'];
  return modifiers.includes(normalizeKey(key));
}

// Get currently pressed modifier keys from event
export function getModifiersFromEvent(event: KeyboardEvent): string[] {
  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push('Control');
  if (event.shiftKey) modifiers.push('Shift');
  if (event.altKey) modifiers.push('Alt');
  if (event.metaKey) modifiers.push('Meta');

  return modifiers;
}

// Validate if the pressed keys match expected keys for regular typing
export function validateRegularKey(pressedKey: string, expectedKey: string): boolean {
  return normalizeKey(pressedKey) === expectedKey;
}

// Validate if the pressed combo matches expected combo
export function validateCombo(
  event: KeyboardEvent,
  expectedKeys: string[]
): boolean {
  const normalizedMainKey = normalizeKey(event.key);
  const pressedModifiers = getModifiersFromEvent(event);

  // Check if main key matches (the non-modifier key in expected keys)
  const expectedMainKey = expectedKeys.find(k => !isModifierKey(k));
  if (!expectedMainKey || normalizedMainKey !== expectedMainKey) {
    return false;
  }

  // Get expected modifiers
  const expectedModifiers = expectedKeys.filter(k => isModifierKey(k));

  // Check if all expected modifiers are pressed
  for (const mod of expectedModifiers) {
    if (!pressedModifiers.includes(mod)) {
      return false;
    }
  }

  // Check if no extra modifiers are pressed
  for (const mod of pressedModifiers) {
    if (!expectedModifiers.includes(mod)) {
      return false;
    }
  }

  return true;
}

// Check if only specific keys are in the set (for standalone modifier validation)
export function onlyKeysPressed(
  pressedKeys: Set<string>,
  expectedKeys: string[]
): boolean {
  if (pressedKeys.size !== expectedKeys.length) {
    return false;
  }

  for (const key of expectedKeys) {
    const normalizedKey = normalizeKey(key);
    let found = false;
    for (const pressedKey of pressedKeys) {
      if (normalizeKey(pressedKey) === normalizedKey) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }

  return true;
}

// Prevent dangerous browser shortcuts
export function shouldPreventDefault(event: KeyboardEvent, testActive: boolean): boolean {
  if (!testActive) return false;

  // Prevent all keyboard events during test
  const key = event.key.toLowerCase();

  // Extra prevention for particularly dangerous shortcuts
  const dangerousKeys = ['w', 't', 'n', 'q', 'r'];
  if ((event.ctrlKey || event.metaKey) && dangerousKeys.includes(key)) {
    return true;
  }

  // Prevent F5 reload
  if (key === 'f5') {
    return true;
  }

  // Prevent other function keys that might interfere
  if (key.startsWith('f') && key.length <= 3) {
    return true;
  }

  return testActive;
}
