import { useMemo } from "react";
import { IKeyboardPeripheralsConfig } from "@readium/navigator";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { NavPeripheralType, toActionPeripheralType, ZOOM_IN_KEY_COMBOS, ZOOM_OUT_KEY_COMBOS } from "@/helpers/peripherals";

export const useWebPubKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  const { actionsKeys } = useActionsPreferences();

  return useMemo(() => {
    const config: IKeyboardPeripheralsConfig = [
      { type: NavPeripheralType.zoomIn,  keyCombos: [...ZOOM_IN_KEY_COMBOS]  },
      { type: NavPeripheralType.zoomOut, keyCombos: [...ZOOM_OUT_KEY_COMBOS] },
    ];

    for (const [key, tokens] of Object.entries(actionsKeys)) {
      const shortcut = tokens?.shortcut;
      if (shortcut) config.push({ type: toActionPeripheralType(key), keyCombos: shortcut.keyCombos });
    }

    return config;
  }, [actionsKeys]);
};
