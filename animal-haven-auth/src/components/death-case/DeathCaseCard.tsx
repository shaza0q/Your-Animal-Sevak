import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeathCase, ROLE_CONFIG, getStepFromStatus, WORKFLOW_STEPS } from "@/types/deathCase";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar, MapPin, User, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DeathCaseCardProps {
  deathCase: DeathCase;
  className?: string;
  showNextAction?: boolean;
}

export function DeathCaseCard({
  deathCase,
  className,
  showNextAction = true,
}: DeathCaseCardProps) {
  const navigate = useNavigate();
  const currentStep = getStepFromStatus(deathCase.workflowStatus);
  const stepConfig = WORKFLOW_STEPS.find((s) => s.id === currentStep);
  const nextActionRole = deathCase.nextActionBy
    ? ROLE_CONFIG[deathCase.nextActionBy]
    : null;

  const handleClick = () => {
    navigate(`/compliance/death-cases/${deathCase.id}`);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 group",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-muted-foreground">
                {deathCase.caseNumber}
              </span>
              <CaseStatusBadge status={deathCase.workflowStatus} size="sm" />
            </div>
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {deathCase.snapshot.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {deathCase.snapshot.species}
              {deathCase.snapshot.breed && ` · ${deathCase.snapshot.breed}`}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {deathCase.eventInfo?.dateOfDeath
                ? format(new Date(deathCase.eventInfo.dateOfDeath), "MMM d, yyyy")
                : "Date not recorded"}
            </span>
            {deathCase.eventInfo?.dateOfDeath && (
              <span className="text-xs">
                ({formatDistanceToNow(new Date(deathCase.eventInfo.dateOfDeath), { addSuffix: true })})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {deathCase.snapshot.location || deathCase.snapshot.farmName}
            </span>
          </div>

          {deathCase.eventInfo?.discoveredBy && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 shrink-0" />
              <span>Reported by {deathCase.eventInfo.discoveredBy}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / WORKFLOW_STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {currentStep}/{WORKFLOW_STEPS.length}
            </span>
          </div>

          {/* Next action */}
          {showNextAction && deathCase.nextActionDescription && nextActionRole && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {deathCase.nextActionDescription}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs shrink-0",
                  nextActionRole.bgClass,
                  nextActionRole.textClass
                )}
              >
                {nextActionRole.label}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
