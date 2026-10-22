/**
 * ANANT PRODUCTIONS — QUOTATION DOCUMENT & RULES TEST
 *
 * Verifies:
 * - Rule A: Zero crew numbers/headcounts in packages, deliverables, or WhatsApp message
 * - Rule B: Photography philosophy present, zero fixed photo counts
 * - Rule C: Complete 8-section formal quotation document structure
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

console.log('\n--- Running Quotation Document & Business Rules Tests ---\n');

// 1. Rule A: No crew numbers in package categories
it('should have zero crew headcounts in any package inclusions or descriptions', () => {
  const crewRegex = /\b(\d+)\s*(candid|traditional)?\s*(photographer|cinematographer|cameraman|assistant)s?\b/i;
  
  for (const catKey of Object.keys(config.packageCategories)) {
    const cat = config.packageCategories[catKey];
    for (const pkg of cat.packages) {
      assert.strictEqual(crewRegex.test(pkg.summary), false, `Package ${pkg.id} summary contains crew count: ${pkg.summary}`);
      if (pkg.deliverables) {
        for (const deliv of pkg.deliverables) {
          assert.strictEqual(crewRegex.test(deliv), false, `Package ${pkg.id} deliverable contains crew count: ${deliv}`);
        }
      }
      if (pkg.services) {
        for (const s of pkg.services) {
          assert.strictEqual(crewRegex.test(s), false, `Package ${pkg.id} service contains crew count: ${s}`);
        }
      }
    }
  }
});

// 2. Rule B: No numerical photo counts in packages
it('should have zero fixed numerical photo counts in package deliverables', () => {
  const photoCountRegex = /\b\d{2,4}\s*[-–to]*\s*\d{0,4}\s*(edited|raw|high-res|master)?\s*(photos?|photographs?|images?|pictures?)\b/i;

  for (const catKey of Object.keys(config.packageCategories)) {
    const cat = config.packageCategories[catKey];
    for (const pkg of cat.packages) {
      if (pkg.deliverables) {
        for (const deliv of pkg.deliverables) {
          assert.strictEqual(photoCountRegex.test(deliv), false, `Package ${pkg.id} deliverable contains photo count: ${deliv}`);
        }
      }
    }
  }
});

// 3. Photography Philosophy Configuration
it('should contain the exact client photography philosophy', () => {
  assert.ok(config.photographyPhilosophy, 'photographyPhilosophy must exist in config');
  assert.ok(config.photographyPhilosophy.quote.includes('genuine emotions, unscripted moments'), 'Philosophy quote must match exact wording');
  assert.ok(/ultra-high-resolution raw/i.test(config.photographyPhilosophy.rawDeliverable), 'RAW deliverable must be documented');
  assert.ok(/master|retouched|selected/i.test(config.photographyPhilosophy.editedDeliverable), 'Edited deliverable must be documented');
});

// 4. Complimentary Benefits Configuration
it('should contain the 4 complimentary experiences in config', () => {
  assert.ok(Array.isArray(config.complimentaryBenefits), 'complimentaryBenefits must be an array');
  assert.strictEqual(config.complimentaryBenefits.length, 4, 'Must have 4 complimentary benefits');
  const titles = config.complimentaryBenefits.map(b => b.title).join(' ');
  assert.ok(titles.includes('Cloud Family Gallery'));
  assert.ok(titles.includes('Sneak Peek'));
  assert.ok(titles.includes('Wooden Drive'));
  assert.ok(titles.includes('Creative Consultation'));
});

// 5. WhatsApp Message Compliance
it('should generate a WhatsApp inquiry strictly compliant with Rules A, B, and C', () => {
  const quote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    eventDetails: {
      days: 2,
      city: 'Ahmedabad',
      dates: '14-15 Dec 2026',
      venue: 'Belvedere Club',
      functions: ['Mandva', 'Pithi', 'Garba', 'Lagna', 'Reception']
    },
    crew: { photo_trad: 1, photo_candid: 1, cinema_cam: 1 },
    selectedAddons: {},
    applyLaunchOffer: true,
    customer: { names: 'Priyanshi & Harsh', phone: '+91 98765 43210' }
  });

  const msg = engine.generateWhatsAppMessage(quote, config);
  assert.ok(msg.includes('Priyanshi & Harsh'));
  assert.ok(msg.includes('AP-2026-'));
  assert.ok(msg.includes('PHOTOGRAPHY PHILOSOPHY'));
  assert.ok(msg.includes('PRICE SUMMARY'));

  // No crew counts
  const crewRegex = /\b(\d+)\s*(candid|traditional)?\s*(photographer|cinematographer|cameraman)s?\b/i;
  assert.strictEqual(crewRegex.test(msg), false, 'WhatsApp message must not contain crew headcounts');

  // No fixed photo counts
  const photoCountRegex = /\b\d{2,4}\s*(edited|raw)?\s*(photos?|photographs?|images?|pictures?)\b/i;
  assert.strictEqual(photoCountRegex.test(msg), false, 'WhatsApp message must not contain numerical photo counts');
});

// 6. Formal Quotation Document 8-Section Structure
it('should contain all 8 sections in quotation-builder.js', () => {
  const qbPath = path.join(__dirname, '../js/quotation-builder.js');
  const content = fs.readFileSync(qbPath, 'utf8');

  assert.ok(content.includes('SECTION 01 • PERSONALIZED QUOTATION') || content.includes('SECTION 01'), 'Section 1 must be present');
  assert.ok(content.includes('SECTION 02'), 'Section 2 must be present');
  assert.ok(content.includes('SECTION 03'), 'Section 3 must be present');
  assert.ok(content.includes('SECTION 04'), 'Section 4 must be present');
  assert.ok(content.includes('SECTION 05'), 'Section 5 must be present');
  assert.ok(content.includes('SECTION 06'), 'Section 6 must be present');
  assert.ok(content.includes('SECTION 07'), 'Section 7 must be present');
  assert.ok(content.includes('SECTION 08'), 'Section 8 must be present');

  // Specific section headers
  assert.ok(content.includes('Event-by-Event Celebration Coverage'), 'Section 2 title must match');
  assert.ok(content.includes('Deliverables You Will Receive'), 'Section 3 title must match');
  assert.ok(content.includes('Complimentary Experiences for Your Celebration'), 'Section 4 title must match');
  assert.ok(content.includes('Investment & Special Offer') || content.includes('Investment &amp; Special Offer'), 'Section 5 title must match');
  assert.ok(content.includes('Special Add-ons for Your Wedding Experience'), 'Section 6 title must match');
  assert.ok(content.includes('Terms of Engagement & Exclusions') || content.includes('Terms of Engagement &amp; Exclusions'), 'Section 7 title must match');
  assert.ok(content.includes('Let\'s Create Something Timeless Together'), 'Section 8 title must match');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All business rule & document structure tests passed successfully!');
} else {
  process.exit(1);
}
