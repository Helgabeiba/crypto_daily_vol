//DailyVolChart

<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>
  
<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend);


export default {
  setup() {
    const chartData = ref([]);
    const labels = ref([]);
    const chart = ref(null);
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
        "name": "Bitnord",
        "data": [
          { "date": "2023-01-01", "nokVolume": "15597" },
          { "date": "2023-01-02", "nokVolume": "20597" },
          { "date": "2023-01-03", "nokVolume": "10597" },
          { "date": "2023-01-04", "nokVolume": "8597" }
        ]
      },
      {
        "name": "NewExchange",
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
        Firi: 'rgba(75, 192, 192, 1)',
        NBX: 'rgba(255, 99, 132, 1)',
        Bitnord: 'rgba(255, 205, 86, 1)',
        NewExchange: 'rgba(128, 0, 128, 1)'
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

    onMounted(() => {
      chartData.value = transformData(data);

      const ctx = chart.value.getContext('2d');
      const chartConfig = {
        type: 'line',
        data: {
          labels: labels.value,
          datasets: chartData.value
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              align: 'center'
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
      if(chartInstance) {
        chartInstance.destroy()
  }});

    return { chart };
  }
}
</script>

<style scoped>
.chart-container {
  font-family: Poppins, sans-serif;
  position: relative;
  width: 80vw;
  height: 60vh;
  margin: 0 auto;
}
canvas {
  background-color: #f5f5f5;
}
</style>