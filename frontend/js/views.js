const VIEWS = ["dashboard", "result", "history"];
const listeners = [];

export function onViewChange(fn) {
  listeners.push(fn);
}

export function showView(name) {
  VIEWS.forEach((v) => {
    const el = document.getElementById(`page-${v}`);
    if (el) el.hidden = v !== name;
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  listeners.forEach((fn) => fn(name));
}
