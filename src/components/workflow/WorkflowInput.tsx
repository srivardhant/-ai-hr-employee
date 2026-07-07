'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

/* ────────────── Types ────────────── */

interface WorkflowInputProps {
  onExecute: (prompt: string) => void;
  loading?: boolean;
  className?: string;
}

const examplePrompts = [
  'Post a job for Senior React Developer',
  'Schedule interviews for shortlisted candidates',
  'Generate monthly payroll report',
  'Create onboarding plan for new hires',
  'Evaluate employee performance reviews',
  'Process leave requests for this month',
];

/* ────────────── Component ────────────── */

export default function WorkflowInput({
  onExecute,
  loading = false,
  className = '',
}: WorkflowInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !loading) {
      onExecute(prompt.trim());
    }
  };

  const handleChipClick = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className={className}>
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            AI Workflow Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Describe a task and let AI handle the workflow
          </p>
        </div>
      </div>

      {/* ─── Input Area ─── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to do, e.g., 'Post a job for Senior React Developer'..."
            disabled={loading}
            rows={4}
            className="
              w-full px-4 py-3 rounded-xl text-sm resize-none
              bg-white dark:bg-slate-800/80
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
              dark:focus:ring-indigo-400/50 dark:focus:border-indigo-400
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200
            "
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
        </div>

        {/* ─── Execute Button ─── */}
        <motion.button
          type="submit"
          disabled={!prompt.trim() || loading}
          whileHover={!loading && prompt.trim() ? { scale: 1.02, y: -1 } : {}}
          whileTap={!loading && prompt.trim() ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="
            w-full flex items-center justify-center gap-2.5
            px-6 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            text-white shadow-lg shadow-indigo-500/25
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            transition-all duration-200
          "
        >
          {loading ? (
            <>
              <Spinner size="sm" color="white" />
              Executing Workflow...
            </>
          ) : (
            <>
              <Send size={16} />
              Execute Workflow
            </>
          )}
        </motion.button>
      </form>

      {/* ─── Example Prompts ─── */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={13} className="text-indigo-500 dark:text-indigo-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Try these examples
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((ep) => (
            <motion.button
              key={ep}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleChipClick(ep)}
              disabled={loading}
              className="
                px-3 py-1.5 text-xs font-medium rounded-lg
                bg-slate-100 dark:bg-slate-800
                text-slate-600 dark:text-slate-300
                hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                hover:text-indigo-600 dark:hover:text-indigo-400
                border border-slate-200/60 dark:border-slate-700/50
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {ep}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
