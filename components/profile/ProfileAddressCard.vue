<template>
  <div class="address-card">
    <div class="address-content">
      <p class="address-line">
        {{ address.street }} {{ address.house }}<span v-if="address.box">, {{ address.box }}</span>
      </p>
      <p class="address-line">{{ address.postalcode }} {{ address.city }}</p>
      <p class="address-line">{{ countryLabel }}</p>
    </div>
    <div class="address-actions">
      <button @click="$emit('edit', address)" class="edit-btn-small">{{ $t('auth.profile.edit') }}</button>
      <button @click="$emit('delete', address)" class="delete-btn-small">{{ $t('auth.profile.deleteAddress') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  address: {
    type: Object,
    required: true,
  },
  countryOptions: {
    type: Array,
    required: true,
  },
});

defineEmits(['edit', 'delete']);

const countryLabel = computed(() => {
  const country = props.countryOptions.find((c) => c.value === props.address.country);
  return country ? country.label : props.address.country;
});
</script>

<style scoped>
.address-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.address-content {
  flex: 1;
}

.address-line {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: center;
}

.edit-btn-small,
.delete-btn-small {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn-small {
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
}

.edit-btn-small:hover {
  background: var(--color-gold);
  color: white;
}

.delete-btn-small {
  background: transparent;
  border: 1px solid #e53e3e;
  color: #e53e3e;
}

.delete-btn-small:hover {
  background: #e53e3e;
  color: white;
}

@media (max-width: 480px) {
  .address-card {
    flex-direction: column;
  }

  .address-actions {
    flex-direction: column;
    width: 100%;
  }

  .edit-btn-small,
  .delete-btn-small {
    width: 100%;
    text-align: center;
  }
}
</style>
