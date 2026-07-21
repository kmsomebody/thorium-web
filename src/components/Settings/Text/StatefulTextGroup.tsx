"use client";

import { useCallback } from "react";

import {
  defaultTextSettingsMain,
  defaultTextSettingsSubpanel,
  ThSettingsContainerKeys,
  ThTextSettingsKeys
} from "@/preferences";

import { StatefulGroupWrapper } from "../StatefulGroupWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { usePlugins } from "../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setSettingsContainer } from "@/lib/readerReducer";

export const StatefulTextGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { textSettingsComponentsMap } = usePlugins();
  const { mainTextSettingsKeys, subPanelTextSettingsKeys } = useFilteredPreferenceKeys();

  const dispatch = useAppDispatch();

  const setTextContainer = useCallback(() => {
    dispatch(setSettingsContainer(ThSettingsContainerKeys.text));
  }, [dispatch]);

  return(
    <>
    <StatefulGroupWrapper<ThTextSettingsKeys>
      label={ t("reader.preferences.text") }
      moreLabel={ t("reader.settings.text.advanced.trigger") }
      moreTooltip={ t("reader.settings.text.advanced.tooltip") }
      onPressMore={ setTextContainer }
      componentsMap={ textSettingsComponentsMap }
      prefs={ {
        main: mainTextSettingsKeys,
        subPanel: preferences.settings.text?.subPanel === null ? null : subPanelTextSettingsKeys,
        header: preferences.settings.text?.header
      } }
      defaultPrefs={ {
        main: defaultTextSettingsMain,
        subPanel: defaultTextSettingsSubpanel
      }}
    />
    </>
  )
}

export const StatefulTextGroupContainer = () => {
  const { subPanelTextSettingsKeys } = useFilteredPreferenceKeys();
  const { textSettingsComponentsMap } = usePlugins();

  return(
    <>
    { subPanelTextSettingsKeys.map((key: ThTextSettingsKeys) => {
      const match = textSettingsComponentsMap[key];
      if (!match) {
        console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
        return null;
      }
      return <match.Comp key={ key } standalone={ true } />;
    }) }
    </>
  )
}
