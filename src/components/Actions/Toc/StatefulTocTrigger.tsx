"use client";

import { ThActionsKeys } from "@/preferences/models";

import TocIcon from "./assets/icons/toc.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulTocTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.toc]);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ThActionsKeys.toc,
      isOpen: value 
    }));
  }

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ t("reader.tableOfContents.title") }
          SVGIcon={ TocIcon } 
          shortcut={ preferences.actions.keys[ThActionsKeys.toc].shortcut }
          id={ ThActionsKeys.toc }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon 
          visibility={ preferences.actions.keys[ThActionsKeys.toc].visibility }
          aria-label={ t("reader.tableOfContents.title") } 
          placement="bottom"
          tooltipLabel={ t("reader.tableOfContents.title") } 
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          <TocIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}