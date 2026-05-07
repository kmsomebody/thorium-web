"use client";

import { useCallback } from "react";

import { ThSettingsRangeVariant } from "@/preferences";

import { ThActionsKeys, ThAudioKeys } from "@/preferences/models";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";
import { StatefulSliderWithPresets } from "../../Settings/StatefulSliderWithPresets";

import { useNavigator } from "@/core/Navigator/hooks";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setActionOpen } from "@/lib";
import { setSkipInterval } from "@/lib/audioSettingsReducer";
import { defaultAudioSkipInterval } from "@/preferences/models/audio";

export interface StatefulAudioSkipIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipInterval = ({
  standalone = true
}: StatefulAudioSkipIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const skipInterval = useAppSelector(state => state.audioSettings.skipInterval);
  const dispatch = useAppDispatch();

  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.skipInterval] ?? defaultAudioSkipInterval;

  const skipIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range: config.range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipIntervalRangeConfig.placeholder, skipIntervalRangeConfig.range);

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({
      skipForwardInterval: val,
      skipBackwardInterval: val
    });
    dispatch(setSkipInterval(getSetting("skipForwardInterval")));
  }, [submitPreferences, getSetting, dispatch]);

  if (skipIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField) {
    return (
      <StatefulNumberField
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipInterval }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipIntervalRangeConfig.range || [1, 60] }
        step={ skipIntervalRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "unit", unit: "second" }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
    );
  }

  if (skipIntervalRangeConfig.variant === ThSettingsRangeVariant.sliderWithPresets) {
    return (
      <StatefulSliderWithPresets
        standalone={ standalone }
        label={ t("reader.playback.preferences.audio.skipInterval") }
        placeholder={ placeholderText }
        presets={ config.presets || [] }
        formatOptions={{ style: "unit", unit: "second" }}
        onEscape={ () => dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false })) }
        value={ skipInterval }
        onChange={ updatePreference }
        range={ skipIntervalRangeConfig.range }
        step={ skipIntervalRangeConfig.step }
      />
    );
  }

  return (
    <StatefulSlider
      standalone={ standalone }
      displayTicks={ skipIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
      label={ t("reader.playback.preferences.audio.skipInterval") }
      placeholder={ placeholderText }
      value={ skipInterval }
      onChange={ updatePreference }
      range={ skipIntervalRangeConfig.range }
      step={ skipIntervalRangeConfig.step }
      formatOptions={{ style: "unit", unit: "second" }}
    />
  );
};

