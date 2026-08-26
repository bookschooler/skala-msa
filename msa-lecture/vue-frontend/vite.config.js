import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    proxy: {
      // 분양공고 조회는 course-service 직결.
      // 게이트웨이(8080)는 GET /api/courses 에도 인증을 요구해 401 이 납니다.
      // 게이트웨이 설정이 열리면 8080 으로 되돌리세요.
      '/api/courses': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/userinfo': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})