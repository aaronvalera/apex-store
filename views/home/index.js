import { createNavbar } from "../components/navbar.js";

const loadApp = async () => {
    try {
        const { data } = await axios.get("/api/profile");
        createNavbar(data);
    } catch (error) {
        createNavbar(null);
    }
};
loadApp();