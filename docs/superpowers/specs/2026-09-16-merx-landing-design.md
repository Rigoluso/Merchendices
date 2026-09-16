# MERX Landing Page Design

## Purpose

Create a one-page marketing site for MERX, a service that helps YouTubers launch merchandise without setup costs. The site must communicate that MERX handles product design, storefront creation, fulfillment, and shipping while creators earn from sales and keep their attention on content.

The primary audience is established and growing YouTube creators who want professional merchandise but do not want to manage inventory, logistics, or web development.

## Experience Direction

The visual thesis is **color ignition**: the page begins in black, charcoal, grey, and white, then gains increasingly saturated color through deliberate animated events as the visitor scrolls. The change must feel constructed and kinetic rather than like a continuous background gradient.

The style takes inspiration from Watermelon UI's dark interface, rounded cards, high-density composition, crisp borders, and interactive motion without reproducing its layout or branding. MERX will use larger editorial typography, creator-merch imagery, layered cards, and a more expressive scroll narrative.

## Page Structure

### 1. Header and Hero

- Compact sticky header with the MERX wordmark, section navigation, and a primary `Start a drop` control.
- Black background with subtle grid/noise texture and restrained grey borders.
- Oversized headline focused on the value proposition: the creator brings the audience; MERX builds and ships the merchandise.
- Short supporting copy explaining the free setup model.
- A visual stack of monochrome merchandising cards that introduces the card language used throughout the page.
- Primary navigation actions scroll to relevant page sections. Because no contact destination was supplied, the final conversion control scrolls to the closing invitation rather than inventing an email address or external form.

### 2. Service Overview

- Four dense cards for design, storefront, production, and worldwide fulfillment.
- Cards reveal sequentially and react subtly to pointer movement.
- The first controlled color accent appears here as a narrow electric-green signal line and animated status marker.

### 3. From Channel to Collection

- A scroll-led process showing four stages: understand the channel, design the collection, build the store, ship every order.
- A sticky central canvas advances between stages using discrete color panels, sliding masks, and moving type.
- Each stage introduces an additional palette color: green, violet, orange, then cyan.
- The transition is triggered by section progress and never implemented as a plain full-page color fade.

### 4. Example Merchandise

- Three original editorial product images: creator apparel, packaging/fulfillment, and a complete coordinated collection.
- Images appear in asymmetrical framed cards with concise, believable labels rather than fabricated client claims.
- Cards use layered hover depth and animated captions.

### 5. Operating Model

- A direct summary of the arrangement: zero setup fee, no inventory burden for the creator, MERX manages the operational work, and the creator earns from merchandise sales.
- A comparison-style composition contrasts the creator's responsibilities with MERX's responsibilities without presenting unsupported financial figures.

### 6. Closing Invitation

- The most colorful section on the page, combining the full palette in discrete moving bands, orbiting accents, and overlapping panels.
- Repeats the core promise in a concise headline and invites the creator to start planning a drop.
- Provides a clearly labeled contact handoff panel without an active external form; the client's actual contact method can be wired later without changing the layout.

### 7. Footer

- Minimal brand mark, section links, and a short service descriptor.
- No invented legal links, social accounts, customer logos, testimonials, or performance metrics.

## Visual System

- Palette progression: near-black, graphite, cool grey, and white in the first viewport; electric green first; violet, orange, and cyan added progressively; full palette reserved for the final section.
- Typography: bold display sans-serif for headlines paired with a clean readable sans-serif for body copy. Type scales responsively and remains readable at 200% zoom.
- Surfaces: deep charcoal cards, crisp one-pixel borders, generous rounded corners, inset highlights, and occasional bright color blocks.
- Imagery: three generated raster assets with a coherent high-end editorial campaign look, no visible third-party trademarks, and no text baked into the images.
- Iconography: simple functional line icons or familiar symbols. Decorative representational artwork will not be drawn with CSS or hand-written SVG.

## Motion and Interaction

- Scroll-triggered section reveals, text masks, card stacking, and discrete color-panel entrances.
- A sticky progress rail makes the page's movement legible and reinforces the gradual increase in color.
- Pointer-based tilt and magnetic motion remain subtle and are disabled on coarse pointers.
- Navigation uses smooth anchor scrolling while preserving keyboard behavior.
- All essential content is visible and usable without animation.
- `prefers-reduced-motion` removes parallax, continuous loops, and large transforms while retaining instant state changes.

## Responsive Behavior

- Desktop uses asymmetric grids, sticky compositions, and layered card clusters.
- Tablet simplifies overlap while retaining the staged color progression.
- Mobile becomes a clear single-column narrative; sticky sequences convert to stacked sections to avoid trapped scrolling.
- No horizontal overflow, clipped controls, or text overlap at supported widths.

## Technical Shape

- A single static marketing route built with the standard Sites starter unless project initialization selects a simpler supported static structure.
- Primary implementation stays focused in the main page and global stylesheet, with small focused components only where interaction or readability benefits.
- Images are stored locally in the site's public assets and include useful alternative text.
- Site-specific title, description, and favicon are included. No social preview image is generated because it was not requested.
- The page does not require a database, authentication, external services, or client-side persistence.

## Verification and Acceptance Criteria

- The production build succeeds with no blocking runtime errors.
- The first viewport is monochrome and immediately explains the service.
- Color appears in distinct animated stages and becomes materially richer further down the page.
- The experience includes three coherent merchandise example images.
- All requested service responsibilities are accurately represented: design, website/storefront, fulfillment, and shipping.
- Navigation and interactive controls are keyboard accessible.
- Reduced-motion behavior is implemented.
- Desktop and mobile visual checks show readable text, intact layouts, and no unintended horizontal scrolling.
- The completed Site is published through Sites and the deployed URL is returned to the user.
