"use client";

import SkipNextIcon from "./assets/icons/skip_next.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "../assets/styles/thorium-web.audioControls.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

export const StatefulNextTrackButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { goForward } = useNavigator().media;
  const atEnd = useAppSelector(state => state.publication.atPublicationEnd);

  return (
    <StatefulActionIcon
      onPress={ () => goForward(false, () => {}) }
      isDisabled={ isDisabled || atEnd }
      aria-label={ t("audio.player.nextTrack") }
      tooltipLabel={ t("audio.player.nextTrack") }
      className={ audioStyles.audioNextTrackButton }
    >
      <SkipNextIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
