import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/providers/theme-provider";
import { Geist } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NetworkBanner from "@/components/NetworkBanner";

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});


export const metadata: Metadata = {
  title: "EasyFollowUp - Universal Lead Intelligence Platform",
  description:
    "EasyFollowUp helps teams collect, track, and convert leads across products and industries.",
};

// ensureInitialUser();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geist.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <ServiceWorkerRegister />
            <NetworkBanner />
            <NextTopLoader
              showSpinner={false}
              color="#111111"
              shadow={false}
            />
            <main className="min-h-dvh">{children}</main>
            <Toaster
              duration={3000}
              position={"bottom-right"}
              offset={{ bottom: "calc(1rem + var(--dashboard-bottom-nav-height))", right: "1rem" }}
            />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

