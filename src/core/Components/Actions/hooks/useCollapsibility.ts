"use client";

import { RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ThActionEntry } from "../ThActionsBar";

export type ThCollapsibility = boolean | Record<string, number | "all">;

export enum ThCollapsibilityVisibility {
  always = "always",
  partially = "partially",
  overflow = "overflow"
}

export interface CollapsiblePref {
  displayOrder: string[];
  collapse: ThCollapsibility;
  keys: {
    [key: string]: {
      [key: string]: any;
      visibility: ThCollapsibilityVisibility;
    };
  }
}

export const useCollapsibility = (
  items: ThActionEntry<string>[],
  prefs: CollapsiblePref,
  breakpoint?: string,
  containerRef?: RefObject<HTMLElement | null>
) => {
  const isSpaceFit = prefs.collapse === true;

  // --- Space-fit mode (collapse: true) ---
  // How many `partially` items currently fit in the bar.
  // MAX_SAFE_INTEGER = "assume all fit" — corrected by useLayoutEffect before first paint.
  const [partialInBar, setPartialInBar] = useState<number>(Number.MAX_SAFE_INTEGER);
  const lastCountRef = useRef<number>(Number.MAX_SAFE_INTEGER);

  // Ghost element tracking — spans wrapping each item in the hidden measurement clone.
  // The ghost always renders all items, so widths are stable regardless of bar state.
  const keyToElement = useRef(new Map<string, HTMLElement>());
  const itemWidthsRef = useRef(new Map<string, number>());

  // Inputs for computeLayout, kept in refs so the function is stable
  const alwaysKeysRef = useRef<string[]>([]);
  const orderedPartialKeysRef = useRef<string[]>([]);
  const hasOverflowRef = useRef<boolean>(false);
  const columnGapRef = useRef<number>(0);

  // Shared rAF handle — both ResizeObservers dequeue into the same frame slot.
  const rafIdRef = useRef<number | null>(null);

  // Tracks the last spec so categorization is skipped when nothing meaningful changed.
  const specRef = useRef<string>("");

  // computeLayout reads only refs — no closure over props, truly stable.
  // Called from remeasureAndCompute after fresh DOM reads.
  const computeLayout = useCallback((containerWidth: number) => {
    if (!containerWidth) return;

    const widths = itemWidthsRef.current;
    const alwaysKeys = alwaysKeysRef.current;
    const partialKeys = orderedPartialKeysRef.current;
    const gap = columnGapRef.current;

    const N_a = alwaysKeys.length;
    const alwaysTotal = alwaysKeys.reduce((s, k) => s + (widths.get(k) ?? 0), 0);
    const partialWidths = partialKeys.map(k => widths.get(k) ?? 0);
    const partialTotal = partialWidths.reduce((s, w) => s + w, 0);

    let newCount: number;

    // Check if everything fits without an overflow menu trigger
    const noMenuTotal = alwaysTotal + partialTotal + gap * Math.max(0, N_a + partialKeys.length - 1);
    if (!hasOverflowRef.current && noMenuTotal <= containerWidth) {
      newCount = partialKeys.length;
    } else {
      // Need the overflow menu trigger — use first measured width as proxy
      // (all icon buttons are the same size)
      const menuW = widths.values().next().value ?? 0;
      if (!menuW) return;

      let count = 0, usedPartial = 0;
      for (const w of partialWidths) {
        // Items in bar at this step: N_a always + count partial + 1 new partial + 1 menu trigger
        const totalGap = gap * Math.max(0, N_a + count + 1);
        if (alwaysTotal + usedPartial + w + menuW + totalGap <= containerWidth) {
          usedPartial += w;
          count++;
        } else {
          break;
        }
      }
      newCount = count;
    }

    if (newCount !== lastCountRef.current) {
      lastCountRef.current = newCount;
      setPartialInBar(newCount);
    }
  }, []);

  // Re-measures all ghost item widths and the container gap, then calls computeLayout.
  // getBoundingClientRect and getComputedStyle are cheap when called from a rAF callback
  // or useLayoutEffect (layout is already computed by the browser at those points).
  // Passing containerWidth avoids a second getBoundingClientRect on the container when
  // the caller already has it (e.g. from ResizeObserver contentRect).
  const remeasureAndCompute = useCallback((containerWidth?: number) => {
    if (!containerRef?.current) return;
    for (const [key, el] of keyToElement.current) {
      itemWidthsRef.current.set(key, el.getBoundingClientRect().width);
    }
    columnGapRef.current = parseFloat(getComputedStyle(containerRef.current).columnGap) || 0;
    computeLayout(containerWidth ?? containerRef.current.getBoundingClientRect().width);
  }, [containerRef, computeLayout]);

  // Kept in a ref so the ghost observer's rAF closure is always current
  // without the observer needing to re-subscribe when the function identity changes.
  const remeasureAndComputeRef = useRef(remeasureAndCompute);
  useLayoutEffect(() => { remeasureAndComputeRef.current = remeasureAndCompute; }, [remeasureAndCompute]);

  // Categorize items by visibility and do initial measurement before first paint.
  // useLayoutEffect runs synchronously after DOM mutations — so the initial
  // correction happens before the user sees anything.
  // The spec guard skips the effect when items/prefs object references are unstable
  // but nothing meaningful changed, UNLESS widths haven't been populated yet
  // (ghost elements not yet measured on first mount).
  useLayoutEffect(() => {
    if (!isSpaceFit || !containerRef?.current) return;

    const spec = items.map(i => `${i.key}:${prefs.keys[i.key]?.visibility ?? ""}`).join(",");
    const widthsMissing = items.some(i => !(itemWidthsRef.current.get(i.key) ?? 0));
    if (spec === specRef.current && !widthsMissing) return;
    specRef.current = spec;

    const always: string[] = [], partial: string[] = [];
    let hasOverflow = false;

    for (const item of items) {
      const v = prefs.keys[item.key]?.visibility;
      if (v === ThCollapsibilityVisibility.overflow) hasOverflow = true;
      else if (v === ThCollapsibilityVisibility.always) always.push(item.key);
      else partial.push(item.key);
    }

    alwaysKeysRef.current = always;
    orderedPartialKeysRef.current = partial;
    hasOverflowRef.current = hasOverflow;

    remeasureAndCompute(containerRef.current.getBoundingClientRect().width);
  }, [isSpaceFit, items, prefs, containerRef, remeasureAndCompute]);

  // Container ResizeObserver — fires when the container width changes.
  // Batched via rAF so we compute at most once per frame, not once per pixel.
  // Re-measures item widths each time so icon size changes (e.g. zoom) that also
  // cause a container reflow are picked up automatically.
  useEffect(() => {
    if (!isSpaceFit || !containerRef?.current) return;

    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w === undefined) return;

      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        remeasureAndCompute(w);
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isSpaceFit, containerRef, remeasureAndCompute]);

  // Ghost wrapper ResizeObserver — fires when icon sizes change independently of
  // container width (e.g. app-level zoom on a fixed-width container).
  // Implemented as a callback ref so the observer is set up directly on mount
  // without a separate state variable or useEffect dependency on a mutable ref.
  const ghostObserverRef = useRef<ResizeObserver | null>(null);
  const getGhostRef = useCallback((el: HTMLDivElement | null) => {
    ghostObserverRef.current?.disconnect();
    ghostObserverRef.current = null;
    if (el && isSpaceFit) {
      const observer = new ResizeObserver(() => {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          remeasureAndComputeRef.current();
        });
      });
      observer.observe(el);
      ghostObserverRef.current = observer;
    }
  }, [isSpaceFit]);

  // Ref callback factory — attaches to ghost spans for width measurement.
  // Harmless noop in other modes.
  const getItemRef = useCallback((key: string) => (el: HTMLElement | null) => {
    if (el) {
      keyToElement.current.set(key, el);
    } else {
      keyToElement.current.delete(key);
      itemWidthsRef.current.delete(key);
    }
  }, []);

  // --- Triage ---

  const [actionIcons, menuItems] = useMemo(() => {
    const actionIcons: ThActionEntry<string>[] = [];
    const menuItems: ThActionEntry<string>[] = [];

    if (!prefs.collapse) {
      items.forEach((item) => actionIcons.push(item));
      return [actionIcons, menuItems];
    }

    if (prefs.collapse === true) {
      // Build the set of partial keys that fit in the bar (first N in displayOrder)
      const barPartialSet = new Set<string>();
      let partialCount = 0;
      for (const item of items) {
        if (prefs.keys[item.key]?.visibility === ThCollapsibilityVisibility.partially) {
          if (partialCount < partialInBar) {
            barPartialSet.add(item.key);
            partialCount++;
          }
        }
      }

      for (const item of items) {
        const v = prefs.keys[item.key]?.visibility;
        if (v === ThCollapsibilityVisibility.overflow || (v === ThCollapsibilityVisibility.partially && !barPartialSet.has(item.key))) {
          menuItems.push(item);
        } else {
          actionIcons.push(item);
        }
      }

      return [actionIcons, menuItems];
    }

    // collapse: Record — breakpoint-based triage (existing logic)
    let countdown: number = 0;

    if (breakpoint) {
      const prefForBreakpoint = prefs.collapse[breakpoint];
      if (prefForBreakpoint) {
        // `always` items are never collapsed, so count only partially + overflow items
        const partialCount = items.filter(i => prefs.keys[i.key]?.visibility === ThCollapsibilityVisibility.partially).length;
        const overflowCount = items.filter(i => prefs.keys[i.key]?.visibility === ThCollapsibilityVisibility.overflow).length;
        const collapsibleCount = partialCount + overflowCount;

        if (prefForBreakpoint === "all") {
          countdown = overflowCount;
        } else if (!isNaN(prefForBreakpoint)) {
          countdown = Math.max(0, collapsibleCount - (prefForBreakpoint - 1));
        }
      }
    }

    // Creating a shallow copy so that actionsOrder doesn't mutate between rerenders
    [...items].reverse().forEach((item) => {
      const actionPref = prefs.keys[item.key];
      if (actionPref.visibility === ThCollapsibilityVisibility.overflow) {
        menuItems.unshift(item);
        --countdown;
      } else if (actionPref.visibility === ThCollapsibilityVisibility.partially) {
        if (countdown > 0) {
          menuItems.unshift(item);
          --countdown;
        } else {
          actionIcons.unshift(item);
        }
      } else {
        actionIcons.unshift(item);
      }
    });

    return [actionIcons, menuItems];
  }, [items, prefs, breakpoint, partialInBar]);

  return { ActionIcons: actionIcons, MenuItems: menuItems, getItemRef, getGhostRef };
}
