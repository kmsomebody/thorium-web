"use client";

import { useCallback } from "react";

import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { ThActionsKeys, ThSheetHeaderVariant } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import { StatefulSettingsWrapper } from "./StatefulSettingsWrapper";

import { usePlugins } from "@/components/Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioSettingsContainer = ({
  triggerRef
}: StatefulActionContainerProps) => {
  const { preferences } = useAudioPreferences();
  const audioSettingsKeys = preferences.settings.order;
  const { settingsComponentsMap } = usePlugins();
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.reader.profile);

  const close = useCallback(() => {
    if (profile) {
      dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
    }
    dispatch(setHovering(false));
  }, [dispatch, profile]);

  return (
    <StatefulSettingsWrapper
      triggerRef={ triggerRef }
      heading={ t("reader.playback.preferences.audio.title") }
      headerVariant={ ThSheetHeaderVariant.close }
      onClosePress={ close }
    >
      { audioSettingsKeys.length > 0 && settingsComponentsMap
        ? audioSettingsKeys.map((key) => {
            const match = settingsComponentsMap[key];
            if (!match) {
              console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
              return null;
            }
            return <match.Comp key={ key } { ...match.props } />;
          })
        : null
      }
    </StatefulSettingsWrapper>
  );
};
