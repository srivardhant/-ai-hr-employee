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
  "Pending leave requests",
  "Scheduled interviews",
  "Training status",
];

async function fetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function fmt(n: number) { return (n || 0).toLocaleString(); }

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
    let answer = "";

    try {
      // --- Employee count ---
      if (/how many|employee.*(?:count|total|many)|headcount/.test(q)) {
        const emps = await fetchJson("/api/employees");
        if (emps?.length) answer = `We have **${emps.length} employees** total across all departments.`;
      }

      // --- Department team ---
      else if (/(?:show|list|who|which|tell|team|department)\s+.*(?:engineering|design|marketing|sales|finance|hr)/i.test(q)) {
        const depts: Record<string, string> = { engineering:"Engineering", design:"Design", marketing:"Marketing", sales:"Sales", finance:"Finance", hr:"HR" };
        const match = Object.keys(depts).find(d => q.includes(d) || q.includes(depts[d].toLowerCase()));
        if (match) {
          const emps = await fetchJson(`/api/employees?department=${depts[match]}`);
          if (emps?.length) {
            const lines = emps.map((e: any) => `• **${e.name}** — ${e.position}`).join("\n");
            answer = `**${depts[match]}** team (${emps.length}):\n${lines}`;
          }
        }
        if (!answer) answer = "I couldn't find that department. Try: Engineering, Design, Marketing, Sales, Finance, or HR.";
      }

      // --- Who is X? ---
      else if (/^who(?:'s| is)\s+(.+)/i.test(q)) {
        const name = q.match(/^who(?:'s| is)\s+(.+)/i)?.[1]?.trim();
        if (name) {
          const emps = await fetchJson(`/api/employees?search=${encodeURIComponent(name)}`);
          if (emps?.length) {
            const e = emps[0];
            answer = `**${e.name}** (${e.employeeId})\n• Role: ${e.position}\n• Department: ${e.department}\n• Salary: $${fmt(e.salary)}\n• Status: ${e.status || "Active"}`;
          } else {
            answer = `No employee found matching "${name}".`;
          }
        }
      }

      // --- Leaves ---
      else if (/leave|time off|vacation|pto|sick/.test(q)) {
        const leaves = await fetchJson("/api/leave");
        if (leaves?.length) {
          const pending = leaves.filter((l: any) => l.status === "PENDING");
          const approved = leaves.filter((l: any) => l.status === "APPROVED");
          answer = `**${leaves.length} leave records** (${pending.length} pending, ${approved.length} approved).`;
          if (pending.length) {
            answer += `\nPending:\n${pending.slice(0, 5).map((l: any) => `• ${l.employee?.name || "Someone"} — ${l.days} day(s) ${l.type} (${l.reason || "no reason"})`).join("\n")}`;
          }
        } else {
          answer = "No leave records found.";
        }
      }

      // --- Payroll ---
      else if (/payroll|salary|pay|compensation/.test(q)) {
        const payrolls = await fetchJson("/api/payroll");
        if (payrolls?.length) {
          const total = payrolls.reduce((s: number, p: any) => s + (p.netPay || 0), 0);
          const months = [...new Set(payrolls.map((p: any) => `${p.month}/${p.year}`))];
          const avg = total / payrolls.length;
          answer = `**${payrolls.length} payroll records** across ${months.length} month(s).\nTotal net pay: **$${fmt(total)}**\nAverage per record: **$${fmt(Math.round(avg))}**`;
        } else {
          answer = "No payroll records found.";
        }
      }

      // --- Promotions ---
      else if (/promotion|promote|career|advance/.test(q)) {
        const promos = await fetchJson("/api/promotions");
        if (promos?.length) {
          answer = `**${promos.length} promotion record(s)**\n${promos.slice(0, 5).map((p: any) => `• ${p.employee?.name || "Someone"}: ${p.fromPosition || "?"} → **${p.toPosition}** ($${fmt(p.fromSalary)} → $${fmt(p.toSalary)})`).join("\n")}`;
        } else {
          answer = "No promotions recorded yet.";
        }
      }

      // --- Training ---
      else if (/training|course|compliance|learn/.test(q)) {
        const assignments = await fetchJson("/api/training?all=true");
        if (assignments?.length) {
          const overdue = assignments.filter((a: any) => a.status === "OVERDUE" || a.status === "ASSIGNED");
          const completed = assignments.filter((a: any) => a.status === "COMPLETED");
          answer = `**${assignments.length} training assignments** (${overdue.length} pending, ${completed.length} completed).`;
          if (overdue.length) {
            answer += `\nPending/Overdue:\n${overdue.slice(0, 5).map((a: any) => `• ${a.employee?.name || "Someone"} — ${a.training?.title || "Unknown course"} (${a.status}, ${a.progress}%)`).join("\n")}`;
          }
        } else {
          const courses = await fetchJson("/api/training");
          answer = courses?.length ? `**${courses.length} training courses** available. No assignments yet.` : "No training records found.";
        }
      }

      // --- Candidates / Recruitment ---
      else if (/candidate|recruit|job|hiring|offer|open.?ing/.test(q)) {
        const cands = await fetchJson("/api/candidates");
        if (cands?.length) {
          const byStatus: Record<string, number> = {};
          for (const c of cands) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
          answer = `**${cands.length} candidates** in pipeline:\n${Object.entries(byStatus).map(([k, v]) => `• ${k}: ${v}`).join("\n")}`;
        } else {
          answer = "No candidates found.";
        }
      }

      // --- Performance ---
      else if (/performance|review|rating|appraisal/.test(q)) {
        const reviews = await fetchJson("/api/performance");
        if (reviews?.length) {
          const avg = reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length;
          answer = `**${reviews.length} performance review(s)**. Average rating: **${avg.toFixed(1)}/5**.`;
          if (reviews.length <= 5) {
            answer += `\n${reviews.map((r: any) => `• ${r.employee?.name || "Someone"}: Q${r.quarter}/${r.year} — ${r.rating}/5`).join("\n")}`;
          }
        } else {
          answer = "No performance reviews yet.";
        }
      }

      // --- Interviews ---
      else if (/interview|schedule.*interview|panel/.test(q)) {
        const interviews = await fetchJson("/api/interviews");
        if (interviews?.length) {
          const upcoming = interviews.filter((i: any) => i.status === "SCHEDULED");
          const completed = interviews.filter((i: any) => i.status === "COMPLETED");
          answer = `**${interviews.length} interviews** (${upcoming.length} scheduled, ${completed.length} completed).`;
          if (upcoming.length) {
            answer += `\nUpcoming:\n${upcoming.slice(0, 5).map((i: any) => `• ${i.candidate?.name || "Candidate"} — ${i.type} (${new Date(i.scheduledAt).toLocaleDateString()})`).join("\n")}`;
          }
        } else {
          answer = "No interviews scheduled.";
        }
      }

      // --- Onboarding ---
      else if (/onboarding|onboard|new hire/.test(q)) {
        const onboardings = await fetchJson("/api/onboarding");
        if (onboardings?.length) {
          const pending = onboardings.filter((o: any) => o.status !== "COMPLETED");
          answer = `**${onboardings.length} onboarding(s)** (${pending.length} in progress).`;
        } else {
          answer = "No onboarding records found.";
        }
      }

      // --- Offers ---
      else if (/offer|offer letter/.test(q)) {
        const offers = await fetchJson("/api/offers");
        if (offers?.length) {
          const pending = offers.filter((o: any) => o.status === "DRAFT" || o.status === "SENT");
          answer = `**${offers.length} offer(s)** (${pending.length} pending).`;
          if (offers.length <= 5) {
            answer += `\n${offers.map((o: any) => `• ${o.candidate?.name || "Candidate"} — ${o.position} ($${fmt(o.salary)})`).join("\n")}`;
          }
        } else {
          answer = "No offers found.";
        }
      }

      // --- Evaluations ---
      else if (/evaluation|evaluate|score/.test(q)) {
        const evals = await fetchJson("/api/evaluations");
        if (evals?.length) {
          const avg = evals.reduce((s: number, e: any) => s + (e.overallScore || 0), 0) / evals.length;
          answer = `**${evals.length} evaluation(s)**. Average overall score: **${avg.toFixed(1)}/10**.`;
        } else {
          answer = "No evaluations found.";
        }
      }

      // --- Summary ---
      else if (/summary|dashboard|overview|snapshot/.test(q)) {
        const [emps, cands, leaves, payrolls, promos, interviews] = await Promise.all([
          fetchJson("/api/employees"),
          fetchJson("/api/candidates"),
          fetchJson("/api/leave"),
          fetchJson("/api/payroll"),
          fetchJson("/api/promotions"),
          fetchJson("/api/interviews"),
        ]);
        const empCount = emps?.length || 0;
        const candCount = cands?.length || 0;
        const leavePending = leaves?.filter((l: any) => l.status === "PENDING").length || 0;
        const payrollTotal = payrolls?.reduce((s: number, p: any) => s + (p.netPay || 0), 0) || 0;
        const promoCount = promos?.length || 0;
        const interviewCount = interviews?.length || 0;
        answer = `**Company Snapshot**\n• Employees: **${empCount}**\n• Candidates: **${candCount}**\n• Pending leaves: **${leavePending}**\n• Payroll total: **$${fmt(payrollTotal)}**\n• Promotions: **${promoCount}**\n• Interviews: **${interviewCount}**`;
      }

      // --- Greeting ---
      else if (/^(hi|hello|hey|good )/.test(q)) {
        answer = "Hello! I can look up **employees**, **departments**, **payroll**, **leave**, **training**, **promotions**, **candidates**, **interviews**, **onboarding**, **offers**, and **evaluations** from your live HR data. Try asking something!";
      }

      // --- Fallback ---
      else {
        answer = "I can look up live data about **employees**, **departments**, **payroll**, **leave**, **training**, **promotions**, **candidates**, **interviews**, **onboarding**, **offers**, and **evaluations**. Try:\n• *\"How many employees?\"*\n• *\"Show Engineering team\"*\n• *\"Scheduled interviews\"*\n• *\"Pending leave requests\"*";
      }

      if (!answer) answer = "I couldn't find anything. Try rephrasing your question.";
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I hit an error looking that up. Please try again." }]);
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
