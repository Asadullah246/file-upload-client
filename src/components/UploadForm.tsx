import { useState } from "react";
import { Upload, Link2, Loader2, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface UploadFormProps {
  onUploadStart: (url: string) => Promise<void>;
  isLoading: boolean;
  /** List of enabled provider labels e.g. ["IDrive", "GoFile"] */
  activeProviders: string[];
}

const PROVIDER_LABELS: Record<string, string> = {
  R2: "Cloudflare R2",
  PIXELDRAIN: "Pixeldrain",
  VIKINGFILE: "VikingFile",
  IDRIVE: "IDrive e2",
  GOFILE: "GoFile",
};

export function UploadForm({ onUploadStart, isLoading, activeProviders }: UploadFormProps) {
  const [url, setUrl] = useState("");
  const hasProviders = activeProviders.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !hasProviders) return;

    await onUploadStart(url);
    setUrl("");
  };

  const providerLabels = activeProviders.map((p) => PROVIDER_LABELS[p] ?? p);

  return (
    <div className="space-y-3 mb-8">
      {/* Active provider banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {hasProviders ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Uploading to:</span>{" "}
            {providerLabels.join(", ")}
          </p>
        ) : (
          <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            No cloud providers active. Please configure at least one.
          </p>
        )}
        <Link
          to="/cloud-controls"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Cloud Settings
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex space-x-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="url"
            required
            placeholder="Paste Google Drive public link here..."
            className={classNames(
              "block w-full pl-10 pr-3 py-3 border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm",
              !hasProviders ? "border-destructive/40" : "border-border",
            )}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading || !hasProviders}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !url.trim() || !hasProviders}
          className="flex items-center justify-center px-6 py-3 h-auto border border-transparent text-base font-medium rounded-lg shadow-sm transition-all"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <Upload className="h-5 w-5 mr-2" />
          )}
          Transfer
        </Button>
      </form>

      {!hasProviders && (
        <p className="text-xs text-destructive/80">
          ⚠️ Add credentials in{" "}
          <Link to="/cloud-controls" className="underline font-medium">
            Cloud Settings
          </Link>{" "}
          to enable uploads.
        </p>
      )}
    </div>
  );
}
