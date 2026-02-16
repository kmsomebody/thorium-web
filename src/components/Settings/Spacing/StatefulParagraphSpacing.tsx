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

export const StatefulParagraphSpacing = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const paragraphSpacingRangeConfig = {
    variant: preferences.settings.keys[ThSettingsKeys.paragraphSpacing].variant,
    placeholder: preferences.settings.keys[ThSettingsKeys.paragraphSpacing].placeholder,
    range: preferences.settings.keys[ThSettingsKeys.paragraphSpacing].range,
    step: preferences.settings.keys[ThSettingsKeys.paragraphSpacing].step
  };

  const placeholderText = usePlaceholder(paragraphSpacingRangeConfig.placeholder, paragraphSpacingRangeConfig.range, "multiplier");
  
  const { getSetting, submitPreferences } = useNavigator();

  const { getEffectiveSpacingValue, setParagraphSpacing, canBeReset } = useSpacingPresets();

  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      paragraphSpacing: Array.isArray(value) ? value[0] : value
    });

    setParagraphSpacing(getSetting("paragraphSpacing"));
  }, [submitPreferences, getSetting, setParagraphSpacing]);

  return (
    <>
    { paragraphSpacingRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.paragraphSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphSpacing) ? async() => await updatePreference(null) : undefined }
        range={ paragraphSpacingRangeConfig.range }
        step={ paragraphSpacingRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{
          signDisplay: "exceptZero",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ paragraphSpacingRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.paragraphSpacing") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphSpacing ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphSpacing) ? async() => await updatePreference(null) : undefined }
        range={ paragraphSpacingRangeConfig.range }
        step={ paragraphSpacingRangeConfig.step }
        formatOptions={{
          signDisplay: "exceptZero",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }}
      /> 
    }
    </>
  )
}