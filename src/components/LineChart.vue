<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

export default {
  name: 'LineChart',

  setup() {
      const chart = ref(null);

      // Register the required controllers, scales, and elements for the line chart
      Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);

      onMounted(() => {
          const ctx = chart.value.getContext('2d');
          new Chart(ctx, {
              type: 'line',
              data: {
                  labels: ['Dagens', 'Gårdagens', 'osv', 'osv'],
                  datasets: [
                      {
                          label: 'Volum',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          fill: false,
                          data: [40, 20, 12, 80]
                      },
                      {
                          label: 'Volum2',
                          backgroundColor: 'rgba(255, 99, 132, 0.2)',
                          borderColor: 'rgba(255, 99, 132, 1)',
                          fill: false,
                          data: [45, 30, 14, 65]
                      },
                      {
                          label: 'Volum3',
                          backgroundColor: 'rgba(255, 205, 86, 0.2)',
                          borderColor: 'rgba(255, 205, 86, 1)',
                          fill: false,
                          data: [50, 25, 18, 70]
                      }
                  ]
              },
              options: {
                  responsive: true
              }
          });
      });

      return { chart };
  }
}
</script>

<style scoped>
canvas {
  width: 600px;
  height: 400px;
}
</style>
