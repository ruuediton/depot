import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
        }
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks otimizados
            if (id.includes('node_modules')) {
              // React tem prioridade máxima
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'react-vendor';
              }
              // Supabase
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              // Charts
              if (id.includes('recharts')) {
                return 'charts';
              }
              // PDF utils (grandes bibliotecas)
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf-utils';
              }
              // Outros vendors (apenas se não for React)
              if (!id.includes('react')) {
                return 'vendor';
              }
            }
          },
          // Otimização de nomes de arquivo para cache
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      sourcemap: false,
      // Otimizações adicionais
      reportCompressedSize: false, // Mais rápido em build
      cssMinify: true
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js']
    }
  };
});
