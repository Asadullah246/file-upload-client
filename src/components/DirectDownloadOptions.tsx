import { useState } from "react";
import { Download, Loader2, Zap } from "lucide-react";
import type { FileDetails } from "../pages/Download";
import { fileService } from "../services/api";

const DIRECT_PROVIDER_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pixeldrain: {
    label: "Pixeldrain (Fast)",
    color: "bg-blue-600 hover:bg-blue-700",
    icon: "💧",
  },
  idrive: {
    label: "iDrive High-Speed",
    color: "bg-emerald-600 hover:bg-emerald-700",
    icon: "🗄️",
  },
  vikingfile: {
    label: "VikingFile Server",
    color: "bg-purple-600 hover:bg-purple-700",
    icon: "⚔️",
  },
};

interface DirectDownloadOptionsProps {
  fileDetails: FileDetails;
  availableProviders: [string, boolean][];
}

export function DirectDownloadOptions({
  fileDetails,
  availableProviders,
}: DirectDownloadOptionsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out R2 as requested, since we're not using it for zero-bandwidth direct downloads
  const directProviders = availableProviders.filter(([p]) => p !== "r2");

  const handleDirectDownload = async (provider: string) => {
    try {
      setDownloading(provider);
      setError(null);

      // Fetch the direct URL from the new backend endpoint
      const response = await fileService.getDirectUrl(fileDetails.id, provider);

      if (!response.url) {
        throw new Error("Missing direct download URL");
      }

      // Open all direct URLs (including iDrive pre-signed S3 links) in a new tab
      window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      console.error(
        `[DirectDownload] Failed to fetch direct link for ${provider}`,
        err,
      );
      const errorMessage =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to initiate direct download.";
      setError(errorMessage);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">
        <Zap className="inline-block h-4 w-4 mr-1 text-yellow-500" />
        Fast Downloads
      </h3>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      {directProviders.length === 0 ? (
        <p className="text-center text-sm text-destructive">
          No direct download sources are currently available.
        </p>
      ) : (
        directProviders.map(([provider]) => {
          const meta = DIRECT_PROVIDER_META[provider] || {
            label: provider,
            color: "bg-primary hover:bg-primary/90",
            icon: "📦",
          };
          const isDownloading = downloading === provider;

          return (
            <button
              key={`direct-${provider}`}
              onClick={() => handleDirectDownload(provider)}
              disabled={isDownloading}
              className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${meta.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait`}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              <span className="mr-2">{meta.icon}</span>
              {isDownloading ? "Starting..." : `${meta.label}`}
            </button>
          );
        })
      )}
    </div>
  );
}
