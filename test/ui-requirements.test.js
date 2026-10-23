const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('\n--- Running UI Requirements Verification Tests ---\n');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(err);
  }
}

// 1. Verify CSS removes ugly horizontal scrollbar
it('CSS should completely hide the horizontal scrollbar on .qb-stepper', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  assert.ok(css.includes('scrollbar-width: none'), 'Contains scrollbar-width: none');
  assert.ok(css.includes('-ms-overflow-style: none'), 'Contains -ms-overflow-style: none');
  assert.ok(css.includes('.qb-stepper::-webkit-scrollbar'), 'Contains .qb-stepper::-webkit-scrollbar selector');
  assert.ok(css.includes('display: none'), 'Contains display: none for scrollbar');
});

// 2. Load config and pricing engine
const configPath = path.join(__dirname, '../js/config.js');
const enginePath = path.join(__dirname, '../js/pricing-engine.js');
const qbPath = path.join(__dirname, '../js/quotation-builder.js');

const configCode = fs.readFileSync(configPath, 'utf8');
const engine = require(enginePath);

// Eval config in a sandbox
const sandbox = {};
const configFn = new Function('window', configCode + '; return ANANT_CONFIG;');
const config = configFn(sandbox);

// 3. Verify coverageScopes exists in config
it('config should have coverageScopes with one_side, both_same_venue, both_diff_venues and multipliers', () => {
  assert.ok(config.coverageScopes, 'coverageScopes exists');
  const scopes = Array.isArray(config.coverageScopes) ? config.coverageScopes : Object.values(config.coverageScopes);
  const oneSide = scopes.find(s => s.id === 'one_side');
  const bothSame = scopes.find(s => s.id === 'both_same_venue');
  const bothDiff = scopes.find(s => s.id === 'both_diff_venues');

  assert.ok(oneSide, 'one_side exists');
  assert.strictEqual(oneSide.multiplier, 1.0);

  assert.ok(bothSame, 'both_same_venue exists');
  assert.strictEqual(bothSame.multiplier, 1.4);

  assert.ok(bothDiff, 'both_diff_venues exists');
  assert.strictEqual(bothDiff.multiplier, 1.85);
});

// 4. Verify addOnCatalog has NO coverage services
it('config.addOnCatalog should NOT contain any coverage service modules', () => {
  const serviceIds = [
    'addon-photo-trad',
    'addon-photo-candid',
    'addon-photo-extra',
    'addon-cine-cinematographer',
    'addon-cine-trad-video',
    'addon-drone-shoot'
  ];

  serviceIds.forEach(id => {
    const found = config.addOnCatalog.find(a => a.id === id);
    assert.strictEqual(found, undefined, `Service ${id} must not be in addOnCatalog`);
  });
});

// 5. Verify Services step is removed and wizard operates on dynamic steps
it('quotation-builder.js should remove redundant Services step and operate on dynamic steps', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  
  // Verify renderStep4_CrewConfig is removed
  assert.ok(!qbCode.includes('function renderStep4_CrewConfig'), 'renderStep4_CrewConfig must be removed');
  assert.ok(!qbCode.includes("title: 'Services'"), 'Services step tab must be removed');
  
  // Verify dynamic step generation via getStepList
  assert.ok(qbCode.includes('function getStepList'), 'getStepList function exists');
  assert.ok(qbCode.includes("id: 'coverage_scope', title: 'Coverage Scope'"), 'Coverage Scope step is defined in getStepList');
  assert.ok(qbCode.includes("id: 'addons', title: 'Add-ons'"), 'Add-ons step is defined in getStepList');
});

// 6. Verify Step 4 filters out items already included in base package
it('quotation-builder.js Step 4 should filter out already-included deliverables', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  assert.ok(qbCode.includes('availableAddons = (config.addOnCatalog || []).filter'), 'Step 4 filters addOnCatalog');
  assert.ok(qbCode.includes('includedQty === 0'), 'Step 4 excludes items with includedQty > 0');
});

// 7. Verify Coverage Scope is in its own dedicated step for wedding only with With Extra Charge badge
it('quotation-builder.js should render Coverage Scope in its own separate step for wedding only', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  assert.ok(qbCode.includes('function renderStep_CoverageScope'), 'Dedicated renderStep_CoverageScope function exists');
  
  // Verify Step 1 is Event Type only
  const step1Match = qbCode.match(/function renderStep1_EventType[\s\S]*?\{([\s\S]*?)function renderStep_CoverageScope/);
  assert.ok(step1Match, 'Found renderStep1_EventType function');
  const step1Body = step1Match[1];
  assert.ok(step1Body.includes('CELEBRATION CATEGORY'), 'Step 1 includes celebration category');
  assert.ok(!step1Body.includes('data-select-scope'), 'Step 1 does not contain data-select-scope (moved to its own step)');

  // Verify dedicated Coverage Scope step
  const scopeMatch = qbCode.match(/function renderStep_CoverageScope[\s\S]*?\{([\s\S]*?)function renderStep2_EventDetails/);
  assert.ok(scopeMatch, 'Found renderStep_CoverageScope body');
  const scopeBody = scopeMatch[1];
  assert.ok(scopeBody.includes('data-select-scope'), 'Coverage Scope step includes data-select-scope cards');
  assert.ok(scopeBody.includes('With Extra Charge'), 'Coverage Scope displays With Extra Charge badge');
  assert.ok(!scopeBody.includes('1.4x Price'), 'Coverage Scope does not display 1.4x Price badge');
  assert.ok(!scopeBody.includes('1.85x Price'), 'Coverage Scope does not display 1.85x Price badge');

  // Verify dynamic step lists: 8 steps for wedding, 7 for non-wedding
  assert.ok(qbCode.includes("id: 'coverage_scope'"), 'coverage_scope step exists in wedding step list');
});

// 8. Verify Pricing Engine charges 1.4x for joint venue and 1.85x for different locations
it('Pricing Engine should calculate 1.4x for both_same_venue and 1.85x for both_diff_venues', () => {
  const baseQuote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'one_side'
  });

  const jointQuote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_same_venue'
  });

  const dualQuote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_diff_venues'
  });

  // Base is 75000. 1.4x = 105000 (+30000). 1.85x = 138750 (+63750).
  assert.strictEqual(jointQuote.subtotal, Math.round(baseQuote.subtotal * 1.4));
  assert.strictEqual(jointQuote.coverageScopeSurcharge, Math.round(baseQuote.subtotal * 0.4));
  assert.ok(jointQuote.lineItems.some(item => item.id === 'scope-joint-venue'), 'Contains scope-joint-venue line item');

  assert.strictEqual(dualQuote.subtotal, Math.round(baseQuote.subtotal * 1.85));
  assert.strictEqual(dualQuote.coverageScopeSurcharge, Math.round(baseQuote.subtotal * 0.85));
  assert.ok(dualQuote.lineItems.some(item => item.id === 'scope-dual-locations'), 'Contains scope-dual-locations line item');
  assert.ok(dualQuote.coverageScopeLabel.includes('Both Sides — Different Locations'));
});

// 9. Verify Step 4 selects Heirloom Albums by default
it('quotation-builder.js Step 4 should select Heirloom Albums by default', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  assert.ok(qbCode.includes("activeAddonCategory: 'albums'"), 'defaultState includes activeAddonCategory: albums');
  assert.ok(qbCode.includes("builderState.activeAddonCategory = 'albums'"), 'Step 4 navigation sets activeAddonCategory to albums');
  assert.ok(qbCode.includes("const isActive = (builderState.activeAddonCategory === c.id)"), 'Category button gets active class for active category');
});

// 10. Verify Dark/Light Mode with Toggle
it('should have dark and light mode tokens and toggle buttons', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  assert.ok(css.includes('[data-theme="dark"]'), 'CSS includes data-theme="dark"');
  assert.ok(css.includes('[data-theme="light"]'), 'CSS includes data-theme="light"');
  assert.ok(css.includes('.theme-toggle-btn'), 'CSS includes .theme-toggle-btn');

  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(html.includes('id="theme-toggle-btn"'), 'HTML includes desktop theme toggle button');
  assert.ok(html.includes('id="mobile-theme-toggle-btn"'), 'HTML includes mobile theme toggle button');

  const mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  assert.ok(mainJs.includes('initTheme'), 'main.js includes initTheme function');
  assert.ok(mainJs.includes('toggleTheme'), 'main.js includes toggleTheme function');
});

// 11. Verify MPA Pages and Homepage Visibility
it('should have dedicated MPA pages with SEO metadata, canonical links, and Schema.org data', () => {
  const mpaPages = ['about.html', 'contact.html', 'privacy-policy.html', 'terms-and-conditions.html'];
  
  mpaPages.forEach(page => {
    const pagePath = path.join(__dirname, '..', page);
    assert.ok(fs.existsSync(pagePath), `${page} must exist in workspace root`);
    const content = fs.readFileSync(pagePath, 'utf8');
    assert.ok(content.includes('<link rel="canonical"'), `${page} must contain a canonical link`);
    assert.ok(content.includes('<meta name="description"'), `${page} must contain a meta description`);
    assert.ok(content.includes('application/ld+json'), `${page} must contain Schema.org structured data`);
    assert.ok(content.includes('id="theme-toggle-btn"'), `${page} must contain the theme toggle button`);
    assert.ok(content.includes('css/style.css'), `${page} must include style.css`);
  });
});

it('index.html should link to all 4 MPA pages in hero, navbar, and footer', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const mpaPages = ['about.html', 'contact.html', 'privacy-policy.html', 'terms-and-conditions.html'];
  
  // Verify Hero Quick Links
  assert.ok(html.includes('hero-quick-links'), 'Hero section must have hero-quick-links');
  mpaPages.forEach(page => {
    assert.ok(html.includes(`href="${page}"`), `index.html must link to ${page}`);
  });

  // Verify footer links
  assert.ok(html.includes('Terms &amp; Retainer Policies') || html.includes('Terms & Conditions'), 'Footer has terms link');
  assert.ok(html.includes('Privacy Policy &amp; Vaults') || html.includes('Privacy Policy'), 'Footer has privacy link');
});

// 12. Verify Error Pages (404 and 500)
it('should have dedicated 404 and 500 error pages with noindex, theme toggles, and recovery links', () => {
  const errorPages = ['404.html', '500.html'];
  
  errorPages.forEach(page => {
    const pagePath = path.join(__dirname, '..', page);
    assert.ok(fs.existsSync(pagePath), `${page} must exist in workspace root`);
    const content = fs.readFileSync(pagePath, 'utf8');
    assert.ok(content.includes('noindex'), `${page} must contain noindex meta tag`);
    assert.ok(content.includes('id="theme-toggle-btn"'), `${page} must contain theme toggle button`);
    assert.ok(content.includes('href="index.html"'), `${page} must link back to home`);
    assert.ok(content.includes('error-recovery-grid'), `${page} must contain error recovery grid`);
  });
});

// 13. Verify Sitemap.xml contains all primary canonical pages and image extensions
it('should have a valid sitemap.xml containing all primary canonical URLs and image extensions', () => {
  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');
  const xml = fs.readFileSync(sitemapPath, 'utf8');

  assert.ok(xml.includes('https://anantproductions.in/'), 'sitemap includes homepage');
  assert.ok(xml.includes('https://anantproductions.in/about.html'), 'sitemap includes about.html');
  assert.ok(xml.includes('https://anantproductions.in/contact.html'), 'sitemap includes contact.html');
  assert.ok(xml.includes('https://anantproductions.in/terms-and-conditions.html'), 'sitemap includes terms-and-conditions.html');
  assert.ok(xml.includes('https://anantproductions.in/privacy-policy.html'), 'sitemap includes privacy-policy.html');
  assert.ok(!xml.includes('404.html'), 'sitemap should not include 404 error page');
  assert.ok(!xml.includes('500.html'), 'sitemap should not include 500 error page');
  assert.ok(xml.includes('xmlns:image='), 'sitemap includes Google image schema extension');
});

// 14. Verify robots.txt configuration and sitemap pointer
it('should have a valid robots.txt with sitemap directive and crawl rules', () => {
  const robotsPath = path.join(__dirname, '../robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist');
  const txt = fs.readFileSync(robotsPath, 'utf8');

  assert.ok(txt.includes('User-agent: *'), 'robots.txt has wildcard User-agent');
  assert.ok(txt.includes('Allow: /'), 'robots.txt allows root path');
  assert.ok(txt.includes('Sitemap: https://anantproductions.in/sitemap.xml'), 'robots.txt links to sitemap.xml');
  assert.ok(txt.includes('Disallow: /404.html'), 'robots.txt disallows 404 page');
  assert.ok(txt.includes('Disallow: /500.html'), 'robots.txt disallows 500 page');
});

// 15. Verify 3 wedding plans have original prices 50k, 1L, 1.5L and discounted rates 40k, 75k, 1L, and launch offer is in introductory offer
it('wedding packages should have original prices 50k, 1L, 1.5L with discounted rates 40k, 75k, 1L and launch offer in introductory offer section', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  
  // Verify card-pkg-signature does NOT show Launch Offer badge
  const sigCardMatch = html.match(/id="card-pkg-signature"[\s\S]*?id="card-pkg-premium"/);
  assert.ok(sigCardMatch, 'Found signature card block in HTML');
  const sigCard = sigCardMatch[0];
  assert.ok(!sigCard.includes('Launch Offer</span>'), 'Signature card must not show Launch Offer badge');
  assert.ok(sigCard.includes('₹75,000'), 'Signature card shows discounted rate ₹75,000');
  assert.ok(sigCard.includes('₹1,00,000'), 'Signature card shows original price ₹1,00,000');
  assert.ok(sigCard.includes('line-through'), 'Signature card strikes through original price');

  // Verify Essential card
  const essCardMatch = html.match(/id="card-pkg-essential"[\s\S]*?id="card-pkg-signature"/);
  assert.ok(essCardMatch, 'Found essential card block in HTML');
  const essCard = essCardMatch[0];
  assert.ok(essCard.includes('₹40,000'), 'Essential card shows discounted rate ₹40,000');
  assert.ok(essCard.includes('₹50,000'), 'Essential card shows original price ₹50,000');

  // Verify Premium card
  const premCardMatch = html.match(/id="card-pkg-premium"[\s\S]*?<!-- 2\. PRE-WEDDING PACKAGES/);
  assert.ok(premCardMatch, 'Found premium card block in HTML');
  const premCard = premCardMatch[0];
  assert.ok(premCard.includes('₹1,00,000'), 'Premium card shows discounted rate ₹1,00,000');
  assert.ok(premCard.includes('₹1,50,000'), 'Premium card shows original price ₹1,50,000');

  // Verify Introductory Offer section (#launch-offer) contains the Founding Couple Launch Offer
  const introMatch = html.match(/id="launch-offer"[\s\S]*?id="portfolio"/);
  assert.ok(introMatch, 'Found launch offer section');
  const intro = introMatch[0];
  assert.ok(intro.includes('Founding Couple Launch Offer'), 'Introductory offer section contains Founding Couple Launch Offer');
  assert.ok(intro.includes('₹50,000'), 'Introductory offer displays ₹50,000');
  assert.ok(intro.includes('₹75,000'), 'Introductory offer displays regular ₹75,000');
});

// 16. Verify Pre-Wedding packages have original prices 20k, 45k, 75k and discounted rates 15k, 30k, 50k
it('pre-wedding packages should have original prices 20k, 45k, 75k with discounted rates 15k, 30k, 50k', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  
  const prewedPanelMatch = html.match(/id="tab-panel-prewed"[\s\S]*?id="tab-panel-engagement"/);
  assert.ok(prewedPanelMatch, 'Found prewed panel in HTML');
  const panel = prewedPanelMatch[0];

  assert.ok(panel.includes('₹15,000'), 'Essential couple shoot shows ₹15,000');
  assert.ok(panel.includes('₹20,000'), 'Essential couple shoot shows original ₹20,000');
  assert.ok(panel.includes('₹30,000'), 'Signature pre-wedding shows ₹30,000');
  assert.ok(panel.includes('₹45,000'), 'Signature pre-wedding shows original ₹45,000');
  assert.ok(panel.includes('₹50,000'), 'Premium pre-wedding shows ₹50,000');
  assert.ok(panel.includes('₹75,000'), 'Premium pre-wedding shows original ₹75,000');
});

// 17. Verify Engagement packages have original prices 28k, 50k, 85k and discounted rates 20k, 35k, 60k
it('engagement packages should have original prices 28k, 50k, 85k with discounted rates 20k, 35k, 60k', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  
  const engPanelMatch = html.match(/id="tab-panel-engagement"[\s\S]*?id="tab-panel-functions"/);
  assert.ok(engPanelMatch, 'Found engagement panel in HTML');
  const panel = engPanelMatch[0];

  assert.ok(panel.includes('₹20,000'), 'Essential engagement shows ₹20,000');
  assert.ok(panel.includes('₹28,000'), 'Essential engagement shows original ₹28,000');
  assert.ok(panel.includes('₹35,000'), 'Signature engagement shows ₹35,000');
  assert.ok(panel.includes('₹50,000'), 'Signature engagement shows original ₹50,000');
  assert.ok(panel.includes('₹60,000'), 'Premium engagement shows ₹60,000');
  assert.ok(panel.includes('₹85,000'), 'Premium engagement shows original ₹85,000');
});

// 18. Verify Individual Functions packages have original prices 20k, 45k, 75k and discounted rates 15k, 30k, 50k
it('individual functions packages should have original prices 20k, 45k, 75k with discounted rates 15k, 30k, 50k', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  
  const fnPanelMatch = html.match(/id="tab-panel-functions"[\s\S]*?class="package-transparency-note"/);
  assert.ok(fnPanelMatch, 'Found functions panel in HTML');
  const panel = fnPanelMatch[0];

  assert.ok(panel.includes('₹15,000'), 'Essential function shows ₹15,000');
  assert.ok(panel.includes('₹20,000'), 'Essential function shows original ₹20,000');
  assert.ok(panel.includes('₹30,000'), 'Signature function shows ₹30,000');
  assert.ok(panel.includes('₹45,000'), 'Signature function shows original ₹45,000');
  assert.ok(panel.includes('₹50,000'), 'Premium function shows ₹50,000');
  assert.ok(panel.includes('₹75,000'), 'Premium function shows original ₹75,000');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All UI requirements verified successfully!');
  process.exit(0);
} else {
  console.error('✗ Some UI requirements tests failed.');
  process.exit(1);
}




