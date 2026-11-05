import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getBattleLogs, totalWords } from "../lib/words";
import { db } from "../db";

export default function Stats() {
  const [logs, setLogs] = useState<any[]>([]);
  const [words, setWords] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  useEffect(() => {
    getBattleLogs().then(setLogs);
    totalWords().then(setWords);
    db.cards.toArray().then(setCards);
  }, []);

  const byDate: Record<string, { date: string; correct: number; wrong: number }> = {};
  for (const l of logs) {
    if (!byDate[l.date]) byDate[l.date] = { date: l.date, correct: 0, wrong: 0 };
    byDate[l.date].correct += l.correct;
    byDate[l.date].wrong += l.wrong;
  }
  const barData = Object.values(byDate).slice(-14);

  const mastered = cards.filter((c) => c.reps >= 3).length;
  const learning = cards.filter((c) => c.reps > 0 && c.reps < 3).length;
  const newc = cards.filter((c) => c.reps === 0).length;
  const pieData = [
    { name: "숙달", value: mastered },
    { name: "학습중", value: learning },
    { name: "신규", value: newc },
  ];
  const colors = ["#22c55e", "#f59e0b", "#94a3b8"];

  return (
    <div className="card">
      <h2>통계</h2>
      <div className="row">
        <div>총 단어: {words}</div>
        <div>전투 기록: {logs.length}</div>
      </div>
      <div style={{ height: 240, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="correct" fill="#22c55e" />
            <Bar dataKey="wrong" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ height: 200, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
              {pieData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
