import { api, ApiError } from "./api.js";
import { t } from "./i18n.js";
import { showView } from "./views.js";
import { registerSelect, resetAccountSelection } from "./accounts.js";

const PULSE_COLOR_VAR = {
  low: "var(--cat-elevated)",
  normal: "var(--cat-normal)",
  high: "var(--cat-stage1)",
};

let lastResult = null;

function renderResult(data) {
  lastResult = data;

  const card = document.getElementById("resultCard");
  document.getElementById("resultEmoji").textContent = data.emoji;

  const categoryEl = document.getElementById("resultCategory");
  categoryEl.textContent = t(`category.${data.category}`);
  categoryEl.style.color = data.color;

  document.getElementById("resultReading").textContent =
    `${data.systolic}/${data.diastolic} ${t("result.unit")}`;

  card.classList.toggle("crisis-pulse", data.category === "crisis");

  const savedNote = document.getElementById("resultSavedNote");
  if (data.saved && data.account) {
    savedNote.textContent = t("result.saved_yes", { name: data.account.name });
    savedNote.className = "saved-note is-saved";
  } else {
    savedNote.textContent = t("result.saved_no");
    savedNote.className = "saved-note is-unsaved";
  }

  const pulseSection = document.getElementById("resultPulseSection");
  if (data.pulse === null || data.pulse === undefined) {
    pulseSection.hidden = true;
  } else {
    pulseSection.hidden = false;
    document.getElementById("resultPulseValue").textContent = `${data.pulse} ${t("result.pulse_bpm")}`;
    const statusEl = document.getElementById("resultPulseStatus");
    if (data.pulse_status) {
      statusEl.textContent = t(`pulse.${data.pulse_status}`);
      statusEl.style.color = PULSE_COLOR_VAR[data.pulse_status] || "";
    } else {
      statusEl.textContent = "—";
      statusEl.style.color = "";
    }
  }

  const recList = document.getElementById("resultRecommendations");
  recList.innerHTML = "";
  (data.recommendations || []).forEach((id) => {
    const li = document.createElement("li");
    li.textContent = t(id);
    recList.appendChild(li);
  });

  const warnSection = document.getElementById("resultWarningsSection");
  const warnList = document.getElementById("resultWarnings");
  warnList.innerHTML = "";
  if (data.warnings && data.warnings.length > 0) {
    warnSection.hidden = false;
    data.warnings.forEach((id) => {
      const li = document.createElement("li");
      li.textContent = t(id);
      warnList.appendChild(li);
    });
  } else {
    warnSection.hidden = true;
  }

  showView("result");
}

export function rerenderCurrentResult() {
  if (lastResult) renderResult(lastResult);
}

export function initDashboard() {
  const form = document.getElementById("dashboardForm");
  const errorBox = document.getElementById("dashboardError");
  const accountSelect = document.getElementById("inputAccount");
  const systolicInput = document.getElementById("inputSystolic");
  const diastolicInput = document.getElementById("inputDiastolic");
  const pulseInput = document.getElementById("inputPulse");
  const submitBtn = document.getElementById("btnCheckNow");

  registerSelect(accountSelect);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("d-none");

    const systolicVal = systolicInput.value;
    const diastolicVal = diastolicInput.value;
    const pulseVal = pulseInput.value;
    const accountId = accountSelect.value;

    if (systolicVal === "" || diastolicVal === "") {
      errorBox.textContent = t("error.required_bp");
      errorBox.classList.remove("d-none");
      return;
    }

    submitBtn.disabled = true;
    try {
      const result = await api.checkReading(
        parseInt(systolicVal, 10),
        parseInt(diastolicVal, 10),
        pulseVal === "" ? null : parseInt(pulseVal, 10),
        accountId || null
      );
      systolicInput.value = "";
      diastolicInput.value = "";
      pulseInput.value = "";
      resetAccountSelection(accountSelect);
      renderResult(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        errorBox.textContent = t("error.network");
      } else {
        errorBox.textContent = t("error.generic");
      }
      errorBox.classList.remove("d-none");
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById("btnResultBack").addEventListener("click", () => {
    showView("dashboard");
  });
}
