import { Globe, QrCode, UsersRound, BarChart3 } from "lucide-react";

const items = [
    { icon: Globe, label: "Public Capture" },
    { icon: QrCode, label: "Source Tracking" },
    { icon: UsersRound, label: "Sales Workflow" },
    { icon: BarChart3, label: "Lead Analytics" },
];

export default function Trust() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Built for B2B Teams That Need Better Pipeline Visibility</h2>
                    <p className="text-muted-foreground">Simple • Focused • Conversion-driven</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {items.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

