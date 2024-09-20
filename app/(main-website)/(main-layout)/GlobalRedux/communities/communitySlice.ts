import { CommunityInfo } from "@/components/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type commSliceType = {
    communities: CommunityInfo[]
    error: string
}

const initialState: commSliceType = {
    communities: [],
    error: ""
}

export const FetchCommunities = createAsyncThunk("comm/fetch_communities", async (_, {rejectWithValue}) => {
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const payload = {
        paginated: false,
        post_type: "Published",
    }

    return await fetch(`${apiBaseUrl}/api/(communities)/load-communities`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then((resps): Promise<CommunityInfo[] | null> => {
        return resps.json();
    }).then(data => {
        return data
    }).catch( e => {
        return rejectWithValue(e.message)
    });

});

export const commSlice = createSlice({
    name :"communities",
    initialState,
    reducers:{},
    extraReducers(builder) {
        builder.addCase(FetchCommunities.pending, (state)=>{
            state.error = "Unable to load communities"
        });

        builder.addCase(FetchCommunities.fulfilled, (state, action: PayloadAction<any>)=> {
            
            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload){
                    
                    state.communities = action.payload;
                    state.error = "";

                }else{
                    state.communities = [];
                    state.error = "No community found.";
                }

            }else{
                state.communities = initialState.communities;
                state.error = "Unknow error.";
            }

        });
    },
});

export default commSlice.reducer;