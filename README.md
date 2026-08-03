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

## Required: microphone/speech permission (iOS only, one-time)

The 🎤 "speak instead of type" button in the chat assistant uses
[`@capacitor-community/speech-recognition`](https://github.com/capacitor-community/speech-recognition)
for native speech-to-text on iOS/Android (see `startVoiceInputNative` in
`app.js`). Same iOS rule as the camera: missing the usage-description keys
crashes the app instead of just denying permission.

Right after `npx cap add ios`, open `ios/App/App/Info.plist` and add:

```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>FitBuddy uses speech recognition so you can talk to your FitBuddy instead of typing.</string>
<key>NSMicrophoneUsageDescription</key>
<string>FitBuddy uses the microphone to hear you when you speak to your FitBuddy.</string>
```

Android needs no manual step — the plugin's own manifest declares
`RECORD_AUDIO`, merged automatically by `npx cap sync`. In a plain browser
(no native runtime), this falls back to the Web `SpeechRecognition` API,
which works in Chrome but has no Safari/iOS-WebView equivalent — that's why
the native plugin above is what actually gets voice input working on iOS.

## Required: Anthropic API key (for the chat assistant and onboarding coach)

Every message in the "Speak to your FitBuddy" chat is answered by a real
Claude model (`api/chat.js`, using Haiku 4.5, `fetchLlmReply` in `app.js`) —
grounded with a snapshot of the user's real numbers (calories, streak,
weight trend) so it never has to guess or hallucinate a figure. The
onboarding chat/voice flow (see below) uses the same endpoint with a
different persona and mode.

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
- **The chat assistant routes every message to a real Claude model**
  (`api/chat.js`, Haiku 4.5), styled as a bodybuilding/fitness coach and
  grounded with a snapshot of the user's real calories/streak/weight so it
  never has to guess a number. See "Required: Anthropic API key" above.
- **Onboarding chat/voice.** Alongside the quick 5-step form, the first
  onboarding screen also offers "💬 Chat or speak with your coach"
  (`renderOnboardChooser`/`renderOnboardChat` in `app.js`) — a hands-free
  conversation (same auto-listen/auto-restart pattern as the main chat
  widget) with a nutrition-coach persona (`ONBOARDING_PERSONA_PROMPT` in
  `api/chat.js`) that asks about lifestyle, motivations, dietary
  preferences/restrictions, schedule, and goals one question at a time in
  plain language, instead of a form. It still needs a handful of concrete
  numbers (name, sex, age, height, weight, workout days, location, diet
  preference) to build a real plan — the model asks for those naturally
  in conversation (accepting any units) rather than the user filling
  fields, but every number the app actually calculates with (calorie
  target, macros, target weight) still comes from the same deterministic
  formulas as the form path (`calcPlan`/`estimateTargetWeight`) — the LLM
  is never the one computing or inventing those. Each reply from the
  server includes a structured extraction of what's been learned so far
  (`mode:"onboarding"` in `api/chat.js`, parsed out of a trailing
  `###PROFILE_JSON###` block server-side); once everything needed is
  known, the client shows a plain-language summary of what it understood
  with a "build my plan" button (or "I'd rather fine-tune it myself",
  which drops you into the quick form with everything already filled in).
- **Nutrition Plan Generator.** Right after onboarding (either path) finishes
  building the deterministic calorie/macro plan, a brief "Creating your
  nutrition strategy..." screen calls a dedicated LLM prompt
  (`mode:"nutritionPlan"` in `api/chat.js`) that turns the profile into a
  13-part strategy: the calorie/protein/carb/fat/fiber/water targets (fiber
  and water via standard guideline formulas in `calcNutritionTargets`, and
  the model is told to report the exact numbers rather than recalculate
  them — same "never let the LLM invent a number" rule as everywhere else),
  plus meal timing, weekly goals, grocery recommendations, foods to
  prioritize/reduce, a restaurant guide, and healthy substitutions — all
  tailored to the user's specific goal (the prompt has separate
  prioritization guidance for weight loss, muscle gain, athletic
  performance, and heart health) and, when known, their lifestyle notes
  from the onboarding chat. It's shown on the Diet Plan tab
  (`renderNutritionStrategyCard` in `app.js`) with a "Regenerate" button;
  if the call fails or times out (12s), a deterministic, goal-tailored
  fallback strategy (`NUTRITION_STRATEGY_FALLBACKS`) is shown instead so
  onboarding is never left stuck waiting on a network request.
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
- **Speak a meal to log it.** The "Log something else I ate" modal now has
  a 🎤 button alongside typing — say what you ate (e.g. "a turkey sandwich
  and a side salad") and it's sent to a dedicated LLM prompt
  (`mode:"mealLog"` in `api/chat.js`) that estimates calories and macros
  for the whole thing (no weighing required, unlike the typed flow), then
  pre-fills the same review screen you'd get from typing or a photo — you
  still confirm with "Log it" before anything is recorded.
- **Custom meal plan override.** From Today or Diet Plan, "✏️ Use my own
  meals for a while" lets you define your own breakfast/lunch/dinner/snack
  (weight-based, same estimator as logging extras) for a set number of
  days. While it's active it fully replaces FitBuddy's own meal selection
  (Swap is hidden — it's your plan now) and a banner shows the days
  remaining with an "End it now" option; the algorithmic plan
  (`state.plan.meals`) is never touched, so once the duration elapses
  (`advanceDay` in `app.js`) it automatically reverts with a one-time
  notice, no regeneration needed.
- **Voice in the chat assistant, hands-free.** Opening the chat (tapping 💬)
  automatically starts listening — no need to tap the mic or say a wake
  phrase first. After each reply, it automatically starts listening again
  (`continueVoiceConversation` in `app.js`), so a whole conversation can
  happen hands-free; it only stops when you close the chat (✕). A 🔊/🔇
  toggle in the chat header reads bot replies aloud in British English
  (`speakText`, via the browser's built-in `speechSynthesis` — picks an
  `en-GB` voice when one is installed, otherwise falls back to any available
  English voice); when it's on, the mic waits for the reply to finish
  speaking before it starts listening again, so it doesn't hear itself. On
  the packaged native app (iOS/Android) this uses
  [`@capacitor-community/speech-recognition`](https://github.com/capacitor-community/speech-recognition)
  for real on-device speech-to-text (`startVoiceInputNative` in `app.js`) —
  see "Required: microphone/speech permission" above for the one-time iOS
  setup step. In a plain browser (no native runtime) it falls back to the
  Web `SpeechRecognition` API instead, which works in Chrome but has no
  Safari equivalent — the mic button is hidden there, same as it always was
  for plain-browser testing.
  - There's no true "always listening in the background" wake-word
    detection (e.g. saying "Hey FitBuddy" while the app is closed or the
    chat panel isn't open) — that needs a continuous, always-on audio
    pipeline that neither the Web Speech API nor the native plugin support,
    and would realistically require a dedicated wake-word SDK (e.g. Picovoice
    Porcupine). Hands-free only applies once the chat panel is open.

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
