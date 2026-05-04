"use client";

import { useRef, useMemo } from "react";
import { ThTextAlignOptions, ThLineHeightOptions } from "@/preferences/models";
import { FontFamilyStateObject } from "@/lib/settingsReducer";

export interface WebPubCSSSettings {
  fontFamily: FontFamilyStateObject;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineHeight: ThLineHeightOptions | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  textAlign: ThTextAlignOptions | null;
  textNormalization: boolean;
  wordSpacing: number | null;
  zoom: number;
}

export interface WebPubStatelessCache {
  settings: WebPubCSSSettings;
}

export const useWebPubSettingsCache = (
  fontFamily: FontFamilyStateObject,
  fontWeight: number,
  hyphens: boolean | null,
  letterSpacing: number | null,
  lineHeight: ThLineHeightOptions | null,
  paragraphIndent: number | null,
  paragraphSpacing: number | null,
  publisherStyles: boolean,
  textAlign: ThTextAlignOptions | null,
  textNormalization: boolean,
  wordSpacing: number | null,
  zoom: number
) => {
  const cache = useRef<WebPubStatelessCache>({
    settings: {
      fontFamily,
      fontWeight,
      hyphens,
      letterSpacing,
      lineHeight,
      paragraphIndent,
      paragraphSpacing,
      publisherStyles,
      textAlign,
      textNormalization,
      wordSpacing,
      zoom,
    },
  });

  const memoizedCache = useMemo(() => ({
    settings: {
      fontFamily,
      fontWeight,
      hyphens,
      letterSpacing,
      lineHeight,
      paragraphIndent,
      paragraphSpacing,
      publisherStyles,
      textAlign,
      textNormalization,
      wordSpacing,
      zoom,
    },
  }), [
    fontFamily,
    fontWeight,
    hyphens,
    letterSpacing,
    lineHeight,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    textAlign,
    textNormalization,
    wordSpacing,
    zoom,
  ]);

  // Update synchronously to match original behavior
  cache.current = memoizedCache;

  return cache;
};
