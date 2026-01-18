import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Syringe, Weight } from "lucide-react";

const HealthActions = () => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Health & Records
      </h2>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="text-muted-foreground hover:text-foreground border-border/60"
          onClick={() => navigate("/animal-update")}
        >
          <Activity className="h-4 w-4 mr-2" />
          Add Health Update
        </Button>
        <Button 
          variant="outline" 
          className="text-muted-foreground hover:text-foreground border-border/60"
          onClick={() => navigate("/animal-update")}
        >
          <Syringe className="h-4 w-4 mr-2" />
          Add Vaccination
        </Button>
        <Button 
          variant="outline" 
          className="text-muted-foreground hover:text-foreground border-border/60"
          onClick={() => navigate("/animal-update")}
        >
          <Weight className="h-4 w-4 mr-2" />
          Add Weight Update
        </Button>
      </div>
    </section>
  );
};

export default HealthActions;