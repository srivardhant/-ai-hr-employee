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
import { Plus, Check, X, Calendar, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");
  const [currentEmpId, setCurrentEmpId] = useState("");

  // Form State
  const [form, setForm] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
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
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);

        if (userStr) {
          const u = JSON.parse(userStr);
          const activeEmp = empData.find((e: any) => e.companyEmail === u.email || e.email === u.email);
          if (activeEmp) {
            empId = activeEmp.id;
          } else {
            const meRes = await fetch(`/api/employees?email=${encodeURIComponent(u.email)}`);
            if (meRes.ok) {
              const me = await meRes.json();
              if (me && !Array.isArray(me)) {
                empId = me.id;
                empData.unshift(me);
              }
            }
          }
          setCurrentEmpId(empId);
        }

        const leaveUrl = userRole === "EMPLOYEE" && empId ? `/api/leave?employeeId=${empId}` : "/api/leave";
        const leaveRes = await fetch(leaveUrl);
        if (leaveRes.ok) {
          setLeaves(await leaveRes.json());
        }
      }
    } catch (e) {
      toast.error("Failed to load leave records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmpId) {
      toast.error("Employee profile not associated with active login.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, employeeId: currentEmpId }),
      });

      if (res.ok) {
        toast.success("Leave request submitted successfully!");
        setIsModalOpen(false);
        setForm({
          type: "ANNUAL",
          startDate: "",
          endDate: "",
          reason: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit leave request");
      }
    } catch (e) {
      toast.error("Error creating leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, approvedBy: "HR Administrator" }),
      });

      if (res.ok) {
        toast.success(`Leave request ${status.toLowerCase()}!`);
        fetchData();
      } else {
        toast.error("Failed to process approval.");
      }
    } catch (e) {
      toast.error("Error updating leave status.");
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Verify employee leave requests, review allocations, request time off, and manage approvals."
        action={
          isEmployee && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Apply for Leave
            </Button>
          )
        }
      />

      {/* Leave Balance summary for Employee */}
      {isEmployee && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Leave Balance</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">15 Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick Leave Balance</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8 Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual Leave Balance</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">5 Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maternity/Paternity</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">90 Days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Requests table */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Leave Requests Logs</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading leave statements...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No leave statements catalogued.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start / End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  {!isEmployee && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{leave.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{leave.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-indigo-500">{leave.type}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold">{leave.days} Days</TableCell>
                    <TableCell className="max-w-[180px] truncate text-slate-500 dark:text-slate-400">
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={leave.status} />
                    </TableCell>
                    {!isEmployee && (
                      <TableCell className="text-right">
                        {leave.status === "PENDING" && (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent h-8"
                              icon={<Check className="w-3.5 h-3.5" />}
                              onClick={() => handleAction(leave.id, "APPROVED")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-transparent h-8"
                              icon={<X className="w-3.5 h-3.5" />}
                              onClick={() => handleAction(leave.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave / Time-off"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <Select
            label="Leave Type"
            options={[
              { value: "ANNUAL", label: "Annual Leave (Vacation)" },
              { value: "SICK", label: "Sick Leave" },
              { value: "CASUAL", label: "Casual Leave" },
              { value: "UNPAID", label: "Unpaid Leave" },
            ]}
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <Textarea
            label="Reason for Leave"
            placeholder="Provide details regarding vacation scheduling, illness details, emergency parameters..."
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
