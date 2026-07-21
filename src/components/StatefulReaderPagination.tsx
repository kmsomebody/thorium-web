"use client";

import { useRef, KeyboardEvent } from "react";

import { ThPagination, ThPaginationProps } from "@/core/Components/Reader/ThPagination";

import readerPaginationStyles from "./assets/styles/thorium-web.reader.pagination.module.css";

export const StatefulReaderPagination = ({
  ref,
  links,
  compounds,
  children,
  ...props
}: ThPaginationProps) => {
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  const updatedCompounds = {
    ...compounds,
    leftButton: {
      ...compounds?.leftButton,
      ref: leftButtonRef,
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          leftButtonRef.current?.blur();
        }
      }
    },
    rightButton: {
      ...compounds?.rightButton,
      ref: rightButtonRef,
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          rightButtonRef.current?.blur();
        }
      }
    }
  };

  return (
    <ThPagination
      ref={ ref }
      className={ readerPaginationStyles.wrapper }
      links={ links }
      compounds={ updatedCompounds }
      { ...props }
    >
      { children }
    </ThPagination>
  )
}
