const MONTHS = new Map([
  ["Jan", "01"],
  ["Feb", "02"],
  ["Mar", "03"],
  ["Apr", "04"],
  ["May", "05"],
  ["Jun", "06"],
  ["Jul", "07"],
  ["Aug", "08"],
  ["Sep", "09"],
  ["Oct", "10"],
  ["Nov", "11"],
  ["Dec", "12"],
]);

export const DATA_SOURCES = {
  shillerPe: {
    url: "https://www.multpl.com/shiller-pe/table/by-month",
    output: "src/data.json",
  },
  inflationAdjustedSp500: {
    url: "https://www.multpl.com/inflation-adjusted-s-p-500/table/by-month",
    output: "src/inflation-adjusted-sp-500.json",
  },
};

export function parseMultplMonthlyTable(html, { from = "1960-01-01" } = {}) {
  const rows = html.matchAll(
    /<tr[^>]*>\s*<td>\s*([^<]+?)\s*<\/td>\s*<td>\s*(?:&#x2002;|\s|&nbsp;)*([\d,.]+)\s*<\/td>\s*<\/tr>/gi
  );

  const seen = new Set();
  const data = [];

  for (const row of rows) {
    const date = parseMultplDate(row[1]);
    const value = Number(row[2].replaceAll(",", ""));

    if (!date || !Number.isFinite(value) || date < from || seen.has(date)) {
      continue;
    }

    seen.add(date);
    data.push([date, value]);
  }

  if (data.length === 0) {
    throw new Error("No data rows found in Multpl table");
  }

  return { data };
}

function parseMultplDate(value) {
  const match = value.trim().match(/^([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})$/);

  if (!match) {
    return null;
  }

  const month = MONTHS.get(match[1]);

  if (!month) {
    return null;
  }

  return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}
