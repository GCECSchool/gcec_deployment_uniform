const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  cartItems: [
    {
      name: { type: String, required: true },
      size: { type: String },
      color: { type: String },
      category: { type: String },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number }, // Total price for this item (quantity * price)
    },
  ],
  date: { type: String }, // Use Date type for date
  time: { type: String },
  buyerName: { type: String },
  totalAmount: { type: Number }, // Total amount for the entire checkout
});

const Checkout = mongoose.model("Checkout", checkoutSchema);

module.exports = Checkout;
