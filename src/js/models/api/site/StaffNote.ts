import ErrorHandler from "../../../utilities/ErrorHandler";
import Util from "../../../utilities/Util";

/** 
 * Allows representing the initial, raw JSON, & the fully reconstructed object
 * with the same type. `true` for revived, `false` for raw, & omitting this
 * type for the union.
 */
type Revivable<Revived, Raw, T extends boolean = boolean> = T extends true ? Revived : T extends false ? Raw : Revived | Raw;

export type StaffNote<Revived extends boolean = true> = {
  id:         number;
  created_at: Revivable<Date, string, Revived>;
  updated_at: Revivable<Date, string, Revived>;
  user_id:    number;
  creator_id: number;
  body:       string;
  is_deleted: boolean;
  updater_id: number;
}
type More = {
  creator_name: string;
  updater_name: string;
  user_name:    string;
}
export type StaffNoteExtended<Revived extends boolean = true> = Pick<StaffNote<Revived> & More, keyof (StaffNote<Revived> & More)>
function tryIdShell(id: number) { return id >= 0 ? id : undefined; }
export namespace StaffNote {
  export const jsonKeys = Object.freeze([
    "id",
    "created_at",
    "updated_at",
    "user_id",
    "creator_id",
    "body",
    "is_deleted",
    "updater_id",
  ]);
  export const extendedJsonKeys = Object.freeze([
    ...jsonKeys,
    "creator_name",
    "updater_name",
    "user_name",
  ]);
  /**
   * 
   * @param note The `<article>` representing the staff note.
   * @returns As much of the staff note as possible.
   */
  export function extractJsonFromHtml(note: HTMLElement, currentData?: Partial<StaffNote<true>>): Partial<StaffNote<true>> {
    return {
      id: tryPullIdFromStaffNote(note) ?? currentData?.["id"],
      body: retrieveStaffNoteContents(note) ?? currentData?.["body"],
      is_deleted: note.dataset.isDeleted === "true" ?
        true :
        note.dataset.isDeleted === "false" ?
          false :
          currentData?.["is_deleted"],
      // is_deleted: JSON.parse(note.dataset.isDeleted ?? "null") ?? currentData?.["is_deleted"],
      created_at: pullCreatedDateFromHtml(note) ?? currentData?.["created_at"],
      updated_at: pullUpdatedDateFromHtml(note) ?? currentData?.["updated_at"],
      creator_id: tryPullCreatorIdFromHtml(note) ?? currentData?.["creator_id"],
      user_id: tryPullUserIdFromHtml(note) ?? currentData?.["user_id"],
      updater_id: tryPullUpdaterIdFromHtml(note) ?? currentData?.["updater_id"],
    };
  }
  /**
   * 
   * @param note The `<article>` representing the staff note.
   * @returns As much of the staff note as possible.
   */
  export function extractAllDataFromHtml(note: HTMLElement, currentData?: Partial<StaffNoteExtended<true>>): Partial<StaffNoteExtended<true>> {
    return Object.assign(extractJsonFromHtml(note, currentData), {
      creator_name: pullCreatorNameFromHtml(note) ?? currentData?.["creator_name"],
      user_name: pullUserNameFromHtml(note) ?? currentData?.["user_name"],
      updater_name: pullUpdaterNameFromHtml(note) ?? currentData?.["updater_name"],
    });
  }

  /**
   * 
   * @param note The `<article>` representing the staff note; should have an `id` attribute containing the DB id.
   * @returns The id if found, -1 otherwise.
   */
  export function pullIdFromStaffNote(note: HTMLElement) {
    return parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1");
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; should have an `id` attribute containing the DB id.
   * @returns The id if found, undefined otherwise.
   */
  export function tryPullIdFromStaffNote(note: HTMLElement) {
    return tryIdShell(pullIdFromStaffNote(note));
  }
  export function pullCreatorNameFromHtml(note: HTMLElement) {
    return note.querySelector<HTMLDivElement>(".author-name")?.innerText;
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; if on the staff note endpoint, should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found (either from the HTML or the current URL), -1 otherwise.
   */
  export function pullUserIdFromHtml(note: HTMLElement) {
    return parseInt(new URL(note.querySelector<HTMLAnchorElement>('.content > *:first-child > a[href^="/users/"]')?.href ?? location.href).pathname.match(/\/users\/([0-9]+)/)?.[1] ?? "-1");
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; if on the staff note endpoint, should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found (either from the HTML or the current URL), `undefined` otherwise.
   */
  export function tryPullUserIdFromHtml(note: HTMLElement) {
    return tryIdShell(pullUserIdFromHtml(note));
  }
  export function pullUserNameFromHtml(note: HTMLElement) {
    return (note.querySelector<HTMLAnchorElement>('.content > *:first-child > a[href^="/users/"]') ?? document.querySelector<HTMLAnchorElement>('.profile-name > a:first-child[href^="/users/"]'))?.innerText;
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found, -1 otherwise.
   */
  export function pullCreatorIdFromHtml(note: HTMLElement) {
    return parseInt(new URL(note.querySelector<HTMLAnchorElement>('.author-name > a[href^="/users/"]')?.href ?? location.href).pathname.match(/\/users\/([0-9]+)/)?.[1] ?? "-1");
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found, `undefined` otherwise.
   */
  export function tryPullCreatorIdFromHtml(note: HTMLElement) {
    return tryIdShell(pullCreatorIdFromHtml(note));
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; if the updater isn't the creator, should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found, -1 otherwise.
   */
  export function pullUpdaterIdFromHtml(note: HTMLElement) {
    const href = note.querySelector<HTMLAnchorElement>('.content .info a[href^="/users/"]')?.href;
    if (!href) return pullCreatorIdFromHtml(note);
    return parseInt(new URL(href).pathname.match(/\/users\/([0-9]+)/)?.[1] ?? "-1");
  }
  /**
   * 
   * @param note The `<article>` representing the staff note; if the updater isn't the creator, should have an `<a>` element linking to the user's page via ID.
   * @returns The id if found, `undefined` otherwise.
   */
  export function tryPullUpdaterIdFromHtml(note: HTMLElement) {
    return tryIdShell(pullUpdaterIdFromHtml(note));
  }
  export function pullUpdaterNameFromHtml(note: HTMLElement) {
    return note.querySelector<HTMLAnchorElement>('.content .info a[href^="/users/"]')?.innerText ?? pullCreatorNameFromHtml(note);
  }
  export function pullCreatedDateFromHtmlRaw(note: HTMLElement) {
    return note.querySelector<HTMLTimeElement>('.post-time time')?.dateTime;
  }
  export function pullCreatedDateFromHtml(note: HTMLElement) {
    const d = pullCreatedDateFromHtmlRaw(note);
    if (!d) return;
    return new Date(d);
  }
  export function pullUpdatedDateFromHtmlRaw(note: HTMLElement) {
    const e = note.querySelector<HTMLTimeElement>('.content .info time');
    if (!e) return pullCreatedDateFromHtmlRaw(note);
    return e.dateTime;
  }
  export function pullUpdatedDateFromHtml(note: HTMLElement) {
    const d = pullUpdatedDateFromHtmlRaw(note);
    if (!d) return;
    return new Date(d);
  }

  export function retrieveStaffNoteContentsFromServer(id: number, reportErrors = true) {
    if ((!id && id !== 0) || id < 0) throw new Error("Invalid ID for staff note.");
    // (await (await fetch(`/staff_notes/${id}.json`, { body: encodeURIComponent(REMT.API.getAuthToken()) })).json())["body"];
    return fetch(`/staff_notes/${id}.json`, { headers: Util.Network.simpleAuthHeaders }).then(
      response => response.json().then(
        e => {
          if (e["body"]) return e["body"] as string;
          if (reportErrors)
            ErrorHandler.write(`Failed to retrieve staff note #${id} from server (empty body).`)
          else throw new Error(`Failed to retrieve staff note #${id} from server (empty body).`);
        },
        err => {
          if (reportErrors)
            ErrorHandler.write(`Failed to retrieve staff note #${id} from server (error parsing response as json).`, err);
          else throw err;
        },
      ),
    );
  }
  const editBoxDTextSelector = "textarea[name=\"staff_note\\[body\\]\"]";
  export function retrieveStaffNoteContentsFromHtml(note: HTMLElement) { return note.querySelector<HTMLTextAreaElement>(editBoxDTextSelector)?.value; }
  export async function retrieveStaffNoteContentsAsync(note: HTMLElement, id: number = pullIdFromStaffNote(note), reportErrors = false) {
    return retrieveStaffNoteContents(note, id) ?? await retrieveStaffNoteContentsFromServer(id, reportErrors);
  }

  export function retrieveStaffNoteContents(note: HTMLElement, id: number, onBackgroundRetrieval: (body: string | void | undefined) => void, onBackgroundRetrievalError: (err: unknown) => void, reportErrors: true): string | undefined;
  export function retrieveStaffNoteContents(note: HTMLElement, id?: number, onBackgroundRetrieval?: (body: string) => void, onBackgroundRetrievalError?: (err: unknown) => void, reportErrors?: false): string | undefined;
  export function retrieveStaffNoteContents(note: HTMLElement, id: number = pullIdFromStaffNote(note), onBackgroundRetrieval?: (body: any) => void, onBackgroundRetrievalError?: (err: unknown) => void, reportErrors = true) {
    const fromEditBox = retrieveStaffNoteContentsFromHtml(note);
    if (fromEditBox) return fromEditBox;
    if (onBackgroundRetrieval) retrieveStaffNoteContentsFromServer(id, reportErrors).then(onBackgroundRetrieval, onBackgroundRetrievalError);
    return;
  }
}