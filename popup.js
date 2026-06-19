// popup.js — Privashield popup controller

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("ps-toggle");
  const statusLabel = document.getElementById("ps-status");
  const leakCountEl = document.getElementById("leak-count");

  function updateStatusLabel(enabled) {
    statusLabel.textContent = enabled ? "Active" : "Paused";
    statusLabel.style.color = enabled ? "#a6e3a1" : "#585b70";
  }

  chrome.storage.local.get(["enabled", "leakCount"], ({ enabled, leakCount }) => {
    const isEnabled = enabled !== false;
    toggle.checked = isEnabled;
    updateStatusLabel(isEnabled);
    leakCountEl.textContent = leakCount || 0;
  });

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled });
    updateStatusLabel(enabled);
  });

  document.getElementById("ps-reset").addEventListener("click", () => {
    chrome.storage.local.set({ leakCount: 0 });
    leakCountEl.textContent = "0";
  });
});
