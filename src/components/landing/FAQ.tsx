import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        q: "Can we capture leads from multiple channels?",
        a: "Yes. Use manual entry, imports, public form endpoint, and source-based tracking.",
    },
    {
        q: "Does LeadHub support lead scoring?",
        a: "Yes. New leads are scored so teams can prioritize high-intent prospects faster.",
    },
    {
        q: "Can my team log follow-ups?",
        a: "Yes. Calls, emails, WhatsApp, demos, and meetings can be logged per lead.",
    },
    {
        q: "Is this mobile friendly?",
        a: "Yes.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes.",
    },
];

export default function FAQ() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-4xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">FAQ</h2>
                <Accordion type="single" collapsible className="mt-6 w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.q} value={`item-${index + 1}`}>
                            <AccordionTrigger>{faq.q}</AccordionTrigger>
                            <AccordionContent>{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

