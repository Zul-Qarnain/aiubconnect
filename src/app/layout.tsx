
"use client";

import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const showSearch = pathname === '/';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AIUB Connect</title>
        <meta name="description" content="A community forum for AIUB students." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header 
              searchQuery={searchQuery}
              onSearchChange={showSearch ? setSearchQuery : undefined}
            />
            <main className="flex-1 container mx-auto py-6 sm:py-8 px-4">
              {/* Pass searchQuery to children if it's the home page */}
               {pathname === '/' ? (
                children
              ) : (
                children
              )}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
