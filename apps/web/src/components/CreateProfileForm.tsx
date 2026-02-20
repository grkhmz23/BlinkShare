"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

type ProfileState =
  | { kind: "disconnected" }
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "found"; username: string }
  | { kind: "created"; username: string }
  | { kind: "error"; message: string };

export default function CreateProfileForm() {
  const { publicKey } = useWallet();
  const [state, setState] = useState<ProfileState>({ kind: "disconnected" });
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setState({ kind: "disconnected" });
      return;
    }

    setState({ kind: "loading" });
    const wallet = publicKey.toBase58();

    fetch(`/api/profiles?wallet=${encodeURIComponent(wallet)}`)
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) return null;
        throw new Error("Failed to check profile");
      })
      .then((data) => {
        if (data?.profile) {
          setState({ kind: "found", username: data.profile.username });
        } else {
          setState({ kind: "not_found" });
        }
      })
      .catch((err) => {
        setState({ kind: "error", message: err.message });
      });
  }, [publicKey]);

  if (state.kind === "disconnected") {
    return (
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Connect your wallet to create or link your profile.
        </p>
      </div>
    );
  }

  if (state.kind === "loading") {
    return (
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Checking for existing profile...
        </p>
      </div>
    );
  }

  if (state.kind === "found") {
    return (
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>
          Profile Found
        </p>
        <p className="text-muted mt-2" style={{ fontSize: 14 }}>
          Your wallet is linked to{" "}
          <a href={`/u/${encodeURIComponent(state.username)}`}>
            @{state.username}
          </a>
        </p>
      </div>
    );
  }

  if (state.kind === "created") {
    return (
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>
          Profile Created!
        </p>
        <p className="text-muted mt-2" style={{ fontSize: 14 }}>
          View your profile:{" "}
          <a href={`/u/${encodeURIComponent(state.username)}`}>
            @{state.username}
          </a>
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: "var(--danger)" }}>
          {state.message}
        </p>
      </div>
    );
  }

  // state.kind === "not_found" → show form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          username: username || undefined,
          displayName: displayName || undefined,
          bio: bio || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? "Failed to create profile" });
        return;
      }

      setState({ kind: "created", username: data.profile.username });
    } catch {
      setState({ kind: "error", message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card animate-in" style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Create Your Profile
      </h3>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
        No profile found for this wallet. Fill in the details below.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Username
          </label>
          <input
            type="text"
            placeholder="e.g. alice"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Display Name
          </label>
          <input
            type="text"
            placeholder="e.g. Alice Johnson"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={64}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Bio
          </label>
          <textarea
            placeholder="Tell others about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={256}
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
