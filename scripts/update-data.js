import { writeFile } from "node:fs/promises";
import { DATA_SOURCES, parseMultplMonthlyTable } from "../src/data-source.js";

for (const source of Object.values(DATA_SOURCES)) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "shiller-pe-ratio-data-updater/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
  }

  const parsed = parseMultplMonthlyTable(await response.text());
  await writeFile(source.output, `${JSON.stringify(parsed, null, 2)}\n`);
  console.log(`wrote ${source.output} (${parsed.data.length} rows)`);
}
