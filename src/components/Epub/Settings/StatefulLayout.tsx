"use client";

import { useCallback } from "react";

import { ThLayoutOptions, ThSettingsKeys } from "@/preferences/models";
import { SETTINGS_KEY_TO_PREFERENCE } from "../../Settings/helpers/settingsKeyMapping";

import ScrollableIcon from "./assets/icons/contract.svg";
import PaginatedIcon from "./assets/icons/docs.svg";

import { StatefulRadioGroup } from "../../Settings/StatefulRadioGroup";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setScroll } from "@/lib/settingsReducer";
import { useIsScroll } from "@/hooks";

export const StatefulLayout = () => {
  const { t } = useI18n();
  const isScroll = useIsScroll();

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const items = [
    {
      id: ThLayoutOptions.paginated,
      icon: PaginatedIcon,
      label: t("reader.preferences.layout.paginated"),
      value: ThLayoutOptions.paginated
    },
    {
      id: ThLayoutOptions.scroll,
      icon: ScrollableIcon,
      label: t("reader.preferences.layout.scrolled"),
      value: ThLayoutOptions.scroll
    }
  ];

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.layout];

  const updatePreference = useCallback(async (value: string) => {
    const derivedValue = value === ThLayoutOptions.scroll;
    await submitPreferences({ [prefKey]: derivedValue });
    dispatch(setScroll(getSetting(prefKey)));
  }, [prefKey, submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ true }
      label={ t("reader.preferences.layout.title") }
      orientation="horizontal"
      value={ isScroll ? ThLayoutOptions.scroll : ThLayoutOptions.paginated }
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  )
}