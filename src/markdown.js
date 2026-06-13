'use strict';

// Parser de Markdown minimalista (sin dependencias externas)
// Soporta: front matter (---), encabezados #/##/###, párrafos, listas -, **negrita**, enlaces [texto](url)

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
    data[key] = value;
  }
  return { data, body: match[2] };
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(body) {
  const lines = body.split(/\r?\n/);
  const html = [];
  let listOpen = false;

  for (let line of lines) {
    line = line.trim();

    if (line === '') {
      if (listOpen) { html.push('</ul>'); listOpen = false; }
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      if (listOpen) { html.push('</ul>'); listOpen = false; }
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      if (!listOpen) { html.push('<ul>'); listOpen = true; }
      html.push(`<li>${inlineFormat(listItem[1])}</li>`);
      continue;
    }

    if (listOpen) { html.push('</ul>'); listOpen = false; }
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  if (listOpen) html.push('</ul>');
  return html.join('\n');
}

module.exports = { parseFrontMatter, markdownToHtml };
