import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";

// Global DOM Selectors
const iconContainer = document.getElementById("status-icon-container");
const titleElement = document.getElementById("confirmation-title");
const subtitleElement = document.getElementById("confirmation-subtitle");
const paymentRefContainer = document.getElementById("payment-ref-container");
const paymentRefElement = document.getElementById("payment-intent-id");

// Helper UI Functions
const renderSuccessUI = (transactionRef) => {
    if (iconContainer) {
        iconContainer.className = "w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md transition-all duration-300";
        iconContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
        `;
    }

    if (titleElement) {
        titleElement.textContent = "Thank you for your order!";
    }

    if (subtitleElement) {
        subtitleElement.textContent = "We've received your payment and are processing your order.";
    }

    if (paymentRefElement) {
        paymentRefElement.textContent = transactionRef;
    }

    if (paymentRefContainer) {
        paymentRefContainer.classList.remove("hidden");
    }
}

const renderErrorUI = (messageText) => {
    if (iconContainer) {
        iconContainer.className = "w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md transition-all duration-300";
        iconContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        `;
    }

    if (titleElement) {
        titleElement.textContent = "Access Denied";
    }

    if (subtitleElement) {
        subtitleElement.textContent = messageText;
    }

    if (paymentRefContainer) {
        paymentRefContainer.classList.add("hidden");
    }
}

// Main Event Listener
document.addEventListener("DOMContentLoaded", async () => {
    localStorage.removeItem("cart");
    updateNavbarCart();
    await adaptNavbar();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get("payment_intent");

    if (!paymentIntentId) {
        renderErrorUI("No payment reference was provided in the request.");
        return;
    }

    try {
        const response = await axios.post("/api/orders", { paymentIntentId });
        const ref = response.data.paymentDetails?.transactionReference || paymentIntentId;
        
        renderSuccessUI(ref);
    } catch (error) {
        const status = error.response?.status;
        let errorMessage = "You are not authorized to view this order or the reference is invalid.";

        if (status === 403) {
            errorMessage = "You are not authorized to view this order.";
        } else if (status === 404) {
            errorMessage = "Order not found or invalid payment reference.";
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        console.warn(`Order verification stopped (${status || "Network Error"}):`, errorMessage);
        renderErrorUI(errorMessage);
    }
});