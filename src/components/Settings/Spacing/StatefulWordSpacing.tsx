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

export const StatefulWordSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const wordSpacingRangeConfig = {
    variant: preferences.settings.keys[ThSettingsKeys.wordSpacing].variant,
    placeholder: preferences.settings.keys[ThSettingsKeys.wordSpacing].placeholder,
    range: preferences.settings.keys[ThSettingsKeys.wordSpacing].range,
    step: preferences.settings.keys[ThSettingsKeys.wordSpacing].step
  };

  const placeholderText = usePlaceholder(wordSpacingRangeConfig.placeholder, wordSpacingRangeConfig.range, "percent");
  
  const { getSetting, submitPreferences } = useNavigator();

  const { getEffectiveSpacingValue, setWordSpacing, canBeReset } = useSpacingPresets();

  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);
  
  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      wordSpacing: Array.isArray(value) ? value[0] : value
    });
    
    setWordSpacing(getSetting("wordSpacing"));
  }, [submitPreferences, getSetting, setWordSpacing]);

  return (
    <>
    { wordSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.wordSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ wordSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.wordSpacing) ? async() => await updatePreference(null) : undefined }
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
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
        displayTicks={ wordSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.wordSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ wordSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.wordSpacing) ? async() => await updatePreference(null) : undefined }
        range={ wordSpacingRangeConfig.range }
        step={ wordSpacingRangeConfig.step }
        formatOptions={{ style: "percent" }}
      /> 
    }
    </>
  )
}