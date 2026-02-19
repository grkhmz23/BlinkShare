export interface BlinkShareProfile {
  id: string;
  walletAddress: string;
  tapestryId: string | null;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  karma: number;
}

export interface EndorsementRecord {
  id: string;
  txSignature: string;
  fromWallet: string;
  toProfileId: string;
  nonce: string;
  memo: string;
  lamports: number;
  status: "pending" | "verified" | "failed";
  tapestryEventId: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

export interface ActionGetResponse {
  title: string;
  icon: string;
  description: string;
  label: string;
  links?: {
    actions: ActionLink[];
  };
}

export interface ActionLink {
  label: string;
  href: string;
  parameters?: ActionParameter[];
}

export interface ActionParameter {
  name: string;
  label: string;
  required?: boolean;
}

export interface ActionPostRequest {
  account: string;
}

export interface ActionPostResponse {
  transaction: string;
  message?: string;
}

export interface ActionErrorResponse {
  message: string;
}
