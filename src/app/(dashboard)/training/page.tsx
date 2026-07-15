"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Plus, Award, PlayCircle, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("HR");
  const [currentEmpId, setCurrentEmpId] = useState("");

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Forms state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "General",
    duration: "2",
    mandatory: false,
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: "",
    trainingId: "",
  });

  const [submitting, setSubmitting] = useState(false);

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
      const courseRes = await fetch("/api/training");

      if (empRes.ok && courseRes.ok) {
        const empData = await empRes.json();
        const courseData = await courseRes.json();
        setEmployees(empData);
        setTrainings(courseData);

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
        }

        // Fetch assignments
        // If employee role, fetch only their assignments, otherwise fetch all
        const assignUrl = userRole === "EMPLOYEE" && empId ? `/api/training?employeeId=${empId}` : "/api/training?all=true";
        const assignRes = await fetch(assignUrl);
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          // If we fetched all (which returns assignments list structure or we need to filter/manage on client side)
          // For demo, we default
          setAssignments(assignData);
        }
      }
    } catch (e) {
      toast.error("Failed to load training courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });

      if (res.ok) {
        toast.success("Training Course added to catalog!");
        setIsCourseModalOpen(false);
        setCourseForm({
          title: "",
          description: "",
          category: "General",
          duration: "2",
          mandatory: false,
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add course");
      }
    } catch (err) {
      toast.error("Error creating training course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.employeeId || !assignForm.trainingId) {
      toast.error("Please select both employee and course.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: assignForm.employeeId,
          trainingId: assignForm.trainingId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        toast.success("Course assigned successfully!");
        setIsAssignModalOpen(false);
        setAssignForm({ employeeId: "", trainingId: "" });
        fetchData();
      } else {
        toast.error(data.error || "Failed to assign course");
      }
    } catch (e) {
      toast.error("Error assigning course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateProgress = async (assignmentId: string, currentProgress: number) => {
    const nextProgress = Math.min(100, currentProgress + 20);
    try {
      const res = await fetch("/api/training", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, progress: nextProgress, role }),
      });

      if (res.ok) {
        if (nextProgress >= 100) {
          toast.success("Course Completed! Certificate generated.");
        } else {
          toast.success(`Progress updated to ${nextProgress}%`);
        }
        fetchData();
      } else {
        toast.error("Failed to update progress.");
      }
    } catch (e) {
      toast.error("Error syncing progress.");
    }
  };

  const handleDownloadCertificate = async (assignment: any) => {
    try {
      toast.loading("Generating Certificate PDF...", { id: "cert" });
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("landscape");

      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 42); // slate 900
      doc.text("CERTIFICATE OF COMPLETION", 148, 50, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate 500
      doc.text("This is officially awarded to", 148, 70, { align: "center" });

      doc.setFontSize(22);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text(assignment.employee?.name || "Emma Watson", 148, 90, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`for successfully completing the corporate training course`, 148, 110, { align: "center" });

      doc.setFontSize(18);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`"${assignment.training?.title}"`, 148, 125, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text(`Course Duration: ${assignment.training?.duration} Hours | Category: ${assignment.training?.category}`, 148, 140, { align: "center" });
      doc.text(`Completed At: ${new Date(assignment.completedAt).toLocaleDateString()}`, 148, 146, { align: "center" });

      doc.line(70, 175, 130, 175);
      doc.line(160, 175, 220, 175);
      
      doc.setFontSize(10);
      doc.text("Evaluator Panel Signature", 100, 182, { align: "center" });
      doc.text("Director of Operations Signature", 190, 182, { align: "center" });

      doc.save(`Certificate_${assignment.training?.title?.replace(/\s+/g, "_")}.pdf`);
      toast.dismiss("cert");
      toast.success("Certificate downloaded!");
    } catch (e) {
      toast.dismiss("cert");
      toast.error("Failed to generate certificate.");
    }
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Compliance Courses"
        description="Enroll employees in mandatory security trainings, verify completion rates, and retrieve certificates."
        action={
          !isEmployee && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={<BookOpen className="w-4 h-4" />}
                onClick={() => setIsAssignModalOpen(true)}
              >
                Assign Course
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCourseModalOpen(true)}
              >
                Add Training Course
              </Button>
            </div>
          )
        }
      />

      {/* Courses Assigned List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {isEmployee ? "My Assigned Trainings" : "Employee Training Assignments"}
              </h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading course assignments...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No training assignments logged.</div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                            {assign.training?.category}
                          </span>
                          {assign.training?.mandatory && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <StatusBadge status={assign.status} />
                      </div>

                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                        {assign.training?.title}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Assigned to: {assign.employee?.name} ({assign.employee?.employeeId})
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {assign.training?.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={assign.progress} showPercentage className="w-32" />
                        </div>
                        <div>
                          {assign.status !== "COMPLETED" ? (
                            isEmployee ? (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<PlayCircle className="w-4.5 h-4.5" />}
                                onClick={() => handleSimulateProgress(assign.id, assign.progress)}
                              >
                                Study Course
                              </Button>
                            ) : (
                              <span className="text-sm font-medium text-slate-500 border border-slate-300 dark:border-slate-600 rounded px-3 py-1">
                                View Only
                              </span>
                            )
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent"
                              icon={<Award className="w-4.5 h-4.5" />}
                              onClick={() => handleDownloadCertificate(assign)}
                            >
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Catalog Sidebar */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">Course Catalog</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-slate-500">Loading catalog...</div>
              ) : trainings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No courses listed.</div>
              ) : (
                trainings.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-left space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                        {t.category}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{t.duration} Hours</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Course Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Training Course to Employee"
      >
        <form onSubmit={handleAssignCourse} className="space-y-4">
          <Select
            label="Select Employee"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))}
            value={assignForm.employeeId}
            placeholder="Choose Employee"
            required
            onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
          />
          <Select
            label="Select Course"
            options={trainings.map((t) => ({ value: t.id, label: t.title }))}
            value={assignForm.trainingId}
            placeholder="Choose Course"
            required
            onChange={(e) => setAssignForm({ ...assignForm, trainingId: e.target.value })}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Assign Course</Button>
          </div>
        </form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Add Training Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Title"
            placeholder="e.g. SOC2 Cybersecurity Compliance Training"
            required
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "Compliance", label: "Compliance & Safety" },
                { value: "Technical", label: "Technical Engineering" },
                { value: "Leadership", label: "Leadership Development" },
                { value: "General", label: "General Business" },
              ]}
              required
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
            />
            <Input
              label="Duration (Hours)"
              type="number"
              required
              value={courseForm.duration}
              onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
            />
          </div>

          <Textarea
            label="Course Description"
            placeholder="Briefly explain target course outlines and outcomes..."
            required
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatory"
              checked={courseForm.mandatory}
              onChange={(e) => setCourseForm({ ...courseForm, mandatory: e.target.checked })}
              className="w-4 h-4 rounded border-slate-350 bg-slate-100 text-indigo-650"
            />
            <label htmlFor="mandatory" className="text-xs font-semibold text-slate-700 dark:text-slate-400">
              Mark course as Mandatory for all new employees
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Add to Catalog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
