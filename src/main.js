import { updateChart } from "./utils.js";

import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

document.addEventListener("DOMContentLoaded", () => {
  updateChart();
});
