import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get base version
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));
const baseVersion = packageJson.version || '1.0.0';

// Generate version with git commit hash and build timestamp
let version = baseVersion;
try {
  // Get git commit hash (short) - use parent directory for git repo
  const repoRoot = path.resolve(__dirname, '../..');
  const gitHash = execSync('git rev-parse --short HEAD', { cwd: repoRoot, encoding: 'utf-8' }).trim();
  // Get build timestamp (YYYYMMDDHHmmss)
  const buildTimestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 14);
  version = `${baseVersion}.${buildTimestamp}.${gitHash}`;
  console.log(`[Vite Config] Generated version: ${version}`);
  console.log(`[Vite Config] Git hash: ${gitHash}`);
  console.log(`[Vite Config] Build timestamp: ${buildTimestamp}`);
} catch (error) {
  // Fallback if git is not available
  const buildTimestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 14);
  version = `${baseVersion}.${buildTimestamp}`;
  console.log(`[Vite Config] Generated version (no git): ${version}`);
  console.log(`[Vite Config] Error: ${error.message}`);
}

const buildTime = new Date().toISOString();

console.log(`[Vite Config] Final version for build: ${version}`);
console.log(`[Vite Config] Build time: ${buildTime}`);

// Write version to a file that can be imported at runtime (both src and public for build)
const versionFileSrc = path.resolve(__dirname, './src/version.json');
const publicDir = path.resolve(__dirname, './public');
const versionFilePublic = path.resolve(publicDir, './version.json');
const versionData = JSON.stringify({ version, buildTime }, null, 2);

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
  console.log(`[Vite Config] Created public directory: ${publicDir}`);
}

writeFileSync(versionFileSrc, versionData);
writeFileSync(versionFilePublic, versionData);
console.log(`[Vite Config] Version written to: ${versionFileSrc}`);
console.log(`[Vite Config] Version written to: ${versionFilePublic}`);

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to inject version and API URL
    {
      name: 'inject-version',
      transformIndexHtml(html) {
        // Inject version as both script and meta tag for better cache handling
        const scriptTag = `<script>window.__APP_VERSION__='${version}';window.__BUILD_TIME__='${buildTime}';window.__VITE_API_URL__='${process.env.VITE_API_URL || 'https://api.acoustic.uz/api'}';</script>`;
        const metaTag = `<meta name="app-version" content="${version}" /><meta name="build-time" content="${buildTime}" />`;
        return html.replace(
          '<head>',
          `<head>${metaTag}${scriptTag}`
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      plugins: [
        // Replace localhost:3001 in build output
        {
          name: 'replace-localhost',
          renderChunk(code, chunk) {
            const apiUrl = process.env.VITE_API_URL || 'https://api.acoustic.uz/api';
            // Replace localhost:3001 with production URL
            code = code.replace(/http:\/\/localhost:3001\/api/g, apiUrl);
            code = code.replace(/localhost:3001/g, 'api.acoustic.uz');
            return code;
          },
        },
      ],
    },
  },
  define: {
    // Use string replacement to ensure version is injected correctly
    '__APP_VERSION__': JSON.stringify(version),
    '__BUILD_TIME__': JSON.stringify(buildTime),
    // Force VITE_API_URL to production API URL during build
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.acoustic.uz/api'
    ),
    'import.meta.env.PROD': JSON.stringify(true),
    'import.meta.env.DEV': JSON.stringify(false),
  },
  // Ensure VITE_ prefixed env vars are available
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@acoustic/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

