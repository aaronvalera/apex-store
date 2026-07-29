(async () => {
  const loadingState = document.getElementById("loading-state");
  const successState = document.getElementById("success-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  // HELPER TO HANDLE STATES
  const showState = (activeState) => {
    [loadingState, successState, errorState].forEach((element) => {
      if (element) element.classList.toggle("hidden", element !== activeState);
    });
  }

  try {
    // VERIFICATION LOGIC
    const id = window.location.pathname.split("/")[2];
    const token = window.location.pathname.split("/")[3];
    if (!id || !token) {
      throw new Error("Invalid or incomplete verification link.");
    }

    const response = await axios.patch(`/api/users/${id}/${token}`);

    if (successMessage) {
      successMessage.innerText = response.data.message || "Account verified successfully. You can now Sign In.";
    }
    showState(successState);
  } catch (error) {
    const msg = error.response?.data?.error || error.message || "An unexpected error occurred during verification.";
    if (errorMessage) {
      errorMessage.innerText = msg;
    }
    showState(errorState);
  }
})();