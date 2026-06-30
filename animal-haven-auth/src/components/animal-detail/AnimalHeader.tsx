import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { type AnimalDetail } from "@/interfaces/animal-detail.interface";
import { AnimalAvatar } from "@/components/AnimalAvatar";
import { uploadAnimalPhoto } from "@/api/uploadAnimalPhoto";
import { useInvalidateAnimalDetail } from "@/hooks/useAnimalDetail";
import { toast } from "@/components/ui/sonner";
import { getErrorMessage } from "@/lib/errorUtils";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invalidateDetail = useInvalidateAnimalDetail();

  const cfg = statusConfig[animal.status] ?? {
    label: animal.status,
    className: "bg-muted text-muted-foreground",
  };

  const { mutate: changePhoto, isPending } = useMutation({
    mutationFn: (file: File) => uploadAnimalPhoto(animal.id, file),
    onSuccess: () => {
      invalidateDetail(farmId, animal.id);
      toast("Photo updated", { description: `${animal.name}'s photo has been changed.` });
    },
    onError: (err) => {
      toast("Couldn't update photo", { description: getErrorMessage(err) });
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) changePhoto(file);
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  // Photos can only be set while the animal is an active record
  const canEditPhoto = animal.status !== "Deceased";

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

          {/* Profile photo with change-photo control */}
          <div className="relative shrink-0">
            <AnimalAvatar
              photoUrl={animal.photoUrl}
              name={animal.name}
              animalType={animal.animalType}
              className="h-16 w-16 border-2 border-border"
              iconClassName="h-7 w-7"
            />
            {canEditPhoto && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

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
