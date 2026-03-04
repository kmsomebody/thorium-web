import { ThSheetHeaderVariant } from "./actions";
import { I18nValue } from "./i18n";

export interface ThSettingsGroupPref<T> {
  main: T[];
  subPanel: T[] | null;
  header?: ThSheetHeaderVariant;
}

export interface ThSettingsRangePref {
  variant?: ThSettingsRangeVariant;
  placeholder?: I18nValue<ThSettingsRangePlaceholder>;
  range?: [number, number];
  step?: number;
}

export interface ThSettingsRadioPref<T extends string> {
  allowUnset?: boolean;
  keys: {
    [key in T]: number;
  };
}

export enum ThSettingsKeys {
  columns = "columns",
  fontFamily = "fontFamily",
  fontWeight = "fontWeight",
  hyphens = "hyphens",
  layout = "layout",
  letterSpacing = "letterSpacing",
  lineHeight = "lineHeight",
  paragraphIndent = "paragraphIndent",
  paragraphSpacing = "paragraphSpacing",
  publisherStyles = "publisherStyles",
  spacingGroup = "spacingGroup",
  spacingPresets = "spacingPresets",
  textAlign = "textAlign",
  textGroup = "textGroup",
  textNormalize = "textNormalize",
  theme = "theme",
  wordSpacing = "wordSpacing",
  zoom = "zoom"
}

export enum ThTextSettingsKeys {
  fontFamily = "fontFamily",
  fontWeight = "fontWeight",
  hyphens = "hyphens",
  textAlign = "textAlign",
  textNormalize = "textNormalize"
}

export enum ThSpacingSettingsKeys {
  letterSpacing = "letterSpacing",
  lineHeight = "lineHeight",
  paragraphIndent = "paragraphIndent",
  paragraphSpacing = "paragraphSpacing",
  publisherStyles = "publisherStyles",
  spacingPresets = "spacingPresets",
  wordSpacing = "wordSpacing"
}

export enum ThSettingsContainerKeys {
  initial = "initial",
  text = "text",
  spacing = "spacing"
}

export enum ThSettingsRangeVariant {
  slider = "slider",
  incrementedSlider = "incrementedSlider",
  numberField = "numberField"
}

export enum ThSettingsRangePlaceholder {
  range = "range",
  none = "none"
}

export enum ThSpacingPresetKeys {
  publisher = "publisher",
  tight = "tight",
  balanced = "balanced",
  loose = "loose",
  accessible = "accessible",
  custom = "custom"
}

export enum ThLayoutOptions { 
  scroll = "scroll_option",
  paginated = "page_option"
}

export enum ThTextAlignOptions {
  publisher = "publisher",
  start = "start",
  justify = "justify"
}

export enum ThLineHeightOptions {
  publisher = "publisher",
  small = "small",
  medium = "medium",
  large = "large"
}

export const defaultTextSettingsMain = [ThTextSettingsKeys.fontFamily];

export const defaultTextSettingsSubpanel = [
  ThTextSettingsKeys.fontFamily,
  ThTextSettingsKeys.textAlign,
  ThTextSettingsKeys.hyphens,
  ThTextSettingsKeys.fontWeight,
  ThTextSettingsKeys.textNormalize
]

export const defaultSpacingSettingsMain = [
  ThSpacingSettingsKeys.spacingPresets
];

export const defaultSpacingSettingsSubpanel = [
  ThSpacingSettingsKeys.spacingPresets,
  ThSpacingSettingsKeys.lineHeight,
  ThSpacingSettingsKeys.paragraphSpacing,
  ThSpacingSettingsKeys.paragraphIndent,
  ThSpacingSettingsKeys.wordSpacing,
  ThSpacingSettingsKeys.letterSpacing
];

export const defaultSpacingPresetsOrder = [
  ThSpacingPresetKeys.publisher,
  ThSpacingPresetKeys.accessible,
  ThSpacingPresetKeys.custom,
  ThSpacingPresetKeys.tight,
  ThSpacingPresetKeys.balanced,
  ThSpacingPresetKeys.loose
]

export const defaultParagraphSpacing: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 3],
  step: 0.25
}

export const defaultParagraphIndent: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 2],
  step: 0.25
}

export const defaultWordSpacing: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 1],
  step: 0.1
}

export const defaultLetterSpacing: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 0.5],
  step: 0.05
}

export const defaultLineHeights = {
  [ThLineHeightOptions.small]: 1.3,
  [ThLineHeightOptions.medium]: 1.5,
  [ThLineHeightOptions.large]: 1.75
}

export const defaultZoom: Required<ThSettingsRangePref> = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0.7, 4],
  step: 0.05
}

export const defaultSpacingPresets = {
  [ThSpacingPresetKeys.tight]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.small,
    [ThSpacingSettingsKeys.paragraphSpacing]: 0,
    [ThSpacingSettingsKeys.paragraphIndent]: 1
  },
  [ThSpacingPresetKeys.balanced]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.medium,
    [ThSpacingSettingsKeys.paragraphSpacing]: 0.75,
    [ThSpacingSettingsKeys.paragraphIndent]: 0
  },
  [ThSpacingPresetKeys.loose]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.large,
    [ThSpacingSettingsKeys.paragraphSpacing]: 1.75,
    [ThSpacingSettingsKeys.paragraphIndent]: 0
  },
  [ThSpacingPresetKeys.accessible]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.large,
    [ThSpacingSettingsKeys.paragraphSpacing]: 2.5,
    [ThSpacingSettingsKeys.paragraphIndent]: 0,
    [ThSpacingSettingsKeys.letterSpacing]: 0.1,
    [ThSpacingSettingsKeys.wordSpacing]: 0.3
  }
}