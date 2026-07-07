"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Check, X, ShieldAlert, AlertTriangle, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function ExitProcessPage() {
  const [exits, setExits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");
  const [currentEmpId, setCurrentEmpId] = useState("");

  // Details Modal state
  const [selectedExit, setSelectedExit] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    resignationDate: "",
    lastWorkingDate: "",
    reason: "",
  });

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      let userRole = "HR";
      let empId = "";

      if (userStr) {
        const u = JSON.parse(userStr);
        userRole = u.role || "HR";
        setRole(userRole);
      }

      const empRes = await fetch("/api/employees");
      const exitRes = await fetch("/api/exit");

      if (empRes.ok && exitRes.ok) {
        const empData = await empRes.json();
        const exitData = await exitRes.json();
        setEmployees(empData);
        setExits(exitData);

        if (userStr) {
          const u = JSON.parse(userStr);
          const activeEmp = empData.find((e: any) => e.companyEmail === u.email || e.email === u.email);
          if (activeEmp) {
            empId = activeEmp.id;
          } else {
            const meRes = await fetch(`/api/employees?email=${encodeURIComponent(u.email)}`);
            if (meRes.ok) {
              const me = await meRes.json();
              if (me && !Array.isArray(me)) { empId = me.id; empData.unshift(me); }
            }
          }
          setCurrentEmpId(empId);
          setForm((prev) => ({ ...prev, employeeId: empId }));
        }
      }
    } catch (e) {
      toast.error("Failed to load offboarding registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) {
      toast.error("Employee profile association required to offboard.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Resignation registered successfully!");
        setIsModalOpen(false);
        setForm({
          employeeId: currentEmpId,
          resignationDate: "",
          lastWorkingDate: "",
          reason: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit resignation");
      }
    } catch (e) {
      toast.error("Error creating exit logs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateChecklist = async (exit: any, checklistIndex: number) => {
    try {
      const list = JSON.parse(exit.assetReturn);
      list[checklistIndex].returned = !list[checklistIndex].returned;

      // check if all returned
      const allDone = list.every((item: any) => item.returned);
      const clearanceStatus = allDone ? "COMPLETED" : "IN_PROGRESS";

      const res = await fetch("/api/exit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exit.id,
          assetReturn: list,
          clearanceStatus,
        }),
      });

      if (res.ok) {
        toast.success("Asset checklist updated!");
        fetchData();
        // Update details modal if open
        if (selectedExit && selectedExit.id === exit.id) {
          const updated = await res.json();
          setSelectedExit(updated);
        }
      }
    } catch (e) {
      toast.error("Failed to update checklist.");
    }
  };

  const handleProcessSettlement = async (exitId: string, amount: string) => {
    try {
      const res = await fetch("/api/exit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exitId,
          settlementAmount: amount,
          settlementStatus: "PAID",
          status: "COMPLETED", // complete offboarding
        }),
      });

      if (res.ok) {
        toast.success("Final settlement paid out. Offboarding Completed!");
        setIsDetailsOpen(false);
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to finalize settlement.");
    }
  };

  const getChecklistArray = (jsonStr?: string) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exit Process & Offboarding"
        description="Administer staff resignations, monitor security clearances, track returned company assets, and complete final settlements."
        action={
          isEmployee && (
            <Button
              variant="danger"
              icon={<ShieldAlert className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Submit Resignation
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Active Offboarding Files</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading offboarding statements...</div>
          ) : exits.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No exit offboarding files active.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Resignation Date</TableHead>
                  <TableHead>Last Working Date</TableHead>
                  <TableHead>Clearance</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exits.map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{ex.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{ex.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(ex.resignationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{new Date(ex.lastWorkingDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={ex.clearanceStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ex.settlementStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ex.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExit(ex);
                          setIsDetailsOpen(true);
                        }}
                      >
                        Checklist & Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resignation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Employee Resignation Statement"
      >
        <form onSubmit={handleResign} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Resignation Filing Date"
              type="date"
              required
              value={form.resignationDate}
              onChange={(e) => setForm({ ...form, resignationDate: e.target.value })}
            />
            <Input
              label="Target Last Working Date"
              type="date"
              required
              value={form.lastWorkingDate}
              onChange={(e) => setForm({ ...form, lastWorkingDate: e.target.value })}
            />
          </div>

          <Textarea
            label="Reason for Departure"
            placeholder="Please detail reasons for leaving, feedback, or future plans..."
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <div className="flex items-center gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200/30 dark:border-rose-800/30">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <strong>Filing Resignation:</strong> Submission is final. Your profile status will be updated to RESIGNED and HR managers will be alerted for offboarding checklists.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={submitting}>
              Submit Resignation Statement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details / Settlement Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Offboarding File: ${selectedExit?.employee?.name || ""}`}
        size="lg"
      >
        {selectedExit && (
          <div className="space-y-6 text-left">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for departure</span>
              <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 leading-relaxed italic">
                &ldquo;{selectedExit.reason}&rdquo;
              </p>
            </div>

            {/* Asset Return Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Corporate Asset Return & Clearance Checklist
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                {getChecklistArray(selectedExit.assetReturn).map((asset: any, index: number) => (
                  <div key={asset.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{asset.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isEmployee} // only HR/Admin updates checklist
                      className={`h-7 px-2.5 text-[10px] font-bold ${
                        asset.returned
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                      }`}
                      onClick={() => handleUpdateChecklist(selectedExit, index)}
                    >
                      {asset.returned ? "Returned" : "Pending Return"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement Processing Section */}
            {!isEmployee && selectedExit.status !== "COMPLETED" && (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Process Final Settlement & Complete Offboarding
                </h4>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <Input
                    label="Final Settlement Amount ($)"
                    type="number"
                    id="settlementAmountInput"
                    placeholder="e.g. 5600"
                    className="max-w-[200px]"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      const input = document.getElementById("settlementAmountInput") as HTMLInputElement;
                      const amount = input ? input.value : "4500";
                      handleProcessSettlement(selectedExit.id, amount);
                    }}
                  >
                    Payout & Finalize Settlement
                  </Button>
                </div>
              </div>
            )}

            {selectedExit.status === "COMPLETED" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 text-xs font-semibold flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Offboarding file processed successfully. Settlement amount paid: ${selectedExit.settlementAmount?.toLocaleString()} USD. Employee record is now deactivated.</span>
              </div>
            )}

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
