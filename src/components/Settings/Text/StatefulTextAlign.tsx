"use client";

import { useCallback } from "react";

import { ThTextAlignOptions } from "@/preferences/models";
import { StatefulSettingsItemProps } from "../models/settings";
import { TextAlignment } from "@readium/navigator";

import BookIcon from "../assets/icons/book.svg";
import LeftAlignIcon from "./assets/icons/format_align_left.svg";
import RightAlignIcon from "./assets/icons/format_align_right.svg";
import JustifyIcon from "./assets/icons/format_align_justify.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setTextAlign, setHyphens } from "@/lib/settingsReducer";
import { setWebPubHyphens, setWebPubTextAlign } from "@/lib/webPubSettingsReducer";

export const StatefulTextAlign = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  
  const isRTL = useAppSelector(state => state.publication.isRTL);
  const textAlign = useAppSelector(state => isWebPub ? state.webPubSettings.textAlign : state.settings.textAlign) ?? ThTextAlignOptions.publisher;
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator();

  const items = [
    {
      id: ThTextAlignOptions.publisher,
      icon: BookIcon,
      label: t("reader.preferences.textAlign.default"), 
      value: ThTextAlignOptions.publisher 
    },
    {
      id: ThTextAlignOptions.start,
      icon: isRTL ? RightAlignIcon : LeftAlignIcon,
      label: isRTL ? t("reader.preferences.textAlign.right") : t("reader.preferences.textAlign.left"), 
      value: ThTextAlignOptions.start 
    },
    {
      id: ThTextAlignOptions.justify,
      icon: JustifyIcon,
      label: t("reader.preferences.textAlign.justify"), 
      value: ThTextAlignOptions.justify 
    }
  ];

  const updatePreference = useCallback(async (value: string) => {
    const textAlign: TextAlignment | null = value === ThTextAlignOptions.publisher 
      ? null 
      : value === ThTextAlignOptions.start 
        ? TextAlignment.start 
        : TextAlignment.justify;
    
    const currentHyphens = getSetting("hyphens") as boolean | undefined | null;
    
    const hyphens = textAlign === null 
      ? null 
      : (currentHyphens ?? textAlign === TextAlignment.justify);
    
      await submitPreferences({
        textAlign: textAlign,
        hyphens: hyphens
      });
      
      const textAlignSetting = getSetting("textAlign") as TextAlignment | null;
      const textAlignValue = textAlignSetting === null ? ThTextAlignOptions.publisher : textAlignSetting as unknown as ThTextAlignOptions;
      const effectiveHyphens = getSetting("hyphens");
      
      if (isWebPub) {
        dispatch(setWebPubTextAlign(textAlignValue));
        dispatch(setWebPubHyphens(effectiveHyphens));
      } else {
        dispatch(setTextAlign(textAlignValue));
        dispatch(setHyphens(effectiveHyphens));
      }
  }, [isWebPub, getSetting, submitPreferences, dispatch]);

  return (
    <>
    <StatefulRadioGroup 
      standalone={ standalone } 
      label={ t("reader.preferences.textAlign.title") }
      orientation="horizontal" 
      value={ textAlign } 
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  );
}