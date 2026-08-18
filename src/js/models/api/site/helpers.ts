function reduceToDefined<T = any, R = any>(params: (T | undefined | null)[], func: (e: T) => (R | undefined)) {
  let r: R | undefined;
  if (params.some(a => r ??= a ? func(a) : undefined)) return r;
}
/**
 * Validates href contains a user's name & not an id.
 * @param href 
 * @returns 
 */
export function pullUserNameFromHref(href: string) {
  try {
    const name = new URL(href).pathname.match(/^\/users\/[^/\s]+/)?.[1];
    if (name && !(/^[0-9]+$/.test(name)))
      return name;
  } catch {}
}
/**
 * 
 * @param article The `<article>` representing the user's comment/forum
 * post/staff note; should have an `<a>` element linking to the user's page
 * via ID.
 * @returns {HTMLAnchorElement | null} 
 * 
 * NOTE: Assumes structure of `.author-info > .name-rank > .author-name >
 * a[href^="/users/"]`
 */
export function userLinkFromArticle(article: HTMLElement) {
  return article.querySelector<HTMLAnchorElement>('.author-info .author-name a[href^="/users/"]');
}
export function pullUserIdFromHref(href: string) {
  try {
    const id = new URL(href).pathname.match(/^\/users\/([0-9]+)/)?.[1];
    if (id) {
      const r = parseInt(id);
      if (r >= 0) return r;
    }
  } catch {}
}
export function tryPullUserIdFromHrefs(...hrefs: (string | null | undefined)[]) {
  return reduceToDefined(hrefs, pullUserIdFromHref);
}
export function pullUserIdFromAnchor(a: HTMLAnchorElement) {
  return pullUserIdFromHref(a.href);
}
export function tryPullUserIdFromAnchors(...as: (HTMLAnchorElement | null | undefined)[]) {
  return reduceToDefined(as, pullUserIdFromAnchor);
}
export function pullUserNameFromAnchor(a: HTMLAnchorElement, fallbackToInnerHtml = false) {
  return a.innerText || (fallbackToInnerHtml ? a.innerHTML || undefined : undefined);
}
export function tryPullUserNameFromAnchors(...as: (HTMLAnchorElement | null | undefined)[]) {
  return reduceToDefined(as, pullUserNameFromAnchor);
}
export function pullUserNameFromAnchorOrHref(a: HTMLAnchorElement | string, fallbackToInnerHtml = false) {
  return typeof a === "string" ? pullUserNameFromHref(a) : pullUserNameFromAnchor(a, fallbackToInnerHtml);
}
export function tryPullUserNameFromAnchorsOrHrefs(...as: (HTMLAnchorElement | null | undefined)[]) {
  return reduceToDefined(as, pullUserNameFromAnchorOrHref);
}