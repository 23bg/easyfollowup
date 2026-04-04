import Link from "next/link";

export const metadata = {
  title: "Offline - EasyFollowUp",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-lg text-center px-6 py-12">
        <h1 className="text-2xl font-bold">You are offline</h1>
        <p className="mt-4 text-muted-foreground">Some features are not available while you're offline. Cached pages and data may still be accessible.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded bg-primary px-4 py-2 text-primary-foreground">Home</Link>
          <Link href="/dashboard" className="rounded border px-4 py-2">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
