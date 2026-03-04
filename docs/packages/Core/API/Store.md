# Store API Reference

This document details the Redux store implementation and state management system.

## Core Components

### ThStoreProvider

Context provider component for the Redux store.

**Props:**
- `children`: Child components
- `initialState`: Optional initial state

**Features:**
- Global state management
- State persistence
- Action dispatching
- State selectors

## Reducers

### Actions Reducer

Manages state for action-related features.

**State Interface:**
```typescript
interface ActionsReducerState {
  keys: {
    [key in ActionsStateKeys]: {
      isOpen: boolean | null;
      docking: ThDockingKeys | null;
      dockedWidth?: number;
    };
  };
  dock: {
    [ThDockingKeys.start]: {
      actionKey: ActionsStateKeys | null;
      active: boolean;
      collapsed: boolean;
      width?: number;
    };
    [ThDockingKeys.end]: {
      actionKey: ActionsStateKeys | null;
      active: boolean;
      collapsed: boolean;
      width?: number;
    };
  };
  overflow: {
    [key in OverflowStateKeys]: {
      isOpen: boolean;
    };
  };
}
```

**Actions:**
- `dockAction`: Dock/undock an action
- `setActionOpen`: Set action state open/closed
- `toggleActionOpen`: Toggle action state
- `setOverflow`: Set overflow state open/closed
- `activateDockPanel`: Activate a dock panel
- `deactivateDockPanel`: Deactivate a dock panel
- `collapseDockPanel`: Collapse a dock panel
- `expandDockPanel`: Expand a dock panel
- `setDockPanelWidth`: Set dock panel width

### Publication Reducer

Manages state for EPUB publication data.

**State Interface:**
```typescript
interface PublicationReducerState {
  fontLanguage: string;
  isFXL: boolean;
  isRTL: boolean;
  hasDisplayTransformability: boolean;
  positionsList: Locator[];
  atPublicationStart: boolean;
  atPublicationEnd: boolean;
  unstableTimeline?: UnstableTimeline;
}
```

**Actions:**
- `setFontLanguage`: Set font language
- `setFXL`: Set publication as fixed layout
- `setRTL`: Set publication as right-to-left
- `setHasDisplayTransformability`: Set display transformability flag
- `setPositionsList`: Update positions list
- `setPublicationStart`: Set at publication start state
- `setPublicationEnd`: Set at publication end state
- `setTimeline`: Set timeline data
- `setTocTree`: Set table of contents tree
- `setTocEntry`: Set current TOC entry

### Reader Reducer

Manages state for reader functionality.

**State Interface:**
```typescript
interface ReaderReducerState {
  profile: "epub" | "webPub" | undefined;
  direction: ThLayoutDirection;
  isLoading: boolean;
  isImmersive: boolean;
  isHovering: boolean;
  hasScrollAffordance: boolean;
  hasArrows: boolean;
  hasUserNavigated: boolean;
  isFullscreen: boolean;
  settingsContainer: ThSettingsContainerKeys;
  platformModifier: UnstablePlatformModifier;
}
```

**Actions:**
- `setReaderProfile`: Set reader profile (epub or webPub)
- `setDirection`: Set layout direction
- `setLoading`: Set loading state
- `setPlatformModifier`: Set platform modifier
- `setImmersive`: Set immersive mode
- `toggleImmersive`: Toggle immersive mode
- `setHovering`: Set hovering state
- `setScrollAffordance`: Set scroll affordance visibility
- `setHasArrows`: Set arrows visibility
- `setUserNavigated`: Set user navigation flag
- `setFullscreen`: Set fullscreen mode
- `setSettingsContainer`: Set type of settings container (main, or subpanel)

### Settings Reducer

Manages state for reader settings.

**State Interface:**
```typescript
interface SettingsReducerState {
  columnCount: string;
  fontFamily: FontFamilyStateObject;
  fontSize: number;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineHeight: ThLineHeightOptions;
  lineLength: LineLengthStateObject | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  scroll: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
}
```

**Actions:**
- `setColumnCount`: Set column count
- `setFontFamily`: Set font family
- `setFontSize`: Set font size
- `setFontWeight`: Set font weight
- `setHyphens`: Set hyphenation
- `setLetterSpacing`: Set letter spacing
- `setLineHeight`: Set line height
- `setLineLength`: Set one or several line lengths (optimal, min, max)
- `setParagraphIndent`: Set paragraph indent
- `setParagraphSpacing`: Set paragraph spacing
- `setPublisherStyles`: Set publisher styles
- `setScroll`: Set scroll mode
- `setSpacingPreset`: Set spacing preset configuration
- `setTextAlign`: Set text alignment
- `setTextNormalization`: Set text normalization
- `setWordSpacing`: Set word spacing

### Theme Reducer

Manages state for theme settings.

**State Interface:**
```typescript
interface ThemeReducerState {
  monochrome: boolean;
  colorScheme: ThColorScheme;
  theme: ThemeStateObject;
  prefersReducedMotion: boolean;
  prefersReducedTransparency: boolean;
  prefersContrast: ThContrast;
  forcedColors: boolean;
  breakpoint?: ThBreakpoints;
}
```

**Actions:**
- `setMonochrome`: Set monochrome mode
- `setColorScheme`: Set color scheme
- `setTheme`: Set current theme
- `setReducedMotion`: Set reduced motion preference
- `setReducedTransparency`: Set reduced transparency preference
- `setContrast`: Set contrast preference
- `setForcedColors`: Set forced colors mode
- `setBreakpoint`: Set current breakpoint

### Preferences Reducer

Manages state for reader preferences.

**State Interface:**
```typescript
interface PreferencesReducerState {
  l10n?: {
    locale?: string;
    direction?: ThLayoutDirection;
  };
  progressionFormat?: RenditionObject<ThProgressionFormat | Array<ThProgressionFormat>>;
  runningHeadFormat?: RenditionObject<ThRunningHeadFormat>;
  paginatedAffordances?: PaginatedAffordanceObject;
  ui?: {
    reflow?: ThLayoutUI;
    fxl?: ThLayoutUI;
    webPub?: ThLayoutUI;
  };
  scrollAffordances?: {
    hintInImmersive?: boolean;
    toggleOnMiddlePointer?: Array<"tap" | "click">;
    hideOnForwardScroll?: boolean;
    showOnBackwardScroll?: boolean;
  };
}
```

**Actions:**
- `setL10n`: Update localization settings (locale and direction)
- `setProgressionFormat`: Update progression format for reflow or FXL modes
- `setRunningHeadFormat`: Update running head format
- `setUI`: Update UI settings
- `setScrollAffordances`: Configure scroll behavior
- `setPaginatedAffordance`: Update paginated affordance settings
- `updateFromPreferences`: Bulk update from a preferences object

### WebPubSettings Reducer

Manages state for WebPub-specific reader settings.

**State Interface:**
```typescript
interface WebPubSettingsReducerState {
  fontFamily: FontFamilyStateObject;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineHeight: ThLineHeightOptions;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
  zoom: number;
}
```

**Actions:**
- `setWebPubFontFamily`: Set font family for WebPub
- `setWebPubFontWeight`: Set font weight for WebPub
- `setWebPubHyphens`: Set hyphenation for WebPub
- `setWebPubLetterSpacing`: Set letter spacing for WebPub
- `setWebPubLineHeight`: Set line height for WebPub
- `setWebPubParagraphIndent`: Set paragraph indent for WebPub
- `setWebPubParagraphSpacing`: Set paragraph spacing for WebPub
- `setWebPubPublisherStyles`: Set publisher styles for WebPub
- `setWebPubSpacingPreset`: Set spacing preset for WebPub
- `setWebPubTextAlign`: Set text alignment for WebPub
- `setWebPubTextNormalization`: Set text normalization for WebPub
- `setWebPubWordSpacing`: Set word spacing for WebPub
- `setWebPubZoom`: Set zoom level for WebPub