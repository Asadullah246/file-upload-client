import { useState } from "react";
import { Upload, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadFormProps {
  onUploadStart: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function UploadForm({ onUploadStart, isLoading }: UploadFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    await onUploadStart(url);
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex space-x-3 mb-8">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="url"
          required
          placeholder="Paste Google Drive public link here..."
          className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="flex items-center justify-center px-6 py-3 h-auto border border-transparent text-base font-medium rounded-lg shadow-sm transition-all"
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
        ) : (
          <Upload className="h-5 w-5 mr-2" />
        )}
        Transfer
      </Button>
    </form>
  );
}
