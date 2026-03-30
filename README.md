<div align="center">

# 🤫 Confessions App

**A beautifully designed anonymous confession platform built with React Native + Expo + Firebase.**

![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-black?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

</div>

---

## 📱 About

**Confessions** is an anonymous social app where users can post their deepest thoughts, react to others' confessions, and comment — all without revealing their real identity. The app features real-time Firebase Firestore sync, advanced content moderation, a hidden admin system, and a sleek dark-themed UI.

---

## ✨ Features

### 🗣️ Core
- **Anonymous Confessions** — Post thoughts without revealing your identity
- **Custom Anonymous Identity** — Set a persistent display name (e.g. "MysticOwl42")
- **Tagging System** — Categorize posts: `Love`, `Crush`, `Rant`, `Secrets`, `College`, `Funny`
- **Comments** — Threaded real-time comments on every confession
- **Reactions** — React with 😍 Love, 😂 Funny, 💀 Dead, 😱 Shocked

### 🔥 Real-Time
- **Firebase Firestore** — All confessions, reactions, and comments sync live across devices
- **onSnapshot Listener** — Zero-latency updates; no manual refresh needed
- **Comments Subcollection** — Efficient Firestore data structure with nested subcollections

### 🛡️ Security & Moderation
- **Advanced Profanity Filter** — Detects abusive words in English, Hindi, and Hinglish
  - Handles l33t-speak (`f@ck`, `sh1t`)
  - Handles spaced words (`f u c k`)
  - Strips zero-width characters used to bypass filters
- **Smart Cooldown System** — Limits posting frequency; escalates for repeat spammers
- **Duplicate Detection** — Prevents posting the same text twice within 10 minutes
- **Report System** — Report posts for: Spam, Abuse/Harassment, Explicit Content, Hate Speech
- **Auto-Moderation** — Posts with 5+ reports are automatically hidden from the feed
- **Device Tracking** — Persistent device ID to track activity across sessions

### 🔐 Hidden Admin System
- **Secret 7-Tap Trigger** — Tap the app title "Confessions 🤫" **7 times within 2.5 seconds** to open the admin login — completely invisible to normal users
- **PIN-Protected Login** — Admin login screen with PIN entry, shake animation on wrong attempts, and eye-toggle for visibility
- **Admin Panel** — Full control dashboard featuring:
  - 📊 Stats strip — Total posts / Flagged (3+ reports) / Auto-hidden (5+ reports)
  - 🗑️ Delete any confession directly from Firestore with one tap
  - 🚩 Report count badge on every post (turns red when ≥ 3 reports)
  - Real-time live feed of **all** posts including auto-hidden ones
  - Logout button that resets admin state instantly
- **Inline Card Controls** — When logged in as admin, every confession card in the home feed shows a 🗑️ delete button and 🚩 report count — invisible to regular users
- **Zero Footprint** — Admin screens are never linked from any tab, button, or menu; only reachable via the gesture

### 📤 Sharing
- **Share as Image** — Convert any confession card into a branded image
- **Native Sharing** — Share directly to WhatsApp, Instagram, and other apps

### 🎨 UI/UX
- **Dark Theme** — Deep black (`#0D0D0D`) with purple/pink gradients
- **Animated Warning Banners** — Inline feedback for moderation blocks (not alert dialogs)
- **Loading States** — Spinner while fetching from Firestore
- **Trending Screen** — Sort by most reacted (all time) or today's top posts

---

## 🏗️ Project Structure

```
confessionapp/
├── App.js                        # Root component, navigation + AdminProvider
├── app.json                      # Expo project config
├── eas.json                      # EAS Build config (APK/AAB)
├── metro.config.js               # Metro bundler config (Firebase fix)
│
├── assets/                       # Icons and splash screens
│
└── src/
    ├── components/
    │   ├── ConfessionCard.js     # Post card — shows admin controls when isAdmin=true
    │   ├── ReactionBar.js        # Emoji reaction row
    │   ├── CommentItem.js        # Single comment row
    │   ├── TagChip.js            # Category tag badge
    │   ├── FAB.js                # Floating action button
    │   ├── ReportModal.js        # Report bottom sheet
    │   ├── ShareModal.js         # Share-as-image flow
    │   └── ProfileModal.js       # Custom identity picker
    │
    ├── screens/
    │   ├── HomeScreen.js         # Main feed — contains 7-tap secret trigger
    │   ├── PostScreen.js         # New confession composer
    │   ├── CommentsScreen.js     # Comment thread view
    │   ├── TrendingScreen.js     # Top/Today trending posts
    │   ├── AdminLoginScreen.js   # 🔐 Hidden PIN login (secret access only)
    │   └── AdminPanelScreen.js   # 🛡️ Admin control panel
    │
    ├── context/
    │   ├── ConfessionsContext.js # Global state + Firestore integration
    │   └── AdminContext.js       # Admin auth state (isAdmin, login, logout)
    │
    ├── config/
    │   └── firebaseConfig.js     # Firebase app initialization
    │
    ├── utils/
    │   ├── ModerationService.js  # Cooldown, duplicate detection, reports
    │   ├── profanityFilter.js    # Multi-language content filter
    │   ├── identity.js           # Random anonymous name generator
    │   └── timeAgo.js            # Relative timestamp formatter
    │
    ├── constants/
    │   └── theme.js              # Colors, tags, tag colors
    │
    └── data/
        └── dummyData.js          # Fallback data (pre-Firebase)
```

---

## 🗄️ Firestore Data Structure

```
confessions/                      ← collection
  └── {postId}/                   ← auto-generated document
        ├── text          (string)
        ├── authorName    (string)
        ├── tag           (string)
        ├── timestamp     (number - ms)
        ├── reportCount   (number)
        ├── commentCount  (number)
        ├── reactions/
        │   ├── Love      (number)
        │   ├── Funny     (number)
        │   ├── Dead      (number)
        │   └── Shocked   (number)
        └── comments/             ← subcollection
              └── {commentId}/
                    ├── authorName  (string)
                    ├── text        (string)
                    └── timestamp   (number)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) app on your phone
- A free [Firebase](https://console.firebase.google.com) account

### 1. Clone the repository
```bash
git clone https://github.com/Divyansh0109/Confession_app.git
cd Confession_app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Firebase
1. Go to [Firebase Console](https://console.firebase.google.com) → Create a new project
2. Click **`</>`** (Web) → Register app → copy config keys
3. Go to **Firestore Database** → Create database → **Test mode**
4. Open `src/config/firebaseConfig.js` and paste your keys:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

### 4. Run the app
```bash
# Development (WiFi — phone and PC must be on same network)
npx expo start

# Development (clear cache)
npx expo start -c

# Development (Tunnel — works on any network)
npx expo start -c --tunnel
```

Scan the QR code with **Expo Go** on Android, or Camera app on iOS.

---

## 🔐 Admin Access

> ⚠️ Keep this section private. Do not share the trigger or PIN publicly.

### Trigger
Tap the **"Confessions 🤫"** title on the Home screen **7 times within 2.5 seconds**.  
The Admin Login screen will open as a modal — invisible to any normal user.

### Default PIN
```
1234
```
Change it in `src/screens/AdminLoginScreen.js`:
```js
const ADMIN_PIN = '1234'; // ← change this
```

### Admin Panel Capabilities
| Feature | Description |
|---|---|
| 📊 Stats Strip | Total posts, flagged (≥3 reports), auto-hidden (≥5 reports) |
| 🗑️ Delete Posts | Permanently removes confession from Firestore |
| 🚩 Report Counts | Red badge on posts with 3+ reports |
| 👁️ Full Feed | Sees ALL posts including auto-hidden ones |
| 🔓 Logout | Immediately resets admin state; returns to Home |

### Security Notes
- Admin state is **in-memory only** — resets on every app restart
- Swipe-to-dismiss is **disabled** on the login modal
- Wrong PIN shows a generic `"Something went wrong"` error with a shake animation — revealing no information about what's wrong
- No tab, button, or label in the UI points to the admin screens

---

## 📦 Build APK (Android)

Uses **EAS Build** — builds in the cloud, no Android Studio needed.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure the project
eas build:configure

# Build APK (directly installable)
eas build -p android --profile preview

# Build AAB (for Play Store)
eas build -p android --profile production
```

Download the APK from your [Expo Dashboard](https://expo.dev) when the build completes (~10–15 min).

---

## 🔧 Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native 0.81 |
| Runtime | Expo SDK 54 |
| Database | Firebase Firestore v10 |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| Animations | React Native Animated API |
| Storage | AsyncStorage |
| Sharing | expo-sharing + react-native-view-shot |
| Build | EAS Build (Expo Application Services) |

---

## 📦 Key Dependencies

```json
"expo": "~54.0.0",
"firebase": "^10.14.1",
"@react-navigation/native": "^7.x",
"@react-navigation/stack": "^7.x",
"@react-navigation/bottom-tabs": "^7.x",
"@react-native-async-storage/async-storage": "2.2.0",
"expo-linear-gradient": "~15.x",
"expo-sharing": "~14.x",
"react-native-view-shot": "4.x"
```

---

## ⚠️ Important Notes

### Firebase in Expo Go
Firebase Firestore uses gRPC by default which doesn't work in Expo Go / React Native.
The `firebaseConfig.js` uses `experimentalForceLongPolling: true` to fix this.
The `metro.config.js` sets `unstable_enablePackageExports: false` to fix Metro bundling.

### Security
> 🔐 Never commit your `firebaseConfig.js` with real keys to a public repository!
> Add it to `.gitignore` or use environment variables for production.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">

Divyansh Sen &copy; 2026

</div>
