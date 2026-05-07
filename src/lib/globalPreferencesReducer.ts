import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalPreferencesReducerState {
  locale?: string;
}

const initialState: GlobalPreferencesReducerState = {};

export const globalPreferencesSlice = createSlice({
  name: "globalPreferences",
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string | undefined>) => {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = globalPreferencesSlice.actions;

export default globalPreferencesSlice.reducer;
