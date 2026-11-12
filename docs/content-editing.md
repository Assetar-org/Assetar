# Editing Assetar content

Use Strapi's **Content Manager**. Three single types mirror the existing website:

| Entry | Editable content |
| --- | --- |
| Site Setting | Brand name/logo, announcement, navigation, WhatsApp link, contact and social links, copyright, default SEO, marketing integrations |
| Home Page | Hero, buttons, platform logos, values, services, customer reviews, bottom call to action, page SEO |
| About Page | Intro, button, FAQs, bottom call to action, page SEO |

Repeated items can be added, removed, and reordered. Text is rendered as plain text; no HTML knowledge is required. A link has a label, destination, and “new tab” toggle. Use paths such as `/about` or `/#footer` for internal navigation, `https://...` for external destinations, and `mailto:`/`tel:` for contact links.

For images, choose a **File** from the Media Library and enter **Alt** text. A selected File takes precedence over URL. To use an external URL instead, clear File. The migration imports existing local images; external platform logos stay as URLs until replaced. Fonts and purely decorative textures/icons remain in the website code.

**Save** retains a draft. **Publish** makes it visible on the next full website reload, without a frontend rebuild. The import will never overwrite your edits on restart. Keep all three single types published; unpublishing a required entry makes the public website unavailable until it is republished. There is no draft-preview route in this implementation.

## SEO and marketing head links

Each page has an SEO component, with title, description, keywords, canonical URL, share image, “no index,” head links, and meta tags. Site Setting provides defaults; page values override them. Clear a page SEO field to use its site default. The site URL comes from deployment configuration, so default canonical URLs use the actual public hostname.

Add structured **Head Links** for canonical, alternate/hreflang, preconnect, DNS prefetch, preload, icon, or Apple touch icon. Fill `href`, optional `hreflang`/MIME type, and `as` for preload (image/font/style/script/fetch). Toggle Cross Origin for an anonymous cross-origin resource. To override a global canonical entry, add a page canonical head link. Normally leave canonical head links empty and use each page's Canonical URL field instead.

For ownership verification, add a **Meta Tag**, for example `google-site-verification` with the verification token as Content. Meta tags are escaped and cannot inject HTML. Title/description/keywords/robots use the dedicated SEO fields.

In **Site Setting → Marketing**, the Enable switch controls the existing Google tag (Google Ads or GA), Snapchat Pixel, and Mailchimp script. Set their IDs/URL in the dedicated fields. The migration preserves the original IDs, consolidates the duplicate Snapchat initialization, and removes the hardcoded/placeholder email values from pixel initialization. Full page loads and navigation between pages send page views; hash-only navigation does not. If automatic history tracking is enabled separately in your analytics account, disable one source there to avoid duplicate SPA page-view reporting.

Arbitrary inline JavaScript and unrestricted third-party script URLs are not exposed to editors. A new tracking provider requires a reviewed integration in code. Restrict Site Setting editing/publishing to trusted marketing administrators using Strapi's admin roles. This migration does not add a consent-management platform; existing tracking remains enabled as in the old site and can be disabled in Marketing.
