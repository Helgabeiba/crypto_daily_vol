// CryptoVolumeChart.vue
// Fetching and date manipulation functions
// data prep

<template>
    <div>
      <LineChart :chartData="chartData" :labels="labels" />
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import LineChart from './LineChart.vue';
  import { generatePastNDays } from '../utils/dateUtils.js';
  // import axios from 'axios';
  
  export default {
    components: {
      LineChart
    },
  
    setup() {
      const chartData = ref([]);
      const labels = ref([]);
  
      function fetchExchangeData() {
        // Mock data -- replace with API call
        return Promise.resolve({
          Firi: [100, 105, 102, 108],
          NBX: [90, 93, 92, 88],
          Bitnord: [80, 81, 83, 82]
        
        // API call
    //    return axios.get('API_ENDPOINT')
    //    .then(response => response.data)
    //    .catch(error => console.error('Failed to get exchange data', error));
        });
      }
  
      onMounted(() => {
        labels.value = generatePastNDays(4); 
        console.log("Labels Generated: ", labels.value);
  
        fetchExchangeData().then(data => {
            console.log("Data Fetched: ", data);
          const datasets = [];
          const colors = {
            Firi: 'rgba(75, 192, 192, 1)',
            NBX: 'rgba(255, 99, 132, 1)',
            Bitnord: 'rgba(255, 205, 86, 1)'
          };
  
          for (const exchange in data) {
            datasets.push({
              label: exchange,
              backgroundColor: colors[exchange],
              borderColor: colors[exchange],
              fill: false,
              data: data[exchange]
            });
          }
          console.log("Datasets Formed:", datasets);
  
          chartData.value = datasets;
        });
      });
  
      return { chartData, labels };
    }
  }
  </script>