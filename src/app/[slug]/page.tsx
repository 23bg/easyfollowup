import { notFound } from "next/navigation";

interface PublicSlugPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PublicSlugPage({ params }: PublicSlugPageProps) {
    await params;
    notFound();
}
