window.updateCardImage = (productId, newSrc) => {
  const image = document.getElementById(`card-img-${productId}`);
  if (image) image.src = newSrc;
};

export const createProductCard = (product) => {
    const productId = product._id || product.id;

    const mainVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : {};

    const imageUrl = (mainVariant.images && mainVariant.images.length > 0 && mainVariant.images[0].url)
        ? mainVariant.images[0].url
        : "https://placehold.co/800x800/png?text=No+Image";

    const productName = product.name || "Unnamed Product";
    const price = mainVariant.price || product.price || 0;
    
    const categoryName = product.categories && product.categories.length > 0
        ? (product.categories[0].name || product.categories[0])
        : "General";

    const description = product.description || "";

    return `
        <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
            <figure class="px-4 pt-4">
                <img id="card-img-${productId}" src="${imageUrl}" alt="${productName}" class="rounded-xl h-52 w-full object-cover" loading="lazy"/>
            </figure>
            <div class="card-body p-5">
                <span class="text-xs font-semibold text-primary uppercase tracking-wider">${categoryName}</span>
                <h2 class="card-title text-base font-bold mt-1">${productName}</h2>
                <p class="text-xs text-base-content/70 line-clamp-2">${description}</p>
                <div class="card-actions justify-between items-center mt-4">
                    <span class="text-lg font-bold">$${Number(price).toFixed(2)}</span>
                    <a href="/product/?id=${productId}" class="btn btn-primary btn-sm">View Details</a>
                    <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${productId}" data-name="${productName}" data-price="${price}" data-image="${imageUrl}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}