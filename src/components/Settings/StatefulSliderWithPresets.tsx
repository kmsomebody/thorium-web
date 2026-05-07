"use client";

import { useRef } from "react";
import { useNumberFormatter } from "react-aria";

import readerSharedUI from "../assets/styles/thorium-web.button.module.css";
import settingsStyles from "./assets/styles/thorium-web.reader.settings.module.css";

import { ThSliderWithPresets, ThSliderWithPresetsProps } from "@/core/Components/Settings/ThSliderWithPresets";

import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";
import { useI18n } from "@/i18n/useI18n";
import { useGridNavigation } from "./hooks/useGridNavigation";
import { ThLayoutDirection } from "@/preferences/models";

import classNames from "classnames";

export interface StatefulSliderWithPresetsProps extends Omit<ThSliderWithPresetsProps, "compounds"> {
  standalone?: boolean;
  placeholder?: string;
  resetLabel?: string;
  displayTicks?: boolean;
  hideOutput?: boolean;
  onEscape?: () => void;
}

export const StatefulSliderWithPresets = ({
  standalone,
  label,
  placeholder,
  displayTicks = false,
  hideOutput = false,
  value,
  resetLabel,
  presets,
  formatValue,
  onEscape,
  ...props
}: StatefulSliderWithPresetsProps) => {
  const { t } = useI18n();
  const { theming, direction } = useSharedPreferences();
  const numberFormatter = useNumberFormatter(props.formatOptions);
  const resolvedFormatValue = formatValue ?? (props.formatOptions ? (v: number) => numberFormatter.format(v) : undefined);
  const tooltipDelay = theming.icon.tooltipDelay;

  const presetsListRef = useRef<HTMLDivElement | null>(null);
  const presetsRef = useRef(presets);
  presetsRef.current = presets;

  const currentScalarValue = Array.isArray(value) ? value[0] : value;

  const { onKeyDown } = useGridNavigation({
    containerRef: presetsListRef,
    items: presetsRef,
    currentValue: currentScalarValue,
    onChange: (v) => props.onChange?.([v]),
    isRTL: direction === ThLayoutDirection.rtl,
    onEscape,
    onFocus: (v) => {
      const el = presetsListRef.current?.querySelector(`input[value="${ v }"]`) as HTMLElement | null;
      el?.focus();
    },
  });

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
    <ThSliderWithPresets
      presets={ presets }
      formatValue={ resolvedFormatValue }
      value={ value }
      { ...props }
      { ...(standalone ? { label: label } : { "aria-label": label }) }
      placeholder={ placeholder }
      className={ classNames(
        settingsStyles.slider,
        displayTicks && settingsStyles.sliderWithTicks
      ) }
      style={ style }
      compounds={{
        wrapper: {
          className: classNames(
            settingsStyles.sliderWithPresetsWrapper,
            standalone && settingsStyles.group
          )
        },
        slider: {
          wrapper: {
            className: settingsStyles.sliderWrapper
          },
          label: {
            className: classNames(settingsStyles.label, settingsStyles.sliderLabel)
          },
          output: {
            className: settingsStyles.sliderOutput,
            ...(hideOutput && { style: () => ({ display: "none" }) })
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
                delay: tooltipDelay,
                closeDelay: tooltipDelay
              },
              tooltip: {
                className: readerSharedUI.tooltip
              },
              label: resetLabel ?? t("common.actions.reset")
            }
          }
        },
        presetsList: {
          "aria-label": label,
        },
        presetsWrapper: {
          ref: presetsListRef,
          className: settingsStyles.sliderWithPresetsRadioGroup,
        },
        preset: {
          className: settingsStyles.sliderWithPresetsRadio,
          onKeyDown
        }
      }}
    />
  );
};
