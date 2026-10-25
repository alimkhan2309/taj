<script setup lang="ts">
// Hot-intent page: short, low-friction. Submission target is a placeholder until the form backend is chosen.
const form = reactive({ name: '', email: '', phone: '', guests: '', city: '', service: '' })
const sent = ref(false)
function submit() { sent.value = true } // TODO: POST to the form endpoint (Formspree / Resend / Netlify Forms)
</script>

<template>
  <section class="section section--surface" id="contact">
    <div class="container">
      <SectionHeader overline="Contact us" title="Contact Us" subtext="Fill up the form and our team will get back to you within 24 hours." />

      <div class="contact">
        <div class="contact__info">
          <div><h4>Office location</h4><p>Opposite Raj Olympia, 401 Sakar Complex, Bhatar Road, near Mangaldeep Apartment, Surat, Gujarat 395001, India</p></div>
          <div><h4>Office time</h4><p>Monday – Saturday<br>10:30AM – 8:30PM</p></div>
          <div><h4>Contact info</h4><p>hello@email.com<br>+91 95581 94459</p></div>
        </div>

        <form class="contact__form" @submit.prevent="submit">
          <label class="field"><input v-model="form.name" required placeholder=" " autocomplete="name"><span class="overline">Name</span></label>
          <div class="contact__row">
            <label class="field"><input v-model="form.email" required type="email" placeholder=" " autocomplete="email"><span class="overline">Email</span></label>
            <label class="field"><input v-model="form.phone" type="tel" placeholder=" " autocomplete="tel"><span class="overline">Phone number</span></label>
          </div>
          <div class="contact__row">
            <label class="field"><input v-model="form.guests" placeholder=" "><span class="overline">Guest count</span></label>
            <label class="field"><input v-model="form.city" placeholder=" "><span class="overline">Venue city</span></label>
          </div>
          <label class="field">
            <select v-model="form.service" required>
              <option value="" disabled />
              <option>Wedding</option><option>Film</option><option>Pre-wedding</option><option>Other</option>
            </select>
            <span class="overline">Select your service</span>
          </label>
          <BaseButton type="submit">{{ sent ? 'Thank you' : 'Send a brief' }}</BaseButton>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.contact {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3xl);
  &__info { display: grid; gap: var(--space-xl); align-content: start; p { margin-top: var(--space-xs); color: var(--color-text-secondary); } }
  &__form { display: grid; gap: var(--space-xl); align-content: start; }
  &__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
}

// Underline field, floating label, square, cyan 2px bottom border on focus.
.field {
  position: relative; display: block;
  input, select { width: 100%; padding: var(--space-md) var(--space-2xs) var(--space-xs); background: transparent; border: 0; border-bottom: 1px solid var(--color-border-strong); font: inherit; color: var(--color-text-primary); border-radius: 0; outline: none; appearance: none; }
  input:focus, select:focus { border-bottom: 2px solid var(--color-accent-brand); padding-bottom: calc(var(--space-xs) - 1px); }
  span { position: absolute; left: var(--space-2xs); top: var(--space-md); color: var(--color-text-muted); pointer-events: none; transition: transform 280ms var(--ease-out), color 280ms; transform-origin: left top; }
  input:focus + span, input:not(:placeholder-shown) + span, select:focus + span, select:valid + span { transform: translateY(-1.1rem) scale(0.85); color: var(--color-text-secondary); }
}

@media (width <= 900px) { .contact { grid-template-columns: 1fr; } }
@media (width <= 560px) { .contact__row { grid-template-columns: 1fr; } }
</style>
