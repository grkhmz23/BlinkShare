import { env } from "./env";

interface TapestryProfile {
  id: string;
  namespace: string;
  created_at: string;
  properties: Record<string, string>;
  walletAddress?: string;
}

interface TapestryResponse<T> {
  data: T;
  error?: string;
}

async function tapestryFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.TAPESTRY_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAPESTRY_API_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tapestry API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function getProfile(profileId: string): Promise<TapestryProfile | null> {
  try {
    const profile = await tapestryFetch<TapestryProfile>(
      `/profiles/${profileId}?namespace=${env.TAPESTRY_NAMESPACE}`
    );
    return profile;
  } catch {
    return null;
  }
}

export async function findProfileByWallet(wallet: string): Promise<TapestryProfile | null> {
  try {
    const profiles = await tapestryFetch<TapestryProfile[]>(
      `/profiles?namespace=${env.TAPESTRY_NAMESPACE}&walletAddress=${wallet}`
    );
    return profiles[0] ?? null;
  } catch {
    return null;
  }
}

export async function createProfile(params: {
  id: string;
  walletAddress: string;
  properties?: Record<string, string>;
}): Promise<TapestryProfile> {
  return tapestryFetch<TapestryProfile>("/profiles", {
    method: "POST",
    body: JSON.stringify({
      id: params.id,
      namespace: env.TAPESTRY_NAMESPACE,
      walletAddress: params.walletAddress,
      properties: params.properties ?? {},
    }),
  });
}

export async function writeEndorsementEvent(params: {
  fromProfileId: string;
  toProfileId: string;
  txSignature: string;
}): Promise<string | null> {
  try {
    // Use Tapestry's content/comment system to record the endorsement
    // as a "like" or content interaction tied to the target profile
    const result = await tapestryFetch<{ id: string }>("/contents", {
      method: "POST",
      body: JSON.stringify({
        namespace: env.TAPESTRY_NAMESPACE,
        authorId: params.fromProfileId,
        contentType: "endorsement",
        properties: {
          targetProfileId: params.toProfileId,
          txSignature: params.txSignature,
          type: "endorsement",
        },
      }),
    });
    return result.id;
  } catch (err) {
    console.error("Failed to write endorsement to Tapestry:", err);
    return null;
  }
}

export async function followProfile(
  followerId: string,
  targetId: string
): Promise<boolean> {
  try {
    await tapestryFetch("/follows", {
      method: "POST",
      body: JSON.stringify({
        namespace: env.TAPESTRY_NAMESPACE,
        startId: followerId,
        endId: targetId,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getFollowers(profileId: string): Promise<TapestryProfile[]> {
  try {
    return await tapestryFetch<TapestryProfile[]>(
      `/profiles/${profileId}/followers?namespace=${env.TAPESTRY_NAMESPACE}`
    );
  } catch {
    return [];
  }
}

export async function getFollowing(profileId: string): Promise<TapestryProfile[]> {
  try {
    return await tapestryFetch<TapestryProfile[]>(
      `/profiles/${profileId}/following?namespace=${env.TAPESTRY_NAMESPACE}`
    );
  } catch {
    return [];
  }
}
