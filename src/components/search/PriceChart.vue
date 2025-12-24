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
    mode: { type: String, default: "avg" }, // "median" | "avg"
  },
  methods: {
    toEok(manWon) {
      const n = Number(manWon);
      if (!Number.isFinite(n)) return null;
      return n / 10;
    },
    formatEok(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return "-";

      if (n < 1) return `${n.toFixed(2)}억`;
      if (n < 10) return `${n.toFixed(1)}억`;
      return `${n.toFixed(0)}억`;
    },
  },
  computed: {
    chartData() {
      if (!this.points?.length) return null;

      const labels = this.points.map((p) => p.date);

      const values = this.points.map((p) => {
        const raw = this.mode === "avg" ? p.avgPrice : p.medianPrice;
        return this.toEok(raw);
      });

      return {
        labels,
        datasets: [
          {
            label: this.mode === "avg" ? "평균(억)" : "중앙값(억)",
            data: values,
            tension: 0.25,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      };
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => this.formatEok(ctx.parsed.y),
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => this.formatEok(v),
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
  height: 180px;
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
