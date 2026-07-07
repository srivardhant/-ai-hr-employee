"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Award, Plus, Heart, HeartHandshake, Smile, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import toast from "react-hot-toast";

export default function EngagementPage() {
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    category: "Teamwork",
    points: "100",
    awardedBy: "Sarah Jenkins",
  });

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setRole(u.role || "HR");
        setForm((prev) => ({ ...prev, awardedBy: u.name || "Sarah Jenkins" }));
      }

      const res = await fetch("/api/engagement");
      const empRes = await fetch("/api/employees");
      if (res.ok && empRes.ok) {
        setData(await res.json());
        setEmployees(await empRes.json());
      }
    } catch (e) {
      toast.error("Failed to load engagement dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecognize = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Award and recognition points posted!");
        setIsModalOpen(false);
        setForm((prev) => ({
          ...prev,
          employeeId: "",
          title: "",
          description: "",
          category: "Teamwork",
          points: "100",
        }));
        fetchData();
      } else {
        toast.error("Failed to submit recognition.");
      }
    } catch (e) {
      toast.error("Error creating recognition card.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Engagement"
        description="Encourage organizational excellence, reward achievements, run feedback surveys, and display peer recognitions."
        action={
          !isEmployee && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Award Recognition
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recognition Wall */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Peer Recognition Wall</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading recognitions...</div>
              ) : !data?.recognitions || data.recognitions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No recognition posts shared yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recognitions.map((rec: any) => (
                    <Card key={rec.id} className="border border-indigo-500/10 shadow-sm relative overflow-hidden bg-white/40 dark:bg-slate-900/30">
                      {/* Points badge */}
                      <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        +{rec.points} pts
                      </div>

                      <CardContent className="pt-6 space-y-3 text-left">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            {rec.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {rec.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1">
                            Awarded to: {rec.employee?.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                          &ldquo;{rec.description}&rdquo;
                        </p>
                        <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                          <span>By: {rec.awardedBy}</span>
                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Survey Widget */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Active Surveys</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-slate-500">Loading surveys...</div>
              ) : !data?.surveys || data.surveys.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No active surveys.</div>
              ) : (
                data.surveys.map((sur: any) => (
                  <div
                    key={sur.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-left space-y-3"
                  >
                    <div>
                      <StatusBadge status={sur.status} className="h-5 text-[9px] px-2" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{sur.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {sur.description}
                      </p>
                    </div>
                    {isEmployee && sur.status === "ACTIVE" && (
                      <Button variant="outline" size="sm" className="w-full text-xs py-1.5">
                        Answer Survey
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Award Recognition Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Award Recognition & Points"
      >
        <form onSubmit={handleRecognize} className="space-y-4">
          <Select
            label="Award Recipient"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))}
            value={form.employeeId}
            placeholder="Select Employee"
            required
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          />

          <Input
            label="Recognition Title / Award Name"
            placeholder="e.g. Value Champion: Innovation"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "Innovation", label: "Innovation" },
                { value: "Teamwork", label: "Teamwork" },
                { value: "Customer Focus", label: "Customer Focus" },
                { value: "Leadership", label: "Leadership" },
                { value: "General", label: "General Excellence" },
              ]}
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Select
              label="Reward Points"
              options={[
                { value: "50", label: "50 Points (Micro-achievement)" },
                { value: "100", label: "100 Points (Standard Achievement)" },
                { value: "150", label: "150 Points (Outstanding Contribution)" },
                { value: "300", label: "300 Points (Quarterly Value Champion)" },
              ]}
              required
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
            />
          </div>

          <Textarea
            label="Recognition Citation Description"
            placeholder="Specifically describe how this employee made a notable impact (e.g. Automated databases saving 5 hours)..."
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            label="Awarded By"
            required
            value={form.awardedBy}
            onChange={(e) => setForm({ ...form, awardedBy: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Share & Post Recognition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
