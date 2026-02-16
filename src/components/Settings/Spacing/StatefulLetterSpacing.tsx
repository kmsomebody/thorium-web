"use client";

import { useCallback } from "react";

import { ThSettingsKeys, ThSettingsRangeVariant, ThSpacingSettingsKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../models/settings";

import { StatefulNumberField } from "../StatefulNumberField";
import { StatefulSlider } from "../StatefulSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSpacingPresets } from "./hooks/useSpacingPresets";
import { usePlaceholder } from "../hooks/usePlaceholder";

export const StatefulLetterSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const letterSpacingRangeConfig = {
    variant: preferences.settings.keys[ThSettingsKeys.letterSpacing].variant,
    placeholder: preferences.settings.keys[ThSettingsKeys.letterSpacing].placeholder,
    range: preferences.settings.keys[ThSettingsKeys.letterSpacing].range,
    step: preferences.settings.keys[ThSettingsKeys.letterSpacing].step
  };

  const placeholderText = usePlaceholder(letterSpacingRangeConfig.placeholder, letterSpacingRangeConfig.range, "percent");
  
  const { getSetting, submitPreferences } = useNavigator();

  const { getEffectiveSpacingValue, setLetterSpacing, canBeReset } = useSpacingPresets();

  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      letterSpacing: Array.isArray(value) ? value[0] : value
    });

    setLetterSpacing(getSetting("letterSpacing"));
  }, [submitPreferences, getSetting, setLetterSpacing]);

  return (
    <>
    { letterSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.letterSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ letterSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.letterSpacing) ? async() => await updatePreference(null) : undefined }
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ letterSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.letterSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ letterSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.letterSpacing) ? async() => await updatePreference(null) : undefined }
        range={ letterSpacingRangeConfig.range }
        step={ letterSpacingRangeConfig.step }
        formatOptions={ { style: "percent" } }
      />
    } 
    </>
  )
}