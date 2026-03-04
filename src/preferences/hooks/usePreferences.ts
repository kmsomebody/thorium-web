"use client";

import { useContext } from "react";
import { ThPreferencesContext } from "../ThPreferencesContext";
import { CustomizableKeys, DefaultKeys, ThPreferences } from "../preferences";
import { createFontService } from "../services/fonts";

export function usePreferences<K extends CustomizableKeys = DefaultKeys>() {
  const context = useContext(ThPreferencesContext);
  
  if (!context) {
    throw new Error("usePreferences must be used within a ThPreferencesProvider");
  }

  // Create font service that handles the entire ThFontFamilyPref object
  const fontService = createFontService(context.preferences.settings.keys.fontFamily);
  
  return {
    preferences: context.preferences as ThPreferences<K>,
    updatePreferences: context.updatePreferences as (prefs: ThPreferences<K>) => void,
    
    getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => {
      return fontService.getInjectables(options, optimize);
    },
    
    getFontsList: (options?: { language?: string } | { key?: string }) => {
      return fontService.getFontCollection(options);
    },
    
    getFontMetadata: (fontId: string) => {
      return fontService.getFontMetadata(fontId);
    },
    
    resolveFontLanguage: (bcp47Tag: string | undefined, direction: "ltr" | "rtl") => {
      return fontService.resolveFontLanguage(bcp47Tag, direction);
    }
  };
}