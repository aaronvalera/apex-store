import { IMAGE_PLACEHOLDER, resolveImageUrl } from "/helpers/dashboardImageHelper.js";

export const createProductRow = (product, { imagePlaceholder = IMAGE_PLACEHOLDER } = {}) => {
    const productId = product._id || product.id;
    const mainImage = resolveImageUrl(product.variants?.[0]?.images?.[0]?.url, imagePlaceholder);

    const totalStock = product.variants?.reduce((acc, variant) => {
        const variantStock = variant.sizes?.reduce((sAcc, s) => sAcc + (Number(s.stock) || 0), 0) || 0;
        return acc + variantStock;
    }, 0) || 0;

    const categoriesNames = product.categories?.map(category => 
        typeof category === 'object' ? category.name : category
    ).join(", ") || "Uncategorized";

    return `
        <tr class="hover:bg-base-200/40 text-xs sm:text-sm">
            <td>
                <div class="flex items-center gap-3">
                    <div class="avatar shrink-0">
                        <div class="mask mask-squircle w-10 h-10 sm:w-12 sm:h-12 bg-base-200">
                            <img src="${mainImage}" alt="${product.name}" onerror="this.onerror=null; this.src='${imagePlaceholder}';"/>
                        </div>
                    </div>
                    <div class="max-w-32 sm:max-w-none space-y-0.5">
                        <div class="font-bold truncate text-xs sm:text-sm">${product.name}</div>
                        <div class="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-base-content/70">
                            <span>${product.variants?.length || 0} variant(s)</span>
                            <span class="opacity-40">•</span>
                            <span class="font-semibold ${totalStock > 0 ? 'text-accent' : 'text-error'}">Stock: ${totalStock}</span>
                            <span class="sm:hidden opacity-40">•</span>
                            <span class="sm:hidden badge badge-ghost badge-xs font-medium">${categoriesNames}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="font-bold text-primary">$${product.price}</td>
            <td class="hidden md:table-cell text-sm">${product.material || 'N/A'}</td>
            <td class="hidden sm:table-cell"><span class="badge badge-ghost badge-sm">${categoriesNames}</span></td>
            <td class="hidden lg:table-cell">
                <div class="flex flex-wrap gap-1">
                    ${product.isActive ? '<span class="badge badge-success badge-xs">Active</span>' : '<span class="badge badge-ghost badge-xs">Inactive</span>'}
                    ${product.isFeatured ? '<span class="badge badge-secondary badge-xs">Featured</span>' : ''}
                    ${product.isNewProduct ? '<span class="badge badge-accent badge-xs">New</span>' : ''}
                </div>
            </td>
            <td>
                <div class="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                    <button class="btn btn-xs btn-outline edit-prod-btn" data-id="${productId}">Edit</button>
                    <button class="btn btn-xs btn-error btn-outline delete-prod-btn" data-id="${productId}">Delete</button>
                </div>
            </td>
        </tr>
    `;
};

const renderSizeInputs = (sizesList, variantIndex, allowedSizes) => {
    return sizesList.map((sizeObject, sizeIndex) => {
        const sizeOptions = allowedSizes.map(size => 
            `<option value="${size}" ${sizeObject.size === size ? 'selected' : ''}>${size}</option>`
        ).join('');

        return `
            <div class="flex items-center gap-2">
                <select class="select select-xs sm:select-sm select-bordered w-1/2 var-size-name" data-variant-index="${variantIndex}" data-size-index="${sizeIndex}">
                    <option value="" disabled ${!sizeObject.size ? 'selected' : ''}>Select Size</option>
                    ${sizeOptions}
                </select>
                <input type="number" min="0" class="input input-xs sm:input-sm input-bordered w-1/2 var-size-stock" data-variant-index="${variantIndex}" data-size-index="${sizeIndex}" value="${sizeObject.stock !== undefined ? sizeObject.stock : 0}" placeholder="Stock"/>
                <button type="button" class="btn btn-xs btn-ghost btn-square text-error remove-size-btn" data-variant-index="${variantIndex}" data-size-index="${sizeIndex}">✕</button>
            </div>
        `;
    }).join('');
};

export const createVariantCard = (variantItem, index, allowedSizes = []) => {
    const sizesHtml = renderSizeInputs(variantItem.sizes || [], index, allowedSizes);

    return `
        <div class="p-4 bg-base-200/60 rounded-xl border border-base-300 relative space-y-3">
            <button type="button" class="btn btn-xs btn-circle btn-error absolute right-2 top-2 remove-variant-btn text-white" data-index="${index}">✕</button>
            <h4 class="font-bold text-xs uppercase tracking-wider text-base-content/70">Variant #${index + 1}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label class="label py-1"><span class="label-text text-xs font-semibold">Color Name *</span></label>
                    <input type="text" class="input input-sm input-bordered w-full var-color-name" data-index="${index}" value="${variantItem.colorName || ''}" placeholder="e.g. Matte Black"/>
                </div>
                <div>
                    <label class="label py-1"><span class="label-text text-xs font-semibold">Hex Color *</span></label>
                    <input type="text" class="input input-sm input-bordered w-full var-color-hex" data-index="${index}" value="${variantItem.colorHex || '#000000'}" placeholder="#000000"/>
                </div>
                <div>
                    <label class="label py-1"><span class="label-text text-xs font-semibold">SKU *</span></label>
                    <input type="text" class="input input-sm input-bordered w-full var-sku" data-index="${index}" value="${variantItem.sku || ''}" placeholder="e.g. APX-TS-001-BLK"/>
                </div>
            </div>
            <div>
                <label class="label py-1"><span class="label-text text-xs font-semibold">Image URL *</span></label>
                <input type="url" class="input input-sm input-bordered w-full var-image-url" data-index="${index}" value="${variantItem.images?.[0]?.url || ''}" placeholder="https://res.cloudinary.com/..."/>
            </div>
            <div class="space-y-2 pt-2 border-t border-base-300/60">
                <div class="flex items-center justify-between">
                    <span class="label-text text-xs font-semibold">Sizes & Stock</span>
                    <button type="button" class="btn btn-xs btn-outline btn-accent add-size-btn" data-variant-index="${index}">+ Add Size</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${sizesHtml}
                </div>
            </div>
        </div>
    `;
};