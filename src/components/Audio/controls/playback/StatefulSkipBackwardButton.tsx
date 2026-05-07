"use client";

import ReplayIcon from "./assets/icons/replay.svg";
import Replay5Icon from "./assets/icons/replay_5.svg";
import Replay10Icon from "./assets/icons/replay_10.svg";
import Replay30Icon from "./assets/icons/replay_30.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "../assets/styles/thorium-web.audioControls.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

const replayIconMap: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  5: Replay5Icon,
  10: Replay10Icon,
  30: Replay30Icon,
};

export const StatefulSkipBackwardButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { skipBackward } = useNavigator().media;
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);

  const Icon = replayIconMap[skipBackwardInterval] ?? ReplayIcon;

  return (
    <StatefulActionIcon
      onPress={ skipBackward }
      isDisabled={ isDisabled }
      aria-label={ t("audio.player.skipBackward") }
      tooltipLabel={ t("audio.player.skipBackward") }
      className={ audioStyles.audioSkipBackwardButton }
    >
      <Icon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
