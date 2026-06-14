import Header from "./components/Header";   // ← adiciona esta linha no topo
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle Financeiro APP",
  description: "Controle Financeiro APP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><script
  dangerouslySetInnerHTML={{
    __html: `try{if(localStorage.getItem('tema')==='escuro'){document.documentElement.classList.add('dark')}}catch(e){}`,
  }}
/><Header />{children}</body>
    </html>
  );
}
