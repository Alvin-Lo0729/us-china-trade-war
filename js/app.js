import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import { loadAll, isGoogleSource, statusKey, isLate, todayStr, shortDate, esc } from './data.js';
import { renderGantt } from './gantt.js';
import { renderKanban } from './kanban.js';
import { renderMindmap } from './mindmap.js';
import { renderFishbone, renderCauses } from './fishbone.js';

const $ = (id) => document.getElementById(id);
const STATUS_TEXT = { todo: '待辦', doing: '進行中', done: '完成' };

function initMermaid() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: '"Noto Sans TC", sans-serif',
    themeVariables: {
      darkMode: dark,
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '14px',
      background: v('--card'),
      primaryColor: v('--paper-2'),
      primaryTextColor: v('--ink'),
      primaryBorderColor: v('--rule'),
      lineColor: v('--ink-2'),
      textColor: v('--ink'),
      sectionBkgColor: v('--paper-2'),
      altSectionBkgColor: v('--card'),
      sectionBkgColor2: v('--paper-2'),
      gridColor: v('--rule'),
      todayLineColor: v('--cn'),
      taskBkgColor: v('--todo'),
      taskBorderColor: v('--todo'),
      taskTextColor: v('--on-color'),
      taskTextLightColor: v('--on-color'),
      taskTextDarkColor: v('--ink'),
      taskTextOutsideColor: v('--ink'),
      activeTaskBkgColor: v('--doing'),
      activeTaskBorderColor: v('--doing'),
      doneTaskBkgColor: v('--done'),
      doneTaskBorderColor: v('--done'),
      critBkgColor: v('--late'),
      critBorderColor: v('--late'),
    },
    themeCSS: `
      .mindmap-node.stTodo rect, .mindmap-node.stTodo path { fill: ${v('--paper-2')} !important; stroke: ${v('--todo')} !important; }
      .mindmap-node.stDoing rect, .mindmap-node.stDoing path { fill: ${v('--doing')} !important; stroke: ${v('--doing')} !important; }
      .mindmap-node.stDone rect, .mindmap-node.stDone path { fill: ${v('--done')} !important; stroke: ${v('--done')} !important; }
      .mindmap-node.stTodo .nodeLabel, .mindmap-node.stTodo text { color: ${v('--ink')} !important; fill: ${v('--ink')} !important; }
      .mindmap-node.stDoing .nodeLabel, .mindmap-node.stDone .nodeLabel,
      .mindmap-node.stDoing text, .mindmap-node.stDone text { color: ${v('--on-color')} !important; fill: ${v('--on-color')} !important; }
      .section-root rect, .section-root path, .section-root circle { fill: ${v('--ink')} !important; }
      .section-root text, .section-root .nodeLabel { color: ${v('--paper')} !important; fill: ${v('--paper')} !important; }
      .edge { stroke: ${v('--ink-2')} !important; }
      .grid .tick line { stroke: ${v('--rule')} !important; }
      .grid .tick text { fill: ${v('--ink-2')} !important; }
    `,
    gantt: {
      barHeight: 24,
      barGap: 8,
      topPadding: 44,
      leftPadding: 80,
      sidePadding: 40,
      gridLineStartPadding: 30,
      fontSize: 13,
      sectionFontSize: 14,
      numberSectionStyles: 2,
    },
    mindmap: { padding: 14, maxNodeWidth: 220 },
  });
}

function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

function renderHeader(settings) {
  $('title').textContent = settings.title || '中美貿易戰';
  $('subtitle').textContent = settings.subtitle || '';
  $('today').textContent = `TODAY ${todayStr().replaceAll('-', '.')}`;
  if (settings.report_date) {
    const days = daysUntil(settings.report_date);
    $('countdown').textContent = days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${-days}`;
    $('report-date').textContent = settings.report_date.replaceAll('-', '.');
  }
}

function renderOverview({ settings, members, tasks, outline }) {
  const today = todayStr();
  const count = { todo: 0, doing: 0, done: 0 };
  tasks.forEach((t) => { count[statusKey(t['狀態'])] += 1; });
  const pct = tasks.length ? Math.round((count.done / tasks.length) * 100) : 0;
  $('pct').textContent = pct;
  requestAnimationFrame(() => { $('pct-bar').style.width = `${pct}%`; });
  $('task-count').textContent = `共 ${tasks.length} 項任務：完成 ${count.done}、進行中 ${count.doing}、待辦 ${count.todo}`;

  const open = tasks.filter((t) => statusKey(t['狀態']) !== 'done');
  const lateCount = open.filter((t) => isLate(t, today)).length;
  const next = open
    .filter((t) => t['截止日'] >= today)
    .sort((a, b) => a['截止日'].localeCompare(b['截止日']))[0];
  $('next-due').innerHTML = [
    next ? `<b>${esc(next['任務'])}</b><span>${esc(next['負責人'])} · ${shortDate(next['截止日'])} 截止</span>` : '<b>沒有待完成的任務</b>',
    lateCount ? `<span class="warn">⚠ ${lateCount} 項任務已逾期</span>` : '',
  ].join('');

  $('presenter').textContent = settings.presenter || '待定';
  $('links').innerHTML = [
    settings.outline_url && `<a href="${esc(settings.outline_url)}" target="_blank" rel="noopener">完整大綱與講稿重點 ↗</a>`,
    settings.sheet_url && `<a href="${esc(settings.sheet_url)}" target="_blank" rel="noopener">編輯進度試算表 ↗</a>`,
  ].filter(Boolean).join('');

  const root = outline.find((r) => !r['父節點']);
  const sections = root ? outline.filter((r) => r['父節點'] === root['id']) : [];
  const total = sections.reduce((sum, s) => sum + Number(s['時長'] || 0), 0);
  $('duration').textContent = `共 ${total} 分鐘`;

  let cursor = 0;
  const clock = (min) => `${String(min).padStart(2, '0')}:00`;
  $('runsheet-strip').innerHTML = sections.map((s, i) => {
    const min = Number(s['時長'] || 0);
    return `<span style="flex:${min};animation-delay:${i * 70}ms" title="${esc(s['標題'])}（${min} 分）">${esc(s['標題'])}</span>`;
  }).join('');
  $('runsheet-list').innerHTML = sections.map((s) => {
    const min = Number(s['時長'] || 0);
    const range = `${clock(cursor)}–${clock(cursor + min)}`;
    cursor += min;
    const subs = outline.filter((r) => r['父節點'] === s['id']).map((r) => r['標題']).join('、');
    const key = statusKey(s['狀態']);
    return `<li>
      <time>${range}</time>
      <span class="rs-title">${esc(s['標題'])}${subs ? `<span class="rs-sub">${esc(subs)}</span>` : ''}</span>
      <span class="rs-min">${min} 分</span>
      <span class="badge ${key}">${STATUS_TEXT[key]}</span>
    </li>`;
  }).join('');

  $('members').innerHTML = members.map((m) => {
    const mine = tasks.filter((t) => t['負責人'] === m['角色']);
    const done = mine.filter((t) => statusKey(t['狀態']) === 'done').length;
    const ratio = mine.length ? Math.round((done / mine.length) * 100) : 0;
    return `<tr>
      <td>${esc(m['角色'])}</td>
      <td>${esc(m['暱稱'])}</td>
      <td>${esc(m['負責內容'])}</td>
      <td><div class="mini-meter"><div class="meter"><i style="width:${ratio}%"></i></div><span>${done}/${mine.length}</span></div></td>
    </tr>`;
  }).join('');
}

function setupTabs(data) {
  const renderers = {
    gantt: () => renderGantt($('gantt-chart'), data.tasks),
    kanban: () => renderKanban($('kanban-board'), data.tasks),
    mindmap: () => renderMindmap($('mindmap-chart'), data.outline),
    fishbone: () => {
      renderFishbone($('fishbone-chart'), data.fishbone);
      renderCauses($('causes'), data.fishbone);
    },
  };
  const rendered = new Set();
  const buttons = [...document.querySelectorAll('.tabs button')];

  const show = (name) => {
    if (!renderers[name] && name !== 'overview') name = 'overview';
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== name; });
    if (renderers[name] && !rendered.has(name)) {
      rendered.add(name);
      Promise.resolve(renderers[name]()).catch((err) => showError(err));
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    history.replaceState(null, '', `#${b.dataset.tab}`);
    show(b.dataset.tab);
  }));
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || 'overview');
}

function showError(err) {
  const box = $('load-error');
  box.hidden = false;
  box.textContent = `資料載入或繪圖失敗：${err.message}`;
  console.error(err);
}

async function main() {
  initMermaid();
  $('source').textContent = isGoogleSource() ? 'Google 試算表' : '本機範本（sheet-template/）';
  try {
    const data = await loadAll();
    const settings = Object.fromEntries(data.settings.map((r) => [r.key, r.value]));
    renderHeader(settings);
    renderOverview({ ...data, settings });
    setupTabs(data);
    $('loaded-at').textContent = `更新時間 ${new Date().toLocaleString('zh-TW', { hour12: false })}`;
  } catch (err) {
    showError(err);
  }
}

main();
