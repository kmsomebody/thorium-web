import { Store } from "@reduxjs/toolkit";

import { ThGlobalPreferences } from "@/preferences/globalPreferences";
import { ThGlobalPreferencesAdapter } from "@/preferences/adapters/ThGlobalPreferencesAdapter";
import { AppState } from "@/lib/store";
import { setLocale } from "@/lib/globalPreferencesReducer";

export class ThReduxGlobalPreferencesAdapter implements ThGlobalPreferencesAdapter {
  private store: Store<AppState>;
  private listeners: Set<(prefs: ThGlobalPreferences) => void> = new Set();
  private currentPreferences: ThGlobalPreferences;

  constructor(store: Store<AppState>, initialPreferences: ThGlobalPreferences = {}) {
    this.store = store;
    this.currentPreferences = initialPreferences;

    this.store.subscribe(() => {
      const locale = this.store.getState().globalPreferences?.locale;
      const next: ThGlobalPreferences = { locale };
      if (JSON.stringify(next) !== JSON.stringify(this.currentPreferences)) {
        this.currentPreferences = next;
        this.notifyListeners(next);
      }
    });
  }

  getPreferences(): ThGlobalPreferences {
    return { ...this.currentPreferences };
  }

  setPreferences(prefs: ThGlobalPreferences): void {
    this.currentPreferences = { ...prefs };
    this.store.dispatch(setLocale(prefs.locale));
    this.notifyListeners(this.currentPreferences);
  }

  subscribe(callback: (prefs: ThGlobalPreferences) => void): void {
    this.listeners.add(callback);
    callback(this.getPreferences());
  }

  unsubscribe(callback: (prefs: ThGlobalPreferences) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(prefs: ThGlobalPreferences): void {
    const copy = { ...prefs };
    this.listeners.forEach(cb => cb(copy));
  }
}
