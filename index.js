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
const customerBofRoute = require("./routers/routers-bof/customer-bof-router");
const countBofRoute = require("./routers/routers-bof/count-bof-router");
const depositBofRoute = require("./routers/routers-bof/deposit-bof-router");
const companyRoute = require("./routers/routers-bof/company-router");
const depositSellerBofRoute = require("./routers/routers-bof/deposit-seller-bof-router");

app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/products", productMasterRoute);
app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/product-gallery", getCurrentUser, productGalleryRoute);
app.use("/api/v1/seller", getCurrentUser, sellerBofRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/login", userAuth);
app.use("/api/v1/customer", customerBofRoute);
app.use("/api/v1/count-all", countBofRoute);
app.use("/api/v1/deposit_customer", getCurrentUser, depositBofRoute);
app.use("/api/v1/company", getCurrentUser, companyRoute);
app.use("/api/v1/deposit_seller", getCurrentUser, depositSellerBofRoute);

// ສ່ວນສຳລັບ API Customer ສໍາລັບສ່ວນຂອງ ລູກຄ້າ
const {
  getCurrentCustomer,
} = require("./controllers/controllers-cus/auth-cus-controller");

const customerRoute = require("./routers/routers-cus/customer-cus-router");
const authRoute = require("./routers/routers-cus/auth-cus-router");
const cartRoute = require("./routers/routers-cus/cart-cus-router");
const productCustomerRoute = require("./routers/routers-cus/product-cus-router");
const categoryCustomerRoute = require("./routers/routers-cus/category-cus-router");
const depositRoute = require("./routers/routers-cus/deposit-cus-router");

app.use("/api/v1/cus/register", customerRoute);
app.use("/api/v1/cus/login-customer", authRoute);
app.use("/api/v1/cus/cart", getCurrentCustomer, cartRoute);
app.use("/api/v1/cus/products", productCustomerRoute);
app.use("/api/v1/cus/category", categoryCustomerRoute);
app.use("/api/v1/cus/deposit", getCurrentCustomer, depositRoute);

// ສ່ວນສຳລັບ API Seller

const sellerRoute = require("./routers/routers-seller/seller-router");
const productRoute = require("./routers/routers-seller/product-router");
const {
  getCurrentSeller,
} = require("./controllers/controllers-seller/auth-seller-controller");
const depositSellerRoute = require("./routers/routers-seller/deposit-router");
const withdrawSellerRoute = require("./routers/routers-seller/withdraw-router");

app.use("/api/v1/sell/info", sellerRoute);
app.use("/api/v1/sell/products", getCurrentSeller, productRoute);
app.use("/api/v1/sell/deposit_seller", getCurrentSeller, depositSellerRoute);
app.use("/api/v1/sell/withdraw_seller", getCurrentSeller, withdrawSellerRoute);

app.listen(port, () => console.log(`listening on http://localhost:${port}`));
