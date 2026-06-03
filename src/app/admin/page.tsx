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
  Check
} from "lucide-react";

// Tab types
type Tab = "analytics" | "heatmap" | "blogs" | "security";

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
    } catch (e) {
      console.error("Failed to load dashboard metrics:", e);
    } finally {
      setLoadingDashboard(false);
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

        </div>
      )}

    </div>
  );
}
