import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata = {
  title: "Offline - EasyFollowUp",
};

export default function OfflinePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Container className="flex min-h-dvh items-center justify-center py-10">
        <div className="w-full max-w-lg rounded-xl border bg-card p-6 text-center shadow-sm md:p-8">
          <h1 className="text-xl font-bold md:text-2xl">You are offline</h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">Some features are not available while you're offline. Cached pages and data may still be accessible.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded bg-primary px-4 py-2 text-primary-foreground">Home</Link>
            <Link href="/dashboard" className="rounded border px-4 py-2">Dashboard</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
