const form = document.getElementById("form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const errorText = document.getElementById("error-text");
const rememberMeCheckbox = document.getElementById("remember-me");
const submitFormBtn = document.getElementById("form-btn");

// REMEMBER USER
document.addEventListener("DOMContentLoaded", () => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if(savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorText.textContent = "";

    const cleanEmail = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if(!cleanEmail || !password) {
        errorText.textContent = "All fields are required.";
        return;
    }

    try {
        submitFormBtn.disabled = true;
        const user = {
            email: cleanEmail,
            password: password,
            remember: rememberMeCheckbox.checked
        }
        const response = await axios.post("/api/login", user);

        if(rememberMeCheckbox.checked) {
            localStorage.setItem("rememberedEmail", cleanEmail);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        window.location.pathname = "/";    
    } catch (error) {
        submitFormBtn.disabled = false;
        console.error("Login error", error);
        errorText.textContent = error.response?.data?.error || "Network error. Please try again later.";
    }
});