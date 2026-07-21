"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useLocalStorage = (key: string | null) => {
  const [localData, setLocalData] = useState<any>(null);
  const cachedLocalData = useRef<any>(null);

  const setValue = useCallback((newValue: any) => {
    if (!key) return;
    setLocalData(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  const getValue = useCallback(() => {
    if (!key) return null;
    if (localData !== null) return localData;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, [key, localData]);

  const clearValue = useCallback(() => {
    if (!key) return;
    setLocalData(null);
    localStorage.removeItem(key);
  }, [key]);

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