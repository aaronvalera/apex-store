const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { MONGO_URI } = require("./config.js");
const profileRouter = require("./controllers/profile.js");
const googleAuthRouter = require("./controllers/googleAuth.js");
const usersRouter = require("./controllers/users.js");
const signInRouter = require("./controllers/signin.js");
const logoutRouter = require("./controllers/logout.js");
const productsRouter = require("./controllers/products.js");
const categoriesRouter = require("./controllers/categories.js");
const productsAdminRouter = require("./controllers/productsAdmin.js");
const categoriesAdminRouter = require("./controllers/categoriesAdmin.js");
const { userExtractor, adminExtractor } = require("./middleware/auth.js");
const { userPageGuard, adminPageGuard } = require("./middleware/pageGuards.js")
const app = express();

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.")
    } catch (error) {
        console.log(error);
    }
})();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// FRONTEND ROUTES
app.use("/public", express.static(path.resolve("dist")));
app.use("/images", express.static(path.resolve("media")));
app.use("/components", express.static(path.resolve("views", "components")));
app.use("/helpers", express.static(path.resolve("views", "helpers")));  
app.use("/", express.static(path.resolve("views", "home")));
app.use("/signup", express.static(path.resolve("views", "signup")));
app.use("/verify/:id/:token", express.static(path.resolve("views", "verify")));
app.use("/signin", express.static(path.resolve("views", "signin")));
app.use("/catalog", express.static(path.resolve("views", "catalog")));
app.use("/product", express.static(path.resolve("views", "product")));
app.get("/admin/dashboard", userPageGuard, adminPageGuard, (req, res) => {
    res.sendFile(path.resolve("views", "adminDashboard", "index.html"));
});
app.use("/admin/dashboard", express.static(path.resolve("views", "adminDashboard"), { index: false }));

app.use(morgan("tiny"));
// BACKEND ROUTES
app.use("/api/profile", profileRouter);
app.use("/api/auth", googleAuthRouter);
app.use("/api/users", usersRouter);
app.use("/api/signin", signInRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/admin/products", userExtractor, adminExtractor, productsAdminRouter);
app.use("/api/admin/categories", userExtractor, adminExtractor, categoriesAdminRouter);

module.exports = app;