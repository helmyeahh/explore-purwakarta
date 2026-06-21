import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { DataProvider } from "@/contexts/DataContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Explore Purwakarta",
  description: "Modern, interactive, and mobile-first tourism guide for Purwakarta City.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <GoogleOAuthProvider clientId="363725674253-hucbueeauac508vmtq7l390d491msopb.apps.googleusercontent.com">
          <DataProvider>
            {children}
          </DataProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
