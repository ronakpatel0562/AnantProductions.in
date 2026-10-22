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
    coverageScope: 'one_side', // 'one_side' | 'both_same_venue' | 'both_diff_venues'
    packageId: 'pkg-wedding-signature',
    activeAddonCategory: 'albums', // Default to Heirloom Albums category
    eventDetails: {
      eventType: 'Two-Day Gujarati Wedding',
      days: 2,
      dates: '',
      isDateFlexible: false,
      city: 'Ahmedabad',
      venue: '',
      venueGroom: '',
      venueBride: '',
      hoursPerDay: 6,
      functions: [] // Always reset / empty by default
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

    // Always reset function selection buttons every time we land on page unless explicit in quote hash
    if (builderState.eventDetails) {
      builderState.eventDetails.functions = [];
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
      { num: 4, title: 'Services' },
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

  // ================= STEP 1: EVENT TYPE & COVERAGE SCOPE =================
  function renderStep1_EventType() {
    const scopes = Array.isArray(config.coverageScopes) 
      ? config.coverageScopes 
      : Object.values(config.coverageScopes || {});

    const categories = [
      { id: 'wedding', name: 'Two-Day Wedding', guj: 'લગ્ન પ્રસંગ (બે દિવસ)', desc: 'Mandva, Pithi, Garba, Hasta Melap & Reception', icon: '💍', badge: 'Most Popular' },
      { id: 'prewed', name: 'Pre-Wedding & Couple Film', guj: 'પ્રી-વેડિંગ શૂટ', desc: 'Concept couple portraiture and cinematic romance in scenic backdrops', icon: '📸', badge: 'High-Demand' },
      { id: 'engagement', name: 'Engagement / Sakar Pudo', guj: 'સગાઈ અને ગોળધાણા', desc: 'Ring ceremony, family blessings, and evening dinner celebration', icon: '✨', badge: null },
      { id: 'functions', name: 'Individual Functions', guj: 'વ્યક્તિગત પ્રસંગો', desc: 'Standalone Haldi/Pithi, Mehndi, Midnight Garba, or Reception', icon: '🪔', badge: null },
      { id: 'custom', name: 'Build Your Own Package', guj: 'તમારું મનપસંદ પેકેજ', desc: 'Custom multi-day celebration configured from scratch', icon: '🎨', badge: 'Flexible' }
    ];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 01 OF 08 &bull; COVERAGE SCOPE &amp; EVENT TYPE</span>
        <h3 class="qb-step-title">Select your celebration coverage</h3>
        <p class="qb-step-desc">
          Choose whether you need single-side or both-side coverage, and select your primary event category.
        </p>
      </div>

      <!-- Coverage Scope Filter (One-Side vs Both-Sides) -->
      <div class="qb-scope-section">
        <div style="margin-bottom: 14px;">
          <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">COVERAGE SCOPE FILTER</span>
          <h4 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: var(--foreground); margin: 0 0 6px 0;">Are you looking for One-Side or Both-Side Coverage?</h4>
          <p style="font-size: 0.85rem; color: var(--mute); margin: 0;">
            Select whether you are booking for one family side (Bride OR Groom) or both family sides. Celebrations at separate locations (different residences &amp; Jaan arrival) include transparent +₹8,500 dual coordination.
          </p>
        </div>

        <div class="qb-scope-grid" role="radiogroup" aria-label="Coverage scope selection">
          ${scopes.map(scope => {
            const isSelected = (builderState.coverageScope === scope.id);
            const surcharge = Number(scope.surcharge ?? scope.price ?? 0);
            return `
              <div class="qb-scope-card ${isSelected ? 'selected' : ''}" data-select-scope="${scope.id}" role="radio" aria-checked="${isSelected}" tabindex="0">
                <div class="qb-scope-header">
                  <div class="qb-scope-title-wrap">
                    <span class="qb-scope-icon">${scope.icon || '📍'}</span>
                    <div>
                      <h5 class="qb-scope-title">${scope.title || scope.name}</h5>
                      <span class="qb-scope-sub">${scope.subtitle || scope.gujarati}</span>
                    </div>
                  </div>
                  <span class="qb-scope-badge ${surcharge > 0 ? 'badge-extra' : ''}">
                    ${surcharge > 0 ? '+₹8,500' : 'Included'}
                  </span>
                </div>
                <p class="qb-scope-desc">${scope.description}</p>
                <div class="qb-scope-status">
                  <span>${isSelected ? '● Selected Setup' : '○ Click to Select'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="margin: 32px 0 16px 0;">
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">CELEBRATION CATEGORY</span>
        <h4 style="font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--foreground); margin: 0;">What celebration are we documenting?</h4>
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

        <!-- Venue Name(s) -->
        ${builderState.coverageScope === 'both_diff_venues' ? `
          <div class="form-group">
            <label class="form-label" for="qb-input-venue-groom">Groom's Residence / Starting Venue</label>
            <input type="text" id="qb-input-venue-groom" class="form-input" placeholder="e.g. Groom's family home, Jaan departure point…" value="${d.venueGroom || ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="qb-input-venue-bride">Bride's Residence / Wedding Venue</label>
            <input type="text" id="qb-input-venue-bride" class="form-input" placeholder="e.g. Bride's family home, main wedding hall / resort…" value="${d.venueBride || ''}">
          </div>
        ` : `
          <div class="form-group">
            <label class="form-label" for="qb-input-venue">Venue or Resort Name (Optional)</label>
            <input type="text" id="qb-input-venue" class="form-input" placeholder="e.g. Belvedere Club, YMCA, Club O7, etc." value="${d.venue || ''}">
          </div>
        `}

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
                <strong>Included Services:</strong> ${pkg.services ? pkg.services.join(' &bull; ') : (pkg.crewText || 'Photography & Cinematography Coverage')}
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
              Start with a clean slate. Handpick your photography and cinematography coverage styles, drone aerials, luxury heirloom albums, and reels in the next steps.
            </p>
          </div>
          <div class="package-crew" style="margin: 14px 0; font-size: 0.84rem;">
            <strong>Coverage:</strong> Handpicked services configured dynamically
          </div>
          <ul class="package-features" style="font-size: 0.82rem; margin-bottom: 18px;">
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Zero bundled assumptions or unwanted add-ons</span></li>
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Select tailored photography and cinematography coverage</span></li>
            <li class="package-feature"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Itemized transparency down to each reel and print</span></li>
          </ul>
          <button type="button" class="btn ${builderState.packageId === 'custom' ? 'btn-gold' : 'btn-outline-gold'} qb-btn-choose-pkg" style="width: 100%; justify-content: center;">
            ${builderState.packageId === 'custom' ? '✓ Selected Bespoke' : 'Build Custom Plan'}
          </button>
        </div>
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="2">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="4">Select Coverage Services →</button>
      </div>
    `;
  }

  // ================= STEP 4: COVERAGE SERVICES =================
  function renderStep4_CrewConfig() {
    // Current package base crew
    const catPackages = config.packageCategories[builderState.eventCategory]?.packages || [];
    const basePkg = catPackages.find(p => p.id === builderState.packageId);
    const baseCrewMap = (basePkg && basePkg.baseCrew) ? basePkg.baseCrew : {};

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 04 OF 08 &bull; PHOTOGRAPHY &amp; CINEMATOGRAPHY SERVICES</span>
        <h3 class="qb-step-title">Select your celebration coverage styles</h3>
        <p class="qb-step-desc">
          Choose the visual styles that best tell your celebration story. Every selected service is documented by dedicated, specialized artists equipped with cinema cameras, prime lenses, and discrete audio capture.
        </p>
      </div>

      <div class="qb-services-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${config.crewRoles.map(role => {
          const baseCount = baseCrewMap[role.id] || 0;
          const currentCount = (builderState.crew[role.id] !== undefined) ? builderState.crew[role.id] : baseCount;
          const isIncludedInBase = baseCount > 0;
          const isSelected = currentCount > 0;

          return `
            <div class="qb-service-card ${isSelected ? 'selected' : ''}" style="background: var(--canvas-elevated); border: 1.5px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border)'}; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                  <span class="qb-badge-sm" style="font-size: 0.72rem; text-transform: uppercase;">${role.roleType || 'Coverage'}</span>
                  ${isIncludedInBase 
                    ? `<span class="qb-included-tag" style="background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600;">Included in Tier</span>` 
                    : `<span style="font-size: 0.8rem; color: var(--gold-light); font-weight: 600;">${engine.formatINR(role.ratePerEvent)} / event</span>`
                  }
                </div>
                <h4 style="font-size: 1.05rem; margin: 0 0 8px 0; color: var(--foreground);">${role.name}</h4>
                <p style="font-size: 0.82rem; color: var(--mute); line-height: 1.5; margin: 0 0 16px 0;">${role.description}</p>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 14px;">
                <span style="font-size: 0.82rem; color: ${isSelected ? '#86efac' : 'var(--mute)'};">
                  ${isSelected ? '● Active Coverage' : '○ Not Selected'}
                </span>
                <button type="button" 
                  class="btn ${isSelected ? 'btn-gold' : 'btn-outline-gold'} qb-btn-service-toggle" 
                  data-service-toggle="${role.id}"
                  style="padding: 8px 16px; font-size: 0.82rem;"
                  aria-pressed="${isSelected}">
                  ${isSelected ? '✓ Selected' : '+ Add Service'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="package-transparency-note" style="margin-top: 24px;">
        💡 <strong>Harmonious Coverage Recommendation:</strong> For traditional celebrations with 250+ guests across Mandva, Pithi, Garba, and Lagna, we recommend combining Traditional Photography, Candid Photography, and Cinematic Wedding Filmmaking for complete, multi-angle celebration documentation.
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

    // Filter categories (coverage services are strictly in Step 4)
    const categories = [
      { id: 'albums', label: 'Heirloom Albums' },
      { id: 'social', label: 'Reels & Teasers' },
      { id: 'interviews', label: 'Interviews & Podcasts' },
      { id: 'postproduction', label: 'Master Files & Editing' },
      { id: 'coverage', label: 'Overtime Hours' }
    ];

    // Filter out deliverables/add-ons that are already included in the base plan
    const availableAddons = (config.addOnCatalog || []).filter(addon => {
      const includedQty = includedAddons[addon.id] || 0;
      // Hide if already included in chosen base plan
      return includedQty === 0;
    });

    if (!builderState.activeAddonCategory) {
      builderState.activeAddonCategory = 'albums';
    }

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 05 OF 08 &bull; DELIVERABLES &amp; ADD-ON CATALOGUE</span>
        <h3 class="qb-step-title">Enhance your package with optional deliverables</h3>
        <p class="qb-step-desc">
          Add printed heirloom albums, social media reels, guest audio interviews, or extra coverage hours. Services already included in your package are excluded here so you never pay twice.
        </p>
      </div>

      <!-- Addon Category Filter Tabs -->
      <div class="gallery-filters qb-addon-filters" role="tablist">
        ${categories.map(c => {
          const isActive = (builderState.activeAddonCategory === c.id);
          return `
            <button type="button" class="filter-btn ${isActive ? 'active' : ''}" data-addon-filter="${c.id}" role="tab" aria-selected="${isActive}">
              ${c.label}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Add-on Cards Grid -->
      ${availableAddons.length === 0 ? `
        <div style="text-align: center; padding: 48px 20px; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 8px; margin-bottom: 24px;">
          <span style="font-size: 2rem; display: block; margin-bottom: 12px;">✨</span>
          <h4 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: var(--gold-light); margin: 0 0 8px 0;">All Signature Deliverables Included</h4>
          <p style="font-size: 0.88rem; color: var(--mute); max-width: 500px; margin: 0 auto;">
            Your selected collection already includes our comprehensive suite of deliverables. You can proceed directly to review your personalized estimate.
          </p>
        </div>
      ` : `
        <div class="qb-addons-grid" id="qb-addons-catalogue-wrap">
          ${availableAddons.map(addon => {
            const userQty = builderState.selectedAddons[addon.id] || 0;
            const isAdded = (userQty > 0);
            const isCustom = (addon.pricingMethod === 'custom' || addon.defaultPrice === null);
            const isVisible = !builderState.activeAddonCategory || (addon.category === builderState.activeAddonCategory);

            return `
              <div class="qb-addon-card ${isAdded ? 'status-added' : ''}" data-addon-category="${addon.category}" style="display: ${isVisible ? 'flex' : 'none'};">
                <div class="qb-addon-top">
                  <span class="qb-addon-cat-tag">${addon.categoryName}</span>
                </div>

                <h4 class="qb-addon-title">${addon.name}</h4>
                <p class="qb-addon-desc">${addon.description}</p>

                <div class="qb-addon-bottom">
                  <div class="qb-addon-price-tag">
                    <span class="qb-addon-amount">${isCustom ? 'Custom Quote' : engine.formatINR(addon.defaultPrice)}</span>
                    <span class="qb-addon-unit">/ ${addon.pricingUnit}</span>
                  </div>

                  <div class="qb-stepper-control" aria-label="${addon.name} selector">
                    <button type="button" class="qb-step-btn" data-addon-decrement="${addon.id}" aria-label="Decrease ${addon.name}" ${userQty <= 0 ? 'disabled' : ''}>−</button>
                    <span class="qb-step-val" id="addon-val-${addon.id}">${userQty}</span>
                    <button type="button" class="qb-step-btn" data-addon-increment="${addon.id}" aria-label="Increase ${addon.name}">+</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="4">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="6">Review Custom Quotation →</button>
      </div>
    `;
  }

  // ================= STEP 6: REVIEW QUOTATION =================
  function renderStep6_ReviewQuotation(quotation) {
    const evt = quotation.eventDetails;
    const functionsList = (evt.functions && evt.functions.length > 0) 
      ? evt.functions 
      : ['Mandva / Grah Shanti', 'Haldi / Pithi', 'Garba / Sangeet Night', 'Lagna / Mandap Ceremony', 'Reception'];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">STEP 06 OF 08 &bull; REVIEW CUSTOM QUOTATION</span>
        <h3 class="qb-step-title">Your Itemized Celebration Quotation</h3>
        <p class="qb-step-desc">
          Review every service, deliverable, and complimentary experience. Everything is 100% transparent with zero hidden fees.
        </p>
      </div>

      <div class="qb-review-card">
        <div class="qb-review-header">
          <div>
            <span class="qb-review-ref">Reference: <strong>${quotation.referenceId}</strong></span>
            <h4 class="qb-review-pkg-name">${quotation.basePackageName}</h4>
            <div class="qb-review-meta">
              <span>📍 ${evt.city}${evt.venue ? ' (' + evt.venue + ')' : ''}</span> &bull; 
              <span>👥 ${quotation.coverageScopeLabel || 'One-Side Coverage'}</span> &bull; 
              <span>🗓️ ${evt.dates || 'Dates to be finalized'}</span> &bull; 
              <span>⏳ ${evt.days} Day(s)</span>
            </div>
          </div>
          <div class="qb-review-status-pill">
            ${quotation.status}
          </div>
        </div>

        <!-- Schedule & Functions Covered -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
          <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-light); text-transform: uppercase; margin-bottom: 8px;">
            Documented Celebration Functions:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${functionsList.map(fn => `
              <span style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.25); color: var(--foreground); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">
                ✦ ${fn}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Deliverables & Philosophy Highlights -->
        <div style="background: rgba(212, 175, 55, 0.05); border-left: 3px solid var(--gold-primary); border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; font-size: 0.84rem; line-height: 1.55;">
          <strong style="color: var(--gold-light); display: block; margin-bottom: 4px;">Our Photography Guarantee:</strong>
          "${config.photographyPhilosophy.quote}"
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 0.8rem; color: var(--mute);">
            <span>✓ Complete Ultra-High-Resolution RAW Collection</span>
            <span>✓ Curated Handpicked Master Retouched Photographs</span>
          </div>
        </div>

        <!-- Complimentary Benefits -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #86efac; text-transform: uppercase; margin-bottom: 8px;">
            🎁 Complimentary Experiences Included:
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 0.8rem;">
            ${config.complimentaryBenefits.map(b => `
              <div style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--gold-light);">✓</span>
                <div>
                  <strong style="color: var(--foreground);">${b.title}</strong>
                  <div style="color: var(--mute); font-size: 0.75rem;">${b.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="qb-table-wrap">
          <table class="qb-table">
            <thead>
              <tr>
                <th style="text-align: left;">Service / Deliverable</th>
                <th style="text-align: center;">Category</th>
                <th style="text-align: center;">Status</th>
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
                    ${item.isIncluded 
                      ? '<span class="qb-included-text" style="color: #86efac; font-weight: 600;">Included in Tier</span>' 
                      : (item.type === 'service' ? '<span style="color: var(--gold-light);">Active Coverage</span>' : `${item.quantity} ${item.unit}`)
                    }
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
            <span>👥 Scope:</span>
            <strong>${quotation.coverageScope === 'both_diff_venues' ? 'Both Sides (+₹8,500)' : (quotation.coverageScope === 'both_same_venue' ? 'Both Sides (Joint)' : 'One-Side')}</strong>
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

  // ================= FORMAL QUOTATION DOCUMENT (8 SECTIONS) =================
  function renderFormalQuotationDocument(quotation) {
    const biz = config.business;
    const cust = quotation.customer;
    const evt = quotation.eventDetails;
    const functionsList = (evt.functions && evt.functions.length > 0)
      ? evt.functions
      : ['Mandva / Ganesh Sthapana & Grah Shanti', 'Haldi & Pithi Ceremony', 'Raas Garba & Sangeet Night', 'Lagna & Hasta Melap Ceremony', 'Grand Reception Celebration'];

    // Active coverage services for this quotation
    const activeServices = config.crewRoles.filter(role => (builderState.crew[role.id] || 0) > 0);

    return `
      <div class="formal-doc">
        
        <!-- ================= SECTION 1: PERSONALIZED QUOTATION COVER ================= -->
        <section class="formal-doc-section formal-doc-cover" id="formal-sec-cover">
          <div class="formal-doc-header">
            <div class="formal-doc-brand">
              <img src="anant_logo.png" alt="Anant Productions Logo" class="formal-doc-logo">
              <div>
                <h2 class="formal-doc-title">ANANT PRODUCTIONS</h2>
                <p class="formal-doc-tagline">Fine-Art Gujarati Wedding Cinematography &amp; Photography</p>
                <div class="formal-doc-address">
                  ${biz.address}<br>
                  Phone &amp; WhatsApp: ${biz.phone} &bull; Email: ${biz.email} &bull; Website: anantproductions.in
                </div>
              </div>
            </div>
            <div class="formal-doc-meta">
              <div class="formal-doc-meta-badge">CONFIDENTIAL PROPOSAL</div>
              <div class="formal-doc-ref">Ref: <strong>${quotation.referenceId}</strong></div>
              <div class="formal-doc-date">Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div class="formal-doc-validity">Validity: 30 Days</div>
            </div>
          </div>

          <div class="formal-cover-banner">
            <span class="formal-cover-kicker">SECTION 01 &bull; PERSONALIZED QUOTATION</span>
            <h1 class="formal-cover-title">Your Special Wedding Quotation</h1>
            <p class="formal-cover-subtitle">તમારા લગ્ન પ્રસંગનું વિશેષ પ્રપોઝલ — Fine-Art Visual Storytelling Experience</p>
          </div>

          <div class="formal-doc-info-grid">
            <div class="formal-doc-info-box">
              <h4>Prepared Especially For:</h4>
              <p>
                <strong style="font-size: 1.05rem; color: #18181b;">${cust.names || 'Honored Couple &amp; Family'}</strong><br>
                <span>WhatsApp: <strong>${cust.phone || 'Provided upon inquiry'}</strong></span><br>
                ${cust.email ? `<span>Email: ${cust.email}</span><br>` : ''}
                <span>Preferred Contact: ${cust.preferredContact || 'WhatsApp'}</span>
              </p>
            </div>
            <div class="formal-doc-info-box">
              <h4>Celebration Schedule &amp; Destination:</h4>
              <p>
                <strong>Event:</strong> ${quotation.basePackageName}<br>
                <strong>Coverage Scope:</strong> ${quotation.coverageScopeLabel || 'One-Side Coverage'}<br>
                <strong>City &amp; Venue:</strong> ${evt.city}${evt.venue ? ' &bull; ' + evt.venue : ''}<br>
                <strong>Proposed Dates:</strong> ${evt.dates || 'Dates to be finalized'}<br>
                <strong>Celebration Duration:</strong> ${evt.days} Day(s) &bull; ~${evt.approxHoursPerDay} hrs/day
              </p>
            </div>
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 2: EVENT-BY-EVENT COVERAGE ================= -->
        <section class="formal-doc-section" id="formal-sec-events">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 02</span>
            <h3 class="formal-section-title">Event-by-Event Celebration Coverage</h3>
            <p class="formal-section-desc">
              Comprehensive visual documentation scheduled across your sacred wedding rituals. Every selected service is documented by dedicated, specialized visual artists ensuring complete, multi-angle coverage without blindspots.
            </p>
          </div>

          <!-- Active Services Highlight -->
          <div class="formal-active-services-bar">
            <strong>Active Coverage Services For Your Celebration:</strong>
            <div class="formal-services-tag-list">
              ${activeServices.map(s => `
                <span class="formal-service-tag">✦ ${s.name}</span>
              `).join('')}
            </div>
          </div>

          <!-- Functions Timeline Cards -->
          <div class="formal-events-grid">
            ${functionsList.map((fn, idx) => `
              <div class="formal-event-card">
                <div class="formal-event-card-header">
                  <span class="formal-event-num">RITUAL ${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}</span>
                  <h4 class="formal-event-name">${fn}</h4>
                </div>
                <div class="formal-event-details">
                  <div class="formal-event-meta">
                    <span>📍 ${evt.venue || evt.city}</span> &bull; 
                    <span>🗓️ ${evt.dates || 'Scheduled as per wedding muhurat'}</span>
                  </div>
                  <div class="formal-event-services">
                    <strong>Documented with:</strong>
                    ${activeServices.length > 0 
                      ? activeServices.map(s => s.name).join(' &bull; ') 
                      : 'Traditional Photography &bull; Candid Photography &bull; Cinematic Wedding Filmmaking'
                    }
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 3: OUR DELIVERABLES ================= -->
        <section class="formal-doc-section" id="formal-sec-deliverables">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 03</span>
            <h3 class="formal-section-title">Deliverables You Will Receive</h3>
            <p class="formal-section-desc">
              Meticulously preserved digital master files, high-resolution photo archives, and handcrafted heirloom keepsakes.
            </p>
          </div>

          <!-- Exact Photography Philosophy Callout -->
          <div class="formal-philosophy-box">
            <div class="formal-philosophy-header">
              <span class="formal-philosophy-icon">✨</span>
              <h4>OUR PHOTOGRAPHY PHILOSOPHY</h4>
            </div>
            <p class="formal-philosophy-quote">
              "${config.photographyPhilosophy.quote}"
            </p>
          </div>

          <!-- Deliverables Grid -->
          <div class="formal-deliverables-grid">
            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">📸</div>
              <h4>Ultra-High-Resolution RAW Photographs</h4>
              <p>${config.photographyPhilosophy.rawDeliverable}</p>
            </div>

            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">🎨</div>
              <h4>Handpicked Artistically Retouched Master Photographs</h4>
              <p>${config.photographyPhilosophy.editedDeliverable}</p>
            </div>

            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">🎬</div>
              <h4>Cinematic Wedding Highlight Film (3–7 Minutes)</h4>
              <p>Emotionally paced 4K cinematic film capturing the authentic narrative of your wedding, set to custom licensed soundtrack and Vedic ceremony audio.</p>
            </div>

            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">⚡</div>
              <h4>Cinematic Teaser / Save-the-Date (60–90 Seconds)</h4>
              <p>High-energy cinematic teaser crafted for rapid sharing with close family and friends across social media and WhatsApp stories.</p>
            </div>

            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">🎥</div>
              <h4>Full-Length Traditional Documentary Film (60–120 Minutes)</h4>
              <p>Comprehensive, chronological multi-camera recording of all sacred rituals, Vedic mantras, and stage celebrations from start to finish.</p>
            </div>

            <div class="formal-deliv-card">
              <div class="formal-deliv-icon">📱</div>
              <h4>Instagram Cinematic Reels (Vertical 9:16)</h4>
              <p>Short-form vertical 4K reels edited with trending audio, color-graded specifically for modern smartphone viewing and WhatsApp sharing.</p>
            </div>

            <div class="formal-deliv-card full-width">
              <div class="formal-deliv-icon">📖</div>
              <h4>Luxury Heirloom Hardcover Photobooks &amp; Albums</h4>
              <p>Hand-bound archival 12x18 inch hardcover heirloom albums featuring imported luster or silk sheets, seamless lay-flat binding, custom foil debossing, and matching protective wooden presentation box.</p>
            </div>
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 4: COMPLIMENTARY BENEFITS ================= -->
        <section class="formal-doc-section" id="formal-sec-complimentary">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 04</span>
            <h3 class="formal-section-title">Complimentary Experiences for Your Celebration</h3>
            <p class="formal-section-desc">
              Value-added experiences included with our highest compliments to make your celebration seamless.
            </p>
          </div>

          <div class="formal-benefits-grid">
            ${config.complimentaryBenefits.map(b => `
              <div class="formal-benefit-card">
                <div class="formal-benefit-badge">COMPLIMENTARY</div>
                <h4 class="formal-benefit-title">${b.title}</h4>
                <p class="formal-benefit-desc">${b.description}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 5: PRICING AND SPECIAL OFFER ================= -->
        <section class="formal-doc-section" id="formal-sec-pricing">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 05</span>
            <h3 class="formal-section-title">Investment &amp; Special Offer</h3>
            <p class="formal-section-desc">
              100% transparent pricing with approved launch savings and zero hidden charges.
            </p>
          </div>

          <!-- Pricing Overview Cards -->
          <div class="formal-pricing-overview">
            <div class="formal-price-tile">
              <span class="formal-price-label">Regular Package Value</span>
              <span class="formal-price-val strike">${quotation.subtotalFormatted}</span>
              <span class="formal-price-sub">Standard Studio Rate</span>
            </div>

            ${quotation.discountAmount > 0 ? `
              <div class="formal-price-tile discount">
                <span class="formal-price-label">Special Offer / Savings</span>
                <span class="formal-price-val savings">-${quotation.discountFormatted}</span>
                <span class="formal-price-sub">${quotation.appliedDiscount?.name || 'Approved Privilege Savings'}</span>
              </div>
            ` : ''}

            <div class="formal-price-tile total">
              <span class="formal-price-label">Your Personalized Wedding Experience</span>
              <span class="formal-price-val grand">${quotation.estimatedTotalFormatted}</span>
              <span class="formal-price-sub">Inclusive of Selected Inclusions</span>
            </div>
          </div>

          <!-- Itemized Breakdown Table -->
          <div class="formal-doc-table-wrap">
            <table class="formal-doc-table">
              <thead>
                <tr>
                  <th style="width: 50%; text-align: left;">Service Description &amp; Scope</th>
                  <th style="width: 18%; text-align: center;">Category</th>
                  <th style="width: 14%; text-align: center;">Status</th>
                  <th style="width: 18%; text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.lineItems.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                      ${item.description ? `<div style="font-size: 0.78rem; color: #52525b; margin-top: 2px;">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center; font-size: 0.8rem;">
                      <span class="formal-table-category">${item.category}</span>
                    </td>
                    <td style="text-align: center; font-size: 0.82rem;">
                      ${item.isIncluded 
                        ? '<span style="color: #15803d; font-weight: 600;">Included in Tier</span>' 
                        : (item.type === 'service' ? '<span style="color: #9a7718; font-weight: 600;">Active Coverage</span>' : `${item.quantity} ${item.unit}`)
                      }
                    </td>
                    <td style="text-align: right; font-weight: 600;">
                      ${item.isIncluded ? '<span style="color: #15803d;">Included (₹0)</span>' : (item.isCustomQuote ? 'Custom Quote' : engine.formatINR(item.totalPrice))}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal Investment:</td>
                  <td style="text-align: right; font-weight: 600;">${quotation.subtotalFormatted}</td>
                </tr>
                ${quotation.discountAmount > 0 ? `
                  <tr style="color: #15803d;">
                    <td colspan="3" style="text-align: right; font-weight: 600;">${quotation.appliedDiscount?.name || 'Discount / Savings'}:</td>
                    <td style="text-align: right; font-weight: 600;">-${quotation.discountFormatted}</td>
                  </tr>
                ` : ''}
                <tr class="formal-doc-total-row">
                  <td colspan="3" style="text-align: right; font-size: 1.15rem; font-weight: 700;">Final Proposed Investment:</td>
                  <td style="text-align: right; font-size: 1.25rem; font-weight: 700; color: #9a7718;">${quotation.estimatedTotalFormatted}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 6: PREMIUM OPTIONAL ADD-ONS ================= -->
        <section class="formal-doc-section" id="formal-sec-addons">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 06</span>
            <h3 class="formal-section-title">Special Add-ons for Your Wedding Experience</h3>
            <p class="formal-section-desc">
              Tailor your visual experience further with these curated enhancements. Any add-on can be added to your booking at any time prior to your wedding week.
            </p>
          </div>

          <div class="formal-addons-grid">
            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>4K Drone Aerial Cinematography</h4>
                <span class="formal-addon-price">₹7,499 / event</span>
              </div>
              <p>Sweeping 4K aerial visuals capturing venue grandeur, Jaan Agaman procession, and open-air vidhis.</p>
            </div>

            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>Same-Day Edit (SDE) Reception Teaser</h4>
                <span class="formal-addon-price">₹14,999 / edit</span>
              </div>
              <p>High-energy 60–90 second cinematic highlight filmed in the morning, edited on-site, and premiered on stage at your evening Reception.</p>
            </div>

            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>Concept Couple Pre-Wedding Film</h4>
                <span class="formal-addon-price">₹29,999 / session</span>
              </div>
              <p>Full-day couple portraiture and cinematic romance film at heritage palaces or scenic resort locations across Gujarat.</p>
            </div>

            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>Parent Keepsake Heirloom Mini-Albums (Set of 2)</h4>
                <span class="formal-addon-price">₹9,999 / set</span>
              </div>
              <p>Two matching 8x12 inch hardcover archival photobooks specially crafted as timeless tokens of gratitude for both sets of parents.</p>
            </div>

            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>4K Master SSD Archival Hard Drive</h4>
                <span class="formal-addon-price">₹4,999 / drive</span>
              </div>
              <p>Shockproof 1TB external solid-state drive preloaded with all uncompressed master footage, RAW image galleries, and final master cinema files.</p>
            </div>

            <div class="formal-addon-card">
              <div class="formal-addon-header">
                <h4>Guest Audio Wishes &amp; Family Interviews</h4>
                <span class="formal-addon-price">₹5,999 / event</span>
              </div>
              <p>Dedicated video journalist with lapel microphones and lighting recording spontaneous elder blessings and heartfelt advice from close family.</p>
            </div>
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 7: TERMS AND EXCLUSIONS ================= -->
        <section class="formal-doc-section" id="formal-sec-terms">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 07</span>
            <h3 class="formal-section-title">Terms of Engagement &amp; Exclusions</h3>
            <p class="formal-section-desc">
              Clear, transparent guidelines designed to ensure smooth execution and mutual peace of mind.
            </p>
          </div>

          <div class="formal-terms-list">
            <div class="formal-term-item">
              <span class="formal-term-icon">1</span>
              <div>
                <strong>Milestone Payment Schedule:</strong>
                <p>To ensure dedicated artist allocation, payments are structured into three transparent milestones: <strong>25% Booking Advance</strong> to reserve and block dates in our production calendar; <strong>50% Mid-Payment</strong> due on or before the wedding day; and <strong>25% Final Delivery Payment</strong> upon final delivery of your high-resolution gallery, master films, and approval of printed heirloom albums.</p>
              </div>
            </div>

            <div class="formal-term-item">
              <span class="formal-term-icon">2</span>
              <div>
                <strong>Studio Calendar &amp; Date Availability:</strong>
                <p>Quotations are valid for 30 days from the date of generation. Auspicious Gujarati muhurat wedding dates operate on a strict first-come, first-served basis; dates remain open to other inquiries until receipt of the formal booking token advance.</p>
              </div>
            </div>

            <div class="formal-term-item">
              <span class="formal-term-icon">3</span>
              <div>
                <strong>Travel, Conveyance &amp; Outstation Lodging:</strong>
                <p>Celebration coverage within Ahmedabad includes standard crew conveyance. For celebrations hosted in other Gujarat cities or destination resorts, comfortable client-provided lodging, meals, and outstation travel are reimbursed at actuals with zero hidden surcharges.</p>
              </div>
            </div>

            <div class="formal-term-item">
              <span class="formal-term-icon">4</span>
              <div>
                <strong>Drone Operations &amp; Airspace Approvals:</strong>
                <p>Aerial drone coverage is strictly subject to DGCA airspace regulations, local municipal clearances, and venue flight feasibility. Drone flights will not be operated under unsafe atmospheric conditions (heavy rain or high wind speeds).</p>
              </div>
            </div>

            <div class="formal-term-item">
              <span class="formal-term-icon">5</span>
              <div>
                <strong>Post-Production Delivery Schedule:</strong>
                <p>48-Hour Sneak Peek highlights delivered within 2 days of celebration. Master High-Resolution Photo Gallery delivered within 3 to 4 weeks. Cinematic Wedding Highlights and Full Documentary Video delivered within 4 to 6 weeks. Printed Heirloom Albums delivered within 3 to 4 weeks following final couple photo selection and layout sign-off.</p>
              </div>
            </div>
          </div>
        </section>

        <hr class="formal-doc-divider">

        <!-- ================= SECTION 8: FINAL CALL TO ACTION ================= -->
        <section class="formal-doc-section formal-doc-closing" id="formal-sec-cta">
          <div class="formal-section-head">
            <span class="formal-section-kicker">SECTION 08</span>
            <h3 class="formal-section-title">Let's Create Something Timeless Together</h3>
            <p class="formal-section-desc" style="max-width: 650px; margin: 0 auto 20px;">
              Your wedding is a once-in-a-lifetime milestone filled with sacred traditions, joyous celebrations, and unscripted family memories. We would be honored to preserve every moment with the artistry, discretion, and reverence it deserves.
            </p>
          </div>

          <div class="formal-cta-box">
            <h4 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: #18181b; margin-bottom: 8px;">
              Ready to verify calendar availability for your wedding dates?
            </h4>
            <p style="font-size: 0.88rem; color: #52525b; margin-bottom: 20px;">
              Click below to send your quotation reference <strong>${quotation.referenceId}</strong> directly to our WhatsApp team for instant date verification.
            </p>

            <div class="formal-doc-actions no-print" style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <a href="${getWhatsAppUrl(quotation)}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="padding: 14px 28px; font-size: 0.95rem; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Confirm Availability on WhatsApp
              </a>
              <button type="button" class="btn btn-gold" id="btn-formal-print" style="padding: 14px 24px; font-weight: 600;">
                🖨️ Download / Print PDF
              </button>
              <button type="button" class="btn btn-outline-gold" id="btn-formal-close-bottom" style="padding: 14px 20px;">
                ✕ Close Document
              </button>
            </div>
          </div>

          <!-- Studio Representative Signature Block -->
          <div class="formal-signature-block">
            <div class="formal-sig-side">
              <span class="formal-sig-label">Authorized Studio Lead:</span>
              <div class="formal-sig-name">ANANT PRODUCTIONS</div>
              <div class="formal-sig-sub">Fine-Art Wedding Cinematography Studio &bull; Ahmedabad, Gujarat</div>
            </div>
            <div class="formal-sig-side" style="text-align: right;">
              <span class="formal-sig-label">Direct Studio Inquiries:</span>
              <div class="formal-sig-name">${biz.phone}</div>
              <div class="formal-sig-sub">${biz.email} &bull; anantproductions.in</div>
            </div>
          </div>
        </section>

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
          if (target === 5) {
            builderState.activeAddonCategory = 'albums';
          }
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
          if (next === 5) {
            builderState.activeAddonCategory = 'albums';
          }
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

    // Step 1: Coverage Scope Selection
    document.querySelectorAll('[data-select-scope]').forEach(card => {
      card.addEventListener('click', () => {
        const scope = card.getAttribute('data-select-scope');
        builderState.coverageScope = scope;
        saveDraftToStorage();
        renderBuilder();
        window.trackAnantEvent('coverage_scope_changed', { scope: scope });
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
        saveDraftToStorage();
      });
    }

    const venueGroomInput = document.getElementById('qb-input-venue-groom');
    if (venueGroomInput) {
      venueGroomInput.addEventListener('input', () => {
        builderState.eventDetails.venueGroom = venueGroomInput.value.trim();
        saveDraftToStorage();
      });
    }

    const venueBrideInput = document.getElementById('qb-input-venue-bride');
    if (venueBrideInput) {
      venueBrideInput.addEventListener('input', () => {
        builderState.eventDetails.venueBride = venueBrideInput.value.trim();
        saveDraftToStorage();
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

    // Step 4: Service Toggle
    document.querySelectorAll('[data-service-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-service-toggle');
        const current = builderState.crew[id] || 0;
        if (current > 0) {
          builderState.crew[id] = 0;
        } else {
          builderState.crew[id] = 1;
        }
        renderBuilder();
        window.trackAnantEvent('service_toggled', { serviceId: id, active: builderState.crew[id] > 0 });
      });
    });

    // Step 4: Crew Steppers (backward-compatibility)
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

    // Step 5: Addon Filter Tabs (Toggleable Category Filters)
    document.querySelectorAll('[data-addon-filter]').forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-addon-filter');
        if (builderState.activeAddonCategory === filter) {
          // Toggle off: if clicked again, show all categories
          builderState.activeAddonCategory = null;
        } else {
          builderState.activeAddonCategory = filter;
        }
        renderBuilder();
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
