import { createSlice } from "@reduxjs/toolkit";

import { Locator } from "@readium/shared";
import { ScriptMode } from "@readium/navigator";
import { UnstableTimeline } from "@/core/Hooks/useTimeline";
import { TocItem, toEntryRef } from "@/helpers/buildTocTree";

export interface AdjacentTimelineItem {
  title: string;
  href: string;
}

export interface PublicationReducerState {
  fontLanguage: string;
  isFXL: boolean;
  isRTL: boolean;
  scriptMode: ScriptMode;
  hasDisplayTransformability: boolean;
  positionsList: Locator[],
  atPublicationStart: boolean;
  atPublicationEnd: boolean;
  unstableTimeline?: UnstableTimeline;
  adjacentTimelineItems: {
    previous: AdjacentTimelineItem | null;
    next: AdjacentTimelineItem | null;
  };
}

const initialState: PublicationReducerState = {
  fontLanguage: "default",
  isFXL: false,
  isRTL: false,
  scriptMode: "ltr",
  hasDisplayTransformability: false,
  positionsList: [],
  atPublicationStart: false,
  atPublicationEnd: false,
  unstableTimeline: undefined,
  adjacentTimelineItems: { previous: null, next: null }
}

export const publicationSlice = createSlice({
  name: "publication",
  initialState,
  reducers: {
    setFontLanguage: (state, action) => {
      state.fontLanguage = action.payload
    },
    setFXL: (state, action) => {
      state.isFXL = action.payload
    },
    setRTL: (state, action) => {
      state.isRTL = action.payload
    },
    setScriptMode: (state, action) => {
      state.scriptMode = action.payload
    },
    setHasDisplayTransformability: (state, action) => {
      state.hasDisplayTransformability = action.payload
    },
    setPositionsList: (state, action) => {
      state.positionsList = action.payload
    },
    setPublicationStart: (state, action) => {
      state.atPublicationStart = action.payload
    },
    setPublicationEnd: (state, action) => {
      state.atPublicationEnd = action.payload
    },
    setTimeline: (state, action) => {
      state.unstableTimeline = {
        ...action.payload,
        toc: action.payload.toc || { tree: undefined, currentEntry: undefined }
      };
    },
    setTocTree: (state, action) => {
      if (!state.unstableTimeline) {
        state.unstableTimeline = {
          toc: { tree: action.payload, currentEntry: undefined }
        };
      } else if (state.unstableTimeline.toc) {
        state.unstableTimeline.toc.tree = action.payload;
      } else {
        state.unstableTimeline.toc = { tree: action.payload, currentEntry: undefined };
      }
    },
    setAdjacentTimelineItems: (state, action: { payload: { previous: AdjacentTimelineItem | null; next: AdjacentTimelineItem | null } }) => {
      state.adjacentTimelineItems = action.payload;
    },
    setTocEntry: (state, action: { payload: TocItem | null }) => {
      const entry = action.payload ? toEntryRef(action.payload) : null;
      if (!state.unstableTimeline) {
        state.unstableTimeline = {
          toc: { tree: undefined, currentEntry: entry }
        };
      } else if (state.unstableTimeline.toc) {
        state.unstableTimeline.toc.currentEntry = entry;
      } else {
        state.unstableTimeline.toc = { tree: undefined, currentEntry: entry };
      }
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  setFontLanguage,
  setFXL,
  setRTL,
  setScriptMode,
  setHasDisplayTransformability,
  setPositionsList,
  setPublicationStart,
  setPublicationEnd,
  setTimeline,
  setTocTree,
  setTocEntry,
  setAdjacentTimelineItems,
} = publicationSlice.actions;

export default publicationSlice.reducer;