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
import { Sparkles, ClipboardCheck, Plus, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    candidateId: "",
    technicalScore: "8",
    hrScore: "8",
    communicationScore: "8",
    culturalFitScore: "8",
    recommendation: "HIRE",
    evaluatorNotes: "",
  });

  const fetchData = async () => {
    try {
      const evalRes = await fetch("/api/evaluations");
      const candRes = await fetch("/api/candidates");
      if (evalRes.ok && candRes.ok) {
        setEvaluations(await evalRes.json());
        setCandidates(await candRes.json());
      }
    } catch (e) {
      toast.error("Failed to load evaluation database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Evaluation saved and AI Summary generated!");
        setIsModalOpen(false);
        setForm({
          candidateId: "",
          technicalScore: "8",
          hrScore: "8",
          communicationScore: "8",
          culturalFitScore: "8",
          recommendation: "HIRE",
          evaluatorNotes: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit evaluation");
      }
    } catch (e) {
      toast.error("Error creating candidate evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Only evaluate candidates who are currently in screening / interviewing status
  const evaluatableCandidates = candidates.filter((c) =>
    ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW"].includes(c.status)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Evaluations"
        description="Aggregate scorecard metrics, compile technical reviews, and generate AI synthesis reports."
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Evaluation Card
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Vetted Evaluations</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading scorecards...</div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No evaluation reports saved yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Tech / HR / Comm / Fit</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead className="w-1/2">AI Summary & Synthesis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{ev.candidate?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          Exp: {ev.candidate?.experience} yrs | Skills: {ev.candidate?.skills}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span className="bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-200/20 dark:border-indigo-800/20">
                          T: {ev.technicalScore}
                        </span>
                        <span className="bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-200/20 dark:border-emerald-800/20">
                          H: {ev.hrScore}
                        </span>
                        <span className="bg-amber-50/50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200/20 dark:border-amber-800/20">
                          C: {ev.communicationScore}
                        </span>
                        <span className="bg-purple-50/50 dark:bg-purple-950/20 px-2 py-0.5 rounded border border-purple-200/20 dark:border-purple-800/20">
                          F: {ev.culturalFitScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {ev.overallScore?.toFixed(1)}/10
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ev.recommendation} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 bg-indigo-50/20 dark:bg-indigo-950/5 p-3 rounded-xl border border-indigo-200/20 dark:border-indigo-800/20">
                        <BrainCircuit className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0 animate-pulse" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          {ev.aiSummary}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Candidate Scorecard & Recommendation"
      >
        <form onSubmit={handleEvaluate} className="space-y-4">
          <Select
            label="Associate Candidate"
            options={evaluatableCandidates.map((c) => ({ value: c.id, label: c.name }))}
            value={form.candidateId}
            placeholder="Select Candidate"
            required
            onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Technical Score (0-10)"
              type="number"
              min="0"
              max="10"
              required
              value={form.technicalScore}
              onChange={(e) => setForm({ ...form, technicalScore: e.target.value })}
            />
            <Input
              label="HR Rating (0-10)"
              type="number"
              min="0"
              max="10"
              required
              value={form.hrScore}
              onChange={(e) => setForm({ ...form, hrScore: e.target.value })}
            />
            <Input
              label="Comm Score (0-10)"
              type="number"
              min="0"
              max="10"
              required
              value={form.communicationScore}
              onChange={(e) => setForm({ ...form, communicationScore: e.target.value })}
            />
            <Input
              label="Cultural Fit (0-10)"
              type="number"
              min="0"
              max="10"
              required
              value={form.culturalFitScore}
              onChange={(e) => setForm({ ...form, culturalFitScore: e.target.value })}
            />
          </div>

          <Select
            label="Overall Hiring Recommendation"
            options={[
              { value: "STRONG_HIRE", label: "Strong Hire" },
              { value: "HIRE", label: "Hire" },
              { value: "MAYBE", label: "Borderline Maybe" },
              { value: "NO_HIRE", label: "No Hire" },
            ]}
            required
            value={form.recommendation}
            onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
          />

          <Textarea
            label="Evaluator Feedback / Interview Transcripts"
            placeholder="Provide technical notes, code walkthrough summaries, behavioral observations..."
            value={form.evaluatorNotes}
            onChange={(e) => setForm({ ...form, evaluatorNotes: e.target.value })}
          />

          <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <strong>AI Recommendation Summary Enabled:</strong> Saving will compile score variables and notes into a synthesized text block.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Scorecard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
