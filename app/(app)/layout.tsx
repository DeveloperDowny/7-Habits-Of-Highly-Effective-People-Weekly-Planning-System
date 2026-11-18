import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <span className="brand">Weekly Compass</span>
          <Nav />
        </div>
      </header>
      <main className="wrap">
        <div className="loop">
          <b>Ship</b> → <b>Distribute</b> → <b>Measure</b> → <b>Learn</b> → <b>Kill or Double Down</b>
          <span className="muted"> · Activity isn&apos;t progress.</span>
        </div>
        {children}
      </main>
    </>
  );
}
