import type { Metadata } from "next";
import LandingHeader from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Contact - OnCampus",
    description: "Contact OnCampus support and sales.",
};

export default function ContactPage() {
    return (
        <>
            <LandingHeader />
            <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact</h1>
                <p className="mt-3 text-muted-foreground">Need help with setup, billing, or product questions? Reach us anytime.</p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-5">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="mt-1 font-medium">support@oncampus.app</p>
                    </div>
                    <div className="rounded-xl border p-5">
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="mt-1 font-medium">+91 90000 00000</p>
                    </div>
                    <div className="rounded-xl border p-5">
                        <p className="text-sm text-muted-foreground">Support Hours</p>
                        <p className="mt-1 font-medium">Mon-Sat, 10:00 AM - 7:00 PM</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
