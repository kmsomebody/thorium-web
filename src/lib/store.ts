import { ThDockingKeys } from "@/preferences/models";

import { configureStore, Reducer } from "@reduxjs/toolkit";

import readerReducer, { ReaderReducerState } from "@/lib/readerReducer";
import settingsReducer, { SettingsReducerState } from "@/lib/settingsReducer";
import themeReducer, { ThemeReducerState } from "@/lib/themeReducer";
import actionsReducer, { ActionsReducerState } from "@/lib/actionsReducer";
import publicationReducer, { PublicationReducerState } from "./publicationReducer";
import preferencesReducer, { PreferencesReducerState } from "./preferencesReducer";
import webPubSettingsReducer, { WebPubSettingsReducerState } from "./webPubSettingsReducer";
import audioSettingsReducer, { AudioSettingsState } from "./audioSettingsReducer";
import playerReducer, { PlayerReducerState } from "./playerReducer";

import debounce from "debounce";

interface ExternalReducerConfig {
  reducer: any;
  persist?: boolean;
}

// Define the shape of the root state
export type RootState = {
  reader: ReaderReducerState;
  settings: SettingsReducerState;
  theming: ThemeReducerState;
  actions: ActionsReducerState;
  publication: PublicationReducerState;
  preferences: PreferencesReducerState;
  webPubSettings: WebPubSettingsReducerState;
  audioSettings: AudioSettingsState;
  player: PlayerReducerState;
  [key: string]: any; // For external reducers
};

const DEFAULT_STORAGE_KEY = "thorium-web-state";

// Migrate font family state
const migrateFontFamily = (stateSlice: SettingsReducerState | WebPubSettingsReducerState) => {
  if (stateSlice?.fontFamily && typeof stateSlice.fontFamily === "string") {
    return {
      ...stateSlice,
      fontFamily: {
        default: stateSlice.fontFamily
      }
    };
  }
  return stateSlice;
};


const updateActionsState = (state: ActionsReducerState) => {
  const updatedKeys = Object.fromEntries(
    Object.entries(state.keys).map(([key, value]) => [
      key,
      {
        ...value,
        isOpen: value?.docking === ThDockingKeys.transient || value?.docking == null && value?.isOpen === true ? false : value?.isOpen,
      },
    ])
  );

  return {
    ...state,
    keys: updatedKeys,
    overflow: {}
  };
};

const migrateDockStateToProfileKeyed = (state: ActionsReducerState): ActionsReducerState => {
  // Check if dock state is in old format (not profile-keyed)
  if (state.dock && typeof state.dock === "object" && !("epub" in state.dock || "webPub" in state.dock || "audio" in state.dock)) {
    // Old format: dock has direct start/end keys
    const oldDock = state.dock as any;
    if (oldDock[ThDockingKeys.start] || oldDock[ThDockingKeys.end]) {
      // Migrate to new profile-keyed format, only for epub profile
      const newDock: any = {};
      newDock["epub"] = {
        [ThDockingKeys.start]: oldDock[ThDockingKeys.start] || { actionKey: null, active: false, collapsed: false },
        [ThDockingKeys.end]: oldDock[ThDockingKeys.end] || { actionKey: null, active: false, collapsed: false }
      };
      return {
        ...state,
        dock: newDock
      };
    }
  }
  return state;
};

const loadState = (storageKey: string = DEFAULT_STORAGE_KEY) => {
  try {
    const resolvedKey = storageKey || DEFAULT_STORAGE_KEY;
    const serializedState = localStorage.getItem(resolvedKey);
    if (serializedState === null) {
      return { 
        actions: undefined, 
        settings: undefined, 
        theming: undefined,
        preferences: undefined,
        webPubSettings: undefined,
        audioSettings: undefined
      };
    }
    
    // Parse the state
    let state = JSON.parse(serializedState);
    
    // Apply migrations
    if (state) {
      // Migrate font family state
      if (state.settings) {
        state.settings = migrateFontFamily(state.settings);
      }
      if (state.webPubSettings) {
        state.webPubSettings = migrateFontFamily(state.webPubSettings);
      }
      
      if (state.actions) {
        state.actions = updateActionsState(state.actions);
        // Migrate dock state to profile-keyed format if needed
        // Old dock state only applied to epub profile
        state.actions = migrateDockStateToProfileKeyed(state.actions);
      }
    }
    
    return state;
  } catch (err) {
    return { 
      actions: undefined, 
      settings: undefined, 
      theming: undefined,
      preferences: undefined,
      webPubSettings: undefined
    };
  }
};

const saveState = (state: any, storageKey?: string, externalReducers: Record<string, ExternalReducerConfig> = {}) => {
  try {
    const resolvedKey = storageKey || DEFAULT_STORAGE_KEY;
    
    // Only persist the state of reducers that are marked for persistence
    const stateToPersist: any = {};
    
    // Internal reducers to persist
    if (state.actions) stateToPersist.actions = state.actions;
    if (state.settings) stateToPersist.settings = state.settings;
    if (state.theming) stateToPersist.theming = state.theming;
    if (state.preferences) stateToPersist.preferences = state.preferences;
    if (state.webPubSettings) stateToPersist.webPubSettings = state.webPubSettings;
    if (state.audioSettings) stateToPersist.audioSettings = state.audioSettings;
    
    // External reducers to persist
    Object.entries(externalReducers).forEach(([key, config]) => {
      if (config.persist && state[key] !== undefined) {
        stateToPersist[key] = state[key];
      }
    });
    
    const serializedState = JSON.stringify(stateToPersist);
    localStorage.setItem(resolvedKey, serializedState);
  } catch (err) {
    console.error(err);
  }
};

export const makeStore = (storageKey?: string, externalReducers: Record<string, ExternalReducerConfig> = {}) => {
  // Combine internal and external reducers
  const combinedReducers = {
    reader: readerReducer,
    settings: settingsReducer,
    theming: themeReducer,
    actions: actionsReducer,
    publication: publicationReducer,
    preferences: preferencesReducer,
    webPubSettings: webPubSettingsReducer,
    audioSettings: audioSettingsReducer,
    player: playerReducer,
    ...Object.entries(externalReducers).reduce((acc, [key, config]) => ({
      ...acc,
      [key]: config.reducer
    }), {})
  };

  // Get persisted state for internal reducers
  const persistedState = loadState(storageKey);
  
  // Create preloaded state with persisted values
  const preloadedState: any = {
    actions: persistedState.actions,
    settings: persistedState.settings,
    theming: persistedState.theming,
    preferences: persistedState.preferences,
    webPubSettings: persistedState.webPubSettings,
    audioSettings: persistedState.audioSettings,
    // Include persisted state for external reducers that have it
    ...Object.entries(externalReducers).reduce((acc, [key, config]) => {
      if (config.persist && persistedState[key] !== undefined) {
        return { ...acc, [key]: persistedState[key] };
      }
      return acc;
    }, {})
  };

  const store = configureStore({
    reducer: combinedReducers as unknown as Reducer<RootState>,
    preloadedState,
  });

  const saveStateDebounced = debounce(() => {
    saveState(store.getState(), storageKey, externalReducers);
  }, 250);

  store.subscribe(saveStateDebounced);

  return store;
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
// Export the RootState type for external use
export type AppState = RootState;
export type AppDispatch = AppStore["dispatch"];