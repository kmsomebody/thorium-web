"use client";

import { useCallback, useEffect } from "react";

import { Link } from "@readium/shared";
import { ThAudioActionKeys, ThSheetTypes, ThLayoutDirection } from "@/preferences/models";

import { useTocContent } from "@/components/Actions/Toc/useTocContent";
import { TocContent } from "@/components/Actions/Toc/TocContent";

import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { isActiveElement } from "@/core/Helpers/focusUtilities";
import { useDocking } from "../../../Docking/hooks/useDocking";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { findTocItemById } from "@/helpers/buildTocTree";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";

import { Selection } from "react-aria-components";

export const StatefulAudioTocContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { goLink } = useNavigator().unified;
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(state => profile ? state.actions.keys[profile][ThAudioActionKeys.toc]?.isOpen ?? false : false);
  const unstableTimeline = useAppSelector(state => state.publication.unstableTimeline);
  const tocEntry = unstableTimeline?.toc?.currentEntry ?? undefined;
  const tocEntryId = tocEntry?.id;
  const tocTree = unstableTimeline?.toc?.tree;

  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const docking = useDocking(ThAudioActionKeys.toc);
  const sheetType = docking.sheetType;

  const setOpen = useCallback((value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: ThAudioActionKeys.toc, isOpen: value, profile }));
    }
  }, [dispatch, profile]);

  const { expandedKeys, setExpandedKeys, filterValue, setFilterValue, displayedTocTree, treeRef, searchInputRef } =
    useTocContent({ isOpen, tocTree, tocEntry: tocEntryId });

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (event: KeyboardEvent) => {
        if ((!isActiveElement(searchInputRef.current) && !filterValue) && event.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape, true);
      return () => document.removeEventListener("keydown", handleEscape, true);
    }
  }, [isOpen, filterValue, searchInputRef, setOpen]);

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;
    const key = [...keys][0];
    const el = document.querySelector(`[data-key=${key}]`);
    const href = el?.getAttribute("data-href");
    if (!href) return;
    const matched = findTocItemById(tocTree || [], key as string);

    const cb = isOpen && (sheetType === ThSheetTypes.dockedStart || sheetType === ThSheetTypes.dockedEnd)
      ? () => {
          dispatch(setTocEntry(matched || null));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
        }
      : () => {
          dispatch(setTocEntry(matched || null));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
          setOpen(false);
        };

    goLink(new Link({ href }), true, cb);
  };

  return (
    <StatefulSheetWrapper
      sheetType={ sheetType }
      sheetProps={ {
        id: ThAudioActionKeys.toc,
        triggerRef,
        heading: t("reader.tableOfContents.title"),
        className: "",
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
        resetFocus: tocEntryId,
        focusWithinRef: treeRef,
      } }
    >
      <TocContent
        filterValue={ filterValue }
        onFilterChange={ setFilterValue }
        displayedTocTree={ displayedTocTree }
        tocTree={ tocTree }
        tocEntry={ tocEntryId }
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
