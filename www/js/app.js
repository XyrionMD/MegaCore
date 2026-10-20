/* ==================== MegaCore (MC) App JS ==================== */

const APP_NAME = "MegaCore";
const AI_NAME = "MC-C / MegaCore-CodeX";

const STORAGE_KEY = "megacore_settings";
const STORAGE_CHAT_KEY = "megacore_chat_history";
const MAX_HISTORY = 20; // Limit history to save tokens

// DOM Elements
const els = {
  btnSettings: document.getElementById("btnSettings"),
  btnCloseSidebar: document.getElementById("btnCloseSidebar"),
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  inpApiKey: document.getElementById("inpApiKey"),
  btnToggleApiKey: document.getElementById("btnToggleApiKey"),
  inpModel: document.getElementById("inpModel"),
  inpTemperature: document.getElementById("inpTemperature"),
  lblTemperature: document.getElementById("lblTemperature"),
  inpSystemPrompt: document.getElementById("inpSystemPrompt"),
  btnExpandPrompt: document.getElementById("btnExpandPrompt"),
  btnResetPrompt: document.getElementById("btnResetPrompt"),
  btnSaveSettings: document.getElementById("btnSaveSettings"),
  btnResetSettings: document.getElementById("btnResetSettings"),
  btnExportHistory: document.getElementById("btnExportHistory"),
  btnImportHistory: document.getElementById("btnImportHistory"),
  btnClearHistory: document.getElementById("btnClearHistory"),
  inpImportHistory: document.getElementById("inpImportHistory"),
  settingsStatus: document.getElementById("settingsStatus"),
  statusbar: document.getElementById("statusbar"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  messages: document.getElementById("messages"),
  formInput: document.getElementById("formInput"),
  inpMessage: document.getElementById("inpMessage"),
  btnSend: document.getElementById("btnSend"),
};

// Default settings
const DEFAULT_SETTINGS = {
  apiKey: "",
  model: "gemini-2.5-flash",
  temperature: 0.7,
  systemPrompt: `You are ${AI_NAME}, an AI Agent assistant for MegaCore (MC). 
You are an expert in programming, debugging, code analysis, and software development.

When responding:
- Use natural and professional English.
- If code is included, always wrap it in code blocks with the appropriate language (e.g. \`\`\`javascript).
- Explain code concisely and clearly.
- If there are errors, provide actionable fix solutions.
- Don't show plain text for code; use markdown for clean, readable formatting.

Always respond as ${AI_NAME}.`,
};

let settings = { ...DEFAULT_SETTINGS };
let isApiConfigured = false;
let chatHistory = []; // Chat history: [{ role: "user|model", parts: [{ text }] }]

// ==================== Viewport height fix for mobile ====================
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', () => {
  setTimeout(setVh, 100);
});

// ==================== Initialize Marked & Highlight.js ====================
function initMarkdown() {
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  });
}

// ==================== Initialization ====================
function init() {
  initMarkdown();
  loadSettings();
  loadChatHistory();
  applySettingsToUI();
  renderChatHistory();

  // Event: toggle sidebar
  els.btnSettings.addEventListener("click", () => {
    els.sidebar.classList.add("open");
    els.overlay.classList.add("visible");
    document.body.classList.add("sidebar-open");
  });

  els.btnCloseSidebar.addEventListener("click", closeSidebar);
  els.overlay.addEventListener("click", closeSidebar);

  // Event: toggle password visibility
  els.btnToggleApiKey.addEventListener("click", () => {
    const show = els.inpApiKey.type === "password";
    els.inpApiKey.type = show ? "text" : "password";
    els.btnToggleApiKey.textContent = show ? "🙈" : "👁️";
  });

  // Event: temperature slider
  els.inpTemperature.addEventListener("input", (e) => {
    els.lblTemperature.textContent = e.target.value;
  });

  // Event: expand/resize system prompt textarea
  els.btnExpandPrompt.addEventListener("click", () => {
    els.inpSystemPrompt.classList.toggle("expanded");
    els.btnExpandPrompt.textContent = els.inpSystemPrompt.classList.contains("expanded") ? "⛶" : "⛶";
    els.btnExpandPrompt.title = els.inpSystemPrompt.classList.contains("expanded") ? "Collapse" : "Expand";
  });

  // Event: reset system prompt to default
  els.btnResetPrompt.addEventListener("click", () => {
    if (confirm("Reset System Prompt to default?")) {
      els.inpSystemPrompt.value = DEFAULT_SETTINGS.systemPrompt;
      showStatus(els.settingsStatus, "System Prompt reset to default ♻️", "ok");
    }
  });

  // Event: save settings
  els.btnSaveSettings.addEventListener("click", saveSettings);

  // Event: reset to default
  els.btnResetSettings.addEventListener("click", resetSettings);

  // Event: history management
  els.btnExportHistory.addEventListener("click", exportHistory);
  els.btnImportHistory.addEventListener("click", () => els.inpImportHistory.click());
  els.inpImportHistory.addEventListener("change", importHistory);
  els.btnClearHistory.addEventListener("click", clearHistoryConfirm);

  // Event: send message - Send only via button, Enter = new line
  els.formInput.addEventListener("submit", (e) => e.preventDefault());
  els.btnSend.addEventListener("click", handleSend);

  // Allow Enter for new line, prevent form submit on Enter
  els.inpMessage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Allow default behavior (new line) — don't preventDefault
      return;
    }
  });

  // Auto-resize textarea
  els.inpMessage.addEventListener("input", () => {
    els.inpMessage.style.height = "auto";
    els.inpMessage.style.height = Math.min(els.inpMessage.scrollHeight, 160) + "px";
  });

  // Initial config check
  updateApiStatus();
}

function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.overlay.classList.remove("visible");
  document.body.classList.remove("sidebar-open");
}

// ==================== Settings ====================
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      settings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
}

function saveSettingsToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

function applySettingsToUI() {
  els.inpApiKey.value = settings.apiKey;
  els.inpModel.value = settings.model;
  els.inpTemperature.value = settings.temperature;
  els.lblTemperature.textContent = settings.temperature;
  els.inpSystemPrompt.value = settings.systemPrompt;
}

function saveSettings() {
  settings.apiKey = els.inpApiKey.value.trim();
  settings.model = els.inpModel.value;
  settings.temperature = parseFloat(els.inpTemperature.value) || 0.7;
  settings.systemPrompt = els.inpSystemPrompt.value.trim() || DEFAULT_SETTINGS.systemPrompt;

  saveSettingsToLocal();
  isApiConfigured = !!settings.apiKey;

  showStatus(els.settingsStatus, "Settings saved ✅", "ok");
  updateApiStatus();
  closeSidebar();
}

function resetSettings() {
  if (!confirm("Reset all settings to default?")) return;
  settings = { ...DEFAULT_SETTINGS };
  saveSettingsToLocal();
  applySettingsToUI();
  isApiConfigured = !!settings.apiKey;
  showStatus(els.settingsStatus, "Settings reset to default ♻️", "ok");
  updateApiStatus();
}

function showStatus(el, text, type = "ok") {
  el.textContent = text;
  el.className = "mc-status " + type;
  setTimeout(() => { el.textContent = ""; }, 3500);
}

function updateApiStatus() {
  if (isApiConfigured && settings.apiKey) {
    els.statusText.textContent = `Connected to Gemini (${settings.model})`;
    els.statusDot.classList.remove("ai-thinking");
  } else {
    els.statusText.textContent = "Enter API Key in settings (⚙️)";
    els.statusDot.classList.add("ai-thinking");
  }
  els.btnSend.disabled = !isApiConfigured;
}

// ==================== Chat History ====================
function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    if (raw) {
      chatHistory = JSON.parse(raw);
      // Validate data structure
      if (!Array.isArray(chatHistory)) chatHistory = [];
    }
  } catch (e) {
    console.error("Failed to load chat history:", e);
    chatHistory = [];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(chatHistory));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
}

function addToHistory(role, text) {
  // Gemini API format: { role: "user" | "model", parts: [{ text }] }
  chatHistory.push({ role: role === "user" ? "user" : "model", parts: [{ text }] });
  
  // Limit history length
  if (chatHistory.length > MAX_HISTORY * 2) {
    chatHistory = chatHistory.slice(-MAX_HISTORY * 2);
  }
  saveChatHistory();
}

function clearChatHistory() {
  chatHistory = [];
  saveChatHistory();
}

// ==================== History Export/Import/Clear ====================
function exportHistory() {
  if (chatHistory.length === 0) {
    showStatus(els.settingsStatus, "No history to export", "warn");
    return;
  }
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    history: chatHistory
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `megacore-history-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showStatus(els.settingsStatus, `History exported (${chatHistory.length} messages) ✅`, "ok");
}

function importHistory(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.history && Array.isArray(data.history)) {
        chatHistory = data.history;
        saveChatHistory();
        renderChatHistory();
        showStatus(els.settingsStatus, `History imported (${chatHistory.length} messages) ✅`, "ok");
      } else {
        throw new Error("Invalid file format");
      }
    } catch (err) {
      showStatus(els.settingsStatus, `Import failed: ${err.message}`, "err");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
}

function clearHistoryConfirm() {
  if (chatHistory.length === 0) {
    showStatus(els.settingsStatus, "History is already empty", "warn");
    return;
  }
  if (!confirm(`Delete ALL chat history (${chatHistory.length} messages)? This action cannot be undone.`)) return;
  clearChatHistory();
  // Reset messages container to show welcome message
  els.messages.innerHTML = `
    <div class="mc-message mc-message-ai">
      <div class="mc-bubble">
        <div class="mc-meta">MegaCore-CodeX <span class="mc-time"></span></div>
        <div class="mc-content">
          Hello! I'm <strong>MC-C (MegaCore-CodeX)</strong>, your AI Agent assistant.<br/><br/>
          Please set your <strong>Gemini API Key</strong> in the settings panel (⚙️) before starting. I'm ready to help with coding, debugging, and code analysis with clean markdown & syntax highlighting.
        </div>
      </div>
    </div>
  `;
  showStatus(els.settingsStatus, "Chat history deleted 🗑️", "ok");
}

function getHistoryForApi() {
  // Return history in format expected by Gemini
  return chatHistory;
}

function renderChatHistory() {
  // Clear welcome message if history exists
  if (chatHistory.length > 0) {
    els.messages.innerHTML = "";
    chatHistory.forEach(msg => {
      const role = msg.role === "user" ? "user" : "ai";
      const text = msg.parts?.[0]?.text || "";
      addMessage(role, text, false);
    });
    scrollToBottom(true); // Instant scroll for initial load
  }
}

// ==================== Chat Utilities ====================
function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addMessage(role, content, isStreaming = false) {
  const wrap = document.createElement("div");
  wrap.className = `mc-message mc-message-${role}`;

  const bubble = document.createElement("div");
  bubble.className = "mc-bubble";

  const meta = document.createElement("div");
  meta.className = "mc-meta";
  meta.innerHTML = `${role === "ai" ? AI_NAME : "You"} <span class="mc-time">${nowTime()}</span>`;

  const contentEl = document.createElement("div");
  contentEl.className = "mc-content";
  contentEl.dataset.role = role;

  bubble.appendChild(meta);
  bubble.appendChild(contentEl);
  wrap.appendChild(bubble);

  els.messages.appendChild(wrap);
  scrollToBottom();

  if (!isStreaming && role === "ai") {
    renderMarkdown(contentEl, content);
  } else if (role === "user") {
    contentEl.textContent = content;
  }

  return { wrap, contentEl };
}

function scrollToBottom(instant = false) {
  if (instant) {
    els.messages.scrollTop = els.messages.scrollHeight;
  } else {
    els.messages.scrollTo({
      top: els.messages.scrollHeight,
      behavior: "smooth"
    });
  }
}

// ==================== Markdown + Syntax Highlighting ====================
function renderMarkdown(el, raw) {
  // marked options already set in initMarkdown()
  const html = marked.parse(raw);
  el.innerHTML = html;

  // Add copy button + language label to each pre/code block
  el.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;

    // Detect language from marked class (language-xxx)
    let lang = "";
    const className = code.className || "";
    const match = className.match(/language-(\w+)/);
    if (match) lang = match[1];

    // Language label
    const langLabel = document.createElement("div");
    langLabel.className = "mc-lang";
    langLabel.textContent = lang || "text";
    pre.style.position = "relative";
    pre.insertAdjacentElement("afterbegin", langLabel);

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.className = "mc-copy-btn";
    copyBtn.title = "Copy code";
    copyBtn.innerHTML = "📋";
    copyBtn.addEventListener("click", () => copyCode(code));
    pre.appendChild(copyBtn);
  });
}

async function copyCode(codeEl) {
  const text = codeEl.innerText || codeEl.textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  const btn = codeEl.parentElement.querySelector(".mc-copy-btn");
  const original = btn.innerHTML;
  btn.innerHTML = "✅";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove("copied");
  }, 1400);
}

// ==================== Send Message ====================
async function handleSend(e) {
  e.preventDefault();

  const raw = els.inpMessage.value.trim();
  if (!raw) return;

  if (!isApiConfigured || !settings.apiKey) {
    alert("Gemini API Key not set. Open settings (⚙️) first.");
    return;
  }

  // Add user message to UI and history
  addMessage("user", raw);
  addToHistory("user", raw);
  
  els.inpMessage.value = "";
  els.inpMessage.style.height = "auto";
  els.btnSend.disabled = true;

  // AI typing indicator
  const typingWrap = document.createElement("div");
  typingWrap.className = "mc-message mc-message-ai";

  const typingBubble = document.createElement("div");
  typingBubble.className = "mc-bubble";
  typingBubble.style.maxWidth = "60%";

  const typingMeta = document.createElement("div");
  typingMeta.className = "mc-meta";
  typingMeta.innerHTML = `${AI_NAME} <span class="mc-time">...</span>`;

  const typingContent = document.createElement("div");
  typingContent.className = "mc-content mc-typing";
  typingContent.innerHTML = `<span></span><span></span><span></span>`;

  typingBubble.appendChild(typingMeta);
  typingBubble.appendChild(typingContent);
  typingWrap.appendChild(typingBubble);
  els.messages.appendChild(typingWrap);
  scrollToBottom();

  // Set status thinking
  els.statusDot.classList.add("ai-thinking");
  els.statusText.textContent = "MC-C is thinking...";

  try {
    const reply = await callGemini(raw);

    // Remove typing indicator
    typingWrap.remove();

    // Add AI response to UI and history
    addMessage("ai", reply);
    addToHistory("ai", reply);

    els.statusText.textContent = `Connected to Gemini (${settings.model})`;
  } catch (err) {
    typingWrap.remove();
    console.error(err);

    const errorMsg = `❌ Error: ${escapeHtml(err.message || String(err))}`;
    addMessage("ai", errorMsg);
    addToHistory("ai", errorMsg);

    els.statusText.textContent = "Connection failed. Check API Key and network.";
    els.statusDot.classList.remove("ai-thinking");
  } finally {
    els.btnSend.disabled = false;
    els.inpMessage.focus();
    scrollToBottom();
  }
}

// ==================== Call Gemini API ====================
async function callGemini(userText) {
  const model = settings.model || "gemini-1.5-flash";
  const temperature = settings.temperature || 0.7;
  const apiKey = settings.apiKey;
  const systemPrompt = settings.systemPrompt || DEFAULT_SETTINGS.systemPrompt;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Combine system prompt + chat history + latest message
  const history = getHistoryForApi();
  
  // The user message was already added to history via addToHistory in handleSend
  // So we send the full history including the latest user message
  
  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: history, // Send entire chat history
    generationConfig: {
      temperature: temperature,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson.error?.message || JSON.stringify(errJson);
    } catch (_) {
      detail = res.statusText;
    }
    throw new Error(`Gemini API error (${res.status}): ${detail}`);
  }

  const data = await res.json();

  // Get text from first candidate
  const candidates = data.candidates || [];
  if (!candidates.length) throw new Error("No response from AI.");

  const parts = candidates[0].content?.parts || [];
  const textParts = parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join("\n");

  if (!textParts) throw new Error("Empty AI response.");

  return textParts;
}

// ==================== Start ====================
init();