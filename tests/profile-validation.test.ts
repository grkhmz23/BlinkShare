import { describe, it, expect } from "vitest";
import { CreateProfileSchema } from "@/lib/schemas";

describe("CreateProfileSchema", () => {
  const validPayload = {
    walletAddress: "ABcDeFgHiJkLmNoPqRsTuVwXyZ123456789012",
    username: "alice",
    displayName: "Alice Johnson",
    bio: "Solana enthusiast",
  };

  it("accepts a fully valid payload", () => {
    const result = CreateProfileSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts payload with only walletAddress", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: validPayload.walletAddress,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a 32-character walletAddress (minimum)", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: "A".repeat(32),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a 44-character walletAddress (maximum)", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: "A".repeat(44),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a walletAddress shorter than 32 characters", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: "A".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a walletAddress longer than 44 characters", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: "A".repeat(45),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing walletAddress", () => {
    const result = CreateProfileSchema.safeParse({
      username: "alice",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty username", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: validPayload.walletAddress,
      username: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username longer than 32 characters", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: validPayload.walletAddress,
      username: "a".repeat(33),
    });
    expect(result.success).toBe(false);
  });

  it("rejects displayName longer than 64 characters", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: validPayload.walletAddress,
      displayName: "a".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio longer than 256 characters", () => {
    const result = CreateProfileSchema.safeParse({
      walletAddress: validPayload.walletAddress,
      bio: "a".repeat(257),
    });
    expect(result.success).toBe(false);
  });
});
