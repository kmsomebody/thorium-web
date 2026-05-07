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
import { setSkipForwardInterval } from "@/lib/audioSettingsReducer";

export interface StatefulAudioSkipForwardIntervalProps {
  standalone?: boolean;
}

export const StatefulAudioSkipForwardInterval = ({
  standalone = true
}: StatefulAudioSkipForwardIntervalProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const skipForwardInterval = useAppSelector(state => state.audioSettings.skipForwardInterval);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.audio.keys[ThAudioKeys.skipForwardInterval];

  const skipForwardIntervalRangeConfig = {
    variant: config.variant,
    placeholder: config.placeholder,
    range: config.range,
    step: config.step
  };

  const placeholderText = usePlaceholder(skipForwardIntervalRangeConfig.placeholder, skipForwardIntervalRangeConfig.range);

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ skipForwardInterval: val });
    const effectiveSkipForwardInterval = getSetting("skipForwardInterval");
    dispatch(setSkipForwardInterval(effectiveSkipForwardInterval));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <>
    { skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField
        standalone={ standalone }
        label={ t("audio.settings.skipForwardInterval") }
        placeholder={ placeholderText }
        defaultValue={ undefined }
        value={ skipForwardInterval }
        onChange={ updatePreference }
        onReset={ undefined }
        range={ skipForwardIntervalRangeConfig.range || [1, 60] }
        step={ skipForwardIntervalRangeConfig.step }
        steppers={{
          decrementLabel: t("common.actions.decrease"),
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "unit", unit: "second" }}
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ standalone }
        displayTicks={ skipForwardIntervalRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        label={ t("audio.settings.skipForwardInterval") }
        placeholder={ placeholderText }
        value={ skipForwardInterval }
        onChange={ updatePreference }
        range={ skipForwardIntervalRangeConfig.range }
        step={ skipForwardIntervalRangeConfig.step }
      />
    }
    </>
  );
};
