"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { Locator, Publication } from "@readium/shared";
import { ThLineHeightOptions } from "@/preferences/models";
import { WebPubNavigatorListeners, IContentProtectionConfig } from "@readium/navigator";
import { ThPreferences } from "@/preferences";
import { FontMetadata, InjectableFontResources } from "@/preferences/services/fonts";
import { WebPubStatelessCache } from "@/core/Hooks/WebPub/useWebPubSettingsCache";

import { useWebPubPreferencesConfig } from "./usePreferencesConfig";
import { useWebPubInjectablesConfig } from "./useInjectablesConfig";
import { useWebPubNavigator, WebPubNavigatorLoadProps } from "@/core/Hooks/WebPub/useWebPubNavigator";

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
  }, [isFontFamilyUsed, fontLanguage, getFontInjectables, injectFontResources]);

  return {
    navigatorReady,
  };
};
