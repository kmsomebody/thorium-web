import { FontDefinition } from "../models";
import { FontResource } from "./fonts";

/**
   * Determines the font format from a file path
   */
  const getFontFormat = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "woff": return "woff";
      case "woff2": return "woff2";
      case "ttf": return "truetype";
      case "otf": return "opentype";
      case "eot": return "embedded-opentype";
      case "svg": return "svg";
      default: return "woff2"; // default to woff2 if unknown
    }
  };

/**
   * Creates local font resources for injection
   */
  export const createLocalFontResources = (font: FontDefinition): FontResource | null => {
    if (font.source.type !== "custom" || font.source.provider !== "local") {
      return null;
    }

    const { family, weights, display, widths } = font.spec;
    const fontFiles = font.source.files || [];
    
    // Generate CSS for each font file
    const cssContent = fontFiles.map(fontFile => {
      const format = getFontFormat(fontFile.path);
      const fontUrl = new URL(fontFile.path, window.location.origin).toString();

      // Check if this is a variable font
      const isVariable = font.source.type === "custom" && 
                         font.source.provider === "local" && 
                         "variant" in font.source && 
                         font.source.variant === "variable";
      
      const rules = [
        `@font-face {`,
        `  font-family: "${ family }";`,
        `  src: url("${ fontUrl }") format("${ format }");`
      ];

      // Handle font weight
      if (isVariable && weights.type === "variable") {
        rules.push(`  font-weight: ${ weights.min } ${ weights.max };`);
      } else if ("weight" in fontFile) {
        rules.push(`  font-weight: ${ fontFile.weight };`);
      }

      // Handle font style
      if ("style" in fontFile) {
        rules.push(`  font-style: ${ fontFile.style };`);
      }

      // Handle font width for variable fonts
      if (isVariable && widths) {
        rules.push(`  font-stretch: ${ widths.min }% ${ widths.max }%;`);
      }
      
      if (display) {
        rules.push(`  font-display: ${ display };`);
      } else {
        rules.push(`  font-display: block;`);
      }
      
      return rules.join("\n") + "\n}";
    }).filter(Boolean).join("\n\n");
    
    const blob = new Blob([cssContent], { type: "text/css" });
    
    // Return the font face as a stylesheet resource
    return {
      as: "link",
      rel: "stylesheet",
      blob: blob
    };
  };
