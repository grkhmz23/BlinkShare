import { describe, it, expect } from "vitest";
import {
  encodeMemo,
  decodeMemo,
  generateNonce,
  MEMO_PREFIX,
  MemoPayloadSchema,
} from "@blinkshare/common";

describe("memo encode/decode", () => {
  const validPayload = {
    action: "endorse" as const,
    profileId: "alice",
    nonce: "abc123def456",
    ts: 1700000000,
  };

  it("encodes a memo with the correct prefix", () => {
    const encoded = encodeMemo(validPayload);
    expect(encoded.startsWith(MEMO_PREFIX)).toBe(true);
  });

  it("encodes and decodes a valid payload roundtrip", () => {
    const encoded = encodeMemo(validPayload);
    const decoded = decodeMemo(encoded);
    expect(decoded).toEqual(validPayload);
  });

  it("returns null for missing prefix", () => {
    const result = decodeMemo('{"action":"endorse"}');
    expect(result).toBeNull();
  });

  it("returns null for invalid JSON after prefix", () => {
    const result = decodeMemo(MEMO_PREFIX + "not-json");
    expect(result).toBeNull();
  });

  it("returns null for valid JSON but invalid schema", () => {
    const result = decodeMemo(
      MEMO_PREFIX + JSON.stringify({ action: "invalid", profileId: "x" })
    );
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeMemo("")).toBeNull();
  });

  it("validates all action types", () => {
    for (const action of ["endorse", "follow", "tip"] as const) {
      const payload = { ...validPayload, action };
      const encoded = encodeMemo(payload);
      const decoded = decodeMemo(encoded);
      expect(decoded?.action).toBe(action);
    }
  });

  it("rejects payload with missing fields", () => {
    expect(() =>
      MemoPayloadSchema.parse({ action: "endorse" })
    ).toThrow();
  });
});

describe("generateNonce", () => {
  it("returns a 16-character hex string", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[0-9a-f]{16}$/);
  });

  it("generates unique nonces", () => {
    const nonces = new Set(Array.from({ length: 100 }, () => generateNonce()));
    expect(nonces.size).toBe(100);
  });
});
