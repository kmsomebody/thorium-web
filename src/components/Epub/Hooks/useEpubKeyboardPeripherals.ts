import { useMemo } from "react";
import { IKeyboardPeripheralsConfig } from "@readium/navigator";
import { useIsScroll } from "@/hooks";
import { useObservableCondition } from "@/core/Hooks/useObservableCondition";
import { NavPeripheralType, toActionPeripheralType, ZOOM_IN_KEY_COMBOS, ZOOM_OUT_KEY_COMBOS } from "@/helpers/peripherals";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useAppSelector } from "@/lib/hooks";

export const useEpubKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  const isScroll = useIsScroll();
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const noScroll = useObservableCondition(!isScroll);
  const zoomActive = useObservableCondition(!isFXL);
  const { actionsKeys } = useActionsPreferences();

  return useMemo(() => {
    const config: IKeyboardPeripheralsConfig = [
      { type: NavPeripheralType.progressForward,  keyCombos: [{ keyCode: 32,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.progressBackward, keyCombos: [{ keyCode: 32, shift: true, suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveRight,        keyCombos: [{ keyCode: 39,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveLeft,         keyCombos: [{ keyCode: 37,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveUp,           keyCombos: [{ keyCode: 38,              suppressOnInteractiveElement: true, condition: noScroll },
                                                              { keyCode: 33,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveDown,         keyCombos: [{ keyCode: 40,              suppressOnInteractiveElement: true, condition: noScroll },
                                                              { keyCode: 34,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveHome,         keyCombos: [{ keyCode: 36,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveEnd,          keyCombos: [{ keyCode: 35,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.zoomIn,           keyCombos: ZOOM_IN_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive }))  },
      { type: NavPeripheralType.zoomOut,          keyCombos: ZOOM_OUT_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive })) },
    ];

    for (const [key, tokens] of Object.entries(actionsKeys)) {
      const shortcut = tokens?.shortcut;
      if (shortcut) config.push({ type: toActionPeripheralType(key), keyCombos: shortcut.keyCombos });
    }

    return config;
  }, [noScroll, zoomActive, actionsKeys]);
};
