import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";
import { createProductCard } from "/components/productCard.js";

// State
let selectedSize = null;

// DOM Selectors
const getElements = () => ({
    catalogGrid: document.getElementById("catalog-grid"),
    pagination: document.getElementById("pagination"),
    productsCount: document.getElementById("products-count") || document.querySelector(".drawer-content span.opacity-70")
});

// Request products using query parameters from URL
const loadCatalog = async () => {
    const { catalogGrid } = getElements();
    if (!catalogGrid) return;

    try {
        const response = await axios.get(`/api/products${window.location.search}`);
        const { data: products = [], totalPages = 1, currentPage = 1, totalProducts = 0 } = response.data;

        renderCatalog(products, totalProducts);
        renderPagination(totalPages, currentPage);
        syncUIFromURL();
    } catch (error) {
        console.error("Error fetching products:", error);
        renderErrorState();
    }
};

// --- URL MANAGEMENT ---

const updateURLAndFetch = (params) => {
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    loadCatalog();
};

const changePage = (pageNumber) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", pageNumber);

    updateURLAndFetch(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// --- RENDERING ---

const renderCatalog = (productsList, totalProducts = 0) => {
    const { catalogGrid, productsCount } = getElements();
    if (productsCount) {
        productsCount.textContent = `Showing ${productsList.length} of ${totalProducts} products`;
    }

    if (!catalogGrid) return;

    if (productsList.length === 0) {
        catalogGrid.innerHTML = `
            <div class="col-span-full py-12 text-center text-base-content/60">
                <p class="text-lg font-medium">No products match your criteria.</p>
            </div>
        `;
        return;
    }

    catalogGrid.innerHTML = productsList.map(product => createProductCard(product)).join("");
};

const renderPagination = (totalPages, currentPage) => {
    const { pagination } = getElements();
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    const pages = [];

    // Previous Button («)
    pages.push(`<button class="join-item btn btn-xs sm:btn-sm ${currentPage === 1 ? 'btn-disabled' : ''}" data-page="${currentPage - 1}">«</button>`);

    // Numeric Buttons
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? "btn-active btn-neutral" : "";
        pages.push(`<button class="join-item btn btn-xs sm:btn-sm ${activeClass}" data-page="${i}">${i}</button>`);
    }

    // Next Button (»)
    pages.push(`<button class="join-item btn btn-xs sm:btn-sm ${currentPage === totalPages ? 'btn-disabled' : ''}" data-page="${currentPage + 1}">»</button>`);

    pagination.innerHTML = pages.join("");
};

const renderErrorState = () => {
    const { catalogGrid } = getElements();
    if (!catalogGrid) return;

    catalogGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-error">
            <p class="text-lg font-medium">Failed to load products. Please try again.</p>
        </div>
    `;
};

// --- UI SYNC & CONTROLS ---

const updateSizeButtonsUI = () => {
    document.querySelectorAll(".size-btn").forEach(btn => {
        const btnSize = btn.dataset.size || btn.textContent.trim();
        const isSelected = btnSize === selectedSize;
        btn.classList.toggle("btn-primary", isSelected);
        btn.classList.toggle("active", isSelected);
        btn.classList.toggle("bg-black", isSelected);
        btn.classList.toggle("text-white", isSelected);
    });
};

const handleApplyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");

    // Search
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput?.value.trim()) {
        params.set("search", searchInput.value.trim());
    }

    // Category
    const checkedCategory = document.querySelector('input[name="category"]:checked, input[name="category-mobile"]:checked');
    if (checkedCategory && checkedCategory.value !== "all") {
        params.set("category", checkedCategory.value);
    }

    // Size
    if (selectedSize) {
        params.set("size", selectedSize);
    }

    // Max Price
    const priceSlider = document.querySelector('#price-range, .price-range-input');
    if (priceSlider) {
        params.set("maxPrice", priceSlider.value);
    }

    // Sort
    const sortSelect = document.querySelector('#sort-by, .sort-select-input');
    if (sortSelect?.value) {
        params.set("sort", sortSelect.value);
    }

    updateURLAndFetch(params);

    window.scrollTo({ top: 0, behavior: "smooth" });
};

const syncUIFromURL = () => {
    const params = new URLSearchParams(window.location.search);

    // Search
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) searchInput.value = params.get("search") || "";

    // Category
    const category = params.get("category");
    document.querySelectorAll('input[name="category"], input[name="category-mobile"]').forEach(radio => {
        radio.checked = (radio.value === category);
    });

    // Price
    const price = params.get("maxPrice") || "100";
    document.querySelectorAll('.price-range-input').forEach(input => input.value = price);
    document.querySelectorAll('.price-display-text').forEach(element => element.textContent = `$${price}`);

    // Size
    selectedSize = params.get("size") || null;
    updateSizeButtonsUI();

    // Sort
    const sort = params.get("sort") || "";
    document.querySelectorAll('.sort-select-input').forEach(select => {
        select.value = sort;
    });
};

// --- CART LOGIC ---

const addToCart = (productData) => {
    const targetId = productData._id || productData.id;
    if (!targetId || targetId === "undefined") {
        console.error("❌ Error: Product ID invalid.", productData);
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(item => item.id === targetId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ id: targetId, name: productData.name, price: parseFloat(productData.price), image: productData.image, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateNavbarCart();
};

// --- EVENT LISTENERS ---

const closeMobileDrawers = () => {
    const filterDrawer = document.getElementById("filter-drawer");
    if (filterDrawer) {
        filterDrawer.checked = false;
    }
};

const setupEventListeners = () => {
    document.addEventListener("click", (event) => {
        // 1. Apply filters
        const applyBtn = event.target.closest("#apply-filters-btn, .apply-filters-btn");
        if (applyBtn) {
            event.preventDefault();
            handleApplyFilters();
            closeMobileDrawers();
            return;
        }

        // 2. Select size
        const sizeBtn = event.target.closest(".size-btn");
        if (sizeBtn) {
            event.preventDefault();
            const clickedSize = sizeBtn.dataset.size || sizeBtn.textContent.trim();
            selectedSize = (selectedSize === clickedSize) ? null : clickedSize;
            updateSizeButtonsUI();
            return;
        }

        // 3. Pagination
        const pageBtn = event.target.closest("#pagination button[data-page]");
        if (pageBtn && !pageBtn.classList.contains("btn-disabled")) {
            event.preventDefault();
            changePage(pageBtn.dataset.page);
            return;
        }

        // 4. Add to cart
        const addToCartBtn = event.target.closest(".add-to-cart-btn");
        if (addToCartBtn) {
            const productData = {
                id: addToCartBtn.dataset.id,
                name: addToCartBtn.dataset.name,
                price: addToCartBtn.dataset.price,
                image: addToCartBtn.dataset.image
            };

            addToCart(productData);

            const originalText = addToCartBtn.textContent;
            addToCartBtn.textContent = "Added! ✓";
            addToCartBtn.classList.add("btn-success");
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.classList.remove("btn-success");
            }, 1200);
        }
    });

    document.addEventListener("input", (event) => {
        if (event.target.matches('#price-range, .price-range-input')) {
            const val = event.target.value;
            document.querySelectorAll('#price-range, .price-range-input').forEach(input => input.value = val);
            document.querySelectorAll('#price-display, .price-display-text').forEach(element => element.textContent = `$${val}`);
        }
    });

    document.addEventListener("change", (event) => {
        if (event.target.matches('input[name="category"], input[name="category-mobile"]')) {
            const value = event.target.value;
            document.querySelectorAll('input[name="category"], input[name="category-mobile"]').forEach(radio => radio.checked = (radio.value === value));
        }
        if (event.target.matches('#sort-by, .sort-select-input')) {
            const value = event.target.value;
            document.querySelectorAll('#sort-by, .sort-select-input').forEach(select => select.value = value);
        }
    });

    // Navegation
    window.addEventListener("popstate", () => {
        loadCatalog();
    });
};

// INITIALIZE APPLICATION
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    adaptNavbar();
    loadCatalog();
});