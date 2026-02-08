import { cn } from "@/lib/utils";
import {
  WorkflowStatus,
  WORKFLOW_STEPS,
  isStepComplete,
  isStepCurrent,
  isStepLocked,
  getLockedReason,
} from "@/types/deathCase";
import { Check, Lock, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeathWorkflowStepperProps {
  status: WorkflowStatus;
  compact?: boolean;
  className?: string;
  onStepClick?: (stepKey: string) => void;
}

export function DeathWorkflowStepper({
  status,
  compact = false,
  className,
  onStepClick,
}: DeathWorkflowStepperProps) {
  const currentStepIndex = WORKFLOW_STEPS.findIndex((step) =>
    isStepCurrent(step.id, status)
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar background */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${Math.max(0, ((currentStepIndex) / (WORKFLOW_STEPS.length - 1)) * 100)}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {WORKFLOW_STEPS.map((step) => {
            const isComplete = isStepComplete(step.id, status);
            const isCurrent = isStepCurrent(step.id, status);
            const isLocked = isStepLocked(step.id, status);
            const lockedReason = getLockedReason(step.id, status);
            const isClickable = !isLocked && onStepClick;

            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(step.key)}
                    disabled={isLocked}
                    className={cn(
                      "flex flex-col items-center gap-2 group",
                      isClickable && "cursor-pointer",
                      isLocked && "cursor-not-allowed"
                    )}
                  >
                    {/* Step indicator */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                        isComplete && "bg-primary border-primary text-primary-foreground",
                        isCurrent && "border-primary text-primary ring-4 ring-primary/20",
                        isLocked && "border-muted text-muted-foreground",
                        !isComplete && !isCurrent && !isLocked && "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {isComplete ? (
                        <Check className="w-4 h-4" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Circle
                          className={cn(
                            "w-3 h-3",
                            isCurrent && "fill-primary"
                          )}
                        />
                      )}
                    </div>

                    {/* Step label */}
                    {!compact && (
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors",
                            isComplete && "text-primary",
                            isCurrent && "text-primary font-semibold",
                            isLocked && "text-muted-foreground",
                            !isComplete && !isCurrent && !isLocked && "text-muted-foreground"
                          )}
                        >
                          {step.shortLabel}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Current
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <div className="text-center">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isComplete
                        ? "Completed"
                        : isCurrent
                        ? step.description
                        : lockedReason || step.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Progress text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {WORKFLOW_STEPS.length}:{" "}
          <span className="font-medium text-foreground">
            {WORKFLOW_STEPS[currentStepIndex]?.label || "Unknown"}
          </span>
        </p>
      </div>
    </div>
  );
}
