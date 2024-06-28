import { combineReducers, configureStore } from "@reduxjs/toolkit";
import UserReducer from "./user/userSlice"
import AppReduce from "./app/appSlice"
import {persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

//Create browser local storage configuration
const persistConfig = {
    key:"root",
    storage
}

//Combine all reducer to add and persist to local storage
const rootReducers = combineReducers({
    user: UserReducer,
    app_settings: AppReduce,
})

//Add the reducers to the browser configuration to persist it
const persistedStorage = persistReducer(persistConfig, rootReducers)

//create a store that uses the persisted data
export const store = configureStore({
    reducer: persistedStorage,
    middleware:(getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false})
})

//Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//This starts the persistence process. It save and rehydrate state
export const persistor = persistStore(store)