import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { ThemeTokens } from "../hooks/useTheming";

export interface buildThemeProps<T extends string> {
  theme?: string;
  themeKeys: { [key in T]?: ThemeTokens },
  systemThemes?: {
    light: T,
    dark: T
  },
  colorScheme?: ThColorScheme;
}

export const buildThemeObject = <T extends string>({
  theme,
  themeKeys,
  systemThemes,
  colorScheme
}: buildThemeProps<T>) => {
  if (!theme) {
    return {};
  }

  if (theme === "auto" && colorScheme && systemThemes) {
    theme = colorScheme === ThColorScheme.dark ? systemThemes.dark : systemThemes.light;
  }

  let themeProps = {};

  const themeToken = themeKeys[theme as T];
  if (themeToken) {
    themeProps = {
      backgroundColor: themeToken.background,
      textColor: themeToken.text,
      linkColor: themeToken.link,
      selectionBackgroundColor: themeToken.select,
      selectionTextColor: themeToken.onSelect,
      visitedColor: themeToken.visited
    };
  } else {
    // Fallback if theme doesn't exist
    console.warn(`Theme key "${String(theme)}" not found in themeKeys.`);
    themeProps = {
      backgroundColor: null,
      textColor: null,
      linkColor: null,
      selectionBackgroundColor: null,
      selectionTextColor: null,
      visitedColor: null
    };
  }

  return themeProps;
};