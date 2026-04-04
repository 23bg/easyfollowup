const solutions = [
    "Unified lead inbox across forms, imports, and outreach",
    "Lead scoring to prioritize conversion-ready prospects",
    "Deduplication to prevent repeated outreach",
    "Source and city-level visibility for pipeline quality",
    "Contact logging and follow-up history per lead",
];

export default function Solution() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">One Lead Engine For Your Revenue Team</h2>
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {solutions.map((item) => (
                        <li key={item} className="rounded border p-4 text-muted-foreground">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

