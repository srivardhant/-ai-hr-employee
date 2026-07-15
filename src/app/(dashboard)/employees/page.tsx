"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Download } from "lucide-react";
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

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    position: "",
    salary: "",
    managerId: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
  });

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setRole(u.role || "HR");
      }

      const res = await fetch("/api/employees");
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) {
      toast.error("Failed to load employee records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Employee Profile created successfully!");
        setIsModalOpen(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          department: "Engineering",
          position: "",
          salary: "",
          managerId: "",
          address: "",
          dateOfBirth: "",
          emergencyContact: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create profile");
      }
    } catch (e) {
      toast.error("Error creating employee record.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmployee = role === "EMPLOYEE";
  const managers = employees.filter((e) => e.userId && e.userId !== ""); // simple managers pool

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Roster & Directory"
        description="Verify active staff records, modify roles, manage reporting hierarchies, and check departments."
        action={
          <div className="flex items-center gap-2">
            {!isEmployee && (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Employee Profile
              </Button>
            )}
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

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">Active Corporate Directory</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading directory...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No employee profiles cataloged.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Employee Profile Record"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alice Jenkins"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Personal Email"
              type="email"
              placeholder="e.g. alice@gmail.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (555) 019-2831"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Annual Salary ($)"
              type="number"
              placeholder="e.g. 85000"
              required
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Department Placed"
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
            <Input
              label="Position / Job Title"
              placeholder="e.g. Frontend Specialist"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>

          <Select
            label="Reporting Line Manager"
            options={managers.map((m) => ({ value: m.id, label: `${m.name} (${m.department})` }))}
            value={form.managerId}
            placeholder="Select Manager"
            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Input
              label="Emergency Contact Name / Phone"
              placeholder="e.g. John Doe (+1 (555) 000-0000)"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            />
          </div>

          <Textarea
            label="Roster Notes / Address Details"
            placeholder="Specify physical address or other emergency files..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Generate Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
