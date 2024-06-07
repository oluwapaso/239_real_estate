import { initialAppSettProps } from "@/components/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: initialAppSettProps = {
    menu_opened: true,
}

const appSlice = createSlice({
    name:"app_settings",
    initialState: initialState,
    reducers:{
        menu_toggled:(_state, action)=>{
            return {
                ...initialState,
                menu_opened: action.payload
            }
        },
    }
})

export const {menu_toggled} = appSlice.actions
export default appSlice.reducer