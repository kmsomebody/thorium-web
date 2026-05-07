"use client";

import { useCallback } from "react";

import audioStyles from "./assets/styles/thorium-web.audioProgressBar.module.css";

import { ThAudioProgress } from "@/core/Components/Audio/ThAudioProgress";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib";
import { useI18n } from "@/i18n/useI18n";

export const StatefulAudioProgressBar = ({ currentChapter }: { currentChapter?: string }) => {
  const { t } = useI18n();
  
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const seekableRanges = useAppSelector(state => state.player.seekableRanges);

  const { currentTime, duration, seek } = useNavigator().media;

  const current = currentTime();
  const total = duration();

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${ mins }:${ secs.toString().padStart(2, "0") }`;
  };

  return (
    <ThAudioProgress
      currentTime={ current }
      duration={ total }
      onSeek={ handleSeek }
      currentChapter={ currentChapter }
      elapsedTime={ formatTime(current) }
      remainingTime={ formatTime(Math.max(0, total - current)) }
      isDisabled={ !isTrackReady || isStalled }
      seekableRanges={ seekableRanges }
      compounds={{
        wrapper: {
          className: audioStyles.audioProgressControl
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
        }
      }}
    />
  );
};
