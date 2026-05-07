import { ThAudioPreferences, AudioCustomizableKeys } from "../audioPreferences";

export interface ThAudioPreferencesAdapter<T extends AudioCustomizableKeys = AudioCustomizableKeys> {
  getPreferences(): ThAudioPreferences<T>;
  setPreferences(prefs: ThAudioPreferences<T>): void;
  subscribe(callback: (prefs: ThAudioPreferences<T>) => void): void;
  unsubscribe(callback: (prefs: ThAudioPreferences<T>) => void): void;
}
