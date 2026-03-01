import { useState } from "react";
import { Download, Loader2, Cloud, Zap } from "lucide-react";
import type { FileDetails } from "../pages/Download";
import { fileService } from "../services/api";

interface MixedDownloadOptionsProps {
  fileDetails: FileDetails;
  availableProviders: [string, boolean][];
  apiBase: string;
}

export function MixedDownloadOptions({
  fileDetails,
  availableProviders,
  apiBase,
}: MixedDownloadOptionsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasProvider = (provider: string) =>
    availableProviders.some(([p]) => p === provider);

  const handleProxyDownload = (key: string, provider: string) => {
    setDownloading(key);
    const proxyUrl = `${apiBase}/api/download/${fileDetails.id}/proxy?provider=${provider}`;

    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = fileDetails.originalName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 2000);
  };

  const handleDirectDownload = async (key: string, provider: string) => {
    try {
      setDownloading(key);
      setError(null);

      const response = await fileService.getDirectUrl(fileDetails.id, provider);

      if (!response.url) {
        throw new Error("Missing direct download URL");
      }

      window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      console.error(
        `[Download] Failed to fetch direct link for ${provider}`,
        err,
      );
      const errorMessage =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to initiate download.";
      setError(errorMessage);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 mb-4">
          {error}
        </div>
      )}

      {/* iDrive: Instant Download (Proxy) */}
      {hasProvider("idrive") && (
        <button
          onClick={() => handleProxyDownload("idrive-instant", "idrive")}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "idrive-instant" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">🚀</span>
          {downloading === "idrive-instant"
            ? "Starting..."
            : "Instant Download"}
        </button>
      )}

      {/* iDrive: Fast Cloud [FSL] (Direct Pre-signed URL) */}
      {hasProvider("idrive") && (
        <button
          onClick={() => handleDirectDownload("idrive-fast", "idrive")}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "idrive-fast" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Zap className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">⚡</span>
          {downloading === "idrive-fast" ? "Starting..." : "Fast Cloud [FSL]"}
        </button>
      )}

      {/* iDrive: Cloud [Resumable] (Proxy - Same as Instant) */}
      {hasProvider("idrive") && (
        <button
          onClick={() => handleProxyDownload("idrive-resumable", "idrive")}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "idrive-resumable" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Cloud className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">🔄</span>
          {downloading === "idrive-resumable"
            ? "Starting..."
            : "Cloud [Resumable]"}
        </button>
      )}

      {/* Pixeldrain: Direct URL page */}
      {hasProvider("pixeldrain") && (
        <button
          onClick={() => handleDirectDownload("pixeldrain", "pixeldrain")}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "pixeldrain" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Zap className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">💧</span>
          {downloading === "pixeldrain" ? "Starting..." : "Pixeldrain (Fast)"}
        </button>
      )}

      {/* VikingFile: Direct URL page */}
      {hasProvider("vikingfile") && (
        <button
          onClick={() => handleDirectDownload("vikingfile", "vikingfile")}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "vikingfile" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Zap className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">⚔️</span>
          {downloading === "vikingfile" ? "Starting..." : "VikingFile Server"}
        </button>
      )}

      {availableProviders.length === 0 && (
        <p className="text-center text-sm text-destructive">
          No download sources are currently available.
        </p>
      )}
    </div>
  );
}
