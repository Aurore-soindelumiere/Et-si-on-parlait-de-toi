// Génération de fichiers CSV compatibles Excel (UTF-8 avec BOM, séparateur « ; »).
// Protection contre les formules malveillantes : toute cellule commençant par
// = + - @ ou une tabulation est préfixée d'une apostrophe.

const SEP = ';';

function cell(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[";\n\r]/.test(s) || s.includes(SEP)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(header, rows) {
  const lines = [header.map(cell).join(SEP)];
  for (const r of rows) lines.push(r.map(cell).join(SEP));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

export function csvResponse(filename, content) {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export function formatNumberFr(n) {
  return String(n).replace('.', ',');
}
