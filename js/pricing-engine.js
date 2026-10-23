/**
 * ANANT PRODUCTIONS — PRICING & QUOTATION ENGINE
 * 
 * Pure, deterministic pricing system and quotation generator.
 * Works seamlessly in both browser and Node.js test environments.
 * 
 * Principles:
 * 1. Single source of truth for pricing models.
 * 2. Integer arithmetic in rupees (or paise) to avoid floating point bugs.
 * 3. Package inclusion subtraction (zero duplicate charges for included items).
 * 4. Transparent handling of custom-quoted or unpriced services.
 * 5. Indian currency formatting (₹XX,XXX).
 * 6. URL hash / query state serialization for instant quote sharing.
 */

(function (global) {
  'use strict';

  // Indian Rupee Currency Formatter
  function formatINR(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'Custom Quote';
    }
    const num = Math.round(Number(amount));
    return '₹' + num.toLocaleString('en-IN');
  }

  // Generate Unique Quotation Reference ID (e.g. AP-2026-X8K2)
  function generateQuoteRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `AP-${year}-${code}`;
  }

  /**
   * Main Calculation Engine
   * @param {Object} config - The master ANANT_CONFIG object
   * @param {Object} state - The user's active builder state
   * @returns {Object} quotation - Fully calculated quotation object
   */
  function calculateQuotation(config, state) {
    state = state || {};
    const eventCategory = state.eventCategory || 'wedding';
    const packageId = state.packageId || 'pkg-wedding-signature';
    const eventDetails = state.eventDetails || {};
    const selectedAddons = state.selectedAddons || {}; // addonId -> quantity
    const crewCustomization = state.crew || {}; // crewId -> delta or count
    const launchOfferActive = state.applyLaunchOffer || false;

    // 1. Find Base Package
    const categoryPackages = (config.packageCategories && config.packageCategories[eventCategory]) 
      ? config.packageCategories[eventCategory].packages 
      : (config.packages || []);

    let basePackage = null;
    let isCustomPackage = (packageId === 'custom' || packageId === 'pkg-custom');

    if (!isCustomPackage) {
      basePackage = categoryPackages.find(p => p.id === packageId);
      // Fallback: look across all categories
      if (!basePackage && config.packageCategories) {
        for (const catKey of Object.keys(config.packageCategories)) {
          const found = config.packageCategories[catKey].packages.find(p => p.id === packageId);
          if (found) {
            basePackage = found;
            break;
          }
        }
      }
    }

    const lineItems = [];
    let subtotal = 0;
    let hasCustomQuote = false;

    // Base Package Line Item
    if (basePackage && !isCustomPackage) {
      const pkgPrice = Number(basePackage.indicativePrice || 0);
      subtotal += pkgPrice;
      lineItems.push({
        id: basePackage.id,
        name: basePackage.name,
        category: 'Base Package',
        type: 'package',
        unit: basePackage.duration || 'Package',
        unitPrice: pkgPrice,
        quantity: 1,
        includedQuantity: 1,
        billableQuantity: 1,
        totalPrice: pkgPrice,
        isIncluded: false,
        isCustomQuote: false,
        summary: basePackage.summary || '',
        deliverables: basePackage.deliverables || []
      });
    } else {
      lineItems.push({
        id: 'pkg-custom',
        name: 'Build Your Own Custom Collection',
        category: 'Base Package',
        type: 'package',
        unit: 'Custom',
        unitPrice: 0,
        quantity: 1,
        includedQuantity: 0,
        billableQuantity: 0,
        totalPrice: 0,
        isIncluded: true,
        isCustomQuote: false,
        summary: 'Fully personalized bespoke coverage tailored item-by-item.'
      });
    }

    // Map of Inclusions provided by the base package
    // Key: addonId or canonical feature key -> included quantity
    const packageInclusions = (basePackage && basePackage.includedAddons) ? { ...basePackage.includedAddons } : {};

    // 2. Process Crew Customizations (Extra crew beyond package base)
    if (config.crewRoles) {
      config.crewRoles.forEach(role => {
        const baseCount = (basePackage && basePackage.baseCrew && basePackage.baseCrew[role.id]) ? basePackage.baseCrew[role.id] : 0;
        const requestedCount = (crewCustomization[role.id] !== undefined) ? Number(crewCustomization[role.id]) : baseCount;
        const extraCount = Math.max(0, requestedCount - baseCount);

        if (requestedCount > 0) {
          const roleRate = Number(role.ratePerEvent || 0);
          const daysMultiplier = Math.max(1, Number(eventDetails.days || 1));
          const billableRate = role.isPerDay ? (roleRate * daysMultiplier) : roleRate;
          const itemCost = extraCount * billableRate;

          subtotal += itemCost;

          lineItems.push({
            id: 'crew-' + role.id,
            name: role.name,
            category: 'Coverage Services',
            type: 'service',
            unit: role.isPerDay ? `${daysMultiplier} Day(s)` : 'Coverage',
            unitPrice: billableRate,
            quantity: 1,
            includedQuantity: baseCount > 0 ? 1 : 0,
            billableQuantity: extraCount > 0 ? 1 : 0,
            totalPrice: itemCost,
            isIncluded: (extraCount === 0),
            isCustomQuote: false,
            description: role.description
          });
        }
      });
    }

    // 3. Process Add-on Services (Catalogue)
    const catalogue = config.addOnCatalog || config.addOns || [];
    catalogue.forEach(addon => {
      const requestedQty = Number(selectedAddons[addon.id] || 0);
      const includedQty = Number(packageInclusions[addon.id] || 0);
      
      // If requested or included by package
      if (requestedQty > 0 || includedQty > 0) {
        const totalUnits = Math.max(requestedQty, includedQty);
        const billableQty = Math.max(0, requestedQty - includedQty);
        
        let unitPrice = Number(addon.defaultPrice || 0);
        let itemTotal = 0;
        let isCustom = (addon.pricingMethod === 'custom' || addon.defaultPrice === null || addon.defaultPrice === undefined);

        if (isCustom) {
          hasCustomQuote = true;
          itemTotal = 0;
        } else {
          // Dynamic pricing units
          if (addon.pricingMethod === 'per_hour') {
            const hours = Number(eventDetails.extraHours || requestedQty || 1);
            itemTotal = billableQty * unitPrice;
          } else if (addon.pricingMethod === 'per_day') {
            const days = Math.max(1, Number(eventDetails.days || 1));
            itemTotal = billableQty * unitPrice * days;
          } else {
            itemTotal = billableQty * unitPrice;
          }
        }

        subtotal += itemTotal;

        lineItems.push({
          id: addon.id,
          name: addon.name,
          category: addon.categoryName || 'Deliverables & Add-ons',
          type: 'addon',
          unit: addon.pricingUnit || 'Unit',
          unitPrice: unitPrice,
          quantity: totalUnits,
          includedQuantity: includedQty,
          billableQuantity: billableQty,
          totalPrice: itemTotal,
          isIncluded: (billableQty === 0 && includedQty > 0),
          isCustomQuote: isCustom,
          description: addon.description
        });
      }
    });

    // 4. Coverage Scope Adjustment (Only for 2-Day Wedding: Joint Venue = 1.4x, Different Locations = 1.85x)
    const isWeddingScopeApplicable = (eventCategory === 'wedding');
    const coverageScopeKey = isWeddingScopeApplicable ? (state.coverageScope || 'one_side') : 'one_side';
    let scopeConfig = null;
    if (Array.isArray(config.coverageScopes)) {
      scopeConfig = config.coverageScopes.find(s => s.id === coverageScopeKey);
    } else if (config.coverageScopes) {
      scopeConfig = config.coverageScopes[coverageScopeKey];
    }

    // Multipliers: both_same_venue = 1.4x, both_diff_venues = 1.85x, one_side = 1.0x
    const scopeMultiplier = scopeConfig 
      ? Number(scopeConfig.multiplier || (coverageScopeKey === 'both_diff_venues' ? 1.85 : (coverageScopeKey === 'both_same_venue' ? 1.4 : 1.0)))
      : (coverageScopeKey === 'both_diff_venues' ? 1.85 : (coverageScopeKey === 'both_same_venue' ? 1.4 : 1.0));

    // Multiplier applies to the base package price (or custom crew subtotal if custom)
    const baseSubjectPrice = Number(basePackage ? (basePackage.indicativePrice || 0) : subtotal);
    const scopeSurcharge = (isWeddingScopeApplicable && scopeMultiplier > 1.0)
      ? Math.round(baseSubjectPrice * (scopeMultiplier - 1.0))
      : 0;

    if (scopeSurcharge > 0) {
      subtotal += scopeSurcharge;
      const isJoint = (coverageScopeKey === 'both_same_venue');
      lineItems.push({
        id: isJoint ? 'scope-joint-venue' : 'scope-dual-locations',
        name: isJoint 
          ? 'Both Sides — Joint Venue Coverage' 
          : 'Both Sides — Different Locations Coverage',
        category: 'Coverage Scope',
        type: 'scope',
        unit: 'Celebration',
        unitPrice: scopeSurcharge,
        quantity: 1,
        includedQuantity: 0,
        billableQuantity: 1,
        totalPrice: scopeSurcharge,
        isIncluded: false,
        isCustomQuote: false,
        description: isJoint 
          ? 'Synchronized dual-family visual coverage at a single venue / hall (+40% on base package).'
          : 'Simultaneous dual-crew visual coverage across separate residences, simultaneous rituals, and Jaan procession (+85% on base package).'
      });
    }

    // 5. Multi-Day and Extra Functions adjustment (if not using custom packages)
    const categoryDefaultDays = (config.packageCategories && config.packageCategories[eventCategory] && config.packageCategories[eventCategory].defaultDays)
      ? config.packageCategories[eventCategory].defaultDays
      : ((basePackage && basePackage.standardDays) ? basePackage.standardDays : (eventCategory === 'wedding' ? 2 : 1));
    const totalDays = Number((eventDetails.days !== undefined && eventDetails.days !== null) ? eventDetails.days : categoryDefaultDays);
    const baseDays = (basePackage && basePackage.standardDays) ? basePackage.standardDays : categoryDefaultDays;
    if (totalDays > baseDays && !isCustomPackage) {
      const additionalDays = totalDays - baseDays;
      const additionalDayRate = (config.additionalDayRate || 24999);
      const daysTotal = additionalDays * additionalDayRate;
      subtotal += daysTotal;
      lineItems.push({
        id: 'adjustment-extra-days',
        name: `Additional Wedding Day Coverage (+${additionalDays} Day${additionalDays > 1 ? 's' : ''})`,
        category: 'Additional Coverage',
        type: 'coverage',
        unit: `${additionalDays} Day(s)`,
        unitPrice: additionalDayRate,
        quantity: additionalDays,
        includedQuantity: 0,
        billableQuantity: additionalDays,
        totalPrice: daysTotal,
        isIncluded: false,
        isCustomQuote: false,
        description: 'Coordinated visual documentation extended for multi-day Gujarati celebrations.'
      });
    }

    // 5. Promotional Discounts / Launch Offer
    let discountAmount = 0;
    let appliedDiscount = null;

    if (launchOfferActive && config.launchOffer && config.launchOffer.active) {
      // Check if applicable (e.g. Signature package or qualifying subtotal)
      if (packageId === 'pkg-wedding-signature' || packageId === 'pkg-signature') {
        discountAmount = (config.launchOffer && config.launchOffer.discountAmount) ? config.launchOffer.discountAmount : 25000;
        appliedDiscount = {
          code: 'LAUNCH_OFFER',
          name: config.launchOffer.badge || 'Founding Couple Launch Offer',
          amount: discountAmount,
          description: 'Special introductory savings for 2026–2027 wedding bookings.'
        };
      }
    } else if (state.promoCode && config.promoCodes && config.promoCodes[state.promoCode.toUpperCase()]) {
      const promo = config.promoCodes[state.promoCode.toUpperCase()];
      discountAmount = Number(promo.amount || 0);
      appliedDiscount = {
        code: promo.code,
        name: promo.name,
        amount: discountAmount,
        description: promo.description
      };
    }

    const estimatedTotal = Math.max(0, subtotal - discountAmount);

    // 6. Return Structured Quotation Object
    return {
      referenceId: state.referenceId || generateQuoteRef(),
      createdAt: new Date().toISOString(),
      validityDays: 30,
      eventCategory: eventCategory,
      packageId: packageId,
      basePackageName: basePackage ? basePackage.name : 'Custom Package',
      eventDetails: {
        eventType: eventDetails.eventType || 'Wedding Celebration',
        functions: eventDetails.functions || [],
        days: totalDays,
        dates: eventDetails.dates || (eventDetails.isDateFlexible ? 'Date not yet finalized' : 'Dates TBD'),
        isDateFlexible: Boolean(eventDetails.isDateFlexible),
        city: eventDetails.city || 'Ahmedabad',
        venue: eventDetails.venue || '',
        approxHoursPerDay: eventDetails.hoursPerDay || 6
      },
      customer: {
        names: state.customer?.names || '',
        phone: state.customer?.phone || '',
        email: state.customer?.email || '',
        preferredContact: state.customer?.preferredContact || 'WhatsApp',
        notes: state.customer?.notes || ''
      },
      coverageScope: coverageScopeKey,
      coverageScopeLabel: scopeConfig ? (scopeConfig.title || scopeConfig.name) : (coverageScopeKey === 'both_diff_venues' ? 'Both Sides — Different Locations' : (coverageScopeKey === 'both_same_venue' ? 'Both Sides — Joint Venue' : 'One-Side Coverage')),
      coverageScopeMultiplier: isWeddingScopeApplicable ? scopeMultiplier : 1.0,
      coverageScopeSurcharge: scopeSurcharge,
      lineItems: lineItems,
      subtotal: subtotal,
      subtotalFormatted: formatINR(subtotal),
      discountAmount: discountAmount,
      discountFormatted: formatINR(discountAmount),
      appliedDiscount: appliedDiscount,
      estimatedTotal: estimatedTotal,
      estimatedTotalFormatted: formatINR(estimatedTotal),
      hasCustomQuote: hasCustomQuote,
      status: hasCustomQuote 
        ? 'Estimate — Custom Items Require Confirmation' 
        : 'Transparent Indicative Quotation',
      isEstimate: true, // Formal booking requires date availability confirmation
      notes: [
        'Indicative proposed estimate subject to calendar date verification and schedule review.',
        'Travel and stay for destinations outside studio home hub (Ahmedabad) quoted transparently without surcharges.',
        'Drone coverage subject to local DGCA permissions, airspace classification, weather, and venue feasibility.',
        'Official date reservation locked upon receipt of formal token advance.'
      ]
    };
  }

  /**
   * Generate Clean, Beautifully Structured WhatsApp Message
   * Strictly adheres to Rules A, B, and C (no crew headcounts, no fixed photo counts)
   */
  function generateWhatsAppMessage(quote, config) {
    const biz = config.business || {};
    const ref = quote.referenceId;
    const cust = quote.customer || {};
    const evt = quote.eventDetails || {};
    const scopeLabel = quote.coverageScopeLabel || (quote.coverageScope === 'both_diff_venues' ? 'Both Sides (Separate Locations)' : (quote.coverageScope === 'both_same_venue' ? 'Both Sides (Joint Venue)' : 'One-Side Coverage'));

    let msg = `✨ *JAI SHREE KRISHNA / INQUIRY FOR ANANT PRODUCTIONS*\n`;
    msg += `*Quotation Reference:* ${ref}\n\n`;

    msg += `💍 *Couple / Family:* ${cust.names || 'Honored Couple'}\n`;
    msg += `📱 *WhatsApp:* ${cust.phone || 'Provided via chat'}\n`;
    if (cust.email) msg += `✉️ *Email:* ${cust.email}\n`;
    msg += `👥 *Coverage Scope:* ${scopeLabel}\n`;
    msg += `📍 *City & Venue:* ${evt.city || 'Gujarat'}${evt.venue ? ' (' + evt.venue + ')' : ''}\n`;
    msg += `🗓️ *Celebration Dates:* ${evt.dates || 'To be confirmed'}\n`;
    msg += `⏳ *Celebration Duration:* ${evt.days || 2} Day(s)\n`;
    if (evt.functions && evt.functions.length > 0) {
      msg += `🪔 *Selected Functions:* ${evt.functions.join(', ')}\n`;
    }
    msg += `\n📦 *SELECTED COLLECTION:* ${quote.basePackageName}\n`;

    // Line items list (service focused, no crew numbers or photo counts)
    msg += `\n*SELECTED SERVICES & DELIVERABLES:*\n`;
    quote.lineItems.forEach(item => {
      if (item.type === 'package') return; // already mentioned
      if (item.isIncluded) {
        msg += `• ${item.name}: Included in Collection\n`;
      } else if (item.isCustomQuote) {
        msg += `• ${item.name}: Custom Quote Required\n`;
      } else {
        msg += `• ${item.name}: ${formatINR(item.totalPrice)}\n`;
      }
    });

    msg += `\n📸 *PHOTOGRAPHY PHILOSOPHY:*\n`;
    msg += `We treat wedding photography as an art, not a numbers game. All curated ultra-high-resolution RAW photographs and handpicked master-edited photographs are delivered with world-class retouching.\n`;

    msg += `\n💰 *PRICE SUMMARY:*\n`;
    msg += `• Regular Quotation: ${quote.subtotalFormatted}\n`;
    if (quote.discountAmount > 0) {
      msg += `• Special Approved Offer: -${quote.discountFormatted}\n`;
    }
    msg += `• *Your Personalized Experience (Estimated Total):* *${quote.estimatedTotalFormatted}*\n`;

    if (quote.hasCustomQuote) {
      msg += `_(Note: Certain bespoke services are subject to final schedule confirmation.)_\n`;
    }

    if (cust.notes) {
      msg += `\n📝 *Couple's Celebration Notes:*\n"${cust.notes}"\n`;
    }

    let host = 'https://anantproductions.in';
    if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('file://')) {
      host = window.location.origin;
    }

    let quoteUrl = `${host}/quote?ref=${ref}&view=pdf`;
    try {
      const hash = serializeStateToHash(quote);
      if (hash) {
        quoteUrl = `${host}/quote#quote=${hash}&view=pdf`;
      }
    } catch (e) {}

    msg += `\n📄 *OFFICIAL PDF QUOTATION DOCUMENT:*\n${quoteUrl}\n_(Tap to view & download the formal branded PDF proposal)_\n`;

    msg += `\nCould you please check your availability for our dates and share the next steps? Thank you!`;

    return msg;
  }

  /**
   * Serialize State to a Compact URL Hash / Query String
   * Allows couples to copy a link and share with family.
   */
  function serializeStateToHash(state) {
    try {
      const payload = {
        cat: state.eventCategory,
        pkg: state.packageId,
        scope: state.coverageScope || 'one_side',
        days: state.eventDetails?.days,
        city: state.eventDetails?.city,
        fns: state.eventDetails?.functions,
        addons: state.selectedAddons,
        crew: state.crew,
        offer: state.applyLaunchOffer ? 1 : 0
      };
      return encodeURIComponent(JSON.stringify(payload));
    } catch (e) {
      return '';
    }
  }

  /**
   * Deserialize State from Hash
   */
  function deserializeStateFromHash(hashString) {
    if (!hashString) return null;
    try {
      const clean = hashString.replace(/^[#?]/, '');
      const jsonStr = decodeURIComponent(clean);
      const parsed = JSON.parse(jsonStr);
      return {
        eventCategory: parsed.cat,
        packageId: parsed.pkg,
        coverageScope: parsed.scope || 'one_side',
        eventDetails: {
          days: parsed.days,
          city: parsed.city,
          functions: parsed.fns || []
        },
        selectedAddons: parsed.addons || {},
        crew: parsed.crew || {},
        applyLaunchOffer: Boolean(parsed.offer)
      };
    } catch (e) {
      return null;
    }
  }

  // Export module
  const engine = {
    formatINR: formatINR,
    generateQuoteRef: generateQuoteRef,
    calculateQuotation: calculateQuotation,
    generateWhatsAppMessage: generateWhatsAppMessage,
    serializeStateToHash: serializeStateToHash,
    deserializeStateFromHash: deserializeStateFromHash
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = engine;
  }
  if (typeof window !== 'undefined') {
    window.ANANT_PRICING_ENGINE = engine;
  }
})(typeof window !== 'undefined' ? window : global);
