"use client";

import { GlobeIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/i18n/config";
import { replaceLocaleInPathname } from "@/i18n/pathname";

const localeLabelKeys: Record<Locale, "localeEn" | "localeRu"> = {
  en: "localeEn",
  ru: "localeRu",
};

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useDictionary();

  function selectLocale(nextLocale: string) {
    if (!locales.includes(nextLocale as Locale) || nextLocale === locale) {
      return;
    }

    const nextPath = replaceLocaleInPathname(pathname, nextLocale as Locale);
    const query = searchParams.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("common.language")}
          />
        }
      >
        <GlobeIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup value={locale} onValueChange={selectLocale}>
          {locales.map((item) => (
            <DropdownMenuRadioItem key={item} value={item}>
              {t(`common.${localeLabelKeys[item]}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
