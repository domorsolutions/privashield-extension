// content.js — Privashield MVP Leak Detector

console.log("Privashield active: monitoring prompt input...");

// Basic PII regex patterns
const leakPatterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i,
  phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/
};

// Detect input box on ChatGPT/Claude
const inputSelector = 'textarea, div[contenteditable="true"]';

// Leak detection function
function checkForLeaks(text) {
  const found = [];
  for (const [type, pattern] of Object.entries(leakPatterns)) {
    if (pattern.test(text)) found.push(type);
  }
  return found;
}

// MutationObserver to monitor input changes
const observer = new MutationObserver(() => {
  const inputBox = document.querySelector(inputSelector);
  if (!inputBox) return;

  inputBox.addEventListener("input", (e) => {
    const inputText = e.target.innerText || e.target.value || "";
    const leaks = checkForLeaks(inputText);
    if (leaks.length > 0) {
      alert(`⚠️ Privashield detected possible ${leaks.join(", ")} in your prompt.`);
    }
  }, { once: true }); // Prevent alert spam
});

observer.observe(document.body, { childList: true, subtree: true });
