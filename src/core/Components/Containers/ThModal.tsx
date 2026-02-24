"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { ThContainerProps } from "./ThContainer";

import { Dialog, DialogProps, Modal, ModalOverlayProps } from "react-aria-components";

import { useObjectRef } from "react-aria";
import { useFirstFocusable } from "./hooks/useFirstFocusable";
import { usePreferences } from "@/preferences";

export interface ThModalProps extends Omit<ModalOverlayProps, "children">, ThContainerProps {
  compounds?: {
    dialog: WithRef<DialogProps, HTMLDivElement>;
  }
}

export const ThModal = ({ 
  ref,
  focusOptions,
  compounds,
  children, 
  ...props 
}: ThModalProps) => {
  const resolvedRef = useObjectRef(ref as React.RefObject<HTMLDivElement | null>);
  const { preferences } = usePreferences();

  const updatedFocusOptions = focusOptions ? {
    ...focusOptions,
    scrollerRef: focusOptions.scrollerRef || resolvedRef
  } : undefined;

  useFirstFocusable(updatedFocusOptions);

  return (
    <Modal 
      ref={ resolvedRef }
      { ...props }
      className={(state) => {
        const className = props.className;
        const pref = preferences.theming.classNames?.modal;
        const cls = typeof className === "function" ? className(state) : className;
        return [pref, cls].filter((v) => !!v).join(" ");
      }}
    >
      <Dialog { ...compounds?.dialog }>
        { children }
      </Dialog>
    </Modal>
  )
}