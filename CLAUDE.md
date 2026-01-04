Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Project: FireyFastFingers

This is a comprehensive typing tester application that tests all symbols on a keyboard.

### Project Overview

- **Purpose**: Typing speed and accuracy tester for all keyboard symbols
- **Test Types**: Words, symbols, numbers, key combinations, modifiers, and special keys
- **Test Length**: 100 items per test with balanced distribution

### Test Item Distribution

- 20% words (from ~400 word pool)
- 25% symbols (all keyboard symbols: `~!@#$%^&*()_+-=[]{}|;:'",.<>?/`)
- 10% single numbers (0-9)
- 10% number sequences (4-8 digits)
- 15% key combinations (Ctrl+A, Ctrl+C, Shift+Enter, etc.)
- 10% standalone modifiers (Ctrl, Shift, Alt, Meta/Super)
- 10% special keys (Enter, Esc, Tab, Backspace, Space, Arrow keys, Caps Lock)

### Key Features

- Real-time typing feedback (correct/incorrect visual feedback)
- Progress tracking with visual progress bar
- Automatic pause on tab switch (using visibility API)
- Caps Lock detection and warning indicator
- Platform-aware key display (Cmd vs Ctrl for Mac/Windows)
- Comprehensive statistics (WPM, IPM, accuracy, breakdown by type)
- Prevents dangerous browser shortcuts during active tests

### Project Structure

**Core Files:**

- `src/index.ts` - Server entry point using Bun.serve()
- `src/index.html` - HTML entry point
- `src/frontend.tsx` - React app entry point
- `src/App.tsx` - Main app component

**Components:**

- `src/components/TypingTest.tsx` - Main typing test container
- `src/components/TestControls.tsx` - Start test controls
- `src/components/TestDisplay.tsx` - Current item display with feedback
- `src/components/ProgressBar.tsx` - Visual progress indicator
- `src/components/TestResults.tsx` - Results screen with statistics

**Hooks:**

- `src/hooks/useTypingTest.ts` - Core typing test logic (state management, keyboard handling)

**Data:**

- `src/data/testItemPools.ts` - Test data pools (words, symbols, combos, modifiers, special keys)

**Utils:**

- `src/utils/testGenerator.ts` - Test item generation with balanced distribution
- `src/utils/keyboardUtils.ts` - Keyboard event handling, key normalization, validation
- `src/utils/platformUtils.ts` - Platform-specific utilities (Mac vs Windows key display)
- `src/utils/statsCalculator.ts` - Statistics calculation (WPM, IPM, accuracy)

**Types:**

- `src/types/test.types.ts` - TypeScript type definitions (TestItem, TestResult, TestState, Stats, KeyCombo)

### Keyboard Handling Guidelines

- Always use `normalizeKey()` utility to normalize key names across browsers
- Prevent default for dangerous shortcuts during active tests (Ctrl+W, Ctrl+Q, F5, etc.)
- Track pressed keys in a Set for combo validation
- Handle keydown and keyup events separately
- Validate modifiers on keyup for standalone modifier tests
- Use `isModifierKey()` to check if a key is a modifier
- Use `validateCombo()` for key combination validation
- Use `shouldPreventDefault()` to determine if event should be prevented

### State Management

- Uses React hooks (useState, useEffect, useCallback, useRef)
- Test state includes: items, currentIndex, startTime, endTime, results, isActive, isPaused
- Keyboard event listeners managed via useEffect with proper cleanup
- Visibility change listener for automatic pause/resume on tab switch
- Tracks total paused time to adjust statistics

### Test Flow

1. User clicks "Start Test" → `startTest()` generates 100 test items
2. Test becomes active → keyboard listeners are attached
3. User types each item → real-time validation and feedback
4. Correct input → advance to next item, record result
5. Incorrect input → show feedback, reset input, stay on same item
6. Test completes → show results screen with statistics
7. User can restart → `resetTest()` clears state

### Important Implementation Details

- Dangerous shortcuts are prevented during active tests to avoid accidental tab/window closure
- Key combinations must match exactly (all expected modifiers, no extra modifiers)
- Standalone modifiers must be pressed and released alone (no other keys pressed)
- Tab switching automatically pauses the test and resumes when tab regains focus
- Caps Lock state is tracked and displayed as a warning
- Platform-specific key display (Cmd on Mac, Ctrl on Windows/Linux)
- Test items are shuffled for variety
- Statistics include breakdown by item type (word, symbol, number, combo, modifier)

### Development Commands

- `bun dev` - Start development server with hot reload
- `bun start` - Start production server
- `bun run build` - Build for production
