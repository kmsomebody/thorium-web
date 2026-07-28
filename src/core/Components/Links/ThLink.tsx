"use client";

import { Link, LinkProps, Tooltip, TooltipProps, TooltipTrigger } from "react-aria-components";
import { WithRef } from "../customTypes";
import { TooltipTriggerProps } from "react-aria";
import { useSharedPreferences } from "@/preferences";

export interface ThLinkProps extends LinkProps {
  ref?: React.ForwardedRef<HTMLAnchorElement>;
  href: string;
  children: React.ReactNode;
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
       * String for the tooltip
       */
      label: string 
    }
}

export interface ThLinkIconProps extends Omit<ThLinkProps, "children"> {
  "aria-label": string;
}

export const ThLink = ({ 
  ref,
  href,
  children,
  compounds,
  ...props 
}: ThLinkProps) => {
  const { theming } = useSharedPreferences();
  if (compounds) {
    return (
      <TooltipTrigger
        { ...compounds.tooltipTrigger }
      >
        <Link 
          href={ href }
          ref={ ref }
          { ...props }
        >
          { children }
        </Link>
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
    );
  } else {
    return (
      <Link 
        href={ href }
        ref={ ref }
        { ...props }
      >
        { children }
      </Link>
    );
  }
};