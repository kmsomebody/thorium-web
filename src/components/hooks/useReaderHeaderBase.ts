"use client";

import { useCallback, useEffect, useMemo, useRef, HTMLAttributes } from "react";

import { ThActionsKeys } from "@/preferences/models";

import { ThActionEntry } from "@/core/Components/Actions/ThActionsBar";
import { usePlugins } from "../Plugins/PluginProvider";
import { useActions } from "@/core/Components";
import { useI18n } from "@/i18n/useI18n";
import { useFocusWithin } from "react-aria";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useIsScroll } from "@/hooks";

import { isPositionsListValid } from "../Actions/JumpToPosition/helpers/utils";
import { isIOSish } from "@/core/Helpers/getPlatform";

export const useReaderHeaderBase = (actionKeys: string[]) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { actionsComponentsMap } = usePlugins();

  const overflowMap = useAppSelector(state => state.actions.overflow);
  const isScroll = useIsScroll();
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);
  const hasScrollAffordance = useAppSelector(state => state.reader.hasScrollAffordance);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const profile = useAppSelector(state => state.reader.profile);

  const profileActionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const mergedActionsMap = useMemo(() => ({ ...profileActionsMap, ...overflowMap }), [profileActionsMap, overflowMap]);
  const actions = useActions(mergedActionsMap);
  const dispatch = useAppDispatch();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin() {
      dispatch(setHovering(true));
    },
    onBlurWithin() {
      if (actions.everyOpenDocked()) {
        dispatch(setHovering(false));
      }
    }
  });

  const setHover = () => {
    if (!hasScrollAffordance && actions.everyOpenDocked()) {
      dispatch(setHovering(true));
    }
  };

  const removeHover = () => {
    if (!hasScrollAffordance && actions.everyOpenDocked()) {
      dispatch(setHovering(false));
    }
  };

  const listActionItems = useCallback(() => {
    const actionsItems: ThActionEntry<string>[] = [];

    if (actionsComponentsMap && Object.keys(actionsComponentsMap).length > 0) {
      actionKeys.forEach((key) => {
        if (actionsComponentsMap[key]) {
          actionsItems.push({
            Trigger: actionsComponentsMap[key].Trigger,
            Target: actionsComponentsMap[key].Target,
            key: key
          });
        } else {
          console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
        }
      });
    }

    return actionsItems.filter(item => {
      if (item.key === ThActionsKeys.jumpToPosition) {
        return isPositionsListValid(positionsList);
      }
      if (item.key === ThActionsKeys.fullscreen) {
        return document.fullscreenEnabled && !isIOSish();
      }
      return true;
    });
  }, [actionKeys, actionsComponentsMap, positionsList]);

  useEffect(() => {
    if (isImmersive) {
      const focusElement = document.activeElement;
      if (focusElement && headerRef.current?.contains(focusElement)) {
        (focusElement as HTMLElement).blur();
      }
    }
  }, [isImmersive]);

  return {
    headerRef,
    focusWithinProps: focusWithinProps as HTMLAttributes<HTMLElement>,
    setHover,
    removeHover,
    listActionItems,
    isImmersive,
    isHovering,
    isScroll,
    t,
  };
};
