import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight"
        >
          <span className="text-muted-foreground">~/</span>devlog
        </Link>
      </div>
    </header>
  );
}
