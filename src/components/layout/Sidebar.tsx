'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Briefcase,
  DollarSign,
  CalendarOff,
  Star,
  TrendingUp,
  Heart,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Mail,
  type LucideIcon,
} from 'lucide-react';

/* ────────────── Role-based access config ────────────── */

type Role = 'HR' | 'MANAGER' | 'EMPLOYEE';

const ROLE_ACCESS: Record<string, Role[]> = {
  '/': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/recruitment': ['HR'],
  '/interviews': ['HR', 'MANAGER'],
  '/evaluations': ['HR'],
  '/offers': ['HR'],
  '/onboarding': ['HR'],
  '/training': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/payroll': ['HR', 'EMPLOYEE'],
  '/leave': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/performance': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/promotions': ['HR', 'MANAGER'],
  '/engagement': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/exit': ['HR'],
  '/employees': ['HR', 'MANAGER', 'EMPLOYEE'],
  '/workflow': ['HR'],
  '/inbox': ['HR', 'MANAGER', 'EMPLOYEE'],
};

function hasAccess(path: string, role: Role): boolean {
  const allowed = ROLE_ACCESS[path];
  return allowed ? allowed.includes(role) : false;
}

/* ────────────── Navigation config ────────────── */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const allNavSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Inbox', href: '/inbox', icon: Mail },
    ],
  },
  {
    title: 'RECRUITMENT',
    items: [
      { label: 'Recruitment', href: '/recruitment', icon: UserPlus },
      { label: 'Interviews', href: '/interviews', icon: Calendar },
      { label: 'Evaluations', href: '/evaluations', icon: ClipboardCheck },
      { label: 'Offers', href: '/offers', icon: FileText },
    ],
  },
  {
    title: 'HR OPERATIONS',
    items: [
      { label: 'Onboarding', href: '/onboarding', icon: Briefcase },
      { label: 'Training', href: '/training', icon: GraduationCap },
      { label: 'Payroll', href: '/payroll', icon: DollarSign },
      { label: 'Leave', href: '/leave', icon: CalendarOff },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Performance', href: '/performance', icon: Star },
      { label: 'Promotions', href: '/promotions', icon: TrendingUp },
      { label: 'Engagement', href: '/engagement', icon: Heart },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { label: 'Exit Process', href: '/exit', icon: LogOut },
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'AI Workflow', href: '/workflow', icon: Bot },
    ],
  },
];

/* ────────────── Sidebar Component ────────────── */

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (val: boolean) => void;
}

export default function Sidebar({
  collapsed = false,
  setCollapsed = () => {},
}: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>('HR');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setRole(JSON.parse(userStr).role); } catch {}
    }
  }, []);

  // Filter navigation sections based on role
  const navigation = allNavSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasAccess(item.href, role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="
        fixed top-0 left-0 h-screen z-40
        bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl
        border-r border-slate-200/60 dark:border-slate-700/50
        flex flex-col overflow-hidden
        shadow-xl shadow-slate-200/20 dark:shadow-slate-900/50
      "
    >
      {/* ─── Brand ─── */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
          <Sparkles size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                AI HR Employee
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Enterprise Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {navigation.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-sm font-medium transition-colors duration-150
                        group
                        ${
                          isActive
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon
                        size={20}
                        className={`relative z-10 flex-shrink-0 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                        }`}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="relative z-10 truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="
                          absolute left-full ml-3 px-2.5 py-1.5
                          bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium
                          rounded-lg shadow-lg
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all duration-150 whitespace-nowrap z-50
                          pointer-events-none
                        ">
                          {item.label}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ─── Collapse Toggle ─── */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCollapsed(!collapsed)}
          className="
            w-full flex items-center justify-center gap-2 p-2.5
            rounded-xl text-sm font-medium
            text-slate-500 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors duration-200
          "
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

export { Sidebar };
