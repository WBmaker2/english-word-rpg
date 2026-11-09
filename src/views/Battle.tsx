import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDueCards, saveCard, logBattle, listWords } from "../lib/words";
import { review } from "../lib/srs";
import { useCharacter } from "../store/character";
import { attackBonus } from "../store/character";
import { SKILLS } from "../lib/skills";
import { EXAMPLE_KO } from "../lib/exampleTranslations";
import { speakTerm } from "../lib/tts";
import type { Word, CardState } from "../types";

interface Q {
  word: Word;
  card: CardState;
  kind: "meaning" | "spelling" | "listening" | "blank";
  options?: string[];
  answer: string;
  prompt: string;
  hint?: string;
}

function buildQuestions(pairs: { word: Word; card: CardState }[], allWords: Word[]): Q[] {
  const qs: Q[] = [];
  for (const p of pairs) {
    const kind = (["meaning", "spelling", "listening", "blank"] as const)[Math.floor(Math.random() * 4)];
    if (kind === "meaning") {
      const distractors = allWords.filter((w) => w.id !== p.word.id).sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.meaning);
      const options = [...distractors, p.word.meaning].sort(() => Math.random() - 0.5);
      qs.push({ word: p.word, card: p.card, kind, options, answer: p.word.meaning, prompt: p.word.term });
    } else if (kind === "listening") {
      qs.push({ word: p.word, card: p.card, kind, answer: p.word.term.toLowerCase(), prompt: "듣고 영어 단어를 쓰세요", hint: p.word.meaning });
    } else if (kind === "spelling") {
      qs.push({ word: p.word, card: p.card, kind, answer: p.word.term.toLowerCase(), prompt: p.word.meaning });
    } else {
      const ex = p.word.example || `I like ${p.word.term}.`;
      const blanked = ex.replace(new RegExp(p.word.term, "i"), "____");
      const ko = EXAMPLE_KO[ex] || "";
      qs.push({ word: p.word, card: p.card, kind, answer: p.word.term.toLowerCase(), prompt: blanked, hint: (ko ? ko + " " : "") + "(뜻: " + p.word.meaning + ")" });
    }
  }
  return qs;
}

export default function Battle({ onEnd }: { onEnd: () => void }) {
  const char = useCharacter((s) => s.character);
  const addXp = useCharacter((s) => s.addXp);
  const addCoins = useCharacter((s) => s.addCoins);
  const damage = useCharacter((s) => s.damage);
  const heal = useCharacter((s) => s.heal);
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [playerHp, setPlayerHp] = useState(char.hp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMax, setEnemyMax] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [usedSkills, setUsedSkills] = useState<string[]>([]);
  const [doubleXp, setDoubleXp] = useState(false);
  const [shield, setShield] = useState(false);
  const unlocked = useCharacter((s) => s.character.unlockedSkills || []);
  // allWords not needed

  useEffect(() => {
    (async () => {
      const words = await listWords();
      let due = await getDueCards(10);
      if (due.length === 0) {
        // fallback: create cards? use all words as due by forcing
        due = words.map((w) => ({ word: w, card: { wordId: w.id!, ease: 2.5, interval: 0, due: Date.now(), reps: 0, lapses: 0 } })).slice(0, 10);
      }
      const q = buildQuestions(due, words);
      setQs(q);
      const em = q.length * 15;
      setEnemyHp(em);
      setEnemyMax(em);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    const q = qs[idx];
    if (q && q.kind === "listening") {
      speakTerm(q.word.term);
    }
  }, [idx, qs]);

  const current = qs[idx];

  const activateSkill = (id: string) => {
    if (usedSkills.includes(id)) return;
    const sk = SKILLS.find((s) => s.id === id);
    if (!sk) return;
    if (sk.kind === "damage") setEnemyHp((h) => Math.max(0, h - sk.value));
    if (sk.kind === "heal") setPlayerHp((h) => Math.min(char.maxHp, h + sk.value));
    if (sk.kind === "buff") setDoubleXp(true);
    if (sk.kind === "shield") setShield(true);
    setUsedSkills((u) => [...u, id]);
  };

  const submitAnswer = async (ans: string) => {
    if (!current || feedback) return;
    const ok = ans.trim().toLowerCase() === current.answer.toLowerCase();
    setFeedback(ok ? "correct" : "wrong");
    const quality = ok ? 4 : 1;
    const newCard = review(current.card, quality);
    await saveCard(newCard);
    if (ok) {
      setCorrect((c) => c + 1);
      const bonus = attackBonus(char.equipment);
      let xpGain = Math.round(10 * bonus * (char.equipment.accessory === "ring" ? 1.1 : 1));
      if (doubleXp) { xpGain *= 2; setDoubleXp(false); }
      addXp(xpGain);
      addCoins(5);
      setEnemyHp((h) => Math.max(0, h - 15 * bonus));
    } else {
      setWrong((w) => w + 1);
      if (shield) {
        setShield(false);
      } else {
        const dmg = char.equipment.armor === "shield" ? 7 : 10;
        damage(dmg);
        setPlayerHp((h) => Math.max(0, h - dmg));
      }
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      setInput("");
      if (idx + 1 >= qs.length) {
        setFinished(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 900);
  };

  useEffect(() => {
    if (finished) {
      logBattle(correct, wrong);
      useCharacter.getState().updateStreak();
      if (playerHp <= 0) {
        // game over no heal
      } else {
        heal();
      }
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) return <div className="card">로딩...</div>;
  if (qs.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <h3>단어가 없습니다</h3>
        <p>단어장을 먼저 채워주세요.</p>
        <button className="btn" onClick={onEnd}>돌아가기</button>
      </div>
    </div>
  );

  if (finished) {
    const victory = playerHp > 0;
    return (
      <div className="card">
        <h2>{victory ? "승리!" : "패배..."}</h2>
        <div>정답 {correct} / 오답 {wrong}</div>
        <button className="btn btn-pulse" onClick={onEnd}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row">
        <div style={{ flex: 1 }}>
          <div>플레이어 HP</div>
          <div className="hpbar" role="progressbar" aria-valuenow={playerHp} aria-valuemin={0} aria-valuemax={char.maxHp} aria-label="플레이어 체력"><div className="hpfill" style={{ width: `${(playerHp / char.maxHp) * 100}%` }} /></div>
          <div>{playerHp}/{char.maxHp}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div>적 HP</div>
          <div className="hpbar" role="progressbar" aria-valuenow={enemyHp} aria-valuemin={0} aria-valuemax={enemyMax} aria-label="적 체력"><div className="hpfill" style={{ width: `${(enemyHp / enemyMax) * 100}%`, background: "#a855f7" }} /></div>
          <div>{enemyHp}/{enemyMax}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, color: "var(--muted)" }}>문제 {idx + 1}/{qs.length}</div>
      <div className="row" style={{ marginTop: 8 }}>
        {unlocked.map((id) => {
          const sk = SKILLS.find((s) => s.id === id);
          if (!sk) return null;
          const used = usedSkills.includes(id);
          return (
            <button key={id} className="btn btn-secondary" disabled={used} onClick={() => activateSkill(id)}>
              {sk.name}{used ? " (사용됨)" : ""}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              {current.kind === "listening" && "🔊 듣고 영어 단어를 쓰세요"}
              {current.kind === "meaning" && `"${current.prompt}" 의 뜻은?`}
              {current.kind === "spelling" && `뜻: ${current.prompt} → 스펠링?`}
              {current.kind === "blank" && `빈칸: ${current.prompt}`}
            </div>
            {current.hint && <div style={{ color: "var(--muted)", marginBottom: 8 }}>한글 힌트: {current.hint}</div>}
            {current.kind === "listening" && (
              <button className="btn btn-secondary" style={{ marginBottom: 8 }} onClick={() => speakTerm(current.word.term)}>다시 듣기</button>
            )}
            {current.options && (
              <div>
                {current.options.map((o) => (
                  <button
                    key={o}
                    className={`option ${selected === o ? (feedback === "correct" && o === current.answer ? "correct" : feedback === "wrong" && o === selected ? "wrong" : "") : ""}`}
                    onClick={() => { setSelected(o); submitAnswer(o); }}
                    disabled={!!feedback}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
            {!current.options && (
              <div>
                <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAnswer(input)} disabled={!!feedback} />
                <button className="btn" style={{ marginTop: 6 }} onClick={() => submitAnswer(input)} disabled={!!feedback}>제출</button>
              </div>
            )}
            {feedback && (
              <div style={{ marginTop: 8, color: feedback === "correct" ? "var(--good)" : "var(--bad)" }}>
                {feedback === "correct" ? "정답!" : `오답 (정답: ${current.answer})`}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
