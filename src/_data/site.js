/**
 * Site-wide config. `url` is the only deploy switch. Canonical tags,
 * Open Graph, JSON-LD, robots.txt, sitemap.xml, and the Eleventy path
 * prefix all follow it. Do not add a trailing slash.
 *
 * GitHub Pages project site:
 *   https://truekao1.github.io/rvlastminute
 *
 * Affiliate `url` values stay empty until a program issues a tracked
 * link. Templates must then fall back to `publicUrl` as a plain
 * (non-affiliate) link. Do not present an empty or public URL as a
 * tracked affiliate link. `featuredMarketplaces` is the list of
 * affiliate ids shown in the shared city and homepage callout once
 * those programs have a tracked URL, so new nightly city pages
 * inherit them automatically.
 *
 * Traditional rental operators (Cruise America, El Monte RV, Road Bear,
 * and local fleets) are linked as plain depot pages. No official
 * publisher program with published terms was verified for those
 * operators in the November 18, 2026 research pass.
 */
const url = normalizeSiteUrl("https://truekao1.github.io/rvlastminute");

function normalizeSiteUrl(value) {
  const parsed = new URL(value);
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  if (!parsed.pathname || parsed.pathname === "/") return parsed.origin;
  return parsed.origin + parsed.pathname;
}

function pathPrefixFromUrl(value) {
  const { pathname } = new URL(value);
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function isTrackedAffiliate(program) {
  return Boolean(program && String(program.url || "").trim());
}

const featuredMarketplaces = ["rvshare"];

const affiliates = {
  rvshare: {
    id: "rvshare",
    name: "RVshare",
    url: "https://www.dpbolvw.net/click-101933290-13773430",
    publicUrl: "https://rvshare.com/",
    programUrl: "https://rvshare.com/affiliates",
    impressionPixel: "https://www.ftjcfx.com/image-101933290-13773430",
    featuredTitle: "Book a last-minute RV on RVshare",
    featuredBody:
      "RVshare is a peer-to-peer RV rental marketplace. Owners list motorhomes, travel trailers, and other rigs that you can search by city and travel dates. That live inventory is the place to check what is actually bookable this weekend; this directory does not cache current availability or rates.",
  },
  outdoorsy: {
    id: "outdoorsy",
    name: "Outdoorsy",
    url: "",
    publicUrl: "https://www.outdoorsy.com/",
    programUrl: "https://www.outdoorsy.com/",
  },
};

const featuredMarketplacePrograms = featuredMarketplaces
  .map((id) => affiliates[id])
  .filter(isTrackedAffiliate);
const featuredMarketplaceIds = featuredMarketplacePrograms.map((program) => program.id);

export default {
  name: "RVLastMinute",
  tagline: "Find a last-minute RV rental from verified depots, plus live peer-to-peer inventory.",
  description:
    "A directory of RV rental dealers and depots that publishes pickup hours and one-way flags only when the operator’s own page says so. Peer-to-peer platforms such as RVshare and Outdoorsy show live inventory for a specific weekend.",
  url,
  pathPrefix: pathPrefixFromUrl(url),
  locale: "en_US",
  language: "en",
  emailListings: "azb31pt9@mail.grokbot.com",
  emailContact: "azb31pt9@mail.grokbot.com",
  emailsArePlaceholders: false,
  disclosure:
    "RVLastMinute may earn a commission if you use an approved affiliate link, at no extra cost to you. Until a program approves a tracked URL, buttons go to that company’s public website and are not affiliate links. Individual RV dealer and depot pages are ordinary public links, not affiliate offers.",
  disclosureShort:
    "Some links are affiliate links; we may earn a commission at no cost to you.",
  featuredMarketplaces,
  featuredMarketplacePrograms,
  featuredMarketplaceIds,
  affiliates,
};
