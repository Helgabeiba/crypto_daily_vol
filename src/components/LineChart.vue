// LineChart.vue
<template>
    <div>
      <canvas ref="chart"></canvas>
    </div>
  </template>
  
<script>
import { ref, onMounted, watch } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
// import { generatePastNDays } from '@/utils/dateUtils';

export default {
    props: ['chartData', 'labels'],
  
    setup(props) {
      const chart = ref(null);
      let chartInstance = null;
    // const labels = generatePastNDays(4);  // This will be our x-axis labels
  
      Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);
  
      watch(() => props.chartData, (newVal) => {
        if (chartInstance) {
          chartInstance.data.datasets = newVal;  // Only update datasets from prop
          chartInstance.update();
        }
      }, { deep: true });

      watch(() => props.labels, (newLabels) => {
        if (chartInstance) {
            chartInstance.data.labels = newLabels;
            chartInstance.update();
        }
    });

  
      onMounted(() => {
        const ctx = chart.value.getContext('2d');
        const chartConfig = {
            type: 'line',
          data: {
            labels: props.labels,
            datasets: props.chartData
          },
          options: {
            responsive: true,
           // maintainAspectRatio: false
          }
        }
        console.log("Chart Configuration:", chartConfig);
        chartInstance = new Chart(ctx, chartConfig);
      });
  
      return { chart };
    }
}
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: auto !important;
}
</style>