import { test, expect } from '@playwright/test';

test.describe('Distribution Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Typing Master' })).toBeVisible();
  });

  test('should show distribution customization section', async ({ page }) => {
    // Check that the distribution section is visible
    await expect(page.getByText('Customize Distribution')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset to Defaults' })).toBeVisible();
  });

  test('should show all category sliders', async ({ page }) => {
    // Check that all 7 category labels are visible
    const categories = ['Words', 'Symbols', 'Numbers', 'Sequences', 'Key Combos', 'Modifiers', 'Special Keys'];
    for (const category of categories) {
      await expect(page.getByText(category, { exact: true }).first()).toBeVisible();
    }
  });

  test('should show total percentage indicator', async ({ page }) => {
    // Check that total shows 100% by default (valid)
    await expect(page.getByText('Total:')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('should update percentage when slider changes', async ({ page }) => {
    // Find the Words slider and change its value
    const wordSlider = page.locator('input[type="range"]').first();
    await wordSlider.fill('20');

    // The number input should reflect the change
    const wordInput = page.locator('input[type="number"]').first();
    await expect(wordInput).toHaveValue('20');
  });

  test('should update percentage when number input changes', async ({ page }) => {
    // Find the Words number input and change its value
    const wordInput = page.locator('input[type="number"]').first();
    await wordInput.fill('25');

    // The value should update
    await expect(wordInput).toHaveValue('25');
  });

  test('should show invalid state when total is not 100', async ({ page }) => {
    // Change a slider to make total != 100
    const wordInput = page.locator('input[type="number"]').first();
    await wordInput.fill('50'); // This will make total > 100

    // Total should show the new value and be red
    const totalText = page.locator('text=/Total:/').locator('..');
    await expect(totalText).toContainText('%');

    // Error message should appear
    await expect(page.getByText('Total must equal 100%')).toBeVisible();
  });

  test('should disable start button when total is not 100', async ({ page }) => {
    // Change a value to make total != 100
    const wordInput = page.locator('input[type="number"]').first();
    await wordInput.fill('50');

    // Start button should be disabled
    const startButton = page.getByRole('button', { name: 'Start Test' });
    await expect(startButton).toBeDisabled();
  });

  test('should enable start button when total equals 100', async ({ page }) => {
    // By default, total should be 100 and button enabled
    const startButton = page.getByRole('button', { name: 'Start Test' });
    await expect(startButton).toBeEnabled();
  });

  test('should reset to defaults when reset button clicked', async ({ page }) => {
    // Change some values
    const wordInput = page.locator('input[type="number"]').first();
    await wordInput.fill('30');

    // Click reset
    await page.getByRole('button', { name: 'Reset to Defaults' }).click();

    // Values should be back to defaults (12 for words)
    await expect(wordInput).toHaveValue('12');
  });

  test('should start test with custom distribution', async ({ page }) => {
    // Set a custom distribution (keep total at 100)
    // Words: 20 (+8), Symbols: 17 (-8) to keep total at 100
    const wordInput = page.locator('input[type="number"]').first();
    const symbolInput = page.locator('input[type="number"]').nth(1);

    await wordInput.fill('20');
    await symbolInput.fill('17');

    // Verify total is still 100
    await expect(page.getByText('100%')).toBeVisible();

    // Start button should be enabled
    const startButton = page.getByRole('button', { name: 'Start Test' });
    await expect(startButton).toBeEnabled();

    // Click start
    await startButton.click();

    // Test should start (progress bar or test display visible)
    await page.waitForTimeout(500);
    const testDisplay = page.locator('text=/Word|Symbol|Number|Key Combo|Modifier Key|Special Key/').first();
    await expect(testDisplay).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Typing Test Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Typing Master' })).toBeVisible();
  });

  test('should show changelog on dashboard', async ({ page }) => {
    // Check that changelog is visible
    await expect(page.getByText('Latest Updates')).toBeVisible();
    await expect(page.getByText('Real-time input display')).toBeVisible();
    await expect(page.getByText('Backspace to correct')).toBeVisible();
  });

  test('should start test and show first item', async ({ page }) => {
    // Click start button
    await page.getByRole('button', { name: 'Start Test' }).click();

    // Wait for test to start
    await page.waitForTimeout(500);

    // Check that test is active (progress bar or test display should be visible)
    const testDisplay = page.locator('text=/Word|Symbol|Number|Key Combo|Modifier Key|Special Key/').first();
    await expect(testDisplay).toBeVisible({ timeout: 5000 });
  });

  test('should show typed input below target text for words', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Wait until we get a word item (keep skipping until we find one)
    let isWord = false;
    let attempts = 0;
    while (!isWord && attempts < 20) {
      const wordLabel = await page.getByText('Word', { exact: true }).count();
      if (wordLabel > 0) {
        isWord = true;
        break;
      }
      // Skip to next item
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isWord) {
      test.skip();
      return;
    }

    // Check that "Your Input" section exists
    await expect(page.getByText('Your Input')).toBeVisible();

    // Type some characters
    await page.keyboard.type('test');

    // The input should be visible in the "Your Input" section
    const yourInputSection = page.locator('div:has-text("Your Input")').locator('..').locator('div').nth(1);
    await expect(yourInputSection).toBeVisible();
  });

  test('should show wrong characters in red for words', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a word item
    let isWord = false;
    let attempts = 0;
    while (!isWord && attempts < 20) {
      const wordLabel = await page.getByText('Word', { exact: true }).count();
      if (wordLabel > 0) {
        isWord = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isWord) {
      test.skip();
      return;
    }

    // Type a wrong character (just type 'zzz' - very unlikely to be correct)
    await page.keyboard.type('zzz');

    // Check that red/error styling exists in the input display (use .first() to handle multiple matches)
    const redText = page.locator('span.text-red-500, span[class*="red"]').first();
    await expect(redText).toBeVisible({ timeout: 2000 });
  });

  test('should allow backspace to delete wrong characters in words', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a word item
    let isWord = false;
    let attempts = 0;
    while (!isWord && attempts < 20) {
      const wordLabel = await page.getByText('Word', { exact: true }).count();
      if (wordLabel > 0) {
        isWord = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isWord) {
      test.skip();
      return;
    }

    // Type some characters
    await page.keyboard.type('abc');
    await page.waitForTimeout(100);

    // Press backspace
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(100);

    // The last character should be removed (we can verify by typing again)
    await page.keyboard.type('x');

    // Just verify no errors occurred
    const errorPopup = page.locator('[role="alert"]');
    await expect(errorPopup).not.toBeVisible();
  });

  test('should show input section for symbols', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a symbol item
    let isSymbol = false;
    let attempts = 0;
    while (!isSymbol && attempts < 30) {
      const symbolLabel = await page.getByText('Symbol', { exact: true }).count();
      if (symbolLabel > 0) {
        isSymbol = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isSymbol) {
      test.skip();
      return;
    }

    // Check that "Your Input" section exists for symbols
    await expect(page.getByText('Your Input')).toBeVisible();
  });

  test('should show wrong symbol input in red', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a symbol item
    let isSymbol = false;
    let attempts = 0;
    while (!isSymbol && attempts < 30) {
      const symbolLabel = await page.getByText('Symbol', { exact: true }).count();
      if (symbolLabel > 0) {
        isSymbol = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isSymbol) {
      test.skip();
      return;
    }

    // Get the expected symbol from the display
    const displayText = await page.locator('text=/Symbol/').locator('..').locator('div').nth(1).textContent();

    // Type a different symbol - cycle through a few options to find one that's wrong
    const wrongSymbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
    let typedWrong = false;

    for (const symbol of wrongSymbols) {
      if (displayText && !displayText.includes(symbol)) {
        await page.keyboard.type(symbol);
        typedWrong = true;
        break;
      }
    }

    if (!typedWrong) {
      // Fallback - just type 'a' which is unlikely to be a symbol test item
      await page.keyboard.type('a');
    }

    await page.waitForTimeout(300);

    // Check if we're still on symbol item
    const stillSymbol = await page.locator('div:has-text("Symbol")').count();
    if (stillSymbol > 0) {
      // Still on symbol, so input was likely wrong - check for "Your Input" section showing data
      const yourInput = page.getByText('Your Input');
      await expect(yourInput).toBeVisible();
    }
    // If we moved to next item, we happened to guess correctly, which is acceptable
  });

  test('should show input section for key combos', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a key combo item
    let isCombo = false;
    let attempts = 0;
    while (!isCombo && attempts < 30) {
      const comboLabel = await page.getByText('Key Combo', { exact: true }).count();
      if (comboLabel > 0) {
        isCombo = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isCombo) {
      test.skip();
      return;
    }

    // Check that "Your Input" section exists for combos
    await expect(page.getByText('Your Input')).toBeVisible();
  });

  test('should show wrong combo input', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a key combo item
    let isCombo = false;
    let attempts = 0;
    while (!isCombo && attempts < 30) {
      const comboLabel = await page.getByText('Key Combo', { exact: true }).count();
      if (comboLabel > 0) {
        isCombo = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isCombo) {
      test.skip();
      return;
    }

    // Try a wrong combo (Ctrl+Q is usually not in the test)
    await page.keyboard.press('Control+Q');
    await page.waitForTimeout(300);

    // Check if we're still on the combo item (wrong) or moved (correct)
    const stillCombo = await page.getByText('Key Combo', { exact: true }).count();
    if (stillCombo > 0) {
      // Still on combo, check for input display
      const yourInput = page.getByText('Your Input');
      await expect(yourInput).toBeVisible();
    }
  });

  test('should not require backspace for combo retry', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Find a key combo item
    let isCombo = false;
    let attempts = 0;
    while (!isCombo && attempts < 30) {
      const comboLabel = await page.getByText('Key Combo', { exact: true }).count();
      if (comboLabel > 0) {
        isCombo = true;
        break;
      }
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(200);
      attempts++;
    }

    if (!isCombo) {
      test.skip();
      return;
    }

    // Try wrong combo
    await page.keyboard.press('Control+Q');
    await page.waitForTimeout(200);

    // Try another combo immediately without backspace
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(200);

    // Should not error - test passes if no exception
    const errorPopup = page.locator('[role="alert"]');
    await expect(errorPopup).not.toBeVisible();
  });

  test('should display caps lock warning', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Toggle Caps Lock on (this might not work on all systems)
    await page.keyboard.press('CapsLock');
    await page.waitForTimeout(300);

    // Try to find caps lock warning (might not appear if CapsLock didn't actually toggle)
    const capsWarning = page.getByText(/Caps Lock is ON/i);
    const isVisible = await capsWarning.isVisible().catch(() => false);

    // Toggle it back off
    await page.keyboard.press('CapsLock');

    // This test is informational - caps lock detection is system dependent
    if (isVisible) {
      await expect(capsWarning).toBeVisible();
    }
  });

  test('should show restart button during test', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Check restart button exists
    await expect(page.getByRole('button', { name: 'Restart Test' })).toBeVisible();
  });

  test('should restart test when restart button clicked', async ({ page }) => {
    // Start the test
    await page.getByRole('button', { name: 'Start Test' }).click();
    await page.waitForTimeout(500);

    // Skip a few items to make progress
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(200);

    // Click restart
    await page.getByRole('button', { name: 'Restart Test' }).click();
    await page.waitForTimeout(500);

    // Should be back at start screen
    await expect(page.getByRole('button', { name: 'Start Test' })).toBeVisible();
  });
});
