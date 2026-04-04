import type { Metadata } from "next";
import "@/styles/globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/providers/theme-provider";
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});


export const metadata: Metadata = {
  title: "LeadHub - Universal Lead Intelligence Platform",
  description:
    "LeadHub helps teams collect, track, and convert leads across products and industries.",
};

// ensureInitialUser();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <NextTopLoader
              showSpinner={false}
              color="#111111"
              shadow={false}
            />
            <main>{children}</main>
            <Toaster
              duration={3000}
              position={"bottom-right"}
            />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

