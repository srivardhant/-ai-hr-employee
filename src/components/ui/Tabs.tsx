"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ activeTab, onChange, children, className }: TabsProps) {
  // Pass activeTab down by creating a simple context or cloning children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { activeTab, onChange });
    }
    return child;
  });

  return <div className={cn("w-full space-y-6", className)}>{childrenWithProps}</div>;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
}

export function TabList({ children, className, activeTab, onChange }: TabListProps) {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { activeTab, onChange });
    }
    return child;
  });

  return (
    <div
      className={cn(
        "flex p-1 gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl w-fit",
        className
      )}
    >
      {childrenWithProps}
    </div>
  );
}

interface TabProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tab({ id, children, className, activeTab, onChange }: TabProps) {
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => onChange && onChange(id)}
      className={cn(
        "relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none cursor-pointer",
        isActive
          ? "text-slate-900 dark:text-white"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-white dark:bg-slate-800 border border-slate-200/20 dark:border-slate-700/30 rounded-lg shadow-sm"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  activeTab?: string;
}

export function TabPanel({ id, children, activeTab }: TabPanelProps) {
  if (activeTab !== id) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="focus:outline-none w-full"
    >
      {children}
    </motion.div>
  );
}
