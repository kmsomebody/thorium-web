"use client";

import { useCallback, useRef } from "react";

import { useFirstFocusable } from "@/core/Components/Containers/hooks/useFirstFocusable";

import { Dialog, Popover } from "react-aria-components";

import SpeedIcon from "../assets/icons/speed.svg";

import { ThAudioKeys, ThAudioActionKeys, ThSettingsRangeVariant } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulSliderWithPresets } from "../../../Settings/StatefulSliderWithPresets";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { ThNumberField } from "@/core/Components/Settings/ThNumberField";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useNavigator } from "@/core/Navigator/hooks";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPlaybackRate } from "@/lib/audioSettingsReducer";
import { toggleActionOpen, setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioPlaybackRate = ({ isDisabled }: { isDisabled: boolean }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
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
  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.playbackRate];

  const updatePreference = useCallback(async (value: number) => {
    await submitPreferences({ playbackRate: value });
    dispatch(setPlaybackRate(getSetting("playbackRate")));
  }, [submitPreferences, getSetting, dispatch]);

  const renderContent = () => {
    if (config.variant === ThSettingsRangeVariant.slider) {
      return (
        <div ref={ contentRef } className={ audioStyles.audioPlaybackRateSliderContent }>
          <ThSlider
            aria-label={ t("reader.playback.preferences.playbackRate.descriptive") }
            range={ config.range }
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
            range={ config.range }
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
          presets={ config.presets || [] }
          formatValue={ (v) => `${v}×` }
          value={ playbackRate }
          onChange={ (v) => updatePreference(Array.isArray(v) ? v[0] : v) }
          range={ config.range }
          step={ config.step }
          onEscape={ () => dispatch(setActionOpen({ key: ThAudioActionKeys.playbackRate, isOpen: false })) }
        />
      </div>
    );
  };

  return (
    <>
      <StatefulActionIcon
        ref={ triggerRef }
        tooltipLabel={ t("reader.playback.preferences.playbackRate.descriptive") }
        placement="top"
        onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.playbackRate })) }
        isDisabled={ isDisabled }
        className={ audioStyles.audioPlaybackRateButton }
      >
        <SpeedIcon aria-hidden="true" focusable="false" />
        <span className={ audioStyles.audioPlaybackRateLabel } aria-hidden="true">{ playbackRate }×</span>
      </StatefulActionIcon>
      <Popover
        triggerRef={ triggerRef }
        isOpen={ isOpen }
        onOpenChange={ (open) => dispatch(setActionOpen({ key: ThAudioActionKeys.playbackRate, isOpen: open })) }
        placement="top"
        className={ audioStyles.audioControlPopover }
      >
        <Dialog aria-label={ t("reader.playback.preferences.playbackRate.descriptive") } className={ audioStyles.audioControlPopoverDialog }>
          { renderContent() }
        </Dialog>
      </Popover>
    </>
  );
};
