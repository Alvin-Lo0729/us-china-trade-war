import { esc } from './data.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const COL_W = 250;
const RUN = 110;
const STEP = 52;
const TWIG = 130;
const LINE_CHARS = 7;
const HEAD_W = 140;

function svgEl(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function groupByCategory(rows) {
  const groups = new Map();
  rows.forEach((r) => {
    const cat = r['大骨類別'];
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(r['原因']);
  });
  return [...groups].map(([name, causes]) => ({ name, causes }));
}

function causeText(x, y, text) {
  const node = svgEl('text', { class: 'fb-cause', x, y, 'text-anchor': 'end' });
  const space = text.indexOf(' ');
  const cut = space > 0 ? space : Math.ceil(text.length / 2);
  const lines = text.length > LINE_CHARS
    ? [text.slice(0, cut), text.slice(cut).trim()]
    : [text];
  lines.forEach((line, i) => {
    node.append(svgEl('tspan', { x, dy: i === 0 ? (lines.length > 1 ? -18 : 0) : 18 }, line));
  });
  return node;
}

export function renderFishbone(el, rows, head = '中美貿易戰爆發') {
  const cats = groupByCategory(rows);
  const cols = Math.ceil(cats.length / 2);
  const maxCauses = Math.max(1, ...cats.map((c) => c.causes.length));
  const boneH = (maxCauses + 1) * STEP;
  const labelH = 36;
  const margin = 24;
  const spineY = margin + labelH + boneH;
  const spineStart = margin + TWIG;
  const spineEnd = spineStart + cols * COL_W;
  const width = spineEnd + HEAD_W + margin;
  const height = spineY * 2;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    style: `max-width:${width}px`,
    role: 'img',
    'aria-label': `魚骨圖：${head}的成因`,
  });

  svg.append(svgEl('line', { class: 'fb-spine', x1: margin, y1: spineY, x2: spineEnd, y2: spineY }));

  cats.forEach((cat, i) => {
    const up = i % 2 === 0;
    const col = Math.floor(i / 2);
    const baseX = spineStart + (col + 1) * COL_W - 40;
    const tipX = baseX - RUN;
    const tipY = up ? spineY - boneH : spineY + boneH;

    svg.append(svgEl('line', { class: 'fb-bone', x1: tipX, y1: tipY, x2: baseX, y2: spineY }));

    const boxW = cat.name.length * 16 + 28;
    const boxY = up ? tipY - labelH : tipY;
    svg.append(svgEl('rect', {
      class: `fb-cat-box${up ? '' : ' alt'}`,
      x: tipX - boxW / 2, y: boxY, width: boxW, height: labelH - 6, rx: 3,
    }));
    svg.append(svgEl('text', {
      class: 'fb-cat-text', x: tipX, y: boxY + (labelH - 6) / 2 + 5, 'text-anchor': 'middle',
    }, cat.name));

    cat.causes.forEach((cause, j) => {
      const t = (j + 1) / (cat.causes.length + 1);
      const px = tipX + t * (baseX - tipX);
      const py = tipY + t * (spineY - tipY);
      svg.append(svgEl('line', { class: 'fb-twig', x1: px - TWIG, y1: py, x2: px, y2: py }));
      svg.append(causeText(px - (up ? 26 : 10), py - 7, cause));
    });
  });

  svg.append(svgEl('rect', {
    class: 'fb-head', x: spineEnd, y: spineY - 34, width: HEAD_W, height: 68, rx: 6,
  }));
  const headText = svgEl('text', { class: 'fb-head-text', x: spineEnd + HEAD_W / 2, y: spineY, 'text-anchor': 'middle' });
  const mid = Math.ceil(head.length / 2);
  [head.slice(0, mid), head.slice(mid)].forEach((line, i) => {
    headText.append(svgEl('tspan', { x: spineEnd + HEAD_W / 2, dy: i === 0 ? -4 : 22 }, line));
  });
  svg.append(headText);

  el.replaceChildren(svg);
}

export function renderCauses(tbody, rows) {
  tbody.innerHTML = rows.map((r) => {
    const source = r['出處'] || '待查證';
    const cls = source.includes('待查證') ? ' class="unverified"' : '';
    return `<tr>
      <td>${esc(r['大骨類別'])}</td>
      <td>${esc(r['原因'])}</td>
      <td>${esc(r['說明'])}</td>
      <td${cls}>${esc(source)}</td>
    </tr>`;
  }).join('');
}
