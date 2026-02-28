import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Settings as SettingsIcon } from "lucide-react";

export function AdminLayout() {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border px-4 py-3 flex justify-between items-center">
        <div className="font-semibold text-lg text-foreground">
          Admin Dashboard
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              {user?.email}
            </span>
            <Link
              to="/settings"
              className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </Link>
          </div>
          <button
            onClick={logout}
            className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
