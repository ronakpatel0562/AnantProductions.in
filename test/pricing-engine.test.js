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
it('should accurately calculate Essential Wedding baseline (₹29,999)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-essential',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 29999);
  assert.strictEqual(quote.estimatedTotal, 29999);
  assert.strictEqual(quote.hasCustomQuote, false);
});

it('should accurately calculate Signature Wedding baseline (₹49,999)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 49999);
  assert.strictEqual(quote.estimatedTotal, 49999);
});

it('should accurately calculate Premium Wedding baseline (₹74,999)', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-premium',
    eventDetails: { days: 2 }
  });
  assert.strictEqual(quote.subtotal, 74999);
  assert.strictEqual(quote.estimatedTotal, 74999);
});

// 3. Pre-Wedding Tiers
it('should calculate Pre-Wedding package tiers (₹7,999, ₹15,999, ₹24,999)', () => {
  const essential = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-essential'
  });
  assert.strictEqual(essential.estimatedTotal, 7999);

  const signature = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-signature'
  });
  assert.strictEqual(signature.estimatedTotal, 15999);

  const premium = engine.calculateQuotation(config, {
    eventCategory: 'prewed',
    packageId: 'pkg-prewed-premium'
  });
  assert.strictEqual(premium.estimatedTotal, 24999);
});

// 4. Engagement Tiers
it('should calculate Engagement package tiers (₹9,999, ₹18,999, ₹31,999)', () => {
  const essential = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-essential'
  });
  assert.strictEqual(essential.estimatedTotal, 9999);

  const signature = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-signature'
  });
  assert.strictEqual(signature.estimatedTotal, 18999);

  const premium = engine.calculateQuotation(config, {
    eventCategory: 'engagement',
    packageId: 'pkg-engagement-premium'
  });
  assert.strictEqual(premium.estimatedTotal, 31999);
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

  // Base is 49999, included items must not increase the price
  assert.strictEqual(quote.subtotal, 49999);

  // Check line items: should mark items as included
  const highlightItem = quote.lineItems.find(i => i.id === 'addon-cine-highlight');
  assert.ok(highlightItem, 'Highlight film line item exists');
  assert.strictEqual(highlightItem.includedQuantity, 1);
  assert.strictEqual(highlightItem.billableQuantity, 0);
  assert.strictEqual(highlightItem.totalPrice, 0);
  assert.strictEqual(highlightItem.isIncluded, true);
});

it('should charge only for additional units beyond base package inclusions', () => {
  // Signature wedding includes 1 Reel (addon-reel-single). If user asks for 3 reels, charge for 2 extra reels (2 * 2499 = 4998).
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2 },
    selectedAddons: {
      'addon-reel-single': 3
    }
  });

  const expectedSubtotal = 49999 + (2 * 2499);
  assert.strictEqual(quote.subtotal, expectedSubtotal);

  const reelItem = quote.lineItems.find(i => i.id === 'addon-reel-single');
  assert.strictEqual(reelItem.quantity, 3);
  assert.strictEqual(reelItem.includedQuantity, 1);
  assert.strictEqual(reelItem.billableQuantity, 2);
  assert.strictEqual(reelItem.totalPrice, 4998);
});

// 6. Multi-Day Wedding Scaling
it('should calculate additional wedding days beyond base package standard days', () => {
  // 3-day wedding on a 2-day base package adds 1 extra day (₹24,999)
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 3 }
  });

  const expectedSubtotal = 49999 + 24999;
  assert.strictEqual(quote.subtotal, expectedSubtotal);

  const extraDayItem = quote.lineItems.find(i => i.id === 'adjustment-extra-days');
  assert.ok(extraDayItem, 'Extra day adjustment present');
  assert.strictEqual(extraDayItem.quantity, 1);
});

// 7. Hourly Addons
it('should calculate hourly addons accurately', () => {
  // 3 extra coverage hours (3 * 2000 = 6000)
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-essential',
    eventDetails: { days: 2 },
    selectedAddons: {
      'addon-extra-hour': 3
    }
  });

  assert.strictEqual(quote.subtotal, 29999 + 6000);
});

// 8. Custom "Build Your Own" Package
it('should correctly calculate custom "Build Your Own" package starting at ₹0 base', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'custom',
    eventDetails: { days: 1 },
    selectedAddons: {
      'addon-photo-candid': 1, // 9999
      'addon-drone-shoot': 1,  // 7499
      'addon-album-standard': 1 // 8999
    }
  });

  const expectedTotal = 9999 + 7499 + 8999; // 26497
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

  // Base ₹49,999 - ₹10,000 launch offer discount = ₹39,999
  assert.strictEqual(quote.subtotal, 49999);
  assert.strictEqual(quote.discountAmount, 10000);
  assert.strictEqual(quote.estimatedTotal, 39999);
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
    eventDetails: { days: 2, city: 'Vadodara', functions: ['Garba', 'Lagna'] },
    selectedAddons: { 'addon-drone-shoot': 1, 'addon-reel-single': 2 },
    crew: { photo_candid: 1 },
    applyLaunchOffer: true
  };

  const hash = engine.serializeStateToHash(state);
  assert.ok(hash && hash.length > 10, 'Hash string was created');

  const restored = engine.deserializeStateFromHash(hash);
  assert.strictEqual(restored.eventCategory, 'wedding');
  assert.strictEqual(restored.packageId, 'pkg-wedding-signature');
  assert.strictEqual(restored.eventDetails.city, 'Vadodara');
  assert.strictEqual(restored.selectedAddons['addon-drone-shoot'], 1);
  assert.strictEqual(restored.applyLaunchOffer, true);
});

// 12. WhatsApp Message Generation
it('should generate a rich, clean WhatsApp inquiry text with line items and reference ID', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: { days: 2, city: 'Ahmedabad', venue: 'Belvedere Club' },
    customer: { names: 'Priyanshi & Harsh', phone: '+91 98765 43210' },
    selectedAddons: { 'addon-drone-shoot': 1 }
  });

  const waMsg = engine.generateWhatsAppMessage(quote, config);
  assert.ok(waMsg.includes('Priyanshi & Harsh'));
  assert.ok(waMsg.includes(quote.referenceId));
  assert.ok(waMsg.includes('Belvedere Club'));
  assert.ok(waMsg.includes('4K Drone Aerial Shoot'));
  assert.ok(waMsg.includes('Estimated Total'));
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All pricing engine tests passed successfully!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed.');
  process.exit(1);
}
