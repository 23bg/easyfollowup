import { cn } from "@/lib/utils";

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
};

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <header className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
            <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl lg:text-3xl">{title}</h1>
                {description ? (
                    <p className="text-sm text-muted-foreground md:text-base">{description}</p>
                ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
    );
}
