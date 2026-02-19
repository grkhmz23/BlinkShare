"use client";

import { useState, useEffect } from "react";

export default function GenerateBlinkPage() {
  const [profileId, setProfileId] = useState("");
  const [actionType, setActionType] = useState<"endorse" | "follow" | "tip">("endorse");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Read query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profile = params.get("profile");
    const action = params.get("action");
    if (profile) setProfileId(profile);
    if (action === "endorse" || action === "follow" || action === "tip") {
      setActionType(action);
    }
    if (profile) setGenerated(true);
  }, []);

  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

  const actionUrl = `${appUrl}/api/actions/endorse?profile=${encodeURIComponent(profileId)}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
  const profileUrl = `${appUrl}/u/${encodeURIComponent(profileId)}`;

  // Generate QR code
  useEffect(() => {
    if (!generated || !profileId) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(blinkUrl, {
        width: 256,
        margin: 2,
        color: { dark: "#e4e4f0", light: "#12121a" },
      }).then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => { cancelled = true; };
  }, [generated, profileId, blinkUrl]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1
          className="mono animate-in"
          style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}
        >
          Generate a Blink
        </h1>
        <p className="text-muted animate-in" style={{ fontSize: 14, marginBottom: 32 }}>
          Create a shareable Solana Action link that anyone can use to endorse a profile.
        </p>

        <div className="card animate-in">
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
            Profile ID or Username
          </label>
          <input
            type="text"
            placeholder="e.g. alice or wallet address"
            value={profileId}
            onChange={(e) => {
              setProfileId(e.target.value);
              setGenerated(false);
            }}
          />

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              marginTop: 20,
              display: "block",
            }}
          >
            Action Type
          </label>
          <div className="flex gap-2">
            {(["endorse", "follow", "tip"] as const).map((type) => (
              <button
                key={type}
                className={`btn ${actionType === type ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: 13, padding: "8px 16px", textTransform: "capitalize" }}
                onClick={() => {
                  setActionType(type);
                  setGenerated(false);
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {actionType !== "endorse" && (
            <p
              className="text-muted mt-4"
              style={{ fontSize: 12, fontStyle: "italic" }}
            >
              {actionType === "follow" ? "Follow" : "Tip"} blinks are coming soon. For now, the endorse action is fully functional.
            </p>
          )}

          <button
            className="btn btn-primary mt-6"
            style={{ width: "100%" }}
            onClick={() => {
              if (profileId.trim()) setGenerated(true);
            }}
            disabled={!profileId.trim()}
          >
            Generate Blink
          </button>
        </div>

        {generated && profileId.trim() && (
          <div className="card animate-in mt-6">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Your Blink is ready
            </h3>

            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>
              Action URL (for Blink clients)
            </label>
            <div
              className="copy-box"
              onClick={() => handleCopy(actionUrl)}
              title="Click to copy"
            >
              {actionUrl}
            </div>

            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 6,
                marginTop: 16,
                display: "block",
              }}
            >
              Blink Inspector / Share URL
            </label>
            <div
              className="copy-box"
              onClick={() => handleCopy(blinkUrl)}
              title="Click to copy"
            >
              {blinkUrl}
            </div>

            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 6,
                marginTop: 16,
                display: "block",
              }}
            >
              Profile Page
            </label>
            <div
              className="copy-box"
              onClick={() => handleCopy(profileUrl)}
              title="Click to copy"
            >
              {profileUrl}
            </div>

            {copied && (
              <p style={{ color: "var(--success)", fontSize: 12, marginTop: 8 }}>
                Copied to clipboard!
              </p>
            )}

            {qrDataUrl && (
              <div className="text-center mt-6">
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: 12,
                  }}
                >
                  QR Code
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Blink QR Code"
                  width={200}
                  height={200}
                  style={{ borderRadius: 8, margin: "0 auto", display: "block" }}
                />
              </div>
            )}

            <div className="flex gap-2 mt-6 flex-wrap">
              <a
                href={blinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                Open in Blinks Inspector
              </a>
              <a
                href={profileUrl}
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                View Profile
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
