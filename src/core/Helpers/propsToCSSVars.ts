"use client";

interface PropsToCSSVarsOptions {
  prefix?: string;
  exclude?: string[];
}

/** 
 * Converts Object properties to CSS custom properties, recursively.
 * @param props - The object containing CSS property values
 * @param options - Configuration options
 * @param options.prefix - Optional prefix for CSS variable names (applies to all levels)
 * @param options.exclude - Array of property names to exclude
 */
export const propsToCSSVars = (props: { [x: string]: any; }, { prefix, exclude = [] }: PropsToCSSVarsOptions = {}) => {
  return Object.entries(props)
          .reduce((acc: { [key: string]: any }, [key, value]) => {
            if (exclude.includes(key)) {
              return acc;
            }
            const cssVar = prefix ? `--${prefix}-${key}` : `--${key}`;
            if (typeof value === "object" && value !== null) {
              // Keep the same prefix for nested objects
              Object.assign(acc, propsToCSSVars(value, { prefix: prefix ? `${prefix}-${key}` : key }));
            } else if (value != null) {
              const cssValue = typeof value === "number" ? `${value}px` : value;
              acc[cssVar] = cssValue;
            } 
            return acc;
          }, {});
}