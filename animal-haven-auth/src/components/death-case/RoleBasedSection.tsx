import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UserRole, WorkflowStatus, ROLE_CONFIG, getPermissions } from "@/types/deathCase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleBasedSectionProps {
  title: string;
  description?: string;
  section: "event" | "vet" | "disposal" | "review" | "approve";
  currentRole: UserRole;
  workflowStatus: WorkflowStatus;
  children: ReactNode;
  lockedMessage?: string;
  requiredRoles?: UserRole[];
  className?: string;
}

export function RoleBasedSection({
  title,
  description,
  section,
  currentRole,
  workflowStatus,
  children,
  lockedMessage,
  requiredRoles,
  className,
}: RoleBasedSectionProps) {
  const permissions = getPermissions(currentRole, workflowStatus);
  
  // Determine if section is editable
  const canEdit = (() => {
    switch (section) {
      case "event":
        return permissions.canEditEvent;
      case "vet":
        return permissions.canEditVet;
      case "disposal":
        return permissions.canEditDisposal;
      case "review":
        return permissions.canReview;
      case "approve":
        return permissions.canApprove;
      default:
        return false;
    }
  })();

  const isLocked = !canEdit;
  const roleConfig = ROLE_CONFIG[currentRole];

  // Get reason why section is locked
  const getLockReason = (): string => {
    if (lockedMessage) return lockedMessage;
    
    if (requiredRoles && !requiredRoles.includes(currentRole)) {
      const roleLabels = requiredRoles.map((r) => ROLE_CONFIG[r].label).join(" or ");
      return `Only ${roleLabels} can edit this section`;
    }

    switch (section) {
      case "event":
        if (workflowStatus !== "reported" && workflowStatus !== "details_pending" && workflowStatus !== "correction_needed") {
          return "This section can only be edited during the reporting phase";
        }
        break;
      case "vet":
        if (currentRole !== "veterinarian" && currentRole !== "admin") {
          return "Only veterinarians can confirm cause of death";
        }
        if (workflowStatus !== "vet_requested") {
          return "Waiting for previous steps to complete";
        }
        break;
      case "disposal":
        if (workflowStatus !== "disposal_pending" && workflowStatus !== "vet_confirmed" && workflowStatus !== "correction_needed") {
          return "Waiting for veterinary confirmation";
        }
        break;
      case "review":
      case "approve":
        if (currentRole !== "manager" && currentRole !== "admin") {
          return "Only managers can review and approve cases";
        }
        if (workflowStatus !== "review_pending") {
          return "Case must complete previous steps first";
        }
        break;
    }
    
    return "This section is currently locked";
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200",
        isLocked && "opacity-75",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isLocked && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-sm">{getLockReason()}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {requiredRoles && (
            <div className="flex flex-wrap gap-1 justify-end">
              {requiredRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                const isCurrentRole = role === currentRole;
                return (
                  <Badge
                    key={role}
                    variant="outline"
                    className={cn(
                      "text-xs",
                      isCurrentRole
                        ? cn(config.bgClass, config.textClass)
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLocked ? (
          <div className="relative">
            {/* Locked overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-md">
              <div className="text-center p-4 max-w-sm">
                <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Section Locked
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getLockReason()}
                </p>
              </div>
            </div>
            {/* Blurred content preview */}
            <div className="opacity-50 pointer-events-none select-none">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
