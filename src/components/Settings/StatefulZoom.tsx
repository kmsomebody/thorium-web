"use client";

import React, { useCallback } from "react";

import { ThSettingsKeys, ThSettingsRangeVariant } from "@/preferences";

import Decrease from "./assets/icons/text_decrease.svg";
import Increase from "./assets/icons/text_increase.svg";
import ZoomOut from "./assets/icons/zoom_out.svg";
import ZoomIn from "./assets/icons/zoom_in.svg";

import { StatefulSlider } from "./StatefulSlider";
import { StatefulNumberField } from "./StatefulNumberField";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator/hooks";
import { useI18n } from "@/i18n/useI18n";
import { usePlaceholder } from "./hooks/usePlaceholder";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontSize } from "@/lib/settingsReducer";
import { setWebPubZoom } from "@/lib/webPubSettingsReducer";

export const StatefulZoom = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const readerProfile = useAppSelector((state) => state.reader.profile);
  const isFXL = useAppSelector((state) => state.publication.isFXL);
  const fontSize = useAppSelector((state) => state.settings.fontSize) || 1;
  const webPubZoom = useAppSelector((state) => state.webPubSettings.zoom) || 1;
  const derivedState = readerProfile === "webPub" ? webPubZoom : fontSize;
  
  const dispatch = useAppDispatch();
  
  const { 
    getSetting, 
    submitPreferences,
    preferencesEditor 
  } = useNavigator();

  const preferenceEditorProperty = readerProfile === "webPub" 
    ? preferencesEditor?.zoom 
    : isFXL 
      ? preferencesEditor?.zoom 
      : preferencesEditor?.fontSize;

  const updatePreference = useCallback(async (value: number | number[]) => {
    if (readerProfile === "webPub") {
      await submitPreferences({ zoom: Array.isArray(value) ? value[0] : value });
      dispatch(setWebPubZoom(getSetting("zoom")));
    } else {
      await submitPreferences({ fontSize: Array.isArray(value) ? value[0] : value });
      dispatch(setFontSize(getSetting("fontSize")));
    }
  }, [readerProfile, submitPreferences, getSetting, dispatch]);

  const getEffectiveRange = (preferred: [number, number], supportedRange: [number, number] | undefined): [number, number] => {
    if (!supportedRange) {
      return preferred
    }
    if (preferred && isRangeWithinSupportedRange(preferred, supportedRange)) {
      return preferred;
    }
    return supportedRange;
  }
  
  const isRangeWithinSupportedRange = (range: [number, number], supportedRange: [number, number]): boolean => {
    return Math.min(range[0], range[1]) >= Math.min(supportedRange[0], supportedRange[1]) &&
           Math.max(range[0], range[1]) <= Math.max(supportedRange[0], supportedRange[1]);
  }

  const zoomRangeConfig = {
    variant: preferences.settings.keys[ThSettingsKeys.zoom].variant,
    placeholder: preferences.settings.keys[ThSettingsKeys.zoom].placeholder,
    range: preferenceEditorProperty?.supportedRange
      ? getEffectiveRange(preferences.settings.keys[ThSettingsKeys.zoom].range, preferenceEditorProperty.supportedRange)
      : preferences.settings.keys[ThSettingsKeys.zoom].range,
    step: preferences.settings.keys[ThSettingsKeys.zoom].step
  }

  const placeholderText = usePlaceholder(zoomRangeConfig.placeholder, zoomRangeConfig.range);

  return (
    <>
    { zoomRangeConfig.variant === ThSettingsRangeVariant.numberField 
      ? <StatefulNumberField
        standalone={ true }
        defaultValue={ 1 } 
        value={ derivedState } 
        onChange={ async(value) => await updatePreference(value) } 
        label={ isFXL ? t("reader.preferences.zoom") : t("reader.preferences.fontSize") }
        placeholder={ placeholderText }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        steppers={{
          decrementIcon: isFXL ? ZoomOut : Decrease,
          decrementLabel: t("common.actions.decrease"),
          incrementIcon: isFXL ? ZoomIn : Increase,
          incrementLabel: t("common.actions.increase")
        }}
        formatOptions={{ style: "percent" }} 
        isWheelDisabled={ true }
        isVirtualKeyboardDisabled={ true }
      />
      : <StatefulSlider
        standalone={ true }
        displayTicks={ zoomRangeConfig.variant === ThSettingsRangeVariant.incrementedSlider }
        defaultValue={ 1 } 
        value={ derivedState } 
        onChange={ async(value) => await updatePreference(value as number) } 
        label={ isFXL ? t("reader.preferences.zoom") : t("reader.preferences.fontSize") }
        placeholder={ placeholderText }
        range={ zoomRangeConfig.range }
        step={ zoomRangeConfig.step }
        formatOptions={{ style: "percent" }} 
      />
    } 
    </>
  );
};