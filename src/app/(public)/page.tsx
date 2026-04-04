import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import Trust from "@/components/landing/Trust";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Demo from "@/components/landing/Demo";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import LandingHeader from "@/components/landing/Header";

export const metadata: Metadata = {
    title: "LeadHub - Build Your Lead Engine",
    description:
        "LeadHub helps growth teams capture, qualify, and convert leads with source intelligence and automation.",
};

export default function LandingPage() {
    return (
        <main className="dark:bg-zinc-900">
            <LandingHeader />
            <Hero />
            <Trust />
            <Problem />
            <Solution />
            <Features />
            <HowItWorks />
            <Demo />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </main  >
    );
}

