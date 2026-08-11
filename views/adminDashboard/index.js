import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { displayNotification } from "/components/notification.js";
import { createProductRow, createVariantCard } from "/components/dashboardTable.js";
import { IMAGE_PLACEHOLDER, resolveImageUrl } from "/helpers/dashboardImageHelper.js";

axios.defaults.withCredentials = true;

const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// State
let currentProducts = [];
let currentCategories = [];
let editingProductId = null;
let editingCategoryId = null;
let productVariantsState = [];

let pendingDeleteType = null;
let pendingDeleteId = null;

let DOM = {};

const initDOMCache = () => {
    DOM = {
        prodCategoriesContainer: document.getElementById("prod-categories-container"),
        categoriesGrid: document.getElementById("categories-grid"),
        productsTableBody: document.getElementById("products-table-body"),
        variantsContainer: document.getElementById("variants-container"),
        productModal: document.getElementById("product-modal"),
        categoryModal: document.getElementById("category-modal"),
        confirmModal: document.getElementById("confirm-modal"),
        productForm: document.getElementById("product-form"),
        categoryForm: document.getElementById("category-form"),
        confirmTitle: document.getElementById("confirm-title"),
        confirmMessage: document.getElementById("confirm-message"),
        confirmCancelBtn: document.getElementById("confirm-cancel-btn"),
        confirmActionBtn: document.getElementById("confirm-action-btn"),
        modalTitle: document.getElementById("modal-title"),
        categoryModalTitle: document.getElementById("category-modal-title"),
        tableProductButton: document.getElementById("tab-products-btn"),
        tableCategoryButton: document.getElementById("tab-categories-btn"),
        tableProductContent: document.getElementById("tab-products-content"),
        tableCategoryContent: document.getElementById("tab-categories-content"),
        openCreateCatBtn: document.getElementById("open-create-category-btn"),
        openCreateProdBtn: document.getElementById("open-create-product-btn"),
        addVariantBtn: document.getElementById("add-variant-btn"),
    };
};

// 2. Handler of API requests
const handleApiCall = async (apiFn, successMessage, modalToClose = null) => {
    try {
        await apiFn();
        if (modalToClose) modalToClose.close();
        displayNotification(false, successMessage, 4000);
        return true;
    } catch (error) {
        console.error("API Error:", error);
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;
        if (isAuthError && modalToClose) {
            modalToClose.close();
        }
        
        let errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred";
        if (!errorMessage || errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
            errorMessage = "Network error: Server unreachable or no internet connection.";
        }

        displayNotification(true, errorMessage, 4000);
        return false;
    }
};

const getDefaultSizesArray = () => ALLOWED_SIZES.map(size => ({ size, stock: 0 }));

// 3. Function for validation of products
const validateProductForm = (payload, variants, rawPriceInput = "") => {
    if (!payload.name) return "Product Name is required.";
    if (rawPriceInput.trim() === "" || isNaN(payload.price) || payload.price < 0) {
        return "Please enter a valid price (minimum 0).";
    }
    if (!payload.description) return "Description is required.";
    if (!payload.categories || payload.categories.length === 0) return "Please select at least one Category for the product.";
    if (!variants || variants.length === 0) return "At least one Variant is required.";

    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantNumber = i + 1;

        if (!variant.colorName || !variant.colorName.trim()) return `Variant #${variantNumber}: Color Name is required.`;
        if (!variant.sku || !variant.sku.trim()) return `Variant #${variantNumber}: SKU is required.`;

        const imageUrl = variant.images?.[0]?.url;
        if (!imageUrl || !imageUrl.trim()) return `Variant #${variantNumber}: Image URL is required.`;

        if (variant.sizes && variant.sizes.length > 0) {
            for (let sizeIndex = 0; sizeIndex < variant.sizes.length; sizeIndex++) {
                const sizeObject = variant.sizes[sizeIndex];
                if (!ALLOWED_SIZES.includes(sizeObject.size)) {
                    return `Variant #${variantNumber}: Invalid size "${sizeObject.size}". Allowed: ${ALLOWED_SIZES.join(", ")}`;
                }
            }
        }
    }
    return null;
};

// Category checkboxes
const renderCategoryCheckboxes = (selectedCategoryIds = []) => {
    const container = DOM.prodCategoriesContainer;
    if (!container) return;

    if (!currentCategories || currentCategories.length === 0) {
        container.innerHTML = `<span class="text-xs text-base-content/50 italic">No categories registered yet</span>`;
        return;
    }

    container.innerHTML = currentCategories.map(category => {
        const categoryId = category._id || category.id;
        const isSelected = selectedCategoryIds.includes(categoryId);
        return `
            <label class="cursor-pointer">
                <input type="checkbox" name="product-category" value="${categoryId}" class="hidden cat-checkbox-input" ${isSelected ? 'checked' : ''}/>
                <span class="badge ${isSelected ? 'badge-primary' : 'badge-outline'} badge-md p-3 gap-1 select-none transition-all hover:scale-105">
                    ${category.name}
                </span>
            </label>
        `;
    }).join("");
};

// Categories grid
const renderCategoriesGrid = () => {
    const grid = DOM.categoriesGrid;
    if (!grid) return;

    if (currentCategories.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-sm opacity-60">No categories registered yet.</div>`;
        return;
    }

    grid.innerHTML = currentCategories.map(category => {
        const categoryId = category._id || category.id;
        const categoryImage = resolveImageUrl(category.image);

        return `
            <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <figure class="h-44 bg-base-200 relative overflow-hidden">
                    <img src="${categoryImage}" alt="${category.name}" 
                        onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';" 
                        class="w-full h-full object-cover"/>
                </figure>
                <div class="card-body p-5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                        <h3 class="card-title text-base sm:text-lg font-bold">${category.name}</h3>
                        <p class="text-xs sm:text-sm text-base-content/70 mt-1 line-clamp-2">${category.description || "No description provided."}</p>
                    </div>
                    <div class="card-actions justify-end gap-2 pt-3 border-t border-base-200/60 mt-auto">
                        <button class="btn btn-xs sm:btn-sm btn-outline edit-cat-btn" data-id="${categoryId}">Edit</button>
                        <button class="btn btn-xs sm:btn-sm btn-error btn-outline delete-cat-btn" data-id="${categoryId}">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
};

// Products
const renderProductsTable = () => {
    const tableBody = DOM.productsTableBody;
    if (!tableBody) return;

    if (currentProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6">No products found in catalog</td></tr>`;
        return;
    }

    tableBody.innerHTML = currentProducts
        .map(product => createProductRow(product, { imagePlaceholder: IMAGE_PLACEHOLDER }))
        .join("");
};

// Variants
const renderVariantsForm = () => {
    const container = DOM.variantsContainer;
    if (!container) return;

    container.innerHTML = productVariantsState.map((variantItem, index) => {
        if (!variantItem.sizes || variantItem.sizes.length === 0) {
            variantItem.sizes = getDefaultSizesArray();
        }
        return createVariantCard(variantItem, index, ALLOWED_SIZES);
    }).join("");
};

// Get categories
const loadCategories = async () => {
    try {
        const response = await axios.get("/api/categories");
        currentCategories = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        renderCategoriesGrid();
        renderCategoryCheckboxes();
    } catch (error) {
        console.error("Error loading categories:", error);
        if (DOM.categoriesGrid) {
            DOM.categoriesGrid.innerHTML = `<div class="col-span-full text-center py-8 text-sm text-error">Failed to load categories from server</div>`;
        }
    }
};

// Get products
const loadProducts = async () => {
    try {
        const response = await axios.get("/api/products?limit=100");
        currentProducts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        renderProductsTable();
    } catch (error) {
        console.error("Error loading products:", error);
        if (DOM.productsTableBody) {
            DOM.productsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-error">Failed to load products</td></tr>`;
        }
    }
};

// --- MODALS TO UPDATE PRODUCTS AND CATEGORIES ---

const openEditCategoryModal = (id) => {
    const category = currentCategories.find(category => (category._id || category.id) === id);
    if (!category) return;

    editingCategoryId = id;
    DOM.categoryModalTitle.textContent = "Edit Category";
    document.getElementById("cat-name").value = category.name || "";
    document.getElementById("cat-image").value = category.image || "";
    document.getElementById("cat-desc").value = category.description || "";

    DOM.categoryModal.showModal();
};

const openEditProductModal = (id) => {
    const product = currentProducts.find(product => (product._id || product.id) === id);
    if (!product) return;

    editingProductId = id;
    DOM.modalTitle.textContent = "Edit Product";
    document.getElementById("prod-name").value = product.name || "";
    document.getElementById("prod-price").value = product.price || "";
    document.getElementById("prod-material").value = product.material || "100% Cotton";
    document.getElementById("prod-description").value = product.description || "";
    document.getElementById("prod-is-active").checked = !!product.isActive;
    document.getElementById("prod-is-featured").checked = !!product.isFeatured;
    document.getElementById("prod-is-new").checked = !!product.isNewProduct;

    const selectedCategoryIds = product.categories?.map(category => typeof category === 'object' ? (category._id || category.id) : category) || [];
    renderCategoryCheckboxes(selectedCategoryIds);

    productVariantsState = JSON.parse(JSON.stringify(product.variants || []));
    if (productVariantsState.length === 0) {
        productVariantsState = [{ 
            colorName: "", 
            colorHex: "#000000", 
            sku: "", 
            images: [{ url: "", publicID: "apex-store/products/default" }], 
            sizes: getDefaultSizesArray() 
        }];
    }
    renderVariantsForm();

    DOM.productModal.showModal();
};

// Confirmation modal
const showDeleteConfirm = (type, id) => {
    pendingDeleteType = type;
    pendingDeleteId = id;

    if (type === "product") {
        DOM.confirmTitle.textContent = "Delete Product";
        DOM.confirmMessage.textContent = "Are you sure you want to delete this product? This action cannot be undone.";
    } else {
        DOM.confirmTitle.textContent = "Delete Category";
        DOM.confirmMessage.textContent = "Are you sure you want to delete this category? This action cannot be undone.";
    }

    DOM.confirmModal.showModal();
};

const setupEventDelegation = () => {
    DOM.categoriesGrid?.addEventListener("click", (event) => {
        const editButton = event.target.closest(".edit-cat-btn");
        if (editButton) return openEditCategoryModal(editButton.dataset.id);

        const deleteButton = event.target.closest(".delete-cat-btn");
        if (deleteButton) return showDeleteConfirm("category", deleteButton.dataset.id);
    });

    DOM.productsTableBody?.addEventListener("click", (event) => {
        const editButton = event.target.closest(".edit-prod-btn");
        if (editButton) return openEditProductModal(editButton.dataset.id);

        const deleteButton = event.target.closest(".delete-prod-btn");
        if (deleteButton) return showDeleteConfirm("product", deleteButton.dataset.id);
    });

    DOM.prodCategoriesContainer?.addEventListener("change", (event) => {
        if (event.target.classList.contains("cat-checkbox-input")) {
            const badge = event.target.nextElementSibling;
            if (badge) {
                badge.classList.toggle("badge-outline", !event.target.checked);
                badge.classList.toggle("badge-primary", event.target.checked);
            }
        }
    });

    DOM.variantsContainer?.addEventListener("input", (event) => {
        const target = event.target;
        const index = target.dataset.index;
        const variantIndex = target.dataset.variantIndex;
        const sizeIndex = target.dataset.sizeIndex;

        if (target.classList.contains("var-color-name")) {
            productVariantsState[index].colorName = target.value;
        } else if (target.classList.contains("var-color-hex")) {
            productVariantsState[index].colorHex = target.value;
        } else if (target.classList.contains("var-sku")) {
            productVariantsState[index].sku = target.value;
        } else if (target.classList.contains("var-image-url")) {
            productVariantsState[index].images = [{ url: target.value, publicID: "apex-store/products/default" }];
        } else if (target.classList.contains("var-size-stock")) {
            productVariantsState[variantIndex].sizes[sizeIndex].stock = Number(target.value) || 0;
        }
    });

    DOM.variantsContainer?.addEventListener("change", (event) => {
        if (event.target.classList.contains("var-size-name")) {
            const variantIndex = event.target.dataset.variantIndex;
            const sizeIndex = event.target.dataset.sizeIndex;
            productVariantsState[variantIndex].sizes[sizeIndex].size = event.target.value;
        }
    });

    DOM.variantsContainer?.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.classList.contains("remove-size-btn")) {
            const { variantIndex, sizeIndex } = button.dataset;
            productVariantsState[variantIndex].sizes.splice(sizeIndex, 1);
            renderVariantsForm();
        } else if (button.classList.contains("add-size-btn")) {
            const { variantIndex } = button.dataset;
            if (!productVariantsState[variantIndex].sizes) {
                productVariantsState[variantIndex].sizes = [];
            }
            productVariantsState[variantIndex].sizes.push({ size: "S", stock: 0 });
            renderVariantsForm();
        } else if (button.classList.contains("remove-variant-btn")) {
            const { index } = button.dataset;
            productVariantsState.splice(index, 1);
            renderVariantsForm();
        }
    });
};

const initConfirmModalEvents = () => {
    DOM.confirmCancelBtn?.addEventListener("click", () => DOM.confirmModal?.close());

    DOM.confirmActionBtn?.addEventListener("click", async () => {
        if (!pendingDeleteId || !pendingDeleteType) return DOM.confirmModal?.close();

        const isProduct = pendingDeleteType === "product";
        const url = isProduct ? `/api/admin/products/${pendingDeleteId}` : `/api/admin/categories/${pendingDeleteId}`;
        const label = isProduct ? "Product" : "Category";

        const success = await handleApiCall(() => axios.delete(url), `${label} deleted successfully!`, DOM.confirmModal);

        if (success) {
            if (isProduct) await loadProducts();
            else await loadCategories();
        }

        pendingDeleteType = null;
        pendingDeleteId = null;
    });
};

const initTabEvents = () => {
    if (DOM.tableProductButton && DOM.tableCategoryButton) {
        DOM.tableProductButton.addEventListener("click", () => {
            DOM.tableProductButton.classList.add("tab-active");
            DOM.tableCategoryButton.classList.remove("tab-active");
            DOM.tableProductContent?.classList.remove("hidden");
            DOM.tableCategoryContent?.classList.add("hidden");
        });

        DOM.tableCategoryButton.addEventListener("click", () => {
            DOM.tableCategoryButton.classList.add("tab-active");
            DOM.tableProductButton.classList.remove("tab-active");
            DOM.tableCategoryContent?.classList.remove("hidden");
            DOM.tableProductContent?.classList.add("hidden");
        });
    }

    DOM.openCreateCatBtn?.addEventListener("click", () => {
        editingCategoryId = null;
        DOM.categoryModalTitle.textContent = "New Category";
        DOM.categoryForm.reset();
        DOM.categoryModal.showModal();
    });

    DOM.openCreateProdBtn?.addEventListener("click", () => {
        editingProductId = null;
        DOM.modalTitle.textContent = "Add Product";
        DOM.productForm.reset();
        document.getElementById("prod-material").value = "100% Cotton";
        renderCategoryCheckboxes([]);
        productVariantsState = [{
            colorName: "",
            colorHex: "#000000",
            sku: "",
            images: [{ url: "", publicID: "apex-store/products/default" }],
            sizes: getDefaultSizesArray()
        }];
        renderVariantsForm();
        DOM.productModal.showModal();
    });

    DOM.addVariantBtn?.addEventListener("click", () => {
        productVariantsState.push({
            colorName: "",
            colorHex: "#000000",
            sku: "",
            images: [{ url: "", publicID: "apex-store/products/default" }],
            sizes: getDefaultSizesArray()
        });
        renderVariantsForm();
    });
};

const initFormEvents = () => {
    // Submit form product
    DOM.productForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = document.getElementById("prod-name").value.trim();
        const priceInput = document.getElementById("prod-price").value;
        const descriptionInput = document.getElementById("prod-description").value.trim();
        const materialInput = document.getElementById("prod-material").value.trim() || "100% Cotton";
        const selectedCategories = Array.from(document.querySelectorAll(".cat-checkbox-input:checked")).map(checkbox => checkbox.value);

        const payload = {
            name: nameInput,
            price: Number(priceInput),
            material: materialInput,
            description: descriptionInput,
            categories: selectedCategories,
            isActive: document.getElementById("prod-is-active").checked,
            isFeatured: document.getElementById("prod-is-featured").checked,
            isNewProduct: document.getElementById("prod-is-new").checked,
            variants: productVariantsState
        };

        const validationError = validateProductForm(payload, productVariantsState, priceInput);
        if (validationError) {
            displayNotification(true, validationError, 4000);
            return;
        }

        const apiCall = editingProductId
            ? () => axios.put(`/api/admin/products/${editingProductId}`, payload)
            : () => axios.post("/api/admin/products", payload);

        const success = await handleApiCall(
            apiCall,
            `Product ${editingProductId ? 'updated' : 'created'} successfully!`,
            DOM.productModal
        );

        if (success) {
            editingProductId = null;
            await loadProducts();
        }
    });

    // Submit form category
    DOM.categoryForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("cat-name").value.trim();
        if (!name) {
            displayNotification(true, "Category Name is required.", 4000);
            return;
        }

        const payload = {
            name,
            image: document.getElementById("cat-image").value.trim(),
            description: document.getElementById("cat-desc").value.trim()
        };

        const apiCall = editingCategoryId
            ? () => axios.put(`/api/admin/categories/${editingCategoryId}`, payload)
            : () => axios.post("/api/admin/categories", payload);

        const success = await handleApiCall(
            apiCall,
            `Category ${editingCategoryId ? 'updated' : 'created'} successfully!`,
            DOM.categoryModal
        );

        if (success) {
            DOM.categoryForm.reset();
            editingCategoryId = null;
            await loadCategories();
        }
    });
};

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", async () => {
    initDOMCache();

    // 2. Configure delegation and UI events
    setupEventDelegation();
    initTabEvents();
    initConfirmModalEvents();
    initFormEvents();

    // 3. Load categories and products
    await Promise.all([
        adaptNavbar(),
        loadCategories(),
        loadProducts()
    ]);
});