import {
  AdminDetailsResponse,
  AdminGroupsResponse,
} from "@/components/types/type";
import { createSlice } from "@reduxjs/toolkit";

interface GroupState {
  data: AdminDetailsResponse | null;
  botDelayEnabled: boolean;
  botDelay: string;
  dataGroup: AdminGroupsResponse | null;
  loaded: boolean;
  pfpSlideshowEnabled: boolean;
  files: File[] | null;
  filesInDb: string[];
  settingIsLoading: boolean;
  broadcastIsLoading: boolean;
  deleteLoading: boolean;
  uploadProgress: number;
}

const initialState: GroupState = {
  data: null,
  botDelayEnabled: false,
  botDelay: "",
  dataGroup: null,
  loaded: false,
  pfpSlideshowEnabled: false,
  files: null,
  filesInDb: [],
  settingIsLoading: false,
  broadcastIsLoading: false,
  deleteLoading: false,
  uploadProgress: 0,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setBotDelayEnabled: (state, action) => {
      state.botDelayEnabled = action.payload;
    },
    setBotDelay: (state, action) => {
      state.botDelay = action.payload;
    },
    setDataGroup: (state, action) => {
      state.dataGroup = action.payload;
    },
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setPfpSlideshowEnabled: (state, action) => {
      state.pfpSlideshowEnabled = action.payload;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setFilesInDb: (state, action) => {
      state.filesInDb = action.payload;
    },
    setSettingIsLoading: (state, action) => {
      state.settingIsLoading = action.payload;
    },
    setBroadcastIsLoading: (state, action) => {
      state.broadcastIsLoading = action.payload;
    },
    setDeleteLoading: (state, action) => {
      state.deleteLoading = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
});

export const {
  setData,
  setBotDelayEnabled,
  setBotDelay,
  setDataGroup,
  setLoaded,
  setPfpSlideshowEnabled,
  setFiles,
  setFilesInDb,
  setSettingIsLoading,
  setBroadcastIsLoading,
  setDeleteLoading,
  setUploadProgress,
} = groupSlice.actions;

export default groupSlice.reducer;
