"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronRight, Sparkles, Loader2, UserPlus, TrendingUp, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";

const TOUR_STEPS = [
  { icon: <UserPlus size={18} />, label: "Onboard Employee", desc: "Creating a new employee via AI workflow...", action: "onboard" },
  { icon: <TrendingUp size={18} />, label: "Process Promotion", desc: "Promoting a top performer...", action: "promote" },
  { icon: <Calendar size={18} />, label: "Schedule Interview", desc: "Setting up candidate interviews...", action: "interview" },
  { icon: <FileText size={18} />, label: "Generate Report", desc: "Viewing payroll and performance data...", action: "report" },
];

export default function DemoTour() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState("");

  const runTour = useCallback(async () => {
    setRunning(true);
    setStatus("running");
    setStep(0);
    setResult("");

    for (let i = 0; i < TOUR_STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 1200));

      try {
        if (TOUR_STEPS[i].action === "onboard") {
          const res = await fetch("/api/workflow", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: "Onboard a new employee named Alex Rivera as a Junior Designer in Design with salary 72000", triggeredBy: "Demo Tour" }),
          });
          const data = await res.json();
          setResult(data.status === "COMPLETED" ? `✅ Onboarded: Alex Rivera (${data.employeeId?.slice(0,8) || "ID created"})` : "⚠️ Onboard failed");
        } else if (TOUR_STEPS[i].action === "promote") {
          const res = await fetch("/api/workflow", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: "Promote Benjamin Franklin to Senior Financial Analyst with salary 95000", triggeredBy: "Demo Tour" }),
          });
          const data = await res.json();
          setResult(data.status === "COMPLETED" ? `✅ Promoted: Benjamin Franklin → Senior Financial Analyst` : "⚠️ Promotion failed");
        } else if (TOUR_STEPS[i].action === "interview") {
          const res = await fetch("/api/workflow", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: "Schedule interviews for Senior Fullstack Engineer position", triggeredBy: "Demo Tour" }),
          });
          const data = await res.json();
          setResult(data.status === "COMPLETED" ? `✅ ${data.resultSummary || "Interviews scheduled"}` : "ℹ️ No eligible candidates (expected in demo)");
        } else if (TOUR_STEPS[i].action === "report") {
          setResult("📊 Dashboard data refreshed — payroll, performance, and analytics up to date.");
          await new Promise((r) => setTimeout(r, 800));
        }
      } catch {
        setResult("⚠️ Step encountered an error");
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    setStatus("done");
    toast.success("Demo tour complete! Explore the results.");
    await new Promise((r) => setTimeout(r, 2000));
    setRunning(false);
    setStatus("idle");
    setStep(0);
    window.location.href = "/";
  }, []);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={runTour}
        disabled={running}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60"
      >
        {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        {running ? "Running Demo..." : "▶ Demo Tour"}
      </motion.button>

      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">AI Demo Tour</span>
              </div>
              <span className="text-xs text-slate-400">{step + 1}/{TOUR_STEPS.length}</span>
            </div>

            <div className="space-y-2 mb-3">
              {TOUR_STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                  i === step ? "bg-indigo-50 dark:bg-indigo-500/10" :
                  i < step ? "bg-emerald-50 dark:bg-emerald-500/10" : ""
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i === step ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                    i < step ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {i < step ? <X size={14} /> : i === step ? <Loader2 size={14} className="animate-spin" /> : s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{i <= step ? s.label : `Up next: ${s.label}`}</p>
                    {i === step && <p className="text-xs text-indigo-500 mt-0.5">{s.desc}</p>}
                    {i < step && <p className="text-xs text-emerald-500 mt-0.5">Complete</p>}
                  </div>
                  {i === step && <ChevronRight size={14} className="text-indigo-400 animate-pulse" />}
                </div>
              ))}
            </div>

            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                {result}
              </motion.div>
            )}

            {status === "done" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center mt-2">
                ✅ Demo complete! Refreshing dashboard...
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
