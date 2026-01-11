<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <slot name="icon">
          <IconTrendingUp :size="18" />
        </slot>
        {{ title }}
      </h3>
      <div class="month-nav">
        <button class="nav-btn" @click="previousMonth" :title="$t('admin.dashboard.previousMonth')">
          <IconChevronLeft :size="18" />
        </button>
        <span class="month-label">{{ currentMonthLabel }}</span>
        <button class="nav-btn" @click="nextMonth" :disabled="isCurrentMonth" :title="$t('admin.dashboard.nextMonth')">
          <IconChevronRight :size="18" />
        </button>
      </div>
    </div>
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div class="chart-summary">
      <div class="summary-item">
        <span class="summary-label">{{ $t('admin.dashboard.totalForMonth') }}</span>
        <span class="summary-value">{{ formatPrice(monthTotal) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">{{ $t('admin.dashboard.dailyAverage') }}</span>
        <span class="summary-value">{{ formatPrice(dailyAverage) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { formatPrice } from '~/logic/utils';
import IconTrendingUp from '~/components/icon/IconTrendingUp.vue';
import IconChevronLeft from '~/components/icon/IconChevronLeft.vue';
import IconChevronRight from '~/components/icon/IconChevronRight.vue';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
});

const { locale, t } = useI18n();

// Current displayed month
const currentDate = ref(new Date());

const isCurrentMonth = computed(() => {
  const now = new Date();
  return currentDate.value.getMonth() === now.getMonth() && currentDate.value.getFullYear() === now.getFullYear();
});

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' });
});

const previousMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  if (!isCurrentMonth.value) {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
  }
};

// Get days in month
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Calculate daily revenue for the selected month
const dailyRevenue = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const daysInMonth = getDaysInMonth(currentDate.value);

  // Initialize array with 0 for each day
  const revenue = Array(daysInMonth).fill(0);

  // Only count paid orders
  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];

  props.orders.forEach((order) => {
    if (paidStatuses.includes(order.orderStatus)) {
      const orderDate = new Date(order.orderDate);
      if (orderDate.getFullYear() === year && orderDate.getMonth() === month) {
        const day = orderDate.getDate() - 1; // 0-indexed
        revenue[day] += order.totalPrice || 0;
      }
    }
  });

  return revenue;
});

const monthTotal = computed(() => {
  return dailyRevenue.value.reduce((sum, val) => sum + val, 0);
});

const dailyAverage = computed(() => {
  const daysWithData = dailyRevenue.value.filter((v) => v > 0).length || 1;
  return monthTotal.value / daysWithData;
});

// Chart data
const chartData = computed(() => {
  const daysInMonth = getDaysInMonth(currentDate.value);
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return {
    labels,
    datasets: [
      {
        label: t('admin.dashboard.revenue'),
        data: dailyRevenue.value,
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#48bb78',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        title: (items) => {
          const day = items[0].label;
          const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day);
          return date.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'short' });
        },
        label: (item) => formatPrice(item.raw),
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#8b8b8b',
        font: { size: 10 },
        maxTicksLimit: 15,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#8b8b8b',
        font: { size: 10 },
        callback: (value) => '€' + value,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}));
</script>

<style scoped>
.chart-card {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--admin-text);
  margin: 0;
}

.chart-title :deep(svg) {
  color: #48bb78;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: var(--admin-hover-bg);
  border-color: #48bb78;
  color: #48bb78;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.month-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-text);
  min-width: 140px;
  text-align: center;
  text-transform: capitalize;
}

.chart-container {
  height: 250px;
  margin-bottom: 1rem;
}

.chart-summary {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--admin-border);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.summary-value {
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 600;
  color: #48bb78;
}

@media (max-width: 640px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .month-nav {
    width: 100%;
    justify-content: space-between;
  }

  .chart-summary {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
