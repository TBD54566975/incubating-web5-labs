import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins      : [vue()],
  optimizeDeps : {
    esbuildOptions: {
      supported: { 
        bigint: true 
      },
    }
  }, 
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
  }
});