# Core Hooks API Documentation

## Epub Navigator Hook

Manages EPUB navigation and rendering.

```typescript
interface EpubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: EpubNavigatorListeners;
  positionsList?: Locator[];
  initialPosition?: Locator;
  preferences?: IEpubPreferences;
  defaults?: IEpubDefaults;
  injectables?: IInjectablesConfig;
}

function useEpubNavigator(): {
  EpubNavigatorLoad: (config: EpubNavigatorLoadProps, cb: Function) => void;
  EpubNavigatorDestroy: (cb: Function) => void;
  goRight: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLeft: (animated: boolean, callback: (ok: boolean) => void) => void;
  goBackward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goForward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLink: (link: Link, animated: boolean, callback: (ok: boolean) => void) => void;
  go: (locator: Locator, animated: boolean, callback: (ok: boolean) => void) => void;
  navLayout: () => EPUBLayout | undefined;
  currentLocator: () => Locator | undefined;
  previousLocator: () => Locator | null;
  nextLocator: () => Locator | null;
  currentPositions: () => number[] | undefined;
  canGoBackward: () => boolean | undefined;
  canGoForward: () => boolean | undefined;
  isScrollStart: () => boolean | undefined;
  isScrollEnd: () => boolean | undefined;
  preferencesEditor: PreferencesEditor | undefined;
  getSetting: <K extends keyof EpubSettings>(settingKey: K) => EpubSettings[K];
  submitPreferences: (preferences: IEpubPreferences) => Promise<void>;
  getCframes: () => (FrameManager | FXLFrameManager | undefined)[] | undefined;
  onFXLPositionChange: (cb: (locator: Locator) => void) => void;
};
```

**Features:**
- EPUB navigation (forward, backward, by link, by locator, etc.)
- Layout detection and preferences
- Position tracking and locator management
- Frame management for fixed and reflowable layouts

**Example:**
```typescript
const MyEpubReader = (rawManifest, selfHref) => {
  const { 
    EpubNavigatorLoad,
    EpubNavigatorDestroy,
    goLeft,
    goRight
  } = useEpubNavigator();

  useEffect(() => {
    EpubNavigatorLoad({
      ...props
    }, () => console.log("Navigator loaded"));

    return () => {
      EpubNavigatorDestroy(() => console.log("Navigator destroyed"));
    };
  }, [rawManifest, selfHref]);

  return (
    <button onClick={() => goLeft(true, () => {})}>
      Previous
    </button>
    <div ref={ containerRef }></div>
    <button onClick={() => goRight(true, () => {})}>
      Next
    </button>
  );
};
```

## WebPub Navigator Hook

Manages WebPub navigation and rendering.

```typescript
interface WebPubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: WebPubNavigatorListeners;
  initialPosition?: Locator;
  preferences?: IWebPubPreferences;
  defaults?: IWebPubDefaults;
  injectables?: IInjectablesConfig;
}

function useWebPubNavigator(): {
  WebPubNavigatorLoad: (config: WebPubNavigatorLoadProps, cb: Function) => void;
  WebPubNavigatorDestroy: (cb: Function) => void;
  goRight: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLeft: (animated: boolean, callback: (ok: boolean) => void) => void;
  goBackward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goForward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLink: (link: Link, animated: boolean, callback: (ok: boolean) => void) => void;
  go: (locator: Locator, animated: boolean, callback: (ok: boolean) => void) => void;
  currentLocator: () => Locator | undefined;
  previousLocator: () => Locator | null;
  nextLocator: () => Locator | null;
  currentPositions: () => number[] | undefined;
  canGoBackward: () => boolean | undefined;
  canGoForward: () => boolean | undefined;
  isScrollStart: () => boolean | undefined;
  isScrollEnd: () => boolean | undefined;
  preferencesEditor: PreferencesEditor | undefined;
  getSetting: <K extends keyof WebPubSettings>(settingKey: K) => WebPubSettings[K];
  submitPreferences: (preferences: IWebPubPreferences) => Promise<void>;
  getCframes: () => (FrameManager | FXLFrameManager | undefined)[] | undefined;
}
```

**Features:**
- WebPub navigation (forward, backward, by link, by locator, etc.)
- Layout detection and preferences
- Position tracking and locator management
- Frame management for fixed and reflowable layouts

## Media Query Hooks

### useMediaQuery

A base hook for handling media query matches.

```typescript
function useMediaQuery(query: string | null): boolean
```

**Features:**
- Handles media query matching
- Validates query support and format
- Provides real-time updates
- Cleans up event listeners

### useBreakpoints

Manages responsive breakpoints with media queries.

```typescript
type ThBreakpointRange = {
  min: number | null,  // Minimum width in pixels
  max: number | null   // Maximum width in pixels
}

type BreakpointsMap<T> = {
  [key in ThBreakpoints]?: T  // Map of breakpoint values
}

type ThBreakpointsObject = {
  [key in ThBreakpoints]: boolean | null;  // Breakpoint match states
  current: string | null;                  // Current active breakpoint
  ranges: ThBreakpointRanges;              // Breakpoint range definitions
}

function useBreakpoints(
  map: BreakpointsMap<number | null>,
  onChange?: (breakpoint: ThBreakpoints | null) => void
): ThBreakpointsObject
```

## Accessibility Hooks

### useColorScheme

Detects system color scheme preferences.

```typescript
enum ThColorScheme {
  light = "light",
  dark = "dark"
}

function useColorScheme(
  onChange?: (colorScheme: ThColorScheme) => void
): ThColorScheme
```

### useContrast

Detects system contrast preferences.

```typescript
enum ThContrast {
  none = "no-preference",
  more = "more",
  less = "less",
  custom = "custom"
}

function useContrast(
  onChange?: (contrast: ThContrast) => void
): ThContrast
```

### useForcedColors

Detects if system is using forced colors.

```typescript
function useForcedColors(
  onChange?: (forcedColors: boolean) => void
): boolean
```

### useMonochrome

Detects if system is using monochrome display.

```typescript
function useMonochrome(
  onChange?: (isMonochrome: boolean) => void
): boolean
```

### useReducedMotion

Detects if user prefers reduced motion.

```typescript
function useReducedMotion(
  onChange?: (reducedMotion: boolean) => void
): boolean
```

### useReducedTransparency

Detects if user prefers reduced transparency.

```typescript
function useReducedTransparency(
  onChange?: (reducedTransparency: boolean) => void
): boolean
```

## Utility Hooks

### useDocumentTitle

Manages document title.

```typescript
function useDocumentTitle(
  title?: string
): void
```

**Features:**
- Sets document title if truthy

### useFullscreen

Manages fullscreen state and transitions.

```typescript
function useFullscreen(
  onChange?: (isFullscreen: boolean) => void
): {
  isFullscreen: boolean;
  handleFullscreen: () => void;
}
```

**Features:**
- Toggles fullscreen mode
- Provides current fullscreen state
- Handles fullscreen change events
- Client-side only functionality

### useIsClient

Determines if code is running on client side.

```typescript
function useIsClient(): boolean
```

**Features:**
- Safe hydration handling
- Uses useLayoutEffect for immediate detection
- Returns false during SSR

### useLocalStorage

Manages local storage with React state synchronization.

```typescript
function useLocalStorage(
  key: string
): {
  localData: any;
  setLocalData: (value: any) => void;
  getLocalData: () => any;
  clearLocalData: () => void;
  cachedLocalData: React.MutableRefObject<any>;
}
```

**Features:**
- Automatically syncs with localStorage
- Provides getter, setter, and clear methods
- Maintains local state and a cached ref of the value
- Handles JSON serialization/deserialization
- Returns the current value and cached ref

### usePrevious

Stores and returns the previous value of a variable.

```typescript
function usePrevious<T>(
  value: T
): T | null
```

**Features:**
- Generic type support
- Ref-based storage for performance
- Updates only after render

### useTimeline

> [!CAUTION]
> This hook is unstable and will change in the future.

Tracks and manages timeline data so that navigation can be contextualized more easily (current toc entry, positions, title, etc.).

```typescript
function useTimeline(
  publication: Publication | null, 
  currentLocation?: Locator, 
  currentPositions: number[],
  positionsList: Locator[],
  onChange?: (timeline: UnstableTimeline) => void
): UnstableTimeline
```

**Features:**
- Creates timeline data to contextualize navigation (toc, items, positions)
- Provides current timeline state (current toc entry, current item, previous item, next item)
- Handles timeline updates

### useFonts

Manages font injection and resource management for EPUB/WebPub readers.

```typescript
function useFonts(fontResources?: InjectableFontResources | null): {
  injectFontResources: (resources: InjectableFontResources | null) => void;
  removeFontResources: () => void;
  getAndroidFXLPatch: () => (ILinkInjectable & IBlobInjectable) | null;
}
```

**Features:**
- Injects font resources into the document head
- Manages font resource lifecycle (injection and removal)
- Provides Android FXL-specific font patches
- Handles different font resource types (URL, blob, link)
- Automatic cleanup on unmount or resource changes
