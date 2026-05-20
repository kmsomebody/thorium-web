import { ThDockingKeys } from "@/preferences/models";

import { configureStore, Reducer } from "@reduxjs/toolkit";

import readerReducer, { ReaderReducerState } from "@/lib/readerReducer";
import settingsReducer, { SettingsReducerState } from "@/lib/settingsReducer";
import themeReducer, { ThemeReducerState } from "@/lib/themeReducer";
import actionsReducer, { ActionsReducerState } from "@/lib/actionsReducer";
import publicationReducer, { PublicationReducerState } from "./publicationReducer";
import preferencesReducer, { PreferencesReducerState } from "./preferencesReducer";
import webPubSettingsReducer, { WebPubSettingsReducerState } from "./webPubSettingsReducer";

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
  [key: string]: any; // For external reducers
};

const DEFAULT_STORAGE_KEY = "thorium-web-state";

// Schema version of the persisted blob. Bump this whenever a persisted slice
// changes shape in a way a default-backfill cannot recover — a renamed or
// retyped field, or a removed field that must be dropped — and add a matching
// version-gated migration in loadState. Purely additive fields need no bump:
// mergeWithDefaults backfills them from the reducer defaults.
const PERSIST_VERSION = 1;

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


const updateActionsState = (state: ActionsReducerState) => {
  const updatedKeys = Object.fromEntries(
    Object.entries(state.keys || {}).map(([key, value]) => [
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

const loadState = (storageKey: string = DEFAULT_STORAGE_KEY): Record<string, unknown> => {
  try {
    const resolvedKey = storageKey || DEFAULT_STORAGE_KEY;
    const serializedState = localStorage.getItem(resolvedKey);
    if (serializedState === null) {
      return {};
    }

    const parsed = JSON.parse(serializedState);
    if (!isPlainObject(parsed)) {
      return {};
    }

    const state: Record<string, unknown> = { ...parsed };

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
  } catch (err) {
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
    if (state.webPubSettings) stateToPersist.webPubSettings = state.webPubSettings;
    
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
    webPubSettings: webPubSettingsReducer,
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
    webPubSettings: hydrateSlice("webPubSettings", webPubSettingsReducer),
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