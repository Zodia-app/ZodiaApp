# Zodia – Project Context (ChatGPT Migration)

## Stack & How to Run
- **Mobile:** React Native (Expo), TypeScript
- **Minimum Node:** 18+
- **Package manager:** npm (package-lock present)
- **Run app:** `npm install` → `npx expo start`
- **Env:** Duplicate `.env.example` → `.env`. Add keys when backend is wired (`OPENAI_API_KEY`, etc.).

## Architecture (MVP)
- **App (this repo):**
  - UI Screens in `/screens`
  - Reusable components in `/components`
  - Client services in `/services` (e.g., `horoscopeService.ts`, `imageUploadService.ts`)
  - Local data/helpers in `/lib` & `/scripts`
- **Backend (separate or TBD):**
  - AI endpoints (OpenAI Responses API w/ Structured Outputs)
  - Reading jobs queue (async)
  - Storage for raw/parsed outputs

## Current Feature Status
- **Done:** Onboarding skeleton; Daily content structure; Basic queue UI; Palm camera + result screens WIP
- **WIP:** AI client swap (Claude → OpenAI); Palmistry vision pipeline; Payments (IAP) wiring; Push notifications

## Conventions
- **TypeScript:** strict-ish, small pure functions
- **Formatting:** Prettier / ESLint (see package.json scripts)
- **Testing:** Add contract tests for AI routes (JSON schema validity + length caps)

## Important Paths
- `screens/` – UI screens (Astrology, Tarot, Palm, Clairvoyance, etc.)
- `components/` – UI pieces (`ImagePreview`, `UploadProgress`)
- `services/` – client services (`horoscopeService`, `imageUploadService`)
- `docs/` – this bundle (prompts, schemas, evals, repo map)
- `assets/` – icons/splash

## Data Contracts
- All AI responses MUST follow schemas in `docs/SCHEMAS.md`
- UI renders `display_text` for prose + uses structured fields where available

## Environments & Keys (TBD)
- `OPENAI_API_KEY` – required by backend AI endpoints (not the app)
- IAP keys for Apple/Google when Payments are wired