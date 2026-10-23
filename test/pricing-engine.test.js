/**
 * ANANT PRODUCTIONS — PRICING ENGINE UNIT TESTS
 * 
 * Verifies calculation accuracy, package tiers, duplicate prevention,
 * add-on pricing units, multi-day scaling, discount application,
 * and state serialization.
 */

const assert = require('assert');
const config = require('../js/config.js');
const engine = require('../js/pricing-engine.js');

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

console.log('\n--- Running Anant Productions Pricing Engine Tests ---\n');

// 1. Currency Formatting
it('should format Indian Rupee currency with commas', () => {
  assert.strictEqual(engine.formatINR(24999), '₹24,999');
  assert.strictEqual(engine.formatINR(39999), '₹39,999');
  assert.strictEqual(engine.formatINR(125000), '₹1,25,000');
  assert.strictEqual(engine.formatINR(null), 'Custom Quote');
});

// 2. Wedding Package Tiers
it('should accurately calculate Essential Wedding baseline (₹40,000)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-essential',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 40000);
  assert.strictEqual(quote.estimatedTotal, 40000);
  assert.strictEqual(quote.hasCustomQuote, false);
});

it('should accurately calculate Signature Wedding baseline (₹75,000)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 75000);
  assert.strictEqual(quote.estimatedTotal, 75000);
});

it('should accurately calculate Premium Wedding baseline (₹1,00,000)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-premium',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 100000);
  assert.strictEqual(quote.estimatedTotal, 100000);
});

// 3. Pre-Wedding Tiers
it('should calculate Pre-Wedding package tiers (₹15,000, ₹30,000, ₹50,000)', () => {
  const essential = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-essential'
  });
  assert.strictEqual(essential.estimatedTotal, 15000);

  const signature = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-signature'
  });
  assert.strictEqual(signature.estimatedTotal, 30000);

  const premium = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-premium'
  });
  assert.strictEqual(premium.estimatedTotal, 50000);
});

// 4. Engagement Tiers (A little more than pre-wedding: ₹20,000, ₹35,000, ₹60,000)
it('should calculate Engagement package tiers (₹20,000, ₹35,000, ₹60,000)', () => {
  const essential = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-essential'
  });
  assert.strictEqual(essential.estimatedTotal, 20000);

  const signature = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-signature'
  });
  assert.strictEqual(signature.estimatedTotal, 35000);

  const premium = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-premium'
  });
  assert.strictEqual(premium.estimatedTotal, 60000);
});

// 4b. Individual Functions Tiers (₹15,000, ₹30,000, ₹50,000)
it('should calculate Individual Functions package tiers (₹15,000, ₹30,000, ₹50,000)', () => {
  const essential = engine.calculateQuotation(config, {
    eventCategory: 'functions',
    packageId: 'pkg-fn-essential'
  });
  assert.strictEqual(essential.estimatedTotal, 15000);

  const signature = engine.calculateQuotation(config, {
    eventCategory: 'functions',
    packageId: 'pkg-fn-signature'
  });
  assert.strictEqual(signature.estimatedTotal, 30000);

  const premium = engine.calculateQuotation(config, {
    eventCategory: 'functions',
    packageId: 'pkg-fn-premium'
  });
  assert.strictEqual(premium.estimatedTotal, 50000);
});

// 5. Duplicate Prevention & Inclusions
it('should NOT charge extra for services already included in the base package', () => {
  // Signature wedding already includes 1 Highlight Film (addon-cine-highlight) and 1 Reel (addon-reel-single)
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 },
    selectedAddons: {
      'addon-cine-highlight': 1, // already included!
      'addon-reel-single': 1      // already included!
    }
  });

  // Base is 75000, included items must not increase the price
  assert.strictEqual(quote.subtotal, 75000);

  // Check line items: should mark items as included
  const highlightItem = quote.lineItems.find(i => i.id === 'addon-cine-highlight');
  assert.ok(highlightItem, 'Highlight film line item exists');
  assert.strictEqual(highlightItem.includedQuantity, 1);
  assert.strictEqual(highlightItem.billableQuantity, 0);
  assert.strictEqual(highlightItem.totalPrice, 0);
  assert.strictEqual(highlightItem.isIncluded, true);
});

it('should charge only for additional units beyond base package inclusions', () => {
  // Signature wedding includes 1 Reel (addon-reel-single). If user asks for 3 reels, charge for 2 extra reels (2 * 4500 = 9000).
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 },
    selectedAddons: {
      'addon-reel-single': 3
    }
  });

  const expectedSubtotal = 75000 + (2 * 4500);
  assert.strictEqual(quote.subtotal, expectedSubtotal);

  const reelItem = quote.lineItems.find(i => i.id === 'addon-reel-single');
  assert.strictEqual(reelItem.quantity, 3);
  assert.strictEqual(reelItem.includedQuantity, 1);
  assert.strictEqual(reelItem.billableQuantity, 2);
  assert.strictEqual(reelItem.totalPrice, 9000);
});

// 6. Multi-Day Wedding Scaling
it('should calculate additional wedding days beyond base package standard days', () => {
  // 3-day wedding on a 2-day base package adds 1 extra day (₹35,000)
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 3 }
  });

  const expectedSubtotal = 75000 + 35000;
  assert.strictEqual(quote.subtotal, expectedSubtotal);

  const extraDayItem = quote.lineItems.find(i => i.id === 'adjustment-extra-days');
  assert.ok(extraDayItem, 'Extra day adjustment present');
  assert.strictEqual(extraDayItem.quantity, 1);
});

// 7. Hourly Addons
it('should calculate hourly addons accurately', () => {
  // 3 extra coverage hours (3 * 4000 = 12000)
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-essential',
    eventDetails: { days: 2 },
    selectedAddons: {
      'addon-extra-hour': 3
    }
  });

  assert.strictEqual(quote.subtotal, 40000 + 12000);
});

// 8. Custom "Build Your Own" Package
it('should correctly calculate custom "Build Your Own" package starting at ₹0 base', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'custom',
    eventDetails: { days: 1 },
    crew: {
      photo_candid: 1, // 15000
      drone_pilot: 1   // 12000
    },
    selectedAddons: {
      'addon-album-standard': 1 // 15000
    }
  });

  const expectedTotal = 15000 + 12000 + 15000; // 42000
  assert.strictEqual(quote.subtotal, expectedTotal);
  assert.strictEqual(quote.estimatedTotal, expectedTotal);
});

// 9. Launch Offer Application
it('should apply Founding Couple Launch Offer savings', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 },
    applyLaunchOffer: true
  });

  // Base ₹75,000 - ₹25,000 launch offer discount = ₹50,000
  assert.strictEqual(quote.subtotal, 75000);
  assert.strictEqual(quote.discountAmount, 25000);
  assert.strictEqual(quote.estimatedTotal, 50000);
});

// 10. Custom-Priced Items Flagging
it('should flag quotation as requiring final confirmation when a custom item is selected', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    selectedAddons: {
      'addon-travel-logistics': 1 // Custom quoted
    }
  });

  assert.strictEqual(quote.hasCustomQuote, true);
  assert.ok(quote.status.includes('Custom Items Require Confirmation'));
});

// 11. State Serialization and Deserialization
it('should serialize and deserialize builder state to URL-safe string', () => {
  const state = {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_diff_venues',
    eventDetails: { days: 2, city: 'Vadodara', functions: ['Garba', 'Lagna'] },
    selectedAddons: { 'addon-reel-single': 2 },
    crew: { photo_candid: 1 },
    applyLaunchOffer: true
  };

  const hash = engine.serializeStateToHash(state);
  assert.ok(hash && hash.length > 10, 'Hash string was created');

  const restored = engine.deserializeStateFromHash(hash);
  assert.strictEqual(restored.eventCategory, 'wedding');
  assert.strictEqual(restored.packageId, 'pkg-wedding-signature');
  assert.strictEqual(restored.coverageScope, 'both_diff_venues');
  assert.strictEqual(restored.eventDetails.city, 'Vadodara');
  assert.strictEqual(restored.selectedAddons['addon-reel-single'], 2);
  assert.strictEqual(restored.applyLaunchOffer, true);
});

// 12. WhatsApp Message Generation
it('should generate a rich, clean WhatsApp inquiry text with line items and reference ID', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_diff_venues',
    eventDetails: { days: 2, city: 'Ahmedabad', venue: 'Belvedere Club' },
    customer: { names: 'Priyanshi & Harsh', phone: '+91 98765 43210' },
    crew: { drone_pilot: 1 }
  });

  const waMsg = engine.generateWhatsAppMessage(quote, config);
  assert.ok(waMsg.includes('Priyanshi & Harsh'));
  assert.ok(waMsg.includes(quote.referenceId));
  assert.ok(waMsg.includes('Belvedere Club'));
  assert.ok(waMsg.includes('Coverage Scope'));
  assert.ok(waMsg.includes('Drone Aerial Cinematography'));
  assert.ok(waMsg.includes('Estimated Total'));
});

// 13. Coverage Scope Pricing (1.0x one-side, 1.4x joint venue, 1.85x separate locations)
it('should correctly calculate coverage scope (1.0x for one-side, 1.4x for joint venue, 1.85x for separate venues)', () => {
  const quoteOneSide = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'one_side'
  });
  assert.strictEqual(quoteOneSide.coverageScopeSurcharge, 0);
  assert.strictEqual(quoteOneSide.subtotal, 75000);

  const quoteJoint = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_same_venue'
  });
  // 1.4x of ₹75,000 = ₹1,05,000 (+₹30,000 surcharge)
  assert.strictEqual(quoteJoint.coverageScopeSurcharge, 30000);
  assert.strictEqual(quoteJoint.subtotal, 105000);
  const jointLine = quoteJoint.lineItems.find(i => i.id === 'scope-joint-venue');
  assert.ok(jointLine, 'Joint venue scope line item exists');
  assert.strictEqual(jointLine.totalPrice, 30000);

  const quoteSeparate = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_diff_venues'
  });
  // 1.85x of ₹75,000 = ₹1,38,750 (+₹63,750 surcharge)
  assert.strictEqual(quoteSeparate.coverageScopeSurcharge, 63750);
  assert.strictEqual(quoteSeparate.subtotal, 138750);
  const scopeLine = quoteSeparate.lineItems.find(i => i.id === 'scope-dual-locations');
  assert.ok(scopeLine, 'Dual location scope line item exists');
  assert.strictEqual(scopeLine.totalPrice, 63750);

  // Non-wedding event category must NOT apply coverage scope multiplier
  const prewedQuote = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-signature',
    coverageScope: 'both_diff_venues'
  });
  assert.strictEqual(prewedQuote.coverageScopeSurcharge, 0);
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All pricing engine tests passed successfully!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed.');
  process.exit(1);
}
