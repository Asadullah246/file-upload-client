import { useEffect, useState } from "react";
import { UploadForm } from "./components/UploadForm";
import { FileList } from "./components/FileList";
import { fileService, type FileRecord } from "./services/api";
import { CloudLightning } from "lucide-react";

function App() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const data = await fileService.getFiles();
      setFiles(data);
    } catch (err: any) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();

    // Poll for updates every 3 seconds if any file is PENDING or DOWNLOADING
    const interval = setInterval(() => {
      setFiles((currentFiles) => {
        const needsUpdate = currentFiles.some(
          (f) => f.status === "PENDING" || f.status === "DOWNLOADING",
        );
        if (needsUpdate) {
          fetchFiles();
        }
        return currentFiles;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleUploadStart = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileService.uploadFile(url);
      await fetchFiles(); // Refresh list immediately to show PENDING state
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to start upload",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      await fetchFiles();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete file");
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <CloudLightning className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Cloudflare R2 Bridge
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Directly stream massive files from Google Drive to your S3 bucket
            without using local storage.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <UploadForm onUploadStart={handleUploadStart} isLoading={isLoading} />
          <FileList files={files} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

export default App;
