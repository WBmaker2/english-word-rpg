import { useEffect, useState, useMemo } from "react";
import { listWords, addWord, deleteWord, addWordsBulk } from "../lib/words";
import { seedElementaryWords } from "../lib/seedWords";
import type { Word } from "../types";

export default function Words() {
  const [words, setWords] = useState<Word[]>([]);
  const [visible, setVisible] = useState(50);
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [query, setQuery] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = () => listWords().then(setWords);
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((w) => w.term.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));
  }, [words, query]);

  const handleAdd = async () => {
    if (!term.trim() || !meaning.trim()) return;
    await addWord({ term: term.trim(), meaning: meaning.trim(), example: example.trim() || undefined });
    setTerm(""); setMeaning(""); setExample("");
    refresh();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rows = JSON.parse(String(reader.result));
        if (Array.isArray(rows)) {
          const clean = rows.map((r: any) => ({ term: String(r.term), meaning: String(r.meaning), example: r.example ? String(r.example) : undefined }));
          await addWordsBulk(clean);
          refresh();
          setMsg(`${clean.length}개 가져옴`);
        }
      } catch {
        setMsg("가져오기 실패");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const rows: Omit<Word, "id">[] = [];
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
        if (parts.length < 2) continue;
        if (parts[0].toLowerCase() === "term") continue;
        rows.push({ term: parts[0], meaning: parts[1], example: parts[2] || undefined });
      }
      await addWordsBulk(rows);
      refresh();
      setMsg(`${rows.length}개 가져옴`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const n = await seedElementaryWords();
      refresh();
      setMsg(n > 0 ? `${n}개의 초등 필수 단어를 추가했습니다.` : "추가할 새 단어가 없습니다.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>단어장</h2>
        <div className="row" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={handleSeed} disabled={seeding}>{seeding ? "채우는 중..." : "초등 필수 단어 채우기"}</button>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>총 {words.length}개</span>
          {msg && <span style={{ color: "var(--good)", fontSize: 13 }}>{msg}</span>}
        </div>

        <div className="card" style={{ marginBottom: 10 }}>
          <div className="row" style={{ marginBottom: 6 }}>
            <input className="input" placeholder="단어 (term)" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="단어" />
          </div>
          <div className="row" style={{ marginBottom: 6 }}>
            <input className="input" placeholder="뜻 (meaning)" value={meaning} onChange={(e) => setMeaning(e.target.value)} aria-label="뜻" />
          </div>
          <div className="row" style={{ marginBottom: 6 }}>
            <input className="input" placeholder="예문 (선택)" value={example} onChange={(e) => setExample(e.target.value)} aria-label="예문" />
          </div>
          <button className="btn" onClick={handleAdd} disabled={!term.trim() || !meaning.trim()}>추가</button>
        </div>

        <div className="row" style={{ marginBottom: 8 }}>
          <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
            CSV 가져오기
            <input type="file" accept=".csv" hidden onChange={handleCSV} />
          </label>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>형식: term,meaning,example</span>
          <button className="btn btn-secondary" onClick={handleExport}>JSON 내보내기</button>
          <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
            JSON 가져오기
            <input type="file" accept=".json" hidden onChange={handleImportJSON} />
          </label>
        </div>

        <input className="input" placeholder="검색 (단어/뜻)" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="검색" style={{ marginBottom: 12 }} />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>단어가 없습니다</h3>
            <p>위 버튼으로 초등 필수 단어를 채우거나 직접 추가하세요.</p>
          </div>
        ) : (
          <>
            <div className="grid">
              {filtered.slice(0, visible).map((w) => (
                <div key={w.id} className="word-item">
                  <b>{w.term}</b>
                  <div className="meaning">{w.meaning}</div>
                  {w.example && <div className="example">{w.example}</div>}
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => { deleteWord(w.id!); refresh(); }}>삭제</button>
                </div>
              ))}
            </div>
            {visible < filtered.length && (
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setVisible((v) => v + 50)}>더 보기 ({filtered.length - visible}개 남음)</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
