export type PseoIndustry = {
    key: string;
    label: string;
    audienceHint: string;
    challenges: string[];
};

export type PseoFeature = {
    key: string;
    label: string;
    workflowMapping: string[];
};

export type PseoRegion = {
    key: string;
    label: string;
    context: string[];
    complianceHint?: string;
};

export type PseoPageInput = {
    industry: PseoIndustry;
    feature: PseoFeature;
    region: PseoRegion;
};

const industries: PseoIndustry[] = [
  // EXISTING
  {
    key: "real-estate",
    label: "Real Estate",
    audienceHint: "independent brokers and small agencies",
    challenges: [
      "Leads arrive from portals, WhatsApp, calls, and social ads at the same time",
      "Follow-up speed directly impacts property visit conversions",
      "Buyer and seller journeys need different messaging and timelines",
      "Agents lose deal context when conversations stay in personal chats",
      "Pipeline visibility is weak across multi-agent teams",
    ],
  },

  {
    key: "education",
    label: "Education",
    audienceHint: "admission counselors and course advisors",
    challenges: [
      "Inquiry peaks during admission windows create response bottlenecks",
      "Counseling history is spread across spreadsheets and chat apps",
      "Batch and course-specific follow-ups are often delayed",
      "Parent and student communication needs separate tracking",
      "Lead source quality is hard to compare across campaigns",
    ],
  },

  {
    key: "healthcare",
    label: "Healthcare",
    audienceHint: "clinic operations and patient acquisition teams",
    challenges: [
      "Appointment intent drops quickly without structured reminders",
      "Front-desk teams juggle calls, chat, and walk-ins with no shared queue",
      "Patient communication needs timing discipline and clear ownership",
      "Manual follow-ups create inconsistent service experience",
      "Reporting across service lines and centers is fragmented",
    ],
  },

  // 🔥 NEW INDUSTRIES

  {
    key: "recruitment-agency",
    label: "Recruitment Agency",
    audienceHint: "recruiters and talent acquisition teams",
    challenges: [
      "Candidate data is scattered across emails, sheets, and portals",
      "Follow-ups with candidates and companies are inconsistent",
      "Tracking candidate pipeline across roles is complex",
      "Duplicate profiles and outdated resumes create confusion",
      "Placement cycle visibility is poor across recruiters",
    ],
  },

  {
    key: "saas",
    label: "SaaS",
    audienceHint: "inside sales and customer success teams",
    challenges: [
      "Inbound leads drop without timely qualification",
      "Sales and onboarding data are disconnected",
      "Customer lifecycle tracking is inconsistent",
      "Trial users are not nurtured effectively",
      "Churn signals are missed due to lack of tracking",
    ],
  },

  {
    key: "banking-finance",
    label: "Banking & Finance",
    audienceHint: "loan officers and financial advisors",
    challenges: [
      "Leads from multiple channels are not unified",
      "Document collection and verification delays conversions",
      "Customer follow-ups are inconsistent across agents",
      "Compliance tracking adds operational complexity",
      "Loan pipeline visibility is fragmented",
    ],
  },

  {
    key: "insurance",
    label: "Insurance",
    audienceHint: "insurance agents and advisors",
    challenges: [
      "Policy renewal follow-ups are missed",
      "Customer lifecycle communication is inconsistent",
      "Lead nurturing requires long-term engagement",
      "Manual tracking reduces conversion rates",
      "Cross-selling opportunities are not captured",
    ],
  },

  {
    key: "automobile",
    label: "Automobile",
    audienceHint: "car dealerships and sales executives",
    challenges: [
      "Test drive follow-ups are delayed",
      "Walk-in and online leads are not unified",
      "Sales teams lack visibility into lead status",
      "Customer interest drops due to slow response",
      "Deal tracking across sales reps is inconsistent",
    ],
  },

  {
    key: "ecommerce",
    label: "E-commerce",
    audienceHint: "D2C brands and online sellers",
    challenges: [
      "Customer inquiries across channels are fragmented",
      "Abandoned carts are not followed up effectively",
      "Support and sales conversations are not unified",
      "Repeat customer engagement is weak",
      "Order-related communication lacks automation",
    ],
  },

  {
    key: "hospitality",
    label: "Hospitality",
    audienceHint: "hotel and booking management teams",
    challenges: [
      "Booking inquiries are missed during peak times",
      "Customer communication is inconsistent across channels",
      "Repeat guest engagement is not tracked",
      "Manual handling reduces response speed",
      "Revenue opportunities are lost due to slow follow-ups",
    ],
  },

  {
    key: "fitness",
    label: "Fitness & Gyms",
    audienceHint: "gym owners and membership managers",
    challenges: [
      "Trial users are not converted into paid members",
      "Follow-ups after inquiries are inconsistent",
      "Membership renewals are missed",
      "Customer engagement drops after onboarding",
      "Lead tracking is handled manually",
    ],
  },

  {
    key: "legal",
    label: "Legal Services",
    audienceHint: "law firms and legal consultants",
    challenges: [
      "Client inquiries are not tracked systematically",
      "Case follow-ups depend on manual processes",
      "Client communication is scattered",
      "Deadlines and updates are hard to manage",
      "Lead-to-client conversion tracking is weak",
    ],
  },

  {
    key: "travel",
    label: "Travel & Tours",
    audienceHint: "travel agents and tour operators",
    challenges: [
      "Inquiry spikes during seasons overwhelm teams",
      "Customer preferences are not tracked properly",
      "Follow-ups are delayed leading to lost bookings",
      "Multi-channel communication is not unified",
      "Package conversion tracking is unclear",
    ],
  },

  {
    key: "consulting",
    label: "Consulting",
    audienceHint: "business consultants and advisors",
    challenges: [
      "Client conversations are not documented properly",
      "Lead qualification is inconsistent",
      "Follow-ups depend on individual consultants",
      "Pipeline visibility is limited",
      "Conversion tracking is unclear",
    ],
  },

  {
    key: "manufacturing",
    label: "Manufacturing",
    audienceHint: "sales and distributor management teams",
    challenges: [
      "Distributor and dealer communication is fragmented",
      "Order follow-ups are inconsistent",
      "Sales pipeline visibility is weak",
      "Lead tracking across regions is difficult",
      "Manual processes slow down operations",
    ],
  },

  {
    key: "events",
    label: "Event Management",
    audienceHint: "event planners and coordinators",
    challenges: [
      "Client inquiries come from multiple channels",
      "Follow-ups are inconsistent during peak seasons",
      "Event requirements are not tracked centrally",
      "Communication gaps lead to missed opportunities",
      "Pipeline tracking is weak",
    ],
  },
];

const features: PseoFeature[] = [
  // EXISTING

  {
    key: "whatsapp-automation",
    label: "WhatsApp Automation",
    workflowMapping: [
      "Capture inbound chat leads and assign owners instantly",
      "Trigger template-based follow-ups after no-response windows",
      "Auto-tag leads by message intent and campaign origin",
      "Create reminder sequences for high-intent conversations",
      "Track response-time metrics by team member",
    ],
  },

  {
    key: "sales-pipeline",
    label: "Sales Pipeline Tracking",
    workflowMapping: [
      "Move leads through clearly defined stage transitions",
      "Enforce stage-level tasks and next-action ownership",
      "Highlight stalled opportunities based on inactivity",
      "Measure conversion rate at each pipeline checkpoint",
      "Forecast closures with stage aging and probability signals",
    ],
  },

  {
    key: "lead-follow-up",
    label: "Lead Follow-up Software",
    workflowMapping: [
      "Set structured follow-up cadence by lead temperature",
      "Send personalized nudges from reusable templates",
      "Escalate delayed follow-ups to supervisors automatically",
      "Track attempted and successful contact ratios",
      "Unify call notes, messages, and outcomes in one timeline",
    ],
  },

  // 🔥 NEW FEATURES

  {
    key: "lead-management",
    label: "Lead Management System",
    workflowMapping: [
      "Capture leads from multiple sources into a single system",
      "Auto-assign leads based on rules or team structure",
      "Deduplicate incoming leads automatically",
      "Segment leads by source, intent, and behavior",
      "Track lead lifecycle from inquiry to closure",
    ],
  },

  {
    key: "crm-analytics",
    label: "CRM Analytics & Reporting",
    workflowMapping: [
      "Track conversion rates across funnel stages",
      "Analyze team performance with response-time metrics",
      "Measure campaign ROI by lead source",
      "Identify drop-offs in the pipeline",
      "Generate daily and weekly performance dashboards",
    ],
  },

  {
    key: "task-automation",
    label: "Task & Workflow Automation",
    workflowMapping: [
      "Auto-create tasks based on lead actions or stage changes",
      "Assign tasks with deadlines and ownership",
      "Trigger reminders for overdue activities",
      "Automate repetitive operational workflows",
      "Track task completion and productivity metrics",
    ],
  },

  {
    key: "multi-channel-inbox",
    label: "Omnichannel Inbox",
    workflowMapping: [
      "Unify WhatsApp, email, calls, and social messages in one inbox",
      "Assign conversations to team members",
      "Track conversation history across channels",
      "Respond using templates and quick replies",
      "Ensure no conversation is missed",
    ],
  },

  {
    key: "email-automation",
    label: "Email Automation",
    workflowMapping: [
      "Send automated email sequences based on user behavior",
      "Trigger follow-ups after inactivity",
      "Personalize email campaigns at scale",
      "Track open, click, and response rates",
      "Segment users for targeted outreach",
    ],
  },

  {
    key: "ai-lead-scoring",
    label: "AI Lead Scoring",
    workflowMapping: [
      "Score leads based on behavior and engagement",
      "Prioritize high-intent leads automatically",
      "Identify cold leads early",
      "Recommend next best actions using AI",
      "Improve conversion rates with data-driven prioritization",
    ],
  },

  {
    key: "appointment-scheduling",
    label: "Appointment Scheduling",
    workflowMapping: [
      "Allow users to book meetings directly from links",
      "Sync calendars across teams",
      "Send automated reminders before appointments",
      "Reduce no-shows with follow-up notifications",
      "Track appointment-to-conversion rates",
    ],
  },

  {
    key: "candidate-tracking",
    label: "Applicant Tracking System (ATS)",
    workflowMapping: [
      "Track candidates across hiring stages",
      "Manage resumes and candidate profiles centrally",
      "Schedule interviews and track feedback",
      "Collaborate with hiring teams on decisions",
      "Monitor hiring pipeline and time-to-hire",
    ],
  },

  {
    key: "resume-screening",
    label: "AI Resume Screening",
    workflowMapping: [
      "Automatically filter resumes based on job criteria",
      "Rank candidates by relevance and skills",
      "Reduce manual screening time",
      "Highlight top candidates instantly",
      "Improve hiring efficiency using AI insights",
    ],
  },

  {
    key: "team-collaboration",
    label: "Team Collaboration",
    workflowMapping: [
      "Share notes and updates across team members",
      "Assign ownership of leads and tasks",
      "Track internal discussions on deals or candidates",
      "Maintain centralized communication history",
      "Improve coordination across departments",
    ],
  },

  {
    key: "document-management",
    label: "Document Management",
    workflowMapping: [
      "Store and organize documents related to leads or candidates",
      "Share files securely with teams or clients",
      "Track document status and updates",
      "Automate document requests and reminders",
      "Maintain audit logs for compliance",
    ],
  },

  {
    key: "customer-retention",
    label: "Customer Retention & Engagement",
    workflowMapping: [
      "Track customer lifecycle and engagement",
      "Send re-engagement campaigns automatically",
      "Identify churn risks early",
      "Maintain long-term customer relationships",
      "Improve repeat business and referrals",
    ],
  },

  {
    key: "campaign-management",
    label: "Campaign Management",
    workflowMapping: [
      "Launch and track marketing campaigns",
      "Attribute leads to specific campaigns",
      "Measure campaign performance in real-time",
      "Optimize campaigns based on conversion data",
      "Manage multi-channel marketing efforts",
    ],
  },

  {
    key: "lead-distribution",
    label: "Lead Distribution System",
    workflowMapping: [
      "Distribute leads automatically across teams",
      "Balance workload among sales representatives",
      "Route leads based on geography or expertise",
      "Ensure fair and efficient lead allocation",
      "Track performance by assigned leads",
    ],
  },

  {
    key: "mobile-crm",
    label: "Mobile CRM",
    workflowMapping: [
      "Access CRM features on mobile devices",
      "Update lead status in real-time from the field",
      "Receive instant notifications for new leads",
      "Manage tasks and follow-ups on the go",
      "Improve field sales productivity",
    ],
  },
];

const regions: PseoRegion[] = [
  // EXISTING

  {
    key: "usa",
    label: "USA",
    context: [
      "Teams rely heavily on email and CRM workflows for structured communication",
      "Sales processes are data-driven with strong focus on conversion metrics",
      "Speed-to-lead and outbound cadence directly impact revenue",
    ],
    complianceHint: "privacy and consent expectations vary by state (CCPA, etc.)",
  },

  {
    key: "india",
    label: "India",
    context: [
      "WhatsApp is the primary communication channel for most businesses",
      "High lead volumes require aggressive follow-up and prioritization",
      "Mobile-first workflows dominate both field and inside sales",
    ],
    complianceHint: "WhatsApp template approvals and opt-in handling must be managed carefully",
  },

  {
    key: "germany",
    label: "Germany",
    context: [
      "Structured processes and documentation are critical in operations",
      "Teams prioritize transparency and accountability in pipeline tracking",
      "Quality of communication is valued over aggressive outreach",
    ],
    complianceHint: "strict GDPR compliance and data protection standards apply",
  },

  {
    key: "brazil",
    label: "Brazil",
    context: [
      "Messaging apps like WhatsApp dominate customer communication",
      "Fast response time significantly improves conversion rates",
      "Personalized communication is essential for engagement",
    ],
    complianceHint: "consent-driven communication improves trust and deliverability",
  },

  {
    key: "uae",
    label: "UAE",
    context: [
      "Premium customer experience and fast responses are expected",
      "Multilingual communication (English, Arabic) is common",
      "Sales teams operate across distributed and flexible schedules",
    ],
    complianceHint: "role-based access and audit logs are important for enterprise operations",
  },

  // 🔥 NEW REGIONS

  {
    key: "uk",
    label: "United Kingdom",
    context: [
      "Structured CRM usage with strong reliance on email communication",
      "Sales teams focus on relationship-building and follow-up consistency",
      "Pipeline visibility and reporting are critical for decision-making",
    ],
    complianceHint: "GDPR and data protection regulations must be followed",
  },

  {
    key: "canada",
    label: "Canada",
    context: [
      "Balanced use of email, calls, and messaging for communication",
      "Customer experience and responsiveness drive conversions",
      "Sales teams emphasize long-term relationship management",
    ],
    complianceHint: "data privacy laws require clear consent and secure handling",
  },

  {
    key: "australia",
    label: "Australia",
    context: [
      "CRM-driven workflows with strong focus on lead tracking",
      "Timely follow-ups are key to maintaining engagement",
      "Teams rely on structured processes and reporting",
    ],
    complianceHint: "privacy laws require transparent data usage and consent",
  },

  {
    key: "singapore",
    label: "Singapore",
    context: [
      "Highly digital and tech-driven sales processes",
      "Fast response time and efficiency are critical",
      "Businesses adopt automation quickly for scaling operations",
    ],
    complianceHint: "strict data governance and compliance expectations",
  },

  {
    key: "indonesia",
    label: "Indonesia",
    context: [
      "Mobile-first and messaging-heavy communication culture",
      "High reliance on WhatsApp for business interactions",
      "Speed and personalization drive engagement",
    ],
    complianceHint: "consent-based messaging improves reliability",
  },

  {
    key: "philippines",
    label: "Philippines",
    context: [
      "Strong use of messaging apps and social platforms for communication",
      "Customer engagement depends on fast and friendly responses",
      "Sales teams handle high volumes of inbound inquiries",
    ],
    complianceHint: "clear opt-in practices improve communication efficiency",
  },

  {
    key: "south-africa",
    label: "South Africa",
    context: [
      "Mobile-first communication with growing adoption of CRM tools",
      "Lead tracking and follow-up consistency are key challenges",
      "Sales teams operate across diverse customer segments",
    ],
    complianceHint: "data protection laws require responsible handling",
  },

  {
    key: "mexico",
    label: "Mexico",
    context: [
      "Conversational communication channels dominate customer interactions",
      "Quick response times increase trust and conversion",
      "Sales teams rely on personal relationships for closing deals",
    ],
    complianceHint: "consent-driven messaging improves engagement",
  },

  {
    key: "france",
    label: "France",
    context: [
      "Structured communication and formal sales processes are common",
      "CRM adoption is strong in mid-to-large businesses",
      "Customer experience and compliance are prioritized",
    ],
    complianceHint: "strict GDPR compliance is mandatory",
  },

  {
    key: "spain",
    label: "Spain",
    context: [
      "Relationship-driven sales with increasing digital adoption",
      "Messaging apps are widely used alongside email",
      "Follow-up consistency impacts deal closure",
    ],
    complianceHint: "data protection and consent requirements apply",
  },

  {
    key: "italy",
    label: "Italy",
    context: [
      "Sales processes are relationship-focused and communication-heavy",
      "CRM adoption is growing but often inconsistent",
      "Follow-ups and reminders improve conversion significantly",
    ],
    complianceHint: "GDPR compliance and data handling standards apply",
  },

  {
    key: "netherlands",
    label: "Netherlands",
    context: [
      "Highly organized and process-driven sales teams",
      "Strong reliance on CRM systems and automation",
      "Data-driven decision-making is common",
    ],
    complianceHint: "strict GDPR compliance expected",
  },

  {
    key: "japan",
    label: "Japan",
    context: [
      "Highly structured and formal business communication",
      "Long sales cycles with emphasis on trust-building",
      "Detailed tracking and documentation are essential",
    ],
    complianceHint: "strict data handling and privacy expectations",
  },

  {
    key: "south-korea",
    label: "South Korea",
    context: [
      "Digital-first communication with strong mobile usage",
      "Fast response times are expected in business interactions",
      "Automation adoption is high in sales operations",
    ],
    complianceHint: "data protection and compliance are important",
  },
];

const byKey = <T extends { key: string }>(list: T[], key: string): T | null =>
    list.find((item) => item.key === key) ?? null;

const titleCaseWords = (input: string) =>
    input
        .split("-")
        .map((w) => (w ? `${w[0].toUpperCase()}${w.slice(1)}` : w))
        .join(" ");

export function buildPseoSlug(input: PseoPageInput): string {
    return `${input.feature.key}-crm-for-${input.industry.key}-in-${input.region.key}`;
}

export function parsePseoSlug(slug: string): PseoPageInput | null {
    const match = slug.match(/^(.*)-crm-for-(.*)-in-(.*)$/);
    if (!match) return null;

    const feature = byKey(features, match[1]);
    const industry = byKey(industries, match[2]);
    const region = byKey(regions, match[3]);

    if (!feature || !industry || !region) return null;

    return { feature, industry, region };
}

export function getAllPseoSlugs(): string[] {
    const slugs: string[] = [];
    for (const feature of features) {
        for (const industry of industries) {
            for (const region of regions) {
                slugs.push(buildPseoSlug({ feature, industry, region }));
            }
        }
    }
    return slugs;
}

export function getPseoPageContent(input: PseoPageInput) {
    const keyword = `${input.feature.label} CRM for ${input.industry.label} in ${input.region.label}`;
    const title = `${keyword} | EasyFollowUp`;

    const hero = `Manage ${input.industry.label.toLowerCase()} lead operations in ${input.region.label} with ${input.feature.label.toLowerCase()} workflows designed for ${input.industry.audienceHint}.`;

    const regionContext = [
        ...input.region.context,
        input.region.complianceHint ? `Compliance note: ${input.region.complianceHint}.` : null,
    ].filter(Boolean) as string[];

    const useCases = [
        `A frontline user captures an inquiry and starts qualification in under 2 minutes with pre-mapped actions.`,
        `Managers review stage aging and reassign stalled opportunities before they go cold.`,
        `Teams standardize communication templates while preserving local language and context expectations in ${input.region.label}.`,
    ];

    const faqs = [
        {
            q: `How is this different from a generic CRM for ${input.industry.label.toLowerCase()} teams in ${input.region.label}?`,
            a: `The setup is tailored to ${input.feature.label.toLowerCase()} workflows, with stage logic, outreach timing, and reporting aligned to ${input.region.label} operating patterns.`,
        },
        {
            q: `Can small teams adopt this without a long setup cycle?`,
            a: `Yes. You can start with a core pipeline and templates, then layer automation and reporting as your process matures.`,
        },
        {
            q: `Does it help reduce missed follow-ups?`,
            a: `Built-in reminders, owner assignment, and inactivity alerts keep every lead tied to a next action.`,
        },
        {
            q: `Can we track campaign quality by source?`,
            a: `Source-level tracking and stage conversion analytics show which channels produce qualified opportunities.`,
        },
        {
            q: `Is it suitable for region-specific compliance expectations?`,
            a: `Role-based access, audit-ready activity logs, and controlled communication workflows support region-sensitive operations.`,
        },
    ];

    return {
        keyword,
        title,
        hero,
        challenges: input.industry.challenges,
        regionContext,
        featureMapping: input.feature.workflowMapping,
        useCases,
        faqs,
        cta: `Start using ${input.feature.label.toLowerCase()} CRM workflows for ${input.industry.label.toLowerCase()} teams in ${input.region.label}.`,
        related: {
            industries: industries.filter((i) => i.key !== input.industry.key).slice(0, 3).map((i) => i.label),
            regions: regions.filter((r) => r.key !== input.region.key).slice(0, 3).map((r) => r.label),
            features: features.filter((f) => f.key !== input.feature.key).slice(0, 2).map((f) => f.label),
        },
        derivedLabels: {
            industry: titleCaseWords(input.industry.key),
            feature: titleCaseWords(input.feature.key),
            region: titleCaseWords(input.region.key),
        },
    };
}
