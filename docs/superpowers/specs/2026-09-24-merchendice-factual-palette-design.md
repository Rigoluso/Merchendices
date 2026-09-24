# Merchendice Factual Palette Redesign — Design Specification

## Outcome

Replace promotional and playful wording with direct descriptions of Merchendice services while making all five approved palette colors visible in the page structure.

## Requirements

- Keep the static three-route architecture: `/`, `/contact/`, and `/terms/`.
- Preserve `site/logo.webp`, the contact mail flow, cookie controls, terms content, and Docker/Nginx files.
- Remove slogan-like hero and CTA wording, including “Develop your next product,” “clear route,” “no mystery process,” and “made personal.”
- Use the palette as solid, visible surfaces or accents: `#011627`, `#FDFFFC`, `#2EC4B6`, `#E71D36`, and `#FF9F1C`.
- Use factual labels: services, process, fulfilment, contact, and terms.
- Keep the layout responsive from 320px upward with no horizontal overflow.

## Visual direction

The shell uses Midnight with a Paper reading surface. Services are shown as three equal panels using Teal, Red, and Amber. The process section uses a Paper surface with colored markers, and the contact call-to-action uses Red with Paper text. Teal and Amber remain visible in links, borders, and process markers. No gradients or stock/AI product photography are introduced.

## Acceptance evidence

- Tests reject the removed slogan phrases and require direct service copy.
- Tests verify every palette value is used by the stylesheet.
- Browser checks continue to cover responsive overflow and the existing contact/cookie flows.
