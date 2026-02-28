import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fileService } from "../services/api";
import { Settings as SettingsIcon, Save, Eye, EyeOff } from "lucide-react";
import classNames from "classnames";

export function Settings() {
  const { user, login } = useAuth();

  // State for the form
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!email && !password) {
      setError("Please provide an email or a new password to update.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await fileService.updateCredentials(
        email !== user?.email ? email : undefined,
        password || undefined,
      );

      setSuccess("Profile updated successfully!");
      // If the backend returns a new token, we should update it.
      // Current behavior in AuthContext assumes we just set user details.
      // But updateCredentials returns { message, user }. Let's update context.
      // Easiest is to force a re-login using the existing token if it didn't change,
      // or just refresh the page.
      if (result.user) {
        // Optionally update context user here if login function permits passing token again:
        login(localStorage.getItem("admin_token") || "", result.user);
      }
      setPassword(""); // Clear password field after update
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <SettingsIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Admin Settings
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Update your admin profile credentials.
          </p>
        </div>

        <div className="bg-card shadow-sm rounded-lg border border-border p-6 sm:p-8">
          <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm mb-4 flex items-center gap-2">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                New Password (Optional)
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Leave blank to keep current password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                Minimum 6 characters if you decide to change it.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={classNames(
                  "flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/90",
                )}
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
