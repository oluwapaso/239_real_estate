import { CityInfo } from "@/components/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type citySliceType = {
    cities: CityInfo[]
    error: string
}

const initialState: citySliceType = {
    cities: [],
    error: ""
}

export const FetchCities = createAsyncThunk("city/fetch_cities", async (_, {rejectWithValue}) => {
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const payload = {
        paginated: false,
        post_type: "Published",
    }

    return await fetch(`${apiBaseUrl}/api/(cities)/load-cities`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then((resps): Promise<CityInfo[] | null> => {
        return resps.json();
    }).then(data => {
        return data
    }).catch( e => {
        return rejectWithValue(e.message)
    });

});

export const citySlice = createSlice({
    name :"cities",
    initialState,
    reducers:{},
    extraReducers(builder) {
        builder.addCase(FetchCities.pending, (state)=>{
            state.error = "Unable to load cities"
        });

        builder.addCase(FetchCities.fulfilled, (state, action: PayloadAction<any>)=> {
            
            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload){
                    
                    state.cities = action.payload;
                    state.error = "";

                }else{
                    state.cities = [];
                    state.error = "No city found.";
                }

            }else{
                state.cities = initialState.cities;
                state.error = "Unknow error.";
            }

        });
    },
});

export default citySlice.reducer;