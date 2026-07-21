"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nProvider } from "react-aria";

import { ThGlobalPreferences, createGlobalPreferences } from "./globalPreferences";
import { ThGlobalPreferencesContext } from "./ThGlobalPreferencesContext";
import { ThGlobalPreferencesAdapter } from "./adapters/ThGlobalPreferencesAdapter";
import { ThGlobalMemoryPreferencesAdapter } from "./adapters/ThGlobalMemoryPreferencesAdapter";
import { ThDirectionSetter } from "./ThDirectionSetter";

type Props = {
  adapter?: ThGlobalPreferencesAdapter;
  initialPreferences?: ThGlobalPreferences;
  children: React.ReactNode;
};

export function ThGlobalPreferencesProvider({ adapter, initialPreferences, children }: Props) {
  const effectiveAdapter = useMemo(
    () => adapter || new ThGlobalMemoryPreferencesAdapter(initialPreferences),
    [adapter, initialPreferences]
  );

  const [preferences, setPreferences] = useState<ThGlobalPreferences>(
    () => createGlobalPreferences(initialPreferences ?? {})
  );

  const handlePreferenceChange = useCallback((newPrefs: ThGlobalPreferences) => {
    setPreferences(prev => {
      const validated = createGlobalPreferences(newPrefs);
      return JSON.stringify(prev) === JSON.stringify(validated) ? prev : validated;
    });
  }, []);

  useEffect(() => {
    effectiveAdapter.subscribe(handlePreferenceChange);
    return () => effectiveAdapter.unsubscribe(handlePreferenceChange);
  }, [effectiveAdapter, handlePreferenceChange]);

  const contextValue = useMemo(() => ({
    preferences,
    updatePreferences: (newPrefs: ThGlobalPreferences) => {
      effectiveAdapter.setPreferences(newPrefs);
    },
  }), [preferences, effectiveAdapter]);

  return (
    <ThGlobalPreferencesContext.Provider value={ contextValue }>
      <I18nProvider locale={ preferences.locale }>
        <ThDirectionSetter>
          { children }
        </ThDirectionSetter>
      </I18nProvider>
    </ThGlobalPreferencesContext.Provider>
  );
}
