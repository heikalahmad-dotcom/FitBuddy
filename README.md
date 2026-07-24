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
├── api/
│   └── chat.js              ← Vercel serverless function proxying chat to Claude (holds the API key)
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

## Required: camera permission (iOS only, one-time)

The "📷 Snap a meal photo" feature uses [`@capacitor/camera`](https://capacitorjs.com/docs/apis/camera)
to open the native camera (see `takeMealPhoto` in `app.js`). Calling it
automatically triggers the OS permission prompt on both platforms — but
**iOS additionally requires you to declare *why* you need the camera**, or
the app will crash (not just deny permission) the moment a user taps
"Open camera."

Right after `npx cap add ios`, open `ios/App/App/Info.plist` and add:

```xml
<key>NSCameraUsageDescription</key>
<string>FitBuddy uses your camera to estimate calories from a photo of your meal.</string>
```

Android needs no manual step — `@capacitor/camera` declares the `CAMERA`
permission in its own manifest, which `npx cap sync` merges into your app's
manifest automatically, and the runtime permission prompt fires on its own.

## Required: Anthropic API key (for the chat assistant's LLM fallback)

The chat assistant is **hybrid**: fast, free, offline-capable rule-based
answers for factual questions (calories, macros, streak, weight trend —
anything with a real number, so it's never guessed or hallucinated), and a
real Claude model (`api/chat.js`, using Haiku 4.5) for anything open-ended
or emotional that the rules don't cover (see `generateBotReply` /
`fetchLlmReply` in `app.js`).

This needs one env var set in your Vercel project — **Project Settings →
Environment Variables**:

```
ANTHROPIC_API_KEY = <your Anthropic API key>
```

Never commit this key to the repo or put it in `www/` — anything in `www/`
ships to end users' devices. It only belongs in `api/chat.js`, which runs
server-side on Vercel and never reaches the client. If the key isn't set
(or the request fails for any reason — e.g. no network), the chat falls
back to a friendly "having trouble connecting" message instead of breaking.

**Known gap:** `api/chat.js` has no rate limiting yet — it's a public
endpoint bounded only by a per-message length cap and `max_tokens`. Fine
for personal/small-scale use; if this app gets real traffic, add a proper
rate limiter (e.g. Vercel KV/Upstash) before that becomes a cost risk.

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
- **The chat assistant is hybrid.** Factual questions (calories, macros,
  streak, weight trend, disliked foods, exercise swaps) are still answered
  instantly and offline by the original rule-based responder — no LLM
  involved, so numbers are never hallucinated. Anything else (feelings,
  motivation, open-ended questions) is routed to a real Claude model via
  `api/chat.js`. See "Required: Anthropic API key" above.
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
- **Voice in the chat assistant.** A 🔊/🔇 toggle in the chat header reads
  bot replies aloud in British English (`speakText` in `app.js`, via the
  browser's built-in `speechSynthesis` — picks an `en-GB` voice when one is
  installed, otherwise falls back to any available English voice). A 🎤
  button next to the chat input lets you speak instead of type, using the
  browser's `SpeechRecognition` API (`startVoiceInput`). **Known platform
  gap:** speech *input* works in Chrome and in the Android app (Chromium
  WebView), but Apple's iOS WKWebView doesn't implement `SpeechRecognition`
  at all — the mic button is simply hidden there. Voice *output* (spoken
  replies) works everywhere, including iOS, since `speechSynthesis` is
  broadly supported. Getting mic input working on iOS too would need a
  native Capacitor plugin (e.g. `@capacitor-community/speech-recognition`)
  with its own `NSSpeechRecognitionUsageDescription` /
  `NSMicrophoneUsageDescription` Info.plist entries — similar effort to the
  camera permission setup above.

## Recommended next steps (not yet implemented)

These are the natural upgrades now that FitBuddy is a real app shell rather
than a single HTML file, roughly in priority order:

1. **`@capacitor/preferences`** — swap the `localStorage` calls in
   `saveState`/`loadState` for this plugin's storage API, which is the
   Capacitor-recommended, more robust equivalent on native.
2. **App icon & splash screen** — use
   [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets)
   to generate all required icon/splash sizes from one source image.
3. **Rate limiting on `api/chat.js`** — see the callout above under
   "Required: Anthropic API key."

## Notes

- `appId` in `capacitor.config.json` is set to `com.fitbuddy.app` as a
  placeholder — change it to your own reverse-domain identifier before
  submitting to either app store (it can't be changed later without
  effectively shipping a new app).
- Google Fonts are currently loaded from `fonts.googleapis.com` over the
  network. That's fine for development, but for a production/offline-ready
  app you'll likely want to bundle the font files locally instead.
