import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'HealthWise',
  description: 'Your personal AI health assistant',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ layout: { logoImageUrl: '/logo.png' } }}>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
