"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { ThContainerProps } from "./ThContainer";

import { Dialog, DialogProps, Popover, PopoverProps } from "react-aria-components";

import { useObjectRef } from "react-aria";
import { useFirstFocusable } from "./hooks/useFirstFocusable";
import { useSharedPreferences } from "@/preferences";

export interface ThPopoverProps extends Omit<PopoverProps, "children">, ThContainerProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  compounds?: {
    dialog: WithRef<DialogProps, HTMLDivElement>;
  }
}

export const ThPopover = ({
  ref,
  id,
  triggerRef,
  focusOptions,
  compounds,
  maxHeight,
  children,
  className,
  ...props
}: ThPopoverProps) => {
  const resolvedRef = useObjectRef(ref as React.RefObject<HTMLDivElement | null>);
  const { theming } = useSharedPreferences();

  const updatedFocusOptions = focusOptions ? {
    ...focusOptions,
    scrollerRef: focusOptions.scrollerRef || resolvedRef
  } : undefined;

  useFirstFocusable(updatedFocusOptions);

  const computeMaxHeight = () => {
    if (!resolvedRef.current) return;
    return window.innerHeight - resolvedRef.current.offsetTop;
  };

  return (
    <Popover 
      ref={ resolvedRef }
      triggerRef={ triggerRef }
      maxHeight={ maxHeight || computeMaxHeight() }
      className={(state) => {
        const pref = theming.classNames?.popover;
        const cls =
          typeof className === "function" ? className(state) : className;
        return [pref, cls].filter((v) => !!v).join(" ");
      }}
      { ...props }
    >
      <Dialog id={ id } { ...compounds?.dialog }>
        { children }
      </Dialog>
    </Popover>
  )
}