window.handleCredentialResponse = async function (response) {
    try {
        const rememberMeCheckbox = document.getElementById("remember-me");

        const res = await axios.post("/api/auth/google", {
            credential: response.credential,
            remember: rememberMeCheckbox?.checked || false
        });

        if (res.status === 200) {
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Error with Google authentication:", error);
    }
};