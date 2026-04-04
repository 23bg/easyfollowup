const problems = [
    "Leads scattered across forms, calls, and spreadsheets",
    "No clear ownership for follow-ups and callbacks",
    "High-intent leads treated the same as low-intent leads",
    "Manual reporting with no channel-level performance",
    "Slow handoffs from capture to conversion",
];

export default function Problem() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why Most Teams Lose High-Intent Leads</h2>
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {problems.map((item) => (
                        <li key={item} className="rounded border p-4 text-muted-foreground">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

