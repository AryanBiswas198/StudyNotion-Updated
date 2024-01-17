import {createSlice} from "@reduxjs/toolkit";

// We collect token from this slice only to get an idea if the user is loggedin or not, if the user is loggedin, we show cart and other dropdown options in the Navbar, if user isnt loggedin, we show login and signup button

const initialState = {
    signupData: null,
    loading: false,
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setSignupData(state, value) {
            state.signupData = value.payload;
          },
          setLoading(state, value) {
            state.loading = value.payload;
          },
        setToken(state, value){
            state.token = value.payload;
        },
    },
});

export const {setSignupData, setLoading, setToken} = authSlice.actions;
export default authSlice.reducer;