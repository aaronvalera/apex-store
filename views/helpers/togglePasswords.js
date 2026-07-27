const togglePasswordsBtns = document.querySelectorAll(".toggle-password");

const togglePasswords = () => {
    togglePasswordsBtns.forEach(button => {
        button.addEventListener("click", () => {
            const targetInput = document.getElementById(button.dataset.target);
            const wrapper = button.closest(".password-wrapper");
            const isPassword = targetInput.type === "password";
            targetInput.type = isPassword ? "text" : "password";
            wrapper.classList.toggle("is-visible", isPassword);
            button.title = isPassword ? "Hide password" : "Show password";            
        });
    });
};

togglePasswords();