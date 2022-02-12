import data from "./data.json";

import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

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
          borderWidth: 1,
        },
        {
          label: `Historic Average`,
          data: averageLine,
        },
        {
          label: `1 Standard Deviation above Mean`,
          data: stddevLineAbove,
        },
        {
          label: `2 Standard Deviation above Mean`,
          data: stddevLine2Above,
        },
        {
          label: `1 Standard Deviation below Mean`,
          data: stddevLineBelow,
        },
        {
          label: `2 Standard Deviation below Mean`,
          data: stddevLine2Below,
        },
      ],
    },
  });

  let table = document.createElement("table");
  var tableBody = document.createElement("tbody");
  table.appendChild(tableBody);
  let tr = document.createElement("tr");
  let th1 = document.createElement("th");
  let th2 = document.createElement("th");

  let text1 = document.createTextNode("Date");
  let text2 = document.createTextNode("P/E Ratio");

  th1.appendChild(text1);
  th2.appendChild(text2);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tableBody.appendChild(tr);

  for (const [date, ratio] of dataset) {
    let tr = document.createElement("tr");
    tableBody.appendChild(tr);

    let td1 = document.createElement("td");
    let td2 = document.createElement("td");

    let text1 = document.createTextNode(date);
    let text2 = document.createTextNode(ratio);

    td1.appendChild(text1);
    td2.appendChild(text2);
    tr.appendChild(td1);
    tr.appendChild(td2);
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
