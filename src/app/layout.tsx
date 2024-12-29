import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Calendar Heatmap",
  description: "A beautiful calendar heatmap visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href="/heat.js/heat.js.min.css" />
      </head>
      <body className={inter.className}>
        <Script src="/heat.js/heat.min.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
