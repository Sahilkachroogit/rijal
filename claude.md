# claude.md — Build Instructions for Rijal.in
> For any Claude instance building pages or workers for this project.
> Always read `architecture.md` first, then this file, before writing any code.

---

## Role & Context

You are building the remaining pages and Cloudflare Workers for **Rijal.in**, a premium Muslim grooming & apparel brand from Kashmir, India. The home page (`index.html`) already exists and is the **design bible** — every page you create must match it in visual fidelity, animation style, code structure, and brand voice.

**Owner:** Abdul Hanan, CEO, Baramulla J&K  
**Contact:** +91-9103998116 · rijalstore1212@gmail.com  
**WhatsApp:** https://wa.me/919103998116  
**Instagram:** https://www.instagram.com/rijal.store1  

---

## Non-Negotiable Rules

1. **Copy the `<head>` block from `index.html` verbatim** into every page. It contains fonts, Tailwind config, CSS variables, all utility classes (liquid-glass, grain, cine-*, reveal, blurword, btn, etc.), and the Three.js canvas background. Do not recreate it — copy it exactly.

2. **Copy the `<header>` navigation from `index.html` verbatim**. Adjust only the active link indicator (add `border-b border-white/30` or similar to the current page's nav link).

3. **Copy the `<footer>` block from `index.html` verbatim**.

4. **Copy the canvas background setup** (`<canvas id="bg">` + the entire Three.js/particle script at the bottom of `index.html`) into every page. This provides the ambient burgundy-dark atmosphere consistent across the site.

5. **Copy the scroll reveal IntersectionObserver script** from `index.html`. Add `.reveal` class to section elements you want animated in.

6. **Never use plain white backgrounds, grey cards, or default browser styling.** Every element must feel at home in the dark `#1a0508` environment.

7. **Brand voice:** Confident, faith-driven, masculine, premium. Headlines use `Instrument Serif`. Body copy uses `Barlow`. Never use generic marketing filler — use the exact copy from the content below.

8. **All buttons must be either `.btn-primary` (white) or `.btn-amber` (burgundy gradient)** — defined in index.html styles. No other button styles.

9. **Accessibility:** All images must have descriptive `alt` attributes. Form inputs must have associated `<label>` elements.

10. **Responsive:** All pages must work on mobile (375px), tablet (768px), and desktop (1280px+). Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

---

## Brand Content Reference

### All Product Data (use exactly as written)

```js
// Use this object in any page that references products
const PRODUCTS = {
  'beard-oil': {
    id: 'beard-oil',
    name: 'Rijal Beard Oil',
    tagline: 'Inspired by Sunnah, Backed by Science! — Repair. Nourish. Grow.',
    category: 'Grooming',
    price: 399,
    mrp: 599,
    inStock: true,
    images: [
      'https://rijal.in/wp-content/uploads/2025/08/WhatsApp-Image-2026-02-21-at-10.40.41-PM.jpeg',
      'https://rijal.in/wp-content/uploads/2025/08/WhatsApp-Image-2026-02-21-at-10.40.41-PMMM.jpeg',
      'https://rijal.in/wp-content/uploads/2025/08/WhatsApp-Image-2026-02-21-at-10.40.40-PMSS.jpeg',
    ],
    url: '/product/beard-oil.html',
    description: `Rijal Beard Oil is more than just a grooming essential—it's a reflection of faith, discipline, and identity. Crafted for Muslim men who see their beard as Sunnah, this premium oil blends prophetic wisdom with modern botanical science to help you grow and maintain a healthy, well-groomed beard.\n\nInfused with Black Seed Oil and Olive Oil—two timeless ingredients rooted in the Sunnah—Rijal Beard Oil deeply nourishes, strengthens, and revitalizes beard hair from root to tip. Enriched with Rosemary, Almond, Castor, Jojoba, Argan Oil, and Vitamin E, it helps repair damage, promote thicker growth, and maintain softness without greasiness.\n\nLightweight, fast-absorbing, and mildly musky, it offers the perfect balance of modern grooming and spiritual connection.`,
    benefits: [
      'Repairs rough and damaged beard hair',
      'Deeply nourishes and softens beard',
      'Prevents dandruff and dryness',
      'Promotes healthy, fuller beard growth',
      'Strengthens roots and reduces breakage',
      'Lightweight & non-greasy formula',
    ],
    ingredients: [
      { name: 'Black Seed Oil (Kalonji)', benefit: 'Prophetic gem; strengthens follicles, prevents hair loss' },
      { name: 'Olive Oil', benefit: 'Rich in vitamins A & E; moisturizes and adds resilience' },
      { name: 'Rosemary Oil', benefit: 'Boosts circulation to stimulate natural beard growth' },
      { name: 'Argan Oil', benefit: 'Adds shine, softness, and tames frizz' },
      { name: 'Almond Oil', benefit: 'Soothes the skin beneath the beard' },
      { name: 'Jojoba Oil', benefit: 'Hydrates and mimics natural sebum' },
      { name: 'Castor Oil', benefit: 'Promotes thicker and denser beard growth' },
      { name: 'Vitamin E', benefit: 'Protects, heals, and improves overall beard texture' },
    ],
    howToUse: [
      'Clean your beard — apply after shower when slightly damp for best absorption',
      'Take 3–5 drops into your palm (more for longer beards)',
      'Rub hands together to warm and spread the oil evenly',
      'Massage into beard and skin beneath, focusing on roots',
      'Comb and style with a beard comb or brush',
    ],
  },
  'combo': {
    id: 'combo',
    name: 'Rijal Beard Oil & Neem Wood Comb Combo',
    tagline: 'The Ultimate Grooming Duo',
    category: 'Grooming',
    price: 499,
    mrp: 798,
    inStock: true,
    images: [
      'https://rijal.in/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-17-at-5.03.14-PM.jpeg',
      'https://rijal.in/wp-content/uploads/2025/08/WhatsApp-Image-2026-02-21-at-10.40.40-PMSS.jpeg',
      'https://rijal.in/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-20-at-11.11.25-PM.jpeg',
    ],
    url: '/product/combo.html',
    description: `Give your beard the care it deserves with this all-in-one grooming combo. The beard oil deeply nourishes hair follicles, making your beard softer, thicker, and more manageable. Paired with a premium neem wood comb, it ensures smooth styling without static or damage. Neem wood is naturally antibacterial, making it hygienic and perfect for daily use.\n\nWhether you want to grow, style, or maintain your beard, this combo is your go-to solution for a clean, sharp, and confident look.`,
    benefits: [
      'Rijal Beard Oil – Helps beard growth, reduces itchiness & dryness',
      'Neem Wood Comb – Anti-static, smooth detangling & prevents hair breakage',
      'Stronger & Healthier Beard – Nourishes roots and adds natural shine',
      'Natural based Oil – Safe for daily use, skin-friendly formula',
      'Perfect Grooming Kit – Ideal for styling, shaping & daily beard care',
    ],
  },
  'comb': {
    id: 'comb',
    name: 'Rijal Wooden Comb',
    tagline: 'Artisanal Neem Wood Craftsmanship',
    category: 'Grooming',
    price: 199,
    mrp: 299,
    inStock: true,
    images: [
      'https://rijal.in/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-20-at-11.06.59-PM.jpeg',
      'https://rijal.in/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-20-at-11.06.59-PMmmm.jpeg',
      'https://rijal.in/wp-content/uploads/2026/04/rijalcomb6-683x1024.jpeg',
    ],
    url: '/product/comb.html',
    description: `Crafted from 100% natural neem wood, the Rijal Neem Wooden Beard Comb is designed to elevate your daily beard grooming routine. Neem's natural antibacterial properties help keep the beard clean, healthy, and free from dandruff and irritation. Unlike plastic combs, it prevents static and breakage while gently stimulating blood circulation for stronger, fuller beard growth.`,
    benefits: [
      '100% natural neem wood',
      'Naturally antibacterial — keeps beard hygienic',
      'Prevents static and hair breakage',
      'Stimulates blood circulation for fuller growth',
      'Superior to plastic combs',
    ],
  },
  'cap-black': {
    id: 'cap-black',
    name: 'Premium Cap — Black',
    tagline: 'Designed in Kashmir',
    category: 'Apparel',
    price: 249,
    mrp: 500,
    inStock: false,
    images: [
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0018-scaled.jpg',
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0016-scaled.jpg',
    ],
    url: '/product/cap-black.html',
    description: `Rijal Premium Cap – Designed in Kashmir, this cap combines premium quality fabric with timeless style. Comfortable, durable, and versatile, it carries the bold Rijal identity, making it the perfect accessory for everyday wear or outdoor adventures.`,
    benefits: ['Premium quality fabric', 'Timeless style', 'Comfortable fit', 'Bold Rijal identity'],
  },
  'cap-grey': {
    id: 'cap-grey',
    name: 'Premium Cap — Grey',
    tagline: 'Designed in Kashmir',
    category: 'Apparel',
    price: 249,
    mrp: 500,
    inStock: false,
    images: [
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0017-scaled.jpg',
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0020-scaled.jpg',
    ],
    url: '/product/cap-grey.html',
    description: `Rijal Premium Cap – Designed in Kashmir, this cap combines premium quality fabric with timeless style. Comfortable, durable, and versatile, it carries the bold Rijal identity, making it the perfect accessory for everyday wear or outdoor adventures.`,
    benefits: ['Premium quality fabric', 'Timeless style', 'Comfortable fit', 'Bold Rijal identity'],
  },
  'hoodie-beige': {
    id: 'hoodie-beige',
    name: 'Premium Hoodie — Beige',
    tagline: 'Warmth & Identity from Kashmir',
    category: 'Apparel',
    price: 999,
    mrp: 2000,
    inStock: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0019-scaled.jpg',
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0023-scaled.jpg',
    ],
    url: '/product/hoodie-beige.html',
    description: `Rijal Premium Hoodie – A symbol of warmth and identity from Kashmir, this hoodie is designed to keep you comfortable while making a statement. Tailored with a relaxed fit and premium fabric, it reflects the bold spirit of Rijal—perfect for streetwear, casual outings, or cozy evenings.`,
    benefits: ['Premium quality fabric', 'Relaxed fit', 'Ideal for streetwear & casual outings', 'Bold Rijal identity'],
  },
  'hoodie-black': {
    id: 'hoodie-black',
    name: 'Premium Hoodie — Black',
    tagline: 'Warmth & Identity from Kashmir',
    category: 'Apparel',
    price: 999,
    mrp: 2000,
    inStock: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0021-scaled.jpg',
      'https://rijal.in/wp-content/uploads/2025/09/IMG-20250907-WA0024-scaled.jpg',
    ],
    url: '/product/hoodie-black.html',
    description: `Rijal Premium Hoodie – A symbol of warmth and identity from Kashmir, this hoodie is designed to keep you comfortable while making a statement. Tailored with a relaxed fit and premium fabric, it reflects the bold spirit of Rijal—perfect for streetwear, casual outings, or cozy evenings.`,
    benefits: ['Premium quality fabric', 'Relaxed fit', 'Ideal for streetwear & casual outings', 'Bold Rijal identity'],
  },
};

// Server-side canonical prices (use in Cloudflare Worker — NEVER trust frontend amount)
const PRICES_PAISE = {
  'beard-oil': 39900,
  'combo':     49900,
  'comb':      19900,
};
```

---

## Page-by-Page Build Instructions

---

### Page 1: `shop.html`

**What to build:** Product catalogue page.

**Template structure:**
```html
[Copied <head> from index.html]
[Copied <header> from index.html — mark "Shop" as active]
<main>
  <!-- Page Hero -->
  <section class="cine-hero grain pt-32 pb-16 text-center">
    <h1 class="font-heading text-6xl md:text-8xl shimmer-text">The Collection</h1>
    <p class="font-body text-amber-300 mt-4 text-lg tracking-widest uppercase">
      Inspired by Sunnah. Backed by Science.
    </p>
    <!-- Category filter tabs -->
    <div class="flex justify-center gap-3 mt-8">
      <button data-filter="all"      class="btn liquid-glass rounded-full active">All</button>
      <button data-filter="Grooming" class="btn liquid-glass rounded-full">Grooming</button>
      <button data-filter="Apparel"  class="btn liquid-glass rounded-full">Apparel</button>
    </div>
  </section>

  <!-- Product Grid -->
  <section class="cine-mid py-20 px-6">
    <div id="product-grid" class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Cards rendered by JS from PRODUCTS object above -->
    </div>
  </section>
</main>
[Copied <footer> from index.html]
[Copied canvas + Three.js from index.html]

<!-- Notify Me Modal (hidden by default) -->
<div id="notify-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/70 backdrop-blur-sm">
  <div class="liquid-glass-strong rounded-2xl p-8 max-w-md w-full mx-4">
    <h3 class="font-heading text-3xl text-ink mb-2">Notify Me</h3>
    <p class="font-body text-amber-300 text-sm mb-6" id="notify-product-name"></p>
    <input id="notify-email" type="email" placeholder="your@email.com"
      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink placeholder-white/30 font-body mb-4 focus:outline-none focus:border-white/30" />
    <button onclick="submitNotify()" class="btn btn-amber w-full justify-center rounded-xl py-3">
      Notify Me When Back in Stock
    </button>
    <button onclick="closeNotifyModal()" class="mt-3 text-white/40 text-sm w-full text-center">Cancel</button>
  </div>
</div>
```

**JS logic for shop.html:**
- On page load, render all products from `PRODUCTS` object into `#product-grid`
- **IN STOCK card HTML:**
  ```html
  <div class="product-card liquid-glass rounded-2xl overflow-hidden lift" data-category="[category]">
    <div class="photo-frame aspect-square overflow-hidden">
      <img src="[images[0]]" alt="[name]" class="w-full h-full object-cover slowzoom" />
    </div>
    <div class="p-6">
      <p class="font-body text-xs text-amber-300 uppercase tracking-widest mb-2">[category]</p>
      <h3 class="font-heading text-2xl text-ink mb-2">[name]</h3>
      <div class="flex items-center gap-3 mb-5">
        <span class="font-body text-2xl font-semibold text-ink">₹[price]</span>
        <span class="font-body text-sm text-white/40 line-through">₹[mrp]</span>
        <span class="font-body text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Free Shipping</span>
      </div>
      <a href="/checkout.html?product=[id]&qty=1" class="btn btn-amber w-full justify-center rounded-xl">Buy Now</a>
      <a href="[url]" class="btn w-full justify-center rounded-xl mt-2 liquid-glass text-ink/70 text-sm">View Details</a>
    </div>
  </div>
  ```
- **OUT OF STOCK card HTML:** Same structure but:
  - Image has a `grayscale opacity-50` overlay
  - Replace buttons with:
    ```html
    <span class="block text-center text-xs text-red-400/80 mb-3 uppercase tracking-widest">Out of Stock</span>
    <button onclick="openNotifyModal('[id]', '[name]')" class="btn btn-primary w-full justify-center rounded-xl">Notify Me</button>
    <a href="[url]" class="btn w-full justify-center rounded-xl mt-2 liquid-glass text-ink/70 text-sm">View Details</a>
    ```
- **Filter logic:** On filter button click, show/hide cards by matching `data-category` attribute. Animate with opacity transition.
- **Notify modal:** `openNotifyModal(id, name)` shows modal, sets product context. `submitNotify()` calls `POST /api/notify-me`.

---

### Page 2: `about.html`

**What to build:** Brand story, founder, mission, and values page.

**Template structure:**
```html
[Copied <head>]
[Copied <header> — mark "About" as active]
<main>
  <!-- Hero -->
  <section class="cine-hero grain relative overflow-hidden" style="min-height:60vh">
    <img src="https://rijal.in/wp-content/uploads/2025/03/about-us.jpg"
      class="absolute inset-0 w-full h-full object-cover opacity-20 slowzoom" alt="Rijal Brand" />
    <div class="relative z-10 flex flex-col items-center justify-center h-full pt-40 pb-20 px-6 text-center">
      <p class="font-body text-amber-300 uppercase tracking-[0.3em] text-xs mb-4 reveal">Our Story</p>
      <h1 class="font-heading text-5xl md:text-7xl text-ink reveal delay-100">
        We are Passionate<br/><em>About Our Work</em>
      </h1>
    </div>
  </section>

  <!-- About Copy -->
  <section class="cine-mid py-24 px-6">
    <div class="max-w-3xl mx-auto">
      <p class="font-body text-ink/80 text-lg leading-relaxed mb-6 reveal">[paragraph 1]</p>
      <p class="font-body text-ink/80 text-lg leading-relaxed mb-6 reveal delay-100">[paragraph 2]</p>
      <p class="font-body text-ink/80 text-lg leading-relaxed reveal delay-200">[paragraph 3]</p>
    </div>
  </section>

  <!-- Core Values grid (6 cards) -->
  <section class="cine-stats py-24 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-heading text-4xl md:text-5xl text-center text-ink mb-16 reveal">
        We strive to provide our customers with the <em>highest quality</em>
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 6 value cards — liquid-glass rounded-2xl p-6 -->
      </div>
    </div>
  </section>

  <!-- Mission -->
  <section class="cine-cta py-24 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="font-heading text-4xl md:text-6xl text-ink mb-8 reveal">Our Mission</h2>
      <p class="font-body text-ink/80 text-xl leading-relaxed mb-12 reveal delay-100">[mission copy]</p>
      <!-- 4 mission pillars — horizontal list with dot separators -->
    </div>
  </section>

  <!-- Founder Quote -->
  <section class="cine-mid py-20 px-6">
    <div class="max-w-2xl mx-auto text-center">
      <div class="liquid-glass-strong rounded-2xl p-10">
        <p class="font-heading text-2xl md:text-3xl text-ink italic leading-relaxed mb-6">
          "We are passionate about our craft and build lasting relationships with our customers..."
        </p>
        <p class="font-body text-amber-300 tracking-widest text-sm uppercase">— Abdul Hanan, CEO @ Rijal Store</p>
      </div>
    </div>
  </section>

  <!-- Footer CTA Banner (same as index.html) -->
</main>
[Copied <footer>]
[Copied canvas + Three.js]
```

---

### Page 3: `contact.html`

**What to build:** Contact page with inquiry form and WhatsApp CTA.

**Template structure:**
```html
[Copied <head>]
[Copied <header> — mark "Contact" as active]
<main>
  <!-- Hero -->
  <section class="cine-hero grain pt-40 pb-16 text-center">
    <p class="font-body text-amber-300 uppercase tracking-[0.3em] text-xs mb-4 reveal">Reach Out</p>
    <h1 class="font-heading text-6xl md:text-8xl shimmer-text reveal delay-100">Let's Connect</h1>
    <p class="font-body text-ink/60 mt-4 reveal delay-200">We'd love to hear from you.</p>
  </section>

  <!-- Two-column layout -->
  <section class="cine-mid py-20 px-6">
    <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

      <!-- Left: Inquiry Form -->
      <div class="liquid-glass rounded-2xl p-8">
        <h2 class="font-heading text-3xl text-ink mb-6">Send us a Message</h2>
        <div id="contact-form">
          <input type="text"  id="cf-name"    placeholder="Full Name"      class="[input-styles] mb-4" />
          <input type="email" id="cf-email"   placeholder="Email Address"  class="[input-styles] mb-4" />
          <input type="tel"   id="cf-phone"   placeholder="Phone (optional)" class="[input-styles] mb-4" />
          <textarea           id="cf-message" placeholder="Your Message"   class="[input-styles] mb-6 h-32"></textarea>
          <!-- Honeypot for spam -->
          <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" />
          <button onclick="submitContact()" class="btn btn-amber w-full justify-center rounded-xl py-3">
            Send Message
          </button>
        </div>
        <div id="contact-success" class="hidden text-center py-8">
          <p class="font-heading text-2xl text-ink mb-2">Message Sent!</p>
          <p class="font-body text-ink/60">We'll reply within 24 hours. Jazakallah Khair.</p>
        </div>
      </div>

      <!-- Right: WhatsApp + Contact Details -->
      <div class="flex flex-col gap-6">
        <!-- WhatsApp CTA — large prominent button -->
        <div class="liquid-glass-strong rounded-2xl p-8 text-center">
          <p class="font-body text-amber-300 uppercase tracking-widest text-xs mb-3">Fastest Response</p>
          <h3 class="font-heading text-3xl text-ink mb-4">Message Us on WhatsApp</h3>
          <p class="font-body text-ink/60 mb-6">Get a reply within minutes.</p>
          <a href="https://wa.me/919103998116?text=Hi%20Rijal%2C%20I%27d%20like%20to%20enquire%20about%20your%20products."
            target="_blank" rel="noopener"
            class="btn btn-primary rounded-xl px-8 py-3 text-base font-semibold">
            <!-- WhatsApp icon SVG --> Open WhatsApp
          </a>
        </div>

        <!-- Contact Details -->
        <div class="liquid-glass rounded-2xl p-8 space-y-4">
          <div><!-- Phone icon + +91-9103998116 --></div>
          <div><!-- Email icon + rijalstore1212@gmail.com --></div>
          <div><!-- Location icon + Baramulla, Jammu and Kashmir, India --></div>
          <div><!-- Instagram icon + @rijal.store1 --></div>
        </div>
      </div>
    </div>
  </section>
</main>
[Copied <footer>]
[Copied canvas + Three.js]
```

**JS logic:**
```js
async function submitContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const phone   = document.getElementById('cf-phone').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  if (!name || !email || !message) { showError('Please fill in all required fields.'); return; }
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message }),
    });
    if (!res.ok) throw new Error();
    document.getElementById('contact-form').classList.add('hidden');
    document.getElementById('contact-success').classList.remove('hidden');
  } catch {
    showError('Something went wrong. Please try WhatsApp or email us directly.');
  }
}
```

---

### Page 4: `product/<slug>.html` (7 pages — all share the same template)

**What to build:** Full product detail page. Each page is identical in structure — only the product data differs. The easiest approach is to copy the template and replace the data.

**Template structure:**
```html
[Copied <head>]
[Copied <header> — no active link (product pages are under Shop)]
<main>
  <!-- Breadcrumb -->
  <nav class="pt-28 pb-4 px-6 max-w-6xl mx-auto font-body text-sm text-white/40">
    <a href="/" class="hover:text-ink transition-colors">Home</a>
    <span class="mx-2">/</span>
    <a href="/shop.html" class="hover:text-ink transition-colors">Shop</a>
    <span class="mx-2">/</span>
    <span class="text-ink">[Product Name]</span>
  </nav>

  <!-- Product Hero: 2-column layout -->
  <section class="cine-hero grain py-16 px-6">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      <!-- Image Gallery -->
      <div>
        <div class="photo-frame rounded-2xl overflow-hidden aspect-square mb-4">
          <img id="main-img" src="[images[0]]" alt="[name]"
            class="w-full h-full object-cover transition-opacity duration-300" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <!-- 3 thumbnail images — click to swap main image -->
        </div>
      </div>

      <!-- Product Info -->
      <div class="pt-4">
        <p class="font-body text-amber-300 uppercase tracking-[0.3em] text-xs mb-3">[category]</p>
        <h1 class="font-heading text-4xl md:text-5xl text-ink mb-3">[name]</h1>
        <p class="font-body text-ink/60 text-lg italic mb-6">[tagline]</p>

        <!-- Pricing -->
        <div class="flex items-baseline gap-4 mb-4">
          <span class="font-body text-4xl font-semibold text-ink">₹[price]</span>
          <span class="font-body text-xl text-white/40 line-through">₹[mrp]</span>
        </div>
        <span class="inline-flex items-center gap-2 font-body text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full mb-6">
          ✓ Free Shipping All Over India
        </span>

        <!-- Stock indicator -->
        <!-- IF IN STOCK: -->
        <div class="flex items-center gap-2 mb-6">
          <span class="w-2 h-2 rounded-full bg-green-400"></span>
          <span class="font-body text-sm text-green-400">In Stock</span>
        </div>
        <!-- Size selector (for hoodies only) -->
        <!-- Quantity selector -->
        <div class="flex items-center gap-4 mb-6">
          <div class="liquid-glass rounded-full flex items-center gap-0">
            <button onclick="changeQty(-1)" class="w-10 h-10 flex items-center justify-center text-ink">−</button>
            <span id="qty-display" class="font-body text-ink w-8 text-center">1</span>
            <button onclick="changeQty(+1)" class="w-10 h-10 flex items-center justify-center text-ink">+</button>
          </div>
        </div>
        <!-- CTA buttons -->
        <a id="buy-btn" href="/checkout.html?product=[id]&qty=1" class="btn btn-amber w-full justify-center rounded-xl py-4 text-base mb-3">
          Buy Now — ₹[price]
        </a>
        <a href="https://wa.me/919103998116?text=Hi%2C%20I%27d%20like%20to%20order%20[URL_ENCODED_NAME]."
          target="_blank" class="btn liquid-glass-strong w-full justify-center rounded-xl py-4 text-base text-ink">
          <!-- WhatsApp SVG --> Order via WhatsApp
        </a>

        <!-- IF OUT OF STOCK: -->
        <div class="flex items-center gap-2 mb-6">
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          <span class="font-body text-sm text-red-400">Currently Out of Stock</span>
        </div>
        <div class="liquid-glass rounded-xl p-6">
          <p class="font-body text-ink/70 mb-4">Be the first to know when this is back in stock:</p>
          <input type="email" id="notify-email" placeholder="your@email.com" class="[input-styles] mb-3" />
          <button onclick="submitNotifyMe('[id]', '[name]')" class="btn btn-primary w-full justify-center rounded-xl">
            Notify Me When Available
          </button>
        </div>
        <a href="https://wa.me/919103998116?text=Hi%2C%20I%27m%20interested%20in%20[URL_ENCODED_NAME].%20Is%20it%20back%20in%20stock%3F"
          target="_blank" class="btn liquid-glass-strong w-full justify-center rounded-xl py-4 text-base text-ink mt-3">
          Ask on WhatsApp
        </a>
      </div>
    </div>
  </section>

  <!-- Description -->
  <section class="cine-mid py-20 px-6">
    <div class="max-w-3xl mx-auto">
      <h2 class="font-heading text-3xl text-ink mb-8">About This Product</h2>
      <p class="font-body text-ink/80 text-lg leading-relaxed">[description]</p>
    </div>
  </section>

  <!-- Key Benefits -->
  <section class="cine-stats py-20 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-heading text-3xl text-ink mb-10 text-center">Key Benefits</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- benefit cards — liquid-glass rounded-xl p-5 with checkmark icon -->
      </div>
    </div>
  </section>

  <!-- Ingredients table — BEARD OIL AND COMBO ONLY -->
  <!-- How to Use — BEARD OIL ONLY -->

  <!-- Related Products (2–3 other in-stock products) -->
  <section class="cine-cta py-20 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-heading text-4xl text-ink mb-12 text-center">You May Also Like</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <!-- Related product cards (compact version of shop card) -->
      </div>
    </div>
  </section>

  <!-- Footer CTA Banner -->
</main>
[Copied <footer>]
[Copied canvas + Three.js]
```

**JS for quantity selector — updates checkout link dynamically:**
```js
let qty = 1;
const productId = '[id]';
const pricePerUnit = [price];

function changeQty(delta) {
  qty = Math.max(1, Math.min(5, qty + delta));
  document.getElementById('qty-display').textContent = qty;
  const total = pricePerUnit * qty;
  document.getElementById('buy-btn').href = `/checkout.html?product=${productId}&qty=${qty}`;
  document.getElementById('buy-btn').textContent = `Buy Now — ₹${total}`;
}
```

---

### Page 5: `checkout.html`

**What to build:** Multi-step checkout wizard (3 steps, no page reloads).

**Step management:**
```js
// Steps: 1 = Details, 2 = Summary, 3 = Processing (Razorpay opens)
let currentStep = 1;
function showStep(n) {
  document.querySelectorAll('.step-pane').forEach((el, i) => {
    el.classList.toggle('hidden', i + 1 !== n);
  });
  currentStep = n;
}
```

**Product resolution on page load:**
```js
const params = new URLSearchParams(window.location.search);
const productId = params.get('product');
const qty = parseInt(params.get('qty')) || 1;
const product = PRODUCTS[productId];
if (!product || !product.inStock) {
  window.location.href = '/shop.html';
}
```

**Step 1 — Customer Details Form:**
```html
<section class="step-pane" id="step-1">
  <div class="max-w-xl mx-auto liquid-glass rounded-2xl p-8">
    <h2 class="font-heading text-3xl text-ink mb-8">Your Details</h2>
    <input id="c-name"    type="text"   placeholder="Full Name *"          class="[input-styles] mb-4" required />
    <input id="c-phone"   type="tel"    placeholder="Mobile Number * (10-digit)" class="[input-styles] mb-4" required pattern="[6-9]\d{9}" />
    <input id="c-email"   type="email"  placeholder="Email Address *"      class="[input-styles] mb-4" required />
    <textarea id="c-addr" placeholder="Delivery Address *"                 class="[input-styles] mb-4 h-24" required></textarea>
    <input id="c-city"    type="text"   placeholder="City *"               class="[input-styles] mb-4" required />
    <select id="c-state"  class="[input-styles] mb-4" required>
      <option value="">Select State *</option>
      <!-- All 28 Indian states + 8 UTs -->
      <option>Andhra Pradesh</option><option>Arunachal Pradesh</option>
      <option>Assam</option><option>Bihar</option><option>Chhattisgarh</option>
      <option>Goa</option><option>Gujarat</option><option>Haryana</option>
      <option>Himachal Pradesh</option><option>Jharkhand</option>
      <option>Karnataka</option><option>Kerala</option>
      <option>Madhya Pradesh</option><option>Maharashtra</option>
      <option>Manipur</option><option>Meghalaya</option><option>Mizoram</option>
      <option>Nagaland</option><option>Odisha</option><option>Punjab</option>
      <option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option>
      <option>Telangana</option><option>Tripura</option><option>Uttar Pradesh</option>
      <option>Uttarakhand</option><option>West Bengal</option>
      <option>Andaman and Nicobar Islands</option><option>Chandigarh</option>
      <option>Dadra and Nagar Haveli and Daman and Diu</option>
      <option>Delhi</option><option>Jammu and Kashmir</option>
      <option>Ladakh</option><option>Lakshadweep</option><option>Puducherry</option>
    </select>
    <input id="c-pin"     type="text"   placeholder="Pincode *"            class="[input-styles] mb-6" required pattern="\d{6}" maxlength="6" />
    <button onclick="proceedToSummary()" class="btn btn-amber w-full justify-center rounded-xl py-4 text-base">
      Continue to Order Summary →
    </button>
  </div>
</section>
```

**Step 1 validation function:**
```js
function proceedToSummary() {
  const fields = ['c-name', 'c-phone', 'c-email', 'c-addr', 'c-city', 'c-state', 'c-pin'];
  for (const id of fields) {
    const el = document.getElementById(id);
    if (!el.value.trim() || !el.checkValidity()) {
      el.classList.add('border-red-400/50');
      el.focus();
      showError('Please fill in all required fields correctly.');
      return;
    }
  }
  // Save to sessionStorage
  sessionStorage.setItem('rijal_customer', JSON.stringify({
    name: document.getElementById('c-name').value.trim(),
    phone: document.getElementById('c-phone').value.trim(),
    email: document.getElementById('c-email').value.trim(),
    address: `${document.getElementById('c-addr').value.trim()}, ${document.getElementById('c-city').value.trim()}, ${document.getElementById('c-state').value}, ${document.getElementById('c-pin').value.trim()}`,
  }));
  renderSummary();
  showStep(2);
}
```

**Step 2 — Order Summary:**
```html
<section class="step-pane hidden" id="step-2">
  <div class="max-w-xl mx-auto">
    <!-- Product summary card -->
    <div class="liquid-glass rounded-2xl p-6 mb-4">
      <div class="flex gap-4 items-center">
        <img id="summary-img" class="w-20 h-20 rounded-xl object-cover" />
        <div>
          <h3 id="summary-name" class="font-heading text-xl text-ink"></h3>
          <p id="summary-qty"  class="font-body text-ink/60 text-sm"></p>
        </div>
        <span id="summary-line" class="font-body font-semibold text-ink ml-auto"></span>
      </div>
    </div>
    <!-- Price breakdown -->
    <div class="liquid-glass rounded-2xl p-6 mb-4">
      <div class="flex justify-between font-body text-ink/70 mb-2">
        <span>Subtotal</span><span id="summary-subtotal"></span>
      </div>
      <div class="flex justify-between font-body text-ink/70 mb-4">
        <span>Shipping</span><span class="text-green-400">FREE</span>
      </div>
      <div class="border-t border-white/10 pt-4 flex justify-between font-heading text-2xl text-ink">
        <span>Total</span><span id="summary-total"></span>
      </div>
    </div>
    <!-- Customer details recap -->
    <div class="liquid-glass rounded-2xl p-6 mb-6">
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-body text-ink/60 text-sm uppercase tracking-widest">Delivering To</h4>
        <button onclick="showStep(1)" class="font-body text-xs text-amber-300 hover:text-ink">← Edit</button>
      </div>
      <p id="summary-customer" class="font-body text-ink"></p>
    </div>
    <button onclick="initiatePayment()" class="btn btn-amber w-full justify-center rounded-xl py-4 text-base" id="pay-btn">
      Confirm & Pay ₹<span id="pay-amount"></span>
    </button>
    <p class="font-body text-xs text-white/30 text-center mt-3">
      🔒 Secured by Razorpay · Your data is encrypted
    </p>
  </div>
</section>
```

**Step 3 — Razorpay integration:**
```js
async function initiatePayment() {
  const customer = JSON.parse(sessionStorage.getItem('rijal_customer'));
  document.getElementById('pay-btn').textContent = 'Creating order...';
  document.getElementById('pay-btn').disabled = true;

  try {
    // 1. Create order server-side
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        qty,
        customer,
      }),
    });
    const { razorpay_order_id, amount, error } = await res.json();
    if (error) throw new Error(error);

    // 2. Open Razorpay modal
    const options = {
      key: 'RAZORPAY_KEY_ID',   // ← Replace with actual key (public)
      amount,
      currency: 'INR',
      name: 'Rijal Store',
      description: product.name,
      order_id: razorpay_order_id,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: '#6D2932' },
      modal: { backdropclose: false },
      handler: async function(response) {
        // 3. Verify payment server-side
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
            customer,
            cart: { productName: product.name, qty, price: product.price * 100 * qty },
          }),
        });
        const result = await verifyRes.json();
        if (result.success) {
          window.location.href = `/order-success.html?order_id=${response.razorpay_order_id}`;
        } else {
          showError('Payment verification failed. Please contact us on WhatsApp.');
        }
      },
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response) {
      showError('Payment failed: ' + response.error.description + '. Please try again.');
      document.getElementById('pay-btn').textContent = 'Retry Payment';
      document.getElementById('pay-btn').disabled = false;
    });
    rzp.open();
  } catch (err) {
    showError('Could not create order. Please try again or order via WhatsApp.');
    document.getElementById('pay-btn').textContent = `Confirm & Pay ₹${product.price * qty}`;
    document.getElementById('pay-btn').disabled = false;
  }
}
```

**Add Razorpay SDK to `<head>` of checkout.html:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### Page 6: `order-success.html`

**What to build:** Post-payment success confirmation.

```html
[Copied <head>]
[Copied <header>]
<main class="cine-hero grain min-h-screen flex items-center justify-center px-6">
  <div class="max-w-lg mx-auto text-center">
    <!-- Animated checkmark -->
    <div class="w-24 h-24 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-8 animate-bounce-once">
      <svg class="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <h1 class="font-heading text-5xl text-ink mb-4">Order Confirmed!</h1>
    <p class="font-body text-ink/70 text-lg mb-2">Jazakallah Khair for your purchase.</p>
    <p id="order-id-display" class="font-body text-amber-300 text-sm mb-2"></p>
    <p id="email-notice" class="font-body text-ink/50 text-sm mb-10">
      A confirmation email has been sent to your inbox.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="https://wa.me/919103998116" target="_blank"
        class="btn btn-primary rounded-xl px-8 py-3">
        Track Order on WhatsApp
      </a>
      <a href="/shop.html" class="btn liquid-glass rounded-xl px-8 py-3 text-ink">
        Continue Shopping
      </a>
    </div>
  </div>
</main>
[Copied <footer>]
[Copied canvas + Three.js]

<script>
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  if (orderId) {
    document.getElementById('order-id-display').textContent = `Order ID: ${orderId}`;
    // Update WhatsApp link with order ID
    document.querySelector('a[href*="wa.me"]').href =
      `https://wa.me/919103998116?text=Hi%2C%20my%20Rijal%20order%20ID%20is%20${orderId}.%20Please%20help%20me%20track%20it.`;
  }
</script>
```

---

## Cloudflare Workers — Build Instructions

### Worker 1: `create-order.js`
```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    
    const PRICES = {
      'beard-oil': 39900,
      'combo':     49900,
      'comb':      19900,
    };

    try {
      const { productId, qty, customer } = await request.json();
      
      if (!PRICES[productId]) return Response.json({ error: 'Invalid product' }, { status: 400 });
      if (!qty || qty < 1 || qty > 5) return Response.json({ error: 'Invalid quantity' }, { status: 400 });
      if (!customer?.name || !customer?.email || !customer?.phone) {
        return Response.json({ error: 'Missing customer details' }, { status: 400 });
      }

      const amount = PRICES[productId] * qty;
      const credentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `rijal_${Date.now()}`,
          notes: { productId, qty: String(qty), customerName: customer.name },
        }),
      });

      if (!rzpRes.ok) throw new Error('Razorpay order creation failed');
      const order = await rzpRes.json();

      return Response.json({ razorpay_order_id: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
      return Response.json({ error: 'Order creation failed. Please try again.' }, { status: 500 });
    }
  }
};
```

### Worker 2: `verify-payment.js`
```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, customer, cart } = await request.json();

      // HMAC-SHA256 verification
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const key  = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const sig  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
      const hex  = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');

      if (hex !== razorpay_signature) {
        return Response.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      const amountRupees = Math.round(cart.price / 100);

      // Owner email
      await sendEmail(env, {
        to: env.OWNER_EMAIL,
        subject: `🛒 New Order — ${cart.productName} × ${cart.qty} — ₹${amountRupees}`,
        text: `New order received on Rijal Store.\n\nOrder ID: ${razorpay_order_id}\nPayment ID: ${razorpay_payment_id}\nProduct: ${cart.productName} × ${cart.qty}\nAmount Paid: ₹${amountRupees}\n\nCustomer:\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email}\nAddress: ${customer.address}\n\nPlease fulfil and ship within 2 business days.`,
      });

      // Customer email
      await sendEmail(env, {
        to: customer.email,
        subject: `Your Rijal Order is Confirmed! 🎉`,
        text: `Assalamu Alaikum ${customer.name},\n\nYour order has been placed successfully.\n\nOrder ID: ${razorpay_order_id}\nProduct: ${cart.productName} × ${cart.qty}\nAmount Paid: ₹${amountRupees} (Free Shipping)\n\nDelivery Address: ${customer.address}\n\nWe'll dispatch your order within 2 business days.\nFor queries: WhatsApp us at +91-9103998116 or email rijalstore1212@gmail.com\n\nJazakallah Khair,\nTeam Rijal`,
      });

      return Response.json({ success: true });
    } catch (err) {
      return Response.json({ error: 'Verification error' }, { status: 500 });
    }
  }
};

async function sendEmail(env, { to, subject, text }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to, subject, text }),
  });
}
```

### Worker 3: `contact.js`
```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const { name, email, phone, message } = await request.json();
    if (!name || !email || !message) return Response.json({ error: 'Missing fields' }, { status: 400 });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: env.OWNER_EMAIL,
        subject: `💬 Website Inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
      }),
    });
    return Response.json({ success: true });
  }
};
```

### Worker 4: `notify-me.js`
```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const { email, productId, productName } = await request.json();
    if (!email || !productId) return Response.json({ error: 'Missing fields' }, { status: 400 });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: env.OWNER_EMAIL,
        subject: `🔔 Restock Request — ${productName}`,
        text: `${email} wants to be notified when ${productName} (ID: ${productId}) is back in stock.`,
      }),
    });
    return Response.json({ success: true });
  }
};
```

---

## Input Styling (reuse across all forms)

```css
/* Add to <style> block — matches liquid-glass aesthetic */
.field-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  color: #E8D8C4;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}
.field-input::placeholder { color: rgba(255,255,255,0.25); }
.field-input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.06);
}
.field-input.error { border-color: rgba(239,68,68,0.5); }
```

Wherever you see `class="[input-styles]"` in this guide, replace with `class="field-input"`.

---

## Quality Checklist (run before marking any page as done)

- [ ] `<head>` block copied verbatim from `index.html`
- [ ] Canvas background renders on page
- [ ] Header navigation present; correct page is highlighted as active
- [ ] Footer present with correct links and copyright
- [ ] All `.reveal` elements animate in on scroll
- [ ] All product images load (test in browser)
- [ ] All forms have client-side validation with clear error states
- [ ] All API calls wrapped in try/catch with user-facing error messages
- [ ] WhatsApp links open correctly on mobile (test with real phone)
- [ ] Page is fully responsive at 375px, 768px, 1280px
- [ ] No console errors
- [ ] Out-of-stock products cannot reach `/checkout.html` (guard in JS)
- [ ] `sessionStorage` is cleared on order success
- [ ] Razorpay amount is calculated server-side (Worker), not trusted from frontend
