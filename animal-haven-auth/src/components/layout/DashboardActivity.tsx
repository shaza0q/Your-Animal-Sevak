import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Scale,
  Syringe,
  Heart,
  Banknote,
  Skull,
  History,
  PartyPopper,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { AnimalAvatar } from "@/components/AnimalAvatar";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import type { ActivityType } from "@/api/getRecentActivity";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<ActivityType, { icon: LucideIcon; className: string }> = {
  health: { icon: Activity, className: "bg-blue-500/10 text-blue-600" },
  weight: { icon: Scale, className: "bg-violet-500/10 text-violet-600" },
  vaccination: { icon: Syringe, className: "bg-amber-500/10 text-amber-600" },
  breeding: { icon: Heart, className: "bg-pink-500/10 text-pink-600" },
  sale: { icon: Banknote, className: "bg-emerald-500/10 text-emerald-600" },
  death: { icon: Skull, className: "bg-red-500/10 text-red-600" },
  arrival: { icon: PartyPopper, className: "bg-fuchsia-500/10 text-fuchsia-600" },
  recovery: { icon: HeartPulse, className: "bg-emerald-500/10 text-emerald-600" },
};

/**
 * Personalised, farm-wide recent activity timeline for the dashboard side rail.
 * Shows who did what, to which animal, and when — each row links to the relevant
 * animal or compliance case.
 */
export function DashboardActivity() {
  const navigate = useNavigate();
  const { data: events = [], isLoading, isError, error, refetch } = useRecentActivity();

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>What's happened across your farms</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorMessage
            error={error}
            title="Couldn't load activity"
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center">
            <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/70">
              Logged updates and events will appear here.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-1">
            {events.map((e, idx) => {
              const style = TYPE_STYLE[e.type];
              const Icon = style.icon;
              const clickable = Boolean(e.link);
              return (
                <li
                  key={e.id}
                  className={cn(
                    "group relative flex gap-3 rounded-md p-2 -mx-2 transition-colors",
                    clickable && "cursor-pointer hover:bg-muted",
                  )}
                  onClick={() => e.link && navigate(e.link)}
                >
                  {/* connector line between dots */}
                  {idx < events.length - 1 && (
                    <span className="absolute left-[1.35rem] top-12 h-[calc(100%-1.5rem)] w-px bg-border" />
                  )}
                  <div className="relative z-10 shrink-0">
                    <AnimalAvatar
                      photoUrl={e.animal?.photoUrl}
                      name={e.animal?.name}
                      className="h-9 w-9"
                      iconClassName="h-4 w-4"
                    />
                    {/* event-type marker */}
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-card",
                        style.className,
                      )}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      {e.summary}
                      {e.detail && (
                        <span className="text-muted-foreground"> · {e.detail}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(e.at), { addSuffix: true })}
                      {e.farmName ? ` · ${e.farmName}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
