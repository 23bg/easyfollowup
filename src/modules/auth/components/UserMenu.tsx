"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export default function UserMenu() {
    const router = useRouter();

    const logout = async () => {
        try {
            await api.post(API.AUTH.LOG_OUT);
        } catch {
        } finally {
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button aria-label="Open user menu" className="rounded-full focus:outline-none">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>OC</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
