import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Deploy.com — Deploy any Git repo in 2 clicks",
  description: "Paste a repo URL, add env vars, and Deploy.com ships a live build in minutes.",
  metadataBase: new URL("https://deploy.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("min-h-[100dvh] bg-background text-foreground antialiased", outfit.variable, jetbrains.variable)}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 520px at 18% 10%, rgba(37,99,235,0.12), transparent 60%), radial-gradient(720px 420px at 85% 15%, rgba(15,23,42,0.08), transparent 65%)"
            }}
          />
          <main className="relative">{children}</main>
          <Script
            src="https://agent-pug.vercel.app/agentbar.js"
            data-site="https://deploydotcom.vercel.app"
            data-api="https://agent-pug.vercel.app"
            data-depth="1"
            data-max-pages="15"
            data-site-key="deploydotcom.vercel.app"
            data-theme-color="#059669"
            data-position="right"
            data-title="Site Assistant"
            data-subtitle="Get answers from your site."
            data-font-family="ui-sans-serif, system-ui, -apple-system"
            data-panel-background="#ffffff"
            data-text-color="#0f172a"
            data-muted-text-color="#64748b"
            data-border-color="#e2e8f0"
            data-button-background="#ffffff"
            data-button-text-color="#0f172a"
            data-button-shadow="0 18px 40px -28px rgba(15, 23, 42, 0.35)"
            data-panel-shadow="0 30px 60px -45px rgba(15, 23, 42, 0.35)"
            data-panel-width="320px"
            data-panel-max-height="70vh"
            data-panel-radius="16px"
            data-button-radius="16px"
            data-offset-x="20"
            data-offset-y="20"
            data-input-placeholder="Type a message"
            data-send-label="Send"
            data-suggestions="Search pricing | Explain a feature | Draft homepage copy"
            data-draggable="true"
            data-persist-position="false"
            data-show-typing-indicator="true"
            data-show-export="false"
            data-export-label="Copy"
            data-show-scroll-button="true"
            data-scroll-label="Scroll"
            data-show-minimize="false"
            data-minimized-on-load="false"
            data-minimize-label="Minimize"
            data-expand-label="Expand"
            data-show-timestamps="false"
            data-auto-scroll="true"
            data-auto-scroll-threshold="24"
            data-message-max-width="85%"
            data-auto-ingest="true"
            data-close-on-outside-click="true"
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
