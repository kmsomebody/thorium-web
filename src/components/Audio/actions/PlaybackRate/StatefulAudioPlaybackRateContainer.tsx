"use client";

import { useCallback, useRef } from "react";

import { ThAudioKeys, ThAudioActionKeys, ThSettingsRangeVariant } from "@/preferences/models";
import { StatefulSliderWithPresets } from "../../../Settings/StatefulSliderWithPresets";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { ThNumberField } from "@/core/Components/Settings/ThNumberField";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { useFirstFocusable } from "@/core/Components/Containers/hooks/useFirstFocusable";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useNavigator } from "@/core/Navigator/hooks";
import { useEffectiveRange } from "../../../Settings/hooks/useEffectiveRange";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPlaybackRate } from "@/lib/audioSettingsReducer";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioPlaybackRateContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const isOpen = useAppSelector(state => state.actions.keys[ThAudioActionKeys.playbackRate]?.isOpen ?? false);

  useFirstFocusable({
    withinRef: contentRef,
    trackedState: isOpen,
    action: { type: "focus" }
  });

  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting, preferencesEditor } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.playbackRate];
  const { range, presets } = useEffectiveRange(config.range, preferencesEditor?.playbackRate?.supportedRange, config.presets);

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({ playbackRate: value });
    dispatch(setPlaybackRate(getSetting("playbackRate")));
  }, [submitPreferences, getSetting, dispatch]);

  const docking = useDocking(ThAudioActionKeys.playbackRate);

  const setOpen = useCallback((open: boolean) => {
    dispatch(setActionOpen({ key: ThAudioActionKeys.playbackRate, isOpen: open }));
  }, [dispatch]);

  const renderContent = () => {
    if (config.variant === ThSettingsRangeVariant.slider) {
      return (
        <div ref={ contentRef } className={ audioStyles.audioPlaybackRateSliderContent }>
          <ThSlider
            aria-label={ t("reader.playback.preferences.playbackRate.descriptive") }
            range={ range }
            step={ config.step }
            value={ playbackRate }
            onChange={ (v) => updatePreference(Array.isArray(v) ? v[0] : v) }
          />
        </div>
      );
    }

    if (config.variant === ThSettingsRangeVariant.numberField) {
      return (
        <div ref={ contentRef } className={ audioStyles.audioPlaybackRateNumberField }>
          <ThNumberField
            aria-label={ t("reader.playback.preferences.playbackRate.descriptive") }
            range={ range }
            step={ config.step }
            value={ playbackRate }
            onChange={ updatePreference }
          />
        </div>
      );
    }

    // Default: sliderWithPresets
    return (
      <div ref={ contentRef } className={ audioStyles.audioPlaybackRateSliderContent }>
        <StatefulSliderWithPresets
          standalone
          label={ t("reader.playback.preferences.playbackRate.descriptive") }
          presets={ presets || [] }
          formatValue={ (v) => `${v}×` }
          value={ playbackRate }
          onChange={ (v) => updatePreference(Array.isArray(v) ? v[0] : v) }
          range={ range }
          step={ config.step }
          onEscape={ () => setOpen(false) }
        />
      </div>
    );
  };

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: ThAudioActionKeys.playbackRate,
        triggerRef,
        heading: t("reader.playback.preferences.playbackRate.descriptive"),
        className: audioStyles.audioControlPopover,
        headerClassName: audioStyles.audioControlPopoverHeader,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      { renderContent() }
    </StatefulSheetWrapper>
  );
};
