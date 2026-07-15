"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Inbox, Mail, MailOpen, UserPlus, TrendingUp, Calendar, FileText, Briefcase, Star, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  WORKFLOW: <Briefcase size={14} />,
  PROMOTION: <TrendingUp size={14} />,
  LEAVE: <Calendar size={14} />,
  ONBOARDING: <UserPlus size={14} />,
  TRAINING: <FileText size={14} />,
  PERFORMANCE: <Star size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  WORKFLOW: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  PROMOTION: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  LEAVE: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ONBOARDING: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  TRAINING: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
  PERFORMANCE: "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifs = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const u = JSON.parse(userStr);
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(u.email)}`);
      if (res.ok) setNotifications(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All marked as read");
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Inbox" description="System notifications, approvals, and workflow alerts"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === "all" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>All</button>
            <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === "unread" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>Unread</button>
            <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">Mark All Read</button>
          </div>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedId(selectedId === n.id ? null : n.id)}
              className={`group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                n.read
                  ? "bg-white/50 dark:bg-slate-800/30 hover:bg-white/80 dark:hover:bg-slate-800/50"
                  : "bg-indigo-50/80 dark:bg-indigo-500/5 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/10"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] || "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                {TYPE_ICONS[n.type] || <Mail size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${n.read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-white font-semibold"}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                  <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                    className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-500 transition-colors" title="Mark read">
                    <MailOpen size={14} />
                  </button>
                )}
                {n.link && (
                  <button onClick={(e) => { e.stopPropagation(); window.location.href = n.link; }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors" title="Open">
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
