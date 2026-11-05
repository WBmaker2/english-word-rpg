import { db } from "../db";
import { newCard } from "./srs";
import type { Word, CardState } from "../types";

export async function listWords(): Promise<Word[]> {
  return db.words.toArray();
}

export async function addWord(w: Omit<Word, "id">): Promise<number> {
  const id = await db.words.add(w as Word);
  await db.cards.put(newCard(id as number));
  return id as number;
}

export async function addWordsBulk(rows: Omit<Word, "id">[]): Promise<number> {
  let count = 0;
  await db.transaction("rw", db.words, db.cards, async () => {
    for (const r of rows) {
      const id = await db.words.add(r as Word);
      await db.cards.put(newCard(id as number));
      count++;
    }
  });
  return count;
}

export async function deleteWord(id: number): Promise<void> {
  await db.transaction("rw", db.words, db.cards, async () => {
    await db.words.delete(id);
    await db.cards.delete(id);
  });
}

export async function updateWord(w: Word): Promise<void> {
  await db.words.put(w);
}

export async function getDueCards(limit = 20): Promise<{ word: Word; card: CardState }[]> {
  const now = Date.now();
  const due = await db.cards.where("due").belowOrEqual(now).limit(limit).toArray();
  const words = await db.words.bulkGet(due.map((c) => c.wordId));
  const res: { word: Word; card: CardState }[] = [];
  for (let i = 0; i < due.length; i++) {
    const w = words[i];
    if (w) res.push({ word: w, card: due[i] });
  }
  return res;
}

export async function getCard(wordId: number) {
  return db.cards.get(wordId);
}

export async function saveCard(card: CardState) {
  await db.cards.put(card);
}

export async function totalWords() {
  return db.words.count();
}

export async function logBattle(correct: number, wrong: number) {
  await db.battles.add({ date: new Date().toISOString().slice(0, 10), correct, wrong });
}

export async function getBattleLogs() {
  return db.battles.toArray();
}
