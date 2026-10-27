# Admin Panel Enhancements

Backlog of improvements for the admin panel ([web-app/src/admin](../web-app/src/admin)), from a
review of the admin pages, the datastore layer they use, and the API backends. Items are grouped
by theme. The [roadmap](#roadmap) at the end is the order to tackle them in.

Status legend: ⬜ todo · 🟡 in progress · ✅ done

---

## 1. Security (blockers before any public deployment)

- ✅ **Gate the admin panel behind Google sign-in.** Before: `/admin` had no login check
  ([index.tsx](../web-app/src/admin/index.tsx)), Logout did nothing, and
  [authConfig.ts](../web-app/src/admin/authConfig.ts) was unused.
  - ✅ Admin login page using Google Identity Services. The signed-in email is checked against
    `REACT_APP_ADMIN_EMAILS` (this check is for UX only; the server enforces it).
  - ✅ Logout clears the session, and a `401` from the API or an expired ID token signs you out.
- ✅ **Enforce auth on the API, not just the UI.** Before: the backends accepted any write with no
  credentials, so hiding the UI protected nothing.
  - ✅ All four backends verify the Google ID token (`Authorization: Bearer …`) and check it
    against `ZJOURNAL_ADMIN_EMAILS` for every write and for reading contacts. `POST /contacts`
    (the public contact form) stays open. Every backend uses the same list of open routes:
    [node](../server/node/auth.js), [php](../server/php/auth.php),
    [python](../server/python/app/auth.py), [java](../server/java/src/main/java/com/zjournal/auth).
  - ✅ The servers won't run open outside `ZJOURNAL_ENV=development`. `npm run server` sets it
    unless `--prod` is passed.
  - ✅ PHP: `php -S` and Apache (`.htaccess`) send every request through `index.php`, so `db.json`
    and `error_log` can no longer be downloaded directly.
  - ✅ Anonymous reads get a public view on all four backends. `GET /articles` and
    `/articles/<id>` return only published, non-flagged articles. `GET /journal` omits
    `currentArticle` (whatever article was open in the editor at the last template save, drafts
    included) and `adminDetails` (SHA-512 hashes of the old client-side login's id and passphrase,
    unused since `f2e58ca`). This also covers the home template's fetch-by-id.
  - ✅ The admin panel reloads the journal after sign-in, so a template save can't overwrite the
    full journal with the public copy. `currentArticle` is no longer sent with journal saves; it
    stays in the tab.
  - ✅ Java: the encryption filter sent every 404 as `200 OK` with the error in the body. It now
    keeps the real status.
  - ⬜ Delete `adminDetails` from the `db.json` files. It's dead data, and if that passphrase is
    used anywhere else, change it there.
  - ⬜ Retire or replace `server/php/backupdata.php`. Its sender, recipient and key are hard-coded,
    and it can now only be run from the CLI.
- ✅ **Sanitize untrusted HTML.**
  - ✅ [Contacts.tsx](../web-app/src/admin/pages/Contacts.tsx) used to render the visitor's comment
    through `parsex`. It now shows it as plain text with line breaks kept. The comment comes from
    a plain textarea, so it was never meant to be HTML.
  - ✅ `parsex` ([parserUtil.tsx](../ui-library/src/utils/parserUtil.tsx)) now runs DOMPurify
    first. It strips `<script>`, `<iframe>` (including `srcdoc`), `<object>`, `<embed>`,
    `javascript:` URLs and event handlers, keeps `target`, and adds `rel="noopener noreferrer"` to
    new-tab links. Stored content only uses `br`, `a`, `div`, `q`, `h3` and `h4`, so nothing
    existing is lost.
  - ✅ article-generator now HTML-escapes scraped titles, snippets and source URLs
    ([builder.py](../article-generator/article_generator/builder.py)), and dedupe unescapes them
    when it reads URLs back. Before, a scraped page's `og:description` went straight into a
    published article's HTML.
- ⬜ **Don't treat `ezjData` encryption as access control.** The key ships in the frontend bundle,
  so encryption only obscures payloads. Document this, and move the key out of source
  (`properties.js`, `server/node/properties.js`).

## 2. Bugs

- ✅ **About and Home templates showed stale text.** Both copied the journal into state on first
  render, so a journal that loaded later never reached the edit box. (About also set the textarea
  through its children instead of `value`.) Both now show the saved value until the admin edits.
- ✅ **Purge:**
  - A purged row stayed on screen. The reducer now removes it.
  - Rows are numbered from 1, have keys, and there's an empty state ("Nothing to purge").
  - New: the page only lists articles with `deleteFlag` set. The article list is shared between
    pages, so on first render it could briefly offer to purge the Categories page's live
    articles.
  - Titles still go through `parsex`. Titles are stored as HTML everywhere, and `parsex`
    sanitizes them now.
- ✅ **Editor lost unsaved edits without warning.** Leaving the editor (links, back/forward,
  opening another article) now asks first. Closing or reloading the tab gets the browser's
  "leave site?" prompt. This needed `createBrowserRouter` instead of `<BrowserRouter>` (for
  `useBlocker`), and a new optional `onChange` on ui-library's `ArticleEditor`.
  - New: after a first save the editor keeps the created article, so saving again updates it
    instead of creating a duplicate.
- ✅ **Category page:** dropdown entries are now keyed `<li>`s holding buttons, so picking one no
  longer adds `#` to the URL.
- ✅ **Q&A:**
  - Rows have stable keys, so an open answer stays open while you type.
  - The form uses controlled, labelled inputs and clears only after the question is added
    (before, a failed add lost the text).
  - The list now sits outside the `<form>`.
- ✅ **Contacts:** rows have keys. The accordion follows Bootstrap's "stay open" pattern (no
  mismatched `data-bs-parent`). Panels start with `aria-expanded="false"` and are labelled by
  their own headers.
- ✅ **Errors are hidden.** Fixed in two parts:
  - The actions never checked the HTTP status. A 404 or 500 response was decrypted and
    dispatched as success, with the error body treated as data. The new
    [responses.ts](../web-app/src/datastore/responses.ts) `readResponse` throws an `ApiError`
    (with the server's message) for any error status.
  - Failures are now reported. Every action publishes through
    [notifications.ts](../web-app/src/datastore/notifications.ts), and the admin panel shows them
    (see "Feedback" below). 401/403 stay quiet, because the sign-in screen already explains those.
- ✅ Removed leftover `console.log`s (templates, `api.ts`, `ArticleEditor`). The public Contact
  page was logging visitors' names, emails and phone numbers to the console.
  - ⬜ Left on purpose: `web/Home.tsx` (reports invalid template IDs) and the clipboard messages in
    `ArticlePreview.tsx`.

## 3. UX and missing features

- ✅ **Feedback:** [Toasts.tsx](../web-app/src/admin/Toasts.tsx) shows a toast after every
  admin save, create and delete ("Article saved", "Changes saved", "Question deleted", …) and
  after any failed load or save. Successes fade after 4 seconds; errors stay until dismissed.
  - ⬜ The Home template's "invalid article IDs" card is still its own fixed panel (bottom right).
  - ✅ The public Contact page shows an error when sending fails, and disables Submit while sending.
- 🟡 **Articles:**
  - ✅ A "New article" button on the Categories page opens a blank editor.
  - ✅ Sending an article to the purge list already existed: the editor's switch, now labelled
    "Marked for deletion". The earlier review missed it. Its label was wired to the Published
    switch, so clicking the text toggled the wrong one. Fixed.
  - ✅ The cards already show Published / Not Published / Deleted badges.
  - ⬜ A draft/published *filter* on the Categories page.
  - ⬜ A one-click "move to purge list" on the cards, without opening the editor.
- ✅ **Purge:**
  - Restore, which puts an article back without asking, since it's undoable.
  - Select-all and per-row checkboxes, with "Purge selected (N)" behind one confirmation. One
    summary toast per batch, and a partial failure removes the successes and reports the rest.
- ✅ **Public site hid flagged articles only on their own page.** The lists (category, author,
  month) asked only for `published=true`, so an article on the purge list stayed on the home page
  and in listings, and clicking it showed an empty page. Public queries now also send
  `deleteFlag=false` (checked against all four backends). The author query also built
  `/articles&…` with no `?` when no author was given.
  - ✅ The home page template's fetch-by-id now goes through the server's public view, so a
    flagged or unpublished article placed there no longer shows.
- ⬜ **Contacts:** delete or archive, mark as read, search, pagination, and a `mailto:` link.
- ⬜ **Q&A:** edit in place, reorder, and a published toggle (today `published: true` is
  hard-coded).
- ⬜ **Home template:** replace the pipe/newline textarea with a row-based article picker (choose
  by title, drag to reorder) that writes the same string.
- ⬜ **About template:** replace the arbitrary `length < 20` check with real validation.
- ⬜ **Navigation:**
  - The Editor tab shows a stale `currentArticle`. Show "New article" or the title being edited.
  - Add an analytics link to the header.
- 🟡 **Copy:** fix user-facing typos. Done for the confirmation messages in the pages touched
  above, and "beofre" on the Home template. "beofre", "detele", "retrived" and "Are you sure want to…"
  should read "before", "delete", "retrieved" and "Are you sure you want to…".

## 4. Code quality

- ⬜ Turn the five copy-pasted `<Link>`s in [Header.tsx](../web-app/src/admin/Header.tsx) into a
  routes array mapped through `NavLink`. Today `aria-current="page"` is set on every link. Do the
  same for the radio buttons in [Templates.tsx](../web-app/src/admin/pages/Templates.tsx).
- ⬜ Fix incomplete `useEffect` dependency arrays (`AdminContainer`, `index.tsx`), and enable the
  `react-hooks/exhaustive-deps` lint rule.
- ⬜ Remove unused imports, the commented-out code in `HomeTemplate` and the loose `any` types.
- ⬜ Move template generation and validation out of `HomeTemplate` into a tested hook or util.
- ⬜ Fix the misspelled `categryId` in `ArticleT`. This is a data migration across the
  `db.json` files, all four backends, article-generator and patrikaz.

## 5. Testing and CI

- ✅ **CI couldn't build.** The workflow built web-app, which imports ui-library's uncommitted
  `dist/`, without building ui-library first, and it only ran web-app's tests. Root
  `npm run build` now builds ui-library first. The workflow has a `frontend` job (build, web-app
  and ui-library tests on Node 18/20) and a `backends` job (`npm run test:servers` with Python,
  PHP and Java set up).
- ⬜ **Test a real sign-in.** Create the Google OAuth client and go through the admin flows in a
  browser: sign in, save, mark for deletion, purge/restore, template save, sign out. So far auth
  has only been tested with stubbed tokens, and none of the UI in a browser.
- ⬜ **Shared contract tests for the backends.** One HTTP test suite run against all four servers
  (auth rules, public view, 404s, the encryption envelope). Each backend reimplements the same
  rules, and the Java 404-as-200 bug was only found by a manual check.
- ⬜ **End-to-end tests** (e.g. Playwright) for the main admin flows, with a stubbed sign-in.

## 6. Later

- ⬜ **Session length:** renew the Google session silently instead of signing out after an
  hour.

---

## Roadmap

Done so far: server-side auth and the login page, sanitizing untrusted HTML, error and success
feedback, the §2 bugs, and the purge/restore loop with "New article".

1. **Make the October PR safe to merge** (small)
   - ✅ Fix CI (§5)
   - ⬜ Test a real sign-in (§5)
   - ⬜ Data cleanup: delete `adminDetails` and the old `currentArticle` from the `db.json`
     files, and retire `backupdata.php` (§1)
2. **Stop the backends drifting apart** (medium): shared contract tests, then end-to-end tests (§5)
3. **Admin features** (§3)
   - Categories: published/draft filter and one-click "move to purge list" (small)
   - Contacts: delete/archive, mark read, search, pagination, `mailto:` (medium)
   - Q&A: edit in place, reorder, published toggle (medium)
   - Home template visual picker (large)
   - Small fixes: stale Editor tab, analytics link, About validation
4. **Code health** (§4), with the `categryId` migration as its own planned piece of work
5. **Security, later:** move the encryption key out of source or drop the envelope (§1), and
   renew sessions silently (§6)
