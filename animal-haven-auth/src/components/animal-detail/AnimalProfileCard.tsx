import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type AnimalDetail } from "@/interfaces/animal-detail.interface";
import { format } from "date-fns";

interface AnimalProfileCardProps {
  animal: AnimalDetail;
  loading?: boolean;
}

interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
  capitalize?: boolean;
}

const ProfileField = ({ label, value, capitalize }: ProfileFieldProps) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>
      {value != null && value !== "" ? String(value) : "—"}
    </p>
  </div>
);

const AnimalProfileCard = ({ animal, loading }: AnimalProfileCardProps) => {
  const dob = animal.dateOfBirth
    ? format(new Date(animal.dateOfBirth), "dd MMM yyyy")
    : null;
  const acquired = animal.acquisitionDate
    ? format(new Date(animal.acquisitionDate), "dd MMM yyyy")
    : null;

  return (
    <Card className="lg:col-span-3 border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">
          Animal Profile
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
            <ProfileField label="Tag Number" value={animal.tagNumber} />
            <ProfileField label="Type" value={animal.animalType} />
            <ProfileField label="Breed" value={animal.breed} />
            <ProfileField label="Gender" value={animal.gender} capitalize />
            <ProfileField
              label="Age"
              value={animal.age != null ? `${animal.age} yr${animal.age !== 1 ? "s" : ""}` : null}
            />
            <ProfileField
              label="Weight"
              value={animal.weight != null ? `${animal.weight} kg` : null}
            />
            <ProfileField label="Date of Birth" value={dob} />
            <ProfileField label="Acquisition Date" value={acquired} />
            <div className="col-span-2 md:col-span-3 pt-2 border-t border-border/30">
              <ProfileField label="Farm" value={animal.farm.name} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalProfileCard;
