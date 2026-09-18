import { SOURCES } from './config.js';

export async function loadAll() {
  const entries = await Promise.all(
    Object.entries(SOURCES).map(async ([name, url]) => [name, await loadCsv(url)]),
  );
  return Object.fromEntries(entries);
}

async function loadCsv(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} 載入失敗（HTTP ${res.status}）`);
  const { data } = Papa.parse(await res.text(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
    transform: (v) => normDate(v.trim()),
  });
  return data;
}

// Google 試算表發布的 CSV 會依地區設定輸出日期（例如 2026/9/18），統一成 YYYY-MM-DD 才能比較大小
function normDate(value) {
  const m = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : value;
}

export function isGoogleSource() {
  return Object.values(SOURCES).some((url) => url.startsWith('https://docs.google.com/'));
}

const STATUS = { 完成: 'done', 進行中: 'doing' };

export function statusKey(text) {
  return STATUS[text] ?? 'todo';
}

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isLate(task, today = todayStr()) {
  return statusKey(task['狀態']) !== 'done' && task['截止日'] < today;
}

export function shortDate(iso) {
  return iso ? iso.slice(5).replace('-', '/') : '';
}

export function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
