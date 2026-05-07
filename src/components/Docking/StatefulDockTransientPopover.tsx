"use client";

import { useCallback } from "react";

import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { StatefulActionTriggerProps } from "@/components/Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { ThDockingKeys } from "@/preferences/models";

import Stack from "./assets/icons/stack.svg";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Actions/Triggers/StatefulOverflowMenuItem";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";

export const StatefulDockTransientPopover = ({ variant, associatedKey }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const actionsMap = useAppSelector(state => state.actions.keys);
  const profile = useAppSelector(state => state.reader.profile);
  const actions = useActions(actionsMap);
  const isDisabled = !actions.isDocked(associatedKey) || actions.whichDocked(associatedKey) === ThDockingKeys.transient;
    
  const dispatch = useAppDispatch();

  const handlePress = useCallback(() => {
    if (associatedKey && profile) {
      dispatch(dockAction({
        key: associatedKey,
        dockingKey: ThDockingKeys.transient,
        profile: profile
      }))
    }
  }, [dispatch, associatedKey, profile]);
  
  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ t("reader.app.docker.popover.trigger") }
          SVGIcon={ Stack } 
          shortcut={ preferences.docking.keys[ThDockingKeys.transient].shortcut }
          onAction={ handlePress } 
          id={ `${ ThDockingKeys.transient }-${ associatedKey }` } 
          isDisabled={ isDisabled }
        />
      : <StatefulActionIcon 
          className={ readerSharedUI.dockerButton }  
          aria-label={ t("reader.app.docker.popover.trigger") }
          placement="bottom" 
          tooltipLabel={ t("reader.app.docker.popover.tooltip") } 
          onPress={ handlePress } 
          isDisabled={ isDisabled }
        >
          <Stack aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}