// content.js — Privashield Leak Detector

const INPUT_SELECTOR = 'textarea, div[contenteditable="true"]';
const DEBOUNCE_DELAY_MS = 300;

const leakPatterns = {
  email:      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi,        severity: "high" },
  phone:      { regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, severity: "high" },
  ssn:        { regex: /\b\d{3}-\d{2}-\d{4}\b/g,                                     severity: "high" },
  creditCard: { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,                               severity: "high" },
  apiKey:     { regex: /\b(?:sk-|ghp_|xox[baprs]-)[A-Za-z0-9]{20,}\b/g,             severity: "high" },
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getInputText(el) {
  return el.innerText || el.value || "";
}

function checkForLeaks(text) {
  const found = [];
  for (const [type, { regex }] of Object.entries(leakPatterns)) {
    regex.lastIndex = 0;
    if (regex.test(text)) found.push(type);
  }
  return found;
}

function redactText(text) {
  let redacted = text;
  for (const { regex } of Object.values(leakPatterns)) {
    regex.lastIndex = 0;
    redacted = redacted.replace(regex, "[REDACTED]");
  }
  return redacted;
}

function applyRedaction(inputEl) {
  const text = getInputText(inputEl);
  const redacted = redactText(text);
  if (inputEl.tagName === "TEXTAREA") {
    inputEl.value = redacted;
  } else {
    inputEl.innerText = redacted;
  }
  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
}

let activeBanner = null;

function showWarningBanner(leaks, inputEl) {
  if (activeBanner) activeBanner.remove();

  const banner = document.createElement("div");
  banner.id = "privashield-banner";

  const inner = document.createElement("div");
  Object.assign(inner.style, {
    position: "fixed",
    bottom: "88px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e1e2e",
    color: "#cdd6f4",
    border: "1px solid #f38ba8",
    borderRadius: "10px",
    padding: "14px 20px",
    zIndex: "2147483647",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
    maxWidth: "440px",
    width: "90vw",
    boxSizing: "border-box",
  });

  const title = document.createElement("strong");
  title.textContent = "⚠️ Privashield Warning";
  title.style.color = "#f38ba8";

  const msg = document.createElement("p");
  msg.style.margin = "8px 0";
  msg.innerHTML = `Possible <strong>${leaks.join(", ")}</strong> detected in your prompt.`;

  const btnRow = document.createElement("div");
  Object.assign(btnRow.style, { display: "flex", gap: "8px", marginTop: "10px" });

  function makeBtn(label, bg, color, onClick) {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: "1",
      padding: "6px 10px",
      background: bg,
      color,
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
    });
    btn.addEventListener("click", onClick);
    return btn;
  }

  btnRow.appendChild(makeBtn("Redact & Continue", "#a6e3a1", "#1e1e2e", () => {
    applyRedaction(inputEl);
    banner.remove();
    activeBanner = null;
  }));
  btnRow.appendChild(makeBtn("Send Anyway", "#585b70", "#cdd6f4", () => {
    banner.remove();
    activeBanner = null;
  }));
  btnRow.appendChild(makeBtn("Cancel", "#313244", "#cdd6f4", () => {
    banner.remove();
    activeBanner = null;
  }));

  inner.appendChild(title);
  inner.appendChild(msg);
  inner.appendChild(btnRow);
  banner.appendChild(inner);
  document.body.appendChild(banner);
  activeBanner = banner;
}

function isEnabled() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get("enabled", ({ enabled }) => {
        resolve(enabled !== false);
      });
    } catch {
      resolve(true);
    }
  });
}

function incrementLeakCount() {
  try {
    chrome.storage.local.get("leakCount", ({ leakCount }) => {
      chrome.storage.local.set({ leakCount: (leakCount || 0) + 1 });
    });
  } catch {
    // storage unavailable — non-fatal
  }
}

async function handleInput(inputEl) {
  const enabled = await isEnabled();
  if (!enabled) return;

  const text = getInputText(inputEl);
  if (!text.trim()) return;

  try {
    const leaks = checkForLeaks(text);
    if (leaks.length > 0) {
      incrementLeakCount();
      showWarningBanner(leaks, inputEl);
    }
  } catch (err) {
    // leak check failed — fail silently to avoid disrupting the user
  }
}

// Track bound elements to avoid duplicate listeners
const boundInputs = new WeakSet();

function bindToInput(inputEl) {
  if (boundInputs.has(inputEl)) return;
  boundInputs.add(inputEl);
  inputEl.addEventListener("input", debounce(() => handleInput(inputEl), DEBOUNCE_DELAY_MS));
}

// Bind any inputs already present when the script loads (document_idle runs after render)
document.querySelectorAll(INPUT_SELECTOR).forEach(bindToInput);

// Watch for inputs added later (new chat, page re-render)
const observer = new MutationObserver(() => {
  document.querySelectorAll(INPUT_SELECTOR).forEach(bindToInput);
});

observer.observe(document.body, { childList: true, subtree: true });
