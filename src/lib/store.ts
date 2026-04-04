import { configureStore } from '@reduxjs/toolkit'
import authReducer from "@/features/auth/slices/authSlice"

import { authApi } from "@/features/auth/services/authApi"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
