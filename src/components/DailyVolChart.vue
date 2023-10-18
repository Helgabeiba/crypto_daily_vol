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

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LogarithmicScale);
const BORDER_COLOR = '#b3b0b0';

export default {
  setup() {
    const chartData = ref([]);
    const labels = ref([]);
    const chart = ref(null);
    const dataAvailable = ref(true);
    let chartInstance = null;

    const data = [
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
    ];
    // TODO: Replace the json above with the API call
    //    return axios.get('API_ENDPOINT')
    //    .then(response => response.data)
    //    .catch(error => console.error('Failed to get exchange data', error));
    function transformData(rawData) {
      labels.value = rawData[0].data.map(entry => entry.date);
      const datasets = [];
      const colors = {
        Firi: '#474aee',
        NBX: '#beed5e',
        JuJu: '#f8f9fa',
        BareBitcoin: '#FD8002'
      };

      rawData.forEach(exchange => {
        datasets.push({
          label: exchange.name,
          backgroundColor: colors[exchange.name],
          borderColor: colors[exchange.name],
          fill: false,
          data: exchange.data.map(entry => entry.nokVolume)
        });
      });

      return datasets;
    }
    //When API is available, add dataAvailable check snippet from notes.

    onMounted(() => {
      chartData.value = transformData(data);
      dataAvailable.value = true;

      const ctx = chart.value.getContext('2d');
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
                color: BORDER_COLOR,
                //borderColor: BORDER_COLOR,
                //borderWidth: 2
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
                color: BORDER_COLOR,
                //borderColor: BORDER_COLOR,
                //borderWidth: 2
              },
              title: {
                display: true,
                text: 'Volum',
                font: {
                  size: 25,
                }
              },
              ticks: {
                maxTicksLimit: 10,
                callback: function (value) {
                  if (value === 1000000) return '1M';
                  if (value === 100000) return '100k';
                  if (value === 10000) return '10k';
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
            }
          },
          tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false,
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
          chartInstance.destroy()
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
  margin: 0;
  border: 0;
  padding: 0;
  min-height: 100vh;
}

canvas {
  background-color: transparent !important;
}
</style>