import { IMAGE_PLACEHOLDER, resolveImageUrl } from "/helpers/dashboardImageHelper.js";

export const getAvailableStock = (product, selectedVariant, selectedSize) => {
  if (selectedVariant?.sizes && Array.isArray(selectedVariant.sizes)) {
    const sizeObject = selectedVariant.sizes.find(size => typeof size === 'object' && size !== null && (size.size === selectedSize || size.name === selectedSize));
    if (sizeObject && typeof sizeObject.stock === 'number') {
      return sizeObject.stock;
    }
  }

  if (typeof selectedVariant?.stock === 'number' && selectedVariant.stock > 0) {
    return selectedVariant.stock;
  }

  if (typeof product?.stock === 'number' && product.stock > 0) {
    return product.stock;
  }

  if (selectedVariant?.stock === 0 || product?.stock === 0) {
    return 0;
  }

  return 10;
};

export const createProductDetails = (product, selectedVariant, selectedSize, selectedQuantity) => {
  const images = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : ((product.images && product.images.length > 0) ? product.images : [{ url: "https://placehold.co/800x800/png?text=No+Image", alt: product.name }]);

  const mainImgUrl = resolveImageUrl(images[0]?.url)
  const currentPrice = selectedVariant?.price || product.price || 0;
  
  const availableStock = getAvailableStock(product, selectedVariant, selectedSize);
  const isOutOfStock = availableStock <= 0;

  const categoryName = (product.categories && product.categories.length > 0)
    ? (product.categories[0].name || product.categories[0])
    : "Collection";

  const sizesArray = selectedVariant?.sizes || product.sizes || [];
  const normalizedSizes = sizesArray.map(size => {
    if (typeof size === 'object' && size !== null) {
      return size.size || size.name || size.label || JSON.stringify(size);
    }
    return size;
  });

  return `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
      <!-- Top Navigation: Back Button Breadcrumb -->
      <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
        <button onclick="window.history.back()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </button>
        <div class="breadcrumbs text-xs text-slate-500 overflow-x-auto p-0">
          <ul>
            <li><a href="/" class="hover:text-black transition-colors">Home</a></li>
            <li><a href="/catalog" class="hover:text-black transition-colors">Catalog</a></li>
            <li><a href="/catalog?category=${encodeURIComponent(categoryName)}" class="hover:text-black transition-colors">${categoryName}</a></li>
            <li class="font-bold text-slate-900 truncate max-w-45 sm:max-w-70">${product.name}</li>
          </ul>
        </div>
      </div>
      <!-- Main Layout: 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <!-- Left column: Gallery & Variant Carousel -->
        <div class="lg:col-span-6 space-y-3">
          <!-- Main Image Container -->
          <div id="main-image-viewport" class="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200 aspect-square max-h-95 sm:max-h-105 w-full mx-auto cursor-crosshair group shadow-sm flex items-center justify-center">
            <img id="main-product-img" src="${mainImgUrl}" alt="${images[0]?.alt || product.name}" onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-125 transform-origin-center"/>
            ${isOutOfStock ? `
                <div class="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">Out of Stock</div>
              ` : ''}
          </div>
          <!-- Thumbnails Carousel for Current Selected Variant -->
          ${images.length > 1 ? `
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              ${images.map((image, index) => `
                <button onclick="changeMainImage('${image.url}', ${index})" class="thumb-btn border-2 rounded-lg overflow-hidden w-16 h-16 shrink-0 transition-all ${index === 0 ? 'border-black ring-1 ring-black' : 'border-slate-200 hover:border-slate-400'}">
                  <img src="${image.url}" alt="${image.alt || ''}" class="w-full h-full object-cover" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <!-- Right column: Compact Controls & Specs -->
        <div class="lg:col-span-6 space-y-4">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-widest text-slate-500">${categoryName}</span>
              <span class="text-[11px] font-mono text-slate-400">SKU: ${selectedVariant?.sku || product.sku || 'N/A'}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">${product.name}</h1>
          </div>
          <!-- Price & Stock Badge -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="text-2xl font-black text-slate-900">$${Number(currentPrice).toFixed(2)}</div>
            <div>
              ${isOutOfStock ? `
                <span class="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">Out of Stock</span>
              ` : `
                <span class="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">In Stock (${availableStock} left)</span>
              `}
            </div>
          </div>
          <!-- Color Variants Selection -->
          ${product.variants && product.variants.length > 0 ? `
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Color: <span id="selected-color-label" class="font-normal text-slate-600 capitalize">${selectedVariant?.colorName}</span>
              </label>
              <div class="flex flex-wrap items-center gap-2.5">
                ${product.variants.map((variant, index) => `
                  <button onclick="selectVariant(${index})" title="${variant.colorName}" class="variant-btn relative w-8 h-8 rounded-full border transition-all flex items-center justify-center p-0.5 ${variant.colorName === selectedVariant?.colorName ? 'border-black ring-2 ring-black/20 scale-105' : 'border-slate-300 hover:border-slate-500'}">
                    <span class="w-full h-full rounded-full border border-black/10 inline-block" style="background-color: ${variant.colorHex || '#000'}"></span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
          <!-- Size Selection -->
          ${normalizedSizes.length > 0 ? `
            <div class="space-y-2">
              <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-800">
                <span>Select Size</span>
                <span class="text-xs font-normal normal-case text-slate-500 hover:text-black cursor-pointer underline">Size Guide</span>
              </div>
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                ${normalizedSizes.map(size => {
                  const safeSize = String(size).replace(/'/g, "\\'");
                  return `
                    <button onclick="selectSize('${safeSize}')" class="size-btn py-1.5 px-3 text-xs font-bold rounded-lg border transition-all ${size === selectedSize ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}">
                      ${size}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
          <!-- Quantity Selector -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-800">Quantity</label>
            <div class="inline-flex border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
              <button onclick="updateQuantity(-1)" ${isOutOfStock ? 'disabled' : ''} class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors disabled:opacity-40">-</button>
              <input type="number" id="quantity-input" value="${selectedQuantity}" min="1" max="${availableStock}" oninput="handleQuantityInput(this.value)" ${isOutOfStock ? 'disabled' : ''} class="w-12 text-center text-xs font-bold bg-white text-slate-900 border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
              <button onclick="updateQuantity(1)" ${isOutOfStock ? 'disabled' : ''} class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors disabled:opacity-40">+</button>
            </div>
          </div>
          <!-- Add to Cart -->
          <div class="pt-1 space-y-2">
            ${isOutOfStock ? `
              <button disabled class="w-full py-3 bg-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed">Out of Stock</button>
            ` : `
              <button onclick="handleAddToCart()" class="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>
            `}
          </div>
          <!-- Accordions -->
          <div class="space-y-2 pt-4 border-t border-slate-100">
            <div class="collapse collapse-plus bg-slate-50 rounded-xl border border-slate-200">
              <input type="checkbox"/> 
              <div class="collapse-title font-bold text-xs text-slate-800">Product Description</div>
              <div class="collapse-content text-xs text-slate-600 leading-relaxed">
                <p>${product.description || "No detailed description available for this item."}</p>
              </div>
            </div>
            <div class="collapse collapse-plus bg-slate-50 rounded-xl border border-slate-200">
              <input type="checkbox"/> 
              <div class="collapse-title font-bold text-xs text-slate-800">Materials & Care</div>
              <div class="collapse-content text-xs text-slate-600 leading-relaxed">
                <ul class="list-disc list-inside space-y-1">
                  <li>${product.materials || "Premium durable fabric blend"}</li>
                  <li>Machine wash cold with like colors</li>
                  <li>Tumble dry low or hang dry for best longevity</li>
                </ul>
              </div>
            </div>
            <div class="collapse collapse-plus bg-slate-50 rounded-xl border border-slate-200">
              <input type="checkbox"/> 
              <div class="collapse-title font-bold text-xs text-slate-800">Shipping & Returns</div>
              <div class="collapse-content text-xs text-slate-600 leading-relaxed">
                <p>Free standard express shipping on orders over $100. Easy 30-day hassle-free return policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const renderSkeleton = () => {
  return `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <!-- Breadcrumb Skeleton -->
      <div class="skeleton h-4 w-1/4"></div>
      <!-- Main Layout Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-6 h-95 skeleton rounded-xl"></div>
        <div class="lg:col-span-6 space-y-4">
          <div class="skeleton h-8 w-3/4"></div>
          <div class="skeleton h-6 w-1/3"></div>
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-24 w-full"></div>
        </div>
      </div>
    </div>
  `;
};

export const displayError = (message) => {
  return `
    <div class="max-w-md mx-auto px-4 py-16 text-center">
      <p class="text-4xl mb-3">🔍</p>
      <h2 class="text-xl font-extrabold text-slate-900 mb-1">Product Not Found</h2>
      <p class="text-xs text-slate-500 mb-5">${message}</p>
      <a href="/catalog" class="inline-block bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all">Back to Catalog</a>
    </div>
  `;
}