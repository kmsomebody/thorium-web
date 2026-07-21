import { Store } from "@reduxjs/toolkit";

import { ThPreferences, CustomizableKeys } from "../preferences/preferences";

import { ThPreferencesAdapter } from "../preferences/adapters/ThPreferencesAdapter";

import { AppState } from "@/lib/store";
import { preferencesSlice } from "@/lib/preferencesReducer";
import { mapStateToPreferences } from "@/lib/helpers/mapPreferences";

export class ThReduxPreferencesAdapter<T extends CustomizableKeys = CustomizableKeys> implements ThPreferencesAdapter<T> {
  private store: Store<AppState>;
  private listeners: Set<(prefs: ThPreferences<T>) => void> = new Set();
  private currentPreferences: ThPreferences<T>;

  constructor(store: Store<AppState>, initialPreferences: ThPreferences<T>) {
    this.store = store;
    this.currentPreferences = initialPreferences;
    
    this.store.subscribe(() => {
      const state = this.store.getState();
      const prefs = this.mapStateToPreferences(state);
      if (JSON.stringify(prefs) !== JSON.stringify(this.currentPreferences)) {
        this.currentPreferences = prefs;
        this.notifyListeners(prefs);
      }
    });
  }

  public getPreferences(): ThPreferences<T> {
    return { ...this.currentPreferences };
  }

  public setPreferences(prefs: ThPreferences<T>): void {
    this.currentPreferences = prefs;
    this.store.dispatch(preferencesSlice.actions.updateFromPreferences(prefs as any));
    this.notifyListeners(prefs);
  }

  public subscribe(listener: (prefs: ThPreferences<T>) => void): void {
    this.listeners.add(listener);
    listener(this.getPreferences());
  }

  public unsubscribe(listener: (prefs: ThPreferences<T>) => void): void {
    this.listeners.delete(listener);
  }

  private mapStateToPreferences(state: AppState): ThPreferences<T> {
    if (!state.preferences) return this.currentPreferences;
    
    const updatedPrefs = mapStateToPreferences<T>(state.preferences, { ...this.currentPreferences });
    return updatedPrefs;
  }

  private notifyListeners(prefs: ThPreferences<T>): void {
    const prefsCopy = JSON.parse(JSON.stringify(prefs));
    this.listeners.forEach(callback => callback(prefsCopy));
  }
}
