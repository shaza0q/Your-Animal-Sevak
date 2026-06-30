import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { getAllFarmData } from "@/api/getAllFarmData";
import FarmStaffSection from "@/components/FarmStaffSection";
import { EmptyState } from "@/components/EmptyState";

interface Farm {
  id: string;
  name: string;
  location?: string;
}

const Directory = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getAllFarmData();
        setFarms(data ?? []);
      } catch {
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Personnel Directory</h1>
        <p className="text-sm text-muted-foreground">
          Staff, caretakers, and veterinarians across your farms
        </p>
      </div>

      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

        {!loading && farms?.length === 0 && (
          <EmptyState
            icon={Users}
            title="No farms yet"
            description="Create a farm first, then you can assign staff, caretakers, and veterinarians to it."
            action={{ label: "Create a Farm", to: "/addFarm" }}
            className="py-20"
          />
        )}

        {!loading &&
          farms?.map((farm) => (
            <div key={farm.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{farm.name}</h2>
                  {farm.location && (
                    <p className="text-sm text-muted-foreground">{farm.location}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/farmInsights/${farm.id}`)}
                >
                  Farm Insights
                </Button>
              </div>
              <FarmStaffSection farmId={farm.id} isOwner={true} />
            </div>
          ))}
    </div>
  );
};

export default Directory;
