"use client";

import { useCallback, useMemo } from "react";
import { ActionStateObject } from "@/lib/actionsReducer";
import { ThDockingKeys } from "@/preferences/models";

export interface ThActionMap {
  [key: string | number | symbol]: ActionStateObject | undefined;
}

export const useActions = <K extends string | number | symbol>(actionMap: ThActionMap) => {
  const findOpen = useCallback(() => {
    const open: K[] = [];

    Object.entries(actionMap).forEach(([key, value]) => {
      if (value?.isOpen) open.push(key as K);
    });

    return open;
  }, [actionMap]);

  const anyOpen = useCallback(() => {
    return Object.values(actionMap).some((value) => value?.isOpen);
  }, [actionMap]);

  const isOpen = useCallback((key?: K | null) => {
    if (key) {
      if (actionMap[key]?.isOpen == null) {
        return false;
      } else {
        return actionMap[key]?.isOpen;
      }
    }
    return false;
  }, [actionMap]);

  const findDocked = useCallback(() => {
    const docked: K[] = [];

    Object.entries(actionMap).forEach(([key, value]) => {
      const docking = value?.docking;
      if (docking === ThDockingKeys.start || docking === ThDockingKeys.end) {
        docked.push(key as K);
      }
    });

    return docked;
  }, [actionMap]);

  const anyDocked = useCallback(() => {
    return Object.values(actionMap).some((value) => {
      const docking = value?.docking;
      return docking === ThDockingKeys.start || docking === ThDockingKeys.end;
    });
  }, [actionMap]);

  const isDocked = useCallback((key?: K | null) => {
    if (!key) return false;
    const docking = actionMap[key]?.docking;
    return docking === ThDockingKeys.start || docking === ThDockingKeys.end;
  }, [actionMap]);

  const whichDocked = useCallback((key?: K | null) => {
    return key ? actionMap[key]?.docking : null;
  }, [actionMap]);

  const getDockedWidth = useCallback((key?: K | null) => {
    return key ? actionMap[key]?.dockedWidth : undefined;
  }, [actionMap]);

  const everyOpenDocked = useCallback(() => {
    const opens = findOpen();

    return opens.every((key) => {
      return isDocked(key);
    });
  }, [findOpen, isDocked]);

  return useMemo(() => ({
    findOpen,
    anyOpen,
    isOpen,
    findDocked,
    anyDocked,
    isDocked,
    whichDocked,
    getDockedWidth,
    everyOpenDocked,
  }), [findOpen, anyOpen, isOpen, findDocked, anyDocked, isDocked, whichDocked, getDockedWidth, everyOpenDocked]);
};