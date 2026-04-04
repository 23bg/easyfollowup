const ROUTES = {
	ROOT: "/",
	HOME: "/",
	DASHBOARD: {
		ROOT: "/",
		DASHBOARD: "/dashboard",
		LEADS: "/leads",
		FOLLOWUPS: "/followups",
		LEAD_DETAILS: (id: string) => `/lead/${id}`,
		SOURCES: "/sources",
		AUTOMATION: "/automation",
		CONTACTS: "/contacts",
		TEAM: "/team",
		BILLING: "/billing",
		SETTINGS: "/settings",
		PUBLIC_ORGANIZATION: (slug: string) => `/public/${slug}`,
	},
	AUTH: {
		LOG_IN: "/login",
		SIGN_UP: "/signup",
		VERIFICATION: "/verification",
	},
	PRICING: "/pricing",
	FEATURES: "/features",
	ABOUT: "/about",
	CONTACT: "/contact",
	PRIVACY: "/privacy",
	TERMS: "/terms",
};

export default ROUTES;
