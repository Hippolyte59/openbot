export interface Monster {
  name: string;
  emoji: string;

  minLevel: number;
  baseHp: number;

  attack: [number, number];

  reward: [number, number];

  xpReward: [number, number];
}

export const MONSTERS: Monster[] = [
  {
    name: "Slime gluant",
    emoji: "🟢",
    minLevel: 1,
    baseHp: 25,
    attack: [2, 5],
    reward: [25, 50],
    xpReward: [15, 30],
  },
  {
    name: "Rat géant",
    emoji: "🐀",
    minLevel: 2,
    baseHp: 35,
    attack: [3, 6],
    reward: [35, 60],
    xpReward: [20, 35],
  },
  {
    name: "Loup affamé",
    emoji: "🐺",
    minLevel: 4,
    baseHp: 45,
    attack: [4, 8],
    reward: [50, 80],
    xpReward: [30, 45],
  },
  {
    name: "Gobelin voleur",
    emoji: "👺",
    minLevel: 7,
    baseHp: 60,
    attack: [5, 10],
    reward: [70, 110],
    xpReward: [40, 60],
  },
  {
    name: "Squelette maudit",
    emoji: "💀",
    minLevel: 11,
    baseHp: 75,
    attack: [7, 12],
    reward: [90, 140],
    xpReward: [55, 80],
  },
  {
    name: "Orc brutal",
    emoji: "👹",
    minLevel: 16,
    baseHp: 95,
    attack: [9, 15],
    reward: [120, 180],
    xpReward: [70, 100],
  },
  {
    name: "Golem de pierre",
    emoji: "🗿",
    minLevel: 22,
    baseHp: 120,
    attack: [11, 18],
    reward: [150, 230],
    xpReward: [90, 130],
  },
  {
    name: "Dragonnet",
    emoji: "🐉",
    minLevel: 30,
    baseHp: 160,
    attack: [14, 22],
    reward: [200, 320],
    xpReward: [120, 170],
  },
];

export function pickMonster(playerLevel: number): Monster {
  const eligible = MONSTERS.filter((m) => m.minLevel <= playerLevel);
  const strongest = eligible[eligible.length - 1].minLevel;

  const pool =
    Math.random() < 0.6
      ? eligible.filter((m) => m.minLevel === strongest)
      : eligible;
  return pool[Math.floor(Math.random() * pool.length)];
}
