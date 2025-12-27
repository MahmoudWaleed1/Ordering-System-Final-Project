
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Loading</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your content...
          </p>
        </div>
      </div>
    </div>
  );
}
