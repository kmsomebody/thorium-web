import { createSlice } from "@reduxjs/toolkit";

import { ThDockingKeys } from "../preferences/models";

export type ActionsStateKeys = string;
export type OverflowStateKeys = string; 

export interface ActionStateObject {
  isOpen?: boolean | null;
  docking?: ThDockingKeys | null;
  dockedWidth?: number;
}

export interface OverflowStateObject {
  isOpen: boolean;
}

export interface DockStateObject {
  actionKey: ActionsStateKeys | null;
  active: boolean;
  collapsed: boolean;
  width?: number;
}

export interface ActionStateDockPayload {
  type: string;
  payload: {
    key: ActionsStateKeys;
    dockingKey: ThDockingKeys;
    profile: string;
  }
}

export interface ActionStateOpenPayload {
  type: string;
  payload: {
    key: ActionsStateKeys;
    isOpen: boolean;
  }
}

export interface ActionStateTogglePayload {
  type: string;
  payload: {
    key: ActionsStateKeys
  }
}

export interface ActionOverflowOpenPayload {
  type: string;
  payload: {
    key: OverflowStateKeys;
    isOpen: boolean;
  }
}

export interface ActionStateDockedPayload {
  type: string;
  payload: { 
    slot: ThDockingKeys.start | ThDockingKeys.end;
    docked: DockStateObject;
  }
}

export interface ActionStateSlotPayload {
  type: string;
  payload: ThDockingKeys.start | ThDockingKeys.end;
}

export interface ActionStateSlotPayloadWithProfile {
  type: string;
  payload: {
    slot: ThDockingKeys.start | ThDockingKeys.end;
    profile: string;
  };
}

export interface ActionStateSlotWidthPayload {
  type: string;
  payload: { 
    key: ThDockingKeys.start | ThDockingKeys.end;
    width: number;
    profile: string;
  }
}

export interface DockState {
  [profile: string]: {
    [ThDockingKeys.start]: DockStateObject;
    [ThDockingKeys.end]: DockStateObject;
  }
}

export type ActionsReducerState = {
  keys: {
    [key in ActionsStateKeys]?: ActionStateObject;
  };
  dock: DockState,
  overflow: {
    [key in OverflowStateKeys]?: OverflowStateObject;
  }
}

const initialState: ActionsReducerState = {
  dock: {},
  keys: {},
  overflow: {}
}

const initializeProfileDock = (state: ActionsReducerState, profile: string) => {
  if (!state.dock[profile]) {
    state.dock[profile] = {
      [ThDockingKeys.start]: {
        actionKey: null,
        active: false,
        collapsed: false
      },
      [ThDockingKeys.end]: {
        actionKey: null,
        active: false,
        collapsed: false
      }
    };
  }
};

export const actionsSlice = createSlice({
  name: "actions",
  initialState,
  reducers: {
    dockAction: (state, action: ActionStateDockPayload) => {
      const { key, dockingKey, profile } = action.payload;
      
      // Initialize dock state for profile if it doesn't exist
      initializeProfileDock(state, profile);
      
      const profileDock = state.dock[profile];
      
      // The user should be able to override the dock slot
      // so we override the previous value, and sync 
      // any other action with the same docking key
      switch(dockingKey) {
        case ThDockingKeys.start:
          // We need to find if any other action has the same docking key. 
          // If it does, we also have to close it so that its transient sheet 
          // doesn’t pop over on the screen when it’s replaced
          for (const k in state.keys) {
            if (state.keys[k as ActionsStateKeys]?.docking === dockingKey) {
              state.keys[k as ActionsStateKeys] = { 
                ...state.keys[k as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          profileDock[ThDockingKeys.start] = {
            ...profileDock[ThDockingKeys.start],
            actionKey: key
          }
          // And remove it from the other one
          if (profileDock[ThDockingKeys.end].actionKey === key) {
            profileDock[ThDockingKeys.end] = {
              ...profileDock[ThDockingKeys.end],
              actionKey: null
            }
          }
          break;

        case ThDockingKeys.end:
          // We need to find if any other action has the same docking key. 
          // If it does, we also have to close it so that its transient sheet 
          // doesn’t pop over on the screen when it’s replaced
          for (const k in state.keys) {
            if (state.keys[k as ActionsStateKeys]?.docking === dockingKey) {
              state.keys[k as ActionsStateKeys] = { 
                ...state.keys[k as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          profileDock[ThDockingKeys.end] = {
            ...profileDock[ThDockingKeys.end],
            actionKey: key
          }
          // And remove it from the other one
          if (profileDock[ThDockingKeys.start].actionKey === key) {
            profileDock[ThDockingKeys.start] = {
              ...profileDock[ThDockingKeys.start],
              actionKey: null
            }
          }
          break;

        // We don’t need to sync another action
        case ThDockingKeys.transient:
        default: 
          // We need to empty the docking slot
          if (profileDock[ThDockingKeys.start].actionKey === key) {
            profileDock[ThDockingKeys.start] = {
              ...profileDock[ThDockingKeys.start],
              actionKey: null
            }
          }
          if (profileDock[ThDockingKeys.end].actionKey === key) {
            profileDock[ThDockingKeys.end] = {
              ...profileDock[ThDockingKeys.end],
              actionKey: null
            }
          }            
          break;
      }

      state.keys[key] = { 
        ...state.keys[key],
        docking: dockingKey 
      };
    },
    setActionOpen: (state, action: ActionStateOpenPayload) => {      
      state.keys[action.payload.key] = {
        ...state.keys[action.payload.key],
        isOpen: action.payload.isOpen 
      };
    },
    toggleActionOpen: (state, action: ActionStateTogglePayload) => {
      const payload = {
        key: action.payload.key,
        isOpen: state.keys[action.payload.key]?.isOpen ? !state.keys[action.payload.key]?.isOpen : true
      };
      actionsSlice.caseReducers.setActionOpen(state, {
        type: "toggleActionOpen",
        payload: payload
      });
    },
    setOverflow: (state, action: ActionOverflowOpenPayload) => {
      state.overflow[action.payload.key] = {
        ...state.overflow[action.payload.key],
        isOpen: action.payload.isOpen 
      }
    },
    activateDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        active: true
      }
    },
    deactivateDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        active: false
      }
    },
    collapseDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        collapsed: true
      }
    },
    expandDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        collapsed: false
      }
    },
    setDockPanelWidth: (state, action: ActionStateSlotWidthPayload) => {
      const { key, width, profile } = action.payload;
      
      initializeProfileDock(state, profile);
      
      // Copy the value in the action state 
      // in case we do something with it later.

      const dockKey: ActionsStateKeys | null = state.dock[profile][key].actionKey;
      if (dockKey) {
        state.keys[dockKey] = {
          ...state.keys[dockKey],
          dockedWidth: width
        }
      }

      // We only care if it's populated.
      state.dock[profile][key] = {
        ...state.dock[profile][key],
        width: width
      }
    }
  }
})

export const { 
  dockAction, 
  setActionOpen, 
  toggleActionOpen, 
  setOverflow, 
  activateDockPanel, 
  deactivateDockPanel, 
  collapseDockPanel,
  expandDockPanel, 
  setDockPanelWidth
} = actionsSlice.actions;

export default actionsSlice.reducer;