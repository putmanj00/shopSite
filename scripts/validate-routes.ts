import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MAX_PAGES = 100;

interface PageResult {
  url: string;
  status: number;
  error?: string;
  consoleErrors: string[];
}

async function validateRoutes() {
  console.log('🔍 Starting Route Validation and 404 Check...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const visited = new Set<string>();
  const queue: string[] = ['/'];
  const results: PageResult[] = [];

  let scannedCount = 0;

  while (queue.length > 0 && scannedCount < MAX_PAGES) {
    const urlPath = queue.shift();
    if (!urlPath || visited.has(urlPath)) continue;

    visited.add(urlPath);
    scannedCount++;

    const fullUrl = `${BASE_URL}${urlPath}`;
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    try {
      const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
      const status = response?.status() || 0;
      
      console.log(`[${scannedCount}/${MAX_PAGES}] ${status} ${urlPath}`);

      if (status >= 400) {
        results.push({ url: urlPath, status, consoleErrors });
        // Don't crawl Links from error pages
      } else {
        results.push({ url: urlPath, status, consoleErrors });
        
        // Extract links only from successful internal pages
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.getAttribute('href'))
                .filter(href => href && (href.startsWith('/') || href.startsWith(window.location.origin)))
                .map(href => {
                    if (href && href.startsWith(window.location.origin)) {
                        return href.replace(window.location.origin, '');
                    }
                    return href;
                });
        });

        for (const link of links) {
            if (link && !visited.has(link) && !queue.includes(link) && !link.startsWith('#') && !link.startsWith('mailto:')) {
                // normalize link (remove query params for queue uniqueness if desired, but keep for testing)
                // For now, simple exact match
                if (!link.match(/\.(png|jpg|jpeg|gif|svg|css|js|json)$/i)) { // ignore assets
                    queue.push(link);
                }
            }
        }
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`❌ ERROR ${urlPath}: ${errorMessage}`);
      results.push({ url: urlPath, status: 0, error: errorMessage, consoleErrors });
    }
    
    // Clear listeners
    page.removeAllListeners('console');
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));

  const errors = results.filter(r => r.status >= 400 || r.error || r.consoleErrors.length > 0);
  
  if (errors.length > 0) {
    console.log(`\n❌ Found ${errors.length} problematic pages:\n`);
    errors.forEach(e => {
        const errorType = e.status >= 400 ? `Status ${e.status}` : (e.error ? `Error: ${e.error}` : 'Console Errors');
        console.log(`• ${e.url} - ${errorType}`);
        if (e.consoleErrors.length > 0) {
            e.consoleErrors.forEach(ce => console.log(`    ⚠️ Console: ${ce}`));
        }
    });
    process.exit(1);
  } else {
    console.log('\n✅ All checked routes passed (200 OK, No Console Errors)');
    process.exit(0);
  }
}

validateRoutes();
