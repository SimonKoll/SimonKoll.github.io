const TODAY = new Date();

const RACES = [
  { name: "Half Marathon", date: new Date(2026, 3, 29) },
  { name: "Linzathlon", date: new Date(2026, 4, 30) },
  { name: "Cross Triathlon", date: new Date(2026, 5, 4) },
];

const PHASES = [
  {
    id: "p1",
    label: "Taper",
    pace: "Fresh legs, low total load, short quality only.",
    note: "Reduced running volume. No heavy leg fatigue. Calisthenics stays short and low-stress.",
    days: [
      {
        n: "Day 1 – Intervals",
        tag: "r",
        exs: [
          { n: "Warm-up jog", d: "10 min easy" },
          { n: "Intervals", d: "3 × 1 km @ controlled threshold effort" },
          { n: "Cool-down", d: "10 min easy" },
        ],
      },
      {
        n: "Day 2 – Upper Body Calisthenics",
        tag: "c",
        exs: [
          { n: "Warm-up", d: "5–8 min" },
          { n: "Push-ups", d: "3 × 10" },
          { n: "Inverted Rows", d: "3 × 6–10" },
          { n: "Pike Push-ups", d: "2 × 8" },
          { n: "Plank", d: "3 × 30 sec" },
          { n: "Mobility", d: "5–10 min" },
        ],
      },
      {
        n: "Day 3 – Easy Run",
        tag: "r",
        exs: [{ n: "Easy Run", d: "20–25 min easy" }],
      },
      {
        n: "Day 4 – Tempo Run",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Tempo Run", d: "20 min moderate-hard" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 5 – Core + Mobility",
        tag: "k",
        exs: [
          { n: "Dead Bug", d: "3 × 10/side" },
          { n: "Bird Dog", d: "3 × 10/side" },
          { n: "Hip Mobility", d: "10 min" },
        ],
      },
      {
        n: "Day 6 – Long Run",
        tag: "r",
        exs: [{ n: "Long Run", d: "40–50 min easy aerobic" }],
      },
      {
        n: "Day 7 – Rest",
        tag: "s",
        exs: [{ n: "Full Rest", d: "No training" }],
      },
    ],
  },
  {
    id: "p2",
    label: "Build",
    pace: "Polarized week: hard, easy, hard, easy, long.",
    note: "At least one low day between key run sessions. Bodyweight only. Lower-body fatigue is controlled.",
    days: [
      {
        n: "Day 1 – Intervals",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Intervals", d: "5 × 3 min hard / 90 sec easy" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 2 – Upper Body Calisthenics",
        tag: "c",
        exs: [
          { n: "Warm-up", d: "8 min" },
          { n: "Push-ups", d: "4 × 10–15" },
          { n: "Pull-ups or Inverted Rows", d: "4 × 6–10" },
          { n: "Pike Push-ups", d: "3 × 8–12" },
          { n: "Hollow Hold", d: "3 × 30–40 sec" },
          { n: "Mobility", d: "10 min" },
        ],
      },
      {
        n: "Day 3 – Easy Run",
        tag: "r",
        exs: [{ n: "Easy Run", d: "35–40 min easy" }],
      },
      {
        n: "Day 4 – Tempo Run",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Tempo Run", d: "25 min moderate-hard" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 5 – Core + Mobility",
        tag: "k",
        exs: [
          { n: "Dead Bug", d: "3 × 12/side" },
          { n: "Side Plank", d: "3 × 30 sec/side" },
          { n: "Bird Dog", d: "3 × 10/side" },
          { n: "Mobility Flow", d: "15 min" },
        ],
      },
      {
        n: "Day 6 – Long Run",
        tag: "r",
        exs: [{ n: "Long Run", d: "60–75 min easy aerobic" }],
      },
      {
        n: "Day 7 – Rest",
        tag: "s",
        exs: [{ n: "Full Rest", d: "No training" }],
      },
    ],
  },
  {
    id: "p3",
    label: "Competition",
    pace: "Maintain sharpness, avoid extra fatigue.",
    note: "Short race window. Only light sessions between events.",
    days: [
      {
        n: "Day 1 – Race",
        tag: "x",
        exs: [{ n: "Race Day", d: "Competition" }],
      },
      {
        n: "Day 2 – Recovery",
        tag: "s",
        exs: [
          { n: "Walk", d: "20 min easy" },
          { n: "Mobility", d: "10 min" },
        ],
      },
      {
        n: "Day 3 – Easy Run",
        tag: "r",
        exs: [{ n: "Easy Jog", d: "15–20 min very easy" }],
      },
      {
        n: "Day 4 – Core + Mobility",
        tag: "k",
        exs: [
          { n: "Plank", d: "2 × 20 sec" },
          { n: "Stretching", d: "15–20 min" },
        ],
      },
      {
        n: "Day 5 – Race",
        tag: "x",
        exs: [{ n: "Race Day", d: "Competition" }],
      },
      {
        n: "Day 6 – Full Rest",
        tag: "s",
        exs: [{ n: "Rest", d: "No training" }],
      },
      {
        n: "Day 7 – Full Rest",
        tag: "s",
        exs: [{ n: "Rest", d: "No training" }],
      },
    ],
  },
  {
    id: "p4",
    label: "Base",
    pace: "Aerobic volume first, key quality protected.",
    note: "The week stays polarized. No lower-body strength before intervals or long run.",
    days: [
      {
        n: "Day 1 – Intervals",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Intervals", d: "6 × 3 min hard / 90 sec easy" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 2 – Upper Body Calisthenics",
        tag: "c",
        exs: [
          { n: "Warm-up", d: "8 min" },
          { n: "Push-ups", d: "4 × 12–15" },
          { n: "Pull-ups or Inverted Rows", d: "4 × 6–10" },
          { n: "Dips or Bench Dips", d: "3 × 8–12" },
          { n: "Hollow Hold", d: "3 × 40 sec" },
          { n: "Mobility", d: "10 min" },
        ],
      },
      {
        n: "Day 3 – Easy Run",
        tag: "r",
        exs: [{ n: "Easy Run", d: "45–55 min easy" }],
      },
      {
        n: "Day 4 – Tempo Run",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Tempo Run", d: "30–35 min threshold" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 5 – Core + Mobility",
        tag: "k",
        exs: [
          { n: "Dead Bug", d: "3 × 12/side" },
          { n: "Side Plank", d: "3 × 35 sec/side" },
          { n: "Bird Dog", d: "3 × 12/side" },
          { n: "Hip Mobility", d: "15 min" },
        ],
      },
      {
        n: "Day 6 – Long Run",
        tag: "r",
        exs: [{ n: "Long Run", d: "75–110 min easy aerobic" }],
      },
      {
        n: "Day 7 – Rest",
        tag: "s",
        exs: [{ n: "Full Rest", d: "No training" }],
      },
    ],
  },
  {
    id: "p5",
    label: "Peak",
    pace: "Race-specific work, extra fatigue minimized.",
    note: "Bodyweight strength becomes maintenance only. Running quality has priority.",
    days: [
      {
        n: "Day 1 – Race Pace Intervals",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Intervals", d: "5 × 1 km at race pace" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 2 – Upper Body + Core",
        tag: "c",
        exs: [
          { n: "Push-ups", d: "3 × 10–12" },
          { n: "Inverted Rows", d: "3 × 6–8" },
          { n: "Hollow Hold", d: "3 × 40 sec" },
          { n: "Plank", d: "3 × 45 sec" },
          { n: "Mobility", d: "10 min" },
        ],
      },
      {
        n: "Day 3 – Easy Run",
        tag: "r",
        exs: [{ n: "Easy Run", d: "40–50 min easy" }],
      },
      {
        n: "Day 4 – Race Pace Tempo",
        tag: "r",
        exs: [
          { n: "Warm-up", d: "10 min" },
          { n: "Race Pace Run", d: "6–8 km controlled" },
          { n: "Cool-down", d: "10 min" },
        ],
      },
      {
        n: "Day 5 – Core + Mobility",
        tag: "k",
        exs: [
          { n: "Dead Bug", d: "3 × 10/side" },
          { n: "Side Plank", d: "3 × 30 sec/side" },
          { n: "Mobility", d: "15 min" },
        ],
      },
      {
        n: "Day 6 – Long Run",
        tag: "r",
        exs: [
          { n: "Long Run", d: "80–100 min with controlled race-pace section" },
        ],
      },
      {
        n: "Day 7 – Rest",
        tag: "s",
        exs: [{ n: "Full Rest", d: "No training" }],
      },
    ],
  },
];
