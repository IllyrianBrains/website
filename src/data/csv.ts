// Minimal CSV parser (no dependency — the project keeps to plain `astro`). Handles
// quoted fields (commas/newlines/escaped "" inside quotes), which plain split(',')
// doesn't; none of this project's CSVs currently need that, but a spreadsheet app
// re-saving a file may well add quoting, so this stays defensive rather than
// assuming none. Shared by cities.ts, offers.ts and donations.ts.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Parses `text` as a CSV with a header row and returns a column-accessor per data
// row: `col(row, 'name')` reads that named column, trimmed, or '' if blank/missing.
export function csvRows(text: string): { row: string[]; col: (name: string) => string }[] {
  const [header, ...rows] = parseCsv(text);
  return rows.map(row => ({ row, col: (name: string) => (row[header.indexOf(name)] ?? '').trim() }));
}
