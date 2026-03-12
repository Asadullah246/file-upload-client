import { useState } from "react";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import type { FileDetails } from "../pages/Download";

interface DebugPanelProps {
  fileDetails: FileDetails;
  isCached: boolean;
}

const STATUS_EMOJI: Record<string, string> = {
  PENDING: "🕐",
  DOWNLOADING: "⬇️",
  UPLOADING: "☁️",
  COMPLETED: "✅",
  FAILED: "❌",
};

const PROVIDER_LABELS: Record<string, string> = {
  gofile: "GoFile",
  pixeldrain: "Pixeldrain",
  vikingfile: "VikingFile",
  idrive: "iDrive",
  r2: "Cloudflare R2",
};

export function DebugPanel({ fileDetails, isCached }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const statusEmoji = STATUS_EMOJI[fileDetails.status] || "❓";

  return (
    <div className="mt-6 border border-green-500/30 rounded-lg bg-green-950/20 overflow-hidden text-xs font-mono">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-green-950/40 hover:bg-green-950/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400 font-semibold text-xs">
            DEBUG PANEL
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-green-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-3 py-3 space-y-3">
          {/* File Info */}
          <div>
            <div className="text-green-400/70 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>File Info</div>
            <div className="space-y-0.5 text-muted-foreground">
              <Row label="ID" value={fileDetails.id} />
              <Row label="Name" value={fileDetails.originalName || "—"} />
              <Row label="Size" value={fileDetails.size ? `${(Number(fileDetails.size) / (1024 * 1024)).toFixed(2)} MB` : "—"} />
              <Row label="MIME" value={fileDetails.mimeType || "—"} />
              <Row label="Drive ID" value={fileDetails.driveFileId || "—"} />
            </div>
          </div>

          {/* Overall Status */}
          <div>
            <div className="text-green-400/70 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Status</div>
            <div className="space-y-0.5 text-muted-foreground">
              <Row
                label="Status"
                value={`${statusEmoji} ${fileDetails.status}`}
                highlight={fileDetails.status === "FAILED" ? "red" : fileDetails.status === "COMPLETED" ? "green" : "yellow"}
              />
              <Row label="Progress" value={`${fileDetails.progress ?? 0}%`} />
              <Row
                label="Cache"
                value={isCached ? "✅ Cached on server" : "❌ Not cached"}
                highlight={isCached ? "green" : "red"}
              />
            </div>
          </div>

          {/* Per-Provider Status */}
          <div>
            <div className="text-green-400/70 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Cloud Uploads</div>
            <div className="space-y-0.5">
              {fileDetails.targetProviders.length === 0 ? (
                <span className="text-muted-foreground">No target providers</span>
              ) : (
                fileDetails.targetProviders.map((provider) => {
                  const isDone = fileDetails.providers[provider as keyof typeof fileDetails.providers] ?? false;
                  const label = PROVIDER_LABELS[provider] || provider;
                  return (
                    <Row
                      key={provider}
                      label={label}
                      value={isDone ? "✅ Uploaded" : (fileDetails.status === "UPLOADING" ? "⏳ Uploading..." : fileDetails.status === "COMPLETED" ? "⚠️ Skipped/Failed" : "🕐 Waiting")}
                      highlight={isDone ? "green" : fileDetails.status === "UPLOADING" ? "yellow" : undefined}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Download Sources */}
          <div>
            <div className="text-green-400/70 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Download Sources Available</div>
            <div className="space-y-0.5 text-muted-foreground">
              <Row label="Server Cache" value={isCached ? "✅ Ready" : "❌ No"} highlight={isCached ? "green" : "red"} />
              <Row label="Google Drive" value={fileDetails.driveFileId ? "✅ Available" : "❌ No"} highlight={fileDetails.driveFileId ? "green" : "red"} />
              {Object.entries(fileDetails.providers).map(([provider, available]) => (
                <Row
                  key={provider}
                  label={PROVIDER_LABELS[provider] || provider}
                  value={available ? "✅ Ready" : "❌ Not ready"}
                  highlight={available ? "green" : "red"}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "red" | "yellow" }) {
  const colorClass = highlight === "green"
    ? "text-green-400"
    : highlight === "red"
      ? "text-red-400"
      : highlight === "yellow"
        ? "text-yellow-400"
        : "text-muted-foreground";

  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground/60 flex-shrink-0">{label}</span>
      <span className={`${colorClass} truncate text-right`}>{value}</span>
    </div>
  );
}
