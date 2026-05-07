"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import CastIcon from "./assets/icons/cast.svg";
import CastConnectedIcon from "./assets/icons/cast_connected.svg";
import CastWarningIcon from "./assets/icons/cast_warning.svg";

import { ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../../../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { useNavigator } from "@/core/Navigator";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setRemotePlaybackState } from "@/lib/playerReducer";

export const StatefulAudioRemotePlaybackTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const dispatch = useAppDispatch();

  const remotePlaybackState = useAppSelector(state => state.player.remotePlaybackState);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const watchIdRef = useRef<number | undefined>(undefined);

  const { remotePlayback } = useNavigator().media;

  useEffect(() => {
    if (!remotePlayback) return;

    remotePlayback.watchAvailability((available) => {
      setIsAvailable(available);
    }).then((id) => {
      watchIdRef.current = id;
    }).catch(() => {
      // API not supported or disableRemotePlayback is set — always show
      setIsAvailable(true);
    });

    return () => {
      if (watchIdRef.current !== undefined) {
        remotePlayback.cancelWatchAvailability(watchIdRef.current);
      }
    };
  }, [remotePlayback]);

  const handlePress = useCallback(async () => {
    if (!remotePlayback) return;
    try {
      await remotePlayback.prompt();
    } catch (err: unknown) {
      if (err instanceof DOMException && (err.name === "AbortError" || err.name === "NotAllowedError")) return;
      dispatch(setRemotePlaybackState("error"));
    }
  }, [remotePlayback, dispatch]);

  if (preferences.contentProtection?.disableRemotePlayback) return null;
  if (!remotePlayback || isAvailable === false) return null;

  const isConnected = remotePlaybackState === "connected" || remotePlaybackState === "connecting";
  const isError = remotePlaybackState === "error";
  const Icon = isError ? CastWarningIcon : isConnected ? CastConnectedIcon : CastIcon;

  const token = preferences.actions.secondary.keys[ThAudioActionKeys.remotePlayback];
  const label = isConnected
    ? t("audio.remotePlayback.connected")
    : t("audio.remotePlayback.trigger");

  return (
    <>
      { (variant && variant === ThActionsTriggerVariant.menu)
        ? <StatefulOverflowMenuItem
            label={ label }
            SVGIcon={ Icon }
            shortcut={ token?.shortcut ?? null }
            id={ ThAudioActionKeys.remotePlayback }
            isDisabled={ isError }
            onAction={ handlePress }
          />
        : <StatefulActionIcon
            visibility={ token?.visibility }
            tooltipLabel={ label }
            placement="bottom"
            aria-label={ label }
            isDisabled={ isError }
            onPress={ handlePress }
          >
            <Icon aria-hidden="true" focusable="false" />
          </StatefulActionIcon>
      }
    </>
  );
};
