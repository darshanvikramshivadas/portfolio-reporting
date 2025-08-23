import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter font for consistent typography across the application
const inter = Inter({ subsets: ["latin"] });

/**
 * Application Metadata
 * 
 * Defines the page title, description, and other meta information
 */
export const metadata: Metadata = {
  title: "Wealth Management Portfolio - Client Servicing Desk",
  description: "Portfolio reporting system for wealth management client servicing desk",
};

/**
 * Root Layout Component
 * 
 * Wraps all pages in the application with consistent styling and structure.
 * Provides the HTML document structure and global font configuration.
 * 
 * @param children - React components to render within the layout
 * @returns HTML document with consistent structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
