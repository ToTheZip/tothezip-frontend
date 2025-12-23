<template>
  <div class="price-chart">
    <Line v-if="chartData" :data="chartData" :options="options" />
    <div v-else class="chart-placeholder">시세 데이터를 불러오는 중...</div>
  </div>
</template>

<script>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default {
  name: "PriceChart",
  components: { Line },
  props: {
    points: { type: Array, default: () => [] },
    mode: { type: String, default: "median" }, // "median" or "avg"
  },
  computed: {
    chartData() {
      if (!this.points?.length) return null;
      const labels = this.points.map((p) => p.date);
      const values =
        this.mode === "avg"
          ? this.points.map((p) => p.avgPrice)
          : this.points.map((p) => p.medianPrice);

      return {
        labels,
        datasets: [
          {
            label: this.mode === "avg" ? "평균(만원)" : "중앙값(만원)",
            data: values,
            tension: 0.25,
          },
        ],
      };
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          y: {
            ticks: {
              callback: (v) => `${v}만`,
            },
          },
        },
      };
    },
  },
};
</script>

<style scoped>
.price-chart {
  height: 180px; /* 원하는 높이 */
}
.chart-placeholder {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 236, 231, 0.3);
  border-radius: 10px;
}
</style>
