"use client";

import { ThLayoutUI } from "@/preferences/models";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import readerHeaderStyles from "../assets/styles/thorium-web.reader.header.module.css";
import overflowMenuStyles from "../Actions/assets/styles/thorium-web.overflow.module.css";

import { StatefulBackLink } from "../StatefulBackLink";
import { ThInteractiveOverlay } from "@/core/Components/Reader/ThInteractiveOverlay";
import { StatefulCollapsibleActionsBar } from "../Actions/StatefulCollapsibleActionsBar";

import { useReaderHeaderBase } from "../hooks/useReaderHeaderBase";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";

import classNames from "classnames";

export const StatefulPlayerHeader = ({
  actionKeys,
  actionsOrder,
  layout,
}: {
  actionKeys: string[];
  actionsOrder: string[];
  layout: ThLayoutUI;
}) => {
  const {
    headerRef, focusWithinProps, setHover, removeHover,
    listActionItems, isImmersive, isHovering, t,
  } = useReaderHeaderBase(actionKeys);

  const { preferences } = useAudioPreferences();

  return (
    <>
      <ThInteractiveOverlay
        className={ classNames(readerStyles.barOverlay, readerStyles.headerOverlay) }
        isActive={ layout === ThLayoutUI.layered && isImmersive && !isHovering }
        onMouseEnter={ setHover }
        onMouseLeave={ removeHover }
      />

      <div
        ref={ headerRef }
        className={ classNames(readerStyles.topBar, readerHeaderStyles.header) }
        onMouseEnter={ setHover }
        onMouseLeave={ removeHover }
        { ...focusWithinProps }
      >
        { preferences.theming.header?.backLink && <StatefulBackLink className={ readerHeaderStyles.backlinkWrapper } /> }

        <StatefulCollapsibleActionsBar
          id="reader-header-overflowMenu"
          items={ listActionItems() }
          prefs={{ ...preferences.actions.secondary, displayOrder: actionsOrder }}
          className={ readerHeaderStyles.actionsWrapper }
          aria-label={ t("reader.app.header.actions") }
          overflowMenuClassName={ overflowMenuStyles.hint }
        />
      </div>
    </>
  );
};
