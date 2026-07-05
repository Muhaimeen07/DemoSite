// ═══════════════════════════════════════════════
//  MALENIA — Main JavaScript
// ═══════════════════════════════════════════════

// ── Cart State ──────────────────────────────────
let cart = JSON.parse(localStorage.getItem('malenia_cart') || '[]');

function saveCart() {
  localStorage.setItem('malenia_cart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`<strong>${product.name}</strong>Added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    updateCartBadge();
    if (typeof renderCart === 'function') renderCart();
  }
}

// ── Toast ───────────────────────────────────────
function showToast(html) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </span>
      <div class="toast-text"></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-text').innerHTML = html;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Navbar ──────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  // Mark active link
  const links = document.querySelectorAll('.nav-links a, .mobile-nav a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
}

// ── Mobile Nav ──────────────────────────────────
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');
  const overlay    = document.querySelector('.mobile-nav-overlay');
  const closeBtn   = document.querySelector('.mobile-nav-close');

  function open()  { mobileNav?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { mobileNav?.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow = ''; }

  hamburger?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
}

// ── Fade-in on Scroll ───────────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Quantity Selector ───────────────────────────
function initQtySelector() {
  const decBtn = document.getElementById('qty-dec');
  const incBtn = document.getElementById('qty-inc');
  const val    = document.getElementById('qty-value');
  if (!decBtn || !incBtn || !val) return;
  decBtn.addEventListener('click', () => { let v = parseInt(val.textContent); if (v > 1) val.textContent = v - 1; });
  incBtn.addEventListener('click', () => { let v = parseInt(val.textContent); val.textContent = v + 1; });
}

// ── Newsletter ──────────────────────────────────
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input.value.trim()) {
      showToast('<strong>You\'re subscribed!</strong>Thank you for joining Malenia');
      input.value = '';
    }
  });
}

// ── Contact Form ─────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('<strong>Message Sent!</strong>We\'ll be in touch shortly');
    form.reset();
  });
}

// ── Filter Toggle (mobile) ───────────────────────
function initFilterToggle() {
  const btn = document.getElementById('filter-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
  });
}

// ── Price Range ──────────────────────────────────
function initPriceRange() {
  const range = document.querySelector('.price-range');
  const maxLabel = document.getElementById('price-max');
  if (!range || !maxLabel) return;
  range.addEventListener('input', () => {
    maxLabel.textContent = '$' + parseInt(range.value).toLocaleString();
  });
}

// ── Sort Products ────────────────────────────────
function initSortSelect() {
  const sel = document.querySelector('.sort-select');
  const grid = document.getElementById('products-grid');
  if (!sel || !grid) return;
  sel.addEventListener('change', () => {
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    cards.sort((a, b) => {
      const aPrice = parseFloat(a.dataset.price);
      const bPrice = parseFloat(b.dataset.price);
      if (sel.value === 'price-asc')  return aPrice - bPrice;
      if (sel.value === 'price-desc') return bPrice - aPrice;
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

// ── Brand Filter ─────────────────────────────────
function initBrandFilter() {
  const checks = document.querySelectorAll('.brand-filter');
  const grid = document.getElementById('products-grid');
  if (!checks.length || !grid) return;
  checks.forEach(chk => {
    chk.addEventListener('change', () => {
      const active = Array.from(checks).filter(c => c.checked).map(c => c.value);
      const cards = grid.querySelectorAll('.product-card');
      cards.forEach(card => {
        card.style.display = (!active.length || active.includes(card.dataset.brand)) ? '' : 'none';
      });
    });
  });
}

// ── Add To Cart Buttons ──────────────────────────
function initAddToCartButtons() {
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('[data-product-id]');
      if (!card) return;
      addToCart({
        id:    card.dataset.productId,
        name:  card.dataset.productName,
        brand: card.dataset.productBrand,
        price: parseFloat(card.dataset.productPrice),
        img:   card.dataset.productImg,
      });
    });
  });
}

// ── Wishlist ─────────────────────────────────────
function initWishlist() {
  document.querySelectorAll('[data-wishlist]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.style.color = btn.style.color === 'var(--gold)' ? '' : 'var(--gold)';
      showToast('<strong>Wishlist Updated</strong>Item saved to wishlist');
    });
  });
}

// ── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initNavbar();
  initMobileNav();
  initScrollAnimations();
  initQtySelector();
  initNewsletter();
  initContactForm();
  initFilterToggle();
  initPriceRange();
  initSortSelect();
  initBrandFilter();
  initAddToCartButtons();
  initWishlist();
});
