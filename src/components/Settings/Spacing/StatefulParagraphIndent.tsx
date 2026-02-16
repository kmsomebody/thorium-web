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

export const StatefulParagraphIndent = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  
  const paragraphIndentRangeConfig = {
      variant: preferences.settings.keys[ThSettingsKeys.paragraphIndent].variant,
      placeholder: preferences.settings.keys[ThSettingsKeys.paragraphIndent].placeholder,
      range: preferences.settings.keys[ThSettingsKeys.paragraphIndent].range,
      step: preferences.settings.keys[ThSettingsKeys.paragraphIndent].step
    };

  const placeholderText = usePlaceholder(paragraphIndentRangeConfig.placeholder, paragraphIndentRangeConfig.range, "multiplier");
  
  const { getSetting, submitPreferences } = useNavigator();

  const { getEffectiveSpacingValue, setParagraphIndent, canBeReset } = useSpacingPresets();

  const paragraphIndent = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphIndent);

  const updatePreference = useCallback(async (value: number | number[] | null) => {
    await submitPreferences({
      paragraphIndent: Array.isArray(value) ? value[0] : value
    });

    setParagraphIndent(getSetting("paragraphIndent"));
  }, [submitPreferences, getSetting, setParagraphIndent]);

  return (
    <>
    { paragraphIndentRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField 
        standalone={ standalone }
        label={ t("reader.preferences.paragraphIndent") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphIndent ?? undefined } 
        onChange={ async(value) => await updatePreference(value) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphIndent) ? async () => await updatePreference(null) : undefined }
        range={ paragraphIndentRangeConfig.range }
        step={ paragraphIndentRangeConfig.step }
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
        displayTicks={ paragraphIndentRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("reader.preferences.paragraphIndent") }
        placeholder={ placeholderText }
        defaultValue={ undefined } 
        value={ paragraphIndent ?? undefined } 
        onChange={ async(value) => await updatePreference(value as number) } 
        onReset={ canBeReset(ThSpacingSettingsKeys.paragraphIndent) ? async () => await updatePreference(null) : undefined }
        range={ paragraphIndentRangeConfig.range }
        step={ paragraphIndentRangeConfig.step }
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