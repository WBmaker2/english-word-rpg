import { useEffect, useState } from "react";
import updateLog from "../../docs/UPDATELOG.md?raw";
import { loadTts, saveTts } from "../lib/tts";
import { useCharacter } from "../store/character";
import { db } from "../db";
import { getDueCards } from "../lib/words";
import { seedElementaryWords } from "../lib/seedWords";

export default function Home({ go }: { go: (v: string) => void }) {
  const c = useCharacter((s) => s.character);
  const [dueCount, setDueCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [tts, setTts] = useState(loadTts());
  const [reminder, setReminder] = useState(localStorage.getItem("ewr-reminder") === "1");
  const [seeding, setSeeding] = useState(false);

  const refreshCounts = () => {
    getDueCards(1000).then((d) => setDueCount(d.length));
    db.words.count().then(async (n) => {
      setWordCount(n);
      if (n === 0 && !localStorage.getItem("ewr-seeded")) {
        localStorage.setItem("ewr-seeded", "1");
        const added = await seedElementaryWords();
        if (added > 0) {
          getDueCards(1000).then((d) => setDueCount(d.length));
          db.words.count().then(setWordCount);
        }
      }
    });
  };

  useEffect(() => {
    refreshCounts();
    if (reminder && "Notification" in window && Notification.permission === "granted") {
      const delay = 24 * 60 * 60 * 1000;
      const t = setTimeout(() => new Notification("영어 단어 RPG", { body: "오늘의 복습을 시작하세요!" }), delay);
      return () => clearTimeout(t);
    }
  }, [reminder]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const n = await seedElementaryWords();
      refreshCounts();
      if (n > 0) alert(`${n}개의 초등 필수 단어를 추가했습니다.`);
      else alert("추가할 새 단어가 없습니다.");
    } finally {
      setSeeding(false);
    }
  };

  const xpNeeded = c.level * 100 + (c.level - 1) * (c.level - 1) * 20;
  const xpPct = Math.min(100, (c.xp / xpNeeded) * 100);
  const hpPct = Math.min(100, (c.hp / c.maxHp) * 100);

  return (
    <div>
      <div className="card">
        <h2>홈</h2>
        <div className="row">
          <div className="card" style={{ flex: 1, marginBottom: 0 }}>
            <div className="stat-label">레벨</div>
            <div className="stat">{c.level}</div>
            <div className="hpbar" style={{ marginTop: 8 }} role="progressbar" aria-valuenow={c.xp} aria-valuemin={0} aria-valuemax={xpNeeded} aria-label="경험치">
              <div className="xpfill" style={{ width: `${xpPct}%` }} />
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>XP {c.xp}/{xpNeeded}</div>
          </div>
          <div className="card" style={{ flex: 1, marginBottom: 0 }}>
            <div className="stat-label">HP</div>
            <div className="stat">{c.hp}</div>
            <div className="hpbar" style={{ marginTop: 8 }} role="progressbar" aria-valuenow={c.hp} aria-valuemin={0} aria-valuemax={c.maxHp} aria-label="체력">
              <div className="hpfill" style={{ width: `${hpPct}%` }} />
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{c.hp}/{c.maxHp}</div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <span className="badge">코인 {c.coins}</span>
          <span className="badge">연속 {c.streak}일</span>
          <span className="badge">단어 {wordCount}</span>
          <span className="badge warn">오늘 복습 {dueCount}</span>
        </div>
        {wordCount === 0 && (
          <div className="empty-state" style={{ marginTop: 14 }}>
            <h3>단어장이 비어있어요</h3>
            <p>초등 필수 영단어로 시작해 보세요.</p>
            <button className="btn" onClick={handleSeed} disabled={seeding}>{seeding ? "채우는 중..." : "초등 필수 단어 채우기"}</button>
          </div>
        )}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btn-pulse" onClick={() => go("battle")}>전투 시작</button>
          <button className="btn btn-secondary" onClick={() => go("words")}>단어장</button>
          <button className="btn btn-ghost" onClick={() => setShowLog(true)}>업데이트 내역</button>
        </div>
      </div>

      <div className="card">
        <h3>TTS 설정</h3>
        <div className="row">
          <label htmlFor="tts-rate">속도</label>
          <input id="tts-rate" type="range" min="0.5" max="2" step="0.1" value={tts.rate} onChange={(e) => { const n = { ...tts, rate: Number(e.target.value) }; setTts(n); saveTts(n); }} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{tts.rate.toFixed(1)}</span>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <label htmlFor="tts-lang">언어</label>
          <select id="tts-lang" className="input select" style={{ width: "auto" }} value={tts.lang} onChange={(e) => { const n = { ...tts, lang: e.target.value }; setTts(n); saveTts(n); }}>
            <option value="en-US">영어(미국)</option>
            <option value="en-GB">영어(영국)</option>
          </select>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <label htmlFor="reminder">학습 리마인더</label>
          <input id="reminder" type="checkbox" checked={reminder} onChange={async (e) => {
            const v = e.target.checked;
            if (v && "Notification" in window) {
              const p = await Notification.requestPermission();
              if (p !== "granted") { setReminder(false); localStorage.setItem("ewr-reminder", "0"); return; }
            }
            setReminder(v);
            localStorage.setItem("ewr-reminder", v ? "1" : "0");
          }} />
        </div>
      </div>

      {showLog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: 16 }} onClick={() => setShowLog(false)}>
          <div className="card" style={{ maxWidth: 640, maxHeight: "80vh", overflow: "auto", margin: 0 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="업데이트 내역">
            <h3>업데이트 내역</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, margin: 0 }}>{updateLog}</pre>
            <div className="row" style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setShowLog(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
