const navbarContainer = document.querySelector(".navbar");

const createNavbar = () => {
    let navbar = ``;
    navbar = `
        <div class="max-lg:collapse bg-base-200 lg:mb-48 shadow-sm w-full rounded-md">
            <input id="navbar-1-toggle" class="peer hidden" type="checkbox"/>
            <label for="navbar-1-toggle" class="fixed inset-0 hidden max-lg:peer-checked:block"></label>
            <div class="collapse-title navbar">
                <div class="navbar-start">
                    <label for="navbar-1-toggle" class="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"/>
                        </svg>
                    </label>
                    <a class="link-hover text-xl" href="/"><img src="/images/apex-logo.png" width="62"></a>
                </div>
                <div class="navbar-center hidden lg:flex">
                    <ul class="menu menu-horizontal px-1">
                        <li><button>MEN</button></li>
                        <li>
                            <details>
                                <summary>WOMEN</summary>
                                <ul class="p-2 bg-base-100 w-40 z-1">
                                    <li><button>Submenu 1</button></li>
                                    <li><button>Submenu 2</button></li>
                                </ul>
                            </details>
                        </li>
                        <li><button>KIDS</button></li>
                    </ul>
                </div>
                <div class="navbar-end gap-4">
                    <input type="text" placeholder="Search" class="input input-bordered w-30 lg:w-44"/>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                            <div class="indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <span class="badge badge-sm indicator-item">0</span>
                            </div>
                        </div>
                        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow">
                            <div class="card-body">
                                <span class="text-lg font-bold">0 Items</span>
                                <span class="text-info">Subtotal: $0</span>
                                <div class="card-actions">
                                    <button class="btn btn-primary btn-block">View cart</button>
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
                            <li><a href="/signup">Sign Up</a></li>
                            <li><a href="/login">Login</a></li>
                            <li><a href="#">Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="collapse-content lg:hidden z-1">
                <ul class="menu">
                    <li><button>MEN</button></li>
                    <li>
                        <button>WOMEN</button>
                        <ul>
                            <li><button>Submenu 1</button></li>
                            <li><button>Submenu 2</button></li>
                        </ul>
                    </li>
                    <li><button>KIDS</button></li>
                </ul>
            </div>
        </div>
    `;
    navbarContainer.innerHTML = navbar;
}

createNavbar();