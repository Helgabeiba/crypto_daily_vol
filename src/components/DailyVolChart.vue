//DailyVolChart

<template>
  <div>
    <div class="button-group">
      <button
        :class="{ active: selectedPeriod === '7' }"
        @click="setPeriod('7')"
      >
        7D
      </button>
      <button
        :class="{ active: selectedPeriod === '30' }"
        @click="setPeriod('30')"
      >
        1M
      </button>
      <button
        :class="{ active: selectedPeriod === '90' }"
        @click="setPeriod('90')"
      >
        3M
      </button>
      <button
        :class="{ active: selectedPeriod === '365' }"
        @click="setPeriod('365')"
      >
        12M
      </button>
      <button
        :class="{ active: selectedPeriod === 'YTD' }"
        @click="setPeriod('YTD')"
      >
        YTD
      </button>
      <button
        :class="{ active: selectedPeriod === 'all' }"
        @click="setPeriod('all')"
      >
        Fra start
      </button>
    </div>
    <div class="chart-container" v-if="dataAvailable">
      <canvas ref="chart"></canvas>
    </div>
    <div v-else>Data is not available.</div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  LogarithmicScale,
} from "chart.js";
import axios from "axios";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  LogarithmicScale
);
const GRID_COLOR = "#b3b0b0";

export default {
  setup() {
    const chartData = ref([]);
    const labels = ref([]);
    const chart = ref(null);
    const dataAvailable = ref(true);
    let chartInstance = null;
    const selectedPeriod = ref("all");

    function findMaxValue(datasets) {
      let maxVal = -Infinity;
      datasets.forEach((dataset) => {
        const datasetMax = Math.max(...dataset.data);
        if (datasetMax > maxVal) {
          maxVal = datasetMax;
        }
      });
      return maxVal;
    }

    function findMinValue(datasets) {
      let minVal = Infinity;
      datasets.forEach((dataset) => {
        const datasetMin = Math.min(...dataset.data);
        if (datasetMin < minVal) {
          minVal = datasetMin;
        }
      });
      return minVal;
    }
    async function fetchDataFromAPI(period) {
      const now = new Date();
      let startDate;
      switch (period) {
        case "7":
          startDate = new Date(now.setDate(now.getDate() - 8));
          break;
        case "30":
          startDate = new Date(now.setDate(now.getDate() - 31));
          break;
        case "90":
          startDate = new Date(now.setDate(now.getDate() - 91));
          break;
        case "365":
          startDate = new Date(now.setDate(now.getDate() - 366));
          break;
        case "YTD":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      const params = startDate ? { startDate: startDate.toISOString() } : {};

      try {
        const response = await axios.get(
          "https://kryptopris.no/api/stats/history",
          {
            params: params,
            mode: "no-cors",
          }
        );

        let data = response.data;

        if (startDate) {
          data = data.filter((item) => new Date(item.date) >= startDate);
        }

        console.log(data);
        return data;
      } catch (error) {
        console.error("Failed to get exchange data", error);
        dataAvailable.value = false;
        return [];
      }
    }

    function setPeriod(period) {
      console.log("Setting period to:", period);
      selectedPeriod.value = period;
      fetchDataAndRenderChart();
    }

    async function fetchDataAndRenderChart() {
      const apiData = await fetchDataFromAPI(selectedPeriod.value);
      chartData.value = transformData(apiData);
      dataAvailable.value = apiData.length > 0;
    }

    function transformData(rawData) {
      if (!rawData.length) {
        console.error("No data to transform");
        return [];
      }

      labels.value = rawData
        .map((entry) => {
          const [year, month, day] = entry.date.split("-");
          return `${day}-${month}-${year}`;
        })
        .reverse();

      const datasets = [];
      const colors = {
        miraiex: "#474aee",
        nbx: "#beed5e",
        bitnord: "#f8f9fa",
        bare_bitcoin: "#FD8002",
      };

      const exchangeNameMapping = {
        miraiex: "Firi",
        nbx: "NBX",
        bitnord: "JuJu",
        bare_bitcoin: "Bare Bitcoin",
      };

      Object.keys(colors).forEach((exchange) => {
        const newName = exchangeNameMapping[exchange];
        const data = rawData
          .map((day) => {
            return (
              (day.stats[exchange] && day.stats[exchange].NOK.allTotal) || 0
            );
          })
          .reverse();
        datasets.push({
          label: newName,
          backgroundColor: colors[exchange],
          borderColor: colors[exchange],
          fill: false,
          data,
        });
      });

      return datasets;
    }

    function registerHoverLinePlugin() {
      const hoverLinePlugin = {
        id: "hoverLinePlugin",
        afterDraw: function (chartInstance) {
          if (chartInstance.hoverLineX !== undefined) {
            const ctx = chartInstance.ctx;
            const yTop = chartInstance.scales.y.top;
            const yBottom = chartInstance.scales.y.bottom;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(chartInstance.hoverLineX, yTop);
            ctx.lineTo(chartInstance.hoverLineX, yBottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = GRID_COLOR;
            ctx.stroke();
            ctx.restore();
          }
        },
      };

      Chart.register(hoverLinePlugin);
    }

    function initializeOrUpdateChart() {
      if (chartInstance) {
        chartInstance.data.labels = labels.value;
        chartInstance.data.datasets = chartData.value;
        chartInstance.update();
      } else {
        const highestValue = findMaxValue(chartData.value);
        const yAxisMax = highestValue * 4;
        const lowestValue = findMinValue(chartData.value);
        const yAxisMin = lowestValue;

        const ctx = chart.value.getContext("2d");

        const chartConfig = {
          type: "line",
          data: {
            labels: labels.value,
            datasets: chartData.value,
          },
          options: {
            layout: {
              padding: {
                left: 1,
                right: 4,
              },
            },
            responsive: true,
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
              y: {
                type: "logarithmic",
                grace: "5%",
                grid: {
                  display: false,
                },
                suggestedMax: yAxisMax,
                suggestedMin: yAxisMin,
                min: 100,
                title: {
                  display: true,
                  text: "Volum",
                  font: {
                    size: 15,
                  },
                },
                ticks: {
                  maxTicksLimit: 20,
                  callback: function (value) {
                    const tickValues = [
                      1000, 10000, 100000, 1000000, 10000000, 25000000,
                      50000000, 75000000,
                    ];
                    if (tickValues.includes(value)) {
                      if (value === 75000000) return "75M";
                      if (value === 50000000) return "50M";
                      if (value === 25000000) return "25M";
                      if (value === 10000000) return "10M";
                      if (value === 5000000) return "5M";
                      if (value === 1000000) return "1M";
                      if (value === 500000) return "500k";
                      if (value === 100000) return "100k";
                      if (value === 50000) return "50k";
                      if (value === 10000) return "10k";
                      if (value === 1000) return "1k";
                      if (value === 100) return "100";
                    }
                    return "";
                  },
                  font: {
                    size: 10,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                align: "center",
                labels: {
                  padding: 8,
                  font: {
                    family: "'Poppins','sans-serif'",
                    size: 12,
                  },
                },
              },
              tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('nb-NO', {style: 'decimal', minimumFractionDigits: 0}).format(context.parsed.y) + ' NOK';  // Append 'NOK' to the value
                    }
                    return label;
                }
            }
        },
              hoverLinePlugin: {},
            },
            onHover: function (_, chartElements) {
              const prevHoverLineX = this.hoverLineX;
              if (chartElements.length > 0) {
                const firstPoint = chartElements[0];
                this.hoverLineX = firstPoint.element.x;
              } else {
                delete this.hoverLineX;
              }
              if (this.hoverLineX !== prevHoverLineX) {
                this.render();
              }
            },
            interaction: {
              mode: "nearest",
              axis: "x",
              intersect: false,
            },
          },
        };
        chartInstance = new Chart(ctx, chartConfig);
      }
    }

    registerHoverLinePlugin();

    onMounted(async () => {
      const apiData = await fetchDataFromAPI();
      chartData.value = transformData(apiData);
      dataAvailable.value = apiData.length > 0;
      initializeOrUpdateChart();
    });

    watch(
      chartData,
      (newVal) => {
        if (chartInstance) {
          chartInstance.data.datasets = newVal;
          chartInstance.update();
        }
      },
      { deep: true }
    );

    watch(labels, (newLabels) => {
      if (chartInstance) {
        chartInstance.data.labels = newLabels;
        chartInstance.update();
      }
    }),
      onBeforeUnmount(() => {
        if (chartInstance) {
          chartInstance.destroy();
        }
      });

    return { chart, dataAvailable, setPeriod, selectedPeriod };
  },
};
</script>

<style scoped>
.chart-container {
  font-family: Poppins, sans-serif;
  background: #10151e;
  position: relative;
  margin: 10px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
  padding: 10px 25px 10px 25px;
}

.button-group {
  display: flex;
  justify-content: center;
  background-color: #10151e;
  border-radius: 15px;
  gap: 10px;
  margin: 20px 1px 20px 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}

.button-group button {
  font-family: Poppins, sans-serif;
  font-size: 12px;
  font-weight: 400;
  height: 3em;
  padding: 0px 9px;
  line-height: 0.2;
  margin: 10px 10px 10px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #10151e;
  color: #b3b0b0;
  box-shadow: 1px 1px 1px 0 #050608;
}

.button-group button:active {
  background-color: #ffc108;
  color: #000000;
}

.button-group button.active {
  background-color: #ffc108;
  color: #000000;
}

canvas {
  background-color: transparent !important;
  width: 100% !important;
  height: auto !important;
}
</style>
