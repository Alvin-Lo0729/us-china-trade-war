import { statusKey, isLate, shortDate, esc, todayStr } from './data.js';

const COLUMNS = [
  { key: 'todo', title: '待辦' },
  { key: 'doing', title: '進行中' },
  { key: 'done', title: '完成' },
];

export function renderKanban(el, tasks) {
  const today = todayStr();
  el.innerHTML = COLUMNS.map(({ key, title }) => {
    const list = tasks
      .filter((t) => statusKey(t['狀態']) === key)
      .sort((a, b) => a['截止日'].localeCompare(b['截止日']));
    const cards = list.map((t, i) => {
      const late = isLate(t, today);
      return `
        <article class="card${late ? ' late' : ''}" style="animation-delay:${i * 40}ms">
          <p class="card-title">${esc(t['任務'])}</p>
          <div class="card-meta">
            <span class="chip">${esc(t['負責人'])}</span>
            <time>${shortDate(t['開始日'])} → ${shortDate(t['截止日'])}</time>
            ${t['章節'] ? `<span>${esc(t['章節'])}</span>` : ''}
            ${late ? '<span class="warn">逾期</span>' : ''}
          </div>
        </article>`;
    }).join('');
    return `
      <div class="kanban-col ${key}">
        <h3>${title}<span>${list.length}</span></h3>
        ${cards || '<p class="kanban-empty">目前沒有任務</p>'}
      </div>`;
  }).join('');
}
