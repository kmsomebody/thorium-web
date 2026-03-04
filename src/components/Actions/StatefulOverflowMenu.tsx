"use client";

import React, { ReactNode, RefObject } from "react";

import overflowMenuStyles from "./assets/styles/thorium-web.overflow.module.css";

import MenuIcon from "./assets/icons/more_vert.svg";

import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { ThMenu } from "@/core/Components/Menu/ThMenu";
import { ThActionsKeys, ThDockingKeys } from "@/preferences/models";
import { StatefulActionIcon } from "./Triggers/StatefulActionIcon";
import { ThActionEntry } from "@/core/Components/Actions/ThActionsBar";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setOverflow } from "@/lib/actionsReducer";

export interface StatefulOverflowMenuProps {
  id: string;
  items: ThActionEntry<string | ThActionsKeys | ThDockingKeys>[];
  triggerRef: RefObject<HTMLElement | null>;
  className?: string;
  children?: ReactNode;
}

export const StatefulOverflowMenu = ({ 
  id,
  className, 
  items,
  triggerRef
}: StatefulOverflowMenuProps) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const toggleMenuState = (value: boolean) => {
    dispatch(setOverflow({
      key: id,
      isOpen: value
    }));
  }

  if (items.length > 0) {
    return (
      <>
      <ThMenu 
        id={ id }
        triggerRef={ triggerRef }
        selectionMode="none" 
        className={ overflowMenuStyles.menu }
        dependencies={ ["Trigger"] }
        items={ items }
        compounds={{
          menuTrigger: {
            onOpenChange: (val: boolean) => toggleMenuState(val)
          },
          popover: {
            placement: "bottom",
            className: overflowMenuStyles.popover
          },
          button: (
            <StatefulActionIcon
              className={ className ? className : overflowMenuStyles.button }
              aria-label={ t("reader.overflowMenu.active.trigger") }
              placement="bottom"
              tooltipLabel={ t("reader.overflowMenu.active.tooltip") }
              visibility={ ThCollapsibilityVisibility.always }
            >
              <MenuIcon aria-hidden="true" focusable="false" />
            </StatefulActionIcon>
          ),
        }}
      />
      </>
    )
  }
}