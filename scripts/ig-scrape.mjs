// IG corpus scraper — logged-in, your own account, your own data.
//
// Opens a real Chromium window using a PERSISTENT profile. You log in by hand
// once; the session sticks for future runs. It then scrolls your full profile
// grid, visits each post, and saves the post image + caption to a local corpus.
// This replaces the slow Meta "Download Your Information" export for the
// brand-reference pass.
//
// Run from the shopSite dir (so it resolves the bundled playwright + browser):
//   cd ~/projects/wildenflower/shopSite
//   node scripts/ig-scrape.mjs
//
// Env knobs (all optional):
//   IG_HANDLE   profile to pull            (default: wildenflower)
//   IG_MAX      cap number of posts        (default: 0 = all)
//   IG_OUT      output dir                 (default: ../instagram/full-export)
//   IG_PROFILE  browser profile dir        (default: ~/.cache/wf-ig-profile)
//
// Notes / honest caveats:
//   - This drives YOUR account viewing YOUR posts — legitimate use of your own
//     data. Instagram still broadly restricts automated access in its ToS and
//     actively fights bots; low volume + human-ish delays + manual login keep
//     the flag risk low, but it is not zero. If IG throws a challenge, stop and
//     rerun later.
//   - cdninstagram image URLs are signed and expire, so bytes are downloaded
//     immediately rather than stored as links.
//   - og:image is the post's first/cover image; carousel extras are counted in
//     the manifest (imgCount) but only the cover is saved. Enough for a brand
//     reference corpus.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

const HANDLE = process.env.IG_HANDLE || 'wildenflower';
const MAX = Number(process.env.IG_MAX || 0);
const OUT = resolve(process.env.IG_OUT || '../instagram/full-export');
const PROFILE_DIR = process.env.IG_PROFILE || join(homedir(), '.cache', 'wf-ig-profile');
const MEDIA = join(OUT, 'media');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.floor(Math.random() * (b - a));

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || (await ctx.newPage());

async function isLoggedIn() {
  const cookies = await ctx.cookies('https://www.instagram.com');
  return cookies.some((c) => c.name === 'sessionid' && c.value);
}

// 1. Login gate — wait (up to 5 min) for you to log in by hand.
await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
if (!(await isLoggedIn())) {
  console.log('\n>>> Log in to Instagram in the browser window that just opened.');
  console.log('>>> Waiting for your session (up to 5 minutes)...');
  const deadline = Date.now() + 5 * 60 * 1000;
  while (!(await isLoggedIn())) {
    if (Date.now() > deadline) {
      console.error('Login timed out. Rerun when ready.');
      await ctx.close();
      process.exit(1);
    }
    await sleep(2000);
  }
}
console.log('Logged in. Loading profile grid for @' + HANDLE + '...');

// 2. Scroll the profile grid, collecting post/reel links until it stops growing.
await page.goto(`https://www.instagram.com/${HANDLE}/`, { waitUntil: 'domcontentloaded' });
await sleep(jitter(1500, 3000));
const links = new Set();
let stable = 0;
while (stable < 4) {
  const before = links.size;
  const hrefs = await page.$$eval('a[href*="/p/"], a[href*="/reel/"]', (as) =>
    as.map((a) => a.getAttribute('href'))
  );
  for (const h of hrefs) if (h) links.add(h.split('?')[0]);
  if (MAX && links.size >= MAX) break;
  await page.mouse.wheel(0, 2200);
  await sleep(jitter(900, 1800));
  stable = links.size === before ? stable + 1 : 0;
}
let postPaths = [...links];
if (MAX) postPaths = postPaths.slice(0, MAX);
console.log(`Found ${postPaths.length} posts.`);

// 3. Visit each post; pull og:image + caption; download cover bytes now.
await mkdir(MEDIA, { recursive: true });
const manifest = [];
let i = 0;
for (const p of postPaths) {
  i++;
  const url = `https://www.instagram.com${p}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await sleep(jitter(700, 1500));
    const meta = await page.evaluate(() => {
      const g = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
      return {
        ogImage: g('meta[property="og:image"]'),
        ogDesc: g('meta[property="og:description"]'),
        title: g('meta[property="og:title"]'),
        imgs: [...document.querySelectorAll('article img')]
          .map((im) => im.src)
          .filter((s) => s && s.includes('cdninstagram')),
      };
    });
    const shortcode = p.replace(/\/(p|reel)\//, '').replace(/\//g, '') || `post_${i}`;
    let file = null;
    const src = meta.ogImage || meta.imgs[0];
    if (src) {
      const resp = await ctx.request.get(src);
      if (resp.ok()) {
        file = `${shortcode}.jpg`;
        await writeFile(join(MEDIA, file), await resp.body());
      }
    }
    manifest.push({
      index: i,
      url,
      shortcode,
      caption: meta.ogDesc,
      title: meta.title,
      image: file,
      imgCount: meta.imgs.length,
    });
    console.log(`[${i}/${postPaths.length}] ${shortcode} ${file ? '✓' : '(no image)'}`);
  } catch (e) {
    console.warn(`[${i}] ${url} failed: ${e.message}`);
    manifest.push({ index: i, url, error: e.message });
  }
  await sleep(jitter(1200, 2600)); // human-ish throttle
}

await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
const got = manifest.filter((m) => m.image).length;
console.log(`\nDone. ${got}/${manifest.length} images saved.`);
console.log(`  media    -> ${MEDIA}`);
console.log(`  manifest -> ${join(OUT, 'manifest.json')}`);
await ctx.close();
