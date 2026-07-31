"use client";

import React, { useRef } from "react";

import { WithRef } from "../customTypes";

import { Menu, MenuProps, MenuTrigger, MenuTriggerProps, Popover, PopoverProps } from "react-aria-components";

import { ThMenuButton } from "./ThMenuButton";
import { ThActionButtonProps } from "../Buttons";
import { ThActionEntry, ThActionsTriggerVariant } from "../Actions/ThActionsBar";
import { useSharedPreferences } from "@/preferences";

export interface THMenuProps<T> extends MenuProps<ThActionEntry<T>> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  triggerRef?: React.RefObject<HTMLElement | null>;
  items?: Iterable<ThActionEntry<T>>;
  children?: never;
  compounds?: {
    /**
     * Props for the trigger component. See `MenuTriggerProps` for more information.
     */
    menuTrigger?: Omit<WithRef<MenuTriggerProps, HTMLDivElement>, "children">;
    /**
     * Props for the button component. See `ThActionButtonProps` for more information.
     * Alternatively you can provide your own component
     */
    button?: ThActionButtonProps | React.ReactElement<ThActionButtonProps>;
    /**
     * Props for the popover component. See `PopoverProps` for more information.
     */
    popover?: WithRef<PopoverProps, HTMLDivElement>;
  }
}

export const ThMenu = ({
  ref,
  id,
  triggerRef,
  items,
  dependencies,
  compounds,
  ...props
}: THMenuProps<string>) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { theming } = useSharedPreferences();

  if (items) {
    return (
      <>
      <MenuTrigger 
        { ...compounds?.menuTrigger }
      >
      { compounds?.button && React.isValidElement(compounds.button) 
        ? compounds.button 
        : <ThMenuButton 
            ref={ buttonRef }
            { ...compounds?.button as ThActionButtonProps }
          />
        }
        <Popover 
          { ...compounds?.popover } 
          className={(state) => {
            const className = compounds?.popover?.className;
            const pref = theming.classNames?.menu;
            const cls = typeof className === "function" ? className(state) : className;
            return [pref, cls].filter((v) => !!v).join(" ");
          }}
        >
          <Menu 
            ref={ ref }
            id={ id }
            dependencies={ dependencies }
            { ...props }
          >
            { Array.from(items).map(({ Trigger, key, associatedKey }) => 
              <Trigger 
                key={ `${ key }-menuItem` } 
                variant={ ThActionsTriggerVariant.menu }
                { ...(associatedKey ? { associatedKey: associatedKey } : {}) } 
                { ...props }
              />
            )}
          </Menu>
        </Popover>
      </MenuTrigger>
      { Array.from(items).map(({ Target, key }) => 
        Target && <Target key={ `${ key }-container` } triggerRef={ triggerRef || buttonRef } { ...props } />
      )}
      </>
    )
  }
}