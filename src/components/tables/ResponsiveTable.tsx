"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResponsiveTableColumn<T> = {
    key: string;
    title: string;
    isPrimary?: boolean;
    render: (row: T) => React.ReactNode;
};

export type ResponsiveTableAction<T> = {
    label: string;
    onClick: (row: T) => void;
};

export type ResponsiveTableProps<T> = {
    data: T[];
    columns: ResponsiveTableColumn<T>[];
    getRowKey: (row: T) => string;
    emptyTitle?: string;
    emptyDescription?: string;
    actions?: ResponsiveTableAction<T>[];
    className?: string;
};

export default function ResponsiveTable<T>({
    data,
    columns,
    getRowKey,
    emptyTitle = "No items found",
    emptyDescription,
    actions,
    className,
}: ResponsiveTableProps<T>) {
    const primaryColumn = columns.find((column) => column.isPrimary) ?? columns[0];
    const secondaryColumns = columns.filter((column) => column.key !== primaryColumn.key);

    if (!data.length) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="hidden overflow-hidden rounded-lg border md:block">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-4 py-3 font-medium">
                                    {column.title}
                                </th>
                            ))}
                            {actions?.length ? <th className="w-10 px-4 py-3" /> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={getRowKey(row)} className="border-b last:border-b-0">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3 align-top">
                                        {column.render(row)}
                                    </td>
                                ))}
                                {actions?.length ? (
                                    <td className="px-4 py-3 align-top">
                                        <RowActions row={row} actions={actions} />
                                    </td>
                                ) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-3 md:hidden">
                {data.map((row) => (
                    <article key={getRowKey(row)} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{primaryColumn.render(row)}</p>
                            </div>
                            {actions?.length ? <RowActions row={row} actions={actions} /> : null}
                        </div>

                        <dl className="mt-3 grid gap-2">
                            {secondaryColumns.map((column) => (
                                <div key={column.key} className="grid grid-cols-[96px_1fr] items-start gap-2">
                                    <dt className="text-xs text-muted-foreground">{column.title}</dt>
                                    <dd className="text-sm">{column.render(row)}</dd>
                                </div>
                            ))}
                        </dl>
                    </article>
                ))}
            </div>
        </div>
    );
}

function RowActions<T>({ row, actions }: { row: T; actions: ResponsiveTableAction<T>[] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open row actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action) => (
                    <DropdownMenuItem key={action.label} onClick={() => action.onClick(row)}>
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
