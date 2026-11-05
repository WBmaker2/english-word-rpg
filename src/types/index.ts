export interface Word {
  id?: number;
  term: string;
  meaning: string;
  example?: string;
}

export interface CardState {
  wordId: number;
  ease: number;
  interval: number;
  due: number;
  reps: number;
  lapses: number;
}

export interface Equipment {
  weapon?: string;
  armor?: string;
  accessory?: string;
}

export interface Character {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  coins: number;
  equipment: Equipment;
  owned: string[];
  streak: number;
  lastStudyDate?: string;
  skillPoints: number;
  unlockedSkills: string[];
}

export interface BattleLog {
  id?: number;
  date: string;
  correct: number;
  wrong: number;
}
