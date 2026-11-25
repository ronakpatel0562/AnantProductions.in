const assert = require('node:assert');
const { test, it } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const config = require('../js/config.js');
const engine = require('../js/pricing-engine.js');

console.log('\n--- Running Quotation Estimator Reset Verification Tests ---\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
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

// 1. Verify baseline live estimator calculation for default wedding state
runTest('Default wedding state should calculate exact standard baseline without unprompted discount', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'one_side',
    eventDetails: {
      days: 2,
      city: 'Ahmedabad'
    },
    selectedAddons: {},
    applyLaunchOffer: false
  });

  assert.strictEqual(quote.subtotal, 75000, 'Subtotal should be 75,000');
  assert.strictEqual(quote.discountAmount, 0, 'Discount amount should be 0 by default');
  assert.strictEqual(quote.estimatedTotal, 75000, 'Estimated total should be 75,000');
  assert.strictEqual(quote.coverageScope, 'one_side');
  assert.strictEqual(quote.eventDetails.days, 2);
  
  // Base package line item
  const baseItem = quote.lineItems.find(i => i.id === 'pkg-wedding-signature');
  assert.ok(baseItem, 'Base package line item exists');
  assert.strictEqual(baseItem.totalPrice, 75000);

  // All other line items should be package inclusions (0 extra billable price)
  const additionalBillable = quote.lineItems.filter(i => i.id !== 'pkg-wedding-signature' && !i.isIncluded);
  assert.strictEqual(additionalBillable.length, 0, 'No extra billable items on clean baseline');
});

// 2. Verify quotation builder code contains reset button in live summary card
runTest('quotation-builder.js should include reset button in Live Quotation Estimator card', () => {
  const qbCode = fs.readFileSync(path.join(__dirname, '../js/quotation-builder.js'), 'utf8');

  assert.ok(qbCode.includes('id="btn-summary-reset"'), 'Contains btn-summary-reset ID');
  assert.ok(qbCode.includes('qb-sum-reset-btn'), 'Contains qb-sum-reset-btn CSS class');
  assert.ok(qbCode.includes('qb-sum-header-top'), 'Contains qb-sum-header-top container');
  assert.ok(qbCode.includes('LIVE QUOTATION ESTIMATOR'), 'Contains LIVE QUOTATION ESTIMATOR tag');
});

// 3. Verify resetQuotation function restores clean state
runTest('quotation-builder.js should implement resetQuotation with clean default state', () => {
  const qbCode = fs.readFileSync(path.join(__dirname, '../js/quotation-builder.js'), 'utf8');

  assert.ok(qbCode.includes('function resetQuotation'), 'Implements resetQuotation function');
  assert.ok(qbCode.includes('function getDefaultState'), 'Implements getDefaultState helper');
  assert.ok(qbCode.includes('applyLaunchOffer: false'), 'applyLaunchOffer is false by default in getDefaultState');
  assert.ok(qbCode.includes("localStorage.removeItem('anant_builder_draft')"), 'Clears localStorage draft on reset');
  assert.ok(qbCode.includes('window.resetQuotation = resetQuotation'), 'Exposes resetQuotation globally');
});

// 4. Verify category change resets add-ons and category specific values
runTest('Category selection in quotation-builder.js should cleanly reset add-ons and functions', () => {
  const qbCode = fs.readFileSync(path.join(__dirname, '../js/quotation-builder.js'), 'utf8');

  assert.ok(qbCode.includes('builderState.selectedAddons = {}'), 'Resets selectedAddons on category change');
  assert.ok(qbCode.includes('builderState.eventDetails.functions = []'), 'Resets functions on category change');
  assert.ok(qbCode.includes('builderState.eventCategory !== cat'), 'Detects category change');
});

// 5. Verify CSS includes styling for the reset button in the summary card
runTest('style.css should style .qb-sum-reset-btn and .qb-sum-header-top', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

  assert.ok(css.includes('.qb-sum-reset-btn'), 'CSS defines .qb-sum-reset-btn');
  assert.ok(css.includes('.qb-sum-header-top'), 'CSS defines .qb-sum-header-top');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All quotation estimator reset tests passed successfully!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed.');
  process.exit(1);
}
