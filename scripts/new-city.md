# Nightly city research checklist

The goal of a nightly run is to ship **one useful city page**, not a long list of unverified names. Adding a city means adding one file under `data/cities/` and rebuilding.

## 1. Pick the city

Choose a place people actually search when they need an RV this weekend, a one-way rental, delivery, or a pet-friendly rig. Prefer metros with official dealer or depot pages and recurring last-minute demand (events, weekend mountain or beach trips, cancelled private listings).

Filename: `data/cities/<st>-<city>.json`  
Examples: `ca-los-angeles.json`, `co-denver.json`, `fl-orlando.json`  
Use the two-letter state, lowercase, then a hyphen, then the city slug.

Copy `scripts/city.template.json` and fill it in.

## 2. Find candidates

Search for public pages, not hearsay:

- Official location pages for Cruise America, El Monte RV, Road Bear RV, and independent fleets
- Operator locators, then the individual depot page
- RVshare or Outdoorsy only as live-inventory links in the affiliate box, unless the marketplace publishes a verifiable local street address you are treating as a listing

Skip a depot if you cannot find its own page with an address. Do not cache live inventory; deep-link the operator’s page or a live marketplace search instead.

## 3. Verify every fact on a public page

For each listing, record only what the source says:

- Name, area, street address, phone, website, depot or reservation URL
- `hours` for each day of the week (pickup or office hours as published)
- Flags: `oneWay`, `weekendHours`, `petFriendly`, `delivery`
- Fee notes, only if published, labeled “as listed on &lt;date&gt;”
- `sources[]` with a label and the exact URL
- `lastChecked` as today’s date (`YYYY-MM-DD`)

**Hours.** Copy the published schedule. If the source publishes seasonal tables, put the current season in the day fields and record both seasons in `hours.notes`. Use `Not published` for a missing day — do not invent “Closed.” Use `Closed` only when the operator publishes it.

**One-way** is true only when that operator’s public page says one-way rentals are offered, including this city or a network that includes this depot. A nav label is not enough if the page never says the program applies here. Record fees only with “as listed on &lt;date&gt;.”

**Weekend hours** is true when Saturday or Sunday is published as open, including “by appointment,” and is not “Closed” or “Not published.”

**Pet-friendly** is true only when that operator’s page says pets are allowed. Record cleaning fees, if published, as listed on a date.

**Delivery** is true only when that operator’s page says delivery is offered.

If two sources disagree, prefer the official depot page and say so in the hours notes. If you cannot verify a detail, omit it. If you cannot verify the depot at all, do not list it.

Do not call depots just to fill a spreadsheet unless a later playbook says otherwise. This checklist is written so a pass can be done from public pages.

## 4. Aim for quality, not a quota

Eight to twenty solid listings is enough for a first city page. Fewer is fine if that is all that can be verified. Zero invented rows is the hard rule.

Write a short, honest `intro` for the city. Mention any focus (a suburb, a side of town, a nearby city you included) instead of implying citywide coverage you did not research. Always explain that peer-to-peer platforms show live inventory.

## 5. Build and check

```bash
npm run check
```

That command validates the JSON, builds the site, and fails if a required field is missing or an internal link is broken. If it passes, commit the new city file (and the built site stays out of git).

## 6. After publish

Update `lastUpdated` on the city file when listings change. On later nights, recrawl the oldest `lastChecked` dates before adding a second city, so pages do not rot. Recheck seasonal hours, Sunday closures, and one-way statements especially; those are the details that drift. Never snapshot live inventory or current rental rates into the JSON as if they were current. If you quote a price, label it “as listed on &lt;date&gt;.”
