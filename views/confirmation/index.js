import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";

document.addEventListener("DOMContentLoaded", async () => {
    localStorage.removeItem("cart");
    updateNavbarCart();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get("payment_intent");

    const paymentRefElement = document.getElementById("payment-intent-id");
    
    if (paymentIntentId) {
        if (paymentRefElement) paymentRefElement.textContent = paymentIntentId;
    } else {
        if (paymentRefElement) paymentRefElement.textContent = "N/A (Direct Access)";
    }

    try {
        if (document.querySelector(".navbar")) {
            await adaptNavbar();
        }
    } catch (error) {
        console.warn("Navbar adapt error:", error);
    }
});