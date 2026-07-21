"use client";

import React from "react";

import { ActionKeyType } from "@/preferences";
import { ThLayoutUI, ThRunningHeadFormat } from "@/preferences/models";
import { ThFormatPref } from "@/preferences";

import readerStyles from "./assets/styles/thorium-web.reader.app.module.css";
import readerHeaderStyles from "./assets/styles/thorium-web.reader.header.module.css";
import overflowMenuStyles from "./Actions/assets/styles/thorium-web.overflow.module.css";

import { ThHeader } from "@/core/Components/Reader/ThHeader";
import { StatefulBackLink } from "./StatefulBackLink";
import { StatefulReaderRunningHead } from "./StatefulReaderRunningHead";
import { ThInteractiveOverlay } from "../core/Components/Reader/ThInteractiveOverlay";
import { StatefulCollapsibleActionsBar } from "./Actions/StatefulCollapsibleActionsBar";

import { useReaderHeaderBase } from "./hooks/useReaderHeaderBase";
import { usePreferences } from "@/preferences/hooks";

import classNames from "classnames";

export const StatefulReaderHeader = ({
  actionKeys,
  actionsOrder,
  layout,
  runningHeadFormatPref
}: {
  actionKeys: ActionKeyType[];
  actionsOrder: ActionKeyType[];
  layout: ThLayoutUI;
  runningHeadFormatPref?: ThFormatPref<ThRunningHeadFormat>;
}) => {
  const {
    headerRef, focusWithinProps, setHover, removeHover,
    listActionItems, isImmersive, isHovering, isScroll, t,
  } = useReaderHeaderBase(actionKeys);

  const { preferences } = usePreferences();

  return (
    <>
      <ThInteractiveOverlay
        className={ classNames(readerStyles.barOverlay, readerStyles.headerOverlay) }
        isActive={ layout === ThLayoutUI.layered && isImmersive && !isHovering }
        onMouseEnter={ setHover }
        onMouseLeave={ removeHover }
      />

      <ThHeader
        ref={ headerRef }
        className={ classNames(readerStyles.topBar, readerHeaderStyles.header) }
        aria-label={ t("reader.app.header.label") }
        onMouseEnter={ setHover }
        onMouseLeave={ removeHover }
        { ...focusWithinProps }
      >
        { preferences.theming.header?.backLink && <StatefulBackLink className={ readerHeaderStyles.backlinkWrapper } /> }

        <StatefulReaderRunningHead formatPref={ runningHeadFormatPref } />

        <StatefulCollapsibleActionsBar
          id="reader-header-overflowMenu"
          items={ listActionItems() }
          prefs={{ ...preferences.actions, displayOrder: actionsOrder }}
          className={ readerHeaderStyles.actionsWrapper }
          aria-label={ t("reader.app.header.actions") }
          overflowMenuClassName={
            (!isScroll || preferences.affordances.scroll.hintInImmersive)
              ? overflowMenuStyles.hint
              : undefined
          }
        />
      </ThHeader>
    </>
  );
};
