import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";

interface MaintenanceState {
    maintenance: boolean;
    message: string;
}

const STATUS_URL = `${import.meta.env.VITE_API_URL || ""}/api/__ctrl__/status`;
const POLL_INTERVAL_MS = 15_000;
const DEFAULT_MESSAGE = "The server is temporarily busy, try again later!";

export function MaintenanceGuard({ children }: { children: ReactNode }) {
    const [state, setState] = useState<MaintenanceState>({
        maintenance: false,
        message: "",
    });

    const checkStatus = async () => {
        try {
            const res = await axios.get<MaintenanceState>(STATUS_URL);
            setState(res.data);
        } catch {
            // keep existing state if unreachable
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    if (state.maintenance) {
        const displayMessage = state.message?.trim() || DEFAULT_MESSAGE;

        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
            >
                <div style={{ textAlign: "center", userSelect: "none" }}>
                    {/* 503 */}
                    <div
                        style={{
                            fontSize: "10rem",
                            fontWeight: "700",
                            color: "#333333",
                            lineHeight: 1,
                            marginBottom: "0.5rem",
                        }}
                    >
                        503
                    </div>

                    {/* Service Unavailable */}
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#333333",
                            marginBottom: "0.75rem",
                        }}
                    >
                        Service Unavailable
                    </div>

                    {/* Message */}
                    <div
                        style={{
                            fontSize: "0.875rem",
                            color: "#555555",
                        }}
                    >
                        {displayMessage}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
