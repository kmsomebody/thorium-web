"use client";

import { useMemo } from "react";

import { IInjectablesConfig, ILinkInjectable, IBlobInjectable } from "@readium/navigator";
import { InjectableFontResources } from "@/preferences/services/fonts";

interface UseEpubInjectablesConfigProps {
  isFXL: boolean;
  isFontFamilyUsed: boolean;
  fontLanguage: string;
  getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => InjectableFontResources | null;
  getAndroidFXLPatch: () => (ILinkInjectable & IBlobInjectable) | null;
}

export const useEpubInjectablesConfig = ({
  isFXL,
  isFontFamilyUsed,
  fontLanguage,
  getFontInjectables,
  getAndroidFXLPatch,
}: UseEpubInjectablesConfigProps) => {
  const injectables = useMemo(() => {
    let injectablesConfig: IInjectablesConfig | undefined;

    if (isFXL) {
      const androidPatch = getAndroidFXLPatch();
      if (androidPatch) {
        injectablesConfig = {
          allowedDomains: [window.location.origin],
          rules: [{
            resources: [/\.xhtml$/, /\.html$/],
            prepend: [androidPatch]
          }]
        };
      }
    }

    if (!isFXL && isFontFamilyUsed) {
      const fontResources = getFontInjectables({ language: fontLanguage });
      if (fontResources) {
        injectablesConfig = {
          allowedDomains: fontResources.allowedDomains,
          rules: [{
            resources: [/\.xhtml$/, /\.html$/],
            prepend: fontResources.prepend,
            append: fontResources.append
          }]
        };
      }
    }

    return injectablesConfig;
  }, [isFXL, isFontFamilyUsed, fontLanguage, getFontInjectables, getAndroidFXLPatch]);

  return { injectables };
};
