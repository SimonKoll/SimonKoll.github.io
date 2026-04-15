const STORAGE_KEY = "training_tracker_completed_sessions_v1";

function getCompletedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read completed sessions:", error);
    return [];
  }
}

function saveCompletedSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save completed sessions:", error);
  }
}

function makeSessionId(session) {
  return [
    session.phaseId || "",
    session.dayName || "",
    session.exerciseName || "",
    session.exerciseDetail || "",
  ].join("::");
}

function hasCompletedSession(session) {
  const sessions = getCompletedSessions();
  const id = makeSessionId(session);
  return sessions.some((s) => s.id === id);
}

function addCompletedSession(session) {
  const sessions = getCompletedSessions();
  const id = makeSessionId(session);

  if (sessions.some((s) => s.id === id)) {
    return false;
  }

  sessions.push({
    id,
    phaseId: session.phaseId || "",
    phaseLabel: session.phaseLabel || "",
    dayName: session.dayName || "",
    dayTag: session.dayTag || "",
    exerciseName: session.exerciseName || "",
    exerciseDetail: session.exerciseDetail || "",
    durationMinutes: session.durationMinutes || null,
    notes: session.notes || "",
    completedAt: session.completedAt || new Date().toISOString(),
  });

  saveCompletedSessions(sessions);
  return true;
}

function removeCompletedSession(session) {
  const sessions = getCompletedSessions();
  const id = typeof session === "string" ? session : makeSessionId(session);
  const filtered = sessions.filter((s) => s.id !== id);
  saveCompletedSessions(filtered);
}

function clearCompletedSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

function clearPhaseSessions(phaseId) {
  const sessions = getCompletedSessions();
  const filtered = sessions.filter((s) => s.phaseId !== phaseId);
  saveCompletedSessions(filtered);
}

function getTotalCompletedMinutes() {
  return getCompletedSessions().reduce((sum, session) => {
    return sum + (Number(session.durationMinutes) || 0);
  }, 0);
}
