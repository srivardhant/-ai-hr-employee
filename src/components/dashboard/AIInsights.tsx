"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Award, GraduationCap, DollarSign, Clock } from "lucide-react";

interface Insight {
  icon: React.ReactNode;
  title: string;
  description: string;
  bg: string;
  iconBg: string;
  iconColor: string;
}

export default function AIInsights({ role }: { role: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const [employees, leaves, payrolls, promotions, performance, trainings] = await Promise.all([
          fetch("/api/employees").then(r => r.ok ? r.json() : []),
          fetch("/api/leave").then(r => r.ok ? r.json() : []),
          fetch("/api/payroll").then(r => r.ok ? r.json() : []),
          fetch("/api/promotions").then(r => r.ok ? r.json() : []),
          fetch("/api/performance").then(r => r.ok ? r.json() : []),
          fetch("/api/training?all=true").then(r => r.ok ? r.json() : []),
        ]);

        const result: Insight[] = [];

        if (performance.length > 0) {
          const sorted = [...performance].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
          const top = sorted[0];
          if (top.rating >= 4) {
            result.push({
              icon: <Award size={16} />, title: `Promotion Candidate: ${top.employee?.name || "N/A"}`,
              description: `Rated ${top.rating}/5 in Q${top.quarter}. Ready for career advancement.`,
              bg: "bg-violet-50 dark:bg-violet-500/10", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600 dark:text-violet-400",
            });
          }
        }
        if (trainings.length > 0) {
          const pending = trainings.filter((t: any) => t.status === "ASSIGNED" || t.status === "OVERDUE");
          if (pending.length > 0) {
            result.push({
              icon: <GraduationCap size={16} />, title: `${pending.length} Training(s) Need Attention`,
              description: `${pending.length} employee(s) have pending or overdue compliance training.`,
              bg: "bg-amber-50 dark:bg-amber-500/10", iconBg: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400",
            });
          }
        }
        if (payrolls.length > 0) {
          const total = payrolls.reduce((s: number, p: any) => s + (p.netPay || 0), 0);
          result.push({
            icon: <DollarSign size={16} />, title: `Payroll Total: $${total.toLocaleString()}`,
            description: `${payrolls.length} records across ${[...new Set(payrolls.map((p: any) => p.month))].length} month(s).`,
            bg: "bg-emerald-50 dark:bg-emerald-500/10", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400",
          });
        }
        if (leaves.length > 0) {
          const pendingLeaves = leaves.filter((l: any) => l.status === "PENDING");
          if (pendingLeaves.length > 0) {
            result.push({
              icon: <Clock size={16} />, title: `${pendingLeaves.length} Leave Request(s) Pending`,
              description: pendingLeaves.map((l: any) => `${l.employee?.name || "Someone"}: ${l.days}d ${l.type}`).join(". "),
              bg: "bg-sky-50 dark:bg-sky-500/10", iconBg: "bg-sky-100 dark:bg-sky-500/20", iconColor: "text-sky-600 dark:text-sky-400",
            });
          }
        }
        if (promotions.length > 0) {
          const recent = promotions[promotions.length - 1];
          result.push({
            icon: <TrendingUp size={16} />, title: `Latest: ${recent.employee?.name || "N/A"} Promoted`,
            description: `${recent.fromPosition || "?"} → ${recent.toPosition}`,
            bg: "bg-indigo-50 dark:bg-indigo-500/10", iconBg: "bg-indigo-100 dark:bg-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-400",
          });
        }

        setInsights(result.slice(0, 4));
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
            <Sparkles size={14} className="text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Insights</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
          <Sparkles size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${insight.bg} transition-opacity`}
          >
            <div className={`w-8 h-8 rounded-lg ${insight.iconBg} flex items-center justify-center flex-shrink-0 ${insight.iconColor}`}>
              {insight.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{insight.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
