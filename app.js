let curPhase = 0;
let weeklyChecked = {};
let openDays = {};

const WEEKLY_STATE_KEY = "training_tracker_weekly_checked_v1";
const WEEKLY_STATE_WEEK_KEY = "training_tracker_weekly_checked_week_v1";

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
  const racesWithDays = RACES.map((r) => ({ ...r, days: daysTo(r.date) })).sort(
    (a, b) => a.days - b.days
  );

  return racesWithDays[0];
}

function extractMinutes(text) {
  if (!text) return null;

  const range = String(text).match(/(\d+)\s*[–-]\s*(\d+)\s*min/i);
  if (range) {
    return Math.round((Number(range[1]) + Number(range[2])) / 2);
  }

  const single = String(text).match(/(\d+)\s*min/i);
  return single ? Number(single[1]) : null;
}

function countWeeklyCompleted() {
  return Object.values(weeklyChecked).filter(Boolean).length;
}

function buildHeader() {
  const race = getNextRace();
  if (!race) return;

  const nextRaceDaysEl = document.getElementById("nextRaceDays");
  const nextRaceNameEl = document.getElementById("nextRaceName");
  const phaseTitleMetricEl = document.getElementById("phaseTitleMetric");
  const phasePaceEl = document.getElementById("phasePace");
  const weeklyCompletedEl = document.getElementById("weeklyCompleted");
  const weeklyLabelEl = document.getElementById("weeklyLabel");

  if (nextRaceDaysEl) nextRaceDaysEl.textContent = race.days;
  if (nextRaceNameEl) nextRaceNameEl.textContent = race.name;

  const phase = PHASES[curPhase];
  if (phaseTitleMetricEl) phaseTitleMetricEl.textContent = phase.label;
  if (phasePaceEl) phasePaceEl.textContent = phase.pace;

  if (weeklyCompletedEl) weeklyCompletedEl.textContent = countWeeklyCompleted();
  if (weeklyLabelEl)
    weeklyLabelEl.textContent = `Week of ${getCurrentWeekId()}`;
}

function buildPhaseBar() {
  const el = document.getElementById("phaseBar");
  const note = document.getElementById("phaseNote");
  if (!el || !note) return;

  el.innerHTML = PHASES.map((phase, index) => {
    const activeClass = index === curPhase ? "active" : "";
    return `<button class="phaseBtn ${activeClass}" data-phase-index="${index}">${phase.label}</button>`;
  }).join("");

  note.textContent = PHASES[curPhase].note;

  el.querySelectorAll(".phaseBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.phaseIndex);
      selectPhase(index);
    });
  });
}

function buildDays() {
  const phase = PHASES[curPhase];
  const dayList = document.getElementById("dayList");
  if (!phase || !dayList) return;

  dayList.innerHTML = phase.days
    .map((day, di) => {
      const total = day.exs.length;
      const done = day.exs.filter(
        (_, ei) => weeklyChecked[`${curPhase}_${di}_${ei}`]
      ).length;
      const isOpen = openDays[di] !== false;

      const exercisesHtml = day.exs
        .map((ex, ei) => {
          const key = `${curPhase}_${di}_${ei}`;
          const isDone = !!weeklyChecked[key];

          return `
        <div class="exRow">
          <div class="check ${
            isDone ? "on" : ""
          }" data-di="${di}" data-ei="${ei}">
            ${isDone ? "✓" : ""}
          </div>
          <div class="exMain">
            <div class="exName ${isDone ? "done" : ""}">${ex.n}</div>
            <div class="exDetail">${ex.d}</div>
          </div>
        </div>
      `;
        })
        .join("");

      return `
      <div class="day">
        <div class="dayHead" data-day-index="${di}">
          <span class="badge ${tagClass(day.tag)}">${tagLabel(day.tag)}</span>
          <div class="dayName">${day.n}</div>
          <div class="dayMeta">${done}/${total}</div>
          <div class="arrow ${isOpen ? "open" : ""}">▶</div>
        </div>
        <div class="dayBody ${isOpen ? "open" : ""}" id="body-${di}">
          ${exercisesHtml}
        </div>
      </div>
    `;
    })
    .join("");

  dayList.querySelectorAll(".dayHead").forEach((head) => {
    head.addEventListener("click", () => {
      const di = Number(head.dataset.dayIndex);
      toggleDay(di);
    });
  });

  dayList.querySelectorAll(".check").forEach((check) => {
    check.addEventListener("click", (event) => {
      event.stopPropagation();
      const di = Number(check.dataset.di);
      const ei = Number(check.dataset.ei);
      toggleExercise(di, ei);
    });
  });
}

function toggleDay(di) {
  openDays[di] = !(openDays[di] !== false);
  buildDays();
}

function toggleExercise(di, ei) {
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

function selectPhase(index) {
  curPhase = index;
  buildHeader();
  buildPhaseBar();
  buildDays();
  updateProgress();
}

function resetPhase() {
  if (!confirm("Reset this phase for the current week?")) return;

  Object.keys(weeklyChecked).forEach((key) => {
    if (key.startsWith(`${curPhase}_`)) {
      delete weeklyChecked[key];
    }
  });

  saveWeeklyCheckedState();
  buildDays();
  updateProgress();
  buildHeader();
}

function updateProgress() {
  const phase = PHASES[curPhase];
  if (!phase) return;

  let total = 0;
  let done = 0;

  phase.days.forEach((day, di) => {
    day.exs.forEach((_, ei) => {
      total += 1;
      if (weeklyChecked[`${curPhase}_${di}_${ei}`]) {
        done += 1;
      }
    });
  });

  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById(
    "progressText"
  ).textContent = `${done} / ${total} completed`;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("ringText").textContent = `${pct}%`;
  document.getElementById(
    "ring"
  ).style.background = `conic-gradient(var(--accent) ${
    pct * 3.6
  }deg, rgba(255,255,255,0.08) 0deg)`;
}

function init() {
  loadWeeklyCheckedState();
  buildHeader();
  buildPhaseBar();
  buildDays();
  updateProgress();

  const resetBtn = document.getElementById("resetPhaseBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetPhase);
  }
}

init();
