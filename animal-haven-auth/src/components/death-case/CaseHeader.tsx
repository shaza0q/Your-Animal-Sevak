import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeathCase, ROLE_CONFIG, getNextAction, getStepFromStatus, WORKFLOW_STEPS } from "@/types/deathCase";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Clock } from "lucide-react";

interface CaseHeaderProps {
  deathCase: DeathCase;
  className?: string;
}

export function CaseHeader({ deathCase, className }: CaseHeaderProps) {
  const navigate = useNavigate();
  const nextAction = getNextAction(deathCase.workflowStatus);
  const nextActionRole = ROLE_CONFIG[nextAction.role];
  const currentStep = getStepFromStatus(deathCase.workflowStatus);
  const currentStepConfig = WORKFLOW_STEPS.find((s) => s.id === currentStep);

  const needsAttention = 
    deathCase.workflowStatus === "correction_needed" ||
    deathCase.workflowStatus === "vet_requested";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/compliance/death-cases")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            {deathCase.caseNumber}
          </span>
          <CaseStatusBadge status={deathCase.workflowStatus} />
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Animal info */}
          <div>
            <h1 className="text-2xl font-bold">{deathCase.snapshot.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span>{deathCase.snapshot.species}</span>
              {deathCase.snapshot.breed && (
                <>
                  <span>·</span>
                  <span>{deathCase.snapshot.breed}</span>
                </>
              )}
              <span>·</span>
              <span className="font-mono text-sm">{deathCase.snapshot.tagNumber}</span>
            </div>
          </div>

          {/* Right: Step indicator */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {WORKFLOW_STEPS.length}
            </p>
            <p className="font-medium">{currentStepConfig?.label}</p>
          </div>
        </div>

        {/* Action needed banner */}
        <div
          className={cn(
            "mt-4 p-3 rounded-lg flex items-center gap-3",
            needsAttention
              ? "bg-amber-500/10 border border-amber-500/30"
              : "bg-muted/50"
          )}
        >
          {needsAttention ? (
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">Next:</span> {nextAction.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(nextActionRole.bgClass, nextActionRole.textClass)}
          >
            {nextActionRole.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
