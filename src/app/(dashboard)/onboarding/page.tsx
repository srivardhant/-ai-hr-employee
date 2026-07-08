"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { WorkflowTimeline, WorkflowStep } from "@/components/workflow/WorkflowTimeline";
import { UserPlus, Sparkles, AlertCircle, ArrowRight, Play, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active executing workflow state
  const [executingWorkflow, setExecutingWorkflow] = useState<any | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [executingName, setExecutingName] = useState("");
  const [isExecutingOpen, setIsExecutingOpen] = useState(false);

  // Details Modal
  const [selectedOnboarding, setSelectedOnboarding] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    candidateId: "",
    name: "",
    position: "",
    department: "Engineering",
    salary: "",
  });

  const [useCustomInput, setUseCustomInput] = useState(false);

  const fetchData = async () => {
    try {
      const onboardRes = await fetch("/api/onboarding");
      const candRes = await fetch("/api/candidates");
      if (onboardRes.ok && candRes.ok) {
        setOnboardings(await onboardRes.json());
        setCandidates(await candRes.json());
      }
    } catch (e) {
      toast.error("Failed to load onboarding profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setIsExecutingOpen(true);
    setWorkflowSteps([]);

    // Determine target name
    let nameToUse = form.name;
    if (!useCustomInput && form.candidateId) {
      const cand = candidates.find((c) => c.id === form.candidateId);
      if (cand) nameToUse = cand.name;
    }
    setExecutingName(nameToUse);

    try {
      setSubmitting(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useCustomInput
            ? { name: form.name, position: form.position, department: form.department, salary: form.salary }
            : { candidateId: form.candidateId }
        ),
      });

      if (res.ok) {
        const result = await res.json();
        setExecutingWorkflow(result);
        setWorkflowSteps(result.steps);
        toast.success("AI Onboarding Workflow executed successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Onboarding workflow failed");
      }
    } catch (err) {
      toast.error("Error executing workflow engine.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock executing loader step changes to show active animations to user
  useEffect(() => {
    if (isExecutingOpen && submitting && workflowSteps.length === 0) {
      // Simulate step increments locally while wait for response
      const mockSteps: WorkflowStep[] = [
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
      ];
      setWorkflowSteps(mockSteps);

      // Animate progress incrementally
      let currentIdx = 0;
      const interval = setInterval(() => {
        setWorkflowSteps((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          
          if (currentIdx < next.length) {
            // mark previous as completed
            if (currentIdx > 0) {
              next[currentIdx - 1].status = "COMPLETED";
              next[currentIdx - 1].result = "Completed";
            }
            // mark current as running
            next[currentIdx].status = "RUNNING";
            currentIdx++;
          } else {
            clearInterval(interval);
          }
          return next;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isExecutingOpen, submitting, workflowSteps.length]);

  const viewDetails = (onboarding: any) => {
    setSelectedOnboarding(onboarding);
    setIsDetailsOpen(true);
  };

  const getChecklistArray = (checklistStr?: string | null) => {
    if (!checklistStr) return [];
    try {
      return JSON.parse(checklistStr);
    } catch {
      return [];
    }
  };

  const getOrientationArray = (scheduleStr?: string | null) => {
    if (!scheduleStr) return [];
    try {
      return JSON.parse(scheduleStr);
    } catch {
      return [];
    }
  };

  // Filter candidates accepted offer to start onboarding
  const hiredCandidates = candidates.filter((c) => ["ACCEPTED", "OFFERED"].includes(c.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Onboarding Portal"
        description="Launch 10-step autonomous employee onboarding campaigns, view timeline statuses, and verify checklists."
        action={
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Start Onboarding
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Onboarding Employees</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading onboarding lists...</div>
          ) : onboardings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No onboarding processes running.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department & Role</TableHead>
                  <TableHead>Onboarding Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onboardings.map((onb) => (
                  <TableRow key={onb.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{onb.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{onb.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{onb.employee?.position}</div>
                        <div className="text-xs text-slate-400">{onb.employee?.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {onb.startedAt ? new Date(onb.startedAt).toLocaleDateString() : "Pending"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={onb.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => viewDetails(onb)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Start Onboarding Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Trigger Autonomous Onboarding Workflow"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-500">Onboard Mode</span>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setUseCustomInput(false)}
                className={`text-[10px] px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  !useCustomInput ? "bg-white dark:bg-slate-855 text-indigo-500 shadow-sm" : "text-slate-500"
                }`}
              >
                Hired Candidate
              </button>
              <button
                onClick={() => setUseCustomInput(true)}
                className={`text-[10px] px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  useCustomInput ? "bg-white dark:bg-slate-855 text-indigo-500 shadow-sm" : "text-slate-500"
                }`}
              >
                Custom Profile
              </button>
            </div>
          </div>

          <form onSubmit={handleStartOnboarding} className="space-y-4">
            {!useCustomInput ? (
              <Select
                label="Hired Candidate"
                options={hiredCandidates.map((c) => ({ value: c.id, label: c.name }))}
                value={form.candidateId}
                placeholder="Select Hired Candidate"
                required
                onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label="Employee Name"
                  placeholder="e.g. John Doe"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Position / Role"
                    placeholder="e.g. Developer"
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  />
                  <Select
                    label="Department"
                    options={[
                      { value: "Engineering", label: "Engineering" },
                      { value: "Design", label: "Design" },
                      { value: "Marketing", label: "Marketing" },
                      { value: "Sales", label: "Sales" },
                      { value: "HR", label: "HR" },
                      { value: "Finance", label: "Finance" },
                    ]}
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <Input
                  label="Annual Salary ($)"
                  type="number"
                  placeholder="e.g. 85000"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                <strong>Autonomous Workflow execution:</strong> Clicking launch runs 10 steps sequentially: creates profiles, employee IDs, mail boxes, default compliance classes, schedules inductions, welcome letters, checklist logs, and alerts.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Play className="w-4 h-4" />}>
                Launch Onboarding
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Execution Progress Modal */}
      <Modal
        isOpen={isExecutingOpen}
        onClose={() => !submitting && setIsExecutingOpen(false)}
        title={`AI Onboarding Agent: ${executingName}`}
      >
        <div className="space-y-6">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30 flex items-center gap-3">
            {submitting ? (
              <div className="w-6 h-6 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Sparkles className="w-6 h-6 text-indigo-500 flex-shrink-0 animate-bounce-subtle" />
            )}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {submitting ? "Agent processing tasks..." : "Workflow Completed!"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {submitting ? "Automatically generating profiles and syncing database nodes" : "Employee has been successfully activated in SQLite."}
              </p>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1 py-1">
            <WorkflowTimeline steps={workflowSteps} />
          </div>

          {!submitting && (
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setIsExecutingOpen(false)}>
                Done & Close
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Details View Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Onboarding dossier: ${selectedOnboarding?.employee?.name || ""}`}
        size="lg"
      >
        {selectedOnboarding && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Position</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedOnboarding.employee?.position}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedOnboarding.employee?.department}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedOnboarding.employee?.employeeId}
                </p>
              </div>
            </div>

            {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  HR Orientation Checklist
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                  {getChecklistArray(selectedOnboarding.checklist).length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-full text-center py-4">No checklist items yet.</p>
                  ) : (
                    getChecklistArray(selectedOnboarding.checklist).map((chk: any) => (
                      <div key={chk.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={chk.done}
                          disabled
                          className="w-4 h-4 rounded border-slate-300 bg-slate-100 text-indigo-650"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-350">{chk.task}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Week 1 Induction Schedule
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 divide-y divide-slate-200/50 dark:divide-slate-800/40 space-y-3">
                  {getOrientationArray(selectedOnboarding.orientationSchedule).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No orientation schedule set.</p>
                  ) : (
                    getOrientationArray(selectedOnboarding.orientationSchedule).map((sched: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-start gap-4 pt-3 first:pt-0">
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded border border-indigo-500/20">
                          {sched.day}
                        </span>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sched.title} - <span className="text-slate-400">{sched.time}</span>
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-450">{sched.notes}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Welcome Letter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Contracts Welcome Letter
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {selectedOnboarding.welcomeLetter ? (
                    <pre className="text-[11px] text-slate-650 dark:text-slate-400 font-sans whitespace-pre-wrap leading-relaxed">
                      {selectedOnboarding.welcomeLetter}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No welcome letter generated.</p>
                  )}
                </div>
              </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
