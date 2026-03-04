import { FontCollection, GoogleFontSource, VariableFontRangeConfig, WeightConfig } from "@/preferences/models";


const DEFAULT_FALLBACK = "sans-serif";
const DEFAULT_WIDTH_STEP = 20;
const DEFAULT_WEIGHT_STEP = 20;

interface GoogleFontFamily {
  name: string;
  styles: ("normal" | "italic")[];
  weights: WeightConfig;
  widths?: VariableFontRangeConfig;
}

export interface GoogleFontDefinitionParams {
  cssUrl: string,
  options?: {
    widthStep?: number;
    weightStep?: number;
    display?: "swap" | "block" | "fallback" | "optional";
    labels?: Record<string, string>; // derived fontId -> label
    fallbacks?: Record<string, string[]>; // derived fontId -> fallback array
    order?: string[]; // array of font IDs in desired order
  }
}

/**
 * Parses a Google Fonts CSS URL and creates font definitions for all families
 * @param params Google Fonts CSS URL and optional configuration for step values and display
 * @returns FontCollection object with all font definitions
 * @throws Error if CSS URL is invalid or cannot be parsed
 */
export const createDefinitionsFromGoogleFonts = (params: GoogleFontDefinitionParams): FontCollection => {
  const { cssUrl, options } = params;
  const { widthStep = DEFAULT_WIDTH_STEP, weightStep = DEFAULT_WEIGHT_STEP, display, labels, fallbacks, order } = options || {};
  
  // Extract URL from @import url() or href="", otherwise use as-is
  const processedUrl = cssUrl.includes("@import") 
    ? cssUrl.match(/@import\s+url\(['"]?([^'")]+)['"]?\)/i)?.[1] || cssUrl
    : cssUrl.includes("href=")
      ? cssUrl.match(/href=["']([^"']+)["']/)?.[1] || cssUrl
      : cssUrl;
  
  // Parse the URL using static method
  const url = new URL(processedUrl);
  if (!url.hostname.includes("fonts.googleapis.com")) {
    throw new Error("Invalid Google Fonts URL");
  }

  // Get all family parameters using searchParams
  const familyParams = url.searchParams.getAll("family");
  if (familyParams.length === 0) {
    throw new Error("No family parameter found in Google Fonts URL");
  }

  // Parse each family parameter
  const families = familyParams.map(familyParam => {
    const decodedFamily = decodeURIComponent(familyParam);
    const [familyName, axesStr] = decodedFamily.split(":");
    
    if (!familyName) {
      throw new Error(`Invalid family format: ${ familyParam }`);
    }

    const family: GoogleFontFamily = {
      name: familyName.replace(/\+/g, " "),
      styles: ["normal"],
      weights: { type: "static", values: [400] } // Default weight
    };
    
    // Track if we've seen any explicit weights in the URL
    let hasExplicitWeights = false;

    // Parse axes if present
    if (axesStr) {
      const [axisNames, valuesStr] = axesStr.split("@");
      if (axisNames && valuesStr) {
        const axes = axisNames.split(",");
        const variations = valuesStr.split(";");
        
        variations.forEach(variation => {
          const values = variation.split(",");
          axes.forEach((axis, index) => {
            const value = values[index];
            if (!value) return;
            
            switch (axis) {
              case "ital":
                if (value === "1") {
                  family.styles = Array.from(new Set([...family.styles, "italic"]));
                }
                break;
              case "wght":
                if (value.includes("..")) {
                  // Variable font - use the range
                  const [min, max] = value.split("..").map(Number);
                  if (!isNaN(min) && !isNaN(max)) {
                    family.weights = {
                      type: "variable",
                      min,
                      max,
                      step: weightStep
                    };
                  }
                } else {
                  // Handle explicit weight from URL
                  const weight = Number(value);
                  if (!isNaN(weight) && family.weights.type === "static") {
                    const currentWeights = family.weights.values;
                    const newWeights = !hasExplicitWeights 
                      ? [weight]  // First weight replaces default
                      : Array.from(new Set([...currentWeights, weight])).sort((a, b) => a - b);  // Add to existing and deduplicate
                    
                    family.weights = {
                      type: "static",
                      values: newWeights
                    };
                    hasExplicitWeights = true;
                  }
                }
                break;
              case "wdth":
                if (value.includes("..")) {
                  const [min, max] = value.split("..").map(Number);
                  if (!isNaN(min) && !isNaN(max)) {
                    family.widths = {
                      min,
                      max,
                      step: widthStep
                    };
                  }
                }
                break;
            }
          });
        });
      }
    }

    return family;
  });

  // Convert families to FontCollection object
  const fontEntries: [string, any][] = families.map(family => {
    const fontId = family.name.toLowerCase().replace(/\s+/g, "-");
    return [
      fontId,
      {
        id: fontId,
        name: family.name,
        ...(labels?.[fontId] && { label: labels[fontId] }),
        source: { type: "custom", provider: "google" } as GoogleFontSource,
        spec: {
          family: family.name,
          fallbacks: fallbacks?.[fontId] || [DEFAULT_FALLBACK],
          weights: family.weights,
          styles: family.styles,
          ...(family.widths && { widths: family.widths }),
          ...(display && { display })
        }
      }
    ];
  });

  // If order is specified, sort the entries according to the order
  if (order && order.length > 0) {
    const orderedEntries: [string, any][] = [];
    const fontMap = new Map<string, any>(fontEntries);
    
    // Add fonts in the specified order (using font IDs directly)
    for (const fontId of order) {
      const fontEntry = fontMap.get(fontId);
      if (fontEntry) {
        orderedEntries.push([fontId, fontEntry]);
        fontMap.delete(fontId);
      }
    }
    
    // Add any remaining fonts that weren't in the order list
    for (const [fontId, fontEntry] of fontMap.entries()) {
      orderedEntries.push([fontId, fontEntry]);
    }
    
    return Object.fromEntries(orderedEntries);
  }

  // Default behavior - use original order from URL
  return Object.fromEntries(fontEntries); 
} 
