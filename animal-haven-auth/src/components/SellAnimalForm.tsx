import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { parseApiError } from "@/lib/errorUtils";
import { useSellAnimal } from "@/hooks/useSellAnimal";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  buyerName: z.string().min(1, "Buyer name is required"),
  buyerContact: z.string().optional(),
  salePrice: z.coerce
    .number({ invalid_type_error: "Sale price must be a number" })
    .positive("Sale price must be greater than 0"),
  dateSold: z
    .date()
    .max(new Date(), "Date of sale cannot be in the future")
    .optional(),
  notes: z.string().optional(),
  buyerEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  buyerAddress: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SellAnimalFormProps {
  animalId: string;
  farmId: string;
  animalName: string;
  animalStatus: string;
  onSuccess?: () => void;
}

// ─── Inline error helper ──────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────

export function SellAnimalForm({
  animalId,
  farmId,
  animalName,
  animalStatus,
  onSuccess,
}: SellAnimalFormProps) {
  const mutation = useSellAnimal(farmId, animalId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dateSold: new Date() },
  });

  // Guard: show status message for non-Active animals instead of the form
  if (animalStatus !== "Active") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground max-w-xs">
          <span className="font-semibold">{animalName}</span> is already marked
          as <span className="font-semibold">{animalStatus}</span> and cannot be
          recorded as a new sale.
        </p>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        buyerName: values.buyerName,
        buyerContact: values.buyerContact || undefined,
        salePrice: values.salePrice,
        dateSold: values.dateSold?.toISOString(),
        notes: values.notes || undefined,
        buyerEmail: values.buyerEmail || undefined,
        buyerAddress: values.buyerAddress || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Sale recorded. Animal marked as Sold.");
          reset();
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const { errors: fieldErrors, message } = parseApiError(err);
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([field, msgs]) => {
              setError(field as keyof FormValues, { message: msgs[0] });
            });
          } else {
            toast.error("Failed to record sale", { description: message });
          }
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Buyer name + contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="buyerName">
            Buyer Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="buyerName"
            placeholder="Full name"
            {...register("buyerName")}
            className={cn(errors.buyerName && "border-destructive")}
          />
          <FieldError message={errors.buyerName?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buyerContact">Contact</Label>
          <Input
            id="buyerContact"
            placeholder="Phone number or email"
            {...register("buyerContact")}
          />
        </div>
      </div>

      {/* Price + date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="salePrice">
            Sale Price <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("salePrice")}
              className={cn("pl-8", errors.salePrice && "border-destructive")}
            />
          </div>
          <FieldError message={errors.salePrice?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Date of Sale</Label>
          <Controller
            name="dateSold"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                      errors.dateSold && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError message={errors.dateSold?.message} />
        </div>
      </div>

      {/* Optional: email + address */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="buyerEmail">Buyer Email (optional)</Label>
          <Input
            id="buyerEmail"
            type="email"
            placeholder="buyer@example.com"
            {...register("buyerEmail")}
            className={cn(errors.buyerEmail && "border-destructive")}
          />
          <FieldError message={errors.buyerEmail?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buyerAddress">Buyer Address (optional)</Label>
          <Input
            id="buyerAddress"
            placeholder="Street, city…"
            {...register("buyerAddress")}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional details about this sale…"
          rows={2}
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            onSuccess?.();
          }}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording…
            </>
          ) : (
            "Record Sale"
          )}
        </Button>
      </div>
    </form>
  );
}
