import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Stethoscope, X, UserPlus, Lock } from "lucide-react";

interface PersonStatusProps {
  role: string;
  icon: React.ReactNode;
  name?: string;
  email?: string;
  isAssigned: boolean;
  onAssign: () => void;
  onUnassign: () => void;
  canAssign: boolean;
  canUnassign: boolean;
  isLoading?: boolean;
}

const PersonStatus = ({ 
  role, 
  icon, 
  name, 
  email, 
  isAssigned, 
  onAssign, 
  onUnassign, 
  canAssign, 
  canUnassign,
  isLoading = false 
}: PersonStatusProps) => (
  <div className="
    group
    flex items-center justify-between
    py-3 px-4
    rounded-lg
    border border-border/40
    bg-background/60
    hover:bg-background/80
    transition-all duration-200
  ">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={`
        p-2 rounded-full
        ${isAssigned 
          ? "bg-emerald-500/10 text-emerald-600" 
          : "bg-muted/50 text-muted-foreground"
        }
        transition-colors duration-200
        group-hover:bg-primary/10 group-hover:text-primary
      `}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        {isAssigned ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Name and Role badge on same line */}
                <div className="flex items-center gap-2 min-w-0 mb-0.5">
                  {/* Primary: Name */}
                  <p className="font-semibold text-sm text-foreground truncate">
                    {name}
                  </p>
                  
                  {/* Tertiary: Role badge - contextual, next to name */}
                  <Badge
                    variant="outline"
                    className="
                      text-[10px] 
                      px-2 py-0.5 
                      h-5
                      font-normal
                      text-muted-foreground
                      bg-background/50
                      border-border/40
                      shrink-0
                    "
                  >
                    {role}
                  </Badge>
                </div>
                
                {/* Secondary: Email */}
                {email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {email}
                  </p>
                )}
              </div>
              
              {/* Right side: Action or permission hint */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Unassign button for those who can */}
                {canUnassign && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onUnassign}
                          disabled={isLoading}
                          className="
                            h-7 w-7 p-0
                            opacity-40
                            group-hover:opacity-100
                            text-muted-foreground
                            hover:text-destructive
                            hover:bg-destructive/10
                            transition-all duration-200
                            shrink-0
                          "
                          aria-label={`Remove ${name} as ${role}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end">
                        <p className="text-xs">Remove assignment</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Permission hint for those who can't unassign */}
                {!canUnassign && isAssigned && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="
                          flex items-center gap-1 
                          text-xs text-muted-foreground 
                          px-2 py-1
                          rounded-md
                          bg-muted/30
                          shrink-0
                        ">
                          <Lock className="h-3 w-3 opacity-70" />
                          <span className="hidden sm:inline">Owner only</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="end">
                        <p className="text-xs">Only farm owner can remove assignments</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {/* Not assigned state */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {role}
                </p>
                <Badge
                  variant="outline"
                  className="
                    text-[10px] 
                    px-2 py-0.5 
                    h-5
                    font-normal
                    text-amber-600
                    bg-muted/40
                    border-amber-200
                  "
                >
                  Not assigned
                </Badge>
              </div>
              
              {/* Assign action hint */}
              <p className="text-xs text-muted-foreground/80">
                Click to assign a {role.toLowerCase()}
              </p>
            </div>
            
            {canAssign && (
              <Button 
                size="sm" 
                variant="secondary"
                className="
                  text-xs h-7
                  group/btn
                  hover:scale-105
                  transition-all duration-200
                "
                onClick={onAssign}
                disabled={isLoading}
              >
                <UserPlus className="h-3 w-3 mr-1.5 opacity-70" />
                Assign
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

interface PeopleResponsiblePanelProps {
  caretakerName?: string;
  caretakerEmail?: string;
  caretakerId?: string;
  veterinarianName?: string;
  veterinarianEmail?: string;
  veterinarianId?: string;
  canAssign: boolean;
  canUnassign: boolean;
  isLoading?: boolean;
  onAssignCaretaker: () => void;
  onAssignVeterinarian: () => void;
  onUnassignCaretaker: () => void;
  onUnassignVeterinarian: () => void;
}

const PeopleResponsiblePanel = ({
  caretakerName,
  caretakerEmail,
  caretakerId,
  veterinarianName,
  veterinarianEmail,
  veterinarianId,
  canAssign,
  canUnassign,
  isLoading = false,
  onAssignCaretaker,
  onAssignVeterinarian,
  onUnassignCaretaker,
  onUnassignVeterinarian,
}: PeopleResponsiblePanelProps) => {
  return (
    <Card className="lg:col-span-2 border-border/40 bg-muted/20 shadow-sm">
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">
          People Responsible
        </h2>
        <div className="space-y-3">
          <PersonStatus
            role="Caretaker"
            icon={<User className="h-4 w-4" />}
            name={caretakerName}
            email={caretakerEmail}
            isAssigned={!!caretakerId}
            onAssign={onAssignCaretaker}
            onUnassign={onUnassignCaretaker}
            canAssign={canAssign}
            canUnassign={canUnassign}
            isLoading={isLoading}
          />
          
          <PersonStatus
            role="Veterinarian"
            icon={<Stethoscope className="h-4 w-4" />}
            name={veterinarianName}
            email={veterinarianEmail}
            isAssigned={!!veterinarianId}
            onAssign={onAssignVeterinarian}
            onUnassign={onUnassignVeterinarian}
            canAssign={canAssign}
            canUnassign={canUnassign}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PeopleResponsiblePanel;