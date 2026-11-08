import { useState } from "react";
import Home from "./views/Home";
import Words from "./views/Words";
import Battle from "./views/Battle";
import Shop from "./views/Shop";
import Stats from "./views/Stats";

const VIEWS = ["home", "words", "battle", "shop", "stats"] as const;
const LABELS: Record<string, string> = { home: "홈", words: "단어장", battle: "전투", shop: "상점", stats: "통계" };
export default function App() {
  const [view, setView] = useState<string>("home");
  const go = (v: string) => setView(v);
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">영어 단어 RPG</h1>
        <nav className="nav" aria-label="주요 메뉴">
          {VIEWS.map((v) => (
            <button
              key={v}
              className={view === v ? "active" : ""}
              onClick={() => setView(v)}
              aria-current={view === v ? "page" : undefined}
            >
              {LABELS[v]}
            </button>
          ))}
        </nav>
      </header>
      {view === "home" && <Home go={go} />}
      {view === "words" && <Words />}
      {view === "battle" && <Battle onEnd={() => setView("home")} />}
      {view === "shop" && <Shop />}
      {view === "stats" && <Stats />}
    </div>
  );
}
