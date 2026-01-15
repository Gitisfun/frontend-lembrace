<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <h1 class="privacy-title">{{ $t('privacy.title') }}</h1>
      <p class="privacy-updated">{{ $t('privacy.lastUpdated') }}: {{ lastUpdated }}</p>

      <!-- Introduction -->
      <section class="privacy-section">
        <p>{{ $t('privacy.intro') }}</p>
      </section>

      <!-- Who We Are -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.whoWeAre.title') }}</h2>
        <p>{{ $t('privacy.whoWeAre.content') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.whoWeAre.company') }}:</strong> L'embrace</li>
          <li><strong>{{ $t('privacy.whoWeAre.email') }}:</strong> info@lembrace.be</li>
          <li><strong>{{ $t('privacy.whoWeAre.website') }}:</strong> www.lembrace.be</li>
        </ul>
      </section>

      <!-- What Data We Collect -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.dataCollected.title') }}</h2>
        <p>{{ $t('privacy.dataCollected.intro') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.dataCollected.identity') }}:</strong> {{ $t('privacy.dataCollected.identityDesc') }}</li>
          <li><strong>{{ $t('privacy.dataCollected.contact') }}:</strong> {{ $t('privacy.dataCollected.contactDesc') }}</li>
          <li><strong>{{ $t('privacy.dataCollected.transaction') }}:</strong> {{ $t('privacy.dataCollected.transactionDesc') }}</li>
          <li><strong>{{ $t('privacy.dataCollected.technical') }}:</strong> {{ $t('privacy.dataCollected.technicalDesc') }}</li>
        </ul>
      </section>

      <!-- How We Use Your Data -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.howWeUse.title') }}</h2>
        <p>{{ $t('privacy.howWeUse.intro') }}</p>
        <ul>
          <li>{{ $t('privacy.howWeUse.purpose1') }}</li>
          <li>{{ $t('privacy.howWeUse.purpose2') }}</li>
          <li>{{ $t('privacy.howWeUse.purpose3') }}</li>
          <li>{{ $t('privacy.howWeUse.purpose4') }}</li>
          <li>{{ $t('privacy.howWeUse.purpose5') }}</li>
        </ul>
      </section>

      <!-- Legal Basis -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.legalBasis.title') }}</h2>
        <p>{{ $t('privacy.legalBasis.intro') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.legalBasis.contract') }}:</strong> {{ $t('privacy.legalBasis.contractDesc') }}</li>
          <li><strong>{{ $t('privacy.legalBasis.consent') }}:</strong> {{ $t('privacy.legalBasis.consentDesc') }}</li>
          <li><strong>{{ $t('privacy.legalBasis.legitimate') }}:</strong> {{ $t('privacy.legalBasis.legitimateDesc') }}</li>
          <li><strong>{{ $t('privacy.legalBasis.legal') }}:</strong> {{ $t('privacy.legalBasis.legalDesc') }}</li>
        </ul>
      </section>

      <!-- Data Sharing -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.dataSharing.title') }}</h2>
        <p>{{ $t('privacy.dataSharing.intro') }}</p>
        <ul>
          <li>{{ $t('privacy.dataSharing.payment') }}</li>
          <li>{{ $t('privacy.dataSharing.shipping') }}</li>
          <li>{{ $t('privacy.dataSharing.hosting') }}</li>
        </ul>
        <p>{{ $t('privacy.dataSharing.noSell') }}</p>
      </section>

      <!-- Data Retention -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.retention.title') }}</h2>
        <p>{{ $t('privacy.retention.content') }}</p>
      </section>

      <!-- Your Rights -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.rights.title') }}</h2>
        <p>{{ $t('privacy.rights.intro') }}</p>
        <ul>
          <li><strong>{{ $t('privacy.rights.access') }}:</strong> {{ $t('privacy.rights.accessDesc') }}</li>
          <li><strong>{{ $t('privacy.rights.rectification') }}:</strong> {{ $t('privacy.rights.rectificationDesc') }}</li>
          <li><strong>{{ $t('privacy.rights.erasure') }}:</strong> {{ $t('privacy.rights.erasureDesc') }}</li>
          <li><strong>{{ $t('privacy.rights.restriction') }}:</strong> {{ $t('privacy.rights.restrictionDesc') }}</li>
          <li><strong>{{ $t('privacy.rights.portability') }}:</strong> {{ $t('privacy.rights.portabilityDesc') }}</li>
          <li><strong>{{ $t('privacy.rights.objection') }}:</strong> {{ $t('privacy.rights.objectionDesc') }}</li>
        </ul>
        <p>{{ $t('privacy.rights.contact') }}</p>
      </section>

      <!-- Cookies -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.cookies.title') }}</h2>
        <p>{{ $t('privacy.cookies.content') }}</p>
      </section>

      <!-- Security -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.security.title') }}</h2>
        <p>{{ $t('privacy.security.content') }}</p>
      </section>

      <!-- Changes -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.changes.title') }}</h2>
        <p>{{ $t('privacy.changes.content') }}</p>
      </section>

      <!-- Contact -->
      <section class="privacy-section">
        <h2>{{ $t('privacy.contact.title') }}</h2>
        <p>{{ $t('privacy.contact.content') }}</p>
        <p><strong>{{ $t('privacy.whoWeAre.email') }}:</strong> info@lembrace.be</p>
      </section>

      <div class="privacy-back">
        <NuxtLink to="/" class="back-link">
          ← {{ $t('privacy.backHome') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();

const lastUpdated = computed(() => {
  const date = new Date('2026-01-13');
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// SEO Meta
useSeoMeta({
  title: () => `${t('privacy.title')} | L'embrace`,
  description: () => t('privacy.seoDescription'),
});
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--gradient-gold-radial, linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%));
  padding: 2rem;
}

.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.privacy-title {
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--color-text, #2c2c2c);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.privacy-updated {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.875rem;
  color: var(--color-text-muted, #6b6b6b);
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.privacy-section {
  margin-bottom: 2rem;
}

.privacy-section h2 {
  font-family: var(--font-heading, 'Cormorant Garamond', serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text, #2c2c2c);
  margin: 0 0 1rem 0;
}

.privacy-section p {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.95rem;
  color: var(--color-text, #2c2c2c);
  line-height: 1.7;
  margin: 0 0 1rem 0;
}

.privacy-section ul {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.95rem;
  color: var(--color-text, #2c2c2c);
  line-height: 1.7;
  padding-left: 1.5rem;
  margin: 0 0 1rem 0;
}

.privacy-section li {
  margin-bottom: 0.5rem;
}

.privacy-section strong {
  color: var(--color-gold, #d4a762);
}

.privacy-back {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.back-link {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 0.9rem;
  color: var(--color-gold, #d4a762);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.back-link:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .privacy-page {
    padding: 1rem;
  }

  .privacy-container {
    padding: 1.5rem;
  }

  .privacy-title {
    font-size: 2rem;
  }

  .privacy-section h2 {
    font-size: 1.25rem;
  }
}
</style>
