import { createSlice } from "@reduxjs/toolkit";

export type PlayerStatus = "idle" | "playing" | "paused";

export interface SeekableRange {
  start: number;
  end: number;
}

export interface SleepTimerState {
  remainingSeconds: number | null;
  onTrackEnd: boolean;
}

export type RemotePlaybackState = "connecting" | "connected" | "disconnected" | "error";

export interface PlayerReducerState {
  status: PlayerStatus;
  isSeeking: boolean;
  isStalled: boolean;
  isTrackReady: boolean;
  sleepTimer: SleepTimerState;
  remotePlaybackState: RemotePlaybackState | null;
  seekableRanges: SeekableRange[];
}

const initialState: PlayerReducerState = {
  status: "idle",
  isSeeking: false,
  isStalled: false,
  isTrackReady: false,
  sleepTimer: { remainingSeconds: null, onTrackEnd: false },
  remotePlaybackState: null,
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
    setSleepTimerRemainingSeconds: (state, action: { payload: number | null }) => {
      state.sleepTimer.remainingSeconds = action.payload;
    },
    setSleepTimerOnTrackEnd: (state, action: { payload: boolean }) => {
      state.sleepTimer.onTrackEnd = action.payload;
    },
    setRemotePlaybackState: (state, action: { payload: RemotePlaybackState | null }) => {
      state.remotePlaybackState = action.payload;
    },
    setSeekableRanges: (state, action: { payload: SeekableRange[] }) => {
      state.seekableRanges = action.payload;
    },
  },
});

export const {
  setStatus,
  setSeeking,
  setStalled,
  setTrackReady,
  setSleepTimerRemainingSeconds,
  setSleepTimerOnTrackEnd,
  setRemotePlaybackState,
  setSeekableRanges
} = playerSlice.actions;

export default playerSlice.reducer;
