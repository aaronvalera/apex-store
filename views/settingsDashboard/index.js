import { adaptNavbar } from "/helpers/adaptNavbar.js";
import { updateNavbarCart } from "/helpers/updateNavbarCart.js";
import { displayNotification } from "/components/notification.js";
import { createOrderCard, createAddressCard, createPaymentCard } from "/components/profileCards.js";

// DOM Selectors
const userAvatarElement = document.getElementById("user-avatar");
const userEmailElement = document.getElementById("user-email-display");
const userRoleElement = document.getElementById("user-role-badge");

const ordersListContainer = document.getElementById("orders-list-container");
const addressesListContainer = document.getElementById("addresses-list-container");
const paymentsListContainer = document.getElementById("payments-list-container");

const openAddressModalBtn = document.getElementById("open-address-modal-btn");
const openPaymentModalBtn = document.getElementById("open-payment-modal-btn");

const addAddressForm = document.getElementById("add-address-form");
const addPaymentForm = document.getElementById("add-payment-form");

const addressPhoneInput = document.getElementById("address-phone-input");
const addressCountryInput = document.getElementById("address-country-input");

// Payment Form Switcher Containers
const paymentTypeSelect = document.getElementById("payment-type-select");
const cardFieldsContainer = document.getElementById("card-fields-container");
const zelleFieldsContainer = document.getElementById("zelle-fields-container");
const pagomovilFieldsContainer = document.getElementById("pagomovil-fields-container");
const paypalFieldsContainer = document.getElementById("paypal-fields-container");

const deleteConfirmModal = document.getElementById("delete_confirm_modal");
const deleteModalTitle = document.getElementById("delete-modal-title");
const deleteModalDescription = document.getElementById("delete-modal-description");
const confirmDeleteActionBtn = document.getElementById("confirm-delete-action-btn");

// State
let addressIti = null;
let pmIti = null;
let itemToDelete = null;

// Function to reset the payment method's modal form
const resetPaymentModalForm = () => {
    if (!addPaymentForm) return;
    addPaymentForm.reset();
    if (paymentTypeSelect) {
        paymentTypeSelect.value = "card";
        paymentTypeSelect.dispatchEvent(new Event("change"));
    }
};

// Toggle Dynamic Payment Form Fields
paymentTypeSelect?.addEventListener("change", (event) => {
    const value = event.target.value;

    cardFieldsContainer?.classList.toggle("hidden", value !== "card");
    zelleFieldsContainer?.classList.toggle("hidden", value !== "zelle");
    pagomovilFieldsContainer?.classList.toggle("hidden", value !== "pago_movil");
    paypalFieldsContainer?.classList.toggle("hidden", value !== "paypal");
});

// Auto-format Card Expiration (MM/YY)
document.getElementById("card-expiry-input")?.addEventListener("input", (event) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    event.target.value = value;
});

// Auto-format Card Number with spaces
document.getElementById("card-number-input")?.addEventListener("input", (event) => {
    let value = event.target.value.replace(/\D/g, "");
    value = value.match(/.{1,4}/g)?.join(" ") || value;
    event.target.value = value.substring(0, 19);
});

// Automatic format for Cedula or RIF (Pago Movil)
document.getElementById("pm-id-input")?.addEventListener("input", (event) => {
    let raw = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!raw) {
        event.target.value = "";
        return;
    }

    let prefix = "V";
    let digits = raw;

    if (["V", "J", "E", "G", "P"].includes(raw.charAt(0))) {
        prefix = raw.charAt(0);
        digits = raw.substring(1);
    }

    digits = digits.replace(/\D/g, "");

    if (digits.length > 0) {
        event.target.value = `${prefix}-${digits.substring(0, 9)}`;
    } else {
        event.target.value = `${prefix}-`;
    }
});

// Initialize intl-tel-input for direction and pago movil
const initPhoneInputs = () => {
    if (window.intlTelInput) {
        if (addressPhoneInput) {
            addressIti = window.intlTelInput(addressPhoneInput, {
                initialCountry: "auto",
                separateDialCode: true,
                geoIpLookup: (callback) => {
                    axios("https://ipapi.co/json/")
                        .then((res) => callback(res.data?.country_code || "ve"))
                        .catch(() => callback("ve"));
                },
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js",
            });

            addressPhoneInput.addEventListener("countrychange", () => {
                const countryData = addressIti.getSelectedCountryData();
                if (countryData && addressCountryInput) {
                    addressCountryInput.value = countryData.name.replace(/\s*\([^)]*\)/g, "");
                }
            });
        }

        // Pago Móvil phone number (Exclusive Venezuela)
        const paymentMethodPhoneInput = document.getElementById("pm-phone-input");
        if (paymentMethodPhoneInput) {
            pmIti = window.intlTelInput(paymentMethodPhoneInput, {
                initialCountry: "ve",
                onlyCountries: ["ve"],
                allowDropdown: false,
                separateDialCode: true,
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js",
            });
        }
    }
};

// Load User Profile
const loadUserProfile = async () => {
    try {
        const response = await axios.get("/api/profile");
        const currentUser = response.data;

        if (userEmailElement) {
            userEmailElement.textContent = currentUser.email;
            userEmailElement.className = "text-base sm:text-2xl font-black tracking-tight text-gray-900 break-all min-w-0";
        }
        if (userRoleElement) userRoleElement.textContent = `${currentUser.role.toUpperCase()} ACCOUNT`;
        if (userAvatarElement) userAvatarElement.textContent = currentUser.email.charAt(0).toUpperCase();
    } catch (error) {
        displayNotification(true, "Session expired or unauthorized. Redirecting...");
        setTimeout(() => { window.location.href = "/signin"; }, 1500);
    }
};

// Load Orders
const loadOrders = async () => {
    try {
        const response = await axios.get("/api/orders");
        const orders = response.data || [];

        if (orders.length === 0) {
            ordersListContainer.innerHTML = `
                <div class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs">
                    No orders placed yet.
                </div>
            `;
            return;
        }

        ordersListContainer.innerHTML = orders.map(createOrderCard).join("");
    } catch (error) {
        ordersListContainer.innerHTML = `<div class="text-center py-6 text-red-500 text-xs">Failed to load orders.</div>`;
    }
};

// Load Addresses
const loadAddresses = async () => {
    try {
        const response = await axios.get("/api/addresses");
        const addresses = response.data || [];

        if (addresses.length === 0) {
            addressesListContainer.innerHTML = `
                <div class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                    No shipping addresses saved.
                </div>
            `;
            return;
        }

        addressesListContainer.innerHTML = addresses.map(createAddressCard).join("");

        document.querySelectorAll(".delete-address-btn").forEach(button => {
            button.addEventListener("click", () => openDeleteModal('address', button.getAttribute("data-id")));
        });

    } catch (error) {
        addressesListContainer.innerHTML = `<div class="text-center py-4 text-red-500 text-xs">Failed to load addresses.</div>`;
    }
};

// Load Payment Methods
const loadPaymentMethods = async () => {
    try {
        const response = await axios.get("/api/payments/methods");
        const methods = response.data || [];

        if (methods.length === 0) {
            paymentsListContainer.innerHTML = `
                <div class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                    No payment methods saved.
                </div>
            `;
            return;
        }

        paymentsListContainer.innerHTML = methods.map(createPaymentCard).join("");

        document.querySelectorAll(".delete-payment-btn").forEach(button => {
            button.addEventListener("click", () => openDeleteModal('payment', button.getAttribute("data-id")));
        });

    } catch (error) {
        paymentsListContainer.innerHTML = `<div class="text-center py-4 text-gray-400 text-xs">No saved payment methods available.</div>`;
    }
};

// Open Delete Modal
const openDeleteModal = (type, id) => {
    itemToDelete = { type, id };
    
    if (type === 'address') {
        deleteModalTitle.textContent = "Delete Shipping Address";
        deleteModalDescription.textContent = "Are you sure you want to delete this shipping address?";
    } else {
        deleteModalTitle.textContent = "Delete Payment Method";
        deleteModalDescription.textContent = "Are you sure you want to delete this saved payment method?";
    }

    deleteConfirmModal?.showModal();
};

// Confirm Delete
confirmDeleteActionBtn?.addEventListener("click", async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    deleteConfirmModal?.close();

    try {
        if (type === 'address') {
            await axios.delete(`/api/addresses/${id}`);
            displayNotification(false, "Shipping address deleted successfully!");
            await loadAddresses();
        } else if (type === 'payment') {
            await axios.delete(`/api/payments/methods/${id}`);
            displayNotification(false, "Payment method deleted successfully!");
            await loadPaymentMethods();
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || `Failed to delete ${type}.`;
        displayNotification(true, errorMsg);
    } finally {
        itemToDelete = null;
    }
});

// Submit New Address
addAddressForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(addAddressForm);
    const data = Object.fromEntries(formData.entries());

    if (addressIti) {
        data.phoneNumber = addressIti.getNumber();
    }

    if (!data.title?.trim() || !data.recipientName?.trim() || !data.phoneNumber?.trim() || !data.streetAddress?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zipCode?.trim() || !data.country?.trim()) {
        displayNotification(true, "Please fill in all required shipping address fields.");
        return;
    }

    try {
        await axios.post("/api/addresses", data);
        
        const modal = document.getElementById("add_address_modal");
        modal?.close();
        addAddressForm.reset();

        setTimeout(() => {
            displayNotification(false, "Shipping address created successfully!");
        }, 150);

        await loadAddresses();
    } catch (error) {
        const msg = error.response?.data?.message || "Error saving shipping address.";
        displayNotification(true, msg);
    }
});

// Submit New Payment Method
addPaymentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const type = paymentTypeSelect.value;
    
    let payload = { type, provider: type };

    if (type === "card") {
        const cardHolderName = document.getElementById("card-name-input").value.trim();
        const cardNumber = document.getElementById("card-number-input").value.trim();
        const expiryVal = document.getElementById("card-expiry-input").value.trim();
        const cvv = document.getElementById("card-cvv-input").value.trim();

        if (!cardHolderName || !cardNumber || !expiryVal || !cvv) {
            displayNotification(true, "Please fill in all credit/debit card fields.");
            return;
        }

        const expiryParts = expiryVal.split("/");
        payload.cardDetails = {
            cardHolderName,
            cardNumber,
            expirationMonth: expiryParts[0] || "12",
            expirationYear: expiryParts[1] ? `20${expiryParts[1]}` : "2028",
            cvv
        };
    } else if (type === "zelle") {
        const holderEmail = document.getElementById("zelle-email-input").value.trim();
        if (!holderEmail) {
            displayNotification(true, "Please provide a valid Zelle email or phone number.");
            return;
        }
        payload.zelleDetails = {
            holderEmail,
            holderName: document.getElementById("zelle-holder-input").value.trim()
        };
    } else if (type === "pago_movil") {
        const bankName = document.getElementById("pm-bank-input").value;
        const pmPhoneVal = pmIti ? pmIti.getNumber() : document.getElementById("pm-phone-input").value.trim();
        const idDocument = document.getElementById("pm-id-input").value.trim();

        if (!bankName || !pmPhoneVal || !idDocument) {
            displayNotification(true, "Please fill in all Pago Móvil details.");
            return;
        }

        payload.pagoMovilDetails = {
            bankName,
            phoneNumber: pmPhoneVal,
            idDocument
        };
    } else if (type === "paypal") {
        const email = document.getElementById("paypal-email-input").value.trim();
        if (!email) {
            displayNotification(true, "Please provide a valid PayPal email address.");
            return;
        }
        payload.paypalDetails = { email };
    }

    try {
        await axios.post("/api/payments/save-method", payload);

        const modal = document.getElementById("add_payment_modal");
        modal?.close();
        
        resetPaymentModalForm();

        setTimeout(() => {
            displayNotification(false, "Payment method saved successfully!");
        }, 150);

        await loadPaymentMethods();
    } catch (error) {
        const msg = error.response?.data?.message || "Error saving payment method.";
        displayNotification(true, msg);
    }
});

// Open modal triggers
openAddressModalBtn?.addEventListener("click", () => {
    addAddressForm?.reset();
    document.getElementById("add_address_modal")?.showModal();
});

openPaymentModalBtn?.addEventListener("click", () => {
    resetPaymentModalForm();
    document.getElementById("add_payment_modal")?.showModal();
});

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
    updateNavbarCart();
    await adaptNavbar();

    initPhoneInputs();
    await loadUserProfile();
    await Promise.all([
        loadOrders(),
        loadAddresses(),
        loadPaymentMethods()
    ]);
});