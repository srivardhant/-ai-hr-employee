"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { NotificationsPanel } from "@/components/dashboard/Notifications";
import { BarChartWidget, LineChartWidget } from "@/components/dashboard/Charts";
import {
  Users, UserCheck, UserPlus, Briefcase, Calendar, AlertCircle, Clock, DollarSign, Star, Heart, Sparkles,
  GraduationCap, FileCheck, Award, Target, BookOpen, ChevronRight, BadgeCheck,
} from "lucide-react";
import AIInsights from "@/components/dashboard/AIInsights";
import DemoTour from "@/components/demo/DemoTour";
import toast from "react-hot-toast";

type UserInfo = { email: string; role: string; name: string };

export default function RoleDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const u: UserInfo = JSON.parse(userStr);
    setUser(u);
    async function fetchData() {
      try {
        const res = await fetch(`/api/dashboard?role=${u.role}&email=${encodeURIComponent(u.email)}`);
        const notifRes = await fetch("/api/notifications");
        if (res.ok && notifRes.ok) {
          setData(await res.json());
          setNotifications(await notifRes.json());
        } else {
          toast.error("Failed to load dashboard data.");
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred loading dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read.");
      }
    } catch { toast.error("Failed to mark all read."); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9].map(i => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const role = user?.role || "HR";

  return (
    <div className="space-y-6">
      {role === "HR" && <HRDashboard data={data} notifications={notifications} onMarkAllRead={handleMarkAllRead} />}
      {role === "MANAGER" && <ManagerDashboard data={data} />}
      {role === "EMPLOYEE" && <EmployeeDashboard data={data} />}
    </div>
  );
}

/* ===============================
   HR DASHBOARD
   =============================== */
function HRDashboard({ data, notifications, onMarkAllRead }: any) {
  const s = data?.stats || {};
  return (
    <>
      <PageHeader title="HR Operations Dashboard" description="Recruitment pipeline, employee lifecycle, and HR analytics."
        action={<div className="flex items-center gap-2"><DemoTour /><span className="flex items-center gap-2 text-xs font-semibold text-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 px-3 py-1.5 rounded-xl border border-cyan-200/30 dark:border-cyan-800/30"><Users className="w-3.5 h-3.5" />HR Operations</span></div>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Active Employees" value={s.totalEmployees} icon={UserCheck} color="from-emerald-500 to-teal-600" />
        <StatCard title="Open Jobs" value={s.openRecruitment} icon={Briefcase} color="from-violet-500 to-pink-600" />
        <StatCard title="Total Candidates" value={s.candidatesCount} icon={Users} color="from-indigo-500 to-purple-600" />
        <StatCard title="Interviews Scheduled" value={s.interviewsScheduled} icon={Calendar} color="from-amber-500 to-orange-600" />
        <StatCard title="Pending Offers" value={s.pendingOffers} icon={FileCheck} color="from-sky-500 to-blue-600" />
        <StatCard title="Onboarding In Progress" value={s.onboardingProgress} icon={UserPlus} color="from-cyan-500 to-blue-600" />
        <StatCard title="Active Trainings" value={s.activeTrainings} icon={GraduationCap} color="from-fuchsia-500 to-purple-600" />
        <StatCard title="Pending Leaves" value={s.pendingLeaves} icon={Clock} color="from-rose-500 to-pink-500" />
        <StatCard title="Engagement Score" value={s.employeeEngagementScore} suffix="/5" icon={Heart} color="from-pink-500 to-rose-600" />
      </div>
      <AIInsights role="HR" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartWidget title="Candidates by Status" data={data?.candidateChart || []} />
        <BarChartWidget title="Training Completion Status" data={data?.trainingChart || []} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline activities={data?.activities || []} />
        <NotificationsPanel notifications={notifications} onMarkAllRead={onMarkAllRead} />
      </div>
    </>
  );
}

/* ===============================
   MANAGER DASHBOARD
   =============================== */
function ManagerDashboard({ data }: any) {
  const s = data?.stats || {};
  return (
    <>
      <PageHeader title="Team Dashboard" description="Your direct reports, approvals, and team performance."
        action={<div className="flex items-center gap-2"><DemoTour /><span className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30"><Target className="w-3.5 h-3.5" />Team View</span></div>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Size" value={s.teamSize} icon={Users} color="from-emerald-500 to-teal-600" />
        <StatCard title="Pending Leave Approvals" value={s.pendingLeaveApprovals} icon={Clock} color="from-amber-500 to-orange-600" />
        <StatCard title="Performance Reviews Due" value={s.reviewsDue} icon={Star} color="from-violet-500 to-purple-600" />
        <StatCard title="Trainings In Progress" value={s.teamTrainingsDue} icon={BookOpen} color="from-sky-500 to-blue-600" />
      </div>
      <AIInsights role="MANAGER" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartWidget title="Team Payroll Expenditure" data={data?.payrollData || []} />
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Recent Recognitions</h3>
          {data?.recognitions?.length ? (
            <div className="space-y-3">
              {data.recognitions.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-700/30">
                  <Award className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.employeeName} &middot; {r.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recognitions yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

/* ===============================
   EMPLOYEE DASHBOARD
   =============================== */
function EmployeeDashboard({ data }: any) {
  const s = data?.stats || {};
  return (
    <>
      <PageHeader title="My Dashboard" description="Your personal HR overview at a glance."
        action={<div className="flex items-center gap-2 text-xs font-semibold text-amber-500 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-200/30 dark:border-amber-800/30"><BadgeCheck className="w-3.5 h-3.5" />Employee Self-Service</div>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Leave Balance" value={s.totalLeaveDays} suffix=" days" icon={Calendar} color="from-emerald-500 to-teal-600" />
        <StatCard title="Pending Leave Days" value={s.pendingLeaveDays} icon={Clock} color="from-amber-500 to-orange-600" />
        <StatCard title="Last Payroll" value={s.lastPayrollAmount} prefix="$" icon={DollarSign} color="from-blue-500 to-indigo-600" />
        <StatCard title="Trainings Done" value={s.completedTrainings} suffix={`/${s.totalTrainings}`} icon={GraduationCap} color="from-violet-500 to-purple-600" />
        <StatCard title="Recognitions" value={s.recognitionsCount} icon={Award} color="from-pink-500 to-rose-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll chart */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">My Payroll History</h3>
          {data?.payrollChart?.length ? (
            <div className="space-y-2">
              {[...data.payrollChart].reverse().map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{p.name}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">${p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No payroll data available.</p>
          )}
        </div>
        {/* In-progress training & last review */}
        <div className="space-y-6">
          {data?.inProgressTraining && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Current Training</h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">{data.inProgressTraining.title}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${data.inProgressTraining.progress}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{data.inProgressTraining.progress}% complete</p>
            </div>
          )}
          {data?.lastReview && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Latest Review</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Q{data.lastReview.quarter} {data.lastReview.year}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.lastReview.rating}/5</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{data.lastReview.feedback}</p>
            </div>
          )}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">My Recent Leaves</h3>
            {data?.myLeaves?.length ? (
              <div className="space-y-2">
                {data.myLeaves.map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{l.type}</p>
                      <p className="text-xs text-slate-500">{l.days} day(s)</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      l.status === "APPROVED" ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" :
                      l.status === "PENDING" ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" :
                      "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10"
                    }`}>{l.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No leave records.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
