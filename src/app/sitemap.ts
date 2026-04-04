import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://EasyFollowUp.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${BASE_URL}/features`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/signup`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },
    ];

    // Dynamic organization pages
    let organizationPages: MetadataRoute.Sitemap = [];
    try {
        const organizations = await prisma.institute.findMany({
            where: { isOnboarded: true, slug: { not: null } },
            select: { slug: true, updatedAt: true },
        });

        organizationPages = organizations
            .filter((i) => i.slug)
            .map((organization) => ({
                url: `${BASE_URL}/public/${organization.slug}`,
                lastModified: organization.updatedAt,
                changeFrequency: "weekly" as const,
                priority: 0.6,
            }));
    } catch {
        // If DB is unavailable, return only static pages
    }

    return [...staticPages, ...organizationPages];
}
