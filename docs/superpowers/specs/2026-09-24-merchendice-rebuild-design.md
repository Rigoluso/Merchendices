# Merchendice Static Site Rebuild — Design Specification

## Outcome

Replace the existing multi-section showcase with a restrained static marketing site for Merchendices. The site should explain the offer quickly, make the next action obvious, and remain easy to host through the existing Docker/Nginx image.

## Requirements

- Preserve `Dockerfile`, `compose.yaml`, and `nginx.conf` unchanged unless a route requires a static-file fallback already supported by the current configuration.
- Preserve and reuse `site/logo.webp` as the only brand image.
- Use the supplied palette as named design tokens:
  - Midnight `#011627`
  - Paper `#FDFFFC`
  - Teal `#2EC4B6`
  - Signal red `#E71D36`
  - Amber `#FF9F1C`
- Remove the old homepage, service, store, about, process, motion-core, and generated-artwork implementation. Do not retain obsolete page-specific JavaScript or styles.
- Provide three routes: `/`, `/contact/`, and `/terms/`.
- Keep the landing page uncluttered: hero, one concise offer section, one intuitive visual workflow, and one contact call-to-action.
- Add cookie settings with an accessible banner, a settings dialog, essential-storage explanation, optional analytics opt-in (off by default), and persistent local storage.
- Add terms and conditions covering scope, approvals, production, payments, shipping, intellectual property, privacy/cookies, and contact details.
- Add a contact form with fields for name, email, YouTube, Instagram, TikTok, other platforms, and project brief. Submission opens a preformatted `mailto:merchendices@gmail.com` message without transmitting through a server.
- Keep all controls keyboard accessible, responsive from 320px upward, and free of horizontal overflow.

## Visual direction

The homepage uses a midnight shell with a paper content panel, a small amount of teal and amber for the offer, and red only for high-intent actions. The dice logo is shown once in the hero and reused in navigation/footer. Supporting visuals are built from CSS geometry: a simple orbit/flow path, a three-card offer, and a compact deliverable panel. No stock, AI-generated, or merchandise photographs are used.

## Structure

```text
site/
  index.html
  contact/index.html
  terms/index.html
  logo.webp
  styles.css
  site.js
  cookie-consent.js
  contact.js
```

`site.js` owns only shared navigation polish, reveal behavior, and the contact mailto handoff. `cookie-consent.js` owns consent state and the banner/dialog. `contact.js` owns field validation and deterministic mailto formatting. The HTML pages contain the content and remain usable without JavaScript.

## Acceptance evidence

- A recursive site check finds exactly three HTML routes and no references to removed pages or old process classes.
- Unit tests verify the palette, logo, cookie controls, terms sections, contact fields, and mailto recipient/body labels.
- Browser checks verify 320/390/768/1440 layouts, no horizontal overflow, visible page content without JavaScript, accessible cookie settings, and contact navigation.
- A static grep confirms the old motion and demo-store assets are gone while Docker/Nginx files remain.
