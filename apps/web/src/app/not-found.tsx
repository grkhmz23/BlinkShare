export default function NotFound() {
  return (
    <div
      className="container text-center"
      style={{ paddingTop: 100, paddingBottom: 80 }}
    >
      <h1 className="mono" style={{ fontSize: 48, fontWeight: 700 }}>
        404
      </h1>
      <p className="text-muted mt-4" style={{ fontSize: 16 }}>
        Profile not found. It may not exist yet.
      </p>
      <a href="/" className="btn btn-primary mt-6">
        Go Home
      </a>
    </div>
  );
}
