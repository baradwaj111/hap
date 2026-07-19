import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { PanicButton } from "@/components/ui/PanicButton";
import { ReminderScheduler } from "@/components/ui/ReminderScheduler";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastHost } from "@/components/ui/ToastHost";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — a gentle companion`,
  description: "A soft daily companion. Everything stays on this phone.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FDF8FF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="lavender"
      className={`${quicksand.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <ServiceWorkerRegistration />
          <ReminderScheduler />
          <ToastHost />
          {children}
          <PanicButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
