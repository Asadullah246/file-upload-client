import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export interface FileRecord {
  id: string;
  originalName: string | null;
  r2Key: string | null;
  size: string | null;
  mimeType: string | null;
  status: "PENDING" | "DOWNLOADING" | "COMPLETED" | "FAILED";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export const fileService = {
  uploadFile: async (url: string): Promise<FileRecord> => {
    const response = await api.post("/files/upload", { url });
    return response.data.file;
  },

  login: async (email: string, password: string) => {
    console.log(`[Frontend API] Attempting login for: ${email}`);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      console.log(`[Frontend API] Login successful`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: any }; message?: string };
      console.error(
        `[Frontend API] Login failed`,
        err.response?.data || err.message,
      );
      throw error;
    }
  },

  getFiles: async (): Promise<FileRecord[]> => {
    const response = await api.get("/files");
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};
