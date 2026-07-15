"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { Briefcase, UserPlus, Clipboard, Sparkles, Plus, AlertCircle, Cpu, Upload, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState("candidates");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Forms state
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    jobOpeningId: "",
    notes: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    location: "Remote",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    openings: "1",
  });

  const [submitting, setSubmitting] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);

  const fetchData = async () => {
    try {
      const candRes = await fetch("/api/candidates");
      const jobRes = await fetch("/api/recruitment");
      if (candRes.ok && jobRes.ok) {
        setCandidates(await candRes.json());
        setJobs(await jobRes.json());
      }
    } catch (e) {
      toast.error("Failed to load recruitment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleParseResume = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      toast.error("Please paste a complete resume (at least 20 characters)");
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCandidateForm(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        experience: data.experience || prev.experience,
        skills: data.skills || prev.skills,
      }));
      toast.success("Resume parsed! Fields auto-filled.", { icon: "🤖" });
    } catch {
      toast.error("Failed to parse resume. Fill fields manually.");
    } finally {
      setParsing(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateForm),
      });

      if (res.ok) {
        toast.success("Candidate added and AI screened successfully!");
        setIsCandidateModalOpen(false);
        setCandidateForm({
          name: "",
          email: "",
          phone: "",
          experience: "",
          skills: "",
          jobOpeningId: "",
          notes: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add candidate");
      }
    } catch (err) {
      toast.error("Error creating candidate profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });

      if (res.ok) {
        toast.success("Job opening created!");
        setIsJobModalOpen(false);
        setJobForm({
          title: "",
          department: "",
          description: "",
          requirements: "",
          location: "Remote",
          type: "Full-time",
          salaryMin: "",
          salaryMax: "",
          openings: "1",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create job opening");
      }
    } catch (err) {
      toast.error("Error creating job opening.");
    } finally {
      setSubmitting(false);
    }
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : "Unassigned";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment & AI Screening"
        description="Manage corporate job openings, candidate database, and automated AI vetting indexes."
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsJobModalOpen(true)}
            >
              New Job Opening
            </Button>
            <Button
              variant="primary"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsCandidateModalOpen(true)}
            >
              Add Candidate
            </Button>
          </div>
        }
      />

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab id="candidates">Candidate Database</Tab>
          <Tab id="jobs">Job Openings</Tab>
        </TabList>

        <TabPanel id="candidates">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">Active Candidates</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading candidates...</div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No candidates found in database.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Target Job Role</TableHead>
                      <TableHead>Exp (Yrs)</TableHead>
                      <TableHead>AI Screening Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((cand) => (
                      <TableRow key={cand.id}>
                        <TableCell className="font-semibold text-slate-900 dark:text-white">
                          <div>
                            <div>{cand.name}</div>
                            <div className="text-xs text-slate-400 font-normal">{cand.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cand.jobOpening?.title || getJobTitle(cand.jobOpeningId)}</TableCell>
                        <TableCell>{cand.experience} yrs</TableCell>
                        <TableCell>
                          {cand.aiScreenScore ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${
                              cand.aiScreenScore >= 80
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : cand.aiScreenScore >= 60
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            }`}>
                              <Cpu className="w-3.5 h-3.5" />
                              {cand.aiScreenScore}/100
                            </span>
                          ) : (
                            <span className="text-slate-400">Not Screened</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={cand.status} />
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs">{cand.source || "Web Portal"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="jobs">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-center col-span-full py-8 text-slate-500">Loading Job Openings...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center col-span-full py-12 text-slate-500">No job openings registered.</div>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} hoverEffect className="relative flex flex-col justify-between">
                  <div className="absolute top-4 right-4">
                    <StatusBadge status={job.status} />
                  </div>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        {job.department}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {job.location} | {job.type}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    {job.salaryMin && (
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-350 bg-slate-100/50 dark:bg-slate-900/60 p-2 rounded-lg w-fit">
                        Comp: ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/50 dark:border-slate-800/40">
                    <span>Target Openings: {job.openings}</span>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabPanel>
      </Tabs>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        title="Add Candidate & AI Screening Vetting"
      >
        <form onSubmit={handleAddCandidate} className="space-y-4">
          {/* AI Resume Parser */}
          <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-200/20 dark:border-indigo-800/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">AI Resume Parser</span>
            </div>
            <Textarea
              label="Paste Resume / CV Text"
              placeholder="Paste the candidate's resume text here... The AI will extract name, email, skills, and experience automatically."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={4}
            />
            <button
              type="button"
              onClick={handleParseResume}
              disabled={parsing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {parsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {parsing ? "Parsing..." : "Parse Resume (AI)"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alice Johnson"
              required
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. alice.j@gmail.com"
              required
              value={candidateForm.email}
              onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (555) 019-2831"
              value={candidateForm.phone}
              onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
            />
            <Input
              label="Years of Experience"
              type="number"
              placeholder="e.g. 5"
              required
              value={candidateForm.experience}
              onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
            />
          </div>

          <Select
            label="Associate Job Opening"
            options={jobs.map((j) => ({ value: j.id, label: `${j.title} (${j.department})` }))}
            value={candidateForm.jobOpeningId}
            placeholder="Select a Job Opening"
            required
            onChange={(e) => setCandidateForm({ ...candidateForm, jobOpeningId: e.target.value })}
          />

          <Input
            label="Skills (Comma separated list)"
            placeholder="e.g. React, Next.js, Node.js, TypeScript, PostgreSQL"
            required
            value={candidateForm.skills}
            onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
          />

          <Textarea
            label="Resume Placeholder / Vetting Notes"
            placeholder="Summarize candidate profile, details, or cover letter extracts..."
            value={candidateForm.notes}
            onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
          />

          <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <strong>AI Candidate Vetting Enabled:</strong> Submitting will parse the candidate experience, skills, and notes compared to target jobs to output a vetting index score (0-100).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Run AI Screening & Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Job Opening Modal */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title="Create Job Opening"
      >
        <form onSubmit={handleAddJob} className="space-y-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Fullstack Engineer"
            required
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={jobForm.department}
              onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="e.g. Remote / New York, NY"
              required
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Employment Type"
              options={[
                { value: "Full-time", label: "Full-time" },
                { value: "Part-time", label: "Part-time" },
                { value: "Contract", label: "Contract" },
              ]}
              required
              value={jobForm.type}
              onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
            />
            <Input
              label="Total Targeted Openings"
              type="number"
              required
              value={jobForm.openings}
              onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Salary Minimum ($)"
              type="number"
              placeholder="e.g. 90000"
              value={jobForm.salaryMin}
              onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
            />
            <Input
              label="Salary Maximum ($)"
              type="number"
              placeholder="e.g. 130000"
              value={jobForm.salaryMax}
              onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
            />
          </div>

          <Textarea
            label="Job Description"
            placeholder="Explain general role scopes, deliverables, day-to-days..."
            required
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
          />

          <Textarea
            label="Requirements"
            placeholder="Explain mandatory certificates, technologies, toolkits, degrees..."
            value={jobForm.requirements}
            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Launch Opening
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
