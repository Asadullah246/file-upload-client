import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export interface FileRecord {
  id: string;
  driveFileId: string | null;
  originalName: string | null;
  size: string | null;
  mimeType: string | null;
  status: "PENDING" | "DOWNLOADING" | "COMPLETED" | "FAILED";
  error: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  // Provider storage identifiers (null if not hosted on that provider)
  r2Key: string | null;
  pixeldrainId: string | null;
  idriveKey: string | null;
  vikingfileId: string | null;
  gofileId: string | null;
  gofileUrl: string | null;
  provider: string[]; // target providers the file is being uploaded to
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
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error(
        `[Frontend API] Login failed`,
        err.response?.data || err.message,
      );
      throw error;
    }
  },

  updateCredentials: async (newEmail?: string, newPassword?: string) => {
    try {
      const response = await api.put("/api/auth/update", {
        newEmail,
        newPassword,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      throw new Error(
        err.response?.data?.error ||
        err.message ||
        "Failed to update credentials",
      );
    }
  },

  getFiles: async (): Promise<FileRecord[]> => {
    const response = await api.get("/files");
    return response.data;
  },

  /**
   * Fetches file metadata and available download providers.
   * Returns { id, originalName, mimeType, size, providers: { r2?, pixeldrain?, idrive?, vikingfile? } }
   */
  getDownloadInfo: async (id: string) => {
    const response = await api.get(`/api/download/${id}`);
    return response.data;
  },

  /**
   * Fetches a zero-bandwidth direct download URL for the given provider.
   */
  getDirectUrl: async (
    id: string,
    provider: string,
  ): Promise<{ url: string }> => {
    const response = await api.get(
      `/api/download/${id}/direct-url?provider=${provider}`,
    );
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};

export interface CredentialRecord {
  id: string;
  provider: string;
  enabled: boolean;
  config: Record<string, string>;
  updatedAt: string;
}

export const credentialService = {
  getAll: async (): Promise<CredentialRecord[]> => {
    const response = await api.get("/api/credentials");
    console.log("response", response.data);
    return response.data;
  },

  update: async (
    provider: string,
    enabled: boolean,
    config: Record<string, string>,
  ): Promise<CredentialRecord> => {
    const response = await api.put(`/api/credentials/${provider}`, {
      enabled,
      config,
    });
    return response.data;
  },
};

export const settingsService = {
  /**
   * Public — used by the Download page to fetch ad codes and telegram link.
   */
  getPublicSettings: async (): Promise<Record<string, string>> => {
    const response = await api.get("/api/settings");
    return response.data;
  },

  /**
   * Admin-only — saves all app settings at once.
   */
  updateSettings: async (settings: Record<string, string>): Promise<void> => {
    await api.put("/api/settings", { settings });
  },
};
