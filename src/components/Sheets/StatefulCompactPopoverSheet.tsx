"use client";

import React, { useRef, useEffect } from "react";

import { StatefulSheet } from "./models/sheets";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";

import { Popover, PopoverProps, Dialog, DialogProps } from "react-aria-components";

import { useWebkitPatch } from "./hooks/useWebkitPatch";

import classNames from "classnames";

export interface StatefulCompactPopoverSheetProps extends StatefulSheet {
  placement?: PopoverProps["placement"];
}

export const StatefulCompactPopoverSheet = ({ 
    id,
    triggerRef,
    heading,
    className,
    isOpen,
    onOpenChange, 
    placement,
    children,
    resetFocus,
    focusWithinRef,
    focusSelector,
    scrollTopOnFocus,
    dismissEscapeKeyClose
  }: StatefulCompactPopoverSheetProps) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverBodyRef = useRef<HTMLDivElement | null>(null);

  // Warning: This is a temporary fix for a bug in React Aria Components.
  useWebkitPatch(!!isOpen);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <Popover 
        ref={ popoverRef }
        triggerRef={ triggerRef }
        placement={ placement || "bottom" }
        isOpen={ isOpen }
        onOpenChange={ onOpenChange } 
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        className={ classNames(sheetStyles.compactPopover, className) }
      >
        <Dialog 
          aria-label={ heading }
          className={ sheetStyles.dialog }
        >
          <div 
            ref={ popoverBodyRef }
            className={ sheetStyles.body }
          >
            { children }
          </div>
        </Dialog>
      </Popover>
      </>
    ) 
  }
}
