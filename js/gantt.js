import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import { statusKey, isLate, todayStr } from './data.js';

const clean = (text) => text.replace(/:/g, '：').replace(/;/g, '；').replace(/#/g, '＃');

export function ganttSource(tasks, today = todayStr()) {
  const sections = new Map();
  tasks.forEach((t) => {
    const owner = t['負責人'] || '未指派';
    if (!sections.has(owner)) sections.set(owner, []);
    sections.get(owner).push(t);
  });

  const lines = [
    'gantt',
    '  dateFormat YYYY-MM-DD',
    '  axisFormat %m/%d',
    '  tickInterval 1week',
    '  weekday monday',
    '  inclusiveEndDates',
  ];
  let n = 0;
  for (const [owner, list] of sections) {
    lines.push(`  section ${clean(owner)}`);
    for (const t of list) {
      const tags = [];
      const status = statusKey(t['狀態']);
      if (status === 'done') tags.push('done');
      if (status === 'doing') tags.push('active');
      if (isLate(t, today)) tags.push('crit');
      const start = t['開始日'];
      const end = t['截止日'] || start;
      if (start === end) tags.push('milestone');
      const range = start === end ? `${start}, 0d` : `${start}, ${end}`;
      lines.push(`    ${clean(t['任務'])} :${[...tags, `t${n++}`].join(', ')}, ${range}`);
    }
  }
  return lines.join('\n');
}

export async function renderGantt(el, tasks) {
  const pre = document.createElement('pre');
  pre.className = 'mermaid';
  pre.textContent = ganttSource(tasks);
  el.replaceChildren(pre);
  await mermaid.run({ nodes: [pre] });
}
