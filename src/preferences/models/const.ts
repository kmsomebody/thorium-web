"use client";

import fontStacks from "@readium/css/css/vars/fontStacks.json";

import {
  ThLineHeightOptions,
  ThSettingsRangePlaceholder,
  ThSettingsRangeVariant,
  ThSpacingPresetKeys,
  ThSpacingSettingsKeys,
  ThTextSettingsKeys
} from "./enums";
import { ThActionsTokens, ThSettingsRangePref, FontCollection } from "../preferences";
import { createDefinitionFromStaticFonts, createDefinitionsFromGoogleFonts } from "../helpers";
import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";

export const defaultActionKeysObject: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null
};

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

export const readiumCSSFontCollection: FontCollection = {
  oldStyle: {
    id: "oldStyle",
    name: "Old Style",
    label: "reader.preferences.fontFamily.oldStyle.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__oldStyleTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  modern: {
    id: "modern",
    name: "Modern",
    label: "reader.preferences.fontFamily.modern.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__modernTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  sans: {
    id: "sans",
    name: "Sans",
    label: "reader.preferences.fontFamily.sans",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__sansTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  humanist: {
    id: "humanist",
    name: "Humanist",
    label: "reader.preferences.fontFamily.humanist.descriptive",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__humanistTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  },
  monospace: {
    id: "monospace",
    name: "Monospace",
    label: "reader.preferences.fontFamily.monospace",
    source: { type: "system" },
    spec: {
      family: fontStacks.RS__monospaceTf,
      weights: { type: "static", values: [400, 700] },
      fallbacks: []
    }
  }
};

export const defaultFontCollection: FontCollection = {
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900",
    options: {
      order: ["literata", "atkinson-hyperlegible-next"],
      fallbacks: {
        "literata": ["serif"],
        "atkinson-hyperlegible-next": ["sans-serif"]
      }
    }
  }),
  luciole: createDefinitionFromStaticFonts({
    id: "luciole",
    name: "Luciole",
    files: [
      { path: "/fonts/Luciole/Luciole-Regular.woff2", weight: 400, style: "normal" },
      { path: "/fonts/Luciole/Luciole-Italic.woff2", weight: 400, style: "italic" },
      { path: "/fonts/Luciole/Luciole-Bold.woff2", weight: 700, style: "normal" },
      { path: "/fonts/Luciole/Luciole-BoldItalic.woff2", weight: 700, style: "italic" }
    ]
  }),
  ...readiumCSSFontCollection,
  iAWriterDuo: createDefinitionFromStaticFonts({
    id: "iAWriterDuo",
    name: "iA Writer Duo",
    label: "iA Writer Duospace",
    fallbacks: ["monospace"],
    files: [
      { path: "/fonts/iAWriterDuo/iAWriterDuoS-Regular.woff2", weight: 400, style: "normal" },
      { path: "/fonts/iAWriterDuo/iAWriterDuoS-Bold.woff2", weight: 700, style: "normal" },
      { path: "/fonts/iAWriterDuo/iAWriterDuoS-Italic.woff2", weight: 400, style: "italic" },
      { path: "/fonts/iAWriterDuo/iAWriterDuoS-BoldItalic.woff2", weight: 700, style: "italic" }
    ]
  }),
  openDyslexic: createDefinitionFromStaticFonts({
    id: "openDyslexic",
    name: "Open Dyslexic",
    files: [
      { path: "/fonts/OpenDyslexic/OpenDyslexic-Regular.otf", weight: 400, style: "normal" },
      { path: "/fonts/OpenDyslexic/OpenDyslexic-Italic.otf", weight: 400, style: "italic" },
      { path: "/fonts/OpenDyslexic/OpenDyslexic-Bold.otf", weight: 700, style: "normal" },
      { path: "/fonts/OpenDyslexic/OpenDyslexic-BoldItalic.otf", weight: 700, style: "italic" }
    ]
  }),
  accessibleDfA: createDefinitionFromStaticFonts({
    id: "accessibleDfA",
    name: "Accessible DfA",
    files: [
      { path: "/fonts/AccessibleDfA/AccessibleDfA-Regular.woff2", weight: 400, style: "normal" },
      { path: "/fonts/AccessibleDfA/AccessibleDfA-Italic.woff2", weight: 400, style: "italic" },
      { path: "/fonts/AccessibleDfA/AccessibleDfA-Bold.woff2", weight: 700, style: "normal" }
    ]
  })
};

export const tamilCollection = {
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@100..800&family=Catamaran:wght@100..900&family=Hind+Madurai:wght@400;700&family=Mukta+Malar:wght@400;700&family=Noto+Sans+Tamil:wght@100..900&family=Noto+Serif+Tamil:ital,wght@0,100..900;1,100..900",
    options: {
      order: ["noto-sans-tamil", "noto-serif-tamil", "anek-tamil", "catamaran", "hind-madurai", "mukta-malar"],
      labels: {
        "noto-sans-tamil": "Noto Sans",
        "noto-serif-tamil": "Noto Serif",
        "anek-tamil": "அனேக் தமிழ்",
        "catamaran": "கட்டுமரன்",
        "mukta-malar": "முக்த மலர்"
      },
      fallbacks: {
        "noto-serif-tamil": ["serif"]
      }
    }
  })
}

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