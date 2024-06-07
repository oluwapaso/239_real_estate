import { APIResponseProps, BlogDraftsInfo, MenuType } from "@/components/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const initialState: MenuType = {
    menus: [],
    error: ""
}

export const FetchMenus = createAsyncThunk("menus/fetch_menus", async(_, {rejectWithValue})=>{
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    return await fetch(`${apiBaseUrl}/api/fetch-menus`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
        }
    }).then((resps): Promise<APIResponseProps> => {
        return resps.json();
    }).then(data => {
        return data
    }).catch( e => {
        return rejectWithValue(e.message)
    });
});

export const menuSlice = createSlice({
    name: "menu",
    initialState: initialState,
    reducers:{},
    extraReducers(builder) {
        builder.addCase(FetchMenus.rejected, (state)=>{
            state.error = "Unable to load menus"
        })

        builder.addCase(FetchMenus.fulfilled, (state, action: PayloadAction<any>)=> {
            
            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload.success){
                    
                    state.menus = action.payload.data;
                    state.error = "";

                }else{
                    state.menus = [];
                    state.error = "No menu found.";
                }

            }else{
                state.menus = initialState.menus;
                state.error = "Unknow error.";
            }

        })
    }
});

export default menuSlice.reducer;