import { useEffect, useState } from "react";
import { listWords, addWord, deleteWord, addWordsBulk } from "../lib/words";
import type { Word } from "../types";

export default function Words() {
  const [words, setWords] = useState<Word[]>([]);
  const [visible, setVisible] = useState(50);
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");

  const refresh = () => listWords().then(setWords);
  useEffect(() => { refresh(); }, []);

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
        }
      } catch {}
    };
    reader.readAsText(file);
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
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <h2>단어장</h2>
      <div className="card">
        <input className="input" placeholder="단어" value={term} onChange={(e) => setTerm(e.target.value)} />
        <input className="input" placeholder="뜻" value={meaning} onChange={(e) => setMeaning(e.target.value)} style={{ marginTop: 6 }} />
        <input className="input" placeholder="예문(선택)" value={example} onChange={(e) => setExample(e.target.value)} style={{ marginTop: 6 }} />
        <button className="btn" style={{ marginTop: 6 }} onClick={handleAdd}>추가</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
          CSV 가져오기
          <input type="file" accept=".csv" hidden onChange={handleCSV} />
        </label>
        <span style={{ marginLeft: 8, color: "var(--muted)", fontSize: 12 }}>형식: term,meaning,example</span>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn btn-secondary" onClick={handleExport}>JSON 내보내기</button>
        <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
          JSON 가져오기
          <input type="file" accept=".json" hidden onChange={handleImportJSON} />
        </label>
      </div>
      <div className="grid" style={{ marginTop: 12 }}>
        {words.slice(0, visible).map((w) => (
          <div key={w.id} className="word-item">
            <b>{w.term}</b>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{w.meaning}</div>
            {w.example && <div style={{ fontSize: 12 }}>{w.example}</div>}
            <button className="btn btn-secondary" style={{ marginTop: 6, padding: "4px 8px", fontSize: 12 }} onClick={() => { deleteWord(w.id!); refresh(); }}>삭제</button>
          </div>
        ))}
      </div>
      {visible < words.length && (
        <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setVisible((v) => v + 50)}>더 보기</button>
      )}
    </div>
  );
}
