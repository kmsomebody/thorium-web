"use client";

import React, { useEffect, useRef, useState } from "react";

import arrowStyles from "./assets/styles/thorium-web.reader.paginatedArrow.module.css";
import readerSharedUI from "./assets/styles/thorium-web.button.module.css";

import { ThNavigationButton, ThNavigationButtonProps } from "@/core/Components/Buttons/ThNavigationButton";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";
import { usePaginatedArrows } from "@/hooks/usePaginatedArrows";

import { useAppSelector } from "@/lib/hooks";

import { isActiveElement } from "@/core/Helpers/focusUtilities";


import classNames from "classnames";

export interface StatefulReaderArrowButtonProps extends ThNavigationButtonProps {
  direction: "left" | "right";
}

export const StatefulReaderArrowButton = ({
  direction,
  className,
  isDisabled,
  onPress,
  ...props
}: StatefulReaderArrowButtonProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isRTL = useAppSelector(state => state.publication.isRTL);
  const hasArrows = useAppSelector(state => state.reader.hasArrows);

  const { 
    isVisible, 
    occupySpace 
  } = usePaginatedArrows();
  
  const [isHovering, setIsHovering] = useState(false);

  const label = (
    direction === "right" && !isRTL || 
    direction === "left" && isRTL
  ) 
    ? t("reader.actions.goForward") 
    : t("reader.actions.goBackward");

  const handleClassNameFromState = () => {
    let className = "";
    if (!isVisible) {
      className = arrowStyles.visuallyHidden;
    }
    return className;
  };

  const handleClassNameFromSpaceProp = () => {
    let className = "";
    if (occupySpace) {
      className = arrowStyles.occupiesSpace;
    }
    return className;
  };

  useEffect(() => {
    if ((isDisabled || (!hasArrows && !isHovering)) && isActiveElement(buttonRef.current)) {
      buttonRef.current!.blur();
    }
  });

  const blurOnEsc = (event: React.KeyboardEvent) => {    
    if (isActiveElement(buttonRef.current) && event.code === "Escape") {
      buttonRef.current!.blur();
    }
  };

  return (
    <>
    <ThNavigationButton 
      direction={ direction }
      ref= { buttonRef }
      aria-label={ label }
      onPress={ onPress }
      onHoverChange={ (isHovering: boolean) => setIsHovering(isHovering) } 
      onKeyDown={ blurOnEsc }
      className={ classNames(className, handleClassNameFromSpaceProp(), handleClassNameFromState()) }
      isDisabled={ isDisabled }
      preventFocusOnPress={ true }
      { ...props }
      compounds={ {
        tooltipTrigger: {
          delay: preferences.theming.arrow.tooltipDelay,
          closeDelay: preferences.theming.arrow.tooltipDelay
        },
        tooltip: {
          placement: direction === "left" ? "right" : "left",
          className: readerSharedUI.tooltip
        },
        label: label
      } }
    />
    </>
  )
}