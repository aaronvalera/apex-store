import { formatUSD, formatDate } from "/helpers/formatters.js";

const getPaymentTypeName = (rawType) => {
    if (!rawType) return "Payment Method";
    const type = String(rawType).toLowerCase().trim().replace(/[\s_]+/g, "_");

    switch (type) {
        case "pago_movil":
        case "pagomovil":
            return "Pago Móvil";
        case "card":
        case "credit_card":
            return "Credit / Debit Card";
        case "zelle":
            return "Zelle";
        case "paypal":
            return "PayPal";
        default:
            return rawType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
};

const getPaymentBadgeText = (type) => {
    const normalizedType = String(type || "").toLowerCase();
    if (normalizedType === "card") return "CARD";
    if (normalizedType.includes("pago")) return "PAGO";
    if (normalizedType === "zelle") return "ZEL";
    if (normalizedType === "paypal") return "PAYP";
    return normalizedType ? normalizedType.substring(0, 4).toUpperCase() : "PAY";
};

// COMPONENTS
export const createOrderCard = (order) => {
    const totalItems = (order.products || []).reduce(
        (accumulator, item) => accumulator + (item.quantity || 1),
        0
    );

    const productsHtml = (order.products || []).map(product => `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 shadow-2xs gap-2">
            <div class="flex items-center gap-3 min-w-0">
                ${product.image ? `<img src="${product.image}" class="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />` : ''}
                <div class="min-w-0 flex-1">
                    <span class="font-bold text-gray-900 block truncate text-xs sm:text-sm">${product.name}</span>
                    <div class="text-[10px] sm:text-[11px] text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>Quantity: <strong>${product.quantity}</strong></span>
                        ${product.size ? `<span class="badge badge-ghost badge-xs font-semibold">Size: ${product.size}</span>` : ''}
                        ${product.color ? `<span class="badge badge-ghost badge-xs font-semibold">Color: ${product.color}</span>` : ''}
                        ${product.variant ? `<span class="badge badge-ghost badge-xs font-semibold">Variant: ${product.variant}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-gray-100">
                <span class="text-[10px] text-gray-400 sm:hidden">Price:</span>
                <span class="font-black text-gray-900 text-xs sm:text-sm">${formatUSD(product.unitPrice || product.price)}</span>
            </div>
        </div>
    `).join("");

    return `
    <details class="group border border-gray-100 rounded-2xl bg-white transition-all duration-200 overflow-hidden shadow-xs">
        <summary class="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer hover:bg-gray-50/80 list-none select-none gap-3">
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span class="text-xs font-mono font-bold text-gray-900 truncate">${order.orderNumber}</span>
                        <span class="badge ${order.status === 'delivered' ? 'badge-success' : 'badge-neutral'} badge-xs text-[9px] font-bold uppercase tracking-wider shrink-0">
                            ${order.status}
                        </span>
                    </div>
                    <span class="text-[10px] sm:text-[11px] font-medium text-gray-400 block mt-0.5">${formatDate(order.createdAt)}</span>
                </div>
            </div>
            <div class="text-right shrink-0">
                <span class="text-xs sm:text-sm font-black text-gray-900 block">${formatUSD(order.totalPrice)}</span>
                <span class="text-[9px] sm:text-[10px] text-gray-400 font-semibold block">${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
            </div>
        </summary>
        <div class="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50 space-y-4 text-xs">
            <div>
                <h4 class="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[10px]">Purchased Products</h4>
                <div class="space-y-2">${productsHtml}</div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200/60 text-[11px]">
                <div>
                    <span class="text-gray-400 uppercase font-bold tracking-wider text-[9px] block mb-0.5">Shipping Details</span>
                    <p class="font-bold text-gray-800">${order.shippingAddress?.recipientName || 'N/A'}</p>
                    <p class="text-gray-500 wrap-break-word">${order.shippingAddress?.streetAddress || ''} ${order.shippingAddress?.city ? `, ${order.shippingAddress?.city}` : ''}</p>
                    <p class="text-gray-500">${order.shippingAddress?.phoneNumber || ''}</p>
                </div>
                <div>
                    <span class="text-gray-400 uppercase font-bold tracking-wider text-[9px] block mb-0.5">Payment Details</span>
                    <p class="font-bold text-gray-800 uppercase">${order.paymentDetails?.provider || 'Card'}</p>
                    <p class="text-gray-500 break-all">${order.paymentDetails?.reference || 'Direct Order Checkout'}</p>
                </div>
            </div>
        </div>
    </details>
    `;
};

export const createAddressCard = (address) => `
    <div class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex items-start justify-between gap-2 text-xs">
        <div class="space-y-0.5 min-w-0">
            <div class="flex items-center gap-2">
                <strong class="font-bold text-gray-900 truncate">${address.title}</strong>
                ${address.isDefault ? '<span class="badge badge-neutral badge-xs text-[9px] shrink-0">DEFAULT</span>' : ''}
            </div>
            <p class="text-gray-600 font-medium truncate">${address.recipientName} (${address.phoneNumber})</p>
            <p class="text-gray-500 text-[11px] wrap-break-word">${address.streetAddress} ${address.addressDetails ? ', ' + address.addressDetails : ''}</p>
            <p class="text-gray-500 text-[11px] truncate">${address.city}, ${address.state} ${address.zipCode}, ${address.country}</p>
        </div>
        <button data-id="${address.id || address._id}" class="delete-address-btn text-red-400 hover:text-red-600 p-1 transition-colors shrink-0" title="Delete address">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
    </div>
`;

export const createPaymentCard = (paymentMethod) => {
    const isCard = paymentMethod.type === 'card';
    const displayTitle = getPaymentTypeName(paymentMethod.provider || paymentMethod.type);
    const badgeText = getPaymentBadgeText(paymentMethod.type || paymentMethod.provider);

    let displayReference = 'Saved Account';

    if (isCard) {
        displayReference = `•••• ${paymentMethod.cardDetails?.cardLastFour || '****'}`;
    } else if (paymentMethod.type === 'zelle') {
        displayReference = paymentMethod.zelleDetails?.holderEmail || 'Zelle Account';
    } else if (paymentMethod.type === 'pago_movil') {
        const bank = paymentMethod.pagoMovilDetails?.bankName || 'Pago Móvil';
        const phone = paymentMethod.pagoMovilDetails?.phoneNumber || '';
        displayReference = phone ? `${bank} • ${phone}` : bank;
    } else if (paymentMethod.type === 'paypal') {
        displayReference = paymentMethod.paypalDetails?.email || paymentMethod.zelleDetails?.holderEmail || 'PayPal Account';
    }

    return `
    <div class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex items-center justify-between text-xs gap-2">
        <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-mono text-[9px] uppercase font-bold shrink-0">
                ${badgeText}
            </div>
            <div class="min-w-0">
                <strong class="font-bold text-gray-900 block truncate">${displayTitle}</strong>
                <p class="text-gray-500 text-[11px] font-mono truncate">${displayReference}</p>
            </div>
        </div>
        <button data-id="${paymentMethod.id || paymentMethod._id}" class="delete-payment-btn text-red-400 hover:text-red-600 p-1 transition-colors shrink-0" title="Delete payment method">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
    </div>
    `;
};