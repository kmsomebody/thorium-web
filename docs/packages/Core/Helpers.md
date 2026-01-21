# Core Helpers

The Core package provides various helper functions for common tasks in the Thorium Web Reader.

## Table of Contents
- [Breakpoints Management](#breakpoints-management)
- [Focus Utilities](#focus-utilities)
- [Platform Detection](#platform-detection)
- [Progression Formatting](#progression-formatting)
- [Props to CSS Variables](#props-to-css-variables)

## Breakpoints Management

### makeBreakpointsMap

```typescript
function makeBreakpointsMap<T>({
  defaultValue,
  fromEnum,
  pref,
  disabledValue,
  validateKey
}: {
  /** Default value to use when no breakpoint matches */
  defaultValue: T;
  
  /** Enum to validate values against */
  fromEnum: any;
  
  /** Breakpoint-specific overrides */
  pref?: Record<string, T> | boolean;
  
  /** Value to use when the feature is disabled */
  disabledValue?: T;
  
  /** Key to validate in nested objects */
  validateKey?: string;
}): Required<Record<string, T>>;
```

#### Parameters
- `defaultValue` (required): TBD
- `fromEnum` (required): TBD
- `pref` (optional): TBD
- `disabledValue` (optional): TBD
- `validateKey` (optional): TBD

### Parameters

- `defaultValue` (required): The default value to use when no breakpoint matches
- `fromEnum` (required): The enum to validate values against
- `pref` (optional): Breakpoint-specific overrides
- `disabledValue` (optional): Value to return when the feature is disabled
- `validateKey` (optional): For nested objects, the key to validate against the enum

### How It Works
1. Creates a map with the default value for all breakpoints
2. Applies any breakpoint-specific overrides from `pref`
3. Validates values against the provided enum
4. Returns a map with all required breakpoints

## Focus Utilities

Handle focus states and interactive elements consistently.

```typescript
import { 
  isActiveElement,
  isKeyboardTriggered,
  isInteractiveElement 
} from "@edrlab/thorium-web/core/helpers";

// Check if an element is currently focused
const active = isActiveElement(element);

// Check if focus was triggered by keyboard
const keyboardFocused = isKeyboardTriggered(element);

// Check if an element is interactive
const interactive = isInteractiveElement(element);
```

## Platform Detection

Detect the current platform for platform-specific behaviors. Uses the modern `navigator.userAgentData` API when available, with fallback to `navigator.platform`.

```typescript
import { 
  getPlatform, 
  isMacish, 
  isIpadOS, 
  isIOSish 
} from "@edrlab/thorium-web/core/helpers";

// Returns platform name (e.g., "macos", "windows", "android", "linux")
const platform = getPlatform();

// Check for Mac-like platforms (Mac, iPhone, iPad, etc.)
const isMac = isMacish();

// Check for iPadOS in desktop mode
const isIpadDesktop = isIpadOS();

// Check for iOS-like platforms (iPhone, iPad, iPod)
const isIOS = isIOSish();
```

### Notes:
- Uses `navigator.userAgentData` when available (modern browsers)
- Falls back to `navigator.platform` for compatibility
- Handles special cases like Android and iPadOS detection

## Progression Formatting

Handle reading progression formats and calculations.

```typescript
import { 
  getSupportedProgressionFormats,
  canRenderProgressionFormat,
  getBestMatchingProgressionFormat,
  ThProgressionFormat
} from "@edrlab/thorium-web/core/helpers";
import { useTimeline } from "@edrlab/thorium-web/core/hooks";

const timeline = useTimeline({
  …
});

// Get all supported formats for the current timeline
const supportedFormats = getSupportedProgressionFormats(timeline);

// Check if a specific format can be rendered
const canRender = canRenderProgressionFormat(
  ThProgressionFormat.positionsPercentOfTotal, 
  supportedFormats
);

// Get the best matching format from preferred formats
const bestFormat = getBestMatchingProgressionFormat(
  [
    ThProgressionFormat.positionsLeft,
    ThProgressionFormat.positionsPercentOfTotal
  ],
  timeline
);
```

## Props to CSS Variables

Convert React/JS props to CSS custom properties with options for prefixing and excluding specific properties.

```typescript
import { propsToCSSVars } from "@edrlab/thorium-web/core/helpers";

// Basic usage with prefix
const cssVars = propsToCSSVars({
  color: "red",
  size: "16px",
  spacing: {
    top: "10px",
    bottom: "20px"
  }
}, { prefix: "th" });

// Returns: {
//   "--th-color": "red",
//   "--th-size": "16px",
//   "--th-spacing-top": "10px",
//   "--th-spacing-bottom": "20px"
// }

// With exclude option
const withExclude = propsToCSSVars({
  color: "blue",
  size: "18px",
  spacing: {
    top: "12px",
    bottom: "24px"
  }
}, { 
  prefix: "app",
  exclude: ["size"] // Exclude the "size" property
});

// Returns: {
//   "--app-color": "blue",
//   "--app-spacing-top": "12px",
//   "--app-spacing-bottom": "24px"
// }
```