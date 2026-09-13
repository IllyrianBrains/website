import type { StatutiArticle } from '../data/statuti';

// Presentation only: retain the source wording and original point markers.
export function organizeClauses(article: StatutiArticle) {
  const boundary = new RegExp(`\\s+(?=${article.number}\\.\\d+(?:\\.\\d+)*\\.\\s)`, 'u');
  return article.clauses.flatMap((clause) => clause.replace(/\u200b/g, '').split(boundary)).map((clause) => {
    const match = clause.match(/^(\d+(?:\.\d+)+\.)\s+([\s\S]*)$/u);
    const number = match?.[1] ?? '';
    const text = match?.[2] ?? clause;
    // Alphabetic, Roman numeral, numbered and dash lists occur in the source.
    const parts = text.split(/\s+(?=(?:[a-zA-Z]\.|[ivxIVX]+\.|\d+[.)]|-)\s)/u);
    const introduction = parts.shift() ?? '';
    return { number, introduction, items: parts, id: `pika-${number.replace(/\.$/, '').replaceAll('.', '-')}` };
  });
}

export const statutiSections = [
  { id: 'shoqata', title: 'Shoqata dhe qëllimi', from: 1, to: 6 },
  { id: 'anetaresia', title: 'Themeluesit dhe anëtarësia', from: 7, to: 11 },
  { id: 'drejtimi', title: 'Organizimi dhe drejtimi', from: 12, to: 18 },
  { id: 'financimi', title: 'Financimi dhe përfaqësimi', from: 19, to: 22 },
  { id: 'likuidimi', title: 'Likuidimi dhe pasuria', from: 23, to: 25 },
];
