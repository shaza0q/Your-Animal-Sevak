import { z } from 'zod';

// ─── Create / add a farm ─────────────────────────────────────────────────────
export const AddFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive('capacity must be a positive integer').optional(),
  animalTypes: z.array(z.string()).optional().default([]),
});

// ─── Assign a user to a farm ─────────────────────────────────────────────────
// role is validated as a plain string because assignFarmUser resolves the
// definitive role from the target user's profile rather than the request body.
export const AssignFarmUserSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  role: z.string().min(1, 'role is required'),
});

export type AddFarmBody = z.infer<typeof AddFarmSchema>;
export type AssignFarmUserBody = z.infer<typeof AssignFarmUserSchema>;
