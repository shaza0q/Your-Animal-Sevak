import { z } from 'zod';
import { UpdateType, HealthStatus, RiskLevel } from '../common/enums';

// ─── Add animal ───────────────────────────────────────────────────────────────
// animalType/gender are plain strings because the controller normalises casing
// and handles the 'other' type alias; strict enum validation would reject them.
export const AddAnimalSchema = z
  .object({
    farmId: z.string().min(1, 'farmId is required'),
    tagNumber: z.string().min(1, 'tagNumber is required'),
    name: z.string().min(1, 'name is required'),
    animalType: z.string().min(1, 'animalType is required'),
    otherAnimalType: z.string().optional(),
    breed: z.string().optional(),
    gender: z.string().min(1, 'gender is required'),
    weight: z.coerce.number().positive('weight must be positive').optional().nullable(),
    dateOfBirth: z.string().optional(),
    acquisitionDate: z.string().optional(),
    motherId: z.string().optional(),
    fatherId: z.string().optional(),
  })
  .refine(
    (data) => data.animalType !== 'other' || !!data.otherAnimalType?.trim(),
    {
      message: 'otherAnimalType is required when animalType is "other"',
      path: ['otherAnimalType'],
    },
  );

// ─── Record animal event (health / weight / vaccination / breeding / sale) ───
export const RecordAnimalEventSchema = z
  .object({
    animalId: z.string().min(1, 'animalId is required'),
    updateType: z.nativeEnum(UpdateType, { message: 'Invalid updateType' }),
    date: z.string().optional(),

    // Health
    status: z.nativeEnum(HealthStatus, { message: 'Invalid status' }).optional(),
    riskLevel: z.nativeEnum(RiskLevel, { message: 'Invalid riskLevel' }).optional(),
    notes: z.string().optional(),

    // Weight
    weight: z.coerce.number().optional(),

    // Vaccination
    vaccineName: z.string().optional(),
    diseaseName: z.string().optional(),
    nextVaccineDate: z.string().optional(),

    // Breeding
    maleAnimalId: z.string().optional(),
    expectedDeliveryDate: z.string().optional(),

    // Sale
    price: z.coerce.number().optional(),
    buyerName: z.string().optional(),
    buyerEmail: z.string().email('Invalid buyer email').optional().or(z.literal('')),
    buyerContact: z.string().optional(),
    buyerAddress: z.string().optional(),
  })
  .refine(
    (data) => data.updateType !== UpdateType.Health || !!data.status,
    {
      message: 'status is required for Health updates',
      path: ['status'],
    },
  );

// ─── Animal assignment ────────────────────────────────────────────────────────
export const AssignAnimalUserSchema = z.object({
  workerId: z.string().min(1, 'workerId is required'),
  role: z.enum(['caretaker', 'veterinarian', 'staff', 'owner'], {
    message: 'role must be caretaker, veterinarian, staff, or owner',
  }),
});

export const UnassignAnimalUserSchema = z.object({
  role: z.string().min(1, 'role is required'),
});

// ─── Sell animal ─────────────────────────────────────────────────────────────
export const SellAnimalSchema = z.object({
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerContact: z.string().optional().default(''),
  salePrice: z.coerce.number().positive('Sale price must be a positive number'),
  dateSold: z.string().optional(),
  notes: z.string().optional(),
  buyerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  buyerAddress: z.string().optional(),
});

export type AddAnimalBody = z.infer<typeof AddAnimalSchema>;
export type RecordAnimalEventBody = z.infer<typeof RecordAnimalEventSchema>;
export type AssignAnimalUserBody = z.infer<typeof AssignAnimalUserSchema>;
export type UnassignAnimalUserBody = z.infer<typeof UnassignAnimalUserSchema>;
export type SellAnimalBody = z.infer<typeof SellAnimalSchema>;
