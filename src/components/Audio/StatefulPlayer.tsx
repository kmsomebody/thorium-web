"use client";

import { useLayoutEffect, useState, useMemo, useCallback } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import audioStyles from "./assets/styles/thorium-web.audioPlayer.module.css";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { I18nProvider } from "react-aria";
import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import { Publication } from "@readium/shared";
import { ContextMenuEvent, KeyboardEventData, SuspiciousActivityEvent } from "@readium/navigator-html-injectables";
import { AudioNavigatorListeners } from "@readium/navigator";
import { PositionStorage } from "../Reader/StatefulReaderWrapper";
import { ThLayoutUI, ThAudioPlayerComponent } from "@/preferences/models";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";

import { StatefulAudioCover } from "./StatefulAudioCover";
import { StatefulAudioPlaybackControls } from "./controls/StatefulAudioPlaybackControls";
import { StatefulAudioMediaControls } from "./controls/StatefulAudioMediaControls";
import { StatefulAudioProgressBar } from "./controls/StatefulAudioProgressBar";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePreferenceKeys } from "@/preferences/hooks/usePreferenceKeys";
import { useAudioNavigator } from "@/core/Hooks/Audio/useAudioNavigator";
import { useAudioSettingsCache } from "@/core/Hooks/Audio/useAudioSettingsCache";
import { useI18n } from "@/i18n/useI18n";
import { resolveAudioContentProtectionConfig } from "@/preferences/models/protection";
import { useTimeline } from "@/core/Hooks/useTimeline";
import { usePositionStorage } from "@/hooks/usePositionStorage";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useAudioPlayerInit } from "./Hooks/useAudioPlayerInit";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { 
  setLoading
} from "@/lib/readerReducer";
import {
  setTimeline,
  setPublicationStart,
  setPublicationEnd
} from "@/lib/publicationReducer";
import { setStatus, setSeeking, setStalled, setTrackReady, setSeekableRanges } from "@/lib/playerReducer";

import { createAudioDefaultPlugin } from "../Plugins/helpers/createAudioDefaultPlugin";
import { getReaderClassNames } from "../Helpers/getReaderClassNames";

export interface StatefulPlayerProps {
  publication: Publication;
  localDataKey: string | null;
  plugins?: any[];
  positionStorage?: PositionStorage;
  coverUrl?: string;
}

export const StatefulPlayer = ({
  publication,
  localDataKey,
  plugins,
  positionStorage,
  coverUrl
}: StatefulPlayerProps) => {
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  useLayoutEffect(() => {
    if (plugins && plugins.length > 0) {
      plugins.forEach(plugin => {
        ThPluginRegistry.register(plugin);
      });
    } else {
      ThPluginRegistry.register(createAudioDefaultPlugin());
    }
    setPluginsRegistered(true);
  }, [plugins]);

  if (!pluginsRegistered) {
    return null;
  }

  return (
    <>
      <ThPluginProvider>
        <StatefulPlayerInner publication={ publication } localDataKey={ localDataKey } positionStorage={ positionStorage } coverUrl={ coverUrl } />
      </ThPluginProvider>
    </>
  );
};

const StatefulPlayerInner = ({ publication, localDataKey, positionStorage, coverUrl }: { publication: Publication; localDataKey: string | null; positionStorage?: PositionStorage; coverUrl?: string }) => {
  const { preferences } = usePreferences();
  const { audioActionKeys } = usePreferenceKeys();
  const { t } = useI18n();

  const volume = useAppSelector(state => state.audioSettings.volume);
  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);
  const preservePitch = useAppSelector(state => state.audioSettings.preservePitch);
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);
  const skipForwardInterval = useAppSelector(state => state.audioSettings.skipForwardInterval);
  const pollInterval = useAppSelector(state => state.audioSettings.pollInterval);
  const autoPlay = useAppSelector(state => state.audioSettings.autoPlay);
  const enableMediaSession = useAppSelector(state => state.audioSettings.enableMediaSession);

  const cache = useAudioSettingsCache(
    volume,
    playbackRate,
    preservePitch,
    skipBackwardInterval,
    skipForwardInterval,
    pollInterval,
    autoPlay,
    enableMediaSession
  );

  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const dispatch = useAppDispatch();

  const audioNavigator = useAudioNavigator();
  const { 
    canGoBackward,
    canGoForward,
  } = audioNavigator;

  const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);

  const handleTimelineChange = useCallback((timeline: any) => {
    dispatch(setTimeline(timeline));
  }, [dispatch]);

  const emptyPositions = useMemo(() => [], []);

  const timeline = useTimeline({
    publication: publication,
    currentLocation: localData,
    currentPositions: emptyPositions,
    positionsList: undefined,
    onChange: handleTimelineChange,
  });

  const documentTitle = timeline?.title;

  useDocumentTitle(documentTitle);

  const listeners: AudioNavigatorListeners = useMemo(() => ({
    positionChanged: (locator) => {
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
    trackLoaded: () => {
      dispatch(setTrackReady(true));
      dispatch(setStalled(false));
      dispatch(setStatus("paused"));
    },
    trackEnded: () => {},
    metadataLoaded: () => {},
    play: () => {
      dispatch(setStatus("playing"));
    },
    pause: () => {
      dispatch(setStatus("paused"));
    },
    stalled: (isStalled) => {
      dispatch(setStalled(isStalled));
    },
    seeking: (isSeeking) => {
      dispatch(setSeeking(isSeeking));
    },
    seekable: (timeRanges) => {
      const ranges = [];
      for (let i = 0; i < timeRanges.length; i++) {
        ranges.push({ start: timeRanges.start(i), end: timeRanges.end(i) });
      }
      dispatch(setSeekableRanges(ranges));
    },
    error: (error, locator) => {
      console.error("[AudioNavigator] playback error", error, locator);
      dispatch(setStatus("paused"));
    },
    contentProtection: (_type: string, _detail: SuspiciousActivityEvent) => {},
    peripheral: (_data: KeyboardEventData) => {},
    contextMenu: (_data: ContextMenuEvent) => {}
  }), [setLocalData, canGoBackward, canGoForward, dispatch]);

  const initialPosition = useMemo(() => getLocalData(), [getLocalData]);

  const { navigatorReady } = useAudioPlayerInit({
    publication,
    initialPosition,
    listeners,
    preferences,
    cache,
    contentProtectionConfig: resolveAudioContentProtectionConfig(preferences.audioContentProtection, t),
    onNavigatorLoaded: () => dispatch(setLoading(false)),
  });

  const playerOrder = preferences.theming.layout.audio.order;

  const renderPlayerComponent = useCallback((component: ThAudioPlayerComponent) => {
    switch (component) {
      case ThAudioPlayerComponent.cover:
        return <StatefulAudioCover key={ component } coverUrl={ coverUrl } title={ publication?.metadata?.title?.getTranslation("en") } />;
      case ThAudioPlayerComponent.playbackControls:
        return <StatefulAudioPlaybackControls key={ component } />;
      case ThAudioPlayerComponent.progressBar:
        return <StatefulAudioProgressBar key={ component } currentChapter={ timeline?.progression?.currentChapter || t("reader.app.progression.referenceFallback") } />;
      case ThAudioPlayerComponent.mediaControls:
        return <StatefulAudioMediaControls key={ component } />;
    }
  }, [coverUrl, publication, timeline, t]);

  return (
    <>
    <I18nProvider locale={ preferences.locale }>
    <NavigatorProvider mediaNavigator={ audioNavigator }>
      <main className={ readerStyles.main }>
        <StatefulDockingWrapper>
          <div className={ getReaderClassNames({
            layoutUI: preferences.theming.layout?.ui?.audio || ThLayoutUI.stacked,
            isScroll: false,
            isImmersive,
            isHovering,
            isFXL: false,
          })}>
            <StatefulReaderHeader
              actionKeys={ audioActionKeys }
              actionsOrder={ preferences.actions.audioOrder }
              layout={ preferences.theming.layout?.ui?.audio || ThLayoutUI.stacked }
              runningHeadFormatPref={ preferences.theming.header?.runningHead?.format?.audio }
            />

            <article className={ audioStyles.audioPlayerWrapper } aria-label={ t("reader.app.publicationWrapper") }>
              { playerOrder.map(renderPlayerComponent) }
            </article>
          </div>
        </StatefulDockingWrapper>
      </main>
    </NavigatorProvider>
    </I18nProvider>
    </>
  );
};
