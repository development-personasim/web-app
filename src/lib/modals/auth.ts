import {
  MODAL_PARAM,
  authModal,
  buildSearchParams,
  hrefWithParams,
  type AuthModalView,
} from "@/lib/modals/query";

export function authModalHref(
  options: {
    pathname?: string;
    view?: AuthModalView;
    method?: "email";
    next?: string;
    error?: string;
    current?: string | URLSearchParams;
  } = {},
) {
  const pathname = options.pathname ?? "/";
  const params = buildSearchParams(options.current ?? "", {
    [MODAL_PARAM]: authModal.id,
    view: options.view,
    method: options.method,
    next: options.next,
    error: options.error,
  });

  return hrefWithParams(pathname, params);
}
