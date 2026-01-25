import { Activity, ArrowRightLeft, HeartPulse } from "lucide-react";
import { AnimalHistoryEvent } from "@/types/animal-history";

export function getIcon(type: AnimalHistoryEvent["type"]) {
  switch (type) {
    case "ASSIGNED":
    case "UNASSIGNED":
      return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
    case "STATUS_CHANGED":
      return <Activity className="h-4 w-4 text-amber-500" />;
    case "HEALTH_EVENT":
      return <HeartPulse className="h-4 w-4 text-emerald-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

export function getLabel(event: AnimalHistoryEvent) {
  switch (event.type) {
    case "ASSIGNED":
      return "Assigned";
    case "UNASSIGNED":
      return "Unassigned";
    case "STATUS_CHANGED":
      return "Status changed";
    case "HEALTH_EVENT":
      return "Health update";
    case "CREATED":
      return "Animal created";
    default:
      return event.type;
  }
}

export function getDescription(event: AnimalHistoryEvent) {
  switch (event.type) {
    case "ASSIGNED":
      return `${event.user?.name} assigned as ${event.role}`;
    case "UNASSIGNED":
      return `${event.user?.name} unassigned from ${event.role}`;
    case "STATUS_CHANGED":
      return `Status changed from ${event.status?.from} to ${event.status?.to}`;
    case "HEALTH_EVENT":
      return `${event.health?.eventType}: ${event.health?.description}`;
    case "CREATED":
      return "Animal record created";
    default:
      return "";
  }
}
