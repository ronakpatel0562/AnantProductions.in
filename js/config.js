/**
 * ANANT PRODUCTIONS — BUSINESS & PRICING CONFIGURATION
 * 
 * Centralized single source of truth for:
 * - Business profile & verified contact details
 * - Event categories & 3-tier package collections
 * - Centralized Add-on Catalogue (with IDs, pricing units, categories, permissions)
 * - Production crew roles & rates
 * - Promotional launch offers & coupon validation
 * - Gujarat service hubs & transparent travel policies
 * 
 * All prices are configurable here and calculate via js/pricing-engine.js.
 * Updated with healthy commercial margins giving room for custom client discounts.
 */

const ANANT_CONFIG = {
  business: {
    name: 'Anant Productions',
    tagline: 'Your Story. Your Emotions. Your Forever.',
    subTagline: 'Fine-art Gujarati wedding photography & cinematic films that preserve sacred traditions and heartfelt family moments across Gujarat.',
    phone: '+91 80000 88819',
    phoneRaw: '918000088819',
    email: 'weddings@anantproductions.in',
    instagram: '@anantproductions',
    instagramUrl: 'https://instagram.com/anantproductions',
    address: 'Bodakdev, Sindhu Bhavan Road, Ahmedabad, Gujarat — 380054',
    website: 'https://anantproductions.in',
    primaryHub: 'Ahmedabad',
    serviceCities: [
      'Ahmedabad',
      'Vadodara',
      'Surat',
      'Anand',
      'Rajkot',
      'Bharuch',
      'Gandhinagar',
      'Bhavnagar',
      'Jamnagar'
    ]
  },

  // Founding Couple Launch Offer
  launchOffer: {
    active: true,
    title: 'Celebrate Your Beginning With Anant Productions',
    badge: 'Founding Couple Launch Offer',
    price: '₹39,999',
    regularPrice: '₹49,999',
    savings: 'Save ₹10,000',
    discountAmount: 10000, // ₹49,999 Signature down to ₹39,999
    slotsTotal: 3,
    note: 'Introductory pricing limited to the first 3 bookings for 2026–2027 wedding seasons.',
    packageTitle: 'Signature Two-Day Photo + Cinema Package',
    crew: '1 Candid Photographer + 1 Cinematographer',
    hours: 'Up to 6 hours per day (2-day coverage)',
    deliverables: [
      '350–500 Master color-graded high-resolution photographs',
      'One 3–5 minute cinematic highlight film in 4K',
      'One short vertical 9:16 social media reel for WhatsApp & Instagram',
      'Private online gallery with instant family download access'
    ],
    ctaText: 'Claim Launch Offer via WhatsApp',
    waMessage: 'Hello Anant Productions! I saw your Founding Couple Launch Offer (₹39,999 for Signature Photo + Cinema). We are planning our wedding and would love to check date availability!'
  },

  // PRODUCTION CREW ROLES (For Step 4 crew configurator)
  crewRoles: [
    {
      id: 'photo_trad',
      name: 'Traditional Photographer',
      ratePerEvent: 9999,
      isPerDay: false,
      description: 'Stage portraits, family groups, and formal ceremony archives.'
    },
    {
      id: 'photo_candid',
      name: 'Candid Photographer',
      ratePerEvent: 9999,
      isPerDay: false,
      description: 'Unposed raw moments, genuine emotions, laughter, and tearful glances.'
    },
    {
      id: 'cinema_cam',
      name: 'Cinematographer (4K Cinema)',
      ratePerEvent: 12499,
      isPerDay: false,
      description: 'Stabilized gimbals, prime cinema glass, and artistic cinematic motion.'
    },
    {
      id: 'video_trad',
      name: 'Traditional Video Operator',
      ratePerEvent: 8499,
      isPerDay: false,
      description: 'Continuous tripod and shoulder documentary recording of all vidhis.'
    },
    {
      id: 'drone_pilot',
      name: 'Drone Aerial Operator',
      ratePerEvent: 7499,
      isPerDay: false,
      description: 'Licensed 4K drone cinematography. Subject to weather & venue airspace.'
    },
    {
      id: 'crew_assistant',
      name: 'Production Assistant / Lighting',
      ratePerEvent: 3000,
      isPerDay: false,
      description: 'Lighting support, wireless mic management, and gear coordination.'
    }
  ],

  // EVENT-SPECIFIC PACKAGES (Categories A to E)
  packageCategories: {
    wedding: {
      id: 'wedding',
      name: 'Two-Day Wedding',
      gujaratiName: 'લગ્ન પ્રસંગ (બે દિવસ)',
      tagline: 'Mandva, Pithi, Midnight Garba, Lagna Vidhi & Reception',
      defaultDays: 2,
      packages: [
        {
          id: 'pkg-wedding-essential',
          name: 'Essential Wedding',
          category: 'wedding',
          tier: 'essential',
          tag: 'TWO-DAY PHOTOGRAPHY',
          price: '₹29,999',
          priceRange: '₹29,999 – ₹34,999',
          indicativePrice: 29999,
          duration: 'Two-day coverage',
          standardDays: 2,
          crewText: '1 Dedicated Senior Photographer',
          baseCrew: { photo_trad: 1, photo_candid: 0, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours per day',
          summary: 'Ideal for intimate two-day Gujarati ceremonies focusing on authentic emotional stills and sacred Vedic rituals.',
          deliverables: [
            'Two-day coverage (up to 6 hours/day)',
            '1 Senior Traditional Photographer',
            'Approximately 300–400 master edited photographs',
            'Full ceremony stills: Mandva, Pithi, Garba, Mandap, and Vidaai',
            'High-resolution private online gallery with full print rights'
          ],
          exclusions: [
            'Cinematography / Video not included',
            'Drone coverage not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would love to check availability for the Essential Wedding Package (₹29,999).'
        },
        {
          id: 'pkg-wedding-signature',
          name: 'Signature Wedding',
          category: 'wedding',
          tier: 'signature',
          tag: 'MOST POPULAR FOR GUJARATI WEDDINGS',
          price: '₹49,999',
          priceRange: '₹49,999 – ₹59,999',
          indicativePrice: 49999,
          duration: 'Two-day coverage',
          standardDays: 2,
          featured: true,
          badge: 'Recommended',
          crewText: '1 Candid Photographer + 1 Master Cinematographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours per day',
          summary: 'The perfect harmony of emotional fine-art photography and 4K cinematic storytelling in one synchronized team.',
          deliverables: [
            'Two-day coverage (up to 6 hours/day)',
            '1 Senior Candid Photographer + 1 Master Cinematographer',
            'Approximately 350–500 master edited photographs',
            'One 3–5 minute cinematic highlight film in 4K with custom music',
            'One short vertical 9:16 social media reel for WhatsApp & Instagram',
            'Private high-speed online gallery with family downloads'
          ],
          exclusions: [
            'Traditional full-length documentary video not included (available as add-on)',
            'Printed album not included (available as add-on)'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 1
          },
          waMessage: 'Hello Anant Productions! We would love to check date availability for the Signature Wedding Package (₹49,999).'
        },
        {
          id: 'pkg-wedding-premium',
          name: 'Premium Wedding Story',
          category: 'wedding',
          tier: 'premium',
          tag: 'COMPREHENSIVE LUXURY COVERAGE',
          price: '₹74,999',
          priceRange: '₹74,999 – ₹89,999',
          indicativePrice: 74999,
          duration: 'Two-day coverage',
          standardDays: 2,
          crewText: '1 Senior Candid Photographer + 1 Senior Cinematographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 8 hours per day',
          summary: 'Extended daily hours to document every detail from early morning Mandva and Grah Shanti to late midnight Garba and Vidaai.',
          deliverables: [
            'Two-day coverage (up to 8 hours/day)',
            '1 Senior Candid Photographer + 1 Senior Cinematographer + Assistant',
            'Approximately 500–700 master edited photographs in full resolution',
            'Cinematic highlight film (4–6 minutes) with licensed sound design',
            'Two short vertical 9:16 social media reels for Instagram & WhatsApp',
            'Dedicated couple portraits session & extended family portrait setup',
            'Priority editing turnaround & private cloud delivery'
          ],
          exclusions: [
            'Drone coverage quoted separately based on venue permissions',
            'Printed heirloom album available as add-on'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 2,
            'addon-photo-couple-portrait': 1
          },
          waMessage: 'Hello Anant Productions! We are interested in the Premium Wedding Story Package (₹74,999) for our celebration.'
        }
      ]
    },

    prewed: {
      id: 'prewed',
      name: 'Pre-Wedding & Couple Shoot',
      gujaratiName: 'પ્રી-વેડિંગ શૂટ અને સિનેમા',
      tagline: 'Scenic Heritage Pols, Stepwells, Polo Forest & Romantic Resorts',
      defaultDays: 1,
      packages: [
        {
          id: 'pkg-prewed-essential',
          name: 'Essential Couple Shoot',
          category: 'prewed',
          tier: 'essential',
          tag: 'CONCEPT PORTRAITURE',
          price: '₹7,999',
          priceRange: '₹7,999 – ₹9,999',
          indicativePrice: 7999,
          duration: '1 Short Session (Up to 3 hrs)',
          standardDays: 1,
          crewText: '1 Senior Portrait Photographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 3 hours',
          summary: 'A relaxed, intimate photoshoot session at one local Ahmedabad or Gujarat scenic backdrop.',
          deliverables: [
            'One photoshoot session (up to 3 hours)',
            '1 Senior Creative Portrait Photographer',
            '25–35 Master color-graded fine-art portraits',
            '1 Scenic location (Old City Pols, Riverfront, or Stepwell)',
            'High-resolution digital delivery in private gallery'
          ],
          exclusions: [
            'Cinematic video film not included (available as add-on)',
            'Location entry fees or permissions borne by client'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to inquire about the Essential Couple Shoot (₹7,999).'
        },
        {
          id: 'pkg-prewed-signature',
          name: 'Signature Pre-Wedding',
          category: 'prewed',
          tier: 'signature',
          tag: 'EXTENDED PHOTO + REEL',
          price: '₹15,999',
          priceRange: '₹15,999 – ₹19,999',
          indicativePrice: 15999,
          duration: 'Half-Day Session (Up to 5 hrs)',
          standardDays: 1,
          featured: true,
          badge: 'Popular',
          crewText: '1 Senior Photographer + 1 Cinematographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Extended session across two locations with styled costume changes, fine-art portraits, and a cinematic reel.',
          deliverables: [
            'Half-day coverage across up to 2 locations',
            '1 Senior Photographer + 1 Cinematographer',
            '50–70 Master color-graded portraits',
            'One 60-second cinematic vertical 9:16 reel with trending romantic music',
            'Up to 3 outfit changes with creative direction'
          ],
          exclusions: [
            'Full cinematic narrative film not included (see Premium)',
            'Drone subject to airspace clearance'
          ],
          includedAddons: {
            'addon-reel-single': 1
          },
          waMessage: 'Hello Anant Productions! We are interested in the Signature Pre-Wedding Package (₹15,999).'
        },
        {
          id: 'pkg-prewed-premium',
          name: 'Premium Pre-Wedding Film',
          category: 'prewed',
          tier: 'premium',
          tag: 'CINEMATIC COUPLE FILM',
          price: '₹24,999',
          priceRange: '₹24,999 – ₹32,999',
          indicativePrice: 24999,
          duration: 'Full-Day Production (Up to 8 hrs)',
          standardDays: 1,
          crewText: '1 Lead Photographer + 1 Master Cinematographer + Assistant',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 8 hours (Sunrise to Golden Hour / Sunset)',
          summary: 'Full-day cinema production featuring narrative dialogue, multiple scenic vistas, aerial drone vistas, and a 2–3 minute film.',
          deliverables: [
            'Full-day concept shoot (sunrise to sunset lighting)',
            'Full coordinated production team with lighting support',
            '80–120 Color-graded master editorial portraits',
            'One 2–3 minute 4K cinematic concept film with couple dialogue audio',
            'Two vertical 9:16 Instagram & WhatsApp teaser reels',
            'Drone establishing sequence (where permitted by airspace)'
          ],
          exclusions: [
            'Outstation travel/stay beyond 100km quoted transparently',
            'Resort/palace shoot fees payable directly by couple'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 2,
            'addon-drone-venue': 1
          },
          waMessage: 'Hello Anant Productions! We would love to plan a Premium Pre-Wedding Film (₹24,999).'
        }
      ]
    },

    engagement: {
      id: 'engagement',
      name: 'Engagement & Sakar Pudo',
      gujaratiName: 'સગાઈ, સાકરપુડો અને ગોળધાણા',
      tagline: 'Ring Exchange, Gol Dhana & Family Blessings',
      defaultDays: 1,
      packages: [
        {
          id: 'pkg-engagement-essential',
          name: 'Essential Engagement',
          category: 'engagement',
          tier: 'essential',
          tag: 'STILL PHOTOGRAPHY',
          price: '₹9,999',
          priceRange: '₹9,999 – ₹12,999',
          indicativePrice: 9999,
          duration: 'Single Function (Up to 4 hrs)',
          standardDays: 1,
          crewText: '1 Senior Candid Photographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 4 hours',
          summary: 'Complete photography coverage for intimate engagement ceremonies, ring exchange, and family portraiture.',
          deliverables: [
            'Up to 4 hours dedicated coverage',
            '1 Senior Candid Photographer',
            '150–200 Color-graded high-resolution photos',
            'Complete coverage of Sakar Pudo, Gol Dhana & Ring Exchange',
            'High-speed digital delivery gallery'
          ],
          exclusions: [
            'Cinematography / Video not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to check availability for Essential Engagement (₹9,999).'
        },
        {
          id: 'pkg-engagement-signature',
          name: 'Signature Engagement',
          category: 'engagement',
          tier: 'signature',
          tag: 'PHOTO + CINEMATIC HIGHLIGHT',
          price: '₹18,999',
          priceRange: '₹18,999 – ₹22,999',
          indicativePrice: 18999,
          duration: 'Extended Function (Up to 5 hrs)',
          standardDays: 1,
          featured: true,
          badge: 'Most Booked',
          crewText: '1 Candid Photographer + 1 Cinematographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Both emotional photography and a 2–3 minute 4K cinematic film capturing the joy and family banter.',
          deliverables: [
            'Up to 5 hours coverage',
            '1 Senior Candid Photographer + 1 Master Cinematographer',
            '250–350 Master color-graded photographs',
            'One 2–3 minute cinematic highlight film in 4K',
            'One vertical social media reel for WhatsApp'
          ],
          exclusions: [
            'Full uncut ceremony archive video available as add-on'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 1
          },
          waMessage: 'Hello Anant Productions! We are planning our Engagement and would love the Signature package (₹18,999).'
        },
        {
          id: 'pkg-engagement-premium',
          name: 'Premium Engagement Gala',
          category: 'engagement',
          tier: 'premium',
          tag: 'EXPANDED CELEBRATION',
          price: '₹31,999',
          priceRange: '₹31,999 – ₹39,999',
          indicativePrice: 31999,
          duration: 'Full Evening / Gala (Up to 6 hrs)',
          standardDays: 1,
          crewText: '2 Photographers + 1 Cinematographer + Assistant',
          baseCrew: { photo_trad: 1, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 6 hours',
          summary: 'Designed for larger engagement celebrations with stage ceremonies, dance performances, and lavish family banquets.',
          deliverables: [
            'Up to 6 hours full gala coverage',
            '1 Traditional + 1 Candid Photographer + 1 Cinematographer',
            '400–500 Color-graded photographs',
            'Cinematic highlight film (3–4 minutes)',
            'Two vertical 9:16 social media reels',
            'Dedicated couple portrait session before guest arrival'
          ],
          exclusions: [
            'Drone coverage subject to venue ceiling/regulations'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 2,
            'addon-photo-couple-portrait': 1
          },
          waMessage: 'Hello Anant Productions! We are interested in the Premium Engagement Gala Package (₹31,999).'
        }
      ]
    },

    functions: {
      id: 'functions',
      name: 'Individual Functions',
      gujaratiName: 'વ્યક્તિગત પ્રસંગો (પીઠી, ગરબા, રિસેપ્શન)',
      tagline: 'Haldi, Mehendi, Garba, Reception, or Mandva Muhurat',
      defaultDays: 1,
      packages: [
        {
          id: 'pkg-fn-essential',
          name: 'Essential Function',
          category: 'functions',
          tier: 'essential',
          tag: 'INTIMATE EVENT',
          price: '₹9,999',
          priceRange: '₹9,999 – ₹12,999',
          indicativePrice: 9999,
          duration: 'Up to 4 hours',
          standardDays: 1,
          crewText: '1 Candid Photographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 4 hours',
          summary: 'Ideal for Haldi/Pithi, Mosalu, Mehndi afternoon, or intimate home pujas.',
          deliverables: [
            'Up to 4 hours coverage for 1 function',
            '1 Senior Candid Photographer',
            '150–250 Master edited photographs',
            'Full digital delivery gallery'
          ],
          exclusions: [
            'Cinematography not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to book the Essential Function coverage (₹9,999).'
        },
        {
          id: 'pkg-fn-signature',
          name: 'Signature Function (Garba / Sangeet)',
          category: 'functions',
          tier: 'signature',
          tag: 'PHOTO + CINEMA HIGHLIGHT',
          price: '₹18,999',
          priceRange: '₹18,999 – ₹24,999',
          indicativePrice: 18999,
          duration: 'Up to 5 hours',
          standardDays: 1,
          featured: true,
          badge: 'Best for Garba',
          crewText: '1 Candid Photographer + 1 Cinematographer',
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Specially tuned for high-energy Raas Garba nights, Sangeet dance performances, or wedding Receptions.',
          deliverables: [
            'Up to 5 hours coverage',
            '1 Candid Photographer + 1 Cinematographer',
            '250–350 Master edited photographs',
            'One 2–3 minute high-energy highlight film',
            'One vertical social media reel for WhatsApp'
          ],
          exclusions: [
            'Full uncut continuous video not included'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 1
          },
          waMessage: 'Hello Anant Productions! We would love to book the Signature Garba/Function package (₹18,999).'
        },
        {
          id: 'pkg-fn-premium',
          name: 'Premium Grand Function',
          category: 'functions',
          tier: 'premium',
          tag: 'FULL PRODUCTION',
          price: '₹28,999',
          priceRange: '₹28,999 – ₹34,999',
          indicativePrice: 28999,
          duration: 'Up to 6 hours',
          standardDays: 1,
          crewText: '2 Photographers + 1 Cinematographer',
          baseCrew: { photo_trad: 1, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours',
          summary: 'Expanded team coverage for lavish midnight Garba nights or formal Receptions with 500+ guests.',
          deliverables: [
            'Up to 6 hours coverage',
            '1 Traditional + 1 Candid Photographer + 1 Cinematographer',
            '400–550 Master edited photographs',
            'Cinematic highlight film with sound design',
            'Two vertical 9:16 social reels for instant sharing'
          ],
          exclusions: [
            'Drone subject to venue clearance'
          ],
          includedAddons: {
            'addon-cine-highlight': 1,
            'addon-reel-single': 2
          },
          waMessage: 'Hello Anant Productions! We are interested in the Premium Grand Function package (₹28,999).'
        }
      ]
    }
  },

  // CENTRALIZED ADD-ON CATALOGUE (Phase 3 Requirements)
  addOnCatalog: [
    // 1. PHOTOGRAPHY
    {
      id: 'addon-photo-trad',
      name: 'Traditional Photography Coverage',
      category: 'photography',
      categoryName: 'Photography',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 9999,
      description: 'Formal stage portraits, family groupings, and complete ritual documentation by a dedicated senior photographer.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-photo-candid',
      name: 'Additional Candid Photographer',
      category: 'photography',
      categoryName: 'Photography',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 9999,
      description: 'Captures spontaneous emotions, tears during Hasta Melap, laughter among cousins, and candid bridal portraits.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-photo-extra',
      name: 'Additional Supporting Photographer',
      category: 'photography',
      categoryName: 'Photography',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 8499,
      description: 'Ensures thorough simultaneous coverage for simultaneous bride and groom side rituals in different locations.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-photo-couple-portrait',
      name: 'Dedicated Couple Portrait Session',
      category: 'photography',
      categoryName: 'Photography',
      pricingMethod: 'per_session',
      pricingUnit: 'per session',
      defaultPrice: 3999,
      description: '45-minute focused couple portrait session with creative lighting assistance before the main ceremony.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-photo-family',
      name: 'Extended Family Portrait Coverage',
      category: 'photography',
      categoryName: 'Photography',
      pricingMethod: 'per_session',
      pricingUnit: 'per session',
      defaultPrice: 4499,
      description: 'Organized, respectful photo session honoring Baa-Dada, maternal/paternal elders, and extended family generations.',
      applicableCategories: ['wedding', 'engagement']
    },

    // 2. CINEMATOGRAPHY & VIDEO
    {
      id: 'addon-cine-cinematographer',
      name: 'Master Cinematographer (4K Cinema)',
      category: 'cinematography',
      categoryName: 'Cinematography & Video',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 12499,
      description: 'Dedicated cinema camera operator utilizing stabilized gimbals, cinematic prime lenses, and audio recording kits.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-cine-highlight',
      name: 'Cinematic Highlight Film (3–5 Min, 4K)',
      category: 'cinematography',
      categoryName: 'Cinematography & Video',
      pricingMethod: 'per_unit',
      pricingUnit: 'per film',
      defaultPrice: 9999,
      description: 'Emotionally edited 3–5 minute cinematic highlight film in 4K with personalized sound design and licensed music.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-cine-trad-video',
      name: 'Traditional Full-Length Video Archive',
      category: 'cinematography',
      categoryName: 'Cinematography & Video',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 8499,
      description: 'Continuous documentary-style recording of complete vidhis from start to finish, ideal for family archives.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-cine-extra-cam',
      name: 'Additional Video Camera & Operator',
      category: 'cinematography',
      categoryName: 'Cinematography & Video',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 8499,
      description: 'Second synchronized camera angle for key moments (e.g., bride entry, groom reception, and mandap vows).',
      applicableCategories: ['wedding', 'functions']
    },
    {
      id: 'addon-cine-multicam',
      name: 'Multi-Camera Video Setup',
      category: 'cinematography',
      categoryName: 'Cinematography & Video',
      pricingMethod: 'per_event',
      pricingUnit: 'per setup',
      defaultPrice: 14999,
      description: '3-camera coordinated setup with switcher and live audio feed, capturing every vantage point without blindspots.',
      applicableCategories: ['wedding', 'functions']
    },

    // 3. DRONE & SPECIAL PRODUCTION
    {
      id: 'addon-drone-shoot',
      name: '4K Drone Aerial Shoot',
      category: 'drone',
      categoryName: 'Drone & Aerial Production',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 7499,
      description: 'Cinematic sweeping aerial perspectives of venue, Jaan Agaman procession, and outdoor vidhis. (Subject to DGCA permissions, airspace, weather & venue feasibility).',
      applicableCategories: ['wedding', 'prewed', 'functions']
    },
    {
      id: 'addon-drone-extra',
      name: 'Additional Drone Coverage Session',
      category: 'drone',
      categoryName: 'Drone & Aerial Production',
      pricingMethod: 'per_session',
      pricingUnit: 'per session',
      defaultPrice: 4999,
      description: 'Extended drone battery flight time for nighttime Garba or second day festivities.',
      applicableCategories: ['wedding', 'functions']
    },
    {
      id: 'addon-drone-venue',
      name: 'Venue & Establishing Aerial Sequence',
      category: 'drone',
      categoryName: 'Drone & Aerial Production',
      pricingMethod: 'per_unit',
      pricingUnit: 'per sequence',
      defaultPrice: 3999,
      description: 'Short pre-event aerial sequence showcasing the venue architecture, floral mandap, and entrance gates.',
      applicableCategories: ['wedding', 'prewed']
    },
    {
      id: 'addon-special-cinema',
      name: 'Special Cinematic Couple Sequence',
      category: 'drone',
      categoryName: 'Drone & Aerial Production',
      pricingMethod: 'per_session',
      pricingUnit: 'per sequence',
      defaultPrice: 5999,
      description: 'Artistic slow-motion visual sequence choreographed before the reception with cinematic lighting effects.',
      applicableCategories: ['wedding', 'prewed']
    },

    // 4. SOCIAL MEDIA CONTENT
    {
      id: 'addon-reel-single',
      name: 'One Short Vertical Reel (9:16)',
      category: 'social',
      categoryName: 'Social Media Content',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 2499,
      description: '60-second high-definition vertical video edited with trending music for instant family WhatsApp forwarding and Instagram.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-bundle',
      name: 'Three-Reel Social Media Bundle',
      category: 'social',
      categoryName: 'Social Media Content',
      pricingMethod: 'per_unit',
      pricingUnit: 'bundle of 3',
      defaultPrice: 5999,
      description: 'Pack of three vertical reels: (1) Romantic couple teaser, (2) High-energy Garba / Sangeet, and (3) Emotional Vidaai / Rituals.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-extra',
      name: 'Additional Edited Vertical Reel',
      category: 'social',
      categoryName: 'Social Media Content',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 2199,
      description: 'Additional vertical highlight reel edited with personalized song request.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-same-day',
      name: 'Same-Day Edit Express Reel',
      category: 'social',
      categoryName: 'Social Media Content',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 4499,
      description: 'On-site video editor crafts and delivers an impactful 60-second reel within hours to share at the evening reception.',
      applicableCategories: ['wedding', 'engagement']
    },
    {
      id: 'addon-reel-express-highlight',
      name: 'Express 48-Hour Highlight Delivery',
      category: 'social',
      categoryName: 'Social Media Content',
      pricingMethod: 'per_unit',
      pricingUnit: 'express turnaround',
      defaultPrice: 6499,
      description: 'Priority editing queue to receive your complete 3–5 minute highlight film within 48 hours of the wedding.',
      applicableCategories: ['wedding']
    },

    // 5. INTERVIEWS & STORYTELLING
    {
      id: 'addon-interview-guest',
      name: 'Guest & Family Audio/Video Interviews',
      category: 'interviews',
      categoryName: 'Interviews & Storytelling',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 5999,
      description: 'Roving video journalist with 2 broadcast lapel mics and compact soft light captures spontaneous blessings and heartfelt advice from Baa-Dada, parents, and friends.',
      applicableCategories: ['wedding', 'engagement']
    },
    {
      id: 'addon-interview-couple',
      name: 'Couple Love Story Interview Session',
      category: 'interviews',
      categoryName: 'Interviews & Storytelling',
      pricingMethod: 'per_session',
      pricingUnit: 'per session',
      defaultPrice: 4999,
      description: 'A relaxed 45-minute sit-down interview with 2 cameras and studio audio recording where the couple shares how they met, their proposal, and future hopes.',
      applicableCategories: ['wedding', 'prewed']
    },
    {
      id: 'addon-interview-podcast',
      name: 'Podcast-Style Sit-Down Recording Setup',
      category: 'interviews',
      categoryName: 'Interviews & Storytelling',
      pricingMethod: 'per_session',
      pricingUnit: 'per session',
      defaultPrice: 9999,
      description: 'Premium broadcast-grade Shure microphone setup, multi-cam 4K angles, and custom lounge seating for an in-depth conversational couple or parent story.',
      applicableCategories: ['wedding', 'prewed']
    },
    {
      id: 'addon-interview-editing',
      name: 'Documentary Story Cut Integration',
      category: 'interviews',
      categoryName: 'Interviews & Storytelling',
      pricingMethod: 'per_unit',
      pricingUnit: 'per edit',
      defaultPrice: 3999,
      description: 'Weaves spoken vows and elder blessings seamlessly across the background score of the final wedding film.',
      applicableCategories: ['wedding']
    },

    // 6. POST-PRODUCTION & MASTERS
    {
      id: 'addon-post-advanced',
      name: 'Advanced Cinema Sound & Color Master',
      category: 'postproduction',
      categoryName: 'Post-Production',
      pricingMethod: 'per_unit',
      pricingUnit: 'per project',
      defaultPrice: 5999,
      description: 'Dedicated sound design, multi-track audio cleanup of Vedic mantras, and cinematic film-look color grade.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-post-additional-highlight',
      name: 'Extended Feature Film (12–18 Minutes)',
      category: 'postproduction',
      categoryName: 'Post-Production',
      pricingMethod: 'per_unit',
      pricingUnit: 'per film',
      defaultPrice: 7499,
      description: 'In-depth long-form cinematic chapter film documenting every phase of the two days without rushing.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-post-retouch',
      name: 'Fine-Art Editorial Photo Retouching (50 Extra Photos)',
      category: 'postproduction',
      categoryName: 'Post-Production',
      pricingMethod: 'per_unit',
      pricingUnit: '50 photos',
      defaultPrice: 3199,
      description: 'High-end frequency separation, skin tone balancing, and micro-blemish retouching on chosen portraits.',
      applicableCategories: ['wedding', 'prewed', 'engagement']
    },

    // 7. ALBUMS & PHYSICAL HEIRLOOMS
    {
      id: 'addon-album-standard',
      name: 'Printed Heirloom Wedding Album (30 Sheets / 60 Pages)',
      category: 'albums',
      categoryName: 'Albums & Physical Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'starting price',
      defaultPrice: 8999,
      description: 'Handcrafted hardbound 12x18 inch photo album on luster photo paper with personalized box. Curated layout of 150–200 photos.',
      applicableCategories: ['wedding', 'engagement']
    },
    {
      id: 'addon-album-premium',
      name: 'Royal Velvet Master Album Upgrade (40 Sheets / 80 Pages)',
      category: 'albums',
      categoryName: 'Albums & Physical Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per album',
      defaultPrice: 15999,
      description: 'Imported Italian velvet or bonded leather cover with laser-engraved gold typography, acrylic cameo window, and padded presentation briefcase.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-album-parent',
      name: 'Parent / Family Duplicate Keepsake Album',
      category: 'albums',
      categoryName: 'Albums & Physical Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per copy',
      defaultPrice: 5999,
      description: 'A compact 8x12 inch identical duplicate album printed for parents or in-laws.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-album-prints',
      name: 'Archival Fine-Art Print Box (25 Mounted Prints)',
      category: 'albums',
      categoryName: 'Albums & Physical Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per box',
      defaultPrice: 3999,
      description: '25 Master color-graded 6x8 inch fine-art archival prints mounted on acid-free mat board in a keepsake wooden box.',
      applicableCategories: ['wedding', 'prewed', 'engagement']
    },

    // 8. ADDITIONAL COVERAGE & LOGISTICS
    {
      id: 'addon-extra-hour',
      name: 'Extra Coverage Hour',
      category: 'coverage',
      categoryName: 'Coverage & Logistics',
      pricingMethod: 'per_hour',
      pricingUnit: 'per hour',
      defaultPrice: 2000,
      description: 'Hourly overtime rate applied when night Garba, extended Mandva, or morning Vidaai rituals continue past standard schedule.',
      applicableCategories: ['wedding', 'functions', 'engagement']
    },
    {
      id: 'addon-extra-day',
      name: 'Additional Wedding Day Coverage',
      category: 'coverage',
      categoryName: 'Coverage & Logistics',
      pricingMethod: 'per_day',
      pricingUnit: 'per day',
      defaultPrice: 24999,
      description: 'Full coordinated crew coverage for additional wedding days (e.g. Day 3 reception, standalone Sangeet day, etc.).',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-extra-function',
      name: 'Additional Standalone Function Coverage',
      category: 'coverage',
      categoryName: 'Coverage & Logistics',
      pricingMethod: 'per_event',
      pricingUnit: 'per function',
      defaultPrice: 9999,
      description: 'Coverage for standalone Mosalu, Mehndi afternoon, or morning Mandva held at a separate time or venue.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-travel-logistics',
      name: 'Travel & Accommodation Outside Ahmedabad',
      category: 'coverage',
      categoryName: 'Coverage & Logistics',
      pricingMethod: 'custom',
      pricingUnit: 'Transparent quote',
      defaultPrice: null, // Custom quoted
      description: 'Actuals-only travel and clean hotel lodging for destinations outside Ahmedabad (Vadodara, Surat, Rajkot, etc.). Quoted transparently with zero hidden markups.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    }
  ],

  // PROMOTIONAL CODES
  promoCodes: {
    FOUNDING: {
      code: 'FOUNDING',
      name: 'Founding Couple Launch Benefit',
      amount: 10000,
      description: '₹10,000 off Signature Photo + Cinema package for 2026–2027 bookings.'
    }
  },

  // DEFAULT SETTINGS
  additionalDayRate: 24999,
  extraHourRate: 2000,

  // PROCESS STEPS
  processSteps: [
    {
      step: '01',
      title: 'Configure Your Package',
      desc: 'Explore wedding, pre-wedding, or engagement tiers and tailor hours, crew, and deliverables in our live quotation builder.'
    },
    {
      step: '02',
      title: 'Receive Instant Breakdown',
      desc: 'See transparent itemized pricing immediately with zero hidden fees. Save, share with family, or download a formal quotation.'
    },
    {
      step: '03',
      title: 'Check Calendar & Confirm',
      desc: 'Send your customized selection directly to our team via WhatsApp to check Muhurat date availability and lock your booking.'
    },
    {
      step: '04',
      title: 'Celebrate Without Stress',
      desc: 'Relax and enjoy your sacred traditions with your family while our synchronized team immortalizes every emotion.'
    }
  ],

  // FREQUENTLY ASKED QUESTIONS
  faqs: [
    {
      q: 'Do you cover two-day Gujarati weddings?',
      a: 'Yes! Two-day weddings are our core specialty across Gujarat. Typically, Day 1 covers Mandva Muhurat, Grah Shanti, Pithi, and an evening Garba / Sangeet, while Day 2 covers Jaan Agaman, Pokhana, Mandap rituals (Hasta Melap, Mangal Phera), and the Reception or Vidaai. We customize daily hours to match your family’s exact muhurat timings.'
    },
    {
      q: 'Can we customize our package with add-ons and extra crew?',
      a: 'Yes, 100%. Our interactive Quotation Builder lets you add or remove candid photographers, cinematographers, drone coverage, 60-second vertical reels, heirloom printed albums, and extra coverage hours. The total updates in real time with complete price transparency.'
    },
    {
      q: 'What is included in the base package vs optional add-ons?',
      a: 'Each package tier clearly lists its inclusions. For example, our Signature Wedding includes both 1 candid photographer and 1 cinematographer, 350–500 master edited photos, a 3–5 min 4K highlight film, and 1 vertical reel. Add-ons already included in your chosen tier are marked "Included in Package" (₹0 extra) to avoid duplicate charges.'
    },
    {
      q: 'How does drone aerial coverage work and are there any restrictions?',
      a: 'Drone aerial footage provides breathtaking perspectives of venue entries and Baraat/Jaan processions. However, drone flights are strictly subject to local DGCA airspace classifications, weather conditions, venue ceiling limits, and operational safety. If a venue prohibits drone flights or weather is unfavorable, we discuss suitable alternatives.'
    },
    {
      q: 'Do you travel across Gujarat and outstation destinations?',
      a: 'Yes! While our primary studio hub is in Bodakdev, Ahmedabad, we regularly photograph weddings across Vadodara, Surat, Anand, Rajkot, Bharuch, Gandhinagar, Bhavnagar, and destination venues in Rajasthan. Travel and accommodation outside Ahmedabad are quoted openly at actual cost with zero hidden surcharges.'
    },
    {
      q: 'How do we check date availability and lock our Muhurat date?',
      a: 'Once you configure your quotation, click "Send Enquiry on WhatsApp" or "Request Formal Quotation". We check our calendar immediately and confirm availability within a few hours. Your date is officially blocked upon receipt of a token advance deposit.'
    },
    {
      q: 'What is your delivery timeline for photos and films?',
      a: 'We understand family excitement! Vertical 9:16 reels for WhatsApp and Instagram can be delivered within 24–48 hours. Master color-graded photo galleries are delivered within 3–4 weeks, and cinematic highlight films within 4–6 weeks.'
    },
    {
      q: 'Can we build our own package from scratch without selecting a preset plan?',
      a: 'Absolutely. In Step 3 of the Quotation Builder, simply select "Build Your Own Custom Collection". You can then handpick your exact crew size, coverage hours, deliverables, and add-ons tailored to your budget.'
    }
  ]
};

// Expose on global window object
if (typeof window !== 'undefined') {
  window.ANANT_CONFIG = ANANT_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANANT_CONFIG;
}
