"use client";

import SkipNextIcon from "./assets/icons/skip_next.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

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
      aria-label={ t("reader.actions.goForward") }
      tooltipLabel={ t("reader.actions.goForward") }
      className={ audioStyles.audioNextTrackButton }
    >
      <SkipNextIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
