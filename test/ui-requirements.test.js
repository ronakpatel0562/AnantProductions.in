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
it('config should have coverageScopes with one_side, both_same_venue, both_diff_venues', () => {
  assert.ok(config.coverageScopes, 'coverageScopes exists');
  const scopes = Array.isArray(config.coverageScopes) ? config.coverageScopes : Object.values(config.coverageScopes);
  const oneSide = scopes.find(s => s.id === 'one_side');
  const bothSame = scopes.find(s => s.id === 'both_same_venue');
  const bothDiff = scopes.find(s => s.id === 'both_diff_venues');

  assert.ok(oneSide, 'one_side exists');
  assert.strictEqual(oneSide.surcharge, 0);

  assert.ok(bothSame, 'both_same_venue exists');
  assert.strictEqual(bothSame.surcharge, 0);

  assert.ok(bothDiff, 'both_diff_venues exists');
  assert.strictEqual(bothDiff.surcharge, 8500);
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

// 5. Verify Step 4 has NO duplicate photography philosophy card in quotation-builder.js
it('quotation-builder.js Step 4 should NOT contain the duplicate photography philosophy card', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  
  // Extract renderStep4_CrewConfig function
  const step4Match = qbCode.match(/function renderStep4_CrewConfig\(\)\s*\{([\s\S]*?)function renderStep5_DeliverablesAddons/);
  assert.ok(step4Match, 'Found renderStep4_CrewConfig function');
  const step4Body = step4Match[1];

  assert.ok(!step4Body.includes('photography-philosophy-card'), 'Step 4 must not contain photography-philosophy-card');
  assert.ok(!step4Body.includes('OUR PHOTOGRAPHY PHILOSOPHY'), 'Step 4 must not contain OUR PHOTOGRAPHY PHILOSOPHY title');
});

// 6. Verify Step 5 filters out items already included in previous window
it('quotation-builder.js Step 5 should filter out already-included deliverables', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  assert.ok(qbCode.includes('availableAddons = (config.addOnCatalog || []).filter'), 'Step 5 filters addOnCatalog');
  assert.ok(qbCode.includes('includedQty === 0'), 'Step 5 excludes items with includedQty > 0');
});

// 7. Verify Step 1 includes Coverage Scope Filter
it('quotation-builder.js Step 1 should render the Coverage Scope Filter upfront', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  const step1Match = qbCode.match(/function renderStep1_EventType\(\)\s*\{([\s\S]*?)function renderStep2_EventDetails/);
  assert.ok(step1Match, 'Found renderStep1_EventType function');
  const step1Body = step1Match[1];

  assert.ok(step1Body.includes('COVERAGE SCOPE FILTER'), 'Step 1 includes COVERAGE SCOPE FILTER kicker');
  assert.ok(step1Body.includes('data-select-scope'), 'Step 1 includes data-select-scope cards');
  assert.ok(step1Body.includes('+₹8,500'), 'Step 1 displays +₹8,500 fee for dual locations');
});

// 8. Verify Pricing Engine charges +₹8,500 for both_diff_venues
it('Pricing Engine should add ₹8,500 and line item for both_diff_venues', () => {
  const baseQuote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'one_side'
  });

  const dualQuote = engine.calculateQuotation(config, {
    eventCategory: 'wedding',
    packageId: 'pkg-wedding-signature',
    coverageScope: 'both_diff_venues'
  });

  assert.strictEqual(dualQuote.subtotal, baseQuote.subtotal + 8500);
  assert.strictEqual(dualQuote.estimatedTotal, baseQuote.estimatedTotal + 8500);
  assert.ok(dualQuote.lineItems.some(item => item.id === 'scope-dual-locations' && item.totalPrice === 8500), 'Contains scope-dual-locations line item');
  assert.strictEqual(dualQuote.coverageScopeLabel, 'Both Sides — Different Locations');
});

// 9. Verify Step 5 selects Heirloom Albums by default
it('quotation-builder.js Step 5 should select Heirloom Albums by default', () => {
  const qbCode = fs.readFileSync(qbPath, 'utf8');
  assert.ok(qbCode.includes("activeAddonCategory: 'albums'"), 'defaultState includes activeAddonCategory: albums');
  assert.ok(qbCode.includes("builderState.activeAddonCategory = 'albums'"), 'Step 5 navigation sets activeAddonCategory to albums');
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

it('index.html should link to all 4 MPA pages in hero, navbar, showcase section, and footer', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const mpaPages = ['about.html', 'contact.html', 'privacy-policy.html', 'terms-and-conditions.html'];
  
  // Verify Hero Quick Links
  assert.ok(html.includes('hero-quick-links'), 'Hero section must have hero-quick-links');
  mpaPages.forEach(page => {
    assert.ok(html.includes(`href="${page}"`), `index.html must link to ${page}`);
  });

  // Verify dedicated showcase section
  assert.ok(html.includes('studio-trust-grid'), 'index.html must feature dedicated MPA showcase cards');
  assert.ok(html.includes('EXPLORE OUR STUDIO & TRANSPARENCY'), 'index.html must feature studio transparency showcase section');

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

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('✓ All UI requirements verified successfully!');
  process.exit(0);
} else {
  console.error('✗ Some UI requirements tests failed.');
  process.exit(1);
}




