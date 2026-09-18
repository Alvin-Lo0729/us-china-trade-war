import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import { statusKey } from './data.js';

const CLASS = { todo: 'stTodo', doing: 'stDoing', done: 'stDone' };

const clean = (text) => text
  .replace(/\(/g, '（').replace(/\)/g, '）')
  .replace(/\[/g, '［').replace(/\]/g, '］')
  .replace(/\{/g, '｛').replace(/\}/g, '｝');

export function mindmapSource(outline) {
  const children = new Map();
  outline.forEach((row) => {
    const parent = row['父節點'];
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(row);
  });

  const lines = ['mindmap'];
  let n = 0;
  const walk = (row, depth) => {
    const indent = '  '.repeat(depth);
    const minutes = row['時長'] ? `（${row['時長']} 分）` : '';
    const label = clean(`${row['標題']}${minutes}`);
    if (depth === 1) {
      lines.push(`${indent}n${n++}((${label}))`);
    } else {
      lines.push(`${indent}n${n++}[${label}]`);
      lines.push(`${indent}:::${CLASS[statusKey(row['狀態'])]}`);
    }
    (children.get(row['id']) ?? []).forEach((child) => walk(child, depth + 1));
  };
  (children.get('') ?? []).forEach((root) => walk(root, 1));
  return lines.join('\n');
}

export async function renderMindmap(el, outline) {
  const pre = document.createElement('pre');
  pre.className = 'mermaid';
  pre.textContent = mindmapSource(outline);
  el.replaceChildren(pre);
  await mermaid.run({ nodes: [pre] });
}
