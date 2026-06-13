import { z } from 'zod';

export const verifyCertificateSchema = z.object({
  credentialId: z.string().min(1, 'Credential ID is required'),
});

export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
