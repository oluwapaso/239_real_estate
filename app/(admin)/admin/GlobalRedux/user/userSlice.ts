import { initialStateProps } from "@/components/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: initialStateProps = {
    admin_id: null,
    session_id: "",
    token: "",
    email: "",
    status: "",
    isLogged: false,
    isLogginIn: false,
    showPageLoader: false,
    error:""
}

export const Login = createAsyncThunk("user/login", 
    async ({username, password}:{username: string, password: string}, { rejectWithValue }) => {

    const pay_load = {
        username: username,
        password: password,
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    return await fetch(`${apiBaseUrl}/api/admin-login`, {
        method: "POST",
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pay_load)
    }).then((resps): Promise<initialStateProps> => {
        return resps.json()
    }).then(data => {
        return data
    }).catch( e => {
        return rejectWithValue(e.message)
    })

})

const userSlice = createSlice({
    name: "user",
    initialState: initialState,
    reducers:{
        emptyError: (state) => {
            state.error = ""
        },
        logout: () => {
            return { ...initialState, isLogged: false, isLogginIn: false, error: ""}
        },
        showPageLoader: (state) => {
            state.showPageLoader = true
        },
        hidePageLoader: (state) => {
            state.showPageLoader = false
        }
    },
    extraReducers(builder) {

        builder.addCase(Login.pending, () =>{
            return { ...initialState, isLogged: false, isLogginIn: true, error:""}
        })

        builder.addCase(Login.rejected, (state, action) =>{
            return {...initialState, isLogged: false, isLogginIn: false, error: "Error login in."}
        })

        builder.addCase(Login.fulfilled, (state, action:PayloadAction<any>)=> {

            if(typeof action.payload && typeof action.payload == "object"){
                
                if(action.payload.success){

                    return {
                        ...action.payload.data,
                        isLogged: true,
                        isLogginIn: false,
                        error: ""
                    }

                }else{
                    return { ...initialState, isLogged: false, isLogginIn: false, error: action.payload.message}
                }

            }else{
                return { ...initialState, isLogged: false, isLogginIn: false, error: "Unknow error."}
            }

        })
    
    },
})

export const { emptyError, logout, showPageLoader, hidePageLoader } = userSlice.actions
export default userSlice.reducer