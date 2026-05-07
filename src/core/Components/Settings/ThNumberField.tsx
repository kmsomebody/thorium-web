"use client";

import { ComponentType, SVGProps, useCallback } from "react";

import { HTMLAttributesWithRef, WithRef } from "../customTypes";
import { ThActionButtonProps } from "../Buttons";

import AddIcon from "./assets/icons/add.svg";
import RemoveIcon from "./assets/icons/remove.svg";

import { ThSettingsResetButton } from "./ThSettingsResetButton";

import {
  Button,
  ButtonProps,
  Group,
  GroupProps,
  Input,
  InputProps,
  Label,
  LabelProps,
  NumberField,
  NumberFieldProps
} from "react-aria-components";

import { useObjectRef } from "react-aria";

export interface ThNumberFieldProps extends Omit<NumberFieldProps, "minValue" | "maxValue" | "decrementAriaLabel" | "incrementAriaLabel"> {
  ref?: React.ForwardedRef<HTMLInputElement>;
  onReset?: () => void;
  onInputChange?: (rawValue: string) => void;
  label?: string;
  placeholder?: string;
  range: number[];
  isVirtualKeyboardDisabled?: boolean;
  steppers?: {
    decrementIcon?: ComponentType<SVGProps<SVGElement>> | null;
    decrementLabel: string;
    incrementIcon?: ComponentType<SVGProps<SVGElement>> | null;
    incrementLabel: string;
  };
  compounds?: {
    /**
     * Props for the wrapper component.
     */
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    /**
     * Props for the Group component. See `GroupProps` for more information.
     */
    group?: WithRef<GroupProps, HTMLDivElement>;
    /**
     * Props for the Input component. See `InputProps` for more information.
     */
    input?: Omit<WithRef<InputProps, HTMLInputElement>, "placeholder">;
    /**
     * Props for the Label component. See `LabelProps` for more information.
     */
    label?: WithRef<LabelProps, HTMLLabelElement>;
    /**
     * Props for the Button component used for decrement/increment. See `ButtonProps` for more information.
     */
    stepper?: ButtonProps;
    /**
     * Props for the Button component used for resetting the value. See `ThActionButtonProps` for more information.
     */
    reset?: ThActionButtonProps;
  };
}

export const ThNumberField = ({
  ref,
  onReset,
  onInputChange,
  label,
  placeholder,
  range,
  isVirtualKeyboardDisabled,
  steppers,
  compounds,
  value,
  ...props
}: ThNumberFieldProps) => {
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

  return (
    <>
      <div { ...compounds?.wrapper }>
        <NumberField
          ref={ resolvedRef }
          // This looks super weird but is the only way
          // to unset the value in NumberField as undefined
          // will not update the value
          value={ value === undefined ? NaN : value }
          minValue={ Math.min(...range) }
          maxValue={ Math.max(...range) }
          decrementAriaLabel={ steppers?.decrementLabel }
          incrementAriaLabel={ steppers?.incrementLabel }
          { ...props }
        >
          { label && <Label { ...compounds?.label }>
            { label }
          </Label>
          }

          <Group { ...compounds?.group }>
            {steppers &&
              <Button
                { ...compounds?.stepper }
                slot="decrement"
              >
                { steppers.decrementIcon
                  ? <steppers.decrementIcon aria-hidden="true" focusable="false" />
                  : <RemoveIcon aria-hidden="true" focusable="false" /> }
              </Button>
            }

            <Input
              { ...compounds?.input }
              { ...(isVirtualKeyboardDisabled ? { inputMode: "none" } : {}) }
              placeholder={ placeholder }
              onInput={ onInputChange ? (e) => onInputChange((e.target as HTMLInputElement).value) : undefined }
            />

            { steppers &&
              <Button
                { ...compounds?.stepper }
                slot="increment"
              >
                { steppers.incrementIcon
                  ? <steppers.incrementIcon aria-hidden="true" focusable="false" />
                  : <AddIcon aria-hidden="true" focusable="false" /> }
              </Button>
            }
          </Group>
        </NumberField>
        { onReset && <ThSettingsResetButton { ...compounds?.reset } onClick={ handleResetWithFocus } /> }
      </div>
    </>
  );
};