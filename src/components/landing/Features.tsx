import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Lead Explorer",
        description: "Filter, score, and manage leads with complete lifecycle visibility.",
    },
    {
        title: "Multi-Source Capture",
        description: "Capture leads from manual entry, forms, imports, and external channels.",
    },
    {
        title: "Contact Timeline",
        description: "Track calls, emails, WhatsApp, demos, and meetings in one timeline.",
    },
    {
        title: "Automation Controls",
        description: "Configure auto-replies and WhatsApp nudges for faster follow-ups.",
    },
    {
        title: "Public Capture Endpoint",
        description: "Use your public endpoint and embed snippets to collect leads anywhere.",
    },
    {
        title: "Bulk Operations",
        description: "Tag, export, and clean lead lists with bulk actions.",
    },
];

export default function Features() {
    return (
        <section className="w-full border-b " id="features">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Features</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title}>
                            <CardHeader>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">{feature.description}</CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

