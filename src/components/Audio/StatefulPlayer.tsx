"use client";

import { useLayoutEffect, useState, useMemo, useCallback, useRef, useEffect } from "react";

import audioLayoutStyles from "./assets/styles/thorium-web.audio.app.module.css";
import audioStyles from "./assets/styles/thorium-web.audioPlayer.module.css";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import { Publication } from "@readium/shared";
import { ContextMenuEvent, KeyboardEventData, SuspiciousActivityEvent } from "@readium/navigator-html-injectables";
import { AudioNavigatorListeners } from "@readium/navigator";
import { PositionStorage } from "../Reader/StatefulReaderWrapper";
import { ThAudioPlayerComponent } from "@/preferences/models";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulPlayerHeader } from "./StatefulPlayerHeader";

import { StatefulAudioCover } from "./StatefulAudioCover";
import { StatefulAudioMetadata } from "./StatefulAudioMetadata";
import { StatefulAudioPlaybackControls } from "./controls/StatefulAudioPlaybackControls";
import { StatefulAudioMediaActions } from "./actions/StatefulAudioMediaActions";
import { StatefulAudioProgressBar } from "./controls/StatefulAudioProgressBar";

import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useAudioNavigator } from "@/core/Hooks/Audio/useAudioNavigator";
import { useAudioStatelessCache } from "./Hooks/useAudioStatelessCache";
import { useI18n } from "@/i18n/useI18n";
import { resolveAudioContentProtectionConfig } from "@/preferences/models/protection";
import { usePositionStorage } from "@/hooks/usePositionStorage";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useAudioPlayerInit } from "./Hooks/useAudioPlayerInit";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  setLoading
} from "@/lib/readerReducer";
import {
  setPublicationStart,
  setPublicationEnd,
  setTocEntry,
  setAdjacentTimelineItems,
} from "@/lib/publicationReducer";
import { findTocItemByHref, TocItem } from "@/helpers/buildTocTree";
import { isWebKit } from "@/helpers/browser";
import { TimelineItem } from "@readium/shared";
import { 
  setStatus,
  setSeeking,
  setStalled,
  setTrackReady,
  setSleepTimerOnTrackEnd,
  setSleepTimerOnFragmentEnd,
  setRemotePlaybackState,
  setSeekableRanges
} from "@/lib/playerReducer";

import { createAudioDefaultPlugin } from "../Plugins/helpers/createAudioDefaultPlugin";
import debounce from "debounce";

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
    <ThPluginProvider>
      <StatefulPlayerInner publication={ publication } localDataKey={ localDataKey } positionStorage={ positionStorage } coverUrl={ coverUrl } />
    </ThPluginProvider>
  );
};

const StatefulPlayerInner = ({ publication, localDataKey, positionStorage, coverUrl }: { publication: Publication; localDataKey: string | null; positionStorage?: PositionStorage; coverUrl?: string }) => {
  const { preferences } = useAudioPreferences();
  const { t } = useI18n();

  const wrapperRef = useRef<HTMLElement>(null);
  const coverSectionRef = useRef<HTMLElement>(null);
  const compactMinHeight = useRef<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const sleepOnTrackEnd = useAppSelector(state => state.player.sleepTimer.onTrackEnd);
  const sleepOnFragmentEnd = useAppSelector(state => state.player.sleepTimer.onFragmentEnd);
  const adjacentTimelineItems = useAppSelector(state => state.publication.adjacentTimelineItems);
  const volume = useAppSelector(state => state.audioSettings.volume);
  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);
  const preservePitch = useAppSelector(state => state.audioSettings.preservePitch);
  const skipBackwardInterval = useAppSelector(state => state.audioSettings.skipBackwardInterval);
  const skipForwardInterval = useAppSelector(state => state.audioSettings.skipForwardInterval);
  const skipInterval = useAppSelector(state => state.audioSettings.skipInterval);
  const pollInterval = useAppSelector(state => state.audioSettings.pollInterval);
  const autoPlay = useAppSelector(state => state.audioSettings.autoPlay);
  const enableMediaSession = useAppSelector(state => state.audioSettings.enableMediaSession);

  const cache = useAudioStatelessCache(
    volume,
    playbackRate,
    preservePitch,
    skipBackwardInterval,
    skipForwardInterval,
    skipInterval,
    pollInterval,
    autoPlay,
    enableMediaSession,
    sleepOnTrackEnd,
    sleepOnFragmentEnd,
    adjacentTimelineItems
  );

  const dispatch = useAppDispatch();

  const audioNavigator = useAudioNavigator();
  const { canGoBackward, canGoForward, submitPreferences, pause, isPlaying } = audioNavigator;

  const { setLocalData, getLocalData } = usePositionStorage(localDataKey, positionStorage);

  const documentTitle = publication?.metadata?.title?.getTranslation("en");
  useDocumentTitle(documentTitle);

  const tocTree = useAppSelector(state => state.publication.unstableTimeline?.toc?.tree);
  const tocTreeRef = useRef<TocItem[] | undefined>(undefined);
  useEffect(() => {
    tocTreeRef.current = tocTree;
  }, [tocTree]);

  // Callback to handle timeline navigation state updates
  const handleTimelineNavigation = useCallback((item: TimelineItem) => {
    const tl = publication.timeline;
    const link = tl.linkFor(item);
    if (link) {
      const matched = findTocItemByHref(tocTreeRef.current || [], link.href);
      dispatch(setTocEntry(matched || null));
    }
    const { previous, next } = tl.adjacentTo(item);
    dispatch(setAdjacentTimelineItems({
      previous: previous ? { title: previous.title, href: tl.linkFor(previous)?.href ?? "" } : null,
      next: next ? { title: next.title, href: tl.linkFor(next)?.href ?? "" } : null,
    }));
    return { previous, next };
  }, [dispatch, publication]);

  // Callback to check if affordance is timeline or toc (fragment-based)
  const isFragmentAffordance = useCallback((affordance: string) => {
    return affordance === "timeline" || affordance === "toc";
  }, []);

  // Callback to handle sleep timer endOfFragment logic
  const handleSleepTimerEndOfFragment = useCallback((isTransitionToNext: boolean) => {
    if (!cache.current.sleepTimerOnFragmentEnd || !isTransitionToNext) return;
    
    const nextAffordance = preferences.affordances.next;
    if (isFragmentAffordance(nextAffordance)) {
      pause();
      dispatch(setSleepTimerOnFragmentEnd(false));
    }
  }, [cache, preferences.affordances.next, isFragmentAffordance, pause, dispatch]);

  // Callback to handle continuous play logic
  const handleContinuousPlay = useCallback((isTransitionToNext: boolean) => {
    if (!cache.current.settings.autoPlay && isTransitionToNext) {
      if (isFragmentAffordance(preferences.affordances.next)) {
        pause();
      }
    }
  }, [cache, preferences.affordances.next, isFragmentAffordance, pause]);

  const listeners: AudioNavigatorListeners = useMemo(() => ({
    timelineItemChanged: (item: TimelineItem | undefined) => {
      if (!item) {
        dispatch(setTocEntry(null));
        dispatch(setAdjacentTimelineItems({ previous: null, next: null }));
        return;
      }

      // Capture the previous "next" item from cache BEFORE handleTimelineNavigation updates Redux state
      const previousNextItem = cache.current.adjacentTimelineItems.next;
      const currentItemHref = publication.timeline.linkFor(item)?.href ?? "";

      // Update TOC entry and adjacent items (this updates Redux state)
      handleTimelineNavigation(item);

      // Check if we're transitioning to the next fragment by comparing current item href with previous next item href
      const isTransitionToNext = previousNextItem !== null &&
        previousNextItem.href === currentItemHref;

      handleSleepTimerEndOfFragment(isTransitionToNext);
      handleContinuousPlay(isTransitionToNext);
    },
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
      dispatch(setStatus(isPlaying() ? "playing" : "paused"));
    },
    trackEnded: () => {
      if (cache.current.sleepTimerOnTrackEnd) {
        submitPreferences({ autoPlay: false });
      }
      if (cache.current.sleepTimerOnFragmentEnd) {
        submitPreferences({ autoPlay: false });
        dispatch(setSleepTimerOnFragmentEnd(false));
      }
    },
    metadataLoaded: () => {},
    play: () => {
      if (cache.current.sleepTimerOnTrackEnd) {
        submitPreferences({ autoPlay: cache.current.settings.autoPlay });
        dispatch(setSleepTimerOnTrackEnd(false));
      }
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
    remotePlaybackStateChanged: (state) => {
      if (isWebKit) return;
      dispatch(setRemotePlaybackState(state));
    },
    contentProtection: (_type: string, _detail: SuspiciousActivityEvent) => {},
    peripheral: (_data: KeyboardEventData) => {},
    contextMenu: (_data: ContextMenuEvent) => {}
  }), [setLocalData, canGoBackward, canGoForward, isPlaying, dispatch, cache, submitPreferences, publication, handleTimelineNavigation, handleSleepTimerEndOfFragment, handleContinuousPlay]);

  const initialPosition = useMemo(() => getLocalData(), [getLocalData]);

  const { navigatorReady } = useAudioPlayerInit({
    publication,
    initialPosition,
    listeners,
    preferences,
    cache,
    contentProtectionConfig: resolveAudioContentProtectionConfig(preferences.contentProtection, t),
    onNavigatorLoaded: () => dispatch(setLoading(false)),
  });

  const { compact, expanded } = preferences.theming.layout;

  const renderPlayerComponent = useCallback((component: ThAudioPlayerComponent) => {
    switch (component) {
      case ThAudioPlayerComponent.cover:
        return <StatefulAudioCover key={ component } ref={ coverSectionRef } coverUrl={ coverUrl } title={ publication?.metadata?.title?.getTranslation("en") } />;
      case ThAudioPlayerComponent.metadata:
        return publication ? <StatefulAudioMetadata key={ component } publication={ publication } /> : null;
      case ThAudioPlayerComponent.playbackControls:
        return <StatefulAudioPlaybackControls key={ component } />;
      case ThAudioPlayerComponent.progressBar:
        return <StatefulAudioProgressBar key={ component } />;
      case ThAudioPlayerComponent.mediaActions:
        return <StatefulAudioMediaActions key={ component } />;
    }
  }, [coverUrl, publication]);

  const renderCompactComponents = useCallback(() => {
    const coverIdx = compact.order.indexOf(ThAudioPlayerComponent.cover);
    const metaIdx = compact.order.indexOf(ThAudioPlayerComponent.metadata);
    const adjacent = coverIdx !== -1 && metaIdx !== -1 && Math.abs(coverIdx - metaIdx) === 1;

    if (!adjacent) {
      return compact.order.map(renderPlayerComponent);
    }

    const groupStart = Math.min(coverIdx, metaIdx);
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < compact.order.length; i++) {
      if (i === groupStart) {
        nodes.push(
          <div key="cover-metadata-group" className={ audioStyles.coverMetadataGroup }>
            { renderPlayerComponent(compact.order[i]) }
            { renderPlayerComponent(compact.order[i + 1]) }
          </div>
        );
        i++;
      } else {
        nodes.push(renderPlayerComponent(compact.order[i]));
      }
    }
    return nodes;
  }, [compact.order, renderPlayerComponent]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const check = debounce(() => {
      if (!isExpanded) {
        const overflow = el.scrollHeight - el.clientHeight;
        if (overflow > 0) {
          const coverEl = coverSectionRef.current;
          if (coverEl) {
            const minHeight = parseFloat(getComputedStyle(coverEl).minHeight) || 0;
            const newMaxHeight = coverEl.clientHeight - overflow;
            if (newMaxHeight >= minHeight) {
              el.style.setProperty("--th-layout-constraints-cover", `${ newMaxHeight }px`);
              return;
            }
          }
          el.style.removeProperty("--th-layout-constraints-cover");
          compactMinHeight.current = el.scrollHeight;
          setIsExpanded(true);
        } else {
          el.style.removeProperty("--th-layout-constraints-cover");
        }
      } else {
        if (el.clientHeight > compactMinHeight.current) {
          setIsExpanded(false);
        }
      }
    }, 100);

    const observer = new ResizeObserver(check);

    observer.observe(el);
    return () => {
      check.clear();
      observer.disconnect();
    };
  }, [isExpanded]);

  return (
    <>
    <NavigatorProvider mediaNavigator={ audioNavigator }>
      <main className={ audioLayoutStyles.main }>
        <StatefulDockingWrapper>
          <div className={ audioLayoutStyles.shell }>
            <StatefulPlayerHeader
              actionKeys={ preferences.actions.secondary.displayOrder as string[] }
              actionsOrder={ preferences.actions.secondary.displayOrder as string[] }
            />

            <article
              ref={ wrapperRef }
              className={ isExpanded ? audioStyles.audioPlayerWrapperExpanded : audioStyles.audioPlayerWrapper }
              aria-label={ t("reader.app.publicationWrapper") }
            >
              { isExpanded ? (
                <>
                  <div className={ audioStyles.audioPlayerExpandedStart }>
                    { expanded.start.map(renderPlayerComponent) }
                  </div>
                  <div className={ audioStyles.audioPlayerExpandedEnd }>
                    { expanded.end.map(renderPlayerComponent) }
                  </div>
                </>
              ) : renderCompactComponents() }
            </article>
          </div>
        </StatefulDockingWrapper>
      </main>
    </NavigatorProvider>
    </>
  );
};
