"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";

import { StatefulReaderProps } from "../Epub/StatefulReader";

import { 
  ThActionsKeys, 
  ThLayoutUI,
  ThDocumentTitleFormat,
  ThProgressionFormat, 
  ThSpacingSettingsKeys,
  ThSettingsKeys
} from "@/preferences/models";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { I18nProvider } from "react-aria";
import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import {
  BasicTextSelection,
  FrameClickEvent,
} from "@readium/navigator-html-injectables";
import { WebPubNavigatorListeners } from "@readium/navigator";
import { 
  Locator,  
  Publication
} from "@readium/shared";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";
import { StatefulReaderFooter } from "../StatefulReaderFooter";
import { PositionStorage } from "../Reader/StatefulReaderWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";
import { useWebPubNavigator } from "@/core/Hooks/WebPub";
import { useWebPubSettingsCache } from "@/core/Hooks/WebPub/useWebPubSettingsCache";
import { useWebPubReaderInit } from "./Hooks/useReaderInit";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useI18n } from "@/i18n/useI18n";
import { useTimeline } from "@/core/Hooks/useTimeline";
import { useLocalStorage } from "@/core/Hooks/useLocalStorage";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useSpacingPresets } from "../Settings/Spacing/hooks/useSpacingPresets";
import { useLineHeight } from "../Settings/Spacing/hooks/useLineHeight";
import { useFonts } from "@/core/Hooks/fonts/useFonts";

import { toggleActionOpen } from "@/lib/actionsReducer";
import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { 
  setLoading,
  setHovering, 
  toggleImmersive, 
  setFullscreen,
} from "@/lib/readerReducer";
import { 
  setTimeline,
  setPublicationStart,
  setPublicationEnd
} from "@/lib/publicationReducer";

import classNames from "classnames";
import { createDefaultPlugin } from "../Plugins/helpers/createDefaultPlugin";
import Peripherals from "../../helpers/peripherals";
import { getReaderClassNames } from "../Helpers/getReaderClassNames";
import { resolveContentProtectionConfig } from "@/preferences/models/protection";

export const ExperimentalWebPubStatefulReader = ({
  publication,
  localDataKey,
  plugins,
  positionStorage
}: StatefulReaderProps) => {
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  useEffect(() => {
    if (plugins && plugins.length > 0) {
      plugins.forEach(plugin => {
        ThPluginRegistry.register(plugin);
      });
    } else {
      ThPluginRegistry.register(createDefaultPlugin());
    }
    setPluginsRegistered(true);
  }, [plugins]);

  if (!pluginsRegistered) {
    return null;
  }

  return (
    <>
      <ThPluginProvider>
        <StatefulReaderInner publication={ publication } localDataKey={ localDataKey } positionStorage={ positionStorage } />
      </ThPluginProvider>
    </>
  );
};

const StatefulReaderInner = ({ publication, localDataKey, positionStorage }: { publication: Publication; localDataKey: string | null; positionStorage?: PositionStorage }) => {
  const { preferences, getFontMetadata, getFontInjectables } = usePreferences();
  const { t } = useI18n();
  const { getEffectiveSpacingValue } = useSpacingPresets();
  const { injectFontResources, removeFontResources } = useFonts();

  // Check if font family component is being used
  const { isComponentUsed: isFontFamilyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontFamily,
    publicationType: "webpub",
    componentType: "text"
  });

  const container = useRef<HTMLDivElement>(null);

  const textAlign = useAppSelector(state => state.webPubSettings.textAlign);
  const fontFamily = useAppSelector(state => state.webPubSettings.fontFamily);
  const fontWeight = useAppSelector(state => state.webPubSettings.fontWeight);
  const hyphens = useAppSelector(state => state.webPubSettings.hyphens);
  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);
  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);
  const paragraphIndent = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphIndent);
  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);
  const publisherStyles = useAppSelector(state => state.webPubSettings.publisherStyles);
  const textNormalization = useAppSelector(state => state.webPubSettings.textNormalization);
  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);
  const zoom = useAppSelector(state => state.webPubSettings.zoom);
  const fontLanguage = useAppSelector(state => state.publication.fontLanguage);
  const hasDisplayTransformability = useAppSelector(state => state.publication.hasDisplayTransformability);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const cache = useWebPubSettingsCache(
    fontFamily,
    fontWeight,
    hyphens,
    letterSpacing,
    lineHeight,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    textAlign,
    textNormalization,
    wordSpacing,
    zoom
  );

  const layoutUI = preferences.theming.layout.ui?.webPub || ThLayoutUI.stacked;

  const dispatch = useAppDispatch();

  const onFsChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  const fs = useFullscreen(onFsChange);

  const webPubNavigator = useWebPubNavigator();
  const { 
    currentPositions,
    canGoBackward,
    canGoForward,
  } = webPubNavigator;

  const localStorageData = useLocalStorage(localDataKey);
  const { setLocalData, getLocalData, localData } = positionStorage 
    ? {
        setLocalData: positionStorage.set,
        getLocalData: positionStorage.get,
        localData: positionStorage.get()
      }
    : localStorageData;

  const timeline = useTimeline({
    publication: publication,
    currentLocation: localData,
    currentPositions: currentPositions() || [],
    positionsList: undefined,
    onChange: (timeline) => {
      dispatch(setTimeline(timeline));
    }
  });

  const lineHeightOptions = useLineHeight();

  const documentTitleFormat = preferences.metadata?.documentTitle?.format;

  let documentTitle: string | undefined;

  if (documentTitleFormat) {
    if (typeof documentTitleFormat === "object" && "key" in documentTitleFormat) {
      const translatedTitle = t(documentTitleFormat.key);
      documentTitle = translatedTitle !== documentTitleFormat.key 
        ? translatedTitle 
        : documentTitleFormat.fallback;
    } else {
      switch (documentTitleFormat) {
        case ThDocumentTitleFormat.title:
          documentTitle = timeline?.title;
          break;
        case ThDocumentTitleFormat.chapter:
          documentTitle = timeline?.progression?.currentChapter;
          break;
        case ThDocumentTitleFormat.titleAndChapter:
          if (timeline?.title && timeline?.progression?.currentChapter) {
            documentTitle = `${ timeline.title } – ${ timeline.progression.currentChapter }`;
          }
          break;
        case ThDocumentTitleFormat.none:
          documentTitle = undefined;
          break;
        default: 
          documentTitle = documentTitleFormat;
          break;
      }
    }
  }

  //useDocumentTitle(documentTitle);

  const toggleIsImmersive = useCallback(() => {
    // If tap/click in iframe, then header/footer no longer hoovering 
    dispatch(setHovering(false));
    dispatch(toggleImmersive());
  }, [dispatch]);

  const appStore = useAppStore();

  const p = useMemo(() => new Peripherals(appStore, preferences.actions, {
    moveTo: () => {},
    goProgression: () => {},
    toggleAction: (actionKey) => {
      switch (actionKey) {
        case ThActionsKeys.fullscreen:
          fs.handleFullscreen();
          break;
        case ThActionsKeys.settings:
        case ThActionsKeys.toc:
          dispatch(toggleActionOpen({
            key: actionKey
          }))
          break;
        default:
          break
      }
    }
  }), [appStore, preferences.actions, fs, dispatch]);

  const listeners: WebPubNavigatorListeners = useMemo(() => ({
    frameLoaded: async function (_wnd: Window): Promise<void> {
      p.observe(window);
    },
    positionChanged: async function (locator: Locator): Promise<void> {
      setLocalData(locator);

      if (canGoBackward()) {
        dispatch(setPublicationStart(false));
      } else {
        dispatch(setPublicationStart(true));
      }

      if (canGoForward()) {
        dispatch(setPublicationEnd(false));
      } else {
        dispatch(setPublicationEnd(true));
      }
    },
    tap: function (_e: FrameClickEvent): boolean {
      toggleIsImmersive();
      return true;
    },
    click: function (_e: FrameClickEvent): boolean {
      return false;
    },
    zoom: function (_scale: number): void { },
    scroll: function (_delta: number): void { },
    customEvent: function (_key: string, _data: unknown): void { },
    handleLocator: function (locator: Locator): boolean {
      const href = locator.href;

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        if (confirm(`Open "${href}" ?`)) window.open(href, "_blank");
      } else {
        console.warn("Unhandled locator", locator);
      }
      return false;
    },
    textSelected: function (_selection: BasicTextSelection): void {},
    contentProtection: function (type: string, data: unknown) {/*TODO*/},
    contextMenu: function (_data: unknown) {/*TODO*/},
    peripheral: function (_data: unknown) {/*TODO*/}
  }), [p, setLocalData, canGoBackward, canGoForward, dispatch, toggleIsImmersive]);

  const initialPosition = useMemo(() => getLocalData(), [getLocalData]);

  // Initialize reader using the new composite hook
  const { navigatorReady } = useWebPubReaderInit({
    container,
    publication,
    initialPosition,
    listeners,
    preferences,
    cache,
    isFontFamilyUsed,
    fontLanguage,
    hasDisplayTransformability,
    getFontMetadata,
    injectFontResources,
    removeFontResources,
    getFontInjectables,
    lineHeightOptions,
    contentProtectionConfig: resolveContentProtectionConfig(preferences.contentProtection, t),
    onNavigatorReady: () => {
      dispatch(setLoading(false));
    },
    onNavigatorLoaded: () => {
      p.observe(window);
    },
    onCleanup: () => {
      p.destroy();
    },
  });

  return (
    <>
    <I18nProvider locale={ preferences.locale }>
    <NavigatorProvider navigator={ webPubNavigator }>
      <main className={ readerStyles.main }>
        <StatefulDockingWrapper>
          <div 
            className={ 
              classNames(
                getReaderClassNames({
                  isScroll: true,
                  isImmersive,
                  isHovering,
                  layoutUI
                })
              )
            }
          >
            <StatefulReaderHeader 
              actionKeys={ preferences.actions.webPubOrder }
              actionsOrder={ preferences.actions.webPubOrder }
              layout={ layoutUI } 
              runningHeadFormatPref={ preferences.theming.header?.runningHead?.format?.webPub }
            />

            <article className={ readerStyles.wrapper } aria-label={ t("reader.app.publicationWrapper") }>
              <div id="thorium-web-container" className={ readerStyles.iframeContainer } ref={ container }></div>
            </article>

          <StatefulReaderFooter 
            layout={ layoutUI } 
            progressionFormatPref={ preferences.theming.progression?.format?.webPub }
            progressionFormatFallback={ ThProgressionFormat.readingOrderIndex }
          />
        </div>
      </StatefulDockingWrapper>
    </main>
  </NavigatorProvider>
  </I18nProvider>
  </>
)};