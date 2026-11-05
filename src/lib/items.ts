export interface Item {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "accessory";
  cost: number;
  desc: string;
}

export const ITEMS: Item[] = [
  { id: "sword", name: "철검", slot: "weapon", cost: 80, desc: "공격력 +20%" },
  { id: "staff", name: "지팡이", slot: "weapon", cost: 60, desc: "공격력 +15%" },
  { id: "armor", name: "가죽 갑옷", slot: "armor", cost: 100, desc: "최대 HP +20" },
  { id: "shield", name: "방패", slot: "armor", cost: 70, desc: "피해 -10%" },
  { id: "ring", name: "마법 반지", slot: "accessory", cost: 90, desc: "경험치 +10%" },
  { id: "amulet", name: "부적", slot: "accessory", cost: 50, desc: "연속 정답 보너스" },
];
