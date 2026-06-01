import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NewDeathCaseHeaderProps {
  caseNumber: string;
  workflowStatus: string;
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  isAnimalSelected: boolean;
}

export function NewDeathCaseHeader({
  caseNumber,
  workflowStatus,
  onSaveDraft,
  isSavingDraft,
  isAnimalSelected,
}: NewDeathCaseHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card border-b">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/compliance/death-cases")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Create Death Case</h1>
              <p className="text-sm text-muted-foreground">
                Case #{caseNumber} • {workflowStatus}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSaveDraft}
            disabled={isSavingDraft || !isAnimalSelected}
          >
            {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </Button>
        </div>
      </div>
    </header>
  );
}
