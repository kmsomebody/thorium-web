"use client";

import { useMemo } from "react";

import { IInjectablesConfig } from "@readium/navigator";
import { InjectableFontResources } from "@/preferences/services/fonts";

interface UseWebPubInjectablesConfigProps {
  isFontFamilyUsed: boolean;
  fontLanguage: string;
  getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => InjectableFontResources | null;
}

export const useWebPubInjectablesConfig = ({
  isFontFamilyUsed,
  fontLanguage,
  getFontInjectables,
}: UseWebPubInjectablesConfigProps) => {
  const injectables = useMemo(() => {
    let injectablesConfig: IInjectablesConfig | undefined;

    if (isFontFamilyUsed) {
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
  }, [isFontFamilyUsed, fontLanguage, getFontInjectables]);

  return { injectables };
};
