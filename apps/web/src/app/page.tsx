export default function HomePage() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div className="hero-glow" />

      <section
        className="container text-center"
        style={{ paddingTop: 100, paddingBottom: 80 }}
      >
        <h1
          className="mono animate-in"
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}
        >
          Onchain reputation,
          <br />
          <span style={{ color: "var(--accent)" }}>shared via Blinks</span>
        </h1>

        <p
          className="text-muted animate-in mt-6"
          style={{
            fontSize: 18,
            maxWidth: 560,
            margin: "24px auto 0",
            lineHeight: 1.6,
          }}
        >
          Endorse anyone on Solana. No new app needed &mdash; just click a Blink
          on X or Discord, sign with your wallet, and boost their karma in the
          Tapestry social graph.
        </p>

        <div
          className="flex gap-4 justify-center mt-8 animate-in"
          style={{ animationDelay: "0.1s" }}
        >
          <a href="/generate" className="btn btn-primary">
            Generate an Endorse Blink
          </a>
          <a href="#how-it-works" className="btn btn-secondary">
            How it works
          </a>
        </div>
      </section>

      <section
        id="how-it-works"
        className="container"
        style={{ paddingBottom: 80 }}
      >
        <h2
          className="mono text-center mb-4"
          style={{ fontSize: 28, fontWeight: 700 }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
            marginTop: 32,
          }}
        >
          {[
            {
              step: "01",
              title: "Create your profile",
              desc: "Link your wallet to a Tapestry profile. Your on-chain identity is your reputation.",
            },
            {
              step: "02",
              title: "Generate a Blink",
              desc: "Choose Endorse, Follow, or Tip. Get a shareable URL that works anywhere Blinks unfurl.",
            },
            {
              step: "03",
              title: "Share on X / Discord",
              desc: "Paste the link. Others see action buttons right in their feed — no app install needed.",
            },
            {
              step: "04",
              title: "Karma accrues",
              desc: "Our indexer verifies each signed tx, records it in Tapestry, and increments your karma score.",
            },
          ].map((item) => (
            <div key={item.step} className="card animate-in">
              <span
                className="mono"
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                {item.step}
              </span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </h3>
              <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="container"
        style={{ paddingBottom: 80 }}
      >
        <div className="card text-center" style={{ padding: 48 }}>
          <h2 className="mono" style={{ fontSize: 24, fontWeight: 700 }}>
            Built on
          </h2>
          <div
            className="flex gap-4 justify-center mt-6 flex-wrap"
            style={{ fontSize: 14 }}
          >
            <span className="badge badge-karma">Solana Actions / Blinks</span>
            <span className="badge badge-karma">Tapestry Social Graph</span>
            <span className="badge badge-karma">OrbitFlare Jetstream</span>
            <span className="badge badge-karma">Memo Program</span>
          </div>
        </div>
      </section>
    </div>
  );
}
