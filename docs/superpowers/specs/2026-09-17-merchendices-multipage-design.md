# Merchendices Multipage Website Design

## Goal

Expand the existing creator-merch landing page into a compact, coherent multipage website for the renamed Merchendices brand. The finished site must stay static, fast, and directly deployable through the existing Docker and Nginx setup.

## Audience and primary journey

The audience is YouTube creators evaluating a merchandise partner. The primary journey is: understand the offer, inspect representative store directions, learn how the partnership works, and contact Merchendices.

## Information architecture

- `/` is the concise overview and routes visitors toward the detailed pages.
- `/services/` explains creative, storefront, production, and fulfillment work.
- `/stores/` presents three clearly labelled demonstration storefront directions in reusable case-study cards. They must not be described as real clients or historical projects until real links and material are supplied.
- `/about/` explains the operating model and four-step process.
- `/contact/` publishes `hello@merchendices.com` as the provisional contact address and provides a static enquiry form using a mail client handoff.

All pages use the same header, footer, logo, stylesheet, motion system, and cookie controls. Root-relative links keep navigation reliable under Nginx directory routes.

## Brand and presentation

The production-facing brand name is `MERCHENDICES`; `MERX` must not remain in page content, metadata, package metadata, validation output, or documentation describing the current brand. The supplied transparent dice logo remains the canonical mark. Text-only `MX` decorative monograms become `MD`.

The existing black-to-color story remains, but the site changes from billboard scale to gallery scale. Desktop display headings target roughly 96–112 px rather than 140–155 px, section headings top out near 88–100 px, section spacing is reduced by roughly 20%, and large cards become shallower. Main body copy remains at least 16 px and regular navigation or controls remain at least 14 px.

## Store examples

The Stores page uses browser-like, code-built storefront compositions rather than generated product photography. Each example has a name, channel category, visual direction, palette, and short description. Every example is explicitly labelled `Demonstration store` so the site shows capability without inventing clients or performance claims. The page structure is ready for real links and screenshots later.

## Contact behavior

The Contact page exposes the provisional address `hello@merchendices.com`. The form collects creator name, email, channel URL, audience size, and project notes. Submitting a valid form opens a prefilled `mailto:` draft; validation errors are shown inline and focus moves to the first invalid field. No user data is persisted or sent to a third party.

## Cookie consent

A shared, accessible cookie banner appears until a choice is stored. Visitors can accept all, reject non-essential storage, or open preferences. The only stored value is the visitor's consent choice in local storage; no analytics script is added. A `Cookie settings` footer control reopens the preferences panel on every page. The dialog traps no navigation incorrectly, closes with Escape, restores focus, and clearly explains that essential local storage supports the preference itself.

## Accessibility and responsive behavior

- Every page has one `h1`, a skip link, labelled primary navigation, and meaningful page titles and descriptions.
- Current navigation uses `aria-current="page"`.
- Buttons and links have visible focus styles and at least 44 px touch targets where appropriate.
- The pages remain usable at 200% text zoom and at 360 px wide without horizontal overflow.
- Reduced-motion visitors see all content immediately and receive no continuous animation.

## Technical constraints

- Plain HTML, CSS, and vanilla JavaScript only; no new runtime dependencies.
- Static output remains entirely under `site/` and is served by the existing Nginx image on port 8080.
- The canonical `site/logo.webp` stays at or below 160 KiB.
- The cookie preference is the only new client-side persistence.
- No fictional clients, store URLs, testimonials, sales metrics, or campaign photography.

## Verification

Node tests prove the route files, brand migration, navigation, page metadata, demo-store labelling, contact details, consent-state behavior, and compact scale contract. The site checker resolves every local HTML, stylesheet, script, image, and navigation reference. A local HTTP smoke test checks all five routes, followed by desktop and mobile visual inspection.
