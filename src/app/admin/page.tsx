"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  BookOpen, 
  ShieldCheck, 
  Map, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Layers,
  Globe,
  Monitor,
  Check,
  Settings,
  User,
  Smartphone,
  KeyRound,
  History,
  AlertCircle
} from "lucide-react";

// Tab types
type Tab = "analytics" | "heatmap" | "blogs" | "security" | "settings";

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "Enter password", color: "bg-neutral-800" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  if (pwd.length >= 12) score += 1;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 3) return { score, label: "Medium", color: "bg-amber-500" };
  return { score, label: "Strong", color: "bg-success" };
}

export default function AdminDashboardPage() {
  // Auth state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authStep, setAuthStep] = useState<"login" | "setup" | "otp" | "dashboard">("login");
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Settings States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoInput, setProfilePhotoInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  
  // Settings Status Indicators
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Heatmap Selection
  const [heatmapUrl, setHeatmapUrl] = useState("/");
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Blog CMS Form State
  const [blogId, setBlogId] = useState<string | null>(null); // null means create new
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Webcam Help");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogStatus, setBlogStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [blogPublishDate, setBlogPublishDate] = useState("");
  const [blogColor, setBlogColor] = useState("bg-indigo-500/10 text-indigo-500");
  const [blogImageUrl, setBlogImageUrl] = useState("");
  const [cmsError, setCmsError] = useState("");
  const [cmsSuccess, setCmsSuccess] = useState("");
  const [cmsLoading, setCmsLoading] = useState(false);
  const [showEditorForm, setShowEditorForm] = useState(false);
  const [cmsMode, setCmsMode] = useState<"create" | "edit">("create");

  // Check login state on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/blog", { method: "GET" });
        if (res.ok) {
          setAuthStep("dashboard");
          loadDashboardData();
        }
      } catch (e) {
        // ignore
      }
    };
    checkSession();
  }, []);

  // Fetch settings data from API
  const loadSettingsData = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.admin.name || "");
        setProfileEmail(data.admin.username || "");
        setProfilePhoto(data.admin.profilePhoto || "");
        setProfilePhotoInput(data.admin.profilePhoto || "");
        setEmailVerified(data.admin.emailVerified !== false);
        setTwoFactorEnabled(data.admin.twoFactorEnabled === true);
        setActiveSessions(data.activeSessions || []);
        setLoginHistory(data.loginHistory || []);
        setAuditLogs(data.auditLogs || []);
        setSecurityAlerts(data.securityAlerts || []);
      }
    } catch (e) {
      console.error("Failed to load settings telemetry:", e);
    }
  };

  // Fetch Dashboard Stats and blogs
  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      // 1. Fetch blogs
      const blogRes = await fetch("/api/admin/blog");
      if (blogRes.ok) {
        const blogs = await blogRes.json();
        setBlogsList(blogs);
      }

      // 2. Fetch analytics (default URL filter empty)
      const analyticsRes = await fetch(`/api/admin/analytics/dashboard?url=${encodeURIComponent(heatmapUrl)}`);
      if (analyticsRes.ok) {
        const analytics = await analyticsRes.json();
        setAnalyticsData(analytics);
      }

      // 3. Fetch settings and logs
      await loadSettingsData();
    } catch (e) {
      console.error("Failed to load dashboard metrics:", e);
    } finally {
      setLoadingDashboard(false);
    }
  };
  // Settings: Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");
    setSettingsLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          name: profileName,
          username: profileEmail,
          profilePhoto: profilePhotoInput
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSettingsSuccess("Profile settings updated successfully!");
        setProfilePhoto(profilePhotoInput);
        await loadSettingsData(); // refresh settings logs
      } else {
        setSettingsError(data.error || "Failed to update profile settings.");
      }
    } catch (err) {
      setSettingsError("Connection error saving profile changes.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Settings: Change account password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (newPassword !== confirmPassword) {
      setSettingsError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setSettingsError("New password must be at least 8 characters.");
      return;
    }

    setSettingsLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          oldPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSettingsSuccess("Password updated successfully! Other sessions revoked.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await loadSettingsData(); // refresh active sessions lists
      } else {
        setSettingsError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setSettingsError("Connection error updating password.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Settings: Deactivate 2FA setup
  const handleDeactivate2FA = async () => {
    const passwordConfirm = prompt("Please confirm your password to deactivate Google Authenticator 2FA:");
    if (!passwordConfirm) return;

    setSettingsError("");
    setSettingsSuccess("");
    setSettingsLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_2fa",
          password: passwordConfirm
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSettingsSuccess("2FA has been successfully deactivated.");
        setTwoFactorEnabled(false);
        await loadSettingsData(); // refresh
      } else {
        setSettingsError(data.error || "Failed to deactivate 2FA.");
      }
    } catch (err) {
      setSettingsError("Connection error resetting 2FA config.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Settings: Revoke single device session
  const handleRevokeSession = async (tokenHash: string) => {
    if (!confirm("Are you sure you want to end this login session?")) return;

    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch(`/api/admin/settings?tokenHash=${tokenHash}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSettingsSuccess("Device session revoked successfully.");
        await loadSettingsData(); // refresh list
      } else {
        const data = await res.json();
        setSettingsError(data.error || "Failed to revoke session.");
      }
    } catch (err) {
      setSettingsError("Connection error revoking device session.");
    }
  };

  // Settings: Revoke all other device sessions
  const handleRevokeAllSessions = async () => {
    if (!confirm("Are you sure you want to log out from all other devices?")) return;

    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch("/api/admin/settings?all=true", {
        method: "DELETE"
      });

      if (res.ok) {
        setSettingsSuccess("All other active device sessions revoked.");
        await loadSettingsData(); // refresh list
      } else {
        const data = await res.json();
        setSettingsError(data.error || "Failed to revoke sessions.");
      }
    } catch (err) {
      setSettingsError("Connection error revoking sessions.");
    }
  };

  // Settings: Dismiss security alert warning
  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dismiss_alert",
          alertId
        })
      });

      if (res.ok) {
        await loadSettingsData(); // reload alerts list
      }
    } catch (err) {
      console.error("Failed to dismiss security warning:", err);
    }
  };
  // Trigger reload on heatmapUrl changes
  useEffect(() => {
    if (authStep === "dashboard") {
      const reloadHeatmap = async () => {
        try {
          const res = await fetch(`/api/admin/analytics/dashboard?url=${encodeURIComponent(heatmapUrl)}`);
          if (res.ok) {
            const data = await res.json();
            setAnalyticsData((prev: any) => prev ? { ...prev, heatmapClicks: data.heatmapClicks } : data);
          }
        } catch (e) {
          // ignore
        }
      };
      reloadHeatmap();
    }
  }, [heatmapUrl, authStep]);

  // Redraw Heatmap click points on canvas
  useEffect(() => {
    if (activeTab === "heatmap" && analyticsData?.heatmapClicks && heatmapCanvasRef.current) {
      const canvas = heatmapCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear previous drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const clicks = analyticsData.heatmapClicks;
        
        // Draw click clusters
        clicks.forEach((click: any) => {
          const px = (click.x / 100) * canvas.width;
          const py = (click.y / 100) * canvas.height;

          // Drawing glowing heat circle
          const grad = ctx.createRadialGradient(px, py, 1, px, py, 12);
          grad.addColorStop(0, "rgba(255, 69, 58, 0.95)"); // Dark red core
          grad.addColorStop(0.3, "rgba(255, 159, 10, 0.6)"); // Orange ring
          grad.addColorStop(0.7, "rgba(255, 214, 10, 0.2)"); // Yellow blur
          grad.addColorStop(1, "rgba(255, 214, 10, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }
  }, [activeTab, analyticsData, heatmapUrl]);

  // Auth: Step 1 Submit Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.step === "otp") {
          setAuthStep("otp");
        } else if (data.step === "setup") {
          setQrCode(data.qrCode);
          setSecretKey(data.secret);
          setAuthStep("setup");
        } else {
          setAuthError("Unsupported authentication step");
        }
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (e) {
      setAuthError("Failed to connect to authentication backend");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Step 2 Submit OTP Verification
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp: otpCode })
      });

      const data = await res.json();

      if (res.ok) {
        setAuthStep("dashboard");
        loadDashboardData();
      } else {
        setAuthError(data.error || "Invalid verification code");
      }
    } catch (e) {
      setAuthError("Failed to verify OTP code");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthStep("login");
      setUsername("");
      setPassword("");
      setOtpCode("");
      setAnalyticsData(null);
      setBlogsList([]);
    } catch (e) {
      // ignore
    }
  };

  // CMS: Delete post
  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogsList((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      alert("Failed to delete blog post");
    }
  };

  // CMS: Load form for editing
  const handleEditBlogClick = (blog: any) => {
    setBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogCategory(blog.category);
    setBlogExcerpt(blog.excerpt);
    setBlogContent(blog.content);
    setBlogStatus(blog.status);
    setBlogColor(blog.color);
    setBlogImageUrl(blog.imageUrl);
    // Convert ISO to datetime-local string
    if (blog.publishedAt) {
      const d = new Date(blog.publishedAt);
      const tzoffset = d.getTimezoneOffset() * 60000; 
      const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
      setBlogPublishDate(localISOTime);
    } else {
      setBlogPublishDate("");
    }
    setCmsMode("edit");
    setShowEditorForm(true);
    setCmsError("");
    setCmsSuccess("");
  };

  // CMS: Save Blog
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsError("");
    setCmsSuccess("");
    setCmsLoading(true);

    const payload = {
      id: blogId,
      title: blogTitle,
      excerpt: blogExcerpt,
      content: blogContent,
      category: blogCategory,
      color: blogColor,
      imageUrl: blogImageUrl,
      status: blogStatus,
      publishedAt: blogPublishDate ? new Date(blogPublishDate).toISOString() : undefined
    };

    try {
      const method = cmsMode === "create" ? "POST" : "PUT";
      const res = await fetch("/api/admin/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setCmsSuccess(`Blog post successfully ${cmsMode === "create" ? "created" : "updated"}!`);
        if (cmsMode === "create") {
          setBlogsList((prev) => [data, ...prev]);
        } else {
          setBlogsList((prev) => prev.map((b) => (b.id === data.id ? data : b)));
        }
        
        // Reset and close after a delay
        setTimeout(() => {
          setShowEditorForm(false);
          resetBlogForm();
        }, 1200);
      } else {
        setCmsError(data.error || "Failed to save blog post");
      }
    } catch (e) {
      setCmsError("Network connection error saving post");
    } finally {
      setCmsLoading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogId(null);
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogCategory("Webcam Help");
    setBlogColor("bg-indigo-500/10 text-indigo-500");
    setBlogImageUrl("");
    setBlogStatus("draft");
    setBlogPublishDate("");
    setCmsError("");
    setCmsSuccess("");
  };

  const openCreateForm = () => {
    resetBlogForm();
    setCmsMode("create");
    setShowEditorForm(true);
  };

  // Auto-category coloring triggers
  useEffect(() => {
    if (blogCategory === "Webcam Help") setBlogColor("bg-indigo-500/10 text-indigo-500");
    else if (blogCategory === "Browser Settings") setBlogColor("bg-emerald-500/10 text-emerald-500");
    else if (blogCategory === "Audio Diagnostics") setBlogColor("bg-amber-500/10 text-amber-500");
    else if (blogCategory === "Speed Checks") setBlogColor("bg-sky-500/10 text-sky-500");
    else setBlogColor("bg-neutral-500/10 text-neutral-400");
  }, [blogCategory]);

  // Auth Screen Render
  if (authStep !== "dashboard") {
    return (
      <div className="max-w-md mx-auto py-20 animate-apple-reveal select-none">
        <div className="border border-border/80 p-8 rounded-2xl bg-card space-y-6">
          <div className="space-y-2 text-center">
            <Lock className="w-8 h-8 text-[#0071E3] mx-auto mb-2" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {authStep === "login" 
                ? "Security Control Login" 
                : authStep === "setup" 
                ? "Two-Factor Setup" 
                : "Two-Factor Verification"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {authStep === "login"
                ? "Enter credentials to access the CamMicTest administrative suite."
                : authStep === "setup"
                ? "Scan the QR code with Google Authenticator or another TOTP app, then enter the code to enable."
                : "Enter the 6-digit verification code from your Google Authenticator app."}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authStep === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                  Username (Email)
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border border-border px-3 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-border px-3 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
              >
                {authLoading ? "Authenticating..." : "Login"}
              </button>
            </form>
          ) : authStep === "setup" ? (
            <div className="space-y-5 text-center">
              {/* High contrast QR code container for dark-theme environments */}
              <div className="bg-white p-3 rounded-2xl inline-block border border-neutral-200 mx-auto select-none">
                <img 
                  src={qrCode} 
                  alt="Google Authenticator QR Code" 
                  className="w-44 h-44 block" 
                  draggable={false}
                />
              </div>

              <div className="space-y-1 text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block text-center">
                  Or enter secret key manually:
                </span>
                <div className="bg-neutral-950 border border-neutral-800 p-2 text-[10px] text-center select-all tracking-wider text-foreground font-bold break-all leading-normal select-all">
                  {secretKey}
                </div>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block text-center mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-transparent border border-border text-center text-xl tracking-[0.4em] font-mono py-2.5 rounded text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                >
                  {authLoading ? "Verifying..." : "Enable 2FA & Login"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setAuthStep("login")}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest font-mono pt-2 block"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block text-center mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-transparent border border-border text-center text-xl tracking-[0.4em] font-mono py-2.5 rounded text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
              >
                {authLoading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => setAuthStep("login")}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest font-mono pt-2 block"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div className="space-y-8 animate-apple-reveal select-none">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Admin Dashboard (Sameed@codener.com)
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
            System Control Room
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loadingDashboard}
            className="p-2 border border-border rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Refresh Dashboard Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 border border-destructive/20 bg-destructive/10 text-destructive text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded hover:bg-destructive hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/40 pb-px font-mono text-[10px] uppercase tracking-widest gap-4">
        <button
          onClick={() => { setActiveTab("analytics"); setShowEditorForm(false); }}
          className={`pb-2.5 border-b-2 transition-colors ${activeTab === "analytics" ? "border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Site Analytics</span>
        </button>
        <button
          onClick={() => { setActiveTab("heatmap"); setShowEditorForm(false); }}
          className={`pb-2.5 border-b-2 transition-colors ${activeTab === "heatmap" ? "border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5"><Map className="w-3.5 h-3.5" /> Heatmaps</span>
        </button>
        <button
          onClick={() => { setActiveTab("blogs"); }}
          className={`pb-2.5 border-b-2 transition-colors ${activeTab === "blogs" ? "border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Blog CMS</span>
        </button>
        <button
          onClick={() => { setActiveTab("security"); setShowEditorForm(false); }}
          className={`pb-2.5 border-b-2 transition-colors ${activeTab === "security" ? "border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Security Logs</span>
        </button>
        <button
          onClick={() => { setActiveTab("settings"); setShowEditorForm(false); }}
          className={`pb-2.5 border-b-2 transition-colors ${activeTab === "settings" ? "border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Settings</span>
        </button>
      </div>

      {loadingDashboard && !analyticsData ? (
        <div className="py-20 text-center text-muted-foreground text-xs font-mono">
          Loading system metrics database...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: ANALYTICS HUB */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Aggregate Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
                <div className="p-5 border border-border/80 rounded-xl space-y-1 bg-card">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Total Pageviews</span>
                  <p className="text-2xl font-light text-foreground">{analyticsData?.summary?.pageviews || 0}</p>
                </div>
                <div className="p-5 border border-border/80 rounded-xl space-y-1 bg-card">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Unique Visitors</span>
                  <p className="text-2xl font-light text-foreground">{analyticsData?.summary?.visitors || 0}</p>
                </div>
                <div className="p-5 border border-border/80 rounded-xl space-y-1 bg-card">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Database Blogs</span>
                  <p className="text-2xl font-light text-foreground">{blogsList.length}</p>
                </div>
                <div className="p-5 border border-border/80 rounded-xl space-y-1 bg-card">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">CMS Status</span>
                  <p className="text-xs font-bold text-success flex items-center gap-1 pt-1.5"><CheckCircle className="w-3.5 h-3.5" /> OPERATIONAL</p>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Traffic History (views/visitors past 7 days) */}
                <div className="p-6 border border-border rounded-xl space-y-4 bg-card">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Traffic (Last 7 Days)</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    {analyticsData?.trafficHistory && analyticsData.trafficHistory.length > 0 ? (
                      analyticsData.trafficHistory.map((day: any) => (
                        <div key={day.date} className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-muted-foreground">{day.date}</span>
                          <div className="flex gap-4">
                            <span><strong className="text-foreground">{day.views}</strong> views</span>
                            <span className="text-muted-foreground">|</span>
                            <span><strong className="text-foreground">{day.visitors}</strong> visitors</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-6">No traffic logged in this window.</div>
                    )}
                  </div>
                </div>

                {/* Popular Pages */}
                <div className="p-6 border border-border rounded-xl space-y-4 bg-card">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Popular Paths</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    {analyticsData?.pageviewsByUrl && analyticsData.pageviewsByUrl.length > 0 ? (
                      analyticsData.pageviewsByUrl.slice(0, 7).map((page: any) => (
                        <div key={page.url} className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-muted-foreground truncate max-w-[240px]">{page.url}</span>
                          <span><strong className="text-foreground">{page.count}</strong> pageviews</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-6">No page views tracked yet.</div>
                    )}
                  </div>
                </div>

                {/* Devices */}
                <div className="p-6 border border-border rounded-xl space-y-4 bg-card">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Device Distribution</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    {analyticsData?.devices && analyticsData.devices.length > 0 ? (
                      analyticsData.devices.map((dev: any) => (
                        <div key={dev.device} className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> {dev.device}</span>
                          <span><strong className="text-foreground">{dev.count}</strong> pageviews</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-6">No device logs available.</div>
                    )}
                  </div>
                </div>

                {/* Referrers */}
                <div className="p-6 border border-border rounded-xl space-y-4 bg-card">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Top Referrer Sources</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    {analyticsData?.referrers && analyticsData.referrers.length > 0 ? (
                      analyticsData.referrers.slice(0, 5).map((ref: any) => (
                        <div key={ref.referrer} className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {ref.referrer}</span>
                          <span><strong className="text-foreground">{ref.count}</strong> referrers</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-6">No referrer telemetry stored.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE HEATMAP OVERLAYS */}
          {activeTab === "heatmap" && (
            <div className="space-y-6">
              
              {/* URL Filter Selection */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border/80 rounded-xl bg-card">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Click Coordinate Heatmaps</h3>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    View clicks mapped in real time on coordinates scaled to the document. Total clicks logged: **{analyticsData?.heatmapClicks?.length || 0}**.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="heatmap-select" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest shrink-0">Select Page:</label>
                  <select
                    id="heatmap-select"
                    value={heatmapUrl}
                    onChange={(e) => setHeatmapUrl(e.target.value)}
                    className="bg-neutral-900 border border-border text-[11px] px-3 py-1.5 rounded font-mono focus:outline-none text-foreground focus:border-foreground"
                  >
                    <option value="/">Home Page (/)</option>
                    <option value="/webcam-test">Webcam Test (/webcam-test)</option>
                    <option value="/microphone-test">Microphone Test (/microphone-test)</option>
                    <option value="/speaker-test">Speaker Test (/speaker-test)</option>
                    <option value="/speed-test">Speed Test (/speed-test)</option>
                    <option value="/device-check">Wizard (/device-check)</option>
                  </select>
                </div>
              </div>

              {/* Heatmap Overlay plotting frame */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-4xl aspect-[16/10] bg-neutral-900 border border-border/80 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                  
                  {/* Grid background simulation of the viewport layout */}
                  <div className="absolute inset-0 bg-neutral-950/90 pointer-events-none flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block border border-border/40 px-3 py-1 rounded bg-neutral-900">
                      Viewport Grid Layout ({heatmapUrl})
                    </span>
                    <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
                      Coordinates are plotted in absolute position percentages calculated over the total layout dimensions.
                    </p>
                  </div>

                  {/* Heatmap points drawing canvas overlay */}
                  <canvas
                    ref={heatmapCanvasRef}
                    width={800}
                    height={500}
                    className="relative z-10 w-full h-full pointer-events-none"
                  />

                  {/* Simulated webpage header overlay for visual anchor */}
                  <div className="absolute top-0 left-0 right-0 h-10 border-b border-border/45 bg-neutral-950/80 z-20 flex items-center justify-between px-4 pointer-events-none">
                    <div className="w-16 h-4 bg-muted/40 rounded" />
                    <div className="flex gap-2">
                      <div className="w-8 h-2 bg-muted/30 rounded" />
                      <div className="w-8 h-2 bg-muted/30 rounded" />
                      <div className="w-8 h-2 bg-muted/30 rounded" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BLOG CMS */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              
              {!showEditorForm ? (
                <div className="space-y-4">
                  {/* Action row */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">Blog Catalog</h3>
                    <button
                      onClick={openCreateForm}
                      className="inline-flex items-center gap-1 border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-widest px-4 py-2 rounded hover:bg-transparent hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Blog
                    </button>
                  </div>

                  {/* Blogs list */}
                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead>
                          <tr className="border-b border-border/60 text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/10">
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Publish Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 text-muted-foreground text-[11px]">
                          {blogsList.length > 0 ? (
                            blogsList.map((blog) => (
                              <tr key={blog.id} className="hover:bg-muted/5 transition-colors">
                                <td className="p-4 font-semibold text-foreground max-w-[200px] truncate">{blog.title}</td>
                                <td className="p-4">{blog.category}</td>
                                <td className="p-4">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                    blog.status === "published" ? "bg-success/10 text-success" : 
                                    blog.status === "scheduled" ? "bg-amber-500/10 text-amber-500" : "bg-neutral-500/10 text-neutral-400"
                                  }`}>
                                    {blog.status}
                                  </span>
                                </td>
                                <td className="p-4">{new Date(blog.publishedAt).toLocaleString()}</td>
                                <td className="p-4 text-right space-x-1.5">
                                  <button
                                    onClick={() => handleEditBlogClick(blog)}
                                    className="p-1.5 border border-border rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBlog(blog.id)}
                                    className="p-1.5 border border-destructive/20 text-destructive rounded hover:bg-destructive/10 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                                No blog posts uploaded in the database yet. Click "Add New Blog" to create one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* CREATE / EDIT BLOG CMS FORM */
                <div className="border border-border/80 rounded-xl bg-card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground">
                      {cmsMode === "create" ? "Compose New Blog Post" : "Edit Blog Post"}
                    </h3>
                    <button
                      onClick={() => setShowEditorForm(false)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>

                  {cmsError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold rounded flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{cmsError}</span>
                    </div>
                  )}

                  {cmsSuccess && (
                    <div className="p-3 bg-success/10 border border-success/20 text-success text-[11px] font-bold rounded flex items-center gap-2 animate-pulse">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{cmsSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveBlog} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                          Blog Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. How to Fix Microphone Noise"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                            Category
                          </label>
                          <select
                            value={blogCategory}
                            onChange={(e) => setBlogCategory(e.target.value)}
                            className="w-full bg-neutral-900 border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                          >
                            <option value="Webcam Help">Webcam Help</option>
                            <option value="Browser Settings">Browser Settings</option>
                            <option value="Audio Diagnostics">Audio Diagnostics</option>
                            <option value="Speed Checks">Speed Checks</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                            Featured Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. /blog-webcam-black.png"
                            value={blogImageUrl}
                            onChange={(e) => setBlogImageUrl(e.target.value)}
                            className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                            CMS Status
                          </label>
                          <select
                            value={blogStatus}
                            onChange={(e) => setBlogStatus(e.target.value as any)}
                            className="w-full bg-neutral-900 border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                          >
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Instant)</option>
                            <option value="scheduled">Scheduled (Future)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                            Publish Date/Time
                          </label>
                          <input
                            type="datetime-local"
                            value={blogPublishDate}
                            onChange={(e) => setBlogPublishDate(e.target.value)}
                            className="w-full bg-neutral-900 border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                          Excerpt Summary
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Provide a brief summary snippet for article grids..."
                          value={blogExcerpt}
                          onChange={(e) => setBlogExcerpt(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={cmsLoading}
                          className="flex-1 border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                        >
                          {cmsLoading ? "Saving Post..." : "Save Blog Post"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditorForm(false)}
                          className="px-6 border border-border text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-neutral-900 transition-colors text-muted-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Right Column Markdown Content & Preview */}
                    <div className="flex flex-col space-y-2 h-[450px]">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                          Markdown Body Content
                        </label>
                        <span className="text-[9px] text-muted-foreground font-mono">Supports # Headings, **bold**, `code`</span>
                      </div>
                      <textarea
                        required
                        rows={14}
                        placeholder="Compose article in markdown format..."
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="w-full flex-1 bg-transparent border border-border p-4 rounded text-xs text-foreground font-mono focus:outline-none focus:border-foreground resize-none"
                      />
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: SECURITY AUDIT & LOGIN TELEMETRY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              <div className="p-6 border border-border rounded-xl space-y-4 bg-card font-mono text-[11px]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Access Security Registry</h3>
                <p className="text-muted-foreground font-sans">
                  The dashboard maintains strict, cryptographically validated boundaries. PBKDF2 iterations are validated per request, and active HttpOnly authentication locks are checked down the tree.
                </p>

                <div className="pt-4 border-t border-border/30 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Administrative Profile:</span>
                    <span className="text-foreground font-bold">Sameed@codener.com</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Hashed Key iterations:</span>
                    <span className="text-foreground">10,000 PBKDF2 sync cycles</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">2FA Multi-Factor Authenticator:</span>
                    <span className="text-success font-bold">OFFLINE TOTP (GOOGLE AUTHENTICATOR)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Session Expiration threshold:</span>
                    <span className="text-foreground">7 Days (HttpOnly, Secure, SameSite=Strict)</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3 mt-6 font-sans">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-xs">
                    <h4 className="font-bold text-foreground mb-1">AppSec Audit Check passed</h4>
                    <p className="text-muted-foreground">
                      Session cookies utilize anti-tampering token validations. Local database writes are locked atomically to protect file integrity from race-condition concurrency threats.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: USER SETTINGS PANEL */}
          {activeTab === "settings" && (
            <div className="space-y-8 font-sans">
              
              {/* Alert Message Banner at Settings Level */}
              {(settingsSuccess || settingsError) && (
                <div className="space-y-3">
                  {settingsSuccess && (
                    <div className="p-4 bg-success/10 border border-success/20 text-success text-xs font-mono rounded-xl flex items-center gap-2.5 animate-apple-reveal">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{settingsSuccess}</span>
                    </div>
                  )}
                  {settingsError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono rounded-xl flex items-center gap-2.5 animate-apple-reveal">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{settingsError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Security alerts check banner for suspicious attempts */}
              {securityAlerts.length > 0 && (
                <div className="space-y-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest font-bold text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Suspicious Activity Warnings ({securityAlerts.length})
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {securityAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl flex items-start justify-between gap-4 animate-pulse">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-foreground">{alert.message}</p>
                          <div className="flex flex-wrap gap-x-3 text-[10px] text-muted-foreground font-mono">
                            <span>IP: <strong className="text-foreground">{alert.ip}</strong></span>
                            <span>Device: <strong>{alert.device}</strong></span>
                            <span>Time: <strong>{new Date(alert.timestamp).toLocaleString()}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-3 py-1 text-[9px] uppercase tracking-widest font-mono border border-border rounded bg-neutral-900 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: Profile & Credentials Update Form */}
                <div className="space-y-8">
                  
                  {/* Account Profile Box */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="border-b border-border/40 pb-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#0071E3]" /> Profile Account Settings
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Update your administrator profile details and avatar.
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      
                      {/* Avatar preview and update */}
                      <div className="flex items-center gap-4 p-4 border border-border/60 rounded-xl bg-neutral-500/5">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-neutral-950 flex items-center justify-center shrink-0">
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                            Profile Photo URL
                          </label>
                          <input
                            type="text"
                            placeholder="/logo-white.png"
                            value={profilePhotoInput}
                            onChange={(e) => setProfilePhotoInput(e.target.value)}
                            className="w-full bg-transparent border border-border px-3 py-1.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                            Email Address (Admin ID)
                          </label>
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            emailVerified ? "badge-success-premium" : "badge-warning-premium"
                          }`}>
                            {emailVerified ? <CheckCircle className="w-2.5 h-2.5 shrink-0" /> : <AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                            {emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="w-full border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                      >
                        {settingsLoading ? "Saving Changes..." : "Save Profile Details"}
                      </button>

                    </form>
                  </div>

                  {/* Security Credentials Password Box */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="border-b border-border/40 pb-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-[#0071E3]" /> Change Password
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Ensure your account uses a strong password. Changing your password logs you out from all other devices.
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                          Current Security Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                          New Security Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                        
                        {/* Interactive Password Strength Indicator */}
                        {newPassword && (
                          <div className="space-y-1.5 animate-apple-reveal">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-muted-foreground">Password Strength:</span>
                              <span className={
                                getPasswordStrength(newPassword).label === "Strong" ? "text-success font-bold" :
                                getPasswordStrength(newPassword).label === "Medium" ? "text-warning font-bold" : "text-destructive font-bold"
                              }>
                                {getPasswordStrength(newPassword).label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden flex gap-0.5">
                              <div className={`h-full flex-1 transition-all duration-300 ${
                                getPasswordStrength(newPassword).score >= 1 ? getPasswordStrength(newPassword).color : "bg-neutral-800"
                              }`} />
                              <div className={`h-full flex-1 transition-all duration-300 ${
                                getPasswordStrength(newPassword).score >= 3 ? getPasswordStrength(newPassword).color : "bg-neutral-800"
                              }`} />
                              <div className={`h-full flex-1 transition-all duration-300 ${
                                getPasswordStrength(newPassword).score >= 5 ? getPasswordStrength(newPassword).color : "bg-neutral-800"
                              }`} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent border border-border px-3.5 py-2.5 rounded text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="w-full border border-foreground bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider py-3 rounded hover:bg-transparent hover:text-foreground transition-apple-spring"
                      >
                        {settingsLoading ? "Saving..." : "Change Account Password"}
                      </button>
                    </form>
                  </div>

                  {/* Multi-Factor Authentication Control Box */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="border-b border-border/40 pb-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-[#0071E3]" /> Multi-Factor Authentication (2FA)
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Your account requires Google Authenticator (TOTP) codes to authorize login actions.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-neutral-500/5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                          2FA Authentication Status
                        </span>
                        <p className="text-xs font-bold text-foreground">
                          {twoFactorEnabled ? "🔐 Google App Authenticator Active" : "🔓 Setup Incomplete"}
                        </p>
                      </div>
                      {twoFactorEnabled ? (
                        <button
                          type="button"
                          onClick={handleDeactivate2FA}
                          disabled={settingsLoading}
                          className="px-4 py-2 border border-destructive/20 bg-destructive/10 text-destructive text-[10px] font-mono uppercase tracking-widest rounded hover:bg-destructive hover:text-white transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span className="px-3 py-1 text-[9px] uppercase tracking-widest font-mono border border-border rounded bg-neutral-900 text-muted-foreground">
                          Required on Login
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Active Sessions, Login History & Audit Trails */}
                <div className="space-y-8">
                  
                  {/* Active Sessions List */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-[#0071E3]" /> Active Logged-in Sessions
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Connected devices currently authorized in this admin workspace.
                        </p>
                      </div>
                      {activeSessions.length > 1 && (
                        <button
                          type="button"
                          onClick={handleRevokeAllSessions}
                          className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors rounded"
                        >
                          Revoke Others
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 font-mono text-[11px]">
                      {activeSessions.map((session) => (
                        <div key={session.tokenHash} className="p-4 border border-border/60 rounded-xl flex items-start justify-between gap-4 bg-neutral-500/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-semibold flex items-center gap-1">
                                <Monitor className="w-3.5 h-3.5 text-muted-foreground" /> {session.device}
                              </span>
                              {session.isCurrent && (
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-success/15 text-success text-[8px] font-bold uppercase tracking-widest">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5 text-muted-foreground text-[10px]">
                              <p>IP: <strong className="text-foreground">{session.ip}</strong> • Browser: <strong>{session.browser}</strong></p>
                              <p>Session started: {new Date(session.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(session.tokenHash)}
                              className="p-1 border border-border/80 rounded hover:border-destructive hover:text-destructive transition-colors text-muted-foreground"
                              title="Revoke session key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal Activity & Audit Log */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="border-b border-border/40 pb-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#0071E3]" /> Audit Trail & Admin Actions
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Recent activities and administrative tasks performed on this workspace.
                      </p>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 font-mono text-[10px] divide-y divide-border/20">
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log, index) => (
                          <div key={log.id} className={`pt-3 ${index === 0 ? "pt-0 border-t-0" : ""}`}>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-foreground font-semibold flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  log.action.includes("disable") || log.action.includes("revoke") ? "bg-destructive" :
                                  log.action.includes("enable") || log.action.includes("login") ? "bg-success" : "bg-primary"
                                }`} />
                                {log.action.toUpperCase()}
                              </span>
                              <span className="text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-muted-foreground mt-1 leading-normal">{log.details}</p>
                            <div className="flex gap-3 text-[9px] text-muted-foreground/80 mt-0.5">
                              <span>IP: <strong>{log.ip}</strong></span>
                              <span>Device: <strong>{log.device}</strong></span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-6">No audit records found in the database.</div>
                      )}
                    </div>
                  </div>

                  {/* Access Login History */}
                  <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                    <div className="border-b border-border/40 pb-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#0071E3]" /> Access & Login History
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        History of verified, pending, and rejected entry attempts to this administrative control room.
                      </p>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3 font-mono text-[10px] divide-y divide-border/20">
                      {loginHistory.map((history, index) => (
                        <div key={history.id} className={`pt-3 ${index === 0 ? "pt-0 border-t-0" : ""}`}>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-foreground">
                              User: <strong>{history.username}</strong>
                            </span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest font-mono ${
                              history.status === "success" ? "bg-success/15 text-success" :
                              history.status === "otp_pending" ? "bg-amber-500/15 text-amber-500" : "bg-destructive/15 text-destructive"
                            }`}>
                              {history.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-muted-foreground mt-1">
                            <span>IP: <strong className="text-foreground">{history.ip}</strong></span>
                            <span>Browser: <strong>{history.browser}</strong></span>
                            <span className="text-[9px]">{new Date(history.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
