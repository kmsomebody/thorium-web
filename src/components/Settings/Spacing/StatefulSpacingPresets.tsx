import { useCallback, useMemo } from "react";

import { 
  ThSpacingPresetKeys,
  ThLineHeightOptions,
  ThSpacingSettingsKeys,
} from "@/preferences/models";

import BookIcon from "../assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";
import AccessibleIcon from "./assets/icons/accessibility.svg";
import TuneIcon from "./assets/icons/tune.svg";

import { StatefulSettingsItemProps } from "@/components/Settings";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useSpacingPresets } from "./hooks/useSpacingPresets";

import { useI18n } from "@/i18n/useI18n";
import { usePreferenceKeys } from "@/preferences/hooks/usePreferenceKeys";
import { useNavigator } from "@/core/Navigator";
import { useLineHeight } from "./hooks/useLineHeight";

import { useAppSelector, useAppDispatch } from "@/lib";
import { setSpacingPreset } from "@/lib/settingsReducer";
import { setWebPubSpacingPreset } from "@/lib/webPubSettingsReducer";

import { hasCustomizableSpacingSettings } from "./helpers/spacingSettings";

const iconMap = {
  [ThSpacingPresetKeys.publisher]: BookIcon,
  [ThSpacingPresetKeys.accessible]: AccessibleIcon,
  [ThSpacingPresetKeys.custom]: TuneIcon,
  [ThSpacingPresetKeys.tight]: SmallIcon,
  [ThSpacingPresetKeys.balanced]: MediumIcon,
  [ThSpacingPresetKeys.loose]: LargeIcon,
};

export const StatefulSpacingPresets = ({ standalone }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const { reflowSpacingPresetKeys, fxlSpacingPresetKeys, webPubSpacingPresetKeys, subPanelSpacingSettingsKeys } = usePreferenceKeys();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  const spacing = useAppSelector(state => isWebPub ? state.webPubSettings.spacing : state.settings.spacing);
  const isFXL = useAppSelector(state => state.publication.isFXL);

  const dispatch = useAppDispatch();

  const { submitPreferences } = useNavigator();

  const lineHeightOptions = useLineHeight();

  const { getPresetValues } = useSpacingPresets();

  const updatePreference = useCallback(async (value: string) => {
    const spacingKey = value as ThSpacingPresetKeys;
    
    // Get preset values directly from preferences config
    const presetValues = getPresetValues(spacingKey);
    
    // Raw values for Redux state (lineHeight stays as enum)
    const reduxValues = {
      [ThSpacingSettingsKeys.letterSpacing]: presetValues?.[ThSpacingSettingsKeys.letterSpacing] ?? null,
      [ThSpacingSettingsKeys.lineHeight]: presetValues?.[ThSpacingSettingsKeys.lineHeight] ?? null,
      [ThSpacingSettingsKeys.paragraphIndent]: presetValues?.[ThSpacingSettingsKeys.paragraphIndent] ?? null,
      [ThSpacingSettingsKeys.paragraphSpacing]: presetValues?.[ThSpacingSettingsKeys.paragraphSpacing] ?? null,
      [ThSpacingSettingsKeys.wordSpacing]: presetValues?.[ThSpacingSettingsKeys.wordSpacing] ?? null,
    };
  
    // Convert lineHeight for preferences API (enum to number)
    const lineHeightValue = reduxValues[ThSpacingSettingsKeys.lineHeight];
    const lineHeightValueNumber = lineHeightValue && lineHeightValue !== ThLineHeightOptions.publisher 
      ? lineHeightOptions[lineHeightValue as ThLineHeightOptions] 
      : null;
  
    const preferencesToSubmit = {
      [ThSpacingSettingsKeys.letterSpacing]: reduxValues[ThSpacingSettingsKeys.letterSpacing],
      [ThSpacingSettingsKeys.lineHeight]: lineHeightValueNumber,
      [ThSpacingSettingsKeys.paragraphIndent]: reduxValues[ThSpacingSettingsKeys.paragraphIndent],
      [ThSpacingSettingsKeys.paragraphSpacing]: reduxValues[ThSpacingSettingsKeys.paragraphSpacing],
      [ThSpacingSettingsKeys.wordSpacing]: reduxValues[ThSpacingSettingsKeys.wordSpacing],
    };
  
    await submitPreferences(preferencesToSubmit);
  
    if (isWebPub) {
      dispatch(setWebPubSpacingPreset({
        preset: spacingKey,
        values: reduxValues,
      }));
    } else {
      dispatch(setSpacingPreset({
        preset: spacingKey,
        values: reduxValues,
      }));
    }
  }, [isWebPub, dispatch, submitPreferences, getPresetValues, lineHeightOptions]);

  // Use appropriate spacing keys based on layout
  const spacingKeys = useMemo(() => {
    const baseKeys = isWebPub 
      ? webPubSpacingPresetKeys 
      : isFXL 
        ? fxlSpacingPresetKeys 
        : reflowSpacingPresetKeys;
    const subPanelKeys = subPanelSpacingSettingsKeys || [];

    const hasCustomizableSettings = hasCustomizableSpacingSettings(subPanelKeys);

    if (hasCustomizableSettings) {
      return baseKeys;
    } else {
      // Exclude "custom" if no spacing settings are available for customization
      return baseKeys.filter(key => key !== ThSpacingPresetKeys.custom);
    }
  }, [isWebPub, isFXL, fxlSpacingPresetKeys, reflowSpacingPresetKeys, webPubSpacingPresetKeys, subPanelSpacingSettingsKeys]);

  // Create dynamic items array based on spacing keys
  const items = useMemo(() => {
    return spacingKeys.map((key: ThSpacingPresetKeys) => ({
      id: key,
      icon: iconMap[key],
      value: key,
      label: t(`reader.preferences.spacing.presets.${ key === ThSpacingPresetKeys.publisher ? "default" : key }`)
    }));
  }, [spacingKeys, t]);

  // Return null if no items to display
  if (items.length === 0) {
    return null;
  }

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("reader.preferences.spacing.presets.title") }
      orientation="horizontal"
      value={ spacing?.preset || ThSpacingPresetKeys.publisher }
      onChange={ async (val: string) => await updatePreference(val as ThSpacingPresetKeys) }
      items={ items }
    />
    </>
  );
}