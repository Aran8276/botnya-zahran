import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  tab: "prompt" | "group" | "admin" | string;
  error: string;
  groupHasPassword: boolean;
  isLoading: boolean;
  groupDefaultId: string;
}

const initialState: AppState = {
  tab: "prompt",
  error: "",
  groupHasPassword: false,
  isLoading: false,
  groupDefaultId: "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTab: (state, action) => {
      state.tab = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setHasPassword: (state, action) => {
      state.groupHasPassword = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setGroupDefaultId: (state, action) => {
      state.groupDefaultId = action.payload;
    },
  },
});

export const {
  setTab,
  setError,
  setHasPassword,
  setIsLoading,
  setGroupDefaultId,
} = appSlice.actions;

export default appSlice.reducer;
