import { ThAudioPreferences, AudioCustomizableKeys } from "../audioPreferences";
import { ThAudioPreferencesAdapter } from "./ThAudioPreferencesAdapter";

export class ThAudioMemoryPreferencesAdapter<T extends AudioCustomizableKeys = AudioCustomizableKeys> implements ThAudioPreferencesAdapter<T> {
  private currentPreferences: ThAudioPreferences<T>;
  private listeners: Set<(prefs: ThAudioPreferences<T>) => void> = new Set();

  constructor(initialPreferences: ThAudioPreferences<T>) {
    this.currentPreferences = { ...initialPreferences };
  }

  public getPreferences(): ThAudioPreferences<T> {
    return { ...this.currentPreferences };
  }

  public setPreferences(prefs: ThAudioPreferences<T>): void {
    this.currentPreferences = { ...prefs };
    this.notifyListeners(this.currentPreferences);
  }

  public subscribe(listener: (prefs: ThAudioPreferences<T>) => void): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: (prefs: ThAudioPreferences<T>) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(prefs: ThAudioPreferences<T>): void {
    this.listeners.forEach(listener => listener({ ...prefs }));
  }
}
