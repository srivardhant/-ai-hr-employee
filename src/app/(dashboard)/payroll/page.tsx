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
import { CreditCard, FileDown, Plus, DollarSign, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    month: "6",
    year: "2026",
    baseSalary: "",
    allowances: "0",
    deductions: "0",
    tax: "0",
    bonuses: "0",
    notes: "",
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

        const payUrl = userRole === "EMPLOYEE" && empId ? `/api/payroll?employeeId=${empId}` : "/api/payroll";
        const payRes = await fetch(payUrl);
        if (payRes.ok) {
          setPayrolls(await payRes.json());
        }
      }
    } catch (e) {
      toast.error("Failed to load payroll records.");
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
      const salary = emp.salary || 0;
      const monthlyBase = Math.round(salary / 12);
      const estTax = Math.round(monthlyBase * 0.15);
      setForm((prev) => ({
        ...prev,
        employeeId: empId,
        baseSalary: String(monthlyBase),
        tax: String(estTax),
      }));
    }
  };

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Payroll record processed as DRAFT!");
        setIsModalOpen(false);
        setForm({
          employeeId: "",
          month: "6",
          year: "2026",
          baseSalary: "",
          allowances: "0",
          deductions: "0",
          tax: "0",
          bonuses: "0",
          notes: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create payroll");
      }
    } catch (e) {
      toast.error("Error creating payroll record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async (id: string) => {
    try {
      toast.loading("Transferring funds via ACH...", { id: "pay" });
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.dismiss("pay");
        toast.success("Payment paid out successfully!");
        fetchData();
      } else {
        toast.dismiss("pay");
        toast.error("Payment routing failed.");
      }
    } catch (e) {
      toast.dismiss("pay");
      toast.error("Error updating payroll payment.");
    }
  };

  const handleDownloadPayslip = async (pay: any) => {
    try {
      toast.loading("Generating Payslip PDF...", { id: "payslip" });
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("AI HR EMPLOYEE CORP", 20, 25);

      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Official Salary Payslip Statement", 20, 31);
      doc.text(`Payment ID: PAY_${pay.id}`, 20, 36);
      doc.text(`Status: ${pay.status}`, 20, 41);

      doc.setDrawColor(226, 232, 240);
      doc.line(20, 47, 190, 47);

      // Employee Dossier
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.text("Employee Name:", 20, 58);
      doc.setFont("Helvetica", "normal");
      doc.text(pay.employee?.name || "Emma Watson", 70, 58);

      doc.setFont("Helvetica", "bold");
      doc.text("Employee ID:", 20, 64);
      doc.setFont("Helvetica", "normal");
      doc.text(pay.employee?.employeeId || "EMP-003", 70, 64);

      doc.setFont("Helvetica", "bold");
      doc.text("Department:", 20, 70);
      doc.setFont("Helvetica", "normal");
      doc.text(pay.employee?.department || "Marketing", 70, 70);

      doc.setFont("Helvetica", "bold");
      doc.text("Pay Period:", 20, 76);
      doc.setFont("Helvetica", "normal");
      doc.text(`${monthNames[pay.month - 1]} ${pay.year}`, 70, 76);

      doc.line(20, 83, 190, 83);

      // Pay Grid
      doc.setFont("Helvetica", "bold");
      doc.text("Earnings Description", 20, 93);
      doc.text("Amount ($)", 170, 93, { align: "right" });
      
      doc.setFont("Helvetica", "normal");
      doc.text("Basic Monthly Base Salary:", 20, 103);
      doc.text(`$${pay.baseSalary.toLocaleString()}`, 170, 103, { align: "right" });

      doc.text("Monthly Allowances:", 20, 111);
      doc.text(`$${pay.allowances.toLocaleString()}`, 170, 111, { align: "right" });

      doc.text("Performance Bonuses:", 20, 119);
      doc.text(`$${pay.bonuses.toLocaleString()}`, 170, 119, { align: "right" });

      doc.setTextColor(244, 63, 94); // rose
      doc.text("Withholding Taxes:", 20, 127);
      doc.text(`-$${pay.tax.toLocaleString()}`, 170, 127, { align: "right" });

      doc.text("Other Deductions:", 20, 135);
      doc.text(`-$${pay.deductions.toLocaleString()}`, 170, 135, { align: "right" });

      doc.setTextColor(15, 23, 42);
      doc.line(20, 142, 190, 142);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("NET SALARY PAYOUT:", 20, 153);
      doc.text(`$${pay.netPay.toLocaleString()}`, 170, 153, { align: "right" });

      doc.save(`Payslip_${monthNames[pay.month - 1]}_${pay.year}.pdf`);
      toast.dismiss("payslip");
      toast.success("Payslip PDF downloaded!");
    } catch (e) {
      toast.dismiss("payslip");
      toast.error("Failed to generate PDF.");
    }
  };

  const isEmployee = role === "EMPLOYEE";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compensation & Payroll"
        description="Verify monthly salaries, issue bonuses, calculate deductions, route payouts, and export payslips."
        action={
          !isEmployee && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Process Monthly Payroll
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Payroll Statements</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading payroll database...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No payroll statements generated.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Base / Allow / Bonus</TableHead>
                  <TableHead>Taxes / Deduct</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div>
                        <div>{pay.employee?.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{pay.employee?.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700 dark:text-slate-350">
                      {monthNames[pay.month - 1]} {pay.year}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-500">
                        <span>Base: ${pay.baseSalary.toLocaleString()}</span>
                        <span>Allow: ${pay.allowances} | Bonus: ${pay.bonuses}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-rose-500">
                        <span>Tax: -${pay.tax}</span>
                        <span>Deduct: -${pay.deductions}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-500">
                      ${pay.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pay.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download Payslip */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadPayslip(pay)}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>

                        {/* Pay trigger */}
                        {!isEmployee && pay.status === "DRAFT" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent h-8"
                            icon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleProcessPayment(pay.id)}
                          >
                            Route Payout
                          </Button>
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

      {/* Process Payroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Employee Payroll Statement"
      >
        <form onSubmit={handleCreatePayroll} className="space-y-4">
          <Select
            label="Target Employee"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.position})` }))}
            value={form.employeeId}
            placeholder="Select Employee"
            required
            onChange={(e) => handleSelectEmployee(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payroll Month"
              options={monthNames.map((m, idx) => ({ value: String(idx + 1), label: m }))}
              required
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
            <Input
              label="Payroll Year"
              type="number"
              required
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Base Salary ($)"
              type="number"
              required
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
            />
            <Input
              label="Bonuses / Adjustments ($)"
              type="number"
              value={form.bonuses}
              onChange={(e) => setForm({ ...form, bonuses: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Allowances ($)"
              type="number"
              value={form.allowances}
              onChange={(e) => setForm({ ...form, allowances: e.target.value })}
            />
            <Input
              label="Withholding Tax ($)"
              type="number"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: e.target.value })}
            />
            <Input
              label="Deductions ($)"
              type="number"
              value={form.deductions}
              onChange={(e) => setForm({ ...form, deductions: e.target.value })}
            />
          </div>

          <Textarea
            label="Payslip Comments / Notes"
            placeholder="Specify reason for bonuses, overtime calculations, or reimbursement details..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Generate Draft Statement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
