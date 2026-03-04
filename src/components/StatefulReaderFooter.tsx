"use client";

import React, { useCallback, useEffect, useRef } from "react";

import readerStyles from "./assets/styles/thorium-web.reader.app.module.css";
import readerPaginationStyles from "./assets/styles/thorium-web.reader.pagination.module.css";

import { ThBreakpoints, ThLayoutUI, ThFormatPref, ThProgressionFormat } from "@/preferences/models";

import { ThFooter } from "@/core/Components/Reader/ThFooter";
import { StatefulReaderProgression } from "./StatefulReaderProgression";
import { ThInteractiveOverlay } from "../core/Components/Reader/ThInteractiveOverlay";
import { StatefulReaderPagination } from "./StatefulReaderPagination";
import { ThPaginationLinkProps } from "@/core/Components/Reader/ThPagination";

import { useNavigator } from "@/core/Navigator";
import { useFocusWithin } from "react-aria";
import { useI18n } from "@/i18n/useI18n";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

export const StatefulReaderFooter = ({
  layout,
  progressionFormatPref,
  progressionFormatFallback
}: {
  layout: ThLayoutUI;
  progressionFormatPref?: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]>;
  progressionFormatFallback: ThProgressionFormat | ThProgressionFormat[];
}) => {
  const { t } = useI18n();
  const footerRef = useRef<HTMLDivElement>(null);
  const readerProfile = useAppSelector(state => state.reader.profile);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);
  const hasScrollAffordance = useAppSelector(state => state.reader.hasScrollAffordance);
  const scroll = useAppSelector(state => state.settings.scroll);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isScroll = scroll && !isFXL;
  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const timeline = useAppSelector(state => state.publication.unstableTimeline);

  const dispatch = useAppDispatch();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin() {
      dispatch(setHovering(true));
    },
    onBlurWithin() {
      dispatch(setHovering(false));
    }
  });

  const setHover = () => {
    if (!hasScrollAffordance) {
      dispatch(setHovering(true));
    }
  };

  const removeHover = () => {
    if (!hasScrollAffordance) {
      dispatch(setHovering(false));
    }
  };

  const { previousLocator, nextLocator, go } = useNavigator();

  const updateLinks = useCallback(() => {
    const links: { previous?: ThPaginationLinkProps; next?: ThPaginationLinkProps } = {
      previous: undefined,
      next: undefined
    };

    const previous = previousLocator();
    const next = nextLocator();

    if (previous) {
      links.previous = {
        node: breakpoint !== ThBreakpoints.compact && breakpoint !== ThBreakpoints.medium ? (
          <>
            <span className={ readerStyles.srOnly }>{ t(isFXL ? "reader.actions.goToPreviousPage.descriptive" : "reader.actions.goToPreviousChapter.descriptive") }</span>
            <span className={ readerPaginationStyles.label }>{ timeline?.previousItem?.title || previous.title || t(isFXL ? "reader.actions.goToPreviousPage.compact" : "reader.actions.goToPreviousChapter.compact") }</span>
          </>
        ) : (
          <>
            <span className={ readerPaginationStyles.label }>{ t(isFXL ? "reader.actions.goToPreviousPage.compact" : "reader.actions.goToPreviousChapter.compact") }</span>
          </>
        ),
        onPress: () => go(previous, !reducedMotion, () => {})
      }
    }

    if (next) {
      links.next = {
        node: breakpoint !== ThBreakpoints.compact && breakpoint !== ThBreakpoints.medium ? (
          <>
            <span className={ readerStyles.srOnly }>{ t(isFXL ? "reader.actions.goToNextPage.descriptive" : "reader.actions.goToNextChapter.descriptive") }</span>
            <span className={ readerPaginationStyles.label }>{ timeline?.nextItem?.title || next.title || t(isFXL ? "reader.actions.goToNextPage.compact" : "reader.actions.goToNextChapter.compact") }</span>
          </>
        ) : ( 
          <>
            <span className={ readerPaginationStyles.label }>{ t(isFXL ? "reader.actions.goToNextPage.compact" : "reader.actions.goToNextChapter.compact") }</span>
          </>
        ),
        onPress: () => go(next, !reducedMotion, () => {})
      }
    }

    return links;
  }, [go, previousLocator, nextLocator, t, timeline, breakpoint, reducedMotion, isFXL]);

  useEffect(() => {
    updateLinks();
  }, [timeline, updateLinks]);

  useEffect(() => {
    // Blur any focused element when entering immersive mode
    if (isImmersive) {
      const focusElement = document.activeElement;
      if (focusElement && footerRef.current?.contains(focusElement)) {
        (focusElement as HTMLElement).blur();
      }
    }
  }, [isImmersive]);

  return(
    <>
    <ThInteractiveOverlay 
      className={ classNames(readerStyles.barOverlay, readerStyles.footerOverlay) }
      isActive={ layout === ThLayoutUI.layered && isImmersive && !isHovering }
      onMouseEnter={ setHover }
      onMouseLeave={ removeHover }
    />
    
    <ThFooter 
      ref={ footerRef }
      className={ readerStyles.bottomBar }
      aria-label={ t("reader.app.footer.label") } 
      onMouseEnter={ setHover } 
      onMouseLeave={ removeHover }
      { ...focusWithinProps }
    >
      { (isScroll || readerProfile === "webPub")
        ? <StatefulReaderPagination 
            aria-label={ t("reader.navigation.scroll.wrapper") }
            links={ updateLinks() } 
            compounds={ {
              listItem: {
                className: readerPaginationStyles.listItem
              },
              previousButton: {
                className: readerPaginationStyles.previousButton,
                preventFocusOnPress: true
              },
              nextButton: {
                className: readerPaginationStyles.nextButton,
                preventFocusOnPress: true
              }
            } } 
          >
            <StatefulReaderProgression 
              className={ readerPaginationStyles.progression } 
              formatPref={ progressionFormatPref }
              fallbackVariant={ progressionFormatFallback }
            />
          </StatefulReaderPagination> 
        : <StatefulReaderProgression 
            formatPref={ progressionFormatPref }
            fallbackVariant={ progressionFormatFallback }
          /> }
    </ThFooter>
    </>
  )
}