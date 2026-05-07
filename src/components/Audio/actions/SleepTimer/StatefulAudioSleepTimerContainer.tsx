"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "react-aria-components";
import { FocusScope } from "react-aria";

import { ThAudioActionKeys, ThAudioKeys, ThSettingsTimerVariant } from "@/preferences/models";
import { ThNumberField } from "@/core/Components/Settings/ThNumberField";
import { ThRadioGroup } from "@/core/Components/Settings/ThRadioGroup";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setSleepTimerOnTrackEnd, setSleepTimerRemainingSeconds } from "@/lib/playerReducer";

export const StatefulAudioSleepTimerContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const isOpen = useAppSelector(state => state.actions.keys[ThAudioActionKeys.sleepTimer]?.isOpen ?? false);
  const remainingSeconds = useAppSelector(state => state.player.sleepTimer.remainingSeconds);
  const onTrackEnd = useAppSelector(state => state.player.sleepTimer.onTrackEnd);
  const playerStatus = useAppSelector(state => state.player.status);
  const dispatch = useAppDispatch();

  const { t } = useI18n();

  const formatRemaining = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    const min = t("audio.settings.sleepTimer.minutes");
    const sec = t("audio.settings.sleepTimer.seconds");
    if (h > 0) return `${ h }${ t("audio.settings.sleepTimer.hours") } ${ mm }${ min } ${ ss }${ sec }`;
    return `${ mm }${ min } ${ ss }${ sec }`;
  };

  const { preferences } = useAudioPreferences();
  const { pause } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.sleepTimer];
  const variant = config.variant;

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      pause();
      dispatch(setSleepTimerRemainingSeconds(null));
      return;
    }
    if (playerStatus !== "playing") return;
    const id = setTimeout(() => {
      dispatch(setSleepTimerRemainingSeconds(remainingSeconds - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [remainingSeconds, playerStatus, pause, dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(setSleepTimerRemainingSeconds(null));
    dispatch(setSleepTimerOnTrackEnd(false));
    dispatch(setActionOpen({ key: ThAudioActionKeys.sleepTimer, isOpen: false }));
  }, [dispatch]);

  const handleStart = useCallback(() => {
    const totalSeconds = hours * 3600 + minutes * 60;
    if (totalSeconds <= 0) return;
    dispatch(setSleepTimerRemainingSeconds(totalSeconds));
    dispatch(setActionOpen({ key: ThAudioActionKeys.sleepTimer, isOpen: false }));
  }, [hours, minutes, dispatch]);

  const handlePresetSelect = useCallback((value: string) => {
    if (value === "endOfResource") {
      dispatch(setSleepTimerOnTrackEnd(true));
    } else {
      dispatch(setSleepTimerRemainingSeconds(Number(value) * 60));
    }
    dispatch(setActionOpen({ key: ThAudioActionKeys.sleepTimer, isOpen: false }));
  }, [dispatch]);

  const docking = useDocking(ThAudioActionKeys.sleepTimer);

  const setOpen = useCallback((open: boolean) => {
    dispatch(setActionOpen({ key: ThAudioActionKeys.sleepTimer, isOpen: open }));
  }, [dispatch]);

  const isActive = remainingSeconds !== null || onTrackEnd;
  const maxHours = (config.variant === ThSettingsTimerVariant.durationField ? config.maxHours : undefined) ?? 23;

  const renderContent = () => {
    if (variant === ThSettingsTimerVariant.presetList && config?.variant === ThSettingsTimerVariant.presetList) {
      const items = config.presets.map(preset => preset === "endOfResource"
        ? {
            id: "endOfResource",
            value: "endOfResource",
            label: t("reader.playback.preferences.sleepTimer.presets.endOfResource"),
          }
        : {
            id: String(preset),
            value: String(preset),
            label: `${ preset } ${ t("audio.settings.sleepTimer.minutes") }`,
          }
      );

      const activeValue = onTrackEnd
        ? "endOfResource"
        : remainingSeconds !== null ? String(remainingSeconds / 60) : "";

      return (
        <div className={ audioStyles.audioSleepTimerDurationField }>
          <ThRadioGroup
            aria-label={ t("reader.playback.preferences.sleepTimer.descriptive") }
            value={ activeValue }
            onChange={ handlePresetSelect }
            items={ items }
            compounds={{
              wrapper: { className: audioStyles.audioSleepTimerListbox },
              radio: { className: audioStyles.audioSleepTimerListboxItem },
            }}
          />
          { isActive && (
            <Button
              className={ `${ audioStyles.audioSleepTimerActionButton } ${ audioStyles.audioSleepTimerPresetCancelButton }` }
              onPress={ handleCancel }
            >
              { t("common.actions.cancel") }
            </Button>
          ) }
        </div>
      );
    }

    // durationField variant
    if (isActive && remainingSeconds !== null) {
      return (
        <div className={ audioStyles.audioSleepTimerDurationField }>
          <p className={ audioStyles.audioSleepTimerRemaining }>
            { t("audio.settings.sleepTimer.remaining", { remaining: formatRemaining(remainingSeconds) }) }
          </p>
          <Button
            className={ audioStyles.audioSleepTimerActionButton }
            onPress={ handleCancel }
          >
            { t("common.actions.cancel") }
          </Button>
        </div>
      );
    }

    return (
      <div className={ audioStyles.audioSleepTimerDurationField }>
        <p className={ audioStyles.audioSleepTimerInstruction }>
          { t("audio.settings.sleepTimer.instruction") }
        </p>
        <div className={ audioStyles.audioSleepTimerInputs }>
          <ThNumberField
            aria-label={ t("audio.settings.sleepTimer.hours") }
            range={ [0, maxHours] }
            step={ 1 }
            value={ hours }
            onChange={ setHours }
            onInputChange={ (raw) => setHours(parseInt(raw) || 0) }
            compounds={{
              group: { className: audioStyles.audioSleepTimerFieldGroup },
              input: { className: audioStyles.audioSleepTimerFieldInput }
            }}
          />
          <span className={ audioStyles.audioSleepTimerUnitLabel } aria-hidden="true">
            { t("audio.settings.sleepTimer.hours") }
          </span>
          <ThNumberField
            aria-label={ t("audio.settings.sleepTimer.minutes") }
            range={ [0, 59] }
            step={ 1 }
            value={ minutes }
            onChange={ setMinutes }
            onInputChange={ (raw) => setMinutes(parseInt(raw) || 0) }
            compounds={{
              group: { className: audioStyles.audioSleepTimerFieldGroup },
              input: { className: audioStyles.audioSleepTimerFieldInput }
            }}
          />
          <span className={ audioStyles.audioSleepTimerUnitLabel } aria-hidden="true">
            { t("audio.settings.sleepTimer.minutes") }
          </span>
        </div>
        <Button
          className={ audioStyles.audioSleepTimerActionButton }
          isDisabled={ hours === 0 && minutes === 0 }
          onPress={ handleStart }
        >
          { t("audio.settings.sleepTimer.start") }
        </Button>
      </div>
    );
  };

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: ThAudioActionKeys.sleepTimer,
        triggerRef,
        heading: t("reader.playback.preferences.sleepTimer.descriptive"),
        className: audioStyles.audioControlPopover,
        headerClassName: audioStyles.audioControlPopoverHeader,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      <FocusScope contain>
        { renderContent() }
      </FocusScope>
    </StatefulSheetWrapper>
  );
};
