import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { ModalHost } from "@/components/modals/modal-host";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

function HeaderFallback() {
  return <div className="h-14 border-b border-border/80" />;
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionaries = await loadDictionaries(["common", "header"], lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DictionaryProvider locale={lang} dictionaries={dictionaries}>
          <Suspense fallback={<HeaderFallback />}>
            <SiteHeader />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <ModalHost locale={lang} />
          </Suspense>
        </DictionaryProvider>
      </body>
    </html>
  );
}
