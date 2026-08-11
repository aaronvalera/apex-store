import { updateNavbarCart } from "/helpers/updateNavbarCart.js";

const ensureModalInDOM = () => {
  if (!document.getElementById("cart_modal")) {
    const cartModalHTML = `
      <dialog id="cart_modal" class="modal modal-bottom sm:modal-middle">
        <div class="modal-box w-full max-w-4xl bg-white p-4 sm:p-6 shadow-2xl relative border border-slate-200 rounded-2xl">
          <!-- Close Button (X) -->
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition-colors">✕</button>
          </form>
          <!-- Modal Header -->
          <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h3 class="font-extrabold text-xl sm:text-2xl text-slate-900">Shopping Cart</h3>
          </div>
          <!-- Dynamic Content (Product List) -->
          <div id="cart-modal-content" class="overflow-y-auto max-h-[60vh] pr-1"></div>
          <!-- Footer with Subtotal and Actions -->
          <div id="cart-modal-footer" class="border-t border-slate-100 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-center sm:text-left w-full sm:w-auto">
              <span class="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">Estimated Subtotal</span>
              <div id="cart-modal-subtotal" class="text-2xl font-black text-slate-900">$0.00</div>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <form method="dialog" class="w-1/2 sm:w-auto">
                <button class="btn btn-ghost text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl w-full">Continue Shopping</button>
              </form>
              <a href="/checkout" id="btn-checkout" class="btn bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border-none w-1/2 sm:w-auto px-8 rounded-xl shadow-md transition-all">
                Proceed to Checkout
              </a>
            </div>
          </div>
        </div>
        <!-- Backdrop -->
        <form method="dialog" class="modal-backdrop bg-slate-900/60 backdrop-blur-xs">
          <button>close</button>
        </form>
      </dialog>
    `;
    document.body.insertAdjacentHTML("beforeend", cartModalHTML);
  }
};

// 2. Read localStorage and render the list of products
export const renderCartModal = () => {
  ensureModalInDOM();

  const container = document.getElementById("cart-modal-content");
  const subtotalEl = document.getElementById("cart-modal-subtotal");
  const checkoutBtn = document.getElementById("btn-checkout");

  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-4xl mb-3">🛒</p>
        <p class="text-lg font-bold text-slate-800">Your cart is empty</p>
        <p class="text-xs text-slate-400 mt-1">Explore our catalog and add your favorite items!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (checkoutBtn) checkoutBtn.classList.add("btn-disabled");
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove("btn-disabled");

  // Render Product List State
  let html = `<div class="divide-y divide-slate-100">`;
  let subtotal = 0;

  cart.forEach((item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    const cartItemId = item.cartItemId || `${item.id}-${item.colorName || ''}-${item.size || ''}`;
    html += `
      <div class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- Info & Image -->
        <div class="flex items-center gap-4 w-full sm:w-1/2">
          <img src="${item.image || '/images/placeholder.png'}" 
               alt="${item.name}" 
               class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"/>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-slate-900 text-sm sm:text-base truncate">${item.name}</h4>
            <!-- Variants: Color and Size badges -->
            <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
              ${item.colorName ? `
                <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold text-[11px]">
                  <span class="w-2.5 h-2.5 rounded-full border border-black/20 inline-block shrink-0 shadow-xs" style="background-color: ${item.colorHex || '#000'}"></span>
                  ${item.colorName}
                </span>
              ` : ''}
              ${item.size ? `
                <span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px] border border-slate-200">Size: ${item.size}</span>
              ` : ''}
            </div>
            <div class="text-sm font-black text-slate-900 mt-1.5">$${price.toFixed(2)}</div>
          </div>
        </div>
        <!-- Quantity controls (+ / -), Total & Delete button -->
        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-1/2">
          <div class="inline-flex border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
            <button onclick="changeCartQuantity('${cartItemId}', -1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition-colors">-</button>
            <span class="px-3 py-1 text-xs font-bold bg-white text-slate-900 flex items-center justify-center min-w-8">
              ${quantity}
            </span>
            <button onclick="changeCartQuantity('${cartItemId}', 1)" class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition-colors">+</button>
          </div>
          <div class="text-right font-black text-slate-900 text-base w-20">
            $${itemTotal.toFixed(2)}
          </div>
          <button onclick="removeCartItem('${cartItemId}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg" title="Remove item">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
};

// 3. Open Modal Helper
export const openCartModal = () => {
  renderCartModal();
  const modal = document.getElementById("cart_modal");
  if (modal) modal.showModal();
};

window.openCartModal = openCartModal;

window.changeCartQuantity = (cartItemId, delta) => {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const index = cart.findIndex(item => 
    (item.cartItemId || `${item.id}-${item.colorName || ''}-${item.size || ''}`) === cartItemId
  );

  if (index !== -1) {
    const item = cart[index];
    const newQuantity = item.quantity + delta;

    if (delta > 0 && item.stock && newQuantity > item.stock) {
      return;
    }

    cart[index].quantity = newQuantity;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateNavbarCart();
    renderCartModal();
    
    // Dispatch custom event to notify listeners on the same page
    window.dispatchEvent(new Event("cartUpdated"));
  }
};

window.removeCartItem = (cartItemId) => {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter(item => 
    (item.cartItemId || `${item.id}-${item.colorName || ''}-${item.size || ''}`) !== cartItemId
  );
  localStorage.setItem("cart", JSON.stringify(cart));
  updateNavbarCart();
  renderCartModal();

  // Dispatch custom event to notify listeners on the same page
  window.dispatchEvent(new Event("cartUpdated"));
};