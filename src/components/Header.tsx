const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#indexes", label: "Indexes" },
  { href: "#agents", label: "Agents" },
  { href: "#demo", label: "Demo" },
];

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sui to-sui-cyan text-sm font-bold text-background">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight">PIP</span>
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted sm:inline">
            Sui Hackathon
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#demo"
          className="rounded-full bg-gradient-to-r from-sui to-sui-cyan px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Try Demo
        </a>
      </div>
    </header>
  );
}
