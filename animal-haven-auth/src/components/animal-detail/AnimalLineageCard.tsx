import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, ChevronRight } from "lucide-react";
import { AnimalLineageNode } from "@/interfaces/animal-detail.interface";
import { EmptyState } from "@/components/EmptyState";

interface LineageLinkProps {
  label: string;
  node: AnimalLineageNode;
  farmId: string;
}

const LineageLink = ({ label, node, farmId }: LineageLinkProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/60 hover:bg-muted/40 transition-colors">
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-sm">{node.tagNumber}</span>
          <Badge variant="secondary" className="text-xs">
            {node.animalType}
          </Badge>
          {node.breed && (
            <span className="text-xs text-muted-foreground">{node.breed}</span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => navigate(`/farms/${farmId}/animals/${node.id}`)}
        aria-label={`View ${label}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface AnimalLineageCardProps {
  farmId: string;
  mother?: AnimalLineageNode | null;
  father?: AnimalLineageNode | null;
  children?: AnimalLineageNode[];
}

const AnimalLineageCard = ({
  farmId,
  mother,
  father,
  children = [],
}: AnimalLineageCardProps) => {
  const navigate = useNavigate();
  const hasAny = mother || father || children.length > 0;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Lineage
        </h2>

        {!hasAny ? (
          <EmptyState
            icon={GitBranch}
            title="No lineage recorded"
            description="Link a mother or father animal to track this animal's lineage and offspring."
            className="py-8"
          />
        ) : (
          <div className="space-y-3">
            {mother && <LineageLink label="Mother" node={mother} farmId={farmId} />}
            {father && <LineageLink label="Father" node={father} farmId={farmId} />}

            {children.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Offspring ({children.length})
                </p>
                <div className="space-y-2">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md border border-border/30 bg-background/40 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/farms/${farmId}/animals/${child.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{child.tagNumber}</span>
                        <Badge variant="outline" className="text-xs">
                          {child.animalType}
                        </Badge>
                        {child.gender && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {child.gender}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalLineageCard;
