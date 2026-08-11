import { displayNotification } from "/components/notification.js";
import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";

const STRIPE_PUBLISHABLE_KEY = "pk_test_51U35XkR6tFa93XXXiMziw1xgQVN0F1gy3I9yigk1qmzuQOnHloMuA1KhI5S6LTurUI2i9iUzpdt5dEnn8jlfCmg400N5mDeXFm";
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const STRIPE_APPEARANCE_CONFIG = {
    theme: 'stripe',
    variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#111827',
        borderRadius: '12px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    }
};

let elements = null;
let paymentElement = null;
let phoneInput = null;

// Global state
let savedAddresses = [];
let isAddingNewAddress = false;
let currentTotalAmount = 0;

// Helper utilities
const parsePrice = (rawPrice) => {
    if (typeof rawPrice === "number") return rawPrice;
    return parseFloat(String(rawPrice || 0).replace(/[^0-9.-]+/g, "")) || 0;
};

const getCartFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
        return [];
    }
};

const getShippingFormData = () => ({
    title: document.getElementById("address-title")?.value.trim() || "Home",
    firstName: document.getElementById("first-name")?.value.trim() || "",
    lastName: document.getElementById("last-name")?.value.trim() || "",
    streetAddress: document.getElementById("address")?.value.trim() || "",
    addressDetails: document.getElementById("address-details")?.value.trim() || "",
    city: document.getElementById("city")?.value.trim() || "",
    state: document.getElementById("state")?.value.trim() || "",
    zipCode: document.getElementById("postal-code")?.value.trim() || "",
    country: document.getElementById("country")?.value.trim() || "",
    phone: phoneInput ? phoneInput.getNumber() : (document.getElementById("phone")?.value.trim() || "")
});

const setShippingFormData = (data = {}) => {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    };

    setVal("address-title", data.title);
    setVal("first-name", data.firstName);
    setVal("last-name", data.lastName);
    setVal("address", data.streetAddress || data.address);
    setVal("address-details", data.addressDetails);
    setVal("city", data.city);
    setVal("state", data.state);
    setVal("postal-code", data.zipCode || data.postalCode);
    setVal("country", data.country);

    const rawPhone = data.phoneNumber || data.phone || "";
    if (phoneInput) {
        phoneInput.setNumber(rawPhone);
    } else {
        setVal("phone", rawPhone);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Initial Order summary rendering
    currentTotalAmount = renderOrderSummary();
    updateNavbarCart();

    // 2. Initialize Phone Input
    initPhoneInput();

    // 3. Stripe initialization
    if (currentTotalAmount > 0) {
        await initStripePayment(currentTotalAmount);
    } else {
        const loadingSpinner = document.getElementById("stripe-loading");
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
    }

    // 4. Listen for cart changes in real-time
    window.addEventListener("cartUpdated", handleCartSync);
    window.addEventListener("storage", (event) => {
        if (event.key === "cart") handleCartSync();
    });

    // 5. Form submit listener
    const form = document.getElementById("checkout-form");
    if (form) {
        form.addEventListener("submit", handleCheckoutSubmit);
    }

    // 6. Adapt Navbar & Load User Profile & Saved Addresses
    try {
        if (document.querySelector(".navbar")) {
            await adaptNavbar();
        }
    } catch (error) {
        console.warn("Navbar load error:", error);
    }

    try {
        await loadUserProfileAndAddresses();
    } catch (error) {
        console.warn("Autofill error:", error);
    }
});

const initPhoneInput = () => {
    const phoneElement = document.getElementById("phone");
    if (!phoneElement || !window.intlTelInput) return;

    phoneInput = window.intlTelInput(phoneElement, {
        initialCountry: "auto",
        autoPlaceholder: "aggressive",
        geoIpLookup: (callback) => {
            axios.get("https://ipapi.co/json/")
                .then(({ data }) => {
                    const countryCode = data.country_code ? data.country_code.toUpperCase() : "US";
                    
                    const countrySelect = document.getElementById("country");
                    if (countrySelect) countrySelect.value = countryCode;

                    callback(countryCode.toLowerCase());
                })
                .catch(() => callback("us"));
        },
        separateDialCode: true,
        strictMode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js"
    });

    phoneElement.addEventListener("countrychange", () => {
        const selectedCountryData = phoneInput.getSelectedCountryData();
        if (selectedCountryData && selectedCountryData.iso2) {
            const countrySelect = document.getElementById("country");
            if (countrySelect) {
                countrySelect.value = selectedCountryData.name;
            }
        }
    });
};

const handleCartSync = async () => {
    const newTotal = renderOrderSummary();
    updateNavbarCart();

    if (newTotal !== currentTotalAmount) {
        currentTotalAmount = newTotal;
        if (newTotal > 0) {
            await initStripePayment(newTotal);
        } else {
            const loadingSpinner = document.getElementById("stripe-loading");
            if (loadingSpinner) loadingSpinner.classList.add("hidden");
        }
    }
};

const renderOrderSummary = () => {
    const cart = getCartFromStorage();
    const container = document.getElementById("checkout-cart-items");
    
    if (!container) return 0;

    if (!Array.isArray(cart) || cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-500">
                <p class="text-xs">Your cart is empty.</p>
                <a href="/catalog" class="text-xs font-bold text-black underline mt-2 inline-block">Return to Catalog</a>
            </div>
        `;
        const payBtn = document.getElementById("submit-pay-btn");
        if (payBtn) payBtn.disabled = true;

        const subtotalEl = document.getElementById("summary-subtotal");
        const totalEl = document.getElementById("summary-total");
        if (subtotalEl) subtotalEl.textContent = "$0.00";
        if (totalEl) totalEl.textContent = "$0.00";

        return 0;
    }

    const payBtn = document.getElementById("submit-pay-btn");
    if (payBtn) payBtn.disabled = false;

    let subtotal = 0;

    container.innerHTML = cart.map(item => {
        const quantity = Number(item.quantity) || 1;
        const price = parsePrice(item.price);

        const itemTotal = price * quantity;
        subtotal += itemTotal;

        const variantInfo = [item.colorName, item.size].filter(Boolean).join(" / ");

        return `
            <div class="flex items-center gap-4 py-2 border-b border-gray-100 last:border-b-0">
                <img src="${item.image || '/images/placeholder.png'}" alt="${item.name || 'Product'}" class="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0">
                <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-bold text-gray-900 truncate">${item.name || 'Product'}</h4>
                    <p class="text-xs text-gray-500">Quantity: ${quantity} ${variantInfo ? `• ${variantInfo}` : ''}</p>
                </div>
                <span class="text-xs font-bold text-gray-900">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join("");

    const subtotalEl = document.getElementById("summary-subtotal");
    const totalEl = document.getElementById("summary-total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;

    return subtotal;
};

const initStripePayment = async (amount) => {
    const loadingSpinner = document.getElementById("stripe-loading");
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");

    try {
        const response = await axios.post("/api/payments/create-payment-intent", { amount });
        const { clientSecret } = response.data;

        if (paymentElement) {
            try {
                paymentElement.unmount();
            } catch (error) {

            }
        }

        elements = stripe.elements({ appearance: STRIPE_APPEARANCE_CONFIG, clientSecret });
        paymentElement = elements.create("payment");

        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        paymentElement.mount("#payment-element");

    } catch (error) {
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        const errorMessage = error.response?.data?.message || "Failed to initialize payment gateway.";
        displayNotification(true, errorMessage);
    }
};

const loadUserProfileAndAddresses = async () => {
    try {
        const { data: profile } = await axios.get("/api/profile");

        const emailBadge = document.getElementById("user-email-badge");
        if (emailBadge && profile.email) emailBadge.textContent = profile.email;

        if (profile.firstName) document.getElementById("first-name").value = profile.firstName;
        if (profile.lastName) document.getElementById("last-name").value = profile.lastName;

        try {
            const addressRes = await axios.get("/api/addresses");
            savedAddresses = Array.isArray(addressRes.data) 
                ? addressRes.data 
                : (addressRes.data ? [addressRes.data] : []);
        } catch (error) {
            savedAddresses = [];
        }

        const wrapper = document.getElementById("saved-addresses-wrapper");
        const formFields = document.getElementById("address-form-fields");
        const toggleBtn = document.getElementById("toggle-new-address-btn");

        if (savedAddresses.length > 0) {
            if (wrapper) wrapper.classList.remove("hidden");
            if (formFields) formFields.classList.add("hidden");

            renderSavedAddresses(savedAddresses);

            if (toggleBtn) {
                toggleBtn.addEventListener("click", () => {
                    isAddingNewAddress = !isAddingNewAddress;
                    if (isAddingNewAddress) {
                        if (formFields) formFields.classList.remove("hidden");
                        toggleBtn.textContent = "Use Saved Address";
                        clearAddressForm();
                    } else {
                        if (formFields) formFields.classList.add("hidden");
                        toggleBtn.textContent = "+ Add New Address";
                        selectAddress(0);
                    }
                });
            }
        } else {
            if (wrapper) wrapper.classList.add("hidden");
            if (formFields) formFields.classList.remove("hidden");
        }
    } catch (error) {
        console.info("Profile or addresses loading skipped.");
    }
};

const renderSavedAddresses = (addresses) => {
    const listContainer = document.getElementById("saved-addresses-list");
    if (!listContainer) return;

    listContainer.innerHTML = addresses.map((address, index) => {
        const isSelected = index === 0;
        const title = address.title || 'Address';
        const name = address.recipientName || 'Recipient';
        const street = address.streetAddress || address.address || '';
        const details = address.addressDetails ? `(${address.addressDetails})` : '';
        const city = address.city || '';
        const state = address.state || '';
        const zip = address.zipCode || address.postalCode || '';
        const country = address.country || '';
        const phone = address.phoneNumber || address.phone || '';

        return `
            <label class="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition-all bg-gray-50/50">
                <input type="radio" name="selected_address" value="${index}" ${isSelected ? 'checked' : ''} class="mt-0.5 text-black focus:ring-black">
                <div class="text-xs space-y-0.5">
                    <p class="font-bold text-gray-900">${title} • ${name}</p>
                    <p class="text-gray-600">${street} ${details}, ${city}${state ? `, ${state}` : ''} ${zip} ${country ? `(${country})` : ''}</p>
                    <p class="text-gray-500">${phone}</p>
                </div>
            </label>
        `;
    }).join("");

    selectAddress(0);

    const radios = listContainer.querySelectorAll('input[name="selected_address"]');
    radios.forEach(radio => {
        radio.addEventListener("change", (event) => {
            const selectedIndex = parseInt(event.target.value, 10);
            selectAddress(selectedIndex);
        });
    });
};

const selectAddress = (index) => {
    if (!savedAddresses[index]) return;
    const address = savedAddresses[index];
    
    const parts = (address.recipientName || "").split(" ");
    const firstName = address.firstName || parts[0] || "";
    const lastName = address.lastName || parts.slice(1).join(" ") || "";

    setShippingFormData({
        ...address,
        title: address.title || "Home",
        firstName,
        lastName
    });
};

const clearAddressForm = () => {
    setShippingFormData({});
};

const handleCheckoutSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
        displayNotification(true, "Payment system is not ready yet.");
        return;
    }

    const {
        title,
        firstName,
        lastName,
        streetAddress,
        addressDetails,
        city,
        state,
        zipCode,
        country,
        phone
    } = getShippingFormData();

    if (phoneInput && !phoneInput.isValidNumber()) {
        displayNotification(true, "Please enter a valid phone number.");
        return;
    }

    if (!title || !firstName || !lastName || !streetAddress || !city || !state || !zipCode || !country || !phone) {
        displayNotification(true, "Please fill in all required shipping fields.");
        return;
    }

    const payBtn = document.getElementById("submit-pay-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    if (payBtn) payBtn.disabled = true;
    if (btnText) btnText.classList.add("hidden");
    if (btnSpinner) btnSpinner.classList.remove("hidden");

    if (isAddingNewAddress || savedAddresses.length === 0) {
        try {
            await axios.post("/api/addresses", {
                title,
                recipientName: `${firstName} ${lastName}`,
                phoneNumber: phone,
                streetAddress,
                addressDetails,
                city,
                state,
                zipCode,
                country,
                isDefault: savedAddresses.length === 0
            });
        } catch (error) {
            console.warn("Could not save new address:", error);
        }
    }

    // 2. Confirm payment with Stripe
    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/confirmation`,
                shipping: {
                    name: `${firstName} ${lastName}`,
                    phone: phone,
                    address: {
                        line1: streetAddress,
                        line2: addressDetails || undefined,
                        city: city,
                        state: state,
                        postal_code: zipCode,
                        country: country
                    }
                }
            },
            redirect: "if_required"
        });

        if (error) {
            displayNotification(true, error.message || "Payment processing failed.");
            resetButtonState();
        } else if (paymentIntent && paymentIntent.status === "succeeded") {

            const cart = getCartFromStorage();

            try {
                await axios.post("/api/orders", {
                    products: cart.map(item => {
                        const quantity = Number(item.quantity) || 1;
                        const price = parsePrice(item.price);

                        return {
                            product: item.productId || item.id || item._id,
                            name: item.name || "Product",
                            size: item.size || "",
                            colorName: item.colorName || "",
                            image: item.image || "",
                            quantity: quantity,
                            unitPrice: price,
                            subtotal: price * quantity
                        };
                    }),
                    totalPrice: currentTotalAmount,
                    shippingAddress: {
                        recipientName: `${firstName} ${lastName}`,
                        phoneNumber: phone,
                        streetAddress: streetAddress,
                        addressDetails: addressDetails,
                        city: city,
                        state: state,
                        zipCode: zipCode,
                        country: country
                    },
                    paymentIntentId: paymentIntent.id
                });
            } catch (orderError) {
                console.error("Could not save order snapshot:", orderError);
            }

            // Save payment method
            try {
                await axios.post("/api/payments/save-method", {
                    paymentMethodId: paymentIntent.payment_method,
                });
            } catch (error) {
                console.warn("Could not save payment method:", error);
            }

            // Clear cart and redirect
            localStorage.removeItem("cart");
            updateNavbarCart();

            displayNotification(false, "Payment successful! Redirecting...");
            
            setTimeout(() => {
                window.location.href = `/confirmation?payment_intent=${paymentIntent.id}`;
            }, 1200);
        }
    } catch (error) {
        displayNotification(true, "An unexpected error occurred during checkout.");
        resetButtonState();
    }
};

const resetButtonState = () => {
    const payBtn = document.getElementById("submit-pay-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    if (payBtn) payBtn.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnSpinner) btnSpinner.classList.add("hidden");
};