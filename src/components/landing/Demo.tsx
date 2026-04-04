import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Demo() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:px-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Public Lead Capture</h2>
                    <p className="mt-3 text-muted-foreground">Each organization can expose a public capture endpoint for external lead collection.</p>
                    <Button asChild className="mt-6" variant="outline">
                        <Link href="/contact">Request setup</Link>
                    </Button>
                </div>
                <div className="rounded border bg-muted/20 p-3">
                    <Image
                        src="/landing/demo-mock.svg"
                        alt="Public lead capture preview"
                        width={900}
                        height={620}
                        loading="lazy"
                        className="h-auto w-full rounded"
                    />
                </div>
            </div>
        </section>
    );
}

