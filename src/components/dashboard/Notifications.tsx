'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  FileText,
  Star,
  Calendar,
  DollarSign,
  CheckCircle,
  Bell,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

/* ────────────── Types ────────────── */

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'recruitment' | 'document' | 'payroll' | 'meeting' | 'performance';
  onClick?: () => void;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
  className?: string;
}

/* ────────────── Icon / Color Map ────────────── */

const typeConfig: Record<Notification['type'], { icon: LucideIcon; color: string }> = {
  info: { icon: Bell, color: 'from-blue-500 to-indigo-500' },
  success: { icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
  warning: { icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
  recruitment: { icon: UserPlus, color: 'from-indigo-500 to-violet-500' },
  document: { icon: FileText, color: 'from-cyan-500 to-teal-500' },
  payroll: { icon: DollarSign, color: 'from-emerald-500 to-green-500' },
  meeting: { icon: Calendar, color: 'from-purple-500 to-fuchsia-500' },
  performance: { icon: Star, color: 'from-amber-500 to-orange-500' },
};

/* ────────────── Component ────────────── */

export default function Notifications({
  notifications,
  onMarkAllRead,
  className = '',
}: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.map((notification, idx) => {
          const config = typeConfig[notification.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              onClick={notification.onClick}
              className={`
                flex items-start gap-3 p-3 rounded-xl
                transition-colors duration-150
                ${notification.onClick ? 'cursor-pointer' : ''}
                ${
                  notification.read
                    ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-lg bg-gradient-to-br ${config.color}
                  flex items-center justify-center flex-shrink-0
                `}
              >
                <Icon size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm leading-tight truncate ${
                    notification.read
                      ? 'font-medium text-slate-700 dark:text-slate-300'
                      : 'font-semibold text-slate-900 dark:text-white'
                  }`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
                  {notification.time}
                </span>
              </div>
            </motion.div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { Notifications };
export { Notifications as NotificationsPanel };
