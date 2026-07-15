"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Users,
  Briefcase,
  User,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const roles = [
  {
    id: "HR",
    label: "HR Manager",
    icon: Users,
    color: "from-cyan-500 to-blue-600",
    email: "hr@aihr.com",
    name: "Sarah Jenkins",
  },
  {
    id: "MANAGER",
    label: "Manager",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-600",
    email: "manager@aihr.com",
    name: "Robert Kovac",
  },
  {
    id: "EMPLOYEE",
    label: "Employee",
    icon: User,
    color: "from-amber-500 to-orange-600",
    email: "employee@aihr.com",
    name: "Emma Watson",
  },
];

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@aihr.com", password: "marcus123", name: "Marcus Aurelius" },
  { role: "HR", email: "hr@aihr.com", password: "sarah123", name: "Sarah Jenkins" },
  { role: "Manager", email: "manager@aihr.com", password: "robert123", name: "Robert Kovac" },
  { role: "Employee", email: "employee@aihr.com", password: "emma123", name: "Emma Watson" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [copied, setCopied] = useState("");

  const handleRoleSelect = (role: (typeof roles)[0]) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword("");
    toast.success(`Password: ${role.name.toLowerCase().split(" ")[0]}123`, { icon: "🔑" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Login failed");
        setIsLoading(false);
        return;
      }
      const userData = await res.json();
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success(`Welcome, ${userData.name}!`);
      await new Promise((r) => setTimeout(r, 800));
      router.push("/");
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillCreds = (e: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(e.email);
    setPassword(e.password);
    setSelectedRole(e.role === "Admin" ? "HR" : e.role === "Manager" ? "MANAGER" : e.role === "HR" ? "HR" : "EMPLOYEE");
    toast.success(`Filled: ${e.email}`, { icon: "📋" });
  };

  const copyPassword = (pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopied(pw);
    setTimeout(() => setCopied(""), 1500);
    toast.success("Password copied!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 120, -60, 0], y: [0, -120, 60, 0], scale: [1, 1.3, 0.8, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/5 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 80, 0], y: [0, 100, -80, 0], scale: [1, 0.8, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 80, -60, 0], y: [0, -80, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl"
        />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-5 shadow-lg shadow-indigo-500/30"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-1"
            >
              AI HR Employee
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-sm flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Intelligent HR Management Platform
            </motion.p>
          </div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-8 pb-4"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Quick Login As
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                    selectedRole === role.id
                      ? `bg-gradient-to-br ${role.color} border-transparent text-white shadow-lg`
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <role.icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{role.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="px-8 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or sign in</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleLogin}
            className="px-8 pb-6 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Key className="w-3 h-3" />
                Password format: <span className="text-indigo-400 font-mono">firstname123</span>
                {" "}(e.g. <span className="text-indigo-400 font-mono">sarah123</span>)
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50" />
                Remember me
              </label>
              <button type="button" onClick={() => toast.success("Hint: Use firstname123 (e.g. sarah123, robert123, emma123)")} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* Demo Credentials Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="px-8 pb-8"
          >
            <button
              type="button"
              onClick={() => setShowCreds(!showCreds)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                All Demo Accounts
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCreds ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showCreds && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-1">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <motion.button
                        key={acc.email}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => fillCreds(acc)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase w-14 flex-shrink-0">{acc.role}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-white truncate">{acc.email}</p>
                            <p className="text-[10px] text-slate-500">{acc.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <code className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{acc.password}</code>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyPassword(acc.password); }}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                          >
                            {copied === acc.password ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-slate-500 mt-6"
        >
          Powered by Autonomous AI Workflow Engine
        </motion.p>
      </motion.div>
    </div>
  );
}
