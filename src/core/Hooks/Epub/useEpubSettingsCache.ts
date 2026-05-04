"use client";

import { useRef, useMemo } from "react";
import { ThLayoutUI, ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { LineLengthStateObject, FontFamilyStateObject } from "@/lib/settingsReducer";
import { Locator } from "@readium/shared";

export interface ReadiumCSSSettings {
  columnCount: string;
  fontFamily: FontFamilyStateObject;
  fontSize: number;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineLength: LineLengthStateObject | null;
  lineHeight: ThLineHeightOptions | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  scroll: boolean;
  textAlign: ThTextAlignOptions | null;
  textNormalization: boolean;
  theme?: string;
  wordSpacing: number | null;
}

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

export const useEpubSettingsCache = (
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
  const cache = useRef<EPubStatelessCache>({
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: {
      columnCount,
      fontFamily,
      fontSize,
      fontWeight,
      hyphens,
      letterSpacing,
      lineHeight,
      lineLength,
      paragraphIndent,
      paragraphSpacing,
      publisherStyles,
      scroll: scroll,
      textAlign,
      textNormalization,
      theme,
      wordSpacing,
    },
    positionsList: positionsList || [],
    colorScheme,
    reducedMotion,
  });

  const memoizedCache = useMemo(() => ({
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: {
      columnCount,
      fontFamily,
      fontSize,
      fontWeight,
      hyphens,
      letterSpacing,
      lineHeight,
      lineLength,
      paragraphIndent,
      paragraphSpacing,
      publisherStyles,
      scroll: scroll,
      textAlign,
      textNormalization,
      theme,
      wordSpacing,
    },
    positionsList: positionsList || [],
    colorScheme,
    reducedMotion,
  }), [
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace,
    columnCount,
    fontFamily,
    fontSize,
    fontWeight,
    hyphens,
    letterSpacing,
    lineHeight,
    lineLength,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    scroll,
    textAlign,
    textNormalization,
    theme,
    wordSpacing,
    positionsList,
    colorScheme,
    reducedMotion,
  ]);

  // Update synchronously to match original behavior
  cache.current = memoizedCache;

  return cache;
};
