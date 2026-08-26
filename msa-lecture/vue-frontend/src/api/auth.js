import api from './index.js'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const authApi = {
  // 공개 클라이언트용 Authorization Code + PKCE 토큰 교환
  exchangeCode(code, codeVerifier) {
    const clientId = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier || ''
    })

    return axios.post(
      `${API_BASE_URL}/oauth2/token`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
  },

  // 내 정보 조회
  getMe() {
    return api.get('/api/users/me')
  },

  // 회원가입
  register(data) {
    return api.post('/api/users/register', data)
  }
}
