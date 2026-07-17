"use client";

import { KeyCombo } from "@readium/navigator-html-injectables";
import { I18nValue } from "@/preferences/models/i18n";

import { Keyboard } from "react-aria-components";

import { ShortcutRepresentation, metaKeys, UnstablePlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { ThShortcutConfig } from "@/preferences/models/actions";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

const DIGIT_OFFSET = 48;
const F_KEY_OFFSET = 112;

const resolveKeyLabel = (keyCode: number, label: I18nValue<string> | undefined, t: (key: string, options?: any) => string): string => {
  if (label !== undefined) {
    if (typeof label === "string") return label;
    return t(label.key, { defaultValue: label.fallback });
  }

  if (keyCode >= 65 && keyCode <= 90) return String.fromCharCode(keyCode);
  if (keyCode >= DIGIT_OFFSET && keyCode <= 57) return String.fromCharCode(keyCode);
  if (keyCode >= F_KEY_OFFSET && keyCode <= 123) return `F${keyCode - F_KEY_OFFSET + 1}`;

  return "";
};

const pickCombo = (keyCombos: KeyCombo[], platformModifier: UnstablePlatformModifier): KeyCombo => {
  if (keyCombos.length === 1) return keyCombos[0];

  const wantsCtrl = platformModifier.modifier === "ctrlKey";
  const preferred = keyCombos.find(c => wantsCtrl ? c.ctrl : c.meta);
  return preferred ?? keyCombos[0];
};

export interface StatefulShortcutProps {
  className?: string;
  combo: ThShortcutConfig;
  representation?: ShortcutRepresentation;
  joiner?: string;
}

export const StatefulShortcut = ({
  className,
  combo,
  representation,
  joiner
}: StatefulShortcutProps) => {
  const { shortcuts } = useSharedPreferences();
  const platformModifier = useAppSelector(state => state.reader.platformModifier);
  const { t } = useI18n();

  const rep = representation ?? shortcuts.representation ?? ShortcutRepresentation.symbol;
  const sep = joiner ?? shortcuts.joiner ?? " + ";

  const { keyCombos, label } = combo;
  if (!keyCombos.length) return <></>;

  const chosen = pickCombo(keyCombos, platformModifier);
  const parts: string[] = [];

  if (chosen.ctrl)  parts.push(metaKeys.ctrlKey[rep]);
  if (chosen.alt)   parts.push(metaKeys.altKey[rep]);
  if (chosen.shift) parts.push(metaKeys.shiftKey[rep]);
  if (chosen.meta)  parts.push(metaKeys.metaKey[rep]);

  const keyLabel = resolveKeyLabel(chosen.keyCode, label, t);
  if (keyLabel) parts.push(keyLabel);

  if (!parts.length) return <></>;

  return (
    <Keyboard className={ className }>{ parts.join(sep) }</Keyboard>
  );
};
