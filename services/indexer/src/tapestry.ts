import { indexerEnv } from "./env";

export async function writeEndorsementToTapestry(params: {
  fromWallet: string;
  toProfileId: string;
  txSignature: string;
}): Promise<string | null> {
  if (!indexerEnv.TAPESTRY_API_KEY) {
    console.warn("[tapestry] No API key configured, skipping write");
    return null;
  }

  try {
    const res = await fetch(`${indexerEnv.TAPESTRY_BASE_URL}/contents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${indexerEnv.TAPESTRY_API_KEY}`,
      },
      body: JSON.stringify({
        namespace: indexerEnv.TAPESTRY_NAMESPACE,
        authorId: params.fromWallet,
        contentType: "endorsement",
        properties: {
          targetProfileId: params.toProfileId,
          txSignature: params.txSignature,
          type: "endorsement",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[tapestry] Write failed ${res.status}: ${text}`);
      return null;
    }

    const data = (await res.json()) as { id: string };
    console.log(`[tapestry] Endorsement event created: ${data.id}`);
    return data.id;
  } catch (err) {
    console.error("[tapestry] Write error:", err);
    return null;
  }
}
