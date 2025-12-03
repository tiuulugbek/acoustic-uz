import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Read package.json to get base version
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));
const baseVersion = packageJson.version || '1.0.0';

// Generate version with git commit hash and build timestamp
let version = baseVersion;
try {
  // Get git commit hash (short) - use parent directory for git repo
  const gitHash = execSync('git rev-parse --short HEAD', { cwd: path.resolve(__dirname, '../..'), encoding: 'utf-8' }).trim();
  // Get build timestamp (YYYYMMDDHHmmss)
  const buildTimestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 14);
  version = `${baseVersion}.${buildTimestamp}.${gitHash}`;
  console.log(`[Vite] Generated version: ${version}`);
} catch (error) {
  // Fallback if git is not available
  const buildTimestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 14);
  version = `${baseVersion}.${buildTimestamp}`;
  console.log(`[Vite] Generated version (no git): ${version}`);
}

const buildTime = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_TIME__: JSON.stringify(buildTime),
    // Force VITE_API_URL to production API URL during build
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.acoustic.uz/api'
    ),
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

