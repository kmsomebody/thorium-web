"use client";

import { useCallback, useMemo, useRef } from "react";

import { 
  Layout, 
  Link, 
  Locator, 
  Publication 
} from "@readium/shared";
import {
  EpubNavigator,
  EpubNavigatorListeners,
  EpubPreferences,
  EpubSettings,
  IContentProtectionConfig,
  IEpubDefaults,
  IEpubPreferences,
  IInjectablesConfig,
  getScriptMode,
  ScriptMode
} from "@readium/navigator";

type cbb = (ok: boolean) => void;

// Module scoped, singleton instance of navigator
let navigatorInstance: EpubNavigator | null = null;

export interface EpubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: EpubNavigatorListeners;
  positionsList?: Locator[];
  initialPosition?: Locator;
  preferences?: IEpubPreferences;
  defaults?: IEpubDefaults;
  injectables?: IInjectablesConfig;
  contentProtection?: IContentProtectionConfig;
}

// Only allow 1 navigation per x milliseconds
const throttle = 300;
let navigationBlocked = false;
let nextNavigation: null | (() => void) = null;
const throttleNavigation = (navigate: () => void) => {
  // If navigation is on cooldown, run it when the cooldown ends
  if (navigationBlocked) {
    nextNavigation = navigate;
    return;
  }

  // Navigate and block subsequent calls 
  navigationBlocked = true;
  nextNavigation = null;
  navigate();

  // Unblock after cooldown, and optionally run next navigate callback
  setTimeout(() => {
    navigationBlocked = false;
    if (nextNavigation) {
      throttleNavigation(nextNavigation);
    }
  }, throttle);
}

export const useEpubNavigator = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const containerParent = useRef<HTMLElement | null>(null);
  const publication = useRef<Publication | null>(null);

  const submitPreferences = useCallback(async (preferences: IEpubPreferences) => {
    await navigatorInstance?.submitPreferences(new EpubPreferences(preferences));
  }, []);

  const getSetting = useCallback(<K extends keyof EpubSettings>(settingKey: K) => {
    return navigatorInstance?.settings[settingKey] as EpubSettings[K];
  }, []);

  // [TMP] Working around positionChanged not firing consistently for FXL
  // We’re observing the FXLFramePoolManager spine div element’s style
  // and checking whether its translate3d has changed.
  // Sure IntersectionObserver should be the obvious one to use here,
  // observing iframes instead of the style attribute on the spine element
  // but there’s additional complexity to handle as a spread = 2 iframes
  // And keeping in sync while the FramePool is re-aligning on resize can be suboptimal
  const FXLPositionChangedCallbackRef = useRef<((locator: Locator) => void) | undefined>(undefined);
  const FXLPositionChanged = useMemo(() => {  
    return new MutationObserver((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        const re = /translate3d\(([^)]+)\)/;
        const newVal = (mutation.target as HTMLElement).getAttribute(mutation.attributeName as string);
        const oldVal = mutation.oldValue;
        if (newVal?.split(re)[1] !== oldVal?.split(re)[1]) {
          const locator = navigatorInstance?.currentLocator;
          if (locator && FXLPositionChangedCallbackRef.current) {
            FXLPositionChangedCallbackRef.current(locator);
          }
        }
      }
    });
  }, []);

  const EpubNavigatorLoad = useCallback((config: EpubNavigatorLoadProps, cb: Function, fxlCallback?: (locator: Locator) => void) => {
    if (config.container) {
      container.current = config.container;
      containerParent.current = container.current? container.current.parentElement : null;
      
      publication.current = config.publication;

      // Register FXL callback immediately if provided
      if (fxlCallback) {
        FXLPositionChangedCallbackRef.current = fxlCallback;
      }

      navigatorInstance = new EpubNavigator(
        config.container, 
        config.publication, 
        config.listeners, 
        config.positionsList, 
        config.initialPosition, 
        { 
          preferences: config.preferences || {}, 
          defaults: config.defaults || {}, 
          injectables: config.injectables || undefined,
          contentProtection: config.contentProtection || undefined
        }
      );

      navigatorInstance.load().then(() => {
        cb();

        if (navigatorInstance?.layout === Layout.fixed) {
          // @ts-ignore
          FXLPositionChanged.observe((navigatorInstance?.pool.spineElement as HTMLElement), {
            attributeFilter: ["style"], 
            attributeOldValue: true
          });
        }
      });
    }
  }, [FXLPositionChanged]);

  const EpubNavigatorDestroy = useCallback((cb: Function) => {
    cb();

    if (navigatorInstance?.layout === Layout.fixed) {
      FXLPositionChanged.disconnect();
    }
    navigatorInstance?.destroy().then(() => {
      navigatorInstance = null; // Clear the singleton reference
    });
  }, [FXLPositionChanged]);

  const goRight = useCallback((animated: boolean, callback: cbb) => {
    throttleNavigation(() => {
      navigatorInstance?.goRight(animated, callback);
    });    
  }, []);

  const goLeft = useCallback((animated: boolean, callback: cbb) => {
    throttleNavigation(() => {
      navigatorInstance?.goLeft(animated, callback);
    });
  }, []);

  const goBackward = useCallback((animated: boolean, callback: cbb) => {
    throttleNavigation(() => {      
      navigatorInstance?.goBackward(animated, callback);
    });
  }, []);

  const goForward = useCallback((animated: boolean, callback: cbb) => {
    throttleNavigation(() => {
      navigatorInstance?.goForward(animated, callback);
    })
  }, []);

  const goLink = useCallback((link: Link, animated: boolean, callback: cbb) => {
    throttleNavigation(() => {
      navigatorInstance?.goLink(link, animated, callback);
    });
  }, []);

  const go = useCallback((locator: Locator, animated: boolean, callback: cbb) => {
    throttleNavigation(() =>{
      navigatorInstance?.go(locator, animated, callback);
    });
  }, []);

  const navLayout = useCallback(() => {
    return navigatorInstance?.layout;
  }, []);

  const currentLocator = useCallback(() => {
    return navigatorInstance?.currentLocator;
  }, []);

  const getLocatorAtOffset = useCallback((offset: number) => {
    const readingOrder = navigatorInstance?.publication?.readingOrder;
    if (!readingOrder) return null;

    const currentLocator = navigatorInstance?.currentLocator;
    if (!currentLocator) return null;

    const currentLocatorIndex = readingOrder.findIndexWithHref(currentLocator.href);
    if (currentLocatorIndex === -1) return null;
    
    const newIndex = currentLocatorIndex + offset;
    if (newIndex < 0 || newIndex >= readingOrder.items.length) return null;
    
    return readingOrder.items[newIndex];
  }, []);

  const previousLocator = useCallback(() => {
    const link = getLocatorAtOffset(-1);
    if (!link) return null;
    return navigatorInstance?.publication?.manifest?.locatorFromLink(link);
  }, [getLocatorAtOffset]);

  const nextLocator = useCallback(() => {
    const link = getLocatorAtOffset(1);
    if (!link) return null;
    return navigatorInstance?.publication?.manifest?.locatorFromLink(link);
  }, [getLocatorAtOffset]);

  const currentPositions = useCallback(() => {
    return navigatorInstance?.viewport?.positions;
  }, []);

  const canGoBackward = useCallback(() => {
    return navigatorInstance?.canGoBackward;
  }, []);

  const canGoForward = useCallback(() => {
    return navigatorInstance?.canGoForward;
  }, []);

  const isScrollStart = useCallback(() => {
    return navigatorInstance?.isScrollStart;
  }, []);

  const isScrollEnd = useCallback(() => {
    return navigatorInstance?.isScrollEnd;
  }, []);

  // Warning: this is an internal member that will become private, do not rely on it
  // See https://github.com/edrlab/thorium-web/issues/25
  const getCframes = useCallback(() => {
    return navigatorInstance?._cframes;
  }, []);

  const currentScriptMode = useCallback((): ScriptMode | undefined => {
    const metadata = navigatorInstance?.publication?.metadata;
    if (!metadata) return undefined;
    return getScriptMode(metadata);
  }, []);

  return { 
    EpubNavigatorLoad, 
    EpubNavigatorDestroy, 
    goRight, 
    goLeft, 
    goBackward, 
    goForward,
    goLink, 
    go, 
    navLayout, 
    currentLocator,
    previousLocator,
    nextLocator,
    currentPositions,
    canGoBackward,
    canGoForward,
    isScrollStart,
    isScrollEnd,
    preferencesEditor: navigatorInstance?.preferencesEditor,
    getSetting,
    submitPreferences,
    getCframes,
    getScriptMode: currentScriptMode,
    onFXLPositionChange: (cb: (locator: Locator) => void) => {
      FXLPositionChangedCallbackRef.current = cb;
    }
  }
}