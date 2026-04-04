// import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
// import { loginUser, signupUser, verifyOtp } from "../slices/authSlice";

// export const useAuth = () => {
//     const dispatch = useAppDispatch();
//     const { user, loading, error, isAuthenticated } = useAppSelector(
//         (state) => state.auth
//     );

//     const login = (data: { email: string; }) =>
//         dispatch(loginUser(data));
//     const signup = (data: { name: string; email: string; phoneNumber: string }) =>
//         dispatch(signupUser(data));
//     const verifyOTP = (data: { email: string, otp: string }) => dispatch(verifyOtp(data));


//     return { user, loading, error, isAuthenticated, login, signup, verifyOTP };
// };

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { loginUser, signupUser, verifyOtp, logoutUser } from "../slices/authSlice";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(
        (state) => state.auth
    );

    // Generic wrapper for dispatch + callbacks
    const withCallbacks = async (action: any, callbacks?: {
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
        onFinally?: () => void;
    }) => {
        const { onSuccess, onError, onFinally } = callbacks || {};

        try {
            const result = await dispatch(action).unwrap(); // unwrap gives actual response
            onSuccess?.(result);
            return result;
        } catch (err) {
            onError?.(err);
            throw err;
        } finally {
            onFinally?.();
        }
    };

    // --- AUTH METHODS WITH CALLBACK SUPPORT ---

    const login = (data: { email: string }, callbacks?: any) =>
        withCallbacks(loginUser(data), callbacks);

    const signup = (
        data: { name: string; email: string; phoneNumber: string },
        callbacks?: any
    ) => withCallbacks(signupUser(data), callbacks);

    const verifyOTP = (
        data: { email: string; otp: string },
        callbacks?: any
    ) => withCallbacks(verifyOtp(data), callbacks);

    const logout = (callbacks?: any) =>
        withCallbacks(logoutUser(), callbacks);

    return {
        loading,
        error,
        login,
        signup,
        verifyOTP,
        logout,
    };
};

