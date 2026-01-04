// Detect if user is on macOS
export function isMacOS(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
    navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
  );
}

// Get platform-specific key name for display
export function getPlatformKeyName(key: string): string {
  const isMac = isMacOS();

  const keyMap: Record<string, { mac: string; other: string }> = {
    'Meta': { mac: 'Command', other: 'Super' },
    'Alt': { mac: 'Option', other: 'Alt' },
    'Control': { mac: 'Control', other: 'Ctrl' },
    'Shift': { mac: 'Shift', other: 'Shift' },
  };

  const mapping = keyMap[key];
  if (mapping) {
    return isMac ? mapping.mac : mapping.other;
  }

  return key;
}

// Get platform-specific display for key combinations
export function getPlatformComboDisplay(display: string): string {
  if (!isMacOS()) return display;

  // Replace Super with Command on macOS
  return display
    .replace(/Super/g, 'Command')
    .replace(/Alt/g, 'Option');
}

// Get symbol for modifier keys (for compact display)
export function getModifierSymbol(key: string): string {
  const isMac = isMacOS();

  if (isMac) {
    const macSymbols: Record<string, string> = {
      'Control': '⌃',
      'Meta': '⌘',
      'Alt': '⌥',
      'Shift': '⇧',
    };
    return macSymbols[key] || key;
  }

  return key;
}
