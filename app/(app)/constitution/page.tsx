const VALUES: [string, string][] = [
  ["Shipping", "Perfecting"],
  ["Speed", "Elegance"],
  ["Users", "Your assumptions"],
  ["Revenue", "Vanity metrics"],
  ["Distribution", "Building in private"],
  ["Feedback", "Planning"],
  ["Experiments", "Certainty"],
  ["Small scope", "Feature breadth"],
  ["Iteration", "Big launches"],
  ["Simplicity", "Complexity"],
  ["Reuse", "Reinventing"],
  ["Learning from failure", "Avoiding failure"],
  ["Killing losers", "Sunk costs"],
  ["Doubling down on winners", "Equal attention to everything"],
  ["Customer pain", "Cool technology"],
  ["Market demand", "Personal excitement"],
  ["Evidence", "Opinions"],
  ["Opportunity cost", "Busyness"],
  ["Sustainable pace", "Heroic bursts"],
  ["Long-term consistency", "Short-term intensity"],
];

const TRADEOFFS: [string, string][] = [
  ["Trade code quality for speed", "but never for broken core functionality."],
  ["Trade features for learning", "build the minimum necessary to test the hypothesis."],
  ["Trade building for distribution", "especially when the product already exists and nobody knows about it."],
  ["Trade certainty for experimentation", "you don't need to know the idea will work."],
  ["Trade perfection for feedback", "real users are better than your imagination."],
  ["Trade your preferences for customer behaviour", "let reality win arguments."],
  ["Trade losing projects for winners", "kill quickly, concentrate time on traction."],
  ["Trade novelty for pain", "solve boring problems people actually care about."],
  ["Trade project optimisation for portfolio optimisation", "one project doesn't need to succeed. The portfolio does."],
];

const HABITS = [
  ["Be proactive", "You choose your response. Focus on your circle of influence."],
  ["Begin with the end in mind", "Your mission statement and north star."],
  ["Put first things first", "Big rocks in Quadrant II, scheduled before the week fills up."],
  ["Think win-win", "Build things where the customer wins first."],
  ["Seek first to understand", "Customer pain over your assumptions."],
  ["Synergize", "Reuse, collaborate, and distribute through others."],
  ["Sharpen the saw", "Physical, mental, social and spiritual renewal, at a sustainable pace."],
];

export default function ConstitutionPage() {
  return (
    <>
      <h1>Constitution</h1>
      <p className="muted">The principles behind the planner. Open one section at a time.</p>

      <details className="card" open>
        <summary><h2>The loop</h2></summary>
        <p><b>Ship → Distribute → Measure → Learn → Kill or Double Down.</b></p>
        <p className="muted">
          The biggest threat isn&apos;t laziness. It&apos;s mistaking activity for progress.
        </p>
      </details>

      <details className="card">
        <summary><h2>Evidence beats randomness</h2></summary>
        <p>
          The weighted selector sets your <b>default allocation</b>. It protects you from neglecting parts of your
          life and keeps variety in your week.
        </p>
        <p>
          But don&apos;t let the randomizer become your boss. When an experiment shows real traction, another day on
          it can be worth far more than another random project. Strong evidence is allowed to override the selector.
        </p>
        <p className="muted small">
          Otherwise the 200-project challenge turns into a treadmill: very good at starting things, never
          capitalising on any of them.
        </p>
      </details>

      <details className="card">
        <summary><h2>The most important tradeoffs</h2></summary>
        <ul className="list">
          {TRADEOFFS.map(([a, b]) => (
            <li key={a} style={{ display: "block" }}>
              <b>{a}</b> <span className="muted">· {b}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="card">
        <summary><h2>Value more / value less</h2></summary>
        <table className="values">
          <thead>
            <tr><th>Value more</th><th>Value less</th></tr>
          </thead>
          <tbody>
            {VALUES.map(([a, b]) => (
              <tr key={a}><td>{a}</td><td className="muted">{b}</td></tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="card">
        <summary><h2>The 7 Habits, applied</h2></summary>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {HABITS.map(([h, d]) => (
            <li key={h} style={{ marginBottom: 6 }}>
              <b>{h}.</b> <span className="muted">{d}</span>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
