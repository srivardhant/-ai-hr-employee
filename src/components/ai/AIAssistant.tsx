"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How many employees?",
  "Show Engineering team",
  "Who's due for promotion?",
  "Dashboard summary",
  "Who is Emma Watson?",
  "Pending leave requests",
];

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

function fmt(n: number) { return n.toLocaleString(); }

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your AI HR assistant. Ask me anything — I'll look up the real data from your system." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const q = text.toLowerCase().trim();

    try {
      let answer = "";

      // Count employees
      if (q.includes("how many") || (q.includes("employee") && (q.includes("count") || q.includes("total") || q.includes("many")))) {
        const emps = await fetchJson("/api/employees");
        if (emps && emps.length) {
          answer = `We have **${emps.length} employees** total.`;
        }
      }
      // Department lookup
      else if (q.match(/(?:show|list|who|which|tell)\s+.*(?:in|team|department|dept)/)) {
        const depts = ["engineering", "design", "marketing", "sales", "finance", "hr"];
        const matched = depts.find((d) => q.includes(d));
        if (matched) {
          const emps = await fetchJson(`/api/employees?department=${matched.charAt(0).toUpperCase() + matched.slice(1)}`);
          if (emps && emps.length) {
            const lines = emps.map((e: any) => `• **${e.name}** — ${e.position}`).join("\n");
            answer = `**${matched.charAt(0).toUpperCase() + matched.slice(1)}** team (${emps.length}):\n${lines}`;
          }
        }
        if (!answer) answer = "Which department? Try: Engineering, Design, Marketing, Sales, Finance, or HR.";
      }
      // Who is X?
      else if (q.match(/who(?:'s| is)\s+(.+)/)) {
        const name = q.match(/who(?:'s| is)\s+(.+)/)?.[1]?.trim();
        if (name) {
          const emps = await fetchJson(`/api/employees?search=${encodeURIComponent(name)}`);
          if (emps && emps.length) {
            const e = emps[0];
            answer = `**${e.name}** (${e.employeeId})\n• Role: ${e.position}\n• Department: ${e.department}\n• Salary: $${fmt(e.salary || 0)}\n• Status: ${e.status || "Active"}`;
          } else {
            answer = `I couldn't find anyone matching "${name}" in the employee records.`;
          }
        }
      }
      // Leaves
      else if (q.includes("leave") || q.includes("time off") || q.includes("vacation") || q.includes("pto")) {
        const leaves = await fetchJson("/api/leave");
        if (leaves && leaves.length) {
          const pending = leaves.filter((l: any) => l.status === "PENDING");
          const approved = leaves.filter((l: any) => l.status === "APPROVED");
          answer = `Found **${leaves.length} leave records** (${pending.length} pending, ${approved.length} approved).`;
          if (pending.length) {
            answer += `\nPending:\n${pending.slice(0, 3).map((l: any) => `• ${l.employee?.name || "Someone"} — ${l.days}d ${l.type} (${l.status})`).join("\n")}`;
          }
        } else {
          answer = "No leave records found.";
        }
      }
      // Payroll
      else if (q.includes("payroll") || q.includes("salary") || q.includes("pay")) {
        const payrolls = await fetchJson("/api/payroll");
        if (payrolls && payrolls.length) {
          const total = payrolls.reduce((s: number, p: any) => s + (p.netPay || 0), 0);
          const months = [...new Set(payrolls.map((p: any) => `${p.month}/${p.year}`))];
          answer = `**${payrolls.length} payroll records** across ${months.length} month(s). Total net pay: **$${fmt(total)}**.`;
        } else {
          answer = "No payroll records found.";
        }
      }
      // Promotions
      else if (q.includes("promotion") || q.includes("promote") || q.includes("career")) {
        const promos = await fetchJson("/api/promotions");
        if (promos && promos.length) {
          answer = `**${promos.length} promotion record(s)** found.\n${promos.slice(0, 3).map((p: any) => `• ${p.employee?.name || "Someone"}: ${p.fromPosition || "?"} → ${p.toPosition} ($${fmt(p.fromSalary)} → $${fmt(p.toSalary)})`).join("\n")}`;
        } else {
          answer = "No promotion records yet.";
        }
      }
      // Training
      else if (q.includes("training") || q.includes("course") || q.includes("compliance")) {
        const trainings = await fetchJson("/api/training");
        if (trainings && trainings.length) {
          const overdue = trainings.filter((t: any) => t.status === "OVERDUE" || t.status === "ASSIGNED");
          answer = `**${trainings.length} training assignments** (${overdue.length} pending/overdue).`;
        } else {
          answer = "No training records found.";
        }
      }
      // Recruitment / candidates
      else if (q.includes("candidate") || q.includes("recruit") || q.includes("job") || q.includes("hiring") || q.includes("offer")) {
        const cands = await fetchJson("/api/candidates");
        if (cands && cands.length) {
          const byStatus: Record<string, number> = {};
          for (const c of cands) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
          const summary = Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(", ");
          answer = `**${cands.length} candidates** in pipeline (${summary}).`;
        } else {
          answer = "No candidates found.";
        }
      }
      // Performance
      else if (q.includes("performance") || q.includes("review")) {
        const evals = await fetchJson("/api/performance");
        if (evals && evals.length) {
          const avg = evals.reduce((s: number, e: any) => s + (e.rating || 0), 0) / evals.length;
          answer = `**${evals.length} performance review(s)**. Average rating: **${avg.toFixed(1)}/5**.`;
        } else {
          answer = "No performance reviews yet.";
        }
      }
      // Dashboard summary
      else if (q.includes("summary") || q.includes("dashboard") || q.includes("overview")) {
        const [emps, cands, leaves, payrolls, promos] = await Promise.all([
          fetchJson("/api/employees"),
          fetchJson("/api/candidates"),
          fetchJson("/api/leave"),
          fetchJson("/api/payroll"),
          fetchJson("/api/promotions"),
        ]);
        const empCount = emps?.length || 0;
        const candCount = cands?.length || 0;
        const leaveCount = leaves?.filter((l: any) => l.status === "PENDING").length || 0;
        const payrollTotal = payrolls?.reduce((s: number, p: any) => s + (p.netPay || 0), 0) || 0;
        const promoCount = promos?.length || 0;
        answer = `**Company Snapshot**\n• Employees: **${empCount}**\n• Candidates: **${candCount}**\n• Pending leaves: **${leaveCount}**\n• Payroll total: **$${fmt(payrollTotal)}**\n• Promotions: **${promoCount}**`;
      }
      // Fallback
      else {
        answer = "I can look up **employees**, **departments**, **payroll**, **leave**, **training**, **promotions**, **candidates**, and **performance**. Try asking something like 'How many employees?' or 'Show Engineering team'.";
      }

      if (!answer) answer = "I couldn't find anything for that query. Try rephrasing.";
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I hit an error looking that up. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center"
      >
        <Bot size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">AI Assistant</p>
                    <p className="text-[10px] text-white/70">Ask me anything about your HR data</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin text-indigo-500" />
                        <span className="text-xs text-slate-400">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {showSuggestions && messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles size={10} /> Try asking
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    placeholder="Ask something..."
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || loading}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-40 transition-opacity"
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
