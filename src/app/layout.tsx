import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "AI HR Employee - Intelligent HR Management Platform",
  description:
    "AI-powered HR Management platform with autonomous workflow agents. Manage recruitment, onboarding, payroll, performance, and more with intelligent automation.",
  keywords: [
    "HR Management",
    "AI HR",
    "Employee Management",
    "Recruitment",
    "Payroll",
    "Onboarding",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var resolved = 'light';
                if (theme === 'dark') resolved = 'dark';
                else if (theme === 'system') resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                else if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) resolved = 'dark';
                if (resolved === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `}}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f43f5e",
                  secondary: "#fff",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
