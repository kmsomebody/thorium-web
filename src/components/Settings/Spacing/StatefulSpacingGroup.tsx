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
import { usePlugins } from "../../Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setSettingsContainer } from "@/lib/readerReducer";

export const StatefulSpacingGroup = () => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { spacingSettingsComponentsMap } = usePlugins();

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
      prefs={ preferences.settings.spacing }
      defaultPrefs={ {
        main: defaultSpacingSettingsMain, 
        subPanel: defaultSpacingSettingsSubpanel
      }}
    />
    </>
  );
}

export const StatefulSpacingGroupContainer = () => {
  const { preferences } = usePreferences();

  const displayOrder = preferences.settings.spacing?.subPanel as ThSpacingSettingsKeys[] | null | undefined || defaultSpacingSettingsSubpanel;
  const { spacingSettingsComponentsMap } = usePlugins();

  return(
    <>
    { displayOrder.map((key: ThSpacingSettingsKeys) => {
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