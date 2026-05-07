import { createSlice } from "@reduxjs/toolkit";

export type PlayerStatus = "idle" | "playing" | "paused";

export interface SeekableRange {
  start: number;
  end: number;
}

export interface PlayerReducerState {
  status: PlayerStatus;
  isSeeking: boolean;
  isStalled: boolean;
  isTrackReady: boolean;
  seekableRanges: SeekableRange[];
}

const initialState: PlayerReducerState = {
  status: "idle",
  isSeeking: false,
  isStalled: false,
  isTrackReady: false,
  seekableRanges: [],
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setStatus: (state, action: { payload: PlayerStatus }) => {
      state.status = action.payload;
    },
    setSeeking: (state, action: { payload: boolean }) => {
      state.isSeeking = action.payload;
    },
    setStalled: (state, action: { payload: boolean }) => {
      state.isStalled = action.payload;
    },
    setTrackReady: (state, action: { payload: boolean }) => {
      state.isTrackReady = action.payload;
    },
    setSeekableRanges: (state, action: { payload: SeekableRange[] }) => {
      state.seekableRanges = action.payload;
    },
  },
});

export const { setStatus, setSeeking, setStalled, setTrackReady, setSeekableRanges } = playerSlice.actions;

export default playerSlice.reducer;
