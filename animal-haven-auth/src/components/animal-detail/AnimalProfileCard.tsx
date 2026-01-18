import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type AnimalDetail } from "@/interfaces/animal-detail.interface";

interface AnimalProfileCardProps {
  animal: AnimalDetail;
  farmName: string;
  loading?: boolean;
}

interface ProfileFieldProps {
  label: string;
  value: string | number;
  capitalize?: boolean;
}

const ProfileField = ({ label, value, capitalize }: ProfileFieldProps) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>
      {value}
    </p>
  </div>
);

const AnimalProfileCard = ({ animal, farmName, loading }: AnimalProfileCardProps) => {
  return (
    <Card className="lg:col-span-3 border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">
          Animal Profile
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
            <ProfileField label="Tag Number" value={animal.tagNumber} />
            <ProfileField label="Type" value={animal.animalType} />
            <ProfileField label="Breed" value={animal.breed} />
            <ProfileField label="Gender" value={animal.gender} capitalize />
            <ProfileField label="Age" value={animal.age || "N/A"} />
            <ProfileField label="Weight" value={animal.weight || "N/A"} />
            <div className="col-span-2 md:col-span-3 pt-2 border-t border-border/30">
              <ProfileField label="Farm" value={farmName} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalProfileCard;