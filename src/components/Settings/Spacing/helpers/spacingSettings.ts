import { ThSpacingSettingsKeys } from "@/preferences/models";

/**
 * Check if spacing settings are available for customization
 * Returns true if subPanel contains at least one spacing setting (excluding spacingPresets and publisherStyles)
 */
export const hasCustomizableSpacingSettings = (subPanelKeys: ThSpacingSettingsKeys[]): boolean => {
  const spacingSettingsKeys = [
    ThSpacingSettingsKeys.letterSpacing,
    ThSpacingSettingsKeys.lineHeight,
    ThSpacingSettingsKeys.paragraphIndent,
    ThSpacingSettingsKeys.paragraphSpacing,
    ThSpacingSettingsKeys.wordSpacing
  ];

  return spacingSettingsKeys.some(key => subPanelKeys.includes(key));
};
