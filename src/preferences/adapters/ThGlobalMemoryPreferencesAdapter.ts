import { ThGlobalPreferences } from "../globalPreferences";
import { ThGlobalPreferencesAdapter } from "./ThGlobalPreferencesAdapter";

export class ThGlobalMemoryPreferencesAdapter implements ThGlobalPreferencesAdapter {
  private preferences: ThGlobalPreferences;
  private listeners: Set<(prefs: ThGlobalPreferences) => void> = new Set();

  constructor(initialPreferences: ThGlobalPreferences = {}) {
    this.preferences = { ...initialPreferences };
  }

  getPreferences(): ThGlobalPreferences {
    return { ...this.preferences };
  }

  setPreferences(prefs: ThGlobalPreferences): void {
    this.preferences = { ...prefs };
    this.listeners.forEach(cb => cb({ ...this.preferences }));
  }

  subscribe(callback: (prefs: ThGlobalPreferences) => void): void {
    this.listeners.add(callback);
    callback(this.getPreferences());
  }

  unsubscribe(callback: (prefs: ThGlobalPreferences) => void): void {
    this.listeners.delete(callback);
  }
}
