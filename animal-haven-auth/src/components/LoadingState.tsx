import { PawPrint } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message: string;
}

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header placeholder */}
      <div className="w-full border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      {/* Centered loading hint */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 mb-12">
          <div className="relative">
            <PawPrint className="h-12 w-12 text-muted-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground text-center max-w-md">
            {message}
          </p>
        </div>

        {/* Grid of skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Circular skeleton (icon placeholder) */}
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  
                  <div className="flex-1 space-y-2">
                    {/* Title skeleton */}
                    <Skeleton className="h-5 w-3/4" />
                    {/* Subtitle skeleton */}
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
