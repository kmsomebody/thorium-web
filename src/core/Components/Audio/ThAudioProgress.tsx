"use client";

import {
  Slider,
  SliderProps,
  SliderThumb,
  SliderThumbProps,
  SliderTrack,
  SliderTrackProps
} from "react-aria-components";

import { WithRef } from "../customTypes";

export interface SeekableRange {
  start: number;
  end: number;
}

export interface ThAudioProgressProps {
  isDisabled?: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  currentChapter?: string;
  elapsedTime?: string;
  remainingTime?: string;
  seekableRanges?: SeekableRange[];
  compounds?: {
    wrapper?: React.HTMLAttributes<HTMLDivElement>;
    chapter?: React.HTMLAttributes<HTMLDivElement>;
    slider?: WithRef<SliderProps, HTMLDivElement>;
    track?: WithRef<SliderTrackProps, HTMLDivElement>;
    thumb?: WithRef<SliderThumbProps, HTMLDivElement>;
    elapsedTime?: React.HTMLAttributes<HTMLSpanElement>;
    remainingTime?: React.HTMLAttributes<HTMLSpanElement>;
    seekableRange?: React.HTMLAttributes<HTMLDivElement>;
  };
}

export const ThAudioProgress = ({
  isDisabled,
  currentTime,
  duration,
  onSeek,
  currentChapter,
  elapsedTime,
  remainingTime,
  seekableRanges,
  compounds
}: ThAudioProgressProps) => {
  const defaultElapsedTime = elapsedTime || formatTime(currentTime);
  const defaultRemainingTime = remainingTime || formatTime(Math.max(0, duration - currentTime));

  function formatTime(seconds: number) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${ mins }:${ secs.toString().padStart(2, "0") }`;
  }

  const validSeekableRanges = duration > 0
    ? (seekableRanges ?? []).filter(r => r.end <= duration)
    : [];

  return (
    <div { ...compounds?.wrapper }>
      { currentChapter && (
        <div { ...compounds?.chapter }>
          { currentChapter }
        </div>
      ) }
      <Slider
        value={ currentTime }
        minValue={ 0 }
        maxValue={ duration || 0 }
        onChange={ (value) => onSeek(Array.isArray(value) ? value[0] : value) }
        isDisabled={ !!isDisabled }
        { ...compounds?.slider }
      >
        <SliderTrack { ...compounds?.track }>
          { validSeekableRanges.map((range, i) => (
            <div
              key={ i }
              { ...compounds?.seekableRange }
              style={{
                left: `${ (range.start / duration) * 100 }%`,
                width: `${ ((range.end - range.start) / duration) * 100 }%`,
                ...compounds?.seekableRange?.style,
              }}
            />
          )) }
          <SliderThumb { ...compounds?.thumb } />
        </SliderTrack>
      </Slider>
      <span { ...compounds?.elapsedTime }>{ defaultElapsedTime }</span>
      <span { ...compounds?.remainingTime }>{ defaultRemainingTime }</span>
    </div>
  );
};
