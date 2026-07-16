"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Download, Upload, Trash2, GraduationCap, CheckSquare, Square } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("HR");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", department: "Engineering", position: "", salary: "",
    managerId: "", address: "", dateOfBirth: "", emergencyContact: "",
  });

  const fetchEmployees = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setRole(JSON.parse(userStr).role || "HR");
      const res = await fetch("/api/employees");
      if (res.ok) setEmployees(await res.json());
    } catch { toast.error("Failed to load employees."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Employee created!");
        setIsModalOpen(false);
        setForm({ name: "", email: "", phone: "", department: "Engineering", position: "", salary: "", managerId: "", address: "", dateOfBirth: "", emergencyContact: "" });
        fetchEmployees();
      } else { toast.error((await res.json()).error || "Failed"); }
    } catch { toast.error("Error creating employee."); }
    finally { setSubmitting(false); }
  };

  const isEmployee = role === "EMPLOYEE";
  const canManage = role === "HR" || role === "MANAGER";
  const managers = employees.filter((e) => e.userId && e.userId !== "");

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === employees.length) setSelected(new Set());
    else setSelected(new Set(employees.map(e => e.id)));
  };
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} employee(s)?`)) return;
    for (const id of selected) await fetch(`/api/employees?id=${id}`, { method: "DELETE" });
    setEmployees(prev => prev.filter(e => !selected.has(e.id)));
    setSelected(new Set());
    toast.success(`${selected.size} employee(s) deleted`);
  };
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const row: any = {};
        headers.forEach((h, idx) => row[h] = vals[idx]);
        if (row.name && row.email) {
          const res = await fetch("/api/employees", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.name, email: row.email, phone: row.phone || "",
              department: row.department || "Engineering", position: row.position || "Staff",
              salary: parseInt(row.salary) || 0, joinDate: row.joinDate || new Date().toISOString(),
            }),
          });
          if (res.ok) imported++;
        }
      }
      if (imported > 0) { toast.success(`Imported ${imported} employee(s)!`); fetchEmployees(); }
      else toast.error("No valid records. CSV must have name, email columns.");
    } catch { toast.error("Failed to import CSV"); }
    finally { setImporting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Roster & Directory"
        description="Verify active staff records, modify roles, manage reporting hierarchies, and check departments."
        action={
          <div className="flex items-center gap-2">
            {!isEmployee && (
              <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)} data-shortcut="new">
                Add Employee Profile
              </Button>
            )}
            <label className="cursor-pointer">
              <Button variant="secondary" icon={importing ? <span className="animate-spin inline-block">◌</span> : <Upload className="w-4 h-4" />}>
                Import CSV
              </Button>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}
              onClick={() => downloadCSV(employees.map((e: any) => ({
                Name: e.name, Email: e.email, Department: e.department, Position: e.position,
                Status: e.status, Phone: e.phone,
              })), "employees")}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Bulk Action Bar */}
      {canManage && selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
          <CheckSquare className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={() => {
            downloadCSV(employees.filter(e => selected.has(e.id)).map((e: any) => ({
              Name: e.name, Email: e.email, Department: e.department, Position: e.position, Status: e.status,
            })), "selected-employees");
            toast.success("Exported selected employees");
          }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Active Corporate Directory</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No employee profiles cataloged.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canManage && (
                    <TableHead className="w-10">
                      <button onClick={toggleAll} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {selected.size === employees.length ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </TableHead>
                  )}
                  <TableHead>Avatar</TableHead>
                  <TableHead>Employee Name & ID</TableHead>
                  <TableHead>Position & Dept</TableHead>
                  <TableHead>Reporting Manager</TableHead>
                  <TableHead>Join Date</TableHead>
                  {!isEmployee && <TableHead>Compensation ($)</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    {canManage && (
                      <TableCell>
                        <button onClick={() => toggleSelect(emp.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          {selected.has(emp.id) ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                        </button>
                      </TableCell>
                    )}
                    <TableCell>
                      <Avatar name={emp.name} src={emp.profileImage} size="sm" />
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{emp.employeeId} | {emp.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.position}</div>
                        <div className="text-xs text-indigo-500">{emp.department}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {emp.manager?.name || "Hierarchical Root"}
                    </TableCell>
                    <TableCell>{formatDate(emp.joinDate)}</TableCell>
                    {!isEmployee && (
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-350">
                        {formatCurrency(emp.salary)}/yr
                      </TableCell>
                    )}
                    <TableCell>
                      <StatusBadge status={emp.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Employee Profile Record">
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="e.g. Alice Jenkins" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Personal Email" type="email" placeholder="e.g. alice@gmail.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Phone Number" placeholder="e.g. +1 (555) 019-2831" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Annual Salary ($)" type="number" placeholder="e.g. 85000" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Department Placed" options={[{ value: "Engineering", label: "Engineering" }, { value: "Design", label: "Design" }, { value: "Marketing", label: "Marketing" }, { value: "Sales", label: "Sales" }, { value: "HR", label: "HR" }, { value: "Finance", label: "Finance" }]} required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Input label="Position / Job Title" placeholder="e.g. Frontend Specialist" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>
          <Select label="Reporting Line Manager" options={managers.map((m) => ({ value: m.id, label: `${m.name} (${m.department})` }))} value={form.managerId} placeholder="Select Manager" onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <Input label="Emergency Contact Name / Phone" placeholder="e.g. John Doe (+1 (555) 000-0000)" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
          </div>
          <Textarea label="Roster Notes / Address Details" placeholder="Specify physical address or other emergency files..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Generate Profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
