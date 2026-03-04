export type ThBackLinkContent = 
  | { 
      type: "img";
      src: string;
      alt?: string;
    }
  | {
      type: "svg";
      content: string; // Raw SVG string
    };

export interface ThBackLinkPref {
  href: string;
  variant?: ThBackLinkVariant;
  visibility?: "always" | "partially";
  content?: ThBackLinkContent;
}

export interface ThFormatPrefValue<T extends string | Array<string>> {
  variants: T;
  displayInImmersive?: boolean;
  displayInFullscreen?: boolean;
}

export interface ThFormatPref<T extends string | Array<string>> {
  default: ThFormatPrefValue<T>;
  breakpoints?: { 
    [key in ThBreakpoints]?: ThFormatPrefValue<T>;
  };
}

export interface ThPaginatedAffordancePrefValue {
  variant: ThArrowVariant;
  discard?: Array<"navigation" | "immersive" | "fullscreen"> | "none";
  hint?: Array<"immersiveChange" | "fullscreenChange" | "layoutChange"> | "none";
}

export interface ThPaginatedAffordancePref {
  default: Required<ThPaginatedAffordancePrefValue>;
  breakpoints?: {
    [key in ThBreakpoints]?: ThPaginatedAffordancePrefValue;
  };
}

export enum ThArrowVariant {
  none = "none",
  stacked = "stacked",
  layered = "layered"
}

export enum ThBreakpoints {
  compact = "compact",
  medium = "medium",
  expanded = "expanded",
  large = "large",
  xLarge = "xLarge"
}

export enum ThBackLinkVariant {
  arrow = "arrow",
  home = "home",
  library = "library",
  custom = "custom"
}

export enum ThDocumentTitleFormat {
  title = "title",
  chapter = "chapter",
  titleAndChapter = "titleAndChapter",
  none = "none"
}

export enum ThLayoutDirection {
  rtl = "rtl",
  ltr = "ltr"
}

export enum ThLayoutUI {
  stacked = "stacked-ui",
  layered = "layered-ui"
}

export enum ThProgressionFormat {
  positionsPercentOfTotal = "positionsPercentOfTotal",  // x-y of z (%)
  positionsOfTotal = "positionsOfTotal",                // x-y of z
  positions = "positions",                              // x-y
  overallProgression = "overallProgression",            // x%
  positionsLeft = "positionsLeft",                      // x left in chapter
  readingOrderIndex = "readingOrderIndex",              // x of y
  resourceProgression = "resourceProgression",          // x%
  progressionOfResource = "progressionOfResource",      // x% of y
  none = "none"                                         // nothing displayed
}

export enum ThRunningHeadFormat {
  title = "title",
  chapter = "chapter",
  // titleAndChapter = "titleAndChapter",
  none = "none"
}