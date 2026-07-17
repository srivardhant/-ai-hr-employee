"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Calendar, Clock, User, Plus, CheckCircle, Video, List, Grid } from "lucide-react";
import toast from "react-hot-toast";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewType, setViewType] = useState<"list" | "calendar">("list");

  // Form State
  const [form, setForm] = useState({
    candidateId: "",
    scheduledAt: "",
    duration: "60",
    type: "Technical Interview",
    panelMembers: "",
    location: "Google Meet",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const intRes = await fetch("/api/interviews");
      const candRes = await fetch("/api/candidates");
      if (intRes.ok && candRes.ok) {
        setInterviews(await intRes.json());
        setCandidates(await candRes.json());
      }
    } catch (e) {
      toast.error("Failed to load interview data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Interview scheduled successfully!");
        setIsModalOpen(false);
        setForm({
          candidateId: "",
          scheduledAt: "",
          duration: "60",
          type: "Technical Interview",
          panelMembers: "",
          location: "Google Meet",
          notes: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to schedule interview");
      }
    } catch (e) {
      toast.error("Error scheduling interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInterviewTimeText = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInterviewDateText = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter candidates who are qualified for interview scheduling
  const interviewableCandidates = candidates.filter((c) =>
    ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "EVALUATED"].includes(c.status)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Scheduling"
        description="Book candidate interviews, allocate evaluator panels, and coordinate timeline links."
        action={
          <div className="flex gap-2.5">
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setViewType("list")}
                className={`p-2 rounded-lg cursor-pointer ${
                  viewType === "list"
                    ? "bg-white dark:bg-slate-850 shadow-sm text-indigo-500"
                    : "text-slate-500"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType("calendar")}
                className={`p-2 rounded-lg cursor-pointer ${
                  viewType === "calendar"
                    ? "bg-white dark:bg-slate-850 shadow-sm text-indigo-500"
                    : "text-slate-500"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Schedule Interview
            </Button>
          </div>
        }
      />

      {viewType === "list" ? (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Interviews</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading schedules...</div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No scheduled interviews found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Interview Type</TableHead>
                    <TableHead>Panel Members</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Calendar Sync</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((int) => (
                    <TableRow key={int.id}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        <div>
                          <div>{int.candidate?.name}</div>
                          <div className="text-xs text-slate-400 font-normal">{int.candidate?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {getInterviewDateText(int.scheduledAt)}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {getInterviewTimeText(int.scheduledAt)} ({int.duration} mins)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-indigo-500">{int.type}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{int.panelMembers}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {(() => {
                            const scheduledTime = new Date(int.scheduledAt).getTime();
                            const now = new Date().getTime();
                            const showLink = now >= scheduledTime - 30 * 60 * 1000;
                            
                            if (!showLink) {
                              return (
                                <div className="flex items-center gap-1.5 text-slate-500" title="Location/Link will appear 30 mins before interview">
                                  <Video className="w-4 h-4 text-slate-400" />
                                  <span>Available 30m before</span>
                                </div>
                              );
                            }

                            if (int.googleMeetLink) {
                              return (
                                <a href={int.googleMeetLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline">
                                  <Video className="w-4 h-4" /> Join Meet
                                </a>
                              );
                            }

                            return (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Video className="w-4 h-4 text-slate-400" />
                                <span>{int.location}</span>
                              </div>
                            );
                          })()}
                          {int.googleCalendarLink && (
                            <a href={int.googleCalendarLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-500 hover:underline">
                              <Calendar className="w-3 h-3" /> Event Link
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {int.calendarSyncStatus === "SUCCESS" && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Synced</span>}
                        {int.calendarSyncStatus === "FAILED" && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs" title={int.calendarErrorMessage}>Failed</span>}
                        {int.calendarSyncStatus === "PENDING" && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Pending</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={int.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(int.calendarSyncStatus === "FAILED" || int.calendarSyncStatus === "PENDING") && (
                            <button
                              onClick={async () => {
                                toast.loading("Syncing...", { id: `sync-${int.id}` });
                                try {
                                  const res = await fetch(`/api/interviews/${int.id}/sync`, { method: "POST" });
                                  if (res.ok) {
                                    toast.success("Synced successfully", { id: `sync-${int.id}` });
                                    fetchData();
                                  } else {
                                    toast.error("Sync failed", { id: `sync-${int.id}` });
                                  }
                                } catch(e) {
                                  toast.error("Error", { id: `sync-${int.id}` });
                                }
                              }}
                              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if(confirm("Are you sure you want to cancel this interview?")) {
                                toast.loading("Cancelling...", { id: `cancel-${int.id}` });
                                try {
                                  const res = await fetch(`/api/interviews/${int.id}`, { method: "DELETE" });
                                  if (res.ok) {
                                    toast.success("Cancelled successfully", { id: `cancel-${int.id}` });
                                    fetchData();
                                  } else {
                                    toast.error("Cancel failed", { id: `cancel-${int.id}` });
                                  }
                                } catch(e) {
                                  toast.error("Error", { id: `cancel-${int.id}` });
                                }
                              }
                            }}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        // Premium Calendar Mock Layout
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card className="col-span-full">
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">July 2026</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center font-bold text-xs uppercase py-3 text-slate-500 bg-slate-50/50 dark:bg-slate-900/40">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 text-xs text-slate-500 min-h-[350px]">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const day = idx - 2;
                  const dayInterviews = day > 0 && day <= 31
                    ? interviews.filter((int) => new Date(int.scheduledAt).getDate() === day)
                    : [];
                  
                  return (
                    <div
                      key={idx}
                      className={`border-b border-r border-slate-100 dark:border-slate-800/40 p-2 min-h-[70px] flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors ${
                        day <= 0 || day > 31 ? "opacity-30 bg-slate-50/20 dark:bg-slate-950/20" : ""
                      }`}
                    >
                      <span className="font-semibold">{day > 0 && day <= 31 ? day : ""}</span>
                      {dayInterviews.slice(0, 2).map((int) => (
                        <div
                          key={int.id}
                          className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 p-1 rounded font-bold text-[9px] truncate mt-0.5"
                        >
                          {int.type}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <span className="text-[8px] text-slate-400 font-semibold">+{dayInterviews.length - 2} more</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Evaluation Interview"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <Select
            label="Target Candidate"
            options={interviewableCandidates.map((c) => ({ value: c.id, label: `${c.name} (${c.jobOpening?.title || "No Job"})` }))}
            value={form.candidateId}
            placeholder="Select a Candidate"
            required
            onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Interview Date & Time"
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <Select
              label="Duration"
              options={[
                { value: "30", label: "30 Minutes" },
                { value: "45", label: "45 Minutes" },
                { value: "60", label: "1 Hour" },
                { value: "90", label: "1.5 Hours" },
              ]}
              required
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Interview Type"
              options={[
                { value: "HR Screening", label: "HR Screening" },
                { value: "Technical Interview", label: "Technical Interview" },
                { value: "Cultural Review", label: "Cultural Review" },
                { value: "Final Director Review", label: "Final Director Review" },
              ]}
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
            <Input
              label="Interview Link / Location"
              placeholder="e.g. Google Meet / Room 402"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <Input
            label="Panel Members (Comma separated names)"
            placeholder="e.g. Sarah Jenkins, Robert Kovac"
            required
            value={form.panelMembers}
            onChange={(e) => setForm({ ...form, panelMembers: e.target.value })}
          />

          <Input
            label="Interview Preparation Notes"
            placeholder="Add general preparation topics or instructions for candidates..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Schedule Interview
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
