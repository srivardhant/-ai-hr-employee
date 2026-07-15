"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users, ChevronDown, ChevronRight, Search, User, Briefcase, Mail, Phone } from "lucide-react";

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then(r => r.ok ? r.json() : [])
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Build org tree: find root (no manager) and build hierarchy
  const buildTree = (parentId: string | null): any[] => {
    return employees
      .filter(e => e.managerId === parentId)
      .map(e => ({ ...e, children: buildTree(e.id) }));
  };

  const tree = buildTree(null);

  const renderNode = (node: any, depth = 0) => (
    <div key={node.id} style={{ marginLeft: depth * 28 }}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {node.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{node.name}</p>
          <p className="text-xs text-slate-400">{node.position} &middot; {node.department}</p>
        </div>
        {node.children.length > 0 && (
          <button onClick={() => toggleExpand(node.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            {expanded.has(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </motion.div>
      {expanded.has(node.id) && node.children.map((child: any) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Organization Chart" description="Visual hierarchy of your company structure"
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
            <Users className="w-3.5 h-3.5" />{employees.length} Employees
          </div>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees in org chart..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">No employees found</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
          {tree.map((node: any) => renderNode(node))}
        </div>
      )}
    </div>
  );
}