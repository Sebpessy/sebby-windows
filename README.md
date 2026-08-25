# Sebby Windows — sebbywindows.com

Working copy. **Canonical source is `~/sebby-windows-site`** (same pattern as
sebby.homes → `~/sebby-homes-site`). Edit there, commit, push, then rsync here.

Static single-page site, no build step. Dark palette matching sebby.homes.

## Where it lives

| Piece      | Home                                                        |
| ---------- | ----------------------------------------------------------- |
| Repo       | github.com/Sebpessy/sebby-windows (public)                   |
| Site       | GitHub Pages, `main` branch root, `CNAME` → sebbywindows.com |
| Quote API  | Railway project `sebby-windows-api`, service `api`           |
| API URL    | https://api-production-ae9e.up.railway.app (api.sebbywindows.com bound, waiting on DNS) |
| Leads      | Supabase `leads` table, `source = 'sebbywindows.com'` — same table six9builder reads |
| Email      | Resend, best-effort — the lead saves whether or not email works |

Deploy the site: `git push`. Deploy the API: `cd api && railway up`.

## DNS still to add at GoDaddy

sebbywindows.com is registered at GoDaddy on GoDaddy nameservers
(ns13/ns14.domaincontrol.com), currently pointing at GoDaddy parking. Add:

| Type  | Name | Value                   |
| ----- | ---- | ----------------------- |
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | sebpessy.github.io      |
| CNAME | api  | mt1mpjs2.up.railway.app |

Delete the GoDaddy parking A record first. HTTPS on GitHub Pages turns itself on
about 15 minutes after the A records resolve.

## The offer — read before touching financing copy

**No lender is signed.** The site therefore says *financing available on approved
credit through a third-party lender*, and names no rate and no term anywhere. The
earlier draft advertised 0% APR for 36 months; that claim was removed on
2026-08-25 because advertising a rate with no lender behind it is a false-
advertising problem, not a copy problem.

When a lender is signed:
1. Confirm whether the product is a true promotional rate or deferred interest.
2. Paste the lender's required disclosure into the `.priceNote` block at the end
   of the `#financing` section — it is sized for it.
3. Then, and only then, put the rate back. Grep for `financing` across
   `index.html`, `llms.txt`, `journal/window-replacement-financing-dallas-fort-worth.html`,
   and `api/server.js` (the auto-reply email).

The journal article at `journal/window-replacement-financing-dallas-fort-worth.html`
is now buyer education — five questions to ask a lender, including true rate vs
deferred interest. It stands on its own with no lender signed.

## Still open

1. **Add the DNS records above.** Nothing is live until this happens.
2. **Resend:** create an API key, verify sebbywindows.com as a sending domain,
   then `cd api && railway variables --service api --set "RESEND_API_KEY=..."`.
   Until then leads land in Supabase silently and no email goes out.
3. **`seb@sebbywindows.com`** mailbox or alias must exist — it is on the site and
   is the form's mailto fallback.
4. Confirm the warranty language matches what you stand behind.
5. Decide which suppliers to name publicly — the site names none yet.

## After it goes live

Work through `GEO-PLAYBOOK.md`, starting with the Google Business Profile.
