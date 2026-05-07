"use client";

import LetterIcon from "./assets/icons/match_case.svg";
import TuneIcon from "./assets/icons/instant_mix.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsKeys } from "@/preferences/models";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useI18n } from "@/i18n/useI18n";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulSettingsTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const actionState = useAppSelector(state => profile ? state.actions.keys[profile][ThActionsKeys.settings] : undefined);
  const isAudio = profile === "audio";
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {    
    if (profile) {
      dispatch(setActionOpen({
        key: ThActionsKeys.settings,
        isOpen: value,
        profile
      }));
    }
    // hover false otherwise it tends to stay on close button press…
    if (!value) dispatch(setHovering(false));
  };

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu)
      ? <StatefulOverflowMenuItem
          label={ isAudio ? t("reader.playback.preferences.audio.title") : t("reader.preferences.title") }
          SVGIcon={ isAudio ? TuneIcon : LetterIcon }
          shortcut={ preferences.actionsKeys[ThActionsKeys.settings].shortcut }
          id={ ThActionsKeys.settings }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon
          visibility={ preferences.actionsKeys[ThActionsKeys.settings].visibility }
          aria-label={ isAudio ? t("reader.playback.preferences.audio.title") : t("reader.preferences.title") }
          placement="bottom"
          tooltipLabel={ isAudio ? t("reader.playback.preferences.audio.title") : t("reader.preferences.title") }
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