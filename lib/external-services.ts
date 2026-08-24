const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const backendUrl = trimTrailingSlash(
  process.env.VAADA_API_URL ?? process.env.NEXT_PUBLIC_VAADA_API_URL ?? "",
);

export const mobileAppUrl = process.env.NEXT_PUBLIC_VAADA_APP_URL ?? "/contact?subject=mobile-app";

export function backendEndpoint(path: string) {
  if (!backendUrl) return "";
  return `${backendUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
