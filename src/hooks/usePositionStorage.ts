"use client";

import { useState } from "react";
import { Locator } from "@readium/shared";
import { PositionStorage } from "@/components/Reader/StatefulReaderWrapper";
import { useLocalStorage } from "../core/Hooks/useLocalStorage";

export const usePositionStorage = (key: string | null, customStorage?: PositionStorage) => {
  const localStorageData = useLocalStorage(key);
  const [customData, setCustomData] = useState<Locator | null>(() => 
    customStorage ? (customStorage.get() || null) : null
  );
  
  if (customStorage) {
    const set = (newValue: Locator | null) => {
      if (newValue) {
        customStorage.set(newValue);
      }
      setCustomData(newValue);
    };
    
    const get = () => customData;
    
    return {
      setLocalData: set,
      getLocalData: get,
      localData: customData
    };
  }
  
  return localStorageData;
};
