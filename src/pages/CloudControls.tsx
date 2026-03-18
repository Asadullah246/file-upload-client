import { useEffect, useState } from "react";
import { Cloud, Save, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { credentialService, type CredentialRecord } from "../services/api";
import classNames from "classnames";

/* ─── Provider definitions ──────────────────────────────────────────── */

interface FieldDef {
    key: string;
    label: string;
    placeholder?: string;
    secret?: boolean;
}

interface ProviderDef {
    key: string;
    label: string;
    icon: string;
    color: string;
    description: string;
    fields: FieldDef[];
}

const PROVIDERS: ProviderDef[] = [
    {
        key: "IDRIVE",
        label: "IDrive e2",
        icon: "🗄️",
        color: "border-green-500/40 bg-green-500/5",
        description: "S3-compatible object storage by IDrive.",
        fields: [
            { key: "endpoint", label: "Endpoint", placeholder: "s3.region.idrivee2.com" },
            { key: "region", label: "Region", placeholder: "eu-west-3" },
            { key: "accessKeyId", label: "Access Key ID", placeholder: "AKIAIOSFODNN7EXAMPLE" },
            { key: "secretAccessKey", label: "Secret Access Key", placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", secret: true },
            { key: "bucketName", label: "Bucket Name", placeholder: "my-bucket-name" },
        ],
    },
    {
        key: "PIXELDRAIN",
        label: "Pixeldrain",
        icon: "💧",
        color: "border-blue-500/40 bg-blue-500/5",
        description: "Fast free file hosting with API access.",
        fields: [
            { key: "apiKey", label: "API Key", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", secret: true },
        ],
    },
    {
        key: "VIKINGFILE",
        label: "VikingFile",
        icon: "⚔️",
        color: "border-purple-500/40 bg-purple-500/5",
        description: "Unlimited file hosting via VikingFile.",
        fields: [
            { key: "userHash", label: "User Hash", placeholder: "AbCdEfGhIj", secret: true },
        ],
    },
    {
        key: "GOFILE",
        label: "GoFile",
        icon: "🗂️",
        color: "border-indigo-500/40 bg-indigo-500/5",
        description: "GoFile cloud storage with streaming support.",
        fields: [
            { key: "token", label: "API Token", placeholder: "aBcDeFgHiJkLmNoPqRsTuVwX", secret: true },
            { key: "accountId", label: "Account ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
            { key: "folderId", label: "Public Folder ID", placeholder: "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy" },
        ],
    },
    {
        key: "R2",
        label: "Cloudflare R2",
        icon: "☁️",
        color: "border-orange-500/40 bg-orange-500/5",
        description: "Cloudflare R2 object storage (S3 compatible).",
        fields: [
            { key: "accountId", label: "Account ID", placeholder: "1234abcd5678efgh90ijklmn" },
            { key: "accessKeyId", label: "Access Key ID", placeholder: "AKIAIOSFODNN7EXAMPLE" },
            { key: "secretAccessKey", label: "Secret Access Key", placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", secret: true },
            { key: "bucketName", label: "Bucket Name", placeholder: "my-r2-bucket" },
        ],
    },
];

/* ─── Toggle Switch ─────────────────────────────────────────────────── */

function Toggle({
    enabled,
    onChange,
    disabled,
}: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            title={disabled ? "Fill in credentials first to enable" : undefined}
            className={classNames(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                enabled ? "bg-primary" : "bg-muted",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
            )}
        >
            <span
                className={classNames(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    enabled ? "translate-x-6" : "translate-x-1",
                )}
            />
        </button>
    );
}

/* ─── ProviderCard ──────────────────────────────────────────────────── */

function ProviderCard({
    def,
    initial,
    onSave,
}: {
    def: ProviderDef;
    initial?: CredentialRecord;
    onSave: (enabled: boolean, config: Record<string, string>) => Promise<CredentialRecord>;
}) {
    const [enabled, setEnabled] = useState(initial?.enabled ?? false);
    const [config, setConfig] = useState<Record<string, string>>(
        initial?.config ?? {},
    );
    const [expanded, setExpanded] = useState(false);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState("");

    /** All required fields are non-empty */
    const hasAllFields = def.fields.every((f) => (config[f.key] ?? "").trim() !== "");

    const handleToggle = async (val: boolean) => {
        if (val && !hasAllFields) {
            setExpanded(true); // open the card so user can fill fields
            return;
        }
        setEnabled(val);
        // Immediately persist the enabled/disabled state to the DB
        try {
            await onSave(val, config);
        } catch {
            // revert on failure
            setEnabled(!val);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        def.fields.forEach((f) => {
            if (!(config[f.key] ?? "").trim()) {
                newErrors[f.key] = `${f.label} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        setSaveError("");
        setSuccess(false);
        try {
            const updated = await onSave(true, config); // auto-enable on successful save
            setEnabled(true);
            setConfig(updated.config);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setSaveError(e?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (key: string) =>
        setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div
            className={classNames(
                "rounded-xl border-2 transition-all duration-200",
                def.color,
                enabled ? "shadow-md" : "opacity-80",
            )}
        >
            {/* Header row */}
            <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{def.icon}</span>
                    <div>
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            {def.label}
                            {enabled && (
                                <span className="text-xs font-normal px-2 py-0.5 bg-emerald-500/15 text-emerald-600 rounded-full border border-emerald-500/30">
                                    Active
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-muted-foreground">{def.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Toggle
                        enabled={enabled}
                        onChange={handleToggle}
                        disabled={!hasAllFields && !enabled}
                    />
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground"
                    >
                        {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Credential fields */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    {def.fields.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {field.label}
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        field.secret && !showSecrets[field.key]
                                            ? "password"
                                            : "text"
                                    }
                                    value={config[field.key] ?? ""}
                                    placeholder={field.placeholder}
                                    onChange={(e) => {
                                        setConfig((prev) => ({ ...prev, [field.key]: e.target.value }));
                                        if (errors[field.key]) {
                                            setErrors((prev) => { const n = { ...prev }; delete n[field.key]; return n; });
                                        }
                                    }}
                                    className={classNames(
                                        "w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10",
                                        errors[field.key] ? "border-destructive" : "border-input",
                                    )}
                                />
                                {field.secret && (
                                    <button
                                        type="button"
                                        onClick={() => toggleSecret(field.key)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showSecrets[field.key] ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                            {errors[field.key] && (
                                <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>
                            )}
                        </div>
                    ))}

                    {saveError && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                            {saveError}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded">
                            ✓ Saved & provider activated!
                        </p>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={classNames(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                                saving ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90",
                            )}
                        >
                            {saving ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save & Enable {def.label}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export function CloudControls() {
    const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        credentialService
            .getAll()
            .then(setCredentials)
            .finally(() => setLoading(false));
    }, []);

    const handleSave =
        (provider: string) =>
            async (enabled: boolean, config: Record<string, string>): Promise<CredentialRecord> => {
                const updated = await credentialService.update(provider, enabled, config);
                setCredentials((prev) => {
                    const exists = prev.find((c) => c.provider === provider);
                    if (exists) return prev.map((c) => (c.provider === provider ? updated : c));
                    return [...prev, updated];
                });
                return updated;
            };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <Cloud className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        Cloud Controls
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
                        Enable or disable cloud providers and manage their credentials. All fields are required to enable a provider.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {PROVIDERS.map((def) => (
                            <ProviderCard
                                key={def.key}
                                def={def}
                                initial={credentials.find((c) => c.provider === def.key)}
                                onSave={handleSave(def.key)}
                            />
                        ))}
                    </div>
                )}

                <p className="mt-8 text-xs text-center text-muted-foreground">
                    Changes take effect immediately on the next upload. Credentials are
                    stored securely in the database.
                </p>
            </div>
        </div>
    );
}
