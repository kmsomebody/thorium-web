"use client";

import { useCallback, useEffect } from "react";

import { Link } from "@readium/shared";
import { ThActionsKeys, ThDockingKeys, ThSheetTypes, ThLayoutDirection } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import tocStyles from "./assets/styles/thorium-web.toc.module.css";

import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";
import { Selection } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useDocking } from "../../Docking/hooks/useDocking";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";

import { isActiveElement } from "@/core/Helpers/focusUtilities";

import { useTocContent } from "./useTocContent";
import { TocContent } from "./TocContent";

export const StatefulTocContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const { t } = useI18n();

  const unstableTimeline = useAppSelector(state => state.publication.unstableTimeline);
  const tocEntry = unstableTimeline?.toc?.currentEntry ?? undefined;
  const tocTree = unstableTimeline?.toc?.tree;

  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.toc]);
  const dispatch = useAppDispatch();

  const { goLink } = useNavigator().unified;
  const docking = useDocking(ThActionsKeys.toc);
  const sheetType = docking.sheetType;

  const setOpen = useCallback((value: boolean) => {
    dispatch(setActionOpen({ key: ThActionsKeys.toc, isOpen: value }));
  }, [dispatch]);

  const { expandedKeys, setExpandedKeys, filterValue, setFilterValue, displayedTocTree, treeRef, searchInputRef } =
    useTocContent({ isOpen: actionState?.isOpen ?? false, tocTree, tocEntry });

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;

    const key = [...keys][0];
    const el = document.querySelector(`[data-key=${key}]`);
    const href = el?.getAttribute("data-href");

    if (!href) return;

    const link: Link = new Link({ href: href });

    const cb = actionState?.isOpen &&
      (sheetType === ThSheetTypes.dockedStart || sheetType === ThSheetTypes.dockedEnd)
        ? () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
        }
        : () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
          setOpen(false);
        };

    goLink(link, true, cb);
  };

  // Since React Aria components intercept keys and do not continue propagation
  // we have to handle the escape key in capture phase
  useEffect(() => {
    if (actionState?.isOpen && (!actionState?.docking || actionState?.docking === ThDockingKeys.transient)) {
      const handleEscape = (event: KeyboardEvent) => {
        if ((!isActiveElement(searchInputRef.current) && !filterValue) && event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape, true);

      return () => {
        document.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [actionState, setOpen, filterValue, searchInputRef]);

  return (
    <StatefulSheetWrapper
      sheetType={ sheetType }
      sheetProps={ {
        id: ThActionsKeys.toc,
        triggerRef: triggerRef,
        heading: t("reader.tableOfContents.title"),
        className: tocStyles.wrapper,
        placement: "bottom",
        isOpen: actionState?.isOpen || false,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
        resetFocus: tocEntry,
        focusWithinRef: treeRef
      } }
    >
      <TocContent
        filterValue={ filterValue }
        onFilterChange={ setFilterValue }
        displayedTocTree={ displayedTocTree }
        tocTree={ tocTree }
        tocEntry={ tocEntry }
        expandedKeys={ expandedKeys }
        onExpandedChange={ setExpandedKeys }
        onSelectionChange={ handleAction }
        isRTL={ isRTL }
        treeRef={ treeRef }
        searchInputRef={ searchInputRef }
      />
    </StatefulSheetWrapper>
  );
};
