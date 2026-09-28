const STORAGE_KEY = "bloodcare_theme";

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || "dark";
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme = getTheme()) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "light" ? "#FDF6EC" : "#121212");
  }
}
