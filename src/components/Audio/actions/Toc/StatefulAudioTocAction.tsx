"use client";

import { useCallback, useRef } from "react";

import { Link } from "@readium/shared";
import { ThAudioActionKeys, ThLayoutDirection } from "@/preferences/models";

import TocIcon from "@/components/Actions/Toc/assets/icons/toc.svg";
import { useTocContent } from "@/components/Actions/Toc/useTocContent";
import { TocContent } from "@/components/Actions/Toc/TocContent";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";

import { Dialog, Popover, Selection } from "react-aria-components";
import { FocusScope } from "react-aria";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader/ThContainerHeader";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen, toggleActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";

export const StatefulAudioTocAction = ({ isDisabled }: { isDisabled: boolean }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { t } = useI18n();
  const { goLink } = useNavigator().unified;
  const dispatch = useAppDispatch();

  const isOpen = useAppSelector(state => state.actions.keys[ThAudioActionKeys.toc]?.isOpen ?? false);
  const unstableTimeline = useAppSelector(state => state.publication.unstableTimeline);
  const tocEntry = unstableTimeline?.toc?.currentEntry ?? undefined;
  const tocTree = unstableTimeline?.toc?.tree;

  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const setOpen = useCallback((value: boolean) => {
    dispatch(setActionOpen({ key: ThAudioActionKeys.toc, isOpen: value }));
  }, [dispatch]);

  const { expandedKeys, setExpandedKeys, filterValue, setFilterValue, displayedTocTree, treeRef, searchInputRef } =
    useTocContent({ isOpen, tocTree, tocEntry });

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;
    const key = [...keys][0];
    const el = document.querySelector(`[data-key=${key}]`);
    const href = el?.getAttribute("data-href");
    if (!href) return;
    goLink(new Link({ href }), true, () => {
      dispatch(setTocEntry(key));
      dispatch(setImmersive(true));
      dispatch(setUserNavigated(true));
      setOpen(false);
    });
  };

  return (
    <>
      <StatefulActionIcon
        ref={ triggerRef }
        tooltipLabel={ t("reader.tableOfContents.title") }
        placement="top"
        onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.toc })) }
        isDisabled={ isDisabled }
        className={ audioStyles.audioTocButton }
      >
        <TocIcon aria-hidden="true" focusable="false" />
      </StatefulActionIcon>
      <Popover
        triggerRef={ triggerRef }
        isOpen={ isOpen }
        onOpenChange={ setOpen }
        placement="top"
        className={ `${ audioStyles.audioControlPopover } ${ audioStyles.audioTocPopover }` }
      >
        <Dialog className={ audioStyles.audioControlPopoverDialog }>
          <FocusScope contain>
            <ThContainerHeader
              label={ t("reader.tableOfContents.title") }
              compounds={{ heading: { className: audioStyles.audioControlPopoverHeading } }}
            />
            <div className={ audioStyles.audioTocContent }>
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
                compounds={{ treeWrapper: { className: audioStyles.audioTocTree } }}
              />
            </div>
          </FocusScope>
        </Dialog>
      </Popover>
    </>
  );
};
