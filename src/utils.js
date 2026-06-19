import data from "./data.json";
import standardAndPoorData from "./inflation-adjusted-sp-500.json";

import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

let chart;

function getStats(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return [
    Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
    ),
    mean,
  ];
}

export async function updateChart() {
  const dataset = (await fetchData()).data
    .slice()
    .sort((a, b) => a[0].localeCompare(b[0]));
  const pricesByDate = new Map(standardAndPoorData.data);
  const rows = dataset
    .map(([date, ratio]) => [date, ratio, pricesByDate.get(date)])
    .filter((row) => Number.isFinite(row[2]));
  const dates = rows.map(([date]) => date);
  const ratios = rows.map(([, ratio]) => ratio);
  const prices = rows.map(([, , price]) => price);
  const [stddev, average] = getStats(ratios);
  const latest = rows.at(-1);

  renderStats({ latest, average, stddev, count: rows.length });
  renderTable(rows);

  const line = (value) => Array.from({ length: ratios.length }, () => value);
  const ctx = document.getElementById("myChart");

  chart?.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Shiller P/E Ratio",
          data: ratios,
          yAxisID: "ratio",
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.18,
        },
        {
          label: "Inflation Adjusted S&P 500",
          data: prices,
          yAxisID: "price",
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 1,
          pointRadius: 0,
          tension: 0.18,
        },
        {
          label: "Historic Average",
          data: line(average),
          borderColor: "#111827",
          borderDash: [6, 6],
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "1 Standard Deviation Above Mean",
          data: line(average + stddev),
          borderColor: "#16a34a",
          borderDash: [4, 6],
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "2 Standard Deviations Above Mean",
          data: line(average + stddev * 2),
          borderColor: "#f97316",
          borderDash: [4, 6],
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "1 Standard Deviation Below Mean",
          data: line(average - stddev),
          borderColor: "#16a34a",
          borderDash: [4, 6],
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "2 Standard Deviations Below Mean",
          data: line(average - stddev * 2),
          borderColor: "#f97316",
          borderDash: [4, 6],
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        ratio: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Shiller P/E",
          },
        },
        price: {
          type: "linear",
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: "Real S&P 500",
          },
        },
      },
    },
  });
}

function renderStats({ latest, average, stddev, count }) {
  const [date, ratio, price] = latest;

  document.getElementById("latest-date").textContent = formatDate(date);
  document.getElementById("latest-ratio").textContent = formatNumber(ratio);
  document.getElementById("latest-price").textContent = formatCurrency(price);
  document.getElementById("average-ratio").textContent = formatNumber(average);
  document.getElementById("stddev-ratio").textContent = formatNumber(stddev);
  document.getElementById("observation-count").textContent = count.toLocaleString();
  document.getElementById("source-date").textContent = formatDate(date);
}

function renderTable(rows) {
  const body = document.getElementById("data-table-body");
  const fragment = document.createDocumentFragment();

  body.replaceChildren();

  for (const [date, ratio, price] of rows.slice().reverse()) {
    const row = document.createElement("tr");

    for (const value of [formatDate(date), formatNumber(ratio), formatCurrency(price)]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }

    fragment.appendChild(row);
  }

  body.appendChild(fragment);
}

export async function fetchData() {
  return data;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}
