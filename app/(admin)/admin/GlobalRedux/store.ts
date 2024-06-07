import { combineReducers, configureStore } from "@reduxjs/toolkit";
import UserReducer from "./user/userSlice"
import AppReduce from "./app/appSlice"
import {persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
    key:"root",
    storage
}

const rootReducers = combineReducers({
    user: UserReducer,
    app_settings: AppReduce,
})

const persistedStorage = persistReducer(persistConfig, rootReducers)

export const store = configureStore({
    reducer: persistedStorage,
    middleware:(getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false})
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store)