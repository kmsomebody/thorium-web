"use client";

import { ReactNode, useMemo } from "react";
import { useStore } from "react-redux";

import { ThGlobalPreferences } from "@/preferences/globalPreferences";
import { ThGlobalPreferencesProvider } from "@/preferences/ThGlobalPreferencesProvider";
import { ThReduxGlobalPreferencesAdapter } from "@/lib/ThReduxGlobalPreferencesAdapter";

import { RootState } from "@/lib/store";

export const StatefulGlobalPreferencesProvider = ({
  children,
  initialPreferences = {},
}: {
  children: ReactNode;
  initialPreferences?: ThGlobalPreferences;
}) => {
  const store = useStore<RootState>();

  const adapter = useMemo(
    () => new ThReduxGlobalPreferencesAdapter(store, initialPreferences),
    [store, initialPreferences]
  );

  return (
    <ThGlobalPreferencesProvider adapter={ adapter } initialPreferences={ initialPreferences }>
      { children }
    </ThGlobalPreferencesProvider>
  );
};
