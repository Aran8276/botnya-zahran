import {
  Broadcaster,
  GroupResponse,
  GroupSettings,
} from "@/components/types/type";
import { createSlice } from "@reduxjs/toolkit";

interface GroupState {
  loaded: boolean;
  data: GroupResponse | null;
  broadcasterSettings: Broadcaster | null;
  groupSettings: GroupSettings | null;
  motdEnabled: boolean;
  motd: string;
  motdSchedule: Date | undefined;
  pfpSlideshowEnabled: boolean;
  files: File[] | null;
  filesInDb: string[];
  lockMentionEveryone: boolean;
  schedulePiket: boolean;
  saveLoading: boolean;
  deleteLoading: boolean;
}

const initialState: GroupState = {
  loaded: false,
  data: null,
  broadcasterSettings: null,
  groupSettings: null,
  motdEnabled: false,
  motd: "",
  motdSchedule: new Date(),
  pfpSlideshowEnabled: false,
  files: null,
  filesInDb: ["abcdef123", "abcdef123", "abcdef123"],
  lockMentionEveryone: false,
  schedulePiket: false,
  saveLoading: false,
  deleteLoading: false,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
    setBroadcastSettings: (state, action) => {
      state.broadcasterSettings = action.payload;
    },
    setGroupSettings: (state, action) => {
      state.groupSettings = action.payload;
    },
    setMotdEnabled: (state, action) => {
      state.motdEnabled = action.payload;
    },
    setMotd: (state, action) => {
      state.motd = action.payload;
    },
    setMotdSchedule: (state, action) => {
      state.motdSchedule = action.payload;
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
    setLockMentionEveryone: (state, action) => {
      state.lockMentionEveryone = action.payload;
    },
    setSchedulePiket: (state, action) => {
      state.schedulePiket = action.payload;
    },
    setSaveLoading: (state, action) => {
      state.saveLoading = action.payload;
    },
    setDeleteLoading: (state, action) => {
      state.deleteLoading = action.payload;
    },
  },
});

export const {
  setLoaded,
  setData,
  setBroadcastSettings,
  setGroupSettings,
  setMotdEnabled,
  setMotd,
  setMotdSchedule,
  setPfpSlideshowEnabled,
  setFiles,
  setFilesInDb,
  setLockMentionEveryone,
  setSchedulePiket,
  setSaveLoading,
  setDeleteLoading,
} = groupSlice.actions;

export default groupSlice.reducer;
