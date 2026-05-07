"use client";

import React from "react";

import backLinkStyles from "./assets/styles/thorium-web.backlink.module.css";
import readerSharedUI from "./assets/styles/thorium-web.button.module.css";

import { ThBackLinkVariant, ThLayoutDirection } from "@/preferences/models";

import { ThBackArrow } from "@/core/Components/Links";
import { ThHome } from "@/core/Components/Links";
import { ThLibrary } from "@/core/Components/Links";
import { ThLink } from "@/core/Components/Links";

import { useI18n } from "@/i18n";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";

import classNames from "classnames";

export const StatefulBackLink = ({ 
  className 
}: { 
  className?: string 
}) => {
  const { t } = useI18n();
  const { direction, theming } = useSharedPreferences();
  const backLinkPref = theming.header?.backLink;
  const tooltipDelay = theming.icon.tooltipDelay;
  const isRTL = direction === ThLayoutDirection.rtl;

  const variant = backLinkPref?.variant || ThBackLinkVariant.arrow;
  const href = backLinkPref?.href;
  const content = backLinkPref?.content;
  const visibility = backLinkPref?.visibility || "partially";
  const backLinkClassName = classNames(backLinkStyles.link, visibility === "always" ? readerSharedUI.alwaysVisible : readerSharedUI.partiallyVisible);

  const compounds = {
    tooltipTrigger: {
      delay: tooltipDelay,
      closeDelay: tooltipDelay
    },
    tooltip: {
      className: readerSharedUI.tooltip
    },
    label: t("reader.app.header.backLink.tooltip")
  };

  if (!href) return null;

  switch (variant) {
    case ThBackLinkVariant.arrow:
      return (
        <div className={ className }>
          <ThBackArrow 
            className={ backLinkClassName } 
            href={ href } 
            direction={ isRTL ? "right" : "left" }
            aria-label={ t("reader.app.header.backLink.trigger") }
            compounds={ compounds }
          />
        </div>
      );

    case ThBackLinkVariant.home:
      return (
        <div className={ className }>
          <ThHome 
            className={ backLinkClassName } 
            href={ href } 
            aria-label={ t("reader.app.header.backLink.trigger") }
            compounds={ compounds }
          />
        </div>
      );

    case ThBackLinkVariant.library:
      return (
        <div className={ className }>
          <ThLibrary 
            className={ backLinkClassName } 
            href={ href } 
            aria-label={ t("reader.app.header.backLink.trigger") }
            compounds={ compounds }
          />
        </div>
      );

    default:
      if (!content) return null;
      
      let contentNode: React.ReactNode = null;
      
      switch (content.type) {
        case "img":
          contentNode = <img alt={ content.alt ?? "" } src={ content.src } />;
          break;
          
        case "svg":
          // Create the SVG element with all its original attributes
          contentNode = React.createElement(content.content, {
            "aria-hidden": "true",
            focusable: "false",
            xmlns: "http://www.w3.org/2000/svg",
          });
          break;
      }
      
      return (
        <div className={ className }>
          <ThLink 
            className={ backLinkClassName } 
            href={ href } 
            aria-label={ t("reader.app.header.backLink.trigger") }
            compounds={ compounds }
          >
            { contentNode }
          </ThLink>
        </div>
      );
  }
}