"use client";

export const validateObjectKeys = <K extends string, V>(
  orderArrays: K[][],
  keysObj: Record<string, V>,
  context: string,
  specialCase?: string | string[],
  fallback?: V
): void => {
  const allOrders = new Set<K>(
    orderArrays.flatMap(arr => {
      if (!specialCase) return arr;
      return arr.filter(k => {
        if (Array.isArray(specialCase)) {
          return !specialCase.includes(k);
        } else {
          return k !== specialCase;
        }
      });
    })
  );

  const availableKeys = Object.keys(keysObj);

  allOrders.forEach(key => {
    if (!availableKeys.includes(key)) {
      if (fallback) keysObj[key] = fallback;
      console.warn(
        `Key "${ key }" in ${ context } order arrays not found in ${ context }.keys.${ fallback ? `\nUsing fallback: ${ JSON.stringify(fallback) }` : "" }`
      );
    }
  });
};
