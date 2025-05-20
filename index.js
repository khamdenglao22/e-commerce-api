const express = require("express");
const body = require("body-parser");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();
require("dotenv").config(); // Load environment variables
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(body.urlencoded({ extended: true }));

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// ບອກ path ໃຫ້ສາມາດເຂົ້້າເບິ່ງຮູບໄດ້
app.use("/static", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "E-Commerce-API" });
});

const {
  getCurrentUser,
} = require("./controllers/controllers-bof/auth-bof-controller");

// ສໍາລັບສ່ວນຂອງ API BackOffice ສໍາລັບສ່ວນຂອງ Admin
const brandRoute = require("./routers/routers-bof/brand-bof-router");
const categoryRoute = require("./routers/routers-bof/category-bof-router");
const productMasterRoute = require("./routers/routers-bof/product-master-bof-router");
const roleRoute = require("./routers/routers-bof/role-bof-router");
const userRoute = require("./routers/routers-bof/user-bof-router");
const userAuth = require("./routers/routers-bof/auth-bof-router");
const productGalleryRoute = require("./routers/routers-bof/product-gallery-bof-router");
const sellerBofRoute = require("./routers/routers-bof/seller-bof-router");

app.use("/api/v1/brands", getCurrentUser, brandRoute);
app.use("/api/v1/category", getCurrentUser, categoryRoute);
app.use("/api/v1/products", getCurrentUser, productMasterRoute);
app.use("/api/v1/roles", getCurrentUser, roleRoute);
app.use("/api/v1/product-gallery", getCurrentUser, productGalleryRoute);
app.use("/api/v1/seller", getCurrentUser, sellerBofRoute);
app.use("/api/v1/users", getCurrentUser, userRoute);
app.use("/api/v1/login", userAuth);

// ສ່ວນສຳລັບ API Customer ສໍາລັບສ່ວນຂອງ ລູກຄ້າ
const {
  getCurrentCustomer,
} = require("./controllers/controllers-cus/auth-cus-controller");

const customerRoute = require("./routers/routers-cus/customer-cus-router");
const authRoute = require("./routers/routers-cus/auth-cus-router");
const cartRoute = require("./routers/routers-cus/cart-cus-router");
const productCustomerRoute = require("./routers/routers-cus/product-cus-router");

app.use("/api/v1/customer/customers", customerRoute);
app.use("/api/v1/customer/login-customer", authRoute);
app.use("/api/v1/customer/cart", getCurrentCustomer, cartRoute);
app.use("/api/v1/customer/products", productCustomerRoute);

// ສ່ວນສຳລັບ API Seller

const sellerRoute = require("./routers/routers-seller/seller-router");
const productRoute = require("./routers/routers-seller/product-router");
const {
  getCurrentSeller,
} = require("./controllers/controllers-seller/auth-seller-controller");

app.use("/api/v1/customer/seller", getCurrentCustomer, sellerRoute);
app.use("/api/v1/customer/seller-products", getCurrentSeller, productRoute);

app.listen(port, () => console.log(`listening on http://localhost:${port}`));
