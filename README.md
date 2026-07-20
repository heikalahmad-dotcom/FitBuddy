# FitBuddy

An AI-style fitness companion app: onboarding-driven diet + workout plans,
daily tracking, a workout session mode, meal swapping with allergy-aware
suggestions, an in-app "Speak to your FitBuddy" chat, and an inactivity
reminder — packaged as a Capacitor app so it can run as a real iOS/Android
app instead of just a browser tab.

## Project structure

```
fitbuddy-project/
├── www/                    ← the actual web app (this is what ships inside the native shell)
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── capacitor.config.json    ← tells Capacitor where the web app lives
├── package.json
├── .gitignore
└── README.md                ← you are here
```

`ios/` and `android/` folders are NOT included here — Capacitor generates
those native projects on your own machine the first time you run the add
commands below (they're large, platform-specific, and shouldn't be hand-built
or committed as generated boilerplate).

## Prerequisites (on your machine, not in this sandbox)

- **Node.js** 18+ and npm
- **For iOS:** a Mac with Xcode installed (App Store)
- **For Android:** Android Studio installed
- A free **Apple Developer** account (for iOS device testing) and a
  **Google Play Console** account (only needed later, for publishing)

## First-time setup

```bash
# from inside the fitbuddy-project folder
npm install
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/ios @capacitor/android

# generate the native projects (one-time, per platform)
npx cap add ios
npx cap add android
```

This creates `ios/` and `android/` folders containing real Xcode and Android
Studio projects that embed your `www/` folder as the app's UI.

## Whenever you edit www/ (html/css/js)

Any time you or I change files inside `www/`, sync those changes into the
native projects:

```bash
npx cap sync
```

## Running it

```bash
# opens the project in Xcode — press ▶ to run on a simulator or your iPhone
npx cap open ios

# opens the project in Android Studio — press ▶ to run on an emulator or your phone
npx cap open android
```

From Xcode/Android Studio you run it like any other native app project —
pick a simulator/emulator or a plugged-in device and hit Run.

## What changed for the native version (vs. the browser prototype)

- **Persistent storage is now wired in.** The original browser-artifact
  prototype kept all state in memory only (a chat/artifact sandbox rule).
  Since this is a real, packaged app now, `app.js` saves and restores state
  with `localStorage` automatically, so progress survives closing the app.
- **The chat assistant is still rule-based**, not a live LLM. It answers
  from your actual in-app data (calories, macros, streak, etc.) without
  needing an API key. See "Next steps" below if you want it to become a
  real conversational model.
- **Real local notifications.** The "we miss you" inactivity nudge now
  schedules a real OS-level notification via
  [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications)
  whenever you're running the packaged native app (see
  `scheduleInactivityNotification` in `app.js`), so it fires even when the
  app isn't open. It's rescheduled a few days out every time you log
  activity. In a plain browser (no native runtime), it falls back to the
  Web `Notification` API as before, driven by the in-app day simulation.
- **Native camera capture.** "Snap a meal photo" now opens the device
  camera via [`@capacitor/camera`](https://capacitorjs.com/docs/apis/camera)
  when running as the packaged native app (see `takeMealPhoto` in
  `app.js`), instead of the system file picker. In a plain browser it still
  falls back to the file input for local dev/testing.

## Recommended next steps (not yet implemented)

These are the natural upgrades now that FitBuddy is a real app shell rather
than a single HTML file, roughly in priority order:

1. **`@capacitor/preferences`** — swap the `localStorage` calls in
   `saveState`/`loadState` for this plugin's storage API, which is the
   Capacitor-recommended, more robust equivalent on native.
2. **App icon & splash screen** — use
   [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets)
   to generate all required icon/splash sizes from one source image.
3. **A real conversational backend** — if you want "Speak to your
   FitBuddy" to be a genuine LLM instead of the current rule-based
   responder, you'd stand up a small backend that holds an API key and
   proxies chat requests (the app can never hold that key itself).

## Notes

- `appId` in `capacitor.config.json` is set to `com.fitbuddy.app` as a
  placeholder — change it to your own reverse-domain identifier before
  submitting to either app store (it can't be changed later without
  effectively shipping a new app).
- Google Fonts are currently loaded from `fonts.googleapis.com` over the
  network. That's fine for development, but for a production/offline-ready
  app you'll likely want to bundle the font files locally instead.
