"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { Button, ButtonProps, Tooltip, TooltipProps, TooltipTrigger } from "react-aria-components";
import { TooltipTriggerProps } from "react-aria";
import { useSharedPreferences } from "@/preferences";

export interface ThActionButtonProps extends ButtonProps {
  label?: string,
  ref?: React.ForwardedRef<HTMLButtonElement>,
  compounds?: {
    /**
     * Props for the tooltipTrigger component. See `TooltipTriggerProps` for more information.
     */
    tooltipTrigger?: WithRef<TooltipTriggerProps, HTMLDivElement>,
    /**
     * Props for the tooltip component. See `TooltipProps` for more information.
     */
    tooltip?: WithRef<TooltipProps, HTMLDivElement>,
    /**
     * Content for the tooltip
     */
    label: React.ReactNode
  }
}

export const ThActionButton = ({
  ref,
  compounds,
  children,
  ...props
}: ThActionButtonProps) => {  
  const { theming } = useSharedPreferences();
  if (compounds) {
    return (
      <>
      <TooltipTrigger
        { ...compounds.tooltipTrigger }
      >
        <Button 
          ref={ ref }
          { ...props }
        >
          { children } 
        </Button>
        <Tooltip
          arrowBoundaryOffset={ 0 }
          { ...compounds.tooltip }
          className={(state) => {
            const className = compounds?.tooltip?.className;
            const pref = theming.classNames?.menu;
            const cls = typeof className === "function" ? className(state) : className;
            return [pref, cls].filter((v) => !!v).join(" ");
          }}
        >
          { compounds.label }
        </Tooltip>
      </TooltipTrigger>
      </>
    )
  } else {
    return (
      <>
      <Button 
        { ...props }
      >
        { children }
      </Button>
      </>
    )
  }
}