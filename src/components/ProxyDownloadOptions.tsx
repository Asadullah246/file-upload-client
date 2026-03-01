import { useState } from "react";
import { Download, Loader2, Cloud } from "lucide-react";
import type { FileDetails } from "../pages/Download";

const PROVIDER_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  r2: {
    label: "Cloudflare R2",
    color: "bg-orange-500 hover:bg-orange-600",
    icon: "☁️",
  },
  pixeldrain: {
    label: "Pixeldrain",
    color: "bg-blue-500 hover:bg-blue-600",
    icon: "💧",
  },
  idrive: {
    label: "IDrive e2",
    color: "bg-green-600 hover:bg-green-700",
    icon: "🗄️",
  },
  vikingfile: {
    label: "VikingFile",
    color: "bg-purple-600 hover:bg-purple-700",
    icon: "⚔️",
  },
};

interface ProxyDownloadOptionsProps {
  fileDetails: FileDetails;
  availableProviders: [string, boolean][];
  apiBase: string;
}

export function ProxyDownloadOptions({
  fileDetails,
  availableProviders,
  apiBase,
}: ProxyDownloadOptionsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (provider: string) => {
    if (provider === "vikingfile") {
      const browseUrl =
        fileDetails.vikingfileUrl ||
        `https://vikingfile.com/f/${fileDetails.id}`;
      window.open(browseUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setDownloading(provider);
    const proxyUrl = `${apiBase}/api/download/${fileDetails.id}/proxy?provider=${provider}`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = fileDetails.originalName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <div className="space-y-3 mt-6 pt-6 border-t border-border mt-8">
      <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">
        <Cloud className="inline-block h-4 w-4 mr-1" />
        Alternative Mirror Options (Proxy)
      </h3>

      {availableProviders.length === 0 ? (
        <p className="text-center text-sm text-destructive">
          No secondary download sources are currently available.
        </p>
      ) : (
        availableProviders.map(([provider]) => {
          if (provider === "idrive") {
            const idriveOptions = [
              {
                key: "idrive-instant",
                label: "Instant Download",
                color: "bg-green-600 hover:bg-green-700",
                icon: "🚀",
              },
              {
                key: "idrive-fast",
                label: "Fast Cloud [FSL]",
                color: "bg-emerald-600 hover:bg-emerald-700",
                icon: "⚡",
              },
              {
                key: "idrive-resumable",
                label: "Cloud [Resumable]",
                color: "bg-teal-600 hover:bg-teal-700",
                icon: "🔄",
              },
            ];

            return (
              <div key={provider} className="space-y-3">
                {idriveOptions.map((opt) => {
                  const isDownloading = downloading === provider;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleDownload(provider)}
                      disabled={isDownloading}
                      className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${opt.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait`}
                    >
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-5 w-5" />
                      )}
                      <span className="mr-2">{opt.icon}</span>
                      {isDownloading ? "Starting download..." : opt.label}
                    </button>
                  );
                })}
              </div>
            );
          }

          const meta = PROVIDER_META[provider] || {
            label: provider,
            color: "bg-primary hover:bg-primary/90",
            icon: "📦",
          };
          const isDownloading = downloading === provider;

          return (
            <button
              key={provider}
              onClick={() => handleDownload(provider)}
              disabled={isDownloading}
              className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${meta.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-wait`}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              <span className="mr-2">{meta.icon}</span>
              {isDownloading
                ? "Starting download..."
                : `Proxy Download via ${meta.label}`}
            </button>
          );
        })
      )}
    </div>
  );
}
