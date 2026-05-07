"use client";

import audioStyles from "./assets/styles/thorium-web.audioActions.module.css";

import { ThActionsBar } from "@/core/Components/Actions/ThActionsBar";
import { usePlugins } from "@/components/Plugins/PluginProvider";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";

export const StatefulAudioMediaActions = () => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { primaryAudioActionsMap } = usePlugins();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const displayOrder = preferences.actions.primary.displayOrder;

  return (
    <ThActionsBar className={ audioStyles.audioMediaActions } aria-label={ t("audio.player.mediaActions") }>
      { displayOrder.map(key => {
        const Component = primaryAudioActionsMap[key];
        if (!Component) return null;
        return <Component key={ key } isDisabled={ isDisabled } />;
      }) }
    </ThActionsBar>
  );
};
