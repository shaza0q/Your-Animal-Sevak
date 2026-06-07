import { z } from 'zod';
import { CauseOfDeath, PlaceOfDeath, DisposalMethod } from '../common/enums';

// ─── Update death-event section ───────────────────────────────────────────────
export const UpdateDeathEventSchema = z.object({
  dateOfDeath: z.string().min(1, 'dateOfDeath is required'),
  causeOfDeath: z.nativeEnum(CauseOfDeath, { message: 'Invalid causeOfDeath' }),
  placeOfDeath: z.nativeEnum(PlaceOfDeath, { message: 'Invalid placeOfDeath' }),
  causeDetails: z.string().optional(),
  timeOfDeath: z.string().optional(),
  locationAtDeath: z.string().optional(),
});

// ─── Request / skip vet review ────────────────────────────────────────────────
export const VetRequestSchema = z.object({
  requiresVet: z.boolean().default(true),
});

// ─── Vet confirmation ────────────────────────────────────────────────────────
export const VetConfirmationSchema = z.object({
  causeOfDeath: z.nativeEnum(CauseOfDeath, { message: 'Invalid causeOfDeath' }).optional(),
  causeDetails: z.string().optional(),
  necropsyPerformed: z.boolean().optional(),
  necropsyFindings: z.string().optional(),
  necropsyReportLink: z.string().url('necropsyReportLink must be a valid URL').optional().or(z.literal('')),
  labSamplesTaken: z.array(z.string()).optional(),
});

// ─── Record disposal ─────────────────────────────────────────────────────────
export const RecordDisposalSchema = z.object({
  disposalMethod: z.nativeEnum(DisposalMethod, { message: 'Invalid disposalMethod' }),
  disposalDate: z.string().min(1, 'disposalDate is required'),
  disposalLocation: z.string().optional(),
  disposalCompany: z.string().optional(),
  disposalCost: z.coerce.number().optional(),
  disposalCertificateId: z.string().optional(),
});

// ─── Manager review ───────────────────────────────────────────────────────────
const CorrectionRequestSchema = z.object({
  field: z.string().min(1),
  expectedValue: z.unknown(),
  reason: z.string().min(1),
});

export const ManagerReviewSchema = z
  .object({
    decision: z.enum(['approved', 'correction_needed'], {
      message: 'decision must be "approved" or "correction_needed"',
    }),
    comments: z.string().optional(),
    correctionRequests: z.array(CorrectionRequestSchema).optional(),
  })
  .refine(
    (data) =>
      data.decision !== 'correction_needed' ||
      (data.correctionRequests && data.correctionRequests.length > 0),
    {
      message: 'correctionRequests are required when decision is correction_needed',
      path: ['correctionRequests'],
    },
  );

// ─── Update compliance checklist ─────────────────────────────────────────────
export const UpdateComplianceSchema = z.object({
  label: z.string().min(1, 'label is required'),
  required: z.boolean().optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

export type UpdateDeathEventBody = z.infer<typeof UpdateDeathEventSchema>;
export type VetRequestBody = z.infer<typeof VetRequestSchema>;
export type VetConfirmationBody = z.infer<typeof VetConfirmationSchema>;
export type RecordDisposalBody = z.infer<typeof RecordDisposalSchema>;
export type ManagerReviewBody = z.infer<typeof ManagerReviewSchema>;
export type UpdateComplianceBody = z.infer<typeof UpdateComplianceSchema>;
