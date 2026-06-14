'use strict';

// Parser de Markdown minimalista (sin dependencias externas)
// Soporta: front matter (---), encabezados #/##/###, párrafos, listas -, listas numeradas, **negrita**, enlaces [texto](url)

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
  let ulOpen = false;
  let olOpen = false;

  function closeLists() {
    if (ulOpen) { html.push('</ul>'); ulOpen = false; }
    if (olOpen) { html.push('</ol>'); olOpen = false; }
  }

  for (let line of lines) {
    line = line.trim();

    if (line === '') {
      closeLists();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeLists();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }

    const ulItem = line.match(/^[-*]\s+(.*)$/);
    if (ulItem) {
      if (olOpen) { html.push('</ol>'); olOpen = false; }
      if (!ulOpen) { html.push('<ul>'); ulOpen = true; }
      html.push(`<li>${inlineFormat(ulItem[1])}</li>`);
      continue;
    }

    const olItem = line.match(/^\d+\.\s+(.*)$/);
    if (olItem) {
      if (ulOpen) { html.push('</ul>'); ulOpen = false; }
      if (!olOpen) { html.push('<ol>'); olOpen = true; }
      html.push(`<li>${inlineFormat(olItem[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeLists();
  return html.join('\n');
}

module.exports = { parseFrontMatter, markdownToHtml };
