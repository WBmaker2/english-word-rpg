export interface Skill {
  id: string;
  name: string;
  cost: number;
  desc: string;
  kind: "damage" | "heal" | "buff" | "shield";
  value: number;
}

export const SKILLS: Skill[] = [
  { id: "fireball", name: "파이어볼", cost: 1, desc: "적에게 40 데미지", kind: "damage", value: 40 },
  { id: "heal", name: "힐", cost: 1, desc: "HP 30 회복", kind: "heal", value: 30 },
  { id: "doublexp", name: "집중", cost: 2, desc: "다음 정답 XP 2배", kind: "buff", value: 2 },
  { id: "shield", name: "보호막", cost: 2, desc: "다음 오답 피해 무효", kind: "shield", value: 1 },
];
