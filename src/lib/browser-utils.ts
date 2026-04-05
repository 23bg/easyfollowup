"use client";

export const clipboard = {
    async writeText(value: string): Promise<boolean> {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(value);
                return true;
            } catch {
                // Fallback below.
            }
        }

        if (typeof document === "undefined") return false;

        try {
            const node = document.createElement("textarea");
            node.value = value;
            node.style.position = "fixed";
            node.style.left = "-9999px";
            document.body.appendChild(node);
            node.select();
            const success = document.execCommand("copy");
            document.body.removeChild(node);
            return success;
        } catch {
            return false;
        }
    },

    async readText(): Promise<string | null> {
        if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return null;
        try {
            return await navigator.clipboard.readText();
        } catch {
            return null;
        }
    },
};

export const fullscreen = {
    async enter(element?: Element | null): Promise<boolean> {
        if (typeof document === "undefined") return false;
        const target = element ?? document.documentElement;

        try {
            if (target.requestFullscreen) {
                await target.requestFullscreen();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    async exit(): Promise<boolean> {
        if (typeof document === "undefined") return false;

        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    async toggle(element?: Element | null): Promise<boolean> {
        if (typeof document === "undefined") return false;
        if (document.fullscreenElement) return this.exit();
        return this.enter(element);
    },
};
