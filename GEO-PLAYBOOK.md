# Sebby Windows — Getting Found and Getting Called

Two goals, and they are not the same thing:

1. **Getting found** — showing up in Google, Google Maps, and AI answers (ChatGPT,
   Perplexity, Gemini, Claude) when someone in DFW searches for window replacement.
2. **Getting called** — turning that visibility into a ringing phone.

The on-site work for both is already built (below). The remaining work is off-site, and
**Step 1 is worth more than everything else on this page combined.**

---

## What's already done in this repo

- ✅ **Sticky mobile call bar** — always-visible Call / Text / Quote on phones. Most window
  traffic is mobile, and no local competitor has this.
- ✅ **`tel:` and `sms:` links everywhere** — nav, hero, process, contact, footer, call bar,
  and inside the journal articles.
- ✅ **0% for 36 months, front and centre** — hero, dedicated section, FAQ, process step,
  and a financing-interest field on the quote form so leads arrive pre-qualified.
- ✅ **Structured data (JSON-LD)** in `index.html` — a linked graph describing the business
  (`HomeAndConstructionBusiness`), owner, service, offers with a price range, service areas,
  and a 12-question `FAQPage`.
- ✅ **`robots.txt`** — explicitly welcomes AI crawlers (GPTBot, PerplexityBot, ClaudeBot,
  OAI-SearchBot, Google-Extended, Applebot, CCBot, and more).
- ✅ **`llms.txt`** — a machine-readable business summary including the price bands.
- ✅ **`sitemap.xml`**, canonical, Open Graph, Twitter cards, geo meta.
- ✅ **Visible FAQ** — answer-first Q&A, the format AI quotes most.
- ✅ **Journal** — four high-intent articles (financing/budget, Texas heat specs, hail
  insurance, HOA/permits) targeting the searches that precede a call.
- ✅ **Quote form with a `mailto:` fallback** — a lead is never silently dropped.

---

## Step 1 — Google Business Profile (do this first, it outranks everything else)

For local service searches, Google's local pack sits above the organic results, and AI
answers about "window replacement near me" lean heavily on this data.

1. Go to <https://business.google.com> and create a profile for **Sebby Windows**.
2. Choose **service-area business** (you go to them), and set the area to Dallas–Fort Worth
   plus the specific cities on the homepage.
3. **Primary category: Window installation service.** Secondary: Contractor, Window supplier,
   Door supplier. The primary category is the single highest-leverage field on the profile.
4. Exact **NAP**, matching the site character for character:
   `Sebby Windows` · `469-996-3789` · `seb@sebbywindows.com` · `https://sebbywindows.com`
5. Turn on **call history** and **messaging** so calls from the profile are tracked.
6. Add 10+ photos of real installs, plus the logo. Photos drive profile engagement, which
   drives ranking.
7. **Reviews are the ranking factor in this vertical.** Ask every customer, the day the job
   is walked, while they are happy. Ten reviews puts you ahead of most independents; thirty
   makes you competitive with the franchises.
8. Post to the profile monthly. Google Posts are cheap and most competitors ignore them.

> **The NAP note:** Sebby Windows and Sebby Homes are the same legal entity (SP GENCO LLC)
> sharing a phone number. That is fine — but keep them as two clearly distinct profiles with
> different names, categories, and websites. Do not let them merge.

## Step 2 — the review-driven directories

In this vertical these carry real weight, both for search and for the homeowner who is
checking you out before dialing:

- **Yelp** — heavily used for contractor vetting in DFW, and cited by Apple/Siri.
- **BBB** — accreditation is a trust signal every competitor advertises.
- **Nextdoor** — neighborhood recommendations convert extremely well for window work.
- **Houzz Pro**, **Angi**, **Thumbtack**, **Porch** — same NAP, link back to the site.
- **Bing Places** (<https://www.bingplaces.com>) — powers Copilot and Bing answers.
- **Apple Business Connect** (<https://businessconnect.apple.com>) — powers Apple Maps and Siri.

## Step 3 — wire the profiles back into the site

Once the profiles exist (5 minutes, do it once):

1. **`index.html`** — find the JSON-LD block near the top. Add a `sameAs` array to the
   `#business` entity, right after `makesOffer`:
   ```json
   "sameAs": [
     "https://www.google.com/maps/place/...your-GBP...",
     "https://www.yelp.com/biz/sebby-windows-dallas",
     "https://www.bbb.org/us/tx/dallas/profile/...",
     "https://www.instagram.com/sebbywindows"
   ]
   ```
2. Add an `aggregateRating` to `#business` **only once real reviews exist**. Never invent one.
3. **`llms.txt`** — add the same links under a new "## Profiles" section.
4. Commit and push.

## Step 4 — the things that make the phone actually ring

Visibility without conversion is a hobby. In priority order:

1. **Answer the phone.** In home services, the contractor who picks up wins a large share of
   the calls, and most homeowners call two or three companies and stop at the first live human.
2. **Call back within an hour.** Form leads go cold fast.
3. **Ask for the review at the walkthrough**, not by email a week later.
4. **Lead with the 0%** on the phone. It is the objection-remover, and it converts the
   "I need to think about it" call into a pre-approval you can schedule around.
5. **Before/after photos.** Once real install photos exist, add a gallery section to
   `index.html` — the `gc-before-after` skill already builds this format.

## Step 4b — one compliance note on advertising the 0%

Consumer-credit advertising is regulated (TILA / Regulation Z). Once you state a rate and a
term, the ad generally has to carry the lender's required disclosure language, and claims
like "0% APR" have to be accurate for the product actually offered.

Two things to get right before this goes live:

1. **Confirm the product.** True 0% APR with equal payments over 36 months is what the site
   says. If the lender's product is actually *deferred interest* ("no interest if paid in
   full in 36 months," with back interest triggered by a missed payoff), the site copy is
   wrong and must be rewritten — the financing article explicitly promises it is not
   deferred interest.
2. **Use the lender's disclosure.** Whichever partner you sign with (GreenSky, Service
   Finance, Foundation Finance, and similar all have their own) will supply required
   wording and often a required logo. Drop it into the `.priceNote` block at the bottom of
   the `#financing` section, which is written to hold it.

## Step 5 — keep it alive

1. **Publish a journal post every few weeks, never in a batch.** High-intent titles earn
   citations. Good next ones: "Signs your windows need replacing", "Sliding patio door
   replacement cost in DFW", and the per-city posts below.
2. **Per-city posts: one at a time, on a schedule, with real local detail.** Google's
   scaled-content-abuse enforcement targets exactly the pattern of many near-identical
   location pages appearing at once. A city post is fine; a stack of them is not. Rules:
   - **Cadence:** at most one city post per month, and never two in the same week. The site
     launched with four articles; hold that baseline rather than jumping it.
   - **Order:** write the cities where jobs have actually been done first, so the post can
     name real streets, subdivisions, and housing stock. Suggested order: Plano, Frisco,
     Southlake, then only the cities on the `#areas` list that have produced a lead.
   - **Content bar:** every city post must contain things that are true only of that city:
     its permit process and typical turnaround, the HOA norms of its big subdivisions, the
     era and window type of its housing stock (1980s aluminum sliders in older Plano versus
     2010s builder-grade vinyl in Frisco), and at least one detail from a job done there.
     If a paragraph would still be true with the city name swapped, cut it.
   - **Overlap check:** before publishing, compare the draft against every existing city
     post. Shared text should be limited to the nav, footer, and call-to-action band. If
     two city posts read alike, merge them into one regional post instead.
   - **Wire-up:** each post gets its own `sitemap.xml` entry with the real publish date, a
     card on `journal/index.html`, and a line in `llms.txt`. Do not backdate.
   - **Stop rule:** no more than six city posts total. Past that, the site starts to look
     like a location-page farm no matter how good each page is.
3. **Bump `dateModified`** in the JSON-LD when you update a page. Freshness triggers re-crawls.
   **Re-check the financing copy every time the lender situation changes.** No lender is
   signed, so no rate or term appears anywhere; see the README before putting one back.
   Grep for `financing` across `index.html`, `llms.txt`, the financing journal article,
   and `api/server.js` before publishing.
4. **Recheck the tax-credit language every January.** The 25C credit expired after
   December 31, 2025; if Congress revives something, the FAQ and the cost article both need
   updating. Grep for `25C` before publishing anything.

## Step 6 — measure it

- **Google Search Console** — verify `sebbywindows.com`, submit `sitemap.xml`.
- **Bing Webmaster Tools** — submit the sitemap.
- **Rich Results Test** (<https://search.google.com/test/rich-results>) — paste the homepage
  URL, confirm the FAQ and LocalBusiness data validate.
- **GBP Insights** — watch calls, direction requests, and website clicks. This is the number
  that matters.
- **Spot-check AI directly** every few weeks: ask ChatGPT or Perplexity *"window
  replacement financing Dallas"*, *"0% financing windows DFW"*, and *"window replacement
  company Dallas"* and see whether you appear. The financing offer and the HOA/permit
  article are the hooks most likely to earn a citation, since few competitors write about
  either in any detail.
