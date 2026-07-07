"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import WorkflowInput from "@/components/workflow/WorkflowInput";
import { WorkflowTimeline, WorkflowStep } from "@/components/workflow/WorkflowTimeline";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Sparkles, BrainCircuit, Bot, Play, Cpu, History } from "lucide-react";
import toast from "react-hot-toast";

export default function WorkflowConsolePage() {
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);

  // Active executing workflow state
  const [executing, setExecuting] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<any | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [activeInput, setActiveInput] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/workflow");
      if (res.ok) {
        setWorkflowLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExecute = async (input: string) => {
    setExecuting(true);
    setActiveInput(input);
    setWorkflowSteps([]);
    setActiveWorkflow(null);

    // Initial parsing to show mock loader timeline to user while executing
    const normalized = input.toLowerCase();
    const detectOnboarding =
      normalized.includes("join") ||
      normalized.includes("onboard") ||
      normalized.includes("new employee");

    const detectInterview =
      normalized.includes("interview") ||
      normalized.includes("schedule");

    const stepsList: WorkflowStep[] = detectOnboarding
      ? [
          { id: "1", name: "Create Employee Profile", description: "Initialize profile in database", status: "RUNNING" },
          { id: "2", name: "Generate Employee ID", description: "Allocate unique business identifier", status: "PENDING" },
          { id: "3", name: "Generate Company Email", description: "Register @aihr.com active directory address", status: "PENDING" },
          { id: "4", name: "Assign Department", description: "Establish cost center and seat map", status: "PENDING" },
          { id: "5", name: "Assign Manager", description: "Link hierarchical reporting lines", status: "PENDING" },
          { id: "6", name: "Assign Mandatory Trainings", description: "Enroll in compliance and cyber security courses", status: "PENDING" },
          { id: "7", name: "Generate Orientation Schedule", description: "Produce week-1 day-by-day induction plan", status: "PENDING" },
          { id: "8", name: "Generate Welcome Letter", description: "Compose draft contract welcome letter", status: "PENDING" },
          { id: "9", name: "Generate Employee Checklist", description: "Create interactive task list for HR Portal", status: "PENDING" },
          { id: "10", name: "Complete Database Transaction & Notify", description: "Commit all records and notify dashboard stakeholders", status: "PENDING" },
        ]
      : detectInterview
      ? [
          { id: "1", name: "Analyze Scheduling Request", description: "Parse interview criteria and candidate pool", status: "RUNNING" },
          { id: "2", name: "Identify Shortlisted Candidates", description: "Filter candidates matching the criteria", status: "PENDING" },
          { id: "3", name: "Schedule Interview Slots", description: "Create interview records for qualified candidates", status: "PENDING" },
          { id: "4", name: "Notify Panel & Candidates", description: "Send dashboard alerts", status: "PENDING" },
        ]
      : [
          { id: "1", name: "Locate Employee Profile", description: "Search database for matching employee", status: "RUNNING" },
          { id: "2", name: "Calculate Salary Revision", description: "Review current compensation and apply revisions", status: "PENDING" },
          { id: "3", name: "Create Promotion Record", description: "Commit new promotion entity in DB", status: "PENDING" },
          { id: "4", name: "Update Employee Position & Compensation", description: "Update main employee profile", status: "PENDING" },
          { id: "5", name: "Notify Manager & Employee", description: "Send automated dashboard alerts", status: "PENDING" },
        ];

    setWorkflowSteps(stepsList);

    // Increment steps locally for visual polish
    let currentIdx = 0;
    const interval = setInterval(() => {
      setWorkflowSteps((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        if (currentIdx < next.length) {
          if (currentIdx > 0) {
            next[currentIdx - 1].status = "COMPLETED";
            next[currentIdx - 1].result = "Completed";
          }
          next[currentIdx].status = "RUNNING";
          currentIdx++;
        } else {
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, triggeredBy: "HR Console" }),
      });

      clearInterval(interval);

      if (res.ok) {
        const data = await res.json();
        setActiveWorkflow(data);
        setWorkflowSteps(data.steps);
        toast.success("AI Agent completed workflow task!");
        fetchLogs();
      } else {
        const err = await res.json();
        toast.error(err.error || "Workflow failed");
        setExecuting(false);
      }
    } catch (e) {
      clearInterval(interval);
      toast.error("Error communicating with AI engine.");
      setExecuting(false);
    } finally {
      setExecuting(false);
    }
  };

  const handleSelectLog = (log: any) => {
    setActiveInput(log.input);
    setActiveWorkflow(log);
    try {
      setWorkflowSteps(JSON.parse(log.steps));
    } catch {
      setWorkflowSteps([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autonomous AI HR Agent Console"
        description="Enter natural language commands. The HR Agent parses instructions and executes multi-step DB workflows autonomously."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Workspace Console */}
        <div className="xl:col-span-2 space-y-6">
          <WorkflowInput onExecute={handleExecute} loading={executing} />

          {/* Active timeline logs */}
          {(executing || activeWorkflow) && (
            <Card className="border border-indigo-500/20 dark:border-indigo-500/30">
              <CardHeader className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 dark:text-white">Active Timeline Execution</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-left space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instruction Query</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-350 italic">
                    &ldquo;{activeInput}&rdquo;
                  </p>
                  {activeWorkflow?.resultSummary && (
                    <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-2 text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-2">
                      <Cpu className="w-4 h-4" />
                      <span>{activeWorkflow.resultSummary}</span>
                    </div>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-1 py-1">
                  <WorkflowTimeline steps={workflowSteps} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Agent Execution History</h3>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar p-0">
              {logsLoading ? (
                <div className="text-center py-6 text-slate-500">Loading history...</div>
              ) : workflowLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-medium">No records found.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {workflowLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => handleSelectLog(log)}
                      className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors cursor-pointer text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                          {log.workflowType}
                        </span>
                        <StatusBadge status={log.status} className="h-4.5 text-[9px] px-1.5" />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-350 line-clamp-2 leading-relaxed">
                        {log.input}
                      </p>
                      <span className="text-[9px] text-slate-450 font-semibold block">
                        {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
