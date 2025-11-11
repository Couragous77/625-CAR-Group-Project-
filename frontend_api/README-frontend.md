# API Frontend (Auth-only)

This is the **frontend_api** that wires to FastAPI auth endpoints.

## Quick start
1) Copy `.env.sample` to `.env` and adjust `VITE_API_BASE_URL`.
2) Install deps:
   ```bash
   npm install
   ```
3) Run:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## Pages
- `/login` — email/password, saves JWT to localStorage on success
- `/register` — create account
- `/password-reset` — request reset link
- `/password-reset/confirm?token=...` — set new password
- `/dashboard` — protected route

## Backend contract (FastAPI)
- `POST /api/register` { email, password, name? }
- `POST /api/login` { email, password } → { access_token, token_type }
- `POST /api/password_reset` { email }
- `POST /api/password_reset/confirm` { token, new_password }

## Notes
- Ensure CORS on backend allows `http://localhost:5173`.
- JWT is stored at `localStorage.auth_token` and attached as `Authorization: Bearer <token>`.
