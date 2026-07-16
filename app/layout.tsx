import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "EduBridge — Learn in-demand skills online",
    template: "%s · EduBridge",
  },
  description:
    "Browse and enroll in expert-led courses on web development, data science, design, mobile and more. Learn anywhere, on any device. Pay with MoMo or Orange Money.",
  keywords: ["online courses", "e-learning", "EduBridge", "web development", "data science", "Cameroon"],
  manifest: "/manifest.json",
  openGraph: {
    title: "EduBridge — Learn in-demand skills online",
    description: "Expert-led courses. Learn anywhere. Pay with MoMo or Orange Money.",
    type: "website",
    siteName: "EduBridge",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A237E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <AuthProvider>
          <PWARegister />
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
