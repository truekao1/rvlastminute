import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import site from "./src/_data/site.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function originAndPrefix(base) {
  const root = String(base || "").replace(/\/$/, "");
  try {
    const { origin, pathname } = new URL(root);
    const prefix = !pathname || pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return { origin, prefix, root };
  } catch {
    return { origin: root, prefix: "", root };
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("data/cities/");
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  });

  eleventyConfig.addFilter("displayDate", (value) => {
    if (!value) return "";
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("hoursSummary", (hours) => {
    if (!hours) return "Confirm with the store";
    if (hours.summary) return hours.summary;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = days.map((day) => (hours[day] || "").trim());
    const groups = [];
    let i = 0;
    while (i < 7) {
      let j = i;
      while (j + 1 < 7 && values[j + 1] === values[i] && values[i]) j += 1;
      if (values[i]) {
        const label = i === j ? labels[i] : `${labels[i]}–${labels[j]}`;
        groups.push(`${label} ${values[i]}`);
      }
      i = j + 1;
    }
    return groups.join("; ") || "Confirm with the store";
  });

  eleventyConfig.addFilter("telHref", (phone) => {
    if (!phone) return "";
    const digits = String(phone).replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
  });

  eleventyConfig.addFilter("slugifyId", (name) =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("jsonLd", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("absoluteUrl", (pathname, base) => {
    const { origin, prefix, root } = originAndPrefix(base);
    if (!pathname) return `${root}/`;
    if (/^https?:\/\//.test(pathname)) return pathname;
    const pathName = pathname.startsWith("/") ? pathname : `/${pathname}`;
    if (prefix && (pathName === prefix || pathName.startsWith(`${prefix}/`))) {
      return `${origin}${pathName}`;
    }
    return `${root}${pathName}`;
  });

  eleventyConfig.addFilter("cityPath", (city) => {
    const state = String(city.state || "").toLowerCase();
    const slug =
      city.citySlug ||
      String(city.city || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    return `/${state}/${slug}/`;
  });

  eleventyConfig.addFilter("joinList", (items) => {
    if (!Array.isArray(items) || !items.length) return "";
    return items.join(", ");
  });

  eleventyConfig.addFilter("affiliateHref", (program) => {
    if (!program) return "";
    const tracked = String(program.url || "").trim();
    if (tracked) return tracked;
    return program.publicUrl || "";
  });

  eleventyConfig.addFilter("affiliateIsTracked", (program) =>
    Boolean(program && String(program.url || "").trim())
  );

  const dayMap = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  function parseClockRange(value) {
    if (!value) return null;
    const text = String(value);
    if (/^not published$/i.test(text.trim())) return null;
    if (/^closed$/i.test(text.trim())) return null;
    const re =
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight|noon)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight)/i;
    const m = text.match(re);
    if (!m) return null;
    const to24 = (s) => {
      const t = s.trim().toLowerCase();
      if (t === "midnight") return "00:00";
      if (t === "noon") return "12:00";
      const mm = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
      if (!mm) return null;
      let h = Number(mm[1]);
      const min = mm[2];
      const ap = mm[3];
      if (ap === "pm" && h !== 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    };
    let opens = to24(m[1]);
    let closes = to24(m[2]);
    if (!opens || !closes) return null;
    if (closes === "00:00" && /midnight/i.test(m[2])) closes = "23:59";
    return { opens, closes };
  }

  function listingToLocalBusiness(listing) {
    const url = listing.website || listing.bookingUrl;
    const business = {
      "@type": "LocalBusiness",
      name: listing.name,
      url,
      telephone: listing.phone || undefined,
      areaServed: listing.area,
      description:
        listing.offersNotes ||
        listing.feeNotes ||
        listing.visitNotes ||
        undefined,
    };
    if (listing.address) {
      business.address = {
        "@type": "PostalAddress",
        streetAddress: listing.address,
      };
    }
    const hours = [];
    const hoursSource = listing.accessHours || listing.hours;
    if (hoursSource) {
      for (const [day, value] of Object.entries(dayMap)) {
        const raw = hoursSource[day];
        if (!raw) continue;
        if (/24\s*hours|24\/7/i.test(raw) && !/not\s+published|closed/i.test(raw)) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: "00:00",
            closes: "23:59",
          });
          continue;
        }
        const range = parseClockRange(raw);
        if (range) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: range.opens,
            closes: range.closes,
          });
        }
      }
    }
    if (hours.length) business.openingHoursSpecification = hours;
    return business;
  }

  eleventyConfig.addFilter("defaultCityFaqs", (city) => [
    {
      q: `Can I get an RV this weekend in ${city.city}?`,
      a: `Maybe, but inventory changes by the hour, especially around weekends and events. This page lists verified dealers and depots and the hours they publish. It does not cache which rigs are free today. Call the depot, use the operator’s reservation page, or search a peer-to-peer platform such as RVshare or Outdoorsy for your exact dates.`,
    },
    {
      q: "Do these companies offer one-way rentals?",
      a: "We flag one-way only when that operator’s public page says one-way rentals are offered, including this city or a network that includes this depot. Routes, fees, and approval rules change. Confirm the pickup and drop-off cities, and any one-way fee, when you book.",
    },
    {
      q: "Why do some days say “Not published” instead of “Closed”?",
      a: "If a day’s hours were missing from the operator’s page, we write “Not published” rather than inventing “Closed.” We use “Closed” only when the operator publishes it.",
    },
    {
      q: "Should I use a depot or a peer-to-peer listing?",
      a: "A dealer or national fleet has a published depot address and hours. Peer-to-peer platforms such as RVshare and Outdoorsy show live, date-specific inventory, including delivery and pet filters, and their official pages emphasize insurance and support. Cancellations still happen. Confirm the pickup plan and coverage before you pay.",
    },
    {
      q: "Do you list live prices or available RVs?",
      a: "No. Rental inventory and rates change often. We do not cache live availability. If a listing includes a price, it is labeled as listed on a date. Follow the operator’s own page or a live marketplace search for current pricing.",
    },
    {
      q: `How does RVLastMinute verify listings in ${city.city}?`,
      a: "We only publish facts we found on a public page — usually the operator’s own website. Each listing has source links and a last-checked date. We do not invent hours, one-way policies, or prices. If a site was down or a detail was unclear, we left it out.",
    },
  ]);

  eleventyConfig.addFilter("cityJsonLd", (city, siteObj) => {
    const pageUrl = `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`;
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Last-minute RV rental depots in ${city.city}, ${city.state}`,
      url: pageUrl,
      isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
      about: {
        "@type": "ItemList",
        name: `RV rental dealers and depots in ${city.city}, ${city.state}`,
        numberOfItems: (city.listings || []).length,
        itemListElement: (city.listings || []).map((listing, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: listingToLocalBusiness(listing),
        })),
      },
    };
  });

  eleventyConfig.addFilter("faqJsonLd", (faqs, pageUrl) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: (faqs || []).map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }));

  eleventyConfig.addFilter("breadcrumbJsonLd", (crumbs, siteObj) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (crumbs || []).map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url
        ? crumb.url.startsWith("http")
          ? crumb.url
          : `${siteObj.url}${crumb.url.startsWith("/") ? crumb.url : `/${crumb.url}`}`
        : undefined,
    })),
  }));

  eleventyConfig.addFilter("homeJsonLd", (siteObj, cities) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteObj.name,
    url: siteObj.url,
    description: siteObj.description,
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
    hasPart: {
      "@type": "ItemList",
      name: "Cities with RV rental depot listings",
      numberOfItems: (cities || []).length,
      itemListElement: (cities || []).map((city, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${city.city}, ${city.state}`,
        url: `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`,
      })),
    },
  }));

  eleventyConfig.addFilter("guideJsonLd", (siteObj) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Need an RV this weekend? How to find a last-minute RV rental",
    name: "Need an RV this weekend? How to find a last-minute RV rental",
    url: `${siteObj.url}/guides/need-an-rv-this-weekend-how-to-find-a-last-minute-rv-rental/`,
    description:
      "How to look for a last-minute RV rental, what depot hours and one-way flags actually mean, and when to use a peer-to-peer platform that shows live inventory.",
    isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
  }));

  eleventyConfig.addCollection("cities", () => {
    const dir = path.join(__dirname, "data", "cities");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const raw = fs.readFileSync(path.join(dir, name), "utf8");
        const data = JSON.parse(raw);
        data._file = name;
        if (!data.citySlug) {
          data.citySlug = String(data.city || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
        }
        return data;
      })
      .sort((a, b) =>
        `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`)
      );
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    pathPrefix: site.pathPrefix,
  };
}
