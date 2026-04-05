import { cn } from "@/lib/utils";

type PrimitiveProps = React.ComponentProps<"div">;

export function Stack({ className, ...props }: PrimitiveProps) {
    return <div className={cn("flex min-w-0 flex-col gap-4 md:gap-6", className)} {...props} />;
}

export function Inline({ className, ...props }: PrimitiveProps) {
    return <div className={cn("flex min-w-0 flex-wrap items-center gap-3 md:gap-4", className)} {...props} />;
}

export function Grid({ className, ...props }: PrimitiveProps) {
    return <div className={cn("grid min-w-0 grid-cols-1 gap-4 md:gap-6 lg:gap-8", className)} {...props} />;
}
