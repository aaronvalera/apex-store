import { createNavbar } from "/components/navbar.js";

export const adaptNavbar = async () => {
    try {
        const { data } = await axios.get("/api/profile");
        createNavbar(data);
    } catch (error) {
        createNavbar(null);
    }
};