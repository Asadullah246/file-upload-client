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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminLayout() {
  const { isAuthenticated, logout, user } = useAuth();

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={classNames(
                  "flex items-center gap-2 hover:bg-muted/50 p-1.5 pr-2 rounded-full transition-colors border border-transparent focus-visible:outline-none",
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 flex flex-col sm:hidden">
                <span className="text-xs text-muted-foreground">
                  Signed in as
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {user?.email}
                </span>
              </div>
              <div className="sm:hidden">
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className="w-full cursor-pointer flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
