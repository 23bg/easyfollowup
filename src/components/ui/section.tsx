import { cn } from "@/lib/utils";

type SectionProps = React.ComponentProps<"section"> & {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
};

export default function Section({
    title,
    description,
    actions,
    className,
    children,
    ...props
}: SectionProps) {
    return (
        <section className={cn("rounded-lg border bg-card", className)} {...props}>
            {(title || description || actions) && (
                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 md:px-6">
                    <div className="space-y-1">
                        {title ? <h2 className="text-base font-semibold md:text-lg">{title}</h2> : null}
                        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                </div>
            )}
            <div className="px-4 py-4 md:px-6">{children}</div>
        </section>
    );
}
