import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ToastProvider } from "@/components/ui/Toaster";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DreamPath — Career Exploration for Students",
  description: "Discover careers, build personalized roadmaps, and track your progress toward your dream career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AppProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
