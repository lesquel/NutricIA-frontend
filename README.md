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

Set `EXPO_PUBLIC_API_URL` based on your target:

- Physical device (Expo Go): `http://<YOUR_PC_LAN_IP>:8000/api/v1`
- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator / web: `http://localhost:8000/api/v1`

## Run

```bash
npm run start
```

If mobile stays on loading screen, restart Metro cache and verify backend reachability:

```bash
npx expo start -c
```

Then open `http://<YOUR_PC_LAN_IP>:8000/health` from your phone browser.

## Quality Commands

```bash
npm run lint
npm run lint:fix
npm run typecheck
```

## Notes

- Pre-commit hooks in the repository root run frontend lint and typecheck automatically.
- API URL is configured with `EXPO_PUBLIC_API_URL`.

## Contributing (Frontend)

- Follow root contribution guide: `../CONTRIBUTING.md`
- Run before commit:

```bash
npm run lint
npm run typecheck
```
