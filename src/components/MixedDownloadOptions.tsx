import { useState } from "react";
import { Download, Loader2, Cloud, Zap } from "lucide-react";
import type { FileDetails } from "../pages/Download";
import { fileService } from "../services/api";

interface MixedDownloadOptionsProps {
  fileDetails: FileDetails;
  availableProviders: [string, boolean][];
  apiBase: string;
  directLink: string;
}

export function MixedDownloadOptions({
  fileDetails,
  availableProviders,
  apiBase,
  directLink,
}: MixedDownloadOptionsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adClicks, setAdClicks] = useState<Record<string, number>>({});

  const hasProvider = (provider: string) =>
    availableProviders.some(([p]) => p === provider);

  const isCompleted = fileDetails.status === "COMPLETED";

  /** Falls back to Drive proxy download when cloud upload isn't done yet */
  const handleDriveFallback = (key: string) => {
    setDownloading(key);
    const proxyUrl = `${apiBase}/api/download/${fileDetails.id}/drive`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = fileDetails.originalName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 2000);
  };

  const handleProxyDownload = (key: string, provider: string) => {
    if (!isCompleted) { handleDriveFallback(key); return; }
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
    if (!isCompleted) { handleDriveFallback(key); return; }
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

  const handleInterceptedClick = (
    btnKey: string,
    realAction: () => void,
  ) => {
    const clicksForThisBtn = adClicks[btnKey] || 0;

    if (directLink && directLink.trim() !== "" && clicksForThisBtn < 2) {
      // It's an ad click
      setDownloading(btnKey);
      setAdClicks((prev) => ({ ...prev, [btnKey]: clicksForThisBtn + 1 }));

      // Simulate loading state for 2 seconds
      setTimeout(() => {
        setDownloading(null);
      }, 2000);

      // Immediately open Ad link
      window.open(directLink, "_blank", "noopener,noreferrer");
    } else {
      // Real click action
      realAction();
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
          onClick={() => handleInterceptedClick("idrive-instant", () => handleProxyDownload("idrive-instant", "idrive"))}
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

      {/* iDrive: Fast Cloud [FSL] (Instant Proxy) */}
      {hasProvider("idrive") && (
        <button
          onClick={() => handleInterceptedClick("idrive-fast", () => handleProxyDownload("idrive-fast", "idrive"))}
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

      {/* iDrive: Cloud [Resumable] (Redirect to website) */}
      {hasProvider("idrive") && (
        <button
          onClick={() => handleInterceptedClick("idrive-resumable", () => handleDirectDownload("idrive-resumable", "idrive"))}
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
          onClick={() => handleInterceptedClick("pixeldrain", () => handleDirectDownload("pixeldrain", "pixeldrain"))}
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
          onClick={() => handleInterceptedClick("vikingfile", () => handleDirectDownload("vikingfile", "vikingfile"))}
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

      {/* GoFile: Direct URL page */}
      {hasProvider("gofile") && (
        <button
          onClick={() => handleInterceptedClick("gofile", () => handleDirectDownload("gofile", "gofile"))}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "gofile" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Zap className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">🗂️</span>
          {downloading === "gofile" ? "Starting..." : "GoFile Server"}
        </button>
      )}

      {/* R2 (Cloudflare): Instant Download (Proxy) */}
      {hasProvider("r2") && (
        <button
          onClick={() => handleInterceptedClick("r2", () => handleProxyDownload("r2", "r2"))}
          disabled={downloading !== null}
          className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {downloading === "r2" ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          <span className="mr-2">☁️</span>
          {downloading === "r2" ? "Starting..." : "Cloudflare R2"}
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
