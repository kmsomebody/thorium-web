"use client";

import { useRef, useMemo } from "react";
import { ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { LineLengthStateObject, FontFamilyStateObject } from "@/lib/settingsReducer";

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

export interface EPubSettingsCache {
  settings: ReadiumCSSSettings;
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
  theme: string | undefined
) => {
  const cache = useRef<EPubSettingsCache>({
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
  });

  const memoizedCache = useMemo(() => ({
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
  }), [
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
  ]);

  // Update synchronously to match original behavior
  cache.current = memoizedCache;

  return cache;
};
