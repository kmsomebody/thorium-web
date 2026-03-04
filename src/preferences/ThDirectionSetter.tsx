"use client";

import { useEffect } from "react";

import { ThLayoutDirection } from "./models";

export const ThDirectionSetter = ({ 
  direction, 
  children 
}: { 
  direction?: ThLayoutDirection,
  children: React.ReactNode 
}) => {
  
  useEffect(() => {
    if (direction) document.documentElement.dir = direction;
  }, [direction]);

  return children;
};