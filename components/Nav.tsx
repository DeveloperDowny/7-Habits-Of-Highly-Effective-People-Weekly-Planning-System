"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/week", label: "This week" },
  { href: "/compass", label: "Compass" },
  { href: "/experiments", label: "Experiments" },
  { href: "/constitution", label: "Constitution" },
];

export default function Nav() {
  const path = usePathname();
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <nav className="nav">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <button className="linkbtn" onClick={logout}>Log out</button>
    </nav>
  );
}
