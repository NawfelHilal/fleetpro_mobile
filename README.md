# FleetPro Mobile (Expo SDK 54)

React Native app using Expo, React Navigation, and Axios.

## Environment

Create `.env` from `.env.example`:

```
EXPO_PUBLIC_API_URL=http://host.docker.internal:8000/api
```

## Run with Docker

```bash
cd docker
docker compose up
```

What to expect (SDK 54):

- Terminal shows QR code and URLs (`exp://...`) for device; DevTools may not be on 19002
- Web build available at: `http://localhost:19006`

## Troubleshooting

- Logs: `docker compose logs -f app`
- Open on device: install Expo Go, scan QR from terminal output
- If tunnels are blocked, switch to LAN in `docker-compose.yml` command
- Ensure backend is reachable at: `http://localhost:8000/api`

## Run locally (optional)

```bash
npm i
npx expo install --fix
npm run start  # press 'w' for web or scan the QR
```
