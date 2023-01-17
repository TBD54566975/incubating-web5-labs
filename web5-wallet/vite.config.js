import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  root  : 'ui',
  build : {
    outDir      : '../dist',
    emptyOutDir : true
  },
  plugins: [vue()],
});
