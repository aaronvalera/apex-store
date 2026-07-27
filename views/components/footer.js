const footerContainer = document.querySelector(".footer");

const createFooter = () => {
    let footer = ``;
    footer = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-10 max-w-7xl mx-auto">
        <aside class="flex flex-col gap-2">
            <img src="/images/apex-logo.png" width="100">
            <p class="max-w-xs text-sm opacity-70">
                Elevating performance and urban style. High-performance footwear and apparel.
            </p>
        </aside>
        <nav class="flex flex-col gap-2">
            <h6 class="footer-title opacity-100 font-bold">Shop</h6>
            <a class="link link-hover">New Arrivals</a>
            <a class="link link-hover">Men</a>
            <a class="link link-hover">Women</a>
            <a class="link link-hover">Kids</a>
        </nav>
        <nav class="flex flex-col gap-2">
            <h6 class="footer-title opacity-100 font-bold">Support</h6>
            <a class="link link-hover">Order Status</a>
            <a class="link link-hover">Shipping & Delivery</a>
            <a class="link link-hover">Returns & Exchanges</a>
            <a class="link link-hover">Contact Us</a>
            <a class="link link-hover">FAQs</a>
        </nav>
        <nav class="flex flex-col gap-2">
            <h6 class="footer-title opacity-100 font-bold">Legal</h6>
            <a class="link link-hover">Terms of Service</a>
            <a class="link link-hover">Privacy Policy</a>
            <a class="link link-hover">Return Policy</a>
            <a class="link link-hover">Cookie Preferences</a>
        </nav>
        <div class="flex flex-col gap-2">
            <span class="footer-title opacity-100 font-bold">Follow Us</span>
            <p class="text-sm opacity-70 mb-2">Connect with us on our official channels.</p>
            <div class="flex gap-2">
                <a href="https://www.instagram.com/" target="_blank" class="btn btn-ghost btn-circle btn-sm" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.298.088.851.222 1.433.42 1.941.207.526.485.976.923 1.417.44.44.89.718 1.417.923.509.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.088 1.433-.222 1.941-.42a3.928 3.928 0 0 0 1.417-.923c.44-.44.718-.891.923-1.417.198-.509.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.088-.851-.222-1.433-.42-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                    </svg>
                </a>
                <a href="https://www.tiktok.com/" target="_blank" class="btn btn-ghost btn-circle btn-sm" aria-label="TikTok">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
                        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                    </svg>
                </a>
                <a href="https://web.whatsapp.com/send/?phone=584127699723" target="_blank" class="btn btn-ghost btn-circle btn-sm" aria-label="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.17-.478 1.338-.94.168-.463.168-.859.118-.94-.05-.082-.182-.133-.38-.232z"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>

    <div class="border-t border-base-300">
        <div class="footer px-10 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs opacity-70">
            <p>© 2026 APEX Inc. All rights reserved.</p>
            <div class="flex gap-4">
                <a class="link link-hover">Privacy</a>
                <span>•</span>
                <a class="link link-hover">Terms</a>
            </div>
        </div>
    </div>
    `;
    footerContainer.innerHTML = footer;
}

createFooter(); 