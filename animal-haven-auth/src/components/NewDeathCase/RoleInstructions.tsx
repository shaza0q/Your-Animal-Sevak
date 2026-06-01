import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/deathCase";
import { cn } from "@/lib/utils";

interface RoleInstructionsProps {
  role: UserRole | null;
}

export function RoleInstructions({ role }: RoleInstructionsProps) {
  if (!role) return null;

  const instructions: Record<string, string> = {
    caretaker: "You can report deaths and record disposal information.",
    staff: "You can report deaths, request vet confirmation, record disposal, and submit for review.",
    owner: "You have full access to all death case functions.",
    veterinarian: "You can confirm causes of death and provide veterinary findings.",
    admin: "You have full administrative access to all death case functions.",
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <Badge variant="secondary" className={cn(
        role === "caretaker" && "bg-blue-500/15 text-blue-600",
        role === "staff" && "bg-green-500/15 text-green-600",
        role === "owner" && "bg-purple-500/15 text-purple-600",
        role === "veterinarian" && "bg-amber-500/15 text-amber-600",
        role === "admin" && "bg-red-500/15 text-red-600",
      )}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {instructions[role] || "Role permissions loading..."}
      </span>
    </div>
  );
}
