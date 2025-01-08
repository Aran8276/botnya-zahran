import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./features/Login/loginSlice";
import manageSlice from "./features/Manage/manageSlice";
import groupSlice from "./features/Group/groupSlice";
import adminSlice from "./features/Admin/adminSlice";
import editSlice from "./features/Edit/editSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      login: loginSlice,
      manage: manageSlice,
      group: groupSlice,
      admin: adminSlice,
      edit: editSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
