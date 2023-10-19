//DailyVolChart

<template>
  <div class="chart-container" v-if="dataAvailable">
    <canvas ref="chart"></canvas>
  </div>
  <div v-else>
    Data is not available.
  </div>
</template>
  
<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LogarithmicScale } from 'chart.js';
import axios from 'axios';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LogarithmicScale);
const GRID_COLOR = '#b3b0b0';

export default {
  setup() {
    const chartData = ref([]);
    const labels = ref([]);
    const chart = ref(null);
    const dataAvailable = ref(true);
    let chartInstance = null;


    function findMaxValue(datasets) {
      let maxVal = -Infinity;
      datasets.forEach(dataset => {
        const datasetMax = Math.max(...dataset.data);
        if (datasetMax > maxVal) {
          maxVal = datasetMax;
        }
      });
      return maxVal;
    }
    /*     const data = [
          {
            "name": "Firi",
            "data": [
              { "date": "2023-01-01", "nokVolume": "1877179" },
              { "date": "2023-01-02", "nokVolume": "1234379" },
              { "date": "2023-01-03", "nokVolume": "823179" },
              { "date": "2023-01-04", "nokVolume": "1003923" }
            ]
          },
          {
            "name": "NBX",
            "data": [
              { "date": "2023-01-01", "nokVolume": "1246787" },
              { "date": "2023-01-02", "nokVolume": "946787" },
              { "date": "2023-01-03", "nokVolume": "1146433" },
              { "date": "2023-01-04", "nokVolume": "14346787" }
            ]
          },
          {
            "name": "JuJu",
            "data": [
              { "date": "2023-01-01", "nokVolume": "15597" },
              { "date": "2023-01-02", "nokVolume": "20597" },
              { "date": "2023-01-03", "nokVolume": "10597" },
              { "date": "2023-01-04", "nokVolume": "8597" }
            ]
          },
          {
            "name": "BareBitcoin",
            "data": [
              { "date": "2023-01-01", "nokVolume": "34242" },
              { "date": "2023-01-02", "nokVolume": "12323" },
              { "date": "2023-01-03", "nokVolume": "54342" },
              { "date": "2023-01-04", "nokVolume": "76453" }
            ]
          }
        ]; */

    async function fetchDataFromAPI() {
      try {
        const response = await axios.get('https://kryptopris.no/api/stats/history', { mode: 'no-cors' });
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to get exchange data', error);
        dataAvailable.value = false;
        return [];
      }
    }
    function transformData(rawData) {
      if (!rawData.length) {
        console.error('No data to transform');
        return [];
      }

      labels.value = rawData.map(entry => entry.date);

      const datasets = [];
      const colors = {
        miraiex: '#474aee',
        nbx: '#beed5e',
        bitnord: '#f8f9fa',
        bare_bitcoin: '#FD8002'
      };

      Object.keys(colors).forEach(exchange => {
        const data = rawData.map(day => {
          return day.stats[exchange] && day.stats[exchange].NOK.allTotal || 0;
        });
        datasets.push({
          label: exchange,
          backgroundColor: colors[exchange],
          borderColor: colors[exchange],
          fill: false,
          data
        });
      });



      /*       rawData.forEach(exchange => {
              datasets.push({
                label: exchange.name,
                backgroundColor: colors[exchange.name],
                borderColor: colors[exchange.name],
                fill: false,
                data: exchange.data.map(entry => entry.nokVolume)
              });
            }); */

      return datasets;
    }
    //When API is available, add dataAvailable check snippet from notes.
    onMounted(async () => {
      const apiData = await fetchDataFromAPI();
      chartData.value = transformData(apiData);
      dataAvailable.value = apiData.length > 0;

      const highestValue = findMaxValue(chartData.value);
      const yAxisMax = highestValue * 5;

      const ctx = chart.value.getContext('2d');

      Chart.register({
        id: 'hoverLinePlugin',
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
        }
      });

      const chartConfig = {
        type: 'line',
        data: {
          labels: labels.value,
          datasets: chartData.value
        },
        options: {
          layout: {
            padding: {
              left: 50,
              right: 100
            }
          },
          responsive: true,
          scales: {
            x: {
              grid: {
                //color: BORDER_COLOR,
                //borderColor: BORDER_COLOR,
                borderWidth: 2
              },
              ticks: {
                font: {
                  size: 20
                }
              },
            },
            y: {
              type: 'logarithmic',
              grace: '5%',
              grid: {
                borderWidth: 2
              },
              max: yAxisMax,
              title: {
                display: true,
                text: 'Volum',
                font: {
                  size: 25,
                }
              },
              ticks: {
                callback: function (value) {
                  if (value === 50000000) return '50M';
                  if (value === 25000000) return '25M';
                  if (value === 10000000) return '10M';
                  if (value === 5000000) return '5M';
                  if (value === 1000000) return '1M';
                  if (value === 500000) return '500k';
                  if (value === 100000) return '100k';
                  if (value === 50000) return '50k';
                  if (value === 10000) return '10k';
                  if (value === 5000) return '5k';
                  if (value === 1000) return '1k';
                  return value;
                },
                font: {
                  size: 20
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              align: 'center',
              labels: {
                font: {
                  family: "'Poppins','sans-serif'",
                  size: 20,
                }
              }
            },
            hoverLinePlugin: {},
          },
          onHover: function (_, chartElements) {
            if (chartElements.length > 0) {
              const firstPoint = chartElements[0];
              this.hoverLineX = firstPoint.element.x;
            } else {
              delete this.hoverLineX;
            }
            this.render();
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },

          tooltips: {
            enabled: true,
            mode: 'nearest',
            axis: 'x',
            intersect: false,
            bodyFontSize: 18,
            titleFontSize: 20,
            backgroundColor: GRID_COLOR,
            padding: 10,
            callbacks: {
              label: function (tooltipItem, data) {
                let label = data.labels[tooltipItem.index] || '';
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return `${label}: ${value}`;
              }
            }
          }
        }
      };
      chartInstance = new Chart(ctx, chartConfig);
    });

    watch(chartData, (newVal) => {
      if (chartInstance) {
        chartInstance.data.datasets = newVal;
        chartInstance.update();
      }
    }, { deep: true });

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

    return { chart, dataAvailable };
  }
}
</script>

<style scoped>
.chart-container {
  font-family: Poppins, sans-serif;
  background: #030e19;
  position: relative;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
  padding: 50px 100px 20px 50px;
}

canvas {
  background-color: transparent !important;
  width: 100% !important;
  height: auto !important;
  padding-bottom: 1.5rem !important;
}
</style>