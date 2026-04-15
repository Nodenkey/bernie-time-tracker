(function () {
  "use strict";

  const API_BASE_URL = window.__API_BASE_URL__ || "http://localhost:8000";
  const API_PATH = "/api/time-entries";

  const form = document.getElementById("time-entry-form");
  const formModeLabel = document.getElementById("form-mode-label");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const formMessage = document.getElementById("form-message");

  const entryIdInput = document.getElementById("entry-id");
  const dateInput = document.getElementById("entry-date");
  const personInput = document.getElementById("person-name");
  const teamInput = document.getElementById("team-name");
  const durationInput = document.getElementById("duration-hours");
  const activityInput = document.getElementById("activity-description");
  const notesInput = document.getElementById("notes");

  const filtersForm = document.getElementById("filters-form");
  const filterDateFrom = document.getElementById("filter-date-from");
  const filterDateTo = document.getElementById("filter-date-to");
  const filterTeam = document.getElementById("filter-team");
  const filterPerson = document.getElementById("filter-person");
  const clearFiltersBtn = document.getElementById("clear-filters-btn");

  const entriesTbody = document.getElementById("entries-tbody");
  const entriesStatus = document.getElementById("entries-status");
  const refreshBtn = document.getElementById("refresh-btn");

  const toastEl = document.getElementById("toast");

  let isEditMode = false;

  function showToast(message, type = "info") {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = "toast visible";
    if (type === "error") toastEl.classList.add("error");
    if (type === "success") toastEl.classList.add("success");
    setTimeout(() => {
      toastEl.className = "toast";
      toastEl.textContent = "";
    }, 3000);
  }

  function setEntriesStatus(message, isError = false) {
    if (!entriesStatus) return;
    entriesStatus.textContent = message || "";
    entriesStatus.classList.toggle("error", Boolean(isError));
  }

  function clearFieldErrors() {
    const errorEls = document.querySelectorAll(".field-error");
    errorEls.forEach((el) => {
      el.textContent = "";
    });
  }

  function setFieldError(inputEl, message) {
    if (!inputEl) return;
    const errorEl = document.querySelector(
      `.field-error[data-error-for="${inputEl.id}"]`
    );
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function validateForm() {
    clearFieldErrors();
    formMessage.textContent = "";
    formMessage.className = "form-message";

    let isValid = true;

    if (!dateInput.value) {
      setFieldError(dateInput, "Date is required.");
      isValid = false;
    }

    if (!personInput.value.trim()) {
      setFieldError(personInput, "Person is required.");
      isValid = false;
    }

    if (!teamInput.value.trim()) {
      setFieldError(teamInput, "Team is required.");
      isValid = false;
    }

    if (!activityInput.value.trim()) {
      setFieldError(activityInput, "Activity description is required.");
      isValid = false;
    }

    const duration = parseFloat(durationInput.value);
    if (Number.isNaN(duration) || duration <= 0) {
      setFieldError(durationInput, "Duration must be greater than 0.");
      isValid = false;
    }

    if (!isValid) {
      formMessage.textContent = "Please fix the highlighted fields.";
      formMessage.classList.add("error");
    }

    return isValid;
  }

  function toApiPayload() {
    return {
      date: dateInput.value,
      personName: personInput.value.trim(),
      teamName: teamInput.value.trim(),
      activityDescription: activityInput.value.trim(),
      durationHours: parseFloat(durationInput.value),
      notes: notesInput.value.trim() || null,
    };
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return dateStr;
    }
  }

  async function apiRequest(path, options) {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // ignore JSON parse errors
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error || data.detail)) ||
        `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async function loadEntries() {
    setEntriesStatus("Loading entries...");
    entriesTbody.innerHTML = "";

    const params = new URLSearchParams();
    if (filterDateFrom.value) params.append("date_from", filterDateFrom.value);
    if (filterDateTo.value) params.append("date_to", filterDateTo.value);
    if (filterTeam.value.trim()) params.append("team", filterTeam.value.trim());
    if (filterPerson.value.trim())
      params.append("person", filterPerson.value.trim());

    const query = params.toString();
    const path = query ? `${API_PATH}?${query}` : API_PATH;

    try {
      const entries = await apiRequest(path, { method: "GET" });
      renderEntries(entries || []);
      if (!entries || entries.length === 0) {
        setEntriesStatus("No entries found for the selected filters.");
      } else {
        setEntriesStatus(`Showing ${entries.length} entr${
          entries.length === 1 ? "y" : "ies"
        }.`);
      }
    } catch (error) {
      console.error("Failed to load entries", error);
      setEntriesStatus(error.message || "Failed to load entries.", true);
      showToast(error.message || "Failed to load entries.", "error");
    }
  }

  function renderEntries(entries) {
    entriesTbody.innerHTML = "";

    if (!entries || entries.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.textContent = "No entries to display.";
      row.appendChild(cell);
      entriesTbody.appendChild(row);
      return;
    }

    entries.forEach((entry) => {
      const row = document.createElement("tr");
      row.dataset.entryId = entry.id;

      const dateCell = document.createElement("td");
      dateCell.textContent = formatDate(entry.date);
      row.appendChild(dateCell);

      const personCell = document.createElement("td");
      personCell.textContent = entry.personName;
      row.appendChild(personCell);

      const teamCell = document.createElement("td");
      teamCell.textContent = entry.teamName;
      row.appendChild(teamCell);

      const activityCell = document.createElement("td");
      activityCell.textContent = entry.activityDescription;
      row.appendChild(activityCell);

      const durationCell = document.createElement("td");
      durationCell.textContent = entry.durationHours;
      row.appendChild(durationCell);

      const notesCell = document.createElement("td");
      notesCell.textContent = entry.notes || "";
      row.appendChild(notesCell);

      const actionsCell = document.createElement("td");
      actionsCell.className = "actions-col";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn secondary";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => startEdit(entry));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => handleDelete(entry));

      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);

      entriesTbody.appendChild(row);
    });
  }

  function startEdit(entry) {
    isEditMode = true;
    entryIdInput.value = entry.id;
    dateInput.value = formatDate(entry.date);
    personInput.value = entry.personName;
    teamInput.value = entry.teamName;
    durationInput.value = entry.durationHours;
    activityInput.value = entry.activityDescription;
    notesInput.value = entry.notes || "";

    formModeLabel.textContent = "Edit";
    cancelEditBtn.hidden = false;
    submitBtn.textContent = "Update entry";
    formMessage.textContent = "Editing existing entry. Save or cancel to continue.";
    formMessage.className = "form-message";
  }

  function resetFormState() {
    isEditMode = false;
    entryIdInput.value = "";
    formModeLabel.textContent = "Create";
    cancelEditBtn.hidden = true;
    submitBtn.textContent = "Save entry";
    formMessage.textContent = "";
    formMessage.className = "form-message";
    clearFieldErrors();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = toApiPayload();
    submitBtn.disabled = true;
    submitBtn.textContent = isEditMode ? "Saving..." : "Saving...";

    try {
      if (isEditMode && entryIdInput.value) {
        const path = `${API_PATH}/${encodeURIComponent(entryIdInput.value)}`;
        await apiRequest(path, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast("Entry updated.", "success");
      } else {
        await apiRequest(API_PATH, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("Entry created.", "success");
      }

      form.reset();
      resetFormState();
      await loadEntries();
    } catch (error) {
      console.error("Failed to save entry", error);
      formMessage.textContent = error.message || "Failed to save entry.";
      formMessage.className = "form-message error";
      showToast(error.message || "Failed to save entry.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isEditMode ? "Update entry" : "Save entry";
    }
  }

  async function handleDelete(entry) {
    const confirmed = window.confirm(
      `Delete entry for ${entry.personName} on ${formatDate(
        entry.date
      )}?`
    );
    if (!confirmed) return;

    try {
      const path = `${API_PATH}/${encodeURIComponent(entry.id)}`;
      await apiRequest(path, { method: "DELETE" });
      showToast("Entry deleted.", "success");
      await loadEntries();
    } catch (error) {
      console.error("Failed to delete entry", error);
      showToast(error.message || "Failed to delete entry.", "error");
    }
  }

  function handleFiltersSubmit(event) {
    event.preventDefault();
    loadEntries();
  }

  function handleClearFilters() {
    filtersForm.reset();
    loadEntries();
  }

  function init() {
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().slice(0, 10);
      dateInput.value = today;
    }

    form.addEventListener("submit", handleSubmit);
    resetBtn.addEventListener("click", () => {
      setTimeout(() => {
        resetFormState();
      }, 0);
    });
    cancelEditBtn.addEventListener("click", () => {
      form.reset();
      resetFormState();
    });

    filtersForm.addEventListener("submit", handleFiltersSubmit);
    clearFiltersBtn.addEventListener("click", handleClearFilters);
    refreshBtn.addEventListener("click", loadEntries);

    loadEntries();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
