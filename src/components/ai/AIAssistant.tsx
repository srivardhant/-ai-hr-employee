"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, User, Briefcase, DollarSign, Calendar, GraduationCap, Users, Star } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How many employees do we have?",
  "Show me employees in Engineering",
  "Who's due for a promotion?",
  "Summarize the dashboard",
  "Who is Emma Watson?",
  "What about payroll?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your AI HR assistant. Ask me anything about your workforce." },
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

  const responses = useMemo(() => [
    { keywords: ["how many", "count", "total", "headcount", "employees"], reply: "We have **18 active employees** across 6 departments: Engineering (4), Design (2), Marketing (3), Sales (2), HR (3), and Finance (2)." },
    { keywords: ["engineering", "dev", "developer", "tech team"], reply: "The **Engineering** team has 4 members: Robert Kovac (Director), Liam Neeson (Staff Engineer), Noah Centineo (Software Engineer II), and Oliver Jackson (Frontend Engineer)." },
    { keywords: ["design", "designer", "ui", "ux"], reply: "The **Design** team has 2 members: Elijah Wood (Senior UI/UX Designer) and James McAvoy (Product Designer)." },
    { keywords: ["marketing"], reply: "The **Marketing** team has 3 members: Emma Watson (Marketing Coordinator), Sophia Loren (Growth Lead), and Isabella Rossellini (SEO Analyst)." },
    { keywords: ["sales"], reply: "The **Sales** team has 2 members: Mia Farrow (Account Executive) and Charlotte Gainsbourg (Sales Specialist)." },
    { keywords: ["finance", "accounting"], reply: "The **Finance** team has 2 members: Amelia Earhart (Senior Accountant) and Benjamin Franklin (Financial Analyst)." },
    { keywords: ["hr", "human resource"], reply: "The **HR** team has 3 members plus Sarah Jenkins (Head of People Operations): Oliver Jackson (Recruiting Coordinator), Henry Cavill (HR Generalist — but he's currently listed under Engineering in our system)." },
    { keywords: ["promotion", "due", "promote", "career"], reply: "Based on performance data, **Emma Watson** (Marketing Coordinator, rating 4.2) and **Benjamin Franklin** (Financial Analyst, rating 4.0) are top candidates for promotion this quarter." },
    { keywords: ["summary", "dashboard", "overview", "snapshot"], reply: "Here's your company snapshot:\n• **18 employees** across 6 departments\n• **4 open job positions**\n• **12 candidates** in pipeline\n• **3 pending** leave requests\n• **2 trainings** overdue\n• **1 performance review** completed this quarter\n• Overall engagement score: **82%**" },
    { keywords: ["leave", "time off", "vacation", "pto", "sick"], reply: "There are **3 pending leave requests**. Emma Watson has 5 days of Annual leave awaiting approval. 2 other requests are being reviewed by HR." },
    { keywords: ["training", "course", "learn", "compliance"], reply: "**2 mandatory trainings** are overdue: 'SaaS Enterprise Compliance' and 'Information Security & Cybersecurity Awareness'. 12 employees have completed compliance training. 4 assignments are in progress." },
    { keywords: ["salary", "pay", "compensation", "payroll"], reply: "The current payroll runs at **$295,000/month** across 18 employees. The highest earner is Robert Kovac (Engineering Director) at $165,000/year. Average salary is **$82,000/year**." },
    { keywords: ["offer", "hiring", "candidate", "recruit"], reply: "We have **4 open positions**: Senior Fullstack Engineer (2 openings), Lead UI/UX Designer (1), HR Specialist (1 — on hold). **12 candidates** are in various stages: 1 SCREENING, 1 INTERVIEW, 1 OFFERED, 1 REJECTED." },
    { keywords: ["performance", "review", "rating"], reply: "The most recent performance review was for **Emma Watson** — Q1 2026 rating: **4.2/5**. AI suggests enrolling in Advanced Skill Training and encouraging cross-departmental collaboration." },
    { keywords: ["onboard", "new hire", "joining"], reply: "The latest onboarding was **Michael Chen**, onboarded as Senior Developer in Engineering via the AI Workflow. The autonomous 10-step process completed successfully including ID generation, email provisioning, department assignment, and training enrollment." },
    { keywords: ["hello", "hi ", "hey", "good morning", "good evening"], reply: "Hello! I'm your AI HR assistant. I can help with employee info, department stats, performance insights, payroll, and more. Try asking something like 'How many employees?' or 'Who's due for promotion?'" },
    { keywords: ["help", "what can you", "capabilities", "what do you"], reply: "I can answer questions about:\n• **Employees** — headcount, department teams, roles\n• **Recruitment** — candidates, offers, job openings\n• **Performance** — reviews, ratings, promotions\n• **Operations** — leave, training, payroll\n• **AI Workflow** — onboarding, promotions\n\nTry one of the suggested questions!" },
    { keywords: ["who is", "tell me about", "find"], reply: "I can look up employees by name. Try asking 'Who is Emma Watson?' or 'Tell me about Robert Kovac'." },
    { keywords: ["thank", "thanks", "appreciate"], reply: "You're welcome! Happy to help. Feel free to ask anything else about your HR data." },
  ], []);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

    const q = text.toLowerCase().trim();

    // Try fetching real employee data for "who is X" queries
    const whoMatch = q.match(/who (?:is|are)\s+(.+)/);
    if (whoMatch) {
      try {
        const res = await fetch(`/api/employees?search=${encodeURIComponent(whoMatch[1])}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const emp = data[0];
            setMessages((prev) => [...prev, { role: "assistant", text: `**${emp.name}** (${emp.employeeId}) — ${emp.position} in ${emp.department}. Salary: $${emp.salary?.toLocaleString() || 'N/A'}. Status: ${emp.status || 'Active'}.` }]);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    // Try fetching employee search results for "find X"
    const findMatch = q.match(/find\s+(.+)/);
    if (findMatch) {
      try {
        const res = await fetch(`/api/employees?search=${encodeURIComponent(findMatch[1])}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const names = data.map((e: any) => `**${e.name}** (${e.position})`).join(", ");
            setMessages((prev) => [...prev, { role: "assistant", text: `Found ${data.length} match(es): ${names}` }]);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    // Check patterns for matching job titles or employee names
    const nameCheck = q.match(/(?:about|is|does|do)\s+([a-z]+ [a-z]+)/);
    if (nameCheck) {
      try {
        const res = await fetch(`/api/employees?search=${encodeURIComponent(nameCheck[1])}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const emp = data[0];
            setMessages((prev) => [...prev, { role: "assistant", text: `**${emp.name}** (${emp.employeeId}) — ${emp.position} in ${emp.department}. Salary: $${emp.salary?.toLocaleString() || 'N/A'}.` }]);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    // Match against keyword patterns
    let answer = "";
    for (const r of responses) {
      if (r.keywords.some((k) => q.includes(k))) {
        answer = r.reply;
        break;
      }
    }

    if (!answer) {
      answer = "I'm not sure about that specific query. I can help with employee info, departments, recruitment, payroll, leave, training, promotions, and performance. Try one of the suggested questions above, or ask 'Who is Emma Watson?'";
    }
    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    setLoading(false);
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
