import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db";
import { addWord, getDueCards, listWords, deleteWord } from "./words";

describe("words", () => {
  beforeEach(async () => {
    await db.words.clear();
    await db.cards.clear();
  });
  it("adds word and card", async () => {
    const id = await addWord({ term: "apple", meaning: "사과" });
    expect(id).toBeGreaterThan(0);
    const words = await listWords();
    expect(words).toHaveLength(1);
    const due = await getDueCards(10);
    expect(due).toHaveLength(1);
  });
  it("deletes word and card", async () => {
    const id = await addWord({ term: "banana", meaning: "바나나" });
    await deleteWord(id);
    expect(await listWords()).toHaveLength(0);
    expect(await db.cards.count()).toBe(0);
  });
});
