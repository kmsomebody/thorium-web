"use client";

import React, { Fragment } from "react";

import { ThActionEntry, ThActionsBar, ThActionsBarProps, ThActionsTriggerVariant } from "./ThActionsBar";
import { ThMenu, THMenuProps } from "../Menu/ThMenu";

import { useObjectRef } from "react-aria";
import { CollapsiblePref, useCollapsibility } from "./hooks/useCollapsibility";

export interface ThCollapsibleActionsBarProps extends ThActionsBarProps {
  id: string;
  items: ThActionEntry<string>[];
  prefs: CollapsiblePref;
  breakpoint?: string;
  targetPlacement?: "top" | "bottom";
  children?: never;
  compounds?: {
    menu: THMenuProps<string> | React.ReactElement<typeof ThMenu>;
  }
}

export const ThCollapsibleActionsBar = ({
  ref,
  id,
  items,
  prefs,
  breakpoint,
  targetPlacement = "bottom",
  compounds,
  ...props
}: ThCollapsibleActionsBarProps) => {
  const resolvedRef = useObjectRef(ref);
  const Actions = useCollapsibility(items, prefs, breakpoint);

  return (
    <>
    <ThActionsBar 
      ref={ resolvedRef }
      { ...props }
    >
      { Actions.ActionIcons.map(({ Trigger, Target, key, associatedKey }) => 
          <Fragment key={ key }>
            <Trigger 
              key={ `${ key }-trigger` } 
              variant={ ThActionsTriggerVariant.button }
              { ...(associatedKey ? { associatedKey: associatedKey } : {}) } 
              { ...props }
            />
            { Target && <Target key={ `${ key }-container` } triggerRef={ resolvedRef } placement={ targetPlacement } /> }
          </Fragment>
        ) 
      }

      { React.isValidElement(compounds?.menu) 
        ? (React.cloneElement(compounds.menu, {
          ...compounds.menu.props,
          id: id,
          triggerRef: resolvedRef,
          items: Actions.MenuItems,
          dependencies: ["Trigger"],
        } as THMenuProps<string>)) 
        : (<ThMenu 
          id={ id } 
          triggerRef={ resolvedRef }
          items={ Actions.MenuItems }
          dependencies={ ["Trigger"] }
          { ...compounds?.menu }
        />
      )}
    </ThActionsBar>
    </>
  )
}
