import { useState, useEffect } from "react";
import type { FileRecord } from "../services/api";
import { formatDistanceToNow } from "date-fns";
import {
  File,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownToLine,
  HardDrive,
  Copy,
  Check,
  Download,
  ChevronDown,
} from "lucide-react";
import classNames from "classnames";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface FileListProps {
  files: FileRecord[];
  onDelete: (id: string) => Promise<void>;
}

const PROVIDER_META: Record<string, { label: string; icon: string }> = {
  r2: { label: "Cloudflare R2", icon: "☁️" },
  pixeldrain: { label: "Pixeldrain", icon: "💧" },
  idrive: { label: "IDrive e2", icon: "🗄️" },
  vikingfile: { label: "VikingFile", icon: "⚔️" },
  gofile: { label: "GoFile", icon: "🗂️" },
};

/** Infers which providers a completed file has by checking non-null fields. */
function inferProviders(file: FileRecord): string[] {
  const providers: string[] = [];
  if (file.r2Key) providers.push("r2");
  if (file.pixeldrainId) providers.push("pixeldrain");
  if (file.idriveKey) providers.push("idrive");
  if (file.vikingfileId) providers.push("vikingfile");
  if (file.gofileId) providers.push("gofile");
  return providers;
}

/** Download dropdown for a single file row.  */
function DownloadDropdown({ file }: { file: FileRecord }) {
  const apiBase =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    "http://localhost:3000";

  const providers = inferProviders(file);
  const isCompleted = file.status === "COMPLETED";

  // Target providers the file is being uploaded to (from the provider JSON array)
  const targetProviders: string[] = isCompleted
    ? providers
    : (Array.isArray(file.provider)
      ? file.provider.map((p: string) => p.toLowerCase())
      : []);

  // Hide if FAILED, or nothing to show
  if (file.status === "FAILED") return null;
  if (isCompleted && providers.length === 0) return null;
  if (!isCompleted && targetProviders.length === 0 && !file.driveFileId) return null;

  const handleDownload = (provider: string) => {
    if (!isCompleted) {
      // Fallback: proxy through our backend from Google Drive
      const proxyUrl = `${apiBase}/api/download/${file.id}/drive`;
      window.open(proxyUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (provider === "vikingfile") {
      const browseUrl = `https://vikingfile.com/f/${file.vikingfileId}`;
      window.open(browseUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (provider === "pixeldrain") {
      const browseUrl = `https://pixeldrain.com/u/${file.pixeldrainId}`;
      window.open(browseUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (provider === "gofile") {
      const browseUrl = file.gofileUrl;
      if (browseUrl) {
        window.open(browseUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // For other providers, open the proxy URL in a new tab
    const url = `${apiBase}/api/download/${file.id}/proxy?provider=${provider}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Determine which provider list to render in the dropdown
  const displayProviders = isCompleted ? providers : targetProviders;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors flex items-center gap-0.5 outline-none"
          title="Download file"
        >
          <Download className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-md shadow-lg bg-white dark:bg-zinc-900 border border-border py-1 px-0 overflow-hidden z-[9999]"
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Download from
        </DropdownMenuLabel>
        {displayProviders.map((provider) => {
          const meta = PROVIDER_META[provider] || {
            label: provider,
            icon: "📦",
          };
          return (
            <DropdownMenuItem
              key={provider}
              onClick={() => handleDownload(provider)}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted transition-colors flex items-center gap-2 rounded-none cursor-pointer"
            >
              <span>{meta.icon}</span>
              {meta.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Copy-link button with icon-swap feedback (no alert). */
function CopyLinkButton({ fileId }: { fileId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/download/${fileId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={classNames(
        "p-2 rounded-full transition-colors",
        copied
          ? "text-emerald-500 bg-emerald-500/10"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
      )}
      title={copied ? "Copied!" : "Copy download link"}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

const formatSize = (bytes: string | null) => {
  if (!bytes) return "Unknown size";
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024)
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "FAILED":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "DOWNLOADING":
      return <ArrowDownToLine className="h-5 w-5 text-blue-500 animate-pulse" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

function FileRow({ file, onDelete }: { file: FileRecord; onDelete: (id: string) => Promise<void> }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (file.status === "COMPLETED" || file.status === "FAILED") return;
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, [file.status]);

  const createdAtTime = new Date(file.createdAt).getTime();
  const elapsed = now - createdAtTime;

  const isFakeCompleted = elapsed >= 2000;
  const fakeProgress = Math.min(100, (elapsed / 2000) * 100);

  let displayStatus = file.status;
  if (file.status !== "FAILED" && file.status !== "COMPLETED") {
    displayStatus = isFakeCompleted ? "COMPLETED" : "DOWNLOADING";
  }

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">
      <TableCell className="p-0 border-0">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <File className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.originalName || "Unknown file"}
              </p>
              <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <StatusIcon status={displayStatus} />
                  <span className="capitalize">{displayStatus.toLowerCase()}</span>
                </span>
                <span>•</span>
                <span>{formatSize(file.size)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(file.createdAt))} ago</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <CopyLinkButton fileId={file.id} />

              {/* Download from a specific cloud */}
              {file.status === "FAILED" ? (
                <div className="flex items-center text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1.5 rounded-md max-w-sm text-wrap truncate" title={file.error || "Upload failed"}>
                  {file.error || "Upload failed"}
                </div>
              ) : (
                <DownloadDropdown file={file} />
              )}

              {/* Delete */}
              <button
                onClick={() => onDelete(file.id)}
                className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {displayStatus === "DOWNLOADING" && (
            <div className="mt-4 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${fakeProgress}%` }}
              />
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function FileList({ files, onDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border border-dashed">
        <HardDrive className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
        <h3 className="text-sm font-medium text-foreground">No files yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by pasting a Google Drive link above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableBody>
          {files.map((file) => (
            <FileRow key={file.id} file={file} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
