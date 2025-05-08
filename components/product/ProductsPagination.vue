<template>
  <div v-if="totalPages > 1" class="pagination">
    <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1" class="pagination-button pagination-button-prev">
      <span class="button-icon">‹</span>
      <span class="button-text">Previous</span>
    </button>

    <div class="pagination-numbers">
      <div class="desktop-pages">
        <button v-for="page in visiblePages" :key="page" @click="handlePageChange(page)" :class="['pagination-number', { active: page === currentPage }]">
          {{ page }}
        </button>
      </div>
      <div class="mobile-pages">
        <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)" class="pagination-number">
          {{ currentPage - 1 }}
        </button>
        <button @click="handlePageChange(currentPage)" class="pagination-number active">
          {{ currentPage }}
        </button>
        <button v-if="currentPage < totalPages" @click="handlePageChange(currentPage + 1)" class="pagination-number">
          {{ currentPage + 1 }}
        </button>
      </div>
    </div>

    <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-button pagination-button-next">
      <span class="button-text">Next</span>
      <span class="button-icon">›</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['page-change']);

const handlePageChange = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page);
  }
};

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  grid-column: 1 / -1;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.desktop-pages {
  display: flex;
  gap: 0.5rem;
}

.mobile-pages {
  display: none;
}

.pagination-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 2.8rem;
  min-height: 2.8rem;
  justify-content: center;
}

.pagination-button:hover:not(:disabled) {
  border-color: var(--color-gold);
  color: var(--color-gold);
  transform: translateY(-1px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-number {
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-size: 1.1rem;
}

.pagination-number:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
  transform: translateY(-1px);
}

.pagination-number.active {
  background-color: var(--color-gold);
  color: white;
  border-color: var(--color-gold);
}

.button-icon {
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 300;
}

.button-text {
  display: inline;
}

@media (max-width: 768px) {
  .pagination {
    padding: 1.5rem;
    gap: 0.5rem;
  }

  .desktop-pages {
    display: none;
  }

  .mobile-pages {
    display: flex;
    gap: 0.5rem;
  }

  .pagination-button {
    padding: 0.5rem;
    min-width: 2.8rem;
    min-height: 2.8rem;
    justify-content: center;
  }

  .button-text {
    display: none;
  }

  .pagination-number {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .pagination {
    padding: 1rem;
    gap: 0.25rem;
  }

  .pagination-button {
    padding: 0.4rem;
    min-width: 2.6rem;
    min-height: 2.6rem;
  }

  .pagination-number {
    width: 2.6rem;
    height: 2.6rem;
    font-size: 1rem;
  }
}
</style>
