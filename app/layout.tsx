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
            data-site="arjunshah.com"
            data-api="https://agent-pug.vercel.app"
            data-depth="1"
            data-max-pages="15"
            data-theme-color="#059669"
            data-position="right"
            data-title="Site Assistant"
            data-subtitle="Ask anything about this site."
            data-button-label="Ask"
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
