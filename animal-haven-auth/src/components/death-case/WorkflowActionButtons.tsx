import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WorkflowStatus,
  UserRole,
  getPermissions,
  getNextAction,
  WORKFLOW_STEPS,
  getStepFromStatus,
} from "@/types/deathCase";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowActionButtonsProps {
  status: WorkflowStatus;
  currentRole: UserRole;
  onBack?: () => void;
  onSave?: () => void;
  onNext?: () => void;
  onRequestCorrection?: () => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
  hasUnsavedChanges?: boolean;
  canProceed?: boolean;
  className?: string;
}

export function WorkflowActionButtons({
  status,
  currentRole,
  onBack,
  onSave,
  onNext,
  onRequestCorrection,
  isSaving = false,
  isSubmitting = false,
  hasUnsavedChanges = false,
  canProceed = true,
  className,
}: WorkflowActionButtonsProps) {
  const permissions = getPermissions(currentRole, status);
  const nextAction = getNextAction(status);
  const currentStep = getStepFromStatus(status);
  const currentStepConfig = WORKFLOW_STEPS.find((s) => s.id === currentStep);

  // Determine what the next action button should do
  const getNextButtonConfig = () => {
    switch (status) {
      case "reported":
      case "details_pending":
        return {
          label: "Submit for Vet Review",
          icon: Send,
          disabled: !permissions.canEditEvent || !canProceed,
          tooltip: !canProceed
            ? "Complete all required fields first"
            : "Send to veterinarian for confirmation",
        };
      case "vet_requested":
        if (currentRole === "veterinarian" || currentRole === "admin") {
          return {
            label: "Confirm & Continue",
            icon: CheckCircle2,
            disabled: !permissions.canEditVet || !canProceed,
            tooltip: !canProceed
              ? "Complete veterinary confirmation first"
              : "Confirm cause of death and proceed",
          };
        }
        return {
          label: "Awaiting Vet",
          icon: null,
          disabled: true,
          tooltip: `Waiting for ${nextAction.description}`,
        };
      case "vet_confirmed":
      case "disposal_pending":
        return {
          label: "Submit Disposal Info",
          icon: Send,
          disabled: !permissions.canEditDisposal || !canProceed,
          tooltip: !canProceed
            ? "Complete disposal information first"
            : "Submit for manager review",
        };
      case "disposal_recorded":
      case "review_pending":
        if (currentRole === "manager" || currentRole === "admin") {
          return {
            label: "Approve Case",
            icon: CheckCircle2,
            disabled: !permissions.canApprove || !canProceed,
            tooltip: "Approve and close this case",
          };
        }
        return {
          label: "Awaiting Review",
          icon: null,
          disabled: true,
          tooltip: "Waiting for manager review",
        };
      case "correction_needed":
        return {
          label: "Resubmit for Review",
          icon: Send,
          disabled: !canProceed,
          tooltip: !canProceed
            ? "Address all correction requests first"
            : "Resubmit case for review",
        };
      case "approved":
      case "archived":
        return {
          label: "Case Complete",
          icon: CheckCircle2,
          disabled: true,
          tooltip: "This case has been approved and closed",
        };
      default:
        return {
          label: "Continue",
          icon: ArrowRight,
          disabled: true,
          tooltip: "Unknown status",
        };
    }
  };

  const nextButtonConfig = getNextButtonConfig();
  const showCorrectionButton =
    (currentRole === "manager" || currentRole === "admin") &&
    status === "review_pending" &&
    permissions.canRequestCorrection;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border",
        className
      )}
    >
      {/* Left side - Back & Save */}
      <div className="flex items-center gap-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        {onSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasUnsavedChanges
                ? "Save your changes"
                : "No changes to save"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Center - Auto-save indicator */}
      {hasUnsavedChanges && (
        <p className="text-xs text-muted-foreground hidden sm:block">
          Changes will be auto-saved
        </p>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Correction request button (for managers) */}
        {showCorrectionButton && onRequestCorrection && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onRequestCorrection}
                disabled={isSubmitting}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Correction
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Send case back for corrections
            </TooltipContent>
          </Tooltip>
        )}

        {/* Main action button */}
        {onNext && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNext}
                disabled={nextButtonConfig.disabled || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : nextButtonConfig.icon ? (
                  <nextButtonConfig.icon className="w-4 h-4 mr-2" />
                ) : null}
                {isSubmitting ? "Submitting..." : nextButtonConfig.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{nextButtonConfig.tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
