import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, Equipment } from "../types";

const defaultChar: Character = {
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  coins: 50,
  equipment: {},
  owned: [],
  streak: 0,
  skillPoints: 0,
  unlockedSkills: [],
};

interface CharStore {
  character: Character;
  addXp: (n: number) => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  damage: (n: number) => void;
  heal: () => void;
  buy: (id: string, cost: number) => boolean;
  equip: (slot: keyof Equipment, id: string) => void;
  updateStreak: () => void;
  reset: () => void;
  addSkillPoint: (n: number) => void;
  unlockSkill: (id: string, cost: number) => boolean;
}

const xpForLevel = (lvl: number) => lvl * 100 + (lvl - 1) * (lvl - 1) * 20;

export const useCharacter = create<CharStore>()(
  persist(
    (set, get) => ({
      character: defaultChar,
      addXp: (n) =>
        set((s: any) => {
          let { character: c } = s;
          c = { ...c, xp: c.xp + n };
          while (c.xp >= xpForLevel(c.level)) {
            c.xp -= xpForLevel(c.level);
            c.level += 1;
            c.maxHp += 10;
            c.hp = c.maxHp;
            c.skillPoints += 1;
          }
          return { character: c };
        }),
      addCoins: (n) =>
        set((s: any) => ({ character: { ...s.character, coins: s.character.coins + n } })),
      spendCoins: (n) => {
        const c = get().character;
        if (c.coins < n) return false;
        set({ character: { ...c, coins: c.coins - n } });
        return true;
      },
      damage: (n) =>
        set((s: any) => ({ character: { ...s.character, hp: Math.max(0, s.character.hp - n) } })),
      heal: () => set((s: any) => ({ character: { ...s.character, hp: s.character.maxHp } })),
      buy: (id, cost) => {
        const c = get().character;
        if (c.owned.includes(id) || c.coins < cost) return false;
        set({ character: { ...c, coins: c.coins - cost, owned: [...c.owned, id] } });
        return true;
      },
      equip: (slot, id) =>
        set((s: any) => {
          const c = s.character;
          let maxHp = c.maxHp;
          if (slot === "armor") {
            maxHp = 100 + (c.level - 1) * 10 + (id === "armor" ? 20 : 0);
          }
          const hp = Math.min(c.hp, maxHp);
          return { character: { ...c, maxHp, hp, equipment: { ...c.equipment, [slot]: id } } };
        }),
      updateStreak: () => {
        const today = new Date().toDateString();
        const c = get().character;
        if (c.lastStudyDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const streak = c.lastStudyDate === yesterday ? c.streak + 1 : 1;
        set({ character: { ...c, streak, lastStudyDate: today } });
      },
      addSkillPoint: (n) =>
        set((s: any) => ({ character: { ...s.character, skillPoints: s.character.skillPoints + n } })),
      unlockSkill: (id, cost) => {
        const c = get().character;
        const unlocked = c.unlockedSkills || [];
        if (unlocked.includes(id) || c.skillPoints < cost) return false;
        set({ character: { ...c, skillPoints: c.skillPoints - cost, unlockedSkills: [...unlocked, id] } });
        return true;
      },
      reset: () => set({ character: defaultChar }),
    }),
    {
      name: "ewr-character",
      merge: (persisted: any, current: any) => ({
        ...current,
        character: { ...current.character, ...(persisted?.character || {}) },
      }),
    }
  )
);

export function attackBonus(eq: Equipment): number {
  let bonus = 1;
  if (eq.weapon === "sword") bonus += 0.2;
  if (eq.weapon === "staff") bonus += 0.15;
  if (eq.accessory === "ring") bonus += 0.1;
  return bonus;
}
