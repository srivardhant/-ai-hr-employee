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
import { FileDown, Plus, Send, Check, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    candidateId: "",
    salary: "",
    joiningDate: "",
    department: "Engineering",
    position: "",
    benefits: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const offRes = await fetch("/api/offers");
      const candRes = await fetch("/api/candidates");
      if (offRes.ok && candRes.ok) {
        setOffers(await offRes.json());
        setCandidates(await candRes.json());
      }
    } catch (e) {
      toast.error("Failed to load offer letter database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Offer Letter generated as DRAFT!");
        setIsModalOpen(false);
        setForm({
          candidateId: "",
          salary: "",
          joiningDate: "",
          department: "Engineering",
          position: "",
          benefits: "",
          notes: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to generate offer");
      }
    } catch (e) {
      toast.error("Error creating job offer letter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success(`Offer marked as ${status}!`);
        fetchData();
      } else {
        toast.error("Failed to update offer status.");
      }
    } catch (e) {
      toast.error("Error updating offer.");
    }
  };

  // Generate PDF client side using jsPDF dynamic import
  const handleGeneratePDF = async (offer: any) => {
    try {
      toast.loading("Compiling Offer letter PDF...", { id: "pdf" });
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241); // indigo
      doc.text("AI HR EMPLOYEE CORP", 20, 25);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // muted slate
      doc.setFont("Helvetica", "normal");
      doc.text("Official Employment Offer Letter", 20, 31);
      doc.text(`Date Issued: ${new Date(offer.createdAt).toLocaleDateString()}`, 20, 36);
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 42, 190, 42);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate 900
      doc.text(`Candidate Name: ${offer.candidate?.name}`, 20, 52);
      doc.text(`Email Address: ${offer.candidate?.email}`, 20, 58);
      
      doc.text("We are pleased to offer you employment under the following parameters:", 20, 72);
      
      // Details Grid
      doc.setFont("Helvetica", "bold");
      doc.text("Position:", 20, 84);
      doc.setFont("Helvetica", "normal");
      doc.text(offer.position, 70, 84);

      doc.setFont("Helvetica", "bold");
      doc.text("Department:", 20, 92);
      doc.setFont("Helvetica", "normal");
      doc.text(offer.department, 70, 92);

      doc.setFont("Helvetica", "bold");
      doc.text("Base Salary Compensation:", 20, 100);
      doc.setFont("Helvetica", "normal");
      doc.text(`$${offer.salary.toLocaleString()} USD / annum`, 70, 100);

      doc.setFont("Helvetica", "bold");
      doc.text("Joining Date:", 20, 108);
      doc.setFont("Helvetica", "normal");
      doc.text(new Date(offer.joiningDate).toLocaleDateString(), 70, 108);

      doc.setFont("Helvetica", "bold");
      doc.text("Benefits Package Details:", 20, 116);
      doc.setFont("Helvetica", "normal");
      doc.text(offer.benefits || "Standard package", 70, 116);

      doc.text("Please review terms and sign. Welcome to AI HR Employee Corp.", 20, 136);

      doc.setFont("Helvetica", "bold");
      doc.text("Sarah Jenkins", 20, 160);
      doc.setFont("Helvetica", "normal");
      doc.text("Director of People Operations", 20, 166);

      doc.save(`Offer_Letter_${offer.candidate?.name?.replace(/\s+/g, "_")}.pdf`);
      toast.dismiss("pdf");
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      toast.dismiss("pdf");
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
  };

  // Only candidates who have been evaluated can receive offers
  const evaluatableCandidates = candidates.filter((c) =>
    ["EVALUATED"].includes(c.status)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employment Offer Letters"
        description="Draft compensation offers, compile benefits, generate contracts, and review signed contracts."
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Offer Letter
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Active Offer Letters</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading offer databases...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No offer records generated.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position & Dept</TableHead>
                  <TableHead>Salary Compensation</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((off) => (
                  <TableRow key={off.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{off.candidate?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{off.candidate?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{off.position}</div>
                        <div className="text-xs text-slate-400">{off.department}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      ${off.salary.toLocaleString()}/yr
                    </TableCell>
                    <TableCell>{new Date(off.joiningDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={off.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* PDF Download Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleGeneratePDF(off)}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>

                        {/* Status update actions */}
                        {off.status === "DRAFT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Send className="w-3.5 h-3.5" />}
                            onClick={() => handleStatusUpdate(off.id, "SENT")}
                          >
                            Send
                          </Button>
                        )}
                        {off.status === "SENT" && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent h-8"
                              icon={<Check className="w-3.5 h-3.5" />}
                              onClick={() => handleStatusUpdate(off.id, "ACCEPTED")}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-transparent h-8"
                              icon={<X className="w-3.5 h-3.5" />}
                              onClick={() => handleStatusUpdate(off.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Employee Offer Letter"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4">
          <Select
            label="Qualified Candidate"
            options={evaluatableCandidates.map((c) => ({ value: c.id, label: `${c.name} (${c.skills || "EVALUATED"})` }))}
            value={form.candidateId}
            placeholder="Select Evaluated Candidate"
            required
            onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Position / Job Title"
              placeholder="e.g. Lead Fullstack Developer"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <Select
              label="Department Place"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Salary Compensation ($ / annum)"
              type="number"
              placeholder="e.g. 125000"
              required
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
            <Input
              label="Target Joining Date"
              type="date"
              required
              value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
            />
          </div>

          <Textarea
            label="Corporate Benefits Package"
            placeholder="e.g. Health insurance, 401(k) matching, 25 days PTO..."
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
          />

          <Textarea
            label="Draft Notes / Internal Comments"
            placeholder="Add comments on why salary was negotiated or specific benefits..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Generate Offer Draft
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
