import { getColorSync } from 'colorthief';

/**
 * Extracts the dominant color from an HTML image element using Color Thief
 * @param img - The HTML image element to analyze
 * @returns Promise that resolves to hex color string (e.g. "#ff0000")
 */
export const getDominantColor = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!img.complete || img.naturalWidth === 0) {
      reject(new Error("Image not loaded"));
      return;
    }

    try {
      const color = getColorSync(img);
      if (color) {
        const hex = color.hex();
        if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
          reject(new Error(`Invalid color extracted: ${hex}`));
        } else {
          resolve(hex);
        }
      } else {
        reject(new Error("No color extracted"));
      }
    } catch (error: any) {
      reject(new Error(`Color extraction failed: ${ error.message }`));
    }
  });
};
