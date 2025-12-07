<template>
  <footer class="footer">
    <p class="tagline">{{ $t('footer.tagline') }}</p>
    <div class="social-icons">
      <a href="https://www.instagram.com/lem_brace?igsh=MWM0eXhyMDVteHQ2aw%3D%3D&utm_source=qr" target="_blank" class="social-link">
        <IconInstagram :size="24" />
      </a>
      <a href="https://www.tiktok.com/@lem_brace?_t=ZG-8y6xLrApPu5&_r=1" target="_blank" class="social-link">
        <IconTiktok :size="24" />
      </a>
      <a href="https://pin.it/4BkgRmAw0" target="_blank" class="social-link">
        <IconPinterest :size="24" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(180deg, #fceabb 0%, #f8c14d 40%, #d88c00 100%);
  padding: 3rem 2rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f7c471' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.tagline {
  font-family: var(--font-primary);
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 2rem;
}

.social-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.social-link {
  color: #333;
  transition: all 0.3s ease;
  display: inline-block;
}

.social-link svg {
  transition: all 0.3s ease;
}

.social-link:hover svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}
</style>
