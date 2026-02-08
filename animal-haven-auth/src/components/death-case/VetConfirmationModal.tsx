import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeathCase } from "@/types/deathCase";
import { format } from "date-fns";
import { Stethoscope, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface VetConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deathCase: DeathCase;
  onConfirm: (data: VetConfirmationData) => void;
  onRequestInfo: () => void;
  isSubmitting?: boolean;
}

interface VetConfirmationData {
  confirmedCause: string;
  confirmedCauseDetails: string;
  necropsyRequired: boolean;
  necropsyPerformed: boolean;
  necropsyFindings?: string;
  additionalNotes?: string;
}

const causeOptions = [
  { value: "natural", label: "Natural Causes" },
  { value: "age_related", label: "Age-Related Organ Failure" },
  { value: "cardiac", label: "Cardiac Arrest" },
  { value: "respiratory", label: "Respiratory Failure" },
  { value: "trauma", label: "Traumatic Injury" },
  { value: "infectious", label: "Infectious Disease" },
  { value: "parasitic", label: "Parasitic Infection" },
  { value: "metabolic", label: "Metabolic Disorder" },
  { value: "toxicity", label: "Toxicity/Poisoning" },
  { value: "unknown", label: "Unknown - Requires Investigation" },
];

export function VetConfirmationModal({
  open,
  onOpenChange,
  deathCase,
  onConfirm,
  onRequestInfo,
  isSubmitting = false,
}: VetConfirmationModalProps) {
  const [formData, setFormData] = useState<VetConfirmationData>({
    confirmedCause: "",
    confirmedCauseDetails: "",
    necropsyRequired: false,
    necropsyPerformed: false,
    necropsyFindings: "",
    additionalNotes: "",
  });

  const canSubmit =
    formData.confirmedCause &&
    formData.confirmedCauseDetails &&
    (!formData.necropsyRequired || formData.necropsyPerformed || formData.necropsyFindings);

  const handleSubmit = () => {
    if (canSubmit) {
      onConfirm(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>Veterinary Confirmation</DialogTitle>
              <DialogDescription>
                Confirm the cause of death for {deathCase.snapshot.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Animal Info Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Case #{deathCase.caseNumber}</span>
            <Badge variant="outline">{deathCase.snapshot.species}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Animal:</span>{" "}
              <span className="font-medium">{deathCase.snapshot.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tag:</span>{" "}
              <span className="font-mono">{deathCase.snapshot.tagNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reported Date:</span>{" "}
              <span>
                {deathCase.eventInfo?.dateOfDeath
                  ? format(new Date(deathCase.eventInfo.dateOfDeath), "MMM d, yyyy")
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Reported Cause:</span>{" "}
              <span>{deathCase.eventInfo?.reportedCause || "Not specified"}</span>
            </div>
          </div>
          {deathCase.eventInfo?.reportedCauseDetails && (
            <div className="pt-2 border-t mt-2">
              <span className="text-xs text-muted-foreground">Reported Details:</span>
              <p className="text-sm mt-1">{deathCase.eventInfo.reportedCauseDetails}</p>
            </div>
          )}
        </div>

        {/* Confirmation Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmedCause">Confirmed Cause of Death *</Label>
            <Select
              value={formData.confirmedCause}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, confirmedCause: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cause of death" />
              </SelectTrigger>
              <SelectContent>
                {causeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmedCauseDetails">Clinical Details *</Label>
            <Textarea
              id="confirmedCauseDetails"
              value={formData.confirmedCauseDetails}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmedCauseDetails: e.target.value,
                }))
              }
              placeholder="Provide detailed clinical findings and observations..."
              rows={3}
            />
          </div>

          {/* Necropsy Section */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="necropsyRequired"
                checked={formData.necropsyRequired}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    necropsyRequired: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="necropsyRequired" className="cursor-pointer">
                Necropsy required for this case
              </Label>
            </div>

            {formData.necropsyRequired && (
              <>
                <div className="flex items-center space-x-2 ml-6">
                  <Checkbox
                    id="necropsyPerformed"
                    checked={formData.necropsyPerformed}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        necropsyPerformed: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="necropsyPerformed" className="cursor-pointer">
                    Necropsy has been performed
                  </Label>
                </div>

                {formData.necropsyPerformed && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="necropsyFindings">Necropsy Findings</Label>
                    <Textarea
                      id="necropsyFindings"
                      value={formData.necropsyFindings}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          necropsyFindings: e.target.value,
                        }))
                      }
                      placeholder="Document necropsy findings..."
                      rows={2}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalNotes: e.target.value,
                }))
              }
              placeholder="Any recommendations or observations for farm management..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onRequestInfo}
            disabled={isSubmitting}
            className="sm:mr-auto"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Request More Info
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Confirming..." : "Confirm & Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
