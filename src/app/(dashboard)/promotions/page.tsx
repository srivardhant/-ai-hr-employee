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
import { TrendingUp, Plus, Check, X, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    toPosition: "",
    toSalary: "",
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
              if (me && !Array.isArray(me)) { empId = me.id; empData.unshift(me); }
            }
          }
        }

        const promoUrl = userRole === "EMPLOYEE" && empId ? `/api/promotions?employeeId=${empId}` : "/api/promotions";
        const promoRes = await fetch(promoUrl);
        if (promoRes.ok) {
          setPromotions(await promoRes.json());
        }
      }
    } catch (e) {
      toast.error("Failed to load promotions registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      // Suggesting 15% salary increase by default
      const suggestedSalary = Math.round(emp.salary * 1.15);
      setForm((prev) => ({
        ...prev,
        employeeId: empId,
        toPosition: `Senior ${emp.position}`,
        toSalary: String(suggestedSalary),
      }));
    }
  };

  const handleProposePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Promotion proposed successfully!");
        setIsModalOpen(false);
        setForm({
          employeeId: "",
          toPosition: "",
          toSalary: "",
          reason: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit proposal");
      }
    } catch (e) {
      toast.error("Error creating promotion request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovalAction = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, approvedBy: "HR Director" }),
      });

      if (res.ok) {
        toast.success(`Promotion Proposal marked as ${status}!`);
        fetchData();
      } else {
        toast.error("Failed to process approval.");
      }
    } catch (e) {
      toast.error("Error updating promotion status.");
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Career Paths"
        description="Recommend personnel promotions, calculate salary revision percentages, and authorize career adjustments."
        action={
          !isEmployee && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Recommend Promotion
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Promotions Registry</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No promotion proposals logged.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Previous Position</TableHead>
                  <TableHead>Proposed Position</TableHead>
                  <TableHead>Comp Revision</TableHead>
                  <TableHead>Reasoning</TableHead>
                  <TableHead>Status</TableHead>
                  {!isEmployee && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{promo.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{promo.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{promo.fromPosition}</TableCell>
                    <TableCell className="font-semibold text-indigo-500">{promo.toPosition}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">
                          ${promo.fromSalary.toLocaleString()} -&gt; ${promo.toSalary.toLocaleString()}
                        </span>
                        <span className="text-emerald-500 font-bold mt-0.5">
                          +{promo.salaryRevision}% revision
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-slate-500 text-xs">
                      {promo.reason}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={promo.status} />
                    </TableCell>
                    {!isEmployee && (
                      <TableCell className="text-right">
                        {promo.status === "PROPOSED" && (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent h-8"
                              icon={<Check className="w-3.5 h-3.5" />}
                              onClick={() => handleApprovalAction(promo.id, "APPROVED")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-transparent h-8"
                              icon={<X className="w-3.5 h-3.5" />}
                              onClick={() => handleApprovalAction(promo.id, "REJECTED")}
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

      {/* Recommend Promotion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Propose Employee Promotion Recommendation"
      >
        <form onSubmit={handleProposePromotion} className="space-y-4">
          <Select
            label="Target Employee"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.position})` }))}
            value={form.employeeId}
            placeholder="Select Employee"
            required
            onChange={(e) => handleSelectEmployee(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Proposed Position / Title"
              placeholder="e.g. Senior Software Engineer"
              required
              value={form.toPosition}
              onChange={(e) => setForm({ ...form, toPosition: e.target.value })}
            />
            <Input
              label="Proposed Salary Compensation ($ / yr)"
              type="number"
              placeholder="e.g. 115000"
              required
              value={form.toSalary}
              onChange={(e) => setForm({ ...form, toSalary: e.target.value })}
            />
          </div>

          <Textarea
            label="Detailed Reasoning & Justifications"
            placeholder="Provide performance metrics, achievements logs, reviews ratings, or leadership actions justifying the revision..."
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Propose Promotion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
