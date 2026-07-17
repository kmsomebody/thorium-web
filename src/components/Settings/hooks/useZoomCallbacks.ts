import { useCallback } from "react";

import { ThSettingsKeys } from "@/preferences/models";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontSize } from "@/lib/settingsReducer";
import { setWebPubZoom } from "@/lib/webPubSettingsReducer";
import { useEffectiveRange } from "./useEffectiveRange";
import { EpubPreferencesEditor, IEpubPreferences, IWebPubPreferences, WebPubPreferencesEditor } from "@readium/navigator";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useWebPubNavigator } from "@/core/Hooks/WebPub/useWebPubNavigator";

type ZoomNavigator = ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator>;

export const useZoomCallbacks = (navigator: ZoomNavigator) => {
  const { preferences } = usePreferences();
  const readerProfile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const dispatch = useAppDispatch();

  const isWebPub = readerProfile === "webPub";

  const getSetting = navigator.getSetting as (key: string) => number | null | undefined;
  const submitPreferences = navigator.submitPreferences as (prefs: IEpubPreferences | IWebPubPreferences) => Promise<void>;
  const { preferencesEditor } = navigator;

  const supportedRange = isWebPub
    ? (preferencesEditor as WebPubPreferencesEditor)?.zoom?.supportedRange
    : isFXL
      ? (preferencesEditor as unknown as WebPubPreferencesEditor)?.zoom?.supportedRange
      : (preferencesEditor as EpubPreferencesEditor)?.fontSize?.supportedRange;

  const zoomConfig = preferences.settings.keys[ThSettingsKeys.zoom];
  const { range } = useEffectiveRange(zoomConfig.range, supportedRange);
  const [min, max] = range;
  const step = zoomConfig.step ?? 0.05;

  const zoomIn = useCallback(async () => {
    if (isWebPub) {
      const next = Math.min(max, (getSetting("zoom") ?? 1) + step);
      await submitPreferences({ zoom: next });
      dispatch(setWebPubZoom(getSetting("zoom")));
    } else {
      const next = Math.min(max, (getSetting("fontSize") ?? 1) + step);
      await submitPreferences({ fontSize: next });
      dispatch(setFontSize(getSetting("fontSize")));
    }
  }, [isWebPub, getSetting, max, step, submitPreferences, dispatch]);

  const zoomOut = useCallback(async () => {
    if (isWebPub) {
      const next = Math.max(min, (getSetting("zoom") ?? 1) - step);
      await submitPreferences({ zoom: next });
      dispatch(setWebPubZoom(getSetting("zoom")));
    } else {
      const next = Math.max(min, (getSetting("fontSize") ?? 1) - step);
      await submitPreferences({ fontSize: next });
      dispatch(setFontSize(getSetting("fontSize")));
    }
  }, [isWebPub, getSetting, min, step, submitPreferences, dispatch]);

  return { zoomIn, zoomOut };
};
