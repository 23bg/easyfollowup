import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background">
            <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6">
                <div>
                    <p className="text-lg font-bold">LeadHub</p>
                    <p className="mt-2 text-sm text-muted-foreground">Lead intelligence platform for growth teams</p>
                    <p className="mt-3 text-xs text-muted-foreground">© {year} LeadHub. All rights reserved.</p>
                </div>
                <nav className="grid grid-cols-2 gap-2 text-sm md:justify-items-end">
                    <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
                </nav>
            </div>
        </footer>
    );
}

