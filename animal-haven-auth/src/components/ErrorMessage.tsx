import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errorUtils";

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorMessage({
  error,
  onRetry,
  title = "Something went wrong",
}: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-destructive text-sm">{title}</p>
          <p className="text-sm text-destructive/80 mt-0.5">
            {getErrorMessage(error)}
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
