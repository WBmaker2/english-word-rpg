import { useEffect, useState } from "react";
import updateLog from "../../docs/UPDATELOG.md?raw";
import { loadTts, saveTts } from "../lib/tts";
import { useCharacter } from "../store/character";
import { db } from "../db";
import { getDueCards } from "../lib/words";

export default function Home({ go }: { go: (v: string) => void }) {
  const c = useCharacter((s) => s.character);
  const [dueCount, setDueCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [tts, setTts] = useState(loadTts());
  const [reminder, setReminder] = useState(localStorage.getItem("ewr-reminder") === "1");
  useEffect(() => {
    getDueCards(1000).then((d) => setDueCount(d.length));
    db.words.count().then(setWordCount);
    if (reminder && "Notification" in window && Notification.permission === "granted") {
      const delay = 24 * 60 * 60 * 1000;
      const t = setTimeout(() => new Notification("영어 단어 RPG", { body: "오늘의 복습을 시작하세요!" }), delay);
      return () => clearTimeout(t);
    }
  }, [reminder]);
  const xpNeeded = c.level * 100 + (c.level - 1) * (c.level - 1) * 20;
  return (
    <div className="card">
      <h2>홈</h2>
      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <div>레벨 {c.level}</div>
          <div className="hpbar"><div className="xpfill" style={{ width: `${(c.xp / xpNeeded) * 100}%` }} /></div>
          <div>XP {c.xp}/{xpNeeded}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div>HP</div>
          <div className="hpbar"><div className="hpfill" style={{ width: `${(c.hp / c.maxHp) * 100}%` }} /></div>
          <div>{c.hp}/{c.maxHp}</div>
        </div>
      </div>
      <div className="row">
        <div>코인: {c.coins}</div>
        <div>연속 학습: {c.streak}일</div>
        <div>단어 수: {wordCount}</div>
        <div>오늘 복습: {dueCount}</div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-pulse" onClick={() => go("battle")}>전투 시작</button>
        <button className="btn btn-secondary" onClick={() => go("words")}>단어장</button>
        <button className="btn btn-secondary" onClick={() => setShowLog(true)}>업데이트 내역</button>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>TTS 설정</h3>
        <div className="row">
          <label>속도</label>
          <input type="range" min="0.5" max="2" step="0.1" value={tts.rate} onChange={(e) => { const n = { ...tts, rate: Number(e.target.value) }; setTts(n); saveTts(n); }} />
          <span>{tts.rate.toFixed(1)}</span>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <label>언어</label>
          <select value={tts.lang} onChange={(e) => { const n = { ...tts, lang: e.target.value }; setTts(n); saveTts(n); }}>
            <option value="en-US">영어(미국)</option>
            <option value="en-GB">영어(영국)</option>
          </select>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <label>학습 리마인더</label>
          <input type="checkbox" checked={reminder} onChange={async (e) => {
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} onClick={() => setShowLog(false)}>
          <div className="card" style={{ maxWidth: 600, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3>업데이트 내역</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{updateLog}</pre>
            <button className="btn" onClick={() => setShowLog(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
