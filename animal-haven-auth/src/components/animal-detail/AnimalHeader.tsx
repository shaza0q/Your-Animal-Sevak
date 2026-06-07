import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { type AnimalDetail } from "@/interfaces/animal-detail.interface";

interface AnimalHeaderProps {
  animal: AnimalDetail;
  farmId: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  // AnimalStatus values (backend enum)
  Active:   { label: "Active",   className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  Sold:     { label: "Sold",     className: "bg-gray-500/15 text-gray-500 border-gray-500/30" },
  Deceased: { label: "Deceased", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  // HealthStatus values (for updates displayed elsewhere)
  Healthy:  { label: "Healthy",  className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  Injured:  { label: "Injured",  className: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  Diseased: { label: "Diseased", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  Pregnant: { label: "Pregnant", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
};

const AnimalHeader = ({ animal, farmId }: AnimalHeaderProps) => {
  const navigate = useNavigate();
  const cfg = statusConfig[animal.status] ?? {
    label: animal.status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-2"
            onClick={() =>
              navigate(`/farms/${farmId}/animals/type/${animal.animalType}`)
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {animal.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {animal.tagNumber} · {animal.animalType} · {animal.breed}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-3 py-1 ${cfg.className}`}
          >
            {cfg.label}
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default AnimalHeader;
