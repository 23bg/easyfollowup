import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";

type DirectoryPageProps = {
    params: Promise<{ category: string; city: string }>;
};

export async function generateMetadata({ params }: DirectoryPageProps): Promise<Metadata> {
    const { category, city } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedCity = decodeURIComponent(city);

    return {
        title: `${decodedCategory} Leads in ${decodedCity} | LeadHub Directory`,
        description: `Browse ${decodedCategory} leads in ${decodedCity}.`,
    };
}

export default async function DirectoryPage({ params }: DirectoryPageProps) {
    const { category, city } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedCity = decodeURIComponent(city);

    const leads = await prisma.lead.findMany({
        where: {
            deletedAt: null,
            category: { equals: decodedCategory, mode: "insensitive" },
            city: { equals: decodedCity, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return (
        <main className="mx-auto max-w-5xl p-6">
            <h1 className="text-2xl font-semibold">{decodedCategory} in {decodedCity}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{leads.length} leads found</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {leads.map((lead) => (
                    <article key={lead.id} className="rounded-lg border p-4">
                        <h2 className="font-medium">{lead.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{lead.primaryPhone || "No phone"}</p>
                        <p className="text-sm text-muted-foreground">{lead.website || "No website"}</p>
                    </article>
                ))}
            </div>
        </main>
    );
}
