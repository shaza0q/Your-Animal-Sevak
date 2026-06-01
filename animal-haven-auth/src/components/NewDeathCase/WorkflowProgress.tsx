import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WorkflowProgressProps {
  steps: Step[];
  currentStep: string;
  onStepChange: (stepId: string) => void;
  completedSteps: string[];
}

export function WorkflowProgress({
  steps,
  currentStep,
  onStepChange,
  completedSteps,
}: WorkflowProgressProps) {
  return (
    <div className="flex items-center justify-between px-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id);

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : 
                isCompleted ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => onStepChange(step.id)}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                isActive ? "bg-primary-foreground text-primary" :
                isCompleted ? "bg-primary text-primary-foreground" : "border-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </Button>
            {idx < steps.length - 1 && (
              <div className="h-px bg-border flex-1 mx-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
