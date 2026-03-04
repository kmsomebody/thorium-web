"use client";

import { ThActionsKeys } from "@/preferences/models";
import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import TargetIcon from "./assets/icons/pin_drop.svg";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import { setActionOpen, useAppDispatch, useAppSelector } from "@/lib";

export const StatefulJumpToPositionTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ThActionsKeys.jumpToPosition,
      isOpen: value 
    }));
  }

  // In case there is no positions list we return
  if (!positionsList) return null;

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
     ? <StatefulOverflowMenuItem 
         label={ t("reader.actions.goToPosition.descriptive") }
          SVGIcon={ TargetIcon }
          shortcut={ preferences.actions.keys[ThActionsKeys.jumpToPosition].shortcut }
          id={ ThActionsKeys.jumpToPosition }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon
          visibility={ preferences.actions.keys[ThActionsKeys.jumpToPosition].visibility } 
          aria-label={ t("reader.actions.goToPosition.descriptive") }
          placement="bottom" 
          tooltipLabel={ t("reader.actions.goToPosition.compact") }
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          <TargetIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
 )
}