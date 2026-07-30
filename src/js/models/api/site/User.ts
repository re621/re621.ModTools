import { tryPullUserIdFromAnchors, tryPullUserIdFromHrefs, userLinkFromArticle } from "./helpers";

export namespace User {
  /**
   * Get the id of the author of the given message.
   *
   * @param article The `<article>` representing the user's comment/forum
   * post/staff note; should have an `<a>` element linking to the user's page
   * via ID.
   * @returns The id if found, `undefined` otherwise.
   *
   * NOTE: Assumes structure of `.author-info > .name-rank > .author-name >
   * a[href^="/users/"]`
   */
  export function pullAuthorIdFromHtml(article: HTMLElement) {
    return tryPullUserIdFromAnchors(userLinkFromArticle(article));
  }

  // Formerly '.profile-name > a:first-child[href^="/users/"]'
  // `div.user-card > div.user-card-info > div.user-card-name > a:first-child[href^="/users/"]`
  export const userProfileLinkSelector = '.user-card .user-card-name a[href^="/users/"]';
  export function pullUserAnchorFromHtml(article?: HTMLElement) {
    // Staff note on `/staff_notes` endpoint
    // article.querySelector<HTMLAnchorElement>('.content > *:first-child > a[href^="/users/"]')
    return (article ? userLinkFromArticle(article) : null) ?? document.querySelector<HTMLAnchorElement>(userProfileLinkSelector);
  }
  export function potentialUserHrefs(article?: HTMLElement) {
    return [
      (article ? userLinkFromArticle(article) : null)?.href,
      document.querySelector<HTMLAnchorElement>(userProfileLinkSelector)?.href,
      location.href,
    ];
  }
  export function pullUserIdFromAnywhere(article?: HTMLElement) {
    // Staff note on `/staff_notes` endpoint
    // article.querySelector<HTMLAnchorElement>('.content > *:first-child > a[href^="/users/"]')
    return tryPullUserIdFromHrefs((article ? userLinkFromArticle(article) : null)?.href, document.querySelector<HTMLAnchorElement>(userProfileLinkSelector)?.href, location.href);
  }
}