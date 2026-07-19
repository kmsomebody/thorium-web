import { ThDockingKeys } from "@/preferences/models";

import { configureStore, Reducer } from "@reduxjs/toolkit";

import readerReducer, { ReaderReducerState } from "@/lib/readerReducer";
import settingsReducer, { SettingsReducerState } from "@/lib/settingsReducer";
import themeReducer, { ThemeReducerState } from "@/lib/themeReducer";
import actionsReducer, { ActionsReducerState, ActionStateObject } from "@/lib/actionsReducer";
import publicationReducer, { PublicationReducerState } from "./publicationReducer";
import preferencesReducer, { PreferencesReducerState } from "./preferencesReducer";
import globalPreferencesReducer, { GlobalPreferencesReducerState } from "./globalPreferencesReducer";
import webPubSettingsReducer, { WebPubSettingsReducerState } from "./webPubSettingsReducer";
import divinaSettingsReducer, { DivinaSettingsReducerState } from "./divinaSettingsReducer";
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
  globalPreferences: GlobalPreferencesReducerState;
  webPubSettings: WebPubSettingsReducerState;
  divinaSettings: DivinaSettingsReducerState;
  audioSettings: AudioSettingsState;
  player: PlayerReducerState;
  [key: string]: any; // For external reducers
};

const DEFAULT_STORAGE_KEY = "thorium-web-state";

// Schema version of the persisted blob. Bump this whenever a persisted slice
// changes shape in a way a default-backfill cannot recover — a renamed or
// retyped field, or a removed field that must be dropped — and add a matching
// version-gated migration in loadState. Purely additive fields need no bump:
// mergeWithDefaults backfills them from the reducer defaults.
const PERSIST_VERSION = 2;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Reconciles a persisted value against the current default shape. Plain
 * objects merge recursively, with the persisted side keeping keys absent from
 * the default (slices such as `actions.keys` are open-ended maps); fields the
 * persisted side is missing fall back to the default. When the two disagree on
 * shape — an object where a primitive is expected, or a swapped array — the
 * default wins, since that kind of change needs an explicit migration rather
 * than a silent merge.
 */
const mergeWithDefaults = (defaults: unknown, persisted: unknown): unknown => {
  if (persisted === undefined) {
    return defaults;
  }

  if (isPlainObject(defaults) && isPlainObject(persisted)) {
    const merged: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(persisted)) {
      merged[key] = key in defaults
        ? mergeWithDefaults(defaults[key], persisted[key])
        : persisted[key];
    }
    return merged;
  }

  if (isPlainObject(defaults) !== isPlainObject(persisted)) {
    return defaults;
  }
  if (Array.isArray(defaults) !== Array.isArray(persisted)) {
    return defaults;
  }

  return persisted;
};

// Probes a reducer for its initial state without dispatching a real action.
const getReducerDefaults = (reducer: Reducer): unknown =>
  reducer(undefined, { type: "@@thorium/probe-defaults" });

// Migrate font family state
const migrateFontFamily = (stateSlice: Record<string, unknown>) => {
  if (stateSlice.fontFamily && typeof stateSlice.fontFamily === "string") {
    return {
      ...stateSlice,
      fontFamily: {
        default: stateSlice.fontFamily
      }
    };
  }
  return stateSlice;
};


const updateActionsState = (state: Record<string, unknown>) : ActionsReducerState => {
  // Check if keys are already profile-keyed
  if (state.keys && typeof state.keys === "object" && ("epub" in state.keys || "webPub" in state.keys || "audio" in state.keys || "divina" in state.keys)) {
    // Keys are already profile-keyed, update each profile
    const updatedKeys: any = {};
    for (const profile in state.keys as Record<string, Record<string, ActionStateObject | undefined>>) {
      const keys = state.keys as Record<string, Record<string, ActionStateObject | undefined>>;
      updatedKeys[profile] = Object.fromEntries(
        Object.entries(keys[profile]).map(([key, value]: [string, ActionStateObject | undefined]) => [
          key,
          {
            ...value,
            // Transient/undocked actions should never re-open on load
            // Docked actions reset to null so useDocking re-establishes open state
            // based on the actual breakpoint at load time (avoids opening docked
            // sheets in fullscreen/compact where docking is unavailable)
            isOpen: (value?.docking === ThDockingKeys.transient || value?.docking == null)
              ? false
              : (value?.docking === ThDockingKeys.start || value?.docking === ThDockingKeys.end)
                ? null
                : value?.isOpen,
          },
        ])
      );
    }
    return {
      ...state,
      keys: updatedKeys,
      overflow: {}
    } as ActionsReducerState;
  } else {
    // Keys are still flat, update them
    const keys = state.keys as Record<string, Record<string, ActionStateObject | undefined>>;
    const updatedKeys = Object.fromEntries(
      Object.entries(keys).map(([key, value]: [string, ActionStateObject | undefined]) => [
        key,
        {
          ...value,
          isOpen: (value?.docking === ThDockingKeys.transient || value?.docking == null)
            ? false
            : (value?.docking === ThDockingKeys.start || value?.docking === ThDockingKeys.end)
              ? null
              : value?.isOpen,
        },
      ])
    );
    return {
      ...state,
      keys: updatedKeys as any,
      overflow: {}
    } as ActionsReducerState;
  }
};

const migrateDockStateToProfileKeyed = (state: Record<string, unknown>): ActionsReducerState => {
  // Check if dock state is in old format (not profile-keyed)
  if (state.dock && typeof state.dock === "object" && !("epub" in state.dock || "webPub" in state.dock || "audio" in state.dock || "divina" in state.dock)) {
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
      } as ActionsReducerState;
    }
  }
  return state as ActionsReducerState;
};

const migrateKeysStateToProfileKeyed = (state: Record<string, unknown>): ActionsReducerState => {
  // If keys is not profile-keyed, migrate to profile-keyed format
  // Old format: keys is a flat object like { [key]: ActionStateObject }
  // New format: keys is profile-keyed like { epub: { [key]: ActionStateObject }, webPub: { ... }, audio: { ... } }
  if (!state.keys || typeof state.keys !== "object") {
    return state as ActionsReducerState;
  }
  
  // Check if keys is already profile-keyed by looking for known profile keys
  const isProfileKeyed = "epub" in state.keys || "webPub" in state.keys || "audio" in state.keys || "divina" in state.keys;

  if (!isProfileKeyed) {
    // Old flat format - migrate to epub profile
    const oldKeys = state.keys as any;
    const newKeys: any = {
      epub: { ...oldKeys },
      webPub: {},
      audio: {},
      divina: {}
    };
    return {
      ...state,
      keys: newKeys
    } as ActionsReducerState;
  }

  // Ensure all profile keys exist even if some are missing
  const migratedKeys: any = {
    epub: "epub" in state.keys ? state.keys.epub : {},
    webPub: "webPub" in state.keys ? state.keys.webPub : {},
    audio: "audio" in state.keys ? state.keys.audio : {},
    divina: "divina" in state.keys ? state.keys.divina : {}
  };
  
  return {
    ...state,
    keys: migratedKeys
  } as ActionsReducerState;
};

const loadState = (storageKey: string = DEFAULT_STORAGE_KEY): Record<string, unknown> => {
  try {
    const resolvedKey = storageKey || DEFAULT_STORAGE_KEY;
    const serializedState = localStorage.getItem(resolvedKey);
    if (serializedState === null) {
      return {};
    }
    
    // Parse the state
    let state: Record<string, unknown> | undefined = undefined;
    try {
      state = JSON.parse(serializedState);
    } finally {
      if (!isPlainObject(state)) {
        return {};
      }
    }    

    // Apply migrations
    if ("actions" in state && isPlainObject(state.actions)) {
      let actions = migrateDockStateToProfileKeyed(state.actions);
      actions = migrateKeysStateToProfileKeyed(actions);
      state.actions = updateActionsState(actions);
    }
    
    if ("settings" in state && isPlainObject(state.settings)) {
      state.settings = migrateFontFamily(state.settings);
    }

    if ("webPubSettings" in state && isPlainObject(state.webPubSettings)) {
      state.webPubSettings = migrateFontFamily(state.webPubSettings);
    }

    if ("actions" in state && isPlainObject(state.actions)) {
      let actions = updateActionsState(state.actions);
      // Migrate dock state to profile-keyed format if needed
      // Old dock state only applied to epub profile
      state.actions = migrateDockStateToProfileKeyed(actions);
    }

    // Version-gated schema migrations slot in here as the persisted shape
    // evolves, keyed off `state.__version` (absent === legacy v0), e.g.
    //   if (version < 2) state = migrateV1ToV2(state);
    // Additive fields need no migration — makeStore backfills them from the
    // reducer defaults via mergeWithDefaults.

    // Load-time normalization, applied on every load regardless of version.
    if (isPlainObject(state.settings)) {
      state.settings = migrateFontFamily(state.settings);
    }
    if (isPlainObject(state.webPubSettings)) {
      state.webPubSettings = migrateFontFamily(state.webPubSettings);
    }
    if (isPlainObject(state.actions)) {
      state.actions = updateActionsState(state.actions as ActionsReducerState);
    }

    return state;
  } catch {
    return {};
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
    if (state.globalPreferences) stateToPersist.globalPreferences = state.globalPreferences;
    if (state.webPubSettings) stateToPersist.webPubSettings = state.webPubSettings;
    if (state.divinaSettings) stateToPersist.divinaSettings = state.divinaSettings;
    if (state.audioSettings) stateToPersist.audioSettings = state.audioSettings;
    
    // External reducers to persist
    Object.entries(externalReducers).forEach(([key, config]) => {
      if (config.persist && state[key] !== undefined) {
        stateToPersist[key] = state[key];
      }
    });
    
    const serializedState = JSON.stringify({
      __version: PERSIST_VERSION,
      ...stateToPersist
    });
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
    globalPreferences: globalPreferencesReducer,
    webPubSettings: webPubSettingsReducer,
    divinaSettings: divinaSettingsReducer,
    audioSettings: audioSettingsReducer,
    player: playerReducer,
    ...Object.entries(externalReducers).reduce((acc, [key, config]) => ({
      ...acc,
      [key]: config.reducer
    }), {})
  };

  // Get persisted state for internal reducers
  const persistedState = loadState(storageKey);

  // Reconcile a persisted slice against its reducer's current default shape so
  // fields added since the blob was written are backfilled with defaults
  // instead of surfacing as `undefined` and crashing the reader.
  const hydrateSlice = (key: string, reducer: Reducer): unknown => {
    const persistedSlice = persistedState[key];
    if (persistedSlice === undefined) {
      return undefined;
    }
    return mergeWithDefaults(getReducerDefaults(reducer), persistedSlice);
  };

  // Create preloaded state with persisted values
  const preloadedState: any = {
    actions: hydrateSlice("actions", actionsReducer),
    settings: hydrateSlice("settings", settingsReducer),
    theming: hydrateSlice("theming", themeReducer),
    preferences: hydrateSlice("preferences", preferencesReducer),
    globalPreferences: hydrateSlice("globalPreferences", globalPreferencesReducer),
    webPubSettings: hydrateSlice("webPubSettings", webPubSettingsReducer),
    divinaSettings: hydrateSlice("divinaSettings", divinaSettingsReducer),
    audioSettings: hydrateSlice("audioSettings", audioSettingsReducer),
    // Include persisted state for external reducers that have it
    ...Object.entries(externalReducers).reduce((acc, [key, config]) => {
      if (config.persist && persistedState[key] !== undefined) {
        return { ...acc, [key]: hydrateSlice(key, config.reducer) };
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

  // If the loaded blob predates the current schema (or there was none), rewrite
  // it now so it is upgraded to the versioned, reconciled shape even if the
  // user never triggers a state change this session.
  if (persistedState.__version !== PERSIST_VERSION) {
    saveState(store.getState(), storageKey, externalReducers);
  }

  return store;
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
// Export the RootState type for external use
export type AppState = RootState;
export type AppDispatch = AppStore["dispatch"];