"use client";

import { CSSProperties, Key, useCallback, useRef } from "react";

import { StatefulSettingsItemProps } from "../models/settings";

import settingsStyles from "../assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { FontDefinition } from "@/preferences/models";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontFamily } from "@/lib/settingsReducer";
import { setWebPubFontFamily } from "@/lib/webPubSettingsReducer";

export const StatefulFontFamily = ({ standalone = true }: StatefulSettingsItemProps & { publicationLanguage?: string }) => {
  const { getFontMetadata, getFontsList } = usePreferences();
  const { t } = useI18n();

  const getFontFamilyLabel = useCallback((font: FontDefinition): string => {
    // Handle i18n label if present
    if (font.label) {
      if (typeof font.label === "string") {
        return t(font.label, { defaultValue: font.label || font.name });
      } else if (typeof font.label === "object" && "key" in font.label) {
        return t(font.label.key, { 
          defaultValue: font.label.fallback || font.name 
        });
      }
    }

    // Fall back to the font's name
    return font.name;
  }, [t]);

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const fontLanguage = useAppSelector(state => state.publication.fontLanguage) || "default";

  // Get language-specific font preferences
  const fontPreferences = getFontsList({ language: fontLanguage });

  const fontFamily = useAppSelector(state => {
    const fontSettings = isWebPub ? state.webPubSettings.fontFamily : state.settings.fontFamily;
    return fontSettings[fontLanguage] ?? "publisher";
  });
  
  // Check if current font exists in available options, fallback to publisher if not
  const availableFontIds = new Set([
    "publisher",
    ...Object.keys(fontPreferences)
  ]);
  const currentFontFamily = availableFontIds.has(fontFamily) ? fontFamily : "publisher";

  const fontFamilyOptions = useRef([
    {
      id: "publisher",
      label: t("reader.preferences.fontFamily.publisher"),
      value: null
    },
    ...Object.entries(fontPreferences).map(([id, font]) => {
      const metadata = getFontMetadata(id);
      return {
        id,
        label: getFontFamilyLabel(font),
        value: metadata.fontStack || metadata.fontFamily
      };
    })
  ]);

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator();

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!key || key === fontFamily) return;

    const selectedOption = fontFamilyOptions.current.find((option) => option.id === key) as {
      id: keyof ReturnType<typeof getFontsList> | "publisher";
      label: string;
      value: string | null;
    };
    
    if (selectedOption) {
      await submitPreferences({ fontFamily: selectedOption.value });
      
      const currentSetting = getSetting("fontFamily");
      
      // Handle publisher font case (when currentSetting is null)
      if (currentSetting === null) {
        if (isWebPub) {
          dispatch(setWebPubFontFamily({ key: fontLanguage, value: "publisher" }));
        } else {
          dispatch(setFontFamily({ key: fontLanguage, value: "publisher" }));
        }
        return;
      }
      
      // Handle other font cases
      const entry = Object.entries(fontPreferences).find(([id]) => {
        const metadata = getFontMetadata(id);
        return metadata.fontStack === currentSetting || 
               metadata.fontFamily === currentSetting;
      });
      
      if (entry) {
        const [selectedOptionId] = entry;
        if (isWebPub) {
          dispatch(setWebPubFontFamily({ key: fontLanguage, value: selectedOptionId }));
        } else {
          dispatch(setFontFamily({ key: fontLanguage, value: selectedOptionId }));
        }
      }
    }
  }, [isWebPub, fontLanguage, fontFamily, submitPreferences, getSetting, fontPreferences, getFontMetadata, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("reader.preferences.fontFamily.title") }
      selectedKey={ currentFontFamily }
      onSelectionChange={ async (key) => await updatePreference(key) }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ fontFamilyOptions.current }
          >
            { (item) => (
              <ListBoxItem
                className={ settingsStyles.dropdownListboxItem }
                id={ item.id }
                key={ item.id }
                textValue={ item.value || undefined }
                style={{ fontFamily: item.value || undefined } as CSSProperties}
              >
                { item.label }
              </ListBoxItem>
            )}
          </ListBox>
        )
      }}
    />
  )
}