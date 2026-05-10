const CART_KEY = 'rijal_cart';

const CART_PRODUCTS = {
  'beard-oil': {
    name: 'Rijal Beard Oil',
    price: 399,
    image: 'https://rijal.in/wp-content/uploads/2025/08/WhatsApp-Image-2026-02-21-at-10.40.41-PM.jpeg',
    url: '/product/beard-oil.html',
  },
  'combo': {
    name: 'Rijal Beard Oil & Neem Wood Comb Combo',
    price: 499,
    image: 'https://rijal.in/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-17-at-5.03.14-PM.jpeg',
    url: '/product/combo.html',
  },
  'comb': {
    name: 'Rijal Wooden Comb',
    price: 199,
    image: 'https://rijal.in/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-20-at-11.06.59-PM.jpeg',
    url: '/product/comb.html',
  },
};

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '{}'); } catch { return {}; }
}

function saveCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
}

function cartItemCount() {
  return Object.values(getCart()).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(getCart()).reduce((t, [id, qty]) => t + (CART_PRODUCTS[id]?.price || 0) * qty, 0);
}

function addToCart(id, qty) {
  qty = Math.max(1, parseInt(qty) || 1);
  if (!CART_PRODUCTS[id]) return false;
  const c = getCart();
  c[id] = Math.min((c[id] || 0) + qty, 5);
  saveCart(c);
  refreshCartBadge();
  return true;
}

function removeFromCart(id) {
  const c = getCart();
  delete c[id];
  saveCart(c);
  refreshCartBadge();
}

function updateCartQty(id, qty) {
  qty = parseInt(qty);
  const c = getCart();
  if (qty <= 0) { delete c[id]; } else { c[id] = Math.min(qty, 5); }
  saveCart(c);
  refreshCartBadge();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  refreshCartBadge();
}

function refreshCartBadge() {
  const n = cartItemCount();
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = n;
    el.style.display = n ? 'flex' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', refreshCartBadge);
