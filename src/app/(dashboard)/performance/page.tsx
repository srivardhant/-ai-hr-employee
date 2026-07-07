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
import { Star, Plus, BrainCircuit, Sparkles, Clipboard } from "lucide-react";
import toast from "react-hot-toast";

export default function PerformancePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    quarter: "2",
    year: "2026",
    rating: "4",
    feedback: "",
    goals: "",
    achievements: "",
    areasOfImprovement: "",
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
        }
      }

      const reviewUrl = userRole === "EMPLOYEE" && empId ? `/api/performance?employeeId=${empId}` : "/api/performance";
      const reviewRes = await fetch(reviewUrl);
      if (reviewRes.ok) {
        setReviews(await reviewRes.json());
      }
    } catch (e) {
      toast.error("Failed to load performance review database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Review logged successfully. AI Advice generated!");
        setIsModalOpen(false);
        setForm({
          employeeId: "",
          quarter: "2",
          year: "2026",
          rating: "4",
          feedback: "",
          goals: "",
          achievements: "",
          areasOfImprovement: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review");
      }
    } catch (e) {
      toast.error("Error creating review.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reviews"
        description="Monitor staff ratings, log quarterly performance assessments, and consult automated AI feedback recommendations."
        action={
          !isEmployee && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Performance Review
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Quarterly Reviews Catalog</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No review histories submitted.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Review Cycle</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-1/4">Review Feedback</TableHead>
                  <TableHead className="w-1/3">AI Career Suggestions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((rev) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{rev.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{rev.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      Q{rev.quarter} {rev.year}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Star className="w-4.5 h-4.5 text-amber-400 fill-current" />
                        <span>{rev.rating.toFixed(1)}/5.0</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
                        {rev.feedback}
                      </p>
                    </TableCell>
                    <TableCell>
                      {rev.aiSuggestions ? (
                        <div className="flex gap-2 bg-indigo-50/20 dark:bg-indigo-950/5 p-3.5 rounded-xl border border-indigo-200/20 dark:border-indigo-800/20 text-left">
                          <BrainCircuit className="w-4.5 h-4.5 text-indigo-500 mt-0.5 flex-shrink-0 animate-pulse" />
                          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold whitespace-pre-line">
                            {rev.aiSuggestions}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Quarterly Performance Review"
      >
        <form onSubmit={handleReview} className="space-y-4">
          <Select
            label="Employee Under Review"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.position})` }))}
            value={form.employeeId}
            placeholder="Select Employee"
            required
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Quarter"
              options={[
                { value: "1", label: "Q1 Review" },
                { value: "2", label: "Q2 Review" },
                { value: "3", label: "Q3 Review" },
                { value: "4", label: "Q4 Review" },
              ]}
              required
              value={form.quarter}
              onChange={(e) => setForm({ ...form, quarter: e.target.value })}
            />
            <Input
              label="Year"
              type="number"
              required
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
            <Select
              label="Rating (1-5)"
              options={[
                { value: "1", label: "1.0 - Unacceptable" },
                { value: "2", label: "2.0 - Needs Work" },
                { value: "3", label: "3.0 - Meets Expects" },
                { value: "4", label: "4.0 - Outstanding" },
                { value: "5", label: "5.0 - Exceptional" },
              ]}
              required
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </div>

          <Textarea
            label="Quarterly Review Feedback Summary"
            placeholder="Describe overall output quality, deadline structures, leadership metrics, technical capabilities..."
            required
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Core Achievements"
              placeholder="List notable achievements (e.g. Completed migrations, Automated databases)..."
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
            />
            <Textarea
              label="Areas of Improvement"
              placeholder="List specific areas where skills or speed can be optimized next quarter..."
              value={form.areasOfImprovement}
              onChange={(e) => setForm({ ...form, areasOfImprovement: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <strong>AI Career Guidance Enabled:</strong> Saving will evaluate review scores and list targeted career paths, certificates, or recovery timelines automatically.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Performance review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
