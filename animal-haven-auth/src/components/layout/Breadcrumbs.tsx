import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Crumb, useCurrentCrumbs } from "./breadcrumb-context";

// Static labels for known path segments. Anything not listed is humanized.
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  directory: "Directory",
  compliance: "Compliance",
  "death-cases": "Death Cases",
  farms: "Farms",
  animals: "Animals",
  type: "Category",
  deceased: "Deceased",
  history: "History",
  new: "New Case",
  addFarm: "Add Farm",
  addAnimal: "Add Animal",
  farmInsights: "Farm Insights",
  animalUpdate: "Update Animal",
};

// Segments that are dynamic ids — hidden from the auto trail unless a page provides
// an explicit breadcrumb via useBreadcrumbs (which bypasses this builder entirely).
function looksLikeId(segment: string): boolean {
  return /^[0-9a-f]{8,}$/i.test(segment) || /^\d+$/.test(segment) || segment.length > 20;
}

function humanize(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildAutoCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }];

  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    if (segment === "dashboard") continue; // already the home crumb
    if (looksLikeId(segment) && !SEGMENT_LABELS[segment]) continue;
    crumbs.push({ label: SEGMENT_LABELS[segment] ?? humanize(segment), to: acc });
  }
  return crumbs;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const override = useCurrentCrumbs();

  const crumbs = override ?? buildAutoCrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbItem>
                {isLast || !crumb.to ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
