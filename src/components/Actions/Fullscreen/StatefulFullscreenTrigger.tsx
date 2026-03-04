"use client";

import { useCallback } from "react";

import { ThActionsKeys } from "@/preferences/models";
import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import readerSharedUI from "../../assets/styles/thorium-web.button.module.css";

import FullscreenCorners from "./assets/icons/fullscreen.svg";
import FullscreenExit from "./assets/icons/fullscreen_exit.svg";

import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";
import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setFullscreen, setHovering } from "@/lib/readerReducer";
import { isIOSish } from "@/core/Helpers/getPlatform";

export const StatefulFullscreenTrigger = ({ variant }: StatefulActionTriggerProps) => {
  // Note: Not using React Aria ToggleButton here as fullscreen is quite
  // difficult to control in isolation due to collapsibility + shortcuts

  const { preferences } = usePreferences();
  const { t } = useI18n();

  const dispatch = useAppDispatch();
  const onChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  
  const fs = useFullscreen(onChange);

  const label = fs.isFullscreen ? t("reader.fullscreen.close") : t("reader.fullscreen.trigger");
  const Icon = fs.isFullscreen ? FullscreenExit : FullscreenCorners;

  const handlePress = () => {
    fs.handleFullscreen();
    // Has to be dispatched manually, otherwise stays true… 
    dispatch(setHovering(false));
    // TODO: fix hover state on exit, if even possible w/o a lot of getting around…
  };

  // Per React doc/principles this isn’t common but FullScreen is quite an edge case cos’ of iPadOS…
  // And Actions is still a work in progress, with opportunities to rewrite/refactor
  // Note we don’t check window.matchMedia("(display-mode: standalone)").matches as this is not a PWA yet
  // And more values here: https://web.dev/learn/pwa/detection
  if (!document.fullscreenEnabled || isIOSish()) return null;

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ label }
          SVGIcon={ Icon } 
          shortcut={ preferences.actions.keys[ThActionsKeys.fullscreen].shortcut }
          onAction={ fs.handleFullscreen } 
          id={ ThActionsKeys.fullscreen }
        />
      : <StatefulActionIcon 
          className={ readerSharedUI.iconCompSm }
          visibility={ preferences.actions.keys[ThActionsKeys.fullscreen].visibility }  
          aria-label={ label }
          placement="bottom" 
          tooltipLabel={ t("reader.fullscreen.tooltip") } 
          onPress={ handlePress } 
        >
          <Icon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    } 
    </>
  )
}