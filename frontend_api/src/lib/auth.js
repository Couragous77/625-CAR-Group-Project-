import { api } from './api'

export async function registerUser({ email, password, name }) {
  const { data } = await api.post('/api/register', { email, password, name })
  return data
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/api/login', { email, password })
  return data // { access_token, token_type }
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/api/password_reset', { email })
  return data
}

export async function confirmPasswordReset({ token, new_password }) {
  const { data } = await api.post('/api/password_reset/confirm', { token, new_password })
  return data
}
