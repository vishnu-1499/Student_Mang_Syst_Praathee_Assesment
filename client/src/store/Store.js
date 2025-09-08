import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth"

const Store = configureStore({
    reducer: {
        auth: authReducer
    }
});

export default Store;