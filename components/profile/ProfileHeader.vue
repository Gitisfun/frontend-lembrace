<template>
  <div class="profile-header">
    <div class="profile-avatar">
      <span class="avatar-initials">{{ initials }}</span>
    </div>
    <div class="profile-info">
      <h1 class="profile-name">{{ fullName }}</h1>
      <p class="profile-email">{{ email }}</p>
      <span v-if="status" class="profile-status" :class="status">
        {{ status }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  initials: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-family: var(--font-primary);
  font-size: 1.75rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.profile-email {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-light);
  margin-bottom: 0.5rem;
}

.profile-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.profile-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.profile-status.inactive {
  background: #ffebee;
  color: #c62828;
}

.profile-status.pending {
  background: #fff3e0;
  color: #ef6c00;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .profile-avatar {
    width: 70px;
    height: 70px;
  }

  .avatar-initials {
    font-size: 1.5rem;
  }
}
</style>
