import { applyI18n, getLang, setLang } from "./i18n.js";
import { applyTheme, getTheme, setTheme } from "./theme.js";
import { showView, onViewChange } from "./views.js";
import { loadAccounts, refreshSelectLabels, initAccounts } from "./accounts.js";
import { initDashboard, rerenderCurrentResult } from "./dashboard.js";
import { initHistory, onHistoryViewShown, rerenderCurrentHistory } from "./history.js";

function initThemeMenu() {
  const toggleBtn = document.getElementById("menuThemeToggle");

  toggleBtn.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

function initLanguageMenu() {
  const toggleBtn = document.getElementById("menuLanguageToggle");

  function applyLang(lang) {
    setLang(lang);
    applyI18n();
    refreshSelectLabels();
    rerenderCurrentResult();
    rerenderCurrentHistory();
  }

  toggleBtn.addEventListener("click", () => {
    applyLang(getLang() === "en" ? "id" : "en");
  });
}

function initNavigation() {
  document.getElementById("brandHome").addEventListener("click", () => {
    showView("dashboard");
  });

  document.getElementById("menuHistory").addEventListener("click", () => {
    const offcanvasEl = document.getElementById("mainMenu");
    bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).hide();
    showView("history");
  });

  onViewChange((view) => {
    if (view === "history") onHistoryViewShown();
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* offline shell simply won't be available — app still works online */
      });
    });
  }
}

async function init() {
  applyTheme(getTheme());
  applyI18n();

  initThemeMenu();
  initLanguageMenu();
  initNavigation();
  initAccounts();
  initDashboard();
  initHistory();

  try {
    await loadAccounts();
  } catch (e) {
    // Non-fatal: dashboard/history still work without saved accounts.
  }

  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
