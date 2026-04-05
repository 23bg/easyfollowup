import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
    message?: string;
    showSkeleton?: boolean;
    className?: string;
};

export default function LoadingState({
    message = "Loading...",
    showSkeleton = false,
    className,
}: LoadingStateProps) {
    if (showSkeleton) {
        return (
            <div className={cn("space-y-3", className)}>
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{message}</span>
        </div>
    );
}
