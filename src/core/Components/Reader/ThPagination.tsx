"use client";

import React, { ComponentType, SVGProps } from "react";

import { Button, ButtonProps } from "react-aria-components";
import { WithRef } from "../customTypes";

import ArrowBack from "../assets/icons/arrow_back.svg";
import ArrowForward from "../assets/icons/arrow_forward.svg";

export interface ThPaginationLinkProps {
  icon?: ComponentType<SVGProps<SVGElement>> | null;
  node: React.ReactNode;
  onPress: () => void;
}

export interface ThPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
  links?: {
    left?: ThPaginationLinkProps;
    right?: ThPaginationLinkProps;
  };
  compounds?: {
    listItem?: React.HTMLAttributes<HTMLLIElement>;
    leftButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
    rightButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
  };
}

export const ThPagination = ({
  ref,
  links,
  compounds,
  children,
  dir,
  ...restProps
}: ThPaginationProps) => {
  if (!links) {
    return null;
  }

  const { left, right } = links;

  return (
    <nav
      ref={ ref }
      dir="ltr"
      { ...restProps }
    >
      { left && (
        <li { ...compounds?.listItem }>
          <Button
            { ...compounds?.leftButton }
            type="button"
            onPress={ left.onPress }
          >
            { left.icon ? <left.icon aria-hidden="true" focusable="false" /> : <ArrowBack aria-hidden="true" focusable="false" /> }
            { left.node }
          </Button>
        </li>
      ) }

      { children && (
        <li { ...compounds?.listItem } dir={ dir }>
          { children }
        </li>
      ) }

      { right && (
        <li { ...compounds?.listItem }>
          <Button
            { ...compounds?.rightButton }
            type="button"
            onPress={ right.onPress }
          >
            { right.node }
            { right.icon ? <right.icon aria-hidden="true" focusable="false" /> : <ArrowForward aria-hidden="true" focusable="false" /> }
          </Button>
        </li>
      ) }
    </nav>
  );
};
