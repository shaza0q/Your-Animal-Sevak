import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Syringe, AlertTriangle, Skull, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface NotificationRow {
  key: string;
  icon: typeof Syringe;
  iconClass: string;
  title: string;
  subtitle: string;
  to: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useTasks();

  const count = data?.counts.total ?? 0;

  const rows: NotificationRow[] = [];
  if (data) {
    for (const v of data.vaccinations) {
      rows.push({
        key: `vac-${v.animalId}-${v.dueDate}`,
        icon: Syringe,
        iconClass: v.overdue ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600",
        title: `${v.vaccineName ?? "Vaccination"} ${v.overdue ? "overdue" : "due"} — ${v.name}`,
        subtitle: `#${v.tagNumber} · ${v.farmName}`,
        to: `/farms/${v.farmId}/animals/${v.animalId}`,
      });
    }
    for (const a of data.attention) {
      rows.push({
        key: `att-${a.id}`,
        icon: AlertTriangle,
        iconClass: "bg-red-500/10 text-red-600",
        title: `${a.name} needs attention`,
        subtitle: `${a.latestStatus} · ${a.farmName}`,
        to: `/farms/${a.farmId}/animals/${a.id}`,
      });
    }
    for (const d of data.deathCases) {
      rows.push({
        key: `dc-${d.id}`,
        icon: Skull,
        iconClass: "bg-primary/10 text-primary",
        title: `Open death case — ${d.name}`,
        subtitle: `${d.farmName}`,
        to: `/compliance/death-cases/${d.id}`,
      });
    }
  }

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {count > 0 && <Badge variant="secondary">{count}</Badge>}
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            <p className="text-sm text-muted-foreground">You're all caught up</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y">
              {rows.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => go(r.to)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      r.iconClass,
                    )}
                  >
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <button
          type="button"
          onClick={() => go("/tasks")}
          className="flex w-full items-center justify-center gap-1 border-t px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          View all in Today
          <ChevronRight className="h-4 w-4" />
        </button>
      </PopoverContent>
    </Popover>
  );
}
