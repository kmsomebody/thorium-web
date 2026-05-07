"use client";

import { useCallback } from "react";

import { ThSettingsRangeVariant } from "@/preferences";

import { ThAudioKeys } from "@/preferences/models";

import { StatefulNumberField } from "../../Settings/StatefulNumberField";
import { StatefulSlider } from "../../Settings/StatefulSlider";

import { useNavigator } from "@/core/Navigator/hooks";
import { usePlaceholder } from "../../Settings/hooks/usePlaceholder";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setSkipBackwardInterval } from "@/lib/audioSettingsReducer";

export interface StatefulAudioSkipBackwardIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipBackwardInterval = ({
  standalone = true
}: StatefulAudioSkipBackwardIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.audio.keys[ThAudioKeys.skipBackwardInterval];

  const skipBackwardIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range: config.range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipBackwardIntervalRangeConfig.placeholder, skipBackwardIntervalRangeConfig.range);

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ skipBackwardInterval: val });
    const effectiveSkipBackwardInterval = getSetting("skipBackwardInterval");
    dispatch(setSkipBackwardInterval(effectiveSkipBackwardInterval));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <>
    { skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("audio.settings.skipBackwardInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipBackwardInterval ?? undefined }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipBackwardIntervalRangeConfig.range || [1, 60] }
        step={ skipBackwardIntervalRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={ { style: "unit", unit: "second" } }
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone}
        displayTicks={ skipBackwardIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("audio.settings.skipBackwardInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipBackwardInterval ?? undefined }
        onChange={ updatePreference }
        range={ skipBackwardIntervalRangeConfig.range }
        step={ skipBackwardIntervalRangeConfig.step }
      />
    }
    </>
  );
};
