import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { displayNotification } from "/components/notification.js";
import { getAvailableStock, createProductDetails, renderSkeleton, displayError } from "/components/productDetails.js";
import { openCartModal } from "/components/cartModal.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";

// State
let currentProduct = null;
let selectedVariant = null;
let selectedSize = null;
let selectedQuantity = 1;

document.addEventListener("DOMContentLoaded", async () => {
  adaptNavbar();
  updateNavbarCart();

  const productId = new URLSearchParams(window.location.search).get("id");
  if (!productId || productId === "undefined") {
    displayProductError("Invalid or missing product ID.");
    return;
  }

  await fetchProductDetails(productId);
});

const extractFirstSize = (variant, product) => {
  const sizes = variant?.sizes || product?.sizes || [];
  if (!sizes.length) return null;

  const rawSize = sizes[0];
  return typeof rawSize === "object" && rawSize !== null
    ? rawSize.size || rawSize.name || rawSize
    : rawSize;
};

const createDefaultVariant = (product) => {
  return {
    colorName: "Standard",
    colorHex: "#000000",
    sku: product.sku || "N/A",
    stock: product.stock || 0,
    images: product.images || [],
    sizes: product.sizes || ["S", "M", "L", "XL"]
  };
};

// Fetch Product Data
const fetchProductDetails = async (id) => {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  try {
    container.innerHTML = renderSkeleton();

    const { data } = await axios.get(`/api/products/${id}`);
    currentProduct = data.data;

    selectedVariant = currentProduct.variants?.[0] ?? createDefaultVariant(currentProduct);
    selectedSize = extractFirstSize(selectedVariant, currentProduct);

    renderProductDetailsPage();
  } catch (error) {
    console.error("Error loading product details:", error);
    const errorMessage = error.response?.data?.message || "The requested product could not be found or loaded.";
    displayProductError(errorMessage);
  }
};

// Render product details page
const renderProductDetailsPage = () => {
  const container = document.getElementById("product-detail-container");
  if (!container || !currentProduct) return;

  container.innerHTML = createProductDetails(currentProduct, selectedVariant, selectedSize, selectedQuantity);

  setupZoomEffect();
};

// Interactive image zoom
const setupZoomEffect = () => {
  const viewport = document.getElementById("main-image-viewport");
  const image = document.getElementById("main-product-img");
  if (!viewport || !image) return;

  viewport.addEventListener("mousemove", (event) => {
    const { left, top, width, height } = viewport.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
  });

  viewport.addEventListener("mouseleave", () => {
    image.style.transformOrigin = "center center";
  });
};

// --- GLOBAL EVENT HANDLERS (EXPOSED TO WINDOW) ---

window.changeMainImage = (url, activeIndex) => {
  const mainImage = document.getElementById("main-product-img");
  if (mainImage) mainImage.src = url;

  document.querySelectorAll(".thumb-btn").forEach((button, index) => {
    const isActive = index === activeIndex;
    button.className = `thumb-btn border-2 rounded-lg overflow-hidden w-16 h-16 shrink-0 transition-all ${
      isActive ? "border-black ring-1 ring-black" : "border-slate-200 hover:border-slate-400"
    }`;
  });
};

window.selectVariant = (variantIndex) => {
  const variant = currentProduct?.variants?.[variantIndex];
  if (!variant) return;

  selectedVariant = variant;
  selectedSize = extractFirstSize(selectedVariant, currentProduct);
  selectedQuantity = 1;
  renderProductDetailsPage();
};

window.selectSize = (size) => {
  selectedSize = size;
  selectedQuantity = 1;
  renderProductDetailsPage();
};

window.updateQuantity = (delta) => {
  const stock = getAvailableStock(currentProduct, selectedVariant, selectedSize);
  if (selectedQuantity + delta < 1 || selectedQuantity + delta > stock) return;

  selectedQuantity += delta;
  const quantityDisplay = document.getElementById("quantity-display");
  if (quantityDisplay) quantityDisplay.textContent = selectedQuantity;
};

window.handleAddToCart = () => {
  if (!currentProduct) return;

  const stock = getAvailableStock(currentProduct, selectedVariant, selectedSize);
  if (stock <= 0) return;

  const productId = currentProduct._id || currentProduct.id;
  const colorName = selectedVariant?.colorName || "default";
  const cartItemId = `${productId}-${colorName}-${selectedSize || "none"}`;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

  const currentInCart = existingIndex !== -1 ? cart[existingIndex].quantity : 0;
  if (currentInCart + selectedQuantity > stock) {
    displayNotification(true, `Cannot add more units. Maximum stock available: ${stock}`, 4000);
    return;
  }

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += selectedQuantity;
    cart[existingIndex].stock = stock;
  } else {
    const image = selectedVariant?.images?.[0]?.url || currentProduct.images?.[0]?.url || "";
    const price = selectedVariant?.price || currentProduct.price || 0;
    const colorHex = selectedVariant?.colorHex;
    const sku = selectedVariant?.sku || currentProduct.sku;

    const cartItem = { cartItemId, id: productId, name: currentProduct.name, price, image, colorName, colorHex, size: selectedSize, quantity: selectedQuantity, sku, stock };
    cart.push(cartItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateNavbarCart();
  openCartModal();
};

const displayProductError = (message) => {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  container.innerHTML = displayError(message);
};