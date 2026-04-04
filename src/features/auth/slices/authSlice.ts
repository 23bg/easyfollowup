import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiPost } from "@/lib/apiService";
import { API } from "@/constants";
import { AuthUser, LoginPayload, SignupPayload, verificationPayload } from "@/features/auth/types/auth.type";
import { AppError } from "@/types/api";
import { authApi } from "../services/authApi";

// ------------------------------
// TYPES
// ------------------------------

export interface AuthResponse {
    user?: AuthUser;
    expiresAt?: number;
    redirectTo?: string;
}

interface AuthState {
    loading: boolean;
    error: AppError | null;
    successMessage: string | null;
}

// ------------------------------
// INITIAL STATE
// ------------------------------

const initialState: AuthState = {
    loading: false,
    error: null,
    successMessage: null,
};

// ------------------------------
// ASYNC THUNKS
// ------------------------------

export const loginUser = createAsyncThunk<
    AuthResponse,
    LoginPayload,
    { rejectValue: AppError }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
    try {
        return await apiPost<AuthResponse>(API.AUTH.LOG_IN, payload);
    } catch (error) {
        return rejectWithValue(error as AppError);
    }
});

export const signupUser = createAsyncThunk<
    AuthResponse,
    SignupPayload,
    { rejectValue: AppError }
>("auth/signupUser", async (payload, { rejectWithValue }) => {
    try {
        return await apiPost<AuthResponse>(API.AUTH.SIGN_UP, payload);
    } catch (error) {
        return rejectWithValue(error as AppError);
    }
});

export const verifyOtp = createAsyncThunk<
    AuthResponse,
    verificationPayload,
    { rejectValue: AppError }
>("auth/verifyOtp", async (payload, { rejectWithValue, dispatch }) => {
    try {
        const result = await apiPost<AuthResponse>(API.AUTH.VERIFY, payload);
        // Invalidate session cache to trigger refetch
        dispatch(authApi.util.invalidateTags(['Session']));
        return result;
    } catch (error) {
        return rejectWithValue(error as AppError);
    }
});

export const logoutUser = createAsyncThunk<
    void,
    void,
    { rejectValue: AppError }
>("auth/logoutUser", async (_, { rejectWithValue }) => {
    try {
        // The apiPost service expects a return type, but logout may not return data.
        // We can cast the result to void if the backend returns an empty success response.
        await apiPost<null>(API.AUTH.LOG_OUT, {});
    } catch (error) {
        // Even if logout fails on the backend, we should clear the frontend state.
        // The error can be ignored or logged if necessary, but we still proceed.
        // Forcing a logout on the client is the primary goal.
    }
});

// ------------------------------
// SLICE
// ------------------------------

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthState: () => initialState,
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.error = null;
                state.successMessage = "Login successful. Please check your email for OTP.";
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            })

            // SIGNUP
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.error = null;
                state.successMessage = "Account created successfully. Please check your email for OTP.";
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            })

            // VERIFY OTP
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.error = null;
                state.successMessage = "OTP verified successfully.";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            })

            // LOGOUT
            .addCase(logoutUser.pending, (state) => {
                state.loading = true; // Visual feedback for logout
            })
            .addCase(logoutUser.fulfilled, (state) => {
                // This resets the state to initial values
                Object.assign(state, initialState);
            })
            .addCase(logoutUser.rejected, (state) => {
                // Still log out on the frontend even if backend call fails
                Object.assign(state, initialState);
            });
    },
});

// ------------------------------
// EXPORTS
// ------------------------------

export const { resetAuthState, clearMessages } =
    authSlice.actions;

export default authSlice.reducer;


