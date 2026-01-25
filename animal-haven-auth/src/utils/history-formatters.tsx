// 📁 src/utils/history-formatters.ts
import { 
  UserPlus, 
  UserMinus, 
  Activity, 
  HeartPulse, 
  Scale,
  PlusCircle,
  AlertTriangle,
  Syringe,
  Pill
} from "lucide-react";
import { AnimalHistoryEvent, HistoryUser } from "@/types/animal-history";

export interface FormattedHistoryItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  timestamp: Date;
  user?: HistoryUser;
  metadata?: Record<string, any>;
}

const COLORS = {
  ASSIGNED:
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  UNASSIGNED:
    "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  STATUS_CHANGED:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  HEALTH_EVENT:
    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  WEIGHT_UPDATED:
    "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  VACCINATION_ADDED:
    "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
  MEDICATION_ADDED:
    "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  CREATED:
    "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  DEFAULT:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
};


const getIcon = (type: AnimalHistoryEvent["type"]) => {
  const baseClass = "h-4 w-4";
  
  switch (type) {
    case "ASSIGNED":
      return <UserPlus className={baseClass} />;
    case "UNASSIGNED":
      return <UserMinus className={baseClass} />;
    case "STATUS_CHANGED":
      return <Activity className={baseClass} />;
    case "HEALTH_EVENT":
      return <HeartPulse className={baseClass} />;
    case "WEIGHT_UPDATED":
      return <Scale className={baseClass} />;
    case "VACCINATION_ADDED":
      return <Syringe className={baseClass} />;
    case "MEDICATION_ADDED":
      return <Pill className={baseClass} />;
    case "CREATED":
      return <PlusCircle className={baseClass} />;
    default:
      return <AlertTriangle className={baseClass} />;
  }
};

export const formatHistoryEvent = (event: AnimalHistoryEvent): FormattedHistoryItem => {
  const timestamp = new Date(event.at);
  const actor = event.createdBy; // Person who performed the action
  const subject = event.user;    // Person who was acted upon

  const baseItem = {
    id: String(event._id), // Ensure string ID for React keys
    timestamp,
    user: actor, // Use actor as the user for display
    icon: getIcon(event.type),
  };

  switch (event.type) {
    case "ASSIGNED":
      return {
        ...baseItem,
        title: `${subject?.name ?? "User"} assigned as ${event.role}`,
        description: actor?.name
          ? `Assigned by ${actor.name}`
          : "Assigned by system",
        color: COLORS.ASSIGNED,
        metadata: { role: event.role }
      };

    case "UNASSIGNED":
      return {
        ...baseItem,
        title: `${subject?.name ?? "User"} unassigned from ${event.role}`,
        description: actor?.name
          ? `Unassigned by ${actor.name}`
          : "Unassigned by system",
        color: COLORS.UNASSIGNED,
        metadata: { role: event.role }
      };

    case "STATUS_CHANGED":
      return {
        ...baseItem,
        title: "Status updated",
        description: `Changed from ${event.status?.from || "—"} to ${event.status?.to || "—"}`,
        color: COLORS.STATUS_CHANGED,
        metadata: { from: event.status?.from, to: event.status?.to }
      };

    case "HEALTH_EVENT":
      return {
        ...baseItem,
        title: event.health?.eventType || "Health event",
        description: event.health?.description || "",
        color: COLORS.HEALTH_EVENT,
        metadata: { 
          severity: event.health?.severity,
          treatment: event.health?.treatment
        }
      };

    case "WEIGHT_UPDATED": {
      const unit = event.weight?.unit || "kg";
      const previous = event.weight?.previous != null
        ? `${event.weight.previous}${unit}`
        : "—";

      return {
        ...baseItem,
        title: "Weight updated",
        description: `From ${previous} to ${event.weight?.current || "—"}${unit}`,
        color: COLORS.WEIGHT_UPDATED,
        metadata: event.weight
      };
    }

    case "VACCINATION_ADDED":
      return {
        ...baseItem,
        title: event.health?.eventType === "VACCINATION"
          ? "Vaccination added"
          : "Vaccination recorded",
        description: actor?.name
          ? `Recorded by ${actor.name}`
          : "Recorded by system",
        color: COLORS.VACCINATION_ADDED,
        metadata: event.health
      };

    case "MEDICATION_ADDED":
      // Fallback to existing health data structure if available
      return {
        ...baseItem,
        title: event.health?.eventType === "MEDICATION"
          ? "Medication added"
          : "Treatment recorded",
        description: actor?.name
          ? `Prescribed by ${actor.name}`
          : "Prescribed by system",
        color: COLORS.MEDICATION_ADDED,
        metadata: event.health
      };

    case "CREATED":
      return {
        ...baseItem,
        title: "Animal created",
        description: actor?.name
          ? `Created by ${actor.name}`
          : "Created by system",
        color: COLORS.CREATED,
      };

    default:
      return {
        ...baseItem,
        title: "Activity recorded",
        description: actor?.name
          ? `Performed by ${actor.name}`
          : "Performed by system",
        color: COLORS.DEFAULT,
      };
  }
};