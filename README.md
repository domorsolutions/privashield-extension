# Privashield Extension 🔐

**Privashield** is a privacy-first browser extension that protects users from unintentionally leaking sensitive data while using AI tools like ChatGPT, Claude, Gemini, and Poe.

### ✅ What It Does

- Detects personally identifiable info (PII) like emails, phone numbers, SSNs
- Alerts users before submitting risky prompts to LLMs
- Offers inline redaction (`[REDACTED]`) before submission
- Adapts to each AI tool’s known vulnerabilities
- Works across major AI platforms

---

### 🔧 Features (MVP)

- Prompt leak detection engine (regex-based)
- Redaction + warning UI modal
- Support for ChatGPT, Claude (Gemini, Poe coming)
- Local-only — no cloud tracking
- Full open-source privacy policy

---

### 💡 Roadmap

- LLM-specific behavior engine (Prompt Injection Shield, Hallucination Warnings)
- SafePrompt AI Feedback Scoring (Pro feature)
- Weekly Leak Risk Reports
- File metadata scanner

---

### 🔐 Privacy

Privashield does not store, transmit, or sell any prompt data. All leak detection happens in-browser.

See: [`privacy-policy.md`](./privacy-policy.md)

---

### 👨‍💻 Contributing

1. Fork this repo
2. Create a feature branch
3. Submit a pull request

---

### 📩 Contact

For feedback or feature requests:  
📧 hello@privashield.ai _(temporary: use your business email until domain is live)_

 privashield-extension
Browser extension that protects users from leaking sensitive data to AI tools like ChatGPT, Claude, and Gemini.
