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


