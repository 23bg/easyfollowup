import { cn } from "@/lib/utils";

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("rounded-lg border border-dashed p-6 text-center", className)}>
            <h3 className="text-base font-semibold md:text-lg">{title}</h3>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
            {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
        </div>
    );
}
