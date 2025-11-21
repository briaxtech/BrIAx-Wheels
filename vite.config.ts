import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Check if we are running tests
  const isTest = mode === 'test';

  return {
    plugins: [react()],
    define: isTest ? {} : {
      // ONLY replace process.env.API_KEY during actual build/serve, NOT during tests.
      // This allows Vitest to mock process.env.API_KEY dynamically using vi.stubEnv.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});