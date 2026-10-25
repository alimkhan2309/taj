<template>
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <p class="footer__tag">A studio that captures families' milestones — weddings, films, and the days in between.</p>
        <p class="footer__copy">© 2026 The Taj Studio. All rights reserved.</p>
      </div>

      <nav class="footer__col" aria-label="Company">
        <h5 class="overline">Company</h5>
        <NuxtLink to="/about">About</NuxtLink>
        <NuxtLink to="/services">Services</NuxtLink>
        <NuxtLink to="/case-studies">Case Studies</NuxtLink>
        <NuxtLink to="/portfolio/photos">Gallery</NuxtLink>
      </nav>

      <nav class="footer__col" aria-label="Social">
        <h5 class="overline">Follow us</h5>
        <a href="https://instagram.com" rel="noopener" target="_blank">Instagram</a>
        <a href="https://youtube.com" rel="noopener" target="_blank">YouTube</a>
        <a href="https://facebook.com" rel="noopener" target="_blank">Facebook</a>
        <a href="https://behance.net" rel="noopener" target="_blank">Behance</a>
      </nav>

      <nav class="footer__col" aria-label="Legal">
        <h5 class="overline">Legal</h5>
        <NuxtLink to="/terms">Terms of Use</NuxtLink>
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        <NuxtLink to="/cookies">Cookies</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: var(--color-surface-inverse);
  color: var(--color-text-on-dark);
  padding-block: var(--space-4xl);

  &__grid { display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: var(--gutter); }
  &__brand { display: grid; gap: var(--space-lg); align-content: space-between; }
  &__tag { max-width: 360px; color: var(--color-text-on-dark-muted); }
  &__copy { font-size: var(--text-body-sm); color: var(--color-text-on-dark-muted); }
  &__col { display: grid; gap: var(--space-sm); align-content: start;
    h5 { margin: 0 0 var(--space-xs); color: var(--color-text-on-dark); }
    a { color: var(--color-text-on-dark-muted); transition: color 280ms; &:hover { color: var(--color-accent-brand); } } }
}

@media (width <= 900px) {
  .footer__grid { grid-template-columns: 1fr 1fr; }
  .footer__brand { grid-column: 1 / -1; }
}
</style>
