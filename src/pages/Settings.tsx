import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fileService, settingsService } from "../services/api";
import {
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Megaphone,
  Send,
} from "lucide-react";
import classNames from "classnames";

export function Settings() {
  const { user, login } = useAuth();

  // ── Profile form state ──────────────────────────────────────────────────────
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // ── App Settings state ──────────────────────────────────────────────────────
  const [adSlot1, setAdSlot1] = useState("");
  const [adSlot2, setAdSlot2] = useState("");
  const [adSlot3, setAdSlot3] = useState("");
  const [adGlobalScript, setAdGlobalScript] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState("");
  const [appSuccess, setAppSuccess] = useState("");
  const [appSettingsFetched, setAppSettingsFetched] = useState(false);

  // Load current app settings on mount
  useEffect(() => {
    settingsService.getPublicSettings().then((settings) => {
      setAdSlot1(settings["ad_slot_1"] || "");
      setAdSlot2(settings["ad_slot_2"] || "");
      setAdSlot3(settings["ad_slot_3"] || "");
      setAdGlobalScript(settings["ad_global_script"] || "");
      setTelegramLink(settings["telegram_link"] || "");
      setDirectLink(settings["direct_link"] || "");
      setAppSettingsFetched(true);
    });
  }, []);

  // ── Profile submit ──────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    if (!email && !password) {
      setProfileError("Please provide an email or a new password to update.");
      setProfileLoading(false);
      return;
    }

    try {
      const result = await fileService.updateCredentials(
        email !== user?.email ? email : undefined,
        password || undefined,
      );
      setProfileSuccess("Profile updated successfully!");
      if (result.user) {
        login(localStorage.getItem("admin_token") || "", result.user);
      }
      setPassword("");
    } catch (err: unknown) {
      const errObj = err as Error;
      setProfileError(errObj.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── App Settings submit ─────────────────────────────────────────────────────
  const handleAppSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppLoading(true);
    setAppError("");
    setAppSuccess("");
    try {
      await settingsService.updateSettings({
        ad_slot_1: adSlot1,
        ad_slot_2: adSlot2,
        ad_slot_3: adSlot3,
        ad_global_script: adGlobalScript,
        telegram_link: telegramLink,
        direct_link: directLink,
      });
      setAppSuccess("App settings saved successfully!");
    } catch (err: unknown) {
      const errObj = err as Error;
      setAppError(errObj.message || "Failed to save app settings.");
    } finally {
      setAppLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* ── Page header ── */}
        <div className="text-center">
          <SettingsIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Admin Settings
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Manage your profile and app-wide configurations.
          </p>
        </div>

        {/* ── Profile credentials card ── */}
        <div className="bg-card shadow-sm rounded-lg border border-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Profile Credentials
          </h2>
          <form className="space-y-6 max-w-md mx-auto" onSubmit={handleProfileSubmit}>
            {profileError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                {profileSuccess}
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
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum 6 characters if you decide to change it.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className={classNames(
                  "flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  profileLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90",
                )}
              >
                {profileLoading ? (
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

        {/* ── App Settings card ── */}
        <div className="bg-card shadow-sm rounded-lg border border-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Ads &amp; App Settings
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Paste full ad embed codes (HTML/JS) for each slot. Leave empty to disable that ad.
          </p>

          {!appSettingsFetched ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleAppSettingsSubmit}>
              {appError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {appError}
                </div>
              )}
              {appSuccess && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  {appSuccess}
                </div>
              )}

              {/* ── Example embed code hint ── */}
              <div className="rounded-md border border-border bg-muted/40 p-4 text-sm space-y-2">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  💡 <span>Example — what to paste in each ad slot:</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Get the embed code from your ad network (e.g. Google AdSense, Media.net) and paste it as-is. Both HTML and JavaScript are supported.
                </p>

                {/* Google AdSense example */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Google AdSense example:
                  </p>
                  <pre className="text-xs bg-background border border-border rounded p-3 overflow-x-auto text-foreground whitespace-pre-wrap break-all leading-relaxed">
                    {`<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                  </pre>
                </div>

                {/* Generic banner example */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Generic banner / custom ad example:
                  </p>
                  <pre className="text-xs bg-background border border-border rounded p-3 overflow-x-auto text-foreground whitespace-pre-wrap break-all leading-relaxed">
                    {`<a href="https://example.com" target="_blank" rel="noopener">
  <img src="https://example.com/banner.png"
       alt="Advertisement" width="728" height="90" />
</a>`}
                  </pre>
                </div>
              </div>

              {/* ── Global Ad Loader Script ── */}
              <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-md p-4 space-y-2">
                <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>Global Ad Loader Script <span className="text-amber-600 font-normal">(load once — required for AdSense)</span></span>
                </label>
                <p className="text-xs text-muted-foreground">
                  For <strong>Google AdSense</strong>, paste the main loader <code className="bg-muted px-1 rounded">&lt;script&gt;</code> tag here. It is injected into the page <code className="bg-muted px-1 rounded">&lt;head&gt;</code> once — you do NOT need to repeat it in every slot below.
                </p>
                <pre className="text-xs bg-background border border-border rounded p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all leading-relaxed">
                  {`<!-- Example AdSense global loader (paste YOUR publisher ID) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`}
                </pre>
                <textarea
                  rows={3}
                  value={adGlobalScript}
                  onChange={(e) => setAdGlobalScript(e.target.value)}
                  placeholder={`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm font-mono text-xs bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary resize-y"
                />
              </div>

              {/* Ad Slot 1 */}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  🔼 Ad Slot 1 — <span className="text-muted-foreground font-normal">Above download buttons</span>
                </label>
                <textarea
                  rows={4}
                  value={adSlot1}
                  onChange={(e) => setAdSlot1(e.target.value)}
                  placeholder="Paste your ad embed code here..."
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm font-mono text-xs bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary resize-y"
                />
              </div>

              {/* Ad Slot 2 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  🔽 Ad Slot 2 — <span className="text-muted-foreground font-normal">Below download buttons</span>
                </label>
                <textarea
                  rows={4}
                  value={adSlot2}
                  onChange={(e) => setAdSlot2(e.target.value)}
                  placeholder="Paste your ad embed code here..."
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm font-mono text-xs bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary resize-y"
                />
              </div>

              {/* Ad Slot 3 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  📌 Ad Slot 3 — <span className="text-muted-foreground font-normal">Between file info and buttons</span>
                </label>
                <textarea
                  rows={4}
                  value={adSlot3}
                  onChange={(e) => setAdSlot3(e.target.value)}
                  placeholder="Paste your ad embed code here..."
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm font-mono text-xs bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary resize-y"
                />
              </div>

              {/* Direct Popunder Link */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Direct Link (Popunder Ad)
                </label>
                <input
                  type="url"
                  value={directLink}
                  onChange={(e) => setDirectLink(e.target.value)}
                  placeholder="https://www.effectivegatecpm.com/...?"
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  If set, clicking any download button will first open this link in a new tab for 2 clicks before allowing the actual download on the 3rd click.
                </p>
              </div>

              {/* Telegram Link */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-primary" />
                  Telegram Channel Link
                </label>
                <input
                  type="url"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/yourchannel"
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Shown as a Telegram icon link in the download page footer. Leave empty to hide.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={appLoading}
                  className={classNames(
                    "flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    appLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90",
                  )}
                >
                  {appLoading ? (
                    "Saving..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save App Settings
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
