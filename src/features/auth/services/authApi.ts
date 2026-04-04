import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { API } from '@/constants';
import api from '@/lib/axios';

type AxiosBaseQueryArgs = {
    url: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: unknown;
    params?: Record<string, unknown>;
};

type AxiosBaseQueryError = {
    status?: number;
    data?: unknown;
};

const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> => {
    return async ({ url, method = 'get', data, params }) => {
        try {
            const result = await api.request({ url, method, data, params });
            return { data: result.data };
        } catch (error: any) {
            return {
                error: {
                    status: error?.response?.status,
                    data: error?.response?.data ?? error?.message,
                },
            };
        }
    };
};

export interface SessionData {
    user: {
        id: string;
        email: string;
        role: 'OWNER' | 'MANAGER' | 'VIEWER';
        emailVerified: boolean;
    };
    business: {
        exists: boolean;
        status?: 'DRAFT' | 'ACTIVE';
    };
    gbp: {
        status: 'NOT_CONNECTED' | 'CONNECTED' | 'ERROR';
    };
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Session'],
    endpoints: (builder) => ({
        getSession: builder.query<SessionData, void>({
            query: () => ({ url: API.ONCAMPUS.AUTH.ME }),
            providesTags: ['Session'],
        }),
    }),
});

export const { useGetSessionQuery } = authApi;
