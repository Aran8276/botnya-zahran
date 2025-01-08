import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  loaded: boolean;
  isLoading: boolean;
  imageDeletable: boolean;
  imageDeleteIsLoading: boolean;
  error: string;
  files: File[] | null;
  images: string[];
}

const initialState: AppState = {
  loaded: false,
  isLoading: false,
  imageDeleteIsLoading: false,
  imageDeletable: false,
  error: "",
  files: null,
  images: [],
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setImageDeletable: (state, action) => {
      state.imageDeletable = action.payload;
    },
    setImageDeleteIsLoading: (state, action) => {
      state.imageDeleteIsLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  setLoaded,
  setIsLoading,
  setImageDeletable,
  setImageDeleteIsLoading,
  setError,
  setFiles,
  setImages,
  resetState,
} = appSlice.actions;

export default appSlice.reducer;
