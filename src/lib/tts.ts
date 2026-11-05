export interface TtsSettings {
  rate: number;
  lang: string;
}

const KEY = "ewr-tts";

export function loadTts(): TtsSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { rate: 1, lang: "en-US" };
}

export function saveTts(s: TtsSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function speakTerm(term: string) {
  const s = loadTts();
  const u = new SpeechSynthesisUtterance(term);
  u.rate = s.rate;
  u.lang = s.lang;
  speechSynthesis.speak(u);
}
