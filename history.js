function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTotalPlanExercises() {
  return PHASES.reduce((phaseSum, phase) => {
    return (
      phaseSum +
      phase.days.reduce((daySum, day) => {
        return daySum + day.exs.length;
      }, 0)
    );
  }, 0);
}

function getUniqueCompletedCount(sessions) {
  const uniqueIds = new Set(
    sessions.map((session) =>
      [
        session.phaseId || "",
        session.dayName || "",
        session.exerciseName || "",
        session.exerciseDetail || "",
      ].join("::")
    )
  );
  return uniqueIds.size;
}

function updateHistoryProgress(sessions) {
  const totalPlanExercises = getTotalPlanExercises();
  const completedUnique = getUniqueCompletedCount(sessions);
  const pct = totalPlanExercises
    ? Math.min(100, Math.round((completedUnique / totalPlanExercises) * 100))
    : 0;

  document.getElementById(
    "historyProgressText"
  ).textContent = `${completedUnique} / ${totalPlanExercises} completed`;

  document.getElementById("historyProgressFill").style.width = pct + "%";
  document.getElementById("historyRingText").textContent = pct + "%";
  document.getElementById(
    "historyRing"
  ).style.background = `conic-gradient(var(--accent) ${
    pct * 3.6
  }deg, rgba(255,255,255,0.08) 0deg)`;
}

function deleteHistoryItem(id) {
  if (!confirm("Delete this completed session?")) return;
  removeCompletedSession(id);
  renderHistory();
}

function clearAllHistory() {
  if (!confirm("Clear all stored completed sessions?")) return;
  clearCompletedSessions();
  renderHistory();
}

function reloadHistory() {
  renderHistory();
}

function renderHistory() {
  const sessions = getCompletedSessions()
    .slice()
    .sort((a, b) => {
      return new Date(b.completedAt) - new Date(a.completedAt);
    });

  document.getElementById("historyTotalCount").textContent = sessions.length;
  document.getElementById("historyTotalMinutes").textContent =
    getTotalCompletedMinutes();
  document.getElementById("historyLastCompletion").textContent = sessions.length
    ? formatDate(sessions[0].completedAt)
    : "—";

  updateHistoryProgress(sessions);

  const list = document.getElementById("historyList");

  if (!sessions.length) {
    list.innerHTML = `<div class="empty">No completed sessions stored yet.</div>`;
    return;
  }

  list.innerHTML = sessions
    .map((session) => {
      return `
        <div class="item">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
            <div>
              <div style="font-size:18px;font-weight:800;">${escapeHtml(
                session.exerciseName || "Session"
              )}</div>
              <div class="meta">
                ${escapeHtml(session.phaseLabel || session.phaseId || "")}
                · ${escapeHtml(session.dayName || "")}
                · ${formatDate(session.completedAt)}
              </div>
            </div>
            <button class="btn danger" onclick="deleteHistoryItem('${escapeHtml(
              session.id
            )}')">Delete</button>
          </div>
  
          ${
            session.exerciseDetail
              ? `<div class="detail">${escapeHtml(
                  session.exerciseDetail
                )}</div>`
              : ""
          }
          ${
            session.durationMinutes
              ? `<div class="detail">Estimated duration: ${escapeHtml(
                  session.durationMinutes
                )} min</div>`
              : ""
          }
        </div>
      `;
    })
    .join("");
}

renderHistory();
