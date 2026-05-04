"use client";

import { useEffect, useRef, useState } from "react";

export const useLocalStorage = (key: string | null) => {
  const [localData, setLocalData] = useState<any>(null);
  const cachedLocalData = useRef<any>(null);

  const setValue = (newValue: any) => {
    if (!key) return;
    setLocalData(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  const getValue = () => {
    if (!key) return null;
    if (localData !== null) return localData;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const clearValue = () => {
    if (!key) return;
    setLocalData(null);
    localStorage.removeItem(key);
  };

  useEffect(() => {
    if (!key) return;
    cachedLocalData.current = localData;
  }, [localData, key]);

  return {
    setLocalData: setValue,
    getLocalData: getValue,
    clearLocalData: clearValue,
    localData: key ? localData : null,
    cachedLocalData
  };
};