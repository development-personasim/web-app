"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  MODAL_PARAM,
  buildSearchParams,
  hrefWithParams,
} from "@/lib/modals/query";

export function useModalQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modal = searchParams.get(MODAL_PARAM);

  const replaceParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = buildSearchParams(searchParams, updates);
      router.replace(hrefWithParams(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openModal = useCallback(
    (id: string, params: Record<string, string | null | undefined> = {}) => {
      replaceParams({
        [MODAL_PARAM]: id,
        ...params,
      });
    },
    [replaceParams],
  );

  const closeModal = useCallback(
    (keysToRemove: string[] = []) => {
      const updates: Record<string, null> = {
        [MODAL_PARAM]: null,
      };

      for (const key of keysToRemove) {
        updates[key] = null;
      }

      replaceParams(updates);
    },
    [replaceParams],
  );

  const hrefForModal = useCallback(
    (id: string, params: Record<string, string | null | undefined> = {}) => {
      return hrefWithParams(
        pathname,
        buildSearchParams(searchParams, {
          [MODAL_PARAM]: id,
          ...params,
        }),
      );
    },
    [pathname, searchParams],
  );

  const isOpen = useCallback((id: string) => modal === id, [modal]);

  return useMemo(
    () => ({
      modal,
      isOpen,
      openModal,
      closeModal,
      replaceParams,
      hrefForModal,
      searchParams,
    }),
    [
      modal,
      isOpen,
      openModal,
      closeModal,
      replaceParams,
      hrefForModal,
      searchParams,
    ],
  );
}
