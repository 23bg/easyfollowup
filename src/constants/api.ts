export const API = {
    BASE_V1: '/api/v1',
    CRM: {
        ORG: '/org',
        USERS: '/users',
        LEAD: '/lead',
        FOLLOWUP: '/followup',
        SUBSCRIPTION: '/subscription',
    },
    EasyFollowUp: {
        LEADS: '/leads',
        LEAD_BY_ID: (id: string) => `/leads/${id}`,
        MAPS_IMPORT: '/maps-import',
        SOURCES: '/lead-sources',
        SOURCE_BY_ID: (id: string) => `/lead-sources/${id}`,
        CONTACT_LOGS: '/contact-logs',
        CONTACT_LOG_BY_ID: (id: string) => `/contact-logs/${id}`,
        AUTOMATIONS: '/automations',
        AUTOMATION_BY_ID: (id: string) => `/automations/${id}`,
    },
    ONCAMPUS: {
        AUTH: {
            REQUEST_OTP: '/auth/request-otp',
            VERIFY_OTP: '/auth/verify-otp',
            LOG_OUT: '/auth/logout',
            ME: '/auth/me',
            REFRESH_TOKEN: '/auth/refresh-token',
        },
        DASHBOARD: {
            METRICS: '/dashboard/metrics',
        },
        PUBLIC: {
            LEAD: (slug: string) => `/public/${slug}/lead`,
        },
        WEBHOOKS: {
            RAZORPAY: '/webhooks/razorpay',
        },
    },
    AUTH: {
        LOG_IN: '/auth/request-otp',
        LOG_OUT: '/auth/logout',
        SIGN_UP: '/auth/request-otp',
        VERIFY: '/auth/verify-otp',
        REFRESH_TOKEN: '/auth/refresh-token',
        ME: '/auth/me',
    },
    INTERNAL: {

        AUTH: {
            ME: '/auth/me',
        },
        DASHBOARD: {
            METRICS: '/dashboard/metrics',
        },
        ORGANIZATION: {
            ROOT: '/organization',
            ONBOARDING: '/organization/onboarding',
        },
        PUBLIC: {
            LEAD: (slug: string) => `/public/${slug}/lead`,
        },
        TEAMS: {
            ROOT: '/teams',
            BY_ID: (id: string) => `/teams/${id}`,
        },
        LEADS: {
            ROOT: '/leads',
            BY_ID: (id: string) => `/leads/${id}`,
        },
        LEAD_SOURCES: {
            ROOT: '/lead-sources',
            BY_ID: (id: string) => `/lead-sources/${id}`,
        },
        CONTACT_LOGS: {
            ROOT: '/contact-logs',
            BY_ID: (id: string) => `/contact-logs/${id}`,
        },
        AUTOMATIONS: {
            ROOT: '/automations',
            BY_ID: (id: string) => `/automations/${id}`,
        },
    },
}
