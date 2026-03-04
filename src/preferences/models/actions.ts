import { ThCollapsibility, ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThBreakpoints } from "./ui";

export type ThBottomSheetDetent = "content-height" | "full-height";

export interface ThActionsTokens {
  visibility: ThCollapsibilityVisibility;
  shortcut: string | null;
  sheet?: {
    defaultSheet: Exclude<ThSheetTypes, ThSheetTypes.dockedStart | ThSheetTypes.dockedEnd>;
    breakpoints: BreakpointsMap<ThSheetTypes>;
  };
  docked?: ThActionsDockedPref;
  snapped?: ThActionsSnappedPref;
};

export interface ThActionsDockedPref {
  dockable: ThDockingTypes,
  dragIndicator?: boolean,
  width?: number,
  minWidth?: number,
  maxWidth?: number
}

export interface ThActionsSnappedPref {
  scrim?: boolean | string;
  maxWidth?: number | null;
  maxHeight?: number | ThBottomSheetDetent;
  peekHeight?: number | ThBottomSheetDetent;
  minHeight?: number | ThBottomSheetDetent;
}

export interface ThDockingPref<T extends string> {
  displayOrder: T[];
  collapse: ThCollapsibility;
  dock: BreakpointsMap<ThDockingTypes> | boolean;
  keys: {
    [key in T]: Pick<ThActionsTokens, "visibility" | "shortcut">;
  }
};

export enum ThActionsKeys {
  fullscreen = "fullscreen",
  jumpToPosition = "jumpToPosition",
  settings = "settings",
  toc = "toc"
}

export enum ThDockingKeys {
  start = "dockingStart",
  end = "dockingEnd",
  transient = "dockingTransient"
}

export enum ThDockingTypes {
  none = "none",
  both = "both",
  start = "start",
  end = "end"
}

export enum ThSheetTypes {
  popover = "popover",
  fullscreen = "fullscreen",
  dockedStart = "docked start",
  dockedEnd = "docked end",
  bottomSheet = "bottomSheet"
}

export enum ThSheetHeaderVariant {
  close = "close",
  previous = "previous"
}

export const defaultActionKeysObject: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null
};

export const defaultSettingsAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null, // `${ UnstableShortcutMetaKeywords.shift }+${ ShortcutMetaKeywords.alt }+P`,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  docked: {
    dockable: ThDockingTypes.none,
    width: 340
  },
  snapped: {
    scrim: true,
    peekHeight: 50,
    minHeight: 30,
    maxHeight: 100
  }
};

export const defaultFullscreenAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null
}

export const defaultTocAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null, // `${ UnstableShortcutMetaKeywords.shift }+${ ShortcutMetaKeywords.alt }+T`,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.fullscreen,
      [ThBreakpoints.medium]: ThSheetTypes.fullscreen
    }
  },
  docked: {
    dockable: ThDockingTypes.both,
    dragIndicator: false,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  }
}

export const defaultJumpToPositionAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.overflow,
  shortcut: null, // `${ UnstableShortcutMetaKeywords.shift }+${ ShortcutMetaKeywords.alt }+J`,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  docked: {
    dockable: ThDockingTypes.none
  },
  snapped: {
    scrim: true,
    minHeight: "content-height"
  }
}