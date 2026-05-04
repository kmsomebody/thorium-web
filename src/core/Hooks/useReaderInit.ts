"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Locator, Publication } from "@readium/shared";

import { useEpubPreferencesConfig, useWebPubPreferencesConfig } from "./usePreferencesConfig";
import { useEpubInjectablesConfig, useWebPubInjectablesConfig } from "./useInjectablesConfig";
import { useEpubNavigator, EpubNavigatorLoadProps } from "./Epub/useEpubNavigator";
import { useWebPubNavigator, WebPubNavigatorLoadProps } from "./WebPub/useWebPubNavigator";
import { ThLineHeightOptions } from "../../preferences/models";
import { EpubNavigatorListeners, WebPubNavigatorListeners, IContentProtectionConfig, ILinkInjectable, IBlobInjectable } from "@readium/navigator";
import { ThPreferences } from "@/preferences";
import { FontMetadata, InjectableFontResources } from "@/preferences/services/fonts";
import { StatelessCache } from "./Epub/useEpubSettingsCache";
import { WebPubStatelessCache } from "./WebPub/useWebPubSettingsCache";

interface UseEpubReaderInitProps {
  container: React.RefObject<HTMLDivElement | null>;
  publication: Publication | null;
  positionsList?: Locator[];
  initialPosition: Locator | null;
  listeners: EpubNavigatorListeners;
  preferences: ThPreferences;
  cache: React.RefObject<StatelessCache>;
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
  onCleanup?: () => void;
}

interface UseWebPubReaderInitProps {
  container: React.RefObject<HTMLDivElement | null>;
  publication: Publication | null;
  initialPosition: Locator | null;
  listeners: WebPubNavigatorListeners;
  preferences: ThPreferences;
  cache: React.RefObject<WebPubStatelessCache>;
  isFontFamilyUsed: boolean;
  fontLanguage: string;
  hasDisplayTransformability: boolean;
  getFontMetadata: (fontId: string) => FontMetadata;
  injectFontResources: (resources: InjectableFontResources | null) => void;
  removeFontResources: () => void;
  getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => InjectableFontResources | null;
  lineHeightOptions: Record<ThLineHeightOptions, number | null>;
  contentProtectionConfig?: IContentProtectionConfig;
  onNavigatorReady?: () => void;
  onCleanup?: () => void;
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
  onCleanup,
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

  const handleNavigatorReady = useCallback(() => {
    onNavigatorReady?.();
    setNavigatorReady(true);
  }, [onNavigatorReady]);

  const handleCleanup = useCallback(() => {
    if (!isFXL) removeFontResources();
    onCleanup?.();
  }, [isFXL, removeFontResources, onCleanup]);

  const { EpubNavigatorLoad, EpubNavigatorDestroy } = useEpubNavigator();
  const isNavigatorLoadedEpub = useRef(false);
  
  useEffect(() => {
    // Only initialize once, never re-render
    if (!publication || isNavigatorLoadedEpub.current) return;

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
    
    EpubNavigatorLoad(config, () => {
      handleNavigatorReady();
    });

    return () => {
      if (isNavigatorLoadedEpub.current) {
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

export const useWebPubReaderInit = ({
  container,
  publication,
  initialPosition,
  listeners,
  preferences,
  cache,
  isFontFamilyUsed,
  fontLanguage,
  hasDisplayTransformability,
  getFontMetadata,
  injectFontResources,
  removeFontResources,
  getFontInjectables,
  lineHeightOptions,
  contentProtectionConfig,
  onNavigatorReady,
  onCleanup,
}: UseWebPubReaderInitProps) => {
  const [navigatorReady, setNavigatorReady] = useState(false);

  const { webPubPreferences } = useWebPubPreferencesConfig({
    settings: cache.current.settings,
    fontLanguage,
    hasDisplayTransformability,
    getFontMetadata,
    lineHeightOptions,
  });

  const { injectables } = useWebPubInjectablesConfig({
    isFontFamilyUsed,
    fontLanguage,
    getFontInjectables,
  });

  const handleNavigatorReady = useCallback(() => {
    onNavigatorReady?.();
    setNavigatorReady(true);
  }, [onNavigatorReady]);

  const handleCleanup = useCallback(() => {
    removeFontResources();
    onCleanup?.();
  }, [removeFontResources, onCleanup]);

  const { WebPubNavigatorLoad, WebPubNavigatorDestroy } = useWebPubNavigator();
  const isNavigatorLoadedWebPub = useRef(false);
  
  useEffect(() => {
    // Only initialize once, never re-render
    if (!publication || isNavigatorLoadedWebPub.current) return;

    const config: WebPubNavigatorLoadProps = {
      container: container.current,
      publication,
      listeners,
      initialPosition: initialPosition ? new Locator(initialPosition) : undefined,
      preferences: webPubPreferences,
      defaults: {
        experiments: preferences.experiments?.webPub || null
      },
      injectables,
      contentProtection: contentProtectionConfig,
    };

    isNavigatorLoadedWebPub.current = true;
    
    WebPubNavigatorLoad(config, () => {
      handleNavigatorReady();
    });

    return () => {
      if (isNavigatorLoadedWebPub.current) {
        WebPubNavigatorDestroy(() => {
          isNavigatorLoadedWebPub.current = false;
          handleCleanup();
        });
      }
    };
  }, []);

  // Handle font resource injection
  useEffect(() => {
    if (isFontFamilyUsed) {
      const fontResources = getFontInjectables({ language: fontLanguage });
      if (fontResources) {
        injectFontResources(getFontInjectables(undefined, true));
      }
    }
  }, [isFontFamilyUsed, fontLanguage, getFontInjectables,injectFontResources]);

  return {
    navigatorReady,
  };
};

