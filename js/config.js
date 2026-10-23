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

  // OUR PHOTOGRAPHY PHILOSOPHY (Rules A, B & C)
  photographyPhilosophy: {
    headline: 'Our Photography Philosophy',
    quote: 'We believe in capturing genuine emotions, unscripted moments, and the true essence of your wedding rather than setting artificial limits on the number of pictures taken. Every meaningful ritual, family blessing, laughter, and tear will be thoroughly documented.',
    fullText: 'At Anant Productions, we believe wedding photography is an art, not a numbers game.\n\nEvery photograph deserves thoughtful consideration. Our team carefully reviews the captured moments, removes unnecessary, duplicate, and technically unusable images, and curates the photographs that genuinely preserve your story.\n\nWe deliver all curated, ultra-high-resolution RAW photographs after this quality-filtering process, along with the finest photographs handpicked by our team and enhanced through meticulous, world-class editing.\n\nEvery selected image receives the attention it deserves, with the goal of creating photographs that sparkle in your eyes and become treasured memories for a lifetime.\n\nWe focus on meaningful moments, exceptional image quality, and artistic editing rather than arbitrary photo counts.',
    rawDeliverable: 'All curated ultra-high-resolution RAW photographs, delivered after our team carefully removes unnecessary, duplicate, and technically unusable images.',
    editedDeliverable: 'Our team personally selects the photographs that best capture your emotions, relationships, and unforgettable moments. Each selected photograph receives thoughtful, world-class editing to bring out its beauty and artistic character.'
  },

  // COMPLIMENTARY EXPERIENCES (Reference PDF Section 4)
  complimentaryBenefits: [
    {
      id: 'comp-cloud-gallery',
      title: 'Private Cloud Family Gallery (1 Full Year)',
      description: 'High-speed, password-protected online digital gallery for your entire family across the globe with instant full-resolution download rights.',
      valueText: 'Complimentary Privilege',
      badge: 'Family Access'
    },
    {
      id: 'comp-sneak-peek',
      title: "Couple's Digital Sneak Peek within 48 Hours",
      description: 'Priority handpicked selection of beautifully color-graded preview photographs delivered within 48 hours to share your happiness with loved ones.',
      valueText: 'Complimentary Priority',
      badge: '48-Hour Delivery'
    },
    {
      id: 'comp-archival-drive',
      title: 'Archival Keepsake Wooden Drive & Presentation Box',
      description: 'Your complete curated RAW archive, master edited photographs, and 4K films preserved on an engraved wooden pen drive for lifetime family archiving.',
      valueText: 'Heirloom Keepsake',
      badge: 'Lifetime Archival'
    },
    {
      id: 'comp-artist-consultation',
      title: 'Direct Creative Consultation & Ritual Timeline Planning',
      description: 'Pre-wedding coordination with our lead visual director to align ceremony lighting, Vedic muhurat schedules, and emotional candid moments.',
      valueText: 'VIP Service',
      badge: 'Personalized'
    }
  ],

  // Founding Couple Launch Offer
  launchOffer: {
    active: true,
    title: 'Celebrate Your Beginning With Anant Productions',
    badge: 'Founding Couple Launch Offer',
    price: '₹50,000',
    regularPrice: '₹75,000',
    savings: 'Save ₹25,000',
    discountAmount: 25000, // ₹75,000 Signature down to ₹50,000
    slotsTotal: 3,
    note: 'Introductory pricing limited to the first 3 bookings for 2026–2027 wedding seasons.',
    packageTitle: 'Signature Two-Day Photo + Cinema Collection',
    servicesText: 'Candid Photography & Cinematic Wedding Filmmaking',
    hours: 'Up to 6 hours per day (2-day coverage)',
    deliverables: [
      'Curated ultra-high-resolution RAW photographs after quality filtering',
      'Handpicked, professionally edited master photographs with artistic color-grading',
      'One 3–5 minute cinematic highlight film in 4K',
      'One short vertical 9:16 social media reel for WhatsApp & Instagram',
      'Private online gallery with instant family download access'
    ],
    ctaText: 'Claim Launch Offer via WhatsApp',
    waMessage: 'Hello Anant Productions! I saw your Founding Couple Launch Offer (₹50,000 for Signature Photo + Cinema, Regular ₹75,000). We are planning our wedding and would love to check date availability!'
  },

  // COVERAGE SERVICES & STYLES (Customer-Facing Services — Rule A Compliant)
  crewRoles: [
    {
      id: 'photo_trad',
      name: 'Traditional Photography Coverage',
      serviceTitle: 'Traditional Photography',
      ratePerEvent: 15000,
      isPerDay: false,
      description: 'Stage portraits, family groupings, and complete sacred Vedic ritual documentation.'
    },
    {
      id: 'photo_candid',
      name: 'Candid Photography Coverage',
      serviceTitle: 'Candid Photography',
      ratePerEvent: 15000,
      isPerDay: false,
      description: 'Unposed raw moments, genuine emotions, laughter, and tearful glances.'
    },
    {
      id: 'cinema_cam',
      name: 'Cinematic Wedding Filmmaking',
      serviceTitle: 'Cinematic Filmmaking',
      ratePerEvent: 20000,
      isPerDay: false,
      description: 'Stabilized gimbals, prime cinema glass, ambient sound capture, and cinematic motion.'
    },
    {
      id: 'video_trad',
      name: 'Traditional Videography Coverage',
      serviceTitle: 'Traditional Videography',
      ratePerEvent: 12000,
      isPerDay: false,
      description: 'Continuous documentary recording of all vidhis from start to finish.'
    },
    {
      id: 'drone_pilot',
      name: 'Drone Aerial Cinematography',
      serviceTitle: 'Drone Cinematography',
      ratePerEvent: 12000,
      isPerDay: false,
      description: 'Licensed 4K drone cinematography. Subject to weather & venue airspace permissions.'
    },
    {
      id: 'crew_assistant',
      name: 'Production Lighting & Audio Support',
      serviceTitle: 'Lighting & Audio Support',
      ratePerEvent: 5000,
      isPerDay: false,
      description: 'On-location soft lighting, wireless audio mic coordination, and synchronized gear support.'
    }
  ],

  // CELEBRATION COVERAGE SCOPES (One-Side vs. Both-Sides)
  coverageScopes: [
    {
      id: 'one_side',
      name: 'One-Side Coverage (Bride OR Groom)',
      title: 'One-Side Coverage',
      subtitle: 'Bride or Groom Family Only',
      gujarati: 'એક પક્ષ કવરેજ (વર અથવા કન્યા પક્ષ)',
      badge: 'Standard',
      multiplier: 1.0,
      surcharge: 0,
      price: 0,
      icon: '👤',
      tagline: 'Single Family Focused Coverage',
      description: 'Dedicated visual team focused entirely on one family’s home, ceremonies, rituals, and celebration venue.'
    },
    {
      id: 'both_same_venue',
      name: 'Both Sides — Joint Venue',
      title: 'Both Sides — Joint Venue',
      subtitle: 'Same Location / Single Hall',
      gujarati: 'બંને પક્ષ — એક જ સ્થળ (કમ્બાઈન્ડ લગ્ન)',
      badge: 'With Extra Charge',
      multiplier: 1.4,
      surcharge: 0,
      price: 0,
      icon: '👥',
      tagline: 'Unified Multi-Angle Coverage',
      description: 'Both bride and groom families celebrating together at the same resort or hall. Coordinated multi-angle coverage for both families.'
    },
    {
      id: 'both_diff_venues',
      name: 'Both Sides — Different Locations',
      title: 'Both Sides — Different Locations',
      subtitle: 'Separate Residences / Venues',
      gujarati: 'બંને પક્ષ — અલગ-અલગ સ્થળો',
      badge: 'With Extra Charge',
      multiplier: 1.85,
      surcharge: 0,
      price: 0,
      icon: '📍',
      tagline: 'Parallel Synchronized Crews',
      description: 'Simultaneous parallel cinematography & photography crews deployed across separate groom and bride homes, independent morning rituals, and Jaan procession.'
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
          price: '₹40,000',
          originalPrice: '₹50,000',
          priceRange: 'Original: ₹50,000 • Special Rate: ₹40,000',
          indicativePrice: 40000,
          duration: 'Two-day coverage',
          standardDays: 2,
          services: ['Traditional Photography Coverage', 'Full Ceremony Documentation'],
          baseCrew: { photo_trad: 1, photo_candid: 0, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours per day',
          summary: 'Ideal for intimate two-day Gujarati ceremonies focusing on authentic emotional stills and sacred Vedic rituals.',
          deliverables: [
            'Two-day coverage (up to 6 hours/day)',
            'Traditional Photography & Sacred Ritual Documentation',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
            'Full ceremony stills: Mandva, Pithi, Garba, Mandap, and Vidaai',
            'High-resolution private online gallery with full print rights'
          ],
          exclusions: [
            'Cinematography / Video not included',
            'Drone coverage not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would love to check availability for the Essential Wedding Package (Special Rate: ₹40,000, Original: ₹50,000).'
        },
        {
          id: 'pkg-wedding-signature',
          name: 'Signature Wedding',
          category: 'wedding',
          tier: 'signature',
          tag: 'RECOMMENDED COLLECTION',
          price: '₹75,000',
          originalPrice: '₹1,00,000',
          priceRange: 'Original: ₹1,00,000 • Special Rate: ₹75,000',
          indicativePrice: 75000,
          duration: 'Two-day coverage',
          standardDays: 2,
          featured: true,
          badge: 'Recommended',
          services: ['Candid Photography Coverage', 'Cinematic Wedding Filmmaking'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours per day',
          summary: 'The perfect harmony of emotional fine-art photography and 4K cinematic storytelling in one synchronized team.',
          deliverables: [
            'Two-day coverage (up to 6 hours/day)',
            'Candid Photography & Cinematic Wedding Filmmaking in seamless harmony',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
            'One 3–5 minute cinematic highlight film in 4K with custom sound design',
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
          waMessage: 'Hello Anant Productions! We would love to check date availability for the Signature Wedding Package (Special Rate: ₹75,000, Original: ₹1,00,000).'
        },
        {
          id: 'pkg-wedding-premium',
          name: 'Premium Wedding Story',
          category: 'wedding',
          tier: 'premium',
          tag: 'COMPREHENSIVE LUXURY COVERAGE',
          price: '₹1,00,000',
          originalPrice: '₹1,50,000',
          priceRange: 'Original: ₹1,50,000 • Special Rate: ₹1,00,000',
          indicativePrice: 100000,
          duration: 'Two-day coverage',
          standardDays: 2,
          services: ['Candid Photography Coverage', 'Cinematic Wedding Filmmaking', 'Production Lighting Support'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 8 hours per day',
          summary: 'Extended daily hours to document every detail from early morning Mandva and Grah Shanti to late midnight Garba and Vidaai.',
          deliverables: [
            'Two-day coverage (up to 8 hours/day)',
            'Comprehensive Candid Photography & Cinematic Filmmaking with creative lighting support',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We are interested in the Premium Wedding Story Package (Special Rate: ₹1,00,000, Original: ₹1,50,000) for our celebration.'
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
          price: '₹15,000',
          originalPrice: '₹20,000',
          priceRange: 'Original: ₹20,000 • Special Rate: ₹15,000',
          indicativePrice: 15000,
          duration: '1 Short Session (Up to 3 hrs)',
          standardDays: 1,
          services: ['Creative Couple Portraiture', 'Fine-Art Color Grading'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 3 hours',
          summary: 'A relaxed, intimate photoshoot session at one local Ahmedabad or Gujarat scenic backdrop.',
          deliverables: [
            'One dedicated photoshoot session (up to 3 hours)',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Portraits with artistic fine-art grading',
            '1 Scenic location (Old City Pols, Riverfront, or Stepwell)',
            'High-resolution digital delivery in private gallery'
          ],
          exclusions: [
            'Cinematic video film not included (available as add-on)',
            'Location entry fees or permissions borne by client'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to inquire about the Essential Couple Shoot (Special Rate: ₹15,000, Original: ₹20,000).'
        },
        {
          id: 'pkg-prewed-signature',
          name: 'Signature Pre-Wedding',
          category: 'prewed',
          tier: 'signature',
          tag: 'EXTENDED PHOTO + REEL',
          price: '₹30,000',
          originalPrice: '₹45,000',
          priceRange: 'Original: ₹45,000 • Special Rate: ₹30,000',
          indicativePrice: 30000,
          duration: 'Half-Day Session (Up to 5 hrs)',
          standardDays: 1,
          featured: true,
          badge: 'Popular',
          services: ['Creative Couple Portraiture', 'Cinematic Social Media Reel'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Extended session across two locations with styled costume changes, fine-art portraits, and a cinematic reel.',
          deliverables: [
            'Half-day coverage across up to 2 locations',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Portraits with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We are interested in the Signature Pre-Wedding Package (Special Rate: ₹30,000, Original: ₹45,000).'
        },
        {
          id: 'pkg-prewed-premium',
          name: 'Premium Pre-Wedding Film',
          category: 'prewed',
          tier: 'premium',
          tag: 'CINEMATIC COUPLE FILM',
          price: '₹50,000',
          originalPrice: '₹75,000',
          priceRange: 'Original: ₹75,000 • Special Rate: ₹50,000',
          indicativePrice: 50000,
          duration: 'Full-Day Production (Up to 8 hrs)',
          standardDays: 1,
          services: ['Editorial Couple Portraiture', '4K Cinematic Concept Film', 'Drone Aerial Perspectives'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 8 hours (Sunrise to Golden Hour / Sunset)',
          summary: 'Full-day cinema production featuring narrative dialogue, multiple scenic vistas, aerial drone vistas, and a 2–3 minute film.',
          deliverables: [
            'Full-day concept shoot (sunrise to sunset lighting)',
            'Full coordinated production with creative lighting & audio direction',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Editorial Portraits with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We would love to plan a Premium Pre-Wedding Film (Special Rate: ₹50,000, Original: ₹75,000).'
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
          price: '₹20,000',
          originalPrice: '₹28,000',
          priceRange: 'Original: ₹28,000 • Special Rate: ₹20,000',
          indicativePrice: 20000,
          duration: 'Single Function (Up to 4 hrs)',
          standardDays: 1,
          services: ['Candid Engagement Photography', 'Sacred Ritual Documentation'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 4 hours',
          summary: 'Complete photography coverage for intimate engagement ceremonies, ring exchange, and family portraiture.',
          deliverables: [
            'Up to 4 hours dedicated coverage',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
            'Complete coverage of Sakar Pudo, Gol Dhana & Ring Exchange',
            'High-speed digital delivery gallery'
          ],
          exclusions: [
            'Cinematography / Video not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to check availability for Essential Engagement (Special Rate: ₹20,000, Original: ₹28,000).'
        },
        {
          id: 'pkg-engagement-signature',
          name: 'Signature Engagement',
          category: 'engagement',
          tier: 'signature',
          tag: 'PHOTO + CINEMATIC HIGHLIGHT',
          price: '₹35,000',
          originalPrice: '₹50,000',
          priceRange: 'Original: ₹50,000 • Special Rate: ₹35,000',
          indicativePrice: 35000,
          duration: 'Extended Function (Up to 5 hrs)',
          standardDays: 1,
          featured: true,
          badge: 'Most Booked',
          services: ['Candid Engagement Photography', 'Cinematic Highlight Film'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Both emotional photography and a 2–3 minute 4K cinematic film capturing the joy and family banter.',
          deliverables: [
            'Up to 5 hours coverage',
            'Candid Photography & Cinematic Filmmaking in synchronized harmony',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We are planning our Engagement and would love the Signature package (Special Rate: ₹35,000, Original: ₹50,000).'
        },
        {
          id: 'pkg-engagement-premium',
          name: 'Premium Engagement Gala',
          category: 'engagement',
          tier: 'premium',
          tag: 'EXPANDED CELEBRATION',
          price: '₹60,000',
          originalPrice: '₹85,000',
          priceRange: 'Original: ₹85,000 • Special Rate: ₹60,000',
          indicativePrice: 60000,
          duration: 'Full Evening / Gala (Up to 6 hrs)',
          standardDays: 1,
          services: ['Dual Photography Coverage', 'Cinematic Wedding Filmmaking', 'Lighting Support'],
          baseCrew: { photo_trad: 1, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 1 },
          hours: 'Up to 6 hours',
          summary: 'Designed for larger engagement celebrations with stage ceremonies, dance performances, and lavish family banquets.',
          deliverables: [
            'Up to 6 hours full gala coverage',
            'Dual Photography & Cinematic Filmmaking with creative lighting coordination',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We are interested in the Premium Engagement Gala Package (Special Rate: ₹60,000, Original: ₹85,000).'
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
          price: '₹15,000',
          originalPrice: '₹20,000',
          priceRange: 'Original: ₹20,000 • Special Rate: ₹15,000',
          indicativePrice: 15000,
          duration: 'Up to 4 hours',
          standardDays: 1,
          services: ['Candid Function Photography', 'Ritual Stills'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 0, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 4 hours',
          summary: 'Ideal for Haldi/Pithi, Mosalu, Mehndi afternoon, or intimate home pujas.',
          deliverables: [
            'Up to 4 hours coverage for 1 function',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
            'Full digital delivery gallery'
          ],
          exclusions: [
            'Cinematography not included'
          ],
          includedAddons: {},
          waMessage: 'Hello Anant Productions! We would like to book the Essential Function coverage (Special Rate: ₹15,000, Original: ₹20,000).'
        },
        {
          id: 'pkg-fn-signature',
          name: 'Signature Function (Garba / Sangeet)',
          category: 'functions',
          tier: 'signature',
          tag: 'PHOTO + CINEMA HIGHLIGHT',
          price: '₹30,000',
          originalPrice: '₹45,000',
          priceRange: 'Original: ₹45,000 • Special Rate: ₹30,000',
          indicativePrice: 30000,
          duration: 'Up to 5 hours',
          standardDays: 1,
          featured: true,
          badge: 'Best for Garba',
          services: ['Candid Function Photography', 'High-Energy Cinematic Highlight Film'],
          baseCrew: { photo_trad: 0, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 5 hours',
          summary: 'Specially tuned for high-energy Raas Garba nights, Sangeet dance performances, or wedding Receptions.',
          deliverables: [
            'Up to 5 hours coverage',
            'Candid Photography & Cinematic Filmmaking in synchronized motion',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We would love to book the Signature Garba/Function package (Special Rate: ₹30,000, Original: ₹45,000).'
        },
        {
          id: 'pkg-fn-premium',
          name: 'Premium Grand Function',
          category: 'functions',
          tier: 'premium',
          tag: 'FULL PRODUCTION',
          price: '₹50,000',
          originalPrice: '₹75,000',
          priceRange: 'Original: ₹75,000 • Special Rate: ₹50,000',
          indicativePrice: 50000,
          duration: 'Up to 6 hours',
          standardDays: 1,
          services: ['Dual Photography Coverage', 'Cinematic Wedding Filmmaking'],
          baseCrew: { photo_trad: 1, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 },
          hours: 'Up to 6 hours',
          summary: 'Expanded team coverage for lavish midnight Garba nights or formal Receptions with 500+ guests.',
          deliverables: [
            'Up to 6 hours coverage',
            'Comprehensive Dual Photography & Cinematic Filmmaking coverage',
            'Curated Ultra-High-Resolution RAW Photographs (all quality-filtered moments)',
            'Handpicked, Professionally Edited Master Photographs with artistic color grading',
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
          waMessage: 'Hello Anant Productions! We are interested in the Premium Grand Function package (Special Rate: ₹50,000, Original: ₹75,000).'
        }
      ]
    }
  },

  // CENTRALIZED ADD-ON CATALOGUE (Product Deliverables, Keepsakes & Enhancements)
  addOnCatalog: [
    // 1. ALBUMS & PHYSICAL HEIRLOOMS
    {
      id: 'addon-album-standard',
      name: 'Printed Heirloom Wedding Album (30 Sheets / 60 Pages)',
      category: 'albums',
      categoryName: 'Heirloom Albums & Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'starting price',
      defaultPrice: 15000,
      description: 'Handcrafted hardbound 12x18 inch photo album on imported luster/silk photo paper with matching keepsake box and panoramic lay-flat binding.',
      applicableCategories: ['wedding', 'engagement']
    },
    {
      id: 'addon-album-premium',
      name: 'Royal Velvet Master Album Upgrade (40 Sheets / 80 Pages)',
      category: 'albums',
      categoryName: 'Heirloom Albums & Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per album',
      defaultPrice: 25000,
      description: 'Imported Italian velvet or bonded leather cover with laser-engraved gold typography, acrylic cameo window, and padded presentation briefcase.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-album-parent',
      name: 'Parent / Family Duplicate Keepsake Album',
      category: 'albums',
      categoryName: 'Heirloom Albums & Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per copy',
      defaultPrice: 9999,
      description: 'A compact 8x12 inch identical duplicate heirloom album printed for parents or in-laws.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-album-prints',
      name: 'Archival Fine-Art Print Box (25 Mounted Prints)',
      category: 'albums',
      categoryName: 'Heirloom Albums & Keepsakes',
      pricingMethod: 'per_unit',
      pricingUnit: 'per box',
      defaultPrice: 6999,
      description: '25 Master color-graded 6x8 inch fine-art archival prints mounted on acid-free mat board in a handcrafted wooden keepsake box.',
      applicableCategories: ['wedding', 'prewed', 'engagement']
    },

    // 2. SOCIAL MEDIA & VERTICAL REELS
    {
      id: 'addon-reel-single',
      name: 'One Short Vertical Reel (9:16)',
      category: 'social',
      categoryName: 'Social Media & Reels',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 4500,
      description: '60-second high-definition vertical video edited with trending music for instant family WhatsApp forwarding and Instagram.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-bundle',
      name: 'Three-Reel Social Media Bundle',
      category: 'social',
      categoryName: 'Social Media & Reels',
      pricingMethod: 'per_unit',
      pricingUnit: 'bundle of 3',
      defaultPrice: 11999,
      description: 'Pack of three vertical reels: (1) Romantic couple teaser, (2) High-energy Garba / Sangeet, and (3) Emotional Vidaai / Rituals.',
      applicableCategories: ['wedding', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-extra',
      name: 'Additional Edited Vertical Reel',
      category: 'social',
      categoryName: 'Social Media & Reels',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 3999,
      description: 'Additional vertical highlight reel edited with personalized song request.',
      applicableCategories: ['wedding', 'prewed', 'engagement', 'functions']
    },
    {
      id: 'addon-reel-same-day',
      name: 'Same-Day Edit Express Reel',
      category: 'social',
      categoryName: 'Social Media & Reels',
      pricingMethod: 'per_unit',
      pricingUnit: 'per reel',
      defaultPrice: 9999,
      description: 'On-site video editor crafts and delivers an impactful 60-second reel within hours to premier on stage at the evening reception.',
      applicableCategories: ['wedding', 'engagement']
    },
    {
      id: 'addon-reel-express-highlight',
      name: 'Express 48-Hour Highlight Delivery',
      category: 'social',
      categoryName: 'Social Media & Reels',
      pricingMethod: 'per_unit',
      pricingUnit: 'express turnaround',
      defaultPrice: 12500,
      description: 'Priority editing queue to receive your complete 3–5 minute highlight film within 48 hours of the wedding celebration.',
      applicableCategories: ['wedding']
    },

    // 3. INTERVIEWS & STORYTELLING
    {
      id: 'addon-interview-guest',
      name: 'Guest & Family Audio/Video Interviews',
      category: 'interviews',
      categoryName: 'Interviews & Storytelling',
      pricingMethod: 'per_event',
      pricingUnit: 'per event',
      defaultPrice: 9999,
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
      defaultPrice: 8500,
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
      defaultPrice: 18000,
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
      defaultPrice: 6500,
      description: 'Weaves spoken vows and elder blessings seamlessly across the background score of the final wedding film.',
      applicableCategories: ['wedding']
    },

    // 4. POST-PRODUCTION & STORAGE
    {
      id: 'addon-post-ssd-drive',
      name: '4K Master SSD Archival Hard Drive',
      category: 'postproduction',
      categoryName: 'Post-Production & Masters',
      pricingMethod: 'per_unit',
      pricingUnit: 'per 1TB drive',
      defaultPrice: 8999,
      description: 'Shockproof 1TB external solid-state drive preloaded with all uncompressed master footage, RAW photo archives, and master cinema exports.',
      applicableCategories: ['wedding', 'prewed']
    },
    {
      id: 'addon-post-advanced',
      name: 'Advanced Cinema Sound & Color Master',
      category: 'postproduction',
      categoryName: 'Post-Production & Masters',
      pricingMethod: 'per_unit',
      pricingUnit: 'per project',
      defaultPrice: 9999,
      description: 'Dedicated sound design, multi-track audio cleanup of Vedic mantras, and cinematic film-look color grade.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-post-additional-highlight',
      name: 'Extended Feature Film (12–18 Minutes)',
      category: 'postproduction',
      categoryName: 'Post-Production & Masters',
      pricingMethod: 'per_unit',
      pricingUnit: 'per film',
      defaultPrice: 15000,
      description: 'In-depth long-form cinematic chapter film documenting every phase of the celebration without rushing.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-cine-highlight',
      name: 'Cinematic 4K Highlight Film (3–5 Minutes)',
      category: 'postproduction',
      categoryName: 'Post-Production & Masters',
      pricingMethod: 'per_unit',
      pricingUnit: 'per film',
      defaultPrice: 15000,
      description: 'A 3–5 minute cinematic wedding film color-graded in 4K with synchronized Vedic audio, speech highlights, and cinematic music.',
      applicableCategories: ['wedding']
    },
    {
      id: 'addon-post-retouch',
      name: 'Fine-Art Editorial Photo Retouching (Curated Set)',
      category: 'postproduction',
      categoryName: 'Post-Production & Masters',
      pricingMethod: 'per_unit',
      pricingUnit: 'per collection',
      defaultPrice: 5999,
      description: 'High-end frequency separation, skin tone balancing, and micro-blemish retouching on chosen portraits.',
      applicableCategories: ['wedding', 'prewed', 'engagement']
    },

    // 5. ADDITIONAL COVERAGE & OVERTIME
    {
      id: 'addon-extra-hour',
      name: 'Extra Coverage Hour',
      category: 'coverage',
      categoryName: 'Coverage & Overtime',
      pricingMethod: 'per_hour',
      pricingUnit: 'per hour',
      defaultPrice: 4000,
      description: 'Hourly overtime rate applied when night Garba, extended Mandva, or morning Vidaai rituals continue past standard schedule.',
      applicableCategories: ['wedding', 'functions', 'engagement']
    },
    {
      id: 'addon-travel-logistics',
      name: 'Outstation Travel & Lodging Coordination',
      category: 'coverage',
      categoryName: 'Coverage & Overtime',
      pricingMethod: 'custom',
      pricingUnit: 'Actuals only',
      defaultPrice: null,
      description: 'Transparent travel tickets and clean hotel accommodation arranged at actuals with zero hidden agency surcharges.',
      applicableCategories: ['wedding', 'prewed', 'engagement']
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
  additionalDayRate: 35000,
  extraHourRate: 4000,

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
      q: 'Can we customize our package with add-ons and extra coverage?',
      a: 'Yes, 100%. Our interactive Quotation Builder lets you select candid photography, cinematic filmmaking, drone aerials, 60-second vertical reels, heirloom printed albums, and extra coverage hours. The total updates in real time with complete price transparency.'
    },
    {
      q: 'What is included in the base package vs optional add-ons?',
      a: 'Each collection clearly communicates its deliverables. For example, our Signature Wedding includes both candid photography and cinematic filmmaking, all curated ultra-high-resolution RAW photographs, handpicked master edited photographs, a 3–5 min 4K highlight film, and 1 vertical reel. Add-ons already included in your chosen tier are marked "Included in Package" (₹0 extra) to avoid duplicate charges.'
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
      q: 'Can we customize our chosen wedding or celebration package?',
      a: 'Absolutely. Select your preferred curated package in the Quotation Builder and easily tailor it with optional add-ons, extra coverage hours, heirloom albums, and drone aerials.'
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
