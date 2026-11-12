import { safeUrl } from "#shared/head.mjs";
export const safeHref = (value) => safeUrl(value, { contact: true }) || "#";
export function mediaUrl(image) {
  return safeUrl(image?.file?.url || image?.url) || "";
}
