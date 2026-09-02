# User guide

This is a guide for people *using* a running zJournal instance — reading it or writing/managing
content in it. For running the app locally or deploying it, see the root
[README.md](../README.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

zJournal is one app with two zones: a public **reading site** anyone can browse, and an **admin
panel** for the person or team writing and managing content. Both are part of the same `web-app` —
there's no separate login/signup for readers, and (see the callout below) currently no login at
all for the admin panel.

> ⚠️ **Heads up if you're collaborating with others:** `/admin` currently has no login gate —
> anyone who knows or reaches that URL can create, edit, publish, and permanently delete content.
> If you're running a shared/public instance, make sure `/admin` is restricted some other way (a
> password on the server, a private network, etc. — see
> [DEPLOYMENT.md](DEPLOYMENT.md#securing-the-admin-panel)) before treating it as safe for
> multiple people or a public deployment.

## Reading the site

Everything under `/web/*`:

- **Home** (`/web/home`) — a hero article up top, then a feed of article cards.
- **Categories** — open the header's "Categories" link to slide out a panel and filter the feed
  down to one category.
- **More** — the header's "More" link opens a panel listing recent/all posts, for browsing beyond
  what fits on the home feed.
- **Reading an article** — click any article card (from Home, Categories, or More) to open the
  full piece. Each article has a stable URL you can bookmark or share.
- **About** (`/web/aboutus`) — a page whoever manages the instance writes and updates from the
  admin panel's Templates tab; content varies by instance.
- **Contact** (`/web/contactus`) — a form to send a message to whoever runs the instance. Submitting
  it doesn't send you anything back — it just records the message for the admin to read under the
  admin panel's Contacts tab.
- **Q&A** (`/web/iqa`) — a list of published question/answer entries, if the instance uses that
  section.

Nothing on the reading site requires an account — there's no reader login, commenting, or
subscription feature today.

## Writing and managing content (admin)

Go to `/admin` (it redirects to `/admin/categories`). The nav bar has five sections.

### Categories — your article list

The landing page for admin. Every article, with:

- A **category dropdown** to narrow the list to one category (categories are fixed per instance —
  see [Customizing your instance](#customizing-your-instance-categories--content-block-types)
  below if you need a new one).
- **Search** to filter by title.
- **Sort** by newest, oldest, or title.

Click an article's edit icon to open it in the Editor.

### Editor — writing an article

1. Set the **title**, and pick a **category** from the dropdown.
2. Use the element dropdown to add content blocks, in the order they should appear:
   - Headings: `h2`, `h3`, `h4`, `h5`
   - `Paragraph` — plain text; inline HTML is allowed (e.g., write a real `<a href="...">` link)
   - `Image` — paste an image URL (there's no file upload — the image needs to already be hosted
     somewhere)
   - `List`
   - `Table`
3. Click any block on the canvas to open its edit panel and change its content, reorder, or delete
   it.
4. Toggle **Published** — off keeps it as a draft invisible to readers; on makes it appear on the
   public site immediately once saved.
5. **Preview** shows you the rendered article before committing. **Save** persists it — the first
   save on a new article creates it; saving again updates the same one. **Reset** clears the whole
   draft back to blank (use it to discard an in-progress edit, not to "unpublish" — that's the
   Published toggle).

There's no autosave — an edit isn't persisted until you click Save.

### Templates — the site's shared pages

Three page templates share one editor, switched via a radio toggle:

- **Home** — the layout/content of the public Home page (which articles are featured, etc.)
- **About** — the content shown at `/web/aboutus`
- **QnA** — the question/answer entries shown at `/web/iqa`

On the Home template, the **Auto generate** button picks featured articles for you instead of you
choosing them by hand: it looks at your analytics (which articles have actually been read the
most) and lays out the 14 most-read as one large featured article at the top, then three rows
underneath it. It's a starting point, not a final answer — it still lands in the same text box
your manual edits do, so click **Preview** to check it, tweak anything you'd rather feature
differently, and **Save** when you're happy with it. If your site is brand new and nobody has read
any articles yet, there's no view data to rank by and the button will tell you so instead of
generating anything.

### Contacts — read what visitors sent

A read-only list of everything submitted through the public Contact Us form: name, date, email,
phone, and comment.

### Purge — permanently deleting articles

Deleting an article from the Editor doesn't remove it right away — it's soft-deleted (flagged, not
erased) so it disappears from the public site and the Categories list but is still recoverable.
**Purge** is where those soft-deleted articles land. From there you can permanently remove each
one — you'll get a confirmation prompt first, since this step can't be undone.

## Customizing your instance: categories & content block types

The list of categories (shown in the Categories dropdown and the Editor's category picker) and the
list of content block types offered in the Editor (`h2`, `Paragraph`, `Image`, etc.) both come from
the instance's underlying data (`journal.categories` and `journal.components`) — there's currently
no admin-panel screen to add or remove either one. Changing them means editing the data file
(`db.json`, or whichever store your backend flush writes to) directly, or asking whoever manages
the instance's data to do so. This is a good thing to flag if you find yourself wanting a category
that isn't in the dropdown — it's a data change, not something hidden in a settings screen you
haven't found yet.
