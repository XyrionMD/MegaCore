<p align="center">
  <img src="www/img/logo.png" alt="MegaCore Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(56, 189, 248, 0.4);">
</p>

<h1 align="center">MegaCore (MC) — AI Agent Assistant</h1>

<p align="center">
  <strong>A sleek, mobile-first AI coding assistant powered by Google Gemini — built with Apache Cordova</strong>
</p>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> •
  <a href="#-quick-start"><strong>Quick Start</strong></a> •
  <a href="#-build-apk"><strong>Build APK</strong></a> •
  <a href="#-project-structure"><strong>Structure</strong></a> •
  <a href="#-configuration"><strong>Config</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Cordova-15.1%2B-0B0E14?style=for-the-badge&logo=apachecordova&logoColor=38BDF8" alt="Cordova">
  <img src="https://img.shields.io/badge/Android-5.0%2B-0B0E14?style=for-the-badge&logo=android&logoColor=38BDF8" alt="Android">
  <img src="https://img.shields.io/badge/Gemini_API-1.5%20%7C%202.0-0B0E14?style=for-the-badge&logo=google&logoColor=38BDF8" alt="Gemini API">
  <img src="https://img.shields.io/badge/License-Apache_2.0-0B0E14?style=for-the-badge&logo=apache&logoColor=38BDF8" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-0B0E14?style=for-the-badge&logo=github&logoColor=38BDF8" alt="PRs welcome">
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 **AI-Powered Chat**
- Google Gemini API integration (1.5 Flash/Pro, 2.0 Flash/Pro)
- Streaming-like response rendering
- Configurable temperature & model selection

</td>
<td width="50%">

### 🎨 **Beautiful Dark UI**
- Modern dark theme with cyan accent
- Mobile-first responsive design
- Safe-area support (notches, home indicators)
- Smooth animations & transitions

</td>
</tr>
<tr>
<td>

### 📝 **Markdown & Code Rendering**
- GitHub Flavored Markdown (GFM)
- Syntax highlighting via highlight.js (180+ languages)
- Copy-to-clipboard on code blocks
- Language detection badges

</td>
<td>

### ⚙️ **Settings Panel**
- Secure API key storage (localStorage)
- System prompt customization
- Temperature slider (0–1)
- Export/Import/Clear chat history (JSON)

</td>
</tr>
<tr>
<td>

### 💾 **Offline-First**
- Chat history persisted locally (max 20 conversations)
- Works without internet after initial load
- No backend required

</td>
<td>

### 📱 **Native Android App**
- Builds to APK/AAB via Cordova
- Full-screen immersive experience
- Hardware back button support
- Installable on any Android 5.0+ device

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Apache Cordova 15+ |
| **Platform** | Android (cordova-android 15+) |
| **AI Provider** | Google Generative Language API (Gemini) |
| **Markdown** | [marked](https://github.com/markedjs/marked) |
| **Syntax Highlighting** | [highlight.js](https://highlightjs.org/) |
| **Styling** | Vanilla CSS (Custom Properties, CSS Grid/Flex) |
| **Storage** | localStorage (Settings + Chat History) |
| **Build** | Gradle (via Cordova CLI) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ & npm
- **Java JDK 17 or 21** (⚠️ Java 24+ will fail Gradle build)
- **Android Studio** + Android SDK (`ANDROID_HOME` set)
- **Cordova CLI**: `npm install -g cordova`

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/megacore.git
cd megacore
npm install          # Installs cordova-android dev dependency
cordova platform add android
```

### 2. Configure Java (Important!)

```bash
# Linux/macOS (adjust path to your JDK 21)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH="$JAVA_HOME/bin:$PATH"

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### 3. Run in Browser (Dev)

```bash
# Serve www/ folder for quick UI testing
npx serve www
# or
python3 -m http.server 8080 -d www
```

### 4. Build & Run on Device

```bash
# Build debug APK
cordova build android

# Install & launch on connected device (USB debugging on)
cordova run android
```

---

## 📦 Build APK (Detailed)

| Command | Output |
|---------|--------|
| `cordova build android` | `platforms/android/app/build/outputs/apk/debug/app-debug.apk` |
| `cordova build android --release` | Unsigned release APK (sign manually for Play Store) |

### Signing for Release (Play Store)

```bash
# 1. Generate keystore (once)
keytool -genkey -v -keystore megacore-release.keystore -alias megacore -keyalg RSA -keysize 2048 -validity 10000

# 2. Create platforms/android/release-signing.properties
storeFile=../../megacore-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=megacore
keyPassword=YOUR_KEY_PASSWORD

# 3. Build signed AAB/APK
cordova build android --release
# Output: platforms/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📁 Project Structure

```
megacore/
├── www/                    # 🎯 Main web app (edit these!)
│   ├── index.html          # App shell + UI structure
│   ├── css/
│   │   └── style.css       # Complete styling (800+ lines)
│   ├── js/
│   │   └── app.js          # App logic (600+ lines)
│   └── img/
│       └── logo.png        # App icon/logo
├── config.xml              # Cordova config (app ID, name, permissions)
├── package.json            # Node metadata + cordova-android dep
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

### Key Files to Customize

| File | Purpose |
|------|---------|
| `config.xml` | App ID (`com.yourcompany.app`), name, version, icons, permissions |
| `www/index.html` | UI structure, meta tags, CDN links |
| `www/css/style.css` | Colors (`:root` vars), spacing, animations |
| `www/js/app.js` | API logic, default settings, system prompt |

---

## ⚙️ Configuration

### `config.xml` Essentials

```xml
<widget id="com.yourcompany.megacore" version="1.0.0" ...>
    <name>MegaCore</name>
    <description>Your AI coding assistant</description>
    <author email="you@example.com" href="https://your.site">Your Name</author>
    <content src="index.html" />
    <access origin="*" />
    <!-- Add icons/splashes in res/ folders for production -->
</widget>
```

### Default AI Settings (in `www/js/app.js`)

```javascript
const DEFAULT_SETTINGS = {
  apiKey: "",                    // Set via Settings ⚙️ in app
  model: "gemini-2.5-flash",    // Or: gemini-1.5-pro, gemini-2.0-flash-exp
  temperature: 0.7,
  systemPrompt: `You are MC-C (MegaCore-CodeX), an expert coding assistant...`
};
```

### Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API Key
3. Open app → Settings (⚙️) → Paste key → Save

---

## 🎯 Usage Tips

- **Enter** = New line in message input
- **Settings (⚙️)** → Configure API key, model, creativity, system prompt
- **Export History** → Backup chats as JSON
- **Import History** → Restore from backup
- **Clear History** → Wipe all local chats
- **Long-press code block** → Copy button appears (top-right)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Code Style

- Vanilla JS (ES6+), no frameworks
- CSS Custom Properties for theming
- Mobile-first, accessibility-aware
- Semantic HTML5

---

## 📄 License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

Originally based on Apache Cordova Hello World template.

---

## 🙏 Acknowledgments

- [Apache Cordova](https://cordova.apache.org/) — Hybrid app framework
- [Google Gemini](https://ai.google.dev/) — Generative AI models
- [marked](https://marked.js.org/) — Markdown parser
- [highlight.js](https://highlightjs.org/) — Syntax highlighting
- [Google AI Studio](https://aistudio.google.com/) — Free API keys

---

<p align="center">
  Made with 💙 for developers who want AI in their pocket.
</p>

<p align="center">
  <sub>Star ⭐ this repo if MegaCore helps you code faster!</sub>
</p>