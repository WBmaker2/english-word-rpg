import Dexie, { type Table } from "dexie";
import type { Word, CardState, BattleLog } from "../types";

export class AppDB extends Dexie {
  words!: Table<Word, number>;
  cards!: Table<CardState, number>;
  battles!: Table<BattleLog, number>;
  constructor() {
    super("english-word-rpg");
    this.version(1).stores({
      words: "++id, term, meaning",
      cards: "wordId",
      battles: "++id, date",
    });
    this.version(2).stores({
      words: "++id, term, meaning",
      cards: "wordId, due",
      battles: "++id, date",
    });
  }
}

export const db = new AppDB();
