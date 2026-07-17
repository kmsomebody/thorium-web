"use client";

import { useState, useRef, useCallback, useMemo, useLayoutEffect } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";

import { StatefulReaderProps } from "../Reader/StatefulReaderWrapper";

import {
  ThLayoutUI,
  ThDocumentTitleFormat,
  ThProgressionFormat, 
  ThSpacingSettingsKeys,
  ThSettingsKeys
} from "@/preferences/models";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import {
  BasicTextSelection,
  ContextMenuEvent,
  FrameClickEvent,
  SuspiciousActivityEvent,
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
import { useWebPubKeyboardPeripherals } from "./Hooks/useWebPubKeyboardPeripherals";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useI18n } from "@/i18n/useI18n";
import { useTimeline } from "@/core/Hooks/useTimeline";
import { usePositionStorage } from "@/hooks/usePositionStorage";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useSpacingPresets } from "../Settings/Spacing/hooks/useSpacingPresets";
import { useFonts } from "@/core/Hooks/fonts/useFonts";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
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
import { getReaderClassNames } from "../Helpers/getReaderClassNames";
import { resolveContentProtectionConfig } from "@/preferences/models/protection";
import { NavPeripheralType, fromActionPeripheralType } from "@/helpers/peripherals";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useZoomCallbacks } from "@/components/Settings/hooks/useZoomCallbacks";

export const ExperimentalWebPubStatefulReader = ({
  publication,
  localDataKey,
  plugins,
  positionStorage,
  containerRefSetter
}: StatefulReaderProps) => {
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  useLayoutEffect(() => {
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
        <StatefulReaderInner publication={ publication } localDataKey={ localDataKey } positionStorage={ positionStorage } containerRefSetter={ containerRefSetter } />
      </ThPluginProvider>
    </>
  );
};

const StatefulReaderInner = ({ publication, localDataKey, positionStorage, containerRefSetter }: { publication: Publication; localDataKey: string | null; positionStorage?: PositionStorage; containerRefSetter?: (el: Element | null) => void }) => {
  const { preferences, getFontMetadata, getFontInjectables } = usePreferences();
  const { t } = useI18n();
  const { getEffectiveSpacingValue } = useSpacingPresets();
  const { injectFontResources, removeFontResources } = useFonts();

  // Check if font family component is being used
  const { isComponentUsed: isFontFamilyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontFamily,
    publicationType: "webpub",
  });

  const container = useRef<HTMLDivElement>(null);

  const textAlign = useAppSelector(state => state.webPubSettings.textAlign);
  const fontFamily = useAppSelector(state => state.webPubSettings.fontFamily);
  const fontWeight = useAppSelector(state => state.webPubSettings.fontWeight);
  const hyphens = useAppSelector(state => state.webPubSettings.hyphens);
  const ligatures = useAppSelector(state => state.webPubSettings.ligatures);
  const noRuby = useAppSelector(state => state.webPubSettings.noRuby);
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
  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const containerBreakpoint = useAppSelector(state => state.theming.containerBreakpoint);

  const cache = useWebPubSettingsCache(
    fontFamily,
    fontWeight,
    hyphens,
    letterSpacing,
    ligatures,
    lineHeight,
    noRuby,
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
  const profile = useAppSelector(state => state.reader.profile);
  const keyboardPeripherals = useWebPubKeyboardPeripherals();

  const onFsChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  
  useFullscreen(onFsChange);

  const webPubNavigator = useWebPubNavigator();
  const { 
    currentPositions,
    canGoBackward,
    canGoForward,
  } = webPubNavigator;

  const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);

  const timeline = useTimeline({
    publication: publication,
    currentLocation: localData,
    currentPositions: currentPositions() || [],
    positionsList: undefined,
    onChange: (timeline) => {
      dispatch(setTimeline(timeline));
    }
  });

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

  const { zoomIn, zoomOut } = useZoomCallbacks(webPubNavigator);

  const listeners: WebPubNavigatorListeners = useMemo(() => ({
    frameLoaded: async function (_wnd: Window): Promise<void> {},
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
    contentProtection: function (_type: string, _data: SuspiciousActivityEvent): void {},
    contextMenu: function (_data: ContextMenuEvent): void {},
    peripheral: function (data): void {
      switch (data.type) {
        case NavPeripheralType.zoomIn:  zoomIn();  break;
        case NavPeripheralType.zoomOut: zoomOut(); break;
        default: {
          const actionKey = fromActionPeripheralType(data.type);
          if (actionKey && profile) dispatch(toggleActionOpen({ key: actionKey, profile }));
        }
      }
    },
  }), [setLocalData, canGoBackward, canGoForward, dispatch, toggleIsImmersive, zoomIn, zoomOut, profile]);

  const initialPosition = useMemo(() => getLocalData(), [getLocalData]);

  // Initialize reader using the new composite hook
  useWebPubReaderInit({
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
    contentProtectionConfig: resolveContentProtectionConfig(preferences.contentProtection, t),
    keyboardPeripherals,
    onNavigatorReady: () => {
      dispatch(setLoading(false));
    },
  });

  return (
    <>
    <NavigatorProvider visualNavigator={ webPubNavigator }>
      <main className={ readerStyles.main }>
        <StatefulDockingWrapper>
          <div
            ref={ containerRefSetter }
            className={
              classNames(
                getReaderClassNames({
                  isScroll: true,
                  isImmersive,
                  isHovering,
                  layoutUI,
                  breakpoint,
                  containerBreakpoint
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
  </>
)};