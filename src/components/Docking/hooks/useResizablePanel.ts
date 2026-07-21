"use client";

import { useCallback, useEffect, useState } from "react";

import { ThActionsDockedPref } from "@/preferences";

import { DockStateObject } from "@/lib/actionsReducer";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { usePrevious } from "@/core/Hooks/usePrevious";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";

import { useAppSelector } from "@/lib/hooks";

// TODO: Responsive.
// When resizing the window, all widths should be recalculated.
// There is no guarantee that the panel group is the same size as the window,
// so we have to rewrite this hook to observe the panel group, and push the new
// widths to the StatefulDockingWrapper so that it can update panels.
// Note that the StatefulDockingWrapper cannot pass PanelGroup as a ref,
// it requires using a utility method: getPanelGroupElement(id)
// See https://github.com/bvaughn/react-resizable-panels/tree/main/packages/react-resizable-panels#can-a-attach-a-ref-to-the-dom-elements
export const useResizablePanel = (panel: DockStateObject | undefined) => {
  const preferences = useActionsPreferences();
  const { theming } = useSharedPreferences();
  const defaultWidth = theming.layout.defaults.dockingWidth;
  const [pref, setPref] = useState<ThActionsDockedPref | null>(
    panel?.actionKey ? preferences.actionsKeys[panel.actionKey]?.docked || null : null
  );

  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actions = useActions(actionsMap || {});
  const previouslyCollapsed = usePrevious(panel?.collapsed);

  const previousWidth = actions.getDockedWidth(panel?.actionKey) || null;
  const width = pref?.width || defaultWidth;
  const minWidth = pref?.minWidth && pref.minWidth < width 
    ? pref.minWidth 
    : defaultWidth < width 
      ? defaultWidth
      : width;
  const maxWidth = pref?.maxWidth && pref.maxWidth > width 
    ? pref.maxWidth 
    : defaultWidth > width
      ? defaultWidth
      : width;

  const isPopulated = () => {
    return !!(panel?.active && actions.isOpen(panel?.actionKey));
  };

  const isCollapsed = () => {
    return !!panel?.collapsed;
  }

  const forceExpand = () => {
    return !!(isPopulated() && previouslyCollapsed && !panel?.collapsed);
  }

  const currentKey = () => {
    return panel?.actionKey ?? null;
  };

  const isResizable = () => {
    return isPopulated() ? Math.round(width) > Math.round(minWidth) && Math.round(width) < Math.round(maxWidth) : false;
  };

  const hasDragIndicator = () => {
    return pref?.dragIndicator || false;
  };

  const getWidth = useCallback(() => {
    return previousWidth 
        ? Math.round((previousWidth / window.innerWidth) * 100) 
        : Math.round((width / window.innerWidth) * 100);
  }, [previousWidth, width]);

  const getMinWidth = useCallback(() => {
    return Math.round((minWidth / window.innerWidth) * 100);
  }, [minWidth]);

  const getMaxWidth = useCallback(() => {
    return Math.round((maxWidth / window.innerWidth) * 100);
  }, [maxWidth]);

  const getCurrentPxWidth = useCallback((percentage: number) => {
    let current = Math.round((percentage * window.innerWidth) / 100);
    
    if (current < minWidth) {
      current = minWidth;
    }
    
    if (current > maxWidth) {
      current = maxWidth;
    }
    
    return current;
  }, [minWidth, maxWidth]);

  // When the docked action changes, we need to update its preferences 
  useEffect(() => {
    setPref(panel?.actionKey ? preferences.actionsKeys[panel.actionKey]?.docked || null : null);
  }, [panel?.actionKey, preferences]);

  return {
    currentKey, 
    isPopulated, 
    isCollapsed, 
    forceExpand, 
    isResizable,
    hasDragIndicator, 
    getWidth,
    getMinWidth,
    getMaxWidth,
    getCurrentPxWidth
  }
}