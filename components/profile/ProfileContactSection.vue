<template>
  <div class="profile-section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('auth.profile.contact') }}</h2>
      <button v-if="!isEditing" @click="startEditing" class="edit-btn">
        {{ $t('auth.profile.edit') }}
      </button>
    </div>

    <div v-if="isEditing" class="edit-form">
      <InputField id="phone" v-model="phoneValue" :label="$t('payment.form.phone')" type="tel" :placeholder="$t('auth.profile.phonePlaceholder')" />
      <div class="form-actions">
        <button @click="cancel" class="cancel-btn" :disabled="isSaving">{{ $t('auth.profile.cancel') }}</button>
        <button @click="save" class="save-btn" :disabled="isSaving">
          {{ isSaving ? $t('auth.profile.saving') : $t('auth.profile.save') }}
        </button>
      </div>
    </div>

    <div v-else class="details-grid">
      <div class="detail-item full-width">
        <span class="detail-label">{{ $t('payment.form.phone') }}</span>
        <span class="detail-value">{{ phone || $t('auth.profile.notProvided') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  phone: {
    type: String,
    default: '',
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = ref(false);
const phoneValue = ref('');

const startEditing = () => {
  phoneValue.value = props.phone || '';
  isEditing.value = true;
};

const cancel = () => {
  isEditing.value = false;
  emit('cancel');
};

const save = () => {
  emit('save', phoneValue.value);
};

// Close edit mode when save completes successfully
watch(
  () => props.isSaving,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      isEditing.value = false;
    }
  }
);

defineExpose({
  closeEditMode: () => {
    isEditing.value = false;
  },
});
</script>

<style scoped>
.profile-section {
  margin: 0.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-title {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  font-weight: 600;
}

.edit-btn {
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: var(--color-gold);
  color: white;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-weight: 500;
}

.detail-value {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: 1px solid #ccc;
  color: var(--color-text-light);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  border-color: #999;
  color: var(--color-text);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn {
  padding: 0.6rem 1.25rem;
  background: var(--gradient-gold);
  border: none;
  color: white;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
