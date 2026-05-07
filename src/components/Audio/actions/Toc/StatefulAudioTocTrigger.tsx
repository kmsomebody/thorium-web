"use client";

import TocIcon from "@/components/Actions/Toc/assets/icons/toc.svg";

import { ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioTocTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();

  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const dispatch = useAppDispatch();

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.tableOfContents.title") }
      placement="top"
      onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.toc })) }
      isDisabled={ isDisabled }
      className={ audioStyles.audioTocButton }
    >
      <TocIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
