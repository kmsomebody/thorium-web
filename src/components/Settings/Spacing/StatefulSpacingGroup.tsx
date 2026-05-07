"use client";

import { useCallback } from "react";

import {
  defaultSpacingSettingsMain,
  defaultSpacingSettingsSubpanel,
  ThSettingsContainerKeys,
  ThSpacingSettingsKeys
} from "@/preferences";

import { StatefulGroupWrapper } from "../StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { usePlugins } from "../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setSettingsContainer } from "@/lib/readerReducer";

export const StatefulSpacingGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { spacingSettingsComponentsMap } = usePlugins();
  const { mainSpacingSettingsKeys, subPanelSpacingSettingsKeys } = useFilteredPreferenceKeys();

  const dispatch = useAppDispatch();

  const setSpacingContainer = useCallback(() => {
    dispatch(setSettingsContainer(ThSettingsContainerKeys.spacing));
  }, [dispatch]);

  return (
    <>
    <StatefulGroupWrapper<ThSpacingSettingsKeys>
      label={ t("reader.preferences.spacing.title") }
      moreLabel={ t("reader.settings.spacing.advanced.trigger") }
      moreTooltip={ t("reader.settings.spacing.advanced.tooltip") }
      onPressMore={ setSpacingContainer }
      componentsMap={ spacingSettingsComponentsMap }
      prefs={ {
        main: mainSpacingSettingsKeys,
        subPanel: preferences.settings.spacing?.subPanel === null ? null : subPanelSpacingSettingsKeys,
        header: preferences.settings.spacing?.header
      } }
      defaultPrefs={ {
        main: defaultSpacingSettingsMain,
        subPanel: defaultSpacingSettingsSubpanel
      }}
    />
    </>
  );
}

export const StatefulSpacingGroupContainer = () => {
  const { subPanelSpacingSettingsKeys } = useFilteredPreferenceKeys();
  const { spacingSettingsComponentsMap } = usePlugins();

  return(
    <>
    { subPanelSpacingSettingsKeys.map((key: ThSpacingSettingsKeys) => {
      const match = spacingSettingsComponentsMap[key];
      if (!match) {
        console.warn(`Setting key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
