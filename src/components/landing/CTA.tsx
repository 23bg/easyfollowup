import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center md:px-6 lg:py-20">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Build Your Lead Engine Today</h2>
                <Button asChild size="lg" className="mt-6">
                    <Link href="/signup">Start Free Trial</Link>
                </Button>
            </div>
        </section>
    );
}

