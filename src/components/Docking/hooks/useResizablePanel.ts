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
  const defaultPanel: DockStateObject = {
    actionKey: null,
    active: false,
    collapsed: false
  };
  
  const safePanel = panel || defaultPanel;
  const preferences = useActionsPreferences();
  const { theming } = useSharedPreferences();
  const defaultWidth = theming.layout.defaults.dockingWidth;
  const [pref, setPref] = useState<ThActionsDockedPref | null>(
    safePanel.actionKey ? preferences.actionsKeys[safePanel.actionKey]?.docked || null : null
  );

  const actionsMap = useAppSelector(state => state.actions.keys);
  const actions = useActions(actionsMap);
  const previouslyCollapsed = usePrevious(safePanel.collapsed);

  const previousWidth = actions.getDockedWidth(safePanel.actionKey) || null;
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
    return safePanel.active && actions.isOpen(safePanel.actionKey);
  };

  const isCollapsed = () => {
    return safePanel.collapsed;
  }

  const forceExpand = () => {
    return !!(isPopulated() && previouslyCollapsed && !safePanel.collapsed);
  }

  const currentKey = () => {
    return safePanel.actionKey;
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
    setPref(safePanel.actionKey ? preferences.actionsKeys[safePanel.actionKey]?.docked || null : null);
  }, [safePanel.actionKey, preferences]);

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