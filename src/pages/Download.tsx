import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fileService } from "../services/api";
import {
  CloudLightning,
  Download,
  FileQuestion,
  Cloud,
  Loader2,
} from "lucide-react";

interface FileDetails {
  id: string;
  originalName: string;
  mimeType: string | null;
  size: string | null;
  vikingfileUrl: string | null;
  providers: {
    r2?: boolean;
    pixeldrain?: boolean;
    idrive?: boolean;
    vikingfile?: boolean;
  };
}

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

export function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const apiBase =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    "http://localhost:3000";

  useEffect(() => {
    const fetchFile = async () => {
      try {
        if (!id) throw new Error("No file ID provided");
        const data = await fileService.getDownloadInfo(id);
        setFileDetails(data);
      } catch (err: unknown) {
        const errorResponse = err as {
          response?: { data?: { error?: string } };
        };
        setError(
          errorResponse.response?.data?.error ||
            "File not found or no longer available.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  const formatSize = (bytes: string | null) => {
    if (!bytes) return "Unknown size";
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024)
      return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  /**
   * VikingFile redirects to their browse page (Cloudflare-protected download).
   * All other providers stream through our backend proxy.
   */
  const handleDownload = (provider: string) => {
    if (!fileDetails) return;

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

  const availableProviders = fileDetails
    ? Object.entries(fileDetails.providers).filter(([, available]) => available)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground animate-pulse">
          Locating file...
        </p>
      </div>
    );
  }

  if (error || !fileDetails) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
        <FileQuestion className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground">File Not Found</h2>
        <p className="mt-2 text-muted-foreground text-center max-w-sm">
          {error ||
            "The file you are looking for does not exist or has been removed."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <CloudLightning className="mx-auto h-16 w-16 text-primary mb-4" />
        <h2 className="text-center text-3xl font-extrabold text-foreground leading-tight truncate px-2">
          {fileDetails.originalName || "Unnamed File"}
        </h2>

        <div className="mt-8 bg-card shadow sm:rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* File size */}
            <div className="text-center mb-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                File Size
              </div>
              <div className="text-xl text-foreground font-semibold">
                {formatSize(fileDetails.size)}
              </div>
            </div>

            {/* Per-provider download buttons */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-3">
                <Cloud className="inline-block h-4 w-4 mr-1" />
                Choose a mirror to download from:
              </p>

              {availableProviders.length === 0 ? (
                <p className="text-center text-sm text-destructive">
                  No download sources are currently available.
                </p>
              ) : (
                availableProviders.map(([provider]) => {
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
                        : `Download via ${meta.label}`}
                    </button>
                  );
                })
              )}
            </div>

            <p className="mt-5 text-xs text-muted-foreground text-center">
              Your file is securely hosted and ready for immediate download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
