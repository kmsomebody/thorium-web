"use client";

import audioStyles from "./assets/styles/thorium-web.audioControls.module.css";

import { ThActionsBar } from "@/core/Components/Actions/ThActionsBar";
import { StatefulAudioVolume } from "./Volume/StatefulAudioVolume";
import { StatefulAudioPlaybackRate } from "./PlaybackRate/StatefulAudioPlaybackRate";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib";

export const StatefulAudioMediaControls = () => {
  const { t } = useI18n();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  return (
    <ThActionsBar className={ audioStyles.audioMediaControls } aria-label={ t("audio.player.mediaControls") }>
      <StatefulAudioVolume isDisabled={ !isTrackReady || isStalled } />
      <StatefulAudioPlaybackRate isDisabled={ !isTrackReady || isStalled }/>
    </ThActionsBar>
  );
};
