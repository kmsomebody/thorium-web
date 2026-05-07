"use client";

import { ReactNode, useEffect } from "react";

import { ThActionsKeys, ThSheetHeaderVariant } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import settingsStyles from "../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";

import { useDocking } from "../../Docking/hooks/useDocking";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

interface StatefulSettingsWrapperProps extends StatefulActionContainerProps {
  heading: string;
  headerVariant: ThSheetHeaderVariant;
  onClosePress: () => void;
  dismissEscapeKeyClose?: boolean;
  resetFocus?: unknown;
  onReset?: () => void;
  children: ReactNode;
}

export const StatefulSettingsWrapper = ({
  triggerRef,
  heading,
  headerVariant,
  onClosePress,
  dismissEscapeKeyClose,
  resetFocus,
  onReset,
  children
}: StatefulSettingsWrapperProps) => {
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.settings]);
  const dispatch = useAppDispatch();
  const docking = useDocking(ThActionsKeys.settings);

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({
      key: ThActionsKeys.settings,
      isOpen: value
    }));
    if (!value) dispatch(setHovering(false));
  };

  useEffect(() => {
    if (!actionState?.isOpen) onReset?.();
  }, [actionState?.isOpen, onReset]);

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: ThActionsKeys.settings,
        triggerRef,
        heading,
        headerVariant,
        className: settingsStyles.wrapper,
        placement: "bottom",
        isOpen: actionState?.isOpen || false,
        onOpenChange: setOpen,
        onClosePress,
        docker: docking.getDocker(),
        resetFocus,
        scrollTopOnFocus: true,
        dismissEscapeKeyClose
      } }
    >
      { children }
    </StatefulSheetWrapper>
  );
};
