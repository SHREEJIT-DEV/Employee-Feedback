// This file is part of midnightntwrk/example-counter.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { fileURLToPath, URL } from 'node:url';

const localModulesDir = fileURLToPath(new URL('./node_modules', import.meta.url));
const rootModulesDir = fileURLToPath(new URL('../node_modules', import.meta.url));
const getModulePath = (subpath: string) => {
  const localPath = `${localModulesDir}/${subpath}`;
  return fs.existsSync(localPath) ? localPath : `${rootModulesDir}/${subpath}`;
};

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.vite',
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate chunk for WASM modules to avoid top-level await issues
          if (id.includes('onchain-runtime-v3')) return 'wasm';
        },
      },
    },
    commonjsOptions: {
      // Transform CommonJS to ESM more aggressively
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      // Needed for Node.js modules
      ignoreDynamicRequires: true,
    },
  },
  plugins: [
    react(),
    wasm(),
    // Polyfill `buffer` for browser builds: map 'buffer' -> npm buffer package
    // enforce:'pre' ensures this runs BEFORE vite:resolve externalizes Node built-ins
    {
      name: 'buffer-polyfill',
      enforce: 'pre' as const,
      resolveId(id: string) {
        if (id === 'buffer') {
          return getModulePath('buffer/index.js');
        }
        return null;
      },
    },
    topLevelAwait({
      // Be more permissive with top-level await
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
    // Custom resolver for handling problematic modules
    {
      name: 'wasm-module-resolver',
      resolveId(source, importer) {
        // Special handling for the problematic module
        if (
          source === '@midnight-ntwrk/onchain-runtime-v3' &&
          importer &&
          importer.includes('@midnight-ntwrk/compact-runtime')
        ) {
          // Force dynamic import for this case
          return {
            id: source,
            external: false,
            moduleSideEffects: true,
          };
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      // Configure ESBuild to handle Node.js-style modules
      platform: 'browser',
      format: 'esm',
      loader: {
        '.wasm': 'binary',
      },
    },
    include: [
      'buffer',
      '@midnight-ntwrk/midnight-js-protocol/compact-runtime',
      '@midnight-ntwrk/midnight-js-protocol/compact-js',
      '@midnight-ntwrk/midnight-js-protocol/ledger',
    ],
    exclude: [
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js',
    ],
  },
  define: {
    // Ensure Buffer is available globally
    global: 'globalThis',
  },
  // Add specific import configuration for more control
  resolve: {
    // Ensure WASM files are loaded properly
    alias: [
      {
        find: 'isomorphic-ws/browser.js',
        replacement: fileURLToPath(new URL('./src/shims/isomorphic-ws-browser.ts', import.meta.url)),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/compact-js/effect/Contract',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/compact-js-effect-contract.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/compact-js/effect',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/compact-js-effect.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/platform-js/effect/Configuration',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/platform-effect-configuration.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/platform-js/effect/ContractAddress',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/platform-effect-contract-address.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/compact-runtime',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/compact-runtime.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/compact-js',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/compact-js.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/ledger',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/ledger.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/onchain-runtime',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/onchain-runtime.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-protocol/platform-js',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-protocol/dist/platform.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-contracts',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-contracts'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-http-client-proof-provider',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-network-id',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-network-id'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-types',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-types'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-utils',
        replacement: getModulePath('@midnight-ntwrk/midnight-js-utils'),
      },
      {
        find: '@midnight-ntwrk/dapp-connector-api',
        replacement: getModulePath('@midnight-ntwrk/dapp-connector-api'),
      },
      {
        find: 'pino',
        replacement: getModulePath('pino/browser.js'),
      },
      {
        find: 'rxjs',
        replacement: getModulePath('rxjs/dist/esm5/index.js'),
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
});
