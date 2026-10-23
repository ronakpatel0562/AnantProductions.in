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

  const formatINR = (engine && typeof engine.formatINR === 'function')
    ? engine.formatINR
    : function (amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return 'Custom Quote';
        return '₹' + Math.round(Number(amount)).toLocaleString('en-IN');
      };

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
          builderState.currentStep = getStepList().length; // Jump straight to final review & proposal
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

    // If draft had custom package selected, reset to default signature package
    if (builderState.packageId === 'custom' || builderState.eventCategory === 'custom') {
      builderState.eventCategory = 'wedding';
      builderState.packageId = 'pkg-wedding-signature';
    }

    // Clamp currentStep to current dynamic step count
    const maxSteps = getStepList().length;
    if (builderState.currentStep && builderState.currentStep > maxSteps) {
      builderState.currentStep = maxSteps;
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

    // Auto-open PDF modal if view=pdf is in URL hash or query params
    if (window.location.hash.includes('view=pdf') || window.location.search.includes('view=pdf')) {
      setTimeout(() => {
        const formalModal = document.getElementById('qb-formal-modal');
        if (formalModal) {
          formalModal.style.display = 'flex';
          void formalModal.offsetWidth;
          formalModal.classList.add('active');
          formalModal.scrollTop = 0;
        }
      }, 350);
    }

    // Listen to hash changes for deep linking
    window.addEventListener('hashchange', () => {
      if (window.location.hash.includes('quote=')) {
        loadInitialState();
        renderBuilder();
        if (window.location.hash.includes('view=pdf')) {
          setTimeout(() => {
            const formalModal = document.getElementById('qb-formal-modal');
            if (formalModal) {
              formalModal.style.display = 'flex';
              void formalModal.offsetWidth;
              formalModal.classList.add('active');
              formalModal.scrollTop = 0;
            }
          }, 350);
        }
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
      const activeStep = document.getElementById('qb-active-step');
      if (activeStep) {
        activeStep.scrollTop = 0;
      }
      const appEl = document.getElementById('quotation-builder-app');
      const section = document.getElementById('quotation-builder');
      const targetEl = appEl || section;
      if (targetEl && !document.body.classList.contains('qb-standalone-page')) {
        const navbar = document.querySelector('.navbar');
        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetY = window.pageYOffset + targetEl.getBoundingClientRect().top - navHeight - 24;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
      }
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

    builderState.currentStep = 4; // Jump to deliverables & add-ons configuration
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
              ${builderState.currentStep === getStepList().length ? 'Send WhatsApp' : 'Next Step →'}
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

  // STEP DEFINITION (DYNAMIC: 6 STEPS FOR WEDDING, 5 STEPS FOR NON-WEDDING)
  function getStepList() {
    const isWedding = (builderState.eventCategory === 'wedding' && builderState.packageId !== 'custom');
    if (isWedding) {
      return [
        { id: 'event_type', title: 'Event Type', kicker: 'STEP 01 OF 06 • EVENT TYPE & CELEBRATION' },
        { id: 'coverage_scope', title: 'Coverage Scope', kicker: 'STEP 02 OF 06 • COVERAGE SCOPE' },
        { id: 'details', title: 'Details', kicker: 'STEP 03 OF 06 • CELEBRATION DETAILS' },
        { id: 'base_plan', title: 'Base Plan', kicker: 'STEP 04 OF 06 • CHOOSE BASE PACKAGE' },
        { id: 'addons', title: 'Add-ons', kicker: 'STEP 05 OF 06 • CUSTOMIZE DELIVERABLES & ADD-ONS' },
        { id: 'submit', title: 'Your Quotation', kicker: 'STEP 06 OF 06 • YOUR DETAILS & PROPOSAL' }
      ];
    } else {
      return [
        { id: 'event_type', title: 'Event Type', kicker: 'STEP 01 OF 05 • EVENT TYPE & CELEBRATION' },
        { id: 'details', title: 'Details', kicker: 'STEP 02 OF 05 • CELEBRATION DETAILS' },
        { id: 'base_plan', title: 'Base Plan', kicker: 'STEP 03 OF 05 • CHOOSE BASE PACKAGE' },
        { id: 'addons', title: 'Add-ons', kicker: 'STEP 04 OF 05 • CUSTOMIZE DELIVERABLES & ADD-ONS' },
        { id: 'submit', title: 'Your Quotation', kicker: 'STEP 05 OF 05 • YOUR DETAILS & PROPOSAL' }
      ];
    }
  }

  // STEP TABS
  function renderStepperTabs() {
    const steps = getStepList();
    return steps.map((s, idx) => {
      const stepNum = idx + 1;
      const isCurrent = stepNum === builderState.currentStep;
      const isPast = stepNum < builderState.currentStep;
      return `
        <button type="button" class="qb-step-pill ${isCurrent ? 'active' : ''} ${isPast ? 'completed' : ''}" 
          data-goto-step="${stepNum}" 
          aria-current="${isCurrent ? 'step' : 'false'}"
          title="Step ${stepNum}: ${s.title}">
          <span class="qb-step-num">${isPast ? '✓' : '0' + stepNum}</span>
          <span class="qb-step-name">${s.title}</span>
        </button>
      `;
    }).join('');
  }

  // RENDER CURRENT ACTIVE STEP
  function renderCurrentStep(quotation) {
    const steps = getStepList();
    const currentIdx = Math.max(0, Math.min(steps.length - 1, (builderState.currentStep || 1) - 1));
    const step = steps[currentIdx];

    switch (step.id) {
      case 'event_type': return renderStep1_EventType(step);
      case 'coverage_scope': return renderStep_CoverageScope(step, quotation);
      case 'details': return renderStep2_EventDetails(step);
      case 'base_plan': return renderStep3_BasePackage(step, quotation);
      case 'addons': return renderStep4_DeliverablesAddons(step);
      case 'submit': return renderStep_FinalQuotationAndContact(step, quotation);
      default: return renderStep1_EventType(step);
    }
  }

  // ================= STEP 1: EVENT TYPE =================
  function renderStep1_EventType(stepInfo) {
    const isTwoDayWedding = (builderState.eventCategory === 'wedding' && builderState.packageId !== 'custom');

    const categories = [
      { id: 'wedding', name: 'Two-Day Wedding', guj: 'લગ્ન પ્રસંગ (બે દિવસ)', desc: 'Mandva, Pithi, Garba, Hasta Melap & Reception', icon: '💍', badge: 'Most Popular' },
      { id: 'prewed', name: 'Pre-Wedding & Couple Film', guj: 'પ્રી-વેડિંગ શૂટ', desc: 'Concept couple portraiture and cinematic romance in scenic backdrops', icon: '📸', badge: 'High-Demand' },
      { id: 'engagement', name: 'Engagement / Sakar Pudo', guj: 'સગાઈ અને ગોળધાણા', desc: 'Ring ceremony, family blessings, and evening dinner celebration', icon: '✨', badge: null },
      { id: 'functions', name: 'Individual Functions', guj: 'વ્યક્તિગત પ્રસંગો', desc: 'Standalone Haldi/Pithi, Mehndi, Midnight Garba, or Reception', icon: '🪔', badge: null }
    ];

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'STEP 01 • EVENT TYPE & CELEBRATION'}</span>
        <h3 class="qb-step-title">Select your celebration type</h3>
        <p class="qb-step-desc">
          Choose your primary celebration category to customize your photography &amp; cinematography collection.
        </p>
      </div>

      <!-- CELEBRATION CATEGORY -->
      <div style="margin: 0 0 16px 0;">
        <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">CELEBRATION CATEGORY</span>
        <h4 style="font-family: 'Cinzel', serif; font-size: 1.12rem; color: var(--foreground); margin: 0 0 6px 0;">What celebration are we documenting?</h4>
      </div>

      <div class="qb-category-grid" role="radiogroup" aria-label="Event category selection">
        ${categories.map(cat => {
          const isSelected = (builderState.eventCategory === cat.id);
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
          ${isTwoDayWedding ? 'Continue to Coverage Scope →' : 'Continue to Celebration Details →'}
        </button>
      </div>
    `;
  }

  // ================= STEP: COVERAGE SCOPE (WEDDING ONLY) =================
  function renderStep_CoverageScope(stepInfo, quotation) {
    const scopes = Array.isArray(config.coverageScopes) 
      ? config.coverageScopes 
      : Object.values(config.coverageScopes || {});

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'STEP 02 OF 08 • COVERAGE SCOPE'}</span>
        <h3 class="qb-step-title">Are you looking for One-Side or Both-Side Coverage?</h3>
        <p class="qb-step-desc">
          Select whether you are booking for one family side (Bride OR Groom) or both family sides. Joint venues and multi-location celebrations include dedicated parallel cinematographers and photographers with an adjusted package investment.
        </p>
      </div>

      <div class="qb-scope-grid" role="radiogroup" aria-label="Coverage scope selection">
        ${scopes.map(scope => {
          const isSelected = (builderState.coverageScope === scope.id);
          const multiplier = Number(scope.multiplier || 1.0);
          const startingVal = Math.round(40000 * multiplier);
          const signatureVal = Math.round(75000 * multiplier);
          const badgeText = multiplier > 1.0 ? 'With Extra Charge' : 'Standard';

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
                <span class="qb-scope-badge ${multiplier > 1.0 ? 'badge-extra' : ''}">
                  ${badgeText}
                </span>
              </div>
              <p class="qb-scope-desc">${scope.description}</p>
              <div style="margin: 12px 0 8px; font-family: var(--font-mono); font-size: 0.82rem; color: var(--gold-light);">
                Starting from <strong>${formatINR(startingVal)}</strong> &bull; Signature <strong>${formatINR(signatureVal)}</strong>
              </div>
              <div class="qb-scope-status">
                <span>${isSelected ? '● Selected Setup' : '○ Click to Select'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="${builderState.currentStep - 1}">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="${builderState.currentStep + 1}">
          Continue to Celebration Details →
        </button>
      </div>
    `;
  }

  // ================= STEP: EVENT DETAILS =================
  function renderStep2_EventDetails(stepInfo) {
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
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'EVENT DETAILS & SCHEDULE'}</span>
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
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="${builderState.currentStep - 1}">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="${builderState.currentStep + 1}">Select Base Package →</button>
      </div>
    `;
  }

  // ================= STEP: BASE PACKAGE SELECTION =================
  function renderStep3_BasePackage(stepInfo, quotation) {
    const cat = builderState.eventCategory;
    const catData = config.packageCategories[cat] || config.packageCategories.wedding;
    const packages = catData.packages || [];
    const isWedding = (cat === 'wedding');
    const scopeMultiplier = isWedding 
      ? (builderState.coverageScope === 'both_diff_venues' ? 1.85 : (builderState.coverageScope === 'both_same_venue' ? 1.4 : 1.0))
      : 1.0;

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'CHOOSE BASE PACKAGE'}</span>
        <h3 class="qb-step-title">Select your foundational collection for ${catData.name}</h3>
        <p class="qb-step-desc">
          Choose a curated collection tier below. All packages can be tailored with optional add-ons in the next step.
        </p>
      </div>

      <div class="qb-package-cards-grid">
        ${packages.map(pkg => {
          const isSelected = builderState.packageId === pkg.id;
          const baseIndicative = pkg.indicativePrice || 40000;
          const calculatedDiscounted = Math.round(baseIndicative * scopeMultiplier);
          const baseOriginal = (pkg.id === 'pkg-wedding-essential' ? 50000 : (pkg.id === 'pkg-wedding-signature' ? 100000 : (pkg.id === 'pkg-wedding-premium' ? 150000 : null)));
          const calculatedOriginal = baseOriginal ? Math.round(baseOriginal * scopeMultiplier) : null;

          const displayPrice = (isWedding && scopeMultiplier > 1.0) 
            ? formatINR(calculatedDiscounted) 
            : pkg.price;
          const displayOriginal = (isWedding && scopeMultiplier > 1.0 && calculatedOriginal)
            ? formatINR(calculatedOriginal)
            : pkg.originalPrice;

          // Curate 3-4 clean high-impact highlights per tier
          let filteredDeliverables = [];
          if (pkg.id === 'pkg-wedding-essential') {
            filteredDeliverables = [
              'Traditional Photography & Sacred Ritual Documentation',
              'Curated Ultra-High-Resolution RAW Master Gallery',
              'Handpicked, Artistically Retouched Master Portraits',
              'Private Online Cloud Gallery with Full Print Rights'
            ];
          } else if (pkg.id === 'pkg-wedding-signature') {
            filteredDeliverables = [
              'Synchronized Candid Photography & 4K Wedding Cinema',
              'Curated RAW Master Gallery & Retouched Portraits',
              'One 3–5 Min Cinematic 4K Highlight Story Film',
              'One Vertical 9:16 Reel for WhatsApp & Instagram'
            ];
          } else if (pkg.id === 'pkg-wedding-premium') {
            filteredDeliverables = [
              'Extended Hours: Early Mandva to Late Midnight Garba',
              'Candid Photography, 4K Cinema & Production Lighting',
              'Master 4K Wedding Story Film & Vertical 9:16 Social Reels',
              'Dedicated Couple Portrait Session & Priority Turnaround'
            ];
          } else {
            filteredDeliverables = (pkg.deliverables || [])
              .filter(d => !d.toLowerCase().includes('coverage (up to') && !d.toLowerCase().includes('two-day coverage'))
              .slice(0, 4);
          }

          return `
            <div class="package-card qb-tier-card ${pkg.featured ? 'featured' : ''} ${isSelected ? 'selected' : ''}" data-select-package="${pkg.id}">
              ${pkg.badge ? `<span class="qb-tier-badge">★ ${pkg.badge}</span>` : ''}
              
              <div class="package-header">
                <span class="package-tag">${pkg.tag}</span>
                <h4 class="package-title">${pkg.name}</h4>
                
                <div class="package-price-wrap">
                  <span class="package-price">${displayPrice}</span>
                  ${displayOriginal ? `
                    <span class="package-orig-price">${displayOriginal}</span>
                    <span class="package-save-pill">Special Rate</span>
                  ` : ''}
                </div>

                ${isWedding && scopeMultiplier > 1.0 ? `
                  <div style="font-size: 0.72rem; color: var(--gold-light); background: rgba(212,175,55,0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(212,175,55,0.25); display: inline-block; margin-bottom: 8px;">
                    Adjusted for ${builderState.coverageScope === 'both_same_venue' ? 'Joint Venue' : 'Separate Locations'}
                  </div>
                ` : ''}

                <div class="package-hours-pill">⏱ ${pkg.duration} &bull; ${pkg.hours}</div>
                <p class="package-scope">${pkg.summary}</p>
              </div>

              <div>
                <ul class="package-features">
                  ${filteredDeliverables.map(del => `
                    <li class="package-feature">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>${del}</span>
                    </li>
                  `).join('')}
                </ul>

                <button type="button" class="btn ${isSelected ? 'btn-gold' : 'btn-outline-gold'} qb-btn-choose-pkg" style="width: 100%; justify-content: center;">
                  ${isSelected ? '✓ Plan Selected' : 'Select ' + pkg.name}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qb-step-footer">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="${builderState.currentStep - 1}">← Back</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="${builderState.currentStep + 1}">Customize Add-ons &amp; Deliverables →</button>
      </div>
    `;
  }

  // ================= STEP: DELIVERABLES & ADD-ONS =================
  function renderStep4_DeliverablesAddons(stepInfo) {
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
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'DELIVERABLES &amp; ADD-ON CATALOGUE'}</span>
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
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="${builderState.currentStep - 1}">← Back to Base Plan</button>
        <button type="button" class="btn btn-gold qb-btn-next" data-step-next="${builderState.currentStep + 1}">Continue to Final Quotation →</button>
      </div>
    `;
  }

  // ================= STEP: FINAL QUOTATION & CONTACT =================
  function renderStep_FinalQuotationAndContact(stepInfo, quotation) {
    const c = builderState.customer;
    const waUrl = getWhatsAppUrl(quotation);

    return `
      <div class="qb-step-header">
        <span class="qb-step-kicker">${stepInfo ? stepInfo.kicker : 'YOUR DETAILS & PROPOSAL'}</span>
        <h3 class="qb-step-title">Your Custom Quotation is Ready</h3>
        <p class="qb-step-desc">
          Enter your contact details to lock your launch rate, review the formal 8-section PDF quotation, or dispatch directly on WhatsApp.
        </p>
      </div>

      <div class="qb-final-grid">
        <!-- Contact Form (Left) -->
        <div class="qb-final-card">
          <div class="qb-final-card-header">
            <span class="qb-final-card-num">01</span>
            <div>
              <h4 class="qb-final-card-title">Couple &amp; Booking Details</h4>
              <p class="qb-final-card-sub">Where should we confirm Muhurat date availability?</p>
            </div>
          </div>

          <div class="form-grid" style="gap: 12px;">
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
              <label class="form-label" for="qb-cust-notes">Special Vision or Questions (Optional)</label>
              <textarea id="qb-cust-notes" class="form-textarea" style="min-height: 52px; height: 52px; resize: none;" placeholder="Unique family customs, Panditji muhurat timings, or venue details…">${c.notes || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- Action Cards (Full-Width Flow) -->
        <div class="qb-final-card">
          <div class="qb-final-card-header">
            <span class="qb-final-card-num">02</span>
            <div>
              <h4 class="qb-final-card-title">Instant Dispatch &amp; Official Proposal</h4>
              <p class="qb-final-card-sub">Instant quotation with zero waiting — Lock your Muhurat date rate</p>
            </div>
          </div>

          <div class="qb-action-stack">
            <!-- 1. Send via WhatsApp (Primary Highlight CTA) -->
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp qb-action-main-btn" id="btn-qb-whatsapp-send">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <span>Send Quotation on WhatsApp</span>
            </a>

            <!-- 2. Formal Quotation & PDF Print -->
            <div class="qb-action-row">
              <button type="button" class="btn btn-gold" id="btn-qb-open-formal">
                📄 Review &amp; Download PDF Quotation
              </button>
              <button type="button" class="btn btn-outline-gold" id="btn-qb-print-direct">
                🖨️ Direct Print Document
              </button>
            </div>

            <!-- 3. Share & Copy Tools -->
            <div class="qb-action-row">
              <button type="button" class="btn btn-outline-gold" id="btn-qb-copy-link">
                🔗 Copy Shareable Link
              </button>
              <button type="button" class="btn btn-outline-gold" id="btn-qb-copy-summary">
                📋 Copy Summary Text
              </button>
            </div>

            <div class="qb-final-ref-banner">
              Proposal Ref: <strong>${quotation.referenceId}</strong> &bull; Estimated Total: <strong>${quotation.estimatedTotalFormatted}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Feedback Toast -->
      <div id="qb-toast" class="qb-toast" style="display: none;" role="status"></div>

      <div class="qb-step-footer" style="margin-top: 16px;">
        <button type="button" class="btn btn-outline-gold qb-btn-prev" data-step-prev="${builderState.currentStep - 1}">← Back to Add-ons</button>
        <button type="button" class="btn btn-outline-gold" data-step-goto="1">↺ Start New Quotation</button>
      </div>
    `;
  }

  // ================= STICKY SUMMARY CARD =================
  function renderSummaryCard(quotation) {
    const isFinalStep = (builderState.currentStep === getStepList().length);

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
            <strong>${quotation.coverageScope === 'both_diff_venues' ? 'Both Sides (Separate Locations)' : (quotation.coverageScope === 'both_same_venue' ? 'Both Sides (Joint Venue)' : 'One-Side')}</strong>
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
          <button type="button" class="btn btn-gold qb-sum-btn-formal" id="btn-summary-open-formal" style="width: 100%; margin-bottom: 8px; justify-content: center; font-size: 0.86rem; padding: 10px 14px;">
            📄 Review &amp; Download PDF
          </button>

          ${!isFinalStep ? `
            <a href="${getWhatsAppUrl(quotation)}" target="_blank" rel="noopener" class="btn btn-whatsapp qb-sum-btn-wa" id="btn-summary-whatsapp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Send Quotation on WhatsApp
            </a>
          ` : `
            <div style="font-size: 0.74rem; color: var(--gold-light); text-align: center; margin: 6px 0; font-family: var(--font-mono);">
              ✦ Enter contact details to lock proposal rates
            </div>
          `}

          <button type="button" class="btn btn-outline-gold qb-sum-btn-share" id="btn-summary-share-link" style="margin-top: 6px;">
            🔗 Share Quotation Link
          </button>
        </div>

        <div class="qb-sum-legal">
          Transparent estimate. Booking confirmed strictly upon date calendar verification and advance token receipt.
        </div>
      </div>
    `;
  }

  // ================= DEAL-CLOSING FORMAL QUOTATION DOCUMENT =================
  function renderFormalQuotationDocument(quotation) {
    const biz = config.business;
    const cust = quotation.customer;
    const evt = quotation.eventDetails;

    return `
      <div class="formal-doc">
        
        <!-- HEADER: BRAND & OFFICIAL PROPOSAL META -->
        <header class="formal-doc-header">
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
            <div class="formal-doc-meta-badge">OFFICIAL QUOTATION</div>
            <div class="formal-doc-ref">Ref: <strong>${quotation.referenceId}</strong></div>
            <div class="formal-doc-date">Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div class="formal-doc-validity">Validity: 7 Days (To Lock Dates)</div>
          </div>
        </header>

        <!-- BANNER -->
        <div class="formal-cover-banner">
          <span class="formal-cover-kicker">PERSONALIZED WEDDING QUOTATION</span>
          <h1 class="formal-cover-title">Your Wedding Visual Storytelling Quotation</h1>
          <p class="formal-cover-subtitle">તમારા લગ્ન પ્રસંગનું વિશેષ પ્રપોઝલ — Fine-Art Stills &amp; 4K Cinematic Highlights</p>
        </div>

        <!-- CLIENT & CELEBRATION PROFILE -->
        <div class="formal-doc-info-grid">
          <div class="formal-doc-info-box">
            <h4>Prepared Especially For:</h4>
            <p>
              <strong style="font-size: 1.08rem; color: #18181b;">${cust.names || 'Honored Couple &amp; Family'}</strong><br>
              <span>WhatsApp: <strong>${cust.phone || 'Provided via inquiry'}</strong></span><br>
              ${cust.email ? `<span>Email: ${cust.email}</span><br>` : ''}
              <span>Preferred Communication: WhatsApp</span>
            </p>
          </div>
          <div class="formal-doc-info-box">
            <h4>Celebration Schedule &amp; Scope:</h4>
            <p>
              <strong>Selected Collection:</strong> ${quotation.basePackageName}<br>
              <strong>Coverage Scope:</strong> ${quotation.coverageScopeLabel || 'One-Side Coverage'}<br>
              <strong>City &amp; Venues:</strong> ${evt.city}${evt.venue ? ' &bull; ' + evt.venue : ''}<br>
              <strong>Celebration Dates:</strong> ${evt.dates || 'Dates to be finalized'}<br>
              <strong>Celebration Duration:</strong> ${evt.days} Day(s) &bull; ~${evt.approxHoursPerDay} hrs/day
            </p>
          </div>
        </div>

        <!-- ITEMIZED COMMERCIAL INVESTMENT TABLE -->
        <section class="formal-doc-section" style="margin-top: 20px;">
          <div class="formal-section-head" style="margin-bottom: 12px;">
            <span class="formal-section-kicker">COMMERCIAL PROPOSAL</span>
            <h3 class="formal-section-title">Itemized Investment Breakdown</h3>
            <p class="formal-section-desc">
              100% transparent pricing for your selected collection and tailored add-ons. Zero hidden surcharges.
            </p>
          </div>

          <div class="formal-doc-table-wrap">
            <table class="formal-doc-table">
              <thead>
                <tr>
                  <th style="width: 52%; text-align: left;">Service Description &amp; Scope</th>
                  <th style="width: 24%; text-align: center;">Category / Scope</th>
                  <th style="width: 24%; text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.lineItems.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                      ${item.description ? `<div style="font-size: 0.78rem; color: #52525b; margin-top: 2px;">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center; font-size: 0.82rem;">
                      ${item.isIncluded 
                        ? '<span style="color: #15803d; font-weight: 600;">Included in Tier</span>' 
                        : (item.type === 'service' ? '<span style="color: #9a7718; font-weight: 600;">Active Coverage</span>' : `<span class="formal-table-category">${item.category}</span>`)
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
                  <td colspan="2" style="text-align: right; font-weight: 600;">Subtotal Investment:</td>
                  <td style="text-align: right; font-weight: 600;">${quotation.subtotalFormatted}</td>
                </tr>
                ${quotation.discountAmount > 0 ? `
                  <tr style="color: #15803d;">
                    <td colspan="2" style="text-align: right; font-weight: 600;">${quotation.appliedDiscount?.name || 'Discount / Savings'}:</td>
                    <td style="text-align: right; font-weight: 600;">-${quotation.discountFormatted}</td>
                  </tr>
                ` : ''}
                <tr class="formal-doc-total-row">
                  <td colspan="2" style="text-align: right; font-size: 1.15rem; font-weight: 700;">Final Proposed Investment:</td>
                  <td style="text-align: right; font-size: 1.3rem; font-weight: 700; color: #9a7718;">${quotation.estimatedTotalFormatted}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <!-- NEXT STEPS: LOCK YOUR WEDDING DATE -->
        <section class="formal-doc-section formal-doc-closing" style="margin-top: 24px; padding-top: 20px;">
          <div class="formal-cta-box" style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px;">
            <h4 style="font-family: 'Cinzel', serif; font-size: 1.15rem; color: #18181b; margin-bottom: 8px;">
              Ready to Lock Your Wedding Dates?
            </h4>
            <p style="font-size: 0.88rem; color: #52525b; margin-bottom: 16px; line-height: 1.5;">
              • <strong>Date Reservation Advance:</strong> A 25% booking deposit locks and exclusively reserves your dates on our production calendar.<br>
              • <strong>Balance Milestone:</strong> The remaining balance is split between your celebration week and final master delivery.<br>
              • Share your reference <strong>${quotation.referenceId}</strong> on WhatsApp to verify date availability and confirm booking details.
            </p>

            <div class="formal-doc-actions no-print" style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <a href="${getWhatsAppUrl(quotation)}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="padding: 14px 28px; font-size: 0.95rem; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Confirm Dates on WhatsApp
              </a>
              <button type="button" class="btn btn-gold" id="btn-formal-print" style="padding: 14px 24px; font-weight: 600;">
                🖨️ Download / Print PDF
              </button>
              <button type="button" class="btn btn-outline-gold" id="btn-formal-close-bottom" style="padding: 14px 20px;">
                ✕ Close
              </button>
            </div>
          </div>

          <!-- Studio Representative Signature Block -->
          <div class="formal-signature-block" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4;">
            <div class="formal-sig-side">
              <span class="formal-sig-label">Authorized Studio Desk:</span>
              <div class="formal-sig-name">ANANT PRODUCTIONS</div>
              <div class="formal-sig-sub">Bodakdev, Sindhu Bhavan Road, Ahmedabad, Gujarat</div>
            </div>
            <div class="formal-sig-side" style="text-align: right;">
              <span class="formal-sig-label">Direct Studio WhatsApp &amp; Inquiries:</span>
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
        syncCurrentInputs();
        if (target <= builderState.currentStep || validateCurrentStep()) {
          builderState.currentStep = target;
          const steps = getStepList();
          const targetStep = steps[target - 1];
          if (targetStep && targetStep.id === 'addons') {
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
        syncCurrentInputs();
        if (validateCurrentStep()) {
          const next = Number(btn.getAttribute('data-step-next')) || (builderState.currentStep + 1);
          builderState.currentStep = next;
          const steps = getStepList();
          const targetStep = steps[next - 1];
          if (targetStep && targetStep.id === 'addons') {
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
        syncCurrentInputs();
        const prev = Number(btn.getAttribute('data-step-prev')) || Math.max(1, builderState.currentStep - 1);
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
        builderState.eventCategory = cat;
        if (cat !== 'wedding') {
          builderState.coverageScope = 'one_side';
        }
        // select first package in category
        const catPkgs = config.packageCategories[cat]?.packages || [];
        builderState.packageId = catPkgs[0]?.id || 'pkg-wedding-signature';
        builderState.eventDetails.days = catPkgs[0]?.standardDays || (cat === 'wedding' ? 2 : 1);
        const maxSteps = getStepList().length;
        if (builderState.currentStep > maxSteps) {
          builderState.currentStep = maxSteps;
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

    const summaryFormalBtn = document.getElementById('btn-summary-open-formal');
    if (summaryFormalBtn) {
      summaryFormalBtn.addEventListener('click', () => openFormalModal(false));
    }

    const headerFormalBtn = document.getElementById('btn-header-open-formal');
    if (headerFormalBtn) {
      headerFormalBtn.addEventListener('click', () => openFormalModal(false));
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

    // Unified WhatsApp & Official PDF Dispatch
    function dispatchWhatsAppWithQuotation(e) {
      if (e && e.preventDefault) e.preventDefault();
      syncCurrentInputs();

      // Recalculate quotation with current synchronized state
      const currentQuote = engine.calculateQuotation(config, builderState);
      currentQuote.customer = { ...builderState.customer };
      currentQuote.eventDetails = { ...builderState.eventDetails };

      // Generate message with official PDF document link
      const freshMsg = engine.generateWhatsAppMessage(currentQuote, config);
      const phoneRaw = config.business.phoneRaw || '918000088819';
      const waUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(freshMsg)}`;

      // 1. Immediately open official formal PDF quotation modal
      openFormalModal(false);

      // 2. Automatically prompt browser PDF Save / Print with official branded filename
      setTimeout(() => {
        triggerQuotationPrint();
      }, 450);

      // 3. Open WhatsApp Web / App
      const waWindow = window.open(waUrl, '_blank');
      if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
        window.location.href = waUrl;
      }

      showToast('✓ WhatsApp opened & Official PDF Quotation ready to save/attach!');
      window.trackAnantEvent('whatsapp_enquiry_clicked', { ref: currentQuote.referenceId, total: currentQuote.estimatedTotal });
    }

    const waSendBtn = document.getElementById('btn-qb-whatsapp-send');
    if (waSendBtn) {
      waSendBtn.addEventListener('click', dispatchWhatsAppWithQuotation);
    }

    const sumWaBtn = document.getElementById('btn-summary-whatsapp');
    if (sumWaBtn) {
      sumWaBtn.addEventListener('click', dispatchWhatsAppWithQuotation);
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
      mobileNextBtn.addEventListener('click', (e) => {
        const totalSteps = getStepList().length;
        if (builderState.currentStep === totalSteps) {
          dispatchWhatsAppWithQuotation(e);
        } else if (validateCurrentStep()) {
          builderState.currentStep = Math.min(totalSteps, builderState.currentStep + 1);
          renderBuilder();
          scrollToQuotationSection();
        }
      });
    }
  }

  // SYNC DOM INPUTS TO STATE
  function syncCurrentInputs() {
    const custNames = document.getElementById('qb-cust-names');
    if (custNames) builderState.customer.names = custNames.value.trim();
    const custPhone = document.getElementById('qb-cust-phone');
    if (custPhone) builderState.customer.phone = custPhone.value.trim();
    const custEmail = document.getElementById('qb-cust-email');
    if (custEmail) builderState.customer.email = custEmail.value.trim();
    const custNotes = document.getElementById('qb-cust-notes');
    if (custNotes) builderState.customer.notes = custNotes.value.trim();
    const datesInput = document.getElementById('qb-input-dates');
    if (datesInput && !builderState.eventDetails.isDateFlexible) {
      builderState.eventDetails.dates = datesInput.value.trim();
    }
    const venueInput = document.getElementById('qb-input-venue');
    if (venueInput) builderState.eventDetails.venue = venueInput.value.trim();
    const venueGroom = document.getElementById('qb-input-venue-groom');
    if (venueGroom) builderState.eventDetails.venueGroom = venueGroom.value.trim();
    const venueBride = document.getElementById('qb-input-venue-bride');
    if (venueBride) builderState.eventDetails.venueBride = venueBride.value.trim();
  }

  // VALIDATION
  function validateCurrentStep() {
    syncCurrentInputs();
    const steps = getStepList();
    const currentIdx = Math.max(0, Math.min(steps.length - 1, (builderState.currentStep || 1) - 1));
    const step = steps[currentIdx];

    if (step && step.id === 'details') {
      if (!builderState.eventDetails.isDateFlexible && !builderState.eventDetails.dates) {
        alert('Please enter your wedding date or check "Date not finalized yet".');
        return false;
      }
    }
    if (step && step.id === 'submit') {
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
