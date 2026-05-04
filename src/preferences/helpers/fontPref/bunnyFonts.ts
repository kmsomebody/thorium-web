import { FontCollection, FontDefinition } from "@/preferences/models";

interface BunnyFontDefinitionParams {
  cssUrl: string;
  options?: {
    labels?: Record<string, string>; // derived fontId -> label
    fallbacks?: Record<string, string[]>; // derived fontId -> fallback array
    order?: string[]; // array of font IDs in desired order
  };
}

const DEFAULT_FALLBACK = "sans-serif";

/**
 * Parses a Bunny Fonts CSS URL and creates font definitions for all families
 * @param params Bunny Fonts CSS URL and optional configuration
 * @returns FontCollection object with all font definitions
 * @throws Error if CSS URL is invalid or cannot be parsed
 */
export const createDefinitionsFromBunnyFonts = (params: BunnyFontDefinitionParams): FontCollection => {
  const { cssUrl, options } = params;
  const { fallbacks, order, labels } = options || {};
  
  // Extract URL from @import url() or href="", otherwise use as-is
  const processedUrl = cssUrl.includes("@import") 
    ? cssUrl.match(/@import\s+url\(['"]?([^'")]+)['"]?\)/i)?.[1] || cssUrl
    : cssUrl.includes("href=")
      ? cssUrl.match(/href=["']([^"']+)["']/)?.[1] || cssUrl
      : cssUrl;
  
  // Parse the URL
  const url = new URL(processedUrl);
  if (!url.hostname.includes("fonts.bunny.net")) {
    throw new Error("Invalid Bunny Fonts URL");
  }

  // Get the family parameter
  const familyParam = url.searchParams.get("family");
  if (!familyParam) {
    throw new Error("No family parameter found in Bunny Fonts URL");  
  }

  // Split multiple font families and process each one
  const fontEntries = familyParam.split("|").map((familyStr): [string, any] => {
    // Format: "font-name:weight1,weight1i,weight2,weight3i,weight4,weight4i"
    const [familyName, weightsStr = ""] = familyStr.split(":");
    if (!familyName) {
      throw new Error(`Invalid font family format: ${ familyStr }`);
    }

    // Track weights and their styles
    const weightStyles = new Map<number, Set<"normal" | "italic">>();

    // Parse weights and their styles
    if (weightsStr) {
      weightsStr.split(",").forEach(weightStr => {
        const isItalic = weightStr.endsWith("i");
        const weightValue = parseInt(isItalic ? weightStr.slice(0, -1) : weightStr, 10);
        
        if (!isNaN(weightValue)) {
          if (!weightStyles.has(weightValue)) {
            weightStyles.set(weightValue, new Set());
          }
          weightStyles.get(weightValue)?.add(isItalic ? "italic" : "normal");
        }
      });
    }

    // Convert to arrays
    const weights = Array.from(weightStyles.keys()).sort((a, b) => a - b);
    const hasItalic = Array.from(weightStyles.values()).some(styles => styles.has("italic"));
    const styles: Array<"normal" | "italic"> = hasItalic ? ["normal", "italic"] : ["normal"];

    const fontId = familyName;  // Keep the original ID as is (e.g., "advent-pro")
    const familyDisplayName = familyName
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return [
      fontId,
      {
        id: fontId,
        name: familyDisplayName,
        ...(labels?.[fontId] && { label: labels[fontId] }),
        source: {
          type: "custom",
          provider: "bunny"
        },
        spec: {
          family: familyDisplayName,
          fallbacks: fallbacks?.[fontId] || [DEFAULT_FALLBACK],
          weights: {
            type: "static",
            values: weights.length ? weights : [400],
          },
          styles
        },
      },
    ] as [string, FontDefinition];
  });

  // Convert to FontCollection format
  const result: FontCollection = Object.fromEntries(fontEntries);
  
  // Apply ordering if specified
  if (order && order.length > 0) {
    const orderedResult: FontCollection = {};
    order.forEach(fontId => {
      if (result[fontId]) {
        orderedResult[fontId] = result[fontId];
      }
    });
    
    // Add any remaining fonts that weren't in the order array
    Object.entries(result).forEach(([fontId, definition]) => {
      if (!orderedResult[fontId]) {
        orderedResult[fontId] = definition;
      }
    });
    
    return orderedResult;
  }
  
  return result;
};