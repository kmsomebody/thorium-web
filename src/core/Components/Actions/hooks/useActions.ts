"use client";

import { ActionStateObject } from "@/lib/actionsReducer";
import { ThDockingKeys } from "@/preferences/models";

export interface ThActionMap {
  [key: string | number | symbol]: ActionStateObject | undefined;
}

export const useActions = <K extends string | number | symbol>(actionMap: ThActionMap) => {
  const findOpen = () => {
    const open: K[] = [];

    Object.entries(actionMap).forEach(([key, value]) => {
      if (value?.isOpen) open.push(key as K);
    });

    return open;
  };

  const anyOpen = () => {
    return Object.values(actionMap).some((value) => value?.isOpen);
  };

  const isOpen = (key?: K | null) => {
    if (key) {
      if (actionMap[key]?.isOpen == null) {
        return false;
      } else {
        return actionMap[key]?.isOpen;
      }
    }
    return false;
  };

  const findDocked = () => {
    const docked: K[] = [];

    Object.entries(actionMap).forEach(([key, value]) => {
      const docking = value?.docking;
      if (docking === ThDockingKeys.start || docking === ThDockingKeys.end) {
        docked.push(key as K);
      }
    });

    return docked;
  };

  const anyDocked = () => {
    return Object.values(actionMap).some((value) => {
      const docking = value?.docking;
      return docking === ThDockingKeys.start || docking === ThDockingKeys.end;
    });
  };

  const isDocked = (key?: K | null) => {
    if (!key) return false;
    const docking = actionMap[key]?.docking;
    return docking === ThDockingKeys.start || docking === ThDockingKeys.end;
  };

  const whichDocked = (key?: K | null) => {
    return key ? actionMap[key]?.docking : null;
  };

  const getDockedWidth = (key?: K | null) => {
    return key && actionMap[key]?.dockedWidth || undefined;
  };

  const everyOpenDocked = () => {
    const opens = findOpen();

    return opens.every((key) => {
      return isDocked(key);
    });
  };

  return {
    findOpen,
    anyOpen,
    isOpen,
    findDocked,
    anyDocked,
    isDocked,
    whichDocked,
    getDockedWidth,
    everyOpenDocked,
  };
};