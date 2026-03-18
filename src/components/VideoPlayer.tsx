import { useRef, useState } from "react";
import { Play, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  fileName: string;
}

export function VideoPlayer({ videoUrl, fileName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleError = () => {
    const video = videoRef.current;
    if (video?.error) {
      const errorMessages: Record<number, string> = {
        1: "Video loading was aborted",
        2: "Network error while loading video",
        3: "Video decoding failed — this format may not be supported by your browser",
        4: "Video format not supported by your browser",
      };
      setError(errorMessages[video.error.code] || "Unknown video error");
    } else {
      setError("Failed to load video — format may not be supported");
    }
  };

  return (
    <div className="mb-6 rounded-lg overflow-hidden border border-border bg-black shadow-lg">
      {error ? (
        <div className="flex items-center justify-center gap-2 p-6 text-sm text-red-400 bg-black">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full max-h-[400px]"
          controls
          preload="metadata"
          playsInline
          controlsList="nodownload"
          onError={handleError}
          src={videoUrl}
        />
      )}
      <div className="bg-card px-3 py-2 flex items-center gap-2 border-t border-border">
        <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs text-muted-foreground truncate">
          {fileName}
        </span>
      </div>
    </div>
  );
}
