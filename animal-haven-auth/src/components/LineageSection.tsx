import { useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { AnimalDetail, AnimalLineageNode } from "@/interfaces/animal-detail.interface";

const OFFSPRING_LIMIT = 20;

const STATUS_BADGE: Record<string, string> = {
  Active:
    "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  Sold: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
  Deceased:
    "bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-400",
};

const GENDER_BADGE: Record<string, string> = {
  Male: "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400",
  Female: "bg-pink-500/15 text-pink-700 border-pink-500/30 dark:text-pink-400",
};

function calcAge(dob?: string | null): string {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  const years = differenceInYears(now, birth);
  if (years > 0) return `${years}y`;
  const months = differenceInMonths(now, birth);
  return months > 0 ? `${months}mo` : "<1mo";
}

// ─── Unknown placeholder card ────────────────────────────────────────────────

function UnknownCard({ role }: { role: string }) {
  return (
    <div className="flex-1 rounded-xl border-2 border-dashed border-border/40 p-4 flex flex-col items-center justify-center gap-1 min-h-[104px] text-center select-none">
      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
        {role}
      </p>
      <p className="text-sm text-muted-foreground/35">Unknown</p>
    </div>
  );
}

// ─── Parent card (real data, clickable Link) ──────────────────────────────────

interface ParentCardProps {
  role: "Father" | "Mother";
  data?: AnimalLineageNode | null;
  farmId: string;
  currentAnimalId: string;
}

function ParentCard({
  role,
  data,
  farmId,
  currentAnimalId,
}: ParentCardProps) {
  if (data?.id === currentAnimalId) {
    console.warn(
      `[LineageSection] ${role} references the same animal (id=${data.id}) — skipping`,
    );
    return <UnknownCard role={role} />;
  }

  if (!data) return <UnknownCard role={role} />;

  return (
    <Link
      to={`/farms/${farmId}/animals/${data.id}`}
      className="block flex-1 rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all group min-h-[104px]"
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        {role}
      </p>
      <p className="font-mono font-semibold text-sm group-hover:text-primary transition-colors">
        #{data.tagNumber}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {data.animalType}
        {data.breed ? ` · ${data.breed}` : ""}
      </p>
      <div className="mt-3">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-4 px-1.5 font-normal",
            STATUS_BADGE[data.status] ?? "bg-muted",
          )}
        >
          {data.status}
        </Badge>
      </div>
    </Link>
  );
}

// ─── Compact offspring card ───────────────────────────────────────────────────

function OffspringCard({
  child,
  farmId,
}: {
  child: AnimalLineageNode;
  farmId: string;
}) {
  const age = calcAge(child.dateOfBirth);
  return (
    <Link
      to={`/farms/${farmId}/animals/${child.id}`}
      className="block rounded-lg border border-border/50 bg-card/50 p-3 hover:border-primary/40 hover:shadow-sm transition-all group"
    >
      <p className="font-mono font-medium text-sm group-hover:text-primary transition-colors">
        #{child.tagNumber}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {child.animalType}
        {child.breed ? ` · ${child.breed}` : ""}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {child.gender && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-4 px-1 font-normal",
              GENDER_BADGE[child.gender] ?? "",
            )}
          >
            {child.gender}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-4 px-1 font-normal",
            STATUS_BADGE[child.status] ?? "bg-muted",
          )}
        >
          {child.status}
        </Badge>
        {age && (
          <span className="text-[10px] text-muted-foreground self-center">
            {age}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface LineageSectionProps {
  animal: AnimalDetail;
  farmId: string;
}

export function LineageSection({ animal, farmId }: LineageSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const { mother, father, children = [], generation } = animal;
  const hasParents = !!(mother || father);
  const totalOffspring = children.length;
  const visibleChildren = showAll
    ? children
    : children.slice(0, OFFSPRING_LIMIT);

  // Generation label
  const genLabel = (() => {
    const gen = generation ?? 1;
    if (!hasParents && gen === 1) return "Generation 1 — Foundation Animal";
    return `Generation ${gen}`;
  })();

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Lineage
          </h2>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full border border-border/30">
            {genLabel}
          </span>
        </div>

        {/* ── Parents row ── */}
        <div className="grid grid-cols-2 gap-3">
          <ParentCard
            role="Father"
            data={father}
            farmId={farmId}
            currentAnimalId={animal.id}
          />
          <ParentCard
            role="Mother"
            data={mother}
            farmId={farmId}
            currentAnimalId={animal.id}
          />
        </div>

        {/* ── Tree connector (only when at least one parent is known) ── */}
        {hasParents && (
          <div className="relative h-5">
            {/* Horizontal bar spanning from left-card-center to right-card-center */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border/50" />
            {/* Vertical center drop */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border/50" />
          </div>
        )}

        {/* ── Current animal pill ── */}
        <div className={cn("flex justify-center", hasParents ? "mb-5" : "mb-5 mt-4")}>
          <div className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-card">
            <span className="font-semibold text-foreground">{animal.name}</span>
            <span className="ml-1.5 font-mono text-muted-foreground">
              #{animal.tagNumber}
            </span>
          </div>
        </div>

        {/* ── Offspring section ── */}
        <div className="border-t border-border/30 pt-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Offspring
            {totalOffspring > 0 && (
              <span className="ml-1 font-normal normal-case">
                ({totalOffspring})
              </span>
            )}
          </h3>

          {totalOffspring === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="No offspring recorded"
              description="Offspring appear here when this animal is linked as a mother or father."
              className="py-8"
            />
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visibleChildren.map((child) => (
                  <OffspringCard key={child.id} child={child} farmId={farmId} />
                ))}
              </div>

              {totalOffspring > OFFSPRING_LIMIT && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                      Show all {totalOffspring} offspring
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
