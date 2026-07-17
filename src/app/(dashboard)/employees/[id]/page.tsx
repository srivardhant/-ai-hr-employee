"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User, Briefcase, Mail, Phone, Calendar, Clock, GraduationCap, DollarSign, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${id}`);
        if (res.ok) {
          setEmployee(await res.json());
        } else {
          toast.error("Failed to load employee details.");
        }
      } catch (error) {
        toast.error("An error occurred loading employee data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <Card>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Employee Not Found</h2>
        <Button className="mt-4" onClick={() => router.push('/employees')}>Back to Employees</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Button variant="ghost" className="mb-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => router.push('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employee List
        </Button>
      </div>

      {/* Main Header Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-800">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-start">
            <div className="flex gap-6 items-end -mt-12">
              <div className="rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800">
                <Avatar name={employee.name} src={employee.profileImage} size="xl" />
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{employee.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{employee.position} &middot; {employee.department}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-end gap-2">
              <StatusBadge status={employee.status} />
              <span className="text-xs font-semibold text-slate-400">ID: {employee.employeeId}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Contact & Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Contact Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{employee.phone || 'N/A'}</span>
              </div>
              {employee.address && (
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/50 text-sm">
                  <p className="text-slate-400 mb-1 text-xs uppercase font-semibold">Address / Notes</p>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{employee.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                Employment Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 mb-1 text-xs uppercase font-semibold">Date of Joining</p>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(employee.joinDate)}
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1 text-xs uppercase font-semibold">Reporting Manager</p>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {employee.manager?.name || "Hierarchical Root"}
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1 text-xs uppercase font-semibold">Base Compensation</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  {formatCurrency(employee.salary)} / yr
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Modules & Statuses */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Recent Leaves
              </h3>
            </CardHeader>
            <CardContent>
              {employee.leaves?.length ? (
                <div className="space-y-3">
                  {employee.leaves.map((leave: any) => (
                    <div key={leave.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{leave.type}</p>
                        <p className="text-xs text-slate-500">{formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.days} days)</p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No leave records found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                Recent Payroll
              </h3>
            </CardHeader>
            <CardContent>
              {employee.payrolls?.length ? (
                <div className="space-y-3">
                  {employee.payrolls.map((pr: any) => (
                    <div key={pr.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(pr.year, pr.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-slate-500">Net Pay: {formatCurrency(pr.netPay)}</p>
                      </div>
                      <StatusBadge status={pr.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No payroll records generated yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  Trainings
                </h3>
              </CardHeader>
              <CardContent>
                {employee.trainings?.length ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-bold">{employee.trainings.filter((t:any) => t.status === "COMPLETED").length}</span> completed out of <span className="font-bold">{employee.trainings.length}</span> assigned.
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">No active trainings.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-indigo-500" />
                  Onboarding / Offboarding
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Onboarding</span>
                    <StatusBadge status={employee.onboarding?.status || "PENDING"} />
                  </div>
                  {employee.exitProcess && (
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 pt-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Exit Process</span>
                      <StatusBadge status={employee.exitProcess.status} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
