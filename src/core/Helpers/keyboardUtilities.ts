"use client";

import { isMacish } from "./getPlatform";

export interface UnstableKey {
  [key: string]: string;
  longform: string;
  shortform: string;
}

export interface UnstableMetaKey extends UnstableKey {
  modifier: "altKey" | "ctrlKey" | "metaKey" | "shiftKey";
  symbol: "⌥" | "^" | "⌘" | "⊞" | "⇧";
}

export interface UnstablePlatformModifier extends UnstableKey {
  modifier: "ctrlKey" | "metaKey";
  symbol: "^" | "⌘";
}

export interface UnstableMetaKeys {
  [key: string]: UnstableMetaKey;
  altKey: UnstableMetaKey;
  ctrlKey: UnstableMetaKey;
  metaKey: UnstableMetaKey;
  shiftKey: UnstableMetaKey;
}

export enum ShortcutRepresentation {
  symbol = "symbol",
  short = "shortform",
  long = "longform"
};

const altModifier: UnstableMetaKey = {
  longform: "Option",
  shortform: "Alt",
  modifier: "altKey",
  symbol: "⌥"
}

const ctrlModifier: UnstableMetaKey & UnstablePlatformModifier = {
  longform: "Control",
  shortform: "Ctrl",
  modifier: "ctrlKey",
  symbol: "^"
}

const metaModifierMac: UnstableMetaKey & UnstablePlatformModifier = {
  longform: "Command",
  shortform: "Cmd",
  modifier: "metaKey",
  symbol: "⌘"   
}

const metaModifierWin: UnstableMetaKey = {
  longform: "Windows",
  shortform: "Win",
  modifier: "metaKey",
  symbol: "⊞"
}

const shiftModifier: UnstableMetaKey = {
  longform: "Shift",
  shortform: "Shift",
  modifier: "shiftKey",
  symbol: "⇧"
}

export const metaKeys: UnstableMetaKeys = {
  altKey: altModifier,
  ctrlKey: ctrlModifier,
  metaKey: isMacish() ? metaModifierMac : metaModifierWin,
  shiftKey: shiftModifier
}

// Platform modifier differs from Mac to Windows so we have to get it dynamically

export const defaultPlatformModifier = ctrlModifier;

export const getPlatformModifier = (): UnstablePlatformModifier => {
  if (isMacish()) {
    return metaModifierMac;
  } else {
    return ctrlModifier;
  }
}