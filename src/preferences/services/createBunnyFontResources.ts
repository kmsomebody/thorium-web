import { FontDefinition, FontSpec, WeightConfig } from "../models";
import { FontResource } from "./fonts";

/**
 * Builds a Bunny Fonts API URL
 * @see https://fonts.bunny.net
 */
const buildBunnyFontsUrl = ({
  family,
  weights,
  styles = ["normal"]
}: {
  family: string;
  weights: WeightConfig;
  styles?: FontSpec["styles"];
}): string => {
  if (weights.type !== "static") {
    throw new Error("Bunny Fonts only supports static fonts");
  }
  const weightValues = weights.values;
  
  // For Bunny Fonts, we need to handle italic variants by appending "i" to the weight
  const variants = new Set<string>();
  
  for (const weight of weightValues) {
    // Always add the base weight
    variants.add(weight.toString());
    
    // Add italic variant if needed
    if (styles.includes("italic")) {
      variants.add(`${ weight }i`);
    }
  }

  // Convert set to array and sort for consistent URLs
  const variantList = Array.from(variants).sort();
  
  const familyParam = family.replace(/ /g, "-").toLowerCase();
  const variantParam = variantList.join(",");

  return `https://fonts.bunny.net/css?family=${ familyParam }:${ variantParam }`;
};

/**
 * Creates Bunny Fonts resources for injection
 */
export const createBunnyFontResources = (font: FontDefinition): FontResource | null => {
  if (font.source.type !== "custom" || font.source.provider !== "bunny" || font.spec.weights.type !== "static") {
    return null;
  }

  const { family, weights, styles } = font.spec;

  const url = buildBunnyFontsUrl({
    family,
    weights,
    styles
  });

  return {
    as: "link",
    rel: "stylesheet",
    url
  };
};