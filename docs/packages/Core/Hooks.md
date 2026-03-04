# Core Hooks

The Core package provides various hooks, including a custom hook for handling EPUB publications, accessibility, and responsive design.

## EPUB Support Hook

```tsx
import {
  useEpubNavigator
} from "@edrlab/thorium-web/core/hooks";
```

This hook exposes Readium TS-Toolkit `Navigator` object and provides methods to navigate through the publication, apply preferences, etc.

It is the most important hook of the Core package, as it provides the foundation for building an Epub Reader.

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/epub` package so that they all use the same one, not from `@edrlab/thorium-web/core`.

## WebPub Support Hook

```tsx
import {
  useWebPubNavigator
} from "@edrlab/thorium-web/core/hooks";
```

Similar to the EPUB navigator hook, this hook provides navigation functionality for Web Publications using the Readium TS-Toolkit `Navigator` object.

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/webpub` package so that they all use the same one, not from `@edrlab/thorium-web/core`.

## Responsive Design Hooks

```tsx
import { 
  useBreakpoints,
  useMediaQuery 
} from "@edrlab/thorium-web/core/hooks";

const MyComponent = () => {
  const isLandscape = useMediaQuery("(orientation: landscape)");
    
  return (
    <div>
      <p>Is landscape: { isLandscape ? "Yes" : "No" }</p>
    </div>
  );
};
```

These hooks are used in `useTheming` hook from `@edrlab/thorium-web/core/preferences` package. They are exposed in case they can be useful or if you want to use them in your own implementation of an app.

TBD.

## Accessibility Hooks

```tsx
import { 
  useColorScheme, 
  useContrast, 
  useForcedColors, 
  useMonochrome, 
  useReducedMotion, 
  useReducedTransparency 
} from "@edrlab/thorium-web/core/hooks";

const MyAccessibleComponent = () => {
  const reducedMotion = useReducedMotion();
  
  return (
    <MyAnimatedComponent disableMotion={ reducedMotion }>
      {/* Content with conditional animations */}
    </MyAnimatedComponent>
  );
};
```

These hooks are used in `useTheming` hook from `@edrlab/thorium-web/core/preferences` package. They are exposed in case they can be useful or if you want to use them in your own implementation of an app.

## Utility Hooks

```tsx
import { useState } from "react";

import { 
  useIsClient, 
  usePrevious, 
  useFullscreen
} from "@edrlab/thorium-web/core/hooks";

const MyIncrementButton = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);
  
  return (
    <div>
      <p>Current count: { count } (Previous: { previousCount ?? "none"} )</p>
      <button onClick={ () => setCount(count + 1) }>Increment</button>
    </div>
  );
};

const myFullscreenButton = () => {
  const { isFullscreen, handleFullscreen } = useFullscreen();

  return (
    <button onClick={ handleFullscreen }>
      { isFullscreen? "Exit Fullscreen" : "Enter Fullscreen"}
    </button>
  );
}
```