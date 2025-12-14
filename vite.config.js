// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ⭐ ADD THIS IMPORT
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // ⭐ ADD THIS PLUGIN for JSX support
    tailwindcss(),
  ],
  
  
});