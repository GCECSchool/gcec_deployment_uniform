const express = require("express");
const {
  createItem,
  getAllItems,
  getItemById,
  addItemToCart,
  getCartItems,
  updateItem,
  removeItemFromCart,
  getCartItemsCount,
  deleteItem,
} = require("../controllers/itemControllers");
const { parser } = require("../config/cloudinary");
const multer = require("../middlewares/multer");
const router = express.Router();

// Create a new item
router.post("/create", multer.single("image"), createItem);

// Get all items
router.get("/items", getAllItems);

// Get a specific item by ID
router.get("/items/:id", getItemById);

// Add item to cart
router.post("/items/:id/add-to-cart", addItemToCart);

// Remove item in cart
router.delete("/cart/:itemId", removeItemFromCart);

// Get all items in cart
router.get("/cart", getCartItems);

router.get("/cart/count", getCartItemsCount);

router.put("/update/:id", multer.single("image"), updateItem);

// Delete Item
router.delete("/delete/:id", deleteItem);

module.exports = router;
