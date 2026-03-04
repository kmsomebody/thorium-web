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

export interface ActionStateSlotWidthPayload {
  type: string;
  payload: { 
    key: ThDockingKeys.start | ThDockingKeys.end;
    width: number;
  }
}

export interface DockState {
  [ThDockingKeys.start]: DockStateObject;
  [ThDockingKeys.end]: DockStateObject;
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
  dock: {
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
  },
  keys: {},
  overflow: {}
}

export const actionsSlice = createSlice({
  name: "actions",
  initialState,
  reducers: {
    dockAction: (state, action: ActionStateDockPayload) => {
      // The user should be able to override the dock slot
      // so we override the previous value, and sync 
      // any other action with the same docking key
      switch(action.payload.dockingKey) {
        case ThDockingKeys.start:
          // We need to find if any other action has the same docking key. 
          // If it does, we also have to close it so that its transient sheet 
          // doesn’t pop over on the screen when it’s replaced
          for (const key in state.keys) {
            if (state.keys[key as ActionsStateKeys]?.docking === action.payload.dockingKey) {
              state.keys[key as ActionsStateKeys] = { 
                ...state.keys[key as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          state.dock[ThDockingKeys.start] = {
            ...state.dock[ThDockingKeys.start],
            actionKey: action.payload.key
          }
          // And remove it from the other one
          if (state.dock[ThDockingKeys.end].actionKey === action.payload.key) {
            state.dock[ThDockingKeys.end] = {
              ...state.dock[ThDockingKeys.end],
              actionKey: null
            }
          }
          break;

        case ThDockingKeys.end:
          // We need to find if any other action has the same docking key. 
          // If it does, we also have to close it so that its transient sheet 
          // doesn’t pop over on the screen when it’s replaced
          for (const key in state.keys) {
            if (state.keys[key as ActionsStateKeys]?.docking === action.payload.dockingKey) {
              state.keys[key as ActionsStateKeys] = { 
                ...state.keys[key as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          state.dock[ThDockingKeys.end] = {
            ...state.dock[ThDockingKeys.end],
            actionKey: action.payload.key
          }
          // And remove it from the other one
          if (state.dock[ThDockingKeys.start].actionKey === action.payload.key) {
            state.dock[ThDockingKeys.start] = {
              ...state.dock[ThDockingKeys.start],
              actionKey: null
            }
          }
          break;

        // We don’t need to sync another action
        case ThDockingKeys.transient:
        default: 
          // We need to empty the docking slot
          if (state.dock[ThDockingKeys.start].actionKey === action.payload.key) {
            state.dock[ThDockingKeys.start] = {
              ...state.dock[ThDockingKeys.start],
              actionKey: null
            }
          }
          if (state.dock[ThDockingKeys.end].actionKey === action.payload.key) {
            state.dock[ThDockingKeys.end] = {
              ...state.dock[ThDockingKeys.end],
              actionKey: null
            }
          }            
          break;
      }

      state.keys[action.payload.key] = { 
        ...state.keys[action.payload.key],
        docking: action.payload.dockingKey 
      };
    },
    setActionOpen: (state, action: ActionStateOpenPayload) => {      
      // If the action is docked and set Open, we must take care of 
      // the dock panel’s collapsibility. Otherwise we end up with bugs 
      // i.e. user has to click/tap action icon twice to open, 
      const dockingKey = state.keys[action.payload.key]?.docking;
      if (
          !action.payload.isOpen && 
          dockingKey && 
          dockingKey !== ThDockingKeys.transient &&
          state.dock[dockingKey].actionKey === action.payload.key &&
          state.dock[dockingKey].active &&
          state.dock[dockingKey].collapsed
      ) {
        state.dock[dockingKey] = {
          ...state.dock[dockingKey],
          collapsed: false
        }
      } else {
        state.keys[action.payload.key] = {
          ...state.keys[action.payload.key],
          isOpen: action.payload.isOpen 
        };
      }
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
    activateDockPanel: (state, action: ActionStateSlotPayload) => {
      state.dock[action.payload] = {
        ...state.dock[action.payload],
        active: true
      }
    },
    deactivateDockPanel: (state, action: ActionStateSlotPayload) => {
      state.dock[action.payload] = {
        ...state.dock[action.payload],
        active: false
      }
    },
    collapseDockPanel: (state, action: ActionStateSlotPayload) => {
      state.dock[action.payload] = {
        ...state.dock[action.payload],
        collapsed: true
      }
    },
    expandDockPanel: (state, action: ActionStateSlotPayload) => {
      state.dock[action.payload] = {
        ...state.dock[action.payload],
        collapsed: false
      }
    },
    setDockPanelWidth: (state, action: ActionStateSlotWidthPayload) => {
      // Copy the value in the action state 
      // in case we do something with it later.

      const key: ActionsStateKeys | null = state.dock[action.payload.key].actionKey;
      if (key) {
        state.keys[key] = {
          ...state.keys[key],
          dockedWidth: action.payload.width
        }
      }

      // We only care if it’s populated.
      if (state.dock[action.payload.key] !== null) {
        state.dock[action.payload.key] = {
          ...state.dock[action.payload.key],
          width: action.payload.width
        }
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