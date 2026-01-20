
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

const REQUIRED_ASSETS = [
  { path: 'images/wildenflower-icon.png', description: 'Logo Icon' },
  { path: 'images/wildenflower-wordmark.png', description: 'Logo Wordmark' },
  { path: 'images/wildenflower-full.png', description: 'Full Logo' },
  { path: 'images/hero-background.png', description: 'Hero Background' },
  { path: 'images/category-tiedye.png', description: 'Tie-Dye Category Image' },
  { path: 'images/category-leather.png', description: 'Leather Category Image' },
  { path: 'favicon.ico', description: 'Favicon' },
  { path: 'icons/icon.png', description: 'App Icon' },
];

console.log('🔍 Verifying Brand Assets...\n');

let missingCount = 0;

REQUIRED_ASSETS.forEach((asset) => {
  const fullPath = path.join(PUBLIC_DIR, asset.path);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ [FOUND] ${asset.description} (${asset.path})`);
  } else {
    console.error(`❌ [MISSING] ${asset.description} (${asset.path})`);
    missingCount++;
  }
});

console.log('\n----------------------------------------');
if (missingCount === 0) {
  console.log('🎉 All required brand assets are present!');
  process.exit(0);
} else {
  console.error(`⚠️  Found ${missingCount} missing assets.`);
  process.exit(1);
}
