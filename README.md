# NutricIA Frontend

Mobile-first NutricIA app built with **Expo + React Native + TypeScript**.

## Stack

- React Native 0.81 + Expo SDK 54
- Expo Router v6
- TypeScript (strict mode)
- TanStack React Query + Zustand
- ESLint (Expo config)

## Setup

```bash
npm install
cp .env.example .env
# set EXPO_PUBLIC_API_URL in .env
```

## Run

```bash
npm run start
```

## Quality Commands

```bash
npm run lint
npm run lint:fix
npm run typecheck
```

## Notes

- Pre-commit hooks in the repository root run frontend lint and typecheck automatically.
- API URL is configured with `EXPO_PUBLIC_API_URL`.
