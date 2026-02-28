import { useState, useRef, useEffect } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Settings as SettingsIcon,
  CloudLightning,
  User,
  ChevronDown,
} from "lucide-react";
import classNames from "classnames";

export function AdminLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo / Brand linking back to dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CloudLightning className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Storage Bridge
            </span>
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={classNames(
                "flex items-center gap-2 hover:bg-muted/50 p-1.5 pr-2 rounded-full transition-colors border border-transparent",
                dropdownOpen && "bg-muted/50 border-border",
              )}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground hidden sm:block max-w-[150px] truncate">
                {user?.email}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover border border-border py-1">
                <div className="px-4 py-2 flex flex-col sm:hidden border-b border-border mb-1">
                  <span className="text-xs text-muted-foreground">
                    Signed in as
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {user?.email}
                  </span>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Profile Settings
                </Link>

                <div className="h-px bg-border my-1" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
