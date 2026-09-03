// --- 1. STOREFRONT PAGE (shop.html) ---
// Sample products assigned to Golden Field categories
const products = [
  { id: 1, name: "Classic Cap", price: 5000.00, category: "apparel", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80" },
  { id: 2, name: "Face Serum", price: 5100.00, category: "skincare", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80" },
  { id: 3, name: "Handmade Vase", price: 2500.00, category: "skincare", image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500&q=80" },
  { id: 4, name: "Hand Soap", price: 1000.00, category: "skincare", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&q=80" },
  { id: 5, name: "Set of Plates", price: 3000.00, category: "skincare", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80" },
  { id: 6, name: "Sunglasses", price: 4500.00, category: "accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80" }
];

let activeCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const countLabel = document.querySelector('.product-count');
  if (!grid) return;

  // 1. Filter by category
  let filtered = activeCategory === 'all' 
    ? [...products] 
    : products.filter(p => p.category === activeCategory);

  // 2. Filter by search query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  }

  // 3. Sort items by price
  if (currentSort === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // 4. Update product count
  if (countLabel) {
    countLabel.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
  }

  // 5. Empty state handling
  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-cart-msg">No products matching "${searchQuery}".</p>`;
    return;
  }

  // 6. Render products
  grid.innerHTML = filtered.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">₦${product.price.toFixed(2)}</p>
      <button id="add-btn-${product.id}" onclick="addToCart(${product.id})" class="btn-gold">
        Add to bag
      </button>
    </div>
  `).join('');
}


// Always pull fresh cart state from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('store_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('store_cart', JSON.stringify(cart));
}

// Global Cart Badge Counter (Runs everywhere)
function updateCartBadge() {
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;
}


function initStorePage() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  renderProducts();

  // Category Filtering
  const categoryList = document.getElementById('category-list');
  if (categoryList) {
    categoryList.addEventListener('click', (e) => {
      const target = e.target.closest('.category-item');
      if (!target) return;

      document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
      target.classList.add('active');

      activeCategory = target.dataset.category;
      renderProducts();
    });
  }

  // Price Sorting
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Search Input Handler
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
}

function addToCart(productId) {
  let cart = getCart();
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();

  const btn = document.getElementById(`add-btn-${productId}`);
  if (btn) {
    btn.classList.add('btn-added');
    btn.innerHTML = `✓ Added!`;
    setTimeout(() => {
      btn.classList.remove('btn-added');
      btn.innerHTML = "Add to Cart";
    }, 1200);
  }

  showToast(`Added <strong>${product.name}</strong> to your cart!`);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `🛒 ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// --- 2. DEDICATED CART PAGE (cart.html) ---
function initCartPage() {
  const cartList = document.getElementById('cart-page-items');
  if (!cartList) return; // Exit if not on cart.html

  renderCartPage();

  const proceedBtn = document.getElementById('cart-proceed-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length > 0) {
        window.location.href = 'checkout.html';
      }
    });
  }
}

function renderCartPage() {
  const cartList = document.getElementById('cart-page-items');
  const cartTotal = document.getElementById('cart-page-total');
  const proceedBtn = document.getElementById('cart-proceed-btn');
  if (!cartList) return;

  const cart = getCart();
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (cartTotal) cartTotal.textContent = `₦${totalPrice.toFixed(2)}`;

  if (cart.length === 0) {
    cartList.innerHTML = `<p class="empty-cart-msg">Your shopping cart is empty.</p>`;
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.style.opacity = "0.5";
      proceedBtn.style.cursor = "not-allowed";
    }
    return;
  }

  if (proceedBtn) {
    proceedBtn.disabled = false;
    proceedBtn.style.opacity = "1";
    proceedBtn.style.cursor = "pointer";
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-page-item">
      <div class="cart-page-item-info">
        <h4>${item.name}</h4>
        <p>₦${item.price.toFixed(2)}</p>
      </div>
      <div class="qty-controls">
        <button onclick="changeQuantity(${item.id}, -1)" class="qty-btn">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${item.id}, 1)" class="qty-btn">+</button>
      </div>
    </div>
  `).join('');
}

function changeQuantity(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart(cart);
  updateCartBadge();
  renderCartPage();
}

// --- 3. CHECKOUT PAGE (checkout.html) ---
function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return; // Exit if not on checkout.html

  const cart = getCart();

  // ONLY redirect if you are on checkout.html with 0 items
  if (cart.length === 0) {
    window.location.href = 'shop.html';
    return;
  }

  const summaryList = document.getElementById('summary-items-list');
  const summaryTotal = document.getElementById('checkout-total-amount');

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (summaryList) {
    summaryList.innerHTML = cart.map(item => `
      <div class="summary-item">
        <span>${item.name} (x${item.quantity})</span>
        <span>₦${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
  }

  if (summaryTotal) summaryTotal.textContent = `₦${totalPrice.toFixed(2)}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const orderData = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString(),
      customer: {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value
      },
      items: cart,
      totalAmount: totalPrice
    };

    localStorage.setItem('latest_order', JSON.stringify(orderData));
    localStorage.removeItem('store_cart');
    window.location.href = 'confirmation.html';
  });
}

// --- 4. CONFIRMATION PAGE (confirmation.html) ---
function initConfirmationPage() {
  const receiptContainer = document.getElementById('receipt-order-id');
  if (!receiptContainer) return; // Exit if not on confirmation.html

  const latestOrder = JSON.parse(localStorage.getItem('latest_order'));
  if (!latestOrder) {
    window.location.href = 'shop.html';
    return;
  }

  document.getElementById('receipt-order-id').textContent = `Order #${latestOrder.orderId}`;
  document.getElementById('receipt-date').textContent = latestOrder.date;
  document.getElementById('receipt-customer-name').textContent = latestOrder.customer.name;
  document.getElementById('receipt-customer-address').textContent = latestOrder.customer.address;
  document.getElementById('receipt-customer-phone').textContent = latestOrder.customer.phone;
  document.getElementById('receipt-total-amount').textContent = `₦${latestOrder.totalAmount.toFixed(2)}`;

  document.getElementById('receipt-items-list').innerHTML = latestOrder.items.map(item => `
    <div class="summary-item">
      <span>${item.name} x ${item.quantity}</span>
      <span>₦${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
}

// Safe Single-Page Target Initializer
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initStorePage();
  initCartPage();
  initCheckoutPage();
  initConfirmationPage();
});