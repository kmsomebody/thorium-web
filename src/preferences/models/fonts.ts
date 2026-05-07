import fontStacks from "@readium/css/css/vars/fontStacks.json";

import { createDefinitionFromStaticFonts, createDefinitionsFromGoogleFonts } from "../helpers";
import { I18nValue } from "./i18n";

export interface SystemFontSource {
  type: "system";
}

export interface BunnyFontSource {
  type: "custom";
  provider: "bunny";
}

export interface GoogleFontSource {
  type: "custom";
  provider: "google";
}

export interface LocalStaticFontFile {
  path: string;
  weight: number;
  style: "normal" | "italic";
}

export interface LocalVariableFontFile {
  path: string;
  style?: "normal" | "italic";
}

export interface LocalStaticFontSource {
  type: "custom";
  provider: "local";
  variant: "static";
  files: LocalStaticFontFile[];
}

export interface LocalVariableFontSource {
  type: "custom";
  provider: "local";
  variant: "variable";
  files: LocalVariableFontFile[];
}

export type LocalFontSource = LocalStaticFontSource | LocalVariableFontSource;

export type FontSource = SystemFontSource | BunnyFontSource | GoogleFontSource | LocalFontSource;

export type VariableFontRangeConfig = {
  min: number;
  max: number;
  step?: number;
};

export type WeightConfig =
  | {
      type: "static";
      values: number[];
    }
  | {
      type: "variable";
    } & VariableFontRangeConfig;

export interface FontSpec {
  family: string;
  fallbacks: string[];
  weights: WeightConfig;
  styles?: ("normal" | "italic")[];
  widths?: VariableFontRangeConfig;
  display?: "swap" | "block" | "fallback" | "optional";
}

export interface FontDefinition {
  id: string;
  name: string;
  label?: I18nValue<string>;
  source: FontSource;
  spec: FontSpec;
}

export type FontCollection = Record<string, FontDefinition>;

export type ValidatedLanguageCollection = {
  fonts: FontCollection; 
  supportedLanguages: string[] 
};

export type ThFontFamilyPref = {
  default: FontCollection;
} | {
  [K in Exclude<string, "default">]: ValidatedLanguageCollection;
};

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

const sysFontDef = (id: string, name: string, family: string): FontDefinition => ({
  id,
  name,
  source: { type: "system" },
  spec: { family, fallbacks: [], weights: { type: "static", values: [400, 700] } }
});

export const arabicFarsiCollection: FontCollection = {
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Noto+Naskh+Arabic:wght@400..700&family=Scheherazade+New:wght@400..700",
    options: {
      order: ["noto-sans-arabic", "noto-naskh-arabic", "scheherazade-new"],
      labels: {
        "noto-sans-arabic": "Noto Sans",
        "noto-naskh-arabic": "Noto Naskh"
      },
      fallbacks: {
        "noto-naskh-arabic": ["serif"],
        "scheherazade-new": ["serif"]
      }
    }
  })
};

export const hebrewCollection: FontCollection = {
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&family=Frank+Ruhl+Libre:wght@300..900&family=Heebo:wght@100..800",
    options: {
      order: ["noto-sans-hebrew", "frank-ruhl-libre", "heebo"],
      labels: {
        "frank-ruhl-libre": "Frank Rühl Libre"
      },
      fallbacks: {
        "frank-ruhl-libre": ["serif"]
      }
    }
  })
};

export const chineseSimplifiedCollection: FontCollection = {
  "chinese-hans-sans": sysFontDef("chinese-hans-sans", "Sans-Serif", '"PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif'),
  "chinese-hans-serif": sysFontDef("chinese-hans-serif", "Serif", '"STSong", "SimSun", "AR PL UMing CN", serif'),
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&family=Noto+Serif+SC:wght@200..900",
    options: {
      labels: {
        "noto-sans-sc": "Noto Sans SC",
        "noto-serif-sc": "Noto Serif SC"
      },
      fallbacks: {
        "noto-serif-sc": ["serif"]
      }
    }
  })
};

export const chineseTraditionalCollection: FontCollection = {
  "chinese-hant-sans": sysFontDef("chinese-hant-sans", "Sans-Serif", '"PingFang TC", "Microsoft JhengHei", "WenQuanYi Micro Hei", sans-serif'),
  "chinese-hant-serif": sysFontDef("chinese-hant-serif", "Serif", '"MingLiU", "AR PL UMing TW", serif'),
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Noto+Serif+TC:wght@200..900",
    options: {
      labels: {
        "noto-sans-tc": "Noto Sans TC",
        "noto-serif-tc": "Noto Serif TC"
      },
      fallbacks: {
        "noto-serif-tc": ["serif"]
      }
    }
  })
};

export const japaneseCollection: FontCollection = {
  "japanese-sans": sysFontDef("japanese-sans", "Sans-Serif", '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif'),
  "japanese-serif": sysFontDef("japanese-serif", "Serif", '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif'),
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@200..900",
    options: {
      labels: {
        "noto-sans-jp": "Noto Sans JP",
        "noto-serif-jp": "Noto Serif JP"
      },
      fallbacks: {
        "noto-serif-jp": ["serif"]
      }
    }
  })
};

export const japaneseVerticalCollection: FontCollection = {
  "japanese-v-serif": sysFontDef("japanese-v-serif", "Serif", '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif'),
  "japanese-v-sans": sysFontDef("japanese-v-sans", "Sans-Serif", '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif'),
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200..900&family=Shippori+Mincho:wght@400..800&family=Noto+Sans+JP:wght@100..900",
    options: {
      order: ["noto-serif-jp", "shippori-mincho", "noto-sans-jp"],
      labels: {
        "noto-serif-jp": "Noto Serif JP",
        "noto-sans-jp": "Noto Sans JP"
      },
      fallbacks: {
        "noto-serif-jp": ["serif"],
        "shippori-mincho": ["serif"]
      }
    }
  })
};

export const koreanCollection: FontCollection = {
  "korean-sans": sysFontDef("korean-sans", "Sans-Serif", '"Apple SD Gothic Neo", "Malgun Gothic", "Dotum", sans-serif'),
  "korean-serif": sysFontDef("korean-serif", "Serif", '"Batang", "Gungsuh", "Apple Myungjo", serif'),
  ...createDefinitionsFromGoogleFonts({
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&family=Noto+Serif+KR:wght@200..900&family=Nanum+Myeongjo:wght@400;700;800",
    options: {
      order: ["noto-sans-kr", "noto-serif-kr", "nanum-myeongjo"],
      labels: {
        "noto-sans-kr": "Noto Sans KR",
        "noto-serif-kr": "Noto Serif KR"
      },
      fallbacks: {
        "noto-serif-kr": ["serif"],
        "nanum-myeongjo": ["serif"]
      }
    }
  })
};