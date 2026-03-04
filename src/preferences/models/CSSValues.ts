// Length units
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units

export type CSSValueUnitless = `${ number }`;

export type CSSValueWithUnit<Unit extends string> = `${ number }${ Unit }`;

export type CSSAbsoluteLength = CSSValueWithUnit<"cm" | "in" | "mm" | "pc" | "pt" | "px" | "Q">;

export type CSSAngle = CSSValueWithUnit<"deg" | "grad" | "rad" | "turn">;

export type CSSDefaultViewport = CSSValueWithUnit<"vb" | "vh" | "vi" | "vmax" | "vmin" | "vw">;

export type CSSDynamicViewport = CSSValueWithUnit<"dvb" |"dvh" | "dvi" | "dvmax" | "dvmin" | "dvw">;

export type CSSFrequency = CSSValueWithUnit<"Hz" | "kHz">;

export type CSSFontRelativeLength = CSSValueWithUnit<"cap" | "ch" | "em" | "ex" | "ic" | "lh">;

export type CSSLargeViewport = CSSValueWithUnit<"lvb" |"lvh" | "lvi" | "lvmax" | "lvmin" | "lvw">;

export type CSSPhysicalLength = CSSValueWithUnit<"cm" | "in" | "mm" | "pc" | "pt" | "Q">;

export type CSSRelativeLength = CSSFontRelativeLength | CSSValueWithUnit<"%"> | CSSRootFontRelativeLength;

export type CSSResolution = CSSValueWithUnit<"dpcm" | "dpi" | "dppx" | "x">;

export type CSSRootFontRelativeLength = CSSValueWithUnit<"rcap" | "rch" | "rem" | "rex" | "ric" | "rlh">;

export type CSSSmallViewport = CSSValueWithUnit<"svb" |"svh" | "svi" | "svmax" | "svmin" | "svw">;

export type CSSTime = CSSValueWithUnit<"ms" | "s">;

export type CSSViewport = CSSDefaultViewport | CSSDynamicViewport | CSSLargeViewport | CSSSmallViewport;

// Color
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors
// Possible Improvement: validation

export type CSSColor = 
  string // keywords
  | `#${string}` // hexadecimal
  | `rgb(${string})` // RGB
  | `rgba(${string})` // RGBA
  | `hsl(${string})` // HSL
  | `hsla(${string})` // HSLA
  | `hwb(${string})` // HWB
  | `lab(${string})` // LAB
  | `lch(${string})` // LCH
  | `oklab(${string})` // OKLAB
  | `oklch(${string})` // OKLCH
  | `color(${string})` // color()
  | `color-mix(${string})` // color-mix()
  | `light-dark(${string})` // light-dark()
  ;