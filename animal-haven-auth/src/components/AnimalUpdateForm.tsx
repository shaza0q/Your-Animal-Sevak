import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { parseApiError } from "@/lib/errorUtils";
import { useMasterData } from "@/hooks/useMasterData";
import {
  createAnimalUpdate,
  searchAnimalByTag,
  CreateAnimalUpdateBody,
} from "@/api/animalUpdate";
import { animalDetailKey } from "@/hooks/useAnimalDetail";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z
  .object({
    updateType: z.enum(["Health", "Weight", "Vaccination", "Breeding"], {
      required_error: "Update type is required",
    }),
    date: z.date({ required_error: "Date is required" }),
    riskLevel: z.enum(["Low", "Moderate", "High"]).optional(),
    notes: z.string().optional(),

    // Health
    status: z
      .enum(["Healthy", "Injured", "Diseased", "Pregnant", "Dead"])
      .optional(),
    diseaseName: z.string().optional(),

    // Weight
    weight: z.coerce.number().positive("Weight must be greater than 0").optional(),

    // Vaccination
    vaccineName: z.string().optional(),
    nextVaccineDate: z.date().optional().nullable(),

    // Breeding
    partnerTag: z.string().optional(),
    expectedDeliveryDate: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.updateType === "Health" && !data.status) {
      ctx.addIssue({
        code: "custom",
        message: "Health status is required",
        path: ["status"],
      });
    }
    if (data.updateType === "Weight" && !data.weight) {
      ctx.addIssue({
        code: "custom",
        message: "Weight is required",
        path: ["weight"],
      });
    }
    if (data.updateType === "Vaccination" && !data.vaccineName) {
      ctx.addIssue({
        code: "custom",
        message: "Vaccine is required",
        path: ["vaccineName"],
      });
    }
    if (
      data.nextVaccineDate &&
      data.date &&
      data.nextVaccineDate <= data.date
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Next due date must be after the event date",
        path: ["nextVaccineDate"],
      });
    }
    if (
      data.expectedDeliveryDate &&
      data.date &&
      data.expectedDeliveryDate <= data.date
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Expected delivery date must be after the breeding date",
        path: ["expectedDeliveryDate"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnimalUpdateFormProps {
  animalId: string;
  farmId: string;
  onSuccess?: () => void;
}

// ─── Inline error ─────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  ) : null;

// ─── DatePicker ───────────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  value: Date | null | undefined;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  disabled?: (d: Date) => boolean;
  error?: string;
}

const DatePickerField = ({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  error,
}: DatePickerFieldProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground",
          error && "border-destructive",
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PPP") : placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value ?? undefined}
        onSelect={(d) => onChange(d ?? null)}
        disabled={disabled}
        initialFocus
      />
    </PopoverContent>
  </Popover>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function AnimalUpdateForm({
  animalId,
  farmId,
  onSuccess,
}: AnimalUpdateFormProps) {
  const queryClient = useQueryClient();
  const { vaccines, diseases } = useMasterData();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(),
      updateType: undefined,
    },
  });

  const updateType = watch("updateType");
  const status = watch("status");

  // Clear conditional fields when update type changes
  useEffect(() => {
    if (!updateType) return;
    setValue("status", undefined);
    setValue("diseaseName", undefined);
    setValue("weight", undefined);
    setValue("vaccineName", undefined);
    setValue("nextVaccineDate", null);
    setValue("partnerTag", undefined);
    setValue("expectedDeliveryDate", null);
    setValue("riskLevel", undefined);
    setValue("notes", undefined);
  }, [updateType, setValue]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Resolve partner tag to animal ID for Breeding
      let maleAnimalId: string | undefined;
      if (values.updateType === "Breeding" && values.partnerTag?.trim()) {
        const partner = await searchAnimalByTag(values.partnerTag, farmId);
        maleAnimalId = partner?.id;
      }

      const body: CreateAnimalUpdateBody = {
        animalId,
        updateType: values.updateType,
        date: values.date.toISOString(),
        riskLevel: values.riskLevel,
        notes: values.notes || undefined,
      };

      switch (values.updateType) {
        case "Health":
          body.status = values.status;
          if (values.status === "Diseased" && values.diseaseName) {
            body.diseaseName = values.diseaseName;
          }
          break;

        case "Weight":
          body.weight = values.weight;
          break;

        case "Vaccination":
          body.vaccineName = values.vaccineName;
          if (values.diseaseName) body.diseaseName = values.diseaseName;
          if (values.nextVaccineDate) {
            body.nextVaccineDate = values.nextVaccineDate.toISOString();
          }
          break;

        case "Breeding":
          if (maleAnimalId) body.maleAnimalId = maleAnimalId;
          if (values.expectedDeliveryDate) {
            body.expectedDeliveryDate = values.expectedDeliveryDate.toISOString();
          }
          break;
      }

      return createAnimalUpdate(body);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalDetailKey(farmId, animalId) });
      queryClient.invalidateQueries({ queryKey: ["animal-history", animalId] });
      toast.success("Update logged successfully");
      reset({ date: new Date(), updateType: undefined });
      onSuccess?.();
    },

    onError: (err: unknown) => {
      const { errors: fieldErrors, message } = parseApiError(err);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          setError(field as keyof FormValues, { message: msgs[0] });
        });
      } else {
        toast.error("Failed to log update", { description: message });
      }
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Update type */}
      <div className="space-y-1.5">
        <Label>
          Update Type <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="updateType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(errors.updateType && "border-destructive")}
              >
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health">Health Update</SelectItem>
                <SelectItem value="Weight">Weight Update</SelectItem>
                <SelectItem value="Vaccination">Vaccination</SelectItem>
                <SelectItem value="Breeding">Breeding</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.updateType?.message} />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label>
          Date <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePickerField
              value={field.value}
              onChange={field.onChange}
              placeholder="Select date"
              error={errors.date?.message}
            />
          )}
        />
        <FieldError message={errors.date?.message} />
      </div>

      {/* ── Health fields ── */}
      {updateType === "Health" && (
        <div className="space-y-4 rounded-lg border border-border/40 p-4 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Health Details
          </p>

          <div className="space-y-1.5">
            <Label>
              Status <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(errors.status && "border-destructive")}
                  >
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Injured">Injured</SelectItem>
                    <SelectItem value="Diseased">Diseased</SelectItem>
                    <SelectItem value="Pregnant">Pregnant</SelectItem>
                    <SelectItem value="Dead">Dead</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.status?.message} />
          </div>

          {/* Disease — shown when status is Diseased */}
          {status === "Diseased" && (
            <div className="space-y-1.5">
              <Label>Disease (optional)</Label>
              <Controller
                name="diseaseName"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disease…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {diseases.map((d) => (
                        <SelectItem key={d.id} value={d.diseaseName}>
                          {d.diseaseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Risk Level</Label>
            <Controller
              name="riskLevel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              {...register("notes")}
              placeholder="Describe the condition…"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* ── Weight fields ── */}
      {updateType === "Weight" && (
        <div className="space-y-4 rounded-lg border border-border/40 p-4 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Weight Details
          </p>

          <div className="space-y-1.5">
            <Label>
              Weight (kg) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 45.5"
              {...register("weight")}
              className={cn(errors.weight && "border-destructive")}
            />
            <FieldError message={errors.weight?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              placeholder="Add measurement notes…"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* ── Vaccination fields ── */}
      {updateType === "Vaccination" && (
        <div className="space-y-4 rounded-lg border border-border/40 p-4 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Vaccination Details
          </p>

          <div className="space-y-1.5">
            <Label>
              Vaccine <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="vaccineName"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(errors.vaccineName && "border-destructive")}
                  >
                    <SelectValue placeholder="Select vaccine…" />
                  </SelectTrigger>
                  <SelectContent>
                    {vaccines.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        No vaccines in master data
                      </SelectItem>
                    ) : (
                      vaccines.map((v) => (
                        <SelectItem key={v.id} value={v.vaccineName}>
                          {v.vaccineName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.vaccineName?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Disease (optional)</Label>
            <Controller
              name="diseaseName"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select disease…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {diseases.map((d) => (
                      <SelectItem key={d.id} value={d.diseaseName}>
                        {d.diseaseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Next Due Date (optional)</Label>
            <Controller
              name="nextVaccineDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select next due date"
                  disabled={(d) => d < new Date()}
                  error={errors.nextVaccineDate?.message}
                />
              )}
            />
            <FieldError message={errors.nextVaccineDate?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              placeholder="Vaccination notes…"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* ── Breeding fields ── */}
      {updateType === "Breeding" && (
        <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            Breeding Details · Status auto-set to Pregnant
          </p>

          <div className="space-y-1.5">
            <Label>Partner Tag Number (optional)</Label>
            <Input
              placeholder="e.g. COW-001"
              {...register("partnerTag")}
            />
            <p className="text-xs text-muted-foreground">
              Enter the tag number of the male animal (if known)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Expected Delivery Date (optional)</Label>
            <Controller
              name="expectedDeliveryDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select expected delivery"
                  disabled={(d) => d < new Date()}
                  error={errors.expectedDeliveryDate?.message}
                />
              )}
            />
            <FieldError message={errors.expectedDeliveryDate?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              placeholder="Breeding notes…"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset({ date: new Date(), updateType: undefined });
            onSuccess?.();
          }}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || !updateType}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Log Update
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
