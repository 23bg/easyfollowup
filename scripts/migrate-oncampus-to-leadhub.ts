import { PrismaClient, LeadSource, LeadStatus, LeadType } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateInstitutesToLeads() {
    const institutes = await prisma.institute.findMany({
        where: { deletedAt: null },
    });

    for (const institute of institutes) {
        const existing = await prisma.lead.findFirst({
            where: {
                name: institute.name ?? "",
                city: institute.city ?? undefined,
                category: "INSTITUTE",
                instituteId: institute.id,
            },
        });

        if (existing) continue;

        await prisma.lead.create({
            data: {
                instituteId: institute.id,
                name: institute.name || "Unnamed Institute",
                primaryPhone: institute.phone ?? undefined,
                phone: institute.phone ?? undefined,
                city: institute.city ?? undefined,
                state: institute.state ?? undefined,
                address: institute.address ?? undefined,
                website: institute.websiteUrl ?? undefined,
                category: "INSTITUTE",
                type: LeadType.INSTITUTE,
                source: LeadSource.MANUAL,
                status: LeadStatus.NEW,
                tags: ["migrated", "institute"],
            },
        });
    }

    return institutes.length;
}

async function normalizeLegacyLeads() {
    const legacyLeads = await prisma.lead.findMany({
        where: {
            deletedAt: null,
        },
    });

    for (const lead of legacyLeads) {
        await prisma.lead.update({
            where: { id: lead.id },
            data: {
                primaryPhone: lead.primaryPhone ?? lead.phone ?? undefined,
                type: lead.type ?? LeadType.PERSON,
                source: lead.source ?? LeadSource.MANUAL,
                status: lead.status ?? LeadStatus.NEW,
                tags: lead.tags.length ? lead.tags : ["migrated"],
                notes: lead.notes ?? lead.message ?? undefined,
            },
        });
    }

    return legacyLeads.length;
}

async function main() {
    const [institutes, leads] = await Promise.all([
        migrateInstitutesToLeads(),
        normalizeLegacyLeads(),
    ]);

    console.log(`Migration complete. Institutes processed: ${institutes}, leads normalized: ${leads}`);
}

main()
    .catch((error) => {
        console.error("Migration failed", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
