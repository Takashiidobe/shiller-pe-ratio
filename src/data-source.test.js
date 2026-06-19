import { describe, expect, it } from "vitest";
import { parseMultplMonthlyTable } from "./data-source.js";

describe("parseMultplMonthlyTable", () => {
  it("parses Multpl table rows into the app JSON shape", () => {
    const html = `
      <table id="datatable">
        <tr><th>Date</th><th>Value</th></tr>
        <tr class="odd"><td>Jun 18, 2026</td><td>&#x2002;41.71</td></tr>
        <tr class="even"><td>Jun 1, 2026</td><td>&#x2002;41.32</td></tr>
        <tr class="odd"><td>May 1, 1959</td><td>&#x2002;18.00</td></tr>
      </table>
    `;

    expect(parseMultplMonthlyTable(html)).toEqual({
      data: [
        ["2026-06-18", 41.71],
        ["2026-06-01", 41.32],
      ],
    });
  });

  it("handles comma-formatted values and ignores duplicate dates", () => {
    const html = `
      <tr class="odd"><td>Jun 18, 2026</td><td>&#x2002;7,544.88</td></tr>
      <tr class="even"><td>Jun 18, 2026</td><td>&#x2002;7,500.00</td></tr>
    `;

    expect(parseMultplMonthlyTable(html).data).toEqual([
      ["2026-06-18", 7544.88],
    ]);
  });

  it("throws when the table shape cannot be parsed", () => {
    expect(() => parseMultplMonthlyTable("<table></table>")).toThrow(
      "No data rows found"
    );
  });
});
