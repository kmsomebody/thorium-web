"use client";

import { useCallback, useEffect, useState } from "react";

import { ThBreakpoints } from "@/preferences/models";
import { BreakpointsMap } from "./useBreakpoints";

type ThBreakpointRange = {
  min: number | null;
  max: number | null;
};

const initRanges = (prefs: BreakpointsMap<number | null>) => {
  const ranges: Partial<Record<ThBreakpoints, ThBreakpointRange>> = {};

  let prev: null | number = null;

  Object.entries(prefs).forEach(([key, value]) => {
    if (value && !isNaN(value)) {
      const max = value;
      const min = prev ? prev + 1 : null;
      ranges[key as ThBreakpoints] = { min, max };
      prev = value;
    } else if (!value && key === ThBreakpoints.xLarge && prev) {
      ranges[key as ThBreakpoints] = { min: prev + 1, max: null };
    }
  });

  return ranges;
};

const resolveBreakpoint = (
  width: number,
  ranges: Partial<Record<ThBreakpoints, ThBreakpointRange>>
): ThBreakpoints | null => {
  for (const [key, range] of Object.entries(ranges) as [ThBreakpoints, ThBreakpointRange][]) {
    const { min, max } = range;
    if (min !== null && width < min) continue;
    if (max !== null && width > max) continue;
    return key;
  }
  return null;
};

export const useContainerBreakpoints = (
  map: BreakpointsMap<number | null>,
  onChange?: (breakpoint: ThBreakpoints | null) => void
): (el: Element | null) => void => {
  const [containerEl, setContainerEl] = useState<Element | null>(null);

  useEffect(() => {
    if (!containerEl) return;

    const ranges = initRanges(map);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      const breakpoint = resolveBreakpoint(width, ranges);
      onChange?.(breakpoint);
    });

    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl, map, onChange]);

  return useCallback((el: Element | null) => {
    setContainerEl(el);
  }, []);
};
