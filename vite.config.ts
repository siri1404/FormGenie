import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Load API key from the 'api' file
    let apiKey = '';
    try {
      const apiFile = readFileSync(path.resolve(__dirname, 'api'), 'utf8');
      const apiKeyMatch = apiFile.match(/GEMINI_API_KEY=(.+)/);
      if (apiKeyMatch) {
        apiKey = apiKeyMatch[1];
      }
    } catch (error) {
      console.warn('Could not read api file:', error);
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey || env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
