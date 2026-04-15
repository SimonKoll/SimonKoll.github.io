let curPhase = 0;
let checked = {};
let openDays = {};

/* ---------- helpers ---------- */

function tagClass(tag) {
  return (
    {
      r: "run",
      c: "cal",
      k: "core",
      s: "rec",
      x: "race",
    }[tag] || "run"
  );
}

function tagLabel(tag) {
  return (
    {
      r: "Run",
      c: "Calisthenics",
      k: "Core",
      s: "Recovery",
      x: "Race",
    }[tag] || "Session"
  );
}

function daysTo(date) {
  return Math.max(0, Math.ceil((date - TODAY) / 86400000));
}

function getNextRace() {
  return RACES.map((r) => ({ ...r, days: daysTo(r.date) })).sort(
    (a, b) => a.days - b.days
  )[0];
}

function extractMinutes(text) {
  if (!text) return null;

  const range = text.match(/(\d+)\s*[–-]\s*(\d+)\s*min/i);
  if (range) {
    return Math.round((+range[1] + +range[2]) / 2);
  }

  const single = text.match(/(\d+)\s*min/i);
  return single ? +single[1] : null;
}

/* ---------- UI BUILD ---------- */

function buildHeader() {
  const race = getNextRace();

  document.getElementById("nextRaceDays").textContent = race.days;
  document.getElementById("nextRaceName").textContent = race.name;

  document.getElementById("phaseTitleMetric").textContent =
    PHASES[curPhase].label;
  document.getElementById("phasePace").textContent = PHASES[curPhase].pace;

  document.getElementById("totalCompleted").textContent =
    getCompletedSessions().length;
}

function buildPhaseBar() {
  const el = document.getElementById("phaseBar");

  el.innerHTML = PHASES.map(
    (p, i) =>
      `<button class="phaseBtn ${i === curPhase ? "active" : ""}"
      onclick="selectPhase(${i})">${p.label}</button>`
  ).join("");

  document.getElementById("phaseNote").textContent = PHASES[curPhase].note;
}

function buildDays() {
  const phase = PHASES[curPhase];

  document.getElementById("dayList").innerHTML = phase.days
    .map((day, di) => {
      const total = day.exs.length;
      const done = day.exs.filter(
        (_, ei) => checked[`${curPhase}_${di}_${ei}`]
      ).length;

      return `
      <div class="day">

        <div class="dayHead" onclick="toggleDay(${di})">
          <span class="badge ${tagClass(day.tag)}">${tagLabel(day.tag)}</span>
          <div class="dayName">${day.n}</div>
          <div class="dayMeta">${done}/${total}</div>
        </div>

        <div class="dayBody ${
          openDays[di] !== false ? "open" : ""
        }" id="body-${di}">

          ${day.exs
            .map((ex, ei) => {
              const isDone = !!checked[`${curPhase}_${di}_${ei}`];

              return `
            <div class="exRow">
              <div class="check ${isDone ? "on" : ""}"
                onclick="toggleExercise(event,${di},${ei})">
                ${isDone ? "✓" : ""}
              </div>

              <div class="exMain">
                <div class="exName ${isDone ? "done" : ""}">${ex.n}</div>
                <div class="exDetail">${ex.d}</div>
              </div>
            </div>`;
            })
            .join("")}

        </div>

      </div>`;
    })
    .join("");
}

/* ---------- INTERACTIONS ---------- */

function toggleDay(di) {
  openDays[di] = !openDays[di];
  buildDays();
}

function toggleExercise(event, di, ei) {
  event.stopPropagation();

  const key = `${curPhase}_${di}_${ei}`;
  const wasChecked = !!checked[key];
  checked[key] = !wasChecked;

  const phase = PHASES[curPhase];
  const day = phase.days[di];
  const ex = day.exs[ei];

  const session = {
    phaseId: phase.id,
    phaseLabel: phase.label,
    dayName: day.n,
    dayTag: day.tag,
    exerciseName: ex.n,
    exerciseDetail: ex.d,
    durationMinutes: extractMinutes(ex.d),
    completedAt: new Date().toISOString(),
  };

  if (!wasChecked) {
    addCompletedSession(session);
  } else {
    removeCompletedSession(session);
  }

  buildDays();
  updateProgress();
  buildHeader();
}

function selectPhase(i) {
  curPhase = i;
  buildHeader();
  buildPhaseBar();
  buildDays();
  updateProgress();
}

function resetPhase() {
  if (!confirm("Reset this phase?")) return;

  clearPhaseSessions(PHASES[curPhase].id);

  checked = {};
  buildDays();
  updateProgress();
  buildHeader();
}

/* ---------- PROGRESS ---------- */

function updateProgress() {
  const phase = PHASES[curPhase];

  let total = 0;
  let done = 0;

  phase.days.forEach((day, di) => {
    day.exs.forEach((_, ei) => {
      total++;
      if (checked[`${curPhase}_${di}_${ei}`]) done++;
    });
  });

  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById(
    "progressText"
  ).textContent = `${done} / ${total} completed`;

  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("ringText").textContent = pct + "%";

  document.getElementById(
    "ring"
  ).style.background = `conic-gradient(var(--accent) ${
    pct * 3.6
  }deg, rgba(255,255,255,0.08) 0deg)`;
}

/* ---------- LOAD STATE ---------- */

function loadCompletedIntoTracker() {
  const sessions = getCompletedSessions();

  sessions.forEach((session) => {
    const p = PHASES.findIndex((x) => x.id === session.phaseId);
    if (p === -1) return;

    const d = PHASES[p].days.findIndex((x) => x.n === session.dayName);
    if (d === -1) return;

    const e = PHASES[p].days[d].exs.findIndex(
      (x) => x.n === session.exerciseName
    );
    if (e === -1) return;

    checked[`${p}_${d}_${e}`] = true;
  });
}

/* ---------- INIT ---------- */

loadCompletedIntoTracker();
buildHeader();
buildPhaseBar();
buildDays();
updateProgress();
