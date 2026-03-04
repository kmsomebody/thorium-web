import { FontDefinition, WeightConfig, VariableFontRangeConfig, FontSpec } from "../models";
import { FontResource } from "./fonts";

/**
   * Builds a Google Fonts API v2 URL according to the specification.
   * @see https://developers.google.com/fonts/docs/css2
   */
const buildGoogleFontsV2Url = ({
  family,
  weights,
  styles = ["normal"],
  widths,
  display = "block",
  text
}: {
  family: string;
  weights: WeightConfig;
  styles?: FontSpec["styles"];
  widths?: VariableFontRangeConfig;
  display?: FontSpec["display"];
  text?: string;
}): string => {
  // If optimizing with text, just load the font family with the text parameter
  if (text) {
    return `https://fonts.googleapis.com/css2?family=${ family.replace(/ /g, "+") }&text=${ encodeURIComponent(text) }`;
  }

  const hasItalic = styles.includes("italic");
  const hasWidth = !!widths;
  const weightValues = weights.type === "static"
    ? weights.values.join(",")
    : `${ weights.min }..${ weights.max }`;
  const widthValues = hasWidth && widths ? `${ widths.min }..${ widths.max }` : undefined;

  const familyParam = family.replace(/ /g, "+");
  let axesParam: string;

  if (hasItalic && hasWidth) {
    // With italic and width: ital,wdth,wght@0,widthValues,weightValues;1,widthValues,weightValues
    const variants = [
      `0,${ widthValues },${ weightValues }`,  // normal
      `1,${ widthValues },${ weightValues }`   // italic
    ];
    axesParam = `:ital,wdth,wght@${ variants.join(";") }`;
  } else if (hasItalic) {
    // With italic only: ital,wght@0,weightValues;1,weightValues
    const variants = [
      `0,${ weightValues }`,  // normal
      `1,${ weightValues }`   // italic
    ];
    axesParam = `:ital,wght@${ variants.join(";") }`;
  } else if (hasWidth) {
    // With width only: wdth,wght@widthValues,weightValues
    axesParam = `:wdth,wght@${ widthValues },${ weightValues }`;
  } else {
    // Without italic or width: wght@weightValues
    axesParam = `:wght@${ weightValues }`;
  }
  const displayParam = display ? `&display=${ display }` : "";

  return `https://fonts.googleapis.com/css2?family=${ familyParam }${ axesParam }${ displayParam }`;
};

/**
 * Creates Google Font resources for injection
 */
export const createGoogleFontResources = (font: FontDefinition, text?: string): FontResource | null => {
  if (font.source.type !== "custom" || font.source.provider !== "google") {
    return null;
  }

  const { family, weights, display, styles, widths } = font.spec;

  const url = buildGoogleFontsV2Url({
    family,
    weights,
    display,
    styles,
    widths,
    text
  });

  return {
    as: "link",
    rel: "stylesheet",
    url
  };
};
