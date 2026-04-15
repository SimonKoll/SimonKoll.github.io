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
