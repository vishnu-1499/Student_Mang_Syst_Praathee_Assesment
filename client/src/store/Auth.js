import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const type = localStorage.getItem("type");

const initialState = {
    token: token || null,
    type: type || null
}

const Auth = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action) {
            const { token, type } = action.payload;
            state.token = token;
            state.type = type;
            localStorage.setItem("token", token);
            localStorage.setItem("type", type);
        },
    }
})

export const { setAuth } = Auth.actions;
export default Auth.reducer;