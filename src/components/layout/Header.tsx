'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  X,
  Loader2,
  Menu,
  ExternalLink,
  CheckCheck,
  Clock,
  Users,
  Briefcase,
  CalendarOff,
  DollarSign,
  Star,
  GraduationCap,
  FileText,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  email: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  INFO: Bell,
  WARNING: Bell,
  SUCCESS: CheckCheck,
  ERROR: X,
  WORKFLOW: Briefcase,
};

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Header({
  userName = 'Admin User',
  userRole = 'Super Admin',
  userAvatar,
  onLogout,
  onMenuToggle,
}: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [quickStats, setQuickStats] = useState<{ label: string; value: string; color: string }[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const u = JSON.parse(userStr);
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(u.email)}`);
      if (res.ok) setNotifications(await res.json());
    } catch {} finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Quick Stats
  const fetchQuickStats = useCallback(async () => {
    try {
      const [emps, leaves] = await Promise.all([
        fetch('/api/employees').then(r => r.ok ? r.json() : []),
        fetch('/api/leave').then(r => r.ok ? r.json() : []),
      ]);
      const pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING').length;
      setQuickStats([
        { label: 'Employees', value: String(emps.length || 0), color: 'indigo' },
        { label: 'Pending Leaves', value: String(pendingLeaves), color: 'amber' },
      ]);
    } catch {}
  }, []);

  useEffect(() => {
    if (dropdownOpen) fetchQuickStats();
  }, [dropdownOpen, fetchQuickStats]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/employees?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchResults(true);
        }
      } catch {} finally {
        setSearching(false);
      }
    }, 250);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const u = JSON.parse(userStr);
      await fetch(`/api/notifications?email=${encodeURIComponent(u.email)}`, { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const RESULT_ICONS: Record<string, LucideIcon> = {
    Engineering: Briefcase,
    Design: Star,
    Marketing: Users,
    Sales: DollarSign,
    HR: Users,
    Finance: DollarSign,
  };

  const sectionIcons: Record<string, LucideIcon> = {
    Engineering: Briefcase,
    Design: Star,
    Marketing: Users,
    Sales: DollarSign,
    HR: Users,
    Finance: DollarSign,
  };

  return (
    <header
      className="
        sticky top-0 z-30
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-b border-slate-200/60 dark:border-slate-700/50
        px-4 md:px-6 py-3
      "
    >
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <Search
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              searchFocused
                ? 'text-indigo-500 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <input
            type="text"
            placeholder="Search employees, tasks, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              if (searchResults.length > 0) setShowSearchResults(true);
            }}
            onBlur={() => setSearchFocused(false)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
              bg-slate-50 dark:bg-slate-800/80
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
              transition-all duration-200
            "
          />

          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute left-0 right-0 top-full mt-2
                  bg-white dark:bg-slate-800
                  rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700/50
                  overflow-hidden z-50
                "
              >
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((result) => {
                      const Icon = sectionIcons[result.department] || Users;
                      return (
                        <li key={result.id}>
                          <Link
                            href={`/employees`}
                            onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                            className="
                              flex items-center gap-3 px-4 py-3
                              hover:bg-slate-50 dark:hover:bg-slate-700/50
                              transition-colors duration-150
                            "
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                              <Icon size={16} className="text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {result.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {result.position} &middot; {result.department}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                              {result.employeeId}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link
                        href={`/employees`}
                        onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                        className="
                          flex items-center justify-center gap-1.5 px-4 py-2.5
                          text-xs font-medium text-indigo-500
                          bg-slate-50 dark:bg-slate-700/30
                          hover:bg-slate-100 dark:hover:bg-slate-700/50
                          transition-colors duration-150
                        "
                      >
                        <ExternalLink size={12} />
                        View all employees
                      </Link>
                    </li>
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              className="
                relative p-2.5 rounded-xl
                bg-slate-100 dark:bg-slate-800
                hover:bg-slate-200 dark:hover:bg-slate-700
                text-slate-600 dark:text-slate-300
                transition-colors duration-200
              "
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px] px-1
                    flex items-center justify-center
                    text-[10px] font-bold text-white
                    bg-gradient-to-r from-rose-500 to-pink-500
                    rounded-full shadow-sm
                  "
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="
                    absolute right-0 top-full mt-2 w-80 sm:w-96
                    bg-white dark:bg-slate-800
                    rounded-xl shadow-xl
                    border border-slate-200/60 dark:border-slate-700/50
                    overflow-hidden z-50
                  "
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-slate-400" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-40" />
                        No notifications yet
                      </div>
                    ) : (
                      <ul>
                        {notifications.map((n) => {
                          const TypeIcon = TYPE_ICONS[n.type] || Bell;
                          return (
                            <li key={n.id}>
                              <button
                                onClick={() => {
                                  if (!n.read) markOneRead(n.id);
                                  if (n.link) window.location.href = n.link;
                                }}
                                className={`
                                  w-full flex items-start gap-3 px-4 py-3 text-left
                                  transition-colors duration-150
                                  ${n.read
                                    ? 'bg-transparent'
                                    : 'bg-indigo-50/50 dark:bg-indigo-500/5'
                                  }
                                  hover:bg-slate-50 dark:hover:bg-slate-700/30
                                `}
                              >
                                <div className={`
                                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                                  ${n.type === 'SUCCESS' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500' :
                                    n.type === 'ERROR' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-500' :
                                    n.type === 'WARNING' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-500' :
                                    'bg-slate-100 dark:bg-slate-700 text-slate-500'}
                                `}>
                                  <TypeIcon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white font-semibold'}`}>
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                    {n.message}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                    {formatTime(n.createdAt)}
                                  </p>
                                </div>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="
                flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl
                hover:bg-slate-50 dark:hover:bg-slate-800/60
                transition-colors duration-200
              "
            >
              <Avatar src={userAvatar} name={userName} size="sm" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {userRole}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 hidden md:block ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="
                    absolute right-0 top-full mt-2 w-52
                    bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                    rounded-xl shadow-xl
                    border border-slate-200/60 dark:border-slate-700/50
                    py-1.5 z-50
                  "
                >
                  <DropdownItem icon={User} label="Profile" />
                  <DropdownItem icon={Settings} label="Settings" />
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-700/50" />
                  <div className="px-4 py-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Quick Stats</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickStats.length > 0 ? quickStats.map((s) => (
                        <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-center">
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
                          <p className="text-[10px] text-slate-400">{s.label}</p>
                        </div>
                      )) : (
                        <div className="col-span-2 text-center py-2">
                          <Loader2 size={14} className="animate-spin text-slate-400 mx-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-700/50" />
                  <DropdownItem
                    icon={LogOut}
                    label="Log out"
                    danger
                    onClick={onLogout}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden mt-3 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
            bg-slate-50 dark:bg-slate-800/80
            border border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            transition-all duration-200
          "
        />
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-4 py-2 text-sm
        transition-colors duration-150
        ${
          danger
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export { Header };
