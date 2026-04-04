import { useGetSessionQuery, SessionData } from '@/features/auth/services/authApi';

export interface UseSessionReturn {
    data: SessionData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch: () => void;
}

export const useSession = (): UseSessionReturn => {
    const { data, isLoading, isError, error, refetch } = useGetSessionQuery();

    // If there's an error, treat it as no session
    const sessionData = isError ? undefined : data;

    return {
        data: sessionData,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export const useInvalidateSession = () => {
    // This will be implemented when we add the mutation
    return () => {
        // Invalidate session will be handled by RTK Query invalidation
    };
};
