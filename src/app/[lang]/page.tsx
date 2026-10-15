import { loadDictionaries } from "@/i18n/load-dictionaries";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const dictionaries = await loadDictionaries(["home"], lang);
  const t = createT(dictionaries);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">{t("home.title")}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        {t("home.description")}
      </p>
    </main>
  );
}
