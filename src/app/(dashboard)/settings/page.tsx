"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [googleStatus, setGoogleStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/google/status");
      if (res.ok) {
        setGoogleStatus(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch google status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/google/connect");
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        toast.error("Failed to initiate connection");
      }
    } catch (e) {
      toast.error("Error connecting to Google");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account preferences and integrations</p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Theme</h3>
            <p className="text-sm text-slate-500">Toggle dark mode</p>
          </div>
          {/* Theme toggle would go here */}
        </div>

        <div className="flex items-start justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Google Calendar Integration</h3>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Connect the company Google account to automatically schedule Meet links and Calendar events for interviews.
            </p>
            {!loading && googleStatus && (
              <div className="mt-4 flex items-center gap-3">
                {googleStatus.status === "CONNECTED" ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connected to {googleStatus.email}</span>
                  </div>
                ) : googleStatus.status === "EXPIRED" ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full">
                    <RefreshCw className="w-4 h-4" />
                    <span>Token Expired. Please reconnect.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <XCircle className="w-4 h-4" />
                    <span>Not Connected</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={googleStatus?.status === "CONNECTED" ? "outline" : "primary"}
              onClick={handleConnect}
              disabled={loading}
            >
              {googleStatus?.status === "CONNECTED" ? "Reconnect" : "Connect Google"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
