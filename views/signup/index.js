    import { displayNotification } from "/components/notification.js";

    // REGEX
    const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]{4,19}$/;
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()-+]).{8,19}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // SELECTORS
    const form = document.getElementById("form");
    const usernameInput = document.getElementById("username-input");
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("password-input");
    const passwordMatchInput = document.getElementById("match-password");
    const termsCheckbox = document.getElementById("terms");
    const submitFormBtn = document.getElementById("form-btn");

    // VARIABLES
    let usernameValidation = false;
    let genderValidation = false;
    let passwordValidation = false;
    let emailValidation = false;
    let passwordMatchValidation = false;
    let termsValidation = null;

    // DYNAMIC STYLE CLASSES
    const dynamicClasses = [
        "border-gray-300", "border-red-500", "border-emerald-500",
        "bg-white", "bg-red-50/50", "bg-emerald-50/30",
        "focus:ring-black", "focus:ring-red-500", "focus:ring-emerald-500"
    ];

    // HELPER
    const getIsFormValid = () => {
    return usernameValidation &&
           genderValidation &&
           emailValidation &&
           passwordValidation &&
           passwordMatchValidation &&
           termsValidation;
};

    // VALIDATION
    const checkFormStatus = () => {
        if(getIsFormValid()) {
            submitFormBtn.classList.remove("opacity-50", "cursor-not-allowed");
        } else {
           submitFormBtn.classList.add("opacity-50", "cursor-not-allowed"); 
        }
    };

    // CLEAR ALL STATE CLASSES
    const removeStateClasses = (inputSelector) => {
        inputSelector.classList.remove(...dynamicClasses);
    }

    // NEUTRAL STATE
    const clearInput = (inputSelector) => {
        removeStateClasses(inputSelector);
        inputSelector.classList.add("border-gray-300", "bg-white", "focus:ring-black");
    };

    // ERROR STATE
    const unvalidInput = (inputSelector) => {
        removeStateClasses(inputSelector);
        inputSelector.classList.add("border-red-500", "bg-red-50/50", "focus:ring-red-500");
    };

    // VALID STATE
    const validInput = (inputSelector) => {
        removeStateClasses(inputSelector);
        inputSelector.classList.add("border-emerald-500", "bg-emerald-50/30", "focus:ring-emerald-500");
    };

    // ASSIGN STATES TO INPUTS
    const inputsValidation = (validator, inputSelector) => {
        if(inputSelector.value === "") {
            clearInput(inputSelector);
            checkFormStatus();
            return;
        }
        if(validator) {
            validInput(inputSelector);
        } else {
            unvalidInput(inputSelector);
        }
        checkFormStatus();
    };

    // VALIDATE PASSWORDS
    const validatePasswords = () => {
        passwordMatchValidation = passwordMatchInput.value !== "" && passwordInput.value === passwordMatchInput.value;
        inputsValidation(passwordMatchValidation, passwordMatchInput);
    };

    // LISTENERS
    usernameInput.addEventListener("input", event => {
        usernameValidation = USERNAME_REGEX.test(event.target.value);
        inputsValidation(usernameValidation, usernameInput);
    });

    genderInputs.forEach(radio => {
        radio.addEventListener("change", () => {
            genderValidation = Array.from(genderInputs).some(r => r.checked);
            checkFormStatus();
        });
    });

    emailInput.addEventListener("input", event => {
        emailValidation = EMAIL_REGEX.test(event.target.value);
        inputsValidation(emailValidation, emailInput);
    });

    passwordInput.addEventListener("input", event => {
        passwordValidation = PASSWORD_REGEX.test(event.target.value);
        inputsValidation(passwordValidation, passwordInput);
        validatePasswords();
    });

    passwordMatchInput.addEventListener("input", event => {
        validatePasswords();
    });

    termsCheckbox.addEventListener("change", event => {
        termsValidation = event.target.checked;
        inputsValidation(termsValidation, termsCheckbox);
    })

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!getIsFormValid()) {
            displayNotification(true, "All fields are required.", 4000);
            return;
        }

        submitFormBtn.disabled = true;
        const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;
    
        try {
            const newUser = {
                username: usernameInput.value.trim(),
                gender: selectedGender,
                email: emailInput.value.trim().toLowerCase(),
                password: passwordInput.value,
            }
            const { data } = await axios.post("/api/users", newUser);
        
            displayNotification(false, data.message || "Account created successfully! Please check your email.", 3000);

            event.target.reset();
            usernameValidation = genderValidation = emailValidation = passwordValidation = passwordMatchValidation = termsValidation = false;
            [usernameInput, emailInput, passwordInput, passwordMatchInput].forEach(clearInput);

            setTimeout(() => {
                window.location.pathname = "/signin";
            }, 3000);
        } catch (error) {
            submitFormBtn.disabled = false;
            const errorMessage = error.response?.data?.error || "Internal server error. Please try again later.";
            displayNotification(true, errorMessage, 4000);
        }
    });