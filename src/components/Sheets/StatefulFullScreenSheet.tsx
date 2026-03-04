"use client";

import React, { useRef, useEffect } from "react";

import { StatefulSheet } from "./models/sheets";
import { ThSheetHeaderVariant } from "@/preferences/models";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { ThModal } from "@/core/Components/Containers/ThModal";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";

import { useI18n } from "@/i18n";
import { useWebkitPatch } from "./hooks/useWebkitPatch";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface StatefulFullScreenSheetProps extends StatefulSheet {};

export const StatefulFullScreenSheet = ({
    heading,
    headerVariant,
    className, 
    isOpen,
    onOpenChange, 
    onClosePress,
    children,
    resetFocus,
    focusWithinRef,
    focusSelector,
    scrollTopOnFocus,
    dismissEscapeKeyClose
  }: StatefulFullScreenSheetProps) => {
  const { t } = useI18n()
  const direction = useAppSelector(state => state.reader.direction);
  const fullScreenRef = useRef<HTMLDivElement | null>(null);
  const fullScreenHeaderRef = useRef<HTMLDivElement | null>(null);
  const fullScreenBodyRef = useRef<HTMLDivElement | null>(null);
  const fullScreenCloseRef = useRef<HTMLButtonElement | null>(null);

  // Update the CSS variable when the sheet is open and header ref is available
  useEffect(() => {
    if (isOpen && fullScreenRef.current && fullScreenHeaderRef.current) {
      fullScreenRef.current.style.setProperty(
        `--${ prefixString("sheet-sticky-header") }`,
        `${ fullScreenHeaderRef.current.clientHeight }px`
      );
    }
  }, [isOpen]);

  // Warning: This is a temporary fix for a bug in React Aria Components.
  useWebkitPatch(!!isOpen);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThModal 
        ref={ fullScreenRef }
        focusOptions={{
          withinRef: focusWithinRef ?? fullScreenBodyRef,
          trackedState: isOpen,
          fallbackRef: fullScreenCloseRef,
          withSelector: focusSelector,
          action: {
            type: "focus",
            options: {
              preventScroll: scrollTopOnFocus ? true : false,
              scrollContainerToTop: scrollTopOnFocus
            }
          },
          updateState: resetFocus
        }}
        compounds={{
          dialog: {
            className: sheetStyles.dialog
          }
        }}
        isOpen={ isOpen }
        onOpenChange={ onOpenChange }
        isDismissable={ true }
        className={ classNames(sheetStyles.fullscreen, className) }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
      >
        <ThContainerHeader 
          ref={ fullScreenHeaderRef }
          className={ sheetStyles.header }
          label={ heading }
          compounds={{
            heading: {
              className: sheetStyles.heading
            }
          }}
        >
          { headerVariant === ThSheetHeaderVariant.previous
              ? <ThNavigationButton
                direction={ direction === "ltr" ? "left" : "right" }
                label={ t("reader.app.back.trigger") }
                ref={ fullScreenCloseRef }
                className={ classNames(className, readerSharedUI.backButton) } 
                aria-label={ t("reader.app.back.trigger") }
                onPress={ onClosePress }
              />
              : <ThCloseButton
                ref={ fullScreenCloseRef }
                className={ readerSharedUI.closeButton } 
                aria-label={ t("common.actions.close") } 
                onPress={ onClosePress }
              />
            }
        </ThContainerHeader>
        <ThContainerBody 
          ref={ fullScreenBodyRef }
          className={ sheetStyles.body }
        >
          { children }
        </ThContainerBody>
      </ThModal>
      </>
    )
  }
}