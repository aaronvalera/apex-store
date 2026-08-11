import { updateNavbarCart } from "/helpers/updateNavbarCart.js";
import { openCartModal } from "/components/cartModal.js";
const navbarContainer = document.querySelector(".navbar");

export const createNavbar = (user = null) => {
    let userMenuItems = ``;

    if(!user) {
        userMenuItems = `
            <li><a href="/signup" class="font-semibold text-black">Sign Up</a></li>
            <li><a href="/signin" class="font-semibold text-black">Sign In</a></li>
        `;
    } else {
        let adminOption = ``;
        if(user.role === "admin") {
            const isInAdminDashboard = window.location.pathname.includes("/admin");
            if(isInAdminDashboard) {
                adminOption = `
                    <li><a href="/" class="font-semibold text-black">Home</a></li>
                `;
            } else {
                adminOption = `
                    <li><a href="/admin/dashboard" class="font-semibold text-black">Dashboard</a></li>
                `;
            }
        }
        userMenuItems = `
            ${adminOption}
            <li><a href="/settings" class="font-semibold text-black">Settings</a></li>
            <li><button id="logout-btn" class="font-semibold text-red-500">Logout</button></li>   
        `;
    }

    const isCatalogPage = window.location.pathname.includes("/catalog");

    const searchEnd = isCatalogPage 
        ? `` 
        : `<input type="text" name="search" placeholder="Search" class="input input-bordered input-sm sm:input-md w-24 sm:w-36 lg:w-44"/>`;

    let navbarCenter = ``;
    if (isCatalogPage) {
        navbarCenter = `
            <div class="relative w-full max-w-2xl mx-auto">
                <div class="relative flex items-center w-full">
                    <input id="navbar-search-input" type="text" name="search" placeholder="Search products..." class="input input-bordered input-sm sm:input-md w-full pr-10 focus:outline-none focus:border-primary shadow-inner" autocomplete="off"/>
                    <svg class="w-5 h-5 absolute right-3 text-base-content/50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <div id="search-results-dropdown" class="absolute top-full left-0 right-0 w-full bg-base-100 shadow-2xl rounded-b-xl border border-base-200 mt-2 z-50 hidden max-h-96 overflow-y-auto p-3">
                    <div id="search-results-content" class="space-y-2"></div>
                </div>
            </div>
        `;
    } else {
        navbarCenter = `
            <div class="flex items-center gap-4 font-semibold">
                <div class="dropdown dropdown-hover">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm text-sm">MEN</div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-200">
                        <li><a href="/catalog?category=men">All Men</a></li>
                    </ul>
                </div>
                <div class="dropdown dropdown-hover">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm text-sm">WOMEN</div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-200">
                        <li><a href="/catalog?category=women">All Women</a></li>
                    </ul>
                </div>
                <div class="dropdown dropdown-hover">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm text-sm">KIDS</div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-200">
                        <li><a href="/catalog?category=kids">All Kids</a></li>
                    </ul>
                </div>
            </div>
        `;
    }

    let mobileSidebarContent = ``;
    if (isCatalogPage) {
        mobileSidebarContent = `
            <div class="flex items-center justify-between pb-4 border-b border-base-200">
                <h2 class="text-xl font-bold uppercase tracking-wider">Filters</h2>
                <label for="mobile-drawer-toggle" class="btn btn-sm btn-circle btn-ghost">✕</label>
            </div>
            <div class="space-y-6 mt-4">
                <!-- Sort By -->
                <div class="collapse collapse-arrow border-b border-base-200 rounded-none">
                    <input type="checkbox" checked/> 
                    <div class="collapse-title text-sm font-bold uppercase px-0">Sort By</div>
                    <div class="collapse-content px-0">
                        <select class="select select-bordered select-sm w-full sort-select-input">
                            <option value="" disabled selected>Sort order</option>
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                <!-- Category -->
                <div class="collapse collapse-arrow border-b border-base-200 rounded-none">
                    <input type="checkbox" checked/> 
                    <div class="collapse-title text-sm font-bold uppercase px-0">Category</div>
                    <div class="collapse-content px-0 space-y-2">
                        <label class="label cursor-pointer justify-start gap-3 py-1">
                            <input type="radio" name="category-mobile" class="radio radio-sm" value="men"/>
                            <span class="label-text">Men</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-3 py-1">
                            <input type="radio" name="category-mobile" class="radio radio-sm" value="women"/>
                            <span class="label-text">Women</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-3 py-1">
                            <input type="radio" name="category-mobile" class="radio radio-sm" value="kids"/>
                            <span class="label-text">Kids</span>
                        </label>
                    </div>
                </div>
                <!-- Size -->
                <div class="collapse collapse-arrow border-b border-base-200 rounded-none">
                    <input type="checkbox" checked/> 
                    <div class="collapse-title text-sm font-bold uppercase px-0">Size</div>
                    <div class="collapse-content px-0">
                        <div class="grid grid-cols-3 gap-2">
                            <button class="btn size-btn btn-outline btn-xs" data-size="XS">XS</button>
                            <button class="btn size-btn btn-outline btn-xs" data-size="S">S</button>
                            <button class="btn size-btn btn-outline btn-xs" data-size="M">M</button>
                            <button class="btn size-btn btn-outline btn-xs" data-size="L">L</button>
                            <button class="btn size-btn btn-outline btn-xs" data-size="XL">XL</button>
                            <button class="btn size-btn btn-outline btn-xs" data-size="XXL">XXL</button>
                        </div>
                    </div>
                </div>
                <!-- Max Price -->
                <div class="collapse collapse-arrow border-b border-base-200 rounded-none">
                    <input type="checkbox" checked/> 
                    <div class="collapse-title text-sm font-bold uppercase px-0">Max Price</div>
                    <div class="collapse-content px-0 space-y-3">
                        <input type="range" min="10" max="200" value="100" class="range range-xs price-range-input"/>
                        <div class="flex justify-between text-xs opacity-70">
                            <span>$10</span>
                            <span class="font-bold text-base-content price-display-text">$100</span>
                            <span>$200</span>
                        </div>
                    </div>
                </div>
                <!-- Apply Filters Button -->
                <button class="btn btn-block btn-neutral btn-sm apply-filters-btn">APPLY FILTERS</button>
            </div>
        `;
    } else {
        mobileSidebarContent = `
            <div class="flex items-center justify-between pb-4 border-b border-base-200">
                <h2 class="text-xl font-bold uppercase tracking-wider">Menu</h2>
                <label for="mobile-drawer-toggle" class="btn btn-sm btn-circle btn-ghost">✕</label>
            </div>
            <ul class="menu p-0 mt-4 text-base font-semibold space-y-2">
                <li><a href="/catalog?category=men">MEN</a></li>
                <li><a href="/catalog?category=women">WOMEN</a></li>
                <li><a href="/catalog?category=kids">KIDS</a></li>
            </ul>
        `;
    }

    const navbar = `
        <input id="mobile-drawer-toggle" class="peer hidden" type="checkbox"/>
        <label for="mobile-drawer-toggle" class="fixed inset-0 bg-black/50 z-40 hidden peer-checked:block lg:hidden transition-opacity"></label>
        <aside class="fixed top-0 left-0 z-50 h-full w-80 bg-base-100 p-6 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:hidden overflow-y-auto shadow-2xl">
            ${mobileSidebarContent}
        </aside>
        <div class="relative z-30 bg-base-200 shadow-sm w-full rounded-md px-3">
            <div class="navbar p-0 w-full flex justify-between lg:grid lg:grid-cols-3 items-center">
                <div class="navbar-start w-auto lg:w-full flex items-center justify-start gap-2">
                    <label for="mobile-drawer-toggle" class="btn btn-ghost lg:hidden">
                        <svg id="mobile-menu-btn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                        </svg>
                    </label>
                    <a class="link-hover text-xl" href="/"><img src="/images/apex-logo.png" width="55"></a>
                </div>
                <div class="navbar-center hidden lg:flex items-center justify-center w-full">
                    ${navbarCenter}
                </div>
                <div class="navbar-end w-auto lg:w-full flex items-center justify-end gap-2 sm:gap-3">
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                            <div class="indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <span id="cart-badge" class="badge badge-sm indicator-item bg-sky-300"></span>
                            </div>
                        </div>
                        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow">
                            <div class="card-body">
                                <span id="cart-total-items" class="text-lg font-bold">0 Items</span>
                                <span id="cart-subtotal" class="text-info">Subtotal: $0</span>
                                <div class="card-actions">
                                    <button onclick="openCartModal()" class="btn bg-black text-white btn-block">
                                        View cart details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                            <div class="w-8 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                </svg>
                            </div>
                        </div>
                        <ul tabindex="-1" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-42 p-2 shadow">
                            ${userMenuItems}
                        </ul>
                    </div>
                </div>
            </div>
            ${isCatalogPage ? `
                <div class="lg:hidden pb-2 pt-1 border-t border-base-300/50 mt-1">
                    <div class="relative z-50 w-full">
                        <div class="relative flex items-center w-full">
                            <input id="mobile-navbar-search-input" type="text" name="search" placeholder="Search products..." class="input input-bordered input-sm w-full pr-10 focus:outline-none focus:border-primary shadow-inner" autocomplete="off"/>
                            <svg class="w-4 h-4 absolute right-3 text-base-content/50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <div id="mobile-search-results-dropdown" class="absolute top-full left-0 right-0 w-full bg-base-100 shadow-2xl rounded-b-xl border border-base-200 mt-1 z-50 hidden max-h-80 overflow-y-auto p-2">
                            <div id="mobile-search-results-content" class="space-y-2"></div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    navbarContainer.innerHTML = navbar;

    // CHANGE MOBILE MENU BUTTON ICON
    const HAMBURGER_ICON = '<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>';
    const CLOSE_ICON ='<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>';
    const drawerCheckbox = document.getElementById("mobile-drawer-toggle");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");

    if (drawerCheckbox && mobileMenuBtn) {
        drawerCheckbox.addEventListener("change", () => {
            mobileMenuBtn.innerHTML = drawerCheckbox.checked ? CLOSE_ICON : HAMBURGER_ICON;
        });
    }

    // LOGOUT
    if(user) {
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", async event => {
            try {
                await axios.post("/api/logout");
                window.location.href = "/";
            } catch (error) {
                console.error("Error logging out", error);
            }
        });
    }

    if(isCatalogPage) {
        const setupSearch = (inputId, dropdownId, contentId) => {
            const searchInput = document.getElementById(inputId);
            const resultsDropdown = document.getElementById(dropdownId);
            const resultsContent = document.getElementById(contentId);

            if (searchInput && resultsDropdown && resultsContent) {
                let debounceTimer;

                const performLiveSearch = async (query) => {
                    if (!query.trim()) {
                        resultsDropdown.classList.add("hidden");
                        return;
                    }
                
                    resultsContent.innerHTML = `<div class="p-3 text-center text-sm opacity-60">Searching...</div>`;
                    resultsDropdown.classList.remove("hidden");
                
                    try {
                        const response = await axios.get(`/api/products?search=${encodeURIComponent(query)}`);
                        const products = response.data.data || response.data || [];
                    
                        if (!Array.isArray(products) || products.length === 0) {
                            resultsContent.innerHTML = `<div class="p-3 text-center text-sm opacity-60">No products found for "${query}"</div>`;
                            return;
                        }
                    
                        resultsContent.innerHTML = products.slice(0, 5).map(product => {
                            const productImage = product.variants?.[0]?.images?.[0]?.url 
                                || product.image 
                                || product.imageUrl 
                                || '/images/apex-logo.png';

                            const productId = product._id || product.id;
                        
                            return `
                                <a href="/catalog?search=${encodeURIComponent(product.name)}" class="flex items-center gap-4 p-3 hover:bg-base-200 rounded-lg transition-colors border-b border-base-200 last:border-none">
                                    <img src="${productImage}" alt="${product.name}" class="w-12 h-12 object-cover rounded-md bg-base-300 shrink-0"/>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-bold truncate text-base-content">${product.name}</p>
                                        <p class="text-xs text-primary font-bold mt-0.5">$${product.price}</p>
                                    </div>
                                </a>
                            `;
                        }).join("");
                    } catch (error) {
                        resultsContent.innerHTML = `<div class="p-3 text-center text-sm text-error">Error loading results</div>`;
                    }
                };

                searchInput.addEventListener("focus", () => {
                    if (searchInput.value.trim()) {
                        resultsDropdown.classList.remove("hidden");
                    }
                });

                searchInput.addEventListener("input", (event) => {
                    clearTimeout(debounceTimer);
                    const query = event.target.value;
                    debounceTimer = setTimeout(() => performLiveSearch(query), 300);
                });

                searchInput.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
                        }
                    }
                });

                document.addEventListener("click", (event) => {
                    if (!searchInput.contains(event.target) && !resultsDropdown.contains(event.target)) {
                        resultsDropdown.classList.add("hidden");
                    }
                });
            }
        };

        setupSearch("navbar-search-input", "search-results-dropdown", "search-results-content");
        setupSearch("mobile-navbar-search-input", "mobile-search-results-dropdown", "mobile-search-results-content");
    }

    updateNavbarCart();
};