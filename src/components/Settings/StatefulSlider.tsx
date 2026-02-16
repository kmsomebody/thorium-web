"use client";

import readerSharedUI from "../assets/styles/thorium-web.button.module.css";
import settingsStyles from "./assets/styles/thorium-web.reader.settings.module.css";

import { ThSlider, ThSliderProps } from "@/core/Components/Settings/ThSlider";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import classNames from "classnames";

export interface StatefulSliderProps extends Omit<ThSliderProps, "classNames"> {
  standalone?: boolean;
  placeholder?: string;
  resetLabel?: string;
  displayTicks?: boolean;
}

export const StatefulSlider = ({
  standalone,
  label,
  placeholder,
  displayTicks = false,
  value,
  resetLabel,
  ...props
}: StatefulSliderProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();
  
  const style = {
    ...(displayTicks && props.range && props.step ? {
      "--th-slider-ticks": (() => {
        const [min, max] = [Math.min(...props.range), Math.max(...props.range)];
        const step = props.step || 1;
        const range = max - min;
        const totalIntervals = range / step;
        return Math.ceil(totalIntervals);
      })()
    } : {}),
    ...props.style
  };

  return (
    <>
    <ThSlider
      value={ value }
      { ...props }
      { ...(standalone ? { label: label } : {"aria-label": label}) }
      placeholder={ placeholder }
      className={ classNames(
        settingsStyles.slider,
        displayTicks && settingsStyles.sliderWithTicks
      ) }
      style={ style }
      compounds={{
        wrapper: {
          className: classNames(
            settingsStyles.sliderWrapper,
            standalone && settingsStyles.group
          )
        },
        label: {
          className: classNames(settingsStyles.label, settingsStyles.sliderLabel)
        },
        output: {
          className: settingsStyles.sliderOutput
        },
        placeholder: {
          className: settingsStyles.sliderPlaceholder
        },
        track: {
          className: settingsStyles.sliderTrack
        },
        thumb: {
          className: settingsStyles.sliderThumb
        },
        reset: {
          className: classNames(readerSharedUI.icon, settingsStyles.resetButton),
          compounds: {
            tooltipTrigger: {
              delay: preferences.theming.arrow.tooltipDelay,
              closeDelay: preferences.theming.arrow.tooltipDelay
            },
            tooltip: {
              className: readerSharedUI.tooltip
            },
            label: resetLabel ?? t("common.actions.reset")
          }
        }
      }}
    />
    </>
  )
}