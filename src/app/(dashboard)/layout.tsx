"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Role = "HR" | "MANAGER" | "EMPLOYEE";

const ROLE_ACCESS: Record<string, Role[]> = {
  "/": ["HR", "MANAGER", "EMPLOYEE"],
  "/recruitment": ["HR"],
  "/interviews": ["HR", "MANAGER"],
  "/evaluations": ["HR"],
  "/offers": ["HR"],
  "/onboarding": ["HR"],
  "/training": ["HR", "MANAGER", "EMPLOYEE"],
  "/payroll": ["HR", "EMPLOYEE"],
  "/leave": ["HR", "MANAGER", "EMPLOYEE"],
  "/performance": ["HR", "MANAGER", "EMPLOYEE"],
  "/promotions": ["HR", "MANAGER"],
  "/engagement": ["HR", "MANAGER", "EMPLOYEE"],
  "/exit": ["HR"],
  "/employees": ["HR", "MANAGER", "EMPLOYEE"],
  "/workflow": ["HR"],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarMargin, setSidebarMargin] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
    } else {
      const u = JSON.parse(userStr);
      setUser(u);
      setMounted(true);

      const allowed = ROLE_ACCESS[pathname];
      if (allowed && !allowed.includes(u.role)) {
        router.push("/");
      }
    }
  }, [router, pathname]);

  useEffect(() => {
    const updateMargin = () => {
      if (window.innerWidth >= 1024) {
        setSidebarMargin(collapsed ? "80px" : "280px");
      } else {
        setSidebarMargin("0px");
      }
    };
    updateMargin();
    window.addEventListener("resize", updateMargin);
    return () => window.removeEventListener("resize", updateMargin);
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-250">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen z-50 lg:hidden"
            >
              <div className="relative">
                <Sidebar collapsed={false} setCollapsed={() => {}} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 z-10"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarMargin }}
      >
        <Header
          userName={user?.name || "Admin User"}
          userRole={user?.role || "Administrator"}
          onLogout={handleLogout}
          onMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-[72px] overflow-y-auto max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
