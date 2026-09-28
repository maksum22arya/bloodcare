import { api, ApiError } from "./api.js";
import { t } from "./i18n.js";

let cachedAccounts = [];
const selects = new Set();

const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
const ICON_TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;

export function getCachedAccounts() {
  return cachedAccounts;
}

function apiErrorMessage(err) {
  if (err instanceof ApiError) {
    if (err.status === 0) return t("error.network");
    const code = err.payload && err.payload.error;
    if (code === "duplicate_name") return t("account.duplicate_error");
    if (code === "invalid_input" || code === "invalid_birth_date") return t("account.invalid_error");
    if (code === "invalid_delete_password") return t("account.invalid_delete_password");
  }
  return t("error.generic");
}

export function registerSelect(selectEl) {
  selects.add(selectEl);
  renderSelect(selectEl);
}

function renderSelect(selectEl) {
  const placeholderKey = selectEl.id === "historyAccountSelect"
    ? "history.select_account_placeholder"
    : "dashboard.account_placeholder";
  const prevValue = selectEl.value;
  selectEl.innerHTML = "";
  const placeholderOpt = document.createElement("option");
  placeholderOpt.value = "";
  placeholderOpt.textContent = t(placeholderKey);
  selectEl.appendChild(placeholderOpt);

  cachedAccounts.forEach((acc) => {
    const opt = document.createElement("option");
    opt.value = String(acc.id);
    opt.textContent = acc.name;
    selectEl.appendChild(opt);
  });

  if (prevValue && cachedAccounts.some((a) => String(a.id) === prevValue)) {
    selectEl.value = prevValue;
  } else {
    selectEl.value = "";
  }
}

export function refreshSelectLabels() {
  selects.forEach(renderSelect);
}

export function resetAccountSelection(selectEl) {
  selectEl.value = "";
}

export async function loadAccounts() {
  cachedAccounts = await api.getAccounts();
  selects.forEach(renderSelect);
  document.dispatchEvent(new CustomEvent("accounts:changed", { detail: cachedAccounts }));
  return cachedAccounts;
}

export function showToast(message, variant = "success") {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast align-items-center text-white border-0 bg-${variant === "error" ? "danger" : "success"}`;
  el.setAttribute("role", "alert");
  el.innerHTML = `<div class="d-flex"><div class="toast-body"></div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  el.querySelector(".toast-body").textContent = message;
  container.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 3200 });
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

/* ---------------------------------------------------------------------- */
/* Create account modal                                                   */
/* ---------------------------------------------------------------------- */

function initCreateModal() {
  const modalEl = document.getElementById("createAccountModal");
  const modal = new bootstrap.Modal(modalEl);
  const form = document.getElementById("createAccountForm");
  const nameInput = document.getElementById("createAccountName");
  const dobInput = document.getElementById("createAccountBirthDate");
  const errorBox = document.getElementById("createAccountError");

  document.getElementById("menuCreateAccount").addEventListener("click", () => {
    form.reset();
    errorBox.classList.add("d-none");
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("mainMenu")).hide();
    modal.show();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("d-none");
    const name = nameInput.value.trim();
    const dob = dobInput.value;
    if (!name || !dob) {
      errorBox.textContent = t("error.required_bp");
      errorBox.classList.remove("d-none");
      return;
    }
    try {
      await api.createAccount(name, dob);
      await loadAccounts();
      modal.hide();
      showToast(t("account.create_title") + " ✓");
    } catch (err) {
      errorBox.textContent = apiErrorMessage(err);
      errorBox.classList.remove("d-none");
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Manage / edit accounts modal                                           */
/* ---------------------------------------------------------------------- */

function buildAccountRow(account) {
  const row = document.createElement("div");
  row.className = "account-row";
  row.dataset.id = account.id;

  const view = document.createElement("div");
  view.className = "acc-view d-flex align-items-center justify-content-between w-100 gap-2";

  const info = document.createElement("div");
  info.className = "acc-info";
  const nameEl = document.createElement("div");
  nameEl.className = "acc-name";
  nameEl.textContent = account.name;
  const metaEl = document.createElement("div");
  metaEl.className = "acc-meta";
  metaEl.textContent = `${account.birth_date} · ${account.age} ${t("account.years_suffix")}`;
  info.appendChild(nameEl);
  info.appendChild(metaEl);

  const actions = document.createElement("div");
  actions.className = "d-flex gap-2";
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "icon-btn";
  editBtn.innerHTML = ICON_EDIT;
  editBtn.setAttribute("aria-label", t("account.edit_btn"));
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "icon-btn danger";
  deleteBtn.innerHTML = ICON_TRASH;
  deleteBtn.setAttribute("aria-label", t("account.delete_btn"));
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  view.appendChild(info);
  view.appendChild(actions);
  row.appendChild(view);

  const errorBox = document.getElementById("manageAccountsError");

  editBtn.addEventListener("click", () => {
    row.innerHTML = "";
    const editForm = document.createElement("div");
    editForm.className = "d-flex flex-column gap-2 w-100";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "form-control";
    nameInput.value = account.name;
    nameInput.maxLength = 120;

    const dobInput = document.createElement("input");
    dobInput.type = "date";
    dobInput.className = "form-control";
    dobInput.value = account.birth_date;

    const btnRow = document.createElement("div");
    btnRow.className = "d-flex gap-2 justify-content-end";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "icon-btn";
    saveBtn.innerHTML = ICON_CHECK;
    saveBtn.setAttribute("aria-label", t("account.save_btn"));
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "icon-btn";
    cancelBtn.innerHTML = ICON_X;
    cancelBtn.setAttribute("aria-label", t("account.cancel_btn"));
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);

    editForm.appendChild(nameInput);
    editForm.appendChild(dobInput);
    editForm.appendChild(btnRow);
    row.appendChild(editForm);

    cancelBtn.addEventListener("click", () => renderManageList());

    saveBtn.addEventListener("click", async () => {
      errorBox.classList.add("d-none");
      const newName = nameInput.value.trim();
      const newDob = dobInput.value;
      if (!newName || !newDob) {
        errorBox.textContent = t("error.required_bp");
        errorBox.classList.remove("d-none");
        return;
      }
      try {
        await api.updateAccount(account.id, newName, newDob);
        await loadAccounts();
        renderManageList();
        showToast(t("account.save_btn") + " ✓");
      } catch (err) {
        errorBox.textContent = apiErrorMessage(err);
        errorBox.classList.remove("d-none");
      }
    });
  });

  deleteBtn.addEventListener("click", async () => {
    openDeleteModal(account);
  });

  return row;
}

let accountToDelete = null;

function openDeleteModal(account) {
  accountToDelete = account;
  const form = document.getElementById("deleteAccountForm");
  const passwordInput = document.getElementById("deleteAccountPassword");
  const errorBox = document.getElementById("deleteAccountError");
  form.reset();
  errorBox.classList.add("d-none");
  passwordInput.focus();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteAccountModal")).show();
}

function initDeleteModal() {
  const modalEl = document.getElementById("deleteAccountModal");
  const modal = new bootstrap.Modal(modalEl);
  const form = document.getElementById("deleteAccountForm");
  const passwordInput = document.getElementById("deleteAccountPassword");
  const errorBox = document.getElementById("deleteAccountError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("d-none");
    if (!passwordInput.value) {
      errorBox.textContent = t("account.invalid_delete_password");
      errorBox.classList.remove("d-none");
      passwordInput.focus();
      return;
    }
    try {
      await api.deleteAccount(accountToDelete.id, passwordInput.value);
      await loadAccounts();
      modal.hide();
      renderManageList();
      showToast(t("account.delete_btn") + " ✓");
    } catch (err) {
      errorBox.textContent = apiErrorMessage(err);
      errorBox.classList.remove("d-none");
      passwordInput.select();
    }
  });
}

function renderManageList() {
  const list = document.getElementById("manageAccountsList");
  const empty = document.getElementById("manageAccountsEmpty");
  list.innerHTML = "";
  if (cachedAccounts.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  cachedAccounts.forEach((acc) => list.appendChild(buildAccountRow(acc)));
}

function initManageModal() {
  const modalEl = document.getElementById("manageAccountsModal");
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("menuEditAccount").addEventListener("click", () => {
    document.getElementById("manageAccountsError").classList.add("d-none");
    renderManageList();
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("mainMenu")).hide();
    modal.show();
  });
}

export function initAccounts() {
  initCreateModal();
  initDeleteModal();
  initManageModal();
}
