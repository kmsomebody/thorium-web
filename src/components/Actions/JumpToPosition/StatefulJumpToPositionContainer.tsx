"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { ThActionsKeys } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import jumpToPositionStyles from "./assets/styles/thorium-web.jumpToPosition.module.css";

import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";
import { ThForm } from "@/core/Components/Form/ThForm";
import { ThFormNumberField } from "@/core/Components/Form/Fields/ThFormNumberField";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useDocking } from "../../Docking/hooks/useDocking";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";

export const StatefulJumpToPositionContainer = ({ 
  triggerRef 
}: StatefulActionContainerProps) => {
  const { t } = useI18n();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);

  const positionNumbers = useAppSelector(state => state.publication.unstableTimeline?.progression?.currentPositions);

  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const dispatch = useAppDispatch();

  const docking = useDocking(ThActionsKeys.jumpToPosition);
  const sheetType = docking.sheetType;

  const { go } = useEpubNavigator();

  // Component has to handle updates locally since EpubNavigator updates positions, 
  // so we use these as an intermediary
  const [position, setPosition] = useState(0);

  // Position Numbers can be a range so we must check position is in range
  // And not only that the array simply includes the position
  const positionInRange = useCallback(() => {
    if (!positionNumbers) return false;
    return positionNumbers.length === 2
      ? position >= positionNumbers[0] && position <= positionNumbers[1]
      : position === positionNumbers[0];
  }, [position, positionNumbers]);

  // Update the label to use react-i18next interpolation
  const label = t("reader.jumpToPosition.label", { positionStart: 1, positionEnd: positionsList.length });

  const setOpen = useCallback((value: boolean) => {
    dispatch(setActionOpen({
      key: ThActionsKeys.jumpToPosition,
      isOpen: value
    }));
  }, [dispatch]);

  // NumberField onChange won’t fire if the value has been typed
  // so we need to handle the input manually
  const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setPosition(parseInt(target.value));
  }, []);

  // This is a form submit handler so we have to preventDefault
  // We have to use this otherwise any change will trigger a navigation
  const handleAction = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!positionsList) return;

    const item = positionsList.find(item => item.locations.position === position);

    if (!item || positionInRange()) return setOpen(false);

    const cb = () => {
      setOpen(false);
      dispatch(setImmersive(true));
      dispatch(setUserNavigated(true));
    };
    
    go(item, !reducedMotion, cb);
  }, [position, positionsList, reducedMotion, positionInRange, go, setOpen, dispatch]);

  // Since we are using an intermediary local state, we must keep track when positionNumbers changes
  useEffect(() => {
    positionNumbers && setPosition(positionNumbers[0]);
  }, [positionNumbers]);

  // In case there is no positions list we return
  if (!positionsList) return null;

  return (
    <>
      <StatefulSheetWrapper
        sheetType={sheetType}
        sheetProps={{
          id: ThActionsKeys.jumpToPosition,
          triggerRef: triggerRef,
          heading: t("reader.actions.goToPosition.descriptive"),
          className: jumpToPositionStyles.wrapper,
          placement: "bottom",
          isOpen: actionState?.isOpen || false,
          onOpenChange: setOpen,
          onClosePress: () => setOpen(false),
          docker: docking.getDocker()
        }}
      >
        <ThForm
          label={ t("reader.jumpToPosition.go") }
          className={ jumpToPositionStyles.form }
          onSubmit={ handleAction }
          compounds={{
            button: {
              className: jumpToPositionStyles.button,
              isDisabled: !position || positionInRange()
            }
          }}
        >
          <ThFormNumberField
            label={ label }
            name="jumpToPosition"
            className={ jumpToPositionStyles.numberField }
            onChange={ setPosition }
            onInput={ handleInput }
            value={ position }
            minValue={ 1 }
            maxValue={ positionsList.length }
            step={ 1 }
            formatOptions={{ style: "decimal" }}
            isWheelDisabled={ true }
            compounds={{
              label: {
                className: jumpToPositionStyles.label
              },
              input: {
                className: jumpToPositionStyles.input,
                inputMode: "numeric"
              }
            }}
          />
        </ThForm>
      </StatefulSheetWrapper>
    </>
  )
}