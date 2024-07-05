import data from "./data.json";
import standardAndPoorData from "./inflation-adjusted-sp-500.json";

import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

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
  let data = await fetchData();

  let dates = [];
  let ratios = [];

  const dataset = data.data;

  dataset.sort((a, b) => a[0].localeCompare(b[0]));

  for (const [date, ratio] of dataset) {
    dates.push(date);
    ratios.push(ratio);
  }

  let sAndPData = [];

  for (const [_, value] of standardAndPoorData.data.reverse()) {
    sAndPData.push(value);
  }

  document.getElementById("myChart").remove();
  let canvas = document.createElement("canvas");
  canvas.setAttribute("id", "myChart");
  document.body.appendChild(canvas);

  const ctx = document.getElementById("myChart");
  let [stddev, average] = getStats(ratios);

  // create a line for the historic average
  let averageLine = [];
  let stddevLineAbove = [];
  let stddevLineBelow = [];
  let stddevLine2Above = [];
  let stddevLine2Below = [];

  for (let i = 0; i < ratios.length; i++) {
    averageLine.push(average);
    stddevLineAbove.push(average + stddev);
    stddevLineBelow.push(average - stddev);
    stddevLine2Above.push(average + stddev + stddev);
    stddevLine2Below.push(average - stddev - stddev);
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Shiller P/E Ratio`,
          data: ratios,
          yAxisID: "A",
          borderWidth: 1,
          backgroundColor: "rgba(20, 10, 220, 0.6)",
        },
        {
          label: `S&P Prices`,
          data: sAndPData,
          yAxisID: "B",
          borderWidth: 1,
          backgroundColor: "rgba(220, 10, 20, 0.6)",
        },
        {
          label: `Historic Average`,
          data: averageLine,
          backgroundColor: "rgba(10, 10, 10, 0.25)",
        },
        {
          label: `1 Standard Deviation above Mean`,
          data: stddevLineAbove,
          backgroundColor: "rgba(180, 250, 200, 0.1)",
        },
        {
          label: `2 Standard Deviation above Mean`,
          data: stddevLine2Above,
          backgroundColor: "rgba(200, 10, 10, 0.05)",
        },
        {
          label: `1 Standard Deviation below Mean`,
          data: stddevLineBelow,
          backgroundColor: "rgba(180, 250, 200, 0.1)",
        },
        {
          label: `2 Standard Deviation below Mean`,
          data: stddevLine2Below,
          backgroundColor: "rgba(200, 10, 10, 0.05)",
        },
      ],
    },
    options: {
      scales: {
        A: {
          type: "linear",
          position: "left",
        },
        B: {
          type: "linear",
          position: "right",
          ticks: {
            max: 1,
            min: 0,
          },
        },
      },
    },
  });

  let table = document.createElement("table");
  var tableBody = document.createElement("tbody");
  table.appendChild(tableBody);
  let tr = document.createElement("tr");
  let th1 = document.createElement("th");
  let th2 = document.createElement("th");
  let th3 = document.createElement("th");

  let text1 = document.createTextNode("Date");
  let text2 = document.createTextNode("P/E Ratio");
  let text3 = document.createTextNode("Inflation Adjusted S&P Price");

  th1.appendChild(text1);
  th2.appendChild(text2);
  th3.appendChild(text3);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tableBody.appendChild(tr);

  let reversedDataset = [...dataset];
  reversedDataset.reverse();
  let reversedSAndPData = [...sAndPData];
  reversedSAndPData.reverse();

  for (let i = 0; i < reversedDataset.length; i++) {
    let date = reversedDataset[i][0];
    let ratio = reversedDataset[i][1];
    let price = reversedSAndPData[i];
    let tr = document.createElement("tr");
    tableBody.appendChild(tr);

    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");

    let text1 = document.createTextNode(date);
    let text2 = document.createTextNode(ratio);
    let text3 = document.createTextNode(price);

    td1.appendChild(text1);
    td2.appendChild(text2);
    td3.appendChild(text3);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
  }
  let summary = document.createElement("summary");
  summary.textContent = "Table";
  let details = document.createElement("details");
  details.appendChild(table);
  details.appendChild(summary);
  document.body.appendChild(details);
}

export async function fetchData() {
  return data;
}
