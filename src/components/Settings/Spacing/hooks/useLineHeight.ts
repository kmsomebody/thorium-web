import { useMemo } from "react";
import { ThLineHeightOptions, ThSettingsKeys } from "@/preferences/models";
import { usePreferences } from "@/preferences/hooks/usePreferences";

/**
 * Hook that returns a mapping of line height options to their actual numeric values
 * This eliminates code duplication across spacing components
 */
export const useLineHeight = () => {
  const { preferences } = usePreferences();

  return useMemo(() => ({
    [ThLineHeightOptions.publisher]: null,
    [ThLineHeightOptions.small]: preferences.settings.keys[ThSettingsKeys.lineHeight].keys[ThLineHeightOptions.small],
    [ThLineHeightOptions.medium]: preferences.settings.keys[ThSettingsKeys.lineHeight].keys[ThLineHeightOptions.medium],
    [ThLineHeightOptions.large]: preferences.settings.keys[ThSettingsKeys.lineHeight].keys[ThLineHeightOptions.large],
  }), [preferences.settings.keys]);
};
