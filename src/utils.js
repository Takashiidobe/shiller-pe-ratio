import data from "./data.json";
import { Chart } from "chart.js";

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
