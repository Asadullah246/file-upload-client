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
} from "lucide-react";
import classNames from "classnames";

interface FileListProps {
  files: FileRecord[];
  onDelete: (id: string) => Promise<void>;
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

  const formatSize = (bytes: string | null) => {
    if (!bytes) return "Unknown size";
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024)
      return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const StatusIcon = ({ status }: { status: FileRecord["status"] }) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "DOWNLOADING":
        return (
          <ArrowDownToLine className="h-5 w-5 text-blue-500 animate-pulse" />
        );
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
      <ul className="divide-y divide-border">
        {files.map((file) => (
          <li key={file.id} className="p-4 hover:bg-muted/30 transition-colors">
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
                    <StatusIcon status={file.status} />
                    <span className="capitalize">
                      {file.status.toLowerCase()}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{formatSize(file.size)}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(file.createdAt))} ago
                  </span>
                </div>
              </div>
              <div>
                <button
                  onClick={() => {
                    const downloadUrl = `${window.location.origin}/download/${file.id}`;
                    navigator.clipboard.writeText(downloadUrl);
                    alert("Public download link copied to clipboard!");
                  }}
                  className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors mr-2 text-sm"
                  title="Copy download link"
                >
                  <File className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {(file.status === "DOWNLOADING" || file.status === "PENDING") && (
              <div className="mt-4 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className={classNames(
                    "bg-primary h-1.5 rounded-full transition-all duration-300",
                    file.status === "PENDING"
                      ? "w-full animate-pulse bg-primary/40"
                      : "",
                  )}
                  style={{
                    width:
                      file.status === "DOWNLOADING"
                        ? `${file.progress}%`
                        : undefined,
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
