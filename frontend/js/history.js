import { api } from "./api.js";
import { t } from "./i18n.js";
import { drawLineChart, formatShortDate } from "./charts.js";
import { registerSelect, getCachedAccounts, showToast } from "./accounts.js";

const SYSTOLIC_COLOR = "#EF4444";
const DIASTOLIC_COLOR = "#F97316";

let lastHistory = null;
let currentAccountId = "";

function renderTrendBanner(trend) {
  const iconEl = document.getElementById("trendIcon");
  const labelEl = document.getElementById("trendLabel");
  iconEl.textContent = trend.icon;
  labelEl.textContent = trend.insufficient_data
    ? t("history.trend_insufficient")
    : t(`trend.${trend.direction}`);
}

function renderCharts(readings) {
  // readings arrive newest-first; charts read chronologically (oldest -> newest).
  const chronological = [...readings].reverse();
  const labels = chronological.map((r) => formatShortDate(r.created_at));
  const systolicData = chronological.map((r) => r.systolic);
  const diastolicData = chronological.map((r) => r.diastolic);

  drawLineChart(document.getElementById("chartTrend"), {
    labels,
    series: [
      { data: systolicData, color: SYSTOLIC_COLOR },
      { data: diastolicData, color: DIASTOLIC_COLOR },
    ],
  });
  drawLineChart(document.getElementById("chartSystolic"), {
    labels,
    series: [{ data: systolicData, color: SYSTOLIC_COLOR }],
  });
  drawLineChart(document.getElementById("chartDiastolic"), {
    labels,
    series: [{ data: diastolicData, color: DIASTOLIC_COLOR }],
  });
}

function buildHistoryCard(reading, accountName) {
  const card = document.createElement("div");
  card.className = "card-surface mb-2 history-card";

  const left = document.createElement("div");
  left.className = "hc-left";
  const nameEl = document.createElement("div");
  nameEl.className = "hc-name";
  nameEl.textContent = accountName;
  const dateEl = document.createElement("div");
  dateEl.className = "hc-date";
  const d = new Date(reading.created_at);
  dateEl.textContent = Number.isNaN(d.getTime())
    ? reading.created_at
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const catEl = document.createElement("div");
  catEl.className = "hc-category";
  catEl.style.color = reading.color;
  catEl.style.fontWeight = "700";
  catEl.style.fontSize = "0.85rem";
  catEl.textContent = `${reading.emoji} ${t(`category.${reading.category}`)}`;
  left.appendChild(nameEl);
  left.appendChild(dateEl);
  left.appendChild(catEl);

  const right = document.createElement("div");
  const readingEl = document.createElement("div");
  readingEl.className = "hc-reading";
  readingEl.textContent = `${reading.systolic}/${reading.diastolic}`;
  const pulseEl = document.createElement("div");
  pulseEl.className = "hc-pulse";
  pulseEl.textContent = reading.pulse
    ? `${reading.pulse} ${t("result.pulse_bpm")}`
    : t("history.no_pulse_short");
  right.appendChild(readingEl);
  right.appendChild(pulseEl);

  card.appendChild(left);
  card.appendChild(right);
  return card;
}

function renderCards(readings, accountName) {
  const list = document.getElementById("historyCardsList");
  const empty = document.getElementById("historyCardsEmpty");
  list.innerHTML = "";
  if (!readings || readings.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  readings.forEach((r) => list.appendChild(buildHistoryCard(r, accountName)));
}

function render(data) {
  lastHistory = data;
  renderTrendBanner(data.trend);
  renderCharts(data.readings);
  renderCards(data.readings, data.account.name);
}

export function rerenderCurrentHistory() {
  if (lastHistory) render(lastHistory);
}

async function loadForAccount(accountId) {
  const noAccountEl = document.getElementById("historyNoAccount");
  const contentEl = document.getElementById("historyContent");

  if (!accountId) {
    currentAccountId = "";
    lastHistory = null;
    noAccountEl.hidden = false;
    contentEl.hidden = true;
    return;
  }

  currentAccountId = accountId;
  try {
    const data = await api.getHistory(accountId);
    noAccountEl.hidden = true;
    contentEl.hidden = false;
    render(data);
  } catch (err) {
    showToast(t("error.generic"), "error");
    currentAccountId = "";
    noAccountEl.hidden = false;
    contentEl.hidden = true;
  }
}

export function initHistory() {
  const select = document.getElementById("historyAccountSelect");
  registerSelect(select);

  select.addEventListener("change", () => {
    loadForAccount(select.value);
  });

  document.addEventListener("accounts:changed", () => {
    const stillExists = getCachedAccounts().some((a) => String(a.id) === currentAccountId);
    if (currentAccountId && !stillExists) {
      select.value = "";
      loadForAccount("");
    }
  });
}

export function onHistoryViewShown() {
  const select = document.getElementById("historyAccountSelect");
  if (select.value) {
    loadForAccount(select.value);
  } else {
    document.getElementById("historyNoAccount").hidden = false;
    document.getElementById("historyContent").hidden = true;
  }
}
