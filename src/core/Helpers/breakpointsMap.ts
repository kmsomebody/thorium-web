"use client";

import { ThBreakpoints } from "@/preferences/models";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";

export const makeBreakpointsMap = <T>({
  defaultValue,
  fromEnum,
  pref,
  disabledValue,
  validateKey
}: {
  defaultValue: T;
  fromEnum: any;
  pref?: BreakpointsMap<T> | boolean;
  disabledValue?: T;
  validateKey?: string;
}): Required<BreakpointsMap<T>> => {
  
  const isValidType = (value: any): boolean => {
    if (!validateKey) return true;
    
    // Helper to get nested property
    const getNestedValue = (obj: any, path: string) => 
      path.split(".").reduce((o, p) => o?.[p], obj);
    
    const valueToCheck = getNestedValue(value, validateKey);
    if (valueToCheck === undefined) return false;
    
    if (Array.isArray(valueToCheck)) {
      return valueToCheck.every(v => Object.values(fromEnum).includes(v));
    }
    return Object.values(fromEnum).includes(valueToCheck);
  };

  const breakpointsMap: Required<BreakpointsMap<T>> = {
    [ThBreakpoints.compact]: defaultValue,
    [ThBreakpoints.medium]: defaultValue,
    [ThBreakpoints.expanded]: defaultValue,
    [ThBreakpoints.large]: defaultValue,
    [ThBreakpoints.xLarge]: defaultValue
  };

  if (typeof pref === "boolean" || pref instanceof Boolean) {
    if (!pref && disabledValue) {
      Object.values(ThBreakpoints).forEach((key) => {
        breakpointsMap[key] = disabledValue;
      });
    }
  } else if (typeof pref === "string" && (!validateKey || isValidType(pref))) {
    Object.values(ThBreakpoints).forEach((key) => {
      breakpointsMap[key] = pref as unknown as T;
    });
  } else if (typeof pref === "object") {
    Object.entries(pref).forEach(([key, value]) => {
      if (!value) return;
      
      const isValid = !validateKey || isValidType(value);
        
      if (isValid) {
        // Merge the default value with the breakpoint-specific overrides
        if (typeof value === "object" && !Array.isArray(value)) {
          breakpointsMap[key as ThBreakpoints] = {
            ...defaultValue,
            ...value
          };
        } else {
          breakpointsMap[key as ThBreakpoints] = value as T;
        }
      }
    });
  }

  return breakpointsMap;
};