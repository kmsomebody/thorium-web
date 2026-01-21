"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { defaultFontFamilyOptions, ThemeKeyType, useTheming } from "../../preferences";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";

import { StatefulReaderProps } from "../Epub/StatefulReader";

import { 
  ThActionsKeys, 
  ThLayoutUI,
  ThDocumentTitleFormat,
  ThProgressionFormat, 
  ThThemeKeys,
  ThLineHeightOptions,
  ThTextAlignOptions,
  ThSpacingSettingsKeys
} from "@/preferences/models/enums";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { I18nProvider } from "react-aria";
import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import {
  BasicTextSelection,
  FrameClickEvent,
} from "@readium/navigator-html-injectables";
import { IWebPubPreferences, TextAlignment, WebPubNavigatorListeners } from "@readium/navigator";
import { 
  Locator, 
  Manifest, 
  Publication, 
  Fetcher, 
  HttpFetcher, 
  ReadingProgression,
  Feature
} from "@readium/shared";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";
import { StatefulReaderFooter } from "../StatefulReaderFooter";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useWebPubNavigator } from "@/core/Hooks/WebPub";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useI18n } from "@/i18n/useI18n";
import { useTimeline } from "@/core/Hooks/useTimeline";
import { useLocalStorage } from "@/core/Hooks/useLocalStorage";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useSpacingPresets } from "../Settings/Spacing/hooks/useSpacingPresets";
import { useLineHeight } from "../Settings/Spacing/hooks/useLineHeight";

import { toggleActionOpen } from "@/lib/actionsReducer";
import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { 
  setBreakpoint, 
  setColorScheme, 
  setContrast, 
  setForcedColors, 
  setMonochrome, 
  setReducedMotion, 
  setReducedTransparency 
} from "@/lib/themeReducer";
import { 
  setLoading,
  setHovering, 
  toggleImmersive, 
  setPlatformModifier, 
  setDirection, 
  setFullscreen,
  setReaderProfile
} from "@/lib/readerReducer";
import { 
  setRTL, 
  setTimeline,
  setPublicationStart,
  setPublicationEnd,
  setHasDisplayTransformability
} from "@/lib/publicationReducer";

import classNames from "classnames";
import { createDefaultPlugin } from "../Plugins/helpers/createDefaultPlugin";
import Peripherals from "../../helpers/peripherals";
import { getPlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { propsToCSSVars } from "@/core/Helpers/propsToCSSVars";
import { getReaderClassNames } from "../Helpers/getReaderClassNames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface WebPubCSSSettings {
  fontFamily: keyof typeof defaultFontFamilyOptions | null;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineHeight: ThLineHeightOptions | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  textAlign: ThTextAlignOptions | null;
  textNormalization: boolean;
  wordSpacing: number | null;
  zoom: number;
}

export interface WebPubStatelessCache {
  settings: WebPubCSSSettings;
}

export const ExperimentalWebPubStatefulReader = ({
  rawManifest,
  selfHref,
  plugins
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
        <WebPubStatefulReaderInner rawManifest={ rawManifest } selfHref={ selfHref } />
      </ThPluginProvider>
    </>
  );
};

const WebPubStatefulReaderInner = ({ rawManifest, selfHref }: { rawManifest: object; selfHref: string }) => {

  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { getEffectiveSpacingValue } = useSpacingPresets();

  const [publication, setPublication] = useState<Publication | null>(null);

  const container = useRef<HTMLDivElement>(null);
  const localDataKey = useRef(`${selfHref}-current-location`);

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
  const theme = ThThemeKeys.light;
  const zoom = useAppSelector(state => state.webPubSettings.zoom);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const layoutUI = preferences.theming.layout.ui?.webPub || ThLayoutUI.stacked;

  // Init theming (breakpoints, theme, media queries…)
  useTheming<ThemeKeyType>({ 
    theme: theme,
    themeKeys: preferences.theming.themes.keys,
    systemKeys: preferences.theming.themes.systemThemes,
    breakpointsMap: preferences.theming.breakpoints,
    initProps: {
      ...propsToCSSVars(preferences.theming.arrow, { prefix: prefixString("arrow") }), 
      ...propsToCSSVars(preferences.theming.icon, { prefix: prefixString("icon") }),
      ...propsToCSSVars(preferences.theming.layout, { 
        prefix: prefixString("layout"),
        exclude: ["ui"]
      })
    },
    onBreakpointChange: (breakpoint) => dispatch(setBreakpoint(breakpoint)),
    onColorSchemeChange: (colorScheme) => dispatch(setColorScheme(colorScheme)),
    onContrastChange: (contrast) => dispatch(setContrast(contrast)),
    onForcedColorsChange: (forcedColors) => dispatch(setForcedColors(forcedColors)),
    onMonochromeChange: (isMonochrome) => dispatch(setMonochrome(isMonochrome)),
    onReducedMotionChange: (reducedMotion) => dispatch(setReducedMotion(reducedMotion)),
    onReducedTransparencyChange: (reducedTransparency) => dispatch(setReducedTransparency(reducedTransparency))
  });

  const dispatch = useAppDispatch();

  const onFsChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  const fs = useFullscreen(onFsChange);

  const webPubNavigator = useWebPubNavigator();
  const { 
    WebPubNavigatorLoad, 
    WebPubNavigatorDestroy,
    currentPositions,
    canGoBackward,
    canGoForward,
  } = webPubNavigator;

  const { setLocalData, getLocalData, localData } = useLocalStorage(localDataKey.current);

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

  useDocumentTitle(documentTitle);

  const cache = useRef<WebPubStatelessCache>({
    settings: {
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      hyphens: hyphens,
      letterSpacing: letterSpacing,
      lineHeight: lineHeight,
      paragraphIndent: paragraphIndent,
      paragraphSpacing: paragraphSpacing,
      publisherStyles: publisherStyles,
      textAlign: textAlign,
      textNormalization: textNormalization,
      wordSpacing: wordSpacing,
      zoom: zoom
    }
  });

  const toggleIsImmersive = useCallback(() => {
    // If tap/click in iframe, then header/footer no longer hoovering 
    dispatch(setHovering(false));
    dispatch(toggleImmersive());
  }, [dispatch]);

  const p = new Peripherals(useAppStore(), preferences.actions, {
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
  });

  const listeners: WebPubNavigatorListeners = {
    frameLoaded: async function (_wnd: Window): Promise<void> {
      p.observe(window);
    },
    positionChanged: async function (locator: Locator): Promise<void> {
      setLocalData(locator)

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
  };

  useEffect(() => {
    cache.current.settings.fontFamily = fontFamily;
  }, [fontFamily]);
  useEffect(() => {
    cache.current.settings.fontWeight = fontWeight;
  }, [fontWeight]);
  useEffect(() => {
    cache.current.settings.hyphens = hyphens;
  }, [hyphens]);
  useEffect(() => {
    cache.current.settings.letterSpacing = letterSpacing;
  }, [letterSpacing]);
  useEffect(() => {
    cache.current.settings.lineHeight = lineHeight;
  }, [lineHeight]);
  useEffect(() => {
    cache.current.settings.paragraphIndent = paragraphIndent;
  }, [paragraphIndent]);
  useEffect(() => {
    cache.current.settings.paragraphSpacing = paragraphSpacing;
  }, [paragraphSpacing]);
  useEffect(() => {
    cache.current.settings.textAlign = textAlign;
  }, [textAlign]);

  useEffect(() => {
    cache.current.settings.textNormalization = textNormalization;
  }, [textNormalization]);
  useEffect(() => {
    cache.current.settings.wordSpacing = wordSpacing;
  }, [wordSpacing]);
  useEffect(() => {
    cache.current.settings.zoom = zoom;
  }, [zoom]);

  useEffect(() => {
    preferences.direction && dispatch(setDirection(preferences.direction));
    dispatch(setPlatformModifier(getPlatformModifier()));
  }, [preferences.direction, dispatch]);

  useEffect(() => {
    const fetcher: Fetcher = new HttpFetcher(undefined, selfHref);
    const manifest = Manifest.deserialize(rawManifest)!;
    manifest.setSelfLink(selfHref);

    setPublication(new Publication({
      manifest: manifest,
      fetcher: fetcher
    }));

    dispatch(setReaderProfile("webPub"));
  }, [rawManifest, selfHref, dispatch]);

  useEffect(() => {
    if (!publication) return;

    dispatch(setRTL(publication.metadata.effectiveReadingProgression === ReadingProgression.rtl));

    const displayTransformability = publication.metadata.accessibility?.feature?.some(feature =>  feature && feature.value === Feature.DISPLAY_TRANSFORMABILITY.value);
    dispatch(setHasDisplayTransformability(displayTransformability));

    const initialPosition: Locator | null = getLocalData();

    const webPubPreferences: IWebPubPreferences = {
      zoom: cache.current.settings.zoom
    };

    if (displayTransformability) {
      webPubPreferences.fontFamily = cache.current.settings.fontFamily && defaultFontFamilyOptions[cache.current.settings.fontFamily];
      webPubPreferences.fontWeight = cache.current.settings.fontWeight;
      webPubPreferences.hyphens = cache.current.settings.hyphens;
      webPubPreferences.letterSpacing = cache.current.settings.letterSpacing;
      webPubPreferences.lineHeight = cache.current.settings.lineHeight === null 
        ? null 
        : lineHeightOptions[cache.current.settings.lineHeight];
      webPubPreferences.paragraphIndent = cache.current.settings.paragraphIndent;
      webPubPreferences.paragraphSpacing = cache.current.settings.paragraphSpacing;
      webPubPreferences.textAlign = cache.current.settings.textAlign as TextAlignment | null | undefined;
      webPubPreferences.textNormalization = cache.current.settings.textNormalization;
      webPubPreferences.wordSpacing = cache.current.settings.wordSpacing;
    }

    WebPubNavigatorLoad({
      container: container.current,
      publication: publication,
      listeners: listeners,
      initialPosition: initialPosition ? new Locator(initialPosition) : undefined,
      preferences: webPubPreferences,
      defaults: {
        experiments: preferences.experiments?.webPub || null
      }
    }, () => {
      p.observe(window);
    });

    dispatch(setLoading(false));

    return () => {
      WebPubNavigatorDestroy(() => {
        p.destroy();
      });
    };
  }, [publication, preferences]);

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