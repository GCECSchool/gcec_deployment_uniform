const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  color: String,
  quantity: Number,
});

const sizeSchema = new mongoose.Schema({
  size: String,
  price: Number,
  colors: [colorSchema],
});

const categorySchema = new mongoose.Schema({
  category: String,
  quantity: Number,
  price: Number,
});

const cartSchema = new mongoose.Schema({
  name: { type: String },
  size: { type: String },
  color: { type: String },
  quantity: { type: Number },
  category: { type: String },
  totalPrice: { type: Number },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sizes: [sizeSchema],
  cart: [cartSchema],
  category: [categorySchema],
  image: {
    type: Object,
    url: {
      type: URL,
    },

    public_id: {
      type: String,
    },
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
