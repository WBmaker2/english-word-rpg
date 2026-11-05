import { useCharacter } from "../store/character";
import { ITEMS } from "../lib/items";
import { SKILLS } from "../lib/skills";

export default function Shop() {
  const c = useCharacter((s) => s.character);
  const buy = useCharacter((s) => s.buy);
  const equip = useCharacter((s) => s.equip);
  // spendCoins available if needed
  return (
    <div className="card">
      <h2>상점</h2>
      <div>코인: {c.coins} · 스킬 포인트: {c.skillPoints}</div>
      <div className="grid" style={{ marginTop: 12 }}>
        {ITEMS.map((it) => {
          const owned = c.owned.includes(it.id);
          const equipped = c.equipment[it.slot] === it.id;
          return (
            <div key={it.id} className="word-item">
              <b>{it.name}</b>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.desc}</div>
              <div style={{ fontSize: 12 }}>슬롯: {it.slot} · 가격: {it.cost}</div>
              {!owned && (
                <button className="btn" style={{ marginTop: 6 }} onClick={() => buy(it.id, it.cost)}>구매</button>
              )}
              {owned && !equipped && (
                <button className="btn btn-secondary" style={{ marginTop: 6 }} onClick={() => equip(it.slot, it.id)}>장착</button>
              )}
              {equipped && <div style={{ color: "var(--good)", marginTop: 6 }}>장착 중</div>}
            </div>
          );
        })}
      </div>
      <h3 style={{ marginTop: 12 }}>스킬</h3>
      <div className="grid">
        {SKILLS.map((sk) => {
          const unlocked = (c.unlockedSkills || []).includes(sk.id);
          return (
            <div key={sk.id} className="word-item">
              <b>{sk.name}</b>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{sk.desc}</div>
              <div style={{ fontSize: 12 }}>비용: {sk.cost} SP</div>
              {!unlocked && (
                <button className="btn" style={{ marginTop: 6 }} onClick={() => useCharacter.getState().unlockSkill(sk.id, sk.cost)}>해금</button>
              )}
              {unlocked && <div style={{ color: "var(--good)", marginTop: 6 }}>해금됨</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
