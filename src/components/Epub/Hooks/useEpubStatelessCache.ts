"use client";

import { useMemo, useRef } from "react";
import { ThLayoutUI, ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { LineLengthStateObject, FontFamilyStateObject } from "@/lib/settingsReducer";
import { Locator } from "@readium/shared";
import { useEpubSettingsCache, ReadiumCSSSettings } from "@/core/Hooks/Epub/useEpubSettingsCache";

export interface EPubStatelessCache {
  layoutUI: ThLayoutUI;
  isImmersive: boolean;
  isHovering: boolean;
  arrowsOccupySpace: boolean;
  settings: ReadiumCSSSettings;
  positionsList: Locator[];
  colorScheme?: ThColorScheme;
  reducedMotion?: boolean;
}

export const useEpubStatelessCache = (
  textAlign: ThTextAlignOptions | null,
  columnCount: string,
  fontFamily: FontFamilyStateObject,
  fontSize: number,
  fontWeight: number,
  hyphens: boolean | null,
  letterSpacing: number | null,
  lineLength: LineLengthStateObject | null,
  lineHeight: ThLineHeightOptions | null,
  paragraphIndent: number | null,
  paragraphSpacing: number | null,
  publisherStyles: boolean,
  scroll: boolean,
  textNormalization: boolean,
  wordSpacing: number | null,
  theme: string | undefined,
  positionsList: Locator[],
  colorScheme: ThColorScheme,
  reducedMotion: boolean,
  layoutUI: ThLayoutUI,
  isImmersive: boolean,
  isHovering: boolean,
  arrowsOccupySpace: boolean
) => {
  const settingsCache = useEpubSettingsCache(
    textAlign,
    columnCount,
    fontFamily,
    fontSize,
    fontWeight,
    hyphens,
    letterSpacing,
    lineLength,
    lineHeight,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    scroll,
    textNormalization,
    wordSpacing,
    theme
  );

  const cache = useRef<EPubStatelessCache>({
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: settingsCache.current.settings,
    positionsList: positionsList,
    colorScheme,
    reducedMotion,
  });

  const memoizedCache = useMemo(() => ({
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: settingsCache.current.settings,
    positionsList: positionsList,
    colorScheme,
    reducedMotion,
  }), [
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace,
    settingsCache,
    positionsList,
    colorScheme,
    reducedMotion,
  ]);

  // Update synchronously to match original behavior
  cache.current = memoizedCache;

  return cache;
};
