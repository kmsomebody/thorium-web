"use client";

import SkipPreviousIcon from "./assets/icons/skip_previous.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "../assets/styles/thorium-web.audioControls.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

export const StatefulPreviousTrackButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { goBackward } = useNavigator().media;
  const atStart = useAppSelector(state => state.publication.atPublicationStart);

  return (
    <StatefulActionIcon
      onPress={ () => goBackward(false, () => {}) }
      isDisabled={ isDisabled || atStart }
      aria-label={ t("audio.player.previousTrack") }
      tooltipLabel={ t("audio.player.previousTrack") }
      className={ audioStyles.audioPreviousTrackButton }
    >
      <SkipPreviousIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
