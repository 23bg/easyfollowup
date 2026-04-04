"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/providers/theme-provider";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Button
            size="icon"
            variant="outline"
            className="rounded-full bg-muted text-muted-foreground hover:bg-primary-600 hover:text-white"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {!mounted || theme !== "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
    );
}
