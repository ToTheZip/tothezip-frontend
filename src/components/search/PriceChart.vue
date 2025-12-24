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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
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

      const labels = this.points.map((p) => {
        const dateStr = p.date || "";
        const year = dateStr.split("-")[0] || dateStr.substring(0, 4);
        return year;
      });

      const values = this.points.map((p) => {
        const raw = this.mode === "avg" ? p.avgPrice : p.medianPrice;
        return this.toEok(raw);
      });

      return {
        labels,
        datasets: [
          {
            label: this.mode === "avg" ? "평균 시세" : "중앙값 시세",
            data: values,
            tension: 0.35,
            borderWidth: 2.5,
            borderColor: "#B88764",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, "rgba(184, 135, 100, 0.25)");
              gradient.addColorStop(0.5, "rgba(184, 135, 100, 0.12)");
              gradient.addColorStop(1, "rgba(184, 135, 100, 0)");
              return gradient;
            },
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#B88764",
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 3,
            fill: true,
          },
        ],
      };
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 5,
            left: 0,
            right: 10,
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(90, 74, 66, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            titleFont: {
              family: "Pretendard, sans-serif",
              size: 11,
              weight: "500",
            },
            bodyFont: {
              family: "Pretendard, sans-serif",
              size: 14,
              weight: "700",
            },
            padding: 14,
            cornerRadius: 10,
            displayColors: false,
            borderColor: "rgba(184, 135, 100, 0.3)",
            borderWidth: 1,
            callbacks: {
              title: (items) => items[0]?.label || "",
              label: (ctx) => this.formatEok(ctx.parsed.y),
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              font: {
                family: "Pretendard, sans-serif",
                size: 10,
                weight: "500",
              },
              color: "#9E8A7F",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 4,
              padding: 8,
            },
          },
          y: {
            beginAtZero: false,
            grace: "5%",
            grid: {
              color: "rgba(184, 135, 100, 0.08)",
              drawBorder: false,
              lineWidth: 1,
            },
            ticks: {
              font: {
                family: "Pretendard, sans-serif",
                size: 9,
                weight: "500",
              },
              color: "#9E8A7F",
              padding: 6,
              callback: (v) => this.formatEok(v),
              maxTicksLimit: 4,
            },
          },
        },
        animation: {
          duration: 1200,
          easing: "easeInOutCubic",
        },
      };
    },
  },
};
</script>

<style scoped>
.price-chart {
  height: 200px;
  padding: 16px 14px 12px;
  background: linear-gradient(145deg, #fffcfa 0%, #faf6f3 100%);
  border-radius: 16px;
  border: 1px solid rgba(184, 135, 100, 0.15);
  box-shadow: 0 2px 8px rgba(184, 135, 100, 0.08);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fffcfa 0%, #faf6f3 100%);
  border-radius: 16px;
  border: 1px solid rgba(184, 135, 100, 0.15);
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #9e8a7f;
}
</style>
