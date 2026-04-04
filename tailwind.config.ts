import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist)", "sans-serif"],
                heading: ["var(--font-geist)", "sans-serif"],
            },
        },
    },
};

export default config;
