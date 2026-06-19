const REGEX_PATTERNS = {
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
    confidence: 'high',
    label: 'Email address'
  },
  phone: {
    // US-style with loose international prefix fallback
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    confidence: 'high',
    label: 'Phone number'
  },
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    confidence: 'high',
    label: 'SSN'
  },
  creditCard: {
    // Loose digit-run match; medium confidence to avoid false positives on tracking numbers
    pattern: /\b(?:\d[ -]*?){13,16}\b/g,
    confidence: 'medium',
    label: 'Possible credit card number'
  },
  apiKeyOpenAI: {
    pattern: /\bsk-[A-Za-z0-9]{20,}\b/g,
    confidence: 'high',
    label: 'OpenAI API key'
  },
  apiKeyGitHub: {
    pattern: /\bghp_[A-Za-z0-9]{20,}\b/g,
    confidence: 'high',
    label: 'GitHub personal access token'
  },
  apiKeySlack: {
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g,
    confidence: 'high',
    label: 'Slack token'
  },
  apiKeyAWS: {
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    confidence: 'high',
    label: 'AWS access key'
  },
  ipAddress: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    confidence: 'medium',
    label: 'IP address'
  },
  privateKey: {
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    confidence: 'high',
    label: 'Private key block'
  }
};

function runRegexDetection(text) {
  const hits = [];
  for (const [type, config] of Object.entries(REGEX_PATTERNS)) {
    const matches = [...text.matchAll(config.pattern)];
    if (matches.length > 0) {
      hits.push({
        type,
        label: config.label,
        confidence: config.confidence,
        matches: matches.map(m => m[0]),
        indices: matches.map(m => m.index)
      });
    }
  }
  return hits;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runRegexDetection, REGEX_PATTERNS };
} else {
  globalThis.runRegexDetection = runRegexDetection;
  globalThis.REGEX_PATTERNS = REGEX_PATTERNS;
}
