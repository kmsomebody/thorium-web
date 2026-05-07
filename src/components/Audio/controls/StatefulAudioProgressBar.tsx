"use client";

import React, { useCallback, useState, useMemo } from "react";

import audioStyles from "./assets/styles/thorium-web.audioProgressBar.module.css";

import { ThAudioProgress } from "@/core/Components/Audio/ThAudioProgress";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib";
import { useI18n } from "@/i18n/useI18n";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { ThAudioProgressBarVariant } from "@/preferences/models/ui";

export const StatefulAudioProgressBar = () => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const tocEntry = useAppSelector(state => state.publication.unstableTimeline?.toc?.currentEntry);
  const currentChapter = tocEntry?.title;

  const isStalled = useAppSelector(state => state.player.isStalled);
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const seekableRanges = useAppSelector(state => state.player.seekableRanges);
  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);

  const { currentTime, duration, seek, currentLocator, timeline } = useNavigator().media;

  const current = currentTime();
  const total = duration();

  const [hoverLabel, setHoverLabel] = useState<string | undefined>(undefined);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handleHoverProgression = useCallback((progression: number | null) => {
    if (progression === null) {
      setHoverLabel(undefined);
      return;
    }
    const locator = currentLocator();
    const tl = timeline();
    if (!locator || !tl) return;
    const item = tl.itemAtProgression(locator.href, progression, total);
    setHoverLabel(item?.title);
  }, [currentLocator, timeline, total]);

  // Parse timestamp from fragment href (e.g., "file.mp3#t=123.45")
  const parseTimestamp = (href: string): number => {
    const match = href.match(/#t=(\d+(?:\.\d+)?)$/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Get timeline segments for fragmented progress bar
  const segments = useMemo(() => {
    const locator = currentLocator();
    const tl = timeline();
    if (!locator || !tl || preferences.theming.layout.progressBar?.variant !== ThAudioProgressBarVariant.segmented) return [];
    
    const segments = tl.segmentsForHref(locator.href);
    if (!segments || !Array.isArray(segments)) return [];
    
    return segments.map((segment) => {
      // Parse timestamp from first reference href (e.g., "track1.mp3#t=60")
      const referenceHref = segment.references?.[0] || "";
      const timestamp = parseTimestamp(referenceHref);
      
      // Calculate percentage based on timestamp and total duration
      const percentage = total > 0 ? (timestamp / total) * 100 : 0;
      
      return {
        title: segment.title,
        timestamp,
        percentage
      };
    });
  }, [currentLocator, timeline, total, preferences.theming.layout.progressBar?.variant]);

  return (
    <ThAudioProgress
      currentTime={ current }
      duration={ total }
      playbackRate={ playbackRate }
      onSeek={ handleSeek }
      currentChapter={ currentChapter || "​" } // Zero-width space to prevent shift
      isDisabled={ !isTrackReady || isStalled }
      seekableRanges={ seekableRanges }
      hoverLabel={ hoverLabel }
      onHoverProgression={ handleHoverProgression }
      segments={ segments }
      compounds={{
        wrapper: {
          className: audioStyles.audioProgressControl,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Escape") (document.activeElement as HTMLElement)?.blur();
          }
        },
        chapter: {
          className: audioStyles.audioProgressChapter
        },
        slider: {
          className: audioStyles.audioProgressSlider,
          "aria-label": t("audio.player.progress")
        },
        track: {
          className: audioStyles.audioProgressTrack
        },
        thumb: {
          className: audioStyles.audioProgressThumb
        },
        elapsedTime: {
          className: audioStyles.audioProgressElapsedTime
        },
        remainingTime: {
          className: audioStyles.audioProgressRemainingTime
        },
        seekableRange: {
          className: audioStyles.audioProgressSeekableRange
        },
        segmentTick: {
          className: audioStyles.audioProgressSegmentTick
        },
        tooltip: {
          className: audioStyles.audioProgressTooltip,
          offset: preferences.theming.icon.tooltipOffset
        }
      }}
    />
  );
};
