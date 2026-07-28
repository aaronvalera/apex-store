const statusInfo = document.getElementById("status-info");

(async () => {
  try {
    // Verification logic
    const token = window.location.pathname.split("/")[3];
    const id = window.location.pathname.split("/")[2];
    await axios.patch(`/api/users/${id}/${token}`);
    setTimeout(() => {
      window.location.pathname = "/login";
    }, 2000);
  } catch (error) {
    statusInfo.innerHTML = error.response.data.error;
  }
})();