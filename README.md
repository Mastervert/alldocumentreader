# All documents reader

An offline document reader/organizer web app, packaged as an Android APK.

The app runs **entirely on the device** — no backend server, no user accounts, no tracking.
Your documents stay in the app's memory; nothing is uploaded. The "Dan" AI guide, the
convert/merge/split/sign/lock tools, and the quiz generator all work offline.

## What's in this repo

```
index.html               ← the app (single self-contained file; open it in any browser to try it)
config.js                ← your settings (feedback email, links). EDIT THIS FIRST.
build.py                 ← rebuilds index.html from the .js sources in src/
src/                     ← source modules (app.js, dan.js, dan2.js, dan3.js, engine.js, share.js,
                           tools.js, view.js, org.js, reading.js, intro.js, lang.js, catform.js,
                           toolart.js, pgbreak.js, pgscroll.js, iconpaths.js, icon-folder.js,
                           bgimages.js, crypto.js, style.css, build.py, privacy-policy.html)
privacy-policy.html      ← your public privacy policy page (publish this on a website)
icons/                   ← app icon PNGs (1024/512/192/180/32/16) + favicon.ico + icon.svg
package.json             ← Capacitor + build scripts
capacitor.config.json     ← Android app id and name
.github/workflows/build-apk.yml  ← builds the APK on GitHub Actions
feedback-email-script.gs ← Google Apps Script that receives feedback (optional)
README.md                ← this file
```

## Quick start (try the app in a browser)

Just open `index.html` in any modern browser. No build step needed — it already contains
the full app.

## First time setup (do this before the APK will build properly)

1. **Edit `config.js`** — fill in your details (the four/five lines at the top):
   ```js
   window.FWD_CONFIG={
     feedbackEndpoint:'',   // Google Apps Script web app URL (see feedback-email-script.gs)
     contactEmail:'',       // your support/feedback email
     siteUrl:'',            // your website where people download the app
     privacyUrl:'',         // public link to your privacy policy page
     storeUrl:''            // Google Play link (after you publish)
   };
   ```
   Leave a value as `''` until you have it — the app degrades gracefully (feedback shows
   "demo only", links show a friendly message instead of going nowhere).

2. **Commit the change.** On GitHub, click the pencil icon on `config.js`, paste your values, commit.

## Build the Android APK (on GitHub — no setup on your computer)

This repo has a GitHub Actions workflow that builds the APK for you.

1. Push everything in this folder to a new GitHub repository.
2. Go to the **Actions** tab → **Build Android APK** → **Run workflow** (it also runs
   automatically on every push to main/master).
3. When it finishes (about 5–8 minutes), click into the run → scroll to **Artifacts** →
   download `all-documents-reader-debug-apk`. Inside is `app-debug.apk`.
4. Copy that APK to your Android phone and open it (you may need to allow "install from
   unknown sources"). Done.

> The workflow uses [Capacitor](https://capacitorjs.com) to wrap `index.html` in an
> Android WebView, then Gradle to build the APK. You do not need Android Studio or
> Java installed locally — GitHub's runners have them.

## Build the APK on your own computer (optional)

Requirements: Node 20+, Python 3, JDK 17, Android SDK (or Android Studio).

```bash
npm install
npm run build:apk          # debug APK at android/app/build/outputs/apk/debug/app-debug.apk
# or, for a release build you can sign and publish:
npm run build:release
```

## Rebuilding index.html from the source modules

If you edit any file in `src/`, rebuild the bundle:

```bash
cd src
python3 build.py --deploy --out ../index.html
```

`--deploy` keeps `config.js` as an external file (what you want on GitHub). Omit it to
inline config too (handy for a quick local test).

## Privacy & security notes (what was audited)

- **No backend, no server, no database.** The app is a single HTML file. Documents live in
  the app's memory while it is open; they are never uploaded. There is nothing for
  "multiple users" to collide on — each phone runs its own independent copy.
- **File lock uses real cryptography.** The password is never stored. A salted PBKDF2-SHA256
  hash (100,000 iterations, per-file random salt) is kept instead, and unlock re-derives
  the hash to check. A wrong password is rejected; the plaintext password is not kept.
- **No third-party tracking.** The only automatic network request is Google Fonts CSS
  (for the reading typefaces). Feedback is user-initiated and sends only the message you
  type plus the app version/language.
- **No XSS sinks.** All user-controlled text (file names, search queries, AI output,
  category/folder names) is HTML-escaped at every insertion point. No `eval`, no inline
  event handlers, no `postMessage` surface.
- **No hardcoded credentials.** The developer email and all links come from `config.js`.
  A placeholder is shown until you fill them in.

See `privacy-policy.html` for the full privacy policy text.

## App ID (for publishing)

`com.raphael.alldocumentsreader` — set in `capacitor.config.json`. Change it before
publishing if you want a different package name.

## License

Yours to set. Add a `LICENSE` file before publishing.
