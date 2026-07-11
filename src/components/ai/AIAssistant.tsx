"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How many employees do we have?",
  "Show me employees in Engineering",
  "Who's due for a promotion?",
  "Summarize the dashboard",
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

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/workflow/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer || "I couldn't find an answer to that." }]);
    } catch {
      // Fallback local responses
      const q = text.toLowerCase();
      let answer = "";
      if (q.includes("employee") && (q.includes("how many") || q.includes("count"))) {
        answer = "Let me check your employee roster... We have **18 active employees** across 6 departments.";
      } else if (q.includes("engineering")) {
        answer = "The **Engineering** team has 4 members: Robert Kovac (Director), Liam Neeson, Noah Centineo, and Oliver Jackson.";
      } else if (q.includes("promotion") || q.includes("due")) {
        answer = "Based on performance data, **Emma Watson** (Marketing Coordinator) and **Benjamin Franklin** (Financial Analyst) are top candidates for promotion this quarter.";
      } else if (q.includes("summary") || q.includes("dashboard")) {
        answer = "Here's your snapshot: **18 employees**, **4 open jobs**, **12 candidates** in pipeline, **3 pending leaves**, and **2 trainings** overdue. Overall engagement score: **82%**.";
      } else {
        answer = "I can help with employee info, department stats, performance insights, and more. Try one of the suggested questions above!";
      }
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
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
              {/* Header */}
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

              {/* Messages */}
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

              {/* Suggestions */}
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

              {/* Input */}
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
