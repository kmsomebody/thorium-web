import { useEffect, useRef } from "react";
import { ObservableCondition } from "@readium/navigator-html-injectables";

export const useObservableCondition = (value: boolean): ObservableCondition => {
  const listeners = useRef(new Set<(v: boolean) => void>());
  const current = useRef(value);

  const condition = useRef<ObservableCondition>({
    subscribe(cb) {
      listeners.current.add(cb);
      cb(current.current);
      return () => listeners.current.delete(cb);
    },
  }).current;

  useEffect(() => {
    if (current.current === value) return;
    current.current = value;
    listeners.current.forEach(cb => cb(value));
  }, [value]);

  return condition;
};
