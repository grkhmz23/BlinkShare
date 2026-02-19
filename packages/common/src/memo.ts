import { z } from "zod";

export const MEMO_PREFIX = "blinkshare:v1:";

export const MemoPayloadSchema = z.object({
  action: z.enum(["endorse", "follow", "tip"]),
  profileId: z.string().min(1),
  nonce: z.string().min(1),
  ts: z.number().int().positive(),
});

export type MemoPayload = z.infer<typeof MemoPayloadSchema>;

export function encodeMemo(payload: MemoPayload): string {
  const validated = MemoPayloadSchema.parse(payload);
  return MEMO_PREFIX + JSON.stringify(validated);
}

export function decodeMemo(raw: string): MemoPayload | null {
  if (!raw.startsWith(MEMO_PREFIX)) {
    return null;
  }
  try {
    const json = raw.slice(MEMO_PREFIX.length);
    const parsed = JSON.parse(json);
    return MemoPayloadSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function generateNonce(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
