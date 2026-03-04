"use client";

import { useCallback, useRef } from "react";

import settingsStyles from "./assets/styles/thorium-web.reader.settings.module.css";

import { ThActionsKeys, ThLayoutDirection, ThSettingsContainerKeys } from "@/preferences/models";

import { ThRadioGroup, ThRadioGroupProps } from "@/core/Components/Settings/ThRadioGroup";

import { useGridNavigation } from "./hooks/useGridNavigation";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setSettingsContainer } from "@/lib/readerReducer";

export interface StatefulRadioGroupProps extends Omit<ThRadioGroupProps, "classNames"> {
  standalone?: boolean;
  useGraphicalNavigation?: boolean;
  onEscape?: () => void;
}

export const StatefulRadioGroup = ({
  ref,
  standalone,
  useGraphicalNavigation = true,
  label,
  items,
  value,
  children,
  onChange,
  onEscape,
  ...props
}: StatefulRadioGroupProps) => {
  const itemsRef = useRef(items || []);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;
  const settingsContainer = useAppSelector(state => state.reader.settingsContainer);
  
  const dispatch = useAppDispatch();

  // Default escape handler that adapts to context
  const onEscapeCallback = useCallback(() => {
    if (settingsContainer !== ThSettingsContainerKeys.initial) {
      // In subpanel - go back to initial view
      dispatch(setSettingsContainer(ThSettingsContainerKeys.initial));
    } else {
      // In main panel - close settings
      dispatch(setActionOpen({
        key: ThActionsKeys.settings,
        isOpen: false
      }));
    }
  }, [dispatch, settingsContainer]);

  // Default focus handler that focuses elements by value within the container only
  const onFocusCallback = useCallback((value: string) => {
    const element = wrapperRef.current?.querySelector(`[value="${ value }"]`);
    if (element) (element as HTMLElement).focus();
  }, []);

  const { onKeyDown } = useGridNavigation({
    containerRef: wrapperRef,
    items: useGraphicalNavigation !== false ? itemsRef : { current: [] },
    currentValue: useGraphicalNavigation !== false ? value : null,
    onChange: onChange || (() => {}),
    isRTL,
    onEscape: onEscape || onEscapeCallback,
    onFocus: onFocusCallback
  });

return (
  <>
  <ThRadioGroup 
    ref={ ref }
    className={ standalone ? settingsStyles.group : "" }
    { ...props }
    { ...(standalone ? { label: label } : { "aria-label": label }) }
    value={ value }
    onChange={ onChange }
    items={ useGraphicalNavigation !== false ? items : [] }
    compounds={{
      wrapper: {
        className: settingsStyles.radioWrapper,
        ref: wrapperRef
      },
      label: {
        className: settingsStyles.label
      },
      radio: {
        className: settingsStyles.radio,
        onKeyDown: useGraphicalNavigation !== false ? onKeyDown : undefined
      }
    }}
  >
    { children }
  </ThRadioGroup>
  </>
  )
};