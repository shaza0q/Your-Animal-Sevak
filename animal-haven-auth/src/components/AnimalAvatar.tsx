import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Beef, Bird, Rabbit, PawPrint, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SPECIES_ICON: Record<string, LucideIcon> = {
  COW: Beef,
  BUFFALO: Beef,
  GOAT: Rabbit,
  SHEEP: Bird,
  CHICKEN: Bird,
  DUCK: Bird,
  RABBIT: Rabbit,
  PIGEON: Bird,
  TURKEY: Bird,
};

interface AnimalAvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  animalType?: string | null;
  /** Tailwind sizing classes, e.g. "h-10 w-10". Defaults to h-10 w-10. */
  className?: string;
  /** Icon size class for the fallback, e.g. "h-5 w-5". */
  iconClassName?: string;
}

/**
 * Shows an animal's profile photo, falling back to a species icon. Used across
 * detail, lists, search and the activity timeline so animals read as individuals.
 */
export function AnimalAvatar({
  photoUrl,
  name,
  animalType,
  className,
  iconClassName = "h-5 w-5",
}: AnimalAvatarProps) {
  const Icon = SPECIES_ICON[(animalType ?? "").toUpperCase()] ?? PawPrint;

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={name ?? "Animal"} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        <Icon className={iconClassName} />
      </AvatarFallback>
    </Avatar>
  );
}
