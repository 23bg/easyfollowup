import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPseoPageContent, parsePseoSlug } from "@/modules/marketing/pseo/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicSlugPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicSlugPageProps): Promise<Metadata> {
    const { slug } = await params;
    const parsed = parsePseoSlug(slug);

    if (!parsed) {
        return {
            title: "Page Not Found",
            robots: { index: false, follow: false },
        };
    }

    const content = getPseoPageContent(parsed);

    return {
        title: content.title,
        description: content.hero,
        alternates: {
            canonical: `/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.hero,
            url: `/${slug}`,
            type: "article",
        },
    };
}

export default async function PublicSlugPage({ params }: PublicSlugPageProps) {
    const { slug } = await params;
    const parsed = parsePseoSlug(slug);
    if (!parsed) notFound();

    const content = getPseoPageContent(parsed);

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
            <article className="space-y-10">
                <header className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{content.keyword}</h1>
                    <p className="text-base text-muted-foreground md:text-lg">{content.hero}</p>
                </header>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">Industry-specific challenges</h2>
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {content.challenges.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">Regional context for {parsed.region.label}</h2>
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {content.regionContext.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">How {parsed.feature.label} solves these workflows</h2>
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {content.featureMapping.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">Practical use cases</h2>
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {content.useCases.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">FAQs</h2>
                    <div className="space-y-4">
                        {content.faqs.map((faq) => (
                            <div key={faq.q} className="rounded-lg border p-4">
                                <h3 className="font-medium">{faq.q}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-3 rounded-lg border bg-muted/30 p-5">
                    <h2 className="text-xl font-semibold">Next best pages</h2>
                    <p className="text-sm text-muted-foreground">
                        Related industries: {content.related.industries.join(", ")}. Related regions: {content.related.regions.join(", ")}. Related features: {content.related.features.join(", ")}.
                    </p>
                </section>

                <section className="rounded-lg border p-5">
                    <p className="text-sm font-medium">{content.cta}</p>
                </section>
            </article>
        </main>
    );
}
