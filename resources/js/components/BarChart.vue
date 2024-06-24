<template>
    <div>
      <canvas ref="barChart" width="400" height="400"></canvas>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto'; // Import Chart.js
  
  export default {
    props: {
      countries: {
        type: Array,
        default: () => []
      }
    },
    mounted() {
      this.renderChart();
    },
    watch: {
      countries: {
        handler() {
          this.renderChart();
        },
        deep: true
      }
    },
    methods: {
      renderChart() {
        // Extract labels (country names) and data (population sizes) from countries array
        const labels = this.countries.map(country => country.name.common);
        const data = this.countries.map(country => country.population);
  
        // Destroy any existing chart to prevent duplicates
        if (this.chart) {
          this.chart.destroy();
        }
  
        // Render new chart
        this.chart = new Chart(this.$refs.barChart.getContext('2d'), {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Population',
              data: data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)', // Adjust as needed
              borderColor: 'rgba(54, 162, 235, 1)', // Adjust as needed
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return tooltipItem.formattedValue;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Population'
                }
              }
            }
          }
        });
      }
    },
    beforeDestroy() {
      if (this.chart) {
        this.chart.destroy();
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any scoped styles here if necessary */
  </style>
  