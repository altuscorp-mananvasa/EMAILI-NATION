import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "./Nav";

export const metadata: Metadata = {
  title: "Productivity Shastra Outreach",
  description: "90-day automated, personalized founder outreach platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
