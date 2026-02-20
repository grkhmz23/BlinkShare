import { z } from "zod";

export const CreateProfileSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  username: z.string().min(1).max(32).optional(),
  displayName: z.string().max(64).optional(),
  bio: z.string().max(256).optional(),
});
