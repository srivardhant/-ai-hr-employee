import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  className,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "glass-card transition-all duration-300",
        hoverEffect && "hover:translate-y-[-4px] hover:shadow-xl hover:border-indigo-500/20 dark:hover:border-indigo-500/30",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/30 flex items-center justify-between", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-200/50 dark:border-slate-700/30 rounded-b-2xl",
        className
      )}
      {...props}
    />
  );
}
