"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { Locator, Publication } from "@readium/shared";
import { ThLineHeightOptions } from "@/preferences/models";
import { EpubNavigatorListeners, IContentProtectionConfig, ILinkInjectable, IBlobInjectable } from "@readium/navigator";
import { ThPreferences } from "@/preferences";
import { FontMetadata, InjectableFontResources } from "@/preferences/services/fonts";

import { EPubStatelessCache } from "./useEpubStatelessCache";
import { useEpubPreferencesConfig } from "./usePreferencesConfig";
import { useEpubInjectablesConfig } from "./useInjectablesConfig";
import { useEpubNavigator, EpubNavigatorLoadProps } from "@/core/Hooks/Epub/useEpubNavigator";

interface UseEpubReaderInitProps {
  container: React.RefObject<HTMLDivElement | null>;
  publication: Publication | null;
  positionsList?: Locator[];
  initialPosition: Locator | null;
  listeners: EpubNavigatorListeners;
  preferences: ThPreferences;
  cache: React.RefObject<EPubStatelessCache>;
  isFontFamilyUsed: boolean;
  fontLanguage: string;
  getFontMetadata: (fontId: string) => FontMetadata;
  injectFontResources: (resources: InjectableFontResources | null) => void;
  removeFontResources: () => void;
  getAndroidFXLPatch: () => (ILinkInjectable & IBlobInjectable) | null;
  getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => InjectableFontResources | null;
  fxlThemeKeys: string[];
  reflowThemeKeys: string[];
  lineHeightOptions: Record<ThLineHeightOptions, number | null>;
  arrowsOccupySpace: boolean;
  arrowsWidth: React.RefObject<number>;
  colorScheme: any;
  isFXL: boolean;
  contentProtectionConfig?: IContentProtectionConfig;
  onNavigatorReady?: () => void;
  onNavigatorLoaded?: () => void;
  onCleanup?: () => void;
  fxlProgressionCallback?: (locator: Locator) => void;
}

export const useEpubReaderInit = ({
  container,
  publication,
  positionsList,
  initialPosition,
  listeners,
  preferences,
  cache,
  isFontFamilyUsed,
  fontLanguage,
  getFontMetadata,
  injectFontResources,
  removeFontResources,
  getAndroidFXLPatch,
  getFontInjectables,
  fxlThemeKeys,
  reflowThemeKeys,
  lineHeightOptions,
  arrowsOccupySpace,
  arrowsWidth,
  colorScheme,
  isFXL,
  contentProtectionConfig,
  onNavigatorReady,
  onNavigatorLoaded,
  onCleanup,
  fxlProgressionCallback,
}: UseEpubReaderInitProps) => {
  const [navigatorReady, setNavigatorReady] = useState(false);

  const { epubPreferences, epubDefaults } = useEpubPreferencesConfig({
    isFXL,
    settings: cache.current.settings,
    colorScheme,
    fontLanguage,
    arrowsOccupySpace,
    arrowsWidth,
    preferences,
    getFontMetadata,
    lineHeightOptions,
    fxlThemeKeys,
    reflowThemeKeys,
  });

  const { injectables } = useEpubInjectablesConfig({
    isFXL,
    isFontFamilyUsed,
    fontLanguage,
    getFontInjectables,
    getAndroidFXLPatch,
  });

  const handleCleanup = useCallback(() => {
    if (!isFXL) removeFontResources();
    onCleanup?.();
  }, [isFXL, removeFontResources, onCleanup]);

  const { EpubNavigatorLoad, EpubNavigatorDestroy } = useEpubNavigator();
  const isNavigatorLoadedEpub = useRef(false);
  
  useEffect(() => {
    // Only initialize once, never re-render
    if (!publication || isNavigatorLoadedEpub.current) return;

    // Add container protection
    if (!container.current) {
      console.error("Container ref is not available for navigator initialization");
      return;
    }

    // Initialize navigator for EPUB like WebPub
    const config: EpubNavigatorLoadProps = {
      container: container.current,
      publication,
      listeners,
      positionsList: positionsList?.map(loc => new Locator(loc)) || [],
      initialPosition: initialPosition ? new Locator(initialPosition) : undefined,
      preferences: epubPreferences,
      defaults: epubDefaults,
      injectables: injectables || undefined,
      contentProtection: contentProtectionConfig,
    };

    isNavigatorLoadedEpub.current = true;
    
    // Call onNavigatorReady outside of navigator load
    onNavigatorReady?.();
    
    // Pass onNavigatorLoaded as the callback to EpubNavigatorLoad
    EpubNavigatorLoad(config, () => {
      // Set navigatorReady to true only after navigator actually loads
      setNavigatorReady(true);
      onNavigatorLoaded?.();
    }, fxlProgressionCallback);

    return () => {
      if (isNavigatorLoadedEpub.current) {
        setNavigatorReady(false);
        EpubNavigatorDestroy(() => {
          isNavigatorLoadedEpub.current = false;
          handleCleanup();
        });
      }
    };
  }, []);

  // Handle font resource injection
  useEffect(() => {
    if (!isFXL && isFontFamilyUsed) {
      const fontResources = getFontInjectables({ language: fontLanguage });
      if (fontResources) {
        injectFontResources(fontResources);
      }
    }
  }, [isFXL, isFontFamilyUsed, fontLanguage, injectFontResources, getFontInjectables]);

  return {
    navigatorReady,
    isFXL,
  };
};
