# Anant Productions — Project Memory & Knowledge Base

> **File:** `memory.md`  
> **Last Updated:** October 2026  
> **Purpose:** Persistent single source of truth for all business profile data, brand identity, social channels, contact details, codebase structure, and ongoing updates for **Anant Productions**. Update this file whenever new information or features are added.

---

## 1. Business & Contact Information

| Property | Details |
| :--- | :--- |
| **Brand Name** | **Anant Productions** |
| **Domain** | `anantproductions.in` |
| **Primary Tagline** | Luxury Gujarati & Pan-India Wedding Cinematography & Photography |
| **Gujarati Tagline** | શુભ લગ્ન &bull; અનંત પ્રેમ &bull; અવિસ્મરણીય ક્ષણો (*Shubh Lagna &bull; Anant Prem &bull; Avismarniya Kshano*) |
| **Instagram Handle** | **[@anantproductions](https://instagram.com/anantproductions)** |
| **Instagram URL** | `https://instagram.com/anantproductions` |
| **Direct Phone** | `+91 80000 88819` |
| **WhatsApp Booking** | `+91 80000 88819` ([https://wa.me/918000088819](https://wa.me/918000088819)) |
| **Official Email** | `weddings@anantproductions.in` |
| **Studio Address** | Bodakdev, Sindhu Bhavan Road, Ahmedabad, Gujarat &mdash; 380054 |
| **Operational Hubs** | Ahmedabad, Vadodara, Surat, Rajkot, Udaipur, Jaipur & Pan-India Destinations |

---

## 2. Brand Identity & Visual Language

### Concept & Philosophy
- **"Anant" (અનંત)** translates to *infinite, eternal, boundless*.
- **The Emblem:** An intertwined infinity lemniscate ribbon symbolizing lifelong marital vows, with the right loop transitioning seamlessly into a **precision 6-blade camera iris diaphragm**, signifying world-class cinematography.
- **Tone:** Regal, timeless, high-fashion, discreet luxury catering to affluent Gujarati and royal destination wedding clientele.

### Color Palette
- **Imperial Obsidian (Dark Mode Canvas):** `#0A0908` / `#0D0D0E`
- **Royal Velvet Crimson (Accent & Depth):** `#1F070B`
- **Champagne Leaf Gold (Primary Accent & Gradients):** `#D4AF37`, `#F5DF9E`, `#AA821C`
- **Card / Surface Tint:** `#141416` / `#1A1A1E` with subtle `rgba(212, 175, 55, 0.15)` borders
- **Body Text:** `#E0DCD3` / `#9E988F`

### Typography Hierarchy
- **Display & Monograms:** `'Cinzel', serif` (Roman heritage elegance)
- **Headings & Body UI:** `'Montserrat', 'Inter', sans-serif` (Crisp modern legibility)
- **Gujarati Script Elements:** `'Noto Sans Gujarati', sans-serif`

---

## 3. Core Services & Deliverables

1. **Heritage Pre-Wedding Cinema & Stills (From ₹65,000):**
   - 1 full-day concept shoot across architectural/heritage backdrops (Adalaj Ni Vav, Polo Forest, Champaner, or Royal Heritage Havelis).
   - 3–4 minute 4K cinematic concept film with couple dialogue audio, 45–60 master color-graded portraits, 2 vertical 9:16 Instagram reels, and 4K drone aerials.
2. **Royal Engagement & Ring Ceremony Package (From ₹85,000):**
   - Multi-cam coverage for Sakar Pudo (સાકરપુડો), Gol Dhana (ગોળધાણા), Ring Exchange, and Evening Sangeet.
   - 4–5 minute 4K cinematic highlight film, full uncut multi-cam ceremony archive, 150+ color-graded photographs, and same-day 60-second vertical reel delivered in 24 hours.
3. **Classic Gujarat Wedding Master Collection (From ₹2,85,000):**
   - Comprehensive 2–3 day coverage (Mandva, Grah Shanti, Mosalu, Midnight Garba, Lagna & Reception) by 6 senior master artists.
   - 18–25 minute feature film + 3–4 min teaser in 4K HDR, handcrafted Italian velvet heirloom album (40 sheets), 3 vertical reels in 24 hours, wireless low-heat Garba lighting.
4. **Royal Palace Destination Wedding Collection (From ₹4,50,000):**
   - 3–4 day destination coverage (Udaipur, Jaipur, Goa, etc.) with 8 master artists, on-site video editor, 2 master Italian velvet albums + 2 parent pocket albums, FPV drone, and raw cinema footage on 2TB SSD.
5. **24-Hour Social Media Reels:** High-definition 60-second vertical reels delivered within 24 hours for family WhatsApp groups and Instagram (`@anantproductions`).

---

## 4. Codebase Architecture & Key Files

| File | Description |
| :--- | :--- |
| `index.html` | Flagship website featuring hero video header, brand story, film portfolio, wedding packages, client testimonials, FAQ accordion, direct-to-WhatsApp booking form, and footer with `@anantproductions` social links. |
| `brand-showcase.html` | High-fidelity interactive brand identity showcase featuring scalable vector logo lockups, color swatches, film watermark simulator, typography scale, and brand rationale. |
| `dp-preview.html` | Social media display picture preview tool showcasing the 1024x1024 master icon, circular crop safe zone, and live Instagram profile mockup with `@anantproductions`. |
| `css/style.css` | Comprehensive stylesheet containing design tokens, glassmorphism card utilities, responsive grid rules, animations, and typography styles. |
| `js/main.js` | Client-side logic for sticky navigation, video modal player, portfolio filter tabs, FAQ accordions, and WhatsApp inquiry prefill generator. |
| `anant_logo.png` | Transparent 3D golden infinity aperture emblem (used in navbar brand without text). |
| `anant_logo.jpg` | High-resolution circular logo master image. |
| `anant_logo_social_dp.jpg` | Optimized social media avatar asset for Instagram, WhatsApp, and Facebook. |
| `DESIGN.md` | In-depth design documentation and technical tokens. |
| `memory.md` | *(This file)* Living memory and reference for business details, social links, and project changes. |

---

## 5. Local Development Server

- **Dev Server Command:** `python -m http.server 3000` (or `npx serve . -l 3000`)
- **Main Website URL:** `http://localhost:3000/index.html` (or `http://localhost:3000`)
- **Brand Showcase URL:** `http://localhost:3000/brand-showcase.html`
- **Social Profile DP Preview:** `http://localhost:3000/dp-preview.html`

---

## 6. Maintenance & Update Protocol

Whenever changes or additions are made:
1. **Contact/Social Changes:** Update both `index.html`, `brand-showcase.html`, `dp-preview.html`, and mirror the updates in `memory.md`.
2. **New Packages or Offerings:** Add details to the Services section of `memory.md` and `index.html`.
3. **Design / Asset Updates:** Record any new palette codes, logo variations, or URLs in this file to ensure continuous consistency across all pages.
4. **Server / Dev Workflows:** Keep commands and port configurations logged here.

---

## 7. Change Log & Project Updates

- **October 2026:**
  - Added Instagram handle `@anantproductions` across the main site (`index.html`), social DP preview (`dp-preview.html`), and brand showcase (`brand-showcase.html`).
  - Created `memory.md` persistent knowledge base and documentation.
  - Launched local development server on port 3000 (`http://localhost:3000`).
  - Removed "WEDDING CINEMATOGRAPHY & PHOTOGRAPHY" subtitle from the navbar brand logo in `index.html` (desktop and mobile drawer), streamlining the header to display the clean `ANANT PRODUCTIONS` wordmark beside the circular emblem. Added `white-space: nowrap` to prevent horizontal text wrapping.
  - Enforced single-line rendering for all navbar links (`white-space: nowrap` on `.nav-link`), eliminating multi-line word breaks on titles like "The Heritage" and "Sacred Rituals". Added responsive fluid gap (`clamp(10px, 1.4vw, 20px)`) and responsive headroom breakpoints.
  - Added "Approximate Budget" selection field (`#form-budget`) and paired "Coverage Needed" selection field (`#form-service`) to the inquiry booking form in `index.html`. Styled custom dark-gold dropdowns in `css/style.css` and updated `js/main.js` to automatically forward the client's chosen budget tier directly into the WhatsApp inquiry message.
  - Updated primary studio WhatsApp and contact phone number across all buttons, forms, floating CTA, and scripts to **`+91 80000 88819`** (`https://wa.me/918000088819`).
  - Streamlined navbar links into concise single words: `Films`, `Packages`, `Rituals`, `Portfolio`, `Destinations`, `Estimator` (removing multi-word wraps), expanded button separation spacing (`gap: 16px`), and added direct `style` overrides with cache-busting `?v=5`.
  - Added dedicated **Curated Investment Packages section (`#packages`)** introducing standalone packages for:
    - **Heritage Pre-Wedding Cinema & Stills** (From ₹65,000)
    - **Royal Engagement & Ring Ceremony (સગાઈ)** (From ₹85,000)
    - **Classic Gujarat Wedding Master Collection** (From ₹2,85,000)
    - **Royal Destination Palace Collection** (From ₹4,50,000)
    Each with crew details, deliverables, and direct-booking WhatsApp buttons. Updated inquiry dropdown and footer links.
  - Redesigned the enquiry form's "Approximate Budget" and "Coverage / Celebration Type" fields: replaced native browser select dropdowns with identical `.form-input` text fields matching the exact dark styling of the rest of the form. Removed strict tiers so clients can enter any custom budget value (from 15K to 10 Lakh+) with non-intrusive datalist autocomplete suggestions.
  - Replaced `anant_logo.jpg` in the navbar and mobile drawer with `anant_logo.png` (the transparent 3D golden infinity camera lens mark without redundant text). Updated CSS with `object-fit: contain`, width: auto, height: 38px, and a subtle Champagne Gold drop-shadow glow.
  - **Full Conversion Rate Optimization & Redesign Overhaul:**
    - Replaced unverified historical statistics ("450+ Weddings", "10+ Years", fabricated reviews) with authentic, grounded value pillars: Emotion-First Candid Moments, Vedic Ritual Fluency, Photo + Cinema Coordinated Unit, and Transparent Packages.
    - Updated hero headline to the emotionally resonant: *"Your Story. Your Emotions. Your Forever."* with supporting copy tailored to couples planning weddings in Gujarat.
    - Built **Founding Couple Launch Offer** banner: Signature Two-Day Photo + Cinema package at ₹34,999 (limited to first 3 bookings, saving ₹10,000) with direct WhatsApp claim action.
    - Introduced **Two-Day Gujarati Wedding Packages** in `index.html` and centralized in `js/config.js`:
      - **Essential Photography:** ₹24,999 (Range ₹24,999 – ₹29,999, 1 photographer, up to 6 hrs/day, 300–400 photos).
      - **Signature Photo + Cinema:** ₹39,999 (Range ₹39,999 – ₹49,999, 1 photographer + 1 cinematographer, 350–500 photos, 3–5 min film, 1 reel, visually highlighted).
      - **Premium Wedding Story:** ₹59,999 (Range ₹59,999 – ₹79,999, 1 photographer + 1 cinematographer, up to 8 hrs/day, 500–700 photos, highlight film, 2 reels).
    - Built **Additional Services Cards** for Pre-wedding shoots (from ₹5,999), Engagement coverage (from ₹7,999), Additional functions, Extra coverage hours (from ₹1,500/hr), Printed heirloom albums (from ₹6,999), and Additional vertical reels (from ₹1,999).
    - Added **Why Choose Us** (6 value pillars), **Our 4-Step Process**, and **Our Promise to You and Your Family** (reverence for Baa-Dada, sacred mandap presence, analog warmth, fast family delivery).
    - Built complete **9 FAQ items** addressing two-day Gujarati weddings, coverage, customization, deliverables, and booking.
    - Implemented **High-Converting Enquiry System**: couple names, WhatsApp number, wedding date with "Date not yet finalized" flexibility toggle, city/venue, celebration duration, interactive celebration function selector pills, service type, approximate budget, and notes with URL-safe direct WhatsApp dispatch.
    - Implemented **Full-Screen Image Lightbox** for high-resolution portfolio inspection and video film spotlight modals.
    - Created **`js/config.js`** as single source of truth for business details, packages, launch offers, add-ons, and contact links.
    - Added **`robots.txt`**, **`sitemap.xml`**, and Schema.org JSON-LD structured data for Gujarat wedding photography SEO.
    - Added **Mobile Sticky Action Bar** ("Check Wedding Date" + "WhatsApp") for effortless mobile conversions without obscuring content.
  - **Interactive Wedding Package & Custom Quotation Builder System Release:**
    - Architected centralized single source of truth in `js/config.js` with categorized collections (Two-Day Weddings, Pre-Wedding Films, Engagement & Sakar Pudo, Standalone Functions) and full Add-on Catalogue (Photography, Cinema, 4K Drone Aerials, Social Media Reels, Interviews & Podcasts, Post-Production, Heirloom Albums, and Extra Hours).
    - Built pure, deterministic pricing calculation engine in `js/pricing-engine.js` with zero-duplicate subtraction for base package inclusions, integer currency math, Indian numbering formatting (`formatINR`), and URL state hash serialization.
    - Added automated unit test suite in `test/pricing-engine.test.js` (15/15 passing tests covering base tiers, package switching, duplicate prevention, multi-day adjustments, discounts, and custom quote items).
    - Built rich 8-step luxury interactive configurator in `js/quotation-builder.js` mounted at `#quotation-builder-app` with live sticky price breakdown, mobile drawer, formal PDF-ready branded quotation modal with unique reference IDs (e.g. `AP-2026-PZB7`), copy summary, and direct WhatsApp dispatch.
    - Updated `#packages` section in `index.html` with interactive category tabs and direct "Customize in Quotation Builder" actions.
    - Added client-side telemetry bus (`trackAnantEvent`) respecting customer privacy without exposing PII.
  - **Gujarati Phrasing Polish & Commercial Margin Inflation Update:**
    - Replaced the unnatural literal phrase `"શૂન્ય છૂપા ખર્ચા"` with natural, authentic native Gujarati: `"કોઈ પણ છૂપા ખર્ચ વિના"` ("Without any hidden costs") across the site.
    - Adjusted baseline prices across all packages and add-ons by ~20%–25% to establish an inflated commercial list-price schedule, allowing the studio to comfortably negotiate and provide discounts to clients while preserving healthy net profit margins:
      - **Two-Day Wedding Packages:** Essential ₹29,999 (was 24,999); Signature ₹49,999 (was 39,999); Premium ₹74,999 (was 59,999).
      - **Founding Couple Launch Offer:** Introductory rate ₹39,999 on Signature Photo + Cinema (regular price ₹49,999, Save ₹10,000 for early bookings).
      - **Pre-Wedding Shoots:** Essential ₹7,999 (was 5,999); Signature ₹15,999 (was 11,999); Premium Film ₹24,999 (was 19,999).
      - **Engagement / Sakar Pudo:** Essential ₹9,999 (was 7,999); Signature ₹18,999 (was 14,999); Premium Gala ₹31,999 (was 24,999).
      - **Standalone Functions:** Essential ₹9,999 (was 7,999); Signature Garba ₹18,999 (was 14,999); Premium Grand ₹28,999 (was 22,999).
      - **Production Crew Rates:** Traditional Photo ₹9,999; Candid Photo ₹9,999; 4K Cinema ₹12,499; Video Archive ₹8,499; Drone ₹7,499; Production Assistant ₹3,000.
      - **Add-on Services:** Drone ₹7,499; 9:16 Reel ₹2,499 (3-bundle ₹5,999); Interviews ₹5,999; Heirloom Album from ₹8,999; Royal Velvet Album ₹15,999; Extra hour ₹2,000; Extra day ₹24,999.
    - Updated all static cards, launch banners, budget dropdown selectors, pricing calculation engine, and 15/15 unit test assertions in `test/pricing-engine.test.js` to match.
  - **Wedding Tier Repositioning & Expanded Launch Offer Update (October 2026):**
    - Updated flagship Two-Day Gujarati Wedding Collections to clean luxury price points:
      - **Essential Wedding:** ₹40,000 (was ₹29,999) &bull; Range: ₹40,000 – ₹48,000.
      - **Signature Wedding:** ₹75,000 (was ₹49,999) &bull; Range: ₹75,000 – ₹90,000.
      - **Premium Wedding Story:** ₹1,00,000 / 1L (was ₹74,999) &bull; Range: ₹1,00,000 – ₹1,20,000.
    - Repositioned **Founding Couple Launch Offer** to regular price ₹75,000 down to **₹50,000** (Save ₹25,000 for early bookings).
    - Updated `js/config.js`, `js/pricing-engine.js`, `index.html` (cards, launch banner, FAQ, inquiry form dropdowns, WhatsApp message strings), `contact.html`, `about.html`, `privacy-policy.html`, `terms-and-conditions.html`, `404.html`, `500.html`, and all 16/16 unit test assertions in `test/pricing-engine.test.js`.
  - **Coverage Scope Flow Refactor & Dynamic Multiplier Schedule:**
    - Repositioned the Coverage Scope selection in Step 1 of the Quotation Builder: Celebration Category / Event Type is rendered first upfront.
    - Coverage Scope is now rendered in a dedicated section *after* Event Type, and is **only and only visible when someone selects 2-Day Wedding**. When other events (Pre-Wedding, Engagement, Individual Functions, Build Your Own) are selected, the Coverage Scope section is hidden and non-wedding scopes incur 0 surcharge.
    - Updated Coverage Scope pricing logic from fixed surcharges to dynamic package multipliers:
      - **One-Side Coverage:** 1.0x (Standard Base Price).
      - **Both Sides — Joint Venue:** **1.4x price** (e.g. ₹56,000 for Essential, ₹1,05,000 for Signature, ₹1,40,000 for Premium).
      - **Both Sides — Different Locations:** **1.85x price** (e.g. ₹74,000 for Essential, ₹1,38,750 for Signature, ₹1,85,000 for Premium).
    - Updated `js/config.js`, `js/pricing-engine.js`, `js/quotation-builder.js`, `contact.html`, and all unit and UI requirement tests in `test/pricing-engine.test.js` and `test/ui-requirements.test.js`.
  - **Removal of "Build Your Own (From ₹0 Base)" Option:**
    - Removed the "Build Your Own" choice from Step 3 (Base Package Selection) and Step 1 (Celebration Category) of the Quotation Builder.
    - Users now select strictly from curated, structured studio collections (Two-Day Wedding, Pre-Wedding, Engagement, Individual Functions) ensuring standardized studio delivery while still allowing custom add-ons in Step 5.
    - Updated `js/quotation-builder.js` and `js/config.js`.
  - **Removal of Redundant Coverage Services Step (Streamlined 7-Step Wizard):**
    - Removed the redundant Step 4 ("04 Services: Select your celebration coverage styles") from `js/quotation-builder.js` as photography and cinematography coverage styles are already decided and included in the chosen Base Plan tier (Essential, Signature, Premium).
    - Streamlined the quotation builder from 8 steps to 7 clean steps:
      1. **01 Event Type & Celebration**
      2. **02 Event Details & Schedule**
      3. **03 Choose Base Package**
      4. **04 Deliverables & Add-on Catalogue** (Heirloom albums, social reels, audio interviews, overtime hours)
      5. **05 Review Custom Quotation**
      6. **06 Your Contact Details**
      7. **07 Ready to Dispatch / Final Quotation**
    - Updated stepper tabs, navigation links (`data-step-next`, `data-step-prev`), kickers (`STEP XX OF 07`), mobile progress trackers, and test assertions in `test/ui-requirements.test.js`.
  - **Wedding Plans Original vs. Discounted Pricing & Introductory Offer Isolation:**
    - Removed the "Launch Offer" badge and strikethrough from the Signature Wedding card in the general package showcase grid.
    - Preserved the Founding Couple Launch Offer (₹50,000 promotional rate vs. regular ₹75,000, Save ₹25,000) exclusively in the dedicated Introductory Offer section (`#launch-offer`) for early bookings.
    - Updated all three Two-Day Wedding packages across `index.html`, `js/config.js`, and `js/quotation-builder.js` with:
      - **Essential Wedding:** Original Price **₹50,000** (with strikethrough), Discounted / Special Rate **₹40,000**.
      - **Signature Wedding:** Original Price **₹1,00,000 (1L)** (with strikethrough), Discounted / Special Rate **₹75,000**.
      - **Premium Wedding Story:** Original Price **₹1,50,000 (1.5L)** (with strikethrough), Discounted / Special Rate **₹1,00,000 (1L)**.
    - Updated package cards and quotation builder step 3 to display both the strikethrough original price and the prominent discounted rate.
  - **Pre-Wedding Decoy & Anchoring Pricing Update (15k, 30k, 50k):**
    - Updated the Pre-Wedding Collections to discounted rates of **₹15,000**, **₹30,000**, and **₹50,000**.
    - Strategically anchored original strikethrough prices to maximize conversions toward the middle (Signature) and highest (Premium) tiers:
      - **Essential Couple Shoot:** Original Price **₹20,000** (Save ₹5,000), Discounted Rate **₹15,000** (3 hrs, stills only).
      - **Signature Pre-Wedding (Recommended Sweet Spot):** Original Price **₹45,000** (Save ₹15,000 / 33% off!), Discounted Rate **₹30,000** (Half-day 5 hrs, 2 locations, 3 outfits, 4K 60s romantic cinematic reel).
      - **Premium Pre-Wedding Film (Luxury Flagship):** Original Price **₹75,000** (Save ₹25,000 / 33% off!), Discounted Rate **₹50,000** (Full-day 8 hrs sunrise-sunset, dialogue audio, 2-3 min 4K narrative film, 2 vertical reels, aerial drone).
  - **Engagement & Individual Functions Strategic Pricing Alignment:**
    - Updated **Engagement & Sakar Pudo (સગાઈ અને સાકરપુડો)** collections to be positioned a little more than pre-wedding (Pre-wedding is ₹15k / ₹30k / ₹50k), reflecting the sacred ritual solemnity, family coverage, and dual audio/ceremony requirements:
      - **Essential Engagement:** Original Price **₹28,000** (Save ₹8,000), Discounted Rate **₹20,000** (Up to 4 hrs stills & sacred ritual documentation).
      - **Signature Engagement (Most Booked Sweet Spot):** Original Price **₹50,000** (Save ₹15,000 / 30% off!), Discounted Rate **₹35,000** (Up to 5 hrs candid photo + 4K cinematic highlight film + 1 vertical reel).
      - **Premium Engagement Gala:** Original Price **₹85,000** (Save ₹25,000 / 30% off!), Discounted Rate **₹60,000** (Up to 6 hrs dual photo + cinema + lighting + 2 vertical reels + couple portraits).
    - Updated **Individual Functions (વ્યક્તિગત પ્રસંગો - Haldi, Pithi, Mehndi, Garba, Reception)** collections to match studio pricing structure:
      - **Essential Function (Intimate Haldi / Pithi / Mosalu):** Original Price **₹20,000** (Save ₹5,000), Discounted Rate **₹15,000** (Up to 4 hrs candid still photo).
      - **Signature Function (Best for Raas Garba / Sangeet Night):** Original Price **₹45,000** (Save ₹15,000 / 33% off!), Discounted Rate **₹30,000** (Up to 5 hrs photo + high-energy cinema highlight film + 1 vertical reel).
      - **Premium Grand Function (500+ Guest Gala / Formal Reception):** Original Price **₹75,000** (Save ₹25,000 / 33% off!), Discounted Rate **₹50,000** (Up to 6 hrs dual photo + full production cinema + 2 vertical reels).
    - Harmonized across `index.html` (with strikethrough original prices, special rate badges, and updated WhatsApp pre-filled inquiry messages), `js/config.js` (indicative prices, price ranges, and messages), and test suites (`test/pricing-engine.test.js` and `test/ui-requirements.test.js`).
  - **Comprehensive Add-on Catalogue Pricing Overhaul (Ahmedabad / Gujarat Luxury Market Rates):**
    - Recalibrated all add-on products and services to eliminate artificially low prices and match premium Ahmedabad wedding studio economics:
      - **Heirloom Albums:**
        - Printed Heirloom Wedding Album (30 Sheets / 60 Pages 12x18 layflat): **₹15,000** (was ₹8,999).
        - Royal Velvet Master Album Upgrade (40 Sheets / 80 Pages): **₹25,000** (was ₹15,999).
        - Parent / Family Duplicate Keepsake Album (8x12): **₹9,999** (was ₹5,999).
        - Archival Fine-Art Print Box (25 Mounted Prints in Wooden Box): **₹6,999** (was ₹3,999).
      - **Social Media Reels:**
        - Single 9:16 Vertical Reel (60s): **₹4,500** (was ₹2,499).
        - Three-Reel Bundle: **₹11,999** (was ₹5,999).
        - Additional Edited Reel: **₹3,999** (was ₹2,199).
        - Same-Day Edit Express Reel: **₹9,999** (was ₹4,499).
        - Express 48-Hour Highlight Delivery: **₹12,500** (was ₹6,499).
      - **Storytelling & Interviews:**
        - Guest & Family Audio/Video Interviews: **₹9,999** (was ₹5,999).
        - Couple Love Story Interview Session: **₹8,500** (was ₹4,999).
        - Podcast-Style Sit-Down Recording Setup: **₹18,000** (was ₹9,999).
        - Documentary Story Cut Integration: **₹6,500** (was ₹3,999).
      - **Post-Production & Masters:**
        - 4K Master SSD Archival Hard Drive (1TB): **₹8,999** (was ₹4,999).
        - Advanced Cinema Sound & Color Master: **₹9,999** (was ₹5,999).
        - Extended Feature Film (12–18 Mins): **₹15,000** (was ₹7,499).
        - Standalone Cinematic 4K Highlight Film (3–5 Mins): **₹15,000** (was ₹8,999).
        - Fine-Art Editorial Photo Retouching: **₹5,999** (was ₹3,199).
      - **Coverage, Overtime & Extra Days:**
        - Extra Coverage Hour: **₹4,000 / hr** (was ₹2,000).
        - Additional Wedding Day Rate: **₹35,000 / day** (was ₹24,999).
      - **Production Services (crewRoles & Showcase Grid):**
        - Traditional Photography Coverage: **₹15,000** (was ₹9,999).
        - Candid Photography Coverage: **₹15,000** (was ₹9,999).
        - Cinematic Wedding Filmmaking: **₹20,000** (was ₹12,499).
        - Traditional Video Archive: **₹12,000** (was ₹8,499).
        - 4K Drone Aerial Shoot: **₹12,000** (was ₹7,499).
        - Production Lighting & Audio Support: **₹5,000** (was ₹3,000).
    - Updated `js/config.js`, `index.html` (#addons showcase grid), and `test/pricing-engine.test.js`.
  - **Quotation Builder Stepper Menu Visibility & Navigation Fix:**
    - Resolved the horizontal cutoff issue where stepper menu tabs were clipped off past the 6th item (`06 Review` / `0...`).
    - Added `flex-wrap: wrap;` and optimized spacing on `.qb-stepper` in `css/style.css` so that all 7 steps (`01 Event Type`, `02 Details`, `03 Base Plan`, `04 Add-ons`, `05 Review`, `06 Your Info`, `07 Submit`) are fully visible, wrapped neatly, and never hidden on any screen size.
    - Fixed syntax error in `js/quotation-builder.js` (`loadInitialState` try-catch block), ensuring the new 7-step wizard (with Services removed) loads cleanly without falling back to cached 8-step scripts.
    - Added `syncCurrentInputs()` to ensure contact and schedule inputs are always synchronized into state before validation and step transitions.
    - Added draft validation sanitization to clamp any legacy drafts from older 8-step sessions (`builderState.currentStep <= 7`).
    - Updated cache-busting query strings (`?v=25`) across `index.html` for scripts and stylesheet.
  - **Hero Value Pillars Bar Layout & Clipping Fix:**
    - Resolved visual truncation and clipping on the 4th pillar item (`Transparent` / `Two-Day Wedding Packages`) in the hero stats bar on `index.html`.
    - Expanded `.hero-stats` container width from `max-width: 900px` to `max-width: 1060px` in `css/style.css`, giving ample horizontal breathing room across all 4 columns.
    - Added dedicated corner clearance padding (`.stat-item:first-child` / `.stat-item:last-child` with `22px` horizontal padding) so outer items are never clipped by the rounded border corners (`border-radius: var(--radius-lg)` + `overflow: hidden`).
    - Scaled typography gracefully: tuned `.stat-num` to `clamp(0.96rem, 1.12vw, 1.18rem)` with balanced letter-spacing (`-0.01em`), and `.stat-label` letter-spacing to `0.05em` with clean multi-line wrapping support.
    - Added responsive collapse breakpoints at `@media (max-width: 1120px)` (2x2 grid) and `@media (max-width: 560px)` (1 column), with mobile font sizes tuned in `@media (max-width: 480px)`.
    - Removed redundant inline `white-space: nowrap` from `index.html`.
  - **Photo Portfolio Section Temporarily Hidden:**
    - Hidden the "Featured Wedding Portfolio" section (`#portfolio` / `.gallery-section`) on `index.html` via `display: none !important;` in `css/style.css` and `style="display: none;" aria-hidden="true"` on the section tag.
    - Preserved all underlying markup, filter buttons, lightbox attributes, and data structures intact for effortless re-activation when the photo portfolio is ready.
    - Updated navigation links across all pages (`index.html`, `about.html`, `contact.html`, `terms-and-conditions.html`, `privacy-policy.html`, `404.html`, `500.html`):
      - Desktop nav: Cleanly streamlined to `Films`, `Packages`, `About`, `Contact`.
      - Mobile drawer: Updated portfolio link to `Wedding Films & Cinema` (`#films`).
      - Footer: Updated navigation link to `Wedding Films & Cinema` (`#films`).
  - **Dedicated Coverage Scope Step & Dynamic Package Price Calculation:**
    - Moved the Coverage Scope configurator into its own dedicated step (`Step 02 OF 08 • COVERAGE SCOPE`) instead of being embedded inside Step 1 (Event Type).
    - Made the step conditional: displays only when a **Wedding** celebration is selected (8 total steps: `01 Event Type`, `02 Coverage Scope`, `03 Details`, `04 Base Plan`, `05 Add-ons`, `06 Review`, `07 Your Info`, `08 Submit`).
    - For non-wedding celebrations (Pre-Wedding, Engagement, Individual Functions), Coverage Scope is skipped completely (7 total steps: `01 Event Type`, `02 Details`, `03 Base Plan`, `04 Add-ons`, `05 Review`, `06 Your Info`, `07 Submit`).
    - Removed multiplier text ratios (`1.4x Price`, `1.85x Price`) from all badges, card text, line item descriptions, and generated WhatsApp messages. Replaced with `'With Extra Charge'` badges (`'Standard'` for One-Side).
    - Updated package cards on the Base Plan step to dynamically compute and display package prices modified by the selected coverage scope multiplier (e.g. Signature Wedding dynamically displays ₹1,05,000 for Joint Venue or ₹1,38,750 for Different Locations, with an `'Adjusted with Extra Charge'` badge).
    - Updated test suites (`test/ui-requirements.test.js`, `test/pricing-engine.test.js`) and bumped cache version to `?v=27` in `index.html`.
  - **Zero-Scroll Quotation Studio & Dedicated Standalone Page (`quote.html`):**
    - Created dedicated standalone full-screen zero-scroll page at `quote.html` with fixed 100vh layout (`body.qb-standalone-page`), completely eliminating up-and-down scrolling across all wizard steps.
    - Integrated a persistent viewport-pinned bottom navigation bar (`.qb-nav-bar-fixed`) containing prominent `← Back` and `Continue →` buttons, ensuring navigation is always immediately reachable without hunting or scrolling.
    - Streamlined the step workflow by removing the redundant in-wizard review step:
      - Wedding celebrations: 6 steps (`01 Event Type` → `02 Coverage Scope` → `03 Details` → `04 Base Plan` → `05 Add-ons` → `06 Your Quotation`).
      - Non-wedding celebrations: 5 steps (`01 Event Type` → `02 Details` → `03 Base Plan` → `04 Add-ons` → `05 Your Quotation`).
    - Unified the final step (`renderStep_FinalQuotationAndContact`) with a clean two-column grid: quick contact details on the left, instant 1-click WhatsApp quote submission and official PDF download on the right.
    - Added an always-accessible `📄 Review & Download PDF` action button in the studio header and inside the live summary sidebar card.
    - Replaced the embedded quotation builder on `index.html` with a high-converting studio launcher card pointing to `quote.html`, and updated all navbar and footer CTAs.
  - **Quotation Builder Step 6 UI Polish & Navbar Clearance Fix:**
    - Resolved horizontal button clipping and truncation in Card 02 (`Instant Dispatch & Official Proposal`): converted `.qb-final-grid` from a cramped 2-column grid to a clean vertical stack where Card 01 (Couple Details) and Card 02 (Dispatch Actions) both enjoy 100% width with dedicated flex `.qb-action-row` rows (`Review & Download PDF`, `Direct Print`, `Copy Shareable Link`, `Copy Summary Text`).
    - Fixed bottom pinned bar (`.qb-nav-bar-fixed`) floating over content on `index.html`: restricted `.qb-nav-bar-fixed` via CSS so it displays only on the dedicated standalone studio page (`body.qb-standalone-page` on `quote.html`), keeping `index.html` completely unblocked and clean.
    - Eliminated duplicate WhatsApp buttons: on Step 6, the right sidebar now focuses cleanly on the price breakdown and PDF preview with an advisory notice, while Card 02 acts as the prominent primary WhatsApp dispatch hub.
    - Added `scroll-margin-top: 100px;` and `padding-top: 14px;` to `.qb-stepper`, and updated `scrollToQuotationSection()` in `js/quotation-builder.js` to scroll directly to `#quotation-builder-app` with 24px of clear margin below the sticky navbar.
    - Verified all 41 unit tests pass and verified visual state in browser subagent.







