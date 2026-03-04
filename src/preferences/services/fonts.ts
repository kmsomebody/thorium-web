import { FontDefinition, VariableFontRangeConfig, WeightConfig, ThFontFamilyPref, FontCollection, ValidatedLanguageCollection } from "../models";

import { ILinkInjectable, IUrlInjectable, IBlobInjectable } from "@readium/navigator";

import { createBunnyFontResources } from "./createBunnyFontResources";
import { createGoogleFontResources } from "./createGoogleFontResources";
import { createLocalFontResources } from "./createLocalFontResources";

export type FontResource = (ILinkInjectable & IUrlInjectable) | (ILinkInjectable & IBlobInjectable);

export interface InjectableFontResources {
  allowedDomains: string[];
  prepend: FontResource[];
  append: FontResource[];
}

export interface FontMetadata {
  fontStack: string | null;
  fontFamily: string | null;
  weights: WeightConfig | null;
  widths: VariableFontRangeConfig | null;
}

export interface FontService {
  getInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => InjectableFontResources | null;
  getFontMetadata: (fontId: string) => FontMetadata;
  getFontCollection: (options?: { language?: string } | { key?: string }) => FontCollection;
  resolveFontLanguage: (bcp47Tag: string | undefined, direction: "ltr" | "rtl") => string;
}

export const createFontService = (fontFamilyPref: ThFontFamilyPref): FontService => {
  const allSupportedLanguages: string[] = [];
  const parsedFonts = new Map<string, FontMetadata>();
  
  const bunnyFonts = new Map<string, FontDefinition[]>();
  const googleFonts = new Map<string, FontDefinition[]>();
  const localFonts = new Map<string, FontDefinition[]>();
  
  /**
   * Resolves a BCP47 language tag to a supported language format based on specific rules and available font collections.
   * 
   * Rules:
   * - First checks if the full BCP47 tag exists in supportedLanguages
   * - If not found, checks for { language }-{ scriptOrRegion } format
   * - Special case for Japanese (ja):
   *   - For RTL direction, checks if "ja-v" is supported
   *   - Otherwise falls back to "ja" if supported
   * - Filters out specific language-script combinations:
   *   - Mongolian: "mn-mong" and "mn-cyrl"
   *   - Chinese: "zh-hant", "zh-tw", "zh-hk"
   * - If not filtered, falls back to { language } if supported
   * - Returns "default" if no match is found
   * 
   * @param bcp47Tag - The BCP47 language tag to resolve
   * @param direction - Text direction ("ltr" or "rtl")
   * @returns The resolved language tag or "default" if no match found
   */
  const resolveFontLanguage = (
    bcp47Tag: string | undefined, 
    direction: "ltr" | "rtl" = "ltr"
  ): string => {
    if (!bcp47Tag) return "default";
    
    // Check direct match of full BCP47 tag
    if (allSupportedLanguages.includes(bcp47Tag)) {
      return bcp47Tag;
    }
    
    const parts = bcp47Tag.split(/[-_]/);
    const language = parts[0].toLowerCase();
    const scriptOrRegion = parts[1]?.toLowerCase();
    
    // Check { language }-{ scriptOrRegion } format
    if (scriptOrRegion) {
      const langScriptOrRegion = `${ language }-${ scriptOrRegion }`;
      if (allSupportedLanguages.includes(langScriptOrRegion)) {
        return langScriptOrRegion;
      }
    }
    
    // Special case for Japanese
    if (language === "ja" && !scriptOrRegion) {
      if (direction === "rtl" && allSupportedLanguages.includes("ja-v")) {
        return "ja-v";
      }
      if (allSupportedLanguages.includes("ja")) {
        return "ja";
      }
    }
    
    // Special cases that should be filtered out
    const shouldFilter = 
      (language === "mn" && (scriptOrRegion === "mong" || scriptOrRegion === "cyrl")) ||
      (language === "zh" && (scriptOrRegion === "hant" || scriptOrRegion === "tw" || scriptOrRegion === "hk"));
    
    // If not filtered, check if just the language is supported
    if (!shouldFilter && allSupportedLanguages.includes(language)) {
      return language;
    }
    
    return "default";
  };

  // Parse ALL fonts upfront - index by collection
  Object.entries(fontFamilyPref).forEach(([collectionName, collectionData]) => {
    // Handle both FontCollection and ValidatedLanguageCollection
    const fontCollection = "fonts" in collectionData ? 
      (collectionData as ValidatedLanguageCollection).fonts : 
      collectionData as FontCollection;
    
    // Collect supported languages if this is a ValidatedLanguageCollection
    if ("supportedLanguages" in collectionData) {
      const reducedLanguages = collectionData.supportedLanguages.map((lang: string) => {
        const parts = lang.split(/[-_]/);
        const language = parts[0].toLowerCase();
        const scriptOrRegion = parts[1]?.toLowerCase();
        return scriptOrRegion ? `${ language }-${ scriptOrRegion }` : language;
      });
      allSupportedLanguages.push(...reducedLanguages);
    }
    
    // Initialize arrays for this collection
    bunnyFonts.set(collectionName, []);
    googleFonts.set(collectionName, []);
    localFonts.set(collectionName, []);
    
    const collectionBunnyFonts = bunnyFonts.get(collectionName)!;
    const collectionGoogleFonts = googleFonts.get(collectionName)!;
    const collectionLocalFonts = localFonts.get(collectionName)!;
    
    // Process each font in the collection
    Object.entries<FontDefinition>(fontCollection as Record<string, FontDefinition>).forEach(([id, font]) => {
      const fontFamily = font.spec.family;
      let fontStack = fontFamily;

      if (font.source.type === "custom") {
        switch (font.source.provider) {
          case "bunny":
            collectionBunnyFonts.push(font);
            break;
          case "google":
            collectionGoogleFonts.push(font);
            break;
          case "local":
            collectionLocalFonts.push(font);
            break;
        }
      }

      const wrapIfNeeded = (name: string): string => {
        const trimmed = name.trim();
        if (!trimmed) return "";
        
        // If the name has spaces and isn't already wrapped in quotes
        if (trimmed.includes(" ") && !/^['"].*['"]$/.test(trimmed)) {
          return `"${ trimmed }"`;
        }
        return trimmed;
      };

      const wrappedFontFamily = wrapIfNeeded(fontFamily);
      
      if (font.spec.fallbacks?.length) {
        const uniqueFallbacks = [...new Set(
          font.spec.fallbacks
            .filter((fallback: string) => fallback.toLowerCase() !== fontFamily.toLowerCase())
            .map(wrapIfNeeded)
        )];
        if (uniqueFallbacks.length > 0) {
          fontStack = [wrappedFontFamily, ...uniqueFallbacks].join(", ");
        }
      }

      parsedFonts.set(id, { 
        fontStack: fontStack || wrappedFontFamily, 
        fontFamily: wrappedFontFamily,
        weights: font.spec.weights || null,
        widths: font.spec.widths || null
      });
    });
  });

  // Get default collection for fallback
  const defaultBunnyFonts = bunnyFonts.get("default") || [];
  const defaultGoogleFonts = googleFonts.get("default") || [];
  const defaultLocalFonts = localFonts.get("default") || [];
  
  // Helper function to process fonts into injectable resources
  const processFonts = (bunnyFontsList: FontDefinition[], googleFontsList: FontDefinition[], localFontsList: FontDefinition[], optimize: boolean = false): InjectableFontResources | null => {
    const result: InjectableFontResources = {
      allowedDomains: [],
      prepend: [],
      append: []
    };

    // Process Bunny Fonts
    const bunnyResources = bunnyFontsList
      .map(font => createBunnyFontResources(font))
      .filter((resource): resource is FontResource => resource !== null);

    if (bunnyResources.length > 0) {
      result.allowedDomains.push(
        "https://fonts.bunny.net"
      );

      result.prepend.push(
        { 
          as: "link",
          rel: "preconnect",
          url: "https://fonts.bunny.net"
        }
      );

      result.append.push(...bunnyResources);
    }

    // Process Google Fonts
    const googleResources = googleFontsList
      .map(font => createGoogleFontResources(font, optimize ? font.name : undefined))
      .filter((resource): resource is FontResource => resource !== null);

    if (googleResources.length > 0) {
      result.allowedDomains.push(
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      );
      
      result.prepend.push(
        { 
          as: "link",
          rel: "preconnect",
          url: "https://fonts.googleapis.com"
        },
        { 
          as: "link",
          rel: "preconnect",
          url: "https://fonts.gstatic.com",
          attributes: { crossOrigin: "anonymous" }
        }
      );
      
      result.append.push(...googleResources);
    }

    // Process Local Fonts
    const localResources = localFontsList
      .map(createLocalFontResources)
      .filter((resource): resource is FontResource => resource !== null);

    if (localResources.length > 0) {
      result.allowedDomains.push(window.location.origin);
      result.append.push(...localResources);
    }

    return result.append.length > 0 ? result : null;
  };

  /**
   * Returns injectable font resources based on the provided options.
   * 
   * @param options - The options object containing either a language or a key.
   * @param optimize - Whether to optimize the font resources. This will use the font label/name to determine the letters to request from Google Fonts.
   * @returns The injectable font resources or null if no valid collection is found.
   */
  const getInjectables = (options?: { language?: string } | { key?: string }, optimize = false): InjectableFontResources | null => {
      // Handle key-based selection
      if (options && "key" in options) {
        const { key } = options;
        
        if (!key || !(key in fontFamilyPref)) {
          return null;
        }
        
        return processFonts(bunnyFonts.get(key) || [], googleFonts.get(key) || [], localFonts.get(key) || [], optimize);
      }
      
      // Handle language-based selection
      if (options && "language" in options) {
        const { language: publicationLanguage } = options;
        
        // Find the collection for this language (validation already done in createPreferences)
        for (const [collectionName, collectionData] of Object.entries(fontFamilyPref)) {
          if (collectionName === "default") continue;
          
          const supportedLangs = "supportedLanguages" in collectionData ? 
            collectionData.supportedLanguages : null;
            
          if (supportedLangs && Array.isArray(supportedLangs) && publicationLanguage && supportedLangs.includes(publicationLanguage)) {
            return processFonts(bunnyFonts.get(collectionName) || [], googleFonts.get(collectionName) || [], localFonts.get(collectionName) || [], optimize);
          }
        }
      }
      
      // Default behavior - return default collection
      return processFonts(defaultBunnyFonts, defaultGoogleFonts, defaultLocalFonts, optimize);
    };
    
    /**
     * Returns metadata for a specific font.
     * 
     * @param fontId - The ID of the font.
     * @returns The metadata for the font or null if the font is not found.
     */
    const getFontMetadata = (fontId: string) => {
      const parsed = parsedFonts.get(fontId);
      return parsed || { fontStack: null, fontFamily: null, weights: null, widths: null };
    };

    /**
     * Returns the font collection based on the provided options.
     * 
     * @param options - The options object containing either a language or a key.
     * @returns The font collection or the default collection if no valid collection is found.
     */
    const getFontCollection = (options?: { language?: string } | { key?: string }): FontCollection => {
      // Handle key-based selection
      if (options && "key" in options) {
        const { key } = options;
        
        if (!key || !(key in fontFamilyPref)) {
          return fontFamilyPref.default as FontCollection;
        }
        
        // Check if we're accessing the default collection
        if (key === "default") {
          return fontFamilyPref.default as FontCollection;
        }
        
        // For non-default keys, we expect ValidatedLanguageCollection
        const prefRecord = fontFamilyPref as Record<string, FontCollection | ValidatedLanguageCollection>;
        const collection = prefRecord[key] as ValidatedLanguageCollection;
        if (collection && "fonts" in collection) {
          return collection.fonts;
        }
        
        // Fallback to default
        return fontFamilyPref.default as FontCollection;
      }
      
      // Handle language-based selection
      if (options && "language" in options) {
        const { language: publicationLanguage } = options;
        
        // Find the collection for this language (validation already done in createPreferences)
        for (const [collectionName, collectionData] of Object.entries(fontFamilyPref)) {
          if (collectionName === "default") continue;
          
          const collection = "fonts" in collectionData ? collectionData : { fonts: collectionData };
          const supportedLangs = "supportedLanguages" in collection ? 
            collection.supportedLanguages : null;
            
          if (supportedLangs?.includes(publicationLanguage!)) {
            return collection.fonts;
          }
        }

        // Fall back to default if no collection supports this language
        return fontFamilyPref.default as FontCollection;
      }
      
      // Default behavior - return default collection
      return fontFamilyPref.default as FontCollection;
    };

  return {
    getInjectables,
    getFontMetadata,
    getFontCollection,
    resolveFontLanguage
  };
};
