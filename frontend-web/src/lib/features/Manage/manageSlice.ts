import { SearchResponse } from "@/components/types/type";
import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  loaded: boolean;
  data: Response | null;
  searchQuery: string;
  searchData: SearchResponse | null;
  open: boolean;
  deleteLoading: boolean;
}

export interface Response {
  success: boolean;
  msg: string;
  responses: Responses;
  status: number;
}

export interface Responses {
  current_page: number;
  data: Datum[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: null;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface Datum {
  id: string;
  case: string;
  reply: string;
  images: string;
  created_at: Date;
  updated_at: Date;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

const initialState: AppState = {
  loaded: false,
  data: null,
  searchQuery: "",
  searchData: null,
  open: false,
  deleteLoading: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload;
    },
    setOpen: (state, action) => {
      state.open = action.payload;
    },
    setDeleteLoading: (state, action) => {
      state.deleteLoading = action.payload;
    },
  },
});

export const {
  setLoaded,
  setSearchQuery,
  setData,
  setSearchData,
  setOpen,
  setDeleteLoading,
} = appSlice.actions;

export default appSlice.reducer;
