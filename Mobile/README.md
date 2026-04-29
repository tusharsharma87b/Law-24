# Law24 — Mobile App

A premium legal-tech app built with **React Native + Expo Router**.  
Connects users with verified lawyers, provides AI-powered legal guidance (NyayaAI), and helps manage legal cases end-to-end.

---

## ✨ Features

| Module | What it does |
|---|---|
| **Home** | Smart search (layman language), live experts, top-rated lawyers, NyayaAI card |
| **Lawyers Directory** | Search, filter, sort — by rating, price, city, availability, court type |
| **Lawyer Profile** | Full profile with stats, reviews, queue system, Talk Now / Chat / Schedule |
| **Case OS** | Multi-case tracking with timeline, documents, AI strategy, lawyer collaboration |
| **NyayaAI** | In-app AI legal advisor trained on Indian law |
| **Notifications** | Categorised alerts — hearings, tasks, payments, lawyer availability |
| **Wallet** | Balance, top-up, transaction history |
| **Documents** | Upload / manage case documents, lawyer-user collaboration |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/client) app on your phone (Android / iOS)

### 1. Clone the repo

```bash
git clone https://github.com/tusharsharma87b/Law-24.git
cd "Law 24/Mobile"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start
```

### 4. Open on your device

- **Android / iOS** — Scan the QR code with Expo Go
- **Web** — Press `w` or open `http://localhost:8081`

---

## Run Full Stack With One Command

From the project root (`Law 24`), start backend + mobile together:

```bash
npm install
npm run dev
```

This runs:
- API: `Mobile/apps/api` on port `4000`
- Mobile: Expo dev server from `Mobile`

### Optional Root Environment Override

To force a specific API URL for mobile, set:

```bash
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:4000
```

If not set, mobile uses dynamic defaults from `Mobile/src/config/api.ts`:
- Android emulator: `http://10.0.2.2:4000`
- iOS/simulator/device in Expo: detected LAN host IP
- fallback: `http://localhost:4000`

---

## 📁 Project Structure

```
app/
  (auth)/          → Login, OTP screens
  (tabs)/          → Home, Lawyers, Cases, Documents, Profile
  lawyer/[id].tsx  → Lawyer profile
  case/[id].tsx    → Case detail (all tabs)
  nyaya.tsx        → NyayaAI chat
  payment.tsx      → Payment flow

components/
  lawyer/          → LawyerCard, LawyerDirectoryCard, Avatar
  notifications/   → NotificationSheet
  ui/              → Button, SectionHeader, Avatar

constants/
  colors.ts        → Design system color tokens
  mockData.ts      → Seed data for lawyers, cases, notifications
  lawyersDirectory.ts → Filter/sort logic for lawyers

store/
  useAuthStore.ts        → Auth state
  useLawyerFiltersStore.ts → Lawyers tab filters (persisted)
  useCaseStore.ts        → Case data
  useNotificationStore.ts → Notifications
  useWalletStore.ts      → Wallet balance
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React Native 0.81 | Core framework |
| Expo SDK 54 | Build tooling, native modules |
| Expo Router v6 | File-based navigation |
| Zustand v5 | State management |
| React Navigation | Tab + stack navigation |
| LinearGradient | Premium gradients |
| react-native-safe-area-context | Safe area handling |

---

## 📱 Running on a physical device

1. Install **Expo Go** from the App Store or Play Store
2. Run `npx expo start`
3. Scan the QR code shown in the terminal

> **Note:** The app uses mock data in Phase 1. No backend is required to run locally.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Private project — Law24 © 2026
