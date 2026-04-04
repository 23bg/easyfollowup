import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_CONFIG } from "@/config/plans";

const sharedItems = ["Lead Explorer", "Source Analytics", "Contact Logs", "Public Capture Endpoint", "Lead Scoring", "CSV Export"];

const faqs = [
    {
        q: "Can I upgrade from SOLO to TEAM later?",
        a: "Yes, you can upgrade any time from billing.",
    },
    {
        q: "What happens if I exceed my user limit?",
        a: "You can keep capturing leads, but adding new users requires a plan upgrade.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes, both plans include a free trial period with full lead capture access.",
    },
];

export default function Pricing() {
    return (
        <section className="w-full border-b " id="pricing">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Pricing</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">₹{PLAN_CONFIG.SOLO.priceMonthly} / month</CardTitle>
                            <p className="text-sm text-muted-foreground">SOLO • 1 user</p>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm font-medium text-muted-foreground">Includes:</p>
                            <ul className="grid gap-2 text-sm text-muted-foreground">
                                {sharedItems.map((item) => (
                                    <li key={`solo-${item}`} className="rounded border px-3 py-2">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" size="lg" variant="outline">
                                <Link href="/signup">Start Solo Trial</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-3xl">₹{PLAN_CONFIG.TEAM.priceMonthly} / month</CardTitle>
                                <Badge>Recommended</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">TEAM • Up to 5 users</p>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm font-medium text-muted-foreground">Includes:</p>
                            <ul className="grid gap-2 text-sm text-muted-foreground">
                                {sharedItems.map((item) => (
                                    <li key={`team-${item}`} className="rounded border px-3 py-2">
                                        {item}
                                    </li>
                                ))}
                                <li className="rounded border px-3 py-2">Team collaboration (up to 5 users)</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" size="lg">
                                <Link href="/signup">Start Team Trial</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-10 grid gap-3">
                    <h3 className="text-lg font-semibold">Frequently asked questions</h3>
                    {faqs.map((item) => (
                        <div key={item.q} className="rounded border p-3">
                            <p className="font-medium">{item.q}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

