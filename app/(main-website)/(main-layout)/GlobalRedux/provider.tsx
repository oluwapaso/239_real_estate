"use client"

import React from "react";
import { Provider } from "react-redux"
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/app/contexts/ModalContext";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }: { children: React.ReactNode }) {
    return (

        <SessionProvider>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <ModalProvider>
                        <ToastContainer />
                        {children}
                    </ModalProvider>
                </PersistGate>
            </Provider>
        </SessionProvider>
    )
}