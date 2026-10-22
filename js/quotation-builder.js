/**
 * ANANT PRODUCTIONS — INTERACTIVE WEDDING QUOTATION BUILDER
 * 
 * Multi-step luxury service configurator with:
 * - Real-time state management
 * - Synchronization with js/config.js and js/pricing-engine.js
 * - Seamless Step 1-8 navigation with persistence
 * - URL Hash shareability (#quote=...)
 * - LocalStorage draft recovery
 * - Formal branded quotation modal & print/PDF ready view
 * - High-converting WhatsApp message dispatch
 * - Telemetry & privacy-safe analytics
 */

(function () {
  'use strict';

  // Ensure config & engine exist
  const config = window.ANANT_CONFIG;
  const engine = window.ANANT_PRICING_ENGINE;

  if (!config || !engine) {
    console.error('Anant Quotation Builder requires ANANT_CONFIG and ANANT_PRICING_ENGINE.');
    return;
  }

  // Analytics Event Bus (Privacy-safe)
  window.trackAnantEvent = function (eventName, payload) {
    try {
      // Safe logging without PII
      const safePayload = { ...payload };
      delete safePayload.names;
      delete safePayload.phone;
      delete safePayload.email;
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: eventName, ...safePayload });
      }
      console.log(`[Anant Analytics] ${eventName}:`, safePayload);
    } catch (e) {
      // silent
    }
  };

  // Builder State
  const defaultState = {
    currentStep: 1,
    referenceId: engine.generateQuoteRef(),
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: {
      eventType: 'Two-Day Gujarati Wedding',
      days: 2,
      dates: '',
      isDateFlexible: false,
      city: 'Ahmedabad',
      venue: '',
      hoursPerDay: 6,
      functions: ['Mandva / Grah Shanti', 'Haldi / Pithi', 'Garba / Sangeet Night', 'Lagna / Mandap Ceremony', 'Reception']
    },
    crew: {
      photo_trad: 0,
      photo_candid: 1,
      cinema_cam: 1,
      video_trad: 0,
      drone_pilot: 0,
      crew_assistant: 0
    },
    selectedAddons: {}, // addonId -> quantity
    applyLaunchOffer: true, // Default to founding offer if eligible
    promoCode: '',
    customer: {
      names: '',
      phone: '',
      email: '',
      preferredContact: 'WhatsApp',
      notes: ''
    }
  };

  // Master State Instance
  let builderState = { ...defaultState };

  // Try recovering from URL hash or localStorage
  function loadInitialState() {
    // 1. Try URL Hash
    if (window.location.hash && window.location.hash.includes('quote=')) {
      const match = window.location.hash.match(/quote=([^&]+)/);
      if (match && match[1]) {
        const decoded = engine.deserializeStateFromHash(match[1]);
        if (decoded) {
          builderState = { ...builderState, ...decoded };
          builderState.currentStep = 6; // Jump straight to review
          return;
        }
      }
    }

    // 2. Try localStorage draft
    try {
      const saved = localStorage.getItem('anant_builder_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.eventCategory) {
          builderState = { ...builderState, ...parsed };
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  function saveDraftToStorage() {
    try {
      localStorage.setItem('anant_builder_draft', JSON.stringify(builderState));
    } catch (e) {
      // Ignore
    }
  }

  // DOM Elements cache
  let container = null;

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    container = document.getElementById('quotation-builder-app');
    if (!container) return;

    loadInitialState();
    renderBuilder();
    setupGlobalPackageCustomizers();

    // Listen to hash changes for deep linking
    window.addEventListener('hashchange', () => {
      if (window.location.hash.includes('quote=')) {
        loadInitialState();
        renderBuilder();
      }
    });
  });

  // Global listeners for "Customize Package" buttons on the landing page
  function setupGlobalPackageCustomizers() {
    document.querySelectorAll('[data-customize-package]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pkgId = btn.getAttribute('data-customize-package');
        const catId = btn.getAttribute('data-category') || 'wedding';
        setPackageAndScroll(catId, pkgId);
      });
    });
  }

  // Public API to jump into the builder
  window.customizePackageInBuilder = function (catId, pkgId) {
    setPackageAndScroll(catId, pkgId);
  };

  // Smooth scroll to the start of the quotation builder section
  function scrollToQuotationSection() {
    requestAnimationFrame(() => {
      const section = document.getElementById('quotation-builder');
      if (!section) return;
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 70;
      const targetY = window.pageYOffset + section.getBoundingClientRect().top - navHeight - 16;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    });
  }

  function setPackageAndScroll(catId, pkgId) {
    builderState.eventCategory = catId;
    builderState.packageId = pkgId;
    
    // Sync base crew and inclusions for this package
    const catPackages = config.packageCategories[catId]?.packages || [];
    const pkg = catPackages.find(p => p.id === pkgId);
    if (pkg) {
      if (pkg.baseCrew) {
        builderState.crew = { ...pkg.baseCrew };
      }
      builderState.eventDetails.days = pkg.standardDays || (catId === 'wedding' ? 2 : 1);
    }

    builderState.currentStep = 4; // Jump to crew/add-ons configuration
    renderBuilder();
    scrollToQuotationSection();

    window.trackAnantEvent('package_selected', { packageId: pkgId, category: catId });
  }

  // RENDER MASTER CONTAINER
  function renderBuilder() {
    if (!container) return;

    // Recalculate quotation
    const quotation = engine.calculateQuotation(config, builderState);

    container.innerHTML = `
      <div class="qb-layout">
        <!-- Main Form Configurator (Left / Center) -->
        <div class="qb-main-col">
          <!-- Multi-Step Progress Tracker -->
          <nav class="qb-stepper" aria-label="Quotation builder steps">
            ${renderStepperTabs()}
          </nav>

          <!-- Active Step Viewport -->
          <div class="qb-step-content" id="qb-active-step">
            ${renderCurrentStep(quotation)}
          </div>
        </div>

        <!-- Sticky Live Quotation Summary Card (Right Column) -->
        <aside class="qb-summary-col">
          ${renderSummaryCard(quotation)}
        </aside>
      </div>

      <!-- Mobile Sticky Action Drawer (Slides from bottom on phones) -->
      <div class="qb-mobile-bar" id="qb-mobile-bar">
        <div class="qb-mobile-bar-inner">
          <div class="qb-mobile-price">
            <span class="qb-mobile-price-label">Estimated Total</span>
            <span class="qb-mobile-price-val">${quotation.estimatedTotalFormatted}</span>
          </div>
          <div class="qb-mobile-actions">
            <button type="button" class="btn btn-outline-gold qb-btn-breakdown" id="btn-toggle-mobile-sheet">
              View Breakdown
            </button>
            <button type="button" class="btn btn-gold qb-btn-next-mobile" id="btn-mobile-next">
              ${builderState.currentStep === 8 ? 'Send WhatsApp' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Mount or update formal modal directly on document.body for root viewport stacking context
    let formalModal = document.getElementById('qb-formal-modal');
    if (!formalModal) {
      formalModal = document.createElement('div');
      formalModal.className = 'qb-formal-modal';
      formalModal.id = 'qb-formal-modal';
      formalModal.setAttribute('role', 'dialog');
      formalModal.setAttribute('aria-modal', 'true');
      formalModal.setAttribute('aria-label', 'Formal Quotation Document');
      formalModal.style.display = 'none';
      document.body.appendChild(formalModal);
    }
    formalModal.innerHTML = `
      <button class="modal-close-btn" id="qb-close-formal-modal" aria-label="Close formal quotation view">&#x2715;</button>
      <div class="qb-formal-sheet">
        <div id="qb-formal-document-wrap">
          ${renderFormalQuotationDocument(quotation)}
        </div>
      </div>
    `;

    attachEventHandlers(quotation);
    saveDraftToStorage();
  }

  // STEP TABS
  function renderStepperTabs() {
    const steps = [
      { num: 1, title: 'Event Type' },
      { num: 2, title: 'Details' },
      { num: 3, title: 'Base Plan' },
      { num: 4, title: 'Crew' },
      { num: 5, title: 'Add-ons' },
      { num: 6, title: 'Review' },
      { num: 7, title: 'Your Info' },
      { num: 8, title: 'Submit' }
    ];

    return steps.map(s => {
      const isCurrent = s.num === builderState.currentStep;
      const isPast = s.num < builderState.currentStep;
      return `
        <button type="button" class="qb-step-pill ${isCurrent ? 'active' : ''} ${isPast ? 'completed' : ''}" 
          data-goto-step="${s.num}" 
          aria-current="${isCurrent ? 'step' : 'false'}"
          title="Step ${s.num}: ${s.title}">
          <span class="qb-step-num">${isPast ? '✓' : '0' + s.num}</span>
          <span class="qb-step-name">${s.title}</span>
        </button>
      `;
    }).join('');
  }

  // RENDER CURRENT ACTIVE STEP
  function renderCurrentStep(quotation) {
    switch (builderState.currentStep) {
      case 1: return renderStep1_EventType();
      case 2: return renderStep2_EventDetails();
      case 3: return renderStep3_BasePackage();
      case 4: return renderStep4_CrewConfig();
      case 5: return renderStep5_DeliverablesAddons();
      case 6: return renderStep6_ReviewQuotation(quotation);
      case 7: return renderStep7_CustomerDetails();
      case 8: return renderStep8_SubmitAndShare(quotation);
      default: return renderStep1_EventType();
    }
  }

  // ================= STEP 1: EVENT TYPE =================
  function renderStep1_EventType() {
    const categories = [
      { id: 'wedding', name: 'Two-Day Wedding', guj: 'લગ્ન પ્રસંગ (બે દિવસ)', desc: 'Mandva, Pithi, Garba, Hasta Melap & Reception', icon: '💍', badge: 'Most Popular' },
      { id: 'prewed', name: 'Pre-Wedding & Couple Film', guj: 'પ્રી-વેડિંગ શૂટ', desc: 'Concept couple portraiture and cinematic romance in scenic backdrops', icon: '📸', badge: 'High-Demand' },
      { id: 'engagement', name: 'Engagement / Sakar Pudo', guj: 'સગાઈ અને ગોળધાણા', desc: 'Ring ceremony, family blessings, and evening dinner celebration', icon: '✨', badge: null },
      { id: 'functions', name: 'Individual Functions', guj: 'વ્યક્તિગત પ્રસંગો', desc: 'Standalone Haldi/Pithi, Mehndi, Midnight Garba, or Reception', icon: '🪔', badge: null },
      { id: 'custom', name: 'Build Your Own Package', guj: 'તમારું મનપસંદ પેકેજ', desc: 'Custom multi-day celebration configured from scratch', icon: '🎨', badge: 'Flexible' }
    ];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 01 OF 08 &bull; SELECT EVENT TYPE</span>
        <h3 class="qb-step-title">What celebration are we documenting?</h3>
        <p class="qb-step-desc">
          Choose your primary event category. You can combine multiple functions and add bespoke requirements in the next steps.
        </p>
      </div>

      <div class="qb-category-grid" role="radiogroup" aria-label="Event category selection">
        ${categories.map(cat => {
          const isSelected = (cat.id === 'custom') 
            ? (builderState.packageId === 'custom') 
            : (builderState.eventCategory === cat.id && builderState.packageId !== 'custom');
          return `
            <div class="qb-cat-card ${isSelected ? 'selected' : ''}" data-select-category="${cat.id}" role="radio" aria-checked="${isSelected}" tabindex="0">
              <div class="qb-cat-top">
                <span class="qb-cat-icon">${cat.icon}</span>
                ${cat.badge ? `<span class="qb-cat-badge">${cat.badge}</span>` : ''}
              </div>
              <h4 class="qb-cat-name">${cat.name}</h4>
              <span class="qb-cat-gujarati">${cat.guj}</span>
              <p class="qb-cat-desc">${cat.desc}</p>
              <div class="qb-cat-action">
                <span class="qb-radio-mark">${isSelected ? '● Selected' : '○ Select'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qb-step-footer">
        <div></div>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="2">
          Continue to Event Details →
        </button>
      </div>
    `;
  }

  // ================= STEP 2: EVENT DETAILS =================
  function renderStep2_EventDetails() {
    const d = builderState.eventDetails;
    const functionsList = [
      'Chandlo Matli / Sakar Pudo',
      'Mandva / Ganesh Sthapana',
      'Grah Shanti & Pithi',
      'Mehndi Afternoon',
      'Mameru / Mosalu',
      'Raas Garba & Sangeet Night',
      'Jaan Agaman & Ponkvu',
      'Lagna / Hasta Melap Vidhi',
      'Reception Celebration',
      'Pre-Wedding Shoot'
    ];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 02 OF 08 &bull; EVENT DETAILS &amp; SCHEDULE</span>
        <h3 class="qb-step-title">Tell us about your celebration schedule</h3>
        <p class="qb-step-desc">
          Configure celebration duration, city, and sacred rituals. For multi-day weddings, daily hours and locations are adjusted with zero hidden surprises.
        </p>
      </div>

      <div class="form-grid">
        <!-- Days Selector -->
        <div class="form-group">
          <label class="form-label" for="qb-input-days">Total Celebration Days</label>
          <select id="qb-input-days" class="form-input" style="background-color: var(--canvas-elevated);">
            <option value="1" ${Number(d.days) === 1 ? 'selected' : ''}>1 Day Celebration</option>
            <option value="2" ${Number(d.days) === 2 ? 'selected' : ''}>2 Days (Standard Gujarati Wedding)</option>
            <option value="3" ${Number(d.days) === 3 ? 'selected' : ''}>3 Days (Mandva + Garba + Wedding)</option>
            <option value="4" ${Number(d.days) === 4 ? 'selected' : ''}>4+ Days (Grand / Royal Destination)</option>
          </select>
          <span style="font-size: 0.78rem; color: var(--mute); margin-top: 4px;">Standard wedding packages include 2 full days of coverage.</span>
        </div>

        <!-- City & Venue -->
        <div class="form-group">
          <label class="form-label" for="qb-input-city">Wedding City / Hub</label>
          <select id="qb-input-city" class="form-input" style="background-color: var(--canvas-elevated);">
            ${config.business.serviceCities.map(city => `
              <option value="${city}" ${d.city === city ? 'selected' : ''}>${city}, Gujarat</option>
            `).join('')}
            <option value="Destination / Other" ${d.city === 'Destination / Other' ? 'selected' : ''}>Destination / Other Location</option>
          </select>
        </div>

        <!-- Venue Name -->
        <div class="form-group">
          <label class="form-label" for="qb-input-venue">Venue or Resort Name (Optional)</label>
          <input type="text" id="qb-input-venue" class="form-input" placeholder="e.g. Belvedere Club, YMCA, Club O7, etc." value="${d.venue || ''}">
        </div>

        <!-- Dates & Flexibility -->
        <div class="form-group">
          <label class="form-label" for="qb-input-dates">Wedding Date / Muhurat Month</label>
          <input type="text" id="qb-input-dates" class="form-input" placeholder="e.g. 14–15 Dec 2026…" value="${d.dates || ''}" ${d.isDateFlexible ? 'disabled' : ''}>
          <label class="checkbox-toggle-row" style="margin-top: 8px;">
            <input type="checkbox" id="qb-check-date-flexible" ${d.isDateFlexible ? 'checked' : ''}>
            <span>Date not finalized yet / Consulting family Panditji</span>
          </label>
        </div>

        <!-- Approximate Daily Hours -->
        <div class="form-group full-width">
          <label class="form-label" for="qb-range-hours">Approximate Daily Coverage Hours: <strong id="qb-val-hours" style="color: var(--gold-light);">${d.hoursPerDay || 6} Hours/Day</strong></label>
          <input type="range" id="qb-range-hours" min="4" max="12" step="1" value="${d.hoursPerDay || 6}" style="width: 100%; accent-color: var(--gold-primary);">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--mute); margin-top: 4px;">
            <span>4 hrs (Intimate)</span>
            <span>6 hrs (Standard)</span>
            <span>8 hrs (Full Day)</span>
            <span>12 hrs (Non-stop Morning to Midnight)</span>
          </div>
        </div>

        <!-- Functions to be covered (Multi-select) -->
        <div class="form-group full-width">
          <span class="function-pills-label">Sacred Functions to be Documented (Select all that apply):</span>
          <div class="function-pills-wrap">
            ${functionsList.map(fn => {
              const isChecked = d.functions && d.functions.includes(fn);
              return `
                <button type="button" class="function-pill ${isChecked ? 'selected' : ''}" data-toggle-function="${fn}">
                  ${fn}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="1">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="3">Select Base Package →</button>
      </div>
    `;
  }

  // ================= STEP 3: BASE PACKAGE SELECTION =================
  function renderStep3_BasePackage() {
    const cat = builderState.eventCategory;
    const catData = config.packageCategories[cat] || config.packageCategories.wedding;
    const packages = catData.packages || [];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 03 OF 08 &bull; CHOOSE BASE PACKAGE</span>
        <h3 class="qb-step-title">Select your foundational collection for ${catData.name}</h3>
        <p class="qb-step-desc">
          Choose a recommended tier below or select "Build Your Own" to handpick every deliverable. All packages can be freely customized with add-ons in Step 5.
        </p>
      </div>

      <div class="qb-package-cards-grid">
        ${packages.map(pkg => {
          const isSelected = builderState.packageId === pkg.id;
          return `
            <div class="package-card qb-tier-card ${pkg.featured ? 'featured' : ''} ${isSelected ? 'selected' : ''}" data-select-package="${pkg.id}">
              ${pkg.badge ? `<span class="package-ribbon">${pkg.badge}</span>` : ''}
              <div class="package-header">
                <span class="package-tag">${pkg.tag}</span>
                <h4 class="package-title" style="font-size: 1.3rem;">${pkg.name}</h4>
                <div class="package-price-wrap" style="margin: 12px 0 6px;">
                  <span class="package-price" style="font-size: 1.85rem; color: var(--gold-light);">${pkg.price}</span>
                </div>
                <div class="package-price-range">${pkg.priceRange}</div>
                <div class="package-hours-badge">⏱ ${pkg.duration} &bull; ${pkg.hours}</div>
                <p class="package-scope" style="margin-top: 10px; font-size: 0.85rem;">${pkg.summary}</p>
              </div>

              <div class="package-crew" style="margin: 14px 0; font-size: 0.84rem;">
                <strong>Included Crew:</strong> ${pkg.crewText}
              </div>

              <ul class="package-features" style="font-size: 0.82rem; margin-bottom: 18px;">
                ${pkg.deliverables.map(del => `
                  <li class="package-feature">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${del}</span>
                  </li>
                `).join('')}
              </ul>

              <button type="button" class="btn ${isSelected ? 'btn-gold' : 'btn-outline-gold'} qb-btn-choose-pkg" style="width: 100%; justify-content: center;">
                ${isSelected ? '✓ Selected Tier' : 'Select This Tier'}
              </button>
            </div>
          `;
        }).join('')}

        <!-- Custom Build Your Own Option -->
        <div class="package-card qb-tier-card ${builderState.packageId === 'custom' ? 'selected' : ''}" data-select-package="custom">
          <div class="package-header">
            <span class="package-tag">100% BESPOKE CONFIGURATION</span>
            <h4 class="package-title" style="font-size: 1.3rem;">Build Your Own</h4>
            <div class="package-price-wrap" style="margin: 12px 0 6px;">
              <span class="package-price" style="font-size: 1.85rem; color: var(--gold-light);">From ₹0 Base</span>
            </div>
            <div class="package-price-range">Pay strictly for what you choose</div>
            <div class="package-hours-badge">⏱ Fully Configurable</div>
            <p class="package-scope" style="margin-top: 10px; font-size: 0.85rem;">
              Start with a clean slate. Handpick exact photographer numbers, cinematographers, drone, albums, and reels in the next steps.
            </p>
          </div>
          <div class="package-crew" style="margin: 14px 0; font-size: 0.84rem;">
            <strong>Crew:</strong> Configured dynamically
          </div>
          <ul class="package-features" style="font-size: 0.82rem; margin-bottom: 18px;">
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Zero bundled assumptions or unwanted add-ons</span></li>
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Select exact candid vs traditional artist balance</span></li>
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Itemized transparency down to each reel and print</span></li>
          </ul>
          <button type="button" class="btn ${builderState.packageId === 'custom' ? 'btn-gold' : 'btn-outline-gold'} qb-btn-choose-pkg" style="width: 100%; justify-content: center;">
            ${builderState.packageId === 'custom' ? '✓ Selected Bespoke' : 'Build Custom Plan'}
          </button>
        </div>
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="2">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="4">Customize Service Team →</button>
      </div>
    `;
  }

  // ================= STEP 4: CREW CONFIGURATION =================
  function renderStep4_CrewConfig() {
    // Current package base crew
    const catPackages = config.packageCategories[builderState.eventCategory]?.packages || [];
    const basePkg = catPackages.find(p => p.id === builderState.packageId);
    const baseCrewMap = (basePkg && basePkg.baseCrew) ? basePkg.baseCrew : {};

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 04 OF 08 &bull; CUSTOMIZE SERVICE TEAM</span>
        <h3 class="qb-step-title">Configure your photography &amp; cinema crew</h3>
        <p class="qb-step-desc">
          Ensure comprehensive coverage without blindspots. Staffing already included in your selected base tier is marked "Included (₹0 Extra)". You can increment additional artists as needed.
        </p>
      </div>

      <div class="qb-crew-grid">
        ${config.crewRoles.map(role => {
          const baseCount = baseCrewMap[role.id] || 0;
          const currentCount = (builderState.crew[role.id] !== undefined) ? builderState.crew[role.id] : baseCount;
          const extraCount = Math.max(0, currentCount - baseCount);
          const isIncludedInBase = baseCount > 0;

          return `
            <div class="qb-crew-card">
              <div class="qb-crew-info">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h4 class="qb-crew-name">${role.name}</h4>
                  ${isIncludedInBase ? `<span class="qb-included-tag">${baseCount} Included in Tier</span>` : ''}
                </div>
                <p class="qb-crew-desc">${role.description}</p>
                <div class="qb-crew-rate">Rate for Extra: <strong>${engine.formatINR(role.ratePerEvent)}</strong> / event</div>
              </div>

              <div class="qb-stepper-control" aria-label="${role.name} quantity">
                <button type="button" class="qb-step-btn" data-crew-decrement="${role.id}" aria-label="Decrease ${role.name}" ${currentCount <= 0 ? 'disabled' : ''}>−</button>
                <span class="qb-step-val" id="crew-val-${role.id}">${currentCount}</span>
                <button type="button" class="qb-step-btn" data-crew-increment="${role.id}" aria-label="Increase ${role.name}">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="package-transparency-note" style="margin-top: 24px;">
        💡 <strong>Minimum Recommended Staffing:</strong> For two-day Gujarati celebrations with 250+ guests, we recommend at least 1 Candid Photographer, 1 Traditional Photographer, and 1 Cinematographer to ensure simultaneous coverage of ritual stage and family moments.
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="3">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="5">Select Deliverables &amp; Add-ons →</button>
      </div>
    `;
  }

  // ================= STEP 5: DELIVERABLES & ADD-ONS =================
  function renderStep5_DeliverablesAddons() {
    const catPackages = config.packageCategories[builderState.eventCategory]?.packages || [];
    const basePkg = catPackages.find(p => p.id === builderState.packageId);
    const includedAddons = (basePkg && basePkg.includedAddons) ? basePkg.includedAddons : {};

    // Filter categories
    const categories = [
      { id: 'all', label: 'All Services' },
      { id: 'photography', label: 'Photography' },
      { id: 'cinematography', label: 'Cinema & Video' },
      { id: 'drone', label: 'Drone Aerials' },
      { id: 'social', label: 'Reels & Social' },
      { id: 'interviews', label: 'Interviews & Podcasts' },
      { id: 'postproduction', label: 'Editing & Masters' },
      { id: 'albums', label: 'Heirloom Albums' },
      { id: 'coverage', label: 'Additional Hours & Travel' }
    ];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 05 OF 08 &bull; DELIVERABLES &amp; ADD-ON CATALOGUE</span>
        <h3 class="qb-step-title">Enhance your package with optional deliverables</h3>
        <p class="qb-step-desc">
          Add reels, printed albums, drone aerials, guest interviews, or extra coverage hours. Items already covered in your tier are marked "Included". Live pricing calculates instantly.
        </p>
      </div>

      <!-- Addon Category Filter Tabs -->
      <div class="gallery-filters qb-addon-filters" role="tablist">
        ${categories.map((c, idx) => `
          <button type="button" class="filter-btn ${idx === 0 ? 'active' : ''}" data-addon-filter="${c.id}" role="tab">
            ${c.label}
          </button>
        `).join('')}
      </div>

      <!-- Add-on Cards Grid -->
      <div class="qb-addons-grid" id="qb-addons-catalogue-wrap">
        ${config.addOnCatalog.map(addon => {
          const includedQty = includedAddons[addon.id] || 0;
          const userQty = builderState.selectedAddons[addon.id] || 0;
          const totalQty = Math.max(userQty, includedQty);
          const isIncluded = (includedQty > 0 && userQty <= includedQty);
          const isAdded = (userQty > 0);
          const isCustom = (addon.pricingMethod === 'custom' || addon.defaultPrice === null);

          return `
            <div class="qb-addon-card ${isIncluded ? 'status-included' : ''} ${isAdded ? 'status-added' : ''}" data-addon-category="${addon.category}">
              <div class="qb-addon-top">
                <span class="qb-addon-cat-tag">${addon.categoryName}</span>
                ${isIncluded ? `<span class="qb-included-pill">Included in Tier (${includedQty}x)</span>` : ''}
              </div>

              <h4 class="qb-addon-title">${addon.name}</h4>
              <p class="qb-addon-desc">${addon.description}</p>

              <div class="qb-addon-bottom">
                <div class="qb-addon-price-tag">
                  <span class="qb-addon-amount">${isCustom ? 'Custom Quote' : engine.formatINR(addon.defaultPrice)}</span>
                  <span class="qb-addon-unit">/ ${addon.pricingUnit}</span>
                </div>

                <div class="qb-stepper-control" aria-label="${addon.name} selector">
                  <button type="button" class="qb-step-btn" data-addon-decrement="${addon.id}" aria-label="Decrease ${addon.name}" ${totalQty <= 0 ? 'disabled' : ''}>−</button>
                  <span class="qb-step-val" id="addon-val-${addon.id}">${totalQty}</span>
                  <button type="button" class="qb-step-btn" data-addon-increment="${addon.id}" aria-label="Increase ${addon.name}">+</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="4">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="6">Review Custom Quotation →</button>
      </div>
    `;
  }

  // ================= STEP 6: REVIEW QUOTATION =================
  function renderStep6_ReviewQuotation(quotation) {
    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 06 OF 08 &bull; REVIEW CUSTOM QUOTATION</span>
        <h3 class="qb-step-title">Your Itemized Celebration Quotation</h3>
        <p class="qb-step-desc">
          Review every service, crew member, and deliverable. Everything is 100% transparent with zero hidden fees.
        </p>
      </div>

      <div class="qb-review-card">
        <div class="qb-review-header">
          <div>
            <span class="qb-review-ref">Reference: <strong>${quotation.referenceId}</strong></span>
            <h4 class="qb-review-pkg-name">${quotation.basePackageName}</h4>
            <div class="qb-review-meta">
              <span>📍 ${quotation.eventDetails.city}</span> &bull; 
              <span>🗓️ ${quotation.eventDetails.dates}</span> &bull; 
              <span>⏳ ${quotation.eventDetails.days} Day(s)</span>
            </div>
          </div>
          <div class="qb-review-status-pill">
            ${quotation.status}
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="qb-table-wrap">
          <table class="qb-table">
            <thead>
              <tr>
                <th style="text-align: left;">Service / Deliverable</th>
                <th style="text-align: center;">Category</th>
                <th style="text-align: center;">Quantity / Units</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.lineItems.map(item => `
                <tr>
                  <td>
                    <div class="qb-item-name">${item.name}</div>
                    ${item.description ? `<div class="qb-item-sub">${item.description}</div>` : ''}
                  </td>
                  <td style="text-align: center;">
                    <span class="qb-badge-sm">${item.category}</span>
                  </td>
                  <td style="text-align: center;">
                    ${item.quantity} ${item.unit}
                    ${item.isIncluded ? `<span class="qb-included-text"><br>(Included in Tier)</span>` : ''}
                  </td>
                  <td style="text-align: right; font-weight: 600;">
                    ${item.isIncluded ? '<span style="color: #86efac;">Included (₹0)</span>' : (item.isCustomQuote ? '<span style="color: var(--gold-light);">Custom Quote</span>' : engine.formatINR(item.totalPrice))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;">Subtotal:</td>
                <td style="text-align: right;">${quotation.subtotalFormatted}</td>
              </tr>
              ${quotation.discountAmount > 0 ? `
                <tr style="color: #86efac;">
                  <td colspan="3" style="text-align: right;">${quotation.appliedDiscount?.name || 'Discount / Savings'}:</td>
                  <td style="text-align: right;">-${quotation.discountFormatted}</td>
                </tr>
              ` : ''}
              <tr class="qb-total-row">
                <td colspan="3" style="text-align: right;">Estimated Total:</td>
                <td style="text-align: right; font-size: 1.25rem; color: var(--gold-light);">${quotation.estimatedTotalFormatted}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="qb-quote-notices">
          <ul>
            ${quotation.notes.map(note => `<li>• ${note}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="5">← Edit Services</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="7">Enter Contact Info →</button>
      </div>
    `;
  }

  // ================= STEP 7: CUSTOMER CONTACT =================
  function renderStep7_CustomerDetails() {
    const c = builderState.customer;
    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 07 OF 08 &bull; YOUR CONTACT DETAILS</span>
        <h3 class="qb-step-title">Where should we send your formal quotation?</h3>
        <p class="qb-step-desc">
          Provide your WhatsApp number so we can check calendar availability and send your personalized quotation summary.
        </p>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="qb-cust-names">Couple Names / Your Name *</label>
          <input type="text" id="qb-cust-names" class="form-input" placeholder="e.g. Priyanshi &amp; Harsh…" value="${c.names || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="qb-cust-phone">WhatsApp Number *</label>
          <input type="tel" id="qb-cust-phone" class="form-input" placeholder="+91 98765 XXXXX…" value="${c.phone || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="qb-cust-email">Email Address (Optional)</label>
          <input type="email" id="qb-cust-email" class="form-input" placeholder="weddings@yourdomain.com…" value="${c.email || ''}">
        </div>

        <div class="form-group">
          <label class="form-label" for="qb-cust-contact-pref">Preferred Contact Method</label>
          <select id="qb-cust-contact-pref" class="form-input" style="background-color: var(--canvas-elevated);">
            <option value="WhatsApp" ${c.preferredContact === 'WhatsApp' ? 'selected' : ''}>WhatsApp Message (Fastest)</option>
            <option value="Phone Call" ${c.preferredContact === 'Phone Call' ? 'selected' : ''}>Direct Phone Call</option>
            <option value="Email" ${c.preferredContact === 'Email' ? 'selected' : ''}>Official Email</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label class="form-label" for="qb-cust-notes">Special Rituals, Vision or Questions (Optional)</label>
          <textarea id="qb-cust-notes" class="form-textarea" placeholder="Tell us about unique family customs, Panditji muhurat requirements, or decor vision…">${c.notes || ''}</textarea>
        </div>
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="6">← Back to Review</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="8">Finalize &amp; Submit Inquiry →</button>
      </div>
    `;
  }

  // ================= STEP 8: SUBMIT & ACTIONS =================
  function renderStep8_SubmitAndShare(quotation) {
    const waUrl = getWhatsAppUrl(quotation);

    return `
      <div class="qb-step-header" style="text-align: center;">
        <span class="qb-step-kicker" style="color: var(--gold-light);">✨ STEP 08 OF 08 &bull; READY TO DISPATCH</span>
        <h3 class="qb-step-title" style="margin: 0 auto 12px; max-width: 650px;">Your Custom Wedding Quotation is Ready</h3>
        <p class="qb-step-desc" style="margin: 0 auto 24px; max-width: 600px;">
          Reference ID: <strong style="color: var(--gold-light);">${quotation.referenceId}</strong> &bull; Estimated Total: <strong style="color: var(--gold-light); font-size: 1.15rem;">${quotation.estimatedTotalFormatted}</strong>
        </p>
      </div>

      <div class="qb-action-cards-grid">
        <!-- 1. Send via WhatsApp -->
        <div class="qb-action-card featured">
          <div class="qb-action-icon">💬</div>
          <h4 class="qb-action-title">Send Inquiry via WhatsApp</h4>
          <p class="qb-action-desc">
            Directly forwards your full itemized package, dates, and requirements to Anant Productions on WhatsApp for immediate date verification.
          </p>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp qb-action-btn" id="btn-qb-whatsapp-send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Send Quotation on WhatsApp
          </a>
        </div>

        <!-- 2. Formal Quotation View & Print -->
        <div class="qb-action-card">
          <div class="qb-action-icon">📄</div>
          <h4 class="qb-action-title">Download / Print PDF Quotation</h4>
          <p class="qb-action-desc">
            Open or print an official PDF quotation with Anant Productions branding, deliverables, terms, and studio details.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px;">
            <button type="button" class="btn btn-gold qb-action-btn" id="btn-qb-print-direct" style="flex: 1; min-width: 170px; justify-content: center; padding: 12px 16px;">
              🖨️ Download / Print PDF
            </button>
            <button type="button" class="btn btn-outline-gold qb-action-btn" id="btn-qb-open-formal" style="flex: 1; min-width: 140px; justify-content: center; padding: 12px 16px;">
              👁️ View Full Quotation
            </button>
          </div>
        </div>

        <!-- 3. Shareable Link -->
        <div class="qb-action-card">
          <div class="qb-action-icon">🔗</div>
          <h4 class="qb-action-title">Share with Partner / Family</h4>
          <p class="qb-action-desc">
            Copy a customized link that instantly loads this exact package configuration on your fiancé’s or parents’ devices.
          </p>
          <button type="button" class="btn btn-outline-gold qb-action-btn" id="btn-qb-copy-link">
            Copy Shareable Link
          </button>
        </div>

        <!-- 4. Copy Summary -->
        <div class="qb-action-card">
          <div class="qb-action-icon">📋</div>
          <h4 class="qb-action-title">Copy Text Breakdown</h4>
          <p class="qb-action-desc">
            Copies a neat, formatted summary of services and prices to your clipboard for family discussion.
          </p>
          <button type="button" class="btn btn-outline-gold qb-action-btn" id="btn-qb-copy-summary">
            Copy Summary Text
          </button>
        </div>
      </div>

      <!-- Quick Feedback Toast -->
      <div id="qb-toast" class="qb-toast" style="display: none;" role="status"></div>

      <div class="qb-step-footer" style="margin-top: 36px;">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="7">← Edit Contact Info</button>
        <button type="button" class="btn btn-outline-gold" data-step-goto="1">↺ Start New Quotation</button>
      </div>
    `;
  }

  // ================= STICKY SUMMARY CARD =================
  function renderSummaryCard(quotation) {
    return `
      <div class="qb-summary-card">
        <div class="qb-sum-header">
          <span class="qb-sum-tag">LIVE QUOTATION ESTIMATOR</span>
          <h4 class="qb-sum-title">${quotation.basePackageName}</h4>
          <div class="qb-sum-ref">Ref: ${quotation.referenceId}</div>
        </div>

        <div class="qb-sum-scope">
          <div class="qb-sum-scope-row">
            <span>📍 City:</span>
            <strong>${quotation.eventDetails.city}</strong>
          </div>
          <div class="qb-sum-scope-row">
            <span>⏳ Days:</span>
            <strong>${quotation.eventDetails.days} Day(s)</strong>
          </div>
          <div class="qb-sum-scope-row">
            <span>🗓️ Date:</span>
            <strong>${quotation.eventDetails.dates || 'To be finalized'}</strong>
          </div>
        </div>

        <hr class="qb-sum-hr">

        <div class="qb-sum-items-list">
          <div class="qb-sum-item-row header">
            <span>Selected Inclusions &amp; Add-ons:</span>
            <span>Units</span>
          </div>
          ${quotation.lineItems.map(item => `
            <div class="qb-sum-item-row ${item.isIncluded ? 'included' : ''}">
              <span class="qb-sum-item-name">${item.name}</span>
              <span class="qb-sum-item-val">${item.isIncluded ? 'Included' : (item.isCustomQuote ? 'Custom' : engine.formatINR(item.totalPrice))}</span>
            </div>
          `).join('')}
        </div>

        <hr class="qb-sum-hr">

        <div class="qb-sum-breakdown">
          <div class="qb-sum-breakdown-row">
            <span>Subtotal:</span>
            <span>${quotation.subtotalFormatted}</span>
          </div>
          ${quotation.discountAmount > 0 ? `
            <div class="qb-sum-breakdown-row discount">
              <span>${quotation.appliedDiscount?.name || 'Discount'}:</span>
              <span>-${quotation.discountFormatted}</span>
            </div>
          ` : ''}
          <div class="qb-sum-total-row">
            <span>Estimated Total:</span>
            <span class="qb-sum-total-amount">${quotation.estimatedTotalFormatted}</span>
          </div>
        </div>

        <div class="qb-sum-ctas">
          <a href="${getWhatsAppUrl(quotation)}" target="_blank" rel="noopener" class="btn btn-whatsapp qb-sum-btn-wa" id="btn-summary-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Send Quotation on WhatsApp
          </a>

          <button type="button" class="btn btn-outline-gold qb-sum-btn-share" id="btn-summary-share-link">
            🔗 Share Quotation Link
          </button>
        </div>

        <div class="qb-sum-legal">
          Transparent estimate. Booking confirmed strictly upon date calendar verification and advance token receipt.
        </div>
      </div>
    `;
  }

  // ================= FORMAL QUOTATION DOCUMENT =================
  function renderFormalQuotationDocument(quotation) {
    const biz = config.business;
    const cust = quotation.customer;
    const evt = quotation.eventDetails;

    return `
      <div class="formal-doc">
        <!-- Top Branded Header -->
        <div class="formal-doc-header">
          <div class="formal-doc-brand">
            <img src="anant_logo.png" alt="Anant Productions Logo" class="formal-doc-logo">
            <div>
              <h2 class="formal-doc-title">ANANT PRODUCTIONS</h2>
              <p class="formal-doc-tagline">Fine-Art Gujarati Wedding Cinematography &amp; Photography</p>
              <div class="formal-doc-address">
                ${biz.address}<br>
                Phone &amp; WhatsApp: ${biz.phone} &bull; Email: ${biz.email}
              </div>
            </div>
          </div>
          <div class="formal-doc-meta">
            <div class="formal-doc-meta-badge">PROPOSED ESTIMATE</div>
            <div class="formal-doc-ref">Ref: <strong>${quotation.referenceId}</strong></div>
            <div class="formal-doc-date">Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div class="formal-doc-validity">Validity: 30 Days</div>
          </div>
        </div>

        <hr class="formal-doc-hr">

        <!-- Client & Event Info Table -->
        <div class="formal-doc-info-grid">
          <div class="formal-doc-info-box">
            <h4>Prepared For:</h4>
            <p>
              <strong>${cust.names || 'Honored Couple / Family'}</strong><br>
              WhatsApp: ${cust.phone || 'Provided upon inquiry'}<br>
              ${cust.email ? `Email: ${cust.email}<br>` : ''}
              Preferred Contact: ${cust.preferredContact || 'WhatsApp'}
            </p>
          </div>
          <div class="formal-doc-info-box">
            <h4>Celebration Details:</h4>
            <p>
              <strong>City / Venue:</strong> ${evt.city}${evt.venue ? ' (' + evt.venue + ')' : ''}<br>
              <strong>Celebration Dates:</strong> ${evt.dates}<br>
              <strong>Duration:</strong> ${evt.days} Day(s) &bull; ~${evt.approxHoursPerDay} hrs/day<br>
              <strong>Package:</strong> ${quotation.basePackageName}
            </p>
          </div>
        </div>

        <!-- Itemized Line Items -->
        <div class="formal-doc-table-wrap">
          <table class="formal-doc-table">
            <thead>
              <tr>
                <th style="width: 50%;">Service Description &amp; Scope</th>
                <th style="width: 15%; text-align: center;">Category</th>
                <th style="width: 15%; text-align: center;">Quantity / Unit</th>
                <th style="width: 20%; text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.lineItems.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<div style="font-size: 0.8rem; color: #52525b; margin-top: 2px;">${item.description}</div>` : ''}
                  </td>
                  <td style="text-align: center; font-size: 0.82rem;">${item.category}</td>
                  <td style="text-align: center; font-size: 0.85rem;">
                    ${item.quantity} ${item.unit}
                    ${item.isIncluded ? '<br><small style="color: #15803d;">(Included in Tier)</small>' : ''}
                  </td>
                  <td style="text-align: right; font-weight: 600;">
                    ${item.isIncluded ? 'Included (₹0)' : (item.isCustomQuote ? 'Custom Quote' : engine.formatINR(item.totalPrice))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">${quotation.subtotalFormatted}</td>
              </tr>
              ${quotation.discountAmount > 0 ? `
                <tr style="color: #15803d;">
                  <td colspan="3" style="text-align: right; font-weight: 600;">${quotation.appliedDiscount?.name || 'Discount'}:</td>
                  <td style="text-align: right; font-weight: 600;">-${quotation.discountFormatted}</td>
                </tr>
              ` : ''}
              <tr class="formal-doc-total-row">
                <td colspan="3" style="text-align: right; font-size: 1.15rem; font-weight: 700;">Estimated Grand Total:</td>
                <td style="text-align: right; font-size: 1.25rem; font-weight: 700; color: #9a7718;">${quotation.estimatedTotalFormatted}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Terms, Inclusions & Verification Policy -->
        <div class="formal-doc-terms">
          <h4>Terms of Engagement &amp; Important Verification Notes:</h4>
          <ol>
            <li><strong>Calendar Availability:</strong> This estimate is subject to studio calendar availability. Muhurat wedding dates are reserved strictly upon receipt of formal token advance.</li>
            <li><strong>Travel &amp; Lodging:</strong> Service hubs inside Ahmedabad include standard conveyance. Outstation destinations across Gujarat (Surat, Vadodara, Rajkot, etc.) are quoted transparently at actuals with zero hidden surcharges.</li>
            <li><strong>Drone Aerials:</strong> Aerial coverage is strictly contingent on DGCA airspace permissions, local weather conditions, and venue flight feasibility.</li>
            <li><strong>Delivery Timelines:</strong> Social media reels delivered within 24–48 hours; master high-resolution photo gallery delivered within 3–4 weeks; full cinematic highlight films delivered in 4–6 weeks.</li>
          </ol>
        </div>

        <!-- Signature Block & Action Bar -->
        <div class="formal-doc-footer">
          <div>
            <p style="font-size: 0.85rem; color: #52525b;">Authorized Studio Representative</p>
            <div style="font-family: 'Cinzel', serif; font-size: 1.1rem; color: #18181b; margin-top: 8px;">ANANT PRODUCTIONS</div>
          </div>
          <div class="formal-doc-actions no-print" style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="btn btn-gold" id="btn-formal-print" style="padding: 12px 24px; font-weight: 600;">
              🖨️ Print / Save as PDF
            </button>
            <a href="${getWhatsAppUrl(quotation)}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="padding: 12px 24px;">
              Send on WhatsApp
            </a>
            <button type="button" class="btn btn-outline-gold" id="btn-formal-close-bottom" style="padding: 12px 20px;">
              ✕ Close Document
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // WHATSAPP URL HELPER
  function getWhatsAppUrl(quotation) {
    const rawMsg = engine.generateWhatsAppMessage(quotation, config);
    const phoneRaw = config.business.phoneRaw || '918000088819';
    return `https://wa.me/${phoneRaw}?text=${encodeURIComponent(rawMsg)}`;
  }

  // ATTACH DOM EVENT HANDLERS
  function attachEventHandlers(quotation) {
    // Stepper navigation clicks
    document.querySelectorAll('[data-goto-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = Number(btn.getAttribute('data-goto-step'));
        if (target <= builderState.currentStep || validateCurrentStep()) {
          builderState.currentStep = target;
          renderBuilder();
          scrollToQuotationSection();
        }
      });
    });

    // Next / Previous buttons
    document.querySelectorAll('[data-step-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (validateCurrentStep()) {
          const next = Number(btn.getAttribute('data-step-next'));
          builderState.currentStep = next;
          renderBuilder();
          scrollToQuotationSection();
          window.trackAnantEvent('quotation_step_progress', { step: next });
        }
      });
    });

    document.querySelectorAll('[data-step-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prev = Number(btn.getAttribute('data-step-prev'));
        builderState.currentStep = prev;
        renderBuilder();
        scrollToQuotationSection();
      });
    });

    document.querySelectorAll('[data-step-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        builderState.currentStep = Number(btn.getAttribute('data-step-goto'));
        renderBuilder();
        scrollToQuotationSection();
      });
    });

    // Step 1: Category radio cards
    document.querySelectorAll('[data-select-category]').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-select-category');
        if (cat === 'custom') {
          builderState.packageId = 'custom';
        } else {
          builderState.eventCategory = cat;
          // select first package in category
          const catPkgs = config.packageCategories[cat]?.packages || [];
          builderState.packageId = catPkgs[0]?.id || 'pkg-wedding-signature';
          builderState.eventDetails.days = catPkgs[0]?.standardDays || (cat === 'wedding' ? 2 : 1);
        }
        renderBuilder();
      });
    });

    // Step 2: Event Details listeners
    const daysSelect = document.getElementById('qb-input-days');
    if (daysSelect) {
      daysSelect.addEventListener('change', () => {
        builderState.eventDetails.days = Number(daysSelect.value);
        renderBuilder();
      });
    }

    const citySelect = document.getElementById('qb-input-city');
    if (citySelect) {
      citySelect.addEventListener('change', () => {
        builderState.eventDetails.city = citySelect.value;
      });
    }

    const venueInput = document.getElementById('qb-input-venue');
    if (venueInput) {
      venueInput.addEventListener('input', () => {
        builderState.eventDetails.venue = venueInput.value.trim();
      });
    }

    const datesInput = document.getElementById('qb-input-dates');
    if (datesInput) {
      datesInput.addEventListener('input', () => {
        builderState.eventDetails.dates = datesInput.value.trim();
      });
    }

    const dateFlexCheck = document.getElementById('qb-check-date-flexible');
    if (dateFlexCheck) {
      dateFlexCheck.addEventListener('change', () => {
        builderState.eventDetails.isDateFlexible = dateFlexCheck.checked;
        if (dateFlexCheck.checked) {
          builderState.eventDetails.dates = 'Date not yet finalized';
          if (datesInput) {
            datesInput.value = '';
            datesInput.disabled = true;
          }
        } else {
          if (datesInput) {
            datesInput.disabled = false;
            datesInput.value = '';
          }
          builderState.eventDetails.dates = '';
        }
      });
    }

    const hoursRange = document.getElementById('qb-range-hours');
    if (hoursRange) {
      hoursRange.addEventListener('input', () => {
        builderState.eventDetails.hoursPerDay = Number(hoursRange.value);
        const display = document.getElementById('qb-val-hours');
        if (display) display.textContent = `${hoursRange.value} Hours/Day`;
      });
    }

    document.querySelectorAll('[data-toggle-function]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fn = btn.getAttribute('data-toggle-function');
        const fns = builderState.eventDetails.functions || [];
        const idx = fns.indexOf(fn);
        if (idx > -1) {
          fns.splice(idx, 1);
        } else {
          fns.push(fn);
        }
        builderState.eventDetails.functions = fns;
        btn.classList.toggle('selected');
      });
    });

    // Step 3: Base Package selector
    document.querySelectorAll('[data-select-package]').forEach(card => {
      card.addEventListener('click', () => {
        const pkgId = card.getAttribute('data-select-package');
        builderState.packageId = pkgId;
        
        // Sync crew for this tier
        if (pkgId === 'custom') {
          builderState.crew = { photo_trad: 1, photo_candid: 1, cinema_cam: 1, video_trad: 0, drone_pilot: 0, crew_assistant: 0 };
        } else {
          const catPkgs = config.packageCategories[builderState.eventCategory]?.packages || [];
          const found = catPkgs.find(p => p.id === pkgId);
          if (found && found.baseCrew) {
            builderState.crew = { ...found.baseCrew };
          }
        }
        renderBuilder();
      });
    });

    // Step 4: Crew Steppers
    document.querySelectorAll('[data-crew-increment]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-crew-increment');
        builderState.crew[id] = (builderState.crew[id] || 0) + 1;
        renderBuilder();
      });
    });

    document.querySelectorAll('[data-crew-decrement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-crew-decrement');
        if (builderState.crew[id] > 0) {
          builderState.crew[id]--;
          renderBuilder();
        }
      });
    });

    // Step 5: Addon Filter Tabs
    document.querySelectorAll('[data-addon-filter]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-addon-filter]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-addon-filter');
        document.querySelectorAll('.qb-addon-card').forEach(card => {
          if (filter === 'all' || card.getAttribute('data-addon-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Step 5: Addon Steppers
    document.querySelectorAll('[data-addon-increment]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-addon-increment');
        builderState.selectedAddons[id] = (builderState.selectedAddons[id] || 0) + 1;
        renderBuilder();
        window.trackAnantEvent('addon_selected', { addonId: id, count: builderState.selectedAddons[id] });
      });
    });

    document.querySelectorAll('[data-addon-decrement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-addon-decrement');
        if (builderState.selectedAddons[id] > 0) {
          builderState.selectedAddons[id]--;
          renderBuilder();
          window.trackAnantEvent('addon_removed', { addonId: id, count: builderState.selectedAddons[id] });
        }
      });
    });

    // Step 7: Customer details listeners
    const custNames = document.getElementById('qb-cust-names');
    if (custNames) {
      custNames.addEventListener('input', () => {
        builderState.customer.names = custNames.value.trim();
      });
    }

    const custPhone = document.getElementById('qb-cust-phone');
    if (custPhone) {
      custPhone.addEventListener('input', () => {
        builderState.customer.phone = custPhone.value.trim();
      });
    }

    const custEmail = document.getElementById('qb-cust-email');
    if (custEmail) {
      custEmail.addEventListener('input', () => {
        builderState.customer.email = custEmail.value.trim();
      });
    }

    const custPref = document.getElementById('qb-cust-contact-pref');
    if (custPref) {
      custPref.addEventListener('change', () => {
        builderState.customer.preferredContact = custPref.value;
      });
    }

    const custNotes = document.getElementById('qb-cust-notes');
    if (custNotes) {
      custNotes.addEventListener('input', () => {
        builderState.customer.notes = custNotes.value.trim();
      });
    }

    // Step 8 & Summary: Action buttons
    const copyLinkBtn = document.getElementById('btn-qb-copy-link');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        copyShareableLink();
      });
    }

    const summaryShareBtn = document.getElementById('btn-summary-share-link');
    if (summaryShareBtn) {
      summaryShareBtn.addEventListener('click', () => {
        copyShareableLink();
      });
    }

    const copySummaryBtn = document.getElementById('btn-qb-copy-summary');
    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', () => {
        const msg = engine.generateWhatsAppMessage(quotation, config);
        navigator.clipboard.writeText(msg).then(() => {
          showToast('Quotation summary copied to clipboard!');
        });
      });
    }

    // Formal Modal open / close
    const openFormalBtn = document.getElementById('btn-qb-open-formal');
    const printDirectBtn = document.getElementById('btn-qb-print-direct');
    const formalModal = document.getElementById('qb-formal-modal');
    const closeFormalBtn = document.getElementById('qb-close-formal-modal');
    const closeFormalBottomBtn = document.getElementById('btn-formal-close-bottom');
    const formalPrintBtn = document.getElementById('btn-formal-print');

    function openFormalModal(autoPrint) {
      if (!formalModal) return;
      formalModal.style.display = 'flex';
      // Force DOM reflow before adding active class for CSS transition
      void formalModal.offsetWidth;
      formalModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      formalModal.scrollTop = 0;
      window.trackAnantEvent('formal_quote_requested', { ref: quotation.referenceId });

      if (autoPrint) {
        setTimeout(() => {
          triggerQuotationPrint();
        }, 350);
      }
    }

    function triggerQuotationPrint() {
      const origTitle = document.title;
      document.title = `Anant_Productions_Quotation_${quotation.referenceId}`;
      window.print();
      setTimeout(() => {
        document.title = origTitle;
      }, 1500);
    }

    function closeFormalModal() {
      if (!formalModal) return;
      formalModal.classList.remove('active');
      setTimeout(() => {
        if (!formalModal.classList.contains('active')) {
          formalModal.style.display = 'none';
        }
      }, 250);
      document.body.style.overflow = '';
    }

    if (openFormalBtn) {
      openFormalBtn.addEventListener('click', () => openFormalModal(false));
    }

    if (printDirectBtn) {
      printDirectBtn.addEventListener('click', () => openFormalModal(true));
    }

    if (formalPrintBtn) {
      formalPrintBtn.addEventListener('click', () => {
        triggerQuotationPrint();
      });
    }

    if (closeFormalBtn) {
      closeFormalBtn.addEventListener('click', closeFormalModal);
    }

    if (closeFormalBottomBtn) {
      closeFormalBottomBtn.addEventListener('click', closeFormalModal);
    }

    if (formalModal) {
      formalModal.addEventListener('click', (e) => {
        if (e.target === formalModal) {
          closeFormalModal();
        }
      });
    }

    // Escape key closes formal modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && formalModal && formalModal.classList.contains('active')) {
        closeFormalModal();
      }
    });

    // WhatsApp Tracking
    const waSendBtn = document.getElementById('btn-qb-whatsapp-send');
    if (waSendBtn) {
      waSendBtn.addEventListener('click', () => {
        window.trackAnantEvent('whatsapp_enquiry_clicked', { ref: quotation.referenceId, total: quotation.estimatedTotal });
      });
    }

    const sumWaBtn = document.getElementById('btn-summary-whatsapp');
    if (sumWaBtn) {
      sumWaBtn.addEventListener('click', () => {
        window.trackAnantEvent('whatsapp_enquiry_clicked', { ref: quotation.referenceId, total: quotation.estimatedTotal });
      });
    }

    // Mobile bar toggles
    const mobileSheetToggle = document.getElementById('btn-toggle-mobile-sheet');
    const summaryCol = document.querySelector('.qb-summary-col');
    if (mobileSheetToggle && summaryCol) {
      mobileSheetToggle.addEventListener('click', () => {
        summaryCol.classList.toggle('mobile-open');
        mobileSheetToggle.textContent = summaryCol.classList.contains('mobile-open') ? 'Hide Breakdown ✕' : 'View Breakdown';
      });
    }

    const mobileNextBtn = document.getElementById('btn-mobile-next');
    if (mobileNextBtn) {
      mobileNextBtn.addEventListener('click', () => {
        if (builderState.currentStep === 8) {
          window.open(getWhatsAppUrl(quotation), '_blank');
        } else if (validateCurrentStep()) {
          builderState.currentStep = Math.min(8, builderState.currentStep + 1);
          renderBuilder();
          scrollToQuotationSection();
        }
      });
    }
  }

  // VALIDATION
  function validateCurrentStep() {
    if (builderState.currentStep === 2) {
      if (!builderState.eventDetails.isDateFlexible && !builderState.eventDetails.dates) {
        alert('Please enter your wedding date or check "Date not finalized yet".');
        return false;
      }
    }
    if (builderState.currentStep === 7) {
      if (!builderState.customer.names) {
        alert('Please enter your name or couple names.');
        document.getElementById('qb-cust-names')?.focus();
        return false;
      }
      if (!builderState.customer.phone) {
        alert('Please enter your WhatsApp contact number.');
        document.getElementById('qb-cust-phone')?.focus();
        return false;
      }
    }
    return true;
  }

  // COPY SHAREABLE LINK
  function copyShareableLink() {
    const hashPayload = engine.serializeStateToHash(builderState);
    const fullUrl = `${window.location.origin}${window.location.pathname}#quote=${hashPayload}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('Customized quotation link copied! Share it with your partner or family.');
    }).catch(() => {
      prompt('Copy this link:', fullUrl);
    });
  }

  // TOAST NOTIFIER
  function showToast(msg) {
    let toast = document.getElementById('qb-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qb-toast';
      toast.className = 'qb-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 4000);
  }

})();
