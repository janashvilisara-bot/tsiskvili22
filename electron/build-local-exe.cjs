#!/usr/bin/env node
/**
 * TalentOS Local Build Script
 * ----------------------------
 * Reads electron/config.json and rebuilds the Windows .exe so that it
 * connects to a local Supabase stack (Docker) instead of Lovable Cloud.
 *
 * Usage:
 *   1. cp electron/config.example.json electron/config.json
 *   2. Edit electron/config.json (SUPABASE_URL, SUPABASE_ANON_KEY)
 *   3. node electron/build-local-exe.cjs
 *
 * Output: electron-release/TalentOS-win32-x64/TalentOS.exe
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_BACKUP = path.join(ROOT, '.env.cloud.backup');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error('❌ electron/config.json not found.');
  console.error('   Run: cp electron/config.example.json electron/config.json');
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes('PASTE')) {
  console.error('❌ Fill in SUPABASE_URL and SUPABASE_ANON_KEY in electron/config.json');
  process.exit(1);
}

// Backup existing cloud .env once
if (fs.existsSync(ENV_PATH) && !fs.existsSync(ENV_BACKUP)) {
  fs.copyFileSync(ENV_PATH, ENV_BACKUP);
  console.log('✅ Cloud .env backed up to .env.cloud.backup');
}

const envContent = `VITE_SUPABASE_URL=${cfg.SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${cfg.SUPABASE_ANON_KEY}
VITE_SUPABASE_PROJECT_ID=local
VITE_APP_MODE=local
`;
fs.writeFileSync(ENV_PATH, envContent);
console.log(`✅ Wrote .env → ${cfg.SUPABASE_URL}`);

try {
  console.log('\n📦 Building Vite bundle...');
  execSync('npx vite build', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n🪟 Packaging Windows exe...');
  execSync(
    'npx @electron/packager . "TalentOS" --platform=win32 --arch=x64 ' +
      '--out=electron-release --overwrite ' +
      "--ignore='^/src' --ignore='^/public' --ignore='^/electron-release' " +
      "--ignore='^/supabase' --ignore='^/docker'",
    { cwd: ROOT, stdio: 'inherit' }
  );

  console.log('\n✅ Done! Output:');
  console.log('   electron-release/TalentOS-win32-x64/TalentOS.exe');
  console.log(`   Backend: ${cfg.SUPABASE_URL}`);
} finally {
  if (fs.existsSync(ENV_BACKUP)) {
    fs.copyFileSync(ENV_BACKUP, ENV_PATH);
    console.log('\n♻️  Cloud .env restored (development unaffected).');
  }
}
