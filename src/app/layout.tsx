

"use client";

import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Roboto } from 'next/font/google';

export const runtime = 'edge';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AIUB Connect</title>
        <meta name="description" content="A community forum for AIUB students." />
      </head>
      <body className={`${roboto.variable} font-body antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'monokai', 'tokyo-night', 'dracula']}
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-6 sm:py-8 px-4">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
