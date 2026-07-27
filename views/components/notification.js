const div = document.getElementById("notification");

export const displayNotification = (isError, message) => {
    const errorIcon = `
        <svg class="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
        </svg>
    `;
    const successIcon = `
        <svg class="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
    `;
    const config = isError ? {
        icon: errorIcon,
        title: "Error",
        border: "border-red-200 bg-red-50/90 text-red-900",
        titleColor: "text-red-700"
    } : {
        icon: successIcon,
        title: "Success",
        border: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
        titleColor: "text-emerald-700"
    };
    div.innerHTML = `
        <div class="flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 max-w-sm w-80 bg-white/95 ${config.border}">
            <div class="mt-0.5">
                ${config.icon}
            </div>
            <div class="flex-1 text-left">
                <h2 class="text-sm font-semibold ${config.titleColor}">${config.title}</h2>
                <p class="mt-0.5 text-xs text-gray-600 font-normal leading-relaxed">${message}</p>
            </div>
        </div>
    `;

    setTimeout(() => {
        div.classList.remove("opacity-0", "translate-x-5", "pointer-events-none");
        div.classList.add("opacity-100", "translate-x-0");
    }, 10);
};