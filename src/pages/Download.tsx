import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fileService, settingsService } from "../services/api";
import { CloudLightning, FileQuestion, Send } from "lucide-react";
import { MixedDownloadOptions } from "../components/MixedDownloadOptions";
import { VideoPlayer } from "../components/VideoPlayer";
import { DebugPanel } from "../components/DebugPanel";

const DEBUG_ENABLED = import.meta.env.VITE_DEBUG === "true";

export interface FileDetails {
  id: string;
  originalName: string;
  mimeType: string | null;
  size: string | null;
  status: string;
  progress: number;
  driveFileId: string | null;
  targetProviders: string[];
  isCached: boolean;
  vikingfileUrl: string | null;
  gofileUrl: string | null;
  providers: {
    r2?: boolean;
    pixeldrain?: boolean;
    idrive?: boolean;
    vikingfile?: boolean;
    gofile?: boolean;
  };
}

/**
 * Renders raw ad HTML and properly executes any <script> tags inside.
 * React's dangerouslySetInnerHTML intentionally does NOT execute scripts,
 * so we manually clone and append real <script> DOM elements.
 */
function AdSlot({ code, className }: { code: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code || !code.trim() || !containerRef.current) return;

    const container = containerRef.current;
    // Clear previous content
    container.innerHTML = "";

    // Create a temporary element to parse the HTML
    const temp = document.createElement("div");
    temp.innerHTML = code;

    // Append non-script nodes first, then re-create script nodes as real <script>
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const scriptEl = node as HTMLScriptElement;
        const newScript = document.createElement("script");
        // Copy all attributes (src, async, crossorigin, etc.)
        Array.from(scriptEl.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = scriptEl.textContent;
        container.appendChild(newScript);
      } else {
        container.appendChild(document.importNode(node, true));
      }
    });
  }, [code]);

  if (!code || !code.trim()) return null;

  return <div ref={containerRef} className={className} />;
}

export function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<Record<string, string>>({});

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
          "File not found or no longer available."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        setAppSettings(settings);

        // Inject the global ad loader script (e.g. AdSense) into <head> once
        const globalScript = settings["ad_global_script"] || "";
        if (globalScript.trim()) {
          // Remove any previously injected global ad script to avoid duplicates
          document.querySelector("script[data-ad-global]")?.remove();

          // Parse the stored script tag HTML to extract src/attributes
          const temp = document.createElement("div");
          temp.innerHTML = globalScript;
          const scriptNodes = temp.querySelectorAll("script");
          scriptNodes.forEach((scriptEl) => {
            const newScript = document.createElement("script");
            Array.from(scriptEl.attributes).forEach((attr) =>
              newScript.setAttribute(attr.name, attr.value)
            );
            newScript.textContent = scriptEl.textContent;
            newScript.setAttribute("data-ad-global", "true");
            document.head.appendChild(newScript);
          });
        }
      } catch {
        // Settings fetch failure is non-critical — ads just won't show
      }
    };

    fetchFile();
    fetchSettings();

    // Poll for status updates when file is still processing
    const interval = setInterval(async () => {
      if (!id) return;
      try {
        const data = await fileService.getDownloadInfo(id);
        setFileDetails(data);
        // Stop polling only when FAILED, or when COMPLETED and all target providers are available
        if (data.status === "FAILED") {
          clearInterval(interval);
        } else if (data.status === "COMPLETED") {
          const allProvidersReady = data.targetProviders.every(
            (p: string) => data.providers[p as keyof typeof data.providers]
          );
          if (allProvidersReady) {
            clearInterval(interval);
          }
        }
      } catch { /* ignore polling errors */ }
    }, 5000);

    return () => clearInterval(interval);
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

  // Always show buttons for all target providers regardless of status.
  // MixedDownloadOptions handles fallback (cache/drive) for providers not ready yet.
  const buttonsToShow: [string, boolean][] = fileDetails
    ? fileDetails.targetProviders.map(
        (p) => [p, fileDetails.providers[p as keyof typeof fileDetails.providers] ?? false] as [string, boolean]
      )
    : [];

  const isVideoFile = fileDetails?.mimeType?.startsWith("video/") ?? false;

  const adSlot1 = appSettings["ad_slot_1"] || "";
  const adSlot2 = appSettings["ad_slot_2"] || "";
  const adSlot3 = appSettings["ad_slot_3"] || "";
  const telegramLink = appSettings["telegram_link"] || "";

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <CloudLightning className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-center text-3xl font-extrabold text-foreground leading-tight truncate px-2">
            {fileDetails.originalName || "Unnamed File"}
          </h2>

          {/* ── Video Player (only for video files) ── */}
          {isVideoFile && (
            <div className="mt-6">
              <VideoPlayer
                videoUrl={`${apiBase}/api/download/${fileDetails.id}/stream`}
                fileName={fileDetails.originalName || "video"}
                mimeType={fileDetails.mimeType || "video/mp4"}
              />
            </div>
          )}

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

              {/* ── Ad Slot 3 — between file info and buttons ── */}
              <AdSlot
                code={adSlot3}
                className="mb-5 overflow-hidden rounded-md"
              />

              {/* ── Ad Slot 1 — above download buttons ── */}
              <AdSlot
                code={adSlot1}
                className="mb-4 overflow-hidden rounded-md"
              />

              {/* Unified Mixed Download Buttons */}
              <MixedDownloadOptions
                fileDetails={fileDetails}
                availableProviders={buttonsToShow}
                apiBase={apiBase}
                directLink={appSettings["direct_link"] || ""}
              />

              {/* ── Ad Slot 2 — below download buttons ── */}
              <AdSlot
                code={adSlot2}
                className="mt-4 overflow-hidden rounded-md"
              />

              <p className="mt-5 text-xs text-muted-foreground text-center">
                Your file is securely hosted and ready for immediate download.
              </p>
            </div>
          </div>

          {/* ── Debug Panel (dev only) ── */}
          {DEBUG_ENABLED && (
            <DebugPanel
              fileDetails={fileDetails}
              isCached={fileDetails.isCached}
            />
          )}
        </div>
      </div>

      {/* ── Footer with Telegram link ────────────────────────────────────── */}
      {telegramLink && (
        <footer className="w-full border-t border-border bg-card py-4 px-4">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2">
            <Send className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Join our channel:</span>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Telegram Channel
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
