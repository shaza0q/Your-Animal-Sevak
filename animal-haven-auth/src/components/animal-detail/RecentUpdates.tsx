import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Weight, Syringe, ChevronRight, User, Calendar } from "lucide-react";
import { AnimalUpdate } from "@/types/animal";

interface UpdateCardProps {
  update: AnimalUpdate;
}

const getUpdateTypeBadgeClass = (type: AnimalUpdate["type"]) => {
  switch (type) {
    case "health": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "weight": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "vaccination": return "bg-purple-500/10 text-purple-600 border-purple-200";
    case "breeding": return "bg-pink-500/10 text-pink-600 border-pink-200";
    case "sale": return "bg-gray-500/10 text-gray-600 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const getUpdateIcon = (type: AnimalUpdate["type"]) => {
  switch (type) {
    case "health": return <Activity className="h-4 w-4" />;
    case "weight": return <Weight className="h-4 w-4" />;
    case "vaccination": return <Syringe className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const UpdateCard = ({ update }: UpdateCardProps) => (
  <div className="flex gap-4 p-4 rounded-lg border border-border/40 bg-card/50 hover:bg-card transition-colors">
    <div className={`p-2 rounded-full h-fit ${getUpdateTypeBadgeClass(update.type)}`}>
      {getUpdateIcon(update.type)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <Badge 
          variant="outline" 
          className={`capitalize text-xs font-normal ${getUpdateTypeBadgeClass(update.type)}`}
        >
          {update.type}
        </Badge>
        {update.status && (
          <Badge variant="secondary" className="capitalize text-xs font-normal">
            {update.status}
          </Badge>
        )}
      </div>
      <p className="text-sm text-foreground/90 mb-2 line-clamp-2">{update.notes}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {update.updatedByName}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {update.date}
        </span>
      </div>
    </div>
  </div>
);

interface RecentUpdatesProps {
  updates: AnimalUpdate[];
  loading?: boolean;
  onViewFullHistory?: () => void;
}

const RecentUpdates = ({ updates, loading, onViewFullHistory }: RecentUpdatesProps) => {
  const navigate = useNavigate();
  
  // Show only last 2 updates
  const recentUpdates = updates.slice(0, 2);
  const hasMoreUpdates = updates.length > 2;

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Recent Updates
      </h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : recentUpdates.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-10 text-center">
            <Activity className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              No updates recorded yet
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate("/animal-update")}
            >
              Add First Update
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
          
          {hasMoreUpdates && (
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground group"
              onClick={onViewFullHistory}
            >
              View full history
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default RecentUpdates;