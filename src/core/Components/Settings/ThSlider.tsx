"use client";

import { useCallback } from "react";

import { HTMLAttributesWithRef, WithRef } from "../customTypes";
import { ThActionButtonProps } from "../Buttons";

import { ThSettingsResetButton } from "./ThSettingsResetButton";

import { 
  Label,
  LabelProps,
  Slider,
  SliderOutput,
  SliderOutputProps,
  SliderProps,
  SliderThumb,
  SliderThumbProps,
  SliderTrack,
  SliderTrackProps 
} from "react-aria-components";

import { useObjectRef } from "react-aria";

export interface ThSliderProps extends Omit<SliderProps, "minValue" | "maxValue"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  onReset?: () => void;
  label?: string;
  placeholder?: string;
  range: number[];
  compounds?: {
    /**
     * Props for the wrapper component.
     */
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    /**
     * Props for the label component. See `LabelProps` for more information.
     */
    label?: WithRef<LabelProps, HTMLLabelElement>;
    /**
     * Props for the slider output component. See `SliderOutputProps` for more information.
     */
    output?: WithRef<SliderOutputProps, HTMLOutputElement>;
    /**
     * Props for the slider placeholder component. See `HTMLSpanElement` for more information.
     */
    placeholder?: HTMLAttributesWithRef<HTMLSpanElement>;
    /**
     * Props for the slider track component. See `SliderTrackProps` for more information.
     */
    track?: WithRef<SliderTrackProps, HTMLDivElement>;
    /**
     * Props for the slider thumb component. See `SliderThumbProps` for more information.
     */
    thumb?: WithRef<SliderThumbProps, HTMLDivElement>;
    /**
     * Props for the reset button component. See `ThActionButtonProps` for more information.
     */
    reset?: ThActionButtonProps;
  };
}

export const ThSlider = ({
  ref,
  onReset,
  label,
  placeholder,
  range,
  compounds,
  value,
  ...props
}: ThSliderProps) => {
  const resolvedRef = useObjectRef(ref);

  // Callback that handles reset and focus restoration
  const handleResetWithFocus = useCallback(() => {
    onReset?.();
    // Use requestAnimationFrame to defer focus until after current call stack
    requestAnimationFrame(() => {
      if (resolvedRef.current) {
        const inputElement = resolvedRef.current.querySelector("input");
        if (inputElement) {
          (inputElement as HTMLElement).focus();
        }
      }
    });
  }, [onReset, resolvedRef]);
  return(
    <>
    <div { ...compounds?.wrapper }>
      <Slider
        ref={ resolvedRef }
        value={ value }
        minValue={ Math.min(...range) }
        maxValue={ Math.max(...range) }
        { ...props }
      >
        { label && <Label { ...compounds?.label }>
            { label }
          </Label>
        }
        <SliderOutput { ...compounds?.output }>
          {({ state }) => value !== undefined
            ? state.getFormattedValue(state.values[0])
            : placeholder
              ? <span { ...compounds?.placeholder }>{ placeholder }</span>
              : null
          }
        </SliderOutput>
        <SliderTrack { ...compounds?.track }>
          <SliderThumb { ...compounds?.thumb } />
        </SliderTrack>
      </Slider>
      { onReset && <ThSettingsResetButton { ...compounds?.reset } onClick={ handleResetWithFocus } /> }
    </div>
    </>
  )
}