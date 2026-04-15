let curPhase = 0;
let weeklyChecked = {};
let openDays = {};

const WEEKLY_STATE_KEY = "training_tracker_weekly_checked_v1";
const WEEKLY_STATE_WEEK_KEY = "training_tracker_weekly_checked_week_v1";

/* ---------- weekly state ---------- */

function getCurrentWeekId() {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return monday.toISOString().split("T")[0];
}

function loadWeeklyCheckedState() {
  const currentWeek = getCurrentWeekId();
  const savedWeek = localStorage.getItem(WEEKLY_STATE_WEEK_KEY);

  if (savedWeek !== currentWeek) {
    weeklyChecked = {};
    localStorage.setItem(WEEKLY_STATE_WEEK_KEY, currentWeek);
    localStorage.setItem(WEEKLY_STATE_KEY, JSON.stringify({}));
    return;
  }

  try {
    weeklyChecked = JSON.parse(localStorage.getItem(WEEKLY_STATE_KEY) || "{}");
  } catch (error) {
    weeklyChecked = {};
  }
}

function saveWeeklyCheckedState() {
  localStorage.setItem(WEEKLY_STATE_WEEK_KEY, getCurrentWeekId());
  localStorage.setItem(WEEKLY_STATE_KEY, JSON.stringify(weeklyChecked));
}

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

function countWeeklyCompleted() {
  return Object.values(weeklyChecked).filter(Boolean).length;
}

/* ---------- UI BUILD ---------- */

function buildHeader() {
  const race = getNextRace();

  document.getElementById("nextRaceDays").textContent = race.days;
  document.getElementById("nextRaceName").textContent = race.name;

  document.getElementById("phaseTitleMetric").textContent =
    PHASES[curPhase].label;
  document.getElementById("phasePace").textContent = PHASES[curPhase].pace;

  document.getElementById("weeklyCompleted").textContent =
    countWeeklyCompleted();
  document.getElementById(
    "weeklyLabel"
  ).textContent = `Week of ${getCurrentWeekId()}`;
}

function buildPhaseBar() {
  const el = document.getElementById("phaseBar");

  el.innerHTML = PHASES.map(
    (p, i) =>
      `<button class="phaseBtn ${
        i === curPhase ? "active" : ""
      }" onclick="selectPhase(${i})">${p.label}</button>`
  ).join("");

  document.getElementById("phaseNote").textContent = PHASES[curPhase].note;
}

function buildDays() {
  const phase = PHASES[curPhase];

  document.getElementById("dayList").innerHTML = phase.days
    .map((day, di) => {
      const total = day.exs.length;
      const done = day.exs.filter(
        (_, ei) => weeklyChecked[`${curPhase}_${di}_${ei}`]
      ).length;
      const isOpen = openDays[di] !== false;

      return `
      <div class="day">
        <div class="dayHead" onclick="toggleDay(${di})">
          <span class="badge ${tagClass(day.tag)}">${tagLabel(day.tag)}</span>
          <div class="dayName">${day.n}</div>
          <div class="dayMeta">${done}/${total}</div>
          <div class="arrow ${isOpen ? "open" : ""}">▶</div>
        </div>

        <div class="dayBody ${isOpen ? "open" : ""}" id="body-${di}">
          ${day.exs
            .map((ex, ei) => {
              const isDone = !!weeklyChecked[`${curPhase}_${di}_${ei}`];

              return `
              <div class="exRow">
                <div class="check ${
                  isDone ? "on" : ""
                }" onclick="toggleExercise(event,${di},${ei})">
                  ${isDone ? "✓" : ""}
                </div>

                <div class="exMain">
                  <div class="exName ${isDone ? "done" : ""}">${ex.n}</div>
                  <div class="exDetail">${ex.d}</div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
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
  const wasChecked = !!weeklyChecked[key];

  weeklyChecked[key] = !wasChecked;
  saveWeeklyCheckedState();

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
  if (!confirm("Reset this phase for the current week?")) return;

  Object.keys(weeklyChecked).forEach((key) => {
    if (key.startsWith(curPhase + "_")) {
      delete weeklyChecked[key];
    }
  });

  saveWeeklyCheckedState();
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
      if (weeklyChecked[`${curPhase}_${di}_${ei}`]) done++;
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

/* ---------- INIT ---------- */

loadWeeklyCheckedState();
buildHeader();
buildPhaseBar();
buildDays();
updateProgress();
