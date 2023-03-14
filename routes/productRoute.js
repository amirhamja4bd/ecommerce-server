const express = require('express');
const { create, list, read, photo, update, remove, filteredProducts, listProducts, productsSearch , relatedProducts, productsCount, duplicate, filterProducts } = require('../controllers/productController');
const { isAdmin, isSignIn } = require('../middlewares/authMiddleware');
const formidable =require("express-formidable");

const router = express.Router();

router.post("/product", isSignIn, isAdmin, formidable(), create);
router.get("/products", list);
router.post("/product/:productId", duplicate);
router.get("/product/:slug", read);
router.get("/product/photo/:productId", photo);
router.put("/product/:productId", isSignIn, isAdmin, formidable(), update);
router.delete("/product/:productId", isSignIn, isAdmin, remove);

router.post("/filtered-products", filteredProducts);
router.post("/filter-products", filterProducts);
router.get("/products-count", productsCount);
router.get("/list-products/:page", listProducts);
router.get("/products/search/:keyword", productsSearch);
router.get("/related-products/:productId/:categoryId", relatedProducts);





module.exports = router;