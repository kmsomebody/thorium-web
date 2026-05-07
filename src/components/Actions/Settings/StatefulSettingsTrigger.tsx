"use client";

import LetterIcon from "./assets/icons/match_case.svg";
import TuneIcon from "./assets/icons/instant_mix.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsKeys } from "@/preferences/models";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulSettingsTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.settings]);
  const profile = useAppSelector(state => state.reader.profile);
  const isAudio = profile === "audio";
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {    
    dispatch(setActionOpen({
      key: ThActionsKeys.settings,
      isOpen: value
    }));

    // hover false otherwise it tends to stay on close button press…
    if (!value) dispatch(setHovering(false));
  }

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ t("reader.preferences.title") }
          SVGIcon={ isAudio ? TuneIcon : LetterIcon }
          shortcut={ preferences.actions.keys[ThActionsKeys.settings].shortcut } 
          id={ ThActionsKeys.settings }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon 
          visibility={ preferences.actions.keys[ThActionsKeys.settings].visibility }
          aria-label={ t("reader.preferences.title") }
          placement="bottom" 
          tooltipLabel={ t("reader.preferences.title") } 
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          { isAudio 
            ? <TuneIcon aria-hidden="true" focusable="false" />
            : <LetterIcon aria-hidden="true" focusable="false" />
          }
        </StatefulActionIcon>
    }
    </>
  )
}