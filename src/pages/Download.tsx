import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fileService } from "../services/api";
import { CloudLightning, FileQuestion } from "lucide-react";
import { MixedDownloadOptions } from "../components/MixedDownloadOptions";

export interface FileDetails {
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

export function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

            {/* Unified Mixed Download Buttons */}
            <MixedDownloadOptions
              fileDetails={fileDetails}
              availableProviders={availableProviders}
              apiBase={apiBase}
            />

            <p className="mt-5 text-xs text-muted-foreground text-center">
              Your file is securely hosted and ready for immediate download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
