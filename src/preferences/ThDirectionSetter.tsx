"use client";

import { useEffect } from "react";
import { useLocale } from "react-aria";

export const ThDirectionSetter = ({ children }: { children: React.ReactNode }) => {
  const { direction } = useLocale();

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return children;
};
